import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Typography,
} from "@mui/material";

const ConfirmDialog = ({ open, onClose, onConfirm, component }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm New Component</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to add this new component?
        </DialogContentText>
        <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="subtitle2">Component Details:</Typography>
          <Typography variant="body2">
            <strong>Name:</strong> {component.name}
          </Typography>
          {component.description && (
            <Typography variant="body2">
              <strong>Description:</strong> {component.description}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;