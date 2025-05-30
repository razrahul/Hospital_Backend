import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

import Appointment from "../model/AppointmentModel.js";
import Patient from "../model/PatientModel.js";


//create Appointment
export const createAppointment = catchAsyncError(async (req, res, next) => {
  const {id} = req.params; 
  const { name, age, gender, phone, email, address, consultationMode, date, timeSlot } = req.body;

  // create patient mosel
  const patient = await Patient.create({
    name,
    age,
    gender,
    contact: {
      phone,
      email,
      address,
    },
    // bloodGroup,
  });

  const appointment = new Appointment({
    patient: patient._id,
    doctor: id,
    date: date,
    consultationMode,
    timeSlot,
    // symptoms,
  });

  await appointment.save();

  // send message to whatapps
  // write to payment  model
  // send message tp finalize the appointment
  // send message to doctor

  res.status(201).json({ 
    success: true,
    message: "Appointment created successfully",
    appointment 
  });
});
// cheack for doctor slot availability
// Pseudo Code in controller/service while creating appointment

// const doctor = await Doctor.findById(doctorId);

// if (!doctor) {
//   throw new Error("Doctor not found");
// }

// let validSlots = [];
// if (consultationMode === 'Hospital Visit') {
//   validSlots = doctor.hospitalSlots;
// } else if (consultationMode === 'Video Call') {
//   validSlots = doctor.videoSlots;
// }

// if (!validSlots.includes(timeSlot)) {
//   throw new Error("Invalid time slot for selected consultation mode");
// }

// // Now save the appointment
// const appointment = await Appointment.create({
//   patient,
//   doctor: doctorId,
//   date,
//   consultationMode,
//   timeSlot,
//   status: 'Scheduled', // or as needed
// });

//  //get all appointments
export const getAllAppointments = catchAsyncError(async (req, res, next) => {
    const appointments = await Appointment.find({ isdeleted: false })
      .populate({
        path: 'patient',
        select: 'name age gender contact.phone contact.email contact.address bloodGroup',
      })
      .populate({
        path: 'doctor',
        select: 'name specialization fees availability slots',
      });
  
    res.status(200).json({
      success: true,
      message: 'Appointments fetched successfully',
      appointments,
    });
  });


export const getAllHospitalVisitAppointments = catchAsyncError(async (req, res, next) => {
  const appointments = await Appointment.find({
    consultationMode: "Hospital Visit",
    isdeleted: false
  }).sort({ createdAt: -1 })
    .populate({
      path: 'patient',
      select: 'name age gender bloodGroup contact.phone contact.email contact.address'
    })
    .populate({
      path: 'doctor',
      select: 'name specialization fees availability slots'
    });

  res.status(200).json({
    success: true,
    message: 'Hospital visit appointments fetched successfully',
    appointments
  });
});



  // get appointment by  date
export const getAppointmentByDate = catchAsyncError(async (req, res, next) => {
    const { date } = req.params;

    const appointments = await Appointment.find({ date, isdeleted: false })
      .populate({
        path: 'patient',
        select: 'name age gender contact.phone contact.email contact.address bloodGroup',
      })
      .populate({
        path: 'doctor',
        select: 'name specialization fees availability slots',
      });

    res.status(200).json({
      success: true,
      message: 'Appointments fetched successfully',
      appointments,
    });
  });
  