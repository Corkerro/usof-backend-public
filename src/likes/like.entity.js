export class LikeEntity {
    constructor({ id, user_id, post_id = null, comment_id = null, value, created_at }) {
        this.id = id;
        this.userId = user_id;
        this.postId = post_id;
        this.commentId = comment_id;
        this.value = value; // 1 = like, -1 = dislike
        this.createdAt = created_at;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            postId: this.postId,
            commentId: this.commentId,
            type: this.value === 1 ? 'like' : 'dislike',
            createdAt: this.createdAt,
        };
    }
}
