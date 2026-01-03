import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import { DiscountService } from "../../../services/DiscountService";

const CategorySelector = ({ selectedCategories, onChange, error }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await DiscountService.getProductCategories();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  return (
    <Autocomplete
      multiple
      options={categories}
      value={selectedCategories}
      onChange={handleChange}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Categories *"
          placeholder="Choose product categories..."
          error={!!error}
          helperText={error || "Discount will apply to all products in selected categories"}
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
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option}
            {...getTagProps({ index })}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))
      }
      noOptionsText={loading ? "Loading categories..." : "No categories found"}
    />
  );
};

export default CategorySelector;
