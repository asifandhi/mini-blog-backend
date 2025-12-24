import {User } from "../models/user.models.js";
import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req,res,next) => {
    try {

        console.log("Starting to verify through JWT");
        
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("bearer ","")
        
        if(!token){
            throw new ApiError(401,"Unauthorized access, no token found");
        }
        console.log("token found");
        
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        console.log("token Decoded");
        
        const user = await User.findById(decoded?._id).select("-password -refreshTokens");
        
        if(!user){
            throw new ApiError(401,"Unauthorized access, user not found");
        }   
        console.log("user found");
        
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401,"Unauthorized access, invalid token");
        
    }
})