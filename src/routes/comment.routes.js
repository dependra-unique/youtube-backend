import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {addComment, updateComment, deleteComment} from '../controllers/comment.controller.js'

const router = Router();

router.use(verifyJWT)    //verfy user hi comment kare
router.route("/addComment").post(addComment)
router.route("/updateComment").post(updateComment)
router.route("/deleteComment").get(deleteComment)


export default router