import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js';

export class ShippingService {
  // Helper method to fetch user profiles
  static async getUserProfiles(userIds) {
    if (!userIds || userIds.length === 0) return {};

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, avatar_url')
      .in('id', userIds);

    const profileMap = {};
    profiles?.forEach(profile => {
      profileMap[profile.id] = profile;
    });

    return profileMap;
  }

  // Get all shipped orders (status: shipped or delivered)
  static async getAllShipments() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, images)
          ),
          payments(*)
        `)
        .in('status', ['shipped', 'delivered'])
        .order('shipped_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) return handleSupabaseError(error);

      // Fetch related data separately
      if (data && data.length > 0) {
        // Fetch user profiles
        const userIds = data.map(order => order.user_id).filter(Boolean);
        const profileMap = await this.getUserProfiles(userIds);

        // Fetch shipping addresses
        const addressIds = data.map(order => order.shipping_address_id).filter(Boolean);
        console.log('🚚 SERVICE - Address IDs to fetch:', addressIds);
        
        if (addressIds.length > 0) {
          const { data: addresses } = await supabase
            .from('shipping_addresses')
            .select('*')
            .in('id', addressIds);
          
          console.log('🚚 SERVICE - Fetched addresses:', addresses);
          
          const addressMap = {};
          addresses?.forEach(addr => {
            addressMap[addr.id] = addr;
          });
          
          console.log('🚚 SERVICE - Address map:', addressMap);
          
          // Attach data to each order
          data.forEach(order => {
            order.user_profile = profileMap[order.user_id] || null;
            if (order.shipping_address_id && addressMap[order.shipping_address_id]) {
              order.shipping_addresses = addressMap[order.shipping_address_id];
              console.log(`🚚 SERVICE - Attached address to order ${order.order_number}:`, order.shipping_addresses);
            }
          });
        } else {
          console.log('🚚 SERVICE - No address IDs found');
          // Just attach profiles if no addresses
          data.forEach(order => {
            order.user_profile = profileMap[order.user_id] || null;
          });
        }
      }

      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get shipment by order ID
  static async getShipmentById(orderId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, images)
          ),
          payments(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) return handleSupabaseError(error);

      // Fetch related data separately
      if (data) {
        // Fetch user profile
        if (data.user_id) {
          const profileMap = await this.getUserProfiles([data.user_id]);
          data.user_profile = profileMap[data.user_id] || null;
        }

        // Fetch shipping address
        if (data.shipping_address_id) {
          const { data: address } = await supabase
            .from('shipping_addresses')
            .select('*')
            .eq('id', data.shipping_address_id)
            .single();
          
          if (address) {
            data.shipping_addresses = address;
          }
        }
      }

      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Update tracking information
  static async updateTrackingInfo(orderId, trackingData) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          courier_name: trackingData.courierName,
          tracking_number: trackingData.trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();

      if (error) return handleSupabaseError(error);

      return handleSupabaseSuccess(data[0]);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
}
