const express = require("express");
const {
  registerTeacher,
  loginTeacher,
  checkAuth,
  logoutTeacher,
  resetPassword,
  forgotPassword,
  verifyTeacher,
} = require("../controller/teachers.controller.js");

const {
  LoginStudent,
  LogoutStudent,
  SignupStudent,
  StudentForgotPassword,
  studentResetPassword,
  studentAuth,
  VerifyStudent,
} = require("../controller/students.controller.js");

const {
  CreateClass,
  generateJoinLink,
} = require("../controller/teacher.classes.controller.js");

const { verifyToken } = require("../middleware/Verifytoken.js");
const { join } = require("../controller/student.classes.controller.js");

const router = express.Router();

// Teacher auth check
router.get("/teacher-auth", verifyToken, checkAuth);

// Student auth check
router.get("/student-auth", verifyToken, studentAuth);

// Teacher registration, login, and logout
router.post("/teachersignup", registerTeacher);
router.post("/teacherlogin", loginTeacher);
router.post("/teacherLogout", logoutTeacher);

// Teacher verification and password reset
router.post("/resetpassword/:token", resetPassword);
router.post("/forgotpassword", forgotPassword);
router.post("/verifyTeacher", verifyTeacher);

// Classes
router.post("/create-class", verifyToken, CreateClass);
router.get("/join/:token", verifyToken, join);
router.post("/generate-join-link", verifyToken, generateJoinLink);

// Student register and login
router.post("/studentSignup", SignupStudent);
router.post("/verifyStudent", VerifyStudent);
router.post("/studentLogin", LoginStudent);
router.post("/studentLogout", LogoutStudent);
router.post("/studentForgetpassword", StudentForgotPassword);
router.post("/studentResetpassword/:token", studentResetPassword);

// Export router
module.exports = router;
