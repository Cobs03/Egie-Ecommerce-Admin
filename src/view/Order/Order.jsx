import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";

import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Grid,
  Divider,
  Stack,
  Tabs,
  Tab,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Search,
  FilterList,
  MoreVert,
  LocalShipping,
  CheckCircle,
  Cancel,
  AccessTime,
} from "@mui/icons-material";
import OrderShip from "./OrderShip";
// Sample data structure for orders
const orders = [
  {
    id: "ORD001",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "https://via.placeholder.com/40",
    },
    products: [
      {
        name: "Product 1",
        quantity: 2,
        price: 29.99,
        image: "https://via.placeholder.com/40",
        inventory: 15,
      },
      {
        name: "Product 2",
        quantity: 1,
        price: 49.99,
        image: "https://via.placeholder.com/40",
        inventory: 3,
      },
    ],
    total: 109.97,
    status: "New",
    date: "2024-03-20",
    shippingAddress: "123 Main St, City, Country",
    deliveryType: "delivery",
  },
  {
    id: "ORD002",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "https://via.placeholder.com/40",
    },
    products: [
      {
        name: "Product 3",
        quantity: 1,
        price: 59.99,
        image: "https://via.placeholder.com/40",
        inventory: 0,
      },
    ],
    total: 59.99,
    status: "New",
    date: "2024-03-21",
    shippingAddress: "456 Elm St, City, Country",
    deliveryType: "store_pickup",
  },
  {
    id: "ORD003",
    customer: {
      name: "Alice Johnson",
      email: "alice@example.com",
      avatar: "https://via.placeholder.com/40",
    },
    products: [
      {
        name: "Product 4",
        quantity: 3,
        price: 19.99,
        image: "https://via.placeholder.com/40",
        inventory: 10,
      },
    ],
    total: 59.97,
    status: "Completed",
    date: "2024-03-18",
    shippingAddress: "789 Pine St, City, Country",
    deliveryType: "delivery",
  },
  {
    id: "ORD004",
    customer: {
      name: "Bob Lee",
      email: "bob@example.com",
      avatar: "https://via.placeholder.com/40",
    },
    products: [
      {
        name: "Product 5",
        quantity: 2,
        price: 39.99,
        image: "https://via.placeholder.com/40",
        inventory: 0,
      },
      {
        name: "Product 6",
        quantity: 1,
        price: 24.99,
        image: "https://via.placeholder.com/40",
        inventory: 5,
      },
    ],
    total: 104.97,
    status: "Cancelled",
    date: "2024-03-19",
    shippingAddress: "321 Oak St, City, Country",
    deliveryType: "delivery",
  },
  {
    id: "ORD005",
    customer: {
      name: "Chris Martin",
      email: "chris@example.com",
      avatar: "https://via.placeholder.com/40",
    },
    products: [
      {
        name: "Product 7",
        quantity: 1,
        price: 99.99,
        image: "https://via.placeholder.com/40",
        inventory: 1,
      },
    ],
    total: 99.99,
    status: "New",
    date: "2024-03-22",
    shippingAddress: "555 Maple St, City, Country",
    deliveryType: "delivery",
  },
  {
    id: "ORD006",
    customer: {
      name: "Diana Prince",
      email: "diana@example.com",
      avatar: "https://via.placeholder.com/40",
    },
    products: [
      {
        name: "Product 8",
        quantity: 2,
        price: 45.0,
        image: "https://via.placeholder.com/40",
        inventory: 2,
      },
    ],
    total: 90.0,
    status: "On Going",
    date: "2024-03-23",
    shippingAddress: "Wonderland Ave, City, Country",
    deliveryType: "delivery",
  },
  {
    id: "ORD007",
    customer: {
      name: "Clark Kent",
      email: "clark@example.com",
      avatar: "https://via.placeholder.com/40",
    },
    products: [
      {
        name: "Product 9",
        quantity: 1,
        price: 150.0,
        image: "https://via.placeholder.com/40",
        inventory: 0,
      },
    ],
    total: 150.0,
    status: "Completed",
    date: "2024-03-17",
    shippingAddress: "Fortress of Solitude, North Pole",
    deliveryType: "delivery",
  },
  {
    id: "ORD008",
    customer: {
      name: "Bruce Wayne",
      email: "bruce@example.com",
      avatar: "https://via.placeholder.com/40",
    },
    products: [
      {
        name: "Product 10",
        quantity: 3,
        price: 33.33,
        image: "https://via.placeholder.com/40",
        inventory: 1,
      },
    ],
    total: 99.99,
    status: "Cancelled",
    date: "2024-03-16",
    shippingAddress: "Wayne Manor, Gotham",
    deliveryType: "delivery",
  },
];

