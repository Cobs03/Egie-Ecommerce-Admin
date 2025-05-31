import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  IconButton,
  Divider,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import componentData from "../Data/ComponentData.json";

const ProductCreate = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const isEditMode = state !== null;

  // Initialize state with product data if in edit mode
  const [images, setImages] = useState(state?.images || []);
  const [variants, setVariants] = useState(state?.variants || []);
  const [stock, setStock] = useState(state?.stock || 0);
  const [discount, setDiscount] = useState(state?.discount || 0);
  const [name, setName] = useState(state?.name || "");
  const [description, setDescription] = useState(state?.description || "");
  const [selectedComponent, setSelectedComponent] = useState(
    state?.component || ""
  );
  const [warranty, setWarranty] = useState(state?.warranty || "");
  const [officialPrice, setOfficialPrice] = useState(
    state?.officialPrice || ""
  );
  const [initialPrice, setInitialPrice] = useState(state?.initialPrice || "");
  const fileInputRef = useRef();
  const [openAddComponent, setOpenAddComponent] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [newComponent, setNewComponent] = useState({
    name: "",
    description: "",
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [
      ...prev,
      ...files.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      })),
    ]);
  };

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        stock: 0,
        price: officialPrice || 0,
        initialPrice: initialPrice || 0,
      },
    ]);
  };

  const handleVariantChange = (idx, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === idx
          ? {
              ...v,
              [field]: value,
            }
          : v
      )
    );
  };

  const handleRemoveVariant = (idx) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleViewProduct = () => {
    navigate("/products/view", {
      state: {
        images,
        name,
        description,
        component: selectedComponent,
        warranty,
        officialPrice,
        initialPrice,
        discount,
        variants,
        stock: variants.reduce((sum, v) => sum + (v.stock || 0), 0),
        isEditMode: true,
      },
    });
  };

  const handleOpenAddComponent = () => {
    setOpenAddComponent(true);
    setNewComponent({ name: "", description: "" });
  };

  const handleCloseAddComponent = () => {
    setOpenAddComponent(false);
    setNewComponent({ name: "", description: "" });
  };

  const handleAddComponent = () => {
    if (newComponent.name.trim()) {
      setOpenConfirmDialog(true);
    }
  };

  const handleConfirmAddComponent = () => {
    // Here you would typically make an API call to add the component to the database
    // For now, we'll just close the dialogs
    setOpenConfirmDialog(false);
    setOpenAddComponent(false);
    setNewComponent({ name: "", description: "" });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1400px", mx: "auto", mt: 3, px: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/products")}
        sx={{ mb: 2 }}
        variant="outlined"
      >
        Return
      </Button>
      
      <Typography variant="h6" fontWeight={700} mb={2}>
        {isEditMode ? "Edit Product" : "Product Upload"}
      </Typography>

      <Grid
        container
        spacing={4}
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {/* Left side - Media and Published */}
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            width: { md: "300px" },
            flexShrink: 0,
            display: "flex",
            justifyContent: { md: "flex-start" },
          }}
        >
          <Box
            sx={{
              width: "300px",
              position: "sticky",
              top: "20px",
              p: 2,
              border: "2px solid #2196f3",
              borderRadius: 2,
              bgcolor: "#fafbfc",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              mb={2}
              color="#000"
            >
              Media and Published
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                width: "100%",
              }}
            >
              {images.map((img, idx) => (
                <Box key={idx} position="relative">
                  <Avatar
                    src={img.url}
                    variant="square"
                    sx={{
                      width: "100%",
                      height: 80,
                      borderRadius: 1,
                      aspectRatio: "1",
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "#fff",
                      boxShadow: 1,
                      p: 0.5,
                      "&:hover": {
                        bgcolor: "#fff",
                      },
                    }}
                    onClick={() => handleRemoveImage(idx)}
                  >
                    <CloseIcon fontSize="small" color="error" />
                  </IconButton>
                </Box>
              ))}
              <Box
                sx={{
                  width: "100%",
                  height: 80,
                  border: "2px dashed #bdbdbd",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bgcolor: "#ededed",
                  position: "relative",
                  aspectRatio: "1",
                }}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ color: "#000", textAlign: "center", px: 1 }}
                >
                  Upload Image
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right side - Form fields */}
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            flex: 1,
            minWidth: 0, // Prevents flex item from overflowing
            width: "100%",
          }}
        >
          <Stack spacing={2} sx={{ width: "100%" }}>
        <TextField
          label="Product Name"
          required
          fullWidth
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Description"
          multiline
          minRows={3}
          fullWidth
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            label="Component"
            select
            required
            fullWidth
            size="small"
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>Select a component</em>
                </MenuItem>
                {componentData.components.map((comp) => (
                  <MenuItem key={comp.id} value={comp.id}>
                    <Box>
                      <Typography variant="body2">{comp.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {comp.category} - {comp.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
          </TextField>
          <TextField
            label="Warranty"
            select
            fullWidth
            size="small"
            defaultValue=""
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="warranty1">Warranty 1</MenuItem>
            <MenuItem value="warranty2">Warranty 2</MenuItem>
          </TextField>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="flex-end">
              <Box sx={{ flex: 1 }}>
                <Button
                  variant="outlined"
            fullWidth
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddComponent}
                  sx={{ justifyContent: "flex-start" }}
                >
                  Add a new Component
                </Button>
              </Box>

          <TextField
            label="Discount"
            select
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 100 }}
          >
            {[...Array(21)].map((_, i) => (
              <MenuItem key={i * 5} value={i * 5}>
                {i * 5}%
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Box>
          <Typography variant="body2" fontWeight={500} mb={0.5}>
            Variation
          </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ width: 240 }}
              onClick={handleAddVariant}
            >
              Add Variant
            </Button>
            {variants.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                (Add multiple variants as needed)
              </Typography>
            )}
          </Stack>
              <Stack spacing={2}>
            {variants.map((variant, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                <TextField
                          label={`Variant ${idx + 1} Name`}
                          value={variant.name}
                          onChange={(e) =>
                            handleVariantChange(idx, "name", e.target.value)
                          }
                  size="small"
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveVariant(idx)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
                      <Stack direction="row" spacing={2}>
                        <TextField
                          label="Price"
                          type="number"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(
                              idx,
                              "price",
                              Number(e.target.value)
                            )
                          }
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <Typography sx={{ mr: 1 }}>₱</Typography>
                            ),
                          }}
                        />
          </Stack>
                      <Box>
                        <Typography variant="body2" fontWeight={500} mb={0.5}>
                          Stock <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleVariantChange(
                                idx,
                                "stock",
                                Math.max(0, variant.stock - 1)
                              )
                            }
                            sx={{ border: "1px solid #ccc", borderRadius: 1 }}
                          >
                            -
                          </IconButton>
                          <TextField
                            value={variant.stock}
                            onChange={(e) =>
                              handleVariantChange(
                                idx,
                                "stock",
                                Math.max(0, Number(e.target.value) || 0)
                              )
                            }
                            type="number"
                            size="small"
                            sx={{ width: 60, mx: 1 }}
                            inputProps={{
                              min: 0,
                              style: { textAlign: "center" },
                            }}
                />
                <IconButton
                  size="small"
                            onClick={() =>
                              handleVariantChange(
                                idx,
                                "stock",
                                variant.stock + 1
                              )
                            }
                            sx={{ border: "1px solid #ccc", borderRadius: 1 }}
                          >
                            +
                </IconButton>
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            pcs.
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
              </Box>
            ))}
              </Stack>
            </Box>

        <Divider sx={{ my: 2 }} />
        <Button
          variant="contained"
          color="primary"
              sx={{ mb: 4, mt: 4, width: "100%", mx: "auto", display: "block" }}
          onClick={handleViewProduct}
        >
          {isEditMode ? "Preview Changes" : "View Product"}
        </Button>
      </Stack>
        </Grid>
      </Grid>

      {/* Add Component Dialog */}
      <Dialog
        open={openAddComponent}
        onClose={handleCloseAddComponent}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Component</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Add a Component
            </Typography>
            <TextField
              label="Component Name"
              fullWidth
              required
              value={newComponent.name}
              onChange={(e) =>
                setNewComponent((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter component name"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newComponent.description}
              onChange={(e) =>
                setNewComponent((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter component description"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseAddComponent} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddComponent}
            variant="contained"
            disabled={!newComponent.name.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirm New Component</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to add this new component?
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2">Component Details:</Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {newComponent.name}
            </Typography>
            {newComponent.description && (
              <Typography variant="body2">
                <strong>Description:</strong> {newComponent.description}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenConfirmDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAddComponent}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductCreate;
