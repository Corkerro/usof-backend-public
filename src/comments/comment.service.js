import { CommentRepository } from "./comment.repository.js";

export class CommentService {
  static async getCommentsByPostId(postId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    return CommentRepository.findByPostId(postId, offset, pageSize);
  }

  static async createComment(postId, authorId, content, parentId = null) {
    if (!content || content.trim() === "") throw new Error("Content is required");

    if (parentId) {
      const parentComment = await CommentRepository.findById(parentId);
      if (!parentComment) throw new Error("Parent comment not found");
      if (parentComment.parentId) throw new Error("Cannot reply to a reply");

      if (Number(parentComment.postId) !== Number(postId)) throw new Error("Parent comment does not belong to this post");
    }

    return CommentRepository.create({ postId, authorId, content, parentId });
  }

  static async getCommentById(id) {
    return CommentRepository.findById(id);
  }

  static async updateComment(id, userId, content) {
    const comment = await CommentRepository.findById(id);
    if (!comment) throw new Error("Comment not found");
    if (comment.authorId !== userId) throw new Error("Permission denied");

    return CommentRepository.update(id, content);
  }

  static async deleteComment(id, userId, isAdmin = false) {
    const comment = await CommentRepository.findById(id);
    if (!comment) throw new Error("Comment not found");
    if (!isAdmin && comment.authorId !== userId) throw new Error("Permission denied");

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
