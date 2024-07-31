



export const deleteFromDB = async (req, res, next) => {
    if (req?.data) {
        console.log(req.data);
        const { model, id } = req.data
        await model.findByIdAndDelete(id)
    }
}