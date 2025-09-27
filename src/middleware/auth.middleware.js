import { UserRepository } from '../user/user.repository.js';

export async function authRequired(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await UserRepository.findById(req.session.userId);
    if (!user || user.deleted_at) {
        return res.status(401).json({ error: 'Session invalid or user deleted' });
    }

    req.user = user;
    next();
}

export function adminRequired(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.roleId !== 1) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    next();
}
