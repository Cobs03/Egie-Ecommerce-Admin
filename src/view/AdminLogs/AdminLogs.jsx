import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Stack,
  IconButton,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const AdminLogs = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 10;

  // Mock activity log data - Replace with actual API call
  const activityLogs = [
    {
      id: 1,
      timestamp: "2025-06-15 14:45",
      user: "mikko2@gmail.com",
      action: "Updated Product",
      module: "Products",
      details: 'Changed price of "Gaming Mouse..."',
    },
    {
      id: 2,
      timestamp: "2025-06-15 14:45",
      user: "mikko2@gmail.com",
      action: "Accepted Order",
      module: "Orders",
      details: "Accepted Order of (Customer name)",
    },
    {
      id: 3,
      timestamp: "2025-06-15 14:45",
      user: "geooc@gmail.com",
      action: "Created Product",
      module: "Products",
      details: 'Changed price of "Gaming Mouse..."',
    },
    {
      id: 4,
      timestamp: "2025-06-15 14:45",
      user: "tuplon@gmail.com",
      action: "Created Voucher",
      module: "Promotions",
      details: "Accepted Order of (Customer name)",
    },
    {
      id: 5,
      timestamp: "2025-06-15 14:45",
      user: "MokiM@gmail.com",
      action: "Replied an Inquerie",
      module: "Feedback",
      details: 'Changed price of "Gaming Mouse..."',
    },
    {
      id: 6,
      timestamp: "2025-06-15 14:45",
      user: "bouts@gmail.com",
      action: "Shipped an order",
      module: "Shipping",
      details: "Shipped the of (Customer name)",
    },
    {
      id: 7,
      timestamp: "2025-06-15 14:45",
      user: "Muyna@gmail.com",
      action: "Accepted Order",
      module: "Orders",
      details: "Accepted Order of (Customer name)",
    },
  ];

  const filteredLogs = activityLogs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDownload = () => {
    console.log("Downloading logs...");
    // TODO: Implement download functionality
  };

  return (
    <Box p={4}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} mb={3}>
        LOGS
      </Typography>

      {/* Search Bar & Buttons */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        gap={2}
      >
        <TextField
          size="small"
          placeholder="Search Log"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            bgcolor: "#fff",
            borderRadius: 1,
            minWidth: 300,
          }}
        />

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{
              color: "#000",
              borderColor: "#E0E0E0",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#000",
                bgcolor: "#F5F5F5",
              },
            }}
          >
            FILTER
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              bgcolor: "#00E676",
              color: "#000",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "#00C853",
              },
            }}
          >
            DOWNLOAD FILE
          </Button>
        </Stack>
      </Box>

      {/* Logs Table */}
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F5F5F5" }}>
              <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>
                Timestamp
              </TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Module</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 50 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow
                key={log.id}
                sx={{
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  cursor: "pointer",
                }}
              >
                <TableCell>
                  <Typography variant="body2">{log.timestamp}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {log.user}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{log.action}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {log.module}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {log.details}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <ChevronRightIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No logs found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          shape="rounded"
          sx={{
            "& .MuiPaginationItem-root": {
              fontWeight: 600,
            },
            "& .MuiPaginationItem-root.Mui-selected": {
              bgcolor: "#00E676",
              color: "#000",
              "&:hover": {
                bgcolor: "#00C853",
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default AdminLogs;