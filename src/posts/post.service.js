import { PostRepository } from './post.repository.js';
import { CategoryRepository } from '../categories/category.repository.js';
import { CategoryEntity } from '../categories/category.entity.js';

export class PostService {
    static async getAllPosts(page = 1, pageSize = 10) {
        const offset = (page - 1) * pageSize;
        return PostRepository.findAll(offset, pageSize);
    }

    static async getPostById(postId) {
        return PostRepository.findById(postId);
    }

    static async getPostsByAuthorId(authorId) {
        return PostRepository.findByAuthorId(authorId);
    }

    static async createPost(authorId, { title, content, categoryIds }) {
        if (!authorId) throw new Error('Author is required');
        if (!title || title.trim() === '') throw new Error('Title is required');
        if (!content || content.trim() === '') throw new Error('Content is required');
        if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
            throw new Error('At least one category is required');
        }

        if (categoryIds.length > 10) {
            throw new Error('Maximum 10 categories are allowed per post');
        }

        const categories = await Promise.all(categoryIds.map((id) => CategoryRepository.findById(id)));
        const notFound = categoryIds.filter((id, idx) => !categories[idx]);
        const deleted = categories.filter((c) => c && c.deletedAt).map((c) => c.id);

        if (notFound.length > 0 || deleted.length > 0) {
            const errorObj = {};
            if (notFound.length > 0) errorObj['Categories not found'] = notFound;
            if (deleted.length > 0) errorObj['Categories deleted'] = deleted;
            const err = new Error();
            err.details = errorObj;
            throw err;
        }

        const post = await PostRepository.create({ authorId, title, content });
        await CategoryRepository.replacePostCategories(post.id, categoryIds);

        return this.getPostById(post.id);
    }

    static async updatePost(postId, authorId, fields) {
        const post = await PostRepository.findById(postId);
        if (!post) throw new Error('Post not found');
        if (post.authorId !== authorId) throw new Error('Unauthorized');
        if (!fields || Object.keys(fields).length === 0) throw new Error('No fields to update');

        const { categoryIds, ...postFields } = fields;

        if (postFields.title && postFields.title.trim() === '') throw new Error('Title cannot be empty');
        if (postFields.content && postFields.content.trim() === '') throw new Error('Content cannot be empty');

        let updatedPost = post;
        if (Object.keys(postFields).length > 0) {
            updatedPost = await PostRepository.update(postId, postFields);
        }

        if (categoryIds) {
            if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
                throw new Error('At least one category is required');
            }

            if (categoryIds.length > 10) {
                throw new Error('Maximum 10 categories are allowed per post');
            }

            const categories = await Promise.all(categoryIds.map((id) => CategoryRepository.findById(id)));
            const notFound = categoryIds.filter((id, idx) => !categories[idx]);
            const deleted = categories.filter((c) => c && c.deletedAt).map((c) => c.id);

            if (notFound.length > 0 || deleted.length > 0) {
                const errorObj = {};
                if (notFound.length > 0) errorObj['Categories not found'] = notFound;
                if (deleted.length > 0) errorObj['Categories deleted'] = deleted;
                const err = new Error();
                err.details = errorObj;
                throw err;
            }

            await CategoryRepository.replacePostCategories(postId, categoryIds);
        }

        return this.getPostById(postId);
    }

    static async deletePost(postId, authorId) {
        const post = await PostRepository.findById(postId);
        if (!post) throw new Error('Post not found');
        if (post.authorId !== authorId) throw new Error('Unauthorized');

        return PostRepository.softDelete(postId);
    }

    static async getCategoriesByPostId(postId) {
        const categories = await CategoryRepository.getPostCategories(postId);
        return categories.filter((c) => !c.deletedAt).map((c) => new CategoryEntity(c));
    }

    static async addCategoriesToPost(postId, authorId, categoryIds) {
        const post = await PostRepository.findById(postId);
        if (!post) throw new Error('Post not found');
        if (post.authorId !== authorId) throw new Error('Unauthorized');

        if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
            throw new Error('categoryIds must be a non-empty array');
        }

        const categories = await Promise.all(categoryIds.map((id) => CategoryRepository.findById(id)));
        const notFound = categoryIds.filter((id, idx) => !categories[idx]);
        const deleted = categories.filter((c) => c && c.deletedAt).map((c) => c.id);

        if (notFound.length > 0 || deleted.length > 0) {
            const errorObj = {};
            if (notFound.length > 0) errorObj['Categories not found'] = notFound;
            if (deleted.length > 0) errorObj['Categories deleted'] = deleted;
            const err = new Error();
            err.details = errorObj;
            throw err;
        }

        // --- 🔑 фильтруем только новые ---
        const existingCategories = await this.getCategoriesByPostId(postId);
        const existingIds = existingCategories.map((c) => c.id);

        const newCategoryIds = categoryIds.filter((id) => !existingIds.includes(id));

        const totalCategories = existingIds.length + newCategoryIds.length;
        if (totalCategories > 10) {
            throw new Error(
                `Maximum 10 categories are allowed per post. Currently: ${existingIds.length}, adding: ${newCategoryIds.length}`,
            );
        }

        if (newCategoryIds.length > 0) {
            await CategoryRepository.attachToPost(postId, newCategoryIds);
        }

        return this.getCategoriesByPostId(postId);
    }


    static async replaceCategoriesOfPost(postId, authorId, categoryIds) {
        const post = await PostRepository.findById(postId);
        if (!post) throw new Error('Post not found');
        if (post.authorId !== authorId) throw new Error('Unauthorized');

        if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
            throw new Error('At least one category is required');
        }

        if (categoryIds.length > 10) {
            throw new Error('Maximum 10 categories are allowed per post');
        }

        const categories = await Promise.all(categoryIds.map((id) => CategoryRepository.findById(id)));
        const notFound = categoryIds.filter((id, idx) => !categories[idx]);
        const deleted = categories.filter((c) => c && c.deletedAt).map((c) => c.id);

        if (notFound.length > 0 || deleted.length > 0) {
            const errorObj = {};
            if (notFound.length > 0) errorObj['Categories not found'] = notFound;
            if (deleted.length > 0) errorObj['Categories deleted'] = deleted;
            const err = new Error();
            err.details = errorObj;
            throw err;
        }

        await CategoryRepository.replacePostCategories(postId, categoryIds);
        return this.getCategoriesByPostId(postId);
    }
}
