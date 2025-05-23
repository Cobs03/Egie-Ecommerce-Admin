import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Avatar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  TextField,
  InputAdornment,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

const mockShipments = [
  {
    customer: "Mik ko",
    order: { name: "Lenovo v15 (Coco)", code: "T425858100" },
    courier: "LALAMOVE",
    confirmation: "Completed",
    status: "Out for Delivery",
    tat: "Online",
  },
];

const Shipping = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  const handleMenuOpen = (event, rowIdx) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(rowIdx);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Shipment List
      </Typography>
      <Box
        sx={{
          bgcolor: "#000",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1,
          mb: 3,
        }}
      >
        <Box
          sx={{
            bgcolor: "#6EFF6E",
            color: "#000",
            px: 2.5,
            py: 1,
            borderRadius: 2,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            mr: 2,
            fontSize: 16,
            position: "relative",
          }}
        >
          All Shipment
          <Badge
            badgeContent={mockShipments.length}
            color="error"
            sx={{
              ml: 1,
              ".MuiBadge-badge": {
                right: -10,
                top: 8,
                border: "2px solid #fff",
                padding: "0 6px",
                fontWeight: 700,
                fontSize: 14,
                background: "#FF2D2D",
                color: "#fff",
              },
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }} />
        <TextField
          size="small"
          placeholder="Search item"
          sx={{ bgcolor: "#fff", borderRadius: 1, mr: 2, width: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
          sx={{
            bgcolor: "#fff",
            color: "#000",
            fontWeight: 700,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          Filters
        </Button>
      </Box>
      <Typography variant="h6" fontWeight={600} mb={2} align="center">
        Recent Shipments
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>CUSTOMER</b>
              </TableCell>
              <TableCell>
                <b>ORDER</b>
              </TableCell>
              <TableCell>
                <b>COURIER</b>
              </TableCell>
              <TableCell>
                <b>CONFIRMATION</b>
              </TableCell>
              <TableCell>
                <b>STATUS</b>
              </TableCell>
              <TableCell>
                <b>TAT</b>
              </TableCell>
              <TableCell>
                <b>Action</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockShipments.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.customer}</TableCell>
                <TableCell>
                  <Box>
                    <a
                      href="#"
                      style={{
                        color: "#1976d2",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      {row.order.name}
                    </a>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {row.order.code}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{row.courier}</TableCell>
                <TableCell>
                  <Chip
                    label={row.confirmation}
                    color="success"
                    size="small"
                    icon={
                      <span
                        style={{
                          color: "#00C853",
                          fontWeight: 700,
                          fontSize: 18,
                        }}
                      >
                        ✔
                      </span>
                    }
                    sx={{
                      fontWeight: 700,
                      bgcolor: "#E8F5E9",
                      color: "#00C853",
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
                    sx={{ bgcolor: "#6EFF6E", color: "#000", fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuOpen(e, idx)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && menuRow === idx}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Shipping;
