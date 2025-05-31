import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Switch,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import productData from "../Data/ProductData.json";

const Inventory = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProductId, setMenuProductId] = useState(null);
  const [products, setProducts] = useState(productData.products);
  const navigate = useNavigate();

  const handleMenuOpen = (event, productId) => {
    setAnchorEl(event.currentTarget);
    setMenuProductId(productId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuProductId(null);
  };

  const handleViewProduct = () => {
    const product = products.find((p) => p.id === menuProductId);
    navigate("/products/view", {
      state: {
        ...product,
        isEditMode: false, // Explicitly set to false for inventory view
      },
    });
    handleMenuClose();
  };

  const handleEditProduct = () => {
    const product = products.find((p) => p.id === menuProductId);
    navigate("/products/create", { state: product });
    handleMenuClose();
  };

  const handleDeleteProduct = () => {
    // TODO: Implement delete functionality
    alert(`Delete product: ${menuProductId}`);
    handleMenuClose();
  };

  const handleFeaturedChange = (productId) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? { ...product, featured: !product.featured }
          : product
      )
    );
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <b>Product Name</b>
            </TableCell>
            <TableCell>
              <b>Code</b>
            </TableCell>
            <TableCell>
              <b>Category</b>
            </TableCell>
            <TableCell>
              <b>Stock Status</b>
            </TableCell>
            <TableCell>
              <b>Stock Count</b>
            </TableCell>
            <TableCell>
              <b>Price</b>
            </TableCell>
            <TableCell>
              <b>Featured</b>
            </TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={product.image}
                    variant="square"
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Typography variant="body2">{product.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>{product.code}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                <Typography
                  fontWeight={600}
                  color={
                    product.stocks === "Available"
                      ? "success.main"
                      : product.stocks === "Low Stock"
                        ? "#ffb300"
                        : "error.main"
                  }
                >
                  {product.stocks}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>{product.stock}</Typography>
              </TableCell>
              <TableCell>
                <Typography>
                  ₱
                  {product.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </TableCell>
              <TableCell>
                <Switch
                  checked={product.featured}
                  onChange={() => handleFeaturedChange(product.id)}
                  color="primary"
                />
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={(e) => handleMenuOpen(e, product.id)}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && menuProductId === product.id}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleViewProduct}>View Product</MenuItem>
                  <MenuItem onClick={handleEditProduct}>Edit Product</MenuItem>
                  <MenuItem
                    onClick={handleDeleteProduct}
                    sx={{ color: "error.main" }}
                  >
                    Delete Product
                  </MenuItem>
                </Menu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Inventory;
