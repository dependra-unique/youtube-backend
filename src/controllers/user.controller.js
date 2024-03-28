import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import ApiResponse from '../utils/ApiResponse.js'
import { set } from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
   try {
     const user = await User.findById(userId);
     const accessToken = user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()
 
     user.refreshToken = refreshToken;
     await user.save({validateBeforeSave: false});         //ydi refreshToken save karege database mein to problem hogi beacuse password required hai (islia "validateBeforeSave: false" kar do iska matlab => save hone se phle validate mat karo)
 
     return {accessToken, refreshToken};
   } catch (error) {
        throw new ApiError(500, "something went wrong while generating the accessToken & refreshToken")
   }
}
 

const registerUser = asyncHandler( async (req, res) => {
    // //for checking purpose
    // res.status(200).json(
    //    { 
    //     message: "OK",
    //     }
    // )


    //1. get user details from frontend - (req.body se milega data)
    //2. validation - not empty (and other validation which is required for our application ,,,,ye sabhi validations humere upar hai)
    //3. check if user already exits: (check it through username, email)
    //4. check for images, avatar
    //5. upload them to cloudinary,
    //6. check avatar is uploaded successfully on cloudinary , if yes then
    //7. create user object - create entry in db
    //8. remove password and refresh token field from response
    //9. check for user creation
    //10. return response

   
    //1, get user details
    const {username, email, password, fullName} = req.body;
    console.log("email: ", email);
    console.log("password: ", password);
    // console.log(req.body);
    
    //2. check empty validation => for {username, email, password, fullName} 
    // if(fullName === ""){
    //     throw new ApiError(400, "All fields are required");
    // }

    if(
        [username, email, password, fullName].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }


    //3. check user is already exists or not in db
    const existedUser = await User.findOne({
        // $or: [{username}, {email}]
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "Already exists user with this username or email")
    }
    

    //4. check for images, avatar is required      //ye images user ne di hai ya nhi ye check karna hai
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is required")
    }

    // console.log(req.files);


    //5. upload them to cloudinary,
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400, "avatar file is required");
    }

    // console.log(avatar);
    // console.log(coverImage);

    //6. check avatar is uploaded successfully on cloudinary , if yes then
    //7. create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password,
    })

    // console.log(user);

    //8. remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    // console.log(createdUser);
    
    //9. check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong! while registering the user")
    }


    //10. return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User successfully registered")
    )

})


const loginUser = asyncHandler( async (req, res) => {
    //1. get user data => req.body
    //2. username or email 
    //3. find the user 
    //4. password check
    //5. access and refresh token 
    //6. send cookie(access & refresh token)

    const {username, email, password} = req.body;
    if(!email || !username){
        throw new ApiError(404, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "user does not exists");
    }

    const isPasswordValid = user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }


    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: accessToken, refreshToken, loggedInUser
            },
            "User logged in successfully"
        )
    )
})


const logoutUser = asyncHandler( async (req, res) => {
    //user ko database se hata do
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    //cookies ko bhi hata do
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, {}, "User logged out ")
})

export {registerUser, loginUser, logoutUser}