import reviewModel from "../../../db/models/review.model.js";
import productModel from "../../../db/models/product.model.js";
import orderModel from "../../../db/models/order.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";



// ===================================  createReview ================================================
export const createReview = asyncHandler(async (req, res, next) => {
    const { comment, rate } = req.body

    const product = await productModel.findOne({
        _id: req.params.productId,
    })
    if (!product) {
        return next(new AppError("product not found ", 404))
    }
    // const reviewExist = await reviewModel.findOne({
    //     user: req.user._id,
    //     productId
    // })
    // if (reviewExist) {
    //     return next(new AppError("you already reviewed this product", 400))
    // }
    const order = await orderModel.findOne({
        status: "delivered",
        user: req.user._id,
        "products.productId": req.params.productId
    })
    if (!order) {
        return next(new AppError("order not found ", 404))
    }

    const review = await reviewModel.create({
        user: req.user._id,
        comment,
        rate,
        productId: req.params.productId
    })


    // const reviews = await reviewModel.find({ productId: req.params.productId })
    // let sum = 0
    // for (const review of reviews) {
    //     sum += review.rate
    //     console.log("review.rate", review.rate);
    // }

    let sum = product.rateAvg * product.rateNum
    sum = sum + rate
    product.rateAvg = sum / (product.rateNum + 1)
    product.rateNum += 1
    await product.save()

    res.status(201).json({ msg: "done", review })


})



// ===================================  deleteReview ================================================
export const deleteReview = asyncHandler(async (req, res, next) => {

    const { id } = req.params


    const review = await reviewModel.findOneAndDelete({
        user: req.user._id,
        _id: id,
    })
    if (!review) {
        return next(new AppError(" review not exist", 400))
    }



    const product = await productModel.findOne({
        _id: review.productId
    })

    let sum = product.rateAvg * product.rateNum
    sum = sum - review.rate
    product.rateAvg = sum / (product.rateNum - 1)
    product.rateNum -= 1
    await product.save()

    res.status(201).json({ msg: "done", review })


})
