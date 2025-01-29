import express from "express";
import { verifyToken } from "../middleware/Verifytoken.js";
import { fetchVideo, getclasscontent, getStudentClasses, updateWatchedStatus } from "../controller/student.classes.controller.js";

const router = express.Router();

router.get("/fetch-classes", verifyToken, getStudentClasses);
router.get("/getclasscontent/:id", getclasscontent);
router.get("/fetch-video/:id", fetchVideo);
router.post('/update-watched-status', verifyToken, updateWatchedStatus);

export default router;
