import { SessionRepository } from './session.repository.js';

export class SessionService {
    static async getActiveSessionsByUserId(userId, currentSessionId) {
        const rows = await SessionRepository.findByUserId(userId, currentSessionId);
        return rows.map((r) => ({
            sessionId: r.session_id,
            expiresAt: new Date(r.expires * 1000),
            ip: r.ip,
            userAgent: r.userAgent,
        }));
    }

    static async getCurrentSession(sessionId) {
        const row = await SessionRepository.findBySessionId(sessionId);
        if (!row) return null;
        return {
            sessionId: row.session_id,
            expiresAt: new Date(row.expires * 1000),
            ip: row.ip,
            userAgent: row.userAgent,
        };
    }

    static async deleteSession(sessionId) {
        const affectedRows = await SessionRepository.deleteBySessionId(sessionId);
        return affectedRows > 0;
    }

    static async deleteAllOtherSessions(userId, currentSessionId) {
        const affectedRows = await SessionRepository.deleteAllOtherSessions(userId, currentSessionId);
        return affectedRows;
    }

    static async deleteAllSessions(userId) {
        const affectedRows = await SessionRepository.deleteAllSessions(userId);
        return affectedRows;
    }
}
