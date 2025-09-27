import { Router } from 'express';
import { AuthService } from './auth.service.js';
import { authRequired } from '../middleware/auth.middleware.js';

export const AuthController = Router();

// POST /api/auth/register
AuthController.post('/register', async (req, res) => {
    try {
        const { login, email, password } = req.body;
        const user = await AuthService.register({ login, email, password });
        res.json({ user: user.toPublicJSON() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/auth/login
AuthController.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;
        const user = await AuthService.login({ login, password });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials or email not confirmed' });
        }

        req.session.userId = user.id;
        req.session.ip = req.ip;
        req.session.userAgent = req.headers['user-agent'];

        res.json({ message: 'Logged in', user: user.toPublicJSON() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/logout
AuthController.post('/logout', authRequired, async (req, res) => {
    try {
        const deleted = await AuthService.logout(req.user.id, req.sessionID, req);
        if (!deleted) {
            return res.status(404).json({ message: 'Session not found, but cookie cleared' });
        }
        res.json({ message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/password-reset
AuthController.post('/password-reset', async (req, res) => {
    try {
        const { login } = req.body;

        const result = await AuthService.requestPasswordReset(login);

        if (result.alreadySent) {
            return res.status(429).json({
                message: `Reset link already sent. Try again in ${result.retryAfter}`,
            });
        }

        res.json({ message: 'Password reset email sent ✅' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/auth/password-reset/:confirm_token
AuthController.post('/password-reset/:confirm_token', async (req, res) => {
    try {
        const { confirm_token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) return res.status(400).json({ error: 'New password is required' });

        await AuthService.resetPassword(confirm_token, newPassword);

        res.json({ message: 'Password has been reset and email confirmed ✅' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/auth/verify-email?token=...
AuthController.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        await AuthService.verifyEmail(token);
        res.json({ message: 'Email verified successfully ✅' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/auth/resend-verification
AuthController.post('/resend-verification', async (req, res) => {
    try {
        const { login } = req.body;
        if (!login) return res.status(400).json({ error: 'Login is required' });

        const result = await AuthService.sendEmailVerificationByLogin(login);

        if (result.alreadySent) {
            return res.status(429).json({
                message: `Verification email already sent. Try again in ${result.retryAfter} min`,
            });
        }

        res.json({ message: 'Verification email sent ✅' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
