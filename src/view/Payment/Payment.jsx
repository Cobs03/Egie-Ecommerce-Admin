import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Drawer,
  Avatar,
  Divider,
  IconButton as MuiIconButton,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

const paymentData = [
  {
    orderId: "T425858300",
    transactionId: "T425858300",
    dateTime: "Dec 25, 2025 | 10:12pm",
    amount: "₱29,545.00",
    method: "Cash on Delivery (COD)",
    status: "Paid",
  },
  {
    orderId: "T425858300",
    transactionId: "T425858300",
    dateTime: "Dec 25, 2025 | 10:12pm",
    amount: "₱29,545.00",
    method: "Cash on Delivery (COD)",
    status: "Pending",
  },
  {
    orderId: "T425858300",
    transactionId: "T425858300",
    dateTime: "Dec 25, 2025 | 10:12pm",
    amount: "₱29,545.00",
    method: "Cash on Delivery (COD)",
    status: "Failed",
  },
];

const statusColors = {
  Paid: "success",
  Pending: "warning",
  Failed: "error",
};

const payerInfo = {
  name: "Mik ko",
  email: "mikko@gmail.com",
  phone: "(+63) 9185498421",
  address:
    "Blk 69 LOT 96, Dyan Lang Sa Gedli Ng Kanto, Poblacion, Santa Maria, North Luzon, Bulacan 3022",
};

const paymentDetail = {
  orderId: "T425858300",
  transactionId: "T425858300",
  dateOrdered: "Dec 24, 2025 | 10:12pm",
  estimatedDelivery: "May 16, 2025",
  totalAmount: "₱12,000",
  deliveryOption: "Standard Delivery",
  paymentMethod: "Cash on Delivery (COD)",
  paymentStatus: "Paid",
};

const mockOrder = {
  id: "ORD001",
  customer: {
    name: "Mik ko",
    email: "mikko@gmail.com",
    avatar: "https://via.placeholder.com/40",
  },
  products: [
    {
      name: "Gaming Mouse",
      quantity: 2,
      price: 2999.99,
      image: "https://via.placeholder.com/40",
      inventory: 15,
    },
    {
      name: "Mechanical Keyboard",
      quantity: 1,
      price: 4999.99,
      image: "https://via.placeholder.com/40",
      inventory: 3,
    },
  ],
  total: 10999.97,
  status: "New",
  date: "2025-12-25",
  shippingAddress:
    "Blk 69 LOT 96, Dyan Lang Sa Gedli Ng Kanto, Poblacion, Santa Maria, North Luzon, Bulacan 3022",
  deliveryType: "delivery",
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

const Payment = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handleViewPaymentDetails = () => {
    setDrawerOpen(true);
    handleMenuClose();
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleViewOrderDetails = () => {
    setOrderDrawerOpen(true);
    handleMenuClose();
  };

  const handleOrderDrawerClose = () => {
    setOrderDrawerOpen(false);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Customer Payment List
      </Typography>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        p={1}
        bgcolor="#000"
        borderRadius={2}
        boxShadow={1}
      >
        <Button
          variant="contained"
          sx={{ bgcolor: "#00E676", color: "#000", fontWeight: 700, mr: 2 }}
        >
          All Orders
        </Button>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            size="small"
            placeholder="Search user"
            variant="outlined"
            sx={{ bgcolor: "#fff", color: "#000", input: { color: "#000" } }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{
              bgcolor: "#fff",
              color: "#000",
              borderColor: "#000",
              "&:hover": { bgcolor: "#f5f5f5", borderColor: "#000" },
            }}
          >
            Filters
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Date &amp; Time</TableCell>
              <TableCell>Amount Paid</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentData.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.orderId}</TableCell>
                <TableCell>{row.transactionId}</TableCell>
                <TableCell>{row.dateTime}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    color={statusColors[row.status]}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewPaymentDetails}>
            View Payment Details
          </MenuItem>
          <MenuItem onClick={handleViewOrderDetails}>
            View Order Details
          </MenuItem>
        </Menu>
      </TableContainer>
      {/* Payment Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            width: 370,
            maxWidth: "100vw",
            p: 2,
            border: "2px solid #2196f3",
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Typography variant="h6" fontWeight={700}>
            Payment Details
          </Typography>
          <MuiIconButton onClick={handleDrawerClose}>
            <CloseIcon />
          </MuiIconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {/* Payer Information */}
        <Typography fontWeight={700} mb={1}>
          Payer Information
        </Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar sx={{ width: 40, height: 40, mr: 2 }} />
          <Box>
            <Typography fontSize={15} fontWeight={700}>
              {payerInfo.name}
            </Typography>
            <Typography fontSize={14}>
              {payerInfo.email}
            </Typography>
            <Typography fontSize={14}>
              <b>Phone:</b> {payerInfo.phone}
            </Typography>
          </Box>
        </Box>
        <Typography fontSize={14} mb={2}>
          <b>Address:</b> {payerInfo.address}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {/* Payment Details */}
        <Typography fontWeight={700} mb={1}>
          Payment Details
        </Typography>
        <Typography fontSize={14}>
          <b>Order ID:</b> {paymentDetail.orderId}
        </Typography>
        <Typography fontSize={14}>
          <b>Transaction ID:</b> {paymentDetail.transactionId}
        </Typography>
        <Typography fontSize={14}>
          <b>Date Ordered:</b> {paymentDetail.dateOrdered}
        </Typography>
        <Typography fontSize={14}>
          <b>Estimated Delivery Date:</b> {paymentDetail.estimatedDelivery}
        </Typography>
        <Typography fontSize={14} mb={1}>
          <b>Total Amount:</b> {paymentDetail.totalAmount}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography fontSize={14}>
          <b>Delivery Option:</b> {paymentDetail.deliveryOption}
        </Typography>
        <Typography fontSize={14}>
          <b>Payment Method:</b> {paymentDetail.paymentMethod}
        </Typography>
        <Typography fontSize={14} mb={2}>
          <b>Payment Status:</b> {paymentDetail.paymentStatus}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor:
              paymentDetail.paymentStatus === "Paid" ? "#00FF00" : "#FFC107",
            color: "#000",
            fontWeight: 700,
            mt: 2,
            mb: 2,
            boxShadow: 1,
            "&:hover": {
              bgcolor:
                paymentDetail.paymentStatus === "Paid" ? "#00FF00" : "#FFC107",
            },
          }}
        >
          {paymentDetail.paymentStatus}
        </Button>
      </Drawer>
      {/* Order Details Drawer */}
      <Drawer
        anchor="right"
        open={orderDrawerOpen}
        onClose={handleOrderDrawerClose}
        PaperProps={{ sx: { width: 400, p: 3 } }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Typography variant="h6">Order Details</Typography>
          <MuiIconButton onClick={handleOrderDrawerClose}>
            <CloseIcon />
          </MuiIconButton>
        </Box>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Order Information
            </Typography>
            <Typography>Order ID: #{mockOrder.id}</Typography>
            <Typography>Date: {mockOrder.date}</Typography>
            <Typography>Status: {mockOrder.status}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Customer Information
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={mockOrder.customer.avatar} />
              <Box>
                <Typography>{mockOrder.customer.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {mockOrder.customer.email}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Shipping Address
            </Typography>
            <Typography>{mockOrder.shippingAddress}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Products
            </Typography>
            {mockOrder.products.map((product, index) => (
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
                  <Typography>₱{product.price.toFixed(2)}</Typography>
                </Stack>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle1">Total</Typography>
              <Typography variant="subtitle1">
                ₱{mockOrder.total.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Drawer>
    </Box>
  );
};

export default Payment;
