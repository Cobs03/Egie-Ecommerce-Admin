import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";

// Example data
const bundles = [
  {
    id: 1,
    name: 'Lenovo V15 G4 IRU 15.6" FHD i5',
    code: "CT|001",
    category: "Laptop",
    price: 29545,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=facearea&w=64&h=64",
  },
  {
    id: 2,
    name: 'Lenovo V15 G4 IRU 15.6" FHD i5',
    code: "CT|002",
    category: "Laptop",
    price: 29545,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=facearea&w=64&h=64",
  },
];

const Bundles = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event, bundle) => {
    setAnchorEl(event.currentTarget);
    setSelectedBundle(bundle);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBundle(null);
  };

  // Replace these with your actual handlers
  const handleView = () => {
    navigate("/bundles/view", { state: selectedBundle });
    handleMenuClose();
  };
  const handleUpdate = () => {
    alert(`Update bundle: ${selectedBundle.name}`);
    handleMenuClose();
  };
  const handleDelete = () => {
    alert(`Delete bundle: ${selectedBundle.name}`);
    handleMenuClose();
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <b>Bundle Name</b>
            </TableCell>
            <TableCell>
              <b>Code</b>
            </TableCell>

            <TableCell>
              <b>Price</b>
            </TableCell>
            <TableCell>
              <b>Action</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bundles.map((bundle) => (
            <TableRow key={bundle.id}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar src={bundle.image} alt={bundle.name} sx={{ mr: 1 }} />
                  <Typography>{bundle.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>{bundle.code}</TableCell>
              <TableCell>
                ₱
                {bundle.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell>
                <IconButton onClick={(e) => handleMenuOpen(e, bundle)}>
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>View Bundle</MenuItem>
        <MenuItem onClick={handleUpdate}>Update Bundle</MenuItem>
        <MenuItem
          onClick={handleMenuClose}
          sx={{ color: "error.main" }}
        >
          Delete Bundle
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};

export default Bundles;
