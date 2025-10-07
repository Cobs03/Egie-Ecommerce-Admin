import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from "@mui/material";

const AddComponentDialog = ({
  open,
  onClose,
  component,
  onComponentChange,
  onAdd,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Component</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Component Name"
            fullWidth
            required
            value={component.name}
            onChange={(e) =>
              onComponentChange({ ...component, name: e.target.value })
            }
            placeholder="Enter component name"
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={component.description}
            onChange={(e) =>
              onComponentChange({ ...component, description: e.target.value })
            }
            placeholder="Enter component description"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onAdd}
          variant="contained"
          disabled={!component.name.trim()}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddComponentDialog;