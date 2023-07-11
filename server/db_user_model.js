import mongoose from "mongoose";
let userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    }
})
let userModel = mongoose.model("Users",userSchema,'users')
export default userModel