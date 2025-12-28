import { Router } from "express";
import { createPost, deletePost, getAllPost, getPostById } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/createpost").post(verifyJWT,upload.fields([
    {
        name :"imageOfPost",
        maxCount :1
    }
]),createPost)
router.route("/getallposts").get(verifyJWT,getAllPost)
router.route("/:postId").get(verifyJWT, getPostById);
router.route("/:postId").delete(verifyJWT, deletePost);



export default router