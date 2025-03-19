import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/database.js';
import cors from 'cors';
import router from './routh/auth.routh.js';
import cookieParser from 'cookie-parser';
import teacherRouter from './routh/Teacher.routh.js';
import Studentrouter from './routh/Student.js';
import { generateTokenAndSetCookie } from './utils/token.js';
import api from './controller/automaticImg.js';


const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: /*process.env.URL ||*/ /*"https://spiroedu.live"*/ "http://localhost:5173",
  // Your frontend domain
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(cookieParser());
app.use(express.json());

app.use('/api/v1', router);
app.use('/api/v1', teacherRouter);
app.use('/api/v1', Studentrouter);



app.listen(PORT, () => {
  connectDB();
  api();
  console.log(`Server is running on port ${PORT}`);
});