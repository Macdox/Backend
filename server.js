const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db/database');
const cors = require('cors');
const router = require('./routh/auth.routh.js');
const cookieParser = require('cookie-parser');
const teacherRouter = require('./routh/Teacher.routh.js');
const Studentrouter = require('./routh/Student.js');
const { generateTokenAndSetCookie } = require('./utils/token.js');

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