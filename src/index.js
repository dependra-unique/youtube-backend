// require('dotenv').config({path: '../env'})     //inconsistency ki vajah se ese use nhi kar rhe hai
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import app from './app.js';


dotenv.config({
    path: './.env'
})



connectDB()
.then(() => {

    //ye listen se uppar eslia likha gya hai because ydi port par listen karne mein koi problem aayi to , listen karne se phle error aayi hai ya nhi ye check karna padega
    app.on("error", (error) => {
        console.log("your app is not able to talk with database !!! error: ", error);
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`app is running at port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Database connection failed", error);
})













/*
import express from 'express';
const app = express();

//this syntax called iffi => ()() ye function ko immidiately execute karta hai
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        //ydi port par listen karne mein koi error hai uske lia hai ye app.on("error", (error) => {console.log(error)})
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
