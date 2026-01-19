import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js'
import { hasPermission, PERMISSIONS } from '../utils/permissions.js'

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
      // Check user authentication and permissions
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return handleSupabaseError(new Error('No authenticated user'))
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return handleSupabaseError(new Error(`Failed to check user role: ${profileError.message}`))
      }

      // Check if user has permission to create products
      if (!hasPermission(profile.role, PERMISSIONS.PRODUCT_CREATE)) {
        return handleSupabaseError(new Error('You do not have permission to create products'))
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
          selected_components: productData.selected_components || [],  // ✅ FIXED: Use correct field name
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
            'Permission denied: You do not have permission to create products. ' +
            'RLS Error: ' + error.message
          ))
        }
        return handleSupabaseError(error)
      }

      // Create admin log for product creation
      if (data && data[0]) {
        try {
          await supabase.from('admin_logs').insert({
            user_id: user.id,
            action_type: 'product_create',
            action_description: `Created product: ${data[0].name}`,
            metadata: {
              product_id: data[0].id,
              product_name: data[0].name,
              product_sku: data[0].sku
            }
          })
        } catch (logError) {
          console.error('Failed to create admin log:', logError)
        }
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
        .order('created_at', { ascending: false})

      if (error) return handleSupabaseError(error)
      
      // Enrich products with full category data
      if (data && data.length > 0) {
        // Get all categories once from the correct table name
        const { data: allCategories } = await supabase
          .from('product_categories')  // ✅ FIXED: Use correct table name
          .select('*')
        
        // Map over products and expand their selected_components
        const enrichedProducts = data.map(product => {
          if (product.selected_components && product.selected_components.length > 0 && allCategories) {
            // Extract component IDs
            const componentIds = product.selected_components.map(comp => comp.id || comp)
            
            // Find matching full category objects
            const fullCategories = allCategories.filter(cat => 
              componentIds.includes(cat.id)
            )
            return {
              ...product,
              selected_components: fullCategories // Replace with full category objects
            }
          }
          return product
        })
        
        return handleSupabaseSuccess(enrichedProducts)
      }
      
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
      // Check user role - managers and admins can update products
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return handleSupabaseError(new Error('No authenticated user'))
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return handleSupabaseError(new Error(`Failed to check user role: ${profileError.message}`))
      }

      // Check if user has permission to edit products
      if (!hasPermission(profile.role, PERMISSIONS.PRODUCT_EDIT)) {
        return handleSupabaseError(new Error('You do not have permission to update products'))
      }

      // Get original product data to track changes
      const { data: originalProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        // Provide more specific error message for RLS issues
        if (error.message.includes('row-level security') || error.message.includes('RLS')) {
          return handleSupabaseError(new Error(
            'Permission denied: You do not have permission to update products. ' +
            'RLS Error: ' + error.message
          ))
        }
        return handleSupabaseError(error)
      }

      // ⚠️ LOGGING REMOVED: Activity logs are now created at the component level
      // (ProductCreate.jsx and ProductView.jsx) where we have full context
      // and can provide detailed before/after change tracking.
      // This prevents duplicate logs and ensures consistent detailed logging.

      return handleSupabaseSuccess(data[0])
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Delete product
  static async deleteProduct(id) {
    try {
      // Check user role - managers and admins can delete products
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return handleSupabaseError(new Error('No authenticated user'))
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return handleSupabaseError(new Error(`Failed to check user role: ${profileError.message}`))
      }

      // Allow admin and manager roles to delete products
      if (profile.role !== 'admin' && profile.role !== 'manager') {
        return handleSupabaseError(new Error('Only admins and managers can delete products'))
      }

      // Get product info before deleting for logging
      const { data: productInfo } = await supabase
        .from('products')
        .select('name, sku')
        .eq('id', id)
        .single()

      // Check if product has order references
      const { data: orderItems, error: orderCheckError } = await supabase
        .from('order_items')
        .select('id')
        .eq('product_id', id)
        .limit(1)

      if (orderCheckError) {
        console.warn('Could not check order references:', orderCheckError)
      }

      // If product has orders, do a soft delete (set status to inactive)
      if (orderItems && orderItems.length > 0) {
        console.log('Product has order history, performing soft delete')
        
        const { data, error } = await supabase
          .from('products')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()

        if (error) {
          if (error.message.includes('row-level security') || error.message.includes('RLS')) {
            return handleSupabaseError(new Error(
              'Permission denied: Only admins and managers can delete products. ' +
              'RLS Error: ' + error.message
            ))
          }
          return handleSupabaseError(error)
        }

        // Create admin log for soft deletion
        if (productInfo) {
          try {
            await supabase.from('admin_logs').insert({
              user_id: user.id,
              action_type: 'product_soft_delete',
              action_description: `Soft deleted product (has order history): ${productInfo.name}`,
              metadata: {
                product_id: id,
                product_name: productInfo.name,
                product_sku: productInfo.sku,
                reason: 'Product has order references'
              }
            })
          } catch (logError) {
            console.error('Failed to create admin log:', logError)
          }
        }

        return handleSupabaseSuccess({
          ...data[0],
          softDeleted: true,
          message: 'Product has been deactivated (has order history). It will no longer appear in the store but order history is preserved.'
        })
      }

      // If no orders, perform hard delete
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        if (error.message.includes('row-level security') || error.message.includes('RLS')) {
          return handleSupabaseError(new Error(
            'Permission denied: Only admins and managers can delete products. ' +
            'RLS Error: ' + error.message
          ))
        }
        // Handle foreign key constraint error
        if (error.message.includes('foreign key') || error.message.includes('violates')) {
          return handleSupabaseError(new Error(
            'Cannot delete product: It is referenced by existing orders. The product will be marked as inactive instead.'
          ))
        }
        return handleSupabaseError(error)
      }

      // Create admin log for product deletion
      if (productInfo) {
        try {
          await supabase.from('admin_logs').insert({
            user_id: user.id,
            action_type: 'product_delete',
            action_description: `Deleted product: ${productInfo.name}`,
            metadata: {
              product_id: id,
              product_name: productInfo.name,
              product_sku: productInfo.sku
            }
          })
        } catch (logError) {
          console.error('Failed to create admin log:', logError)
        }
      }

      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Update product stock
  static async updateStock(id, newQuantity) {
    try {
      // Get user for logging
      const { data: { user } } = await supabase.auth.getUser()

      // Get product info before update
      const { data: productInfo } = await supabase
        .from('products')
        .select('name, stock_quantity')
        .eq('id', id)
        .single()

      const { data, error } = await supabase
        .from('products')
        .update({
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) return handleSupabaseError(error)

      // Create admin log for stock update
      if (user && data && data[0] && productInfo) {
        try {
          await supabase.from('admin_logs').insert({
            user_id: user.id,
            action_type: 'stock_update',
            action_description: `Updated stock for ${productInfo.name}: ${productInfo.stock_quantity} → ${newQuantity}`,
            metadata: {
              product_id: id,
              product_name: productInfo.name,
              old_quantity: productInfo.stock_quantity,
              new_quantity: newQuantity
            }
          })
        } catch (logError) {
          console.error('Failed to create admin log:', logError)
        }
      }

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