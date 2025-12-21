import dotenv from "dotenv"

import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

// this is enough for connection to the database

// connectDB()

// but for the this is async mthos this return the promiss so we can use then method


connectDB()
.then(()=>{
    // this is inly the connecton donr remining things is listening the app

    app.on("error",(err) =>{
        console.log("ERROR : ",err)
        throw err;
        
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port :  ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("Error while connecting to the database\n");
    console.log(err);
});