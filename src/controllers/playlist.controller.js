import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if ([name, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields are required");
  }

  const existingPlaylist = await Playlist.findOne({
    name: new RegExp(`^${name}$`, "i"),
  });
  if (existingPlaylist) {
    throw new ApiError(409, "Playlist already exists with this name");
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

// const getUserPlaylists = asyncHandler(async (req, res) => {
//   const { userId } = req.params;
//   //TODO: get user playlists
// });

// const getPlaylistById = asyncHandler(async (req, res) => {
//   const { playlistId } = req.params;
//   //TODO: get playlist by id
// });

// const addVideoToPlaylist = asyncHandler(async (req, res) => {
//   const { playlistId, videoId } = req.params;
// });

// const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
//   const { playlistId, videoId } = req.params;
//   // TODO: remove video from playlist
// });

// const deletePlaylist = asyncHandler(async (req, res) => {
//   const { playlistId } = req.params;
//   // TODO: delete playlist
// });

// const updatePlaylist = asyncHandler(async (req, res) => {
//   const { playlistId } = req.params;
//   const { name, description } = req.body;
//   //TODO: update playlist
// });

export {
  createPlaylist,
  //   getUserPlaylists,
  //   getPlaylistById,
  //   addVideoToPlaylist,
  //   removeVideoFromPlaylist,
  //   deletePlaylist,
  //   updatePlaylist,
};
