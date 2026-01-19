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
  Grid
} from '@mui/material';

/**
 * TaxAnalysis Component
 * Shows tax collection, payment method fees, and tax obligations
 */
const TaxAnalysis = ({ taxData, formatCurrency }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Tax & Fees Analysis
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box p={2} bgcolor="#e3f2fd" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                VAT/Sales Tax Collected
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {formatCurrency(taxData.vatCollected)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box p={2} bgcolor="#fff3e0" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                Payment Processing Fees
              </Typography>
              <Typography variant="h6" fontWeight={700} color="warning.main">
                {formatCurrency(taxData.processingFees)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box p={2} bgcolor="#f3e5f5" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                Withholding Tax
              </Typography>
              <Typography variant="h6" fontWeight={700} color="secondary">
                {formatCurrency(taxData.withholdingTax)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box p={2} bgcolor="#e8f5e9" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                Total Tax Obligation
              </Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {formatCurrency(taxData.totalTaxObligation)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Payment Method Fees Breakdown */}
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Payment Processing Fees by Method
        </Typography>
        <TableContainer sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Payment Method</strong></TableCell>
                <TableCell align="center"><strong>Transactions</strong></TableCell>
                <TableCell align="right"><strong>Total Amount</strong></TableCell>
                <TableCell align="right"><strong>Fees</strong></TableCell>
                <TableCell align="right"><strong>Fee %</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxData.paymentFees?.map((fee, index) => (
                <TableRow key={index}>
                  <TableCell>{fee.method}</TableCell>
                  <TableCell align="center">{fee.transactions}</TableCell>
                  <TableCell align="right">{formatCurrency(fee.amount)}</TableCell>
                  <TableCell align="right">{formatCurrency(fee.fees)}</TableCell>
                  <TableCell align="right">{fee.feePercentage.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
              {(!taxData.paymentFees || taxData.paymentFees.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No fee data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Tax Breakdown */}
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Tax Breakdown
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Tax Type</strong></TableCell>
                <TableCell align="right"><strong>Rate</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Value Added Tax (VAT)</TableCell>
                <TableCell align="right">12%</TableCell>
                <TableCell align="right">{formatCurrency(taxData.vatCollected)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Withholding Tax (Suppliers)</TableCell>
                <TableCell align="right">Varies</TableCell>
                <TableCell align="right">{formatCurrency(taxData.withholdingTax)}</TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Total Tax Payable</strong></TableCell>
                <TableCell align="right">-</TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(taxData.totalTaxObligation)}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={3} p={2} bgcolor="#fff3e0" borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            <strong>⚠️ Note:</strong> Tax calculations are estimates. Please consult with a tax professional for accurate tax filing. Philippine businesses must file BIR Form 2550M (monthly) and 1702 (annual).
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaxAnalysis;
