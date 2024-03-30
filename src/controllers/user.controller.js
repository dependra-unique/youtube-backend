import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import ApiResponse from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken';
import { mongo } from "mongoose";


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
    if(!email && !username){
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
            $unset: {
                refreshToken: 1  //this removes the fields from documents
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
    .json(new ApiError(200, {}, "user logged out"))
})


const refreshAccessToken = asyncHandler( async (req, res) => {

    //sabse phle user se refresh token lene padega => "refreshToken" ko hum cookies se le sekte hai kyuki user ne request mein hume refreshToken diya tha
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;

    if(!incommingRefreshToken){
        throw new ApiError(401, "unauthorised user")
    }

   try {
     //ab hume incommingRefreshToken ko verfy karana hoga ,,kyuki aceessToken & refreshToken dono ek hi tarah se ban rhe hai
     const decodedRefreshToken = jwt.verify(
         incommingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
     if(!decodedRefreshToken){
         throw new ApiError(401, "refresh token not decoded , something went wrongor or may be in env file")
     }
 
     //ab humare pass "decodedRefreshtoken" aa gya hai to iske pass "_id" ka access hai 
     //ab database se query karke user find karo
     const user = await User.findById(decodedRefreshToken?._id)
     if(!user){
         throw new ApiError(401, "Invalid refresh token")
     }
 
     //matching "incommingRefreshToken" & database mein jo "user.refreshToken" hai usse
     if(incommingRefreshToken !== user?.refreshToken){
         throw new ApiError(401, "Refresh token is expired or used")
     }
 
     //ydi ye match ho gya hai, to generate kar do accessToken & refreshToken new
     const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
 
     //options bana lo cookies mein send karne ke lia
     const options = {
         httpOnly: true,
         secure: true
     }
 
     //response send kar do  "refreshToken" and "accessToken" ke sath
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(
        new ApiResponse(
         200,
         {accessToken, refreshToken: newRefreshToken},
         "refresh and access token successfully generate"
        )
     )
   } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token")
   }
})


const changeCurrentPassword = asyncHandler( async (req, res) => {
    //user se oldPassword and newPassword le lo update karne ke lia
    const {oldPassword, newPassword} = req.body
    //user tabhi password change kar sekta hai jab user database mein phle se hi login ho => cookies mein humne jo user object bheja tha "req.user" usse user find kar lo database se
    const user = await User.findById(req.user?._id);
    //es user ka oldPassword check kar lo
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
   
    //if oldPassword is incurrect => throw error
    if(!isPasswordCorrect){
        throw new ApiError(404, "inCurrect password")
    }

    //if oldPassword is currect then set newPassword
    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password changed successfully"
    ))

})


const getCurrentUser = asyncHandler( async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "current user fetched successfully"
    ))
})


const updateAccountDetails = asyncHandler( async (req, res) => {
    const {fullName, email} = req.body;    //user se fullName & email lelo

    if(!fullName || !email){
        throw new ApiError(404, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,                //we can write "fullName: fullName"
                email                    //we can write "email: email"
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "account details successfully updated"));

})


const updateUserAvatar = asyncHandler( async (req, res) => {
    const avatarLocalPath = req.file?.url

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400, "Error in avatar file while uploading on cloudinary")
    }

    //TODO: Delete old Image - Assignment
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
           $set: {
                avatar: avatar.url
           }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "avatar image file uploaded successfully")
    )
})


const updateUserCoverImage = asyncHandler( async (req, res) => {
    const coverImageLocalPath = req.file?.url
    if(!coverImageLocalPath){
        throw new ApiError(400, "cover image not found")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error in uploading cover image on cloudinary")
    }

    //TODO: Delete old Image - Assignment
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "cover image file uploaded successfully")
    )
})


const getUserChannelProfile = asyncHandler( async (req, res) => {
    //profile nikalne ke lia user ko url hit karna padega => req.params
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(404, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {              //user ne mera channel subscribe kar rakha hai ya nhi 
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {            //project ke andar vo information likhte hai jo information hume user ko dikhana hai => (only flag true karte hai "1")
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])


    if(!channel?.length){
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "user channel fetched successfully")
    )

})

const getWatchHistory = asyncHandler( async (req, res) => {

    const user = await User.aggregate([
        {   //aggregate pipelins ke andar mongoose kamm nhi karta islia database mein se user id string se nikal kar di hai
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",

                pipeline: [     //sub-pipeline    ==> if not understand then go to video
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",

                            pipeline: [
                                {
                                    $project: {
                                        fullName,
                                        username,
                                        avatar
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                                
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            user[0].watchHistory, 
            "watch history fetched successfully"
        )
    )
})

export { 
    registerUser,
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}