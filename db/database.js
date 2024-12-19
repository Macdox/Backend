import mongoose from "mongoose";

const connectDB = async () => {
    try{
        console.log("Connecting to database...");
        const conection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected: ${conection.connection.host}`);
    }
    catch(error){
        console.error(`Error in conection of database: ${error.message}`);
        process.exit(1);
    }
};
export default connectDB;