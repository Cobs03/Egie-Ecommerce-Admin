import React, { useState, useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Toaster, toast } from "sonner";
import OrderHeader from "./Order Components/OrderHeader";
import OrderTable from "./Order Components/OrderTable";
import OrderDetailsDrawer from "./Order Components/OrderDetailsDrawer";
import { OrderService } from "../../services/OrderService";
import { getImageUrl } from "../../lib/imageHelper";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../utils/permissions";
import { useAuth } from "../../contexts/AuthContext";

const Order = () => {
  // ALL HOOKS MUST BE AT THE TOP - before any conditional returns
  const permissions = usePermissions();
  const { loading: authLoading } = useAuth();
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

  // Define loadOrders function (hoisted)
  async function loadOrders() {
    setLoading(true);
    try {
      const { data, error } = await OrderService.getAllOrders();
      
      if (error) {
        console.error('Error loading orders:', error);
        toast.error('Failed to load orders');
        setOrders([]); // Set empty array on error
        return;
      }
      
      if (data && Array.isArray(data)) {
        // Transform database data to match component's expected format
        const transformedOrders = data.map(order => {
          // Calculate total: subtotal - discount + shipping_fee (if exists)
          const orderTotal = (order.subtotal || 0) - (order.discount || 0) + (order.shipping_fee || 0);
          
          // Get customer info from user_profile (if available) or shipping address
          const customerName = order.user_profile 
            ? `${order.user_profile.first_name} ${order.user_profile.last_name}`
            : order.shipping_addresses?.full_name || 'Unknown';
          
          const customerEmail = order.user_profile?.email || order.shipping_addresses?.email || '';
          const customerAvatar = order.user_profile?.avatar_url || null;
          
          // Process order items to ensure images have full URLs
          const processedItems = (order.order_items || []).map(item => {
            const imageUrl = getImageUrl(item.product_image);
            console.log(`Order ${order.order_number} - Product: ${item.product_name}`);
            console.log(`  Raw image path: ${item.product_image}`);
            console.log(`  Processed URL: ${imageUrl}`);
            return {
              ...item,
              product_image: imageUrl
            };
          });
          
          // Build address string
          let shippingAddressString = 'N/A';
          if (order.shipping_addresses) {
            const addr = order.shipping_addresses;
            const parts = [
              addr.street_address,
              addr.barangay,
              addr.city,
              addr.province,
              addr.postal_code
            ].filter(Boolean);
            shippingAddressString = parts.length > 0 ? parts.join(', ') : 'N/A';
          }
          
          return {
            id: order.order_number,
            orderId: order.id,
            customer: {
              name: customerName,
              email: customerEmail,
              phone: order.shipping_addresses?.phone || order.user_profile?.phone || '',
              avatar: customerAvatar
            },
            date: new Date(order.created_at).toLocaleDateString(),
            status: order.status,
            total: `₱${orderTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            items: processedItems,
            payment: order.payments?.[0] || null,
            shipping: order.shipping_addresses || null,
            deliveryType: order.delivery_type,
            orderNotes: order.order_notes,
            customerNotes: order.customer_notes,
            shippingAddress: shippingAddressString,
            courierName: order.courier_name || null,
            trackingNumber: order.tracking_number || null,
            rawData: order // Keep original data for reference
          };
        });
        
        setOrders(transformedOrders);
      } else {
        setOrders([]); // Set empty array if data is not valid
      }
    } catch (error) {
      console.error('Error in loadOrders:', error);
      toast.error('Failed to load orders');
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

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
      // The actual update is handled in OrderDetailsDrawer
      // Just refresh the orders list to get latest data from database
      await loadOrders();
      
      // Close drawer after successful update
      setDrawerOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error refreshing orders:', error);
      toast.error('Failed to refresh orders');
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </Box>
    );
  }

  // Check if user has permission to view orders
  if (!permissions.can(PERMISSIONS.ORDER_VIEW)) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have permission to view orders.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Contact your administrator for access.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const filteredOrders = Array.isArray(orders) ? orders.filter((order) => {
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
  }) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="bottom-right" richColors />
      
      <OrderHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalOrders={filteredOrders.length}
      />

      <OrderTable 
        orders={filteredOrders} 
        onOrderClick={handleOrderClick}
        loading={loading}
      />

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
