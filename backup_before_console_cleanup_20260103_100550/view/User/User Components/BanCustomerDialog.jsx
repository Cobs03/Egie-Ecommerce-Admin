import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";

const BanCustomerDialog = ({ open, onClose, onConfirm, customerName }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WarningIcon color="error" />
        Confirm Ban Customer
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to ban <strong>{customerName}</strong>? This action will
          prevent them from accessing the platform.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{ fontWeight: 700 }}
        >
          Ban Customer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BanCustomerDialog;