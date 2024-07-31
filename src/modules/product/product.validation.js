import { generalFiled } from "../../utils/generalFields.js";
import joi from "joi";


export const createProduct = {
    body: joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
        category: generalFiled.id.required(),
        subCategory: generalFiled.id.required(),
        brand: generalFiled.id.required(),
        price: joi.number().integer().min(1).required(),
        stock: joi.number().integer().min(1).required(),
        discount: joi.number().integer().min(0).max(100).required()
    }),
    files: joi.object({
        image: joi.array().items(generalFiled.file.required()).required(),
        images: joi.array().items(generalFiled.file.required()).required(),
    }).required(),
    headers: generalFiled.headers.required()
}

