import { generalFiled } from "../../utils/generalFields.js";
import joi from "joi";


export const createOrder = {
    body: joi.object({
        productId: generalFiled.id.required(),
        quantity: joi.number().integer().required(),
    }),
    headers: generalFiled.headers.required()
}

export const clearOrder = {

    headers: generalFiled.headers.required()
}

