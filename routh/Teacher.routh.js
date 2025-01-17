import express from "express";
import { uploadFile } from "../controller/teacher.classes.controller.js";
import multer from 'multer';
const Upload = multer({ dest: 'uploads/' })
const teacherRouter = express.Router();

teacherRouter.post("/upload", Upload.single('image') , uploadFile);



export default teacherRouter;
