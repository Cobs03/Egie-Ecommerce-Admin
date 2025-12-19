import { supabase } from '../lib/supabase';

export class DashboardService {
  // Get total sales (sum of all completed orders)
  static async getTotalSales(period = 'week') {
    try {
      const now = new Date();
      let startDate = new Date();
      
      // Calculate date range based on period
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Filter for completed/delivered in JS since some Supabase versions have issues with OR
      const filteredData = (data || []).filter(order => 
        order.status === 'completed' || order.status === 'delivered'
      );

      const currentTotal = filteredData.reduce((sum, order) => sum + Number(order.total_amount), 0);

      // Get previous period for percentage calculation
      const previousStartDate = new Date(startDate);
      const previousEndDate = new Date(startDate);
      if (period === 'week') {
        previousStartDate.setDate(previousStartDate.getDate() - 7);
      } else if (period === 'month') {
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
      } else if (period === 'year') {
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
      }

      const { data: previousData } = await supabase
        .from('orders')
        .select('total_amount, status')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const filteredPreviousData = (previousData || []).filter(order => 
        order.status === 'completed' || order.status === 'delivered'
      );
      const previousTotal = filteredPreviousData.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const percentageChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 0;

      return {
        success: true,
        total: currentTotal,
        percentage: percentageChange,
        isIncrease: percentageChange >= 0
      };
    } catch (error) {
      console.error('Error fetching total sales:', error);
      return { success: false, error: error.message, total: 0, percentage: 0 };
    }
  }

  // Get total orders count
  static async getTotalOrders(period = 'month') {
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

      const { count: currentCount, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Get previous period count
      const previousStartDate = new Date(startDate);
      if (period === 'week') {
        previousStartDate.setDate(previousStartDate.getDate() - 7);
      } else if (period === 'month') {
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
      } else if (period === 'year') {
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
      }

      const { count: previousCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const percentageChange = previousCount > 0 ? ((currentCount - previousCount) / previousCount * 100) : 0;

      return {
        success: true,
        total: currentCount || 0,
        percentage: percentageChange,
        isIncrease: percentageChange >= 0
      };
    } catch (error) {
      console.error('Error fetching total orders:', error);
      return { success: false, error: error.message, total: 0, percentage: 0 };
    }
  }

  // Get total users count
  static async getTotalUsers(period = 'week') {
    try {
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      const { count: currentCount, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (error) throw error;

      // Get new users in period
      const { count: newCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .gte('created_at', startDate.toISOString());

      const percentageChange = currentCount > 0 ? ((newCount / currentCount) * 100) : 0;

      return {
        success: true,
        total: currentCount || 0,
        newUsers: newCount || 0,
        percentage: percentageChange,
        isIncrease: true
      };
    } catch (error) {
      console.error('Error fetching total users:', error);
      return { success: false, error: error.message, total: 0, percentage: 0 };
    }
  }

  // Get new users in the last week
  static async getNewUsers() {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .gte('created_at', weekAgo.toISOString());

      if (error) throw error;

      // Get previous week count for percentage
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const { count: previousCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', weekAgo.toISOString());

      const percentageChange = previousCount > 0 ? ((count - previousCount) / previousCount * 100) : 0;

      return {
        success: true,
        total: count || 0,
        percentage: percentageChange,
        isIncrease: percentageChange >= 0
      };
    } catch (error) {
      console.error('Error fetching new users:', error);
      return { success: false, error: error.message, total: 0, percentage: 0 };
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

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching shipping stats:', error);
      return { success: false, error: error.message };
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
        .select('id, order_number, total_amount, status, created_at, user_id')
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
      const { data, error } = await supabase
        .from('products')
        .select('stock_quantity, status');

      if (error) throw error;

      const stats = {
        total: data.length,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0
      };

      data.forEach(product => {
        const stock = Number(product.stock_quantity) || 0;
        if (stock === 0) {
          stats.outOfStock++;
        } else if (stock <= 10) {
          stats.lowStock++;
        } else {
          stats.inStock++;
        }
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Get top products
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

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Get orders overview by status
  static async getOrdersOverview() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const overview = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        completed: 0
      };

      data.forEach(order => {
        const status = order.status.toLowerCase();
        if (overview.hasOwnProperty(status)) {
          overview[status]++;
        } else if (status === 'confirmed') {
          overview.processing++;
        } else if (status === 'ready_for_pickup') {
          overview.processing++;
        }
      });

      return { success: true, data: overview };
    } catch (error) {
      console.error('Error fetching orders overview:', error);
      return { success: false, error: error.message };
    }
  }
}

export default DashboardService;
