import { EmailChangeRepository } from './email-change.repository.js';
import { EmailVerificationRepository } from './email-verification.repository.js';
import crypto from 'crypto';
import { UserDeletionRepository } from '../user/user-deletion.repository.js';
import { UserRecoveryRepository } from '../user/user-recovery.repository.js';

export class EmailService {
    /**
     * Send an email (currently logs to console)
     * @param {string} to - recipient email
     * @param {string} subject - email subject
     * @param {string} text - email body
     */
    static async sendMail({ to, subject, text }) {
        console.log('--- EmailService ---');
        console.log(`Recipient: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Text: ${text}`);
        console.log('-------------------');
        // TODO: replace console.log with actual email sending (e.g., nodemailer)
    }

    static async getOrCreateEmailVerification(user) {
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
        const url = `http://localhost:3000/api/auth/verify-email?token=${token}`;

        await EmailVerificationRepository.create({
            userId: user.id,
            token,
            expiresAt: expires,
        });

        return { alreadySent: false, token, url };
    }

    static async createEmailChangeToken(userId, oldEmail, newEmail) {
        const token = crypto.randomBytes(16).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await EmailChangeRepository.create(userId, oldEmail, newEmail, token, expiresAt);
        return { token, expiresAt };
    }

    static async sendEmailVerification(email, url) {
        await this.sendMail({
            to: email,
            subject: 'Email Verification',
            text: `Click the link to verify your email: ${url}`,
        });
    }

    static async sendVerifyNewEmail(email, url) {
        await this.sendMail({
            to: email,
            subject: 'Verify your new email',
            text: `Your email has been changed. Please verify it by following the link:\n\n${url}`,
        });
    }

    static async sendEmailConfirmation(email, token) {
        await this.sendMail({
            to: email,
            subject: 'Confirm your email change',
            text: `We received a request to change your account email.\n\n
                       To confirm, use the following code:\n\n${token}\n\n
                       This code will expire in 15 minutes.`,
        });
    }

    static async createDeletionToken(userId) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await UserDeletionRepository.create(userId, token, expiresAt);
        return { token, expiresAt };
    }

    static async createRecoveryToken(userId) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await UserRecoveryRepository.create(userId, token, expiresAt);
        return { token, expiresAt };
    }

    static async sendDeletionConfirmation(email, token) {
        await this.sendMail({
            to: email,
            subject: 'Confirm Account Deletion',
            text: `We received a request to delete your account.\n\n
                   To confirm deletion, use the following code:\n\n${token}\n\n
                   This code will expire in 15 minutes.\n\n
                   If you didn't request this, please ignore this email.`,
        });
    }

    static async sendPasswordResetRequest(email, url) {
        await this.sendMail({
            to: email,
            subject: 'Password Reset Request',
            text: `Click the link to reset your password: ${url}`,
        });
    }

    static async sendAccConfirmFromAdmin(email, url) {
        await this.sendMail({
            to: email,
            subject: 'Account registration request',
            text: `Click the link to change your password: ${url}`,
        });
    }

    static async sendRecoveryConfirmation(email, token) {
        await this.sendMail({
            to: email,
            subject: 'Recover Your Account',
            text: `We received a request to recover your account.\n\n
                   To recover your account, use the following code:\n\n${token}\n\n
                   This code will expire in 15 minutes.\n\n
                   If you didn't request this, please ignore this email.`,
        });
    }

    static async validateDeletionToken(token) {
        const request = await UserDeletionRepository.findByToken(token);
        if (!request) throw new Error('Invalid or expired token');
        return request;
    }

    static async validateRecoveryToken(token) {
        const request = await UserRecoveryRepository.findByToken(token);
        if (!request) throw new Error('Invalid or expired token');
        return request;
    }

    static async markDeletionTokenUsed(tokenId) {
        await UserDeletionRepository.markUsed(tokenId);
    }

    static async markRecoveryTokenUsed(tokenId) {
        await UserRecoveryRepository.markUsed(tokenId);
    }

    static async getOrCreateDeletionToken(userId) {
        const existing = await UserDeletionRepository.findValidByUserId(userId);
        if (existing) {
            const msLeft = new Date(existing.expires_at).getTime() - Date.now();
            if (msLeft > 0) {
                const minutes = Math.floor(msLeft / 60000);
                return { alreadySent: true, retryAfter: minutes, token: existing.token };
            }
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await UserDeletionRepository.create(userId, token, expiresAt);
        return { alreadySent: false, token, expiresAt };
    }

    static async getOrCreateRecoveryToken(userId) {
        const existing = await UserRecoveryRepository.findValidByUserId(userId);
        if (existing) {
            const msLeft = new Date(existing.expires_at).getTime() - Date.now();
            if (msLeft > 0) {
                const minutes = Math.floor(msLeft / 60000);
                return { alreadySent: true, retryAfter: minutes, token: existing.token };
            }
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await UserRecoveryRepository.create(userId, token, expiresAt);
        return { alreadySent: false, token, expiresAt };
    }
}
