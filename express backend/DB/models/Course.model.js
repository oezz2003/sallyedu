
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
    
    },
    price:String,

    duration:String,

    instructors:{
        type:Types.ObjectId,
        ref:"User"
    },
   media: {
       type: Object,
      /* properties: {
           public_id: { type: String },
           secure_url: { type: String }
       }*/
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