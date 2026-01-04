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
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "sonner";
import StatusBadge from "../../../components/StatusBadge";
import ShippingDialog from "../../../components/ShippingDialog";
import { OrderService } from "../../../services/OrderService";
import { usePermissions } from "../../../hooks/usePermissions";
import { PERMISSIONS } from "../../../utils/permissions";

const OrderDetailsDrawer = ({ open, onClose, order, onOrderUpdate }) => {
  const permissions = usePermissions();
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  const handleStatusChange = async (newStatus, shippingInfo = null) => {
    if (!order?.orderId) {
      toast.error('Invalid order data');
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await OrderService.updateOrderStatus(
        order.orderId,
        newStatus,
        shippingInfo
      );

      if (error) {
        toast.error(`Failed to update order: ${error}`);
        return;
      }

      // Update local order state
      const updatedOrder = { ...order, status: newStatus };
      if (shippingInfo && newStatus === 'shipped') {
        updatedOrder.courierName = shippingInfo.courierName;
        updatedOrder.trackingNumber = shippingInfo.trackingNumber;
      }
      
      onOrderUpdate(updatedOrder);
      
      // Show success message
      const messages = {
        confirmed: 'Order confirmed successfully',
        processing: 'Order is now being processed',
        shipped: 'Order marked as shipped',
        ready_for_pickup: 'Order is ready for pickup',
        delivered: 'Order marked as delivered',
        completed: 'Order marked as completed',
        cancelled: 'Order has been cancelled'
      };
      
      toast.success(messages[newStatus] || 'Order updated', {
        description: `Order #${order.id}`,
        duration: 4000,
      });

      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmOrder = () => {
    handleStatusChange('confirmed');
  };

  const handleStartProcessing = () => {
    handleStatusChange('processing');
  };

  const handleMarkAsShipped = () => {
    setShippingDialogOpen(true);
  };

  const handleShippingSubmit = (shippingInfo) => {
    setShippingDialogOpen(false);
    handleStatusChange('shipped', shippingInfo);
  };

  const handleMarkAsReadyForPickup = () => {
    handleStatusChange('ready_for_pickup');
  };

  const handleMarkAsDelivered = () => {
    setActionType('delivered');
    setConfirmDialogOpen(true);
  };

  const handleMarkAsCompleted = () => {
    setActionType('completed');
    setConfirmDialogOpen(true);
  };

  const handleCancelOrder = () => {
    setActionType('cancel');
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = () => {
    setConfirmDialogOpen(false);
    if (actionType === 'cancel') {
      handleStatusChange('cancelled');
    } else if (actionType === 'delivered') {
      handleStatusChange('delivered');
    } else if (actionType === 'completed') {
      handleStatusChange('completed');
    }
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

  // Determine which action buttons to show based on status
  const getActionButtons = () => {
    const status = order.status?.toLowerCase();

    if (status === 'pending') {
      const canAccept = permissions.can(PERMISSIONS.ORDER_ACCEPT);
      return (
        <Stack direction="row" spacing={2}>
          <Tooltip title={!canAccept ? "You don't have permission to confirm orders" : ""}>
            <span style={{ width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: '#00E676',
                  '&:hover': { bgcolor: '#00C767' },
                  '&.Mui-disabled': { bgcolor: '#E0E0E0' }
                }}
                onClick={handleConfirmOrder}
                disabled={isUpdating || !canAccept}
              >
                Confirm Order
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            fullWidth
            color="error"
            onClick={handleCancelOrder}
          >
            Cancel
          </Button>
        </Stack>
      );
    }

    if (status === 'confirmed') {
      return (
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: '#42A5F5',
            '&:hover': { bgcolor: '#1E88E5' }
          }}
          onClick={handleStartProcessing}
          disabled={isUpdating}
        >
          Start Processing
        </Button>
      );
    }

    if (status === 'processing') {
      // Check if this is a pickup order using standardized property
      const deliveryType = (order.deliveryType || '').toLowerCase();
      const isPickup = deliveryType === 'pickup' || 
                       deliveryType === 'store_pickup' ||
                       deliveryType.includes('pickup');
      if (isPickup) {
        return (
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#00BCD4',
              '&:hover': { bgcolor: '#0097A7' }
            }}
            onClick={handleMarkAsReadyForPickup}
            disabled={isUpdating}
          >
            Mark as Ready for Pickup
          </Button>
        );
      }
      
      return (
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: '#AB47BC',
            '&:hover': { bgcolor: '#8E24AA' }
          }}
          onClick={handleMarkAsShipped}
          disabled={isUpdating}
        >
          Mark as Shipped
        </Button>
      );
    }

    if (status === 'ready_for_pickup') {
      return (
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: '#00E676',
            '&:hover': { bgcolor: '#00C767' }
          }}
          onClick={handleMarkAsCompleted}
          disabled={isUpdating}
        >
          Mark as Completed (Picked Up)
        </Button>
      );
    }

    if (status === 'shipped') {
      return (
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: '#00E676',
            '&:hover': { bgcolor: '#00C767' }
          }}
          onClick={handleMarkAsDelivered}
          disabled={isUpdating}
        >
          Mark as Delivered
        </Button>
      );
    }

    // For delivered, completed, or cancelled - show info only
    if (status === 'cancelled') {
      // Check both camelCase and snake_case versions
      const cancellationReason = order.orderNotes || order.order_notes || order.rawData?.order_notes;
      const customerNotes = order.rawData?.customer_notes;
      
      return (
        <Box 
          sx={{ 
            bgcolor: '#FFEBEE', 
            p: 2, 
            borderRadius: 1,
            border: '1px solid #EF5350'
          }}
        >
          <Typography variant="body2" color="error" sx={{ fontWeight: 600, textAlign: 'center' }}>
            ⚠️ This order has been cancelled by the customer
          </Typography>
          {cancellationReason && (
            <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
              <strong>Cancellation Reason:</strong> {cancellationReason}
            </Typography>
          )}
          {customerNotes && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center', fontStyle: 'italic' }}>
              Customer Note: "{customerNotes}"
            </Typography>
          )}
        </Box>
      );
    }

    return null;
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
              <StatusBadge status={order.status} />
            </Box>
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

          {/* Customer Order Notes (from checkout) */}
          {order.customerNotes && order.status?.toLowerCase() !== 'cancelled' && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#FFF9C4', borderRadius: 1, border: '1px solid #FBC02D' }}>
              <Typography variant="body2" color="black" fontWeight={600}>
                📝 Customer Note:
              </Typography>
              <Typography variant="body2" color="black">
                {order.customerNotes}
              </Typography>
            </Box>
          )}

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
                        ₱{Number(product.unit_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
                      </Typography>
                    </Stack>
                  </Box>
                  <Typography color="black">
                    ₱{Number(product.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Stack>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            
            {/* Order Summary */}
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body2" color="black">
                  ₱{Number(order.rawData?.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              
              {order.rawData?.voucher_discount > 0 && (
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                    Voucher Discount {order.rawData?.voucher_code && `(${order.rawData.voucher_code})`}
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                    -₱{Number(order.rawData.voucher_discount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              )}
              
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Shipping Fee
                </Typography>
                <Typography variant="body2" color="black">
                  ₱{Number(order.rawData?.shipping_fee || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
            
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
                ₱{(() => {
                  const subtotal = Number(order.rawData?.subtotal || 0);
                  const voucherDiscount = Number(order.rawData?.voucher_discount || 0);
                  const shippingFee = Number(order.rawData?.shipping_fee || 0);
                  const total = subtotal - voucherDiscount + shippingFee;
                  return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                })()}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          {getActionButtons()}

          {/* Show shipping tracking info for shipped/delivered orders */}
          {(order.status?.toLowerCase() === 'shipped' || order.status?.toLowerCase() === 'delivered') && 
           (order.courierName || order.trackingNumber) && (
            <Box
              sx={{
                p: 2,
                bgcolor: "#e3f2fd",
                borderRadius: 1,
                border: "1px solid #2196f3",
              }}
            >
              <Typography variant="body2" color="black" fontWeight={600}>
                📦 Shipping Information
              </Typography>
              {order.courierName && (
                <Typography variant="body2" color="black">
                  Courier: {order.courierName}
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

      {/* Shipping Dialog */}
      <ShippingDialog
        open={shippingDialogOpen}
        onClose={() => setShippingDialogOpen(false)}
        onSubmit={handleShippingSubmit}
        orderNumber={order?.id}
      />

      {/* Confirm Action Dialog */}
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
          {actionType === 'cancel' ? 'Confirm Cancellation' : 'Confirm Delivery'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {actionType === 'cancel' 
              ? `Are you sure you want to cancel order #${order?.id}? This action cannot be undone.`
              : `Confirm that order #${order?.id} has been delivered to the customer?`
            }
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
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: actionType === 'cancel' ? "#F44336" : "#00E676",
              color: "white",
              "&:hover": {
                backgroundColor: actionType === 'cancel' ? "#D32F2F" : "#00C767",
              },
            }}
          >
            {actionType === 'cancel' ? 'Yes, Cancel Order' : 'Yes, Mark as Delivered'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderDetailsDrawer;