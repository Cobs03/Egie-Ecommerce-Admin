import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Divider,
} from "@mui/material";

const OrderShip = ({ visible, onClose, onShipped, order }) => {
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");

  // Generate tracking number when courier is selected
  useEffect(() => {
    if (courier) {
      const prefix = courier.split(" ")[0].toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      setTracking(`${prefix}${timestamp}${random}`);
    } else {
      setTracking("");
    }
  }, [courier]);

  const handleShipped = () => {
    if (!courier || !tracking) {
      alert("Please select a courier and ensure tracking number is generated");
      return;
    }
    // Pass tracking data and notes to parent
    onShipped({ courier, tracking, notes });
    // Reset form
    setCourier("");
    setTracking("");
    setNotes("");
  };

  const handleClose = () => {
    // Reset form on close
    setCourier("");
    setTracking("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog
      open={visible && !!order}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
          zIndex: 1550, // Dialog Paper highest
        },
      }}
      sx={{
        zIndex: 1540, // Dialog root above drawer
        "& .MuiDialog-container": {
          zIndex: 1540, // Container same level
        },
      }}
      BackdropProps={{
        sx: {
          zIndex: 1530, // Backdrop above drawer but below dialog
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 24,
          pb: 2,
        }}
      >
        Shipping Process
      </DialogTitle>

      <DialogContent>
        {/* Order Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Name:</strong> {order?.name || order?.customer?.name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Email Address:</strong>{" "}
            {order?.email || order?.customer?.email}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Phone:</strong>{" "}
            {order?.phone || order?.customer?.phone || "N/A"}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Address:</strong>{" "}
            {order?.address || order?.shippingAddress}
          </Typography>
          <Typography variant="body2">
            <strong>Payment Method:</strong> {order?.paymentMethod || "N/A"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Courier Selection */}
        <TextField
          select
          fullWidth
          label="Choose Courier"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          sx={{ mb: 2 }}
          required
          SelectProps={{
            MenuProps: {
              sx: {
                zIndex: 1600, // Dropdown menu above everything
              },
            },
          }}
        >
          <MenuItem value="">Choose Courier</MenuItem>
          <MenuItem value="J&T Express">J&T Express</MenuItem>
          <MenuItem value="LBC Express">LBC Express</MenuItem>
          <MenuItem value="Ninja Van">Ninja Van</MenuItem>
          <MenuItem value="JRS Express">JRS Express</MenuItem>
        </TextField>

        {/* Tracking Number */}
        <TextField
          fullWidth
          label="Tracking Number"
          value={tracking}
          InputProps={{
            readOnly: true,
          }}
          sx={{
            mb: 1,
            "& .MuiInputBase-input": {
              backgroundColor: "#f5f5f5",
            },
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 2 }}
        >
          Use PHL if your order is handling delivery — no need for courier
          tracking
        </Typography>

        {/* Notes Text Field */}
        <TextField
          fullWidth
          label="Delivery Notes (Optional)"
          placeholder="Add delivery notes, special instructions, or handling requirements..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={4}
          sx={{ mb: 1 }}
        />

        <Typography variant="caption" color="text.secondary">
          Example: Handle with care - fragile item, Customer requested expedited
          shipping, etc.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            bgcolor: "#FF2323",
            color: "#fff",
            fontWeight: 600,
            px: 4,
            "&:hover": {
              bgcolor: "#DD1111",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleShipped}
          disabled={!courier || !tracking}
          variant="contained"
          sx={{
            bgcolor: "#00D100",
            color: "#fff",
            fontWeight: 600,
            px: 4,
            "&:hover": {
              bgcolor: "#00B100",
            },
            "&:disabled": {
              bgcolor: "#ccc",
              color: "#fff",
            },
          }}
        >
          Shipped
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderShip;
