import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

// router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/:commentId").delete(deleteComment).patch(updateComment);
router.route("/:videoId").post(addComment);
router.route("/:commentId").patch(verifyJwt, updateComment);
router.route("/getVideoComments/:videoId").get(verifyJwt, getVideoComments);

export default router;
