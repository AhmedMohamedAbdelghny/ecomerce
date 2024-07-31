import mongoose, { Types } from "mongoose";


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "title is required"],
        minLength: 3,
        maxLength: 30,
        trim: true,
        lowercase: true,
        unique: true
    },
    slug: {
        type: String,
        minLength: 3,
        maxLength: 30,
        trim: true,
        unique: true
    },
    description: String,
    createdBy: {
        type: Types.ObjectId,
        ref: "user",
        required: true
    },
    category: {
        type: Types.ObjectId,
        ref: "category",
        required: true
    },
    subCategory: {
        type: Types.ObjectId,
        ref: "subCategory",
        required: true
    },
    brand: {
        type: Types.ObjectId,
        ref: "brand",
        required: true
    },
    image: {
        secure_url: String,
        public_id: String
    },
    images: [{
        secure_url: String,
        public_id: String
    }],
    customId: String,
    price: {
        type: Number,
        required: [true, "price is required"],
        min: 1
    },
    discount: {
        type: Number,
        default: 0
    },
    subPrice: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    rateAvg: {
        type: Number,
        default: 0
    },
    rateNum: {
        type: Number,
        default: 0
    }


}, {
    timestamps: true,
    versionKey: false

})



const productModel = mongoose.model("product", productSchema)

export default productModel;
