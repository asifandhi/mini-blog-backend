import mongoose, {Schema} from "mongoose";

const userSchema = new Schema(
    {
        username :{
            type : String,
            required : true,
            unique : true,
            trim : true,
            index : true,
            minLength : 4,
            lowercase : true
        },

        fullname :{
            type : String,
            required : true,
            trim : true,
            maxLength : 20,
            index : true
        },

        email :{
            type : String,
            required : true,
            unique : true,
            trim : true,
            lowercase : true

        },
        profilePhoto:{
            type : String,
            required : true,
        },

        likedPosts : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Post"
            }
        ],

        password : {
            type : String,
            required : [true, "Password is required"],
            minLength : 8
        }
    },
    {
        timestamps : true
    }
)

export const User = mongoose.model("User",userSchema);