import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import { statusColors } from "./paymentData";

const PaymentTable = ({ payments, onViewPaymentDetails, onViewOrderDetails }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter states
  const [dateFilterAnchor, setDateFilterAnchor] = useState(null);
  const [amountFilterAnchor, setAmountFilterAnchor] = useState(null);
  const [methodFilterAnchor, setMethodFilterAnchor] = useState(null);
  const [statusFilterAnchor, setStatusFilterAnchor] = useState(null);

  const [dateFilter, setDateFilter] = useState(null);
  const [amountFilter, setAmountFilter] = useState([]);
  const [methodFilter, setMethodFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handleViewPayment = () => {
    onViewPaymentDetails(menuRow);
    handleMenuClose();
  };

  const handleViewOrder = () => {
    onViewOrderDetails(menuRow);
    handleMenuClose();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter handlers
  const handleDateFilterOpen = (event) => {
    setDateFilterAnchor(event.currentTarget);
  };

  const handleAmountFilterOpen = (event) => {
    setAmountFilterAnchor(event.currentTarget);
  };

  const handleMethodFilterOpen = (event) => {
    setMethodFilterAnchor(event.currentTarget);
  };

  const handleStatusFilterOpen = (event) => {
    setStatusFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setDateFilterAnchor(null);
    setAmountFilterAnchor(null);
    setMethodFilterAnchor(null);
    setStatusFilterAnchor(null);
  };

  const handleAmountFilterToggle = (range) => {
    setAmountFilter((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const handleMethodFilterToggle = (method) => {
    setMethodFilter((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleStatusFilterToggle = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Get unique payment methods
  const uniqueMethods = useMemo(() => {
    return [...new Set(payments.map((p) => p.method))];
  }, [payments]);

  // Get unique statuses
  const uniqueStatuses = useMemo(() => {
    return [...new Set(payments.map((p) => p.status))];
  }, [payments]);

  // Date filter logic
  const isDateInRange = (dateTimeString, range) => {
    const date = new Date(dateTimeString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
      case "today":
        return date >= today;
      case "last7days":
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 7);
        return date >= last7;
      case "last30days":
        const last30 = new Date(today);
        last30.setDate(today.getDate() - 30);
        return date >= last30;
      default:
        return true;
    }
  };

  // Amount filter logic
  const isAmountInRange = (amountString, ranges) => {
    if (ranges.length === 0) return true;
    
    const amount = parseFloat(amountString.replace(/[₱,]/g, ""));
    
    return ranges.some((range) => {
      switch (range) {
        case "below1000":
          return amount < 1000;
        case "1000to5000":
          return amount >= 1000 && amount <= 5000;
        case "5000to10000":
          return amount > 5000 && amount <= 10000;
        case "above10000":
          return amount > 10000;
        default:
          return true;
      }
    });
  };

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Date filter
      if (dateFilter && !isDateInRange(payment.dateTime, dateFilter)) {
        return false;
      }

      // Amount filter
      if (amountFilter.length > 0 && !isAmountInRange(payment.amount, amountFilter)) {
        return false;
      }

      // Method filter
      if (methodFilter.length > 0 && !methodFilter.includes(payment.method)) {
        return false;
      }

      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(payment.status)) {
        return false;
      }

      return true;
    });
  }, [payments, dateFilter, amountFilter, methodFilter, statusFilter]);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F5F5F5" }}>
              <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">Date &amp; Time</Typography>
                  <IconButton size="small" onClick={handleDateFilterOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">Amount Paid</Typography>
                  <IconButton size="small" onClick={handleAmountFilterOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">Payment Method</Typography>
                  <IconButton size="small" onClick={handleMethodFilterOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">Status</Typography>
                  <IconButton size="small" onClick={handleStatusFilterOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  }}
                >
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
            {filteredPayments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No payments found matching your filters
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPayments.length}
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

      {/* Date Filter Popover */}
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
              setDateFilter("today");
              handleFilterClose();
            }}
            selected={dateFilter === "today"}
          >
            <ListItemText primary="Today" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setDateFilter("last7days");
              handleFilterClose();
            }}
            selected={dateFilter === "last7days"}
          >
            <ListItemText primary="Last 7 Days" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setDateFilter("last30days");
              handleFilterClose();
            }}
            selected={dateFilter === "last30days"}
          >
            <ListItemText primary="Last 30 Days" />
          </ListItem>
          {dateFilter && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setDateFilter(null);
                  handleFilterClose();
                }}
              >
                <ListItemText
                  primary="Clear Filter"
                  sx={{ color: "text.secondary" }}
                />
              </ListItem>
            </>
          )}
        </List>
      </Popover>

      {/* Amount Filter Popover */}
      <Popover
        open={Boolean(amountFilterAnchor)}
        anchorEl={amountFilterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 220, pt: 0, pb: 0 }}>
          <ListItem dense>
            <FormControlLabel
              control={
                <Checkbox
                  checked={amountFilter.includes("below1000")}
                  onChange={() => handleAmountFilterToggle("below1000")}
                  size="small"
                />
              }
              label="Below ₱1,000"
            />
          </ListItem>
          <ListItem dense>
            <FormControlLabel
              control={
                <Checkbox
                  checked={amountFilter.includes("1000to5000")}
                  onChange={() => handleAmountFilterToggle("1000to5000")}
                  size="small"
                />
              }
              label="₱1,000 – ₱5,000"
            />
          </ListItem>
          <ListItem dense>
            <FormControlLabel
              control={
                <Checkbox
                  checked={amountFilter.includes("5000to10000")}
                  onChange={() => handleAmountFilterToggle("5000to10000")}
                  size="small"
                />
              }
              label="₱5,000 – ₱10,000"
            />
          </ListItem>
          <ListItem dense>
            <FormControlLabel
              control={
                <Checkbox
                  checked={amountFilter.includes("above10000")}
                  onChange={() => handleAmountFilterToggle("above10000")}
                  size="small"
                />
              }
              label="Above ₱10,000"
            />
          </ListItem>
          {amountFilter.length > 0 && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setAmountFilter([]);
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

      {/* Payment Method Filter Popover */}
      <Popover
        open={Boolean(methodFilterAnchor)}
        anchorEl={methodFilterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 220, pt: 0, pb: 0 }}>
          {uniqueMethods.map((method) => (
            <ListItem key={method} dense>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={methodFilter.includes(method)}
                    onChange={() => handleMethodFilterToggle(method)}
                    size="small"
                  />
                }
                label={method}
              />
            </ListItem>
          ))}
          {methodFilter.length > 0 && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setMethodFilter([]);
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

      {/* Status Filter Popover */}
      <Popover
        open={Boolean(statusFilterAnchor)}
        anchorEl={statusFilterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          {uniqueStatuses.map((status) => (
            <ListItem key={status} dense>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={statusFilter.includes(status)}
                    onChange={() => handleStatusFilterToggle(status)}
                    size="small"
                  />
                }
                label={status}
              />
            </ListItem>
          ))}
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

      {/* Row Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewPayment}>View Payment Details</MenuItem>
        <MenuItem onClick={handleViewOrder}>View Order Details</MenuItem>
      </Menu>
    </>
  );
};

export default PaymentTable;