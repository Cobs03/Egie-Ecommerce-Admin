import React from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
// You might need to install Material Icons if not already installed
// npm install @mui/icons-material
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"; // Inventory icon

const Inventory = () => {
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
              1,000
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
              122
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
              2
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
              20
            </Typography>
          </Box>
        </Stack>
      </CardContent>


    </Card>
  );
};

export default Inventory;
