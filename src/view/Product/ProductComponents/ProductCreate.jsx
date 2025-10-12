import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductService } from "../../../services/ProductService";
import { CategoryService } from "../../../services/CategoryService";
import { supabase } from "../../../lib/supabase";

// Import separated components
import MediaUpload from "./ProductCreate Components/MediaUpload";
import ComponentsSlider from "./ProductCreate Components/ComponentsSlider";
import ProductBasicInfo from "./ProductCreate Components/ProductBasicInfo";
import ComponentSpecifications from "./ProductCreate Components/ComponentSpecifications";
import VariantManager from "./ProductCreate Components/VariantManager";
import AddComponentDialog from "./ProductCreate Components/AddComponentDialog";
import ConfirmDialog from "./ProductCreate Components/ConfirmDialog";

const ProductCreate = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const isEditMode = state !== null;

  // Debug: Log the state to see what's being passed
  console.log("🔍 ProductCreate state:", state);
  console.log("🔍 Is edit mode:", isEditMode);
  console.log("🔍 State images:", state?.images);
  console.log("🔍 State name:", state?.name);

  // Dynamic categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Initialize state with product data if in edit mode
  const [images, setImages] = useState(state?.images || []);
  const [variants, setVariants] = useState(state?.variants || []);
  const [stock, setStock] = useState(state?.stock || 0);
  const [discount, setDiscount] = useState(state?.discount || 0);
  const [name, setName] = useState(state?.name || "");
  const [description, setDescription] = useState(state?.description || "");
  const [warranty, setWarranty] = useState(state?.warranty || "");
  const [brandId, setBrandId] = useState(state?.brand_id || "");
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

  // Validation error state
  const [validationError, setValidationError] = useState("");
  const [showError, setShowError] = useState(false);

  // Snackbar state for success/error messages
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Component specifications state
  const [specifications, setSpecifications] = useState(
    state?.specifications || {}
  );

  // Get category assignments for the product (replaces component details from componentData.json)
  const [selectedComponents, setSelectedComponents] = useState(() => {
    console.log("🔍 Edit mode initialization - state:", state);
    console.log("🔍 State selected_components:", state?.selected_components);
    console.log("🔍 State selectedComponents:", state?.selectedComponents);
    
    if (isEditMode && state?.selected_components) {
      // Handle both array and single component cases
      let components = [];
      
      if (Array.isArray(state.selected_components)) {
        components = state.selected_components;
      } else if (typeof state.selected_components === 'object') {
        components = [state.selected_components];
      }
      
      console.log("🔍 Components to set:", components);
      return components;
    }
    
    return [];
  });

  // Function to load categories (reusable)
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const result = await CategoryService.getCategories();
      
      if (result.success) {
        console.log("🎯 Loaded dynamic categories:", result.data);
        setCategories(result.data);
      } else {
        console.error("❌ Failed to load categories:", result.error);
      }
    } catch (error) {
      console.error("❌ Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load dynamic categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Track the last auto-formatted description to avoid overwriting manual edits was moved to state section above

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

  // Validate form before viewing product
  const validateForm = () => {
    // Check if product name is filled
    if (!name.trim()) {
      setValidationError("Product name is required");
      setShowError(true);
      return false;
    }

    // Check if at least one image is uploaded
    if (images.length === 0) {
      setValidationError("At least one product image is required");
      setShowError(true);
      return false;
    }

    // Check if a component is selected
    if (selectedComponents.length === 0) {
      setValidationError("Please select a component");
      setShowError(true);
      return false;
    }

    // Check if component specifications are filled
    for (const component of selectedComponents) {
      const componentSpecs = specifications[component.id];
      
      if (!componentSpecs || Object.keys(componentSpecs).length === 0) {
        setValidationError(
          `Please fill in specifications for ${component.name}`
        );
        setShowError(true);
        return false;
      }

      // Check if all specification fields have values
      const hasEmptyFields = Object.values(componentSpecs).some(
        (value) => !value || value.toString().trim() === ""
      );

      if (hasEmptyFields) {
        setValidationError(
          `Please complete all specification fields for ${component.name}`
        );
        setShowError(true);
        return false;
      }
    }

    // Check if description is filled
    if (!description.trim()) {
      setValidationError("Product description is required");
      setShowError(true);
      return false;
    }

    // Check if warranty is selected
    if (!warranty) {
      setValidationError("Please select a warranty option");
      setShowError(true);
      return false;
    }

    // Check if at least one variant is added and filled
    if (variants.length === 0) {
      setValidationError("At least one product variant is required");
      setShowError(true);
      return false;
    }

    // Check if all variants have required fields
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      
      if (!variant.name.trim()) {
        setValidationError(`Variant ${i + 1}: Name is required`);
        setShowError(true);
        return false;
      }

      // Fixed: Check if price exists and is greater than 0
      if (variant.price === undefined || variant.price === null || variant.price <= 0) {
        setValidationError(`Variant ${i + 1}: Valid price (greater than 0) is required`);
        setShowError(true);
        return false;
      }

      // Fixed: Check if stock exists and is not negative (0 is valid)
      if (variant.stock === undefined || variant.stock === null || variant.stock < 0) {
        setValidationError(`Variant ${i + 1}: Valid stock (0 or more) is required`);
        setShowError(true);
        return false;
      }
    }

    return true;
  };

  // Function to upload images to Supabase Storage
  const uploadImages = async (imageFiles) => {
    console.log("🔄 Starting image upload process...");
    console.log("Images to upload:", imageFiles);
    
    // Quick bucket check
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      console.log("Available buckets:", buckets?.map(b => b.name));
      if (bucketError) console.error("Bucket check error:", bucketError);
    } catch (e) {
      console.error("Error checking buckets:", e);
    }
    
    const uploadedUrls = [];
    
    if (!imageFiles || imageFiles.length === 0) {
      console.log("No images to upload");
      return uploadedUrls;
    }
    
    for (let i = 0; i < imageFiles.length; i++) {
      const image = imageFiles[i];
      console.log(`Processing image ${i + 1}:`, image);
      
      // Skip if no file (only URL)
      if (!image.file) {
        console.log("Skipping image - no file object");
        if (image.url && !image.url.startsWith('blob:')) {
          uploadedUrls.push(image.url);
          console.log("Added existing URL:", image.url);
        }
        continue;
      }

      try {
        console.log("🔄 Uploading file:", image.file.name);
        
        // Generate unique filename
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${Date.now()}-${i}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        console.log("Upload path:", filePath);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, image.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('❌ Error uploading image:', error);
          console.error('Error details:', {
            message: error.message,
            statusCode: error.statusCode,
            error: error.error
          });
          // Continue with other images
          continue;
        }

        console.log("✅ Upload successful:", data);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        console.log("📄 Public URL:", urlData.publicUrl);
        uploadedUrls.push(urlData.publicUrl);
        
      } catch (error) {
        console.error('💥 Error processing image:', error);
        // Continue with other images
      }
    }
    
    console.log("🎯 Final uploaded URLs:", uploadedUrls);
    return uploadedUrls;
  };

  const handleSaveProduct = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      console.log("🚀 Starting product save process...");
      console.log("Images before upload:", images);
      
      // First, upload images to get permanent URLs
      setSuccessMessage('Uploading images...');
      setShowSuccess(true);
      
      const uploadedImageUrls = await uploadImages(images);
      console.log("📸 Uploaded image URLs:", uploadedImageUrls);
      
      // Prepare product data for database (matches fresh schema exactly)
      const productData = {
        name: name.trim(),
        description: description.trim(),
        warranty: warranty,
        brand_id: brandId || null,
        price: variants.length > 0 ? variants[0].price : 0, // Use first variant price as base price
        stock_quantity: variants.reduce((sum, v) => sum + (v.stock || 0), 0), // Total stock
        images: uploadedImageUrls, // Direct array of image URLs
        selected_components: selectedComponents, // From ComponentsSlider (use correct field name)
        specifications: specifications, // From ComponentSpecifications
        variants: variants, // From VariantManager
        metadata: {
          officialPrice,
          initialPrice,
          discount,
          category: selectedComponents.length > 0 ? selectedComponents[0].category : 'General'
        },
        status: 'active'
      };

      // For edit mode, don't regenerate SKU - keep existing one
      if (isEditMode && state?.sku) {
        productData.sku = state.sku;
      } else {
        productData.sku = `${name.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`;
      }

      console.log("🔄 Product data prepared:", productData);
      console.log("🔄 Is edit mode:", isEditMode);
      console.log("🔄 Product ID:", state?.id);

      // Save product using ProductService - check if edit or create
      let result;
      if (isEditMode && state?.id) {
        console.log("🔄 Updating existing product with ID:", state.id);
        result = await ProductService.updateProduct(state.id, productData);
      } else {
        console.log("🔄 Creating new product");
        result = await ProductService.createProduct(productData);
      }

      if (result.success) {
        const successMsg = isEditMode && state?.id 
          ? 'Product updated successfully!'
          : 'Product saved successfully! It will now appear in the e-commerce app.';
        setSuccessMessage(successMsg);
        setShowSuccess(true);
        
        // Navigate back to products list after short delay
        setTimeout(() => {
          navigate('/products');
        }, 1500);
      } else {
        const errorMsg = isEditMode && state?.id 
          ? `Failed to update product: ${result.error}`
          : `Failed to save product: ${result.error}`;
        setValidationError(errorMsg);
        setShowError(true);
      }
    } catch (error) {
      setValidationError(`Error saving product: ${error.message}`);
      setShowError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewProduct = () => {
    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    // If validation passes, navigate to view
    navigate("/products/view", {
      state: {
        id: state?.id, // Include the product ID for edit mode
        sku: state?.sku, // Include the SKU for edit mode
        images,
        name,
        description,
        brand_id: brandId,
        components: selectedComponents,
        specifications,
        warranty,
        officialPrice,
        initialPrice,
        discount,
        variants,
        stock: variants.reduce((sum, v) => sum + (v.stock || 0), 0),
        isEditMode: isEditMode,
      },
    });
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
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

  const handleConfirmAddComponent = async () => {
    try {
      // Create category in database using CategoryService
      const slug = newComponent.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const categoryData = {
        name: newComponent.name,
        slug: slug,
        description: newComponent.description,
        is_active: true,
        display_order: categories.length + 1
      };

      const result = await CategoryService.createCategory(categoryData);
      
      if (result.success) {
        // Refresh categories list
        await loadCategories();
        
        // Add to selected components (use the real category from database)
        const newCategory = result.data;
        setSelectedComponents((prev) => [...prev, newCategory]);
        
        // Show success message
        setSnackbarMessage(`Category "${newComponent.name}" added successfully!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        // Show error message
        setSnackbarMessage(`Failed to add category: ${result.error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setSnackbarMessage(`Error adding category: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }

    // Close dialogs
    setOpenConfirmDialog(false);
    setOpenAddComponent(false);
    setNewComponent({ name: "", description: "" });
  };

  const handleRemoveComponent = (componentId) => {
    setSelectedComponents((prev) => prev.filter((c) => c.id !== componentId));
    // Also remove specifications for this component
    setSpecifications((prev) => {
      const newSpecs = { ...prev };
      delete newSpecs[componentId];
      return newSpecs;
    });
  };

  // Handle selecting a component from the slider (single selection)
  const handleSelectComponent = (component) => {
    const isAlreadySelected = selectedComponents.some(
      (c) => c.id === component.id
    );

    if (isAlreadySelected) {
      // If clicking the same component, deselect it
      setSelectedComponents([]);
    } else {
      // Replace with only the new component (single selection)
      setSelectedComponents([component]);
    }
  };

  // Handle specification changes
  const handleSpecificationChange = (componentId, field, value) => {
    setSpecifications((prev) => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        [field]: value,
      },
    }));
  };

  // Handle component edit
  const handleEditComponent = (componentId, updatedData) => {
    // Update in selectedComponents
    setSelectedComponents((prev) =>
      prev.map((comp) =>
        comp.id === componentId
          ? { ...comp, name: updatedData.name, description: updatedData.description }
          : comp
      )
    );

    console.log("Component edited:", componentId, updatedData);
  };

  // Handle component delete
  const handleDeleteComponent = (componentId) => {
    // Remove from selected components
    setSelectedComponents((prev) => prev.filter((c) => c.id !== componentId));
    
    // Remove specifications for this component
    setSpecifications((prev) => {
      const newSpecs = { ...prev };
      delete newSpecs[componentId];
      return newSpecs;
    });

    console.log("Component deleted:", componentId);
  };

  // Handle product selection from autocomplete
  const handleProductSelect = (product) => {
    // Only populate the product name
    setName(product.name);
    
    // Load product images if available
    if (product.image) {
      setImages([{ url: product.image }]);
    }

    // Load component and specifications if exists
    if (product.component) {
      const component = componentData.components.find(
        (comp) => comp.id === product.component || comp.code === product.component
      );
      if (component) {
        setSelectedComponents([component]);
        
        // Load specifications if available
        if (product.specifications && product.specifications[product.component]) {
          setSpecifications({
            [product.component]: product.specifications[product.component]
          });
        }
      }
    }

    // Load variants if exists
    if (product.variants && Array.isArray(product.variants)) {
      setVariants(
        product.variants.map((variantName) => ({
          name: variantName,
          stock: 0,
          price: product.price || 0,
          initialPrice: product.initialPrice || 0,
        }))
      );
    }
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

      {/* Temporary Debug: Show category loading status */}
      {loadingCategories && (
        <Alert severity="info" sx={{ mb: 2 }}>
          🔄 Loading dynamic categories...
        </Alert>
      )}
      {!loadingCategories && categories.length > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Loaded {categories.length} dynamic categories: {categories.map(c => c.name).join(', ')}
        </Alert>
      )}

      {/* Validation Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {validationError}
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
            display: "flex",
            justifyContent: { md: "flex-start" },
          }}
        >
          <MediaUpload
            images={images}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            fileInputRef={fileInputRef}
          />
        </Grid>

        {/* Right side - Form fields */}
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",
          }}
        >
          {/* Components Slider */}
          <ComponentsSlider
            selectedComponents={selectedComponents}
            categories={categories}
            loadingCategories={loadingCategories}
            onAddComponent={handleOpenAddComponent}
            onRemoveComponent={handleRemoveComponent}
            onSelectComponent={handleSelectComponent}
            onEditComponent={handleEditComponent}
            onDeleteComponent={handleDeleteComponent}
          />

          <Stack spacing={2} sx={{ width: "75%" }}>
            {/* Product Basic Info */}
            <ProductBasicInfo
              name={name}
              description={description}
              warranty={warranty}
              brandId={brandId}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onWarrantyChange={setWarranty}
              onBrandChange={setBrandId}
            />

            {/* Component Specifications */}
            <ComponentSpecifications
              selectedComponents={selectedComponents}
              specifications={specifications}
              onSpecificationChange={handleSpecificationChange}
            />

            {/* Variant Manager */}
            <VariantManager
              variants={variants}
              onAddVariant={handleAddVariant}
              onVariantChange={handleVariantChange}
              onRemoveVariant={handleRemoveVariant}
            />

            <Divider sx={{ my: 2 }} />
            
            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 4, mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveProduct}
                disabled={isSaving}
                sx={{ flex: 1 }}
              >
                {isSaving ? "Saving..." : "Save Product"}
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleViewProduct}
                disabled={isSaving}
                sx={{ flex: 1 }}
              >
                {isEditMode ? "Preview Changes" : "Preview Product"}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {/* Success Message Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Category Add/Update Message Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Add Component Dialog */}
      <AddComponentDialog
        open={openAddComponent}
        onClose={handleCloseAddComponent}
        component={newComponent}
        categories={categories}
        loadingCategories={loadingCategories}
        onComponentChange={setNewComponent}
        onAdd={handleAddComponent}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleConfirmAddComponent}
        component={newComponent}
      />
    </Box>
  );
};

export default ProductCreate;
