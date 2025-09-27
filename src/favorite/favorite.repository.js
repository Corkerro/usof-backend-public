import { pool } from '../db/index.js';
import { PostRepository } from '../posts/post.repository.js';

export class FavoriteRepository {
    static async add(userId, postId) {
        await pool.query(
            `INSERT INTO favorites (user_id, post_id)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
            [userId, postId]
        );
        return true;
    }

    static async remove(userId, postId) {
        await pool.query(
            `DELETE FROM favorites WHERE user_id = ? AND post_id = ?`,
            [userId, postId]
        );
        return true;
    }

    static async getUserFavorites(userId) {
        const [rows] = await pool.query(
            `SELECT p.*,
                    (SELECT COALESCE(SUM(value), 0)
                     FROM post_likes pl
                     WHERE pl.post_id = p.id) AS like_count
             FROM favorites f
             JOIN posts p ON f.post_id = p.id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC`,
            [userId]
        );

        return Promise.all(rows.map(r => PostRepository.findById(r.id)));
    }
}
