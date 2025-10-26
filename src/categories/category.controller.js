import { Router } from "express";
import { CategoryService } from "./category.service.js";
import { adminRequired, authRequired } from "../middleware/auth.middleware.js";

export const CategoryController = Router();

// GET /api/categories
CategoryController.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 50;
  const sort = req.query.sort || "DESC"; // ASC or DESC

  const categories = await CategoryService.getAllCategories(page, pageSize, sort);
  res.json(categories.map((c) => c.toJSON()));
});

// GET /api/categories/:id
CategoryController.get("/:id", async (req, res) => {
  const category = await CategoryService.getCategoryById(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });
  res.json(category.toJSON());
});

// GET /api/categories/:id/posts?page=1&pageSize=10&sortBy=like_count&order=ASC
CategoryController.get("/:id/posts", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const sortBy = req.query.sortBy || "created_at"; // created_at, like_count, views
  const order = req.query.order || "DESC"; // ASC or DESC

  const posts = await CategoryService.getPostsByCategoryId(req.params.id, page, pageSize, sortBy, order);

  res.json(posts.map((post) => post.toJSON()));
});

// GET /api/categories/slug/:slug/posts?page=1&pageSize=10&sortBy=like_count&order=ASC
CategoryController.get("/slug/:slug/posts", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const sortBy = req.query.sortBy || "created_at"; // created_at, like_count, views
  const order = req.query.order || "DESC"; // ASC or DESC

  try {
    const posts = await CategoryService.getPostsByCategorySlug(req.params.slug, page, pageSize, sortBy, order);

    if (!posts) return res.status(404).json({ error: "Category not found" });

    res.json(posts.map((post) => post.toJSON()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/categories
CategoryController.post("/", adminRequired, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const category = await CategoryService.createCategory({ name, slug, description, authorId: req.user.id });
    res.status(201).json(category.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/categories/:id
CategoryController.patch("/:id", authRequired, async (req, res) => {
  try {
    const category = await CategoryService.updateCategory(req.params.id, req.user.id, req.body);
    res.json(category.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
CategoryController.delete("/:id", authRequired, async (req, res) => {
  try {
    await CategoryService.deleteCategory(req.params.id, req.user.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
