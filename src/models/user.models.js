import mongoose, {Schema} from "mongoose";

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

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
        },
        refreshTokens : {
            type : String
        }
    },
    {
        timestamps : true
    }
)

// this is also middleware
userSchema.pre("save",async function() {
    // if password is not modified then do not hash it again
    if(!this.isModified("password")) ;
    this.password = await bcrypt.hash(this.password,10);
    
})

// for cheking the password
userSchema.methods.isPasswordIsCorrect = async function (password) {
    
    return await bcrypt.compare(password,this.password)
}

// for generating the Access token

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id : this._id,
            username : this.username,
            email : this.email,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRES_IN
        }
    )
}

// for generating the Refresh token

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    )
}

export const User = mongoose.model("User",userSchema);