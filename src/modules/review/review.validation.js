import { generalFiled } from "../../utils/generalFields.js";
import joi from "joi";


export const createReview = {
    body: joi.object({

        rate: joi.number().integer().min(1).max(5).required(),
        comment: joi.string().required(),
    }),
    params: joi.object({
        productId: generalFiled.id.required()
    }).required(),
    headers: generalFiled.headers.required()
}
export const deleteReview = {

    params: joi.object({
        productId: generalFiled.id.required(),
        id: generalFiled.id.required()
    }).required(),
    headers: generalFiled.headers.required()
}

