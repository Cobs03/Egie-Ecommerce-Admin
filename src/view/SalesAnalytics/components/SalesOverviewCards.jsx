import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

/**
 * SalesOverviewCards Component
 * Displays 4 key metric cards: Total Revenue, Total Orders, Avg Order Value, Top Product
 * 
 * @param {Object} props
 * @param {Object} props.salesOverview - Sales overview data
 * @param {number} props.salesOverview.totalRevenue - Total revenue amount
 * @param {number} props.salesOverview.totalOrders - Total number of orders
 * @param {number} props.salesOverview.avgOrderValue - Average order value
 * @param {Object} props.salesOverview.topProduct - Top selling product details
 * @param {Function} props.formatCurrency - Function to format currency values
 * @param {number} props.refreshKey - Key to force re-render when data updates
 */
const SalesOverviewCards = ({ salesOverview, formatCurrency, refreshKey }) => {
  return (
    <Grid container spacing={3} mb={3} justifyContent={'space-around'}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue (₱)
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
  );
};

export default SalesOverviewCards;
