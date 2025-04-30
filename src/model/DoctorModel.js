import mongoose from "mongoose";
import BaseModelSchema from "./BaseModel.js";

const Schema = mongoose.Schema;

const defaultSlots = [
  '09:00 AM', '09:30 AM','10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM','12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM','04:00 PM', '04:30 PM','05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM'
];

const doctorSchema = new Schema({
  name: { type: String, required: true },
  image: {
    public_id: { type: String, default: null },
    url: { type: String, default: null },
  },
  specialization: { type: String, required: true },
  hospital: { type: String },
  about: { type: String },
  qualification: { type: String },
  awards: { type: String },
  experience: { type: String },
  fees: { type: Number },
  availability: {
    type: String,
    enum: ["available", "unavailable"],
    default: "available",
  },
  contact: {
    phone: { type: String },
    email: { type: String, unique: true },
  },
  hospitalSlots: {
    type: [String],
    default: defaultSlots,
  },
  videoSlots: {
    type: [String],
    default: defaultSlots,
  },

  ...BaseModelSchema.obj,
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
