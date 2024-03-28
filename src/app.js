//express here
import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'

const app = express();


//ydi hume middleware use karna hai to app.use() method se hi middlewware ko use karte hai & configuration bhi isi tarah se karte hai
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//json format mein limited data send karna because ydi user unlimited data send karega to server cresh ho jayega
app.use(express.json({limit: "16kb"}))
//url mein jo spaces hote hai uske lia kyuki space ko %20 se replace karte hai
//multiple url ko encode karne ke lia "extended: true" use karte hai
app.use(express.urlencoded({extended: true, limit: "16kb"}))
//server par ydi koi file/photo rakhna hai to "static" configuration use karte hai esse "public assests" bhi khte hai
app.use(express.static("public"))
//cookies ko access karna & cookies ko set karna , user browser mein securely server side se => basically "CRUD" operation on cookies
app.use(cookieParser())      //user ne request kari hai cookies ke lia





//router import 
import userRouter from './routes/user.routes.js'



//routes deceleration
//standard practice  => "/api/v1/users"
app.use("/api/v1/users", userRouter);        //jaise hi user "/user" par jayega tabhi user apna saara control "userRouter" ko dedega          //http://localhost:8000/api/v1/users/register





export default app;

