import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
// You might need to install Material Icons if not already installed
// npm install @mui/icons-material
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"; // Inventory icon
import DashboardService from "../../../services/DashboardService";

const Inventory = () => {
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalBundles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const stats = await DashboardService.getInventoryStats();
        setInventoryStats(stats);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  if (loading) {
    return (
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 1,
          minWidth: 240,
          minHeight: 180,
          margin: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Loading...</Typography>
      </Card>
    );
  }
  const hasLowStock = inventoryStats.lowStock > 0;
  const hasOutOfStock = inventoryStats.outOfStock > 0;

  return (
    <Card
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: 3,
        padding: 1,
        minWidth: 240,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        border: hasOutOfStock ? "2px solid #f44336" : hasLowStock ? "2px solid #ff9800" : "none",
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Inventory
          </Typography>
          {hasOutOfStock && (
            <Box
              sx={{
                bgcolor: "#f44336",
                color: "#fff",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              CRITICAL
            </Box>
          )}
          {!hasOutOfStock && hasLowStock && (
            <Box
              sx={{
                bgcolor: "#ff9800",
                color: "#fff",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              WARNING
            </Box>
          )}
        </Box>

        <Stack spacing={1}>
          {/* Total Products */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" fontWeight={500}>
              Total Products
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {(inventoryStats.totalProducts || 0).toLocaleString()}
            </Typography>
          </Box>

          {/* Low Stocks */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              bgcolor: hasLowStock ? "#fff3e0" : "transparent",
              p: hasLowStock ? 1 : 0,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" fontWeight={500} color="#ff9800">
              ⚠️ Low Stocks
            </Typography>
            <Typography variant="body2" fontWeight={700} color="#ff9800">
              {(inventoryStats.lowStock || 0).toLocaleString()}
            </Typography>
          </Box>

          {/* Out of Stock */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              bgcolor: hasOutOfStock ? "#ffebee" : "transparent",
              p: hasOutOfStock ? 1 : 0,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" fontWeight={500} color="#f44336">
              🚫 Out of Stock
            </Typography>
            <Typography variant="body2" fontWeight={700} color="#f44336">
              {(inventoryStats.outOfStock || 0).toLocaleString()}
            </Typography>
          </Box>

          {/* Total Bundles */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              bgcolor: inventoryStats.totalBundles > 0 ? "#e3f2fd" : "transparent",
              p: inventoryStats.totalBundles > 0 ? 1 : 0,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" fontWeight={500} color="#2196f3">
              📦 Total Bundles
            </Typography>
            <Typography variant="body2" fontWeight={700} color="#2196f3">
              {(inventoryStats.totalBundles || 0).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Inventory;
