import React, { useState, useEffect } from "react";
import {
  TextField,
  Stack,
  MenuItem,
  Typography,
  Autocomplete,
  Box,
  Paper,
} from "@mui/material";
import productData from "../../Data/ProductData.json";

const ProductBasicInfo = ({
  name,
  description,
  warranty,
  onNameChange,
  onDescriptionChange,
  onWarrantyChange,
  onProductSelect, // New prop to handle product selection
}) => {
  const [searchTerm, setSearchTerm] = useState(name);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Get all products from JSON
  const allProducts = productData.products;

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm]);

  const handleProductSelect = (event, value) => {
    if (value) {
      // Call parent handler with full product data
      if (onProductSelect) {
        onProductSelect(value);
      }
      setSearchTerm(value.name);
      onNameChange(value.name);
    }
  };

  const handleInputChange = (event, value) => {
    setSearchTerm(value);
    onNameChange(value);
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Product Information
      </Typography>

      {/* Autocomplete Product Name with Search */}
      <Autocomplete
        freeSolo
        options={allProducts}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        value={name}
        onChange={handleProductSelect}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Product Name"
            required
            size="small"
            placeholder="Search or enter product name..."
          />
        )}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 1,
            }}
          >
            <Box
              component="img"
              src={option.image}
              alt={option.name}
              sx={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: 1,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.code} - ₱{option.price.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}
        PaperComponent={(props) => (
          <Paper
            {...props}
            sx={{
              "& .MuiAutocomplete-listbox": {
                maxHeight: "300px",
              },
            }}
          />
        )}
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
        <TextField
          label="Warranty"
          select
          fullWidth
          size="small"
          defaultValue=""
          value={warranty}
          onChange={(e) => onWarrantyChange(e.target.value)}
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="warranty1">1 Year Warranty</MenuItem>
          <MenuItem value="warranty2">2 Year Warranty</MenuItem>
          <MenuItem value="warranty3">3 Year Warranty</MenuItem>
        </TextField>
      </Stack>
    </Stack>
  );
};

export default ProductBasicInfo;