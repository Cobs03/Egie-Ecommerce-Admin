import React from "react";
import { Box, Typography, TextField, Button, Stack } from "@mui/material";
import { Search, PersonAdd, FileDownload } from "@mui/icons-material";

const UserHeader = ({ 
  onAddUser, 
  onDownload, 
  activeTab, 
  onTabChange,
  searchQuery,
  onSearchChange 
}) => {
  return (
    <>
      {/* Title */}
      <Typography variant="h4" fontWeight={700} mb={3}>
        USER MANAGEMENT
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
          placeholder="Search User"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <Search fontSize="small" sx={{ mr: 1, color: "#000" }} />
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
            onClick={() => onTabChange("employees")}
            sx={{
              bgcolor: activeTab === "employees" ? "#00E676" : "transparent",
              color: activeTab === "employees" ? "#000" : "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "20px",
              px: 3,
              py: 0.75,
              minWidth: 120,
              border: activeTab === "employees" ? "none" : "2px solid #fff",
              "&:hover": {
                bgcolor: activeTab === "employees" ? "#00C853" : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Employees
          </Button>
          <Button
            onClick={() => onTabChange("customers")}
            sx={{
              bgcolor: activeTab === "customers" ? "#00E676" : "transparent",
              color: activeTab === "customers" ? "#000" : "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "20px",
              px: 3,
              py: 0.75,
              minWidth: 120,
              border: activeTab === "customers" ? "none" : "2px solid #fff",
              "&:hover": {
                bgcolor: activeTab === "customers" ? "#00C853" : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Customers
          </Button>
        </Stack>
      </Box>

      {/* Add Employee & Export Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        {/* Only show Add Employee button when on Employees tab */}
        {activeTab === "employees" ? (
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={onAddUser}
            sx={{
              bgcolor: "#00E676",
              color: "#000",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#00C853" },
            }}
          >
            Add Employee
          </Button>
        ) : (
          <Box /> // Empty box to maintain layout spacing
        )}

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
          {activeTab === "employees" ? "Export Employees" : "Export Customers"}
        </Button>
      </Box>
    </>
  );
};

export default UserHeader;