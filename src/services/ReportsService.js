import { supabase } from '../lib/supabase';

export class ReportsService {
  /**
   * Get sales overview for the selected time range
   */
  static async getSalesOverview(params) {
    try {
      const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);

      // Get orders in date range
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, total, created_at, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['completed', 'delivered']);

      if (error) throw error;

      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get top product by directly querying order_items (more reliable)
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('product_id, product_name, quantity, order_id, orders!inner(created_at, status)')
        .gte('orders.created_at', startDate)
        .lte('orders.created_at', endDate)
        .in('orders.status', ['completed', 'delivered']);

      console.log('📦 Order Items Data:', orderItems);

      let topProduct = null;
      if (orderItems && orderItems.length > 0) {
        // Aggregate by product
        const productMap = {};
        orderItems.forEach(item => {
          if (!productMap[item.product_id]) {
            productMap[item.product_id] = {
              product_id: item.product_id,
              name: item.product_name,
              sales: 0
            };
          }
          productMap[item.product_id].sales += item.quantity;
        });

        // Get top product
        const products = Object.values(productMap);
        console.log('🏆 All Products Aggregated:', products);
        
        if (products.length > 0) {
          products.sort((a, b) => b.sales - a.sales);
          topProduct = products[0];
          console.log('✅ Top Product Selected:', topProduct);
        }
      }

