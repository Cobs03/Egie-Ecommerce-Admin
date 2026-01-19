import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

/**
 * RevenueBreakdown Component
 * Detailed revenue analysis including gross revenue, refunds, discounts, and net revenue
 */
const RevenueBreakdown = ({ revenueData, formatCurrency }) => {
  const calculatePercentage = (part, total) => {
    if (!total || total === 0) return 0;
    return ((part / total) * 100).toFixed(1);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Revenue Breakdown
        </Typography>

        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={2} bgcolor="#e3f2fd" borderRadius={1}>
            <Typography variant="body1" fontWeight={600}>Gross Revenue</Typography>
            <Typography variant="h5" fontWeight={700} color="primary">
              {formatCurrency(revenueData.grossRevenue)}
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingDown fontSize="small" color="error" />
                      <Typography>Refunds & Returns</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="error.main">
                      -{formatCurrency(revenueData.refunds)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={`${calculatePercentage(revenueData.refunds, revenueData.grossRevenue)}%`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingDown fontSize="small" color="warning" />
                      <Typography>Discounts & Coupons</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="warning.main">
                      -{formatCurrency(revenueData.discounts)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={`${calculatePercentage(revenueData.discounts, revenueData.grossRevenue)}%`}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingDown fontSize="small" color="error" />
                      <Typography>Cancelled Orders</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="error.main">
                      -{formatCurrency(revenueData.cancelled)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={`${calculatePercentage(revenueData.cancelled, revenueData.grossRevenue)}%`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} p={2} bgcolor="#e8f5e9" borderRadius={1}>
            <Typography variant="body1" fontWeight={700}>Net Revenue</Typography>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {formatCurrency(revenueData.netRevenue)}
            </Typography>
          </Box>
        </Box>

        <Box bgcolor="#f5f5f5" p={2} borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            <strong>Average Order Value:</strong> {formatCurrency(revenueData.avgOrderValue)}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            <strong>Total Orders Completed:</strong> {revenueData.totalOrders?.toLocaleString() || 0}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueBreakdown;
