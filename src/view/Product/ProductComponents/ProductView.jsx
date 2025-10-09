import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import PersonIcon from "@mui/icons-material/Person";

const ProductView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!state) return <Typography>No product data.</Typography>;

  const {
    images = [],
    name = "",
    description = "",
    components = [],
    specifications = {},
    warranty = "",
    officialPrice = 0,
    initialPrice = 0,
    discount = 0,
    variants = [],
    stock = 0,
    isEditMode = false,
    lastEdit = null, // This comes from Inventory
    editedBy = "Admin User", // Add default editor name, can be passed from Inventory
  } = state;

  // Calculate price range from variants
  const priceRange = useMemo(() => {
    if (variants.length === 0) return { min: 0, max: 0 };

    const prices = variants.map((v) => Number(v.price) || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [variants]);

  // Calculate hours since last edit
  const getTimeSinceEdit = () => {
    if (!lastEdit) return null;

    try {
      // Parse lastEdit format: "03/11/2025 3:12 PM"
      const [datePart, timePart, meridiem] = lastEdit.split(" ");
      const [month, day, year] = datePart.split("/");
      let [hours, minutes] = timePart.split(":");

      // Convert to 24-hour format
      hours = parseInt(hours);
      if (meridiem === "PM" && hours !== 12) {
        hours += 12;
      } else if (meridiem === "AM" && hours === 12) {
        hours = 0;
      }

      const editDate = new Date(
        year,
        month - 1,
        day,
        hours,
        parseInt(minutes)
      );
      const now = new Date();
      const diffMs = now - editDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;

      return {
        totalHours: diffHours,
        days: diffDays,
        hours: remainingHours,
      };
    } catch (error) {
      console.error("Error parsing lastEdit date:", error);
      return null;
    }
  };

  const timeSinceEdit = getTimeSinceEdit();

  // Format specification fields for display
  const formatSpecLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmPublish = () => {
    console.log("Publishing product:", state);
    navigate("/products");
    handleCloseDialog();
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
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Return
        </Button>

        {/* Last Edit Information - Only shown when coming from Inventory */}
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
            {timeSinceEdit && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <UpdateIcon sx={{ fontSize: 16, color: "white" }} />
                <Typography variant="body2" sx={{ color: "white" }}>
                  <strong>Time Since:</strong>{" "}
                  {timeSinceEdit.days > 0 && `${timeSinceEdit.days}d `}
                  {timeSinceEdit.hours}h ago
                </Typography>
              </Box>
            )}

            {/* Total Hours */}
            {timeSinceEdit && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: "white" }} />
                <Typography variant="body2" sx={{ color: "white" }}>
                  <strong>Total Hours:</strong> {timeSinceEdit.totalHours}h
                </Typography>
              </Box>
            )}
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
            {images.length > 0 && images[selectedImage]?.url ? (
              <img
                src={images[selectedImage]?.url || images[0]?.url}
                alt={name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No Image Available
              </Typography>
            )}
          </Box>

          {/* Thumbnail Images - Only show if we have images */}
          {images.length > 0 && (
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
                    alt={`${name} ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Right Side - Product Info */}
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700} mb={2}>
            {name}
          </Typography>

          {/* Component Tags */}
          {components.length > 0 && (
            <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={1}>
              {components.map((comp, idx) => (
                <Chip
                  key={idx}
                  label={comp.name}
                  size="small"
                  sx={{
                    bgcolor: "#f0f0f0",
                    fontWeight: 500,
                    borderRadius: "4px",
                  }}
                />
              ))}
            </Stack>
          )}

          {/* Price Range */}
          <Typography
            variant="h4"
            color="text.primary"
            fontWeight={700}
            mb={1}
          >
            ₱{priceRange.min.toLocaleString()} - ₱
            {priceRange.max.toLocaleString()}
          </Typography>

          {/* Stock Status */}
          <Typography
            variant="body1"
            fontWeight={600}
            color={stock > 0 ? "success.main" : "error.main"}
            mb={3}
          >
            {stock > 0 ? `In Stock: ${stock} pcs.` : "Out of Stock"}
          </Typography>

          {/* Variants */}
          {variants.length > 0 && (
            <Box mb={3}>
              <Typography variant="body1" fontWeight={700} mb={1.5}>
                Variants:
              </Typography>
              <Stack spacing={1.5}>
                {variants.map((variant, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      bgcolor: "#f9f9f9",
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      • {variant.name || `Variant ${idx + 1}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Price: ₱{Number(variant.price).toLocaleString()} Stock:{" "}
                      {variant.stock} pcs.
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>

      <Divider sx={{ my: 4 }} />

      {/* Product Description Section */}
      <Box mb={4}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Product Description
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}
        >
          {description}
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Product Specifications Section */}
      <Box mb={4}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Product Specifications
        </Typography>

        {components.length > 0 &&
          components.map((component) => {
            const componentSpecs = specifications[component.id];
            if (!componentSpecs || Object.keys(componentSpecs).length === 0) {
              return null;
            }

            return (
              <Box key={component.id} mb={3}>
                <Typography variant="body1" fontWeight={700} mb={1.5}>
                  Component: {component.name}
                </Typography>
                <Stack spacing={0.5}>
                  {Object.entries(componentSpecs).map(([key, value]) => (
                    <Typography
                      key={key}
                      variant="body2"
                      color="text.secondary"
                    >
                      <strong>{formatSpecLabel(key)}:</strong> {value || "-"}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            );
          })}

        <Typography variant="body1" fontWeight={700} mb={1}>
          Warranty: {warranty || "warranty1"}
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Price Range: ₱{priceRange.min.toLocaleString()} - ₱
          {priceRange.max.toLocaleString()}
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Total Stock: {stock} pcs.
        </Typography>
      </Box>

      {/* Publish Button */}
      {isEditMode && (
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
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
          Publish
        </Button>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Publish</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to publish this product? Once published, it
            will be visible to customers.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPublish}
            variant="contained"
            color="primary"
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductView;
