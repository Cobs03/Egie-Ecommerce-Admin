import React, { useState } from "react";
import { Box } from "@mui/material";
import { toast, Toaster } from "sonner";
import PaymentHeader from "./Payment Components/PaymentHeader";
import PaymentTable from "./Payment Components/PaymentTable";
import PaymentDetailsDrawer from "./Payment Components/PaymentDetailsDrawer";
import PaymentOrderDetailsDrawer from "./Payment Components/PaymentOrderDetailsDrawer";
import { paymentData, mockOrder } from "./Payment Components/paymentData";

const Payment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [payments, setPayments] = useState(paymentData);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);

  const handleViewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setPaymentDrawerOpen(true);
  };

  const handleViewOrderDetails = () => {
    setOrderDrawerOpen(true);
  };

  const handleMarkAsPaid = (payment) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.orderId === payment.orderId ? { ...p, status: "Paid" } : p
      )
    );
    setPaymentDrawerOpen(false);
    toast.success("Payment Marked as Paid", {
      description: `Order ${payment.orderId} has been marked as paid.`,
      duration: 3000,
    });
  };

  const handleFilterClick = () => {
    toast.info("Filter feature coming soon!", { duration: 2000 });
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        order={mockOrder}
      />
    </Box>
  );
};

export default Payment;
