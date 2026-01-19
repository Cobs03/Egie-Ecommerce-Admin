import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';

/**
 * CustomerJourney Component
 * Analyzes customer behavior patterns and purchase journey
 */
const CustomerJourney = ({ journeyData, formatCurrency }) => {
  return (
    <Box>
      {/* Journey Metrics */}
      <Grid container spacing={3} mb={3} justifyContent={'space-around'}>
        <Grid item xs={12} md={3} width="20%">
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg Time to First Purchase
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary">
                {journeyData.avgTimeToFirstPurchase} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3} width="20%">
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg Time Between Orders
              </Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {journeyData.avgTimeBetweenOrders} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}   width="20%">
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg Days Since Last Order
              </Typography>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {journeyData.avgDaysSinceLastOrder} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}  width="20%">
          <Card sx={{ bgcolor: '#f3e5f5', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Cart Abandonment Rate
              </Typography>
              <Typography variant="h5" fontWeight={700} color="secondary">
                {journeyData.cartAbandonmentRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* First Purchase Products */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            🎯 Most Popular First Purchase Products
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell align="center"><strong>First-Time Buyers</strong></TableCell>
                  <TableCell align="right"><strong>Avg Price</strong></TableCell>
                  <TableCell align="center"><strong>Repeat Rate</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {journeyData.firstPurchaseProducts?.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="center">{product.count}</TableCell>
                    <TableCell align="right">{formatCurrency(product.avgPrice)}</TableCell>
                    <TableCell align="center">
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption">{product.repeatRate}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={product.repeatRate}
                          color={product.repeatRate >= 50 ? "success" : "warning"}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {(!journeyData.firstPurchaseProducts || journeyData.firstPurchaseProducts.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Purchase Patterns */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Purchase Frequency Patterns
          </Typography>
          <Grid container spacing={2} justifyContent={'space-around'}>
            {journeyData.purchaseFrequency?.map((pattern, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} width="22%">
                <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {pattern.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {pattern.count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pattern.percentage}% of customers
                  </Typography>
                  <Box mt={1}>
                    <LinearProgress
                      variant="determinate"
                      value={pattern.percentage}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Cross-sell Opportunities */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            🔄 Frequently Bought Together
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Product A</strong></TableCell>
                  <TableCell><strong>Often Paired With</strong></TableCell>
                  <TableCell align="center"><strong>Co-Purchase Rate</strong></TableCell>
                  <TableCell align="right"><strong>Bundle Revenue</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {journeyData.crossSellOpportunities?.map((pair, index) => (
                  <TableRow key={index}>
                    <TableCell>{pair.productA}</TableCell>
                    <TableCell>{pair.productB}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${pair.rate}%`}
                        size="small"
                        color={pair.rate >= 30 ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(pair.revenue)}</TableCell>
                  </TableRow>
                ))}
                {(!journeyData.crossSellOpportunities || journeyData.crossSellOpportunities.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No cross-sell data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card sx={{ bgcolor: '#e8f5e9' }}>
        <CardContent>
          <Typography variant="body2" fontWeight={600} color="success.main" gutterBottom>
            💡 Key Customer Journey Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • The average customer takes <strong>{journeyData.avgTimeToFirstPurchase} days</strong> from registration to first purchase
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Repeat customers typically buy again within <strong>{journeyData.avgTimeBetweenOrders} days</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>{journeyData.cartAbandonmentRate}%</strong> cart abandonment suggests opportunities for recovery campaigns
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerJourney;
