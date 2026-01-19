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
  Chip
} from '@mui/material';

/**
 * ProductProfitability Component
 * Shows profit analysis by product and category
 */
const ProductProfitability = ({ productData, formatCurrency }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Product Profitability Analysis
        </Typography>

        {/* Top Products by Revenue */}
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Top 10 Products by Revenue
        </Typography>
        <TableContainer sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="center"><strong>Units Sold</strong></TableCell>
                <TableCell align="right"><strong>Revenue</strong></TableCell>
                <TableCell align="right"><strong>COGS</strong></TableCell>
                <TableCell align="right"><strong>Profit</strong></TableCell>
                <TableCell align="right"><strong>Margin</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productData.topProducts?.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell align="center">{product.unitsSold}</TableCell>
                  <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                  <TableCell align="right">{formatCurrency(product.cogs)}</TableCell>
                  <TableCell align="right">
                    <Typography color={product.profit >= 0 ? "success.main" : "error.main"}>
                      {formatCurrency(product.profit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${product.margin.toFixed(1)}%`}
                      size="small"
                      color={product.margin >= 30 ? "success" : product.margin >= 15 ? "warning" : "error"}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {(!productData.topProducts || productData.topProducts.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No product data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Category Performance */}
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Profit by Category
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell align="center"><strong>Products</strong></TableCell>
                <TableCell align="right"><strong>Revenue</strong></TableCell>
                <TableCell align="right"><strong>Profit</strong></TableCell>
                <TableCell align="right"><strong>Margin</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productData.categories?.map((category, index) => (
                <TableRow key={index}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell align="center">{category.productCount}</TableCell>
                  <TableCell align="right">{formatCurrency(category.revenue)}</TableCell>
                  <TableCell align="right">
                    <Typography color={category.profit >= 0 ? "success.main" : "error.main"}>
                      {formatCurrency(category.profit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${category.margin.toFixed(1)}%`}
                      size="small"
                      color={category.margin >= 30 ? "success" : category.margin >= 15 ? "warning" : "error"}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {(!productData.categories || productData.categories.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No category data available
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

export default ProductProfitability;
