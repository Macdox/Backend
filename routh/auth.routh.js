import express from 'express';
import {
    registerTeacher,
    loginTeacher,
    checkAuth,
    logoutTeacher,
    resetPassword,
    forgotPassword,
    verifyTeacher,
} from '../controller/teachers.controller.js';

import { LoginStudent, LogoutStudent, SignupStudent, StudentForgotPassword, studentResetPassword, VerifyStudent } from '../controller/students.controller.js';

import { verifyToken } from '../middlewares/verifytoken.js';

const router = express.Router();


//teacher auth check
router.get('/teacher-auth', verifyToken, checkAuth)

//teacher registration and login and logout
router.post('/teachersignup', registerTeacher);
router.post('/teacherlogin', loginTeacher);
router.post('/teacherLogout', logoutTeacher);

//teacher verificarion and password reset
router.post('/resetpassword/:token', resetPassword);
router.post('/forgotpassword', forgotPassword);
router.post('/verifyTeacher', verifyTeacher);


// student register and login
router.post('/studentSignup', SignupStudent);
router.post('/verifyStudent', VerifyStudent);
router.post('/studentLogin', LoginStudent);
router.post('/studentLogout', LogoutStudent)
router.post('/studentForgetpassword', StudentForgotPassword);
router.post('/studendResetpassword/:token', studentResetPassword);
export default router;
