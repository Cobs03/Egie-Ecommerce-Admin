import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Avatar,
  Stack,
  Box,
  IconButton,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  LocalShipping,
  CheckCircle,
  Cancel,
  AccessTime,
  MoreVert,
  FilterList,
  LocalShippingOutlined, // Added for "To Ship"
} from "@mui/icons-material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const OrderTable = ({ orders, onOrderClick }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderFilterAnchor, setOrderFilterAnchor] = useState(null);
  const [dateFilterAnchor, setDateFilterAnchor] = useState(null);
  const [statusFilterAnchor, setStatusFilterAnchor] = useState(null);

  const [orderSort, setOrderSort] = useState(null);
  const [dateSort, setDateSort] = useState(null);
  const [statusFilter, setStatusFilter] = useState([]);

  const handleOrderFilterOpen = (event) => {
    setOrderFilterAnchor(event.currentTarget);
  };

  const handleDateFilterOpen = (event) => {
    setDateFilterAnchor(event.currentTarget);
  };

  const handleStatusFilterOpen = (event) => {
    setStatusFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setOrderFilterAnchor(null);
    setDateFilterAnchor(null);
    setStatusFilterAnchor(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterToggle = (status) => {
    setStatusFilter((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return { bgcolor: "#000", color: "#fff" };
      case "On Going":
        return { bgcolor: "#FF9800", color: "#fff" };
      case "To Ship":
        return { bgcolor: "#2196F3", color: "#fff" }; // Blue for To Ship
      case "Completed":
        return { bgcolor: "#4CAF50", color: "#fff" };
      case "Cancelled":
        return { bgcolor: "#F44336", color: "#fff" };
      default:
        return { bgcolor: "#9E9E9E", color: "#fff" };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "New":
        return <AccessTime sx={{ fontSize: 16 }} />;
      case "On Going":
        return <LocalShipping sx={{ fontSize: 16 }} />;
      case "To Ship":
        return <LocalShippingOutlined sx={{ fontSize: 16 }} />; // Delivery icon for To Ship
      case "Completed":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "Cancelled":
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order) => {
      if (statusFilter.length > 0) {
        return statusFilter.includes(order.status);
      }
      return true;
    })
    .sort((a, b) => {
      if (orderSort === "az") {
        return a.id.localeCompare(b.id);
      } else if (orderSort === "za") {
        return b.id.localeCompare(a.id);
      }

      if (dateSort === "recent") {
        return new Date(b.date) - new Date(a.date);
      } else if (dateSort === "oldest") {
        return new Date(a.date) - new Date(b.date);
      }

      return 0;
    });

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#F5F5F5" }}>
            <TableCell sx={{ fontWeight: 700 }}>
              <Box display="flex" alignItems="center">
                <Typography fontWeight="bold">Order Details</Typography>
                <IconButton size="small" onClick={handleOrderFilterOpen}>
                  <FilterList fontSize="small" />
                </IconButton>
              </Box>
              <Popover
                open={Boolean(orderFilterAnchor)}
                anchorEl={orderFilterAnchor}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <List sx={{ width: 200, pt: 0, pb: 0 }}>
                  <ListItem
                    button
                    onClick={() => {
                      setOrderSort("az");
                      handleFilterClose();
                    }}
                    selected={orderSort === "az"}
                  >
                    <ListItemText primary="A - Z" />
                    {orderSort === "az" && <ArrowUpwardIcon fontSize="small" />}
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => {
                      setOrderSort("za");
                      handleFilterClose();
                    }}
                    selected={orderSort === "za"}
                  >
                    <ListItemText primary="Z - A" />
                    {orderSort === "za" && (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </ListItem>
                  {orderSort && (
                    <>
                      <Divider />
                      <ListItem
                        button
                        onClick={() => {
                          setOrderSort(null);
                          handleFilterClose();
                        }}
                      >
                        <ListItemText
                          primary="Clear Sort"
                          sx={{ color: "text.secondary" }}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </Popover>
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>

            <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              <Box display="flex" alignItems="center">
                <Typography fontWeight="bold">Status</Typography>
                <IconButton size="small" onClick={handleStatusFilterOpen}>
                  <FilterList fontSize="small" />
                </IconButton>
              </Box>
              <Popover
                open={Boolean(statusFilterAnchor)}
                anchorEl={statusFilterAnchor}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <List sx={{ width: 200, pt: 0, pb: 0 }}>
                  {["New", "On Going", "To Ship", "Completed", "Cancelled"].map(
                    (status) => (
                      <ListItem
                        key={status}
                        button
                        onClick={() => handleStatusFilterToggle(status)}
                        selected={statusFilter.includes(status)}
                      >
                        <ListItemText primary={status} />
                      </ListItem>
                    )
                  )}
                  {statusFilter.length > 0 && (
                    <>
                      <Divider />
                      <ListItem
                        button
                        onClick={() => {
                          setStatusFilter([]);
                          handleFilterClose();
                        }}
                      >
                        <ListItemText
                          primary="Clear Filters"
                          sx={{ color: "text.secondary" }}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </Popover>
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              <Box display="flex" alignItems="center">
                <Typography fontWeight="bold">Date</Typography>
                <IconButton size="small" onClick={handleDateFilterOpen}>
                  <FilterList fontSize="small" />
                </IconButton>
              </Box>
              <Popover
                open={Boolean(dateFilterAnchor)}
                anchorEl={dateFilterAnchor}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <List sx={{ width: 200, pt: 0, pb: 0 }}>
                  <ListItem
                    button
                    onClick={() => {
                      setDateSort("recent");
                      handleFilterClose();
                    }}
                    selected={dateSort === "recent"}
                  >
                    <ListItemText primary="Recent" />
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => {
                      setDateSort("oldest");
                      handleFilterClose();
                    }}
                    selected={dateSort === "oldest"}
                  >
                    <ListItemText primary="Oldest" />
                  </ListItem>
                  {dateSort && (
                    <>
                      <Divider />
                      <ListItem
                        button
                        onClick={() => {
                          setDateSort(null);
                          handleFilterClose();
                        }}
                      >
                        <ListItemText
                          primary="Clear Sort"
                          sx={{ color: "text.secondary" }}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </Popover>
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAndSortedOrders
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((order) => (
              <TableRow
                key={order.id}
                sx={{
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  cursor: "pointer",
                }}
              >
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    #{order.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.products.length} items
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={order.customer.avatar}
                      alt={order.customer.name}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Box>
                      <Typography fontWeight={600}>
                        {order.customer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customer.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    ${order.total.toFixed(2)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={order.status}
                    size="small"
                    sx={{
                      ...getStatusColor(order.status),
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      borderRadius: "16px",
                      height: 28,
                      "& .MuiChip-icon": {
                        color: "inherit",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {order.date}
                  </Typography>
                </TableCell>

                <TableCell>
                  <IconButton onClick={() => onOrderClick(order)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          {filteredAndSortedOrders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No orders found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAndSortedOrders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        sx={{
          backgroundColor: "#E4FDE1",
          borderTop: "1px solid #e0e0e0",
          "& .MuiTablePagination-toolbar": {
            justifyContent: "flex-start",
            paddingLeft: 2,
          },
          "& .MuiTablePagination-spacer": {
            display: "none",
          },
          "& .MuiTablePagination-displayedRows": {
            marginLeft: 0,
          },
          "& .MuiTablePagination-actions": {
            marginLeft: 2,
          },
        }}
      />
    </TableContainer>
  );
};

export default OrderTable;