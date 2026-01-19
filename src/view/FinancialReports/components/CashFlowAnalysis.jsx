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
import { TrendingUp, TrendingDown, AccessTime } from '@mui/icons-material';

/**
 * CashFlowAnalysis Component
 * Shows cash inflow, outflow, and outstanding payments
 */
const CashFlowAnalysis = ({ cashFlowData, formatCurrency }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Cash Flow Analysis
        </Typography>

        {/* Summary Cards */}
        <Box display="flex" gap={2} mb={3}>
          <Box flex={1} p={2} bgcolor="#e8f5e9" borderRadius={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <TrendingUp fontSize="small" color="success" />
              <Typography variant="body2" color="text.secondary">
                Cash Inflow
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {formatCurrency(cashFlowData.inflow)}
            </Typography>
          </Box>

          <Box flex={1} p={2} bgcolor="#ffebee" borderRadius={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <TrendingDown fontSize="small" color="error" />
              <Typography variant="body2" color="text.secondary">
                Cash Outflow
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700} color="error.main">
              {formatCurrency(cashFlowData.outflow)}
            </Typography>
          </Box>

          <Box flex={1} p={2} bgcolor="#e3f2fd" borderRadius={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AccessTime fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                Net Cash Flow
              </Typography>
            </Box>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              color={cashFlowData.netCashFlow >= 0 ? "success.main" : "error.main"}
            >
              {formatCurrency(cashFlowData.netCashFlow)}
            </Typography>
          </Box>
        </Box>

        {/* Outstanding Payments */}
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Outstanding Payments
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Payment Status</strong></TableCell>
                <TableCell align="center"><strong>Orders</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="Pending" size="small" color="warning" />
                  </Box>
                </TableCell>
                <TableCell align="center">{cashFlowData.pendingOrders}</TableCell>
                <TableCell align="right">{formatCurrency(cashFlowData.pendingAmount)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="Processing" size="small" color="info" />
                  </Box>
                </TableCell>
                <TableCell align="center">{cashFlowData.processingOrders}</TableCell>
                <TableCell align="right">{formatCurrency(cashFlowData.processingAmount)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="Paid" size="small" color="success" />
                  </Box>
                </TableCell>
                <TableCell align="center">{cashFlowData.paidOrders}</TableCell>
                <TableCell align="right">{formatCurrency(cashFlowData.paidAmount)}</TableCell>
              </TableRow>

              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Total Outstanding</strong></TableCell>
                <TableCell align="center">
                  <strong>{cashFlowData.totalOutstandingOrders}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(cashFlowData.totalOutstandingAmount)}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            <strong>Expected Cash Collection:</strong> {formatCurrency(cashFlowData.expectedCollection)}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            <strong>Days Sales Outstanding (DSO):</strong> {cashFlowData.dso} days
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CashFlowAnalysis;
