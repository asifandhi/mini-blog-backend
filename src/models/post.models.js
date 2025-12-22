import mongoose,{Schema} from "mongoose";

const postSchema = new Schema(
    {
        owner:{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true,
            index : true
        },
        title : {
            type : String,
            required : true,
            trim : true,
        },
        imageOfPost:{
            type : String,
            required : true,
        },
        likes :[
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            }
        ],
        comments :[
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Comment"
            }
        ]

    },
    {
        timestamps : true
    }
)

export const Post = mongoose.model("Post",postSchema);