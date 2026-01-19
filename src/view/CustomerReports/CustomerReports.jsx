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
  CircularProgress,
  Chip,
  Avatar
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  People as PeopleIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import PDFReportService from '../../services/PDFReportService';

const CustomerReports = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [customerMetrics, setCustomerMetrics] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0
  });
  
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    fetchCustomerData();
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

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      // Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, user_id, total, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .not('user_id', 'is', null);

      if (ordersError) {
        console.error('Orders query error:', ordersError);
        throw ordersError;
      }

      // Fetch user profiles separately
      const userIds = [...new Set(orders?.map(o => o.user_id) || [])];
      
      if (userIds.length === 0) {
        setCustomerMetrics({
          totalCustomers: 0,
          activeCustomers: 0,
          newCustomers: 0,
          returningCustomers: 0
        });
        setTopCustomers([]);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Profiles query error:', profilesError);
        throw profilesError;
      }

      // Create user lookup map
      const profileMap = {};
      profiles?.forEach(profile => {
        profileMap[profile.id] = profile;
      });

      // Calculate customer metrics
      const uniqueUserIds = new Set();
      const customerData = {};

      orders?.forEach(order => {
        const userId = order.user_id;
        uniqueUserIds.add(userId);
        
        const profile = profileMap[userId];

        if (!customerData[userId]) {
          customerData[userId] = {
            id: userId,
            name: profile?.full_name || 'Unknown Customer',
            email: profile?.email || 'No Email',
            totalSpent: 0,
            orderCount: 0,
            orders: []
          };
        }

        customerData[userId].totalSpent += Number(order.total || 0);
        customerData[userId].orderCount++;
        customerData[userId].orders.push(order);
      });

      const activeCustomers = uniqueUserIds.size;

      // Fetch total registered customers (profiles table, not auth.users)
      const { count: totalCustomers, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (countError) {
        console.error('Count error:', countError);
        // Don't throw, just use active customers as fallback
      }

      // Calculate top customers
      const customersArray = Object.values(customerData);
      customersArray.sort((a, b) => b.totalSpent - a.totalSpent);
      const top10Customers = customersArray.slice(0, 10).map((customer, index) => ({
        rank: index + 1,
        name: customer.name,
        email: customer.email,
        orders: customer.orderCount,
        totalSpent: customer.totalSpent,
        avgOrderValue: customer.totalSpent / customer.orderCount
      }));

      setTopCustomers(top10Customers);

      // Calculate new vs returning customers
      const newCustomers = customersArray.filter(c => c.orderCount === 1).length;
      const returningCustomers = customersArray.filter(c => c.orderCount > 1).length;

      setCustomerMetrics({
        totalCustomers: totalCustomers || 0,
        activeCustomers,
        newCustomers,
        returningCustomers
      });

    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      
      // Calculate average lifetime value from top customers
      const avgLifetimeValue = topCustomers.length > 0
        ? topCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / topCustomers.length
        : 0;
      
      await PDFReportService.generateCustomerReport({
        customers: {
          totalCustomers: customerMetrics.totalCustomers,
          activeCustomers: customerMetrics.activeCustomers,
          newCustomers: customerMetrics.newCustomers,
          avgLifetimeValue
        },
        topCustomers,
        timeRange,
        startDate,
        endDate
      });
      
      console.log('✅ Customer PDF generated successfully');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert(`Failed to generate PDF report: ${error.message || 'Unknown error'}`);
    }
  };

  const formatCurrency = (amount) => {
    return `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
            👥 Customer Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customer analytics and lifetime value tracking
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={handleDownloadPDF}
          sx={{ bgcolor: '#63e01d', '&:hover': { bgcolor: '#56c018' } }}
        >
          Download PDF Report
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
                <FormControl size="small">
                  <Typography variant="caption" color="text.secondary" mb={0.5}>
                    Start Date
                  </Typography>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </FormControl>
                <FormControl size="small">
                  <Typography variant="caption" color="text.secondary" mb={0.5}>
                    End Date
                  </Typography>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </FormControl>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Customer Metrics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Customers
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {customerMetrics.totalCustomers.toLocaleString()}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: '#1976d2', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Customers
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {customerMetrics.activeCustomers.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    New Customers
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.main">
                    {customerMetrics.newCustomers.toLocaleString()}
                  </Typography>
                </Box>
                <CartIcon sx={{ fontSize: 40, color: '#ed6c02', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Returning Customers
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="secondary">
                    {customerMetrics.returningCustomers.toLocaleString()}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: '#9c27b0', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Customers Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={3}>
            🏆 Top 10 Customers by Lifetime Value
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Rank</strong></TableCell>
                  <TableCell><strong>Customer</strong></TableCell>
                  <TableCell align="center"><strong>Orders</strong></TableCell>
                  <TableCell align="right"><strong>Total Spent</strong></TableCell>
                  <TableCell align="right"><strong>Avg Order Value</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topCustomers.map((customer) => (
                  <TableRow key={customer.rank} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {customer.rank <= 3 && (
                          <Typography fontSize={20} mr={1}>
                            {customer.rank === 1 ? '🥇' : customer.rank === 2 ? '🥈' : '🥉'}
                          </Typography>
                        )}
                        <Typography fontWeight={customer.rank <= 3 ? 700 : 400}>
                          #{customer.rank}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: '#63e01d', width: 36, height: 36 }}>
                          {getInitials(customer.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {customer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={customer.orders} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color="success.main">
                        {formatCurrency(customer.totalSpent)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(customer.avgOrderValue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={customer.orders > 5 ? 'VIP' : customer.orders > 2 ? 'Loyal' : 'New'}
                        size="small"
                        color={customer.orders > 5 ? 'error' : customer.orders > 2 ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {topCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        No customer data available for the selected time range
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Customer Insights */}
      {topCustomers.length > 0 && (
        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  📊 Customer Insights
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Lifetime Value (Top 10)
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {formatCurrency(
                        topCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / topCustomers.length
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Orders per Customer
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      {(topCustomers.reduce((sum, c) => sum + c.orders, 0) / topCustomers.length).toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  🎯 Customer Segments
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">VIP Customers (5+ orders)</Typography>
                    <Chip 
                      label={topCustomers.filter(c => c.orders > 5).length} 
                      color="error" 
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Loyal Customers (3-5 orders)</Typography>
                    <Chip 
                      label={topCustomers.filter(c => c.orders > 2 && c.orders <= 5).length} 
                      color="success" 
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">New Customers (1-2 orders)</Typography>
                    <Chip 
                      label={topCustomers.filter(c => c.orders <= 2).length} 
                      color="default" 
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CustomerReports;
