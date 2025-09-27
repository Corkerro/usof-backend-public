import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UserRepository } from '../user/user.repository.js';
import { EmailService } from '../email/email.service.js';
import { PasswordResetRepository } from '../user/password-reset.repository.js';
import { EmailVerificationRepository } from '../email/email-verification.repository.js';
import { SessionService } from '../sessions/session.service.js';

export class AuthService {
    static async register({ login, email, password }) {
        if (!login || !email || !password) throw new Error('login, email and password are required');
        const existing = await UserRepository.findByEmail(email);
        if (existing) throw new Error('Email already registered');

        const passwordHash = await this.hashPassword(password);

        const user = await UserRepository.create({
            login: login,
            email,
            passwordHash,
            role_id: 2,
        });
        this.sendEmailVerification(user);

        return user;
    }

    static async login({ login, password }) {
        if (!login || !password) throw new Error('Login and password are required');

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);

        const user = isEmail ? await UserRepository.findByEmail(login) : await UserRepository.findBylogin(login);

        if (!user) throw new Error('User not found');

        if (!user.isEmailConfirmed) return null;

        const passwordHash = await UserRepository.getPasswordHash(user.id);
        const valid = await this.validatePasswords(password, passwordHash);

        if (!valid) return null;
        return user;
    }

    static async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }

    static async validatePasswords(password, passwordHash) {
        return bcrypt.compare(password, passwordHash);
    }

    static async logout(userId, sessionId, req) {
        const deleted = await SessionService.deleteSession(sessionId);

        return new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                req.res?.clearCookie('usof.sid', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                });

                if (err) return reject(new Error('Logout failed'));

                resolve(deleted);
            });
        });
    }

    static async requestPasswordReset(login) {
        if (!login) throw new Error('login is required');

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);

        const user = isEmail ? await UserRepository.findByEmail(login) : await UserRepository.findBylogin(login);
        if (!user) throw new Error('User not found');

        let reset = await PasswordResetRepository.findValidByUserId(user.id);

        if (reset) {
            const msLeft = new Date(reset.expires_at).getTime() - Date.now();
            if (msLeft > 0) {
                const minutes = Math.floor(msLeft / 60000);
                const seconds = Math.floor((msLeft % 60000) / 1000);

                return {
                    alreadySent: true,
                    retryAfter: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
                };
            } else {
                reset = null;
            }
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 min

        await PasswordResetRepository.create({
            userId: user.id,
            token,
            expiresAt: expires,
        });

        const resetUrl = `http://localhost:3000/api/auth/password-reset/${token}`;

        await EmailService.sendPasswordResetRequest(user.email, resetUrl);

        return { alreadySent: false };
    }

    static async requestAccRegistration(login) {
        if (!login) throw new Error('login is required');

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);

        const user = isEmail ? await UserRepository.findByEmail(login) : await UserRepository.findBylogin(login);
        if (!user) throw new Error('User not found');

        let reset = await PasswordResetRepository.findValidByUserId(user.id);

        if (reset) {
            const msLeft = new Date(reset.expires_at).getTime() - Date.now();
            if (msLeft > 0) {
                const minutes = Math.floor(msLeft / 60000);
                const seconds = Math.floor((msLeft % 60000) / 1000);

                return {
                    alreadySent: true,
                    retryAfter: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
                };
            } else {
                reset = null;
            }
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 min

        await PasswordResetRepository.create({
            userId: user.id,
            token,
            expiresAt: expires,
        });

        const resetUrl = `http://localhost:3000/api/auth/password-reset/${token}`;

        await EmailService.sendAccConfirmFromAdmin(user.email, resetUrl);

        return { alreadySent: false };
    }

    static async resetPassword(token, newPassword) {
        const reset = await PasswordResetRepository.findValidByToken(token);
        if (!reset) throw new Error('Invalid or expired token');

        const user = await UserRepository.findById(reset.user_id);
        if (!user) throw new Error('User not found');

        const passwordHash = await this.hashPassword(newPassword);
        await UserRepository.update(user.id, {
            password_hash: passwordHash,
            is_email_confirmed: true,
        });

        await PasswordResetRepository.markUsed(reset.id);

        return true;
    }

    static async verifyEmail(token) {
        const verification = await EmailVerificationRepository.findValidByToken(token);
        if (!verification) throw new Error('Invalid or expired token');

        await UserRepository.update(verification.user_id, { is_email_confirmed: true });
        await EmailVerificationRepository.markUsed(verification.id);

        return true;
    }

    static async sendEmailVerification(user) {
        if (!user) throw new Error('User not found');

        let existing = await EmailVerificationRepository.findValidByUserId(user.id);
        if (existing) {
            const msLeft = new Date(existing.expires_at).getTime() - Date.now();
            if (msLeft > 0) {
                const minutes = Math.floor(msLeft / 60000);
                return { alreadySent: true, retryAfter: minutes };
            }
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 min

        await EmailVerificationRepository.create({
            userId: user.id,
            token,
            expiresAt: expires,
        });

        const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;

        await EmailService.sendEmailVerification(user.email, verificationUrl);

        return { alreadySent: false };
    }

    static async sendEmailVerificationByLogin(login) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);
        const user = isEmail ? await UserRepository.findByEmail(login) : await UserRepository.findBylogin(login);

        if (!user) throw new Error('User not found');
        if (user.is_email_confirmed) return { alreadySent: false, message: 'Email already verified' };

        return this.sendEmailVerification(user);
    }
}
