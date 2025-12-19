import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"; // Icon for three horizontal dots
import { useNavigate } from "react-router-dom"; // Import useNavigate
import DashboardService from "../../../services/DashboardService";

const getStatusStyles = (status) => {
  switch (status) {
    case "completed":
    case "delivered":
      return {
        backgroundColor: "#dcfce7", // Light green
        color: "#22c55e", // Green text
      };
    case "pending":
      return {
        backgroundColor: "#bfdbfe", // Light blue
        color: "#3b82f6", // Blue text
      };
    case "confirmed":
    case "processing":
    case "shipped":
    case "ready_for_pickup":
      return {
        backgroundColor: "#fef9c3", // Light yellow
        color: "#eab308", // Yellow text
      };
    case "cancelled":
      return {
        backgroundColor: "#FF4747",
        color: "#780000",
      };
    default:
      return {};
  }
};

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // To store the order for the open menu
  const open = Boolean(anchorEl);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await DashboardService.getRecentOrders(8);
        if (response.success) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const handleClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleViewOrder = () => {
    if (selectedOrder) {
      // Navigate to the orders page, potentially passing the order ID as state
      navigate("/orders", { state: { orderId: selectedOrder.id } });
    }
    handleClose();
  };

  const handleViewAllOrders = () => {
    navigate("/orders"); // Navigate to the orders page
  };

  if (loading) {
    return (
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 2,
          margin: 1,
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Loading...</Typography>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 2,
          margin: 1,
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>No recent orders</Typography>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: 3,
        padding: 2,
        margin: 1,
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Recent Orders
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "#888" }}>
                  Order Number
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#888" }}>
                  User
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#888" }}>
                  Time
                </TableCell>

                <TableCell sx={{ fontWeight: 600, color: "#888" }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#888" }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.timeAgo}</TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        borderRadius: 16,
                        padding: "4px 12px",
                        display: "inline-block",
                        fontWeight: 600,
                        fontSize: 12,
                        textTransform: "capitalize",
                        ...getStatusStyles(order.status),
                      }}
                    >
                      {order.status.replace("_", " ")}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more options"
                      id={`order-options-button-${order.id}`}
                      aria-controls={open ? "order-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                      onClick={(event) => handleClick(event, order)}
                      size="small"
                    >
                      <MoreHorizIcon sx={{ fontSize: 18, color: "#888" }} />
                    </IconButton>
                    <Menu
                      id="order-menu"
                      MenuListProps={{
                        "aria-labelledby": `order-options-button-${order.id}`,
                      }}
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      PaperProps={{
                        style: {
                          maxHeight: 48 * 4.5,
                          width: "15ch",
                          boxShadow: "1px 1px 5px #888888",
                        },
                      }}
                    >
                      <MenuItem onClick={handleViewOrder}>View Order</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Button
          variant="contained"
          onClick={handleViewAllOrders}
          sx={{
            backgroundColor: "#22c55e",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#16a34a",
            },
            fontWeight: 600,
            padding: "10px 24px",
            borderRadius: 16,
          }}
        >
          View All Orders
        </Button>
      </Box>
    </Card>
  );
};

export default RecentOrders;
