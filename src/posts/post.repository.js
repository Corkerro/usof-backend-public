import { CategoryRepository } from "../categories/category.repository.js";
import { pool } from "../db/index.js";
import { PostEntity } from "./post.entity.js";

export class PostRepository {
  static async findAll(offset = 0, limit = 10, sortBy = "created_at", order = "DESC") {
    const allowedSortBy = ["created_at", "like_count", "views"];
    const allowedOrder = ["ASC", "DESC"];

    if (!allowedSortBy.includes(sortBy)) sortBy = "created_at";
    if (!allowedOrder.includes(order.toUpperCase())) order = "DESC";

    const [rows] = await pool.query(
      `SELECT p.*, 
            (SELECT COALESCE(SUM(value), 0) 
             FROM post_likes pl 
             WHERE pl.post_id = p.id) AS like_count
     FROM posts p
     WHERE status = "active" AND deleted_at IS NULL
     ORDER BY ${sortBy} ${order}
     LIMIT ?, ?`,
      [offset, limit]
    );

    return Promise.all(
      rows.map(async (r) => {
        const categories = await CategoryRepository.getPostCategories(r.id);
        return new PostEntity({ ...r, categories, likeCount: r.like_count });
      })
    );
  }

  static async findByAuthorId(authorId, sortBy = "created_at", order = "DESC") {
    const allowedSortBy = ["created_at", "like_count", "views"];
    const allowedOrder = ["ASC", "DESC"];

    if (!allowedSortBy.includes(sortBy)) sortBy = "created_at";
    if (!allowedOrder.includes(order.toUpperCase())) order = "DESC";

    const [rows] = await pool.query(
      `SELECT p.*,
            (SELECT COALESCE(SUM(value), 0)
             FROM post_likes pl
             WHERE pl.post_id = p.id) AS like_count
     FROM posts p
     WHERE p.author_id = ?
       AND p.status = "active"
       AND p.deleted_at IS NULL
     ORDER BY ${sortBy} ${order}`,
      [authorId]
    );

    return Promise.all(
      rows.map(async (r) => {
        const categories = await CategoryRepository.getPostCategories(r.id);
        return new PostEntity({ ...r, categories, likeCount: r.like_count });
      })
    );
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, 
                    (SELECT COALESCE(SUM(value), 0) 
                     FROM post_likes pl 
                     WHERE pl.post_id = p.id) AS like_count
             FROM posts p
             WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (!rows[0]) return null;

    const categories = await CategoryRepository.getPostCategories(id);
    return new PostEntity({ ...rows[0], categories, likeCount: rows[0].like_count });
  }

  static async create({ authorId, title, content, status = "active", categoryIds = [] }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query("INSERT INTO posts (author_id, title, content, status) VALUES (?, ?, ?, ?)", [authorId, title, content, status]);

      const postId = result.insertId;

      await CategoryRepository.attachToPost(postId, categoryIds);

      await conn.commit();
      return this.findById(postId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async update(postId, fields) {
    const setPart = Object.keys(fields)
      .map((k) => `${k} = ?`)
      .join(", ");
    const values = Object.values(fields);
    await pool.query(`UPDATE posts SET ${setPart} WHERE id = ?`, [...values, postId]);
    return this.findById(postId);
  }

  static async delete(postId) {
    await pool.query("DELETE FROM posts WHERE id = ?", [postId]);
    return true;
  }

  static async getPostCategories(postId) {
    const [rows] = await pool.query(
      `SELECT c.* 
         FROM categories c
         JOIN post_categories pc ON c.id = pc.category_id
         WHERE pc.post_id = ?`,
      [postId]
    );
    return rows.map((r) => new CategoryEntity(r));
  }

  static async incrementViews(postId) {
    await pool.query("UPDATE posts SET views = views + 1 WHERE id = ? AND deleted_at IS NULL", [postId]);
  }

  static async softDelete(postId) {
    await pool.query("UPDATE posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [postId]);
    return true;
  }

  static async search(keyword, offset = 0, limit = 10, sortBy = "created_at", order = "DESC") {
    const allowedSortBy = ["created_at", "like_count", "views"];
    const allowedOrder = ["ASC", "DESC"];

    if (!allowedSortBy.includes(sortBy)) sortBy = "created_at";
    if (!allowedOrder.includes(order.toUpperCase())) order = "DESC";

    const searchPattern = `%${keyword}%`;

    const [rows] = await pool.query(
      `SELECT p.*, 
            (SELECT COALESCE(SUM(value), 0) 
             FROM post_likes pl 
             WHERE pl.post_id = p.id) AS like_count
     FROM posts p
     WHERE status = "active" 
       AND deleted_at IS NULL
       AND (title LIKE ? OR content LIKE ?)
     ORDER BY ${sortBy} ${order}
     LIMIT ?, ?`,
      [searchPattern, searchPattern, offset, limit]
    );

    return Promise.all(
      rows.map(async (r) => {
        const categories = await CategoryRepository.getPostCategories(r.id);
        return new PostEntity({ ...r, categories, likeCount: r.like_count });
      })
    );
  }
}
