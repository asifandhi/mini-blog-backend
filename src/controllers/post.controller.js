import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import{uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinaryService.js"
import jwt from "jsonwebtoken";
import { Post } from "../models/post.models.js";

const createPost = asyncHandler(async (req,res) => {

    const {title} = req.body
    if(!title){
        throw new ApiError(400,"Post title is required..")
    }
    
    const pathOfThePost = req.files?.imageOfPost[0]?.path;
    
    if(!pathOfThePost){
        throw new ApiError(400,"Post path is missing...")
    }
    
    const UploadImage = await uploadOnCloudinary(pathOfThePost)
    
    if(!UploadImage?.url){
        throw new ApiError(400,"Unable to upload the image on cloudinary")
    }
    const post = await Post.create({
        owner:req.user._id,
        title,
        imageOfPost:UploadImage.url
    });

    return res
    .status(201)
    .json(
        new ApiResponse(201,post,"Post created successfully")
    );
})

export {
    createPost
}