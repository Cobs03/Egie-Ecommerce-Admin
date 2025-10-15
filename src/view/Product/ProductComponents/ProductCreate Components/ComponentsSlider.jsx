import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ComponentsSlider = ({
  selectedComponents,
  onAddComponent,
  onRemoveComponent,
  onSelectComponent,
  onEditComponent,
  onDeleteComponent,
  componentBoxWidth = 150,
  categories = [], // Dynamic categories from database
}) => {
  // Use dynamic categories instead of hardcoded componentData
  const allComponents = categories;

  // Context menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComponentForAction, setSelectedComponentForAction] = useState(
    null
  );

  // Edit dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({ name: "", description: "" });

  // Delete dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Handle menu open (right-click or three-dot button)
  const handleContextMenu = (event, component) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedComponentForAction(component);
    setAnchorEl(event.currentTarget);
  };

  // Close context menu
  const handleCloseContextMenu = () => {
    setAnchorEl(null);
  };

  // Open edit dialog
  const handleOpenEdit = () => {
    setEditData({
      name: selectedComponentForAction.name,
      description: selectedComponentForAction.description || "",
    });
    setOpenEditDialog(true);
    handleCloseContextMenu();
  };

  // Close edit dialog
  const handleCloseEdit = () => {
    setOpenEditDialog(false);
    setEditData({ name: "", description: "" });
  };

  // Save edit
  const handleSaveEdit = () => {
    if (onEditComponent) {
      onEditComponent(selectedComponentForAction.id, editData);
    }
    handleCloseEdit();
  };

  // Open delete confirmation
  const handleOpenDelete = () => {
    setOpenDeleteDialog(true);
    handleCloseContextMenu();
  };

  // Close delete dialog
  const handleCloseDelete = () => {
    setOpenDeleteDialog(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (onDeleteComponent) {
      onDeleteComponent(selectedComponentForAction.id);
    }
    handleCloseDelete();
  };

  return (
    <Box sx={{ mb: 3, width: "75%" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Select a component
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddComponent}
          sx={{
            borderColor: "#e0e0e0",
            color: "#424242",
          }}
        >
          ADD NEW COMPONENT
        </Button>
      </Box>

      {/* Components Horizontal Slider */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          overflowY: "hidden",
          pb: 2,
          pt: 1,
          px: 2,
          width: "100%",
          maxWidth: "100%",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          bgcolor: "#fafafa",

          "&::-webkit-scrollbar": {
            height: 8,
            display: "block",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f5f5f5",
            borderRadius: 4,
            margin: "0 8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bdbdbd",
            borderRadius: 4,
            "&:hover": {
              backgroundColor: "#9e9e9e",
            },
          },
        }}
      >
        {allComponents.map((component) => {
          const isSelected = selectedComponents.some(
            (c) => c.id === component.id
          );

          return (
            <Box
              key={component.id}
              onContextMenu={(e) => handleContextMenu(e, component)}
              sx={{
                minWidth: componentBoxWidth,
                maxWidth: componentBoxWidth,
                height: 40,
                flexShrink: 0,
                border: isSelected ? "2px solid #2196f3" : "1px solid #e0e0e0",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: isSelected ? "#e3f2fd" : "#fff",
                pl: 2,
                pr: 0.5,
                transition: "all 0.2s ease",
                position: "relative",
                "&:hover": {
                  borderColor: isSelected ? "#2196f3" : "#9e9e9e",
                  bgcolor: isSelected ? "#e3f2fd" : "#f5f5f5",
                  "& .menu-button": {
                    opacity: 1,
                  },
                },
              }}
            >
              <Box
                onClick={() => {
                  if (isSelected) {
                    onRemoveComponent(component.id);
                  } else {
                    selectedComponents.forEach((comp) => {
                      onRemoveComponent(comp.id);
                    });
                    onSelectComponent(component);
                  }
                }}
                sx={{
                  flex: 1,
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={isSelected ? 600 : 400}
                  color={isSelected ? "primary" : "text.primary"}
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {component.name}
                </Typography>
              </Box>
              <IconButton
                className="menu-button"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, component);
                }}
                sx={{
                  opacity: 0,
                  transition: "opacity 0.2s",
                  p: 0.5,
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
      </Box>

      {/* Context Menu */}
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseContextMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleOpenEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Component</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              pt: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="Component Name"
              fullWidth
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              autoFocus
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editData.name.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the component "
            <strong>{selectedComponentForAction?.name}</strong>"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComponentsSlider;