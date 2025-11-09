import React, { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { toast, Toaster } from "sonner";
import PaymentHeader from "./Payment Components/PaymentHeader";
import PaymentTable from "./Payment Components/PaymentTable";
import PaymentDetailsDrawer from "./Payment Components/PaymentDetailsDrawer";
import PaymentOrderDetailsDrawer from "./Payment Components/PaymentOrderDetailsDrawer";
import { PaymentService } from "../../services/PaymentService";
import { OrderService } from "../../services/OrderService";

const Payment = () => {
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

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await PaymentService.getAllPayments();
      
      if (error) {
        console.error('Error loading payments:', error);
        toast.error('Failed to load payments');
        return;
      }
      
      if (data) {
        // Transform database data to match component's expected format
        const transformedPayments = data.map(payment => ({
          orderId: payment.orders?.order_number || 'N/A',
          orderDbId: payment.order_id,
          transactionId: payment.transaction_id,
          method: payment.payment_method,
          amount: payment.amount,
          status: payment.payment_status,
          date: new Date(payment.created_at).toLocaleDateString(),
          paidAt: payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : null,
          cardLastFour: payment.card_last_four,
          cardType: payment.card_type,
          gcashReference: payment.gcash_reference,
          gcashPhone: payment.gcash_phone,
          notes: payment.payment_notes,
          rawData: payment // Keep original data
        }));
        
        setPayments(transformedPayments);
      }
    } catch (error) {
      console.error('Error in loadPayments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setPaymentDrawerOpen(true);
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
        setSelectedOrder(data);
        setOrderDrawerOpen(true);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleMarkAsPaid = async (payment) => {
    try {
      const { data, error} = await PaymentService.markAsPaid(payment.rawData.id);
      
      if (error) {
        toast.error('Failed to mark payment as paid');
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

  const filteredPayments = payments.filter(
    (payment) =>
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Toaster position="bottom-right" richColors />

      <PaymentHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={handleFilterClick}
      />

      <PaymentTable
        payments={filteredPayments}
        onViewPaymentDetails={handleViewPaymentDetails}
        onViewOrderDetails={handleViewOrderDetails}
      />

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
