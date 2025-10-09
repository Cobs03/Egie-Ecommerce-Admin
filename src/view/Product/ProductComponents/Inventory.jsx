import React, { useState, useEffect } from "react";
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
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate } from "react-router-dom";

// Import ProductService to get real data
import { ProductService } from "../../../services/ProductService";

const Inventory = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProductId, setMenuProductId] = useState(null);
  
  // State for real database products
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockChange, setStockChange] = useState(0);
  const navigate = useNavigate();

  // Load real products from database
  const loadProducts = async () => {
    setLoading(true);
    try {
      console.log("Loading products from database...");
      const result = await ProductService.getAllProducts();
      
      if (result.success) {
        console.log(`Found ${result.data.length} products in database`);
        
        // Debug: Log first product to see structure
        if (result.data.length > 0) {
          console.log('First product from database:', result.data[0]);
          console.log('First product images:', result.data[0].images);
          console.log('Product names:', result.data.map(p => p.name));
          console.log('All products images status:', result.data.map(p => ({
            name: p.name,
            hasImages: p.images && p.images.length > 0,
            imageCount: p.images?.length || 0,
            images: p.images
          })));
        }
        
        // Transform products to match existing component structure
        const transformedProducts = result.data.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: product.stock_quantity,
          sku: product.sku,
          status: product.status,
          category: product.metadata?.category || 'General',
          // Handle images properly - database stores as array of URLs
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          // Use SKU as code if no specific code field exists
          code: product.sku || product.id,
          lastEdit: new Date(product.updated_at).toLocaleString(),
          variants: product.metadata?.variants || [],
          components: product.metadata?.components || []
        }));
        
        console.log('Transformed products:', transformedProducts);
        setAllProducts(transformedProducts);
        setProducts(transformedProducts);
      } else {
        console.error("Failed to load products:", result.error);
        setAllProducts([]);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Keep empty array on error
      setAllProducts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Filtering & Sorting state
  const [nameFilterAnchor, setNameFilterAnchor] = useState(null);
  const [categoryFilterAnchor, setCategoryFilterAnchor] = useState(null);
  const [statusFilterAnchor, setStatusFilterAnchor] = useState(null);
  const [priceFilterAnchor, setPriceFilterAnchor] = useState(null);
  
  const [nameSort, setNameSort] = useState(null); // "az", "za", "latest", "oldest", "popular"
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [priceSort, setPriceSort] = useState(null); // "expensive", "cheap"
  
  // Get all unique categories
  const allCategories = [...new Set(allProducts.map(p => p.category))];
  
  // Apply all filters and sorts
  useEffect(() => {
    let result = [...allProducts];
    
    // Apply category filter
    if (categoryFilter.length > 0) {
      result = result.filter(item => categoryFilter.includes(item.category));
    }
    
    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter(item => {
        const stock = typeof item.stock === 'number' ? item.stock : 0;
        if (statusFilter.includes("Available") && stock > 10) return true;
        if (statusFilter.includes("Low Stock") && stock > 0 && stock <= 10) return true;
        if (statusFilter.includes("Out of Stock") && stock === 0) return true;
        return false;
      });
    }
    
    // Apply sorting
    if (nameSort === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (nameSort === "za") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (nameSort === "latest") {
      result.sort((a, b) => new Date(b.lastEdit) - new Date(a.lastEdit));
    } else if (nameSort === "oldest") {
      result.sort((a, b) => new Date(a.lastEdit) - new Date(b.lastEdit));
    } else if (nameSort === "popular") {
      // Assuming popularity based on sales or views
      result.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    }
    
    // Apply price sort
    if (priceSort === "expensive") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (priceSort === "cheap") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    
    setProducts(result);
    setPage(0); // Reset to first page when filters change
  }, [categoryFilter, statusFilter, nameSort, priceSort, allProducts]);

  // Menu handlers for product actions
  const handleMenuOpen = (event, productId) => {
    setAnchorEl(event.currentTarget);
    setMenuProductId(productId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuProductId(null);
  };
  
  // Filter anchor handlers
  const handleNameFilterOpen = (event) => {
    setNameFilterAnchor(event.currentTarget);
  };
  
  const handleCategoryFilterOpen = (event) => {
    setCategoryFilterAnchor(event.currentTarget);
  };
  
  const handleStatusFilterOpen = (event) => {
    setStatusFilterAnchor(event.currentTarget);
  };
  
  const handlePriceFilterOpen = (event) => {
    setPriceFilterAnchor(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setNameFilterAnchor(null);
    setCategoryFilterAnchor(null);
    setStatusFilterAnchor(null);
    setPriceFilterAnchor(null);
  };
  
  // Handle filter changes
  const handleCategoryFilterChange = (category) => {
    setCategoryFilter(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
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
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Product action handlers
  const handleViewProduct = () => {
    const product = products.find((p) => p.id === menuProductId);
    
    // Transform database product to match ProductView expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      status: product.status,
      category: product.category,
      lastEdit: product.lastEdit,
      
      // Transform images to expected format with url property
      // Database stores images as array of URLs, ProductView expects array of {url: string}
      images: product.image ? [{ url: product.image }] : [],
      
      // Extract from metadata or use defaults
      components: product.components || [],
      variants: product.variants || [],
      specifications: product.metadata?.specifications || {},
      warranty: product.metadata?.warranty || "",
      officialPrice: product.metadata?.officialPrice || product.price,
      initialPrice: product.metadata?.initialPrice || product.price,
      discount: product.metadata?.discount || 0,
      
      isEditMode: false,
    };
    
    navigate("/products/view", {
      state: transformedProduct,
    });
    handleMenuClose();
  };

  const handleEditProduct = () => {
    const product = products.find((p) => p.id === menuProductId);
    navigate("/products/create", { state: product });
    handleMenuClose();
  };

  const handleUpdateStock = () => {
    setSelectedProduct(products.find((p) => p.id === menuProductId));
    setDrawerOpen(true);
    handleMenuClose();
  };

  // Function to determine stock status
  const getStockStatus = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "Available";
  };

  // Function to get status color
  const getStockColor = (stock) => {
    if (stock === 0) return "error";
    if (stock <= 10) return "warning";
    return "success";
  };

  // Get current page data
  const displayedProducts = products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%" }}>
        <TableContainer>
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
                      <Divider />
                      <ListItem button onClick={() => { setNameSort("latest"); handleFilterClose(); }}
                        selected={nameSort === "latest"}>
                        <ListItemText primary="Latest" />
                      </ListItem>
                      <ListItem button onClick={() => { setNameSort("oldest"); handleFilterClose(); }}
                        selected={nameSort === "oldest"}>
                        <ListItemText primary="Oldest" />
                      </ListItem>
                      <Divider />
                      <ListItem button onClick={() => { setNameSort("popular"); handleFilterClose(); }}
                        selected={nameSort === "popular"}>
                        <ListItemText primary="Popular" />
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
                    <Typography fontWeight="bold">Category</Typography>
                    <IconButton size="small" onClick={handleCategoryFilterOpen}>
                      <FilterListIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Popover
                    open={Boolean(categoryFilterAnchor)}
                    anchorEl={categoryFilterAnchor}
                    onClose={handleFilterClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                  >
                    <List sx={{ width: 200, pt: 0, pb: 0, maxHeight: 300, overflow: 'auto' }}>
                      {allCategories.map(category => (
                        <ListItem key={category} dense>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={categoryFilter.includes(category)}
                                onChange={() => handleCategoryFilterChange(category)}
                                size="small"
                              />
                            }
                            label={category}
                          />
                        </ListItem>
                      ))}
                      {categoryFilter.length > 0 && (
                        <>
                          <Divider />
                          <ListItem button onClick={() => { setCategoryFilter([]); handleFilterClose(); }}>
                            <ListItemText primary="Clear Filters" sx={{ color: "text.secondary" }} />
                          </ListItem>
                        </>
                      )}
                    </List>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Typography fontWeight="bold">Status</Typography>
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
                <TableCell>
                  <b>Stock</b>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Typography fontWeight="bold">Price</Typography>
                    <IconButton size="small" onClick={handlePriceFilterOpen}>
                      <FilterListIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Popover
                    open={Boolean(priceFilterAnchor)}
                    anchorEl={priceFilterAnchor}
                    onClose={handleFilterClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                  >
                    <List sx={{ width: 200, pt: 0, pb: 0 }}>
                      <ListItem button onClick={() => { setPriceSort("expensive"); handleFilterClose(); }}
                        selected={priceSort === "expensive"}>
                        <ListItemText primary="Expensive" />
                        {priceSort === "expensive" && <ArrowDownwardIcon fontSize="small" />}
                      </ListItem>
                      <ListItem button onClick={() => { setPriceSort("cheap"); handleFilterClose(); }}
                        selected={priceSort === "cheap"}>
                        <ListItemText primary="Cheap" />
                        {priceSort === "cheap" && <ArrowUpwardIcon fontSize="small" />}
                      </ListItem>
                      {priceSort && (
                        <>
                          <Divider />
                          <ListItem button onClick={() => { setPriceSort(null); handleFilterClose(); }}>
                            <ListItemText primary="Clear Sort" sx={{ color: "text.secondary" }} />
                          </ListItem>
                        </>
                      )}
                    </List>
                  </Popover>
                </TableCell>
                <TableCell>
                  <b>Last Edit</b>
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedProducts.map((product) => (
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
                        src={product.image || undefined}
                        variant="square"
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          mr: 1,
                          bgcolor: product.image ? 'transparent' : 'grey.300'
                        }}
                      >
                        {!product.image && product.name ? product.name.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                      <Typography variant="body2">{product.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>{product.category}</TableCell>
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
                  <TableCell>
                    <Typography fontWeight={600}>{product.stock || 0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      ₱
                      {(product.price || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {product.lastEdit}
                    </Typography>
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
                      <MenuItem onClick={handleViewProduct}>
                        View Product
                      </MenuItem>
                      <MenuItem onClick={handleEditProduct}>
                        Edit Product
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
              {displayedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No products found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Component */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
      </Paper>
    </Box>
  );
};

export default Inventory;
