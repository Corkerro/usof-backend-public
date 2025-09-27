import { Router } from 'express';
import { FavoriteService } from './favorite.service.js';
import { authRequired } from '../middleware/auth.middleware.js';

export const FavoriteController = Router();

// GET /api/favorites/me
FavoriteController.get('/me', authRequired, async (req, res) => {
    try {
        const posts = await FavoriteService.getUserFavorites(req.user.id);
        res.json(posts.map(p => p.toJSON()));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/favorites/posts/:id
FavoriteController.post('/posts/:id', authRequired, async (req, res) => {
    try {
        await FavoriteService.addToFavorites(req.user.id, req.params.id);
        res.json({ message: 'Post added to favorites' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/favorites/posts/:id
FavoriteController.delete('/posts/:id', authRequired, async (req, res) => {
    try {
        await FavoriteService.removeFromFavorites(req.user.id, req.params.id);
        res.json({ message: 'Post removed from favorites' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
