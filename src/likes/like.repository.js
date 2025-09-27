import { pool } from '../db/index.js';
import { LikeEntity } from './like.entity.js';

export class LikeRepository {
    static async findByPostId(postId) {
        const [rows] = await pool.query(`SELECT * FROM post_likes WHERE post_id = ?`, [postId]);
        return rows.map((r) => new LikeEntity(r));
    }

    static async createForPost({ postId, userId, value }) {
        await pool.query(
            `INSERT INTO post_likes (post_id, user_id, value) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE value = VALUES(value)`,
            [postId, userId, value],
        );
        const [rows] = await pool.query(`SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?`, [postId, userId]);
        return rows[0] ? new LikeEntity(rows[0]) : null;
    }

    static async createForComment({ commentId, userId, value }) {
        await pool.query(
            `INSERT INTO comment_likes (comment_id, user_id, value) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE value = VALUES(value)`,
            [commentId, userId, value],
        );
        const [rows] = await pool.query(`SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?`, [commentId, userId]);
        return rows[0] ? new LikeEntity(rows[0]) : null;
    }

    static async deleteForPost(postId, userId) {
        await pool.query(`DELETE FROM post_likes WHERE post_id = ? AND user_id = ?`, [postId, userId]);
        return true;
    }

    static async deleteForComment(commentId, userId) {
        await pool.query(`DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?`, [commentId, userId]);
        return true;
    }
}
