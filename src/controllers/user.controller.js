import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinaryService.js';
import { ApiResponse} from '../utils/ApiResponse.js';

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


export { registerUser };