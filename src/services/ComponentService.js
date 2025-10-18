import { supabase } from '../lib/supabase';

export class ComponentService {
  /**
   * Get all unique component categories from the components table
   * @returns {Promise<{success: boolean, data: string[], error: any}>}
   */
  static async getComponentCategories() {
    try {
      // Query to get distinct categories from components table
      const { data, error } = await supabase
        .from('components')
        .select('category')
        .eq('is_active', true)
        .order('category');

      if (error) {
        console.error('❌ Error fetching component categories:', error);
        return { success: false, data: [], error };
      }

      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      
      console.log('✅ Fetched component categories:', uniqueCategories);
      
      return {
        success: true,
        data: uniqueCategories.sort(),
        error: null
      };
    } catch (error) {
      console.error('❌ Exception in getComponentCategories:', error);
      return { success: false, data: [], error };
    }
  }

  /**
   * Get all components from the database
   * @returns {Promise<{success: boolean, data: Array, error: any}>}
   */
  static async getAllComponents() {
    try {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('name');

      if (error) {
        console.error('❌ Error fetching components:', error);
        return { success: false, data: [], error };
      }

      console.log(`✅ Fetched ${data.length} components from database`);
      
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error) {
      console.error('❌ Exception in getAllComponents:', error);
      return { success: false, data: [], error };
    }
  }

  /**
   * Get components by category
   * @param {string} category - The component category (e.g., 'CPU', 'GPU', 'RAM')
   * @returns {Promise<{success: boolean, data: Array, error: any}>}
   */
  static async getComponentsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error(`❌ Error fetching components for category ${category}:`, error);
        return { success: false, data: [], error };
      }

      console.log(`✅ Fetched ${data.length} components for category: ${category}`);
      
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error) {
      console.error(`❌ Exception in getComponentsByCategory for ${category}:`, error);
      return { success: false, data: [], error };
    }
  }
}

export default ComponentService;
