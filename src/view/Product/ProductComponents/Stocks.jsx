import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  Divider,
  Button,
  Drawer,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { ProductService } from "../../../services/ProductService";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLogService from "../../../services/AdminLogService";

const Stocks = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [nameSort, setNameSort] = useState(null);
  const [statusFilter, setStatusFilter] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Success notification state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load real products from database
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await ProductService.getAllProducts();
        if (result.success) {
          const transformedProducts = result.data.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: product.stock_quantity,
            sku: product.sku,
            code: product.sku || product.id,
            status: product.status,
            warranty: product.warranty,
            brand_id: product.brand_id,
            brands: product.brands,
            category: product.metadata?.category || 'General',
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            images: product.images || [],
            lastEdit: new Date(product.updated_at).toLocaleString(),
            variants: product.variants || [],
            selectedComponents: product.selected_components || [],
            specifications: product.specifications || {},
            officialPrice: product.metadata?.officialPrice || product.price,
            initialPrice: product.metadata?.initialPrice || product.price,
            discount: product.metadata?.discount || 0
          }));
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const allProducts = useMemo(() => {
    return products;
  }, [products]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...allProducts];

    if (statusFilter.length > 0) {
      result = result.filter(product => {
        const status = getStockStatus(product.stock);
        return statusFilter.includes(status);
      });
    }

    if (nameSort === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (nameSort === "za") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (nameSort === "recent") {
      result.sort((a, b) => new Date(b.lastEdit || "2025-03-11") - new Date(a.lastEdit || "2025-03-11"));
    }

    setFilteredProducts(result);
    setPage(0);
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

  const handleVariantStockChange = (variantIndex, newStock) => {
    setSelectedProduct(prev => ({
      ...prev,
      variants: prev.variants.map((variant, index) => 
        index === variantIndex 
          ? { ...variant, stock: Math.max(0, newStock) }
          : variant
      )
    }));
  };

  const handleConfirm = async () => {
    if (selectedProduct) {
      try {
        const oldStock = selectedProduct.stock;
        let newStock;
        let updatedProduct = { ...selectedProduct };

        if (selectedProduct.variants && selectedProduct.variants.length > 0) {
          newStock = selectedProduct.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
          updatedProduct.variants = selectedProduct.variants;
        } else {
          newStock = Math.max(0, selectedProduct.stock + stockChange);
        }

        await ProductService.updateProduct(selectedProduct.id, {
          stock_quantity: newStock,
          variants: updatedProduct.variants
        });

        // Create activity log for stock update
        if (user?.id) {
          await AdminLogService.createLog({
            userId: user.id,
            actionType: 'stock_update',
            actionDescription: `Updated stock for ${selectedProduct.name}: ${oldStock} → ${newStock}`,
            targetType: 'product',
            targetId: selectedProduct.id,
            metadata: {
              productName: selectedProduct.name,
              oldStock: oldStock,
              newStock: newStock,
              change: stockChange,
            },
          });
        }

        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === selectedProduct.id) {
              return {
                ...p,
                stock: newStock,
                variants: updatedProduct.variants,
                stocks: newStock === 0 ? "Out of Stock" : newStock <= 10 ? "Low Stock" : "Available",
              };
            }
            return p;
          })
        );

        if (selectedProduct.variants && selectedProduct.variants.length > 0) {
          setSuccessMessage(`Variant stocks updated successfully! Total stock: ${newStock}`);
        } else {
          setSuccessMessage(`Stock updated successfully! New stock: ${newStock}`);
        }
        setShowSuccess(true);

      } catch (error) {
        console.error('Error updating stock:', error);
      }
    }
    setConfirmOpen(false);
    handleDrawerClose();
  };

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

  const handleStatusFilterChange = (status) => {
    setStatusFilter(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const getStockColor = (stock) => {
    if (stock === 0) return "error";
    if (stock <= 10) return "warning";
    return "success";
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "Available";
  };

  // FIXED: Only ONE declaration
  const currentSelectedProduct = selectedProduct;

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
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
              <TableCell><b>Code</b></TableCell>
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
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
              <TableCell align="center"><b>Stock Count</b></TableCell>
              <TableCell><b></b></TableCell>
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
                      sx={{ fontWeight: 600, borderWidth: "1.5px" }}
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
            "& .MuiTablePagination-toolbar": {
              justifyContent: "flex-start",
              paddingLeft: 2,
            },
            "& .MuiTablePagination-spacer": { display: "none" },
            "& .MuiTablePagination-displayedRows": {
              marginLeft: 0,
              color: "gray",
            },
            "& .MuiTablePagination-actions": {
              marginLeft: 2,
              color: "gray",
              "& .Mui-disabled": { color: "#d3d3d3 !important" },
              "& button:hover": {
                color: "#39FC1D",
                backgroundColor: "rgba(57, 252, 29, 0.08)",
              },
            },
            "& .MuiTablePagination-selectIcon": { color: "gray" },
            "& .MuiTablePagination-select": { color: "gray" },
          }}
        />
      </TableContainer>
      
      {/* Drawer for updating stock */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: { width: 350, p: 3, bgcolor: "#fff" },
        }}
      >
        {currentSelectedProduct && (
          <Box>
            <Box sx={{ bgcolor: "#e3f2fd", py: 1.5, px: 2, borderBottom: "1px solid #90caf9" }}>
              <Typography variant="caption" sx={{ color: "#424242" }}>
                Last Edit by: <b>Mark</b> at 03/11/2025 3:12 PM
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" mb={4}>
                Update Stock
              </Typography>

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

              <Typography variant="body1" mb={3}>
                Total Current Stock: <b>{currentSelectedProduct.stock}</b>
              </Typography>

              {currentSelectedProduct.variants && currentSelectedProduct.variants.length > 0 ? (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Variants</Typography>
                  
                  {currentSelectedProduct.variants.map((variant, index) => (
                    <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#000', fontSize: '1rem' }}>
                        {variant.name || `Variant ${index + 1}`}
                      </Typography>
                      
                      {variant.price && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Price: ₱{variant.price.toLocaleString()}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                          label="Stock"
                          type="number"
                          size="small"
                          value={variant.stock || 0}
                          onChange={(e) => handleVariantStockChange(index, parseInt(e.target.value) || 0)}
                          sx={{ width: 120 }}
                          inputProps={{ min: 0 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Current: {variant.stock || 0}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                  
                  <Typography variant="body1" sx={{ mt: 2, mb: 3, fontWeight: 'bold' }}>
                    New Total Stock: {currentSelectedProduct.variants.reduce((sum, v) => sum + (v.stock || 0), 0)}
                  </Typography>
                </Box>
              ) : (
                <Box mb={4}>
                  <Typography variant="caption" color="text.secondary" mb={1} display="block">
                    Stock Change
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <IconButton
                      onClick={() => setStockChange((v) => v - 1)}
                      disabled={stockChange <= -currentSelectedProduct.stock}
                      sx={{ border: "1px solid #e0e0e0", borderRadius: '50%', p: 1, color: "black" }}
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
                        inputProps: { min: -currentSelectedProduct.stock, style: { textAlign: 'center' } }
                      }}
                      sx={{ mx: 2, width: 120, '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
                    />
                    
                    <IconButton
                      onClick={() => setStockChange((v) => v + 1)}
                      sx={{ border: "1px solid #e0e0e0", borderRadius: '50%', p: 1, color: "black" }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={
                    currentSelectedProduct.variants && currentSelectedProduct.variants.length > 0
                      ? false
                      : stockChange === 0
                  }
                  onClick={() => {
                    if (currentSelectedProduct.variants && currentSelectedProduct.variants.length > 0) {
                      handleConfirm();
                    } else {
                      handleChangeStock(stockChange > 0 ? "add" : "remove");
                    }
                  }}
                  sx={{
                    bgcolor: "#39FC1D",
                    color: "black",
                    fontWeight: "bold",
                    '&:hover': { bgcolor: "#32e019" },
                    '&.Mui-disabled': { bgcolor: "#c8c8c8", color: "#666666" }
                  }}
                >
                  {currentSelectedProduct.variants && currentSelectedProduct.variants.length > 0 
                    ? "UPDATE STOCK" 
                    : "CHANGE STOCK"
                  }
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={handleDrawerClose}
                  sx={{
                    borderColor: "#e0e0e0",
                    color: "#424242",
                    fontWeight: "bold",
                    '&:hover': { borderColor: "#bdbdbd", bgcolor: "transparent" }
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
        <DialogTitle>Confirm Stock Update</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update the stock for {selectedProduct?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ 
            width: '100%',
            backgroundColor: '#4caf50',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' },
            '& .MuiAlert-action': { color: 'white' }
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Stocks;
