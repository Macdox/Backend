import jwt from "jsonwebtoken";
import { classes } from "../model/class.model.js";
import { Student } from "../model/student.model.js";

export const join = async (req, res) => {
  const { token } = req.params;
  const studentId = req.userId; // Extracted from JWT
  console.log("Student ID:", studentId);
  console.log("Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);
    // Check expiration
    if (Date.now() > decoded.expiresAt) {
      return res.status(400).json({ message: "Link has expired" });
    }
    // Check if the class exists
    const foundClass = await classes.findOne({
      subjectname: decoded.subjectname,
    });
    //console.log("Found class:", foundClass);
    if (!foundClass)
      return res.status(404).json({ message: "Class not found" });

    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const classToJoin = await classes.findOne({ subjectname: foundClass.subjectname }); // Replace 'name' with an actual identifier
    console.log("Class to join:", classToJoin._id);
    if (!classToJoin) {
    return res.status(404).json({ message: "Class not found" });
    }
// Push the ObjectId to the student's enrolledClasses
    
    // Add class ID to enrolledClasses if not already enrolled
    if (!student.enrolledClasses.includes(foundClass.subjectname)) {
      student.enrolledClasses.push(classToJoin._id);
      await student.save();
    } else {
      return res
        .status(400)
        .json({ message: "Student already enrolled in this class" });
    }

    await classToJoin.save();
    res.status(200).json({ message: "Successfully joined the class" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired link" });
  }
};
