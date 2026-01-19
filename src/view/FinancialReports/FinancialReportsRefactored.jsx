import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Card,
  Tabs,
  Tab
} from '@mui/material';
import { PictureAsPdf as PdfIcon, Download as DownloadIcon } from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import PDFReportService from '../../services/PDFReportService';

// Import modular components
import TimeRangeSelector from '../SalesAnalytics/components/TimeRangeSelector';
import FinancialSummaryCards from './components/FinancialSummaryCards';
import PaymentMethodsBreakdown from './components/PaymentMethodsBreakdown';
import OrderStatusSummary from './components/OrderStatusSummary';
import FinancialNotes from './components/FinancialNotes';
import RevenueBreakdown from './components/RevenueBreakdown';
import ProfitAnalysis from './components/ProfitAnalysis';
import CashFlowAnalysis from './components/CashFlowAnalysis';
import CashFlowChart from './components/CashFlowChart';
import ProductProfitability from './components/ProductProfitability';
import TaxAnalysis from './components/TaxAnalysis';
import PerformanceMetrics from './components/PerformanceMetrics';
import AIFinancialInsights from './components/AIFinancialInsights';

/**
 * FinancialReports Component (Refactored)
 * Comprehensive financial analysis dashboard with revenue, expenses, profit tracking
 * 
 * Features:
 * - Financial overview cards (revenue, expenses, profit, margin)
 * - 7 analytics tabs: Overview, Revenue, Profit, Cash Flow, Products, Tax, Performance
 * - Payment methods breakdown
 * - Order status summary
 * - PDF report generation
 * - Time range filtering
 */
