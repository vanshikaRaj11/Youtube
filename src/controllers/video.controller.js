import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  // TODO: get video, upload to cloudinary, create video

  const videoFileData = req.files?.videoFile?.[0]?.path;

  if (!videoFileData) {
    throw new ApiError(400, "Video file is required");
  }
  // const videoFilePath = videoFileData.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  console.log(thumbnailPath);
  if (!thumbnailPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  // const thumbnailPath = thumbnailData.path;

  const uploadedVideo = await uploadOnCloudinary(videoFileData);

  const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath);

  if (!uploadedVideo) {
    throw new ApiError(400, "Video file is not found.");
  }
  if (!uploadedThumbnail) {
    throw new ApiError(400, "Thumbnail file is not found");
  }

  const newVideo = await Video.create({
    title,
    description,
    duration: videoFile.duration,
    videoFile: {
      url: uploadedVideo.url,
      public_id: uploadedVideo.public_id,
    },
    thumbnail: {
      url: uploadedThumbnail.url,
      public_id: uploadedThumbnail.public_id,
    },
    owner: req.user._id,
    isPublished: false,
  });
  const video = await Video.findById(newVideo._id);

  if (!video) {
    throw new ApiError(500, "Video upload failed please try again !!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Uploaded Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
