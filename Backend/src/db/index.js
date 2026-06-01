import mongoose from "mongoose";    
import{ DB_NAME } from "../constants.js";


const connectDB = async() =>{

    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
        console.log(`\nMongo DB Connected.... \n\nDB Host : ${connectionInstance.connection.host} \nDB Name : ${connectionInstance.connection.name} \nDB Port : ${connectionInstance.connection.port}`);
        

    }
    catch(error){
        console.log(`Error in DB Connection : ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;   
