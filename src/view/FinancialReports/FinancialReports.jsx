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
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import PDFReportService from '../../services/PDFReportService';

const FinancialReports = () => {
  const [loading, setLoading] = useState(true);
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

      // Fetch revenue (completed/delivered orders)
      const { data: revenueOrders, error: revenueError } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['completed', 'delivered']);

      if (revenueError) throw revenueError;

      const totalRevenue = revenueOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

      // For demo: Assume expenses are 30% of revenue (you can modify this to fetch actual expenses)
      const totalExpenses = totalRevenue * 0.3;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      setFinancialData({
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit,
        profitMargin
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
        percentage: (data.amount / totalPayments) * 100
      }));

      setPayments(paymentsArray);

      // Fetch order status breakdown
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('status, total')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (ordersError) throw ordersError;

      const orderBreakdown = {};
      ordersData.forEach(order => {
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

    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            💰 Financial Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive financial analysis and profit tracking
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

      {/* Financial Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {formatCurrency(financialData.revenue)}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: '#1976d2', opacity: 0.7 }} />
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
                    Total Expenses
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.main">
                    {formatCurrency(financialData.expenses)}
                  </Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 40, color: '#ed6c02', opacity: 0.7 }} />
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
                    Net Profit
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {formatCurrency(financialData.netProfit)}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.7 }} />
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
                    Profit Margin
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="secondary">
                    {financialData.profitMargin.toFixed(2)}%
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: '#9c27b0', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Methods Breakdown */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Payment Methods Breakdown
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Method</strong></TableCell>
                      <TableCell align="center"><strong>Transactions</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                      <TableCell align="right"><strong>Share</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.method}>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell align="center">{payment.count}</TableCell>
                        <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell align="right">{payment.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No payment data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Order Status Summary
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="center"><strong>Orders</strong></TableCell>
                      <TableCell align="right"><strong>Total Value</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.status}>
                        <TableCell>{order.status}</TableCell>
                        <TableCell align="center">{order.count}</TableCell>
                        <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                      </TableRow>
                    ))}
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No order data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Financial Notes */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            📌 Financial Notes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" paragraph>
            • Revenue includes all completed and delivered orders
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Expenses are calculated at 30% of revenue (modify as needed)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Profit Margin = (Net Profit / Revenue) × 100
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • For accurate expense tracking, integrate with your accounting system
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinancialReports;
