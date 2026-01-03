import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const AddComponentDialog = ({
  open,
  onClose,
  component,
  onComponentChange,
  onAdd,
}) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Pass file to parent
      onComponentChange({ ...component, imageFile: file });
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    onComponentChange({ ...component, imageFile: null });
  };

  const handleClose = () => {
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  const handleAdd = () => {
    onAdd();
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
            placeholder="Enter component name (e.g., Processor, Graphics Card)"
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

          {/* Image Upload Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Component Image (Optional)
            </Typography>
            
            {imagePreview ? (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Component preview"
                  sx={{
                    width: '100%',
                    maxWidth: '200px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '2px solid #e0e0e0'
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    bgcolor: 'white',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ py: 2, borderStyle: 'dashed' }}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Recommended: Square image (500x500px) • Max 5MB
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
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