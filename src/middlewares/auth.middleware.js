import { User } from "../models/user.model";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { Jwt } from "jsonwebtoken";


//custom cookie => "request" ke andar "user" add karne ki custom cookie banayi hai ye (ye logout ke lia chahiye islia)
export const verifyJWT = asyncHandler(async (req, _, next) => {   // if do not use response, then we replace "res" to "_"(underscore)

    try {
        //hume phle accessToken chahiye => accessToken user ki request se milega (because user ne request mein cookie send ki hai)
        const token = req.cookies()?.accessToken || req.header("Authorization")?.replace("bearer ", "")
    
        //ydi token nhi ahi to error 
        if(!token){
            throw new ApiError(401, "unauthorized user")
        }
    
        //ydi token hai hai to ,, token se values lo secret key use karke
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        //database query karke user lo
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            //TODO: discuss about frontend
            throw new ApiError(401, "Invalid access token");
        }
    
        //ydi user mil gya hai to, "request" ke andar new object add kar do "user"
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }

})