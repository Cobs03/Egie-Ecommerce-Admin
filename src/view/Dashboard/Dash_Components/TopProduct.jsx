import React from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";

// Sample data for top products - replace with actual data
const sampleTopProducts = [
  { id: 1, rank: 1, value: 400, imageUrl: "https://via.placeholder.com/40" }, // Example value, adjust as needed
  { id: 2, rank: 2, value: 250, imageUrl: "https://via.placeholder.com/40" },
  { id: 3, rank: 3, value: 200, imageUrl: "https://via.placeholder.com/40" },
  { id: 4, rank: 4, value: 150, imageUrl: "https://via.placeholder.com/40" },
  { id: 5, rank: 5, value: 100, imageUrl: "https://via.placeholder.com/40" },
];

const TopProduct = () => {
  // Assuming the data is sorted by value descending
  const maxValue =
    sampleTopProducts.length > 0 ? sampleTopProducts[0].value : 1;

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
          {sampleTopProducts.map((product) => (
            <Box
              key={product.id}
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ height: "100%", justifyContent: "flex-end" }}
            >
              <Box
                component="img"
                src={product.imageUrl}
                alt={`Product ${product.rank}`}
                sx={{ width: 20, height: 40, borderRadius: 1, mb: 1 }}
              />
              <Box
                sx={{
                  width: 40,
                  height: `${(product.value / maxValue) * 100}%`,
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
                  {product.rank}
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
