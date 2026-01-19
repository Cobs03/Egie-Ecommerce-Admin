import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  Tabs,
  Tab
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { ReportsService } from '../../services/ReportsService';
import PDFReportService from '../../services/PDFReportService';
import AISalesInsights from './components/AISalesInsights';

// Import new modular components
import TimeRangeSelector from './components/TimeRangeSelector';
import SalesOverviewCards from './components/SalesOverviewCards';
import SalesTrendChart from './components/SalesTrendChart';
import ProductPerformanceTable from './components/ProductPerformanceTable';
import BrandAnalysisCharts from './components/BrandAnalysisCharts';
import CategoryAnalysisCharts from './components/CategoryAnalysisCharts';
import InventoryRecommendationsTable from './components/InventoryRecommendationsTable';

/**
 * SalesAnalytics Component (Refactored)
 * Main analytics dashboard for sales reporting and business intelligence
 * 
 * Features:
 * - Time range filtering (day/week/month/year/custom)
 * - Sales overview cards with key metrics
 * - 6 analytics tabs: Trend, Products, Brands, Categories, Inventory, AI Insights
 * - CSV and PDF report generation
 * - Modular component architecture for maintainability
 */
const SalesAnalytics = () => {
  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Time Range State
  const [timeRange, setTimeRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Data State
  const [salesOverview, setSalesOverview] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProduct: null
  });
  const [productPerformance, setProductPerformance] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [brandPerformance, setBrandPerformance] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [lowStockRecommendations, setLowStockRecommendations] = useState([]);

  // Fetch analytics data when time range changes
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, customStartDate, customEndDate]);

  /**
   * Fetch all analytics data from the backend
   */
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {
        timeRange,
        startDate: customStartDate,
        endDate: customEndDate
      };

      const [overview, performance, trend, brands, categories, recommendations] = await Promise.all([
        ReportsService.getSalesOverview(params),
        ReportsService.getProductPerformance(params),
        ReportsService.getSalesTrend(params),
        ReportsService.getBrandPerformance(params),
        ReportsService.getCategoryPerformance(params),
        ReportsService.getInventoryRecommendations(params)
      ]);

      if (overview.success) {
        setSalesOverview(overview.data);
        setRefreshKey(prev => prev + 1); // Force re-render
      }
      if (performance.success) setProductPerformance(performance.data);
      if (trend.success) setSalesTrend(trend.data);
      if (brands.success) setBrandPerformance(brands.data);
      if (categories.success) setCategoryPerformance(categories.data);
      if (recommendations.success) setLowStockRecommendations(recommendations.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle CSV or PDF report download
   */
  const handleDownloadReport = async (format = 'csv') => {
    try {
      const params = {
        timeRange,
        startDate: customStartDate,
        endDate: customEndDate
      };
      
      if (format === 'pdf') {
        const { startDate: start, endDate: end } = getDateRangeForParams();
        
        await PDFReportService.generateSalesReport({
          salesOverview: salesOverview || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, topProduct: null },
          productPerformance: productPerformance || [],
          categoryPerformance: categoryPerformance || [],
          timeRange,
          startDate: start,
          endDate: end
        });
      } else {
        await ReportsService.downloadSalesReport(params);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert(`Failed to download report: ${error.message || 'Unknown error'}`);
    }
  };

  /**
   * Calculate actual start and end dates based on time range selection
   */
  const getDateRangeForParams = () => {
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

  /**
   * Format currency values in Philippine Peso
   */
  const formatCurrency = (value) => {
    return `₱${Number(value || 0).toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
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
      {/* Header with Title and Action Buttons */}
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
            Sales Analytics & Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze product performance and make data-driven inventory decisions
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadReport("csv")}
            sx={{ bgcolor: "#63e01d", "&:hover": { bgcolor: "#56c018" } }}
          >
            Download CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={() => handleDownloadReport("pdf")}
            sx={{
              borderColor: "#63e01d",
              color: "#63e01d",
              "&:hover": {
                borderColor: "#56c018",
                bgcolor: "rgba(99, 224, 29, 0.04)",
              },
            }}
          >
            Download PDF
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

      {/* Overview Metric Cards */}
      <SalesOverviewCards
        salesOverview={salesOverview}
        formatCurrency={formatCurrency}
        refreshKey={refreshKey}
      />

      {/* Analytics Tabs Navigation */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Sales Trend" />
          <Tab label="Product Performance" />
          <Tab label="Brand Analysis" />
          <Tab label="Category Analysis" />
          <Tab label="Inventory Recommendations" />
          <Tab label="AI Insights" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && (
        <SalesTrendChart data={salesTrend} formatCurrency={formatCurrency} />
      )}

      {activeTab === 1 && (
        <ProductPerformanceTable
          data={productPerformance}
          formatCurrency={formatCurrency}
        />
      )}

      {activeTab === 2 && <BrandAnalysisCharts data={brandPerformance} />}

      {activeTab === 3 && (
        <CategoryAnalysisCharts
          data={categoryPerformance}
          formatCurrency={formatCurrency}
        />
      )}

      {activeTab === 4 && (
        <InventoryRecommendationsTable data={lowStockRecommendations} />
      )}

      {activeTab === 5 && (
        <AISalesInsights
          salesOverview={salesOverview}
          productPerformance={productPerformance}
          salesTrend={salesTrend}
          brandPerformance={brandPerformance}
          categoryPerformance={categoryPerformance}
          timeRange={timeRange}
        />
      )}
    </Box>
  );
};

export default SalesAnalytics;
