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
 * OrderStatusSummary Component
 * Displays order statistics grouped by status with count and total value
 * 
 * @param {Object} props
 * @param {Array} props.orders - Array of order status data
 * @param {Function} props.formatCurrency - Function to format currency values
 */
const OrderStatusSummary = ({ orders, formatCurrency }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Order Status Summary
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Orders</strong></TableCell>
                <TableCell align="right"><strong>Total Value</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.status}>
                  <TableCell>{order.status}</TableCell>
                  <TableCell align="center">{order.count}</TableCell>
                  <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No order data available
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

export default OrderStatusSummary;
