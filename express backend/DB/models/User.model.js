import { Schema, model,mongoose } from "mongoose";

const userSchema=new mongoose.Schema({
    firstName:{
        type: String,
        required: [true, 'name is required'],
        lowercase: true
    },
    lastName:{
        type: String,
        required: [true, 'name is required'],
        lowercase: true
    },
    role:{
        type: String,
        enum: ['User','Admin'],
        default:'User'
    },
    email: {
        type: String,
        unique: [true, 'email must be unique'],
        required: [true, 'email is required'],
        lowercase: true
    },
    password: {
        type: String,
        unique: true,
        required: [true, 'password is required']
    },
    
    confirmPassword: {
        type: String,
        
    },
    
    avatar:String ,
}, { timestamps: true })

// Check if the model already exists to avoid OverwriteModelError
const userModel= mongoose.model('user', userSchema);
export default userModel
