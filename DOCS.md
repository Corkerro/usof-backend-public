# USOF-BACKEND API Documentation

## Overview
This is a comprehensive REST API for a User-Generated Content platform (similar to Stack Overflow) that provides authentication, user management, posts, comments, categories, favorites, and subscriptions functionality.

**ADMIN URL:** `http://localhost:3000/admin`
**Base URL:** `http://localhost:3000/api`

## Table of Contents
- [Authentication](#authentication)
- [Sessions](#sessions)
- [Users](#users)
- [Posts](#posts)
- [Categories](#categories)
- [Comments](#comments)
- [Favorites](#favorites)
- [Subscriptions](#subscriptions)

## Authentication

### Register
```
POST /auth/register
```
**Body:**
```json
{
  "login": "user5",
  "email": "user5@example.com",
  "password": "12345"
}
```

### Login
```
POST /auth/login
```
**Body:**
```json
{
  "login": "testuser23@gmail.com",
  "password": "12345"
}
```

### Logout
```
POST /auth/logout
```

### Password Recovery

#### Request Password Reset
```
POST /auth/password-reset
```
**Body:**
```json
{
  "login": "user5"
}
```

#### Reset Password
```
POST /auth/password-reset/{token}
```
**Body:**
```json
{
  "newPassword": "12345"
}
```

### Email Verification

#### Verify Email
```
GET /auth/verify-email?token={token}
```

#### Resend Verification
```
POST /auth/resend-verification
```
**Body:**
```json
{
  "login": "testuser23"
}
```

## Sessions

### Get All Sessions
```
GET /sessions
```

### Get Current Session
```
GET /sessions/current
```

### Delete Specific Session
```
DELETE /sessions/{sessionId}
```

### Delete Other Sessions
```
DELETE /sessions/others
```

## Users

### Get All Users
```
GET /users/
```

### Get User by ID
```
GET /users/{userId}
```

### Create User (Admin)
```
POST /users/
```
**Body:**
```json
{
  "login": "testuser2312",
  "password": "12345",
  "passwordConfirmation": "12345",
  "email": "testuser2312@gmail.com",
  "roleId": 2
}
```

### Update User
```
PATCH /users/{userId}
```
**Body:**
```json
{
  "full_name": "Roman Osinnii"
}
```

### Confirm Email Change
```
POST /users/{userId}/confirm-email-change
```
**Body:**
```json
{
  "token": "13d775300eee43d3f011d0e796c4eb08"
}
```

### Change Avatar
```
PATCH /users/avatar
```
**Body:** Form-data with `avatar` file field

### Delete User
```
DELETE /users/{userId}
```

### Confirm User Deletion
```
POST /users/{userId}/confirm-deletion
```
**Body:**
```json
{
  "token": "0ecac01285f377ec74361b801beb34ee5994b91b6fda8fac44d1255779c5d6b0"
}
```

### User Recovery Request
```
POST /users/recovery
```
**Body:**
```json
{
  "email": "user5@example.com"
}
```

## Posts

### Get All Posts
```
GET /posts?page=1&pageSize=10
```
**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page

### Get Post by ID
```
GET /posts/{postId}
```

### Get My Posts
```
GET /posts/mine
```

### Create Post
```
POST /posts
```
**Body:** Form-data with the following fields:
- `title` (text): Post title
- `content` (text): Post content (supports HTML with embedded images)
- `categoryIds` (text): JSON array of category IDs, e.g., `"[1,2]"`
- `images` (file, optional): Image files to upload

**Example:**
```
title: "Test title"
content: "This is my post <br><img src=\"temp\"><br> with images"
categoryIds: "[1,2]"
images: [file upload]
```

### Update Post
```
PATCH /posts/{postId}
```
**Body:**
```json
{
  "title": "Updated post title",
  "status": "inactive",
  "categoryIds": [1]
}
```

### Delete Post
```
DELETE /posts/{postId}
```

### Post Comments

#### Get All Comments for Post
```
GET /posts/{postId}/comments
```

#### Add Comment to Post
```
POST /posts/{postId}/comments
```
**Body:**
```json
{
  "content": "Test comment 2"
}
```

### Post Categories

#### Get Categories by Post ID
```
GET /posts/{postId}/categories
```

#### Update Categories for Post (Replace all)
```
PATCH /posts/{postId}/categories/
```
**Body:**
```json
{
  "categoryIds": [3]
}
```

#### Add Categories to Post
```
POST /posts/{postId}/categories/add
```
**Body:**
```json
{
  "categoryIds": [1]
}
```

### Post Likes

#### Get Post Likes
```
GET /posts/{postId}/like
```

#### Add Like to Post
```
POST /posts/{postId}/like
```
**Body:**
```json
{
  "value": -1
}
```
*Note: `value` can be `1` (like) or `-1` (dislike)*

#### Delete Post Like
```
DELETE /posts/{postId}/like
```

## Categories

### Get All Categories
```
GET /categories?page=1&pageSize=10&sort=desc
```
**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `sort` (optional): Sort order (`asc` or `desc`)

### Get Category by ID
```
GET /categories/{categoryId}
```

### Get Posts with Category
```
GET /categories/{categoryId}/posts
```

### Create Category
```
POST /categories
```
**Body:**
```json
{
  "name": "Programming3",
  "slug": "programming3",
  "description": "programming"
}
```

### Update Category
```
PATCH /categories/{categoryId}
```
**Body:**
```json
{
  "name": "Programming",
  "slug": "programming",
  "description": "programming"
}
```

### Delete Category
```
DELETE /categories/{categoryId}
```

## Comments

### Get Comment by ID
```
GET /comments/{commentId}
```

### Update Comment
```
PATCH /comments/{commentId}
```
**Body:**
```json
{
  "content": "Updated comment content"
}
```

### Delete Comment
```
DELETE /comments/{commentId}
```

### Comment Likes

#### Get Comment Likes
```
GET /comments/{commentId}/like
```

#### Add Like to Comment
```
POST /comments/{commentId}/like
```
**Body:**
```json
{
  "value": 1
}
```
*Note: `value` can be `1` (like) or `-1` (dislike)*

#### Delete Comment Like
```
DELETE /comments/{commentId}/like
```

## Favorites

### Get My Favorites
```
GET /favorites/me
```

### Add Post to Favorites
```
POST /favorites/posts/{postId}
```

### Remove Post from Favorites
```
DELETE /favorites/posts/{postId}
```

## Subscriptions

### Get My Subscriptions
```
GET /subscriptions/me/posts
```

### Subscribe to Post
```
POST /subscriptions/posts/{postId}
```

### Unsubscribe from Post
```
DELETE /subscriptions/posts/{postId}
```

## Authentication & Authorization

Most endpoints require authentication. The API uses session-based authentication:

1. **Login** using `/auth/login` endpoint
2. **Session cookies** are used to maintain authentication state
3. **Logout** using `/auth/logout` endpoint to destroy the session

### User Roles
The API supports different user roles with varying permissions:
- **Regular users**: Can create posts, comments, manage their own content
- **Administrators**: Can manage all content and create users with specific roles

## File Upload Support

The API supports file uploads for:
- **User avatars** via `PATCH /users/avatar`
- **Post images** via `POST /posts` (supports multiple image uploads)

File uploads use `multipart/form-data` encoding.

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Set up environment variables** (database, email, etc.)
4. **Run migrations** to set up the database
5. **Start the server:** `npm start`
6. **API will be available at:** `http://localhost:3000/api`

## Database Schema

The API uses a relational database with the following main entities:
- **Users** - User accounts and profiles
- **Posts** - User-generated content posts
- **Comments** - Comments on posts
- **Categories** - Post categorization
- **Likes** - Like/dislike system for posts and comments
- **Favorites** - User's favorite posts
- **Subscriptions** - Post subscription system for notifications
- **Sessions** - User authentication sessions

## Features

- ✅ **User Authentication & Authorization**
- ✅ **Email Verification & Password Recovery**
- ✅ **Session Management**
- ✅ **User Profile Management**
- ✅ **Post Creation & Management**
- ✅ **Image Upload for Posts**
- ✅ **Comment System**
- ✅ **Category System**
- ✅ **Like/Dislike System**
- ✅ **Favorites System**
- ✅ **Subscription System**
- ✅ **File Upload (Avatar & Post Images)**
- ✅ **Pagination Support**
- ✅ **Rich Content Support (HTML in posts)**

## API Usage Examples

### Creating a Post with Images
```bash
curl -X POST http://localhost:3000/api/posts \
  -F "title=My Post with Images" \
  -F "content=This is my post <br><img src=\"temp\"><br> with images" \
  -F "categoryIds=[1,2]" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png"
```

### Liking a Post
```bash
curl -X POST http://localhost:3000/api/posts/1/like \
  -H "Content-Type: application/json" \
  -d '{"value": 1}'
```

### Adding to Favorites
```bash
curl -X POST http://localhost:3000/api/favorites/posts/1
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request