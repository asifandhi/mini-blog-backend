import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinaryService.js';
import { ApiResponse} from '../utils/ApiResponse.js';
import { getPublicIdFromUrl } from '../utils/publicUrlEx.js';
import jwt from 'jsonwebtoken';

const GenerateAccessTokenAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const acesstoken = user.generateAccessToken();
        const refreshtoken = user.generateRefreshToken();

        user.refreshTokens = refreshtoken;
        await user.save({validateBeforeSave : false});


        return {acesstoken,refreshtoken}
    } catch (error) {
        throw new ApiError(500,"Unable to generate tokens");
        
    }
}

const registerUser = asyncHandler(async (req, res) => {
    
    // Get the user data from the request body
    console.log("\nStarting user registration... : %0");
    
    const { username,fullname,email,password } = req.body;
    
    if([username,fullname,email,password].some((feild) => feild?.trim() === "")){
        throw new ApiError(400,"All feilds are required");
    }

    const CheckUserExist = await User.findOne({
        $or : [{username},{email}]
    })

    if(CheckUserExist){
        throw new ApiError(409,"User with given username or email already exist");
    }

    const PathForProifilePhtoto = req.files?.profilePhoto[0]?.path;

    if(!PathForProifilePhtoto){
        throw new ApiError(400,"Profile photo is required");
    }

    const profilePhoto = await uploadOnCloudinary(PathForProifilePhtoto);
    
    
    if(!profilePhoto){
        throw new ApiError(500,"Unable to upload profile photo");
    }
    console.log("Registration 75%\n");

    // Create a new user
    
    const user = await User.create({
        username : username.toLowerCase(),
        fullname,
        email,
        password,
        profilePhoto: profilePhoto.url
        
    })
    
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    );
    
    
    if(!createdUser){
        throw new ApiError(500,"Unable to create user");
    }

    console.log("Registration 100%\n");
    

    return res
    .status(201)
    .json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )


    
})


const loginUser = asyncHandler(async (req,res) => {
    console.log("\nStart to login...0%\n");
    const { username,email,password} = req.body;
    
    if(!username && !email){
        throw new ApiError(400,"Username or email is required");
    }
    console.log("Login 30%\n");
    
    const user = await User.findOne({
        $or : [{username},{email}]
    })
    
    if(!user){
        throw new ApiError(404,"User not found");
    }  
    console.log("Login 60%\n");
    
    
    const isPasswordCorrect = await user.isPasswordIsCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid credentials");
    }
    console.log("Login 80%\n");
    

    const {acesstoken,refreshtoken} = await GenerateAccessTokenAndRefreshToken(user._id);
    console.log("tokens are generated");
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    );
    
    

    const options = {
        httpOnly: true,
        secure: true
    }
    console.log("Login 100%\n");
    
    
    return res
    .status(200)
    .cookie("refreshToken",refreshtoken,options)
    .cookie("accessToken",acesstoken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,
                acesstoken,
                refreshtoken
            },
            "User logged in successfully"
        )
    )

    
})

const logoutUser = asyncHandler(async (req,res) => {
    console.log("starting to Login Out\n ---------\n E-mail : ",req.user.email,"logging out 0%\n");
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshTokens : undefined
            },

        },
        {
            new : true
        }
    );
    console.log("User logged out 80%\n");

    const options = {
        httpOnly: true,
        secure: true
    }
    console.log("User logged out 100%\n");
    return res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(
        new ApiResponse(200,{},"User logged out successfully")
    )
});

const DeleteUser = asyncHandler(async (req,res) => {
    console.log("\nStarting to delete user :",req.user.username,"\n");

    const { password,confirmPassword} = req.body;
    if(!password || !confirmPassword){
        throw new ApiError(400,"Password and confirm password are required");
    }
    console.log("Delete user 30%\n");
    
    if(password !== confirmPassword){
        throw new ApiError(400,"Password and confirm password do not match");
    }
    
    console.log("Delete user 60%\n");
    const userWithPassword = await User.findById(req.user._id).select("+password");

    const isPasswordCorrect = await userWithPassword.isPasswordIsCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid password");
    }
    
    

    const PathOfProfilePhoto =  req.user.profilePhoto;

    
    console.log("Delete user 80%\n");
    
    
    if(!PathOfProfilePhoto){
        throw new ApiError(400,"Path of Profile photo  is required");
    }

    const PublicId = getPublicIdFromUrl(PathOfProfilePhoto);
    console.log("Delete user 90%\n");
    

    // const DeletePhotoFromTheCloudinary = await deleteFromCloudinary(PathOfProfilePhoto ? PublicId : null);
    const DeletePhotoFromTheCloudinary = await deleteFromCloudinary(PublicId );
    
    
    if(!DeletePhotoFromTheCloudinary){
        throw new ApiError(500,"Unable to delete profile photo from cloudinary");
    }
    console.log("Delete user 95%\n");

    await User.findByIdAndDelete(req.user._id);

    console.log("Delete user 100%\n");

    return res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(
        new ApiResponse(200,{},"User deleted successfully")
    )
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh token is required");
    }
    try {
        const decoded = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded?._id);

        if(!user){
            throw new ApiError(404,"User not found");
        }

        if(user?.refreshTokens !== incomingRefreshToken){
            throw new ApiError(401,"Invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const {accesstoken,newRefreshToken} = await GenerateAccessTokenAndRefreshToken(user._id);

        return res
        .status(200)
        .cookie("refreshToken",newRefreshToken,options)
        .cookie("accessToken",accesstoken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accesstoken,refreshtoken : newRefreshToken
                },
                "Access token refreshed successfully"
            )
        )

    } catch (error) {

        throw new ApiError(401,error?.message || "Invalid refresh token");
        
    }
})


export { 
    registerUser,
    loginUser,
    logoutUser,
    DeleteUser,
    refreshAccessToken

};