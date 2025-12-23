import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinaryService.js';
import { ApiResponse} from '../utils/ApiResponse.js';

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
    

    return res
    .status(201)
    .json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )


    
})


const loginUser = asyncHandler(async (req,res) => {
    const { username,email,password} = req.body;

    if(!username && !email){
        throw new ApiError(400,"Username or email is required");
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User not found");
    }  

    const isPasswordCorrect = await user.isPasswordIsCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid credentials");
    }

    const {acesstoken,refreshtoken} = await GenerateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    );

    const options = {
        httpOnly: true,
        secure: true
    }

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

export { registerUser,
    loginUser 

};