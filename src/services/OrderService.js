import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js'

export class OrderService {
  // Get all orders with full details
  static async getAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_image,
            variant_name,
            quantity,
            unit_price,
            subtotal,
            discount,
            total
          ),
          payments (
            id,
            transaction_id,
            payment_method,
            amount,
            payment_status,
            card_last_four,
            card_type,
            gcash_reference,
            gcash_phone,
            created_at,
            paid_at,
            failed_at
          ),
          shipping_addresses (
            id,
            full_name,
            phone,
            email,
            street_address,
            city,
            province,
            postal_code,
            country
          ),
          profiles!orders_user_id_fkey (
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
            product_name,
            product_image,
            variant_name,
            quantity,
            unit_price,
            subtotal,
            discount,
            total
          ),
          payments (
            id,
            transaction_id,
            payment_method,
            amount,
            payment_status,
            card_last_four,
            card_type,
            gcash_reference,
            gcash_phone,
            payment_notes,
            created_at,
            paid_at,
            failed_at
          ),
          shipping_addresses (
            id,
            full_name,
            phone,
            email,
            street_address,
            city,
            province,
            postal_code,
            country,
            address_type
          ),
          profiles!orders_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone,
            avatar_url
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
      const timestampField = status === 'confirmed' ? 'confirmed_at' 
                           : status === 'delivered' ? 'delivered_at'
                           : status === 'cancelled' ? 'cancelled_at'
                           : null;

      const updateData = {
        status: status,
        updated_at: new Date().toISOString()
      };

      if (timestampField) {
        updateData[timestampField] = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()

      if (error) return handleSupabaseError(error)
      
      // If order is cancelled, also cancel the payment
      if (status === 'cancelled') {
        await supabase
          .from('payments')
          .update({ payment_status: 'cancelled' })
          .eq('order_id', id);
      }
      
      return handleSupabaseSuccess(data[0])
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get orders by status
  static async getOrdersByStatus(status) {
    try {
      const { data, error} = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_image,
            variant_name,
            quantity,
            unit_price,
            total
          ),
          payments (
            id,
            transaction_id,
            payment_method,
            amount,
            payment_status
          ),
          shipping_addresses (
            id,
            full_name,
            phone,
            street_address,
            city,
            province
          ),
          profiles!orders_user_id_fkey (
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
      const { count: totalOrders, error: totalError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      const { count: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { count: completedOrders, error: completedError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      const { count: cancelledOrders, error: cancelledError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled')

      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total')
        .eq('status', 'completed')

      if (totalError || pendingError || completedError || cancelledError || revenueError) {
        return handleSupabaseError(totalError || pendingError || completedError || cancelledError || revenueError)
      }

      const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

      return handleSupabaseSuccess({
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        completedOrders: completedOrders || 0,
        cancelledOrders: cancelledOrders || 0,
        totalRevenue: totalRevenue
      })
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Update order notes (admin only)
  static async updateOrderNotes(id, notes) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          order_notes: notes,
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

  // Get recent orders (for dashboard)
  static async getRecentOrders(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            total
          ),
          payments (
            payment_method,
            payment_status
          ),
          profiles!orders_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
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