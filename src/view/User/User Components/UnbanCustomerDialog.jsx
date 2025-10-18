import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const UnbanCustomerDialog = ({ open, onClose, onConfirm, customerName }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CheckCircleIcon color="success" />
        Confirm Unban Customer
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to unban <strong>{customerName}</strong>? This will
          restore their access to the platform.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{ 
            bgcolor: "#00E676",
            color: "#000",
            fontWeight: 700,
            "&:hover": { bgcolor: "#00C853" }
          }}
        >
          Unban Customer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnbanCustomerDialog;
