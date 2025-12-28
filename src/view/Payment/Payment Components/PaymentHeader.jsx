import React from "react";
import { Box, Button, TextField, Typography, Stack } from "@mui/material";
import { Search, FilterList, FileDownload } from "@mui/icons-material";
import { motion } from "framer-motion";

const PaymentHeader = ({
  searchQuery,
  onSearchChange,
  onFilterClick,
  onExport,
}) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight={700} mb={2} sx={{ fontFamily: "Bruno Ace SC" }}>
          PAYMENT MANAGEMENT
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
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
          placeholder="Search payment info"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <Search fontSize="small" sx={{ mr: 1, color: "#666" }} />,
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
          Export Payments
        </Button>
      </Box>
      </motion.div>
    </>
  );
};

export default PaymentHeader;