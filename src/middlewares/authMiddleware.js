import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";

// Protect routes (Admin/Doctor/Patient)
export const protect = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorHandler("Not authorized, no token", 401));
  }

  try {
    // console.log("Token:", token);
    // console.log("JWT_SECRET:", process.env.JWT_SECRET);
    // console.log("Decoded (unsafe):", jwt.decode(token));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // console.error("JWT verification failed:", error.message);
    return next(new ErrorHandler("Not authorized, token failed", 401));
  }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      // console.log("User role:", req.user.role);
      // console.log("Allowed roles:", roles);
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            403,
            `Role: ${req.user.role} is not allowed to access this resource`
          )
        );
      }
      next();
    };
  };
  