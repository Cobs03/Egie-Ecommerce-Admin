import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { Search, FilterList, FileDownload } from "@mui/icons-material";

const OrderHeader = ({ searchQuery, onSearchChange, totalOrders, onExport }) => {
  return (
    <>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Order Management
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
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search Orders"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
            }}
            sx={{ bgcolor: "#fff", color: "#000", input: { color: "#000" } }}
          />
        </Stack>

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
          Export Orders
        </Button>
      </Box>
    </>
  );
};

export default OrderHeader;

