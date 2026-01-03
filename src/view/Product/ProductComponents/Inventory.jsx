import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import BlockIcon from "@mui/icons-material/Block";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from 'xlsx';

// Import ProductService to get real data
import { ProductService } from "../../../services/ProductService";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLogService from "../../../services/AdminLogService";

// Import permission system
import { usePermissions } from "../../../hooks/usePermissions";
import { PERMISSIONS } from "../../../utils/permissions";

const Inventory = forwardRef((props, ref) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = usePermissions(); // Add permission hook
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProductId, setMenuProductId] = useState(null);
  
  // State for real database products
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Success notification state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Error notification state
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Track if we should show update success message
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  // Load real products from database
  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await ProductService.getAllProducts();
      
      if (result.success) {
        // Transform products to match existing component structure
        const transformedProducts = result.data.map((product) => {
          // Debug: Check if enrichment worked
          if (product.selected_components && product.selected_components.length > 0) {
          }
          
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: product.stock_quantity,
            sku: product.sku,
            status: product.status,
            warranty: product.warranty, // Direct from database
            brand_id: product.brand_id,
            brands: product.brands, // Brand info from join
            // Set category to component types, comma-separated if multiple
            category: product.selected_components && product.selected_components.length > 0
              ? product.selected_components.map(comp => comp.category || comp.name || comp.type).filter(Boolean).join(', ')
              : 'General',
            
            // Handle images properly - database stores as array of URLs
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            images: product.images || [], // Full images array for ProductView
            
            // Use SKU as code if no specific code field exists
            code: product.sku || product.id,
            lastEdit: new Date(product.updated_at).toLocaleString(),
            
            // Direct from database fields (not nested in metadata)
            // These should be enriched by ProductService already!
            variants: product.variants || [],
            selectedComponents: product.selected_components || [],
            specifications: product.specifications || {},
            compatibility_tags: product.compatibility_tags || [], // Tags for recommendations
            
            // Metadata fields
            officialPrice: product.metadata?.officialPrice || product.price,
            initialPrice: product.metadata?.initialPrice || product.price,
            discount: product.metadata?.discount || 0
          };
        });
        setAllProducts(transformedProducts);
        setProducts(transformedProducts);
        
        // Extract and set component categories from products
        const categories = extractComponentCategories(transformedProducts);
        setAllComponentCategories(categories);
      } else {
        console.error("Failed to load products:", result.error);
        setAllProducts([]);
        setProducts([]);
        setAllComponentCategories([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Keep empty array on error
      setAllProducts([]);
      setProducts([]);
      setAllComponentCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Reload products when returning to this page (e.g., after editing)
  useEffect(() => {
    if (location.state?.reloadProducts) {
      loadProducts();
      
      // Show success message if provided
      if (location.state?.successMessage) {
        setSuccessMessage(location.state.successMessage);
        setShowUpdateSuccess(true);
      }
      
      // Clear the state to prevent reloading on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Filtering & Sorting state
  const [nameFilterAnchor, setNameFilterAnchor] = useState(null);
  const [categoryFilterAnchor, setCategoryFilterAnchor] = useState(null);
  const [statusFilterAnchor, setStatusFilterAnchor] = useState(null);
  const [priceFilterAnchor, setPriceFilterAnchor] = useState(null);
  
  const [nameSort, setNameSort] = useState(null); // "az", "za", "latest", "oldest", "popular"
  const [categoryFilter, setCategoryFilter] = useState([]); // Filter by component categories (CPU, GPU, RAM, etc.)
  const [statusFilter, setStatusFilter] = useState([]);
  const [priceSort, setPriceSort] = useState(null); // "expensive", "cheap"
  
  // State for component categories extracted from products
  const [allComponentCategories, setAllComponentCategories] = useState([]);
  
  // Extract unique component categories from loaded products
  const extractComponentCategories = (products) => {
    const categoriesSet = new Set();
    products.forEach(product => {
      if (product.selectedComponents && Array.isArray(product.selectedComponents)) {
        product.selectedComponents.forEach(comp => {
          // Try to get category from different possible fields
          const componentCategory = comp.category || comp.name || comp.type;
          
          if (componentCategory) {
            categoriesSet.add(componentCategory);
          } else {
          }
        });
      }
    });
    
    const categories = Array.from(categoriesSet).sort();
    return categories;
  };
  
  // Apply all filters and sorts
  useEffect(() => {
    let result = [...allProducts];
    
    // Apply component category filter - filter products by the components they contain
    if (categoryFilter.length > 0) {
      result = result.filter(item => {
        // Check if product has any components
        if (!item.selectedComponents || item.selectedComponents.length === 0) {
          return false;
        }
        
        // Product must have at least one component from the selected categories
        return item.selectedComponents.some(comp => {
          const componentCategory = comp.category || comp.name || comp.type;
          return categoryFilter.includes(componentCategory);
        });
      });
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
      warranty: product.warranty, // Direct field
      brand_id: product.brand_id,
      brands: product.brands,
      
      // Transform images to expected format with url property
      // Database stores images as array of URLs, ProductView expects array of {url: string}
      images: product.images ? product.images.map(url => ({ url })) : [],
      
      // Use the correct field mappings from database
      components: product.selectedComponents || [], // Use selectedComponents
      variants: product.variants || [],
      specifications: product.specifications || {},
      
      // Metadata fields
      officialPrice: product.officialPrice || product.price,
      initialPrice: product.initialPrice || product.price,
      discount: product.discount || 0,
      
      isEditMode: false,
    };
    
    navigate("/products/view", {
      state: transformedProduct,
    });
    handleMenuClose();
  };

  const handleEditProduct = () => {
    const product = products.find((p) => p.id === menuProductId);
    
    if (product.selectedComponents && product.selectedComponents.length > 0) {
    }
    // Transform product for ProductCreate component
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      warranty: product.warranty,
      brand_id: product.brand_id,
      price: product.price,
      stock: product.stock, // Use 'stock' to match ProductCreate state initialization
      sku: product.sku,
      status: product.status,
      
      // Transform images back to the format ProductCreate expects
      images: product.images ? product.images.map(url => ({ url })) : [],
      
      // Direct database fields - use correct field names
      variants: product.variants || [],
      selected_components: product.selectedComponents || [], // Map to database field name
      selectedComponents: product.selectedComponents || [], // Also keep this for backwards compatibility
      specifications: product.specifications || {},
      compatibility_tags: product.compatibility_tags || [], // Tags for product recommendations
      
      // Metadata
      officialPrice: product.officialPrice,
      initialPrice: product.initialPrice,
      discount: product.discount,
      
      // Add edit mode flag
      isEditMode: true
    };
    
    navigate("/products/create", { state: transformedProduct });
    handleMenuClose();
  };

  const handleDeleteProduct = () => {
    // Check if user has permission to delete products
    if (!permissions.canDeleteProduct) {
      setErrorMessage('Access Denied: You do not have permission to delete products. Contact a Manager or Admin if you need to delete this item.');
      setShowError(true);
      handleMenuClose();
      return;
    }
    
    const product = products.find((p) => p.id === menuProductId);
    setProductToDelete(product);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await ProductService.deleteProduct(productToDelete.id);
      
      if (result.success) {
        // Create activity log
        if (user?.id) {
          await AdminLogService.createLog({
            userId: user.id,
            actionType: 'product_delete',
            actionDescription: `Deleted product: ${productToDelete.name}`,
            targetType: 'product',
            targetId: productToDelete.id,
            metadata: {
              productName: productToDelete.name,
              sku: productToDelete.sku,
              price: productToDelete.price,
            },
          });
        }
        
        // Refresh the products list
        await loadProducts();
        
        // Show success notification
        setSuccessMessage(`Product "${productToDelete.name}" deleted successfully!`);
        setShowSuccess(true);
      } else {
        console.error("❌ Failed to delete product:", result.error);
        alert(`Failed to delete product: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      alert(`Error deleting product: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };
  
  // Excel download function
  const downloadExcel = async () => {
    try {
      // Prepare data for Excel - use all products, not just current page
      const excelData = products.map((product, index) => ({
        'No.': index + 1,
        'Product Name': product.name || '',
        'Code': product.code || product.sku || '',
        'Category': product.category || '',
        'Status': getStockStatus(product.stock),
        'Stock': product.stock || 0,
        'Price': `₱${parseFloat(product.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        'Last Edit': product.lastEdit || ''
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // No.
        { wch: 40 }, // Product Name
        { wch: 35 }, // Code
        { wch: 15 }, // Category
        { wch: 15 }, // Status
        { wch: 10 }, // Stock
        { wch: 15 }, // Price
        { wch: 25 }  // Last Edit
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `Inventory_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      
      // Log the action
      if (user?.id) {
        await AdminLogService.createLog({
          userId: user.id,
          actionType: 'DOWNLOAD',
          actionDescription: `Downloaded ${excelData.length} inventory records`,
          targetType: 'INVENTORY',
          targetId: null,
          metadata: { count: excelData.length, filename }
        });
      }
      
      // Show success notification
      setSuccessMessage(`Downloaded ${excelData.length} inventory records successfully!`);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      setErrorMessage('Failed to download inventory. Please try again.');
      setShowError(true);
    }
  };
  
  // Expose downloadExcel to parent via ref
  useImperativeHandle(ref, () => ({
    downloadExcel
  }));

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
                    <Box sx={{ width: 250, pt: 0, pb: 0 }}>
                      <Box sx={{ p: 2, pb: 1 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          FILTER BY COMPONENT TYPE
                        </Typography>
                      </Box>
                      <List sx={{ maxHeight: 400, overflow: 'auto', pt: 0 }}>
                        {allComponentCategories.length > 0 ? (
                          allComponentCategories.map(category => (
                            <ListItem key={category} dense>
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    checked={categoryFilter.includes(category)}
                                    onChange={() => handleCategoryFilterChange(category)}
                                    size="small"
                                    sx={{
                                      color: "#00E676",
                                      "&.Mui-checked": {
                                        color: "#00E676",
                                      },
                                    }}
                                  />
                                }
                                label={category}
                              />
                            </ListItem>
                          ))
                        ) : (
                          <ListItem dense>
                            <Typography variant="caption" color="text.secondary">
                              No component categories found
                            </Typography>
                          </ListItem>
                        )}
                      </List>
                      {categoryFilter.length > 0 && (
                        <>
                          <Divider />
                          <Box sx={{ p: 1 }}>
                            <Button 
                              fullWidth
                              size="small"
                              onClick={() => { setCategoryFilter([]); handleFilterClose(); }}
                              sx={{ 
                                color: '#00E676',
                                textTransform: 'none',
                                fontWeight: 600
                              }}
                            >
                              Clear Filters
                            </Button>
                          </Box>
                        </>
                      )}
                    </Box>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ border: 'none', py: 0 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      minHeight: '300px',
                      justifyContent: 'center',
                      gap: 1.5
                    }}>
                      <Box
                        sx={{
                          width: '60px',
                          height: '60px',
                          border: '6px solid rgba(0, 230, 118, 0.1)',
                          borderTop: '6px solid #00E676',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                          }
                        }}
                      />
                      <Typography variant="body2" color="#00E676" sx={{ mt: 1, fontWeight: 500 }}>
                        Loading products...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                displayedProducts.map((product) => (
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
                      <MenuItem 
                        onClick={handleViewProduct}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#4caf50',
                            color: 'white'
                          }
                        }}
                      >
                        View Product
                      </MenuItem>
                      <MenuItem 
                        onClick={handleEditProduct}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#4caf50',
                            color: 'white'
                          }
                        }}
                      >
                        Edit Product
                      </MenuItem>
                      <Tooltip 
                        title={!permissions.canDeleteProduct ? "You don't have permission to delete products" : ""}
                        arrow
                      >
                        <span>
                          <MenuItem 
                            onClick={handleDeleteProduct}
                            disabled={!permissions.canDeleteProduct}
                            sx={{ 
                              color: permissions.canDeleteProduct ? 'error.main' : 'text.disabled',
                              '&:hover': {
                                backgroundColor: permissions.canDeleteProduct ? 'error.light' : 'transparent',
                                color: permissions.canDeleteProduct ? 'white' : 'text.disabled'
                              },
                              '&.Mui-disabled': {
                                opacity: 0.5
                              }
                            }}
                          >
                            {!permissions.canDeleteProduct && <BlockIcon fontSize="small" sx={{ mr: 1 }} />}
                            Delete Product
                          </MenuItem>
                        </span>
                      </Tooltip>
                    </Menu>
                  </TableCell>
                </TableRow>
              )))}
              {!loading && displayedProducts.length === 0 && (
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
            "& .MuiTablePagination-toolbar": {
              justifyContent: "flex-start",
              paddingLeft: 2,
            },
            "& .MuiTablePagination-spacer": {
              display: "none",
            },
            "& .MuiTablePagination-displayedRows": {
              marginLeft: 0,
              color: "gray",
            },
            "& .MuiTablePagination-actions": {
              marginLeft: 2,
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
            "& .MuiTablePagination-selectIcon": {
              color: "gray",
            },
            "& .MuiTablePagination-select": {
              color: "gray",
            },
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: 'error.main' }}>
          Delete Product
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{productToDelete?.name}"?
            <br />
            <strong>This action cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions 
          sx={{ 
            justifyContent: 'center', 
            gap: 2, 
            padding: '16px 24px' 
          }}
        >
          <Button 
            onClick={handleDeleteCancel} 
            color="primary"
            variant="outlined"
            sx={{ minWidth: '120px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            sx={{
              minWidth: '120px',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
              fontWeight: 'bold'
            }}
          >
            {isDeleting ? "Deleting..." : "Delete Product"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification for Delete */}
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
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Success Notification for Update */}
      <Snackbar
        open={showUpdateSuccess}
        autoHideDuration={3000}
        onClose={() => setShowUpdateSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowUpdateSuccess(false)} 
          severity="success" 
          sx={{ 
            width: '100%',
            backgroundColor: '#2196f3',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Notification */}
      <Snackbar
        open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity="error" 
          sx={{ 
            width: '100%',
            backgroundColor: '#f44336',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default Inventory;
