export class CommentEntity {
  constructor({ id, post_id, author_id, content, status, created_at, updated_at, deleted_at, like_count = 0, parent_id = null }) {
    this.id = id;
    this.postId = post_id;
    this.authorId = author_id;
    this.parentId = parent_id;
    this.content = content;
    this.status = status;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
    this.deletedAt = deleted_at;
    this.likeCount = like_count;
  }

  toJSON() {
    return {
      id: this.id,
      postId: this.postId,
      authorId: this.authorId,
      parentId: this.parentId,
      content: this.deletedAt ? "deleted" : this.content,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      likeCount: this.likeCount,
    };
  }
}
