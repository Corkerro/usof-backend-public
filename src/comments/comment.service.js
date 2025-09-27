import { CommentRepository } from './comment.repository.js';

export class CommentService {
    static async getCommentsByPostId(postId, page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;
        return CommentRepository.findByPostId(postId, offset, pageSize);
    }

    static async createComment(postId, authorId, content) {
        if (!content || content.trim() === '') throw new Error('Content is required');
        return CommentRepository.create({ postId, authorId, content });
    }

    static async getCommentById(id) {
        return CommentRepository.findById(id);
    }

    static async updateComment(id, userId, content) {
        const comment = await CommentRepository.findById(id);
        if (!comment) throw new Error('Comment not found');
        if (comment.authorId !== userId) throw new Error('Permission denied');

        return CommentRepository.update(id, content);
    }

    static async deleteComment(id, userId) {
        const comment = await CommentRepository.findById(id);
        if (!comment) throw new Error('Comment not found');
        if (comment.authorId !== userId) throw new Error('Permission denied');

        await CommentRepository.softDelete(id);
        return true;
    }

    // ==================
    // COMMENT LIKES
    // ==================
    static async getLikesByCommentId(commentId) {
        return CommentRepository.getLikesByCommentId(commentId);
    }
}
