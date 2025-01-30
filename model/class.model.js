import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  file: { type: String, required: true },
  lectureTitle: { type: String, required: true },
});

const classesSchema = new mongoose.Schema(
  {
    subjectname: {
      type: String,
      trim: true, // Removes extra spaces
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
    files: [fileSchema], // Renamed from `file` to `files` (more intuitive)
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

const classes = mongoose.model("classes", classesSchema);
export { classes };