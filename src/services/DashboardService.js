import { supabase } from '../lib/supabase';

export class DashboardService {
  // Get total sales (sum of all completed orders)
  static async getTotalSales(period = 'week') {
    try {
      const now = new Date();
      let startDate = new Date();
      let previousStartDate = new Date();
      
      // Calculate date range based on period
      if (period === 'day') {
        startDate.setHours(0, 0, 0, 0);
        previousStartDate.setDate(now.getDate() - 1);
        previousStartDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
      }

      // Get current period orders
      const { data, error } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .gte('created_at', startDate.toISOString())
        .in('status', ['completed', 'delivered']);

      if (error) throw error;

      const currentTotal = (data || []).reduce((sum, order) => sum + Number(order.total || 0), 0);

      // Get previous period orders
      const { data: previousData } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .in('status', ['completed', 'delivered']);

      const previousTotal = (previousData || []).reduce((sum, order) => sum + Number(order.total || 0), 0);
      const percentageChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : (currentTotal > 0 ? 100 : 0);

      return {
        success: true,
        total: currentTotal,
        percentage: Math.abs(percentageChange),
        isIncrease: percentageChange >= 0
      };
    } catch (error) {
      console.error('Error fetching total sales:', error);
      return { success: false, error: error.message, total: 0, percentage: 0, isIncrease: false };
    }
  }

