import express from "express";
import * as CAC from "./review.controller.js";
import { multerHost, validExtensions } from '../../middleware/multer.js';
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as CAV from "./review.validation.js";

const reviewRouter = express.Router({ mergeParams: true });


reviewRouter.post("/",
    validation(CAV.createReview),
    auth("admin"),
    CAC.createReview);


reviewRouter.delete("/:id",
    validation(CAV.deleteReview),
    auth("admin"),
    CAC.deleteReview);








export default reviewRouter;
