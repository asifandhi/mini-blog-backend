import mongoose from "mongoose";    
import{ DB_NAME } from "../constants.js";


const connectDB = async() =>{

    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
        console.log(`\n Mongo DB Connected . \n DB Host : ${connectionInstance}`);
        console.log(`\n${connectionInstance.connection.host}`);
        

    }
    catch(error){
        console.log(`Error in DB Connection : ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;   
