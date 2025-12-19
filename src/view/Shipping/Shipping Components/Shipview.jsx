import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Grid, Chip, Divider } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { confirmationColors, tatColors } from "./shippingData";
import { ShippingService } from "../../../services/ShippingService";
import { toast } from "sonner";

const Shipview = () => {
  const navigate = useNavigate();
  const { orderCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShipmentByOrderCode();
  }, [orderCode]);

  const loadShipmentByOrderCode = async () => {
    setLoading(true);
    try {
      const { data: shipments, error } = await ShippingService.getAllShipments();
      
      if (error) {
        console.error('Error loading shipments:', error);
        toast.error('Failed to load shipment details');
        setLoading(false);
        return;
      }

      if (shipments && Array.isArray(shipments)) {
        // Transform and find the shipment
        const transformedShipments = shipments.map(order => {
          const customerName = order.user_profile
            ? `${order.user_profile.first_name} ${order.user_profile.last_name}`
            : order.shipping_addresses?.full_name || 'Unknown';

          const orderItems = order.order_items || [];
          
          const shippedDate = order.shipped_at ? new Date(order.shipped_at) : null;
          const deliveredDate = order.delivered_at ? new Date(order.delivered_at) : null;
          const now = new Date();
          
          let tatStatus = 'Ontime';
          if (order.status === 'delivered' && deliveredDate && shippedDate) {
            const daysDiff = Math.floor((deliveredDate - shippedDate) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 2) tatStatus = 'Early';
            else if (daysDiff > 5) tatStatus = 'Delayed';
          } else if (order.status === 'shipped' && shippedDate) {
            const daysSinceShipped = Math.floor((now - shippedDate) / (1000 * 60 * 60 * 24));
            if (daysSinceShipped > 5) tatStatus = 'Delayed';
          }

          const addr = order.shipping_addresses;
          const shippingAddress = addr
            ? [addr.street_address, addr.barangay, addr.city, addr.province, addr.postal_code]
                .filter(Boolean)
                .join(', ')
            : 'N/A';

          return {
            id: order.id,
            customer: customerName,
            order: {
              items: orderItems,
              code: order.order_number
            },
            courier: order.courier_name || 'N/A',
            confirmation: (order.payments?.[0]?.payment_status === 'paid' || order.payments?.[0]?.payment_status === 'completed') ? 'Completed' : 'Pending',
            status: order.status === 'shipped' ? 'Out for Delivery' : 'Delivered',
            tat: tatStatus,
            tracking_number: order.tracking_number || 'N/A',
            shipping_address: shippingAddress,
            contact_number: addr?.phone || order.user_profile?.phone || 'N/A',
            shipped_date: shippedDate ? shippedDate.toISOString().split('T')[0] : 'N/A',
            delivered_date: deliveredDate ? deliveredDate.toISOString().split('T')[0] : null,
            estimated_delivery: shippedDate
              ? new Date(shippedDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              : 'N/A',
            notes: order.order_notes || '',
            rawData: order
          };
        });

        const foundShipment = transformedShipments.find((s) => s.order?.code === orderCode);
        setData(foundShipment);
      }
    } catch (error) {
      console.error('Error in loadShipmentByOrderCode:', error);
      toast.error('Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={3} maxWidth={800} mx="auto" display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: '60px',
              height: '60px',
              border: '6px solid rgba(0, 230, 118, 0.1)',
              borderTop: '6px solid #00E676',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
          <Typography variant="body2" color="#00E676" sx={{ fontWeight: 500 }}>
            Loading shipment...
          </Typography>
        </Box>
      </Box>
    );
  }

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
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/shipping")}
            sx={{ mt: 2, bgcolor: "#00E676", color: "#fff" }}
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
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              Order Code
            </Typography>
            <Typography variant="body1" fontWeight={600} fontSize={16}>
              {data.order.code}
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Product Name
            </Typography>
            {data.order.items && data.order.items.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {data.order.items.map((item, index) => (
                  <Typography key={index} variant="body1" fontWeight={500}>
                    • {item.product_name || 'N/A'} (x{item.quantity || 1}) - ₱{item.unit_price ? parseFloat(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" fontWeight={500}>N/A</Typography>
            )}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              Total
            </Typography>
            <Typography variant="body1" fontWeight={600} fontSize={16}>
              ₱{data.order.items && data.order.items.length > 0 ? data.order.items.reduce((total, item) => {
                const itemTotal = (parseFloat(item.unit_price) || 0) * (item.quantity || 1);
                return total + itemTotal;
              }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </Typography>
          </Box>
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
