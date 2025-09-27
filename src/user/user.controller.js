import { Router } from 'express';
import { UserService } from './user.service.js';
import { adminRequired, authRequired } from '../middleware/auth.middleware.js';
import { avatarUpload } from '../multer/multer.service.js';
import multer from 'multer';

export const UserController = Router();

// Multer error handler
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 2MB' });
        }
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

// GET /api/users
UserController.get('/', async (_req, res) => {
    try {
        const users = await UserService.getAllUsers();
        res.json(users.map((u) => u.toPublicJSON()));
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/users
UserController.post('/', authRequired, adminRequired, async (req, res) => {
    try {
        const { login, password, passwordConfirmation, email, roleId } = req.body;

        if (!login || !password || !passwordConfirmation || !email || !roleId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (password !== passwordConfirmation) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const user = await UserService.createUser({ login, email, password, roleId });
        res.status(201).json(user.toPublicJSON());
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH /api/users/avatar
UserController.patch('/avatar', authRequired, avatarUpload.single('avatar'), handleMulterError, async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Avatar file is required' });

    try {
        const user = await UserService.updateAvatarFile(req.user.id, req.file);
        res.json(user.toPublicJSON());
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/users/:id
UserController.get('/:id', async (req, res) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.toPublicJSON());
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/users/:id
UserController.patch('/:id', authRequired, async (req, res) => {
    try {
        if (req.user.id !== Number(req.params.id)) return res.status(403).json({ error: 'Forbidden' });

        const result = await UserService.updateUser(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Post /api/users/:id/confirm-email-change
UserController.post('/:id/confirm-email-change', authRequired, async (req, res) => {
    try {
        if (req.user.id !== Number(req.params.id)) return res.status(403).json({ error: 'Forbidden' });

        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        const result = await UserService.confirmEmailChange(req.params.id, token);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// // DELETE /api/users/:id
// UserController.delete('/:id', authRequired, async (req, res) => {
//     try {
//         await UserService.deleteUser(req.params.id);
//         res.json({ message: 'User deleted' });
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// DELETE /api/users/:id/request-deletion
UserController.delete('/:id', authRequired, async (req, res) => {
    try {
        if (req.user.id !== Number(req.params.id)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const result = await UserService.requestUserDeletion(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/users/:id/confirm-deletion
UserController.post('/:id/confirm-deletion', authRequired, async (req, res) => {
    try {
        if (req.user.id !== Number(req.params.id)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        const result = await UserService.confirmUserDeletion(req.params.id, token);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/users/recovery
UserController.post('/recovery', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ error: 'Email is required' });

        const result = await UserService.requestUserRecovery(email);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/users/recovery/confirm
UserController.post('/recovery/confirm', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        const result = await UserService.confirmUserRecovery(token);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
