import express from "express";
import * as BC from "./brand.controller.js";
import { multerHost, validExtensions } from '../../middleware/multer.js';
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as BV from "./brand.validation.js";

const brandRouter = express.Router();


brandRouter.post("/",
    multerHost(validExtensions.image).single("image"),
    validation(BV.createBrand),
    auth("admin"),
    BC.createBrand);





export default brandRouter;
