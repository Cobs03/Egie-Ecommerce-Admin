import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

/**
 * CustomerDemographics Component
 * Location, payment preferences, and product category analysis
 */
const CustomerDemographics = ({ demographicsData, formatCurrency }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const CustomTooltip = ({ active, payload }) => {
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
          <Typography variant="body2" fontWeight={600}>
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="primary">
            Customers: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Top Locations */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Customer Locations (Top Cities)
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={demographicsData.locations || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="customers" fill="#1976d2" name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Grid container spacing={3} mb={3} justifyContent={'space-around'}>
        {/* Payment Method Preferences */}
        <Grid item xs={12} md={6} width="45%">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                💳 Payment Method Preferences
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographicsData.paymentMethods || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(demographicsData.paymentMethods || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Category Preferences */}
        <Grid item xs={12} md={6} width="45%">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Product Category Preferences
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographicsData.categories || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#82ca9d"
                    dataKey="value"
                  >
                    {(demographicsData.categories || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Order Size Distribution */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Order Size Distribution
          </Typography>
          <Grid container spacing={3} justifyContent={'space-around'}>
            {demographicsData.orderSizeDistribution?.map((size, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} width="22%">
                <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
                  <Typography variant="body2" color="text.secondary">
                    {size.range}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {size.customers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {size.percentage}% of customers
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <Box mt={3}>
        <Grid container spacing={3} justifyContent={'space-around'}>
          <Grid item xs={12} md={4} width="30%">
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Most Popular Category
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary">
                  {demographicsData.topCategory || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {demographicsData.topCategoryPercentage}% of sales
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} width="30%">
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Most Popular Payment
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {demographicsData.topPaymentMethod || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {demographicsData.topPaymentPercentage}% usage
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}    width="30%">
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Top Location
                </Typography>
                <Typography variant="h6" fontWeight={700} color="warning.main">
                  {demographicsData.topLocation || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {demographicsData.topLocationPercentage}% of customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CustomerDemographics;
