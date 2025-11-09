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
import { StorageService } from "../../../services/StorageService";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLogService from "../../../services/AdminLogService";

// Import separated components
import MediaUpload from "./ProductCreate Components/MediaUpload";
import ComponentsSlider from "./ProductCreate Components/ComponentsSlider";
import ProductBasicInfo from "./ProductCreate Components/ProductBasicInfo";
import ComponentSpecifications from "./ProductCreate Components/ComponentSpecifications";
import VariantManager from "./ProductCreate Components/VariantManager";
import AddComponentDialog from "./ProductCreate Components/AddComponentDialog";
import ConfirmDialog from "./ProductCreate Components/ConfirmDialog";

const ProductCreate = () => {
  const { user } = useAuth();
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
    imageFile: null,
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
    
    if (isEditMode) {
      // Try both field names (selected_components from DB, selectedComponents from transformed data)
      const componentsData = state?.selected_components || state?.selectedComponents;
      
      if (componentsData) {
        // Handle both array and single component cases
        let components = [];
        
        if (Array.isArray(componentsData)) {
          components = componentsData;
        } else if (typeof componentsData === 'object') {
          components = [componentsData];
        }
        
        console.log("🔍 Components to set:", components);
        return components;
      }
    }
    
    return [];
  });

  // Function to load categories (reusable)
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const result = await CategoryService.getCategories();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error("Failed to load categories:", result.error);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load dynamic categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Sync selected components after categories load (for edit mode)
  useEffect(() => {
    console.log("🔍 useEffect triggered - Edit mode check:");
    console.log("  - isEditMode:", isEditMode);
    console.log("  - categories.length:", categories.length);
    console.log("  - state?.selected_components:", state?.selected_components);
    
    // In edit mode, selected_components should already have full category objects
    // from ProductService.getAllProducts() enrichment
    if (isEditMode && state?.selected_components && state.selected_components.length > 0) {
      console.log("✅ Product has selected_components from database");
      console.log("📝 Components:", state.selected_components);
      
      // Check if components are already full objects (have 'name' property)
      const firstComp = state.selected_components[0]
      if (firstComp && firstComp.name) {
        console.log("✨ Components already enriched with full data - using directly!");
        setSelectedComponents(state.selected_components)
      } else if (categories.length > 0) {
        // Fallback: Components only have IDs, need to match with categories
        console.log("🔄 Components need enrichment - matching with loaded categories...");
        
        const componentIds = state.selected_components.map(comp => comp.id || comp)
        const matchedComponents = categories.filter(cat => componentIds.includes(cat.id))
        
        if (matchedComponents.length > 0) {
          console.log("✅ Matched components:", matchedComponents)
          setSelectedComponents(matchedComponents)
        } else {
          console.log("⚠️ No matching components found")
        }
      }
    } else {
      console.log("ℹ️ No components to pre-select (new product or empty components)")
    }
  }, [isEditMode, state, categories]); // Re-run when state or categories change

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

  const handleRemoveVariant = async (idx) => {
    const removedVariant = variants[idx];
    setVariants((prev) => prev.filter((_, i) => i !== idx));

    // If editing an existing product, log the variant removal
    if (product && user?.id) {
      try {
        await AdminLogService.createLog({
          userId: user.id,
          actionType: 'variant_remove',
          actionDescription: `Removed variant "${removedVariant.name}" from product: ${product.name}`,
          targetType: 'product',
          targetId: product.id,
          metadata: {
            productName: product.name,
            variantName: removedVariant.name,
            variantPrice: removedVariant.price,
            variantStock: removedVariant.stock,
          },
        });
      } catch (error) {
        console.error('Error logging variant removal:', error);
      }
    }
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

  // Function to upload images to Supabase Storage using StorageService
  const uploadImages = async (imageFiles) => {
    console.log("🔄 Starting image upload process...");
    console.log("Images to upload:", imageFiles);
    
    const uploadedUrls = [];
    
    if (!imageFiles || imageFiles.length === 0) {
      console.log("No images to upload");
      return uploadedUrls;
    }
    
    // Separate files that need uploading from existing URLs
    const filesToUpload = [];
    const existingUrls = [];
    
    for (const image of imageFiles) {
      if (!image.file) {
        // This is an existing URL (no file object)
        if (image.url && !image.url.startsWith('blob:')) {
          existingUrls.push(image.url);
          console.log("✅ Keeping existing URL:", image.url);
        }
      } else {
        // This is a new file that needs uploading
        filesToUpload.push(image.file);
        console.log("� Will upload file:", image.file.name);
      }
    }
    
    // Add existing URLs to the result
    uploadedUrls.push(...existingUrls);
    
    // Upload new files using StorageService
    if (filesToUpload.length > 0) {
      console.log(`🔄 Uploading ${filesToUpload.length} new files to 'products' bucket...`);
      
      try {
        const uploadResult = await StorageService.uploadMultipleImages(
          filesToUpload, 
          'products', // folder
          'products'  // bucket name
        );
        
        if (uploadResult.success) {
          console.log("✅ All files uploaded successfully!");
          console.log("📸 Uploaded URLs:", uploadResult.data);
          uploadedUrls.push(...uploadResult.data);
        } else {
          console.error("❌ Upload failed:", uploadResult.error);
          throw new Error(`Failed to upload images: ${uploadResult.error}`);
        }
      } catch (error) {
        console.error("💥 Upload exception:", error);
        throw error;
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
        selected_components: selectedComponents.map(comp => ({
          id: comp.id,
          name: comp.name
        })), // Save only id and name (not full category object)
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
      
      console.log("💾 Saving selected_components:", productData.selected_components);

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
        console.log("🔄 Product data being sent:", productData);
        
        // PRE-CHECK: Detect if there are ANY changes before updating
        const preCheckChanges = [];
        
        // Quick pre-check for basic fields
        if (name.trim() !== state.name?.trim()) preCheckChanges.push('name');
        if (description.trim() !== state.description?.trim()) preCheckChanges.push('description');
        if (warranty?.trim() !== state.warranty?.trim()) preCheckChanges.push('warranty');
        if (brandId !== state.brand_id) preCheckChanges.push('brand');
        
        // Pre-check prices
        const oldMetadata = state.metadata || {};
        // Prices can be either at top level (from Inventory transform) or in metadata (from database)
        const oldOfficialPrice = parseFloat(state.officialPrice || oldMetadata.officialPrice) || 0;
        const oldInitialPrice = parseFloat(state.initialPrice || oldMetadata.initialPrice) || 0;
        const oldDiscount = parseFloat(state.discount || oldMetadata.discount) || 0;
        const newOfficialPrice = parseFloat(officialPrice) || 0;
        const newInitialPrice = parseFloat(initialPrice) || 0;
        const newDiscount = parseFloat(discount) || 0;
        
        if (oldOfficialPrice !== newOfficialPrice) preCheckChanges.push('price');
        if (oldInitialPrice !== newInitialPrice) preCheckChanges.push('initialPrice');
        if (oldDiscount !== newDiscount) preCheckChanges.push('discount');
        
        // Pre-check images
        const oldImages = (state.images || []).map(img => typeof img === 'string' ? img : img.url).filter(Boolean).sort();
        const newImages = (uploadedImageUrls || []).filter(Boolean).sort();
        if (JSON.stringify(oldImages) !== JSON.stringify(newImages)) preCheckChanges.push('images');
        
        // Pre-check variants
        const oldVariants = state.variants || [];
        const newVariants = variants || [];
        if (oldVariants.length !== newVariants.length) preCheckChanges.push('variants');
        else if (JSON.stringify(oldVariants) !== JSON.stringify(newVariants)) preCheckChanges.push('variants');
        
        // Pre-check components
        const oldCompIds = (state.selected_components || []).map(c => c.id).sort();
        const newCompIds = selectedComponents.map(c => c.id).sort();
        if (JSON.stringify(oldCompIds) !== JSON.stringify(newCompIds)) preCheckChanges.push('components');
        
        // Pre-check specifications
        const oldSpecs = state.specifications || {};
        const newSpecs = specifications || {};
        if (JSON.stringify(oldSpecs) !== JSON.stringify(newSpecs)) preCheckChanges.push('specifications');
        
        console.log("🔍 PRE-CHECK: Changes detected:", preCheckChanges);
        
        // If NO changes detected, skip the update entirely
        if (preCheckChanges.length === 0) {
          console.log("ℹ️ No changes detected - skipping database update and logging");
          setSuccessMessage("No changes made to the product");
          setShowSuccess(true);
          setIsSaving(false);
          
          // Navigate back after a short delay
          setTimeout(() => {
            try {
              console.log('✅ Navigating to /products (no changes)');
              navigate('/products', { 
                state: { 
                  successMessage: "No changes were made" 
                },
                replace: true
              });
            } catch (navError) {
              console.error('❌ Navigation error:', navError);
              navigate('/products', { replace: true });
            }
          }, 1500);
          
          return; // EXIT EARLY - don't update or log
        }
        
        // Continue with update if changes were detected
        result = await ProductService.updateProduct(state.id, productData);
        console.log("🔄 Update result:", result);
        
        // Create activity log for update
        if (result.success && user?.id) {
          const changes = [];
          const detailedChanges = {};
          
          console.log("🔍 Starting change detection...");
          
          // Compare basic text fields
          if (name.trim() !== state.name?.trim()) {
            console.log("📝 Name changed:", state.name, "→", name);
            changes.push('name');
            detailedChanges.name = { old: state.name, new: name };
          }
          
          if (description.trim() !== state.description?.trim()) {
            console.log("📝 Description changed");
            changes.push('description');
            detailedChanges.description = { 
              old: state.description?.substring(0, 50), 
              new: description?.substring(0, 50) 
            };
          }
          
          if (warranty?.trim() !== state.warranty?.trim()) {
            console.log("📝 Warranty changed:", state.warranty, "→", warranty);
            changes.push('warranty');
            detailedChanges.warranty = { old: state.warranty, new: warranty };
          }
          
          // Compare brand
          if (brandId !== state.brand_id) {
            console.log("📝 Brand changed:", state.brand_id, "→", brandId);
            changes.push('brand');
            detailedChanges.brand = { old: state.brand_id, new: brandId };
          }
          
          // Compare prices from metadata (handle undefined/null properly)
          // Prices can be either at top level (from Inventory transform) or in metadata (from database)
          const oldMetadata = state.metadata || {};
          const oldPrice = parseFloat(state.officialPrice || oldMetadata.officialPrice) || 0;
          const newPrice = parseFloat(officialPrice) || 0;
          if (oldPrice !== newPrice) {
            console.log("📝 Price changed:", oldPrice, "→", newPrice);
            changes.push('price');
            detailedChanges.price = { 
              old: oldPrice, 
              new: newPrice 
            };
          }
          
          const oldInitialPrice = parseFloat(state.initialPrice || oldMetadata.initialPrice) || 0;
          const newInitialPrice = parseFloat(initialPrice) || 0;
          if (oldInitialPrice !== newInitialPrice) {
            console.log("📝 Initial price changed:", oldInitialPrice, "→", newInitialPrice);
            changes.push('initialPrice');
            detailedChanges.initialPrice = { 
              old: oldInitialPrice, 
              new: newInitialPrice 
            };
          }
          
          const oldDiscount = parseFloat(state.discount || oldMetadata.discount) || 0;
          const newDiscount = parseFloat(discount) || 0;
          if (oldDiscount !== newDiscount) {
            console.log("📝 Discount changed:", oldDiscount, "→", newDiscount);
            changes.push('discount');
            detailedChanges.discount = { 
              old: oldDiscount, 
              new: newDiscount 
            };
          }
          
          // Smart image comparison - normalize and sort URLs for accurate comparison
          const oldImages = (state.images || [])
            .map(img => typeof img === 'string' ? img : img.url)
            .filter(Boolean)
            .sort();
          const newImages = (uploadedImageUrls || [])
            .filter(Boolean)
            .sort();
          
          // Only log if there's an actual difference in image URLs
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
          
          // Enhanced variant comparison with detailed tracking
          const oldVariants = state.variants || [];
          const newVariants = variants || [];
          
          console.log("🔍 Comparing variants:");
          console.log("  Old variants:", oldVariants);
          console.log("  New variants:", newVariants);
          
          const variantCountChanged = oldVariants.length !== newVariants.length;
          
          // Track added, removed, and modified variants
          const variantsAdded = [];
          const variantsRemoved = [];
          const variantsModified = [];
          const variantModifications = [];
          
          // Match variants by position (index) first - this handles renames properly
          const maxLength = Math.max(oldVariants.length, newVariants.length);
          
          // First pass: Match by index position to detect modifications including renames
          for (let i = 0; i < Math.min(oldVariants.length, newVariants.length); i++) {
            const oldVar = oldVariants[i];
            const newVar = newVariants[i];
            
            const modifications = [];
            
            // Check if name changed (variant renamed)
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
          
          console.log("🔍 Variant analysis:");
          console.log("  Added:", variantsAdded);
          console.log("  Removed:", variantsRemoved);
          console.log("  Modified:", variantModifications);
          
          // Only log if there's an actual variant change
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
          
          // Compare components/categories
          const oldComponents = (state.selected_components || []);
          const newComponents = selectedComponents;
          
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
          
          // Compare specifications (only if structure changed)
          const oldSpecs = state.specifications || {};
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
          
          // CRITICAL FIX: Only create log if there are actual changes
          console.log("🔍 Total changes detected:", changes.length);
          console.log("🔍 Changes:", changes);
          
          if (changes.length > 0) {
            const changesText = ` (changed: ${changes.join(', ')})`;
            
            console.log("✅ Creating log entry for changes");
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
          } else {
            console.log("ℹ️ No changes detected - skipping log creation");
          }
        }
      } else {
        console.log("🔄 Creating new product");
        result = await ProductService.createProduct(productData);
        
        // Create activity log for creation
        if (result.success && user?.id) {
          await AdminLogService.createLog({
            userId: user.id,
            actionType: 'product_create',
            actionDescription: `Created product: ${name}`,
            targetType: 'product',
            targetId: result.data?.id,
            metadata: {
              productName: name,
              sku: productData.sku,
              price: officialPrice,
              stock: productData.stock_quantity,
            },
          });
        }
      }

      if (result.success) {
        const successMsg = isEditMode && state?.id 
          ? 'Product updated successfully!'
          : 'Product saved successfully! It will now appear in the e-commerce app.';
        setSuccessMessage(successMsg);
        setShowSuccess(true);
        
        // Navigate back to products list after short delay
        setTimeout(() => {
          try {
            console.log('✅ Navigating to /products with state:', {
              reloadProducts: true,
              successMessage: successMsg
            });
            navigate('/products', {
              state: {
                reloadProducts: true,
                successMessage: successMsg
              },
              replace: true // Use replace to avoid back button issues
            });
          } catch (navError) {
            console.error('❌ Navigation error:', navError);
            // Fallback: try navigating without state
            navigate('/products', { replace: true });
          }
        }, 1500);
      } else {
        const errorMsg = isEditMode && state?.id 
          ? `Failed to update product: ${result.error}`
          : `Failed to save product: ${result.error}`;
        setValidationError(errorMsg);
        setShowError(true);
      }
    } catch (error) {
      console.error('❌ Error saving product:', error);
      console.error('Error stack:', error.stack);
      setValidationError(`Error saving product: ${error.message}`);
      setShowError(true);
      
      // Ensure we don't leave the page in a broken state
      setIsSaving(false);
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
        
        // ✅ CRITICAL FIX: Pass original data for change detection
        // This allows ProductView to compare old vs new values
        originalData: isEditMode && state ? {
          name: state.name,
          description: state.description,
          warranty: state.warranty,
          brand_id: state.brand_id,
          officialPrice: state.officialPrice,
          initialPrice: state.initialPrice,
          discount: state.discount,
          images: state.images,
          variants: state.variants,
          selected_components: state.selected_components || state.selectedComponents,
          specifications: state.specifications,
          stock: state.stock,
          metadata: state.metadata,
        } : null,
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
    setNewComponent({ name: "", description: "", imageFile: null });
  };

  const handleCloseAddComponent = () => {
    setOpenAddComponent(false);
    setNewComponent({ name: "", description: "", imageFile: null });
  };

  const handleAddComponent = () => {
    if (newComponent.name.trim()) {
      setOpenConfirmDialog(true);
    }
  };

  const handleConfirmAddComponent = async () => {
    try {
      // Upload image first if provided
      let imageUrl = '';
      if (newComponent.imageFile) {
        const uploadResult = await CategoryService.uploadCategoryImage(
          newComponent.imageFile, 
          newComponent.name
        );
        
        if (uploadResult.success) {
          imageUrl = uploadResult.data;
        } else {
          console.warn('Image upload failed:', uploadResult.error);
          // Continue without image
        }
      }

      // Create category in database using CategoryService
      const slug = newComponent.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const categoryData = {
        name: newComponent.name,
        slug: slug,
        description: newComponent.description,
        image_url: imageUrl || null,
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
    setNewComponent({ name: "", description: "", imageFile: null });
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

  // Handle component edit (updates category in database)
  const handleEditComponent = async (componentId, updatedData) => {
    try {
      // Find the current category to get its current image_url
      const currentCategory = categories.find(cat => cat.id === componentId);
      let imageUrl = currentCategory?.image_url || '';

      // Handle image upload if a new image was provided
      if (updatedData.imageFile) {
        const uploadResult = await CategoryService.uploadCategoryImage(
          updatedData.imageFile,
          updatedData.name
        );

        if (uploadResult.success) {
          imageUrl = uploadResult.data;

          // Delete old image if it exists and is different from the new one
          if (currentCategory?.image_url && currentCategory.image_url !== imageUrl) {
            await CategoryService.deleteCategoryImage(currentCategory.image_url);
          }
        } else {
          setErrorMessage(`Failed to upload image: ${uploadResult.error}`);
          setShowError(true);
          return;
        }
      } else if (updatedData.removeImage) {
        // Remove image if requested
        if (currentCategory?.image_url) {
          await CategoryService.deleteCategoryImage(currentCategory.image_url);
        }
        imageUrl = null;
      }

      // Update in database
      const result = await CategoryService.updateCategory(componentId, {
        name: updatedData.name,
        description: updatedData.description,
        image_url: imageUrl
      });

      if (result.success) {
        // Update in local categories list
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === componentId
              ? { 
                  ...cat, 
                  name: updatedData.name, 
                  description: updatedData.description,
                  image_url: imageUrl 
                }
              : cat
          )
        );

        // Update in selectedComponents if it's selected
        setSelectedComponents((prev) =>
          prev.map((comp) =>
            comp.id === componentId
              ? { 
                  ...comp, 
                  name: updatedData.name, 
                  description: updatedData.description,
                  image_url: imageUrl 
                }
              : comp
          )
        );

        // Show success message
        setSuccessMessage(`Category "${updatedData.name}" updated successfully!`);
        setShowSuccess(true);
      } else {
        setErrorMessage(`Failed to update category: ${result.error}`);
        setShowError(true);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setErrorMessage(`Error updating category: ${error.message}`);
      setShowError(true);
    }
  };

  // Handle component delete (deletes category from database)
  const handleDeleteComponent = async (componentId) => {
    try {
      const componentToDelete = categories.find(c => c.id === componentId);
      
      // Delete from database
      const result = await CategoryService.deleteCategory(componentId);

      if (result.success) {
        // Remove from local categories list
        setCategories((prev) => prev.filter((c) => c.id !== componentId));
        
        // Remove from selected components if it's selected
        setSelectedComponents((prev) => prev.filter((c) => c.id !== componentId));
        
        // Remove specifications for this component
        setSpecifications((prev) => {
          const newSpecs = { ...prev };
          delete newSpecs[componentId];
          return newSpecs;
        });

        // Show success message
        if (componentToDelete) {
          setSuccessMessage(`Category "${componentToDelete.name}" deleted successfully!`);
          setShowSuccess(true);
        }
      } else {
        setErrorMessage(`Failed to delete category: ${result.error}`);
        setShowError(true);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorMessage(`Error deleting category: ${error.message}`);
      setShowError(true);
    }
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
              isEditMode={isEditMode} // Pass edit mode status
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
