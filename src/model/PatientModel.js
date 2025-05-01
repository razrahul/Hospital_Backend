import mongoose from 'mongoose';
import BaseModelSchema from './BaseModel.js';

const Schema = mongoose.Schema;

const patientSchema = new Schema({
  name: { type: String, required: true },
  age: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  contact: {
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String }
  },
  // bloodGroup: { type: String },

  ...BaseModelSchema.obj, // Include the base model schema fields
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;

