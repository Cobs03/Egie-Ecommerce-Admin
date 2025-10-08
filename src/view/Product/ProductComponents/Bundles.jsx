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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate } from "react-router-dom";
import bundleData from "../Data/BundleData.json";

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
  
  // Enhanced bundle data with status and lastEdit
  const [bundles, setBundles] = useState(
    bundleData.bundles.map(bundle => ({
      ...bundle,
      status: Math.random() > 0.3 ? "Available" : (Math.random() > 0.5 ? "Low Stock" : "Out of Stock"),
      stock: Math.random() > 0.3 ? Math.floor(Math.random() * 50) + 11 : 
             Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : 0,
      lastEdit: "03/11/2025 3:12 PM",
      numProducts: bundle.products ? bundle.products.length : Math.floor(Math.random() * 8) + 1
    }))
  );
  
  // Filtered bundles
  const [filteredBundles, setFilteredBundles] = useState(bundles);
  
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
    navigate("/bundles/view", { 
      state: {
        ...selectedBundle,
        editedBy: "Admin User", // Add this - can be dynamic from your data
      }
    });
    handleMenuClose();
  };

  const handleUpdate = () => {
    navigate("/bundles/create", { state: selectedBundle });
    handleMenuClose();
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    alert(`Delete bundle: ${selectedBundle.name}`);
    handleMenuClose();
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
            {displayedBundles.map((bundle) => (
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
            {displayedBundles.length === 0 && (
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>View Bundle</MenuItem>
        <MenuItem onClick={handleUpdate}>Update Bundle</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Delete Bundle
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default Bundles;
