import express from 'express';
import dotenv from 'dotenv';
import connectDB  from './db/database.js';

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})