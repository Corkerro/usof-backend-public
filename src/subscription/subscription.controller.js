import { Router } from 'express';
import { SubscriptionService } from './subscription.service.js';
import { authRequired } from '../middleware/auth.middleware.js';

export const SubscriptionController = Router();

// POST /api/subscriptions/posts/:id
// Subscribe current user to a post
SubscriptionController.post('/posts/:id', authRequired, async (req, res) => {
    await SubscriptionService.subscribe(req.user.id, req.params.id);
    res.json({ message: 'Subscribed successfully' });
});

// DELETE /api/subscriptions/posts/:id
// Unsubscribe current user from a post
SubscriptionController.delete('/posts/:id', authRequired, async (req, res) => {
    await SubscriptionService.unsubscribe(req.user.id, req.params.id);
    res.json({ message: 'Unsubscribed successfully' });
});

// GET /api/subscriptions/me/posts
// Get all posts current user is subscribed to
SubscriptionController.get('/me/posts', authRequired, async (req, res) => {
    const posts = await SubscriptionService.getUserSubscriptions(req.user.id);
    res.json(posts);
});
