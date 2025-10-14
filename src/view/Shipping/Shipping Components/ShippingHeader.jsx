import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Search, FileDownload } from "@mui/icons-material";

const ShippingHeader = ({
  totalShipments,
  searchQuery,
  onSearchChange,
  onExport,
}) => {
  return (
    <>
      <Typography variant="h4" fontWeight={700} mb={2}>
        SHIPMENT MANAGEMENT
      </Typography>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        p={1}
        bgcolor="#000"
        borderRadius={2}
        boxShadow={1}
      >
        <TextField
          size="small"
          placeholder="Search shipment info"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <Search fontSize="small" sx={{ mr: 1, color: "#666" }} />
            ),
          }}
          sx={{
            bgcolor: "#fff",
            borderRadius: 1,
            minWidth: 300,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "transparent",
              },
            },
            "& .MuiInputBase-input": {
              color: "#000",
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#666",
              opacity: 1,
            },
          }}
        />

        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={onExport}
          sx={{
            bgcolor: "#fff",
            color: "#000",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "#f5f5f5",
            },
          }}
        >
          Export Shipments
        </Button>
      </Box>
    </>
  );
};

export default ShippingHeader;