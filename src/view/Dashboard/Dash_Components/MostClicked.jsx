import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack, LinearProgress, Chip } from "@mui/material";
import { motion } from "framer-motion";
import DashboardService from "../../../services/DashboardService";

const MostClicked = () => {
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
          minWidth: 300,
          minHeight: 300,
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
          minWidth: 300,
          minHeight: 300,
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

  const maxClicks = products[0]?.totalSold || 1;
  const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  const truncateText = (text, maxLength = 15) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 2,
          minWidth: 300,
          minHeight: 300,
          margin: 1,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700}>
              Most Clicked Products
            </Typography>
            <Chip label="Top 5" size="small" color="primary" />
          </Box>

          <Stack spacing={2.5}>
            {products.map((product, index) => (
              <Box key={product.product_id}>
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Box
                    component="img"
                    src={product.product_image || "https://via.placeholder.com/40"}
                    alt={product.product_name}
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: 1, 
                      mr: 1.5, 
                      objectFit: "cover",
                      border: "2px solid #f0f0f0"
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ flex: 1 }}
                  >
                    {truncateText(product.product_name)}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={COLORS[index]}
                  >
                    {product.totalSold}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(product.totalSold / maxClicks) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "#f0f0f0",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: COLORS[index],
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MostClicked;
