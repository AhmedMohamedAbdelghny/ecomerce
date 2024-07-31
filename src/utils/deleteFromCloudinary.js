import cloudinary from "./cloudinary.js"



export const deleteFromCloudinary = async (req, res, next) => {
    if (req?.customPath) {
        await cloudinary.api.delete_resources_by_prefix(req.customPath)
        await cloudinary.api.delete_folder(req.customPath)
    }
    next()
}