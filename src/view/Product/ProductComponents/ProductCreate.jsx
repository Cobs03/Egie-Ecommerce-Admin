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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";

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
  const [component, setComponent] = useState(state?.component || "");
  const [warranty, setWarranty] = useState(state?.warranty || "");
  const [officialPrice, setOfficialPrice] = useState(
    state?.officialPrice || ""
  );
  const [initialPrice, setInitialPrice] = useState(state?.initialPrice || "");
  const fileInputRef = useRef();

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
    setVariants((prev) => [...prev, ""]);
  };

  const handleVariantChange = (idx, value) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? value : v)));
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
        component,
        warranty,
        officialPrice,
        initialPrice,
        discount,
        variants,
        stock,
      },
    });
  };

  return (
    <Box maxWidth={600} mx="auto" mt={3}>
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
      <Stack spacing={2}>
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
            defaultValue=""
            value={component}
            onChange={(e) => setComponent(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="component1">Component 1</MenuItem>
            <MenuItem value="component2">Component 2</MenuItem>
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
          <TextField
            label="Official Price"
            required
            fullWidth
            size="small"
            value={officialPrice}
            onChange={(e) => setOfficialPrice(e.target.value)}
          />
          <TextField
            label="Initial Price"
            fullWidth
            size="small"
            value={initialPrice}
            onChange={(e) => setInitialPrice(e.target.value)}
          />
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
            Product Stock <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box display="flex" alignItems="center">
            <IconButton
              size="small"
              onClick={() => setStock((s) => Math.max(0, s - 1))}
              sx={{ border: "1px solid #ccc", borderRadius: 1 }}
            >
              -
            </IconButton>
            <TextField
              value={stock}
              onChange={(e) =>
                setStock(Math.max(0, Number(e.target.value) || 0))
              }
              type="number"
              size="small"
              sx={{ width: 60, mx: 1 }}
              inputProps={{ min: 0, style: { textAlign: "center" } }}
            />
            <IconButton
              size="small"
              onClick={() => setStock((s) => s + 1)}
              sx={{ border: "1px solid #ccc", borderRadius: 1 }}
            >
              +
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              pcs.
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={500} mb={0.5}>
            Variation
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
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
          <Stack spacing={1} mt={1}>
            {variants.map((variant, idx) => (
              <Box key={idx} display="flex" alignItems="center">
                <TextField
                  label={`Variant ${idx + 1}`}
                  value={variant}
                  onChange={(e) => handleVariantChange(idx, e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveVariant(idx)}
                  sx={{ ml: 1 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>
        <Box
          mt={2}
          p={2}
          border={"2px solid #2196f3"}
          borderRadius={2}
          bgcolor="#fafbfc"
        >
          <Typography variant="subtitle1" fontWeight={700} mb={2} color="#000">
            Media and Published
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {images.map((img, idx) => (
              <Box key={idx} position="relative">
                <Avatar
                  src={img.url}
                  variant="square"
                  sx={{ width: 80, height: 60, borderRadius: 1 }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    bgcolor: "#fff",
                    boxShadow: 1,
                  }}
                  onClick={() => handleRemoveImage(idx)}
                >
                  <CloseIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
            ))}
            <Box
              sx={{
                width: 80,
                height: 60,
                border: "2px dashed #bdbdbd",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                bgcolor: "#ededed",
                position: "relative",
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
                sx={{ color: "#000" }}
              >
                Upload Image
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 4, width: 200, mx: "auto", display: "block" }}
          onClick={handleViewProduct}
        >
          {isEditMode ? "Preview Changes" : "View Product"}
        </Button>
      </Stack>
    </Box>
  );
};

export default ProductCreate;
