import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    ProfilePicUrl: {
      type: String,
    },
    ProfilePicKey:{
      type: String,
    },
    FullName: {
      type: String,
      trim: true, // Removes extra spaces
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Ensure emails are stored in lowercase
      trim: true,
    },
    phone: {
      type: String, // Using String instead of Number for international formats
      trim: true,
    },
    Branch: {
      type: String,
      trim: true,
    },
    Class: {
      type: String,
      trim : true,
    },
    Gender: {
      type: String,
      enum : ["Male", "Female"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // Enforce minimum length for security
    },
    passwordConfirm: {
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
    role:{
      type: String,
      default: "student",
    },
    enrolledClasses: [
      {
        type: mongoose.Schema.Types.ObjectId, // Corrected reference type
        ref: "Classes",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    watchedVideos: {
      type: [String], // Ensure array of video IDs
      default: [],
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export const Student = mongoose.model("Student", userSchema);
export default Student;
