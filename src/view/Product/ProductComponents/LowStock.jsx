import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Button,
  Stack,
  Drawer,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import productData from "../Data/ProductData.json";

const getStockColor = (stock) => {
  if (stock === 0) return "error.main";
  if (stock <= 10) return "#ffb300"; // orange for low stock
  return "success.main";
};

const LowStock = () => {
  const [products, setProducts] = useState(productData.products);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockChange, setStockChange] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");

  // Filter low stock products (stock <= 10)
  const lowStockProducts = useMemo(() => {
    return products.filter((product) => product.stock <= 10);
  }, [products]);

  const handleUpdateStockClick = (product) => {
    setSelectedProduct(product);
    setStockChange(0);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedProduct(null);
    setStockChange(0);
  };

  const handleChangeStock = (type) => {
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (selectedProduct) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === selectedProduct.id) {
            const newStock = Math.max(0, p.stock + stockChange);
            return {
              ...p,
              stock: newStock,
              stocks:
                newStock === 0
                  ? "Out of Stock"
                  : newStock <= 10
                    ? "Low Stock"
                    : "Available",
            };
          }
          return p;
        })
      );
    }
    setConfirmOpen(false);
    setDrawerOpen(false);
    setSelectedProduct(null);
    setStockChange(0);
  };

  // Get the latest selected product from products state
  const currentSelectedProduct =
    selectedProduct && products.find((p) => p.id === selectedProduct.id);

  return (
    <>
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
                <b>Action</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lowStockProducts.map((product) => (
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
                    sx={{ color: getStockColor(product.stock) }}
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
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    sx={{
                      bgcolor: "#1976d2",
                      color: "#fff",
                      fontWeight: 600,
                      minWidth: 140,
                      "&:hover": { bgcolor: "#115293" },
                    }}
                    onClick={() => handleUpdateStockClick(product)}
                  >
                    Update Stock
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{ sx: { width: 350, p: 3 } }}
      >
        {currentSelectedProduct && (
          <Box p={3}>
            <Typography variant="h6" mb={2}>
              Update Stock
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                src={currentSelectedProduct.image}
                variant="square"
                sx={{ width: 40, height: 40, mr: 2 }}
              />
              <Box>
                <Typography fontWeight={600}>
                  {currentSelectedProduct.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentSelectedProduct.code}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Current Stock: <b>{currentSelectedProduct.stock}</b>
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <IconButton
                onClick={() => setStockChange((v) => v - 1)}
                disabled={stockChange <= -999}
                size="small"
                sx={{ border: "1px solid #ccc", mr: 1 }}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                label="Stock Change"
                type="number"
                value={stockChange}
                onChange={(e) => setStockChange(Number(e.target.value))}
                inputProps={{ style: { textAlign: "center", width: 80 } }}
                sx={{ mx: 1 }}
              />
              <IconButton
                onClick={() => setStockChange((v) => v + 1)}
                disabled={stockChange >= 999}
                size="small"
                sx={{ border: "1px solid #ccc", ml: 1 }}
              >
                <AddIcon />
              </IconButton>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={stockChange === 0}
                onClick={() =>
                  handleChangeStock(stockChange > 0 ? "add" : "remove")
                }
              >
                Change Stock
              </Button>
              <Button variant="outlined" fullWidth onClick={handleDrawerClose}>
                Cancel
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          Confirm Stock {confirmType === "add" ? "Addition" : "Removal"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmType === "add" ? "add" : "remove"}{" "}
            {Math.abs(stockChange)} stock for{" "}
            <b>{currentSelectedProduct?.name}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            color={confirmType === "add" ? "primary" : "error"}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LowStock;
