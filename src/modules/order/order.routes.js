import express from "express";
import * as OC from "./order.controller.js";
import { multerHost, validExtensions } from '../../middleware/multer.js';
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as OV from "./order.validation.js";

const orderRouter = express.Router();


orderRouter.post("/",
    // validation(OV.createOrder),
    auth(["admin", "user"]),
    OC.createOrder);

orderRouter.put("/:orderId",
    // validation(OV.createOrder),
    auth(["admin", "user"]),
    OC.cancelOrder);









export default orderRouter;
