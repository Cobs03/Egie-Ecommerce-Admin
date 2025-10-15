import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Avatar,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import PersonIcon from "@mui/icons-material/Person";
import { BundleService } from "../../../services/BundleService";
import { StorageService } from "../../../services/StorageService";

const BundleView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isEditMode = state?.isEditMode || false;

  if (!state) return <Typography>No bundle data.</Typography>;
  
  const {
    bundleId = null,
    images = [],
    bundleName = "",
    description = "",
    warranty = "",
    officialPrice = "",
    initialPrice = "",
    discount = 0,
    products = [],
    lastEdit = null, // From Bundles.jsx
    editedBy = "Admin User", // From Bundles.jsx
  } = state;

  // Calculate hours since last edit
  const getTimeSinceEdit = () => {
    if (!lastEdit) {
      console.log('No lastEdit provided');
      return null;
    }

    try {
      console.log('Parsing lastEdit:', lastEdit);
      
      let editDate;
      
      // Try parsing as ISO string first (from database)
      if (lastEdit.includes('T') || lastEdit.includes('Z')) {
        editDate = new Date(lastEdit);
      } else {
        // Parse format like "10/14/2025, 1:38:46 PM" or "03/11/2025 3:12 PM"
        const dateStr = lastEdit.replace(',', ''); // Remove comma if present
        const parts = dateStr.split(' ');
        
        if (parts.length < 3) {
          console.error('Invalid date format:', lastEdit);
          return null;
        }
        
        const datePart = parts[0];
        const timePart = parts[1];
        const meridiem = parts[2];
        
        const [month, day, year] = datePart.split("/");
        let [hours, minutes, seconds] = timePart.split(":");
        
        // Convert to 24-hour format
        hours = parseInt(hours);
        if (meridiem === "PM" && hours !== 12) {
          hours += 12;
        } else if (meridiem === "AM" && hours === 12) {
          hours = 0;
        }

        editDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          hours,
          parseInt(minutes),
          seconds ? parseInt(seconds) : 0
        );
      }
      
      if (isNaN(editDate.getTime())) {
        console.error('Invalid date result:', editDate);
        return null;
      }
      
      const now = new Date();
      const diffMs = now - editDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;

      console.log('Time calculation:', { diffHours, diffDays, remainingHours });

      return {
        totalHours: diffHours >= 0 ? diffHours : 0,
        days: diffDays >= 0 ? diffDays : 0,
        hours: remainingHours >= 0 ? remainingHours : 0,
      };
    } catch (error) {
      console.error("Error parsing lastEdit date:", error, 'Input:', lastEdit);
      return null;
    }
  };

  const timeSinceEdit = getTimeSinceEdit();

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmPublish = async () => {
    setSaving(true);
    try {
      // Separate existing URLs from new files
      const existingUrls = images.filter(img => !img.file).map(img => img.url);
      const newFiles = images.filter(img => img.file).map(img => img.file);
      
      let newImageUrls = [];
      
      // Upload only new images
      if (newFiles.length > 0) {
        const uploadResult = await StorageService.uploadMultipleImages(newFiles, 'bundles');
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload images');
        }
        
        newImageUrls = uploadResult.data;
      }

      // Combine existing URLs with new uploaded URLs
      const allImageUrls = [...existingUrls, ...newImageUrls];

      // Prepare bundle data for saving
      const bundleData = {
        name: bundleName,
        description: description,
        originalPrice: initialPrice,
        bundlePrice: parseFloat(officialPrice),
        discountPercentage: discount,
        warranty: warranty,
        products: products,
        images: allImageUrls,
        isActive: true,
      };

      let result;
      if (bundleId) {
        // Update existing bundle
        console.log('Updating bundle with ID:', bundleId);
        result = await BundleService.updateBundle(bundleId, bundleData);
      } else {
        // Create new bundle
        console.log('Creating new bundle');
        result = await BundleService.createBundle(bundleData);
      }

      if (result.success) {
        setShowSuccess(true);
        handleCloseDialog();
        
        // Navigate back to products page after a short delay
        setTimeout(() => {
          navigate("/products", { state: { tab: 2 } }); // Tab 2 for Bundles
        }, 1500);
      } else {
        setErrorMessage(result.error?.message || "Failed to save bundle");
        setShowError(true);
        handleCloseDialog();
      }
    } catch (error) {
      setErrorMessage("Error saving bundle: " + error.message);
      setShowError(true);
      handleCloseDialog();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxWidth={1200} mx="auto" mt={3} px={3} pb={4}>
      {/* Header with Return Button and Last Edit Info */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/products")}
          variant="outlined"
        >
          Return
        </Button>

        {/* Last Edit Information - Only shown when coming from Bundles */}
        {lastEdit && (
          <Paper
            elevation={3}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 2.5,
              py: 1.5,
              bgcolor: "#1976d2", // Blue background
              color: "white",
              borderRadius: 2,
              flexWrap: "wrap",
            }}
          >
            {/* Edited By */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: 18, color: "white" }} />
              <Typography variant="body2" sx={{ color: "white" }}>
                <strong>Edited By:</strong> {editedBy}
              </Typography>
            </Box>

            {/* Last Edit Date/Time */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 16, color: "white" }} />
              <Typography variant="body2" sx={{ color: "white" }}>
                <strong>Last Edit:</strong> {lastEdit}
              </Typography>
            </Box>

            {/* Time Since Edit */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <UpdateIcon sx={{ fontSize: 16, color: "white" }} />
              <Typography variant="body2" sx={{ color: "white" }}>
                <strong>Time Since:</strong>{" "}
                {timeSinceEdit ? (
                  <>
                    {timeSinceEdit.days > 0 && `${timeSinceEdit.days}d `}
                    {timeSinceEdit.hours}h ago
                  </>
                ) : (
                  "Just now"
                )}
              </Typography>
            </Box>

            {/* Total Hours */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: "white" }} />
              <Typography variant="body2" sx={{ color: "white" }}>
                <strong>Total Hours:</strong>{" "}
                {timeSinceEdit ? `${timeSinceEdit.totalHours}h` : "0h"}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={4} mb={4}>
        {/* Left Side - Images */}
        <Box sx={{ width: { xs: "100%", md: "350px" }, flexShrink: 0 }}>
          {/* Main Image */}
          <Box
            sx={{
              width: "100%",
              height: 280,
              mb: 2,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #e0e0e0",
              bgcolor: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={images[selectedImage]?.url || images[0]?.url}
              alt={bundleName}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* Thumbnail Carousel */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              overflowY: "hidden",
              pb: 1,
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-track": {
                bgcolor: "#f1f1f1",
                borderRadius: 10,
              },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#888",
                borderRadius: 10,
                "&:hover": {
                  bgcolor: "#555",
                },
              },
            }}
          >
            {images.map((img, idx) => (
              <Box
                key={idx}
                onClick={() => setSelectedImage(idx)}
                sx={{
                  minWidth: 60,
                  width: 60,
                  height: 60,
                  borderRadius: 1,
                  border:
                    selectedImage === idx
                      ? "2px solid #1976d2"
                      : "1px solid #e0e0e0",
                  overflow: "hidden",
                  cursor: "pointer",
                  bgcolor: "#fafafa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#1976d2",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <img
                  src={img.url}
                  alt={`${bundleName} ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Side - Bundle Info */}
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700} mb={2}>
            {bundleName}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            mb={3}
            sx={{ lineHeight: 1.6 }}
          >
            {description}
          </Typography>

          {/* Products in Bundle */}
          {products.length > 0 && (
            <Box mb={3}>
              <Typography variant="body1" fontWeight={700} mb={1.5}>
                Products in this Bundle:
              </Typography>
              <Stack spacing={1.5}>
                {products.map((product, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1.5,
                      bgcolor: "#f9f9f9",
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Avatar
                      src={product.image}
                      alt={product.name}
                      sx={{ mr: 1.5, width: 40, height: 40 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.code} - ₱
                        {Number(product.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              {/* Bundle Specifications */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mt: 1.5,
                  mb: 4,
                  bgcolor: "#fafafa",
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Bundle Specifications
                </Typography>

                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Warranty
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {warranty || "No Warranty"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Official Price
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      ₱
                      {Number(officialPrice).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>

                  {initialPrice && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Initial Price
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        ₱
                        {Number(initialPrice).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Discount
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {discount}%
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Number of Products
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {products.length} item{products.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          )}
        </Box>
      </Stack>

      {/* Publish Button */}
      {isEditMode && (
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleOpenDialog}
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            bgcolor: "#000",
            "&:hover": {
              bgcolor: "#333",
            },
          }}
        >
          Publish Bundle
        </Button>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={!saving ? handleCloseDialog : undefined}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: "black" }}>Confirm Publish</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to publish this bundle? Once published, it
            will be visible to customers.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPublish}
            variant="contained"
            disabled={saving}
            sx={{
              bgcolor: "black",
              color: "#fff",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "#333",
              },
            }}
          >
            {saving ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Saving...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
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
          Bundle published successfully!
        </Alert>
      </Snackbar>

      {/* Error Notification */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BundleView;
