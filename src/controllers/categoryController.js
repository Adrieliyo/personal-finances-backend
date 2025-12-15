import { CategoryService } from "../services/categoryService.js";
import { getLocalTime } from "../utils/dateFormatter.js";

export const CategoryController = {
  async createCategory(req, res) {
    try {
      const userId = req.user.id;
      const category = await CategoryService.createCategory(userId, req.body);

      console.log(
        `[${getLocalTime()}] Category created: ${category.name} (${
          category.type
        }) for user: ${userId}`
      );

      res.status(201).json({
        success: true,
        data: category,
        message: "Category created successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error creating category:`,
        error.message
      );
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getUserCategories(req, res) {
    try {
      const userId = req.user.id;
      const { type } = req.query; // ?type=income o ?type=expense

      const categories = await CategoryService.getUserCategories(userId, type);

      console.log(
        `[${getLocalTime()}] Fetched ${categories.length} categories${
          type ? ` (${type})` : ""
        } for user: ${userId}`
      );

      res.status(200).json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error fetching categories:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getCategoryById(req, res) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error fetching category:`,
        error.message
      );
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async updateCategory(req, res) {
    try {
      const userId = req.user.id;
      const category = await CategoryService.updateCategory(
        req.params.id,
        userId,
        req.body
      );

      console.log(`[${getLocalTime()}] Category updated: ${req.params.id}`);

      res.status(200).json({
        success: true,
        data: category,
        message: "Category updated successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error updating category:`,
        error.message
      );

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async deleteCategory(req, res) {
    try {
      const userId = req.user.id;
      await CategoryService.deleteCategory(req.params.id, userId);

      console.log(`[${getLocalTime()}] Category deleted: ${req.params.id}`);

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error deleting category:`,
        error.message
      );

      const statusCode = error.message.includes("permission") ? 403 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getCategoriesStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await CategoryService.getCategoriesStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error(
        `[${getLocalTime()}] Error getting categories stats:`,
        error.message
      );
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
