import { pool } from '../db/index.js';

export class SubscriptionRepository {
    static async subscribe(userId, postId) {
        await pool.query(
            `INSERT INTO post_subscriptions (user_id, post_id)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
            [userId, postId]
        );
    }

    static async unsubscribe(userId, postId) {
        await pool.query(
            `DELETE FROM post_subscriptions WHERE user_id = ? AND post_id = ?`,
            [userId, postId]
        );
    }

    static async getSubscribers(postId) {
        const [rows] = await pool.query(
            `SELECT u.id, u.email 
             FROM post_subscriptions s
             JOIN users u ON u.id = s.user_id
             WHERE s.post_id = ?`,
            [postId]
        );
        return rows;
    }

    static async getUserSubscriptions(userId) {
        const [rows] = await pool.query(
            `SELECT p.* FROM post_subscriptions s
             JOIN posts p ON p.id = s.post_id
             WHERE s.user_id = ?`,
            [userId]
        );
        return rows;
    }
}
