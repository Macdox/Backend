import express from 'express';
import dotenv from 'dotenv';
import connectDB  from './db/database.js';
import cors from "cors";
import router from './routh/auth.routh.js';
import cookieParser from 'cookie-parser';
import teacherRouter from './routh/Teacher.routh.js';

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', router);
app.use('/api/v1', teacherRouter);

app.listen(PORT,()=>{
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})