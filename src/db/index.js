import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'


const connectDB = async () => {
    try {
        // console.log(process.env.MONGODB_URI);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        // console.log(connectionInstance);
        console.log(`\n MONGODB connected !! DB Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Error in MONGODB connection", error);
        // kisi bhi app ko chalane ke lia ek process hota hai ye usi process ka reference hai 
        // exit, process ke andar method hota hai jo exit karta hai process ko
        process.exit(1);
    }
}


export default connectDB;