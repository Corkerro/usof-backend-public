import { pool } from '../db/index.js';
import { CategoryEntity } from './category.entity.js';

export class CategoryRepository {
    static async findAll(offset = 0, limit = 50) {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY created_at DESC LIMIT ?, ?', [offset, limit]);
        return rows.map((r) => new CategoryEntity(r));
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0] ? new CategoryEntity(rows[0]) : null;
    }

    static async findPostsByCategoryId(id, offset = 0, limit = 10) {
        const [rows] = await pool.query(
            `SELECT p.* 
             FROM posts p
             JOIN post_categories pc ON p.id = pc.post_id
             WHERE pc.category_id = ?
             ORDER BY p.created_at DESC
             LIMIT ?, ?`,
            [id, offset, limit],
        );
        return rows;
    }

    static async create({ name, slug, description, createdBy }) {
        const [result] = await pool.query('INSERT INTO categories (name, slug, description, created_by) VALUES (?, ?, ?, ?)', [name, slug, description, createdBy]);
        return this.findById(result.insertId);
    }

    static async update(id, fields) {
        const setPart = Object.keys(fields)
            .map((k) => `${k} = ?`)
            .join(', ');
        const values = Object.values(fields);

        await pool.query(`UPDATE categories SET ${setPart}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id]);
        return this.findById(id);
    }

    static async softDelete(id) {
        await pool.query('UPDATE categories SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        return true;
    }

    static async attachToPost(postId, categoryIds) {
        if (!categoryIds || categoryIds.length === 0) return;

        const values = categoryIds.map((cid) => [postId, cid]);
        await pool.query('INSERT INTO post_categories (post_id, category_id) VALUES ?', [values]);
    }

    static async replacePostCategories(postId, categoryIds) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            await conn.query('DELETE FROM post_categories WHERE post_id = ?', [postId]);
            if (categoryIds && categoryIds.length > 0) {
                const values = categoryIds.map((cid) => [postId, cid]);
                await conn.query('INSERT INTO post_categories (post_id, category_id) VALUES ?', [values]);
            }
            await conn.commit();
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async getPostCategories(postId) {
        const [rows] = await pool.query(
            `SELECT c.* 
             FROM categories c
             JOIN post_categories pc ON c.id = pc.category_id
             WHERE pc.post_id = ?`,
            [postId],
        );
        return rows;
    }
}
