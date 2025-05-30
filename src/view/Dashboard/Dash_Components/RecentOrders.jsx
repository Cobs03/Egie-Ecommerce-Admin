import React, { useState } from "react";
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

// Sample data for recent orders - replace with actual data
let recentOrders = [
  {
    orderNumber: "T2123245678",
    user: "Mikko",
    time: "2 mins ago",
    amount: "P 12,500",
    status: "Completed",
  },
  {
    orderNumber: "T2123245699",
    user: "Ana",
    time: "5 mins ago",
    amount: "P 7,350",
    status: "New",
  },
  {
    orderNumber: "T2123245712",
    user: "Jessa",
    time: "10 mins ago",
    amount: "P 18,900",
    status: "On Going",
  },
  {
    orderNumber: "T2123245733",
    user: "Carlos",
    time: "15 mins ago",
    amount: "P 22,100",
    status: "Completed",
  },
  {
    orderNumber: "T2123245745",
    user: "Mikko",
    time: "20 mins ago",
    amount: "P 5,500",
    status: "Cancelled",
  },
  {
    orderNumber: "T2123245760",
    user: "Lara",
    time: "30 mins ago",
    amount: "P 9,750",
    status: "Completed",
  },
  {
    orderNumber: "T2123245775",
    user: "Ana",
    time: "45 mins ago",
    amount: "P 14,200",
    status: "On Going",
  },
  {
    orderNumber: "T2123245790",
    user: "Jessa",
    time: "1 hour ago",
    amount: "P 8,300",
    status: "New",
  },
  {
    orderNumber: "T2123245805",
    user: "Carlos",
    time: "1 hour 15 mins ago",
    amount: "P 11,450",
    status: "Completed",
  },
  {
    orderNumber: "T2123245820",
    user: "Lara",
    time: "1 hour 30 mins ago",
    amount: "P 16,700",
    status: "On Going",
  },
  {
    orderNumber: "T2123245835",
    user: "Mikko",
    time: "2 hours ago",
    amount: "P 20,300",
    status: "Completed",
  },
];

// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// Randomize the orders on component load
const shuffledOrders = shuffleArray([...recentOrders]);
const limitedOrders = shuffledOrders.slice(0, 8); // Limit to the first 8 orders

const getStatusStyles = (status) => {
  switch (status) {
    case "Completed":
      return {
        backgroundColor: "#dcfce7", // Light green
        color: "#22c55e", // Green text
      };
    case "New":
      return {
        backgroundColor: "#bfdbfe", // Light blue
        color: "#3b82f6", // Blue text
      };
    case "On Going":
      return {
        backgroundColor: "#fef9c3", // Light yellow
        color: "#eab308", // Yellow text
      };
    case "Cancelled":
      return {
        backgroundColor: "#FF4747",
        color: "#780000",
      };
    default:
      return {};
  }
};

const RecentOrders = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // To store the order for the open menu
  const open = Boolean(anchorEl);
  const navigate = useNavigate(); // Initialize useNavigate

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
      navigate("/orders", { state: { orderId: selectedOrder.orderNumber } });
    }
    handleClose();
  };

  const handleViewAllOrders = () => {
    navigate("/orders"); // Navigate to the orders page
  };

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
              {limitedOrders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.user}</TableCell>
                  <TableCell>{order.time}</TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        borderRadius: 16,
                        padding: "4px 12px",
                        display: "inline-block",
                        fontWeight: 600,
                        fontSize: 12,
                        ...getStatusStyles(order.status),
                      }}
                    >
                      {order.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more options"
                      id={`order-options-button-${order.orderNumber}`}
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
                        "aria-labelledby": `order-options-button-${order.orderNumber}`,
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
