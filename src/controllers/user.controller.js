import asyncHandler from "../utils/asyncHandler.js";
 

const registerUser = asyncHandler( async (req, res) => {
    // //for checking purpose
    // res.status(200).json(
    //    { 
    //     message: "OK",
    //     }
    // )


    //get user details from frontend
    //validation - not empty (and other validation which is required for our application ,,,,ye sabhi validations humere upar hai)
    //check if user already exits: (check it through username, email)
    //check for images, avatar
    //upload them to cloudinary,
    //check avatar is uploaded successfully on cloudinary , if yes then
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

})

export {registerUser}