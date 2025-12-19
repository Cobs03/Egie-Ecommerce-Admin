import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Chip,
  CircularProgress,
  Avatar,
  Typography,
  Stack,
} from "@mui/material";
import { DiscountService } from "../../../services/DiscountService";

const ProductSelector = ({ selectedProducts, onChange, error }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load products on mount and when search changes
  useEffect(() => {
    loadProducts();
  }, [searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await DiscountService.searchProducts(searchTerm, 100);
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return null;
  };

  return (
    <Autocomplete
      multiple
      options={products}
      value={selectedProducts}
      onChange={handleChange}
      loading={loading}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Products *"
          placeholder="Search and select products..."
          error={!!error}
          helperText={error || "Choose which products this discount applies to"}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
            {getProductImage(option) ? (
              <Avatar
                src={getProductImage(option)}
                alt={option.name}
                variant="rounded"
                sx={{ width: 48, height: 48 }}
              />
            ) : (
              <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: "#e0e0e0" }}>
                <Typography variant="caption">No Img</Typography>
              </Avatar>
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ₱{option.price.toLocaleString()} • Stock: {option.stock_quantity}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option.name}
            {...getTagProps({ index })}
            avatar={
              getProductImage(option) ? (
                <Avatar src={getProductImage(option)} />
              ) : undefined
            }
            size="small"
            sx={{ maxWidth: 200 }}
          />
        ))
      }
      onInputChange={(event, newInputValue) => {
        setSearchTerm(newInputValue);
      }}
      filterOptions={(options) => options} // Disable client-side filtering (using server-side)
      noOptionsText={searchTerm ? "No products found" : "Type to search products"}
    />
  );
};

export default ProductSelector;
