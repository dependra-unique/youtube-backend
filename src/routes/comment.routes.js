import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {addComment} from '../controllers/comment.controller.js'

const router = Router();

router.use(verifyJWT)    //verfy user hi comment kare
router.route("/addComment").post(addComment)



export default router