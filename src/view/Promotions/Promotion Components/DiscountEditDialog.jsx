import React, { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  InputAdornment,
  Avatar,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ProductSelectionDialog from "./ProductSelectionDialog";
import CustomerSelectionDialog from "./CustomerSelectionDialog";

const DiscountEditDialog = ({ open, onClose, discount, isAddMode, onSave, showSnackbar }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "percent",
    value: "",
    activeFrom: null,
    activeTo: null,
    usageLimit: "",
    appliesTo: "All Products",
    specificProducts: [],
    minSpend: "",
    userEligibility: "All Users",
    selectedCustomers: [],
    description: "",
    isActive: true,
    used: 0,
  });

  const [errors, setErrors] = useState({});
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState(0);
  const [hoursUntilExpiry, setHoursUntilExpiry] = useState(0);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  useEffect(() => {
    if (discount) {
      // Use the database date fields (validFrom/validUntil) instead of the formatted dates string
      // Parse dates directly without timezone manipulation
      const activeFrom = discount.validFrom ? dayjs(discount.validFrom) : null;
      const activeTo = discount.validUntil ? dayjs(discount.validUntil) : null;
      
      setFormData({
        name: discount.name || "",
        type: discount.type || "percent",
        value: discount.value || "",
        activeFrom: activeFrom,
        activeTo: activeTo,
        usageLimit: discount.usageLimit || "",
        appliesTo: discount.appliesTo || "All Products",
        specificProducts: discount.specificProducts || [],
        minSpend: discount.minSpend || "",
        userEligibility: discount.userEligibility || "All Users",
        selectedCustomers: discount.selectedCustomers || [],
        description: discount.description || "",
        isActive: discount.isActive !== undefined ? discount.isActive : true,
        used: discount.used || 0,
      });

      if (activeTo) {
        const now = dayjs();
        const daysLeft = activeTo.diff(now, "day");
        const hoursLeft = activeTo.diff(now, "hour");
        const willShow = daysLeft >= 0 && daysLeft <= 7;
        setDaysUntilExpiry(daysLeft);
        setHoursUntilExpiry(hoursLeft);
        setShowExpirationWarning(willShow);
      } else {
        setShowExpirationWarning(false);
        setDaysUntilExpiry(0);
        setHoursUntilExpiry(0);
      }
    } else {
      setFormData({
        name: "",
        type: "percent",
        value: "",
        activeFrom: null,
        activeTo: null,
        usageLimit: "",
        appliesTo: "All Products",
        specificProducts: [],
        minSpend: "",
        userEligibility: "All Users",
        selectedCustomers: [],
        description: "",
        isActive: true,
        used: 0,
      });
      setShowExpirationWarning(false);
      setHoursUntilExpiry(0);
    }
    setErrors({});
  }, [discount, open]);

  const handleChange = (field) => (event) => {
    let value = event.target.value;

    if (field === "value" || field === "usageLimit" || field === "minSpend") {
      if (value && parseFloat(value) < 0) {
        return;
      }
    }

    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleDateChange = (field) => (date) => {
    setFormData({ ...formData, [field]: date });
    setErrors({ ...errors, [field]: "" });

    if (field === "activeTo" && date) {
      const now = dayjs();
      const daysLeft = date.diff(now, "day");
      const hoursLeft = date.diff(now, "hour");
      setDaysUntilExpiry(daysLeft);
      setHoursUntilExpiry(hoursLeft);
      setShowExpirationWarning(daysLeft >= 0 && daysLeft <= 7);
    }
  };

  const handleSwitchChange = (event) => {
    setFormData({ ...formData, isActive: event.target.checked });
  };

  const handleProductSelectionSave = (selectedProducts) => {
    setFormData({
      ...formData,
      appliesTo: selectedProducts.length > 0 ? "Specific Products" : "All Products",
      specificProducts: selectedProducts,
    });
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = formData.specificProducts.filter((p) => p.id !== productId);
    setFormData({
      ...formData,
      specificProducts: updatedProducts,
      appliesTo: updatedProducts.length === 0 ? "All Products" : "Specific Products",
    });
  };

  const handleClearAllProducts = () => {
    setFormData({
      ...formData,
      specificProducts: [],
      appliesTo: "All Products",
    });
  };

  const handleCustomerSelectionSave = (selectedCustomers) => {
    setFormData({
      ...formData,
      selectedCustomers: selectedCustomers,
    });
  };

  const handleRemoveCustomer = (customerId) => {
    const updatedCustomers = formData.selectedCustomers.filter((c) => c.id !== customerId);
    setFormData({
      ...formData,
      selectedCustomers: updatedCustomers,
    });
  };

  const handleClearAllCustomers = () => {
    setFormData({
      ...formData,
      selectedCustomers: [],
    });
  };

  const handleUserEligibilityChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      userEligibility: value,
      selectedCustomers: value === "Selected" ? formData.selectedCustomers : [],
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Discount name is required";
    if (!formData.value) newErrors.value = "Discount value is required";
    if (parseFloat(formData.value) <= 0) newErrors.value = "Value must be greater than 0";
    if (formData.type === "percent" && parseFloat(formData.value) > 100) {
      newErrors.value = "Percentage cannot exceed 100%";
    }
    if (!formData.activeFrom) newErrors.activeFrom = "Start date is required";
    if (!formData.activeTo) newErrors.activeTo = "End date is required";
    
    // Date validation
    if (formData.activeFrom && formData.activeTo) {
      if (formData.activeTo.isBefore(formData.activeFrom)) {
        newErrors.activeTo = "End date must be after start date";
      }
      // Prevent past dates for new discounts
      if (isAddMode && formData.activeFrom.isBefore(dayjs(), "day")) {
        newErrors.activeFrom = "Start date cannot be in the past";
      }
    }

    // Optional field validations
    if (formData.usageLimit && parseInt(formData.usageLimit) <= 0) {
      newErrors.usageLimit = "Usage limit must be greater than 0";
    }
    if (formData.minSpend && parseFloat(formData.minSpend) < 0) {
      newErrors.minSpend = "Minimum spend cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      showSnackbar("Please fix the errors before saving", "error");
      return;
    }

    const discountData = {
      id: discount?.id, // Include the ID for updates
      name: formData.name,
      type: formData.type,
      value: parseFloat(formData.value),
      validFrom: formData.activeFrom.format('YYYY-MM-DD'), // Use date format for database
      validUntil: formData.activeTo.format('YYYY-MM-DD'), // Use date format for database
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      appliesTo: formData.appliesTo,
      specificProducts: formData.specificProducts,
      minSpend: formData.minSpend ? parseFloat(formData.minSpend) : null,
      userEligibility: formData.userEligibility,
      selectedCustomers: formData.selectedCustomers,
      description: formData.description,
      isActive: formData.isActive,
      used: formData.used,
      maxDiscountAmount: formData.maxDiscountAmount || null
    };

    onSave(discountData);
    showSnackbar(
      isAddMode
        ? `Discount "${formData.name}" created successfully!`
        : `Discount "${formData.name}" updated successfully!`,
      "success"
    );
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: "90vh" },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              {isAddMode ? "Create New Discount" : "Edit Discount"}
            </Typography>
            {!isAddMode && (
              <Chip
                label={formData.isActive ? "Active" : "Inactive"}
                color={formData.isActive ? "success" : "default"}
                size="small"
              />
            )}
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              maxHeight: "calc(90vh - 200px)",
              overflowY: "auto",
              pr: 1,
              pt: 2,
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
            {showExpirationWarning && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                ⚠️ This discount will expire {
                  daysUntilExpiry === 0 && hoursUntilExpiry < 24
                    ? hoursUntilExpiry === 0
                      ? 'very soon'
                      : hoursUntilExpiry === 1
                      ? 'in 1 hour'
                      : `in ${hoursUntilExpiry} hours`
                    : daysUntilExpiry === 0
                    ? 'today'
                    : daysUntilExpiry === 1
                    ? 'tomorrow'
                    : `in ${daysUntilExpiry} days`
                }!
              </Alert>
            )}

            <Stack spacing={3}>
              {/* Basic Information */}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                  Basic Information
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Discount Name *"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange("name")}
                    error={!!errors.name}
                    helperText={errors.name}
                    placeholder="e.g., Christmas Sale, Flash Discount"
                  />

                  <TextField
                    label="Description (Optional)"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.description}
                    onChange={handleChange("description")}
                    placeholder="Brief description for admin reference or customer display"
                  />
                </Stack>
              </Box>

              {/* Discount Configuration */}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                  Discount Configuration
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Discount Type *</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={handleChange("type")}
                        label="Discount Type *"
                      >
                        <MenuItem value="percent">Percentage (%)</MenuItem>
                        <MenuItem value="fixed">Fixed Amount (₱)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label={formData.type === "fixed" ? "Amount (₱) *" : "Percentage (%) *"}
                      fullWidth
                      type="number"
                      value={formData.value}
                      onChange={handleChange("value")}
                      error={!!errors.value}
                      helperText={errors.value}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {formData.type === "fixed" ? "₱" : "%"}
                          </InputAdornment>
                        ),
                      }}
                      placeholder={formData.type === "fixed" ? "100" : "25"}
                    />
                  </Stack>

                  <TextField
                    label="Minimum Spend (Optional)"
                    fullWidth
                    type="number"
                    value={formData.minSpend}
                    onChange={handleChange("minSpend")}
                    error={!!errors.minSpend}
                    helperText={errors.minSpend || "Minimum order amount required to apply discount"}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                    placeholder="500"
                  />
                </Stack>
              </Box>

              {/* Validity Period */}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                  Validity Period
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <DatePicker
                    label="Active From *"
                    value={formData.activeFrom}
                    onChange={handleDateChange("activeFrom")}
                    minDate={isAddMode ? dayjs() : undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.activeFrom,
                        helperText: errors.activeFrom,
                      },
                    }}
                  />
                  <Typography>to</Typography>
                  <DatePicker
                    label="Active To *"
                    value={formData.activeTo}
                    onChange={handleDateChange("activeTo")}
                    minDate={formData.activeFrom || dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.activeTo,
                        helperText: errors.activeTo,
                      },
                    }}
                  />
                </Stack>
              </Box>

              {/* Application Rules */}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                  Application Rules
                </Typography>
                <Stack spacing={2}>
                  {/* Add Product Button */}
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setProductDialogOpen(true)}
                      fullWidth
                      sx={{
                        borderColor: "#27EF3C",
                        color: "#27EF3C",
                        fontWeight: "bold",
                        textTransform: "none",
                        py: 1.5,
                        "&:hover": {
                          borderColor: "#1ec32e",
                          bgcolor: "rgba(39, 239, 60, 0.04)",
                        },
                      }}
                    >
                      {formData.specificProducts.length > 0
                        ? "Modify Product Selection"
                        : "Add Products to Discount"}
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {formData.specificProducts.length > 0
                        ? `${formData.specificProducts.length} product(s) selected. Leave empty to apply to all products.`
                        : "Click to select specific products or leave empty to apply discount to all products"}
                    </Typography>
                  </Box>

                  {/* Selected Products Display */}
                  {formData.specificProducts.length > 0 && (
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          ✓ Selected Products ({formData.specificProducts.length})
                        </Typography>
                        <Button
                          size="small"
                          onClick={handleClearAllProducts}
                          sx={{
                            textTransform: "none",
                            color: "error.main",
                            fontSize: "0.75rem",
                          }}
                        >
                          Clear All
                        </Button>
                      </Stack>
                      <Box
                        sx={{
                          maxHeight: 200,
                          overflowY: "auto",
                          border: "2px solid #27EF3C",
                          borderRadius: 2,
                          p: 1.5,
                          bgcolor: "rgba(39, 239, 60, 0.02)",
                          "&::-webkit-scrollbar": { width: "6px" },
                          "&::-webkit-scrollbar-track": {
                            background: "#f1f1f1",
                            borderRadius: "3px",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            background: "#27EF3C",
                            borderRadius: "3px",
                            "&:hover": { background: "#1ec32e" },
                          },
                        }}
                      >
                        <Stack spacing={1}>
                          {formData.specificProducts.map((product) => {
                            // Get product image - handle both array and string formats
                            const productImage = product.images && Array.isArray(product.images) && product.images.length > 0
                              ? product.images[0]
                              : product.image || null;
                            
                            return (
                              <Box 
                                key={product.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  p: 1,
                                  bgcolor: 'rgba(39, 239, 60, 0.05)',
                                  borderRadius: 1,
                                  border: '1px solid rgba(39, 239, 60, 0.2)',
                                }}
                              >
                                {productImage ? (
                                  <Avatar
                                    src={productImage}
                                    alt={product.name}
                                    variant="rounded"
                                    sx={{ width: 40, height: 40 }}
                                  />
                                ) : (
                                  <Avatar
                                    variant="rounded"
                                    sx={{ width: 40, height: 40, bgcolor: '#e0e0e0' }}
                                  >
                                    <Typography variant="caption" fontSize="0.6rem">
                                      No Img
                                    </Typography>
                                  </Avatar>
                                )}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight={600} noWrap>
                                    {product.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    ₱{product.price.toLocaleString()}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveProduct(product.id)}
                                  sx={{
                                    color: 'error.main',
                                    '&:hover': { bgcolor: 'error.light', color: 'white' }
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            );
                          })}
                        </Stack>
                      </Box>
                    </Box>
                  )}

                  {/* Display Applies To Status */}
                  <Alert 
                    severity={formData.specificProducts.length > 0 ? "success" : "info"}
                    icon={formData.specificProducts.length > 0 ? "🎯" : "🌐"}
                  >
                    <Typography fontSize={13} fontWeight="bold">
                      {formData.specificProducts.length > 0
                        ? `This discount applies to ${formData.specificProducts.length} specific product(s)`
                        : "This discount applies to all products"}
                    </Typography>
                  </Alert>

                  <TextField
                    label="Usage Limit (Optional)"
                    fullWidth
                    type="number"
                    value={formData.usageLimit}
                    onChange={handleChange("usageLimit")}
                    error={!!errors.usageLimit}
                    helperText={errors.usageLimit || "Maximum number of times discount can be used (leave empty for unlimited)"}
                    placeholder="100"
                  />

                  <FormControl fullWidth>
                    <InputLabel>User Eligibility *</InputLabel>
                    <Select
                      value={formData.userEligibility}
                      onChange={handleUserEligibilityChange}
                      label="User Eligibility *"
                    >
                      <MenuItem value="All Users">All Users</MenuItem>
                      <MenuItem value="New Users">New Users Only</MenuItem>
                      <MenuItem value="Existing Users">Existing Users Only</MenuItem>
                      <MenuItem value="Selected">Selected Customers</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Customer Selection Button - Only show when "Selected" is chosen */}
                  {formData.userEligibility === "Selected" && (
                    <>
                      <Box>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => setCustomerDialogOpen(true)}
                          fullWidth
                          sx={{
                            borderColor: "#2196F3",
                            color: "#2196F3",
                            fontWeight: "bold",
                            textTransform: "none",
                            py: 1.5,
                            "&:hover": {
                              borderColor: "#1976d2",
                              bgcolor: "rgba(33, 150, 243, 0.04)",
                            },
                          }}
                        >
                          {formData.selectedCustomers.length > 0
                            ? "Modify Customer Selection"
                            : "Select Specific Customers"}
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          {formData.selectedCustomers.length > 0
                            ? `${formData.selectedCustomers.length} customer(s) selected for this discount`
                            : "Click to select specific customers who can use this discount"}
                        </Typography>
                      </Box>

                      {/* Selected Customers Display */}
                      {formData.selectedCustomers.length > 0 && (
                        <Box>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            mb={1}
                          >
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              ✓ Selected Customers ({formData.selectedCustomers.length})
                            </Typography>
                            <Button
                              size="small"
                              onClick={handleClearAllCustomers}
                              sx={{
                                textTransform: "none",
                                color: "error.main",
                                fontSize: "0.75rem",
                              }}
                            >
                              Clear All
                            </Button>
                          </Stack>
                          <Box
                            sx={{
                              maxHeight: 200,
                              overflowY: "auto",
                              border: "2px solid #2196F3",
                              borderRadius: 2,
                              p: 1.5,
                              bgcolor: "rgba(33, 150, 243, 0.02)",
                              "&::-webkit-scrollbar": { width: "6px" },
                              "&::-webkit-scrollbar-track": {
                                background: "#f1f1f1",
                                borderRadius: "3px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                background: "#2196F3",
                                borderRadius: "3px",
                                "&:hover": { background: "#1976d2" },
                              },
                            }}
                          >
                            <Stack spacing={1}>
                              {formData.selectedCustomers.map((customer) => (
                                <Chip
                                  key={customer.id}
                                  label={`${customer.avatar} ${customer.name} - ${customer.email}`}
                                  onDelete={() => handleRemoveCustomer(customer.id)}
                                  size="small"
                                  sx={{
                                    justifyContent: "space-between",
                                    "& .MuiChip-label": {
                                      fontWeight: 500,
                                    },
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        </Box>
                      )}

                      {/* Customer Selection Alert */}
                      <Alert 
                        severity={formData.selectedCustomers.length > 0 ? "success" : "warning"}
                        icon={formData.selectedCustomers.length > 0 ? "👥" : "⚠️"}
                      >
                        <Typography fontSize={13} fontWeight="bold">
                          {formData.selectedCustomers.length > 0
                            ? `This discount is available to ${formData.selectedCustomers.length} selected customer(s)`
                            : "No customers selected. Please select customers to apply this discount."}
                        </Typography>
                      </Alert>
                    </>
                  )}
                </Stack>
              </Box>

              {/* Status & Usage */}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                  Status & Usage
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleSwitchChange}
                        color="success"
                      />
                    }
                    label={
                      <Typography>
                        Discount is <strong>{formData.isActive ? "Active" : "Inactive"}</strong>
                      </Typography>
                    }
                  />

                  {!isAddMode && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#f5f5f5",
                        borderRadius: 1,
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold" mb={1}>
                        Usage Report:
                      </Typography>
                      <Stack direction="row" spacing={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Used
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formData.used}
                          </Typography>
                        </Box>
                        {formData.usageLimit && (
                          <>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Remaining
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {formData.usageLimit - formData.used}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Usage Rate
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {Math.round((formData.used / formData.usageLimit) * 100)}%
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Best Practices Alert */}
              <Alert severity="info" icon="💡">
                <Typography fontSize={13} fontWeight="bold" mb={0.5}>
                  Best Practices for Discounts
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                  <li>Set reasonable discount values to protect profit margins</li>
                  <li>Use minimum spend to encourage higher order values</li>
                  <li>Target specific customer segments for better engagement</li>
                  <li>Monitor usage regularly to prevent over-redemption</li>
                  <li>Avoid overlapping discounts on the same products</li>
                </ul>
              </Alert>
            </Stack>
          </Box>
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
              sx={{
                background: "#27EF3C",
                color: "#000",
                fontWeight: "bold",
                "&:hover": { background: "#1ec32e" },
              }}
            >
              {isAddMode ? "Create Discount" : "Save Changes"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Product Selection Dialog */}
      <ProductSelectionDialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        selectedProducts={formData.specificProducts}
        onSave={handleProductSelectionSave}
      />

      {/* Customer Selection Dialog */}
      <CustomerSelectionDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        selectedCustomers={formData.selectedCustomers}
        onSave={handleCustomerSelectionSave}
      />
    </LocalizationProvider>
  );
};

export default DiscountEditDialog;