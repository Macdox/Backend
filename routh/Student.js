import express from "express";
import { verifyToken } from "../middleware/Verifytoken.js";
import { getStudentClasses } from "../controller/student.classes.controller.js";
const Studentrouter = express.Router();

Studentrouter.get("/fetch-classes", verifyToken, getStudentClasses);
export default Studentrouter;
