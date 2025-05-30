import React from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";

const sampleProducts = [
  {
    id: 1,
    name: "Product 1",
    clicks: 200,
    imageUrl: "https://via.placeholder.com/40",
  }, // Replace with actual image URLs
  {
    id: 2,
    name: "Product 2",
    clicks: 180,
    imageUrl: "https://via.placeholder.com/40",
  },
  {
    id: 3,
    name: "Product 3",
    clicks: 170,
    imageUrl: "https://via.placeholder.com/40",
  },
  {
    id: 4,
    name: "Product 4",
    clicks: 165,
    imageUrl: "https://via.placeholder.com/40",
  },
  {
    id: 5,
    name: "Product 5",
    clicks: 140,
    imageUrl: "https://via.placeholder.com/40",
  },
];

const MostClicked = () => {
  const maxClicks = sampleProducts[0].clicks; // Assuming the data is sorted by clicks

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
          {sampleProducts.map((product, index) => (
            <Box key={product.id} display="flex" alignItems="center">
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{ mr: 2, width: 20 }}
              >
                {index + 1}
              </Typography>
              <Box
                component="img"
                src={product.imageUrl}
                alt={`Product ${product.id}`}
                sx={{ width: 40, height: 40, borderRadius: 1, mr: 2 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    width: `${(product.clicks / maxClicks) * 100}%`,
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
                {product.clicks}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MostClicked;
