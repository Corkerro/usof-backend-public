import { CommentService } from "../comments/comment.service.js";
import { PostService } from "../posts/post.service.js";
import { UserRepository } from "../user/user.repository.js";
import { LikeRepository } from "./like.repository.js";

export class LikeService {
  static async getLikesByPostId(postId) {
    return LikeRepository.findByPostId(postId);
  }

  static async createLike(postId, commentId, userId, value = 1) {
    if (![1, -1].includes(value)) throw new Error("Value must be 1 (like) or -1 (dislike)");

    if (postId) {
      const likeForPost = await LikeRepository.createForPost({ postId, userId, value });
      const post = await PostService.getPostById(postId);
      if (post) {
        await UserRepository.recalculateRating(post.authorId);
      }
      return likeForPost;
    }
    if (commentId) {
      const likeForComment = await LikeRepository.createForComment({ commentId, userId, value });
      const comment = await CommentService.getCommentById(commentId);
      if (comment) {
        await UserRepository.recalculateRating(comment.authorId);
      }
      return likeForComment;
    }
  }

  static async deleteLike(postId, commentId, userId) {
    if (postId) {
      return LikeRepository.deleteForPost(postId, userId);
    }
    if (commentId) {
      return LikeRepository.deleteForComment(commentId, userId);
    }
  }
}