  // Get total orders count
  static async getTotalOrders(period = 'month') {
    try {
      const now = new Date();
      let startDate = new Date();
      let previousStartDate = new Date();
      
      if (period === 'day') {
        startDate.setHours(0, 0, 0, 0);
        previousStartDate.setDate(now.getDate() - 1);
        previousStartDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
      }

      const { count: currentCount, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Get previous period count
      const { count: previousCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const percentageChange = previousCount > 0 ? ((currentCount - previousCount) / previousCount * 100) : (currentCount > 0 ? 100 : 0);

      return {
        success: true,
        total: currentCount || 0,
        percentage: Math.abs(percentageChange),
        isIncrease: percentageChange >= 0
      };
    } catch (error) {
      console.error('Error fetching total orders:', error);
      return { success: false, error: error.message, total: 0, percentage: 0, isIncrease: false };
    }
  }

  // Get average order value
  static async getAverageOrderValue(period = 'month') {
    try {
      const now = new Date();
      let startDate = new Date();
      let previousStartDate = new Date();
      
      if (period === 'day') {
        startDate.setHours(0, 0, 0, 0);
        previousStartDate.setDate(now.getDate() - 1);
        previousStartDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
      }

      // Get current period orders
      const { data, error } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', startDate.toISOString())
        .in('status', ['completed', 'delivered']);

      if (error) throw error;

      const currentTotal = (data || []).reduce((sum, order) => sum + Number(order.total || 0), 0);
      const currentCount = data?.length || 0;
      const currentAverage = currentCount > 0 ? currentTotal / currentCount : 0;

      // Get previous period orders
      const { data: previousData } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .in('status', ['completed', 'delivered']);

      const previousTotal = (previousData || []).reduce((sum, order) => sum + Number(order.total || 0), 0);
      const previousCount = previousData?.length || 0;
      const previousAverage = previousCount > 0 ? previousTotal / previousCount : 0;

      const percentageChange = previousAverage > 0 ? ((currentAverage - previousAverage) / previousAverage * 100) : (currentAverage > 0 ? 100 : 0);

      return {
        success: true,
        average: currentAverage,
        percentage: Math.abs(percentageChange),
        isIncrease: percentageChange >= 0
      };
    } catch (error) {
      console.error('Error fetching average order value:', error);
      return { success: false, error: error.message, average: 0, percentage: 0, isIncrease: false };
    }
  }

  // Get total users count (always shows total, but growth % is based on period)
  static async getTotalUsers(period = 'month') {
    try {
      // Always get total count of all users
      const { count: totalCount, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (error) throw error;

      // Calculate growth based on new users in the selected period
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'day') {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      const { count: newUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .gte('created_at', startDate.toISOString());

      const previousTotal = (totalCount || 0) - (newUsersCount || 0);
      const percentageChange = previousTotal > 0 ? ((newUsersCount || 0) / previousTotal * 100) : ((newUsersCount || 0) > 0 ? 100 : 0);

      return {
        success: true,
        total: totalCount || 0,
        percentage: Math.abs(percentageChange),
        isIncrease: (newUsersCount || 0) > 0
      };
    } catch (error) {
      console.error('Error fetching total users:', error);
      return { success: false, error: error.message, total: 0, percentage: 0, isIncrease: false };
    }
  }

  // Get new users in the specified period
  static async getNewUsers(period = 'week') {
    try {
      const now = new Date();
      let startDate = new Date();
      let previousStartDate = new Date();
      
      if (period === 'day') {
        startDate.setHours(0, 0, 0, 0);
        previousStartDate.setDate(now.getDate() - 1);
        previousStartDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
      }

      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Get previous period count
      const { count: previousCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const percentageChange = previousCount > 0 ? ((count - previousCount) / previousCount * 100) : (count > 0 ? 100 : 0);

      return {
        success: true,
        total: count || 0,
        percentage: Math.abs(percentageChange),
        isIncrease: percentageChange >= 0
      };
    } catch (error) {
      console.error('Error fetching new users:', error);
      return { success: false, error: error.message, total: 0, percentage: 0, isIncrease: false };
    }
  }

  // Get shipping status counts
  static async getShippingStats() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, delivery_type')
        .neq('status', 'cancelled');

      if (error) throw error;

      const stats = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        pickup: 0,
        readyForPickup: 0
      };

      data.forEach(order => {
        if (order.status === 'pending') stats.pending++;
        else if (order.status === 'confirmed' || order.status === 'processing') stats.processing++;
        else if (order.status === 'shipped') stats.shipped++;
        else if (order.status === 'delivered' || order.status === 'completed') stats.delivered++;
        else if (order.status === 'ready_for_pickup') stats.readyForPickup++;
        
        if (order.delivery_type === 'pickup' || order.delivery_type === 'store_pickup') {
          stats.pickup++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching shipping stats:', error);
      return {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        pickup: 0,
        readyForPickup: 0
      };
    }
  }

  // Get active orders count
  static async getActiveOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status');

      if (error) throw error;

      const activeStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'ready_for_pickup'];
      const count = (data || []).filter(order => activeStatuses.includes(order.status)).length;

      return { success: true, total: count };
    } catch (error) {
      console.error('Error fetching active orders:', error);
      return { success: false, error: error.message, total: 0 };
    }
  }

  // Get cancelled orders count
  static async getCancelledOrders() {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');

      if (error) throw error;

      return { success: true, total: count || 0 };
    } catch (error) {
      console.error('Error fetching cancelled orders:', error);
      return { success: false, error: error.message, total: 0 };
    }
  }

  // Get active discounts count
  static async getActiveDiscounts() {
    try {
      const now = new Date().toISOString();
      
      const { count, error } = await supabase
        .from('vouchers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('valid_until', now);

      if (error) throw error;

      return { success: true, total: count || 0 };
    } catch (error) {
      console.error('Error fetching active discounts:', error);
      return { success: false, error: error.message, total: 0 };
    }
  }

  // Get recent orders
  static async getRecentOrders(limit = 10) {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (ordersError) throw ordersError;

      // Fetch user profiles separately
      const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) console.error('Error fetching profiles:', profilesError);

      // Map profiles to orders
      const profileMap = (profiles || []).reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      // Format the data with proper time calculations
      const formattedData = (orders || []).map(order => {
        const profile = profileMap[order.user_id];
        const timeAgo = this.calculateTimeAgo(order.created_at);
        return {
          id: order.id,
          orderNumber: order.order_number,
          customerName: profile?.full_name || 'Guest',
          timeAgo,
          status: order.status,
        };
      });

      return { success: true, data: formattedData };
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Helper method to calculate time ago
  static calculateTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  // Get inventory stats
  static async getInventoryStats() {
    try {
      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock_quantity, status');

      if (productsError) throw productsError;

      // Get all bundles
      const { count: bundlesCount, error: bundlesError } = await supabase
        .from('bundles')
        .select('*', { count: 'exact', head: true });

      if (bundlesError) throw bundlesError;

      const stats = {
        totalProducts: products.length,
        lowStock: 0,
        outOfStock: 0,
        totalBundles: bundlesCount || 0
      };

      products.forEach(product => {
        const stock = Number(product.stock_quantity) || 0;
        if (stock === 0) {
          stats.outOfStock++;
        } else if (stock <= 10) {
          stats.lowStock++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      return {
        totalProducts: 0,
        lowStock: 0,
        outOfStock: 0,
        totalBundles: 0
      };
    }
  }

  // Get most clicked products (based on product views)
  static async getMostClickedProducts(limit = 5) {
    try {
      // Use database function for better performance and to avoid complex joins
      const { data, error } = await supabase
        .rpc('get_most_clicked_products', { limit_count: limit });

      if (error) {
        console.error('Error fetching most clicked products:', error);
        throw error;
      }

      // Transform data to match expected format
      const transformedData = (data || []).map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image || '',
        totalClicks: parseInt(item.view_count)
      }));

      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Error fetching most clicked products:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get top selling products (based on order items)
  static async getTopProducts(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('product_id, product_name, product_image, quantity')
        .order('quantity', { ascending: false });

      if (error) throw error;

      // Aggregate by product_id
      const productMap = {};
      data.forEach(item => {
        if (!productMap[item.product_id]) {
          productMap[item.product_id] = {
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            totalSold: 0
          };
        }
        productMap[item.product_id].totalSold += item.quantity;
      });

      const topProducts = Object.values(productMap)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit);

      return { success: true, data: topProducts };
    } catch (error) {
      console.error('Error fetching top products:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get payment status stats
  static async getPaymentStats() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('payment_status');

      if (error) throw error;

      const stats = {
        paid: 0,
        pending: 0,
        failed: 0,
        cancelled: 0
      };

      data.forEach(payment => {
        const status = payment.payment_status.toLowerCase();
        if (stats.hasOwnProperty(status)) {
          stats[status]++;
        }
      });

      return stats; // Return stats directly, not wrapped
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      return {
        paid: 0,
        pending: 0,
        failed: 0,
        cancelled: 0
      };
    }
  }

  // Get orders overview by status
  static async getOrdersOverview() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data.length,
        completed: 0, // completed, delivered orders
        ongoing: 0, // processing, confirmed, shipped
        new: 0 // pending
      };

      data.forEach(order => {
        const status = order.status.toLowerCase();
        
        if (status === 'completed' || status === 'delivered') {
          stats.completed++;
        } else if (status === 'processing' || status === 'confirmed' || status === 'shipped') {
          stats.ongoing++;
        } else if (status === 'pending') {
          stats.new++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching orders overview:', error);
      return {
        total: 0,
        completed: 0,
        ongoing: 0,
        new: 0
      };
    }
  }

  // Get average order value
  static async getAverageOrderValue(period = 'month') {
    try {
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const { data, error } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Filter for completed/delivered orders
      const completedOrders = (data || []).filter(order => 
        order.status === 'completed' || order.status === 'delivered'
      );

      const currentTotal = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);
      const currentAverage = completedOrders.length > 0 ? currentTotal / completedOrders.length : 0;

      // Get previous period for comparison
      const previousStartDate = new Date(startDate);
      if (period === 'week') {
        previousStartDate.setDate(previousStartDate.getDate() - 7);
      } else if (period === 'month') {
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
      } else if (period === 'year') {
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
      }

      const { data: previousData } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const previousCompletedOrders = (previousData || []).filter(order => 
        order.status === 'completed' || order.status === 'delivered'
      );
      const previousTotal = previousCompletedOrders.reduce((sum, order) => sum + Number(order.total), 0);
      const previousAverage = previousCompletedOrders.length > 0 ? previousTotal / previousCompletedOrders.length : 0;
      
      const percentageChange = previousAverage > 0 ? ((currentAverage - previousAverage) / previousAverage * 100) : 0;

      return {
        success: true,
        average: currentAverage,
        percentage: percentageChange,
        isIncrease: percentageChange >= 0
      };
    } catch (error) {
      console.error('Error fetching average order value:', error);
      return { success: false, error: error.message, average: 0, percentage: 0 };
    }
  }

  // Get conversion rate (completed orders vs total orders)
  static async getConversionRate() {
    try {
      // Get total orders in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: allOrders, error } = await supabase
        .from('orders')
        .select('status')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const totalOrders = (allOrders || []).length;
      const completedOrders = (allOrders || []).filter(order => 
        order.status === 'completed' || order.status === 'delivered'
      ).length;

      const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      return {
        success: true,
        rate: conversionRate,
        visits: totalOrders,
        orders: completedOrders
      };
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      return { success: false, error: error.message, rate: 0, visits: 0, orders: 0 };
    }
  }

  // Get orders by status
  static async getOrdersByStatus(status) {
    try {
      let query = supabase
        .from('orders')
        .select('id, total, created_at, status, user_id')
        .order('created_at', { ascending: false });

      // Map status types
      if (status === 'completed') {
        query = query.in('status', ['completed', 'delivered']);
      } else if (status === 'ongoing') {
        query = query.in('status', ['processing', 'confirmed', 'shipped']);
      } else if (status === 'new') {
        query = query.eq('status', 'pending');
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set((orders || []).map(o => o.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name')
        .in('id', userIds);

      // Map profiles to orders
      const profileMap = (profiles || []).reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      // Format the response
      const formattedOrders = (orders || []).map(order => {
        const profile = profileMap[order.user_id];
        const customerName = profile?.full_name 
          || (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}`.trim() : null)
          || 'Guest';
        
        return {
          id: order.id,
          customer_name: customerName,
          total_amount: order.total,
          created_at: order.created_at,
          status: order.status
        };
      });

      return {
        success: true,
        data: formattedOrders
      };
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
}

export default DashboardService;
