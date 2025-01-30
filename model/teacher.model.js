import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Store email in lowercase to prevent duplication issues
      trim: true,
    },
    phone: {
      type: String, // Use String for international formats
      required: false,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // Enforce minimum length for security
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);


const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
