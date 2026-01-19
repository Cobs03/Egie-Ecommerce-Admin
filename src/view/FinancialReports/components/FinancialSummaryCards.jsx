import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

/**
 * FinancialSummaryCards Component
 * Displays 4 key financial metric cards: Revenue, Expenses, Net Profit, Profit Margin
 * 
 * @param {Object} props
 * @param {Object} props.financialData - Financial data object
 * @param {number} props.financialData.revenue - Total revenue
 * @param {number} props.financialData.expenses - Total expenses
 * @param {number} props.financialData.netProfit - Net profit
 * @param {number} props.financialData.profitMargin - Profit margin percentage
 * @param {Function} props.formatCurrency - Function to format currency values
 */
const FinancialSummaryCards = ({ financialData, formatCurrency }) => {
  return (
    <Grid container spacing={3} mb={3} justifyContent={"space-around"}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "#e3f2fd", height: "100%" }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {formatCurrency(financialData.revenue)}
                </Typography>
              </Box>
              <MoneyIcon
                sx={{ fontSize: 40, color: "#1976d2", opacity: 0.7 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "#fff3e0", height: "100%" }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {formatCurrency(financialData.expenses)}
                </Typography>
              </Box>
              <TrendingDownIcon
                sx={{ fontSize: 40, color: "#ed6c02", opacity: 0.7 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "#e8f5e9", height: "100%" }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Net Profit
                </Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {formatCurrency(financialData.netProfit)}
                </Typography>
              </Box>
              <TrendingUpIcon
                sx={{ fontSize: 40, color: "#2e7d32", opacity: 0.7 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "#f3e5f5", height: "100%" }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Profit Margin
                </Typography>
                <Typography variant="h5" fontWeight={700} color="secondary">
                  {financialData.profitMargin.toFixed(2)}%
                </Typography>
              </Box>
              <AssessmentIcon
                sx={{ fontSize: 40, color: "#9c27b0", opacity: 0.7 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default FinancialSummaryCards;
