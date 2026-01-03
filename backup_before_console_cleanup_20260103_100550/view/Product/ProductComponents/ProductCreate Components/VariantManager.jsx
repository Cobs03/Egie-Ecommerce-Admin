import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const VariantManager = ({ variants, onAddVariant, onVariantChange, onRemoveVariant }) => {
  return (
    <Box>
      <Typography variant="body2" fontWeight={500} mb={0.5}>
        Variation
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          sx={{ width: 240 }}
          onClick={onAddVariant}
        >
          Add Variant
        </Button>
        {variants.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            (Add multiple variants as needed)
          </Typography>
        )}
      </Stack>
      <Stack spacing={2}>
        {variants.map((variant, idx) => (
          <Box
            key={idx}
            sx={{
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              bgcolor: "#fafafa",
            }}
          >
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  label={`Variant ${idx + 1} Name`}
                  value={variant.name}
                  onChange={(e) => onVariantChange(idx, "name", e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemoveVariant(idx)}
                >
                  <CloseIcon fontSize="small" sx={{ color: "black" }} />
                </IconButton>
              </Box>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Price"
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    onVariantChange(idx, "price", Number(e.target.value))
                  }
                  size="small"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₱</Typography>,
                  }}
                />
              </Stack>
              <Box>
                <Typography variant="body2" fontWeight={500} mb={0.5}>
                  Stock <span style={{ color: "red" }}>*</span>
                </Typography>
                <Box display="flex" alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() =>
                      onVariantChange(
                        idx,
                        "stock",
                        Math.max(0, variant.stock - 1)
                      )
                    }
                    sx={{
                      border: "1px solid #ccc",
                      borderRadius: 1,
                      color: "black",
                    }}
                  >
                    -
                  </IconButton>
                  <TextField
                    value={variant.stock}
                    onChange={(e) =>
                      onVariantChange(
                        idx,
                        "stock",
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                    type="number"
                    size="small"
                    sx={{ width: 60, mx: 1 }}
                    inputProps={{
                      min: 0,
                      style: { textAlign: "center" },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() =>
                      onVariantChange(idx, "stock", variant.stock + 1)
                    }
                    sx={{
                      border: "1px solid #ccc",
                      borderRadius: 1,
                      color: "black",
                    }}
                  >
                    +
                  </IconButton>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    pcs.
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default VariantManager;