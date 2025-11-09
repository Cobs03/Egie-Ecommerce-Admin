import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Stack,
  Box,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { DiscountService } from '../../../services/DiscountService';

const ProductSelectionDialog = ({ open, onClose, selectedProducts, onSave }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [localSelectedProducts, setLocalSelectedProducts] = useState(selectedProducts || []);
  const [selectAll, setSelectAll] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      loadProducts();
      loadCategories();
      // Initialize with selected products when dialog opens
      setLocalSelectedProducts(selectedProducts || []);
    }
  }, [open, searchQuery, selectedProducts]);

  // Update local selection when selectedProducts prop changes
  useEffect(() => {
    if (open && selectedProducts) {
      setLocalSelectedProducts(selectedProducts);
    }
  }, [selectedProducts, open]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await DiscountService.searchProducts(searchQuery, 100);
      if (result.success) {
        setProducts(result.data);
      } else {
        setError('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await DiscountService.getProductCategories();
      if (result.success) {
        setCategories(['All', ...result.data]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return null;
  };

  // Filtered products based on search and filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (categoryFilter !== "All") {
      result = result.filter((product) => {
        if (!product.selected_components || !Array.isArray(product.selected_components)) {
          return false;
        }
        // Handle both object {id, name} and string formats
        return product.selected_components.some(comp => {
          const componentName = typeof comp === 'object' && comp !== null ? comp.name : comp;
          return componentName === categoryFilter;
        });
      });
    }

    // Price filter
    if (priceFilter === "Low") {
      result = result.filter((product) => product.price < 3000);
    } else if (priceFilter === "Medium") {
      result = result.filter((product) => product.price >= 3000 && product.price < 10000);
    } else if (priceFilter === "High") {
      result = result.filter((product) => product.price >= 10000);
    }

    // Stock filter
    if (stockFilter === "Low") {
      result = result.filter((product) => product.stock_quantity < 20);
    } else if (stockFilter === "Medium") {
      result = result.filter((product) => product.stock_quantity >= 20 && product.stock_quantity < 50);
    } else if (stockFilter === "High") {
      result = result.filter((product) => product.stock_quantity >= 50);
    } else if (stockFilter === "Out") {
      result = result.filter((product) => product.stock_quantity === 0);
    }

    return result;
  }, [products, categoryFilter, priceFilter, stockFilter]);

  // Handle individual product selection
  const handleToggleProduct = (product) => {
    const isSelected = localSelectedProducts.some((p) => p.id === product.id);
    if (isSelected) {
      setLocalSelectedProducts(localSelectedProducts.filter((p) => p.id !== product.id));
    } else {
      setLocalSelectedProducts([...localSelectedProducts, product]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setLocalSelectedProducts([]);
      setSelectAll(false);
    } else {
      setLocalSelectedProducts([...filteredProducts]);
      setSelectAll(true);
    }
  };

  // Handle save
  const handleSave = () => {
    onSave(localSelectedProducts);
    onClose();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All");
    setPriceFilter("All");
    setStockFilter("All");
  };

  // Check if product is selected
  const isProductSelected = (productId) => {
    return localSelectedProducts.some((p) => p.id === productId);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, height: "80vh" },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Select Products for Discount
          </Typography>
          <Chip
            label={`${localSelectedProducts.length} Selected`}
            color="primary"
            size="small"
          />
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Search Bar */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Filters */}
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Price Range</InputLabel>
              <Select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                label="Price Range"
              >
                <MenuItem value="All">All Prices</MenuItem>
                <MenuItem value="Low">Low (&lt; ₱3,000)</MenuItem>
                <MenuItem value="Medium">Medium (₱3,000 - ₱10,000)</MenuItem>
                <MenuItem value="High">High (&gt; ₱10,000)</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Stock Level</InputLabel>
              <Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                label="Stock Level"
              >
                <MenuItem value="All">All Stock</MenuItem>
                <MenuItem value="Low">Low (&lt; 20)</MenuItem>
                <MenuItem value="Medium">Medium (20 - 50)</MenuItem>
                <MenuItem value="High">High (&gt; 50)</MenuItem>
              </Select>
            </FormControl>

            <Button
              size="small"
              onClick={handleClearFilters}
              sx={{ textTransform: "none" }}
            >
              Clear Filters
            </Button>
          </Stack>

          {/* Select All Checkbox */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#f5f5f5",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  indeterminate={
                    localSelectedProducts.length > 0 &&
                    localSelectedProducts.length < filteredProducts.length
                  }
                />
              }
              label={
                <Typography fontWeight={600}>
                  {selectAll ? "Deselect All" : "Select All Filtered Products"}
                </Typography>
              }
            />
            <Typography variant="body2" color="text.secondary">
              {filteredProducts.length} products found
            </Typography>
          </Box>

          <Divider />

          {/* Product List */}
          <Box
            sx={{
              maxHeight: "calc(80vh - 400px)",
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#888",
                borderRadius: "4px",
                "&:hover": { background: "#555" },
              },
            }}
          >
            {/* Loading State */}
            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress />
              </Box>
            )}

            {/* Error State */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Products List */}
            {!loading && !error && (
              <List>
                {filteredProducts.map((product, index) => (
                  <React.Fragment key={product.id}>
                    <ListItem
                      onClick={() => handleToggleProduct(product)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        cursor: 'pointer',
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                        bgcolor: isProductSelected(product.id)
                          ? "rgba(39, 239, 60, 0.08)"
                          : "transparent",
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isProductSelected(product.id)}
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckBoxIcon />}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      {getProductImage(product) ? (
                        <Avatar
                          src={getProductImage(product)}
                          alt={product.name}
                          variant="rounded"
                          sx={{ width: 56, height: 56, mr: 2 }}
                        />
                      ) : (
                        <Avatar
                          variant="rounded"
                          sx={{ width: 56, height: 56, mr: 2, bgcolor: '#e0e0e0' }}
                        >
                          <Typography variant="caption">No Img</Typography>
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600} variant="body1">
                          {product.name}
                        </Typography>
                        <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                          {product.selected_components && product.selected_components.length > 0 && (() => {
                            const firstComp = product.selected_components[0];
                            const componentName = typeof firstComp === 'object' && firstComp !== null ? firstComp.name : firstComp;
                            return (
                              <Chip
                                label={String(componentName)}
                                size="small"
                                sx={{ fontSize: "0.7rem", height: 20 }}
                              />
                            );
                          })()}
                          <Chip
                            label={`₱${product.price.toLocaleString()}`}
                            size="small"
                            color="primary"
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                          <Chip
                            label={`Stock: ${product.stock_quantity}`}
                            size="small"
                            color={
                              product.stock_quantity < 20
                                ? "error"
                                : product.stock_quantity < 50
                                ? "warning"
                                : "success"
                            }
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                        </Stack>
                      </Box>
                    </ListItem>
                    {index < filteredProducts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {filteredProducts.length === 0 && (
                  <Box py={4} textAlign="center">
                    <Typography variant="body1" color="text.secondary">
                      No products found matching your filters
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Stack direction="row" spacing={2} width="100%">
          <Button
            variant="outlined"
            fullWidth
            onClick={onClose}
            sx={{
              borderColor: "#F44336",
              color: "#F44336",
              fontWeight: "bold",
              "&:hover": {
                borderColor: "#d32f2f",
                bgcolor: "rgba(244, 67, 54, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            disabled={localSelectedProducts.length === 0}
            sx={{
              background: "#27EF3C",
              color: "#000",
              fontWeight: "bold",
              "&:hover": { background: "#1ec32e" },
              "&:disabled": {
                background: "#ccc",
                color: "#666",
              },
            }}
          >
            Apply ({localSelectedProducts.length} Products)
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ProductSelectionDialog;