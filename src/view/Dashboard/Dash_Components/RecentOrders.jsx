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
  TextField,
  InputAdornment,
  Collapse,
  TableSortLabel,
  Chip,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("timeAgo");
  const [order, setOrder] = useState("asc");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, orders]);

  const fetchRecentOrders = async () => {
    setLoading(true);
    try {
      const response = await DashboardService.getRecentOrders(8);
      if (response.success) {
        setOrders(response.data);
        setFilteredOrders(response.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);

    const sorted = [...filteredOrders].sort((a, b) => {
      if (property === "orderNumber" || property === "customerName") {
        return isAsc
          ? b[property].localeCompare(a[property])
          : a[property].localeCompare(b[property]);
      }
      return 0;
    });
    setFilteredOrders(sorted);
  };

  const handleExpandClick = (orderId) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  const handleRefresh = () => {
    fetchRecentOrders();
  };

  const exportToCSV = () => {
    const headers = ["Order Number", "Customer", "Time", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((order) =>
        [
          order.orderNumber,
          order.customerName,
          order.timeAgo,
          order.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recent-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handleQuickAction = (type) => {
    setActionType(type);
    setActionDialogOpen(true);
    handleClose();
  };

  const handleActionConfirm = async () => {
    // Here you would implement the actual action logic
    console.log(`${actionType} action for order:`, selectedOrder);
    setActionDialogOpen(false);
    // Refresh orders after action
    await fetchRecentOrders();
  };

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
      navigate("/orders", { state: { orderId: selectedOrder.id } });
    }
    handleClose();
  };

  const handleViewAllOrders = () => {
    navigate("/orders");
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Recent Orders
            </Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Export to CSV">
                <IconButton onClick={exportToCSV} size="small">
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={`Last updated: ${lastUpdated.toLocaleTimeString()}`}>
                <IconButton onClick={handleRefresh} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="Search by order number, customer, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "#888", width: 50 }}></TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#888" }}>
                    <TableSortLabel
                      active={orderBy === "orderNumber"}
                      direction={orderBy === "orderNumber" ? order : "asc"}
                      onClick={() => handleSort("orderNumber")}
                    >
                      Order Number
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#888" }}>
                    <TableSortLabel
                      active={orderBy === "customerName"}
                      direction={orderBy === "customerName" ? order : "asc"}
                      onClick={() => handleSort("customerName")}
                    >
                      User
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#888" }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#888" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#888" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow
                      sx={{
                        "&:hover": { bgcolor: "#f9f9f9" },
                        cursor: "pointer",
                      }}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleExpandClick(order.id)}
                        >
                          {expandedRow === order.id ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell onClick={() => handleExpandClick(order.id)}>
                        {order.orderNumber}
                      </TableCell>
                      <TableCell onClick={() => handleExpandClick(order.id)}>
                        {order.customerName}
                      </TableCell>
                      <TableCell onClick={() => handleExpandClick(order.id)}>
                        {order.timeAgo}
                      </TableCell>
                      <TableCell onClick={() => handleExpandClick(order.id)}>
                        <Chip
                          label={order.status.replace("_", " ")}
                          size="small"
                          sx={{
                            ...getStatusStyles(order.status),
                            textTransform: "capitalize",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="View Order">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedOrder(order);
                                handleViewOrder();
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          {order.status === "pending" && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    handleQuickAction("approve");
                                  }}
                                >
                                  <CheckCircleIcon
                                    sx={{ fontSize: 18, color: "#22c55e" }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    handleQuickAction("cancel");
                                  }}
                                >
                                  <CancelIcon
                                    sx={{ fontSize: 18, color: "#ef4444" }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {order.status === "processing" && (
                            <>
                              <Tooltip title="Cannot approve - order is processing">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled
                                  >
                                    <CheckCircleIcon
                                      sx={{ fontSize: 18, color: "#d1d5db" }}
                                    />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Cannot cancel - order is processing">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled
                                  >
                                    <CancelIcon
                                      sx={{ fontSize: 18, color: "#d1d5db" }}
                                    />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={6}
                      >
                        <Collapse
                          in={expandedRow === order.id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ margin: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              Order Details
                            </Typography>
                            <Stack spacing={1}>
                              <Typography variant="body2">
                                <strong>Order ID:</strong> {order.id}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Customer:</strong> {order.customerName}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Status:</strong>{" "}
                                {order.status.replace("_", " ").toUpperCase()}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Time:</strong> {order.timeAgo}
                              </Typography>
                            </Stack>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
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

        <Menu
          id="order-menu"
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
          {selectedOrder?.status === "pending" && (
            <>
              <MenuItem onClick={() => handleQuickAction("approve")}>
                Approve Order
              </MenuItem>
              <MenuItem onClick={() => handleQuickAction("cancel")}>
                Cancel Order
              </MenuItem>
            </>
          )}
        </Menu>

        <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
          <DialogTitle>
            Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {actionType} order{" "}
              <strong>{selectedOrder?.orderNumber}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleActionConfirm}
              variant="contained"
              color={actionType === "cancel" ? "error" : "primary"}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </motion.div>
  );
};

export default RecentOrders;
