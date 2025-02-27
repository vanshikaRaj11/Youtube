import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/susbcription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router
  .route("/channel/:channelId")
    .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/user/:subscriberId").get(getUserChannelSubscribers);

export default router;
