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
  Avatar,
  Chip
} from '@mui/material';

/**
 * TopCustomersTable Component
 * Displays top 10 customers ranked by lifetime value with order counts and status badges
 * 
 * @param {Object} props
 * @param {Array} props.topCustomers - Array of top customer data
 * @param {Function} props.formatCurrency - Function to format currency values
 * @param {Function} props.getInitials - Function to extract initials from name
 */
const TopCustomersTable = ({ topCustomers, formatCurrency, getInitials }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={3}>
          🏆 Top 10 Customers by Lifetime Value
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Rank</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell align="center"><strong>Orders</strong></TableCell>
                <TableCell align="right"><strong>Total Spent</strong></TableCell>
                <TableCell align="right"><strong>Avg Order Value</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topCustomers.map((customer) => (
                <TableRow key={customer.rank} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {customer.rank <= 3 && (
                        <Typography fontSize={20} mr={1}>
                          {customer.rank === 1 ? '🥇' : customer.rank === 2 ? '🥈' : '🥉'}
                        </Typography>
                      )}
                      <Typography fontWeight={customer.rank <= 3 ? 700 : 400}>
                        #{customer.rank}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: '#63e01d', width: 36, height: 36 }}>
                        {getInitials(customer.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {customer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={customer.orders} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600} color="success.main">
                      {formatCurrency(customer.totalSpent)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(customer.avgOrderValue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={customer.orders > 5 ? 'VIP' : customer.orders > 2 ? 'Loyal' : 'New'}
                      size="small"
                      color={customer.orders > 5 ? 'error' : customer.orders > 2 ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {topCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No customer data available for the selected time range
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

export default TopCustomersTable;
