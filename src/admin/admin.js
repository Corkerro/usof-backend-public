import { pool } from '../db/index.js';
import AdminJS from 'adminjs';
import * as AdminJSExpress from '@adminjs/express';
import { Adapter, Database, Resource } from '@adminjs/sql';
import dotenv from 'dotenv';
import { userOptions } from './resources/UserResource.js';
import { AuthService } from '../auth/auth.service.js';

dotenv.config();

AdminJS.registerAdapter({ Database, Resource });

const startAdmin = async (app) => {
    const db = await new Adapter('mysql2', {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    }).init();

    const admin = new AdminJS({
        resources: [
            {
                resource: db.table('users'),
                options: userOptions,
            },
            { resource: db.table('roles') },
            {
                resource: db.table('posts'),
                options: {
                    properties: {
                        title: { isDisabled: true },
                        content: { isDisabled: true },
                    },
                },
            },
            { resource: db.table('categories') },
            { resource: db.table('post_categories') },
            { resource: db.table('comments') },

            {
                resource: db.table('post_likes'),
                options: {
                    actions: {
                        new: { isAccessible: false },
                        edit: { isAccessible: false },
                        delete: { isAccessible: false },
                    },
                },
            },
            {
                resource: db.table('comment_likes'),
                options: {
                    actions: {
                        new: { isAccessible: false },
                        edit: { isAccessible: false },
                        delete: { isAccessible: false },
                    },
                },
            },

            { resource: db.table('favorites') },
            { resource: db.table('email_verifications') },
            { resource: db.table('password_resets') },
            { resource: db.table('email_change_requests') },
            { resource: db.table('user_deletion_requests') },
            { resource: db.table('user_recovery_requests') },
        ],
        rootPath: '/admin',
        branding: {
            companyName: 'USOF Admin',
            softwareBrothers: false,
        },
    });

    const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
        authenticate: async (email, password) => {
            const [rows] = await pool.query(
                `SELECT users.*, roles.name AS role_name 
                 FROM users 
                 JOIN roles ON users.role_id = roles.id 
                 WHERE users.email = ?`,
                [email],
            );

            const user = rows[0];
            if (user && user.role_name === 'admin') {
                const isPasswordValid = await AuthService.validatePasswords(password, user.password_hash);
                if (isPasswordValid) {
                    return { email: user.email, id: user.id };
                }
            } else if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                return { email };
            }

            return null;
        },
        cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'supersecret',
    });

    app.use(admin.options.rootPath, router);
};

export default startAdmin;
