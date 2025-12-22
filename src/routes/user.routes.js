import { Router } from "express"; 
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js"

const router = Router();

router.route('/register').post(upload.fields([
    {
        name: "profilePhoto",
        maxCount: 1 
    }
]),registerUser)

export default router;