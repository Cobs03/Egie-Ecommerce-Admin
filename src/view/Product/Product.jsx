import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Tabs,
  Tab,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import Inventory from "./ProductComponents/Inventory";
import LowStock from "./ProductComponents/LowStock";
import { useNavigate } from "react-router-dom";
import BundleCreate from "../Product/ProductComponents/BundleCreate";
import BundleView from "../Product/ProductComponents/BundleView";
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
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
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
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{ minWidth: 90 }}
        >
          Filter
        </Button>
        <Box flex={1} />
        <Button
          variant="contained"
          sx={{ bgcolor: "#1976d2", color: "#fff", mr: 1, minWidth: 120 }}
          onClick={() => navigate("/bundles/create")}
        >
          Add Bundle
        </Button>
        <Button
          variant="contained"
          sx={{ bgcolor: "#1976d2", color: "#fff", minWidth: 120 }}
          onClick={() => navigate("/products/create")}
        >
          Add Product
        </Button>
      </Stack>
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
