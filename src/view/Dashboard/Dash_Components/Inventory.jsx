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
  return (
    <Card
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: 3,
        padding: 1,
        minWidth: 240,
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        margin: 1,
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Inventory
        </Typography>

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
            <Typography variant="body2" fontWeight={500}>
              {(inventoryStats.totalProducts || 0).toLocaleString()}
            </Typography>
          </Box>

          {/* Low Stocks */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" fontWeight={500} color="#ff9800">
              Low Stocks
            </Typography>
            <Typography variant="body2" fontWeight={500} color="#ff9800">
              {(inventoryStats.lowStock || 0).toLocaleString()}
            </Typography>
          </Box>

          {/* Out of Stock */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" fontWeight={500} color="#f44336">
              Out of Stock
            </Typography>
            <Typography variant="body2" fontWeight={500} color="#f44336">
              {(inventoryStats.outOfStock || 0).toLocaleString()}
            </Typography>
          </Box>

          {/* Total Bundles */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" fontWeight={500}>
              Total Bundles
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {(inventoryStats.totalBundles || 0).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </CardContent>


    </Card>
  );
};

export default Inventory;
