import { pool } from '../db/index.js';

export class UserDeletionRepository {
    static async create(userId, token, expiresAt) {
        const [result] = await pool.query(`INSERT INTO user_deletion_requests (user_id, token, expires_at) VALUES (?, ?, ?)`, [userId, token, expiresAt]);
        return result.insertId;
    }

    static async findValidByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT * FROM user_deletion_requests 
             WHERE user_id = ? AND is_used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [userId],
        );
        return rows[0] || null;
    }

    static async findByToken(token) {
        const [rows] = await pool.query(
            `SELECT * FROM user_deletion_requests 
             WHERE token = ? AND is_used = FALSE AND expires_at > NOW()`,
            [token],
        );
        return rows[0] || null;
    }

    static async markUsed(id) {
        await pool.query(`UPDATE user_deletion_requests SET is_used = TRUE WHERE id = ?`, [id]);
    }

    static async deleteExpired() {
        await pool.query(`DELETE FROM user_deletion_requests WHERE expires_at <= NOW()`);
    }
}
