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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Warning } from '@mui/icons-material';

/**
 * RetentionChurn Component
 * Customer retention and churn analysis with trends
 */
const RetentionChurn = ({ retentionData, formatCurrency }) => {
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
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} mb={3} justifyContent={'space-around'}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Retention Rate
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {retentionData.retentionRate}%
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="caption" color="success.main">
                  Healthy retention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Churn Rate
              </Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {retentionData.churnRate}%
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <TrendingDown fontSize="small" color="error" />
                <Typography variant="caption" color="error.main">
                  Lost customers
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                At-Risk Customers
              </Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {retentionData.atRiskCount}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Warning fontSize="small" color="warning" />
                <Typography variant="caption" color="warning.main">
                  Need attention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg Customer Lifespan
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary">
                {retentionData.avgLifespan}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Retention Curve Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Customer Retention Curve
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={retentionData.retentionCurve || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="retentionRate"
                stroke="#4caf50"
                strokeWidth={3}
                name="Retention Rate (%)"
              />
              <Line
                type="monotone"
                dataKey="churnRate"
                stroke="#f44336"
                strokeWidth={2}
                name="Churn Rate (%)"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Grid container spacing={3} justifyContent={'space-around'}>
        <Grid item xs={12} md={6} width="45%">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Retention Metrics
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">30-Day Retention</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {retentionData.retention30}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={retentionData.retention30}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">60-Day Retention</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {retentionData.retention60}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={retentionData.retention60}
                  color="primary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">90-Day Retention</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {retentionData.retention90}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={retentionData.retention90}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} width="45%">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Churn Analysis
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Churned Customers (Last 30 Days)
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    {retentionData.churnedCustomers}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Lost Revenue from Churn
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    {formatCurrency(retentionData.churnRevenueLoss)}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Days Before Churn
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {retentionData.avgDaysBeforeChurn} days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Card sx={{ bgcolor: '#fff3e0' }}>
          <CardContent>
            <Typography variant="body2" fontWeight={600} color="warning.main" gutterBottom>
              ⚠️ At-Risk Customer Alert
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You have <strong>{retentionData.atRiskCount} customers</strong> who haven't purchased in over 60 days. 
              Consider targeted re-engagement campaigns with personalized offers to win them back.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default RetentionChurn;
