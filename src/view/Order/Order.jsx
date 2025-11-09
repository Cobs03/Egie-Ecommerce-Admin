import React, { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Toaster, toast } from "sonner";
import OrderHeader from "./Order Components/OrderHeader";
import OrderTable from "./Order Components/OrderTable";
import OrderDetailsDrawer from "./Order Components/OrderDetailsDrawer";
import { OrderService } from "../../services/OrderService";

const Order = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await OrderService.getAllOrders();
      
      if (error) {
        console.error('Error loading orders:', error);
        toast.error('Failed to load orders');
        return;
      }
      
      if (data) {
        // Transform database data to match component's expected format
        const transformedOrders = data.map(order => ({
          id: order.order_number,
          orderId: order.id,
          customer: {
            name: order.profiles 
              ? `${order.profiles.first_name} ${order.profiles.last_name}`
              : order.shipping_addresses?.full_name || 'Unknown',
            email: order.profiles?.email || order.shipping_addresses?.email || '',
            phone: order.shipping_addresses?.phone || ''
          },
          date: new Date(order.created_at).toLocaleDateString(),
          status: order.order_status,
          total: order.grand_total,
          items: order.order_items || [],
          payment: order.payments?.[0] || null,
          shipping: order.shipping_addresses || null,
          deliveryType: order.delivery_type,
          orderNotes: order.order_notes,
          rawData: order // Keep original data for reference
        }));
        
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error in loadOrders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

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

  const handleOrderUpdate = async (updatedOrder) => {
    try {
      // Update order status in database
      const { data, error } = await OrderService.updateOrderStatus(
        updatedOrder.orderId,
        updatedOrder.status
      );
      
      if (error) {
        toast.error('Failed to update order status');
        return;
      }
      
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedTab === 0
        ? true
        : selectedTab === 1
        ? order.status === "pending" || order.status === "New"
        : selectedTab === 2
        ? order.status === "processing" || order.status === "On Going"
        : selectedTab === 3
        ? order.status === "completed" || order.status === "Completed"
        : order.status === "cancelled" || order.status === "Cancelled";

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

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
