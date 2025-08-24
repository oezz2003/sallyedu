import {Schema,model,Types} from 'mongoose'

const enrollmentSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Types.ObjectId, ref: 'Course', required: true },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  },
  paymentId:{
    type:Types.ObjectId,
    ref:"Payment"
  },
  createdAt: { type: Date, default: Date.now }
});

const enrollmentModel = model('Enrollment', enrollmentSchema);
export default enrollmentModel;
