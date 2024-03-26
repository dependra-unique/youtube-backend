import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import ApiResponse from '../utils/ApiResponse.js'
 

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
    const existedUser = User.fieldOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "Already exists user with this username or email")
    }
    

    //4. check for images, avatar is required      //ye images user ne di hai ya nhi ye check karna hai
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is required")
    }


    //5. upload them to cloudinary,
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400, "avatar file is required");
    }


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


    //8. remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    //9. check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong! while registering the user")
    }


    //10. return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User successfully registered")
    )

})

export {registerUser}