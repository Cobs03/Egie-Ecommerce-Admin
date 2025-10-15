import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { confirmationColors, tatColors } from "./shippingData";

const ShippingTable = ({ shipments, onDeleteShipment }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState(null);

  // Filter states - Changed customer and order to sort filters
  const [customerSortAnchor, setCustomerSortAnchor] = useState(null);
  const [orderSortAnchor, setOrderSortAnchor] = useState(null);
  const [courierFilterAnchor, setCourierFilterAnchor] = useState(null);
  const [confirmationFilterAnchor, setConfirmationFilterAnchor] = useState(null);
  const [statusFilterAnchor, setStatusFilterAnchor] = useState(null);
  const [tatFilterAnchor, setTatFilterAnchor] = useState(null);

  const [customerSort, setCustomerSort] = useState(null); // 'recent' or 'oldest'
  const [orderSort, setOrderSort] = useState(null); // 'recent' or 'oldest'
  const [courierFilter, setCourierFilter] = useState([]);
  const [confirmationFilter, setConfirmationFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [tatFilter, setTatFilter] = useState([]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (orderCode) => {
    navigate(`/shipping/view/${orderCode}`);
    handleMenuClose();
  };

  const handleDeleteClick = (shipment) => {
    setShipmentToDelete(shipment);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (shipmentToDelete && onDeleteShipment) {
      onDeleteShipment(shipmentToDelete.order.code);
      toast.success(`Shipment ${shipmentToDelete.order.code} deleted successfully!`);
    }
    setDeleteDialogOpen(false);
    setShipmentToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setShipmentToDelete(null);
  };

  // Filter handlers
  const handleCustomerSortOpen = (event) => {
    setCustomerSortAnchor(event.currentTarget);
  };

  const handleOrderSortOpen = (event) => {
    setOrderSortAnchor(event.currentTarget);
  };

  const handleCourierFilterOpen = (event) => {
    setCourierFilterAnchor(event.currentTarget);
  };

  const handleConfirmationFilterOpen = (event) => {
    setConfirmationFilterAnchor(event.currentTarget);
  };

  const handleStatusFilterOpen = (event) => {
    setStatusFilterAnchor(event.currentTarget);
  };

  const handleTatFilterOpen = (event) => {
    setTatFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setCustomerSortAnchor(null);
    setOrderSortAnchor(null);
    setCourierFilterAnchor(null);
    setConfirmationFilterAnchor(null);
    setStatusFilterAnchor(null);
    setTatFilterAnchor(null);
  };

  const handleCourierFilterToggle = (courier) => {
    setCourierFilter((prev) =>
      prev.includes(courier) ? prev.filter((c) => c !== courier) : [...prev, courier]
    );
  };

  const handleConfirmationFilterToggle = (confirmation) => {
    setConfirmationFilter((prev) =>
      prev.includes(confirmation)
        ? prev.filter((c) => c !== confirmation)
        : [...prev, confirmation]
    );
  };

  const handleStatusFilterToggle = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleTatFilterToggle = (tat) => {
    setTatFilter((prev) =>
      prev.includes(tat) ? prev.filter((t) => t !== tat) : [...prev, tat]
    );
  };

  // Get unique values for filters
  const uniqueCouriers = useMemo(() => {
    return [...new Set(shipments.map((s) => s.courier))];
  }, [shipments]);

  const uniqueConfirmations = useMemo(() => {
    return [...new Set(shipments.map((s) => s.confirmation))];
  }, [shipments]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(shipments.map((s) => s.status))];
  }, [shipments]);

  const uniqueTats = useMemo(() => {
    return [...new Set(shipments.map((s) => s.tat))];
  }, [shipments]);

  // Filtered and sorted shipments
  const filteredShipments = useMemo(() => {
    let result = [...shipments];

    // Apply filters
    if (courierFilter.length > 0) {
      result = result.filter((shipment) => courierFilter.includes(shipment.courier));
    }
    if (confirmationFilter.length > 0) {
      result = result.filter((shipment) =>
        confirmationFilter.includes(shipment.confirmation)
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter((shipment) => statusFilter.includes(shipment.status));
    }
    if (tatFilter.length > 0) {
      result = result.filter((shipment) => tatFilter.includes(shipment.tat));
    }

    // Apply customer sort
    if (customerSort === "recent") {
      result.sort((a, b) => b.customer.localeCompare(a.customer));
    } else if (customerSort === "oldest") {
      result.sort((a, b) => a.customer.localeCompare(b.customer));
    }

    // Apply order sort
    if (orderSort === "recent") {
      result.sort((a, b) => b.order.code.localeCompare(a.order.code));
    } else if (orderSort === "oldest") {
      result.sort((a, b) => a.order.code.localeCompare(b.order.code));
    }

    return result;
  }, [
    shipments,
    courierFilter,
    confirmationFilter,
    statusFilter,
    tatFilter,
    customerSort,
    orderSort,
  ]);

  const getConfirmationIcon = (confirmation) => {
    return confirmation === "Pending" ? "-" : "✔";
  };

  const getTatTextColor = (tat) => {
    return tat === "Early" ? "#fff" : "#000";
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F5F5F5" }}>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">CUSTOMER</Typography>
                  <IconButton size="small" onClick={handleCustomerSortOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">ORDER</Typography>
                  <IconButton size="small" onClick={handleOrderSortOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">COURIER</Typography>
                  <IconButton size="small" onClick={handleCourierFilterOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">CONFIRMATION</Typography>
                  <IconButton size="small" onClick={handleConfirmationFilterOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">STATUS</Typography>
                  <IconButton size="small" onClick={handleStatusFilterOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">TAT</Typography>
                  <IconButton size="small" onClick={handleTatFilterOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredShipments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  }}
                >
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {row.order.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.order.code}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{row.courier}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.confirmation}
                      color={
                        row.confirmation === "Pending" ? "warning" : "success"
                      }
                      size="small"
                      icon={
                        <span
                          style={{
                            color: confirmationColors[row.confirmation].color,
                            fontWeight: 700,
                            fontSize: 18,
                          }}
                        >
                          {getConfirmationIcon(row.confirmation)}
                        </span>
                      }
                      sx={{
                        fontWeight: 700,
                        bgcolor: confirmationColors[row.confirmation].bgcolor,
                        color: confirmationColors[row.confirmation].color,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{row.status}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.tat}
                      size="small"
                      sx={{
                        bgcolor: tatColors[row.tat],
                        color: getTatTextColor(row.tat),
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && menuRow === row}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => handleViewDetails(row.order.code)}>
                        View Details
                      </MenuItem>
                      <MenuItem 
                        onClick={() => handleDeleteClick(row)}
                        sx={{ color: "error.main" }}
                      >
                        Delete
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            {filteredShipments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No shipments found matching your filters
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredShipments.length}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 700 }}>
          Confirm Delete Shipment
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this shipment?
            {shipmentToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Customer:</strong> {shipmentToDelete.customer}
                </Typography>
                <Typography variant="body2">
                  <strong>Order:</strong> {shipmentToDelete.order.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Order Code:</strong> {shipmentToDelete.order.code}
                </Typography>
                <Typography variant="body2">
                  <strong>Courier:</strong> {shipmentToDelete.courier}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" sx={{ mt: 2, color: "error.main" }}>
              This action cannot be undone.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ 
              color: "#000",
              borderColor: "#000",
              "&:hover": {
                borderColor: "#333",
                bgcolor: "rgba(0, 0, 0, 0.04)",
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            color="error"
            autoFocus
            sx={{
              fontWeight: 700,
            }}
          >
            Delete Shipment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Sort Popover */}
      <Popover
        open={Boolean(customerSortAnchor)}
        anchorEl={customerSortAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          <ListItem
            button
            onClick={() => {
              setCustomerSort("recent");
              handleFilterClose();
            }}
            selected={customerSort === "recent"}
          >
            <ListItemText primary="Recent" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setCustomerSort("oldest");
              handleFilterClose();
            }}
            selected={customerSort === "oldest"}
          >
            <ListItemText primary="Oldest" />
          </ListItem>
          {customerSort && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setCustomerSort(null);
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

      {/* Order Sort Popover */}
      <Popover
        open={Boolean(orderSortAnchor)}
        anchorEl={orderSortAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          <ListItem
            button
            onClick={() => {
              setOrderSort("recent");
              handleFilterClose();
            }}
            selected={orderSort === "recent"}
          >
            <ListItemText primary="Recent" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setOrderSort("oldest");
              handleFilterClose();
            }}
            selected={orderSort === "oldest"}
          >
            <ListItemText primary="Oldest" />
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

      {/* Courier Filter Popover */}
      <Popover
        open={Boolean(courierFilterAnchor)}
        anchorEl={courierFilterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 220, pt: 0, pb: 0 }}>
          {uniqueCouriers.map((courier) => (
            <ListItem key={courier} dense>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={courierFilter.includes(courier)}
                    onChange={() => handleCourierFilterToggle(courier)}
                    size="small"
                  />
                }
                label={courier}
              />
            </ListItem>
          ))}
          {courierFilter.length > 0 && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setCourierFilter([]);
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

      {/* Confirmation Filter Popover */}
      <Popover
        open={Boolean(confirmationFilterAnchor)}
        anchorEl={confirmationFilterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          {uniqueConfirmations.map((confirmation) => (
            <ListItem key={confirmation} dense>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={confirmationFilter.includes(confirmation)}
                    onChange={() => handleConfirmationFilterToggle(confirmation)}
                    size="small"
                  />
                }
                label={confirmation}
              />
            </ListItem>
          ))}
          {confirmationFilter.length > 0 && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setConfirmationFilter([]);
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
        <List sx={{ width: 220, pt: 0, pb: 0 }}>
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

      {/* TAT Filter Popover */}
      <Popover
        open={Boolean(tatFilterAnchor)}
        anchorEl={tatFilterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 180, pt: 0, pb: 0 }}>
          {uniqueTats.map((tat) => (
            <ListItem key={tat} dense>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tatFilter.includes(tat)}
                    onChange={() => handleTatFilterToggle(tat)}
                    size="small"
                  />
                }
                label={tat}
              />
            </ListItem>
          ))}
          {tatFilter.length > 0 && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setTatFilter([]);
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
    </>
  );
};

export default ShippingTable;