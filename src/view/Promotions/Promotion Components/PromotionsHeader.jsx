import React from "react";
import { Box, Typography, TextField, Button, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { FileDownload } from "@mui/icons-material";

const PromotionsHeader = ({ 
  onAddVoucher, 
  onDownload,
  onSearch, 
  onTabChange, 
  activeTab,
  searchQuery,
  onSearchChange 
}) => {
  return (
    <>
      {/* Title */}
      <Typography variant="h4" fontWeight={700} mb={3} sx={{ fontFamily: "Bruno Ace SC" }}>
        PROMOTIONS MANAGEMENT
      </Typography>

      {/* Search Bar & Pill Tabs */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        p={1.5}
        bgcolor="#000"
        borderRadius={2}
        boxShadow={2}
      >
        <TextField
          size="small"
          placeholder={activeTab === "discount" ? "Search Discount" : "Search Voucher"}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon fontSize="small" sx={{ mr: 1, color: "#000" }} />
            ),
          }}
          sx={{
            bgcolor: "#fff",
            borderRadius: 1,
            minWidth: 300,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { border: "none" },
            },
          }}
        />
        <Box flex={1} />

        {/* Pill-Style Tabs */}
        <Stack direction="row" spacing={0.5}>
          <Button
            onClick={() => onTabChange("discount")}
            sx={{
              bgcolor: activeTab === "discount" ? "#27EF3C" : "transparent",
              color: activeTab === "discount" ? "#000" : "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "20px",
              px: 3,
              py: 0.75,
              minWidth: 120,
              border: activeTab === "discount" ? "none" : "2px solid #fff",
              "&:hover": {
                bgcolor: activeTab === "discount" ? "#1ec32e" : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Discount
          </Button>
          <Button
            onClick={() => onTabChange("vouchers")}
            sx={{
              bgcolor: activeTab === "vouchers" ? "#27EF3C" : "transparent",
              color: activeTab === "vouchers" ? "#000" : "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "20px",
              px: 3,
              py: 0.75,
              minWidth: 120,
              border: activeTab === "vouchers" ? "none" : "2px solid #fff",
              "&:hover": {
                bgcolor: activeTab === "vouchers" ? "#1ec32e" : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Vouchers
          </Button>
          <Button
            onClick={() => onTabChange("popupads")}
            sx={{
              bgcolor: activeTab === "popupads" ? "#27EF3C" : "transparent",
              color: activeTab === "popupads" ? "#000" : "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "20px",
              px: 3,
              py: 0.75,
              minWidth: 120,
              border: activeTab === "popupads" ? "none" : "2px solid #fff",
              "&:hover": {
                bgcolor: activeTab === "popupads" ? "#1ec32e" : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Pop-up Ads
          </Button>
        </Stack>
      </Box>

      {/* Add Button & Export Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddVoucher}
          sx={{
            bgcolor: "#27EF3C",
            color: "#000",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "#1ec32e" },
          }}
        >
          {activeTab === "discount" ? "Add Discount" : activeTab === "popupads" ? "Add Pop-up Ad" : "Add Voucher"}
        </Button>

        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={onDownload}
          sx={{
            borderColor: "#1976d2",
            color: "#1976d2",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              borderColor: "#115293",
              bgcolor: "rgba(25, 118, 210, 0.04)",
            },
          }}
        >
          {activeTab === "discount" ? "Download Discounts" : activeTab === "popupads" ? "Download Pop-up Ads" : "Download Vouchers"}
        </Button>
      </Box>
    </>
  );
};

export default PromotionsHeader;