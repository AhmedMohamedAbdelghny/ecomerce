import express from "express";
import * as CAC from "./wishList.controller.js";
import { multerHost, validExtensions } from '../../middleware/multer.js';
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as CAV from "./wishList.validation.js";

const wishListRouter = express.Router({ mergeParams: true });


wishListRouter.post("/",
    // validation(CAV.createWishList),
    auth("admin"),
    CAC.createWishList);


// wishListRouter.put("/",
//     validation(CAV.clearWishList),
//     auth("admin"),
//     CAC.clearWishList);








export default wishListRouter;
