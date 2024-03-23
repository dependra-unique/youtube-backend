// require('dotenv').config({path: '../env'})     //inconsistency ki vajah se ese use nhi kar rhe hai
import dotenv from 'dotenv';
import connectDB from "./db/index.js";


dotenv.config({
    path: './env'
})



connectDB();













/*
import express from 'express';
const app = express();

//this syntax called iffi => ()() ye function ko immidiately execute karta hai
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error", (error) => {
            console.log("Your app is not able to talk with database, error:", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`app is listening on port ${process.env.PORT}`);
        })


    } catch (error) {
        console.log("Error :", error);
        throw error;
    }
})()

*/
