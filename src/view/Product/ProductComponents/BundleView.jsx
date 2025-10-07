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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BundleView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const isEditMode = state?.isEditMode || false;

  if (!state) return <Typography>No bundle data.</Typography>;
  const {
    images = [],
    bundleName = "",
    description = "",
    warranty = "",
    officialPrice = "",
    initialPrice = "",
    discount = 0,
    products = [],
  } = state;

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmPublish = () => {
    // TODO: Save the bundle data (e.g., via an API call)
    navigate("/products");
    handleCloseDialog();
  };

  return (
    <Box maxWidth={1200} mx="auto" mt={3} px={3} pb={4}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/products")}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Return
      </Button>

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
        onClose={handleCloseDialog}
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
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPublish}
            variant="contained"
            sx={{
              bgcolor: "black",
              color: "#fff",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "#333",
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BundleView;
