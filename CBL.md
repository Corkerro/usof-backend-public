# CBL Documentation: Forum Backend (USOF-like)

## Stage 1: Engage

**Challenge:**
Develop a backend for a USOF-like forum with user registration, posts, comments, likes, roles, and categories.

**Actions:**

-   Wrote **functional requirements**:
    -   Users: register, login, profile management, roles (user/admin)
    -   Posts: CRUD, filtering, sorting
    -   Comments: CRUD, moderation
    -   Likes: create, delete, view
    -   Categories: CRUD
-   Wrote **non-functional requirements**:
    -   Architecture: MVC, Node.js + Express, MySQL, OOP (SOLID)
    -   Security: bcrypt, sessions, role-based access
    -   Reliability, performance, usability, documentation

**Reflection:**
Clarified project scope and architecture; planning next steps is easier.

---

## Stage 2: Investigate

**Objective:**
Research and prepare the backend structure for the forum project according to the functional and non-functional requirements.

**Actions Taken:**

1. **Server and Database Setup**

-   Installed **Node.js** and **Express**.
-   Created **MySQL database** with tables for users, posts, comments, likes, categories, and roles.
-   Implemented **database initialization script** to populate sample/test data.
-   Ensured **MVC architecture** and SOLID principles in project structure.

2. **Admin Panel**

-   Installed **AdminJS** for admin panel interface.
-   Configured resources for **Users** and **Auth**, including:
    -   User creation, editing, and deletion
    -   Role management (user/admin)
    -   Login and registration endpoints
-   Tested admin access control to ensure only admins can manage all users.

3. **User, Auth and Session Endpoints**

-   Planned endpoints (2025-09-01):

    -   **POST /api/auth/register** — with unique login/email check and email verification
    -   **POST /api/auth/login** — for confirmed users
    -   **POST /api/auth/logout**
    -   **POST /api/auth/password-reset** and **POST /api/auth/password-reset/:confirm_token**
    -   **GET /api/users/:user_id** — view profile
    -   **PATCH /api/users/:user_id** — edit profile
    -   **PATCH /api/users/avatar** — upload avatar
    -   **DELETE /api/users/:user_id** — delete account

    **Update (2025-09-06): session management endpoints**

    -   **GET /api/sessions** — get all sessions except current
    -   **GET /api/sessions/current** — get current session
    -   **DEL /api/sessions/:id** — delete session by id
    -   **DEL /api/sessions/others** — delete all sessions except current

    **Update (2025-09-08): admin users endpoints**

    -   **POST /api/users** - login, password, password confirmation, email, role

    **Update (2025-09-08): user profile enhancements**

    -   rating and full name for user

-   Applied **bcrypt** for password hashing and **sessions** for authentication. (2025-09-01)
-   Added input validation for logins, emails, and passwords. (2025-09-01)
-   Added middleware for users and admins (2025-09-01)

-   **Additional Actions Taken (2025-09-10):**

    -   **Posts, Comments, Likes, and Categories Structure**
        -   Designed tables posts, comments, post_likes, comment_likes, categories with proper foreign key relationships.
        -   Implemented soft delete approach for posts and comments (deleted_at column).
        -   Field design:
            -   Post: author_id, title, content, status, categories
            -   Comment: author_id, post_id, content, status
            -   Like: user_id, post_id or comment_id, value
            -   Category: name, slug, description
    -   **Planned Resource Endpoints (2025-09-10)**

        -   Posts: GET /api/posts (with pagination), GET /api/posts/:post_id, POST /api/posts, PATCH /api/posts/:post_id, DELETE /api/posts/:post_id
        -   Comments: GET /api/posts/:post_id/comments, POST /api/posts/:post_id/comments
        -   Likes: GET /api/posts/:post_id/like, POST /api/posts/:post_id/like, DELETE /api/posts/:post_id/like
        -   Categories: GET /api/posts/:post_id/categories

    -   **File Uploads Planning**

        -   Implemented avatar upload with resizing and file type enforcement (PNG).
        -   Decided to store uploaded images in /uploads directory with consistent naming (username.png).
        -   Planned similar approach for post images.

    -   **Next Steps / Planning**
        -   Implement Post, Comment, Like, and Category modules in src/posts/ (service, repository, entity, controller).
        -   Implement file upload service for posts, following avatar upload pattern.
        -   Integrate soft delete support for posts and comments.
        -   Add validation and authorization: only post authors can update/delete their posts, only logged-in users can comment/like.

4. **Planned Functional Expansion**

-   **Posts**: CRUD operations, filtering, sorting
-   **Comments**: CRUD, active/inactive status
-   **Likes**: unique like/dislike per user for posts/comments
-   **Categories**: CRUD operations restricted to admin
-   Sorting and filtering posts by likes, date, category, and status
-   Optional features: favorites, subscriptions, image uploads, localization, tags

