import React, { useState, useMemo } from "react";
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

const ProductView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  if (!state) return <Typography>No product data.</Typography>;
  const {
    images = [],
    name = "",
    description = "",
    component = "",
    warranty = "",
    discount = 0,
    variants = [],
    stock = 0,
    isEditMode = false,
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

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmPublish = () => {
    // TODO: Save the product data (e.g., via an API call)
    navigate("/products");
    handleCloseDialog();
  };

  return (
    <Box maxWidth={1000} mx="auto" mt={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/products")}
        sx={{ mb: 2 }}
        variant="outlined"
      >
        Return
      </Button>
      <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
        {/* Images */}
        <Box>
          <Avatar
            src={images[0]?.url}
            variant="square"
            sx={{ width: 320, height: 220, mb: 2, borderRadius: 2 }}
          />
          <Stack direction="row" spacing={1}>
            {images.map((img, idx) => (
              <Avatar
                key={idx}
                src={img.url}
                variant="square"
                sx={{
                  width: 60,
                  height: 45,
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              />
            ))}
          </Stack>
        </Box>
        {/* Product Info */}
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            {name}
          </Typography>
          <Typography color="text.secondary" mb={1}>
            {description}
          </Typography>
          <Stack direction="row" spacing={2} mb={2}>
            <Chip
              label={component || "No Component"}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={warranty || "No Warranty"}
              color="success"
              variant="outlined"
            />
          </Stack>
          <Typography variant="h5" color="primary" fontWeight={700} mb={1}>
            ₱{priceRange.min.toLocaleString()} - ₱
            {priceRange.max.toLocaleString()}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={1}>
            Discount: {discount}%
          </Typography>
          <Typography
            variant="body1"
            color={stock > 0 ? "success.main" : "error.main"}
            mb={1}
          >
            {stock > 0 ? `In Stock: ${stock} pcs.` : "Out of Stock"}
          </Typography>
          {variants.length > 0 && (
            <Box mb={2}>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Variants:
              </Typography>
              <Stack spacing={1}>
                {variants.map((variant, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={500}>
                        {variant.name || `Variant ${idx + 1}`}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          Price: ₱{variant.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Stock: {variant.stock} pcs.
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
      <Paper sx={{ mt: 4, p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Product Description
        </Typography>
        <Typography variant="body1" mb={2}>
          {description}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" mb={2}>
          Product Specifications
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">Component: {component || "-"}</Typography>
          <Typography variant="body2">Warranty: {warranty || "-"}</Typography>
          <Typography variant="body2">
            Price Range: ₱{priceRange.min.toLocaleString()} - ₱
            {priceRange.max.toLocaleString()}
          </Typography>
          <Typography variant="body2">Discount: {discount}%</Typography>
          <Typography variant="body2">Total Stock: {stock} pcs.</Typography>
          {variants.length > 0 && (
            <>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                Variants:
              </Typography>
              {variants.map((variant, idx) => (
                <Box key={idx} sx={{ pl: 2 }}>
                  <Typography variant="body2">
                    • {variant.name || `Variant ${idx + 1}`}:
                    <br />
                    &nbsp;&nbsp;Price: ₱{variant.price}
                    <br />
                    &nbsp;&nbsp;Stock: {variant.stock} pcs.
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </Stack>
      </Paper>
      {isEditMode && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 4, mb: 4, width: "100%", mx: "auto", display: "block" }}
          onClick={handleOpenDialog}
        >
          Publish
        </Button>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Publish</DialogTitle>
        <DialogContent>
          Are you sure you want to publish this product?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmPublish} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductView;
