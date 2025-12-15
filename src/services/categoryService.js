import { CategoryModel } from "../models/categoryModel.js";

export const CategoryService = {
  async createCategory(userId, categoryData) {
    // Validar que el tipo sea válido
    if (!["income", "expense"].includes(categoryData.type)) {
      throw new Error("Invalid category type. Must be 'income' or 'expense'");
    }

    // Verificar si ya existe una categoría con el mismo nombre para este usuario
    try {
      const existingCategory = await CategoryModel.findByName(
        userId,
        categoryData.name
      );
      if (existingCategory) {
        throw new Error(
          `Ya existe una categoría con el nombre "${categoryData.name}"`
        );
      }
    } catch (error) {
      if (
        !error.message.includes("Ya existe una categoría") &&
        !error.message.includes("JSON object requested")
      ) {
        // Ignorar error de "no encontrado"
      } else if (error.message.includes("Ya existe una categoría")) {
        throw error;
      }
    }

    const newCategory = {
      user_id: userId,
      name: categoryData.name.trim(),
      type: categoryData.type,
    };

    return await CategoryModel.create(newCategory);
  },

  async getUserCategories(userId, type = null) {
    if (type) {
      // Validar que el tipo sea válido
      if (!["income", "expense"].includes(type)) {
        throw new Error("Invalid category type. Must be 'income' or 'expense'");
      }
      return await CategoryModel.findByUserIdAndType(userId, type);
    }

    return await CategoryModel.findByUserId(userId);
  },

  async getCategoryById(id) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  },

  async updateCategory(id, userId, categoryData) {
    // Verificar que la categoría existe y pertenece al usuario
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.user_id !== userId) {
      throw new Error("You don't have permission to update this category");
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (categoryData.name && categoryData.name !== category.name) {
      try {
        const existingCategory = await CategoryModel.findByName(
          userId,
          categoryData.name
        );
        if (existingCategory && existingCategory.id !== id) {
          throw new Error(
            `Ya existe una categoría con el nombre "${categoryData.name}"`
          );
        }
      } catch (error) {
        if (
          !error.message.includes("Ya existe una categoría") &&
          !error.message.includes("JSON object requested")
        ) {
          // Ignorar error de "no encontrado"
        } else if (error.message.includes("Ya existe una categoría")) {
          throw error;
        }
      }
    }

    // Validar tipo si se está actualizando
    if (
      categoryData.type &&
      !["income", "expense"].includes(categoryData.type)
    ) {
      throw new Error("Invalid category type. Must be 'income' or 'expense'");
    }

    const updateData = {};
    if (categoryData.name) updateData.name = categoryData.name.trim();
    if (categoryData.type) updateData.type = categoryData.type;

    return await CategoryModel.update(id, updateData);
  },

  async deleteCategory(id, userId) {
    // Verificar que la categoría existe y pertenece al usuario
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.user_id !== userId) {
      throw new Error("You don't have permission to delete this category");
    }

    return await CategoryModel.delete(id);
  },

  async getCategoriesStats(userId) {
    const allCategories = await CategoryModel.findByUserId(userId);

    const stats = {
      total: allCategories.length,
      income: allCategories.filter((cat) => cat.type === "income").length,
      expense: allCategories.filter((cat) => cat.type === "expense").length,
    };

    return stats;
  },
};
