import mongoose from "mongoose";


const connectionDB = async () => {
    return await mongoose.connect(process.env.DB_URLOnline)
        .then(() => {
            console.log("connected to database")
        }).catch((err) => {
            console.log({ msg: "fail to connect", err })
        })
}

export default connectionDB