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

  // Upload category image to Supabase Storage
  static async uploadCategoryImage(file, categoryName) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      // Upload to Supabase Storage (you can change 'products' to 'categories' bucket if you have one)
      const { data, error } = await supabase.storage
        .from('products') // or 'categories' if you create a separate bucket
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return {
        success: true,
        data: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error uploading category image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete category image from storage
  static async deleteCategoryImage(imageUrl) {
    try {
      if (!imageUrl) return { success: true };

      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'products');
      if (bucketIndex === -1) return { success: true };

      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from('products')
        .remove([filePath]);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting category image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}