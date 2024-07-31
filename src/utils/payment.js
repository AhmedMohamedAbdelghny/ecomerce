import Stripe from "stripe";

export async function payment({
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY),
    payment_method_types = ["card"],
    mode = "payment",
    success_url,
    cancel_url,
    customer_email,
    line_items = [],
    metadata = {},
    discounts = []
} = {}) {

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = stripe.checkout.sessions.create({
        payment_method_types,
        mode,
        success_url,
        cancel_url,
        customer_email,
        line_items,
        metadata,
        discounts
    })

    return session
}

