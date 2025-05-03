
import express from "express";
import { createPayment, verifyPayment, getAllPayments, getPaymentById, getPaymentByAppointmentId } from "../controller/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/payment/create/:appointmentId", createPayment);
router.post("/payment/verify", verifyPayment);

router.get("/payment/all", getAllPayments);

// get payments by id
router.get("/payment/:paymentId", protect, getPaymentById);

// get payment by appointment id
router.get("/payment/appointment/:appointmentId", protect, getPaymentByAppointmentId);




export default router;