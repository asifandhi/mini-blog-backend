import { Router } from "express"; 
import { DeleteUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route('/register').post(upload.fields([
    {
        name: "profilePhoto",
        maxCount: 1 
    }
]),registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/delete").delete(verifyJWT,DeleteUser)
router.route("/refreshtoken").post(refreshAccessToken)
export default router;