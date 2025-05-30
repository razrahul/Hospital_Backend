// models/Payment.js
import mongoose from "mongoose";
import BaseModelSchema from "./BaseModel.js";

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  amount: { type: Number, required: true },
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  status: {
    type: String,
    enum: ["created", "completed", "failed"],
    default: "failed"
  },
  ...BaseModelSchema.obj,
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
