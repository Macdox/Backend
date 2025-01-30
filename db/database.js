import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try{
        console.log("Connecting to database...");
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Database connected: ${connection.connection.host}`);
    }
    catch(error){
        console.error(`Error in connection of database: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;