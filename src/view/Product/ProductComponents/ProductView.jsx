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
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import PersonIcon from "@mui/icons-material/Person";
import { ProductService } from "../../../services/ProductService";
import { supabase } from "../../../lib/supabase";

const ProductView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Debug logging
  console.log("🔍 ProductView received state:", state);

  if (!state) return <Typography>No product data.</Typography>;

  const {
    images = [],
    name = "",
    description = "",
    components = [], // This will be mapped from selectedComponents in the transform
    selectedComponents = [], // Add this as backup
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

  // Use selectedComponents if components is empty (fallback)
  const actualComponents = components.length > 0 ? components : selectedComponents;

  // Debug destructured values
  console.log("🔍 Destructured values:", {
    images,
    name,
    description,
    components,
    selectedComponents,
    actualComponents,
    specifications,
    warranty,
    variants,
    officialPrice
  });

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
      console.log("Parsing lastEdit:", lastEdit); // Debug log
      
      // Try to parse directly first (in case it's already a valid date string)
      let editDate = new Date(lastEdit);
      
      // If direct parsing fails, try manual parsing
      if (isNaN(editDate.getTime())) {
        // Handle format: "10/9/2025, 11:23:42 AM" (with comma)
        const cleanedLastEdit = lastEdit.replace(',', '').trim();
        console.log("Cleaned lastEdit:", cleanedLastEdit); // Debug log
        
        const parts = cleanedLastEdit.split(" ");
        if (parts.length < 3) {
          console.error("Invalid lastEdit format:", lastEdit);
          return null;
        }
        
        const datePart = parts[0]; // "10/9/2025"
        const timePart = parts[1]; // "11:23:42"
        const meridiem = parts[2]; // "AM" or "PM"
        
        const [month, day, year] = datePart.split("/");
        const timeComponents = timePart.split(":");
        let hours = parseInt(timeComponents[0]);
        const minutes = parseInt(timeComponents[1]);
        const seconds = timeComponents[2] ? parseInt(timeComponents[2]) : 0;

        // Convert to 24-hour format
        if (meridiem === "PM" && hours !== 12) {
          hours += 12;
        } else if (meridiem === "AM" && hours === 12) {
          hours = 0;
        }

        editDate = new Date(
          parseInt(year),
          parseInt(month) - 1, // Month is 0-indexed
          parseInt(day),
          hours,
          minutes,
          seconds
        );
      }
      
      console.log("Parsed editDate:", editDate); // Debug log
      
      // Validate the parsed date
      if (isNaN(editDate.getTime())) {
        console.error("Failed to parse date:", lastEdit);
        return null;
      }
      
      const now = new Date();
      console.log("Current time:", now); // Debug log
      
      const diffMs = now - editDate;
      console.log("Difference in ms:", diffMs); // Debug log
      
      // Ensure positive difference (in case of clock issues)
      const absDiffMs = Math.abs(diffMs);
      
      const diffMinutes = Math.floor(absDiffMs / (1000 * 60));
      const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;

      const result = {
        totalHours: diffHours,
        totalMinutes: diffMinutes,
        days: diffDays,
        hours: remainingHours,
      };
      
      console.log("Time calculation result:", result); // Debug log
      
      return result;
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

  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    try {
      console.log("Publishing product:", state);

      // Helper function to upload images to Supabase Storage
      const uploadImages = async (imageFiles) => {
        const uploadedUrls = [];
        
        if (!imageFiles || imageFiles.length === 0) {
          return uploadedUrls;
        }
        
        for (let i = 0; i < imageFiles.length; i++) {
          const image = imageFiles[i];
          
          // Skip if no file (only URL) - preserve existing URLs
          if (!image.file && image.url && !image.url.startsWith('blob:')) {
            uploadedUrls.push(image.url);
            continue;
          }

          if (image.file) {
            try {
              // Generate unique filename
              const fileExt = image.file.name.split('.').pop();
              const fileName = `${Date.now()}-${i}.${fileExt}`;
              const filePath = `products/${fileName}`;

              // Upload to Supabase Storage
              const { data, error } = await supabase.storage
                .from('products')
                .upload(filePath, image.file, {
                  cacheControl: '3600',
                  upsert: false
                });

              if (error) {
                console.error('Error uploading image:', error);
                continue;
              }

              // Get public URL
              const { data: urlData } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

              uploadedUrls.push(urlData.publicUrl);
            } catch (error) {
              console.error('Error processing image:', error);
            }
          }
        }
        
        return uploadedUrls;
      };

      // Upload images first
      const uploadedImageUrls = await uploadImages(images);

      // Prepare product data for database
      const productData = {
        name: name.trim(),
        description: description.trim(),
        warranty: warranty,
        brand_id: state.brand_id || null,
        price: variants.length > 0 ? variants[0].price : 0,
        stock_quantity: variants.reduce((sum, v) => sum + (v.stock || 0), 0),
        images: uploadedImageUrls,
        selected_components: actualComponents,
        specifications: specifications,
        variants: variants,
        metadata: {
          officialPrice,
          initialPrice,
          discount,
          category: actualComponents.length > 0 ? actualComponents[0].category : 'General'
        },
        status: 'active'
      };

      // Save or update product
      let result;
      console.log("🔍 Publish decision logic:");
      console.log("🔍 isEditMode:", isEditMode);
      console.log("🔍 state.id:", state.id);
      console.log("🔍 state:", state);
      
      if (state.id) {
        // If there's an ID, it's an existing product - UPDATE
        console.log("🔄 Updating existing product with ID:", state.id);
        // Preserve existing SKU for updates
        productData.sku = state.sku;
        result = await ProductService.updateProduct(state.id, productData);
      } else {
        // No ID means new product - CREATE
        console.log("🔄 Creating new product");
        // Generate new SKU for new products
        productData.sku = `${name.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`;
        result = await ProductService.createProduct(productData);
      }

      if (result.success) {
        const successMsg = state.id 
          ? 'Product updated and published successfully!'
          : 'Product created and published successfully!';
        
        console.log("✅ Success:", successMsg);
        setSuccessMessage(successMsg);
        setShowSuccess(true);
        
        // Navigate back to products list after short delay
        setTimeout(() => {
          navigate("/products");
        }, 1500);
      } else {
        const errorMsg = state.id 
          ? `Failed to update product: ${result.error}`
          : `Failed to create product: ${result.error}`;
        console.error("❌ Error:", errorMsg);
        alert(errorMsg);
      }

    } catch (error) {
      console.error('Error publishing product:', error);
      alert('Error publishing product: ' + error.message);
    } finally {
      setIsPublishing(false);
      handleCloseDialog();
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
                  {timeSinceEdit.totalMinutes < 60
                    ? `${timeSinceEdit.totalMinutes}m ago`
                    : timeSinceEdit.days > 0
                    ? `${timeSinceEdit.days}d ${timeSinceEdit.hours}h ago`
                    : `${timeSinceEdit.hours}h ago`}
                </Typography>
              </Box>
            )}

            {/* Total Hours */}
            {timeSinceEdit && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: "white" }} />
                <Typography variant="body2" sx={{ color: "white" }}>
                  <strong>Total Hours:</strong>{" "}
                  {timeSinceEdit.totalHours >= 24
                    ? `${timeSinceEdit.days}d ${timeSinceEdit.hours}h`
                    : timeSinceEdit.totalHours < 1
                    ? `${timeSinceEdit.totalMinutes}m`
                    : `${timeSinceEdit.totalHours}h`}
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
          {actualComponents.length > 0 && (
            <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={1}>
              {actualComponents.map((comp, idx) => (
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

        {actualComponents.length > 0 &&
          actualComponents.map((component) => {
            console.log("Processing component:", component); // Debug log
            console.log("Component ID:", component.id); // Debug log
            console.log("All specifications:", specifications); // Debug log
            
            let componentSpecs = specifications[component.id];
            
            // If no specs found by ID, try by category or name as fallback
            if (!componentSpecs || Object.keys(componentSpecs).length === 0) {
              console.log("No specs found by ID, trying fallbacks..."); // Debug log
              
              // Try different keys as fallback
              const possibleKeys = [
                component.category?.toLowerCase(),
                component.name?.toLowerCase(),
                component.id?.toLowerCase(),
                component.code?.toLowerCase()
              ].filter(Boolean);
              
              for (const key of possibleKeys) {
                if (specifications[key] && Object.keys(specifications[key]).length > 0) {
                  componentSpecs = specifications[key];
                  console.log("Found specs using key:", key, componentSpecs); // Debug log
                  break;
                }
              }
            }
            
            console.log("Final component specs for", component.id, ":", componentSpecs); // Debug log
            
            if (!componentSpecs || Object.keys(componentSpecs).length === 0) {
              console.log("No specs found for component:", component.id); // Debug log
              return (
                <Box key={component.id} mb={3}>
                  <Typography variant="body1" fontWeight={700} mb={1.5}>
                    Component: {component.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No specifications available for this component.
                  </Typography>
                </Box>
              );
            }

            return (
              <Box key={component.id} mb={3}>
                <Typography variant="body1" fontWeight={700} mb={1.5}>
                  Component: {component.name}
                </Typography>
                <Stack spacing={0.5}>
                  {Object.entries(componentSpecs).map(([key, value]) => (
                    <Box key={key}>
                      {key === 'specifications' ? (
                        // Special layout for specifications - label above content
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 'bold', mb: 0.5 }}
                          >
                            {formatSpecLabel(key)}:
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: 'pre-wrap' }}
                          >
                            {value || "-"}
                          </Typography>
                        </>
                      ) : (
                        // Normal inline layout for other fields
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          <strong>{formatSpecLabel(key)}:</strong> {value || "-"}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })}

        {/* Fallback: Show all specifications if no components match */}
        {actualComponents.length === 0 && Object.keys(specifications).length > 0 && (
          <Box mb={3}>
            <Typography variant="body1" fontWeight={700} mb={1.5}>
              Product Specifications
            </Typography>
            <Stack spacing={0.5}>
              {Object.entries(specifications).map(([key, value]) => {
                if (typeof value === 'object') {
                  // If value is an object (component specs), display it
                  return Object.entries(value).map(([subKey, subValue]) => (
                    <Box key={`${key}-${subKey}`}>
                      {subKey === 'specifications' ? (
                        // Special layout for specifications - label above content
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 'bold', mb: 0.5 }}
                          >
                            {formatSpecLabel(subKey)}:
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: 'pre-wrap' }}
                          >
                            {subValue || "-"}
                          </Typography>
                        </>
                      ) : (
                        // Normal inline layout for other fields
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          <strong>{formatSpecLabel(subKey)}:</strong> {subValue || "-"}
                        </Typography>
                      )}
                    </Box>
                  ));
                } else {
                  // If value is a simple value
                  return (
                    <Box key={key}>
                      {key === 'specifications' ? (
                        // Special layout for specifications - label above content
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 'bold', mb: 0.5 }}
                          >
                            {formatSpecLabel(key)}:
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: 'pre-wrap' }}
                          >
                            {value || "-"}
                          </Typography>
                        </>
                      ) : (
                        // Normal inline layout for other fields
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          <strong>{formatSpecLabel(key)}:</strong> {value || "-"}
                        </Typography>
                      )}
                    </Box>
                  );
                }
              })}
            </Stack>
          </Box>
        )}

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
      {/* Show publish button for both edit mode and new products from preview */}
      {(isEditMode || !state.id) && (
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleOpenDialog}
          disabled={isPublishing}
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
          {isPublishing ? "Publishing..." : "Publish"}
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
            disabled={isPublishing}
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={1500}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductView;
