import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

const ConfirmDialog = ({ open, type, policy, onClose, onConfirm }) => {
  const getTitle = () => {
    switch (type) {
      case 'delete':
        return 'Confirm Delete';
      case 'add':
        return 'Confirm Add';
      case 'edit':
        return 'Confirm Update';
      case 'reset':
        return 'Confirm Reset';
      case 'save':
        return 'Confirm Save Changes';
      default:
        return 'Confirm Action';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'delete':
        return `Are you sure you want to delete "${policy?.title}"? This action cannot be undone.`;
      case 'add':
        return `Are you sure you want to add "${policy?.title}"?`;
      case 'edit':
        return `Are you sure you want to update "${policy?.title}"?`;
      case 'reset':
        return 'Are you sure you want to reset all settings to their last saved values? Any unsaved changes will be lost.';
      case 'save':
        return 'Are you sure you want to save all changes to the website settings?';
      default:
        return 'Are you sure you want to proceed?';
    }
  };

  const getButtonColor = () => {
    if (type === 'delete' || type === 'reset') return 'error';
    return 'primary';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        <Typography>{getMessage()}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          variant="contained" 
          color={getButtonColor()}
          onClick={onConfirm}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
