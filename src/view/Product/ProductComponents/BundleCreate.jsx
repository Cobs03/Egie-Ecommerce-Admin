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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import productData from "../Data/ProductData.json";

const formatPrice = (price) => {
  if (typeof price !== "number") return "0.00";
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const BundleCreate = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const isEditMode = state !== null;

  // Initialize state with bundle data if in edit mode
  const [images, setImages] = useState(state?.images || []);
  const [products, setProducts] = useState(state?.products || []);
  const [bundleName, setBundleName] = useState(state?.bundleName || "");
  const [description, setDescription] = useState(state?.description || "");
  const [warranty, setWarranty] = useState(state?.warranty || "");
  const [officialPrice, setOfficialPrice] = useState(
    state?.officialPrice || ""
  );
  const [initialPrice, setInitialPrice] = useState(state?.initialPrice || "");
  const [discount, setDiscount] = useState(state?.discount || 0);
  const fileInputRef = useRef();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleAddProduct = () => {
    setProducts((prev) => [...prev, ""]);
  };

  const handleProductChange = (idx, value) => {
    setProducts((prev) => prev.map((p, i) => (i === idx ? value : p)));
  };

  const handleRemoveProduct = (idx) => {
    setProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleViewBundle = () => {
    navigate("/bundles/view", {
      state: {
        images,
        bundleName,
        description,
        warranty,
        officialPrice,
        initialPrice,
        discount,
        products,
        isEditMode: true,
      },
    });
  };

  // Calculate official price based on initial price and discount
  const calculateOfficialPrice = (initial, discountPercent) => {
    if (!initial || isNaN(initial)) return "";
    const initialNum = Number(initial);
    const discountNum = Number(discountPercent);
    const discountAmount = (initialNum * discountNum) / 100;
    return (initialNum - discountAmount).toFixed(2);
  };

  // Update official price whenever initial price or discount changes
  useEffect(() => {
    const calculatedPrice = calculateOfficialPrice(initialPrice, discount);
    setOfficialPrice(calculatedPrice);
  }, [initialPrice, discount]);

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
        {isEditMode ? "Edit Bundle" : "Bundle Upload"}
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
          }}
        >
          <Stack spacing={2}>
            <TextField
              label="Bundle Name"
              required
              fullWidth
              size="small"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
            />
            <TextField
              label="Bundle Description"
              multiline
              minRows={3}
              fullWidth
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Stack direction="row" spacing={2} alignItems="flex-end">
              <TextField
                label="Initial Price"
                required
                fullWidth
                size="small"
                type="number"
                value={initialPrice}
                onChange={(e) => setInitialPrice(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₱</Typography>,
                }}
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
            <TextField
              label="Official Price"
              fullWidth
              size="small"
              value={
                officialPrice
                  ? `₱${Number(officialPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : ""
              }
              disabled
              InputProps={{
                readOnly: true,
              }}
            />
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
            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.5}>
                Products
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ width: 240, mb: 1 }}
                onClick={() => setProductDialogOpen(true)}
              >
                Add Products
              </Button>
              <Stack spacing={1} mt={1}>
                {products.map((product, idx) => (
                  <Box key={idx} display="flex" alignItems="center">
                    <Avatar
                      src={product.image}
                      alt={product.name}
                      sx={{ mr: 1, width: 32, height: 32 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.code} - ₱{formatPrice(product.price)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveProduct(idx)}
                      sx={{ ml: 1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3, width: "100%" }}
              onClick={handleViewBundle}
            >
              {isEditMode ? "Preview Changes" : "View Bundle"}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Product Selection Dialog */}
      <Dialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: "80vh",
            display: "flex",
            flexDirection: "column",
            mt:1
          },
        }}
      >
        <DialogTitle sx={{color:"black"}}>Select Products</DialogTitle>
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <TextField
              autoFocus
              label="Search Products"
              type="text"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              px: 2,
              py: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#bdbdbd",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "#9e9e9e",
              },
            }}
          >
            <Stack spacing={1}>
              {productData.products
                .filter(
                  (product) =>
                    product.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    product.code
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    product.category
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((product) => (
                  <Button
                    key={product.id}
                    variant="outlined"
                    onClick={() => {
                      setProducts((prev) => [
                        ...prev,
                        {
                          id: product.id,
                          name: product.name,
                          code: product.code,
                          price: Number(product.price),
                          image: product.image,
                          category: product.category,
                        },
                      ]);
                      setProductDialogOpen(false);
                      setSearchTerm(""); // reset search on close
                    }}
                    sx={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      p: 1,
                      height: "auto",
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" width="100%">
                      <Avatar
                        src={product.image}
                        alt={product.name}
                        sx={{ mr: 1, width: 40, height: 40 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.code} - {product.category} - ₱
                          {formatPrice(product.price)}
                        </Typography>
                      </Box>
                    </Box>
                  </Button>
                ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #e0e0e0", p: 2 }}>
          <Button onClick={() => setProductDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BundleCreate;
