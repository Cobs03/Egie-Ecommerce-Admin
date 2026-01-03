import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const PaymentDetailsDrawer = ({
  open,
  onClose,
  payment,
  onMarkAsPaid,
}) => {
  if (!payment) return null;
  
  // Use real customer info if available, otherwise use defaults
  const customerInfo = payment.customerInfo || {
    name: 'Unknown',
    email: 'N/A',
    phone: 'N/A',
    avatar: null,
    address: 'N/A'
  };

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
          width: 370,
          maxWidth: "100vw",
          p: 2,
          bgcolor: "#f5f5f5",
          zIndex: 1500,
        },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Typography variant="h6" fontWeight={700} color="black">
          Payment Details
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Payer Information */}
      <Typography
        fontWeight={700}
        mb={1}
        color="black"
        sx={{ fontWeight: 600, fontSize: 26 }}
      >
        Payer Information
      </Typography>
      <Box display="flex" alignItems="center" mb={1}>
        <Avatar 
          src={customerInfo.avatar} 
          sx={{ width: 40, height: 40, mr: 2 }}
        >
          {!customerInfo.avatar && customerInfo.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography fontSize={15} fontWeight={700} color="black">
            {customerInfo.name}
          </Typography>
          <Typography fontSize={14} color="black">
            {customerInfo.email}
          </Typography>
          <Typography fontSize={14} color="black">
            <b>Phone:</b> {customerInfo.phone}
          </Typography>
        </Box>
      </Box>
      <Typography fontSize={14} mb={2} color="black">
        <b>Address:</b> {customerInfo.address}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Payment Details */}
      <Typography fontWeight={700} mb={1} color="black">
        Payment Details
      </Typography>
      <Typography fontSize={14} color="black">
        <b>Order ID:</b> {payment.orderId}
      </Typography>
      <Typography fontSize={14} color="black">
        <b>Transaction ID:</b> {payment.transactionId}
      </Typography>
      <Typography fontSize={14} color="black">
        <b>Date Ordered:</b> {payment.dateTime}
      </Typography>
      <Typography fontSize={14} color="black">
        <b>Estimated Delivery Date:</b> May 16, 2025
      </Typography>
      <Typography fontSize={14} mb={1} color="black">
        <b>Total Amount:</b> {payment.amount}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography fontSize={14} color="black">
        <b>Delivery Option:</b> Standard Delivery
      </Typography>
      <Typography fontSize={14} color="black">
        <b>Payment Method:</b> {payment.method}
      </Typography>
      <Typography fontSize={14} color="black">
        <b>Payment Status:</b> {payment.status}
      </Typography>
      <Typography fontSize={14} mb={2} color="black">
        <b>Order Status:</b> {payment.orderStatus || 'Unknown'}
      </Typography>

      {payment.orderStatus === 'cancelled' && (
        <Box
          sx={{
            bgcolor: '#FFEBEE',
            border: '1px solid #F44336',
            borderRadius: 1,
            p: 2,
            mb: 2
          }}
        >
          <Typography fontSize={14} color="#C62828" fontWeight={600}>
            ⚠️ This order has been cancelled. Payment cannot be processed.
          </Typography>
        </Box>
      )}

      {(payment.status === "Pending" || payment.status === "pending") && payment.orderStatus !== 'cancelled' && (
        <Button
          variant="contained"
          fullWidth
          onClick={() => onMarkAsPaid(payment)}
          sx={{
            bgcolor: "#00E676",
            color: "#000",
            fontWeight: 700,
            mt: 2,
            mb: 2,
            boxShadow: 1,
            "&:hover": {
              bgcolor: "#00C853",
            },
          }}
        >
          Mark as Paid / Verified
        </Button>
      )}

      {(payment.status === "paid" || payment.status === "Paid") && (
        <Box
          sx={{
            bgcolor: '#E8F5E9',
            border: '1px solid #4CAF50',
            borderRadius: 1,
            p: 2,
            mt: 2,
            mb: 2
          }}
        >
          <Typography fontSize={14} color="#2E7D32" fontWeight={600}>
            ✓ Payment has been verified and marked as paid.
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default PaymentDetailsDrawer;