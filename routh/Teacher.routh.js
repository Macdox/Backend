const express = require("express");
const multer = require("multer");
const { uploadLecture } = require("../controller/teacher.classes.controller.js");
const { verifyToken } = require("../middleware/Verifytoken.js");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const teacherRouter = express.Router();

teacherRouter.post("/upload-lecture", upload.single("file"), verifyToken, uploadLecture);

module.exports = teacherRouter;
