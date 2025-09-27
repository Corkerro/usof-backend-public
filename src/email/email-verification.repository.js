import { pool } from '../db/index.js';

export class EmailVerificationRepository {
    static async create({ userId, token, expiresAt }) {
        const [result] = await pool.query(`INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)`, [userId, token, expiresAt]);
        return result.insertId;
    }

    static async findValidByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT * FROM email_verifications 
             WHERE user_id = ? AND is_used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [userId],
        );
        return rows[0] || null;
    }

    static async findValidByToken(token) {
        const [rows] = await pool.query(
            `SELECT * FROM email_verifications 
             WHERE token = ? AND is_used = FALSE AND expires_at > NOW()`,
            [token],
        );
        return rows[0] || null;
    }

    static async markUsed(id) {
        await pool.query(`UPDATE email_verifications SET is_used = TRUE WHERE id = ?`, [id]);
    }
}