5. **Non-functional Implementations**

-   Error handling with informative messages.
-   Logging errors for debugging.
-   Asynchronous operations for database and file handling.
-   Pagination for large post sets.
-   API consistency: standard HTTP codes (200, 201, 400, 401, 403, 404, 500)

**Reflection:**

-   Successfully set up backend structure with database and initial user/auth functionality.
-   AdminJS makes managing users and roles convenient.
-   Learned how to integrate authentication, password reset, and secure storage.
-   Next steps: implement posts, comments, likes, and categories, including filtering, sorting, and additional optional features

---

## Stage 3: Act

**Actions Taken:**

-   Set up **Express server** and project structure (MVC pattern)
-   Created **MySQL database** and initialization scripts with sample data
-   Installed and configured **AdminJS** for admin panel
-   Implemented **User and Auth resources**:

    -   Registration (`POST /api/auth/register`) with email verification — implemented 2025-09-04
    -   Login (`POST /api/auth/login`) and logout (`POST /api/auth/logout`) — implemented 2025-09-04
    -   Password reset (`POST /api/auth/password-reset`) — implemented 2025-09-04
    -   Profile management (`GET /api/users/:user_id`, `PATCH /api/users/:user_id`) — implemented 2025-09-12
    -   Avatar upload (`PATCH /api/users/avatar`) — implemented 2025-09-06
    -   Account deletion (`DELETE /api/users/:user_id`) — implemented 2025-09-15
    -   Admin controls over all users — implemented 2025-09-02

    **Update (2025-09-06): Added session management endpoints**

    -   Session listing (`GET /api/sessions`) — implemented
    -   Current session (`GET /api/sessions/current`) — implemented
    -   Session deletion (`DELETE /api/sessions/:id`) — implemented
    -   Delete other sessions (`DELETE /api/sessions/others`) — implemented

-   Implemented **security measures**:

    -   Password hashing with **bcrypt**
    -   **Session-based authentication** (express-session)
    -   Role-based access control for admin/user
    -   Data validation for login, email, and profile inputs

-   **Update (2025-09-08): User Management Enhancements**

    -   Email change confirmations
        -   `POST /api/users/:id/confirm-email-change` to confirm email change
    -   User recovery system
        -   `POST /api/users/recovery` to request account recovery
        -   `POST /api/users/:id/confirm-deletion` to confirm account deletion
    -   Soft delete for users, posts, and comments

        -   Added a deleted_at TIMESTAMP NULL column to users, posts, and comments tables.
        -   All queries (findAll, findById, findByEmail, etc.) now return only records with deleted_at IS NULL.
        -   The delete repository method was changed:
            -   Previously: DELETE FROM ... (physical removal).
            -   Now: UPDATE ... SET deleted_at = NOW() (soft delete).
        -   Data is retained in the database for potential recovery, audit, or moderation, but invisible to regular users.
        -   Soft delete support has also been prepared for posts and comments.

-   **Actions Taken (2025-09-10 - 2025-09-18): Core Forum Features**

    -   **Post Management System**
        -   Created comprehensive Post module: entity, repository, service, controller.
        -   Implemented `GET /api/posts` with pagination and filtering
        -   Implemented `GET /api/posts/:post_id` with detailed post information
        -   Implemented `GET /api/posts/mine` to get current user's posts
        -   Implemented `POST /api/posts` for creating new posts
        -   Implemented `PATCH /api/posts/:post_id` for post updates (author/admin only)
        -   Implemented `DELETE /api/posts/:post_id` for post deletion (author/admin only)
        -   Added post status management (active/inactive)

    -   **Comment System (2025-09-14)**
        -   Implemented `GET /api/posts/:post_id/comments` to retrieve all comments for a post
        -   Implemented `POST /api/posts/:post_id/comments` to add comments to posts
        -   Implemented `GET /api/comments/:comment_id` for individual comment retrieval
        -   Implemented `PATCH /api/comments/:comment_id` for comment updates (author/admin only)
        -   Implemented `DELETE /api/comments/:comment_id` for comment deletion (author/admin only)
        -   Added comment moderation features

    -   **Like/Dislike System (2025-09-16)**
        -   Implemented `GET /api/posts/:post_id/like` to view post likes/dislikes
        -   Implemented `POST /api/posts/:post_id/like` to like/dislike posts (value: 1 or -1)
        -   Implemented `DELETE /api/posts/:post_id/like` to remove likes/dislikes
        -   Implemented `GET /api/comments/:comment_id/like` to view comment likes/dislikes
        -   Implemented `POST /api/comments/:comment_id/like` to like/dislike comments
        -   Implemented `DELETE /api/comments/:comment_id/like` to remove comment likes/dislikes
        -   Ensured one like/dislike per user per post/comment

    -   **Category Management System (2025-09-18)**
        -   Implemented `GET /api/categories` with pagination and sorting
        -   Implemented `GET /api/categories/:category_id` for individual category details
        -   Implemented `GET /api/categories/:category_id/posts` to get posts by category
        -   Implemented `POST /api/categories` for category creation (admin only)
        -   Implemented `PATCH /api/categories/:category_id` for category updates (admin only)
        -   Implemented `DELETE /api/categories/:category_id` for category deletion (admin only)
        -   Implemented `GET /api/posts/:post_id/categories` to get post categories
        -   Implemented `PATCH /api/posts/:post_id/categories` to update post categories
        -   Implemented `POST /api/posts/:post_id/categories/add` to add categories to posts

    -   **File Upload Handling**
        -   Extended avatar upload service for future post images.
        -   Enforced PNG format for avatars; images are resized to 256x256px using Sharp.
        -   File naming standardized to [username].png.

