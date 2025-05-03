import crypto from "crypto";
import {instance} from "../index.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Payment from "../model/paymentModel.js";
import Appointment from "../model/AppointmentModel.js";

import dotenv from "dotenv";
dotenv.config();

export const createPayment = catchAsyncError(async (req, res, next) => {
    const { appointmentId } = req.params;
  
    const appointment = await Appointment.findById(appointmentId).populate("patient doctor");
    if (!appointment) return next(new ErrorHandler(404, "Appointment not found" ));
  
    const amount = appointment.doctor.fees * 100; // Razorpay accepts amount in paise
  
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${appointment._id}`,
    };
  
    const order = await instance.orders.create(options);
  
    const payment = await Payment.create({
      appointment: appointment._id,
      patient: appointment.patient._id,
      amount: amount / 100,
      razorpay_order_id: order.id,
    });
  
    res.status(201).json({
      success: true,
      message: "Payment initiated",
      order,
      payment,
      key_id: process.env.RAZORPAY_API_KEY,
    });
});

export const verifyPayment = catchAsyncError(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");
  
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  
    const payment = await Payment.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        status: "completed",
      },
      { new: true }
    );
  
    res.status(200).json({ success: true, message: "Payment verified successfully", payment });
});

// //get all payments throw all payments
export const getAllPayments = catchAsyncError(async (req, res, next) => {
    const payments = await Payment.find({ isdeleted: false })
      .populate({
        path: "patient",
        select: "name contact.phone contact.email"
      })
      .populate({
        path: "appointment",
        select: "date timeSlot doctor",
        populate: {
          path: "doctor",
          select: "name specialization fees slots"
        }
      });
  
    const formatted = payments.map(payment => ({
      paymentId: payment._id,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      patient: {
        name: payment.patient?.name,
        phone: payment.patient?.contact?.phone,
        email: payment.patient?.contact?.email,
      },
      appointment: {
        date: payment.appointment?.date,
        timeSlot: payment.appointment?.timeSlot,
        doctor: {
          name: payment.appointment?.doctor?.name,
          specialization: payment.appointment?.doctor?.specialization,
          fees: payment.appointment?.doctor?.fees,
          slots: payment.appointment?.doctor?.slots,
        }
      }
    }));
  
    res.status(200).json({
      success: true,
      payments: formatted
    });
  });

  //get payment by id
  export const getPaymentById = catchAsyncError(async (req, res, next) => {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId)
      .populate({
        path: "patient",
        select: "name contact.phone contact.email"
      })
      .populate({
        path: "appointment",
        select: "date timeSlot doctor",
        populate: {
          path: "doctor",
          select: "name specialization fees slots"
        }
      });

    if (!payment) return next(new ErrorHandler(404, "Payment not found"));

    const formatted = {
      paymentId: payment._id,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      patient: {
        name: payment.patient?.name,
        phone: payment.patient?.contact?.phone,
        email: payment.patient?.contact?.email,
      },
      appointment: {
        date: payment.appointment?.date,
        timeSlot: payment.appointment?.timeSlot,
        doctor: {
          name: payment.appointment?.doctor?.name,
          specialization: payment.appointment?.doctor?.specialization,
          fees: payment.appointment?.doctor?.fees,
          slots: payment.appointment?.doctor?.slots,
        }
      }
    };

    res.status(200).json({
      success: true,
      payment: formatted
    });
  });

  // get payment by appointment id
  export const getPaymentByAppointmentId = catchAsyncError(async (req, res, next) => {
    const { appointmentId } = req.params;
    const payment = await Payment.findOne({ appointment: appointmentId })
      .populate({
        path: "patient",
        select: "name contact.phone contact.email"
      })
      .populate({
        path: "appointment",
        select: "date timeSlot doctor",
        populate: {
          path: "doctor",
          select: "name specialization fees slots"
        }
      });

    if (!payment) return next(new ErrorHandler(404, "Payment not found"));

    const formatted = {
      paymentId: payment._id,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      patient: {
        name: payment.patient?.name,
        phone: payment.patient?.contact?.phone,
        email: payment.patient?.contact?.email,
      },
      appointment: {
        date: payment.appointment?.date,
        timeSlot: payment.appointment?.timeSlot,
        doctor: {
          name: payment.appointment?.doctor?.name,
          specialization: payment.appointment?.doctor?.specialization,
          fees: payment.appointment?.doctor?.fees,
          slots: payment.appointment?.doctor?.slots,
        }
      }
    };

    res.status(200).json({
      success: true,
      payment: formatted
    });
  });

  


  
  