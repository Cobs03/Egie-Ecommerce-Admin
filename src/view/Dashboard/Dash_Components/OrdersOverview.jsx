import React from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";

// Helper component for the stacked progress bar
const OrderProgressBar = ({ completed, ongoing, total }) => {
  const completedPercentage = (completed / total) * 100;
  const ongoingPercentage = (ongoing / total) * 100;

  return (
    <Box
      sx={{
        width: "100%",
        height: 12,
        borderRadius: 6,
        bgcolor: "#357100",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: `${completedPercentage}%`,
          height: "100%",
          bgcolor: "#63e01d", // Light green for completed
          float: "left",
        }}
      />
      <Box
        sx={{
          width: `${ongoingPercentage}%`,
          height: "100%",
          bgcolor: "#388e3c", // Darker green for ongoing
          float: "left",
        }}
      />
    </Box>
  );
};

const OrdersOverview = () => {
  // Sample data - replace with actual data source
  const totalOrders = 323 + 100 + 156; // Example calculation, adjust as needed
  const completedOrders = 323;
  const ongoingOrders = 100;
  const newOrders = 156;

  return (
    <Card
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: 3,
        padding: 1,
        minWidth: 300,
        minHeight: 150,
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
          Orders Overview
        </Typography>

        <Stack spacing={2}>
          {/* Completed Orders */}
          <Box display="flex" alignItems="center">
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                width: 100,
                flexShrink: 0,
              }}
            >
              Completed
            </Typography>
            <OrderProgressBar
              completed={completedOrders}
              ongoing={0}
              total={totalOrders}
            />
            <Typography variant="body2" fontWeight={500} sx={{ ml: 2 }}>
              {completedOrders}
            </Typography>
          </Box>

          {/* Ongoing Orders */}
          <Box display="flex" alignItems="center">
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                width: 100,
                flexShrink: 0,
              }}
            >
              Ongoing
            </Typography>
            <OrderProgressBar
              completed={ongoingOrders}
              ongoing={0}
              total={totalOrders}
            />
            <Typography variant="body2" fontWeight={500} sx={{ ml: 2 }}>
              {ongoingOrders}
            </Typography>
          </Box>

          {/* New Orders */}
          <Box display="flex" alignItems="center">
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                width: 100,
                flexShrink: 0,
              }}
            >
              New
            </Typography>
            <OrderProgressBar
              completed={newOrders}
              ongoing={0}
              total={totalOrders}
            />
            <Typography variant="body2" fontWeight={500} sx={{ ml: 2 }}>
              {newOrders}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OrdersOverview;
