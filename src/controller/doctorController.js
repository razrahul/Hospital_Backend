import {catchAsyncError} from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Doctor from '../model/DoctorModel.js'; // Import the Doctor model
// Controller function to create a new doctor

export const createDoctor = catchAsyncError(async (req, res, next) => {
    const { 
        name, specialization, hospital, about, qualification, awards, 
        experience, fees, availability, phone, email, 
        hospitalSlots, videoSlots 
    } = req.body;

    if (!name || !specialization || !email) {
        return next(new ErrorHandler(400, 'Name, specialization, and email are required'));
    }

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
        hospitalSlots,
        videoSlots,
        // image and createdBy logic can go here 
    });

    const savedDoctor = await newDoctor.save();

    res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        doctor: savedDoctor,
    });
});



export const getAllDoctors = catchAsyncError(async (req, res, next) => {
    const doctors = await Doctor.find({ isdeleted: false });

    res.status(200).json({
        success: true,
        message: 'Doctors fetched successfully',
        doctors, // this now includes hospitalSlots and videoSlots by default
    });
});


export const getDoctorById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate('createdBy', 'name email');

    if (!doctor) {
        return next(new ErrorHandler(404, 'Doctor not found'));
    }

    res.status(200).json({
        success: true,
        message: 'Doctor fetched successfully',
        doctor, // contains both slots
    });
});


//chnage availability
export const changeAvailability = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { availability } = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
        return next(new ErrorHandler(404, 'Doctor not found'));
    }

    if (availability === doctor.availability) {
        return next(new ErrorHandler(400, 'Availability is already set to this value'));
    }

    doctor.availability = availability;
    await doctor.save();

    res.status(200).json({
        success: true,
        message: 'Availability updated successfully',
        doctor,
    });
});

//get All Avlible Doctors
export const getAllAvailableDoctors = catchAsyncError(async (req, res, next) => {
    const doctors = await Doctor.find({ availability: "available", isdeleted: false });

    if (!doctors || doctors.length === 0) {
        return next(new ErrorHandler(404, 'No available doctors found'));
    }

    res.status(200).json({
        success: true,
        message: 'Available doctors fetched successfully',
        doctors,
    });
});

