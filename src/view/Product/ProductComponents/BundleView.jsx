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
        {/* Bundle Info */}
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            {bundleName}
          </Typography>
          <Typography color="text.secondary" mb={1}>
            {description}
          </Typography>
          {products.length > 0 && (
            <Box mb={2}>
              <Typography variant="body2" fontWeight={600} mb={0.5}>
                Products in this Bundle:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {products.map((p, i) => (
                  <Box key={i} display="flex" alignItems="center" mr={1} mb={1}>
                    <Avatar
                      src={p.image}
                      alt={p.name}
                      sx={{ width: 28, height: 28, mr: 0.5 }}
                    />
                    <Chip label={p.name} />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
          <Stack direction="row" spacing={2} mb={2}>
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
        </Box>
      </Stack>
      <Paper sx={{ mt: 4, p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Bundle Description
        </Typography>
        <Typography variant="body1" mb={2}>
          {description}
        </Typography>
        {products.length > 0 && (
          <Box mb={2}>
            <Typography variant="body2" fontWeight={600} mb={0.5}>
              Products in this Bundle:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {products.map((p, i) => (
                <Box key={i} display="flex" alignItems="center" mr={1} mb={1}>
                  <Avatar
                    src={p.image}
                    alt={p.name}
                    sx={{ width: 28, height: 28, mr: 0.5 }}
                  />
                  <Chip label={p.name} />
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" mb={2}>
          Bundle Specifications
        </Typography>
        <Typography variant="body2">
          Warranty: {warranty || "-"}
          <br />
          Official Price: ₱{officialPrice}
          <br />
          Initial Price: {initialPrice ? `₱${initialPrice}` : "-"}
          <br />
          Discount: {discount}%
        </Typography>
      </Paper>
      {isEditMode && (
        <>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 4, width: 200, mx: "auto", display: "block", mb: 4}}
            onClick={handleOpenDialog}
          >
            Publish
          </Button>
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle sx={{ color: "black" }}>Confirm Publish</DialogTitle>
            <DialogContent>
              Are you sure you want to publish this bundle?
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={handleConfirmPublish} color="primary" autoFocus sx={{ bgcolor: "black", color: "#fff", fontWeight: 700 }}>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default BundleView;
