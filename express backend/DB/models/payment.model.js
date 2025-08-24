import {Schema,Types,model} from 'mongoose'

const paymentSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  currency: { type: String, required: true, default: 'USD' },
  createdAt: { type: Date, default: Date.now }
});

const paymentModel = model('Payment', paymentSchema);
export default paymentModel;
