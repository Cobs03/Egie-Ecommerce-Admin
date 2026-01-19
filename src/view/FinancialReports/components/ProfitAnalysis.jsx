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
  Divider
} from '@mui/material';

/**
 * ProfitAnalysis Component
 * Detailed profit breakdown: Gross Profit, Operating Expenses, Net Profit
 */
const ProfitAnalysis = ({ profitData, formatCurrency }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Profit & Loss Analysis
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
                <TableCell align="right"><strong>% of Revenue</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Revenue Section */}
              <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                <TableCell><strong>Net Revenue</strong></TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(profitData.netRevenue)}</strong>
                </TableCell>
                <TableCell align="right"><strong>100%</strong></TableCell>
              </TableRow>

              {/* COGS */}
              <TableRow>
                <TableCell sx={{ pl: 4 }}>Cost of Goods Sold (COGS)</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>
                  -{formatCurrency(profitData.cogs)}
                </TableCell>
                <TableCell align="right">
                  {((profitData.cogs / profitData.netRevenue) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>

              {/* Gross Profit */}
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Gross Profit</strong></TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(profitData.grossProfit)}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{((profitData.grossProfit / profitData.netRevenue) * 100).toFixed(1)}%</strong>
                </TableCell>
              </TableRow>

              {/* Operating Expenses */}
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="subtitle2" fontWeight={600} mt={2}>
                    Operating Expenses
                  </Typography>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ pl: 4 }}>Shipping Costs</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>
                  -{formatCurrency(profitData.shippingCosts)}
                </TableCell>
                <TableCell align="right">
                  {((profitData.shippingCosts / profitData.netRevenue) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ pl: 4 }}>Payment Processing Fees</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>
                  -{formatCurrency(profitData.paymentFees)}
                </TableCell>
                <TableCell align="right">
                  {((profitData.paymentFees / profitData.netRevenue) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ pl: 4 }}>Marketing & Advertising</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>
                  -{formatCurrency(profitData.marketingCosts)}
                </TableCell>
                <TableCell align="right">
                  {((profitData.marketingCosts / profitData.netRevenue) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ pl: 4 }}>Operational Expenses</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>
                  -{formatCurrency(profitData.operationalExpenses)}
                </TableCell>
                <TableCell align="right">
                  {((profitData.operationalExpenses / profitData.netRevenue) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>

              {/* Total Operating Expenses */}
              <TableRow sx={{ bgcolor: '#fff3e0' }}>
                <TableCell><strong>Total Operating Expenses</strong></TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(profitData.totalOperatingExpenses)}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{((profitData.totalOperatingExpenses / profitData.netRevenue) * 100).toFixed(1)}%</strong>
                </TableCell>
              </TableRow>

              {/* Net Profit */}
              <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                <TableCell><strong>Net Profit (EBIT)</strong></TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {formatCurrency(profitData.netProfit)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body1" fontWeight={700} color="success.main">
                    {((profitData.netProfit / profitData.netRevenue) * 100).toFixed(1)}%
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-around">
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">Gross Margin</Typography>
            <Typography variant="h6" fontWeight={700} color="primary">
              {((profitData.grossProfit / profitData.netRevenue) * 100).toFixed(1)}%
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">Operating Margin</Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main">
              {(((profitData.grossProfit - profitData.totalOperatingExpenses) / profitData.netRevenue) * 100).toFixed(1)}%
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">Net Profit Margin</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">
              {((profitData.netProfit / profitData.netRevenue) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfitAnalysis;
