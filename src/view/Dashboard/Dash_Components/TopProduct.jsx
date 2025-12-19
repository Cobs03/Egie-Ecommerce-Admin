import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
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

  return (
    <Card
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: 3,
        padding: 2,
        minWidth: 200,
        margin: 1,
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
          Top Products
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-around"
          alignItems="flex-end"
          sx={{ height: 200 }}
        >
          {products.map((product, index) => (
            <Box
              key={product.product_id}
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ height: "100%", justifyContent: "flex-end" }}
            >
              <Box
                component="img"
                src={product.product_image || "https://via.placeholder.com/40"}
                alt={product.product_name}
                sx={{ width: 20, height: 40, borderRadius: 1, mb: 1, objectFit: "cover" }}
              />
              <Box
                sx={{
                  width: 40,
                  height: `${(product.totalSold / maxValue) * 100}%`,
                  bgcolor: "#ffe14d",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  p: "8px 0",
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={700}
                  sx={{ color: "#000", zIndex: 1 }}
                >
                  {index + 1}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TopProduct;
