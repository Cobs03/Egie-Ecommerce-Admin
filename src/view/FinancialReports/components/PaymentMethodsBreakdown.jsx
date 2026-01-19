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
  TableRow
} from '@mui/material';

/**
 * PaymentMethodsBreakdown Component
 * Displays a table of payment methods with transaction counts, amounts, and market share
 * 
 * @param {Object} props
 * @param {Array} props.payments - Array of payment method data
 * @param {Function} props.formatCurrency - Function to format currency values
 */
const PaymentMethodsBreakdown = ({ payments, formatCurrency }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Payment Methods Breakdown
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Method</strong></TableCell>
                <TableCell align="center"><strong>Transactions</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
                <TableCell align="right"><strong>Share</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.method}>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell align="center">{payment.count}</TableCell>
                  <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell align="right">{payment.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No payment data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsBreakdown;
