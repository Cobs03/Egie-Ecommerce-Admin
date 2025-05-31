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
import bundleData from "../Data/BundleData.json";

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

  const handleView = () => {
    navigate("/bundles/view", { state: selectedBundle });
    handleMenuClose();
  };

  const handleUpdate = () => {
    navigate("/bundles/create", { state: selectedBundle });
    handleMenuClose();
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
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
              <b>Category</b>
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
          {bundleData.bundles.map((bundle) => (
            <TableRow key={bundle.id}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar src={bundle.image} alt={bundle.name} sx={{ mr: 1 }} />
                  <Typography>{bundle.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>{bundle.code}</TableCell>
              <TableCell>{bundle.category}</TableCell>
              <TableCell>
                ₱
                {Number(bundle.officialPrice).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
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
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Delete Bundle
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};

export default Bundles;
