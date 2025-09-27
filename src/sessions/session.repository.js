import { pool } from '../db/index.js';

export class SessionRepository {
    static async findByUserId(userId, excludeSessionId) {
        const [rows] = await pool.query(
            `SELECT 
                session_id, 
                expires, 
                JSON_UNQUOTE(JSON_EXTRACT(data, '$.ip')) AS ip,
                JSON_UNQUOTE(JSON_EXTRACT(data, '$.userAgent')) AS userAgent
             FROM sessions
             WHERE JSON_UNQUOTE(JSON_EXTRACT(data, '$.userId')) = ?
               AND session_id != ?
               AND expires > UNIX_TIMESTAMP()`,
            [userId, excludeSessionId],
        );
        return rows;
    }

    static async findBySessionId(sessionId) {
        const [rows] = await pool.query(
            `SELECT 
                session_id, 
                expires, 
                JSON_UNQUOTE(JSON_EXTRACT(data, '$.ip')) AS ip,
                JSON_UNQUOTE(JSON_EXTRACT(data, '$.userAgent')) AS userAgent
             FROM sessions
             WHERE session_id = ?`,
            [sessionId],
        );
        return rows[0] || null;
    }

    static async deleteBySessionId(sessionId) {
        const [result] = await pool.query(`DELETE FROM sessions WHERE session_id = ?`, [sessionId]);
        return result.affectedRows;
    }

    static async deleteAllOtherSessions(userId, currentSessionId) {
        const [result] = await pool.query(
            `DELETE FROM sessions
             WHERE JSON_UNQUOTE(JSON_EXTRACT(data, '$.userId')) = ?
               AND session_id != ?`,
            [userId, currentSessionId],
        );
        return result.affectedRows;
    }

    static async deleteAllSessions(userId) {
        const [result] = await pool.query(
            `DELETE FROM sessions
         WHERE JSON_UNQUOTE(JSON_EXTRACT(data, '$.userId')) = ?`,
            [userId],
        );
        return result.affectedRows;
    }
}
