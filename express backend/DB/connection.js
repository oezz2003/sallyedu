import mongoose from 'mongoose';

  const connection=async()=>{
 return await mongoose.connect(process.env.CONNECTION)
 .then(()=>{
    console.log("db connected")
 }).catch(()=>{

    console.log("faild to connect")
 })
 }
export default connection