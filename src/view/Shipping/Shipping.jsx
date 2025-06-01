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
import { useNavigate } from "react-router-dom";

const mockShipments = [
  {
    customer: "Mik ko",
    order: { name: "Lenovo v15 (Coco)", code: "T425858100" },
    courier: "LALAMOVE",
    confirmation: "Completed",
    status: "Out for Delivery",
    tat: "Ontime",
  },
  {
    customer: "Jane Doe",
    order: { name: "ASUS TUF Gaming F15", code: "T425858101" },
    courier: "J&T Express",
    confirmation: "Pending",
    status: "Processing",
    tat: "Delayed",
  },
  {
    customer: "John Smith",
    order: { name: "Acer Aspire 5", code: "T425858102" },
    courier: "LBC",
    confirmation: "Completed",
    status: "Delivered",
    tat: "Early",
  },
  {
    customer: "Maria Clara",
    order: { name: "HP Pavilion x360", code: "T425858103" },
    courier: "Grab Express",
    confirmation: "Completed",
    status: "Out for Delivery",
    tat: "Ontime",
  },
  {
    customer: "Carlos Reyes",
    order: { name: "Dell Inspiron 15", code: "T425858104" },
    courier: "LALAMOVE",
    confirmation: "Pending",
    status: "Processing",
    tat: "Delayed",
  },
];

const Shipping = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const navigate = useNavigate();

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
          variant="outlined"
          sx={{
            bgcolor: "#fff",
            borderRadius: 1,
            mr: 2,
            width: 220,
            "& .MuiInputBase-input": {
              color: "#000", // Input text color
            },
            "& .MuiInputBase-root": {
              color: "#000", // Icon and text color
            },
            "& .MuiInputAdornment-root svg": {
              color: "#000", // Icon color
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#666", // Placeholder color
              opacity: 1, // Required for placeholder color to take effect
            },
          }}
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
                    {row.order.name}

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
                    color={
                      row.confirmation === "Pending" ? "warning" : "success"
                    }
                    size="small"
                    icon={
                      <span
                        style={{
                          color:
                            row.confirmation === "Pending"
                              ? "#FF9800"
                              : "#00C853",
                          fontWeight: 700,
                          fontSize: 18,
                        }}
                      >
                        {row.confirmation === "Pending" ? "-" : "✔"}
                      </span>
                    }
                    sx={{
                      fontWeight: 700,
                      bgcolor:
                        row.confirmation === "Pending" ? "#FFF3E0" : "#E8F5E9",
                      color:
                        row.confirmation === "Pending" ? "#FF9800" : "#00C853",
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
                      bgcolor:
                        row.tat === "Ontime"
                          ? "#6EFF6E"
                          : row.tat === "Early"
                            ? "#2196f3"
                            : row.tat === "Delayed"
                              ? "#FF2D2D"
                              : undefined,
                      color: row.tat === "Early" ? "#fff" : "#000",
                      fontWeight: 700,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuOpen(e, idx)}>
                    <MoreVertIcon className="text-black" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && menuRow === idx}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate(`/shipping/view/${row.order.code}`);
                      }}
                    >
                      View Details
                    </MenuItem>
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
