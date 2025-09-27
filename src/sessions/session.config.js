import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { pool } from '../db/index.js';

import dotenv from 'dotenv';
dotenv.config();

const MySQLStore = MySQLStoreFactory(session);

export const sessionMiddleware = session({
    key: 'usof.sid',
    secret: process.env.SESSION_SECRET || 'supersecret',
    store: new MySQLStore(
        {
            expiration: 1000 * 60 * 60 * 24 * 7, // 7 days
            createDatabaseTable: true,
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data',
                },
            },
        },
        pool.promise ? pool.promise() : pool,
    ),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
});
