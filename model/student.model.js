const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true, // Removes extra spaces
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
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
      required: true,
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

// Index email for fast lookups
userSchema.index({ email: 1 });

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

const Student = mongoose.model("Student", userSchema);
module.exports = Student;