const FinancialReports = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [financialData, setFinancialData] = useState({
    revenue: 0,
    expenses: 0,
    netProfit: 0,
    profitMargin: 0
  });
  
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // New comprehensive data states
  const [revenueData, setRevenueData] = useState({
    grossRevenue: 0,
    netRevenue: 0,
    refunds: 0,
    discounts: 0,
    cancelled: 0,
    avgOrderValue: 0,
    totalOrders: 0
  });

  const [profitData, setProfitData] = useState({
    netRevenue: 0,
    cogs: 0,
    grossProfit: 0,
    shippingCosts: 0,
    paymentFees: 0,
    marketingCosts: 0,
    operationalExpenses: 0,
    totalOperatingExpenses: 0,
    netProfit: 0
  });

  const [cashFlowData, setCashFlowData] = useState({
    inflow: 0,
    outflow: 0,
    netCashFlow: 0,
    pendingOrders: 0,
    pendingAmount: 0,
    processingOrders: 0,
    processingAmount: 0,
    paidOrders: 0,
    paidAmount: 0,
    totalOutstandingOrders: 0,
    totalOutstandingAmount: 0,
    expectedCollection: 0,
    dso: 0
  });

  const [productData, setProductData] = useState({
    topProducts: [],
    categories: []
  });

  const [taxData, setTaxData] = useState({
    vatCollected: 0,
    processingFees: 0,
    withholdingTax: 0,
    totalTaxObligation: 0,
    paymentFees: []
  });

  const [metricsData, setMetricsData] = useState({
    current: {
      revenue: 0,
      avgOrderValue: 0,
      totalOrders: 0,
      grossProfit: 0,
      netProfit: 0,
      profitMargin: 0
    },
    previous: {
      revenue: 0,
      avgOrderValue: 0,
      totalOrders: 0,
      grossProfit: 0,
      netProfit: 0,
      profitMargin: 0
    },
    growthRate: 0,
    cac: 0,
    roas: 0,
    summary: ''
  });

  const [cashFlowTrend, setCashFlowTrend] = useState([]);

  useEffect(() => {
    fetchFinancialData();
  }, [timeRange, customStartDate, customEndDate]);

  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'day':
        startDate = endDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
        break;
      case 'custom':
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default:
        startDate = endDate = today.toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriodRange();

      // Fetch all orders for the current period
      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (ordersError) throw ordersError;

      // Fetch previous period orders for comparison
      const { data: prevOrders, error: prevOrdersError } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', prevStartDate)
        .lte('created_at', prevEndDate)
        .in('status', ['completed', 'delivered']);

      if (prevOrdersError) throw prevOrdersError;

      // Calculate Revenue Data
      const completedOrders = allOrders.filter(o => ['completed', 'delivered'].includes(o.status));
      const refundedOrders = allOrders.filter(o => o.status === 'refunded');
      const cancelledOrders = allOrders.filter(o => o.status === 'cancelled');

      const grossRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const refunds = refundedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const cancelled = cancelledOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      
      // Estimate discounts (5% of gross revenue)
      const discounts = grossRevenue * 0.05;
      const netRevenue = grossRevenue - refunds - discounts;
      const avgOrderValue = completedOrders.length > 0 ? grossRevenue / completedOrders.length : 0;

      setRevenueData({
        grossRevenue,
        netRevenue,
        refunds,
        discounts,
        cancelled,
        avgOrderValue,
        totalOrders: completedOrders.length
      });

      // Calculate Profit Data
      const cogs = grossRevenue * 0.40; // 40% COGS
      const grossProfit = netRevenue - cogs;
      const shippingCosts = grossRevenue * 0.08; // 8% shipping
      const paymentFees = grossRevenue * 0.035; // 3.5% payment fees
      const marketingCosts = grossRevenue * 0.10; // 10% marketing
      const operationalExpenses = grossRevenue * 0.12; // 12% operational
      const totalOperatingExpenses = shippingCosts + paymentFees + marketingCosts + operationalExpenses;
      const netProfit = grossProfit - totalOperatingExpenses;

      setProfitData({
        netRevenue,
        cogs,
        grossProfit,
        shippingCosts,
        paymentFees,
        marketingCosts,
        operationalExpenses,
        totalOperatingExpenses,
        netProfit
      });

      // Set legacy financialData for summary cards
      setFinancialData({
        revenue: grossRevenue,
        expenses: cogs + totalOperatingExpenses,
        netProfit,
        profitMargin: netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0
      });

      // Calculate Cash Flow Data
      const pendingOrders = allOrders.filter(o => o.status === 'pending');
      const processingOrders = allOrders.filter(o => o.status === 'processing');
      const paidOrders = completedOrders;

      const pendingAmount = pendingOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const processingAmount = processingOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const paidAmount = grossRevenue;

      const inflow = paidAmount;
      const outflow = cogs + totalOperatingExpenses;
      const netCashFlow = inflow - outflow;
      const totalOutstanding = pendingAmount + processingAmount;

      setCashFlowData({
        inflow,
        outflow,
        netCashFlow,
        pendingOrders: pendingOrders.length,
        pendingAmount,
        processingOrders: processingOrders.length,
        processingAmount,
        paidOrders: paidOrders.length,
        paidAmount,
        totalOutstandingOrders: pendingOrders.length + processingOrders.length,
        totalOutstandingAmount: totalOutstanding,
        expectedCollection: totalOutstanding * 0.85, // 85% expected collection
        dso: 15 // Estimated Days Sales Outstanding
      });

      // Fetch Product Profitability
      await fetchProductProfitability(completedOrders);

      // Calculate Tax Data
      const vatCollected = grossRevenue * 0.12; // 12% VAT
      const withholdingTax = cogs * 0.02; // 2% withholding
      const totalTaxObligation = vatCollected + withholdingTax;

      setTaxData({
        vatCollected,
        processingFees: paymentFees,
        withholdingTax,
        totalTaxObligation,
        paymentFees: [] // Will be populated from payments table
      });

      // Calculate Performance Metrics
      const prevRevenue = prevOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const prevCogs = prevRevenue * 0.40;
      const prevExpenses = prevRevenue * 0.38;
      const prevGrossProfit = prevRevenue - prevCogs;
      const prevNetProfit = prevGrossProfit - prevExpenses;
      const prevAvgOrderValue = prevOrders.length > 0 ? prevRevenue / prevOrders.length : 0;

      const growthRate = prevRevenue > 0 ? ((grossRevenue - prevRevenue) / prevRevenue * 100) : 0;
      const cac = marketingCosts / (completedOrders.length || 1);
      const roas = marketingCosts > 0 ? grossRevenue / marketingCosts : 0;

      let summary = '';
      if (growthRate > 10) summary = 'Strong growth! Revenue is significantly up compared to previous period.';
      else if (growthRate > 0) summary = 'Positive growth. Revenue is moderately increasing.';
      else if (growthRate > -10) summary = 'Slight decline. Consider reviewing marketing strategies.';
      else summary = 'Significant decline. Immediate attention required.';

      setMetricsData({
        current: {
          revenue: grossRevenue,
          avgOrderValue,
          totalOrders: completedOrders.length,
          grossProfit,
          netProfit,
          profitMargin: netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0
        },
        previous: {
          revenue: prevRevenue,
          avgOrderValue: prevAvgOrderValue,
          totalOrders: prevOrders.length,
          grossProfit: prevGrossProfit,
          netProfit: prevNetProfit,
          profitMargin: prevRevenue > 0 ? (prevNetProfit / prevRevenue) * 100 : 0
        },
        growthRate,
        cac,
        roas,
        summary
      });

      // Fetch payment methods breakdown
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('payment_method, amount')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('payment_status', 'paid');

      if (paymentsError) throw paymentsError;

      const paymentBreakdown = {};
      let totalPayments = 0;

      paymentsData.forEach(payment => {
        const method = payment.payment_method || 'Unknown';
        const amount = Number(payment.amount || 0);
        
        if (!paymentBreakdown[method]) {
          paymentBreakdown[method] = { count: 0, amount: 0 };
        }
        
        paymentBreakdown[method].count++;
        paymentBreakdown[method].amount += amount;
        totalPayments += amount;
      });

      const paymentsArray = Object.entries(paymentBreakdown).map(([method, data]) => ({
        method: method.toUpperCase(),
        count: data.count,
        amount: data.amount,
        percentage: totalPayments > 0 ? (data.amount / totalPayments) * 100 : 0
      }));

      setPayments(paymentsArray);

      // Update tax data with payment fees breakdown
      const paymentFeesBreakdown = paymentsArray.map(p => ({
        method: p.method,
        transactions: p.count,
        amount: p.amount,
        fees: p.amount * 0.035,
        feePercentage: 3.5
      }));

      setTaxData(prev => ({ ...prev, paymentFees: paymentFeesBreakdown }));

      // Fetch order status breakdown
      const orderBreakdown = {};
      allOrders.forEach(order => {
        const status = order.status || 'unknown';
        if (!orderBreakdown[status]) {
          orderBreakdown[status] = { count: 0, total: 0 };
        }
        orderBreakdown[status].count++;
        orderBreakdown[status].total += Number(order.total || 0);
      });

      const ordersArray = Object.entries(orderBreakdown).map(([status, data]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count: data.count,
        total: data.total
      }));

      setOrders(ordersArray);

      // Generate Cash Flow Trend Data
      generateCashFlowTrend(allOrders, startDate, endDate);

    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCashFlowTrend = (orders, startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      const trendData = [];
      
      if (daysDiff <= 7) {
        // Daily data for week or less
        for (let i = 0; i <= daysDiff; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayOrders = orders.filter(o => o.created_at?.startsWith(dateStr));
          const completedOrders = dayOrders.filter(o => ['completed', 'delivered'].includes(o.status));
          
          const inflow = completedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
          const outflow = inflow * 0.78; // 78% of revenue as outflow (COGS + expenses)
          
          trendData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            inflow,
            outflow,
            netCashFlow: inflow - outflow
          });
        }
      } else if (daysDiff <= 60) {
        // Weekly data for 2 months or less
        const weeks = Math.ceil(daysDiff / 7);
        for (let i = 0; i < weeks; i++) {
          const weekStart = new Date(start);
          weekStart.setDate(start.getDate() + (i * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          const weekOrders = orders.filter(o => {
            const orderDate = new Date(o.created_at);
            return orderDate >= weekStart && orderDate <= weekEnd;
          });
          const completedOrders = weekOrders.filter(o => ['completed', 'delivered'].includes(o.status));
          
          const inflow = completedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
          const outflow = inflow * 0.78;
          
          trendData.push({
            date: `Week ${i + 1}`,
            inflow,
            outflow,
            netCashFlow: inflow - outflow
          });
        }
      } else {
        // Monthly data for longer periods
        const months = Math.ceil(daysDiff / 30);
        for (let i = 0; i < months; i++) {
          const monthStart = new Date(start);
          monthStart.setMonth(start.getMonth() + i);
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthStart.getMonth() + 1);
          
          const monthOrders = orders.filter(o => {
            const orderDate = new Date(o.created_at);
            return orderDate >= monthStart && orderDate < monthEnd;
          });
          const completedOrders = monthOrders.filter(o => ['completed', 'delivered'].includes(o.status));
          
          const inflow = completedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
          const outflow = inflow * 0.78;
          
          trendData.push({
            date: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            inflow,
            outflow,
            netCashFlow: inflow - outflow
          });
        }
      }
      
      setCashFlowTrend(trendData);
    } catch (error) {
      console.error('Error generating cash flow trend:', error);
      setCashFlowTrend([]);
    }
  };

  const fetchProductProfitability = async (completedOrders) => {
    try {
      // Get products from order items
      const productRevenue = {};
      const categoryRevenue = {};

      for (const order of completedOrders) {
        if (order.order_items && order.order_items.length > 0) {
          for (const item of order.order_items) {
            const productId = item.product_id;
            const quantity = item.quantity || 1;
            const price = Number(item.price || 0);
            const revenue = price * quantity;

            if (!productRevenue[productId]) {
              productRevenue[productId] = {
                name: item.product_name || 'Unknown Product',
                category: item.category || 'Uncategorized',
                unitsSold: 0,
                revenue: 0
              };
            }

            productRevenue[productId].unitsSold += quantity;
            productRevenue[productId].revenue += revenue;

            // Category aggregation
            const category = item.category || 'Uncategorized';
            if (!categoryRevenue[category]) {
              categoryRevenue[category] = { revenue: 0, productCount: 0 };
            }
            categoryRevenue[category].revenue += revenue;
          }
        }
      }

      // Calculate top products with profit margins
      const topProducts = Object.values(productRevenue)
        .map(p => {
          const cogs = p.revenue * 0.40;
          const profit = p.revenue - cogs;
          const margin = (profit / p.revenue) * 100;
          return { ...p, cogs, profit, margin };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Calculate category profitability
      const categories = Object.entries(categoryRevenue).map(([name, data]) => {
        const cogs = data.revenue * 0.40;
        const profit = data.revenue - cogs;
        const margin = (profit / data.revenue) * 100;
        return {
          name,
          productCount: Object.values(productRevenue).filter(p => p.category === name).length,
          revenue: data.revenue,
          profit,
          margin
        };
      });

      setProductData({ topProducts, categories });
    } catch (error) {
      console.error('Error fetching product profitability:', error);
      setProductData({ topProducts: [], categories: [] });
    }
  };

  const getPreviousPeriodRange = () => {
    const today = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'day':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = endDate = yesterday.toISOString().split('T')[0];
        break;
      case 'week':
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        startDate = twoWeeksAgo.toISOString().split('T')[0];
        endDate = oneWeekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = lastMonthEnd.toISOString().split('T')[0];
        break;
      case 'year':
        const lastYear = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        startDate = lastYear.toISOString().split('T')[0];
        endDate = lastYearEnd.toISOString().split('T')[0];
        break;
      case 'custom':
        // Previous period = same duration before custom range
        const customStart = new Date(customStartDate);
        const customEnd = new Date(customEndDate);
        const duration = customEnd - customStart;
        endDate = new Date(customStart.getTime() - 86400000).toISOString().split('T')[0];
        startDate = new Date(customStart.getTime() - duration - 86400000).toISOString().split('T')[0];
        break;
      default:
        startDate = endDate = new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  const handleDownloadPDF = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      await PDFReportService.generateFinancialReport({
        revenue: financialData.revenue,
        expenses: financialData.expenses,
        orders,
        payments,
        timeRange,
        startDate,
        endDate
      });
      
      console.log('✅ Financial PDF generated successfully');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert(`Failed to generate PDF report: ${error.message || 'Unknown error'}`);
    }
  };

  const formatCurrency = (amount) => {
    return `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ fontFamily: "Bruno Ace SC" }}
          >
            Financial Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive financial analysis and profit tracking
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={handleDownloadPDF}
            sx={{ bgcolor: "#63e01d", "&:hover": { bgcolor: "#56c018" } }}
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => alert('CSV export coming soon!')}
            sx={{
              borderColor: "#63e01d",
              color: "#63e01d",
              "&:hover": {
                borderColor: "#56c018",
                bgcolor: "rgba(99, 224, 29, 0.04)",
              },
            }}
          >
            Download CSV
          </Button>
        </Box>
      </Box>

      {/* Time Range Selector */}
      <TimeRangeSelector
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        customStartDate={customStartDate}
        onCustomStartDateChange={setCustomStartDate}
        customEndDate={customEndDate}
        onCustomEndDateChange={setCustomEndDate}
      />

      {/* Financial Summary Cards */}
      <FinancialSummaryCards
        financialData={financialData}
        formatCurrency={formatCurrency}
      />

      {/* Analytics Tabs Navigation */}
      <Card sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Revenue Details" />
          <Tab label="Profit & Loss" />
          <Tab label="Cash Flow" />
          <Tab label="Product Profitability" />
          <Tab label="Tax & Fees" />
          <Tab label="Performance Metrics" />
          <Tab label="AI Insights" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <PaymentMethodsBreakdown
                payments={payments}
                formatCurrency={formatCurrency}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <OrderStatusSummary orders={orders} formatCurrency={formatCurrency} />
            </Grid>
          </Grid>
          <FinancialNotes />
        </Box>
      )}

      {activeTab === 1 && (
        <RevenueBreakdown 
          revenueData={revenueData} 
          formatCurrency={formatCurrency} 
        />
      )}

      {activeTab === 2 && (
        <ProfitAnalysis 
          profitData={profitData} 
          formatCurrency={formatCurrency} 
        />
      )}

      {activeTab === 3 && (
        <Box>
          <Box mb={3}>
            <CashFlowChart 
              data={cashFlowTrend} 
              formatCurrency={formatCurrency} 
            />
          </Box>
          <CashFlowAnalysis 
            cashFlowData={cashFlowData} 
            formatCurrency={formatCurrency} 
          />
        </Box>
      )}

      {activeTab === 4 && (
        <ProductProfitability 
          productData={productData} 
          formatCurrency={formatCurrency} 
        />
      )}

      {activeTab === 5 && (
        <TaxAnalysis 
          taxData={taxData} 
          formatCurrency={formatCurrency} 
        />
      )}

      {activeTab === 6 && (
        <PerformanceMetrics 
          metricsData={metricsData} 
          formatCurrency={formatCurrency} 
        />
      )}

      {activeTab === 7 && (
        <AIFinancialInsights
          financialData={financialData}
          revenueData={revenueData}
          profitData={profitData}
          cashFlowData={cashFlowData}
          productData={productData}
          metricsData={metricsData}
          timeRange={timeRange}
        />
      )}
    </Box>
  );
};

export default FinancialReports;
