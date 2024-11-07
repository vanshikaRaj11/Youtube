import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getUser,
  updateUser,
  updateAvatar,
  updateCoverImage,
  getUserChannelDetails,
  getUserWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJwt, changePassword);
router.route("/get-user").get(verifyJwt, getUser);
router.route("/update-profile").patch(verifyJwt, updateUser);
router
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateAvatar);
router
  .route("/update-coverImage")
  .patch(verifyJwt, upload.single("coverImage"), updateCoverImage);

router.route("/channel/:username").get(verifyJwt, getUserChannelDetails);

router.route("/history").get(verifyJwt, getUserWatchHistory);

export default router;
