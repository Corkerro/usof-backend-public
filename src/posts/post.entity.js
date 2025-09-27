import { CategoryEntity } from '../categories/category.entity.js';

export class PostEntity {
    constructor({ 
        id, 
        author_id, 
        title, 
        content, 
        status, 
        created_at, 
        updated_at, 
        categories = [], 
        likeCount = 0 
    }) {
        this.id = id;
        this.authorId = author_id;
        this.title = title;
        this.content = content;
        this.status = status;
        this.createdAt = created_at;
        this.updatedAt = updated_at;
        this.categories = categories.map((c) => (c instanceof CategoryEntity ? c : new CategoryEntity(c)));
        this.likeCount = likeCount;
        
        this.images = this.extractImagesFromContent(content);
    }

    extractImagesFromContent(content) {
        const imageRegex = /<img[^>]+src="([^">]+)"/g;
        const images = [];
        let match;
        
        while ((match = imageRegex.exec(content)) !== null) {
            images.push(match[1]);
        }
        
        return images;
    }

    toJSON() {
        return {
            id: this.id,
            authorId: this.authorId,
            title: this.title,
            content: this.content,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            likeCount: this.likeCount,
            categories: this.categories.map((c) => c.toJSON()),
            images: this.images
        };
    }
}