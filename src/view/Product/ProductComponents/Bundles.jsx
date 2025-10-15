import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Chip,
  TablePagination,
  Popover,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate } from "react-router-dom";
import { BundleService } from "../../../services/BundleService";

const Bundles = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const navigate = useNavigate();
  
  // Add pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Add filtering & sorting state
  const [nameFilterAnchor, setNameFilterAnchor] = useState(null);
  const [statusFilterAnchor, setStatusFilterAnchor] = useState(null);
  const [priceFilterAnchor, setPriceFilterAnchor] = useState(null); // Added this
  const [nameSort, setNameSort] = useState(null); // "az", "za", "latest", "oldest", "popular"
  const [priceSort, setPriceSort] = useState(null); // "expensive", "cheap" - Added this
  const [statusFilter, setStatusFilter] = useState([]);
  
  // Bundle data state
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Filtered bundles
  const [filteredBundles, setFilteredBundles] = useState([]);

  // Load bundles from database
  useEffect(() => {
    const loadBundles = async () => {
      setLoading(true);
      try {
        const result = await BundleService.getAllBundles();
        
        if (result.success) {
          const transformedBundles = result.data.map((bundle) => ({
            id: bundle.id,
            name: bundle.bundle_name,
            code: bundle.id.substring(0, 8).toUpperCase(),
            description: bundle.description,
            officialPrice: bundle.official_price,
            initialPrice: bundle.initial_price,
            discount: bundle.discount,
            images: bundle.images || [],
            image: bundle.images && bundle.images.length > 0 ? bundle.images[0] : null,
            products: bundle.bundle_products || [],
            numProducts: bundle.bundle_products ? bundle.bundle_products.length : 0,
            status: bundle.status === 'active' ? "Available" : "Inactive",
            stock: bundle.stock || 0,
            lastEdit: new Date(bundle.updated_at).toLocaleString(),
            warranty: bundle.warranty,
          }));
          
          setBundles(transformedBundles);
        } else {
          setError(result.error?.message || "Failed to load bundles");
        }
      } catch (error) {
        console.error('Error loading bundles:', error);
        setError("Error loading bundles: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadBundles();
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...bundles];
    
    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter(bundle => statusFilter.includes(bundle.status));
    }
    
    // Apply name sorting
    if (nameSort === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (nameSort === "za") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (nameSort === "latest" || nameSort === "oldest") {
      // Using lastEdit for sorting
      const sortOrder = nameSort === "latest" ? -1 : 1;
      result.sort((a, b) => sortOrder * (new Date(a.lastEdit).getTime() - new Date(b.lastEdit).getTime()));
    } else if (nameSort === "popular") {
      // Sort by number of products as a proxy for popularity
      result.sort((a, b) => b.numProducts - a.numProducts);
    }
    
    // Apply price sorting - Added this
    if (priceSort === "expensive") {
      result.sort((a, b) => Number(b.officialPrice) - Number(a.officialPrice));
    } else if (priceSort === "cheap") {
      result.sort((a, b) => Number(a.officialPrice) - Number(b.officialPrice));
    }
    
    setFilteredBundles(result);
    setPage(0); // Reset to first page when filters change
  }, [bundles, statusFilter, nameSort, priceSort]); // Added priceSort dependency

  const handleMenuOpen = (event, bundle) => {
    setAnchorEl(event.currentTarget);
    setSelectedBundle(bundle);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBundle(null);
  };

  const handleView = () => {
    if (!selectedBundle) return;
    
    // Transform products to expected format
    const formattedProducts = selectedBundle.products.map(p => ({
      id: p.id,
      name: p.product_name,
      code: p.product_code,
      price: p.product_price,
      image: p.product_image,
    }));
    
    navigate("/bundles/view", { 
      state: {
        bundleName: selectedBundle.name,
        description: selectedBundle.description,
        officialPrice: selectedBundle.officialPrice,
        initialPrice: selectedBundle.initialPrice,
        discount: selectedBundle.discount,
        warranty: selectedBundle.warranty,
        images: selectedBundle.images.map(url => ({ url, file: null })),
        products: formattedProducts,
        lastEdit: selectedBundle.lastEdit,
        editedBy: "Admin User",
      }
    });
    handleMenuClose();
  };

  const handleUpdate = () => {
    if (!selectedBundle) return;
    
    // Navigate to bundle create page with edit mode
    navigate("/bundles/create", { 
      state: {
        bundleId: selectedBundle.id,
        bundleName: selectedBundle.name,
        description: selectedBundle.description,
        officialPrice: selectedBundle.officialPrice,
        initialPrice: selectedBundle.initialPrice,
        discount: selectedBundle.discount,
        warranty: selectedBundle.warranty,
        images: selectedBundle.images.map(url => ({ url, file: null })),
        products: selectedBundle.products.map(p => ({
          id: p.product_id || p.id,
          name: p.product_name || p.name,
          code: p.product_code || p.code,
          price: p.product_price || p.price,
          image: p.product_image || p.image,
          category: p.category || 'Unknown',
          stock: p.stock || 0
        })),
        isEditMode: true
      }
    });
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    console.log('Delete clicked for bundle:', selectedBundle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBundle) {
      console.error('No bundle selected for deletion');
      return;
    }
    
    console.log('Deleting bundle:', selectedBundle.id);
    setDeleting(true);
    
    try {
      const result = await BundleService.deleteBundle(selectedBundle.id);
      console.log('Delete result:', result);
      
      if (result.success) {
        // Remove from local state
        setBundles(prev => prev.filter(b => b.id !== selectedBundle.id));
        setSuccessMessage("Bundle deleted successfully!");
        setShowSuccess(true);
        setDeleteDialogOpen(false);
        setSelectedBundle(null);
      } else {
        console.error('Delete failed:', result.error);
        setErrorMessage("Failed to delete bundle: " + (result.error?.message || "Unknown error"));
        setShowError(true);
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting bundle:', error);
      setErrorMessage("Error deleting bundle: " + error.message);
      setShowError(true);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedBundle(null);
  };
  
  // Filter handlers
  const handleNameFilterOpen = (event) => {
    setNameFilterAnchor(event.currentTarget);
  };
  
  const handleStatusFilterOpen = (event) => {
    setStatusFilterAnchor(event.currentTarget);
  };
  
  // Added price filter handler
  const handlePriceFilterOpen = (event) => {
    setPriceFilterAnchor(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setNameFilterAnchor(null);
    setStatusFilterAnchor(null);
    setPriceFilterAnchor(null); // Added this
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
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Function to get status color
  const getStockColor = (status) => {
    if (status === "Out of Stock") return "error";
    if (status === "Low Stock") return "warning";
    return "success";
  };
  
  // Get current page data
  const displayedBundles = filteredBundles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ width: "100%", mt: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">Bundle Name</Typography>
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
              <TableCell align="center">
                <b># of Products</b>
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
              <TableCell align="right">
                {/* Removed "Action" text here */}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading bundles...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography variant="body1" color="error">
                    {error}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : displayedBundles.map((bundle) => (
              <TableRow
                key={bundle.id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      src={bundle.image} 
                      alt={bundle.name} 
                      variant="square"
                      sx={{ width: 32, height: 32, mr: 1 }} 
                    />
                    <Typography variant="body2">{bundle.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{bundle.code}</TableCell>
                <TableCell align="center">{bundle.numProducts}</TableCell>
                <TableCell>
                  <Chip 
                    label={bundle.status}
                    color={getStockColor(bundle.status)}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      borderWidth: "1.5px"
                    }}
                  />
                </TableCell>
                <TableCell>
                  ₱
                  {Number(bundle.officialPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {bundle.lastEdit}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuOpen(e, bundle)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && !error && displayedBundles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No bundles found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Success Snackbar */}
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

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Pagination Component */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredBundles.length}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>View Bundle</MenuItem>
        <MenuItem onClick={handleUpdate}>Update Bundle</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          Delete Bundle
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Bundle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>"{selectedBundle?.name}"</strong>?
            <br />
            <br />
            This action cannot be undone. All bundle data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={deleting}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Bundles;
