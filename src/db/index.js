import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS !== 'false',
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    enableKeepAlive: true,
});

export async function ping() {
    const conn = await pool.getConnection();
    try {
        await conn.ping();
    } finally {
        conn.release();
    }
}
