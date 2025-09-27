import fs from 'fs';
import path from 'path';
import { pool } from './index.js';

async function ensureIndexes(conn) {
    const [rows] = await conn.query(`
        SHOW INDEX FROM posts WHERE Key_name = 'idx_posts_likes'
    `);
    if (rows.length === 0) {
        await conn.query('CREATE INDEX idx_posts_likes ON posts(id)');
    }
}

async function ensureRoles(conn) {
    const [rows] = await conn.query('SELECT COUNT(*) AS count FROM roles');
    if (rows[0].count === 0) {
        await conn.query('INSERT INTO roles (id, name) VALUES (?, ?), (?, ?)', [1, 'admin', 2, 'user']);
        console.log('Default roles created ✅');
    }
}

export async function initDb() {
    const sqlPath = path.join(process.cwd(), 'db/db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const statements = sql
        .split(/;\s*$/m)
        .map((s) => s.trim())
        .filter((s) => s.length);

    const conn = await pool.getConnection();
    try {
        for (const stmt of statements) {
            await conn.query(stmt);
        }

        await ensureIndexes(conn);
        await ensureRoles(conn);

        console.log('DB init complete ✅');
    } finally {
        conn.release();
    }
}
