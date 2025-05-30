import express from 'express';
import { createAppointment, getAllAppointments, getAppointmentByDate, getAllHospitalVisitAppointments} from '../controller/appointmentController.js';
import { get } from 'http';

const router = express.Router();

// Route to create a new appointment
router.post('/appoint/:id', createAppointment);

//get all appointments
router.get('/appoints', getAllAppointments);

//get appointment by date
router.get('/appoints/:date', getAppointmentByDate);

//get All hospital visit appointments
router.get('/offline/hospital-visit', getAllHospitalVisitAppointments);

export default router;