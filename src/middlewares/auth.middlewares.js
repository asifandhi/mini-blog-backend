import {User } from "../models/user.models.js";
import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req,res,next) => {
    try {

        console.log("\nVerifying JWT token... 0%\n");


        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        
        if(!token){
            throw new ApiError(401,"Unauthorized access, no token found");
        }
        console.log("Token found 50%\n");
        
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        console.log("Token verified 80%\n");
        
        const user = await User.findById(decoded?._id).select("-password -refreshTokens");
        
        if(!user){
            throw new ApiError(401,"Unauthorized access, user not found");
        }   
        console.log("User found 100%\n");
        
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401,"Unauthorized access, invalid token");
        
    }
})