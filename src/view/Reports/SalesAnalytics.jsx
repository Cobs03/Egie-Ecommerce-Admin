import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ReportsService } from '../../services/ReportsService';
import AISalesInsights from './AISalesInsights';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const SalesAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // day, week, month, year
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Data states
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

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, customStartDate, customEndDate]);

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

      console.log('🔍 Top Product Result:', overview.data?.topProduct);
      console.log('📊 All Products Performance:', performance.data?.slice(0, 5));

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

  const handleDownloadReport = async () => {
    try {
      const params = {
        timeRange,
        startDate: customStartDate,
        endDate: customEndDate
      };
      
      await ReportsService.downloadSalesReport(params);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      case 'custom': return 'Custom Range';
      default: return 'This Month';
    }
  };

  const formatCurrency = (value) => {
    return `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'white',
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="body2" fontWeight={600} mb={1}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            📊 Sales Analytics & Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze product performance and make data-driven inventory decisions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadReport}
          sx={{ bgcolor: '#63e01d', '&:hover': { bgcolor: '#56c018' } }}
        >
          Download Full Report
        </Button>
      </Box>

      {/* Time Range Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="day">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>

            {timeRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <Typography variant="body2">to</Typography>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </>
            )}

            <Chip
              icon={<CalendarIcon />}
              label={getTimeRangeLabel()}
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(salesOverview.totalRevenue)}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: '#1976d2' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {salesOverview.totalOrders}
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: '#7b1fa2' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Order Value
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(salesOverview.avgOrderValue)}
                  </Typography>
                </Box>
                <ShowChartIcon sx={{ fontSize: 40, color: '#388e3c' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Top Product
                  </Typography>
                  <Typography variant="body1" fontWeight={600} noWrap key={refreshKey}>
                    {salesOverview.topProduct?.name || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" key={`sales-${refreshKey}`}>
                    {salesOverview.topProduct?.sales || 0} sold
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: '#f57c00' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
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
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Sales Trend Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₱)" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Product Performance Analysis
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Rank</strong></TableCell>
                    <TableCell><strong>Product</strong></TableCell>
                    <TableCell align="right"><strong>Units Sold</strong></TableCell>
                    <TableCell align="right"><strong>Revenue</strong></TableCell>
                    <TableCell align="right"><strong>Avg Price</strong></TableCell>
                    <TableCell align="center"><strong>Trend</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productPerformance.map((product, index) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#ffd700' : '#e0e0e0',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {product.sku}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {product.unitsSold}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {formatCurrency(product.revenue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(product.avgPrice)}
                      </TableCell>
                      <TableCell align="center">
                        {product.trend > 0 ? (
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                            <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                            <Typography variant="body2" color="#4caf50" fontWeight={600}>
                              +{product.trend}%
                            </Typography>
                          </Box>
                        ) : product.trend < 0 ? (
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                            <TrendingDownIcon sx={{ color: '#f44336', fontSize: 20 }} />
                            <Typography variant="body2" color="#f44336" fontWeight={600}>
                              {product.trend}%
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No change
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={product.stock > 10 ? 'Healthy' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                          size="small"
                          color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={3}>
                    Sales by Brand
                  </Typography>
                  <Grid container spacing={4}>
                    {/* Pie Chart */}
                    <Grid item xs={12} md={6}>
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <ResponsiveContainer width="100%" height={400}>
                          <PieChart>
                            <Pie
                              data={brandPerformance}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={130}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={5}
                            >
                              {brandPerformance.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              formatter={(value, name, props) => [`${value} units`, props.payload.name]}
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #ccc', 
                                borderRadius: '8px',
                                padding: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>

                    {/* Legend Cards */}
                    <Grid item xs={12} md={6}>
                      <Box display="flex" flexDirection="column" justifyContent="center" height="100%" gap={2}>
                        {brandPerformance.map((entry, index) => {
                          const total = brandPerformance.reduce((sum, item) => sum + item.value, 0);
                          const percent = ((entry.value / total) * 100).toFixed(1);
                          return (
                            <Card 
                              key={index} 
                              sx={{ 
                                borderLeft: `6px solid ${COLORS[index % COLORS.length]}`,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  transform: 'translateX(4px)',
                                  transition: 'all 0.3s ease'
                                }
                              }}
                            >
                              <CardContent sx={{ py: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Box>
                                    <Typography variant="body1" fontWeight={600} color="text.primary">
                                      {entry.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {entry.value} units sold
                                    </Typography>
                                  </Box>
                                  <Chip 
                                    label={`${percent}%`}
                                    sx={{ 
                                      backgroundColor: COLORS[index % COLORS.length],
                                      color: '#fff',
                                      fontWeight: 700,
                                      fontSize: '1rem'
                                    }}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={3}>
                    Brand Performance Comparison
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                      data={brandPerformance} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        label={{ value: 'Total Sales', angle: -90, position: 'insideLeft' }}
                        style={{ fontSize: '12px' }}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value} units`, 'Total Sales']}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ccc', 
                          borderRadius: '8px',
                          padding: '10px'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#8884d8" 
                        name="Total Sales"
                        radius={[8, 8, 0, 0]}
                      >
                        {brandPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={3}>
                    Sales by Category
                  </Typography>
                  <Grid container spacing={4}>
                    {/* Pie Chart */}
                    <Grid item xs={12} md={6}>
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <ResponsiveContainer width="100%" height={400}>
                          <PieChart>
                            <Pie
                              data={categoryPerformance}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={130}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={5}
                            >
                              {categoryPerformance.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <Box
                                      sx={{
                                        bgcolor: 'white',
                                        p: 2,
                                        border: '1px solid #ccc',
                                        borderRadius: 1,
                                        boxShadow: 2
                                      }}
                                    >
                                      <Typography variant="body2" fontWeight={600} mb={1}>
                                        {data.name}
                                      </Typography>
                                      <Typography variant="body2">
                                        Units Sold: {data.value}
                                      </Typography>
                                      <Typography variant="body2">
                                        Revenue: {formatCurrency(data.revenue)}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" fontSize={11}>
                                        Top: {data.topProduct || 'N/A'}
                                      </Typography>
                                    </Box>
                                  );
                                }
                                return null;
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>

                    {/* Legend Cards */}
                    <Grid item xs={12} md={6}>
                      <Box display="flex" flexDirection="column" justifyContent="center" height="100%" gap={2}>
                        {categoryPerformance.map((entry, index) => {
                          const total = categoryPerformance.reduce((sum, item) => sum + item.value, 0);
                          const percent = ((entry.value / total) * 100).toFixed(1);
                          return (
                            <Card 
                              key={index} 
                              sx={{ 
                                borderLeft: `6px solid ${COLORS[index % COLORS.length]}`,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  transform: 'translateX(4px)',
                                  transition: 'all 0.3s ease'
                                }
                              }}
                            >
                              <CardContent sx={{ py: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Box flex={1}>
                                    <Typography variant="body1" fontWeight={600} color="text.primary">
                                      {entry.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {entry.value} units sold • {entry.productCount} products
                                    </Typography>
                                    <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5 }}>
                                      Top: {entry.topProduct || 'N/A'} ({entry.topProductSales || 0} sales)
                                    </Typography>
                                  </Box>
                                  <Chip 
                                    label={`${percent}%`}
                                    sx={{ 
                                      backgroundColor: COLORS[index % COLORS.length],
                                      color: '#fff',
                                      fontWeight: 700,
                                      fontSize: '1rem'
                                    }}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={3}>
                    Category Performance Comparison
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                      data={categoryPerformance} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        label={{ value: 'Total Sales', angle: -90, position: 'insideLeft' }}
                        style={{ fontSize: '12px' }}
                      />
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <Box
                                sx={{
                                  bgcolor: 'white',
                                  p: 2,
                                  border: '1px solid #ccc',
                                  borderRadius: 1,
                                  boxShadow: 2
                                }}
                              >
                                <Typography variant="body2" fontWeight={600} mb={1}>
                                  {data.name}
                                </Typography>
                                <Typography variant="body2">
                                  Units Sold: {data.value}
                                </Typography>
                                <Typography variant="body2">
                                  Revenue: {formatCurrency(data.revenue)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontSize={11}>
                                  Top Product: {data.topProduct || 'N/A'}
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#8884d8" 
                        name="Total Sales"
                        radius={[8, 8, 0, 0]}
                      >
                        {categoryPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>AI-Driven Recommendations:</strong> Based on sales trends and current inventory levels
              </Typography>
            </Alert>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Inventory & Production Recommendations
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Product</strong></TableCell>
                    <TableCell align="center"><strong>Current Stock</strong></TableCell>
                    <TableCell align="center"><strong>Avg Daily Sales</strong></TableCell>
                    <TableCell align="center"><strong>Days Until Stockout</strong></TableCell>
                    <TableCell><strong>Recommendation</strong></TableCell>
                    <TableCell align="center"><strong>Priority</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockRecommendations.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {item.productName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.currentStock}
                          size="small"
                          color={item.currentStock < 10 ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">{item.avgDailySales.toFixed(1)}</TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={item.daysUntilStockout < 7 ? 'error.main' : 'text.primary'}
                        >
                          {item.daysUntilStockout} days
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.recommendation}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.priority}
                          size="small"
                          color={
                            item.priority === 'High' ? 'error' :
                            item.priority === 'Medium' ? 'warning' : 'success'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
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
