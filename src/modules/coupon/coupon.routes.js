import express from "express";
import * as COC from "./coupon.controller.js";
import { multerHost, validExtensions } from '../../middleware/multer.js';
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as COV from "./coupon.validation.js";

const couponRouter = express.Router();


couponRouter.post("/",
    validation(COV.createCoupon),
    auth("admin"),
    COC.createCoupon);


couponRouter.put("/:id",
    validation(COV.updateCoupon),
    auth("admin"),
    COC.updateCoupon);





export default couponRouter;
