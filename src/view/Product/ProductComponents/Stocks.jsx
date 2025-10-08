import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  Divider,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import productData from "../Data/ProductData.json";

const Stocks = () => {
  const [products, setProducts] = useState(productData.products);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockChange, setStockChange] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Sorting & Filtering state
  const [nameFilterAnchor, setNameFilterAnchor] = useState(null);
  const [statusFilterAnchor, setStatusFilterAnchor] = useState(null);
  const [nameSort, setNameSort] = useState(null); // "az", "za", "recent"
  const [statusFilter, setStatusFilter] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // All products (not just low stock)
  const allProducts = useMemo(() => {
    return products;
  }, [products]);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...allProducts];
    
    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter(product => {
        const status = getStockStatus(product.stock);
        return statusFilter.includes(status);
      });
    }
    
    // Apply name sorting
    if (nameSort === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (nameSort === "za") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (nameSort === "recent") {
      // Assuming recent means last edited
      result.sort((a, b) => new Date(b.lastEdit || "2025-03-11") - new Date(a.lastEdit || "2025-03-11"));
    }
    
    setFilteredProducts(result);
    setPage(0); // Reset to first page when filters change
  }, [allProducts, statusFilter, nameSort]);

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
  
  // Filter handlers
  const handleNameFilterOpen = (event) => {
    setNameFilterAnchor(event.currentTarget);
  };
  
  const handleStatusFilterOpen = (event) => {
    setStatusFilterAnchor(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setNameFilterAnchor(null);
    setStatusFilterAnchor(null);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Function to get status color
  const getStockColor = (stock) => {
    if (stock === 0) return "error";
    if (stock <= 10) return "warning";
    return "success";
  };
  
  // Function to get stock status text
  const getStockStatus = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "Available";
  };

  // Get the latest selected product from products state
  const currentSelectedProduct =
    selectedProduct && products.find((p) => p.id === selectedProduct.id);

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">Product Name</Typography>
                  <IconButton size="small" onClick={handleNameFilterOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Popover
                  open={Boolean(nameFilterAnchor)}
                  anchorEl={nameFilterAnchor}
                  onClose={handleFilterClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <List sx={{ width: 200, pt: 0, pb: 0 }}>
                    <ListItem button onClick={() => { setNameSort("az"); handleFilterClose(); }}
                      selected={nameSort === "az"}>
                      <ListItemText primary="A - Z" />
                      {nameSort === "az" && <ArrowUpwardIcon fontSize="small" />}
                    </ListItem>
                    <ListItem button onClick={() => { setNameSort("za"); handleFilterClose(); }}
                      selected={nameSort === "za"}>
                      <ListItemText primary="Z - A" />
                      {nameSort === "za" && <ArrowDownwardIcon fontSize="small" />}
                    </ListItem>
                    <ListItem button onClick={() => { setNameSort("recent"); handleFilterClose(); }}
                      selected={nameSort === "recent"}>
                      <ListItemText primary="Recent" />
                    </ListItem>
                    {nameSort && (
                      <>
                        <Divider />
                        <ListItem button onClick={() => { setNameSort(null); handleFilterClose(); }}>
                          <ListItemText primary="Clear Sort" sx={{ color: "text.secondary" }} />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Popover>
              </TableCell>
              <TableCell>
                <b>Code</b>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">Stock Status</Typography>
                  <IconButton size="small" onClick={handleStatusFilterOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Popover
                  open={Boolean(statusFilterAnchor)}
                  anchorEl={statusFilterAnchor}
                  onClose={handleFilterClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                >
                  <List sx={{ width: 200, pt: 0, pb: 0 }}>
                    {["Available", "Low Stock", "Out of Stock"].map(status => (
                      <ListItem key={status} dense>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={statusFilter.includes(status)}
                              onChange={() => handleStatusFilterChange(status)}
                              size="small"
                            />
                          }
                          label={status}
                        />
                      </ListItem>
                    ))}
                    {statusFilter.length > 0 && (
                      <>
                        <Divider />
                        <ListItem button onClick={() => { setStatusFilter([]); handleFilterClose(); }}>
                          <ListItemText primary="Clear Filters" sx={{ color: "text.secondary" }} />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Popover>
              </TableCell>
              <TableCell align="center">
                <b>Stock Count</b>
              </TableCell>
              <TableCell>
                <b></b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => (
                <TableRow 
                  key={product.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                  }}
                >
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
                  <TableCell>
                    <Chip 
                      label={getStockStatus(product.stock)}
                      color={getStockColor(product.stock)}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        borderWidth: "1.5px"
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={600}>{product.stock}</Typography>
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
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No products found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) =>
            setRowsPerPage(parseInt(event.target.value, 10))
          }
          sx={{
            backgroundColor: "#E4FDE1", 
            borderTop: "1px solid #e0e0e0", 
            ".MuiTablePagination-selectIcon": {
              color: "gray",
            },
            ".MuiTablePagination-displayedRows": {
              color: "gray",
            },
            ".MuiTablePagination-actions": {
              color: "gray",
              "& .Mui-disabled": {
                color: "#d3d3d3 !important",
              },
              "& button": {
                "&:hover": {
                  color: "#39FC1D",
                  backgroundColor: "rgba(57, 252, 29, 0.08)",
                },
              },
            },
            ".MuiTablePagination-select": {
              color: "gray",
            },
          }}
        />
      </TableContainer>
      
      {/* Drawer - same as before */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            width: 350,
            p: 0,
            bgcolor: "#fff",
          },
        }}
      >
        {currentSelectedProduct && (
          <Box>
            {/* Blue Header Bar */}
            <Box sx={{ 
              bgcolor: "#e3f2fd", 
              py: 1.5, 
              px: 2,
              borderBottom: "1px solid #90caf9"
            }}>
              <Typography variant="caption" sx={{ color: "#424242" }}>
                Last Edit by: <b>Mark</b> at 03/11/2025 3:12 PM
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" mb={4}>
                Update Stock
              </Typography>

              {/* Product Info */}
              <Box mb={4} display="flex" alignItems="center">
                <Avatar
                  src={currentSelectedProduct.image}
                  variant="square"
                  sx={{ width: 60, height: 60, mr: 2 }}
                />
                <Box>
                  <Typography fontWeight="bold" variant="body1">
                    {currentSelectedProduct.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {currentSelectedProduct.code}
                  </Typography>
                </Box>
              </Box>

              {/* Current Stock */}
              <Typography variant="body1" mb={3}>
                Current Stock: <b>{currentSelectedProduct.stock}</b>
              </Typography>

              {/* Stock Change Controls */}
              <Box mb={4}>
                <Typography variant="caption" color="text.secondary" mb={1} display="block">
                  Stock Change
                </Typography>
                <Box display="flex" alignItems="center">
                  <IconButton
                    onClick={() => setStockChange((v) => v - 1)}
                    disabled={stockChange <= -currentSelectedProduct.stock}
                    sx={{ 
                      border: "1px solid #e0e0e0", 
                      borderRadius: '50%',
                      p: 1,
                      color: "black"
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  <TextField
                    value={stockChange}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setStockChange(val);
                    }}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      inputProps: { 
                        min: -currentSelectedProduct.stock, 
                        style: { textAlign: 'center' } 
                      }
                    }}
                    sx={{ 
                      mx: 2,
                      width: 120,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                      }
                    }}
                  />
                  
                  <IconButton
                    onClick={() => setStockChange((v) => v + 1)}
                    sx={{ 
                      border: "1px solid #e0e0e0", 
                      borderRadius: '50%',
                      p: 1,
                      color: "black"
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={stockChange === 0}
                  onClick={() =>
                    handleChangeStock(stockChange > 0 ? "add" : "remove")
                  }
                  sx={{
                    bgcolor: "#39FC1D",
                    color: "black",
                    fontWeight: "bold",
                    '&:hover': {
                      bgcolor: "#32e019"
                    },
                    '&.Mui-disabled': {
                      bgcolor: "#c8c8c8",
                      color: "#666666"
                    }
                  }}
                >
                  CHANGE STOCK
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={handleDrawerClose}
                  sx={{
                    borderColor: "#e0e0e0",
                    color: "#424242",
                    fontWeight: "bold",
                    '&:hover': {
                      borderColor: "#bdbdbd",
                      bgcolor: "transparent"
                    }
                  }}
                >
                  CANCEL
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ color: "black" }}>
          Confirm Stock {confirmType === "add" ? "Addition" : "Reduction"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmType === "add" ? "add" : "remove"}{" "}
            {Math.abs(stockChange)} stock for{" "}
            <b>{currentSelectedProduct?.name}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="inherit"
            sx={{ color: "black" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            color={confirmType === "add" ? "success" : "error"}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Stocks;
