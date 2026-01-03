import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js'

export class OrderService {
  // Helper function to fetch user profiles for orders
  static async getUserProfiles(userIds) {
    try {
      const uniqueUserIds = [...new Set(userIds)]; // Remove duplicates

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, avatar_url')
        .in('id', uniqueUserIds);

      if (error) {
        console.error('Error fetching profiles:', error);
        return {};
      }

      // Create a map of user_id -> profile for easy lookup
      const profileMap = {};
      data?.forEach(profile => {
        profileMap[profile.id] = profile;
      });

      return profileMap;
    } catch (error) {
      console.error('Error in getUserProfiles:', error);
      return {};
    }
  }

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
          )
        `)
        .order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)

      // Fetch shipping addresses directly
      if (data && data.length > 0) {
        const addressIds = data.map(order => order.shipping_address_id).filter(Boolean)
        
        if (addressIds.length > 0) {
          const { data: addresses } = await supabase
            .from('shipping_addresses')
            .select('*')
            .in('id', addressIds)
          
          const addressMap = {}
          addresses?.forEach(addr => {
            addressMap[addr.id] = addr
          })
          
          data.forEach(order => {
            if (order.shipping_address_id && addressMap[order.shipping_address_id]) {
              order.shipping_addresses = addressMap[order.shipping_address_id]
            }
          })
        }        // Fetch user profiles for all orders
        const userIds = data.map(order => order.user_id).filter(Boolean);
        const profileMap = await this.getUserProfiles(userIds);

        // Attach profile data to each order
        data.forEach(order => {
          order.user_profile = profileMap[order.user_id] || null;
        });
      }

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
          )
        `)
        .eq('id', id)
        .single()

      if (error) return handleSupabaseError(error)

      // Fetch shipping address directly
      if (data && data.shipping_address_id) {
        console.log('🔍 Fetching shipping address for ID:', data.shipping_address_id)
        
        // Try direct query first (will work if RLS allows)
        let addressData = null
        const { data: addr, error: addrError } = await supabase
          .from('shipping_addresses')
          .select('*')
          .eq('id', data.shipping_address_id)
          .maybeSingle()
        
        if (!addrError && addr) {
          addressData = addr
          console.log('✅ Address fetched directly:', addr)
        } else {
          console.warn('⚠️ Direct fetch failed, trying query builder')
          // Alternative: use the shipping_address_id relationship
          const { data: orderWithAddr } = await supabase
            .from('orders')
            .select(`
              shipping_addresses:shipping_address_id (
                id, user_id, full_name, phone, email,
                street_address, barangay, city, province,
                postal_code, country, address_type, is_default
              )
            `)
            .eq('id', data.id)
            .single()
          
          if (orderWithAddr?.shipping_addresses) {
            addressData = orderWithAddr.shipping_addresses
            console.log('✅ Address fetched via join:', addressData)
          }
        }
        
        data.shipping_addresses = addressData
      }      // Fetch user profile for this order
      if (data && data.user_id) {
        const profileMap = await this.getUserProfiles([data.user_id]);
        data.user_profile = profileMap[data.user_id] || null;
      }

      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Update order status with optional shipping info
  static async updateOrderStatus(id, status, shippingInfo = null) {
    try {
      // Direct update approach - triggers will handle stock deduction
      const updateData = {
        status: status,
        updated_at: new Date().toISOString()
      };

      // Add timestamp fields
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
        if (shippingInfo) {
          updateData.courier_name = shippingInfo.courierName;
          updateData.tracking_number = shippingInfo.trackingNumber;
        }
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }
      // Note: ready_for_pickup doesn't need a separate timestamp column
      // It uses updated_at which is automatically set

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) return handleSupabaseError(error)

      // Update payment status based on order status
      if (status === 'cancelled') {
        // If order is cancelled, also cancel the payment
        await supabase
          .from('payments')
          .update({ 
            payment_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('order_id', id);
      } else if (status === 'completed') {
        // If order is completed, mark payment as completed
        await supabase
          .from('payments')
          .update({ 
            payment_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('order_id', id)
          .eq('payment_status', 'paid'); // Only update if already paid
      }

      return handleSupabaseSuccess(data)
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

  // Get order logs from admin_logs table
  static async getOrderLogs(orderId) {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          *,
          user:user_id(
            full_name,
            email,
            role
          )
        `)
        .eq('target_type', 'Orders')
        .eq('target_id', orderId)
        .order('created_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Add manual order log entry to admin_logs
  static async addOrderLog(orderId, actionType, description, metadata = {}) {
    try {
      const { data, error } = await supabase
        .rpc('add_order_log', {
          p_order_id: orderId,
          p_action_type: actionType,
          p_description: description,
          p_metadata: metadata
        });

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
}

