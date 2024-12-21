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

import { verifyToken } from '../middlewares/verifytoken.js';

const router = express.Router();


//teacher auth check
router.get('/teacher-auth', verifyToken, checkAuth)

//teacher registration and login and logout
router.post('/teachersignup', registerTeacher);
router.post('/teacherlogin', loginTeacher);
router.post('teacherLogout', logoutTeacher);

//teacher verificarion and password reset
router.post('/resetpassword/:token', resetPassword);
router.post('/forgotpassword', forgotPassword);
router.post('/verifyTeacher', verifyTeacher);

export default router;
