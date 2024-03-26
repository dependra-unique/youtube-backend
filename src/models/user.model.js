import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

//database schema using mongoose 
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true 
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,   //cloudinary url
            required: true,

        },
        coverImage: {
            type: String,   //cloudinary url
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
         }  
    },
    {
        timestamps: true
    }
)

//password encrytion
//database ke userSchema mein ydi password save kar rhe ho to ,password save karne se phle password ko encrypt karo and then save karo
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})


//User model ko ydi hum kisi or file mein import karana chahte hai to us file mein bhi password encryted hona chahiye eslia compare kar lo import karne se phle hi
userSchema.methods.isPasswordCorrect = async function (password){

    return await bcrypt.compare(password, this.password)
}



//jwt uses => json web token
//access token
userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//refresh token
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);