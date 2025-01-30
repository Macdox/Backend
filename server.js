import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/database.js';
import cors from "cors";
import router from './routh/auth.routh.js';
import cookieParser from 'cookie-parser';
import teacherRouter from './routh/Teacher.routh.js';
import Studentrouter from './routh/Student.js';
import { generateTokenAndSetCookie } from './utils/token.js';
const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["*"], // Ensure this environment variable is set to your frontend domain
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/v1', router);
app.use('/api/v1', teacherRouter);
app.use('/api/v1', Studentrouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.post('/api/v1/', (req, res) => {
    console.log("Hello");
    console.log(req.cookies);
});

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});