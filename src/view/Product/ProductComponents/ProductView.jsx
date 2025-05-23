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
    officialPrice = "",
    initialPrice = "",
    discount = 0,
    variants = [],
    stock = 0,
  } = state;

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
            ₱{officialPrice} {initialPrice && `- ₱${initialPrice}`}
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
              <Typography variant="body2" fontWeight={600} mb={0.5}>
                Variants:
              </Typography>
              <Stack direction="row" spacing={1}>
                {variants.map((v, i) => (
                  <Chip key={i} label={v} />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
      <Paper sx={{ mt: 4, p: 3 }}>
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
        <Typography variant="body2">
          Component: {component || "-"}
          <br />
          Warranty: {warranty || "-"}
          <br />
          Official Price: ₱{officialPrice}
          <br />
          Initial Price: {initialPrice ? `₱${initialPrice}` : "-"}
          <br />
          Discount: {discount}%
          <br />
          Stock: {stock} pcs.
        </Typography>
      </Paper>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4, width: 200, mx: "auto", display: "block" }}
        onClick={handleOpenDialog}
      >
        Publish
      </Button>
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