-   **Actions Taken (2025-09-20 - 2025-09-22): Advanced Features**

    -   **Favorites System (2025-09-20)**
        -   Implemented `GET /api/favorites/me` to get user's favorite posts
        -   Implemented `POST /api/favorites/posts/:post_id` to add posts to favorites
        -   Implemented `DELETE /api/favorites/posts/:post_id` to remove posts from favorites
        -   Added database relationships and constraints for favorites

    -   **Subscription System (2025-09-22)**
        -   Implemented `GET /api/subscriptions/me/posts` to get subscribed posts
        -   Implemented `POST /api/subscriptions/posts/:post_id` to subscribe to posts
        -   Implemented `DELETE /api/subscriptions/posts/:post_id` to unsubscribe from posts
        -   Added notification system preparation for future email notifications

    -   **Authentication & Authorization Improvements**
        -   Enhanced middleware for role-based access control
        -   Added author-only restrictions for post/comment modifications
        -   Implemented admin-only restrictions for category management and user administration
        -   Added comprehensive input validation across all endpoints

    -   **Database Optimizations**
        -   Optimized queries with proper indexing
        -   Implemented efficient pagination mechanisms
        -   Added foreign key constraints and referential integrity
        -   Enhanced soft delete implementation across all entities

**Current Status (2025-09-25):**

✅ **Completed Features:**
- Complete user authentication and authorization system
- Session management with multi-device support
- Post CRUD with pagination, filtering, and sorting
- Comment system with full CRUD operations
- Like/dislike system for both posts and comments
- Category management with admin controls
- Favorites system for bookmarking posts
- Subscription system for post notifications
- File upload system for avatars
- Soft delete implementation
- Email verification and password recovery
- Admin panel integration
- Comprehensive API documentation
- Image uploads for posts

🔄 **In Progress:**
- Performance optimizations and caching
- Enhanced error handling and logging
- API rate limiting implementation

📋 **Future Enhancements:**
- Real-time notifications via WebSocket
- Search functionality with full-text search
- User reputation system
- Post tagging system
- Localization support

**Reflection:**

-   Successfully implemented a full-featured forum backend with all planned core functionality
-   The MVC architecture and SOLID principles have proven maintainable and scalable
-   Session-based authentication provides robust security while remaining user-friendly
-   Soft delete implementation ensures data integrity while allowing content recovery
-   AdminJS integration significantly simplifies administrative tasks
-   The API is well-structured, documented, and ready for frontend integration
-   Learned valuable lessons about database design, security implementation, and API architecture
-   The project demonstrates proficiency in Node.js, Express, MySQL, and modern backend development practices

---

## Change Log

-   2025-09-01: Stage 1: Engage recorded
-   2025-09-01: Stage 2: Investigate: Base server and base database
-   2025-09-01: Stage 3: Act: adminjs installed
-   2025-09-03: Stage 3: Act: routes for authentication and email confirmation have been written
-   2025-09-04: Stage 3: Act: implemented user registration and login with email verification
-   2025-09-06: Stage 3: Act: added session management and avatar upload functionality
-   2025-09-08: Stage 3: Act: implemented soft delete (deleted_at) for users, posts, and comments
-   2025-09-10: Stage 3: Act: completed post management system with CRUD operations
-   2025-09-12: Stage 3: Act: enhanced user profile management and email change confirmation
-   2025-09-14: Stage 3: Act: implemented complete comment system with moderation
-   2025-09-15: Stage 3: Act: added account deletion with confirmation system
-   2025-09-16: Stage 3: Act: implemented like/dislike system for posts and comments
-   2025-09-18: Stage 3: Act: completed category management system with admin controls
-   2025-09-20: Stage 3: Act: implemented favorites system for bookmarking posts
-   2025-09-22: Stage 3: Act: added subscription system for post notifications
-   2025-09-25: Stage 3: Act: finalized comprehensive API documentation and testing