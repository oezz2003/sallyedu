
import { Schema,Types,Model, model } from "mongoose";

const videoSchema = new Schema({
    id: String,
  title: String,
  description: String,
  url: String,
  duration: String,
  order: String,
})




const courseSchema=new Schema({
    title:{
        type:String,
        required:false,
        trim:true
    },
    description:String,
    status:{
        type:String,
        enum:["archived","active","draft"],
        max:2000
    },
    category:{
        type:String,
        enum:["AI","programming","business","marketing","design","data science"],
    },
    price:String,

    duration:String,

    instructors:{
        type:Types.ObjectId,
        ref:"User"
    },
   
  media: {
  public_id: { type: String },
  secure_url: { type: String }
},

video: [videoSchema],
createdBy:{
    type:Types.ObjectId,
    ref:"User"
}
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

const courseModel=model("Course",courseSchema)
export default courseModel