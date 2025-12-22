import mongoose from "mongoose";
    const CommentSchema = new mongoose.Schema(
        {
            comment :{
                type : String,
                required : true,
                trim : true,
                maxLength : 450
            },
            commenter : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User",   
        },
            post : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Post",   
        },
      
    },
    {
        timestamps : true
    }
)

export const Comment = mongoose.model("Comment",CommentSchema);