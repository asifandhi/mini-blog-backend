import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { Post } from "../models/post.models.js";
import { Comment } from "../models/comment.models.js";

const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;
  console.log(comment);

  if (!comment?.trim()) {
    throw new ApiError(400, "Commnet not found");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "post not found");
  }

  const newComment = await Comment.create({
    comment,
    commenter: req.user._id,
    post: postId,
  });

  post.comments.push(newComment._id);

  await post.save();

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "commnet added successfully..."));
});

const deleteCommnet = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!comment.commenter.equals(req.user._id)) {
    throw new ApiError(403, "You are not allowed to delete this comment");
  }

  const removeCommnetFromPostArray = await Post.findByIdAndUpdate(
    comment.post,
    {
      $pull: { comments: comment._id },
    }
  );
  if (!removeCommnetFromPostArray) {
    throw new ApiError(400, "Unable to remove  commnet from the post array ");
  }

  const deletionOfA_Commnet = await Comment.findByIdAndDelete(commentId);
  if (!deletionOfA_Commnet) {
    throw new ApiError(400, "Unable to delete the commnet from DB");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Commnet deleted successfully "));
});

export { addComment, deleteCommnet };