const Order = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "primary";
      case "On Going":
        return "warning";
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "New":
        return <AccessTime />;
      case "On Going":
        return <LocalShipping />;
      case "Completed":
        return <CheckCircle />;
      case "Cancelled":
        return <Cancel />;
      default:
        return null;
    }
  };

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
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Order Management
      </Typography>

      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1">
          All Orders ({filteredOrders.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search Orders"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
            }}
          />
          <Button variant="outlined" startIcon={<FilterList />}>
            Filters
          </Button>
        </Stack>
      </Grid>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="All Orders" />
        <Tab label="New Orders" />
        <Tab label="On Going" />
        <Tab label="Completed" />
        <Tab label="Cancelled" />
      </Tabs>

      <Paper elevation={1}>
        <Grid container justifyContent="space-between" p={2} fontWeight="bold">
          <Grid item xs={3}>
            Order Details
          </Grid>
          <Grid item xs={3}>
            Customer
          </Grid>
          <Grid item xs={2}>
            Total
          </Grid>
          <Grid item xs={2}>
            Status
          </Grid>
          <Grid item xs={2}>
            Date
          </Grid>
        </Grid>
        <Divider />

        {filteredOrders.map((order, idx) => (
          <React.Fragment key={order.id}>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              p={2}
              sx={{ cursor: "pointer" }}
              onClick={() => handleOrderClick(order)}
            >
              <Grid item xs={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box>
                    <Typography variant="subtitle2">#{order.id}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.products.length} items
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={order.customer.avatar}
                    alt={order.customer.name}
                  />
                  <Box>
                    <Typography>{order.customer.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customer.email}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={2}>
                <Typography>${order.total.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Chip
                  icon={getStatusIcon(order.status)}
                  label={order.status}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2" color="text.secondary">
                  {order.date}
                </Typography>
              </Grid>
            </Grid>
            {idx < filteredOrders.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Paper>

      {/* Order Details Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{ sx: { width: 400, p: 3, bgcolor: "#f5f5f5" } }}
      >
        <OrderShip
          visible={showShipModal}
          onClose={() => setShowShipModal(false)}
          onShipped={() => {
            setShowShipModal(false);
            setDrawerOpen(false);
            setSelectedOrder(null);
          }}
          order={
            selectedOrder && selectedOrder.deliveryType === "delivery"
              ? {
                  name: selectedOrder.customer.name,
                  email: selectedOrder.customer.email,
                  phone: selectedOrder.customer.phone || "",
                  address: selectedOrder.shippingAddress,
                  paymentMethod: selectedOrder.paymentMethod || "",
                  productImg: selectedOrder.products[0]?.image,
                  productName: selectedOrder.products[0]?.name,
                  productDesc: "",
                  qty: selectedOrder.products[0]?.quantity,
                  price: selectedOrder.products[0]?.price,
                }
              : null
          }
        />
        {selectedOrder && (
          <>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={3}
            >
              <Typography variant="h6">Order Details</Typography>
              <IconButton onClick={handleDrawerClose}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Order Information
                </Typography>
                <Typography>Order ID: #{selectedOrder.id}</Typography>
                <Typography>Date: {selectedOrder.date}</Typography>
                <Typography>Status: {selectedOrder.status}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Customer Information
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={selectedOrder.customer.avatar} />
                  <Box>
                    <Typography>{selectedOrder.customer.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedOrder.customer.email}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {selectedOrder.deliveryType === "store_pickup"
                    ? "Pickup Information"
                    : "Shipping Address"}
                </Typography>
                <Typography>
                  {selectedOrder.deliveryType === "store_pickup"
                    ? "Store Pickup"
                    : selectedOrder.shippingAddress}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Products
                </Typography>
                {selectedOrder.products.map((product, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={product.image} variant="rounded" />
                      <Box flex={1}>
                        <Typography>{product.name}</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2" color="text.secondary">
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
                      <Typography>${product.price.toFixed(2)}</Typography>
                    </Stack>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle1">Total</Typography>
                  <Typography variant="subtitle1">
                    ${selectedOrder.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {selectedOrder.status === "New" &&
                (selectedOrder.deliveryType === "delivery" ? (
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ color: "white", backgroundColor: "black" }}
                    onClick={() => setShowShipModal(true)}
                  >
                    Deliver
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ color: "white", backgroundColor: "black" }}
                    onClick={() => {
                      // Handle store pickup logic here
                      setDrawerOpen(false);
                      setSelectedOrder(null);
                    }}
                  >
                    Ready for Pickup
                  </Button>
                ))}
            </Stack>
          </>
        )}
      </Drawer>
    </Box>
  );
};

export default Order;
