import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Tabs,
  Tab,
  InputAdornment,
  Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import Inventory from "./ProductComponents/Inventory";
import LowStock from "./ProductComponents/LowStock";
import { useNavigate } from "react-router-dom";
import Bundles from "./ProductComponents/Bundles";
const Product = () => {
  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem("productTab");
    return savedTab ? parseInt(savedTab) : 0;
  });

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    localStorage.setItem("productTab", newValue.toString());
  };

  const navigate = useNavigate();

  return (
    <Box p={2}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        PRODUCT MANAGEMENT
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
          placeholder="Search Product"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#000" }} />
              </InputAdornment>
            ),
            style: { background: "#fff", color: "#000" },
          }}
          sx={{ minWidth: 280 }}
        />

        <Box flex={1} />
        <Button
          variant="contained"
          sx={{ bgcolor: "#00E676", color: "#000", mr: 1, minWidth: 120, fontWeight: 700 }}
          onClick={() => navigate("/bundles/create")}
        >
          Add Bundle
        </Button>
        <Button
          variant="contained"
          sx={{ bgcolor: "#00E676", color: "#000", minWidth: 120, fontWeight: 700 }}
          onClick={() => navigate("/products/create")}
        >
          Add Product
        </Button>
      </Box>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ minHeight: 32 }}
        TabIndicatorProps={{ style: { height: 2 } }}
      >
        <Tab
          label="Inventories"
          sx={{ minWidth: 120, textTransform: "none" }}
        />
        <Tab label="Low Stocks" sx={{ minWidth: 120, textTransform: "none" }} />
        <Tab label="Bundles" sx={{ minWidth: 120, textTransform: "none" }} />
      </Tabs>
      {tab === 0 && <Inventory />}
      {tab === 1 && <LowStock />}
      {tab === 2 && <Bundles />}
    </Box>
  );
};

export default Product;
