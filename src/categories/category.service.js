import { PostEntity } from "../posts/post.entity.js";
import { CategoryRepository } from "./category.repository.js";

export class CategoryService {
  static async getAllCategories(page = 1, pageSize = 50, sort = "DESC") {
    const offset = (page - 1) * pageSize;
    let categories = await CategoryRepository.findAll(offset, pageSize, sort);

    categories = categories.filter((c) => !c.deletedAt);

    return categories;
  }

  static async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category || category.deletedAt) {
      return null;
    }
    return category;
  }

  static async getPostsByCategoryId(id, page = 1, pageSize = 10, sortBy = "created_at", order = "DESC") {
    const offset = (page - 1) * pageSize;
    const posts = await CategoryRepository.findPostsByCategoryId(id, offset, pageSize, sortBy, order);

    return posts.filter((post) => !post.deleted_at).map((post) => new PostEntity(post));
  }

  static async createCategory({ name, slug, description, authorId }) {
    if (!authorId) throw new Error("Author is required");
    return CategoryRepository.create({ name, slug, description, createdBy: authorId });
  }

  static async updateCategory(id, authorId, fields) {
    const category = await CategoryRepository.findById(id);
    if (!category) throw new Error("Category not found");

    if (category.createdBy !== authorId) {
      throw new Error("Unauthorized");
    }

    return CategoryRepository.update(id, fields);
  }

  static async deleteCategory(id, authorId) {
    const category = await CategoryRepository.findById(id);
    if (!category) throw new Error("Category not found");

    if (category.createdBy !== authorId) {
      throw new Error("Unauthorized");
    }

    return CategoryRepository.softDelete(id);
  }

  static async getPostsByCategorySlug(slug, page = 1, pageSize = 10, sortBy = "created_at", order = "DESC") {
    const category = await CategoryRepository.findBySlug(slug);
    if (!category || category.deletedAt) return null;

    const offset = (page - 1) * pageSize;
    const posts = await CategoryRepository.findPostsByCategoryId(category.id, offset, pageSize, sortBy, order);

    return posts.filter((post) => !post.deleted_at).map((post) => new PostEntity(post));
  }
}
