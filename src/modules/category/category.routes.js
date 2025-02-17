import express from "express";
import * as CC from "./category.controller.js";
import { multerHost, validExtensions } from './../../middleware/multer.js';
import { validation } from './../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as CV from "./category.validation.js";
import subCategoryRouter from './../subCategory/subCategory.routes.js';


const categoryRouter = express.Router({});


categoryRouter.use("/:categoryId/subCategories", subCategoryRouter)

categoryRouter.post("/",
    multerHost(validExtensions.image).single("image"),
    validation(CV.createCategory),
    auth(["admin"]),
    CC.createCategory);


categoryRouter.put("/:id",
    multerHost(validExtensions.image).single("image"),
    validation(CV.updateCategory),
    auth(["admin"]),
    CC.updateCategory);

categoryRouter.get("/", CC.getCategories);
categoryRouter.delete("/:id", CC.deleteCategory);





export default categoryRouter;
