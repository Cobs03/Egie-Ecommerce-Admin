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
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { MoreVert, FilterList } from "@mui/icons-material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const CustomerTable = ({
  customers,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onCustomerClick,
}) => {
  const [customerFilterAnchor, setCustomerFilterAnchor] = useState(null);
  const [dateFilterAnchor, setDateFilterAnchor] = useState(null);

  const [customerSort, setCustomerSort] = useState(null);
  const [dateSort, setDateSort] = useState(null);

  const handleCustomerFilterOpen = (event) => {
    setCustomerFilterAnchor(event.currentTarget);
  };

  const handleDateFilterOpen = (event) => {
    setDateFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setCustomerFilterAnchor(null);
    setDateFilterAnchor(null);
  };

  const filteredAndSortedCustomers = customers
    .sort((a, b) => {
      if (customerSort === "az") {
        return a.name.localeCompare(b.name);
      } else if (customerSort === "za") {
        return b.name.localeCompare(a.name);
      }

      if (dateSort === "recent") {
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      } else if (dateSort === "oldest") {
        return new Date(a.dateAdded) - new Date(b.dateAdded);
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
                <Typography fontWeight="bold">Customer</Typography>
                <IconButton size="small" onClick={handleCustomerFilterOpen}>
                  <FilterList fontSize="small" />
                </IconButton>
              </Box>
              <Popover
                open={Boolean(customerFilterAnchor)}
                anchorEl={customerFilterAnchor}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <List sx={{ width: 200, pt: 0, pb: 0 }}>
                  <ListItem
                    button
                    onClick={() => {
                      setCustomerSort("az");
                      handleFilterClose();
                    }}
                    selected={customerSort === "az"}
                  >
                    <ListItemText primary="A - Z" />
                    {customerSort === "az" && <ArrowUpwardIcon fontSize="small" />}
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => {
                      setCustomerSort("za");
                      handleFilterClose();
                    }}
                    selected={customerSort === "za"}
                  >
                    <ListItemText primary="Z - A" />
                    {customerSort === "za" && <ArrowDownwardIcon fontSize="small" />}
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
                        <ListItemText primary="Clear Sort" sx={{ color: "text.secondary" }} />
                      </ListItem>
                    </>
                  )}
                </List>
              </Popover>
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>Phone Number</TableCell>

            <TableCell sx={{ fontWeight: 700 }}>Last Log In</TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              <Box display="flex" alignItems="center">
                <Typography fontWeight="bold">Date Joined</Typography>
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
                        <ListItemText primary="Clear Sort" sx={{ color: "text.secondary" }} />
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
          {filteredAndSortedCustomers
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((customer, idx) => (
              <TableRow
                key={idx}
                sx={{
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={customer.avatar} alt={customer.name} />
                    <Box>
                      <Typography fontWeight={600}>{customer.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {customer.phoneNumber || "(+63) 9184548421"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={
                      customer.lastLogin === "Active Now"
                        ? "success.main"
                        : "text.secondary"
                    }
                    fontWeight={customer.lastLogin === "Active Now" ? 600 : 400}
                  >
                    {customer.lastLogin || "Never"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {customer.dateAdded}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onCustomerClick(customer, idx)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          {filteredAndSortedCustomers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No customers found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAndSortedCustomers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
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

export default CustomerTable;