import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Importing routes
import userRouter from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import likeRoutes from "./routes/like.route.js";
import subscriptionRoutes from "./routes/susbcription.route.js";
import playlistRoutes from "./routes/playlist.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import healthcheckRoutes from "./routes/healthcheck.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/healthcheck", healthcheckRoutes);

export { app };
