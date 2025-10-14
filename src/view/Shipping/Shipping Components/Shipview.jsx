import React from "react";
import { Box, Typography, Button, Paper, Grid, Chip, Divider } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { mockShipments, confirmationColors, tatColors } from "./shippingData";

const Shipview = () => {
  const navigate = useNavigate();
  const { orderCode } = useParams();

  // Direct, synchronous lookup - no useEffect, no loading state
  const data = mockShipments.find((s) => s.order?.code === orderCode);

  console.log("Order Code from URL:", orderCode);
  console.log("Found Data:", data);
  console.log("All Shipments:", mockShipments);

  if (!data) {
    return (
      <Box p={3} maxWidth={800} mx="auto">
        <Paper sx={{ p: 3 }}>
          <Typography color="error" variant="h6" mb={2}>
            Shipment not found
          </Typography>
          <Typography variant="body2" mb={2}>
            Looking for: <strong>{orderCode}</strong>
          </Typography>
          <Typography variant="body2" mb={2}>
            Available codes:
          </Typography>
          <ul>
            {mockShipments.map((s) => (
              <li key={s.id}>{s.order.code}</li>
            ))}
          </ul>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/shipping")}
            sx={{ mt: 2, bgcolor: "#6EFF6E", color: "#000" }}
          >
            Back to Shipping
          </Button>
        </Paper>
      </Box>
    );
  }

  const getConfirmationIcon = (confirmation) => {
    return confirmation === "Pending" ? "-" : "✔";
  };

  const getTatTextColor = (tat) => {
    return tat === "Early" ? "#fff" : "#000";
  };

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/shipping")}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Back to Shipping
      </Button>

      <Paper sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
        <Box display="flex" alignItems="center" mb={1}>
          <LocalShippingIcon sx={{ fontSize: 32, mr: 1, color: "#6EFF6E" }} />
          <Typography variant="h4" fontWeight={700}>
            Shipment Details
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Order Code: <strong>{data.order.code}</strong> | Tracking:{" "}
          <strong>{data.tracking_number}</strong>
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Status Overview */}
        <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Confirmation Status
              </Typography>
              <Chip
                label={data.confirmation}
                color={data.confirmation === "Pending" ? "warning" : "success"}
                size="small"
                icon={
                  <span
                    style={{
                      color: confirmationColors[data.confirmation].color,
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {getConfirmationIcon(data.confirmation)}
                  </span>
                }
                sx={{
                  fontWeight: 700,
                  bgcolor: confirmationColors[data.confirmation].bgcolor,
                  color: confirmationColors[data.confirmation].color,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Delivery Status
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {data.status}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Turn Around Time
              </Typography>
              <Chip
                label={data.tat}
                size="small"
                sx={{
                  bgcolor: tatColors[data.tat],
                  color: getTatTextColor(data.tat),
                  fontWeight: 700,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Courier
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {data.courier}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Customer Information */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Customer Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Customer Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.customer}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <PhoneIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Contact Number
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {data.contact_number}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="flex-start">
                <LocationOnIcon
                  sx={{ fontSize: 18, mr: 1, mt: 0.5, color: "text.secondary" }}
                />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Shipping Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {data.shipping_address}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Order Information */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Order Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Product Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.order.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Order Code
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.order.code}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Shipping Timeline */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Shipping Timeline
          </Typography>
          <Grid container spacing={2}>
            {data.shipped_date && (
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center">
                  <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Shipped Date
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(data.shipped_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Delivery
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {new Date(data.estimated_delivery).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            {data.delivered_date && (
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center">
                  <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, color: "success.main" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Delivered Date
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color="success.main">
                      {new Date(data.delivered_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Notes */}
        {data.notes && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Box mb={3}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.notes}
              </Typography>
            </Box>
          </>
        )}

        <Divider sx={{ mb: 3 }} />

      </Paper>
    </Box>
  );
};

export default Shipview;
