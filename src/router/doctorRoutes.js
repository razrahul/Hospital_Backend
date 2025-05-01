import express from 'express';
import {createDoctor, getAllDoctors, getDoctorById, changeAvailability, getAllAvailableDoctors } from '../controller/doctorController.js';
// import { isAuthenticated } from '../middlewares/auth.js';

import singleUpload from '../middlewares/multer.js';

const router = express.Router();

router.post('/doctor',singleUpload, createDoctor);
//get All doctors
router.get('/doctors', getAllDoctors);

//get doctors by id
router.get('/doctor/:id', getDoctorById);

//chnage availability
router.put('/doctor/:id/availability', changeAvailability);

// get All available doctors
router.get('/available-doctors', getAllAvailableDoctors);




export default router;