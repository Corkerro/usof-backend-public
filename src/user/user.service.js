import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

import { UserRepository } from './user.repository.js';
import { EmailChangeRepository } from '../email/email-change.repository.js';
import { EmailService } from '../email/email.service.js';
import { SessionService } from '../sessions/session.service.js';
import { AuthService } from '../auth/auth.service.js';

export class UserService {
    static async getAllUsers() {
        const users = await UserRepository.findAll();
        // return users.filter((u) => !u.deletedAt);
        return users.filter((u) => !u.a);
    }

    static async getUserById(id) {
        const user = await UserRepository.findById(id);
        if (!user || user.deletedAt) return null;
        return user;
    }

    static async updateAvatar(userId, avatarUrl) {
        return UserRepository.updateAvatar(userId, avatarUrl);
    }

    static async deleteUser(userId) {
        await SessionService.deleteAllSessions(userId);
        return UserRepository.delete(userId);
    }

    static async updateAvatarFile(userId, file) {
        if (!file) throw new Error('Avatar file is required');

        const user = await UserRepository.findById(userId);
        if (!user) {
            if (fs.existsSync(file.path)) await fs.promises.unlink(file.path);
            throw new Error('User not found');
        }

        const newFileName = `${user.login}.png`;
        const newFilePath = path.join('uploads/avatars', newFileName);

        try {
            await sharp(file.path).resize(256, 256, { fit: 'cover', position: 'center' }).png({ quality: 90 }).toFile(newFilePath);

            await fs.promises.unlink(file.path);

            const avatarUrl = `/uploads/avatars/${newFileName}`;
            const updatedUser = await UserRepository.updateAvatar(userId, avatarUrl);

            if (!updatedUser) throw new Error('Failed to update user avatar');

            return updatedUser;
        } catch (error) {
            if (fs.existsSync(file.path)) await fs.promises.unlink(file.path);
            if (fs.existsSync(newFilePath)) await fs.promises.unlink(newFilePath);
            throw new Error(`Failed to process avatar: ${error.message}`);
        }
    }

    static async updateUser(userId, fields) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new Error('User not found');

        const { login, email, full_name } = fields;

        if (!login && !email && !full_name) {
            throw new Error('Nothing to update');
        }

        if (login) {
            if (login === user.login) throw new Error('New login must be different');
            const existing = await UserRepository.findBylogin(login);
            if (existing) throw new Error('Login is already in use');
        }

        const updateData = {};
        if (full_name && full_name !== user.full_name) updateData.full_name = full_name;
        if (login && login !== user.login) updateData.login = login;

        if (Object.keys(updateData).length > 0) {
            const updatedUser = await UserRepository.update(userId, updateData);
            return updatedUser.toPublicJSON();
        }

        if (email && email !== user.email) {
            const existingEmail = await UserRepository.findByEmail(email);
            if (existingEmail) throw new Error('Email is already in use');

            const { token } = await EmailService.createEmailChangeToken(userId, user.email, email);
            await EmailService.sendEmailConfirmation(user.email, token);
            return { message: 'Confirmation code sent to your old email' };
        }

        throw new Error('No changes detected');
    }

    static async confirmEmailChange(userId, token) {
        const request = await EmailChangeRepository.findByToken(token);
        if (!request) throw new Error('Invalid or expired token');
        if (request.user_id !== Number(userId)) throw new Error('Token does not belong to this user');

        const user = await UserRepository.findById(userId);

        await UserRepository.update(userId, { email: request.new_email, is_email_confirmed: false });
        await EmailChangeRepository.markUsed(request.id);

        const { alreadySent, url, retryAfter } = await EmailService.getOrCreateEmailVerification(user);

        if (alreadySent) return { alreadySent, retryAfter };

        await EmailService.sendVerifyNewEmail(request.new_email, url);

        return { message: 'Email updated. Please verify your new email.' };
    }

    static async requestUserDeletion(userId) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new Error('User not found');

        const { alreadySent, token, retryAfter } = await EmailService.getOrCreateDeletionToken(userId);

        if (alreadySent) {
            return { message: `The code has already been sent. You can request a new one in ${retryAfter} minutes.` };
        }

        await EmailService.sendDeletionConfirmation(user.email, token);

        return { message: 'Confirmation code sent to your email' };
    }

    static async confirmUserDeletion(userId, token) {
        const request = await EmailService.validateDeletionToken(token);
        if (request.user_id !== Number(userId)) {
            throw new Error('Token does not belong to this user');
        }

        await EmailService.markDeletionTokenUsed(request.id);

        await SessionService.deleteAllSessions(userId);
        const result = await UserRepository.delete(userId);

        if (!result) throw new Error('Failed to delete user');

        return { message: 'Account deleted successfully' };
    }

    static async requestUserRecovery(email) {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            return { message: 'If an account exists with this email, recovery instructions have been sent' };
        }

        const { alreadySent, token, retryAfter } = await EmailService.getOrCreateRecoveryToken(user.id);

        if (alreadySent) {
            return { message: `The code has already been sent. You can request a new one in ${retryAfter} minutes.` };
        }

        await EmailService.sendRecoveryConfirmation(user.email, token);

        return { message: 'Recovery instructions have been sent' };
    }

    static async confirmUserRecovery(token) {
        const request = await EmailService.validateRecoveryToken(token);

        const user = await UserRepository.findById(request.user_id);
        if (!user) throw new Error('User not found');

        await EmailService.markRecoveryTokenUsed(request.id);

        return {
            message: 'Account recovered successfully',
            userId: user.id,
        };
    }

    static async createUser({ login, email, password, roleId }) {
        const existingLogin = await UserRepository.findBylogin(login);
        if (existingLogin) throw new Error('Login already in use');

        const existingEmail = await UserRepository.findByEmail(email);
        if (existingEmail) throw new Error('Email already in use');

        const passwordHash = await AuthService.hashPassword(password, 10);

        const user = await UserRepository.create({ login, email, passwordHash, role_id: roleId });

        AuthService.requestAccRegistration(login);

        return user;
    }

    static async recalculateUserRating(userId) {
        return await UserRepository.recalculateRating(userId);
    }
}
