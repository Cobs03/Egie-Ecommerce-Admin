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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const VoucherEditDialog = ({ open, onClose, voucher, isAddMode, onSave, showSnackbar }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "fixed",
    amount: "",
    activeFrom: null,
    activeTo: null,
    limit: "",
    minSpend: "",
    applicableProducts: "",
    userRestriction: "all",
    description: "",
    isActive: true,
    usageCount: 0,
  });

  const [errors, setErrors] = useState({});
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);

  useEffect(() => {
    if (voucher) {
      const [activeFrom, activeTo] = voucher.active.split(" - ");
      setFormData({
        name: voucher.name || "",
        code: voucher.code || "",
        type: voucher.type || "fixed",
        amount: voucher.price?.replace(/[^\d.]/g, "") || "",
        activeFrom: activeFrom ? dayjs(activeFrom, "MM/DD/YY") : null,
        activeTo: activeTo ? dayjs(activeTo, "MM/DD/YY") : null,
        limit: voucher.limit || "",
        minSpend: voucher.minSpend || "",
        applicableProducts: voucher.applicableProducts || "",
        userRestriction: voucher.userRestriction || "all",
        description: voucher.description || "",
        isActive: voucher.isActive !== undefined ? voucher.isActive : true,
        usageCount: voucher.used || 0,
      });

      if (activeTo) {
        const expiryDate = dayjs(activeTo, "MM/DD/YY");
        const daysUntilExpiry = expiryDate.diff(dayjs(), "day");
        setShowExpirationWarning(daysUntilExpiry >= 0 && daysUntilExpiry <= 7);
      }
    } else {
      setFormData({
        name: "",
        code: "",
        type: "fixed",
        amount: "",
        activeFrom: null,
        activeTo: null,
        limit: "",
        minSpend: "",
        applicableProducts: "",
        userRestriction: "all",
        description: "",
        isActive: true,
        usageCount: 0,
      });
      setShowExpirationWarning(false);
    }
    setErrors({});
  }, [voucher, open]);

  const handleChange = (field) => (event) => {
    let value = event.target.value;

    if (field === "code") {
      value = value.toUpperCase();
    }

    if (field === "amount" || field === "limit" || field === "minSpend") {
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
      const daysUntilExpiry = date.diff(dayjs(), "day");
      setShowExpirationWarning(daysUntilExpiry >= 0 && daysUntilExpiry <= 7);
    }
  };

  const handleSwitchChange = (event) => {
    setFormData({ ...formData, isActive: event.target.checked });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (formData.code.length !== 6) newErrors.code = "Code must be exactly 6 characters";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (parseFloat(formData.amount) <= 0) newErrors.amount = "Amount must be greater than 0";
    if (formData.type === "percent" && parseFloat(formData.amount) > 100) {
      newErrors.amount = "Percentage cannot exceed 100%";
    }
    if (!formData.activeFrom) newErrors.activeFrom = "Start date is required";
    if (!formData.activeTo) newErrors.activeTo = "End date is required";
    if (!formData.limit) newErrors.limit = "Limit is required";
    if (parseInt(formData.limit) <= 0) newErrors.limit = "Limit must be greater than 0";

    if (formData.activeFrom && formData.activeTo) {
      if (formData.activeTo.isBefore(formData.activeFrom)) {
        newErrors.activeTo = "End date must be after start date";
      }
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

    const voucherData = {
      ...voucher,
      name: formData.name,
      code: formData.code,
      type: formData.type,
      price: formData.type === "fixed" ? `₱ ${formData.amount}` : `${formData.amount}%`,
      active: `${formData.activeFrom.format("MM/DD/YY")} - ${formData.activeTo.format("MM/DD/YY")}`,
      limit: parseInt(formData.limit),
      minSpend: formData.minSpend ? parseFloat(formData.minSpend) : null,
      applicableProducts: formData.applicableProducts,
      userRestriction: formData.userRestriction,
      description: formData.description,
      isActive: formData.isActive,
      used: formData.usageCount,
    };

    onSave(voucherData);
    showSnackbar(
      isAddMode
        ? `Voucher "${formData.code}" created successfully!`
        : `Voucher "${formData.code}" updated successfully!`,
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
              {isAddMode ? "Create New Voucher" : "Edit Voucher"}
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
                ⚠️ This voucher will expire within 7 days!
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
                    label="Voucher Name *"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange("name")}
                    error={!!errors.name}
                    helperText={errors.name}
                    placeholder="e.g., Free Delivery, Summer Sale"
                  />

                  <TextField
                    label="Voucher Code *"
                    fullWidth
                    inputProps={{ maxLength: 6 }}
                    value={formData.code}
                    onChange={handleChange("code")}
                    error={!!errors.code}
                    helperText={errors.code || "6 characters, auto-uppercase"}
                    placeholder="ABC123"
                  />

                  <TextField
                    label="Description (Optional)"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.description}
                    onChange={handleChange("description")}
                    placeholder="Internal notes or public message for customers"
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
                        <MenuItem value="fixed">Fixed Amount (₱)</MenuItem>
                        <MenuItem value="percent">Percentage (%)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label={formData.type === "fixed" ? "Amount (₱) *" : "Percentage (%) *"}
                      fullWidth
                      type="number"
                      value={formData.amount}
                      onChange={handleChange("amount")}
                      error={!!errors.amount}
                      helperText={errors.amount}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {formData.type === "fixed" ? "₱" : "%"}
                          </InputAdornment>
                        ),
                      }}
                      placeholder={formData.type === "fixed" ? "50" : "10"}
                    />
                  </Stack>

                  <TextField
                    label="Minimum Spend (Optional)"
                    fullWidth
                    type="number"
                    value={formData.minSpend}
                    onChange={handleChange("minSpend")}
                    error={!!errors.minSpend}
                    helperText={errors.minSpend || "Minimum order amount to use this voucher"}
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

              {/* Usage Limits */}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                  Usage Limits
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Total Usage Limit *"
                    fullWidth
                    type="number"
                    value={formData.limit}
                    onChange={handleChange("limit")}
                    error={!!errors.limit}
                    helperText={errors.limit || "Maximum number of times this voucher can be used"}
                    placeholder="100"
                  />

                  <FormControl fullWidth>
                    <InputLabel>User Restrictions</InputLabel>
                    <Select
                      value={formData.userRestriction}
                      onChange={handleChange("userRestriction")}
                      label="User Restrictions"
                    >
                      <MenuItem value="all">All Users</MenuItem>
                      <MenuItem value="new">New Users Only</MenuItem>
                      <MenuItem value="existing">Existing Users Only</MenuItem>
                      <MenuItem value="selected">Selected Customers</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Applicable Products/Collections (Optional)"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.applicableProducts}
                    onChange={handleChange("applicableProducts")}
                    placeholder="e.g., Controllers, Gaming Accessories, or leave empty for all products"
                    helperText="Specify products, categories, or leave blank for sitewide"
                  />
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
                        Voucher is <strong>{formData.isActive ? "Active" : "Inactive"}</strong>
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
                            {formData.usageCount}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Remaining
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formData.limit - formData.usageCount}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Usage Rate
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formData.limit > 0
                              ? Math.round((formData.usageCount / formData.limit) * 100)
                              : 0}
                            %
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Reminder */}
              <Alert severity="info" icon="📝">
                <Typography fontSize={13} fontWeight="bold" mb={0.5}>
                  Reminder: Creating a Valid Voucher
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                  <li>All required fields (*) must be filled</li>
                  <li>Code must be exactly 6 characters</li>
                  <li>Amount must be a positive number</li>
                  <li>End date must be after start date</li>
                  <li>Double-check all details before saving</li>
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
              {isAddMode ? "Create Voucher" : "Save Changes"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default VoucherEditDialog;