import React, { useState } from 'react';
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
  Paper,
  Chip,
  Alert,
  TablePagination
} from '@mui/material';

/**
 * InventoryRecommendationsTable Component
 * Displays AI-driven inventory recommendations based on sales trends and stock levels
 * Includes stockout predictions, priority levels, and pagination
 * 
 * Average Daily Sales is calculated as: (Total Units Sold in Period) ÷ (Number of Days in Period)
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of inventory recommendations
 */
const InventoryRecommendationsTable = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated data
  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card>
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>AI-Driven Recommendations:</strong> Based on sales trends and current inventory levels. 
            Average Daily Sales = Total Units Sold ÷ Days in Period
          </Typography>
        </Alert>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Inventory & Production Recommendations
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="center"><strong>Current Stock</strong></TableCell>
                <TableCell align="center"><strong>Avg Daily Sales</strong></TableCell>
                <TableCell align="center"><strong>Days Until Stockout</strong></TableCell>
                <TableCell><strong>Recommendation</strong></TableCell>
                <TableCell align="center"><strong>Priority</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {item.productName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.currentStock}
                      size="small"
                      color={item.currentStock < 10 ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">{item.avgDailySales.toFixed(1)}</TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={item.daysUntilStockout < 7 ? 'error.main' : 'text.primary'}
                    >
                      {item.daysUntilStockout} days
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.recommendation}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.priority}
                      size="small"
                      color={
                        item.priority === 'High' ? 'error' :
                        item.priority === 'Medium' ? 'warning' : 'success'
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
    </Card>
  );
};

export default InventoryRecommendationsTable;
