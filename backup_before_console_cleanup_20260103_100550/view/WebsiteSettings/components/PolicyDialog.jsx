import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const PolicyDialog = ({ open, mode, policy, onClose, onSave, onChange }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {mode === 'add' ? 'Add New Item' : 'Edit Item'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={policy.title}
            onChange={(e) => onChange('title', e.target.value)}
            sx={{ mb: 3 }}
            placeholder="e.g., User Agreement, Data Collection"
          />
          <TextField
            fullWidth
            multiline
            rows={12}
            label="Description"
            value={policy.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Enter the full text here..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={onSave}
          disabled={!policy.title || !policy.description}
        >
          {mode === 'add' ? 'Add' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PolicyDialog;
