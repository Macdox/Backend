import express from "express";
import { verifyToken } from "../middleware/Verifytoken.js";
import { fetchVideo, getclasscontent, getStudentClasses, updateWatchedStatus } from "../controller/student.classes.controller.js";
import { profile, ProfileUpdate, uploadProfilepic } from "../controller/students.controller.js";
import multer from "multer";


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Studentrouter = express.Router();

Studentrouter.get("/fetch-classes", verifyToken, getStudentClasses);
Studentrouter.get("/getclasscontent/:id", verifyToken, getclasscontent);
Studentrouter.get("/fetch-data", verifyToken, profile);
Studentrouter.get("/fetch-video/:id", fetchVideo);
Studentrouter.post('/update-watched-status', verifyToken, updateWatchedStatus);
Studentrouter.post('/upload-profile-pic',upload.single("profilePic"), verifyToken, uploadProfilepic);
Studentrouter.post('/update-profile', verifyToken, ProfileUpdate);

export default Studentrouter;
