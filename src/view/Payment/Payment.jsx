import React, { useState, useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import PaymentHeader from "./Payment Components/PaymentHeader";
import PaymentTable from "./Payment Components/PaymentTable";
import PaymentDetailsDrawer from "./Payment Components/PaymentDetailsDrawer";
import PaymentOrderDetailsDrawer from "./Payment Components/PaymentOrderDetailsDrawer";
import { PaymentService } from "../../services/PaymentService";
import { OrderService } from "../../services/OrderService";
import { getImageUrl } from "../../lib/imageHelper";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../utils/permissions";
import { useAuth } from "../../contexts/AuthContext";

const Payment = () => {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const permissions = usePermissions();
  const { loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load payments on component mount
  useEffect(() => {
    loadPayments();
  }, []);

  // Define loadPayments function (hoisted)
  async function loadPayments() {
    setLoading(true);
    try {
      const { data, error } = await PaymentService.getAllPayments();
      
      if (error) {
        console.error('Error loading payments:', error);
        toast.error('Failed to load payments');
        setPayments([]); // Set empty array on error
        return;
      }
      
      if (data && Array.isArray(data)) {
        // Transform database data to match component's expected format
        const transformedPayments = data.map(payment => {
          const createdDate = new Date(payment.created_at);
          const dateTimeString = createdDate.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          // If order is cancelled, payment status should also be cancelled
          const orderStatus = payment.orders?.status || 'unknown';
          const paymentStatus = orderStatus === 'cancelled' ? 'cancelled' : payment.payment_status;
          
          // Debug logging for cancelled orders
          if (orderStatus === 'cancelled') {
            console.log(`🚫 Cancelled Order - ${payment.orders?.order_number}:`, {
              orderStatus,
              originalPaymentStatus: payment.payment_status,
              newPaymentStatus: paymentStatus
            });
          }
          
          return {
            orderId: payment.orders?.order_number || 'N/A',
            orderDbId: payment.order_id,
            transactionId: payment.transaction_id,
            method: payment.payment_method.toUpperCase(),
            amount: `₱${(payment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: paymentStatus,
            orderStatus: orderStatus,
            dateTime: dateTimeString,
            date: createdDate.toLocaleDateString(),
            paidAt: payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : null,
            cardLastFour: payment.card_last_four,
            cardType: payment.card_type,
            gcashReference: payment.gcash_reference,
            gcashPhone: payment.gcash_phone,
            notes: payment.payment_notes,
            rawData: payment // Keep original data
          };
        });
        
        setPayments(transformedPayments);
      } else {
        setPayments([]); // Set empty array if data is not valid
      }
    } catch (error) {
      console.error('Error in loadPayments:', error);
      toast.error('Failed to load payments');
      setPayments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  const handleViewPaymentDetails = async (payment) => {
    try {
      // Fetch order details to get customer/user information
      const { data, error } = await OrderService.getOrderById(payment.orderDbId);
      
      if (error) {
        console.error('Error loading order for payment details:', error);
        // Still show payment details even if order fetch fails
        setSelectedPayment(payment);
        setPaymentDrawerOpen(true);
        return;
      }
      
      // Attach customer info to payment
      if (data) {
        console.log('🔍 PAYMENT DETAILS - Order data:', data);
        console.log('🔍 PAYMENT DETAILS - shipping_address_id:', data.shipping_address_id);
        console.log('🔍 PAYMENT DETAILS - delivery_type:', data.delivery_type);
        console.log('🔍 PAYMENT DETAILS - Shipping address object:', data.shipping_addresses);
        
        const customerName = data.user_profile 
          ? `${data.user_profile.first_name} ${data.user_profile.last_name}`
          : data.shipping_addresses?.full_name || 'Unknown';
        
        // Build address string
        let addressString = 'N/A';
        if (data.shipping_addresses) {
          const addr = data.shipping_addresses;
          console.log('🔍 PAYMENT DETAILS - Address fields:', {
            street_address: addr.street_address,
            barangay: addr.barangay,
            city: addr.city,
            province: addr.province,
            postal_code: addr.postal_code
          });
          
          const parts = [
            addr.street_address,
            addr.barangay,
            addr.city,
            addr.province,
            addr.postal_code
          ].filter(Boolean);
          addressString = parts.length > 0 ? parts.join(', ') : 'N/A';
          console.log('🔍 PAYMENT DETAILS - Filtered parts:', parts);
        } else {
          console.log('⚠️ PAYMENT DETAILS - shipping_addresses is NULL or UNDEFINED!');
        }
        
        console.log('🔍 PAYMENT DETAILS - Final address string:', addressString);
        
        const enrichedPayment = {
          ...payment,
          customerInfo: {
            name: customerName,
            email: data.user_profile?.email || data.shipping_addresses?.email || 'N/A',
            phone: data.user_profile?.phone || data.shipping_addresses?.phone || 'N/A',
            avatar: data.user_profile?.avatar_url || null,
            address: addressString
          }
        };
        setSelectedPayment(enrichedPayment);
      } else {
        setSelectedPayment(payment);
      }
      
      setPaymentDrawerOpen(true);
    } catch (error) {
      console.error('Error in handleViewPaymentDetails:', error);
      setSelectedPayment(payment);
      setPaymentDrawerOpen(true);
    }
  };

  const handleViewOrderDetails = async (payment) => {
    try {
      // Fetch order details for the payment
      const { data, error } = await OrderService.getOrderById(payment.orderDbId);
      
      if (error) {
        toast.error('Failed to load order details');
        return;
      }
      
      if (data) {
        console.log('Order data for order details:', data);
        console.log('Order items:', data.order_items);
        
        // Transform the order data to match the expected format
        const orderTotal = (data.subtotal || 0) - (data.discount || 0) + (data.shipping_fee || 0);
        
        // Get customer info from user_profile (if available) or shipping address
        const customerName = data.user_profile 
          ? `${data.user_profile.first_name} ${data.user_profile.last_name}`
          : data.shipping_addresses?.full_name || 'Unknown';
        
        const customerEmail = data.user_profile?.email || data.shipping_addresses?.email || '';
        const customerAvatar = data.user_profile?.avatar_url || null;
        
        // Process order items to ensure images have full URLs
        const processedItems = (data.order_items || []).map(item => {
          const imageUrl = getImageUrl(item.product_image);
          console.log(`Product: ${item.product_name}, Image: ${item.product_image} -> ${imageUrl}`);
          return {
            ...item,
            product_image: imageUrl
          };
        });
        
        // Build address string
        let addressString = 'N/A';
        if (data.shipping_addresses) {
          const addr = data.shipping_addresses;
          const parts = [
            addr.street_address,
            addr.barangay,
            addr.city,
            addr.province,
            addr.postal_code
          ].filter(Boolean);
          addressString = parts.length > 0 ? parts.join(', ') : 'N/A';
        }
        
        const transformedOrder = {
          id: data.order_number,
          orderId: data.id,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: data.shipping_addresses?.phone || data.user_profile?.phone || '',
            avatar: customerAvatar
          },
          date: new Date(data.created_at).toLocaleDateString(),
          status: data.order_status,
          total: orderTotal,
          items: processedItems,
          payment: data.payments?.[0] || null,
          shipping: data.shipping_addresses || null,
          deliveryType: data.delivery_type,
          orderNotes: data.order_notes,
          shippingAddress: addressString,
          rawData: data
        };
        
        setSelectedOrder(transformedOrder);
        setOrderDrawerOpen(true);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleMarkAsPaid = async (payment) => {
    try {
      const response = await PaymentService.markAsPaid(payment.rawData.id);
      
      if (!response.success) {
        console.error('Payment error:', response.error);
        toast.error(`Failed to mark payment as paid: ${response.error}`);
        return;
      }
      
      // Reload payments to get updated data
      await loadPayments();
      
      setPaymentDrawerOpen(false);
      toast.success("Payment Marked as Paid", {
        description: `Order ${payment.orderId} has been marked as paid.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error('Failed to mark payment as paid');
    }
  };

  const handleFilterClick = () => {
    toast.info("Filter feature coming soon!", { duration: 2000 });
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </Box>
    );
  }

  // Check if user has permission to view payments
  if (!permissions.can(PERMISSIONS.PAYMENT_VIEW)) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have permission to view payment records.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Only Admins and Managers can access this page.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const filteredPayments = Array.isArray(payments) ? payments.filter(
    (payment) =>
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <Box p={2}>
      <Toaster position="bottom-right" richColors />

      <PaymentHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={handleFilterClick}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <PaymentTable
          payments={filteredPayments}
          onViewPaymentDetails={handleViewPaymentDetails}
          onViewOrderDetails={handleViewOrderDetails}
          loading={loading}
        />
      </motion.div>

      <PaymentDetailsDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        payment={selectedPayment}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <PaymentOrderDetailsDrawer
        open={orderDrawerOpen}
        onClose={() => setOrderDrawerOpen(false)}
        order={selectedOrder}
      />
    </Box>
  );
};

export default Payment;
