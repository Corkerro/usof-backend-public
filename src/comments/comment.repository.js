import { pool } from '../db/index.js';
import { LikeEntity } from '../likes/like.entity.js';
import { CommentEntity } from './comment.entity.js';

export class CommentRepository {
    static async findByPostId(postId, offset = 0, limit = 20) {
        const [rows] = await pool.query(
            `SELECT c.*,
                    COALESCE((SELECT SUM(value) FROM comment_likes cl WHERE cl.comment_id = c.id), 0) AS like_count
             FROM comments c
             WHERE c.post_id = ? AND deleted_at IS NULL
             ORDER BY created_at ASC
             LIMIT ?, ?`,
            [postId, offset, limit]
        );

        return Promise.all(rows.map(async (r) => {
            const likes = await this.getLikesByCommentId(r.id);
            return new CommentEntity({ ...r, likeCount: r.like_count, likes: likes.map(l => new LikeEntity(l)) });
        }));
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT c.*,
                    COALESCE((SELECT SUM(value) FROM comment_likes cl WHERE cl.comment_id = c.id), 0) AS like_count
             FROM comments c
             WHERE c.id = ? AND deleted_at IS NULL`,
            [id]
        );

        if (!rows[0]) return null;

        const likes = await this.getLikesByCommentId(rows[0].id);
        return new CommentEntity({ ...rows[0], likeCount: rows[0].like_count, likes: likes.map(l => new LikeEntity(l)) });
    }

    static async create({ postId, authorId, content }) {
        const [result] = await pool.query(
            `INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)`,
            [postId, authorId, content],
        );
        return this.findById(result.insertId);
    }

    static async softDelete(id) {
        await pool.query(`UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
        return true;
    }

    // ==================
    // COMMENT LIKES
    // ==================
    static async createLike(commentId, userId, value = 1) {
        await pool.query(
            `INSERT INTO comment_likes (comment_id, user_id, value) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE value = VALUES(value)`,
            [commentId, userId, value],
        );

        const [rows] = await pool.query(
            `SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
            [commentId, userId],
        );

        return rows[0] ? new LikeEntity(rows[0]) : null;
    }

    static async getLikesByCommentId(commentId) {
        const [rows] = await pool.query(
            `SELECT * FROM comment_likes WHERE comment_id = ?`,
            [commentId],
        );

        return rows.map(r => new LikeEntity(r));
    }

    static async update(id, content) {
        await pool.query(
            `UPDATE comments 
            SET content = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`,
            [content, id],
        );
        return this.findById(id);
    }

    static async getRating(commentId) {
        const [rows] = await pool.query(
            `SELECT COALESCE(SUM(value), 0) as rating 
            FROM comment_likes 
            WHERE comment_id = ?`,
            [commentId],
        );
        return rows[0].rating;
    }

    static async deleteLike(commentId, userId) {
        await pool.query(
            `DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
            [commentId, userId],
        );
        return true;
    }
}
