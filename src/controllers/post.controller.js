import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import{uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinaryService.js"
import jwt from "jsonwebtoken";
import { Post } from "../models/post.models.js";
import { Comment } from "../models/comment.models.js";
import { getPublicIdFromUrl } from "../utils/publicUrlEx.js";

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

// chatGpt
const getAllPost = asyncHandler(async (req,res) => {
    
    const posts = await Post.find()
    .populate("owner","username fullname")
    .sort({createdAt : -1});

   

    return res
    .status(200)
    .json(
        new ApiResponse(200,posts,"Posts fetched successfully")
    )
})

const getPostById = asyncHandler(async (req,res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId)
    .populate("owner","username fullname")

    if(!post){
        throw new ApiError(400,"Unable to fetch the post ")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,post,"Post fetched successfully")
    )
})

const deletePost = asyncHandler(async (req,res) => {
    const { postId } = req.params;
    
    const post = await Post.findById(postId)
    
    if(!post){
        throw new ApiError(400,"Unable to fetch the post ")
    }

     if (!post.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not allowed to delete this post");
    }

    const publicId = getPublicIdFromUrl(post.imageOfPost)
    const deletionOfPost = await deleteFromCloudinary(publicId)

    if(!deletionOfPost){
        throw new ApiError(400,"Unable to deletion of the post from clodinari")
    }
    
    const deleteAtTheDB = await post.deleteOne()
    
    if(!deleteAtTheDB){
        throw new ApiError(400,"Unable to deletion from DB")

    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Post deleted successfully")
    );

})


export {
    createPost,
    getAllPost,
    getPostById,
    deletePost
}