const express = require("express");
const { verifyToken } = require("../middleware/Verifytoken.js");
const { fetchVideo, getclasscontent, getStudentClasses, updateWatchedStatus } = require("../controller/student.classes.controller.js");
const Studentrouter = express.Router();

Studentrouter.get("/fetch-classes", verifyToken, getStudentClasses);
Studentrouter.get("/getclasscontent/:id", verifyToken, getclasscontent);
Studentrouter.get("/fetch-video/:id", fetchVideo);
Studentrouter.post('/update-watched-status', verifyToken, updateWatchedStatus);

module.exports = Studentrouter;
