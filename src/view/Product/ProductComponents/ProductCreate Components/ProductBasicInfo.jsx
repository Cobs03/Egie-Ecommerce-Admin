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
} from "@mui/material";
import { BrandService } from "../../../../services/BrandService";

const ProductBasicInfo = ({
  name,
  description,
  warranty,
  brandId,
  onNameChange,
  onDescriptionChange,
  onWarrantyChange,
  onBrandChange,
}) => {
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [openBrandDialog, setOpenBrandDialog] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: '',
    description: '',
    website_url: ''
  });

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
          <MenuItem value="warranty1">1 Year Warranty</MenuItem>
          <MenuItem value="warranty2">2 Year Warranty</MenuItem>
          <MenuItem value="warranty3">3 Year Warranty</MenuItem>
        </TextField>
      </Stack>

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