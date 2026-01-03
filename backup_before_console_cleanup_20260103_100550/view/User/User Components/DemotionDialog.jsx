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

const DemotionDialog = ({ open, onClose, onConfirm, userName, roleToRemove }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WarningIcon color="warning" />
        Confirm Demotion
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to demote <strong>{userName}</strong> to{" "}
          <strong>{roleToRemove}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            bgcolor: "#000",
            color: "#fff",
            "&:hover": { bgcolor: "#333" },
          }}
        >
          Confirm Demotion
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DemotionDialog;