      return {
        success: true,
        data: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          topProduct
        }
      };
    } catch (error) {
      console.error('Error fetching sales overview:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  /**
   * Get product performance analysis
   */
  static async getProductPerformance(params) {
    try {
      const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);
      const { startDate: prevStartDate, endDate: prevEndDate } = this.getPreviousPeriod(startDate, endDate);

      // Get current period sales
      const { data: currentSales, error: currentError } = await supabase
        .rpc('get_product_sales_analysis', {
          start_date: startDate,
          end_date: endDate
        });

      if (currentError) throw currentError;

      // Get previous period sales for trend calculation
      const { data: previousSales } = await supabase
        .rpc('get_product_sales_analysis', {
          start_date: prevStartDate,
          end_date: prevEndDate
        });

      // Calculate trends
      const previousMap = (previousSales || []).reduce((acc, item) => {
        acc[item.product_id] = item.units_sold;
        return acc;
      }, {});

      const productsWithTrend = (currentSales || []).map(product => {
        const prevSales = previousMap[product.product_id] || 0;
        let trend = 0;
        
        if (prevSales > 0) {
          // Product had previous sales - calculate percentage change
          trend = ((product.units_sold - prevSales) / prevSales * 100).toFixed(1);
        } else if (product.units_sold > 0) {
          // New product or first sales - show 100% increase
          trend = 100;
        } else {
          // No sales in either period
          trend = 0;
        }

        console.log(`📊 Product: ${product.product_name}, Current: ${product.units_sold}, Previous: ${prevSales}, Trend: ${trend}`);

        return {
          id: product.product_id,
          name: product.product_name,
          sku: product.sku,
          unitsSold: product.units_sold,
          revenue: product.total_revenue,
          avgPrice: product.avg_price,
          stock: product.current_stock || 0,
          trend: parseFloat(trend)
        };
      });

      // Sort by revenue (descending)
      productsWithTrend.sort((a, b) => b.revenue - a.revenue);

      return {
        success: true,
        data: productsWithTrend
      };
    } catch (error) {
      console.error('Error fetching product performance:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get sales trend data over time
   */
  static async getSalesTrend(params) {
    try {
      const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);

      const { data, error } = await supabase
        .rpc('get_sales_trend', {
          start_date: startDate,
          end_date: endDate,
          interval_type: this.getIntervalType(params.timeRange)
        });

      if (error) throw error;

      return {
        success: true,
        data: (data || []).map(item => ({
          date: item.date_label,
          revenue: item.total_revenue,
          orders: item.order_count
        }))
      };
    } catch (error) {
      console.error('Error fetching sales trend:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get brand performance (formerly category performance)
   */
  static async getBrandPerformance(params) {
    try {
      const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);

      const { data, error } = await supabase
        .rpc('get_category_sales', {
          start_date: startDate,
          end_date: endDate
        });

      if (error) throw error;

      return {
        success: true,
        data: (data || []).map(item => ({
          name: item.category_name,
          value: item.total_sales,
          revenue: item.total_revenue
        }))
      };
    } catch (error) {
      console.error('Error fetching brand performance:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get actual category performance (by product categories)
   */
  static async getCategoryPerformance(params) {
    try {
      const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);

      const { data, error } = await supabase
        .rpc('get_actual_category_sales', {
          start_date: startDate,
          end_date: endDate
        });

      if (error) throw error;

      return {
        success: true,
        data: (data || []).map(item => ({
          id: item.category_id,
          name: item.category_name,
          value: item.total_units,
          revenue: item.total_revenue,
          productCount: item.product_count,
          topProduct: item.top_product_name,
          topProductSales: item.top_product_sales
        }))
      };
    } catch (error) {
      console.error('Error fetching category performance:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get inventory recommendations based on sales trends
   */
  static async getInventoryRecommendations(params) {
    try {
      const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);

      const { data, error } = await supabase
        .rpc('get_inventory_recommendations', {
          start_date: startDate,
          end_date: endDate
        });

      if (error) throw error;

      return {
        success: true,
        data: (data || []).map(item => {
          const daysUntilStockout = item.avg_daily_sales > 0 
            ? Math.floor(item.current_stock / item.avg_daily_sales)
            : 999;

          let priority = 'Low';
          let recommendation = '';

          if (daysUntilStockout < 7) {
            priority = 'High';
            recommendation = `URGENT: Restock immediately! Only ${daysUntilStockout} days of inventory left. Order ${Math.ceil(item.avg_daily_sales * 30)} units for 30-day supply.`;
          } else if (daysUntilStockout < 14) {
            priority = 'Medium';
            recommendation = `Restock soon. Order ${Math.ceil(item.avg_daily_sales * 30)} units for 30-day supply.`;
          } else {
            priority = 'Low';
            recommendation = `Stock level healthy. Monitor for changes in demand.`;
          }

          return {
            id: item.product_id,
            productName: item.product_name,
            currentStock: item.current_stock,
            avgDailySales: item.avg_daily_sales,
            daysUntilStockout,
            recommendation,
            priority
          };
        }).sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
      };
    } catch (error) {
      console.error('Error fetching inventory recommendations:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Download sales report as CSV
   */
  static async downloadSalesReport(params) {
    try {
      const { startDate, endDate } = this.getDateRange(params.timeRange, params.startDate, params.endDate);

      // Fetch all data
      const [overview, performance, trend, categories, recommendations] = await Promise.all([
        this.getSalesOverview(params),
        this.getProductPerformance(params),
        this.getSalesTrend(params),
        this.getCategoryPerformance(params),
        this.getInventoryRecommendations(params)
      ]);

      // Create CSV content
      let csvContent = `SALES ANALYTICS REPORT\n`;
      csvContent += `Report Period: ${startDate} to ${endDate}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

      // Overview Section
      csvContent += `SALES OVERVIEW\n`;
      csvContent += `Total Revenue,${overview.data?.totalRevenue || 0}\n`;
      csvContent += `Total Orders,${overview.data?.totalOrders || 0}\n`;
      csvContent += `Average Order Value,${overview.data?.avgOrderValue || 0}\n`;
      csvContent += `Top Product,${overview.data?.topProduct?.name || 'N/A'}\n\n`;

      // Product Performance
      csvContent += `PRODUCT PERFORMANCE\n`;
      csvContent += `Rank,Product,SKU,Units Sold,Revenue,Avg Price,Trend %,Current Stock\n`;
      performance.data?.forEach((product, index) => {
        csvContent += `${index + 1},${product.name},${product.sku},${product.unitsSold},${product.revenue},${product.avgPrice},${product.trend},${product.stock}\n`;
      });
      csvContent += `\n`;

      // Category Performance
      csvContent += `CATEGORY PERFORMANCE\n`;
      csvContent += `Category,Total Sales,Revenue\n`;
      categories.data?.forEach(cat => {
        csvContent += `${cat.name},${cat.value},${cat.revenue}\n`;
      });
      csvContent += `\n`;

      // Inventory Recommendations
      csvContent += `INVENTORY RECOMMENDATIONS\n`;
      csvContent += `Product,Current Stock,Avg Daily Sales,Days Until Stockout,Priority,Recommendation\n`;
      recommendations.data?.forEach(rec => {
        csvContent += `"${rec.productName}",${rec.currentStock},${rec.avgDailySales.toFixed(2)},${rec.daysUntilStockout},${rec.priority},"${rec.recommendation}"\n`;
      });

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_analytics_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading report:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Get date range based on time period
   */
  static getDateRange(timeRange, customStart, customEnd) {
    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        endDate = new Date();
        break;
      case 'custom':
        startDate = customStart ? new Date(customStart) : new Date(now.setMonth(now.getMonth() - 1));
        endDate = customEnd ? new Date(customEnd) : new Date();
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        endDate = new Date();
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }

  /**
   * Helper: Get previous period for trend calculation
   */
  static getPreviousPeriod(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end - start;

    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - diff);

    return {
      startDate: prevStart.toISOString(),
      endDate: prevEnd.toISOString()
    };
  }

  /**
   * Helper: Get interval type for trend charts
   */
  static getIntervalType(timeRange) {
    switch (timeRange) {
      case 'day': return 'hour';
      case 'week': return 'day';
      case 'month': return 'day';
      case 'year': return 'month';
      default: return 'day';
    }
  }
}

export default ReportsService;
