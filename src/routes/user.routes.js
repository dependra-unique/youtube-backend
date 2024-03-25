import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

//ye router user ko register kara rha hai
router.route("/register").post(registerUser)     //router kh raha hai ki "/register" url par jao aur "registerUser" method call kar do

// router.route("/login").post(login)      // yhi par change hoga only aapko "app.js " mein jakar change karne ki jarurat nhi hai

export  default router;