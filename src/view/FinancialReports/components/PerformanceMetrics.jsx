import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Divider
} from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';

/**
 * PerformanceMetrics Component
 * Period-over-period comparison and key performance indicators
 */
const PerformanceMetrics = ({ metricsData, formatCurrency }) => {
  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp color="success" />;
    if (change < 0) return <TrendingDown color="error" />;
    return <Remove color="disabled" />;
  };

  const getTrendColor = (change) => {
    if (change > 0) return "success.main";
    if (change < 0) return "error.main";
    return "text.secondary";
  };

  const MetricCard = ({ title, current, previous, isPercentage = false, isCurrency = true }) => {
    const change = previous ? ((current - previous) / previous * 100) : 0;
    const displayChange = Math.abs(change).toFixed(1);

    return (
      <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {isCurrency ? formatCurrency(current) : isPercentage ? `${current.toFixed(1)}%` : current.toLocaleString()}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {getTrendIcon(change)}
          <Typography variant="body2" color={getTrendColor(change)} fontWeight={600}>
            {displayChange}% vs previous period
          </Typography>
        </Box>
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Previous: {isCurrency ? formatCurrency(previous) : isPercentage ? `${previous.toFixed(1)}%` : previous.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Performance Metrics & Trends
        </Typography>

        <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.secondary">
          REVENUE METRICS
        </Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Revenue"
              current={metricsData.current.revenue}
              previous={metricsData.previous.revenue}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Average Order Value"
              current={metricsData.current.avgOrderValue}
              previous={metricsData.previous.avgOrderValue}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Total Orders"
              current={metricsData.current.totalOrders}
              previous={metricsData.previous.totalOrders}
              isCurrency={false}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.secondary">
          PROFITABILITY METRICS
        </Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Gross Profit"
              current={metricsData.current.grossProfit}
              previous={metricsData.previous.grossProfit}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Net Profit"
              current={metricsData.current.netProfit}
              previous={metricsData.previous.netProfit}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Profit Margin"
              current={metricsData.current.profitMargin}
              previous={metricsData.previous.profitMargin}
              isPercentage={true}
              isCurrency={false}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.secondary">
          EFFICIENCY METRICS
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Revenue Growth Rate
              </Typography>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {metricsData.growthRate.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(Math.abs(metricsData.growthRate), 100)}
                color={metricsData.growthRate >= 0 ? "success" : "error"}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Customer Acquisition Cost
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(metricsData.cac)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Marketing Cost / New Customers
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Return on Ad Spend (ROAS)
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {metricsData.roas.toFixed(2)}x
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Revenue / Marketing Spend
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box mt={3} p={2} bgcolor="#e3f2fd" borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            <strong>📊 Performance Summary:</strong> {metricsData.summary}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
