import productModel from "../../../db/models/product.model.js";
import subCategoryModel from './../../../db/models/subCategory.model.js';
import categoryModel from './../../../db/models/category.model.js';
import brandModel from './../../../db/models/brand.model.js';
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import { nanoid, customAlphabet } from "nanoid";
import cloudinary from '../../utils/cloudinary.js';
import slugify from "slugify";
import { ApiFeatures } from "../../utils/ApiFeatures.js";





// ===================================  createProduct ================================================
export const createProduct = asyncHandler(async (req, res, next) => {
    const { title, description, category, subCategory, brand, price, stock, discount } = req.body
    // check category exist
    const categoryExist = await categoryModel.findOne({ _id: category })
    if (!categoryExist) {
        return next(new AppError("category not exist", 404))
    }
    //check subCategory and category exist
    const subCategoryExist = await subCategoryModel.findOne({ _id: subCategory, category })
    if (!subCategoryExist) {
        return next(new AppError("subCategory not exist", 404))
    }
    //check brand exist
    const brandExist = await brandModel.findOne({ _id: brand })
    if (!brandExist) {
        return next(new AppError("brand not exist", 404))
    }
    //check title exist
    const productExist = await productModel.findOne({ title: title.toLowerCase() })
    if (productExist) {
        return next(new AppError("product already exist", 409))
    }

    if (!req.files) {
        return next(new AppError("image is required", 400))
    }
    const customId = nanoid(5)
    let list = []
    for (const file of req.files.images) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
            folder: `EcommerceC42/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${customId}/coverImages`
        })
        list.push({ secure_url, public_id })
    }


    let subPrice = price - price * ((discount || 0) / 100)

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: `EcommerceC42/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${customId}/mainImage`
    })

    const product = await productModel.create({
        title,
        slug: slugify(title, {
            lower: true,
            replacement: "_"
        }),
        description,
        category,
        subCategory,
        brand,
        image: { secure_url, public_id },
        images: list,
        customId,
        price,
        discount,
        subPrice,
        stock,
        createdBy: req.user._id
    })


    res.status(201).json({ msg: "done", product })

})



// ===================================  updateProduct ================================================
export const updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { title, description, category, subCategory, brand, price, stock, discount } = req.body
    console.log(category);
    // check category exist
    const categoryExist = await categoryModel.findOne({ _id: category })
    if (!categoryExist) {
        return next(new AppError("category not exist", 404))
    }
    //check subCategory and category exist
    const subCategoryExist = await subCategoryModel.findOne({ _id: subCategory, category })
    if (!subCategoryExist) {
        return next(new AppError("subCategory not exist", 404))
    }
    //check brand exist
    const brandExist = await brandModel.findOne({ _id: brand })
    if (!brandExist) {
        return next(new AppError("brand not exist", 404))
    }
    //check title exist
    const product = await productModel.findOne({ _id: id, createdBy: req.user._id })
    if (!product) {
        return next(new AppError("product not exist", 409))
    }

    if (title) {
        if (title == product.title) {
            return next(new AppError("title match with old title", 409))
        }
        if (await productModel.findOne({ title: title.toLowerCase() })) {
            return next(new AppError("product already exist", 409))
        }
        product.title = title.toLowerCase()
        product.slug = slugify(title, {
            lower: true,
            replacement: "_"
        })

    }
    if (description) {
        product.description = description
    }

    if (stock) {
        product.stock = stock
    }

    if (price && discount) {
        product.subPrice = price - price * ((discount) / 100)
        product.discount = discount
        product.price = price
    } else if (price) {
        product.subPrice = price - price * ((product.discount) / 100)
        product.price = price
    } else if (discount) {
        product.subPrice = product.price - product.price * ((discount) / 100)
        product.discount = discount
    }
    if (req.files) {
        console.log(req.files);
        if (req.files?.image?.[0]) {
            await cloudinary.uploader.destroy(product?.image?.public_id)
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path, {
                folder: `EcommerceC42/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/mainImage`
            })
            product.image = { secure_url, public_id }
        }

        if (req.files?.images?.length > 0) {
            await cloudinary.api.delete_resources_by_prefix(`EcommerceC42/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/coverImages`)
            let list = []
            for (const file of req.files.images) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                    folder: `EcommerceC42/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/coverImages`
                })
                list.push({ secure_url, public_id })
            }
            product.coverImages = list
        }

    }


    await product.save()

    res.status(201).json({ msg: "done", product })

})


// ===================================  getProducts ================================================
export const getProducts = asyncHandler(async (req, res, next) => {



    const apiFeatures = new ApiFeatures(productModel.find(), req.query)
        .pagination()
        .select()
        .sort()
        .filter()
        .search()


    const products = await apiFeatures.mongooseQuery
    res.status(201).json({ msg: "done", page: apiFeatures.page, products })

})
