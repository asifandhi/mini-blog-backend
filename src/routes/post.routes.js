import { Router } from "express";
import { createPost } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/createpost").post(verifyJWT,upload.fields([
    {
        name :"imageOfPost",
        maxCount :1
    }
]),createPost)




export default router