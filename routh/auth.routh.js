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
import { authenticateTeacher } from '../middleware/authMiddleware.js';

import { LoginStudent, LogoutStudent, SignupStudent, StudentForgotPassword, studentResetPassword, studenttAuth, VerifyStudent } from '../controller/students.controller.js';

import { CreateClass, generateJoinLink } from '../controller/teacher.classes.controller.js';
import { verifyToken } from '../middleware/Verifytoken.js';

const router = express.Router();


//teacher auth check
router.get('/teacher-auth', verifyToken,checkAuth)

//student auth check
router.get('/student-auth', verifyToken,studenttAuth)

//teacher registration and login and logout
router.post('/teachersignup', registerTeacher);
router.post('/teacherlogin', loginTeacher);
router.post('/teacherLogout',authenticateTeacher, logoutTeacher);

//teacher verificarion and password reset
router.post('/resetpassword/:token',resetPassword);
router.post('/forgotpassword',forgotPassword);
router.post('/verifyTeacher',verifyTeacher);


// classes
router.post('/create-class',verifyToken, CreateClass);
router.post('/generate-link',verifyToken,generateJoinLink);

// student register and login
router.post('/studentSignup', SignupStudent);
router.post('/verifyStudent', VerifyStudent);
router.post('/studentLogin', LoginStudent);
router.post('/studentLogout', LogoutStudent)
router.post('/studentForgetpassword', StudentForgotPassword);
router.post('/studendResetpassword/:token', studentResetPassword);
export default router;
