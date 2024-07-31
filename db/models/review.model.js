import mongoose, { Types } from "mongoose";


const reviewSchema = new mongoose.Schema({

    user: {
        type: Types.ObjectId,
        ref: "user",
        required: true
    },
    productId: { type: Types.ObjectId, ref: "product", required: true },
    comment: { type: String, required: true },
    rate: { type: Number, required: true, min: 1, max: 5 },



}, {
    timestamps: true,
    versionKey: false,
})


const reviewModel = mongoose.model("review", reviewSchema)

export default reviewModel;
