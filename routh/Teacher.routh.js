import express from "express";
import multer from "multer";
import { uploadLecture } from "../controller/teacher.classes.controller.js";
import { verifyToken } from "../middleware/Verifytoken.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const teacherRouter = express.Router();

teacherRouter.post("/upload-lecture", upload.single("file"), verifyToken, uploadLecture);

export default teacherRouter;
