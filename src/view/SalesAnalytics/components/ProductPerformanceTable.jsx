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
  Paper,
  Chip,
  Box
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

/**
 * ProductPerformanceTable Component
 * Displays detailed product performance metrics separated into Stars (top performers) and Duds (low performers)
 * Stars are ranked by revenue
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of product performance data
 * @param {Function} props.formatCurrency - Function to format currency values
 */
const ProductPerformanceTable = ({ data, formatCurrency }) => {
  // Sort by revenue (highest to lowest)
  const sortedByRevenue = [...data].sort((a, b) => b.revenue - a.revenue);
  
  // Top 10 performers (Stars)
  const stars = sortedByRevenue.slice(0, 10);
  
  // Bottom 10 performers (Duds)
  const duds = sortedByRevenue.slice(-10).reverse();
  
  const renderTable = (products, title, isStars = true) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          {title}
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Rank</strong></TableCell>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="right"><strong>Units Sold</strong></TableCell>
                <TableCell align="right"><strong>Revenue</strong></TableCell>
                <TableCell align="right"><strong>Avg Price</strong></TableCell>
                <TableCell align="center"><strong>Trend</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, index) => {
                const actualRank = isStars ? index + 1 : sortedByRevenue.length - products.length + index + 1;
                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Chip
                        label={`#${actualRank}`}
                        size="small"
                        sx={{
                          bgcolor: isStars && index < 3 ? '#ffd700' : '#e0e0e0',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {product.sku}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {product.unitsSold}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color={isStars ? "primary" : "text.secondary"}>
                        {formatCurrency(product.revenue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(product.avgPrice)}
                    </TableCell>
                    <TableCell align="center">
                      {product.trend > 0 ? (
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                          <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                          <Typography variant="body2" color="#4caf50" fontWeight={600}>
                            +{product.trend}%
                          </Typography>
                        </Box>
                      ) : product.trend < 0 ? (
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                          <TrendingDownIcon sx={{ color: '#f44336', fontSize: 20 }} />
                          <Typography variant="body2" color="#f44336" fontWeight={600}>
                            {product.trend}%
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No change
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.stock > 10 ? 'Healthy' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        size="small"
                        color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {renderTable(stars, '⭐ Star Products (Top 10 by Revenue)', true)}
      {duds.length > 0 && renderTable(duds, '📉 Underperforming Products (Bottom 10 by Revenue)', false)}
    </Box>
  );
};

export default ProductPerformanceTable;
