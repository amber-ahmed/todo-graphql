import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
async function connect(){
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log('connedted to db')
    } catch (error) {
        console.log(error)
    }
}
connect()