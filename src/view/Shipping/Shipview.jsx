import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Grid,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const Shipview = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    // Dynamically import the JSON file
    import("./Shipdata.json").then((module) => {
      const shipments = module.default;
      const found = shipments.find((s) => s.id === orderId);
      setData(found);
      setLoading(false);
    });
  }, [orderId]);

  const textColor = theme.palette.text.primary;
  const subTextColor = theme.palette.text.secondary;
  const panelBg = theme.palette.background.paper;
  const dividerColor = theme.palette.divider;

  if (loading) {
    return (
      <Box
        maxWidth={600}
        mx="auto"
        my={4}
        p={3}
        borderRadius={2}
        boxShadow={3}
        bgcolor={panelBg}
      >
        <Typography align="center" color={textColor}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        maxWidth={600}
        mx="auto"
        my={4}
        p={3}
        borderRadius={2}
        boxShadow={3}
        bgcolor={panelBg}
      >
        <Typography align="center" color={textColor}>
          Order not found.
        </Typography>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => navigate("/shipping")}
        >
          Back to Shipping
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        sx={{
          bgcolor: "#f1c40f",
          minWidth: 120,
          fontWeight: 700,
          color: isDark ? "#181818" : "#fff",
          "&:hover": { bgcolor: "#d4ac0d" },
        }}
        onClick={() => navigate("/shipping")}
      >
        Return
      </Button>
      <Box
        maxWidth={600}
        mx="auto"
        my={4}
        p={3}
        bgcolor={panelBg}
        borderRadius={2}
        boxShadow={3}
        color={textColor}
      >
        <Typography
          variant="h6"
          align="center"
          fontWeight={700}
          mb={2}
          color={textColor}
        >
          Shipping Details
        </Typography>
        <Box mb={2}>
          <Typography color={textColor}>
            <b>Name:</b> {data.customer}
          </Typography>
          <Typography color={textColor}>
            <b>Email Address:</b> {data.email}
          </Typography>
          <Typography color={textColor}>
            <b>Phone:</b> {data.phone}
          </Typography>
          <Typography color={textColor}>
            <b>Address:</b> {data.address}
          </Typography>
          <Typography color={textColor}>
            <b>Payment Method:</b> {data.payment}
          </Typography>
          <Typography color={textColor}>
            <b>Order ID:</b> {data.id}
          </Typography>
          <Typography color={textColor}>
            <b>Date Ordered:</b> {data.dateOrdered}
          </Typography>
          <Typography color={textColor}>
            <b>Delivery Option:</b> {data.deliveryOption}
          </Typography>
          <Typography color={textColor}>
            <b>Estimated Delivery Date:</b> {data.estimatedDate}
          </Typography>
          <Typography color={textColor}>
            <b>Order Status:</b> {data.status}
          </Typography>
        </Box>
        <Divider sx={{ my: 3, bgcolor: dividerColor }} />
        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="error"
            sx={{ minWidth: 120, fontWeight: 700 }}
            onClick={() => navigate("/shipping")}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#2ecc40",
              minWidth: 120,
              fontWeight: 700,
              color: "#fff",
              "&:hover": { bgcolor: "#27ae38" },
            }}
            onClick={() => navigate("/shipping")}
          >
            Shipped
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Shipview;
