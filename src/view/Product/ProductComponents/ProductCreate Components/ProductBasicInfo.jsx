import React, { useState, useEffect } from "react";
import {
  TextField,
  Stack,
  MenuItem,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  Autocomplete,
} from "@mui/material";
import { BrandService } from "../../../../services/BrandService";

const ProductBasicInfo = ({
  name,
  description,
  warranty,
  brandId,
  compatibilityTags = [],
  onNameChange,
  onDescriptionChange,
  onWarrantyChange,
  onBrandChange,
  onCompatibilityTagsChange,
}) => {
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [openBrandDialog, setOpenBrandDialog] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: '',
    description: '',
    website_url: ''
  });

  // Predefined compatibility tags suggestions based on PC components
  const suggestedTags = [
    // Motherboard compatibility
    'Intel LGA1700', 'Intel LGA1200', 'AMD AM5', 'AMD AM4',
    // RAM types
    'DDR5', 'DDR4', 'DDR3',
    // Storage interfaces
    'M.2 NVMe', 'SATA', 'PCIe 4.0', 'PCIe 3.0',
    // Power connectors
    '24-pin ATX', '8-pin EPS', '6-pin PCIe', '8-pin PCIe',
    // Form factors
    'ATX', 'Micro-ATX', 'Mini-ITX',
    // GPU compatibility
    'Dual Slot', 'Triple Slot',
    // Cooling compatibility
    '120mm Fan', '140mm Fan', 'AIO Compatible',
    // Case compatibility
    'Standard ATX Case', 'Compact Case',
  ];

  // Load brands on component mount
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const result = await BrandService.getAllBrands();
      if (result.success) {
        setBrands(result.data);
      } else {
        console.error('Failed to load brands:', result.error);
        setBrands([]);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrand.name.trim()) return;

    try {
      const result = await BrandService.createBrand(newBrand);
      if (result.success) {
        setBrands([...brands, result.data]);
        onBrandChange(result.data.id); // Auto-select the new brand
        setNewBrand({ name: '', description: '', website_url: '' });
        setOpenBrandDialog(false);
      } else {
        console.error('Failed to create brand:', result.error);
        alert('Failed to create brand: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating brand:', error);
      alert('Error creating brand');
    }
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Product Information
      </Typography>

      {/* Product Name Field */}
      <TextField
        label="Product Name"
        required
        size="small"
        placeholder="Enter product name..."
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />

      <TextField
        label="Description"
        multiline
        minRows={3}
        fullWidth
        size="small"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Enter product description..."
      />

      <Stack direction="row" spacing={2}>
        {/* Brand Selection */}
        <TextField
          label="Brand"
          select
          fullWidth
          size="small"
          value={brandId || ''}
          onChange={(e) => onBrandChange(e.target.value)}
          disabled={loadingBrands}
          helperText={loadingBrands ? "Loading brands..." : ""}
        >
          <MenuItem value="">
            <em>Select a brand</em>
          </MenuItem>
          {brands.map((brand) => (
            <MenuItem key={brand.id} value={brand.id}>
              {brand.name}
            </MenuItem>
          ))}
          <MenuItem
            value="create_new"
            sx={{ 
              color: 'primary.main', 
              fontStyle: 'italic',
              borderTop: 1,
              borderColor: 'divider'
            }}
            onClick={(e) => {
              e.preventDefault();
              setOpenBrandDialog(true);
            }}
          >
            + Create New Brand
          </MenuItem>
        </TextField>

        {/* Warranty Selection */}
        <TextField
          label="Warranty"
          select
          fullWidth
          size="small"
          value={warranty}
          onChange={(e) => onWarrantyChange(e.target.value)}
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="1 Year Warranty">1 Year Warranty</MenuItem>
          <MenuItem value="2 Year Warranty">2 Year Warranty</MenuItem>
          <MenuItem value="3 Year Warranty">3 Year Warranty</MenuItem>
        </TextField>
      </Stack>

      {/* Compatibility Tags */}
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Compatibility Tags (for product recommendations)
        </Typography>
        <Autocomplete
          multiple
          freeSolo
          options={suggestedTags}
          value={compatibilityTags || []}
          onChange={(event, newValue) => {
            onCompatibilityTagsChange(newValue);
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option}
                size="small"
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder="Select or type tags (e.g., DDR5, AMD AM5, M.2 NVMe)"
              helperText="Add tags to show compatible products. Press Enter to add custom tags."
            />
          )}
        />
      </Box>

      {/* Create Brand Dialog */}
      <Dialog open={openBrandDialog} onClose={() => setOpenBrandDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Brand</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Brand Name"
              required
              fullWidth
              value={newBrand.name}
              onChange={(e) => setNewBrand({...newBrand, name: e.target.value})}
              placeholder="Enter brand name..."
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={newBrand.description}
              onChange={(e) => setNewBrand({...newBrand, description: e.target.value})}
              placeholder="Enter brand description..."
            />
            <TextField
              label="Website URL"
              fullWidth
              value={newBrand.website_url}
              onChange={(e) => setNewBrand({...newBrand, website_url: e.target.value})}
              placeholder="https://www.example.com"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBrandDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateBrand} 
            variant="contained"
            disabled={!newBrand.name.trim()}
          >
            Create Brand
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ProductBasicInfo;