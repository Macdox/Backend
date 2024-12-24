import jwt from "jsonwebtoken";
import { Teacher } from "../model/teacher.model.js";

export const authenticateTeacher = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Retrieve token from cookies
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded.teacherId);

    const teacher = await Teacher.findById(decoded.teacherId);
    console.log("Teacher found:", teacher);

    // Find teacher by decoded ID, exclude sensitive fields
    req.teacher = await Teacher.findById(decoded.teacherId).select("password");
    if (!req.teacher) {
      console.log("Teacher not found for ID:", decoded.teacherId);
      return res.status(401).json({ message: "Teacher not found, authorization denied" });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in authenticateTeacher middleware:", error);
    res.status(500).json({ message: "Server error" });
  }
};
