import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Paper,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { CategoryService } from '../../services/CategoryService';

const SpecificationsDialog = ({ 
  open, 
  onClose, 
  categoryId, 
  categoryName, 
  specifications: initialSpecs, 
  onSpecsUpdated,
  showSnackbar 
}) => {
  const [specifications, setSpecifications] = useState([]);
  const [editingSpec, setEditingSpec] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(false);

  // New/Edit specification form state
  const [specForm, setSpecForm] = useState({
    spec_name: '',
    spec_label: '',
    spec_type: 'text',
    is_required: false,
    default_value: '',
    placeholder: '',
    help_text: '',
    options: [],
    display_order: 0
  });

  // For managing dropdown options
  const [optionInput, setOptionInput] = useState('');

  useEffect(() => {
    if (open && categoryId) {
      loadSpecifications();
    }
  }, [open, categoryId]);

  const loadSpecifications = async () => {
    try {
      setLoading(true);
      const result = await CategoryService.getCategoryWithSpecs(categoryId);
      if (result.success) {
        setSpecifications(result.data.specifications || []);
      }
    } catch (error) {
      showSnackbar('Error loading specifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSpecForm({
      spec_name: '',
      spec_label: '',
      spec_type: 'text',
      is_required: false,
      default_value: '',
      placeholder: '',
      help_text: '',
      options: [],
      display_order: specifications.length + 1
    });
    setOptionInput('');
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAddingNew(true);
  };

  const handleStartEdit = (spec) => {
    setSpecForm({
      ...spec,
      options: spec.options?.options || []
    });
    setEditingSpec(spec.id);
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingSpec(null);
    setIsAddingNew(false);
    resetForm();
  };

  const handleSaveSpec = async () => {
    try {
      // Validate required fields
      if (!specForm.spec_name.trim() || !specForm.spec_label.trim()) {
        showSnackbar('Specification name and label are required', 'error');
        return;
      }

      // Prepare data
      const specData = {
        category_id: categoryId,
        spec_name: specForm.spec_name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        spec_label: specForm.spec_label,
        spec_type: specForm.spec_type,
        is_required: specForm.is_required,
        default_value: specForm.default_value || null,
        placeholder: specForm.placeholder || null,
        help_text: specForm.help_text || null,
        options: specForm.spec_type === 'dropdown' && specForm.options.length > 0 
          ? { options: specForm.options } 
          : null,
        display_order: specForm.display_order
      };

      let result;
      if (isAddingNew) {
        result = await CategoryService.createSpecification(specData);
      } else {
        result = await CategoryService.updateSpecification(editingSpec, specData);
      }

      if (result.success) {
        showSnackbar(`Specification ${isAddingNew ? 'created' : 'updated'} successfully`);
        handleCancelEdit();
        loadSpecifications();
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      showSnackbar('Error saving specification', 'error');
    }
  };

  const handleDeleteSpec = async (specId, specLabel) => {
    if (window.confirm(`Delete specification "${specLabel}"?`)) {
      try {
        const result = await CategoryService.deleteSpecification(specId);
        if (result.success) {
          showSnackbar('Specification deleted successfully');
          loadSpecifications();
        } else {
          showSnackbar(result.error, 'error');
        }
      } catch (error) {
        showSnackbar('Error deleting specification', 'error');
      }
    }
  };

  // Dropdown options management
  const handleAddOption = () => {
    if (optionInput.trim() && !specForm.options.includes(optionInput.trim())) {
      setSpecForm({
        ...specForm,
        options: [...specForm.options, optionInput.trim()]
      });
      setOptionInput('');
    }
  };

  const handleRemoveOption = (index) => {
    setSpecForm({
      ...specForm,
      options: specForm.options.filter((_, i) => i !== index)
    });
  };

  const specTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'dropdown', label: 'Dropdown Select' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'boolean', label: 'Yes/No Toggle' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Manage Specifications for "{categoryName}"
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleStartAdd}
            disabled={isAddingNew || editingSpec}
            size="small"
          >
            Add Specification
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Add/Edit Form */}
          {(isAddingNew || editingSpec) && (
            <Paper sx={{ p: 3, border: '2px solid #1976d2' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {isAddingNew ? 'Add New Specification' : 'Edit Specification'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Specification Label"
                    fullWidth
                    required
                    value={specForm.spec_label}
                    onChange={(e) => setSpecForm({ ...specForm, spec_label: e.target.value })}
                    placeholder="e.g. Brand, Capacity, Speed"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Internal Name (auto-generated)"
                    fullWidth
                    value={specForm.spec_label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}
                    disabled
                    helperText="Used internally in the database"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Specification Type</InputLabel>
                    <Select
                      value={specForm.spec_type}
                      label="Specification Type"
                      onChange={(e) => setSpecForm({ 
                        ...specForm, 
                        spec_type: e.target.value,
                        options: e.target.value === 'dropdown' ? specForm.options : []
                      })}
                    >
                      {specTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Display Order"
                    type="number"
                    fullWidth
                    value={specForm.display_order}
                    onChange={(e) => setSpecForm({ ...specForm, display_order: parseInt(e.target.value) })}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={specForm.is_required}
                        onChange={(e) => setSpecForm({ ...specForm, is_required: e.target.checked })}
                      />
                    }
                    label="Required Field"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Placeholder Text"
                    fullWidth
                    value={specForm.placeholder}
                    onChange={(e) => setSpecForm({ ...specForm, placeholder: e.target.value })}
                    placeholder="e.g. Enter brand name"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Default Value"
                    fullWidth
                    value={specForm.default_value}
                    onChange={(e) => setSpecForm({ ...specForm, default_value: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Help Text"
                    fullWidth
                    multiline
                    rows={2}
                    value={specForm.help_text}
                    onChange={(e) => setSpecForm({ ...specForm, help_text: e.target.value })}
                    placeholder="Additional information to help users fill this field"
                  />
                </Grid>
                
                {/* Dropdown Options */}
                {specForm.spec_type === 'dropdown' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Dropdown Options
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Add Option"
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <Button variant="outlined" onClick={handleAddOption}>
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {specForm.options.map((option, index) => (
                        <Chip
                          key={index}
                          label={option}
                          onDelete={() => handleRemoveOption(index)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSpec}
                >
                  {isAddingNew ? 'Create' : 'Update'}
                </Button>
              </Box>
            </Paper>
          )}
          
          {/* Specifications List */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Current Specifications ({specifications.length})
            </Typography>
            
            {loading ? (
              <Typography>Loading specifications...</Typography>
            ) : specifications.length === 0 ? (
              <Alert severity="info">
                No specifications configured for this category. Click "Add Specification" to get started.
              </Alert>
            ) : (
              <List>
                {specifications
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((spec, index) => (
                  <React.Fragment key={spec.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {spec.spec_label}
                            </Typography>
                            {spec.is_required && (
                              <Chip label="Required" size="small" color="error" />
                            )}
                            <Chip 
                              label={specTypes.find(t => t.value === spec.spec_type)?.label || spec.spec_type} 
                              size="small" 
                              variant="outlined" 
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Internal: {spec.spec_name}
                            </Typography>
                            {spec.help_text && (
                              <Typography variant="body2" color="text.secondary">
                                Help: {spec.help_text}
                              </Typography>
                            )}
                            {spec.options?.options && (
                              <Typography variant="body2" color="text.secondary">
                                Options: {spec.options.options.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => handleStartEdit(spec)}
                          disabled={isAddingNew || editingSpec}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteSpec(spec.id, spec.spec_label)}
                          disabled={isAddingNew || editingSpec}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < specifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {specifications.length > 0 && (
          <Button 
            variant="contained" 
            onClick={() => {
              onSpecsUpdated();
              showSnackbar('Specifications updated successfully');
            }}
          >
            Apply Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SpecificationsDialog;