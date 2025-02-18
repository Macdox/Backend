import express from "express";
import {
  registerTeacher,
  loginTeacher,
  checkAuth,
  resetPassword,
  forgotPassword,
  verifyTeacher,
} from "../controller/teachers.controller.js";

import {
  LoginStudent,
  LogoutStudent,
  SignupStudent,
  StudentForgotPassword,
  studentResetPassword,
  VerifyStudent,
} from "../controller/students.controller.js";

import {
  CreateClass,
  generateJoinLink,
} from "../controller/teacher.classes.controller.js";

import { verifyToken } from "../middleware/Verifytoken.js";
import { join } from "../controller/student.classes.controller.js";

const router = express.Router();

// Teacher auth check
router.get("/auth", verifyToken, checkAuth);

// Teacher registration, login, and logout
router.post("/teachersignup", registerTeacher);
router.post("/teacherlogin", loginTeacher);

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
export default router;
