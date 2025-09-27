import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware.js';
import { SessionService } from './session.service.js';

export const SessionController = Router();

// GET /api/sessions/
SessionController.get('/', authRequired, async (req, res) => {
    try {
        const sessions = await SessionService.getActiveSessionsByUserId(req.user.id, req.sessionID);
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/sessions/current
SessionController.get('/current', authRequired, async (req, res) => {
    try {
        const session = await SessionService.getCurrentSession(req.sessionID);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DEL /api/sessions/others
SessionController.delete('/others', authRequired, async (req, res) => {
    try {
        await SessionService.deleteAllOtherSessions(req.user.id, req.sessionID);
        res.json({ message: 'All other sessions deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DEL /api/sessions/:sessionId
SessionController.delete('/:sessionId', authRequired, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const deleted = await SessionService.deleteSession(sessionId);

        if (!deleted) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ message: 'Session deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
