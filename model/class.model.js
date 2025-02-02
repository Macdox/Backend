import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    subjectname: {
      type: String,
      trim: true, // Removes extra spaces
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true, // Faster lookups by teacherId
    },
    studentLinks: [
      {
        link: { type: String, required: true },
        expiresAt: { type: Date, required: true, index: { expires: '1h' } }, // Auto-delete expired links
        redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      },
    ],
    subjectCode: {
      type: String,
      unique: true, // Prevent duplicate subject codes
      sparse: true, // Ensures `null` values are allowed
      uppercase: true, // Converts to uppercase for consistency
      trim: true,
    },
    file: [
      {
        lectureTitle: String,
        file: String,
      },
    ],
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/\S+$/.test(v); // Ensure it's a valid URL if provided
        },
        message: "Invalid URL format.",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Automatically adds `createdAt` & `updatedAt`
);

const Classes = mongoose.model("Classes", classSchema);
export default Classes;