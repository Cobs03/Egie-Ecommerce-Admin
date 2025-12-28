import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Tabs,
  Tab,
  InputAdornment,
  Typography,
  Alert
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import { motion } from "framer-motion";
import Inventory from "./ProductComponents/Inventory";
import Stocks from "./ProductComponents/Stocks";
import { useNavigate, useLocation } from "react-router-dom";
import Bundles from "./ProductComponents/Bundles";

const Product = () => {
  const location = useLocation();
  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem("productTab");
    return savedTab ? parseInt(savedTab) : 0;
  });
  
  const [error, setError] = useState(null);

  // Log location state for debugging
  useEffect(() => {
    if (location.state) {
      console.log('📍 Product page received state:', location.state);
    }
  }, [location.state]);

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    localStorage.setItem("productTab", newValue.toString());
  };

  const navigate = useNavigate();

  // Download handlers
  const handleDownload = () => {
    if (tab === 0) {
      handleDownloadInventory();
    } else if (tab === 1) {
      handleDownloadStocks();
    } else if (tab === 2) {
      handleDownloadBundles();
    }
  };

  const handleDownloadInventory = () => {
    console.log("Downloading Inventory...");
    // TODO: Implement inventory download logic (CSV/Excel/PDF)
    // Example: fetch inventory data and generate file
  };

  const handleDownloadStocks = () => {
    console.log("Downloading Stocks...");
    // TODO: Implement stocks download logic
  };

  const handleDownloadBundles = () => {
    console.log("Downloading Bundles...");
    // TODO: Implement bundles download logic
  };

  // Get button label based on active tab
  const getDownloadButtonLabel = () => {
    if (tab === 0) return "Download Inventory";
    if (tab === 1) return "Download Stocks";
    return "Download Bundles";
  };

  return (
    <Box p={2}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight={700} mb={2} sx={{ fontFamily: "Bruno Ace SC" }}>
          PRODUCT MANAGEMENT
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
      </motion.div>

      {/* Tabs with Download Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
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
          <Tab label="Stocks" sx={{ minWidth: 120, textTransform: "none" }} />
          <Tab label="Bundles" sx={{ minWidth: 120, textTransform: "none" }} />
        </Tabs>

        {/* Download Button */}
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{
            borderColor: "#1976d2",
            color: "#1976d2",
            fontWeight: 600,
            textTransform: "none",
            minWidth: 180,
            "&:hover": {
              borderColor: "#115293",
              bgcolor: "rgba(25, 118, 210, 0.04)",
            },
          }}
        >
          {getDownloadButtonLabel()}
        </Button>
      </Box>
      </motion.div>

      {tab === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ErrorBoundary fallback={<Alert severity="error">Error loading inventory. Please refresh the page.</Alert>}>
            <Inventory key={location.state?.reloadProducts ? Date.now() : 'inventory'} />
          </ErrorBoundary>
        </motion.div>
      )}
      {tab === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ErrorBoundary fallback={<Alert severity="error">Error loading stocks. Please refresh the page.</Alert>}>
            <Stocks />
          </ErrorBoundary>
        </motion.div>
      )}
      {tab === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ErrorBoundary fallback={<Alert severity="error">Error loading bundles. Please refresh the page.</Alert>}>
            <Bundles />
          </ErrorBoundary>
        </motion.div>
      )}
    </Box>
  );
};

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

export default Product;
