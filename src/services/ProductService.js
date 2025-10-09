import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js'

export class ProductService {
  // Check if current user is admin
  static async checkAdminStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'No authenticated user' }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, isAdmin: data.is_admin }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Create a new product
  static async createProduct(productData) {
    try {
      // First check if user is admin
      const adminCheck = await this.checkAdminStatus()
      if (!adminCheck.success) {
        return handleSupabaseError(new Error(`Admin check failed: ${adminCheck.error}`))
      }
      if (!adminCheck.isAdmin) {
        return handleSupabaseError(new Error('User does not have admin privileges'))
      }

      // Clean data structure that matches the fresh schema
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          warranty: productData.warranty,
          brand_id: productData.brand_id,
          price: productData.price,
          stock_quantity: productData.stock_quantity || 0,
          sku: productData.sku,
          images: productData.images || [],
          selected_components: productData.selectedComponents || [],
          specifications: productData.specifications || {},
          variants: productData.variants || [],
          metadata: productData.metadata || {},
          status: productData.status || 'active'
        }])
        .select()

      if (error) {
        // Provide more specific error message for RLS issues
        if (error.message.includes('row-level security') || error.message.includes('RLS')) {
          return handleSupabaseError(new Error(
            'Permission denied: Please ensure you are logged in as an admin user. ' +
            'RLS Error: ' + error.message
          ))
        }
        return handleSupabaseError(error)
      }
      return handleSupabaseSuccess(data[0])
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get all products
  static async getAllProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Update product
  static async updateProduct(id, productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data[0])
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Delete product
  static async deleteProduct(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Update product stock
  static async updateStock(id, newQuantity) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data[0])
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get low stock products
  static async getLowStockProducts(threshold = 10) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lt('stock_quantity', threshold)
        .eq('is_active', true)

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Search products
  static async searchProducts(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('is_active', true)

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}