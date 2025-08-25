import userModel from '../../../DB/models/User.model.js';
import { GenerateToken, varifyToken } from '../../utils/Generate_Varify.js';
import { asyncHandler } from "../../utils/errorHandler.js";
import { compare, Hash } from "../../utils/Hash_Compare.js";

export const signUp = asyncHandler(async (req, res, next) => {
  const { firstName,lastName,country, password,confirmPassword,avatar,email } = req.body;

  const isExist = await userModel.findOne({ email });
  if (isExist) {
    return next(new Error('User  already exists', { cause: 409 }));
  }

 // const hashPassword = Hash({ plaintext: password });

  const newUser= new userModel(req.body)
  await newUser.save();

  return res.status(201).json({ message: 'User  created successfully', newUser });
});

export const logIn = asyncHandler(async (req, res, next) => {
  const { email,password } = req.body;



 if(!email || !password){
  return next(new Error("please enter password and email"))
 }
  const userExist = await userModel.findOne({ email });
  if (!userExist) {
    return next(new Error("User does not exist", { cause: 404 }));
  }


  /*if (!compare({ plaintext: password, hashValue: userExist.password })) {
    return next(new Error('Invalid password', { cause: 400 }));
  }*/

  const token = GenerateToken({
    payload: { _id: userExist._id, email: userExist.email },
    signature: process.env.SIGNUP_SIGNATURE,
    expiresIn: 60 * 60,
  });

  const ref_token = GenerateToken({
    payload: { _id: userExist._id, email: userExist.email },
    signature: process.env.SIGNUP_SIGNATURE,
    expiresIn: 60 * 60,
  });

   return res.status(200).json({ message: "Login successful", token, ref_token });
});

export const addUser  = asyncHandler(async (req, res, next) => {
  const { email, password, firstName,lastName, role } = req.body;

  if (req.user.role != "Admin") {
    return next(new Error("Only admin can access this route", { cause: 401 }));
  }

  const userExists = await userModel.findOne({ email });
  if (userExists) {
    return next(new Error("User  already exists", { cause: 409 }));
  }

  //const hashedPassword = Hash({ plaintext: password });
  const newUser  = new userModel({
    email,
    password,
    firstName,
    lastName,
    role // Set the role from the request body
  });

  await newUser .save();
  return res.status(201).json({ message: "User  created successfully", newUser  });
});

export const search = asyncHandler(async (req, res, next) => {
  const { firstName,email } = req.body;

  if (!firstName|| !email ) {
    return next(new Error("Please provide either name or email"));
  }

  const users = await userModel.find({
    $or: [{ firstName: firstName }, { email: email }]
  }).populate(' courseId');

  if (users.length === 0) {
    return next(new Error("No users found", { cause: 404 }));
  }

  return res.status(200).json({ message: "Users found", users });
});

export const updateUser=asyncHandler(
  async(req,res,next)=>{
    const{firstName,email}=req.body
    
    if(req.user.role!="Admin"){
      return next(new Error("only admin can access"))
    }

   const user=await userModel.findOne({ $or: [{ firstName: firstName }, { email: email }]})    
 
  if(!user){
  return next(new Error("user is not exist"))
  }
  const updated=await userModel.update(req.body,{new:true})
  return message.json({message:"updated succefully",updated})
}
)
export const deleteUser=asyncHandler(
  async(req,res,next)=>{
    const{firstName,email}=req.body
    
    if(req.user.role!="Admin"){
      return next(new Error("only admin can access"))
    }

   const user=await userModel.findOne({ $or: [{ firstName: firstName }, { email: email }]})    
 
  if(!user){
  return next(new Error("user is not exist"))
  }
  const deleted=await userModel.delete({firstName},{new:true})
  return message.json({message:"updated succefully",deleted})
}
)