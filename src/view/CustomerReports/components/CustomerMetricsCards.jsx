import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

/**
 * CustomerMetricsCards Component
 * Displays 4 key customer metric cards: Total, Active, New, Returning customers
 * 
 * @param {Object} props
 * @param {Object} props.customerMetrics - Customer metrics data
 * @param {number} props.customerMetrics.totalCustomers - Total registered customers
 * @param {number} props.customerMetrics.activeCustomers - Customers with orders in period
 * @param {number} props.customerMetrics.newCustomers - First-time buyers
 * @param {number} props.customerMetrics.returningCustomers - Repeat buyers
 */
const CustomerMetricsCards = ({ customerMetrics }) => {
  return (
    <Grid container spacing={3} mb={3} justifyContent={'space-around'}>
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
  );
};

export default CustomerMetricsCards;
