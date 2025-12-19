import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const getInventoryColor = (inventory) => {
  if (inventory === 0) return "error.main";
  if (inventory <= 5) return "warning.main";
  return "success.main";
};

const getInventoryText = (inventory) => {
  if (inventory === 0) return "Out of Stock";
  if (inventory <= 5) return "Low Stock";
  return "In Stock";
};

const PaymentOrderDetailsDrawer = ({ open, onClose, order }) => {
  if (!order) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1500, // Above AI bot (usually 1400)
      }}
      PaperProps={{
        sx: {
          width: 400,
          p: 3,
          bgcolor: "#f5f5f5",
          zIndex: 1500,
        },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h6" color="black">
          Order Details
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Stack spacing={3}>
        {/* Order Information */}
        <Box>
          <Typography
            variant="subtitle2"
            gutterBottom
            color="black"
            sx={{ fontWeight: 600, fontSize: 26 }}
          >
            Order Information
          </Typography>
          <Typography color="black">Order ID: #{order.id}</Typography>
          <Typography color="black">Date: {order.date}</Typography>
          <Typography color="black">Status: {order.status}</Typography>
        </Box>

        {/* Customer Information */}
        <Box>
          <Typography variant="subtitle2" gutterBottom color="black">
            Customer Information
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={order.customer.avatar} />
            <Box>
              <Typography color="black">{order.customer.name}</Typography>
              <Typography variant="body2" color="black">
                {order.customer.email}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Shipping Address */}
        <Box>
          <Typography variant="subtitle2" gutterBottom color="black">
            Shipping Address
          </Typography>
          <Typography color="black">{order.shippingAddress}</Typography>
        </Box>

        {/* Products */}
        <Box>
          <Typography variant="subtitle2" gutterBottom color="black">
            Products
          </Typography>
          {(order.items || []).map((product, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar 
                  src={product.product_image || undefined} 
                  variant="rounded"
                  sx={{ 
                    width: 56, 
                    height: 56,
                    bgcolor: product.product_image ? 'transparent' : 'grey.300'
                  }}
                >
                  {!product.product_image && '?'}
                </Avatar>
                <Box flex={1}>
                  <Typography color="black">{product.product_name}</Typography>
                  {product.variant_name && (
                    <Typography variant="caption" color="text.secondary">
                      {product.variant_name}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="black">
                      Quantity: {product.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₱{(product.unit_price || 0).toFixed(2)} each
                    </Typography>
                  </Stack>
                </Box>
                <Typography color="black">
                  ₱{(product.total || 0).toFixed(2)}
                </Typography>
              </Stack>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1" color="black">
              Total
            </Typography>
            <Typography variant="subtitle1" color="black">
              ₱{(order.total || 0).toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Drawer>
  );
};

export default PaymentOrderDetailsDrawer;