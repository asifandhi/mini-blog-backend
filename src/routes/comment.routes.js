import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { addComment, deleteCommnet } from "../controllers/comment.cotroller.js";

const router = Router();

router.route("/:postId").post(verifyJWT,addComment)
router.route("/:commentId").delete(verifyJWT,deleteCommnet)



export default router