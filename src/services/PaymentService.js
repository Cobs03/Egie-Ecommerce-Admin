import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js'

export class PaymentService {
  // Get all payments
  static async getAllPayments() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            id,
            order_number,
            user_id,
            total,
            status,
            delivery_type,
            shipping_address_id,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)
      
      // Fetch shipping addresses directly
      if (data && data.length > 0) {
        const addressIds = data
          .map(payment => payment.orders?.shipping_address_id)
          .filter(Boolean)
        
        if (addressIds.length > 0) {
          const { data: addresses } = await supabase
            .from('shipping_addresses')
            .select('*')
            .in('id', addressIds)
          
          const addressMap = {}
          addresses?.forEach(addr => {
            addressMap[addr.id] = addr
          })
          
          data.forEach(payment => {
            if (payment.orders?.shipping_address_id && addressMap[payment.orders.shipping_address_id]) {
              payment.orders.shipping_addresses = addressMap[payment.orders.shipping_address_id]
            }
          })
        }
      }
      
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get payment by ID
  static async getPaymentById(id) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            id,
            order_number,
            user_id,
            subtotal,
            discount,
            shipping_fee,
            total,
            status,
            delivery_type,
            customer_notes,
            shipping_address_id,
            created_at,
            order_items (
              id,
              product_name,
              product_image,
              variant_name,
              quantity,
              unit_price,
              total
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) return handleSupabaseError(error)
      
      // Fetch shipping address directly
      if (data?.orders?.shipping_address_id) {
        const { data: address } = await supabase
          .from('shipping_addresses')
          .select('*')
          .eq('id', data.orders.shipping_address_id)
          .maybeSingle()
        
        if (address) {
          data.orders.shipping_addresses = address
        }
      }
      
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get payments by status
  static async getPaymentsByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            id,
            order_number,
            total
          )
        `)
        .eq('payment_status', status)
        .order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Update payment status
  static async updatePaymentStatus(id, status, notes = null) {
    try {
      const updateData = {
        payment_status: status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.payment_notes = notes;
      }

      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      } else if (status === 'failed') {
        updateData.failed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', id)
        .select()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data[0])
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get payment statistics
  static async getPaymentStats() {
    try {
      const { count: totalPayments, error: totalError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })

      const { count: pendingPayments, error: pendingError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending')

      const { count: paidPayments, error: paidError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'paid')

      const { count: failedPayments, error: failedError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'failed')

      const { data: revenueData, error: revenueError } = await supabase
        .from('payments')
        .select('amount')
        .eq('payment_status', 'paid')

      if (totalError || pendingError || paidError || failedError || revenueError) {
        return handleSupabaseError(totalError || pendingError || paidError || failedError || revenueError)
      }

      const totalRevenue = revenueData?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

      return handleSupabaseSuccess({
        totalPayments: totalPayments || 0,
        pendingPayments: pendingPayments || 0,
        paidPayments: paidPayments || 0,
        failedPayments: failedPayments || 0,
        totalRevenue: totalRevenue
      })
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get payments by payment method
  static async getPaymentsByMethod(method) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            order_number,
            total
          )
        `)
        .eq('payment_method', method)
        .order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get recent payments
  static async getRecentPayments(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            order_number,
            total
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

  // Mark payment as paid (admin action)
  static async markAsPaid(paymentId) {
    try {
      // Direct update approach - triggers will handle stock deduction
      const { data, error } = await supabase
        .from('payments')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}
