import express from "express";
import * as CAC from "./cart.controller.js";
import { multerHost, validExtensions } from '../../middleware/multer.js';
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as CAV from "./cart.validation.js";

const cartRouter = express.Router();


cartRouter.post("/",
    validation(CAV.createCart),
    auth("admin"),
    CAC.createCart);

cartRouter.patch("/",
    validation(CAV.removeCart),
    auth("admin"),
    CAC.removeCart);

cartRouter.put("/",
    validation(CAV.clearCart),
    auth("admin"),
    CAC.clearCart);








export default cartRouter;
