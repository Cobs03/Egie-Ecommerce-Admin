import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js'

export class OrderService {
  // Get all orders
  static async getAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              name,
              images
            )
          ),
          customers (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get order by ID
  static async getOrderById(id) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              name,
              images,
              description
            )
          ),
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Update order status
  static async updateOrderStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: status,
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

  // Get orders by status
  static async getOrdersByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              name,
              images
            )
          ),
          customers (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get order statistics
  static async getOrderStats() {
    try {
      const { data: totalOrders, error: totalError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })

      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('status', 'pending')

      const { data: completedOrders, error: completedError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('status', 'completed')

      const { data: cancelledOrders, error: cancelledError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('status', 'cancelled')

      if (totalError || pendingError || completedError || cancelledError) {
        return handleSupabaseError(totalError || pendingError || completedError || cancelledError)
      }

      return handleSupabaseSuccess({
        total: totalOrders.length,
        pending: pendingOrders.length,
        completed: completedOrders.length,
        cancelled: cancelledOrders.length
      })
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}