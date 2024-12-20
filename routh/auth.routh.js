import express from 'express';
import {
    registerTeacher,
    loginTeacher,
    checkAuth,
    logoutTeacher,
} from '../controller/teachers.controller.js';

import { verifyToken } from '../middlewares/verifytoken.js';

const router = express.Router();

router.get('/teacherverify', verifyToken, checkAuth)
router.post('/teachersignup', registerTeacher);
router.post('/teacherlogin', loginTeacher);
router.post('teacherLogout', logoutTeacher);

export default router;
