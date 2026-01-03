import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack, LinearProgress, Chip } from "@mui/material";
import { motion } from "framer-motion";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DashboardService from "../../../services/DashboardService";

const TopProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await DashboardService.getTopProducts(5);
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching top products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 2,
          minWidth: 200,
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

  if (products.length === 0) {
    return (
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 2,
          minWidth: 200,
          margin: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>No product data available</Typography>
      </Card>
    );
  }

  const maxValue = products.length > 0 ? products[0].totalSold : 1;
  const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

  const truncateText = (text, maxLength = 15) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card
        sx={{
          background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
          borderRadius: 3,
          boxShadow: 3,
          padding: 2,
          minWidth: 300,
          margin: 1,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon sx={{ color: "#10b981" }} />
              <Typography variant="h6" fontWeight={700}>
                Top Selling Products
              </Typography>
            </Box>
            <Chip label="Best Sellers" size="small" sx={{ bgcolor: "#10b981", color: "#fff" }} />
          </Box>

          <Stack spacing={2.5}>
            {products.map((product, index) => {
              const percentage = ((product.totalSold / maxValue) * 100).toFixed(1);
              return (
                <Box key={product.product_id}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Box display="flex" alignItems="center" gap={1} flex={1}>
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        sx={{ 
                          minWidth: 36,
                          height: 24,
                          bgcolor: COLORS[index],
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 11
                        }} 
                      />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ flex: 1 }}
                      >
                        {truncateText(product.product_name)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Typography variant="caption" color="text.secondary">
                        {percentage}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(percentage)}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: "#f5f5f5",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: COLORS[index],
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopProduct;
