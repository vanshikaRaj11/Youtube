
# YouTube Backend Server
A boilerplate/starter project for building a scalable backend for a YouTube-like platform. This backend uses Node.js, Express, and MongoDB and comes with features like JWT-based authentication, video management, user management, comment handling, and API documentation.

By running a single command, you'll have a production-ready backend server installed and configured for your YouTube-like platform. For more details, check the features section below.

# Features
Video Management: Upload, edit, delete, and retrieve videos.
User Authentication: Secure login/signup using JWT.
Comments and Likes: Comment on videos and like/dislike them.
Playlists: Create and manage playlists.
Subscriptions: Subscribe to channels and get updates.
Error Handling: Centralized error handling with custom messages.
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

Modify the .env file with your own configurations:

`PORT=3000`
`MONGODB_URL=mongodb://127.0.0.1:27017/youtube-backend`
`CORS_ORIGIN=*`
`ACCESS_TOKEN_SECRET=your-secret-key`
`ACCESS_TOKEN_EXPIRY=1d`
`REFRESH_TOKEN_SECRET=your-secret-key`
`REFRESH_TOKEN_EXPIRY=10d`
`CLOUDINARY_CLOUD_NAME=your-secret-key`
`CLOUDINARY_API_KEY=your-api-key`
`CLOUDINARY_API_SECRET=your-api-secret`
## Installation

Install my-project with npm

```bash
  npm install my-project
  cd my-project
```

Clone the Repository

```bash
https://github.com/vanshikaRaj11/Youtube.git
```
Install dependencies

```bash
 npm install 
```
### Commands

Running locally:

```bash
npm run dev
```

## YouTube Backend API Endpoints



### Authentication

| Endpoint                  | Method | Description                           |
|---------------------------|--------|---------------------------------------|
| `/users/register`          | POST   | Register a new user                  |
| `/users/login`             | POST   | Login user                           |
| `/users/logout`            | POST   | Logout user (secured route)          |
| `/users/refresh-token`     | POST   | Refresh access token                 |
| `/users/change-password`   | POST   | Change user password (secured route) |
| `/users/get-user`          | GET    | Get current user details (secured)   |
| `/users/update-profile`    | PATCH  | Update user profile (secured)        |
| `/users/update-avatar`     | PATCH  | Update user avatar (secured)         |
| `/users/update-coverImage` | PATCH  | Update user cover image (secured)    |

### User Channels

| Endpoint                  | Method | Description                           |
|---------------------------|--------|---------------------------------------|
| `/users/channel/:username` | GET    | Get user channel details (secured)    |

### User Watch History

| Endpoint                  | Method | Description                           |
|---------------------------|--------|---------------------------------------|
| `/users/history`           | GET    | Get user watch history (secured)      |


### Videos

| Endpoint                     | Method | Description                           |
|------------------------------|--------|---------------------------------------|
| `/videos/`                   | GET    | Get all videos                       |
| `/videos/`                   | POST   | Publish a new video                  |
| `/videos/:videoId`           | GET    | Get video by ID                      |
| `/videos/:videoId`           | DELETE | Delete a video                       |
| `/videos/:videoId`           | PATCH  | Update video (thumbnail update)      |
| `/videos/toggle/publish/:videoId` | PATCH  | Toggle video publish status          |

### Comments

| Endpoint                                | Method | Description                           |
|-----------------------------------------|--------|---------------------------------------|
| `/comments/:videoId`                   | POST   | Add a comment to a video              |
| `/comments/c/:commentId`               | DELETE | Delete a comment                      |
| `/comments/c/:commentId`               | PATCH  | Update a comment                      |
| `/comments/updateComment/:commentId`   | PATCH  | Update a comment                      |

### Playlists

| Endpoint                                      | Method | Description                                  |
|-----------------------------------------------|--------|----------------------------------------------|
| `/playlists/`                                 | POST   | Create a new playlist                       |
| `/playlists/:playlistId`                      | GET    | Get playlist details by ID                  |
| `/playlists/:playlistId`                      | PATCH  | Update playlist details                     |
| `/playlists/:playlistId`                      | DELETE | Delete a playlist                           |
| `/playlists/add/:videoId/:playlistId`         | PATCH  | Add a video to a playlist                   |
| `/playlists/remove/:videoId/:playlistId`      | PATCH  | Remove a video from a playlist              |
| `/playlists/user/:userId`                     | GET    | Get all playlists for a user                |

### Likes

| Endpoint                               | Method | Description                             |
|----------------------------------------|--------|-----------------------------------------|
| `/likes/toggle/v/:videoId`             | POST   | Toggle like for a video                 |
| `/likes/toggle/c/:commentId`           | POST   | Toggle like for a comment               |
| `/likes/likedVideos`                   | GET    | Get all liked videos for a user         |

### Subscriptions

| Endpoint                                | Method | Description                           |
|-----------------------------------------|--------|---------------------------------------|
| `/subscriptions/channel/:channelId`    | GET    | Get all subscribers of a channel      |
| `/subscriptions/channel/:channelId`    | POST   | Subscribe or unsubscribe from a channel |
| `/subscriptions/user/:subscriberId`    | GET    | Get all channels a user is subscribed to |

### Dashboard

| Endpoint                               | Method | Description                            |
|----------------------------------------|--------|----------------------------------------|
| `/dashboard/stats`                     | GET    | Get channel stats                      |
| `/dashboard/videos`                    | GET    | Get all videos of a channel            |
