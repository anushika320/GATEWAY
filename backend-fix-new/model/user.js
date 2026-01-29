import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    userId:{
        type:String,
        unique:true,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    role:{  
        type:String,
        enum:['admin','user'],
        default:'user'
    }
})

const User = mongoose.model('User',userSchema);
export default User;