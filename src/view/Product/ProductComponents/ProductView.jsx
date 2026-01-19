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
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import PersonIcon from "@mui/icons-material/Person";
import { ProductService } from "../../../services/ProductService";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLogService from "../../../services/AdminLogService";

const ProductView = () => {
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
      // Try to parse directly first (in case it's already a valid date string)
      let editDate = new Date(lastEdit);
      
      // If direct parsing fails, try manual parsing
      if (isNaN(editDate.getTime())) {
        // Handle format: "10/9/2025, 11:23:42 AM" (with comma)
        const cleanedLastEdit = lastEdit.replace(',', '').trim();
        
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
      
      // Validate the parsed date
      if (isNaN(editDate.getTime())) {
        console.error("Failed to parse date:", lastEdit);
        return null;
      }
      
      const now = new Date();
      
      const diffMs = now - editDate;
      
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
      
      if (state.id) {
        // If there's an ID, it's an existing product - UPDATE
        // Preserve existing SKU for updates
        productData.sku = state.sku;
        result = await ProductService.updateProduct(state.id, productData);
        
        // Create detailed activity log for update (matches ProductCreate.jsx)
        if (result.success && user?.id) {
          const changes = [];
          const detailedChanges = {};
          
          // Use originalData if available (from Preview workflow), otherwise use state
          const originalProduct = state.originalData || state;
          
          // Compare basic text fields
          if (name.trim() !== originalProduct.name?.trim()) {
            changes.push('name');
            detailedChanges.name = { old: originalProduct.name, new: name };
          }
          
          if (description.trim() !== originalProduct.description?.trim()) {
            changes.push('description');
            detailedChanges.description = { 
              old: originalProduct.description?.substring(0, 50), 
              new: description?.substring(0, 50) 
            };
          }
          
          if (warranty?.trim() !== originalProduct.warranty?.trim()) {
            changes.push('warranty');
            detailedChanges.warranty = { old: originalProduct.warranty, new: warranty };
          }
          
          // Compare brand
          if (originalProduct.brand_id && originalProduct.brand_id !== productData.brand_id) {
            changes.push('brand');
            detailedChanges.brand = { old: originalProduct.brand_id, new: productData.brand_id };
          }
          
          // Compare prices
          const oldMetadata = originalProduct.metadata || {};
          const oldPrice = parseFloat(originalProduct.officialPrice || oldMetadata.officialPrice) || 0;
          const newPrice = parseFloat(officialPrice) || 0;
          if (oldPrice !== newPrice) {
            changes.push('price');
            detailedChanges.price = { old: oldPrice, new: newPrice };
          }
          
          const oldInitialPrice = parseFloat(originalProduct.initialPrice || oldMetadata.initialPrice) || 0;
          const newInitialPrice = parseFloat(initialPrice) || 0;
          if (oldInitialPrice !== newInitialPrice) {
            changes.push('initialPrice');
            detailedChanges.initialPrice = { old: oldInitialPrice, new: newInitialPrice };
          }
          
          const oldDiscount = parseFloat(originalProduct.discount || oldMetadata.discount) || 0;
          const newDiscount = parseFloat(discount) || 0;
          if (oldDiscount !== newDiscount) {
            changes.push('discount');
            detailedChanges.discount = { old: oldDiscount, new: newDiscount };
          }
          
          // Smart image comparison
          const oldImages = (originalProduct.images || [])
            .map(img => typeof img === 'string' ? img : img.url)
            .filter(Boolean)
            .sort();
          const newImages = (uploadedImageUrls || [])
            .filter(Boolean)
            .sort();
          
          const imagesAdded = newImages.filter(img => !oldImages.includes(img));
          const imagesRemoved = oldImages.filter(img => !newImages.includes(img));
          
          if (imagesAdded.length > 0 || imagesRemoved.length > 0) {
            changes.push('images');
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
          
          // Enhanced variant comparison with detailed tracking
          const oldVariants = originalProduct.variants || [];
          const newVariants = variants || [];
          
          const variantCountChanged = oldVariants.length !== newVariants.length;
          
          // Track added variants (by index or name)
          const variantsAdded = [];
          const variantsRemoved = [];
          const variantsModified = [];
          const variantModifications = [];
          
          // Match variants by position (index) first, then by name as fallback
          const maxLength = Math.max(oldVariants.length, newVariants.length);
          const matchedIndices = new Set();
          
          // First pass: Match by index position
          for (let i = 0; i < Math.min(oldVariants.length, newVariants.length); i++) {
            const oldVar = oldVariants[i];
            const newVar = newVariants[i];
            
            const modifications = [];
            
            // Check if name changed
            if (oldVar.name !== newVar.name) {
              modifications.push(`name: "${oldVar.name}" → "${newVar.name}"`);
            }
            
            // Check if price changed
            const oldPrice = parseFloat(oldVar.price) || 0;
            const newPrice = parseFloat(newVar.price) || 0;
            if (oldPrice !== newPrice) {
              modifications.push(`price: ₱${oldPrice} → ₱${newPrice}`);
            }
            
            // Check if stock changed
            const oldStock = parseInt(oldVar.stock) || 0;
            const newStock = parseInt(newVar.stock) || 0;
            if (oldStock !== newStock) {
              modifications.push(`stock: ${oldStock} → ${newStock}`);
            }
            
            // If any modifications detected, track them
            if (modifications.length > 0) {
              variantsModified.push(newVar);
              variantModifications.push({
                position: i + 1,
                oldName: oldVar.name,
                newName: newVar.name,
                changes: modifications.join(', ')
              });
            }
            
            matchedIndices.add(i);
          }
          
          // Track added variants (new variants beyond old count)
          if (newVariants.length > oldVariants.length) {
            for (let i = oldVariants.length; i < newVariants.length; i++) {
              variantsAdded.push({
                name: newVariants[i].name,
                price: newVariants[i].price,
                stock: newVariants[i].stock,
                position: i + 1
              });
            }
          }
          
          // Track removed variants (old variants beyond new count)
          if (oldVariants.length > newVariants.length) {
            for (let i = newVariants.length; i < oldVariants.length; i++) {
              variantsRemoved.push({
                name: oldVariants[i].name,
                price: oldVariants[i].price,
                stock: oldVariants[i].stock,
                position: i + 1
              });
            }
          }
          
          if (variantCountChanged || variantsAdded.length > 0 || 
              variantsRemoved.length > 0 || variantsModified.length > 0) {
            changes.push('variants');
            detailedChanges.variants = {
              oldCount: oldVariants.length,
              newCount: newVariants.length,
              added: variantsAdded.length,
              removed: variantsRemoved.length,
              modified: variantsModified.length,
              addedDetails: variantsAdded.map(v => 
                `${v.name} (₱${v.price}, stock: ${v.stock})`
              ),
              removedDetails: variantsRemoved.map(v => 
                `${v.name} (₱${v.price}, stock: ${v.stock})`
              ),
              modifiedDetails: variantModifications
            };
          }
          
          // Compare components
          const oldComponents = (originalProduct.components || originalProduct.selectedComponents || originalProduct.selected_components || []);
          const newComponents = actualComponents;
          
          const oldCompIds = oldComponents.map(c => c.id).sort();
          const newCompIds = newComponents.map(c => c.id).sort();
          
          if (JSON.stringify(oldCompIds) !== JSON.stringify(newCompIds)) {
            changes.push('components');
            const addedCompIds = newCompIds.filter(id => !oldCompIds.includes(id));
            const removedCompIds = oldCompIds.filter(id => !newCompIds.includes(id));
            
            detailedChanges.components = {
              oldCount: oldComponents.length,
              newCount: newComponents.length,
              added: addedCompIds.length,
              removed: removedCompIds.length,
              addedNames: newComponents
                .filter(c => addedCompIds.includes(c.id))
                .map(c => c.name || 'Unknown'),
              removedNames: oldComponents
                .filter(c => removedCompIds.includes(c.id))
                .map(c => c.name || 'Unknown')
            };
          }
          
          // Compare specifications
          const oldSpecs = originalProduct.specifications || {};
          const newSpecs = specifications || {};
          const oldSpecKeys = Object.keys(oldSpecs).sort();
          const newSpecKeys = Object.keys(newSpecs).sort();
          
          if (JSON.stringify(oldSpecKeys) !== JSON.stringify(newSpecKeys) ||
              !oldSpecKeys.every(key => 
                JSON.stringify(oldSpecs[key]) === JSON.stringify(newSpecs[key])
              )) {
            changes.push('specifications');
            detailedChanges.specifications = {
              fieldsChanged: newSpecKeys.filter(key => 
                JSON.stringify(oldSpecs[key]) !== JSON.stringify(newSpecs[key])
              ).length
            };
          }
          
          // Stock comparison
          const oldStock = originalProduct.stock || oldVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
          const newStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          if (oldStock !== newStock) {
            changes.push('stock');
            detailedChanges.stock = { old: oldStock, new: newStock };
          }
          
          // Only create log if there are actual changes
          if (changes.length > 0) {
            const changesText = ` (changed: ${changes.join(', ')})`;
            
            await AdminLogService.createLog({
              userId: user.id,
              actionType: 'product_update',
              actionDescription: `Updated product: ${name}${changesText}`,
              targetType: 'product',
              targetId: state.id,
              metadata: {
                productName: name,
                sku: productData.sku,
                changes: changes,
                detailedChanges: detailedChanges,
              },
            });
          }
        }
      } else {
        // No ID means new product - CREATE
        // Generate new SKU for new products
        productData.sku = `${name.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`;
        result = await ProductService.createProduct(productData);
        
        // Create activity log for new product (ProductService already logs this)
        // No additional logging needed here to avoid duplication
      }

      if (result.success) {
        const successMsg = state.id 
          ? 'Product updated and published successfully!'
          : 'Product created and published successfully!';
        
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
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              {officialPrice && initialPrice && officialPrice !== initialPrice ? "Discounted Price" : "Price"}
            </Typography>
            <Typography
              variant="h4"
              color="success.main"
              fontWeight={700}
            >
              ₱{priceRange.min.toLocaleString()} - ₱
              {priceRange.max.toLocaleString()}
            </Typography>
            
            {/* Original Price and Discount Badge */}
            {officialPrice && initialPrice && initialPrice > officialPrice && (
              <Box mt={1}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  Original: ₱{initialPrice.toLocaleString()}
                </Typography>
                <Chip
                  label={`${discount}% OFF`}
                  color="error"
                  size="small"
                  sx={{ mt: 0.5, fontWeight: 600 }}
                />
              </Box>
            )}
          </Box>

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
            let componentSpecs = specifications[component.id];
            
            // If no specs found by ID, try by category or name as fallback
            if (!componentSpecs || Object.keys(componentSpecs).length === 0) {
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
                  break;
                }
              }
            }
            
            if (!componentSpecs || Object.keys(componentSpecs).length === 0) {
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
            bgcolor: "#00E676",
            color: "#000",
            "&:hover": {
              bgcolor: "#00C853",
            },
          }}
        >
          {isPublishing ? "Publishing..." : (isEditMode ? "Update Product" : "Publish Product")}
        </Button>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: "black" }}>
          {isEditMode ? 'Confirm Update' : 'Confirm Publish'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {isEditMode 
              ? 'Are you sure you want to update this product? Changes will be saved to the database.'
              : 'Are you sure you want to publish this product? Once published, it will be visible to customers.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPublish}
            variant="contained"
            disabled={isPublishing}
            sx={{
              bgcolor: "#00E676",
              color: "#000",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "#00C853",
              },
            }}
          >
            {isPublishing ? "Publishing..." : "Confirm"}
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
