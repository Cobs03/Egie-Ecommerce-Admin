import React, { useRef, useState } from "react";
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
import { useLocation, useNavigate } from "react-router-dom";
import componentData from "../Data/ComponentData.json";

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

  // Initialize state with product data if in edit mode
  const [images, setImages] = useState(state?.images || []);
  const [variants, setVariants] = useState(state?.variants || []);
  const [stock, setStock] = useState(state?.stock || 0);
  const [discount, setDiscount] = useState(state?.discount || 0);
  const [name, setName] = useState(state?.name || "");
  const [description, setDescription] = useState(state?.description || "");
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

  // Validation error state
  const [validationError, setValidationError] = useState("");
  const [showError, setShowError] = useState(false);

  // Component specifications state
  const [specifications, setSpecifications] = useState(
    state?.specifications || {}
  );

  // Get component details from componentData.json based on product's component property
  const [selectedComponents, setSelectedComponents] = useState(() => {
    if (state?.component) {
      // Find the component in componentData
      const component = componentData.components.find(
        (comp) => comp.id === state.component || comp.code === state.component
      );
      return component ? [component] : [];
    }
    return [];
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

  const handleViewProduct = () => {
    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    // If validation passes, navigate to view
    navigate("/products/view", {
      state: {
        images,
        name,
        description,
        components: selectedComponents,
        specifications,
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

  const handleCloseError = () => {
    setShowError(false);
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
    // Create a new component object with a temporary ID
    const newComp = {
      id: `temp-${Date.now()}`,
      name: newComponent.name,
      description: newComponent.description,
      category: "Custom",
    };

    // Add to selected components
    setSelectedComponents((prev) => [...prev, newComp]);

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
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onWarrantyChange={setWarranty}
              onProductSelect={handleProductSelect}
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
            <Button
              variant="contained"
              color="primary"
              sx={{
                mb: 4,
                mt: 4,
                width: "100%",
                mx: "auto",
                display: "block",
              }}
              onClick={handleViewProduct}
            >
              {isEditMode ? "Preview Changes" : "View Product"}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Add Component Dialog */}
      <AddComponentDialog
        open={openAddComponent}
        onClose={handleCloseAddComponent}
        component={newComponent}
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
