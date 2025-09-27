import { Router } from 'express';
import { CommentService } from './comment.service.js';
import { authRequired } from '../middleware/auth.middleware.js';
import { LikeService } from '../likes/like.service.js';

export const CommentController = Router();

// ==========================
// COMMENTS
// ==========================

// GET /api/comments/:id
CommentController.get('/:id', async (req, res) => {
    try {
        const comment = await CommentService.getCommentById(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        res.json(comment.toJSON());
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH /api/comments/:id
CommentController.patch('/:id', authRequired, async (req, res) => {
    try {
        const { content } = req.body;
        const updated = await CommentService.updateComment(req.params.id, req.user.id, content);
        res.json(updated.toJSON());
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/comments/:id
CommentController.delete('/:id', authRequired, async (req, res) => {
    try {
        await CommentService.deleteComment(req.params.id, req.user.id);
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ==========================
// COMMENT LIKES
// ==========================

// GET /api/comments/:id/like
CommentController.get('/:id/like', async (req, res) => {
    try {
        const likes = await CommentService.getLikesByCommentId(req.params.id);
        res.json(likes);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/comments/:id/like
CommentController.post('/:id/like', authRequired, async (req, res) => {
    try {
        const { value = 1 } = req.body; // 1 = like, -1 = dislike
        const comment = await LikeService.createLike(undefined, req.params.id, req.user.id, value);
        res.status(201).json(comment.toJSON());
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/comments/:id/like
CommentController.delete('/:id/like', authRequired, async (req, res) => {
    try {
        await LikeService.deleteLike(undefined, req.params.id, req.user.id);
        res.json({ message: 'Like removed' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
