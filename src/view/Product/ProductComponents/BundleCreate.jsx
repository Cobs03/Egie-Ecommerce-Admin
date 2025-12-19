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
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductService } from "../../../services/ProductService";
import { BundleService } from "../../../services/BundleService";
import { StorageService } from "../../../services/StorageService";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLogService from "../../../services/AdminLogService";

const formatPrice = (price) => {
  if (typeof price !== "number") return "0.00";
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const BundleCreate = () => {
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const isEditMode = state?.bundleId ? true : false;

  // Initialize state with bundle data if in edit mode
  const [images, setImages] = useState(state?.images || []);
  const [products, setProducts] = useState(state?.products || []);
  const [bundleName, setBundleName] = useState(state?.bundleName || "");
  const [description, setDescription] = useState(state?.description || "");
  const [warranty, setWarranty] = useState(state?.warranty || "");
  const [officialPrice, setOfficialPrice] = useState(
    state?.officialPrice || ""
  );
  const [initialPrice, setInitialPrice] = useState(state?.initialPrice || 0);
  const [discount, setDiscount] = useState(state?.discount || 0);
  const fileInputRef = useRef();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Error handling states
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Dynamic product loading states
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const result = await ProductService.getAllProducts();
        if (result.success) {
          // Transform products for the bundle selector
          const transformedProducts = result.data.map((product) => ({
            id: product.id,
            name: product.name,
            code: product.sku || product.id,
            price: parseFloat(product.price),
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            category: product.metadata?.category || 'General',
            stock: product.stock_quantity,
          }));
          setAvailableProducts(transformedProducts);
        } else {
          setErrorMessage("Failed to load products from database");
          setShowError(true);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setErrorMessage("Error loading products: " + error.message);
        setShowError(true);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Calculate initial price from products
  useEffect(() => {
    const totalPrice = products.reduce((sum, product) => {
      return sum + (Number(product.price) || 0);
    }, 0);
    setInitialPrice(totalPrice);
  }, [products]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [
      ...prev,
      ...files.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      })),
    ]);
    // Clear image error if exists
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: false }));
    }
  };

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveProduct = (idx) => {
    setProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle discount input change with validation
  const handleDiscountChange = (e) => {
    const value = e.target.value;

    // Allow empty string for clearing
    if (value === "") {
      setDiscount(0);
      return;
    }

    // Parse the value as a number
    const numValue = parseFloat(value);

    // Validate: must be a number between 0 and 100
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setDiscount(numValue);
    }
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

  // Validate form before viewing bundle
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate bundle name
    if (!bundleName.trim()) {
      newErrors.bundleName = true;
      isValid = false;
      setErrorMessage("Bundle name is required");
    }

    // Validate description
    else if (!description.trim()) {
      newErrors.description = true;
      isValid = false;
      setErrorMessage("Bundle description is required");
    }

    // Validate images
    else if (images.length === 0) {
      newErrors.images = true;
      isValid = false;
      setErrorMessage("At least one image is required");
    }

    // Validate products
    else if (products.length === 0) {
      newErrors.products = true;
      isValid = false;
      setErrorMessage("At least one product must be added");
    }

    // Validate warranty
    else if (!warranty) {
      newErrors.warranty = true;
      isValid = false;
      setErrorMessage("Please select a warranty option");
    }

    // Validate initial price (should be auto-calculated)
    else if (initialPrice <= 0) {
      newErrors.initialPrice = true;
      isValid = false;
      setErrorMessage("Initial price must be greater than 0");
    }

    setErrors(newErrors);

    if (!isValid) {
      setShowError(true);
    }

    return isValid;
  };

  const handleSaveBundle = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }

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

      // Prepare bundle data with correct field names matching your schema
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
      if (isEditMode && state?.bundleId) {
        // Update existing bundle
        result = await BundleService.updateBundle(state.bundleId, bundleData);
        
        // Create activity log for update
        if (result.success && user?.id) {
          // Build description of changes with detailed tracking
          const changes = [];
          const detailedChanges = {};
          
          // Track text field changes
          if (bundleName?.trim() !== state.bundleName?.trim()) {
            changes.push('name');
            detailedChanges.name = { old: state.bundleName, new: bundleName };
          }
          
          if (description?.trim() !== state.description?.trim()) {
            changes.push('description');
            detailedChanges.description = { 
              old: state.description?.substring(0, 50), 
              new: description?.substring(0, 50) 
            };
          }
          
          if (warranty?.trim() !== state.warranty?.trim()) {
            changes.push('warranty');
            detailedChanges.warranty = { old: state.warranty, new: warranty };
          }
          
          // Track price changes (use parseFloat and handle undefined/null)
          const oldOfficialPrice = parseFloat(state.officialPrice) || 0;
          const newOfficialPrice = parseFloat(officialPrice) || 0;
          if (oldOfficialPrice !== newOfficialPrice) {
            changes.push('price');
            detailedChanges.price = { 
              old: oldOfficialPrice, 
              new: newOfficialPrice 
            };
          }
          
          const oldInitialPrice = parseFloat(state.originalPrice || state.initialPrice) || 0;
          const newInitialPrice = parseFloat(initialPrice) || 0;
          if (oldInitialPrice !== newInitialPrice) {
            changes.push('originalPrice');
            detailedChanges.originalPrice = { 
              old: oldInitialPrice, 
              new: newInitialPrice 
            };
          }
          
          // Fix: Handle discount properly - use state.discount directly, default to 0
          const oldDiscount = parseFloat(state.discount) || 0;
          const newDiscount = parseFloat(discount) || 0;
          if (oldDiscount !== newDiscount) {
            changes.push('discount');
            detailedChanges.discount = { 
              old: oldDiscount, 
              new: newDiscount 
            };
          }
          
          // Smart image comparison - normalize and sort URLs
          const oldImages = (state.images || [])
            .map(img => typeof img === 'string' ? img : img.url)
            .filter(Boolean)
            .sort();
          const newImages = (allImageUrls || [])
            .filter(Boolean)
            .sort();
          
          // Calculate actual differences
          const imagesAdded = newImages.filter(img => !oldImages.includes(img));
          const imagesRemoved = oldImages.filter(img => !newImages.includes(img));
          
          if (imagesAdded.length > 0 || imagesRemoved.length > 0) {
            changes.push('images');
            
            // Extract filenames for better readability
            const getFilename = (url) => {
              try {
                return url.split('/').pop().split('?')[0];
              } catch {
                return 'unknown';
              }
            };
            
            detailedChanges.images = { 
              oldCount: oldImages.length, 
              newCount: newImages.length,
              added: imagesAdded.length,
              removed: imagesRemoved.length,
              addedFiles: imagesAdded.map(getFilename),
              removedFiles: imagesRemoved.map(getFilename)
            };
          }
          
          // Enhanced product comparison with detailed tracking
          const oldProducts = state.products || [];
          const newProducts = products || [];
          
          console.log("🔍 Comparing bundle products:");
          console.log("  Old products:", oldProducts);
          console.log("  New products:", newProducts);
          
          // Normalize product IDs - handle both id and product_id fields
          const oldProductIds = oldProducts
            .map(p => String(p.id || p.product_id))
            .filter(Boolean)
            .sort();
          const newProductIds = newProducts
            .map(p => String(p.id || p.product_id))
            .filter(Boolean)
            .sort();
          
          const productsAddedIds = newProductIds.filter(id => !oldProductIds.includes(id));
          const productsRemovedIds = oldProductIds.filter(id => !newProductIds.includes(id));
          
          console.log("🔍 Product analysis:");
          console.log("  Added IDs:", productsAddedIds);
          console.log("  Removed IDs:", productsRemovedIds);
          
          if (productsAddedIds.length > 0 || productsRemovedIds.length > 0) {
            changes.push('products');
            
            // Get full product details for better logging
            const addedProducts = newProducts
              .filter(p => productsAddedIds.includes(String(p.id || p.product_id)))
              .map(p => ({
                name: p.name || p.product_name || 'Unknown',
                price: p.price || p.product_price || 0,
                code: p.code || p.product_code || 'N/A'
              }));
            
            const removedProducts = oldProducts
              .filter(p => productsRemovedIds.includes(String(p.id || p.product_id)))
              .map(p => ({
                name: p.name || p.product_name || 'Unknown',
                price: p.price || p.product_price || 0,
                code: p.code || p.product_code || 'N/A'
              }));
            
            detailedChanges.products = {
              oldCount: oldProductIds.length,
              newCount: newProductIds.length,
              added: productsAddedIds.length,
              removed: productsRemovedIds.length,
              addedDetails: addedProducts.map(p => 
                `${p.name} (${p.code}, ₱${p.price})`
              ),
              removedDetails: removedProducts.map(p => 
                `${p.name} (${p.code}, ₱${p.price})`
              )
            };
          }
          
          // CRITICAL FIX: Only create log if there are actual changes
          if (changes.length > 0) {
            const changesText = ` (changed: ${changes.join(', ')})`;
            
            await AdminLogService.createLog({
              userId: user.id,
              actionType: 'bundle_update',
              actionDescription: `Updated bundle: ${bundleName}${changesText}`,
              targetType: 'bundle',
              targetId: state.bundleId,
              metadata: {
                bundleName: bundleName,
                price: officialPrice,
                changes: changes,
                detailedChanges: detailedChanges,
              },
            });
          }
        }
      } else {
        // Create new bundle
        result = await BundleService.createBundle(bundleData);
        
        // Create activity log for creation
        if (result.success && user?.id) {
          await AdminLogService.createLog({
            userId: user.id,
            actionType: 'bundle_create',
            actionDescription: `Created bundle: ${bundleName}`,
            targetType: 'bundle',
            targetId: result.data?.id,
            metadata: {
              bundleName: bundleName,
              price: officialPrice,
              productCount: products.length,
            },
          });
        }
      }

      if (result.success) {
        setSuccessMessage(isEditMode ? "Bundle updated successfully!" : "Bundle created successfully!");
        setShowSuccess(true);
        
        // Navigate back to products page after a short delay
        setTimeout(() => {
          navigate("/products", { state: { tab: 1 } }); // Tab 1 for Bundles
        }, 2000);
      } else {
        setErrorMessage(result.error?.message || "Failed to save bundle");
        setShowError(true);
      }
    } catch (error) {
      console.error('Error saving bundle:', error);
      setErrorMessage("Error saving bundle: " + error.message);
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleViewBundle = () => {
    // Validate form before navigating
    if (!validateForm()) {
      return;
    }

    // If validation passes, navigate to view
    navigate("/bundles/view", {
      state: {
        bundleId: isEditMode ? state?.bundleId : null, // Pass bundleId if editing
        images,
        bundleName,
        description,
        warranty,
        officialPrice,
        initialPrice,
        discount,
        products,
        isEditMode: isEditMode,
      },
    });
  };

  const handleCloseError = () => {
    setShowError(false);
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
        {isEditMode ? "Edit Bundle" : "Bundle Upload"}
      </Typography>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
          {successMessage}
        </Alert>
      </Snackbar>

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
              border: errors.images ? "2px solid #f44336" : "2px solid #2196f3",
              borderRadius: 2,
              bgcolor: "#fafbfc",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              mb={2}
              color={errors.images ? "error" : "#000"}
            >
              Media and Published {errors.images && "*"}
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
                  border: errors.images
                    ? "2px dashed #f44336"
                    : "2px dashed #bdbdbd",
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
                  color={errors.images ? "error" : "text.secondary"}
                  sx={{ textAlign: "center", px: 1 }}
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
            minWidth: 0,
          }}
        >
          <Stack spacing={2}>
            <TextField
              label="Bundle Name"
              required
              fullWidth
              size="small"
              value={bundleName}
              onChange={(e) => {
                setBundleName(e.target.value);
                if (errors.bundleName) {
                  setErrors((prev) => ({ ...prev, bundleName: false }));
                }
              }}
              error={errors.bundleName}
              helperText={errors.bundleName ? "Bundle name is required" : ""}
            />
            <TextField
              label="Bundle Description"
              multiline
              minRows={3}
              fullWidth
              size="small"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: false }));
                }
              }}
              error={errors.description}
              helperText={
                errors.description ? "Bundle description is required" : ""
              }
            />

            {/* Products Section - Moved before pricing */}
            <Box>
              <Typography
                variant="body2"
                fontWeight={500}
                mb={0.5}
                color={errors.products ? "error" : "text.primary"}
              >
                Products {errors.products && "*"}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  width: 240,
                  mb: 1,
                  borderColor: errors.products ? "#f44336" : undefined,
                  color: errors.products ? "#f44336" : undefined,
                  "&:hover": {
                    borderColor: errors.products ? "#d32f2f" : undefined,
                  },
                }}
                onClick={() => {
                  setProductDialogOpen(true);
                  if (errors.products) {
                    setErrors((prev) => ({ ...prev, products: false }));
                  }
                }}
              >
                Add Products
              </Button>
              {errors.products && (
                <Typography variant="caption" color="error" display="block" mb={1}>
                  At least one product must be added
                </Typography>
              )}
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

            {/* Pricing Section */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <TextField
                label="Initial Price (Auto-calculated from products)"
                fullWidth
                size="small"
                value={
                  initialPrice
                    ? `₱${Number(initialPrice).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "₱0.00"
                }
                disabled
                InputProps={{
                  readOnly: true,
                }}
                helperText={
                  products.length === 0
                    ? "Add products to calculate initial price"
                    : `Sum of ${products.length} product(s)`
                }
                error={errors.initialPrice}
              />

              {/* Discount - Now Typable */}
              <TextField
                label="Discount"
                type="number"
                value={discount}
                onChange={handleDiscountChange}
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                  inputProps: {
                    min: 0,
                    max: 100,
                    step: 0.1,
                  },
                }}
                helperText="Enter discount (0-100)"
                onBlur={(e) => {
                  // Ensure value is within range on blur
                  const value = parseFloat(e.target.value);
                  if (isNaN(value) || value < 0) {
                    setDiscount(0);
                  } else if (value > 100) {
                    setDiscount(100);
                  }
                }}
              />
            </Box>

            <TextField
              label="Official Price (After Discount)"
              fullWidth
              size="small"
              value={
                officialPrice
                  ? `₱${Number(officialPrice).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "₱0.00"
              }
              disabled
              InputProps={{
                readOnly: true,
              }}
              helperText={
                discount > 0
                  ? `${discount}% discount applied (₱${(
                      (initialPrice * discount) /
                      100
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} off)`
                  : "Enter a discount to see the official price"
              }
            />

            <TextField
              label="Warranty"
              select
              fullWidth
              size="small"
              value={warranty}
              onChange={(e) => {
                setWarranty(e.target.value);
                if (errors.warranty) {
                  setErrors((prev) => ({ ...prev, warranty: false }));
                }
              }}
              error={errors.warranty}
              helperText={errors.warranty ? "Please select a warranty option" : ""}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="1 Year Warranty">1 Year Warranty</MenuItem>
              <MenuItem value="2 Year Warranty">2 Year Warranty</MenuItem>
              <MenuItem value="3 Year Warranty">3 Year Warranty</MenuItem>
            </TextField>

            <Divider sx={{ my: 2 }} />
            
            {/* Action Buttons */}
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ width: "100%" }}
                onClick={handleSaveBundle}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                    Saving...
                  </>
                ) : (
                  isEditMode ? "Update Bundle" : "Create Bundle"
                )}
              </Button>
              <Button
                variant="outlined"
                sx={{ width: "100%" }}
                onClick={handleViewBundle}
              >
                Preview Bundle
              </Button>
            </Stack>
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
            mt: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "black" }}>
          Select Products
          {loadingProducts && (
            <CircularProgress size={20} sx={{ ml: 2 }} />
          )}
        </DialogTitle>
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
              disabled={loadingProducts}
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
            {loadingProducts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : availableProducts.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <Typography variant="body2" color="text.secondary">
                  No products found. Please add products first.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                  {availableProducts
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
                  .map((product) => {
                    // Check if product is already added by comparing both id and code
                    // This handles cases where bundle products might use product_id differently
                    const isAlreadyAdded = products.some(
                      (p) => {
                        const pId = String(p.id || p.product_id || '');
                        const productId = String(product.id || '');
                        const pCode = String(p.code || '');
                        const productCode = String(product.code || '');
                        
                        return (pId === productId) || (pCode && productCode && pCode === productCode);
                      }
                    );

                    return (
                      <Button
                        key={product.id}
                        variant={isAlreadyAdded ? "contained" : "outlined"}
                        disabled={isAlreadyAdded}
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
                          setSearchTerm("");
                        }}
                        sx={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          p: 1,
                          height: "auto",
                          "&:hover": {
                            backgroundColor: isAlreadyAdded
                              ? undefined
                              : "rgba(25, 118, 210, 0.04)",
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
                              {isAlreadyAdded && " (Already Added)"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.code} - {product.category} - ₱
                              {formatPrice(product.price)}
                              {product.stock !== undefined && ` (Stock: ${product.stock})`}
                            </Typography>
                          </Box>
                        </Box>
                      </Button>
                    );
                  })}
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #e0e0e0", p: 2 }}>
          <Button onClick={() => setProductDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BundleCreate;
