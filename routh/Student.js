import express from "express";
import { verifyToken } from "../middleware/Verifytoken.js";
import { fetchVideo, getclasscontent, getStudentClasses, updateWatchedStatus } from "../controller/student.classes.controller.js";

const Studentrouter = express.Router();

Studentrouter.get("/fetch-classes", verifyToken, getStudentClasses);
Studentrouter.get("/getclasscontent/:id", verifyToken, getclasscontent);
Studentrouter.get("/fetch-video/:id", fetchVideo);
Studentrouter.post('/update-watched-status', verifyToken, updateWatchedStatus);

export default Studentrouter;
