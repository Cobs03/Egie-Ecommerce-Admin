import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';

/**
 * CustomerInsightsCards Component
 * Displays customer analytics insights including average lifetime value,
 * average orders per customer, and customer segmentation
 * 
 * @param {Object} props
 * @param {Array} props.topCustomers - Array of top customer data for calculations
 * @param {Function} props.formatCurrency - Function to format currency values
 */
const CustomerInsightsCards = ({ topCustomers, formatCurrency }) => {
  if (topCustomers.length === 0) {
    return null;
  }

  const avgLifetimeValue = topCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / topCustomers.length;
  const avgOrdersPerCustomer = (topCustomers.reduce((sum, c) => sum + c.orders, 0) / topCustomers.length).toFixed(1);
  
  const vipCount = topCustomers.filter(c => c.orders > 5).length;
  const loyalCount = topCustomers.filter(c => c.orders > 2 && c.orders <= 5).length;
  const newCount = topCustomers.filter(c => c.orders <= 2).length;

  return (
    <Grid container spacing={3} mt={1} justifyContent={'space-around'}>
      <Grid item xs={12} md={6} width="40%">
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
                  {formatCurrency(avgLifetimeValue)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Average Orders per Customer
                </Typography>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  {avgOrdersPerCustomer}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} width="40%">
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              🎯 Customer Segments
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">VIP Customers (5+ orders)</Typography>
                <Chip 
                  label={vipCount} 
                  color="error" 
                  size="small"
                />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Loyal Customers (3-5 orders)</Typography>
                <Chip 
                  label={loyalCount} 
                  color="success" 
                  size="small"
                />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">New Customers (1-2 orders)</Typography>
                <Chip 
                  label={newCount} 
                  color="default" 
                  size="small"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CustomerInsightsCards;
