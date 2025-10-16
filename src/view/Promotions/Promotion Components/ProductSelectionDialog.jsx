import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

// Sample product data
const sampleProducts = [
  {
    id: 1,
    name: "PlayStation 5 Controller",
    category: "Controllers",
    price: 3499,
    stock: 45,
    image: "🎮",
  },
  {
    id: 2,
    name: "Xbox Series X Controller",
    category: "Controllers",
    price: 2999,
    stock: 32,
    image: "🎮",
  },
  {
    id: 3,
    name: "Gaming Headset Pro",
    category: "Headsets",
    price: 4599,
    stock: 28,
    image: "🎧",
  },
  {
    id: 4,
    name: "Mechanical Gaming Keyboard",
    category: "Keyboards & Mice",
    price: 5499,
    stock: 15,
    image: "⌨️",
  },
  {
    id: 5,
    name: "RGB Gaming Mouse",
    category: "Keyboards & Mice",
    price: 1899,
    stock: 67,
    image: "🖱️",
  },
  {
    id: 6,
    name: "PS5 Console Bundle",
    category: "Console Bundles",
    price: 27999,
    stock: 8,
    image: "📦",
  },
  {
    id: 7,
    name: "Gaming Chair Elite",
    category: "Gaming Chairs",
    price: 12999,
    stock: 12,
    image: "🪑",
  },
  {
    id: 8,
    name: "27-inch Gaming Monitor",
    category: "Monitors",
    price: 15999,
    stock: 22,
    image: "🖥️",
  },
  {
    id: 9,
    name: "Wireless Gaming Headset",
    category: "Headsets",
    price: 6299,
    stock: 18,
    image: "🎧",
  },
  {
    id: 10,
    name: "Nintendo Switch Pro Controller",
    category: "Controllers",
    price: 2799,
    stock: 41,
    image: "🎮",
  },
];

const ProductSelectionDialog = ({ open, onClose, selectedProducts, onSave }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [localSelectedProducts, setLocalSelectedProducts] = useState(selectedProducts || []);
  const [selectAll, setSelectAll] = useState(false);

  // Get unique categories
  const categories = ["All", ...new Set(sampleProducts.map((p) => p.category))];

  // Filtered products based on search and filters
  const filteredProducts = useMemo(() => {
    let result = [...sampleProducts];

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "All") {
      result = result.filter((product) => product.category === categoryFilter);
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
      result = result.filter((product) => product.stock < 20);
    } else if (stockFilter === "Medium") {
      result = result.filter((product) => product.stock >= 20 && product.stock < 50);
    } else if (stockFilter === "High") {
      result = result.filter((product) => product.stock >= 50);
    }

    return result;
  }, [searchQuery, categoryFilter, priceFilter, stockFilter]);

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
            <List>
              {filteredProducts.map((product, index) => (
                <React.Fragment key={product.id}>
                  <ListItem
                    button
                    onClick={() => handleToggleProduct(product)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
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
                      />
                    </ListItemIcon>
                    <Avatar
                      sx={{
                        mr: 2,
                        bgcolor: "#f0f0f0",
                        fontSize: "1.5rem",
                      }}
                    >
                      {product.image}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight={600}>{product.name}</Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} mt={0.5}>
                          <Chip
                            label={product.category}
                            size="small"
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                          <Chip
                            label={`₱${product.price.toLocaleString()}`}
                            size="small"
                            color="primary"
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                          <Chip
                            label={`Stock: ${product.stock}`}
                            size="small"
                            color={
                              product.stock < 20
                                ? "error"
                                : product.stock < 50
                                ? "warning"
                                : "success"
                            }
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                        </Stack>
                      }
                    />
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