import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Avatar,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  LocalShipping,
  CheckCircle,
  Cancel,
  AccessTime,
  LocalShippingOutlined,
} from "@mui/icons-material";
import OrderShip from "./OrderShip";
import { toast } from "sonner";

const OrderDetailsDrawer = ({ open, onClose, order, onOrderUpdate }) => {
  const [showShipModal, setShowShipModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Accept Order - Changes status from "New" to "On Going"
  const handleAcceptOrder = async () => {
    setIsUpdating(true);
    const updatedOrder = { ...order, status: "On Going" };
    onOrderUpdate(updatedOrder);
    setIsUpdating(false);
    onClose(); // Close drawer

    // Show success toast
    toast.success("Order Accepted", {
      description: `Order #${order.id} has been accepted and is now being prepared.`,
      duration: 4000,
    });
  };

  // Ship Package - Opens modal to add courier/tracking, changes "On Going" to "To Ship"
  const handleShipPackage = () => {
    if (order.deliveryType === "delivery") {
      setShowShipModal(true);
    } else {
      // For store pickup, mark as "Ready for Pickup"
      const updatedOrder = { ...order, status: "Ready for Pickup" };
      onOrderUpdate(updatedOrder);
      onClose();

      toast.success("Ready for Pickup", {
        description: `Order #${order.id} is ready for customer pickup.`,
        duration: 4000,
      });
    }
  };

  const handleCancelOrder = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    const updatedOrder = { ...order, status: "Cancelled" };
    onOrderUpdate(updatedOrder);
    onClose();

    toast.error("Order Cancelled", {
      description: `Order #${order.id} has been cancelled.`,
      duration: 4000,
    });
    setConfirmDialogOpen(false);
  };

  // Called when shipping info is submitted - Changes "On Going" to "To Ship"
  const handleShipped = (shippingData) => {
    const updatedOrder = {
      ...order,
      status: "To Ship",
      courier: shippingData.courier,
      trackingNumber: shippingData.tracking,
    };
    onOrderUpdate(updatedOrder);
    setShowShipModal(false);
    onClose();

    toast.success("Package Ready to Ship", {
      description: `Order #${order.id} is ready to ship via ${shippingData.courier}. Tracking: ${shippingData.tracking}`,
      duration: 5000,
    });
  };

  if (!order) return null;

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

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return { bgcolor: "#000", color: "#fff" };
      case "On Going":
        return { bgcolor: "#FF9800", color: "#fff" };
      case "To Ship":
        return { bgcolor: "#2196F3", color: "#fff" };
      case "Completed":
        return { bgcolor: "#4CAF50", color: "#fff" };
      case "Cancelled":
        return { bgcolor: "#F44336", color: "#fff" };
      default:
        return { bgcolor: "#9E9E9E", color: "#fff" };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "New":
        return <AccessTime sx={{ fontSize: 16 }} />;
      case "On Going":
        return <LocalShipping sx={{ fontSize: 16 }} />;
      case "To Ship":
        return <LocalShippingOutlined sx={{ fontSize: 16 }} />;
      case "Completed":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "Cancelled":
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 400,
            p: 3,
            bgcolor: "#f5f5f5",
            zIndex: 1400,
          },
        }}
        sx={{
          zIndex: 1400,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Typography
            variant="subtitle2"
            gutterBottom
            color="black"
            sx={{ fontWeight: 600, fontSize: 26 }}
          >
            Order Information
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          {/* Order Information */}
          <Box>
            <Typography color="black" sx={{ mb: 1 }}>
              Order ID: #{order.id}
            </Typography>
            <Typography color="black" sx={{ mb: 1 }}>
              Date: {order.date}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography color="black">Status:</Typography>
              <Chip
                icon={getStatusIcon(order.status)}
                label={order.status}
                size="small"
                sx={{
                  ...getStatusColor(order.status),
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  borderRadius: "16px",
                  height: 28,
                  "& .MuiChip-icon": {
                    color: "inherit",
                  },
                }}
              />
            </Box>
            {order.courier && (
              <Typography color="black" sx={{ mb: 1 }}>
                Courier: {order.courier}
              </Typography>
            )}
            {order.trackingNumber && (
              <Typography color="black">
                Tracking: {order.trackingNumber}
              </Typography>
            )}
          </Box>

          {/* Customer Information */}
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              color="black"
              sx={{ fontWeight: 600, fontSize: 17 }}
            >
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

          {/* Shipping/Pickup Address */}
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              color="black"
              sx={{ fontWeight: 600, fontSize: 17 }}
            >
              {order.deliveryType === "store_pickup"
                ? "Pickup Information"
                : "Shipping Address"}
            </Typography>
            <Typography color="black">
              {order.deliveryType === "store_pickup"
                ? "Store Pickup"
                : order.shippingAddress}
            </Typography>
          </Box>

          {/* Products */}
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              color="black"
              sx={{ fontWeight: 600, fontSize: 20 }}
            >
              Products
            </Typography>
            {order.products.map((product, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={product.image} variant="rounded" />
                  <Box flex={1}>
                    <Typography color="black">{product.name}</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" color="black">
                        Quantity: {product.quantity}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: getInventoryColor(product.inventory),
                          fontWeight: "medium",
                        }}
                      >
                        {getInventoryText(product.inventory)} (
                        {product.inventory})
                      </Typography>
                    </Stack>
                  </Box>
                  <Typography color="black">
                    ${product.price.toFixed(2)}
                  </Typography>
                </Stack>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography
                variant="subtitle1"
                color="black"
                sx={{ fontWeight: 600, fontSize: 20 }}
              >
                Total
              </Typography>
              <Typography variant="subtitle1" color="black">
                ${order.total.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons - NEW STATUS */}
          {order.status === "New" && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  color: "white",
                  backgroundColor: "black",
                  "&:hover": {
                    backgroundColor: "#333",
                  },
                }}
                onClick={handleAcceptOrder}
                disabled={isUpdating}
              >
                {isUpdating ? "Accepting Order..." : "Accept Order"}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  color: "black",
                  borderColor: "black",
                  "&:hover": {
                    borderColor: "black",
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
                onClick={handleCancelOrder}
              >
                Cancel Order
              </Button>
            </Stack>
          )}

          {/* Action Buttons - ON GOING STATUS (Only Ship Package button) */}
          {order.status === "On Going" && (
            <Button
              variant="contained"
              fullWidth
              sx={{
                color: "white",
                backgroundColor: "#FF9800",
                "&:hover": {
                  backgroundColor: "#F57C00",
                },
              }}
              onClick={handleShipPackage}
            >
              Ship Package
            </Button>
          )}

          {/* Show tracking info for To Ship and Completed orders */}
          {(order.status === "To Ship" || order.status === "Completed") && (
            <Box
              sx={{
                p: 2,
                bgcolor: "#e3f2fd",
                borderRadius: 1,
                border: "1px solid #2196f3",
              }}
            >
              <Typography variant="body2" color="black" fontWeight={600}>
                📦 Package{" "}
                {order.status === "To Ship" ? "Ready to Ship" : "Delivered"}
              </Typography>
              {order.courier && (
                <Typography variant="body2" color="black">
                  Courier: {order.courier}
                </Typography>
              )}
              {order.trackingNumber && (
                <Typography variant="body2" color="black">
                  Tracking: {order.trackingNumber}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </Drawer>

      {/* Ship Modal */}
      <OrderShip
        visible={showShipModal}
        onClose={() => setShowShipModal(false)}
        onShipped={handleShipped}
        order={order}
      />

      {/* Confirm Cancellation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        sx={{
          zIndex: 1500,
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20 }}>
          Confirm Cancellation
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel order #{order?.id}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            variant="outlined"
            fullWidth
            sx={{
              color: "black",
              borderColor: "black",
              "&:hover": {
                borderColor: "black",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            No
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#F44336",
              color: "white",
              "&:hover": {
                backgroundColor: "#D32F2F",
              },
            }}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderDetailsDrawer;