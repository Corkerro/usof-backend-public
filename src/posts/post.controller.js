import { Router } from 'express';
import { PostService } from './post.service.js';
import { CommentService } from '../comments/comment.service.js';
import { LikeService } from '../likes/like.service.js';
import { authRequired } from '../middleware/auth.middleware.js';
import { SubscriptionService } from '../subscription/subscription.service.js';
import { uploadTemp, saveUploadedFiles } from '../middleware/upload.middleware.js';

export const PostController = Router();

// ==========================
// POSTS
// ==========================

// GET /api/posts?page=1&pageSize=10
PostController.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const posts = await PostService.getAllPosts(page, pageSize);
    res.json(posts.map((p) => p.toJSON()));
});

// GET /api/posts/mine
PostController.get('/mine', authRequired, async (req, res) => {
    try {
        const posts = await PostService.getPostsByAuthorId(req.user.id);
        res.json(posts.map((p) => p.toJSON()));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/posts/:id
PostController.get('/:id', async (req, res) => {
    const post = await PostService.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post.toJSON());
});

// POST /api/posts
PostController.post('/', authRequired, uploadTemp.array('images', 10), async (req, res) => {
    try {
        const processedContent = await saveUploadedFiles(req.files, req.body.content);
        
        const postData = {
            ...req.body,
            content: processedContent,
            categoryIds: Array.isArray(req.body.categoryIds) 
                ? req.body.categoryIds 
                : JSON.parse(req.body.categoryIds || '[]')
        };

        const post = await PostService.createPost(req.user.id, postData);
        res.status(201).json(post.toJSON());
    } catch (err) {
        if (err.details) {
            return res.status(400).json({ error: err.details });
        }
        res.status(400).json({ error: err.message });
    }
});

// PATCH /api/posts/:id
PostController.patch('/:id', authRequired, uploadTemp.array('images', 10), async (req, res) => {
    try {
        let processedContent = req.body.content;
        
        if (req.files && req.files.length > 0) {
            processedContent = await saveUploadedFiles(req.files, req.body.content);
        }
        
        const updateData = {
            ...req.body,
            content: processedContent
        };

        if (req.body.categoryIds) {
            updateData.categoryIds = Array.isArray(req.body.categoryIds) 
                ? req.body.categoryIds 
                : JSON.parse(req.body.categoryIds);
        }

        const post = await PostService.updatePost(req.params.id, req.user.id, updateData);
        await SubscriptionService.notifySubscribers(post.id, `Post "${post.title}" was updated.`);
        res.json(post.toJSON());
    } catch (err) {
        if (err.details) {
            return res.status(400).json({ error: err.details });
        }
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/posts/:id
PostController.delete('/:id', authRequired, async (req, res) => {
    try {
        await PostService.deletePost(req.params.id, req.user.id);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ==========================
// CATEGORIES
// ==========================

// GET /api/posts/:id/categories
PostController.get('/:id/categories', async (req, res) => {
    try {
        const categories = await PostService.getCategoriesByPostId(req.params.id);
        res.json(categories.map((c) => c.toJSON()));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/posts/:id/categories/add
PostController.post('/:id/categories/add', authRequired, async (req, res) => {
    try {
        const categories = await PostService.addCategoriesToPost(
            req.params.id,
            req.user.id,
            req.body.categoryIds,
        );
        res.json(categories.map((c) => c.toJSON()));
    } catch (err) {
        if (err.details) {
            return res.status(400).json({ error: err.details });
        }
        res.status(400).json({ error: err.message });
    }
});

// PATCH /api/posts/:id/categories
PostController.patch('/:id/categories', authRequired, async (req, res) => {
    try {
        const categories = await PostService.replaceCategoriesOfPost(
            req.params.id,
            req.user.id,
            req.body.categoryIds,
        );
        res.json(categories.map((c) => c.toJSON()));
    } catch (err) {
        if (err.details) {
            return res.status(400).json({ error: err.details });
        }
        res.status(400).json({ error: err.message });
    }
});

// ==========================
// COMMENTS
// ==========================

// GET /api/posts/:id/comments
PostController.get('/:id/comments', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const comments = await CommentService.getCommentsByPostId(req.params.id, page, pageSize);
        res.json(comments.map((c) => c.toJSON()));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/posts/:id/comments
PostController.post('/:id/comments', authRequired, async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await CommentService.createComment(req.params.id, req.user.id, content);
        const post = await PostService.getPostById(req.params.id);
        await SubscriptionService.notifySubscribers(post.id, `New comment on post "${post.title}"`);
        res.status(201).json(comment.toJSON());
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ==========================
// LIKES
// ==========================

// GET /api/posts/:id/like
PostController.get('/:id/like', async (req, res) => {
    try {
        const likes = await LikeService.getLikesByPostId(req.params.id);
        res.json(likes.map((l) => l.toJSON()));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/posts/:id/like
PostController.post('/:id/like', authRequired, async (req, res) => {
    try {
        const { value = 1 } = req.body; // 1 = like, -1 = dislike
        const like = await LikeService.createLike(req.params.id, undefined, req.user.id, value);
        res.status(201).json(like.toJSON());
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/posts/:id/like
PostController.delete('/:id/like', authRequired, async (req, res) => {
    try {
        await LikeService.deleteLike(req.params.id, undefined, req.user.id);
        res.json({ message: 'Like removed' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
