import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

//ye router user ko register kara rha hai
//uload is a middleware that takes two object => avatar, coverImage
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )     //router kh raha hai ki "/register" url par jao aur "registerUser" method call kar do

// router.route("/login").post(login)      // yhi par change hoga only aapko "app.js " mein jakar change karne ki jarurat nhi hai

export  default router;