
import productModel from "../../../db/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import wishListModel from './../../../db/models/wishlist.model';



// ===================================  createWishList ================================================
export const createWishList = asyncHandler(async (req, res, next) => {
    const { productId } = req.params

    const product = await productModel.findOne({
        _id: productId,
    })
    if (!product) {
        return next(new AppError("product not found ", 404))
    }

    const wishListExist = await wishListModel.findOne({ user: req.user._id })
    if (!wishListExist) {
        const wishList = await wishListModel.create({ user: req.user._id, products: [{ productId }] })
        return res.status(201).json({ msg: "done", wishList })
    } else {
        await wishListModel.updateOne({ user: req.user._id }, {
            $addToSet: { products: { productId } }
        })
    }

    await wishListExist.save()
    res.status(201).json({ msg: "done", wishListExist })


})


