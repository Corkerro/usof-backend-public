import { pool } from '../db/index.js';

export class PasswordResetRepository {
    static async create({ userId, token, expiresAt }) {
        const [result] = await pool.query(`INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)`, [userId, token, expiresAt]);
        return result.insertId;
    }

    static async findValidByToken(token) {
        const [rows] = await pool.query(
            `SELECT * FROM password_resets 
             WHERE token = ? AND is_used = FALSE AND expires_at > NOW() 
             LIMIT 1`,
            [token],
        );
        return rows[0] || null;
    }

    static async findValidByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT * FROM password_resets 
             WHERE user_id = ? AND is_used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId],
        );
        return rows[0] || null;
    }

    static async markUsed(id) {
        await pool.query(`UPDATE password_resets SET is_used = TRUE WHERE id = ?`, [id]);
    }
}
