import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const pipeline = [];
  // Search video by title -> using regex for matching input query
  if (query) {
    pipeline.push({
      $match: {
        title: {
          $regex: query,
          $options: "i",
        },
      },
    });
  }
  // Search by userId
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Enter a valid user id");
    }
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }
  // Videos searched should be published
  pipeline.push({
    $match: {
      isPublished: true,
    },
  });

  // Sorting
  const sortOrder = sortType.toLowerCase() === "asc" ? 1 : -1;
  pipeline.push({
    $sort: sortBy ? { [sortBy]: sortOrder } : { createdAt: -1 },
  });

  // Add user details for the video owner
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "ownerDetails",
      pipeline: [
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers",
          },
        },
        {
          $addFields: {
            subscribersCount: { $size: "$subscribers" },
            isSubscribed: {
              $cond: {
                if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                then: true,
                else: false,
              },
            },
          },
        },
        {
          $project: {
            username: 1,
            avatar: 1,
            subscribersCount: 1,
            isSubscribed: 1,
          },
        },
      ],
    },
  });

  pipeline.push({
    $unwind: "$ownerDetails",
  });

  // Lookup likes and user details
  pipeline.push({
    $lookup: {
      from: "likes",
      localField: "_id",
      foreignField: "video",
      as: "likes",
      pipeline: [
        {
          $lookup: {
            from: "users",
            localField: "likedBy",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $project: {
            likedBy: 1,
            userDetails: {
              username: 1,
              avatar: 1,
            },
          },
        },
      ],
    },
  });

  // Lookup comments and commenter details
  pipeline.push({
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "video",
      as: "comments",
      pipeline: [
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "commenterDetails",
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "comment",
            as: "commentLikes",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "likedBy",
                  foreignField: "_id",
                  as: "userDetails",
                },
              },
              {
                $project: {
                  likedBy: 1,
                  userDetails: {
                    username: 1,
                    avatar: 1,
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            content: 1,
            createdAt: 1,
            commenterDetails: {
              username: 1,
              avatar: 1,
            },
            commentLikes: 1,
          },
        },
      ],
    },
  });

  // Add derived fields for likes and comments count
  pipeline.push({
    $addFields: {
      likesCount: { $size: "$likes" },
      commentCount: { $size: "$comments" },
      isLiked: {
        $cond: {
          if: { $in: [req.user?._id, "$likes.likedBy"] },
          then: true,
          else: false,
        },
      },
    },
  });

  // Create an aggregation instance
  const videoAggregate = Video.aggregate(pipeline);
  // Add pagination options
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  // Paginate results
  const videos = await Video.aggregatePaginate(videoAggregate, options);
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  // TODO: get video, upload to cloudinary, create video

  const videoFile = req.files?.videoFile?.[0]?.path;
  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }

  const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  if (!thumbnailPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  const uploadedVideo = await uploadOnCloudinary(videoFile);

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
    duration: uploadedVideo.duration,
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
  const { videoId } = req.params; //673ad9282f7264373470a368
  //TODO: get video by id
  // const video = await Video.findById(videoId);

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(400, "Invalid userId");
  }

  const video = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: {
                $size: "$subscribers",
              },
              isSubscribed: {
                $cond: {
                  if: { $in: [req.user?._id, "$subscribers.subscribers"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              "avatar.url": 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        "videoFile.url": 1,
        title: 1,
        description: 1,
        createAt: 1,
        duration: 1,
        views: 1,
        owner: 1,
        comments: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await Video.findByIdAndUpdate(videoId, {
    $inc: {
      views: 1,
    },
  });

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: {
      watchHistory: videoId,
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Id");
  }

  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "Title & description  are required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found.!!");
  }

  if (video?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't edit this video as you are not authorized user"
    );
  }

  const existingThumbnail = video.thumbnail.public_id;

  const newThumbnailPath = req.file?.path;

  if (!newThumbnailPath) {
    throw new ApiError(400, "Thumbnail is required");
  }
  const newThumbnail = await uploadOnCloudinary(newThumbnailPath);

  if (!newThumbnail) {
    throw new ApiError(400, "thumbnail not found");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: {
          public_id: newThumbnail.public_id,
          url: newThumbnail.url,
        },
      },
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Failed to update video please try again");
  }
  await deleteOnCloudinary(existingThumbnail);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid id");
  }

  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(400, "Invalid userId");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "You are not authorized to access this video");
  }

  //TODO: delete video
  const deletedVideo = await Video.findByIdAndDelete(video?._id);

  if (!deleteVideo) {
    throw new ApiError(
      400,
      "Failed to delete the video, please try again later"
    );
  }

  await deleteOnCloudinary(video.thumbnail.public_id);
  await deleteOnCloudinary(video.videoFile.public_id, "video");

  await Like.deleteMany({
    video: videoId,
  });
  await Comment.deleteMany({
    video: videoId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are not authorized to access this video");
  }

  const togglePublishedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { toggleStatus: togglePublishedVideo.isPublished },
        "Video publish status is toggled successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
