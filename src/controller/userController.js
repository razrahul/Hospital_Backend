import User from "../model/UserModel.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import {catchAsyncError} from "../middlewares/catchAsyncError.js";
import dotenv from "dotenv";
dotenv.config();

// Register New User
export const registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password, role, phone, address } = req.body;
  
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler(400,"User already exists with this email" ));
    }
  
    // Create user
    const user = await User.create({ 
        name, 
        email, 
        password, 
        role,
        contact: {
          phone,
          address,
        },
      });
  
    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: {
            phone: user?.contact?.phone,
            address: user?.contact?.address,
          },
      },
    });
  });

// User Login
export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email exists
  const user = await User.findOne({ email, isdeleted: false });
  if (!user) {
    return next(new ErrorHandler(401,"Invalid email or password" ));
  }

  // Check if password is correct
  const isPasswordMatched = await user.matchPassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler(401, "Invalid email or password" ));
  }

  // Create JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7h",
  });

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      contact: {
        phone: user?.contact?.phone,
        address: user?.contact?.address,
      },
    },
  });
});


//user logout
export const logoutUser = catchAsyncError(async (req, res, next) => {
  // Clear cookie if any
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "Logged out — please remove token on client side",
  });
});


//delete user
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler(404, "User not found"));
  }

  user.isdeleted = true;
  user.deletedAt = Date.now();
  user.deletedBy = req.user.id; // Assuming req.user contains the logged-in user's info
  await user.save();
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});


//get all users