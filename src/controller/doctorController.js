import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Doctor from "../model/DoctorModel.js"; // Import the Doctor model
import getDataUri from "../utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";
import { doc } from "prettier";
// Controller function to create a new doctor

export const createDoctor = catchAsyncError(async (req, res, next) => {
  const {
    name,
    specialization,
    hospital,
    about,
    qualification,
    awards,
    experience,
    fees,
    availability,
    phone,
    email,
    hospitalSlots,
    videoSlots,
  } = req.body;

  if (!name || !specialization || !email) {
    return next(
      new ErrorHandler(400, "Name, specialization, and email are required")
    );
  }

  const existingDoctor = await Doctor.findOne({
    "contact.email": email,
    isdeleted: false,
  });
  // Check if a doctor with the same email already exists
  if (existingDoctor) {
     return next(new ErrorHandler(400, "Doctor with this email already exists"));
    }

  let mycloud = {
     public_id: null,
     secure_url: null,
    };

  // Handle file upload
  if (req.file) {
     const fileUri = getDataUri(req.file);
     mycloud = await cloudinary.uploader.upload(fileUri.content, {
      folder: "doctors",
     });
    }

    const hospitalSlotsarray = JSON.parse(hospitalSlots);
    const videoSlotsarray = JSON.parse(videoSlots);


  const newDoctor = new Doctor({
    name,
    specialization,
    hospital,
    about,
    qualification,
    awards,
    experience,
    fees,
    availability,
    contact: {
      phone,
      email,
    },
    hospitalSlots:hospitalSlotsarray,
    videoSlots: videoSlotsarray,
    image: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
    // image and createdBy logic can go here
  });

  const savedDoctor = await newDoctor.save();

  res.status(201).json({
    success: true,
    message: "Doctor created successfully",
    doctor: savedDoctor,
  });
});

export const getAllDoctors = catchAsyncError(async (req, res, next) => {
  const doctors = await Doctor.find({ isdeleted: false });

  res.status(200).json({
    success: true,
    message: "Doctors fetched successfully",
    doctors, // this now includes hospitalSlots and videoSlots by default
  });
});

export const getDoctorById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const doctor = await Doctor.findById(id).populate("createdBy", "name email");

  if (!doctor) {
    return next(new ErrorHandler(404, "Doctor not found"));
  }

  res.status(200).json({
    success: true,
    message: "Doctor fetched successfully",
    doctor, // contains both slots
  });
});

//chnage availability
export const changeAvailability = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { availability } = req.body;

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    return next(new ErrorHandler(404, "Doctor not found"));
  }

  if (availability === doctor.availability) {
    return next(
      new ErrorHandler(400, "Availability is already set to this value")
    );
  }

  doctor.availability = availability;
  await doctor.save();

  res.status(200).json({
    success: true,
    message: "Availability updated successfully",
    doctor,
  });
});

//get All Avlible Doctors
export const getAllAvailableDoctors = catchAsyncError(
  async (req, res, next) => {
    const doctors = await Doctor.find({
      availability: "available",
      isdeleted: false,
    });

    if (!doctors || doctors.length === 0) {
      return next(new ErrorHandler(404, "No available doctors found"));
    }

    res.status(200).json({
      success: true,
      message: "Available doctors fetched successfully",
      doctors,
    });
  }
);

//update doctor
export const updateDoctor = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    specialization,
    hospital,
    about,
    qualification,
    awards,
    experience,
    fees,
    availability,
    phone,
    email,
    hospitalSlots,
    videoSlots,
  } = req.body;

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    return next(new ErrorHandler(404, "Doctor not found"));
  }

  if (name) doctor.name = name;
  if (specialization) doctor.specialization = specialization;
  if (hospital) doctor.hospital = hospital;
  if (about) doctor.about = about;
  if (qualification) doctor.qualification = qualification;
  if (awards) doctor.awards = awards;
  if (experience) doctor.experience = experience;
  if (fees) doctor.fees = fees;
  if (availability) doctor.availability = availability;
  if (phone) doctor.contact.phone = phone;
  // if (email) doctor.contact.email = email;
  if (hospitalSlots) doctor.hospitalSlots = hospitalSlots;
  if (videoSlots) doctor.videoSlots = videoSlots;
  

  if (email) {
    const existingDoctor = await Doctor.findOne({
      "contact.email": email,
      isdeleted: false,
    });
    if (existingDoctor && existingDoctor._id.toString() !== id) {
      return next(new ErrorHandler(400, "Doctor with this email already exists"));
    }
    doctor.contact.email = email;
  }

 // file upload logic
  if (req.file) {
    if (doctor.image.public_id) {
      await cloudinary.uploader.destroy(doctor.image.public_id);
    }
    // Handle file upload
    // Use the getDataUri function to convert the file to a data URI
    const fileUri = getDataUri(req.file);
    const mycloud = await cloudinary.uploader.upload(fileUri.content, {
      folder: "doctors",
    });
    doctor.image.public_id = mycloud.public_id;
    doctor.image.url = mycloud.secure_url;
  }
  
  doctor.updatedAt = Date.now(); // Update the updatedAt field
  const updatedDoctor = await doctor.save();

  res.status(200).json({
    success: true,
    message: "Doctor updated successfully",
    doctor: updatedDoctor,
  });
});

//delete doctor
export const deleteDoctor = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    return next(new ErrorHandler(404, "Doctor not found"));
  }

  doctor.isdeleted = true;
  doctor.deletedAt = Date.now(); // Set the deletedAt field to the current date and time
  doctor.deletedBy = req.user._id; // Assuming req.user contains the authenticated user
  await doctor.save();

  res.status(200).json({
    success: true,
    message: "Doctor deleted successfully",
  });
});
