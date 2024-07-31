import cartModel from "../../../db/models/cart.model.js";
import orderModel from "../../../db/models/order.model.js";
import productModel from "../../../db/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import { payment } from "../../utils/payment.js";
import { createInvoice } from "../../utils/pdf.js";
import couponModel from './../../../db/models/coupon.model.js';
import { sendEmail } from './../../service/sendEmail.js';
import { Stripe } from 'stripe';



// ===================================  createOrder ================================================
export const createOrder = asyncHandler(async (req, res, next) => {
    const { productId, quantity, couponCode, address, phone, paymentMethod } = req.body


    if (couponCode) {
        const coupon = await couponModel.findOne({
            code: couponCode,
            // usedBy: { $nin: [req.user._id] },
        })
        if (!coupon || coupon.toDate < Date.now()) {
            return next(new AppError("coupon not found or expired", 404))
        }
        req.body.coupon = coupon
    }

    let finalProducts = []
    let flag = false

    if (!productId) {
        const cart = await cartModel.findOne({ user: req.user._id })
        if (!cart) {
            return next(new AppError("cart not found please select product to create order", 404))
        }
        finalProducts = cart.products
        flag = true
    } else {
        finalProducts = [{ productId, quantity }]
    }
    let subPrice = 0
    let products = []
    for (let product of finalProducts) {
        const productExist = await productModel.findOne({ _id: product.productId, stock: { $gte: product.quantity } })
        if (!productExist) {
            return next(new AppError("product not found or out of stock", 404))
        }
        if (flag) {
            product = product.toObject()
        }
        product.title = productExist.title
        product.price = productExist.subPrice
        product.finalPrice = productExist.subPrice * product.quantity
        subPrice += product.finalPrice
        products.push(product)
    }



    const order = await orderModel.create({
        user: req.user._id,
        products,
        subPrice,
        couponId: req.body?.coupon?._id,
        totalPrice: subPrice - subPrice * ((req.body?.coupon?.amount || 0) / 100),
        paymentMethod,
        status: paymentMethod == "cash" ? "placed" : "waitPayment",
        address,
        phone
    })

    if (req.body?.coupon) {
        await couponModel.updateOne({ _id: req.body.coupon._id }, {
            $push: { usedBy: req.user._id }
        })
    }

    for (const product of finalProducts) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: -product.quantity } })
    }

    if (flag) {
        await cartModel.updateOne({ user: req.user._id }, { products: [] })
    }

    // const invoice = {
    //     shipping: {
    //         name: req.user.name,
    //         address: req.user.address,
    //         city: "Egypt",
    //         state: "CA",
    //         country: "Cairo",
    //         postal_code: 94111
    //     },
    //     items: order.products,
    //     subtotal: order.subPrice,
    //     paid: order.totalPrice,
    //     invoice_nr: order._id,
    //     date: order.createdAt,
    //     coupon: req.body?.coupon
    // };

    // await createInvoice(invoice, "invoice.pdf");

    // await sendEmail(req.user.email, "pdf", "pdf", [
    //     {
    //         path: "invoice.pdf",
    //         contentType: "application/pdf"
    //     },
    //     {
    //         path:"logo.jpg",
    //          contentType: "image/jpg"
    //     }
    // ])

    if (paymentMethod == "card") {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        if (req.body?.coupon) {
            const coupon = await stripe.coupons.create({
                percent_off: req.body?.coupon?.amount,
                duration: "once",
            })
            req.body.couponId = coupon.id
        }
        const session = await payment({
            stripe,
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${req.protocol}://${req.headers.host}/orders/success/${order._id}`,
            cancel_url: `${req.protocol}://${req.headers.host}/orders/cancel/${order._id}`,
            customer_email: req.user.email,
            line_items: order.products.map((product) => {
                return {
                    price_data: {
                        currency: "egp",
                        product_data: {
                            name: product.title,
                        },
                        unit_amount: product.price * 100
                    },
                    quantity: product.quantity
                }
            }),
            metadata: {
                orderId: order._id.toString()
            },
            discounts: req.body?.coupon ? [{ coupon: req.body.couponId }] : []
        })

        return res.status(201).json({ msg: "done", session: session.url, order })
    }


    return res.status(201).json({ msg: "done", order })
})




// ===================================  webhook ================================================
export const webhook = asyncHandler(async (req, res, next) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    if (event.type !== 'checkout.session.completed') {
        await orderModel.updateOne({ _id: event.data.object.metadata.orderId }, {
            status: "rejected"
        })
        return res.status(400).json({ msg: "fail" })

    }
    await orderModel.updateOne({ _id: event.data.object.metadata.orderId }, {
        status: "placed"
    })
    return res.status(400).json({ msg: "done" })

})
// ===================================  cancelOrder ================================================
export const cancelOrder = asyncHandler(async (req, res, next) => {
    const { reason } = req.body

    const order = await orderModel.findOne({
        user: req.user._id,
        _id: req.params.orderId
    })
    if ((order.paymentMethod === "cash" && order.status != "placed") || (order.paymentMethod === "card" && order.status != "waitPayment")) {
        return next(new AppError("you can not cancel this order", 400))
    }
    await orderModel.updateOne({ _id: id }, {
        status: "cancelled",
        cancelledBy: req.user._id,
        reason
    })

    if (!order) {
        return next(new AppError("order not found", 404))
    }

    if (order?.couponId) {
        await couponModel.updateOne({ _id: order.couponId }, {
            $pull: { usedBy: req.user._id }
        })
    }

    for (const product of order.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: product.quantity } })
    }

    return res.status(201).json({ msg: "done" })
})

