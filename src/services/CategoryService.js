import { supabase } from '../lib/supabase';

export class CategoryService {
  // Get all active categories
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get category with specifications
  static async getCategoryWithSpecs(categoryId) {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          *,
          category_specifications (*)
        `)
        .eq('id', categoryId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching category with specs:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get specifications for a category
  static async getCategorySpecifications(categoryId) {
    try {
      const { data, error } = await supabase
        .from('category_specifications')
        .select('*')
        .eq('category_id', categoryId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching category specifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create new category
  static async createCategory(categoryData) {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create specification for category
  static async createSpecification(specData) {
    try {
      const { data, error } = await supabase
        .from('category_specifications')
        .insert([specData])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating specification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save product category assignment
  static async saveProductCategoryAssignment(productId, categoryId, specifications) {
    try {
      const { data, error } = await supabase
        .from('product_category_assignments')
        .upsert([{
          product_id: productId,
          category_id: categoryId,
          specifications: specifications
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error saving product category assignment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get product's category assignments
  static async getProductCategories(productId) {
    try {
      const { data, error } = await supabase
        .from('product_category_assignments')
        .select(`
          *,
          product_categories (*)
        `)
        .eq('product_id', productId);

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update category
  static async updateCategory(categoryId, categoryData) {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .update(categoryData)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete category
  static async deleteCategory(categoryId) {
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create specification for category
  static async createSpecification(specData) {
    try {
      const { data, error } = await supabase
        .from('category_specifications')
        .insert([specData])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating specification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update specification
  static async updateSpecification(specId, specData) {
    try {
      const { data, error } = await supabase
        .from('category_specifications')
        .update(specData)
        .eq('id', specId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating specification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete specification
  static async deleteSpecification(specId) {
    try {
      const { error } = await supabase
        .from('category_specifications')
        .delete()
        .eq('id', specId);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting specification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}