import express from "express";
import * as SCC from "./subCategory.controller.js";
import { multerHost, validExtensions } from '../../middleware/multer.js';
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as SCV from "./subCategory.validation.js";

const subCategoryRouter = express.Router({ mergeParams: true });


subCategoryRouter.post("/",
    multerHost(validExtensions.image).single("image"),
    validation(SCV.createSubCategory),
    auth("admin"),
    SCC.createSubCategory);


subCategoryRouter.get("/", SCC.getSubCategories);






export default subCategoryRouter;
