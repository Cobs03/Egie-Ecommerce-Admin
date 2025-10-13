import React, { useState } from "react";
import { Box } from "@mui/material";
import { Toaster } from "sonner";
import OrderHeader from "./Order Components/OrderHeader";
import OrderTable from "./Order Components/OrderTable";
import OrderDetailsDrawer from "./Order Components/OrderDetailsDrawer";
import { orders as ordersData } from "./Order Components/ordersData";

const Order = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [orders, setOrders] = useState(ordersData);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedTab === 0
        ? true
        : selectedTab === 1
        ? order.status === "New"
        : selectedTab === 2
        ? order.status === "On Going"
        : selectedTab === 3
        ? order.status === "Completed"
        : order.status === "Cancelled";

    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="bottom-right" richColors />
      
      <OrderHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalOrders={filteredOrders.length}
      />

      <OrderTable orders={filteredOrders} onOrderClick={handleOrderClick} />

      <OrderDetailsDrawer
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onOrderUpdate={handleOrderUpdate}
      />
    </Box>
  );
};

export default Order;
