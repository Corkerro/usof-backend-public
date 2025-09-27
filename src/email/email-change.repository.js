import { pool } from '../db/index.js';

export class EmailChangeRepository {
    static async create(userId, oldEmail, newEmail, token, expiresAt) {
        const [result] = await pool.query(
            `INSERT INTO email_change_requests (user_id, old_email, new_email, token, expires_at) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, oldEmail, newEmail, token, expiresAt]
        );
        return result.insertId;
    }

    static async findByToken(token) {
        const [rows] = await pool.query(
            `SELECT * FROM email_change_requests 
             WHERE token = ? AND is_used = FALSE AND expires_at > NOW()`,
            [token]
        );
        return rows[0] || null;
    }

    static async markUsed(id) {
        await pool.query(`UPDATE email_change_requests SET is_used = TRUE WHERE id = ?`, [id]);
    }
}
