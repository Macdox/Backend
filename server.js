import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/database.js';
import cors from 'cors';
import router from './routh/auth.routh.js';
import cookieParser from 'cookie-parser';
import teacherRouter from './routh/Teacher.routh.js';
import Studentrouter from './routh/Student.js';
import { generateTokenAndSetCookie } from './utils/token.js';

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  // Your frontend domain
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(cookieParser());
app.use(express.json());

app.use('/api/v1', router);
app.use('/api/v1', teacherRouter);
app.use('/api/v1', Studentrouter);

app.post('/api/v1/', (req, res) => {
  console.log("Hello");
  console.log(req.cookies);
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});