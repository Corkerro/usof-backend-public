import { pool } from '../db/index.js';
import { UserEntity } from './user.entity.js';

export class UserRepository {
    static async findAll() {
        // const [rows] = await pool.query('SELECT * FROM users WHERE deleted_at IS NULL');
        const [rows] = await pool.query('SELECT * FROM users');
        return rows.map((r) => new UserEntity(r));
    }

    static async findById(id) {
        // const [rows] = await pool.query('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] ? new UserEntity(rows[0]) : null;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] ? new UserEntity(rows[0]) : null;
    }

    static async findBylogin(login) {
        const [rows] = await pool.query('SELECT * FROM users WHERE login = ?', [login]);
        return rows[0] ? new UserEntity(rows[0]) : null;
    }

    static async create({ login, email, passwordHash, role_id }) {
        const [result] = await pool.query(`INSERT INTO users (login, email, password_hash, role_id) VALUES (?, ?, ?, ?)`, [login, email, passwordHash, role_id]);
        return this.findById(result.insertId);
    }

    static async updateAvatar(userId, avatarUrl) {
        await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);
        return this.findById(userId);
    }

    static async update(userId, fields) {
        const setPart = Object.keys(fields)
            .map((k) => `${k} = ?`)
            .join(', ');
        const values = Object.values(fields);
        await pool.query(`UPDATE users SET ${setPart} WHERE id = ?`, [...values, userId]);
        return this.findById(userId);
    }

    static async delete(userId) {
        await pool.query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [userId]);
        return true;
    }

    static async getPasswordHash(userId) {
        const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        return rows[0] ? rows[0].password_hash : null;
    }

    static async recalculateRating(userId) {
        const [rows] = await pool.query(
            `
            SELECT 
                COALESCE((
                    SELECT SUM(pl.value)
                    FROM posts p
                    JOIN post_likes pl ON pl.post_id = p.id
                    WHERE p.author_id = ? AND pl.user_id <> p.author_id
                ), 0) +
                COALESCE((
                    SELECT SUM(cl.value)
                    FROM comments c
                    JOIN comment_likes cl ON cl.comment_id = c.id
                    WHERE c.author_id = ? AND cl.user_id <> c.author_id
                ), 0) AS rating
            `,
            [userId, userId]
        );

        const rating = rows[0].rating || 0;
        await pool.query(`UPDATE users SET rating = ? WHERE id = ?`, [rating, userId]);
        return rating;
    }
}
