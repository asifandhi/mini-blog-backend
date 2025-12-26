import { Router } from "express"; 
import { changePassword, DeleteUser, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateDetails, updateProfilePhoto } from "../controllers/user.controller.js";
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
router.route("/changepassword").post(verifyJWT,changePassword)
router.route("/getcurrentuser").get(verifyJWT,getCurrentUser)
router.route("/updateaccount").post(verifyJWT,updateDetails)
router.route("/updatePphoto").post(verifyJWT, upload.fields([
    {
        name: "profilePhoto",
        maxCount: 1 
    }

]),updateProfilePhoto)
export default router;