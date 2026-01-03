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
import { CustomerService } from "../../../services/CustomerService";

const CustomerSelectionDialog = ({ open, onClose, selectedCustomers, onSave }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [ordersFilter, setOrdersFilter] = useState("All");
  const [spendFilter, setSpendFilter] = useState("All");
  const [localSelectedCustomers, setLocalSelectedCustomers] = useState(selectedCustomers || []);
  const [selectAll, setSelectAll] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load customers from database
  useEffect(() => {
    if (open) {
      loadCustomers();
    }
  }, [open]);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await CustomerService.getAllCustomers();
      if (result.success) {
        // Transform customer data to match the expected format
        const transformedCustomers = result.data.map(customer => {
          // Calculate total orders and spent
          const totalOrders = customer.orders?.length || 0;
          const totalSpent = customer.orders?.reduce((sum, order) => {
            return sum + (order.status === 'completed' ? order.total_amount : 0);
          }, 0) || 0;

          // Determine customer type (New if registered within last 30 days)
          const joinDate = new Date(customer.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const type = joinDate > thirtyDaysAgo ? "New" : "Existing";

          return {
            id: customer.id,
            name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown',
            email: customer.email,
            type: type,
            totalOrders: totalOrders,
            totalSpent: totalSpent,
            joinDate: customer.created_at,
            avatar: customer.first_name?.charAt(0)?.toUpperCase() || '👤',
          };
        });
        
        setCustomers(transformedCustomers);
      } else {
        setError('Failed to load customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Error loading customers');
    } finally {
      setLoading(false);
    }
  };

  // Filtered customers based on search and filters
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "All") {
      result = result.filter((customer) => customer.type === typeFilter);
    }

    // Orders filter
    if (ordersFilter === "Low") {
      result = result.filter((customer) => customer.totalOrders < 5);
    } else if (ordersFilter === "Medium") {
      result = result.filter((customer) => customer.totalOrders >= 5 && customer.totalOrders < 15);
    } else if (ordersFilter === "High") {
      result = result.filter((customer) => customer.totalOrders >= 15);
    }

    // Spend filter
    if (spendFilter === "Low") {
      result = result.filter((customer) => customer.totalSpent < 30000);
    } else if (spendFilter === "Medium") {
      result = result.filter((customer) => customer.totalSpent >= 30000 && customer.totalSpent < 100000);
    } else if (spendFilter === "High") {
      result = result.filter((customer) => customer.totalSpent >= 100000);
    }

    return result;
  }, [customers, searchQuery, typeFilter, ordersFilter, spendFilter]);

  // Handle individual customer selection
  const handleToggleCustomer = (customer) => {
    const isSelected = localSelectedCustomers.some((c) => c.id === customer.id);
    if (isSelected) {
      setLocalSelectedCustomers(localSelectedCustomers.filter((c) => c.id !== customer.id));
    } else {
      setLocalSelectedCustomers([...localSelectedCustomers, customer]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setLocalSelectedCustomers([]);
      setSelectAll(false);
    } else {
      setLocalSelectedCustomers([...filteredCustomers]);
      setSelectAll(true);
    }
  };

  // Handle save
  const handleSave = () => {
    onSave(localSelectedCustomers);
    onClose();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setTypeFilter("All");
    setOrdersFilter("All");
    setSpendFilter("All");
  };

  // Check if customer is selected
  const isCustomerSelected = (customerId) => {
    return localSelectedCustomers.some((c) => c.id === customerId);
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
            Select Customers for Discount
          </Typography>
          <Chip
            label={`${localSelectedCustomers.length} Selected`}
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
            placeholder="Search customers by name or email..."
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
              <InputLabel>Customer Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Customer Type"
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="New">New Customers</MenuItem>
                <MenuItem value="Existing">Existing Customers</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Total Orders</InputLabel>
              <Select
                value={ordersFilter}
                onChange={(e) => setOrdersFilter(e.target.value)}
                label="Total Orders"
              >
                <MenuItem value="All">All Orders</MenuItem>
                <MenuItem value="Low">Low (&lt; 5)</MenuItem>
                <MenuItem value="Medium">Medium (5 - 15)</MenuItem>
                <MenuItem value="High">High (&gt; 15)</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Total Spent</InputLabel>
              <Select
                value={spendFilter}
                onChange={(e) => setSpendFilter(e.target.value)}
                label="Total Spent"
              >
                <MenuItem value="All">All Amounts</MenuItem>
                <MenuItem value="Low">Low (&lt; ₱30,000)</MenuItem>
                <MenuItem value="Medium">Medium (₱30,000 - ₱100,000)</MenuItem>
                <MenuItem value="High">High (&gt; ₱100,000)</MenuItem>
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
                    localSelectedCustomers.length > 0 &&
                    localSelectedCustomers.length < filteredCustomers.length
                  }
                />
              }
              label={
                <Typography fontWeight={600}>
                  {selectAll ? "Deselect All" : "Select All Filtered Customers"}
                </Typography>
              }
            />
            <Typography variant="body2" color="text.secondary">
              {filteredCustomers.length} customers found
            </Typography>
          </Box>

          <Divider />

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <Box sx={{ mb: 2 }}>
                <img
                  src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
                  alt="Loading"
                  style={{ width: '60px', height: '40px', objectFit: 'contain' }}
                />
              </Box>
              <Box
                sx={{
                  width: '30px',
                  height: '30px',
                  border: '3px solid rgba(0, 230, 118, 0.1)',
                  borderTop: '3px solid #00E676',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
              <Box sx={{ color: '#00E676', fontSize: '14px', fontWeight: 500, mt: 1 }}>
                Loading customers...
              </Box>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Customer List */}
          {!loading && !error && (
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
              {filteredCustomers.map((customer, index) => (
                <React.Fragment key={customer.id}>
                  <ListItem
                    button
                    onClick={() => handleToggleCustomer(customer)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                      bgcolor: isCustomerSelected(customer.id)
                        ? "rgba(39, 239, 60, 0.08)"
                        : "transparent",
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={isCustomerSelected(customer.id)}
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
                      {customer.avatar}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={600}>{customer.name}</Typography>
                          <Chip
                            label={customer.type}
                            size="small"
                            color={customer.type === "New" ? "success" : "default"}
                            sx={{ fontSize: "0.65rem", height: 18 }}
                          />
                        </Stack>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {customer.email}
                          </Typography>
                          <Stack direction="row" spacing={1} mt={0.5}>
                            <Chip
                              label={`${customer.totalOrders} orders`}
                              size="small"
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                            <Chip
                              label={`₱${customer.totalSpent.toLocaleString()} spent`}
                              size="small"
                              color="primary"
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                            <Chip
                              label={`Joined ${customer.joinDate}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                          </Stack>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < filteredCustomers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {filteredCustomers.length === 0 && (
                <Box py={4} textAlign="center">
                  <Typography variant="body1" color="text.secondary">
                    No customers found matching your filters
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
          )}
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
            disabled={localSelectedCustomers.length === 0}
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
            Apply ({localSelectedCustomers.length} Customers)
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerSelectionDialog;