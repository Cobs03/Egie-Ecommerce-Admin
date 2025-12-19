import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
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
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3.5 }}>
          Most Clicked Product
        </Typography>

        <Stack spacing={2}>
          {products.map((product, index) => (
            <Box key={product.product_id} display="flex" alignItems="center">
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{ mr: 2, width: 20 }}
              >
                {index + 1}
              </Typography>
              <Box
                component="img"
                src={product.product_image || "https://via.placeholder.com/40"}
                alt={product.product_name}
                sx={{ width: 40, height: 40, borderRadius: 1, mr: 2, objectFit: "cover" }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    width: `${(product.totalSold / maxClicks) * 100}%`,
                    height: 20,
                    bgcolor: "#63e01d",
                    borderRadius: 1,
                  }}
                />
              </Box>
              <Typography
                variant="body1"
                fontWeight={500}
                sx={{ ml: 2, width: 70, textAlign: "right" }}
              >
                {product.totalSold}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MostClicked;
