import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/database.js';
import cors from "cors";
import router from './routh/auth.routh.js';
import cookieParser from 'cookie-parser';
import teacherRouter from './routh/Teacher.routh.js';
import Studentrouter from './routh/Student.js';
const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://spiroedu.netlify.app", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', router);
app.use('/api/v1', teacherRouter);
app.use('/api/v1', Studentrouter);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});