import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { CategoryService } from '../../services/CategoryService';
import SpecificationsDialog from './SpecificationsDialog';

const CategoryManagement = () => {
  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Category Dialog State
  const [categoryDialog, setCategoryDialog] = useState({
    open: false,
    mode: 'add', // 'add' or 'edit'
    category: { name: '', description: '', is_active: true }
  });
  
  // Specifications Dialog State
  const [specsDialog, setSpecsDialog] = useState({
    open: false,
    categoryId: null,
    categoryName: '',
    specifications: []
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await CategoryService.getCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        showSnackbar('Failed to load categories', 'error');
      }
    } catch (error) {
      showSnackbar('Error loading categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Category CRUD Operations
  const handleAddCategory = () => {
    setCategoryDialog({
      open: true,
      mode: 'add',
      category: { name: '', description: '', is_active: true }
    });
  };

  const handleEditCategory = (category) => {
    setCategoryDialog({
      open: true,
      mode: 'edit',
      category: { ...category }
    });
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This will also delete all its specifications.`)) {
      try {
        const result = await CategoryService.deleteCategory(categoryId);
        if (result.success) {
          showSnackbar(`Category "${categoryName}" deleted successfully`);
          loadCategories();
        } else {
          showSnackbar(result.error, 'error');
        }
      } catch (error) {
        showSnackbar('Error deleting category', 'error');
      }
    }
  };

  const handleSaveCategory = async () => {
    try {
      const { category, mode } = categoryDialog;
      
      if (!category.name.trim()) {
        showSnackbar('Category name is required', 'error');
        return;
      }

      const categoryData = {
        ...category,
        slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        display_order: categories.length + 1
      };

      let result;
      if (mode === 'add') {
        result = await CategoryService.createCategory(categoryData);
      } else {
        result = await CategoryService.updateCategory(category.id, categoryData);
      }

      if (result.success) {
        showSnackbar(`Category ${mode === 'add' ? 'created' : 'updated'} successfully`);
        setCategoryDialog({ ...categoryDialog, open: false });
        loadCategories();
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      showSnackbar('Error saving category', 'error');
    }
  };

  // Specifications Management
  const handleManageSpecs = async (categoryId, categoryName) => {
    try {
      const result = await CategoryService.getCategoryWithSpecs(categoryId);
      if (result.success) {
        setSpecsDialog({
          open: true,
          categoryId,
          categoryName,
          specifications: result.data.specifications || []
        });
      } else {
        showSnackbar('Failed to load specifications', 'error');
      }
    } catch (error) {
      showSnackbar('Error loading specifications', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
          sx={{ 
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0' }
          }}
        >
          Add Category
        </Button>
      </Box>

      {/* Categories Grid */}
      {loading ? (
        <Typography>Loading categories...</Typography>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} md={6} lg={4} key={category.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {category.name}
                    </Typography>
                    <Chip 
                      label={category.is_active ? 'Active' : 'Inactive'} 
                      color={category.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {category.description || 'No description'}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    Slug: {category.slug}
                  </Typography>
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => handleManageSpecs(category.id, category.name)}
                      sx={{ flex: 1 }}
                    >
                      Specifications
                    </Button>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditCategory(category)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Category Add/Edit Dialog */}
      <Dialog 
        open={categoryDialog.open} 
        onClose={() => setCategoryDialog({ ...categoryDialog, open: false })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {categoryDialog.mode === 'add' ? 'Add New Category' : 'Edit Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Category Name"
              fullWidth
              required
              value={categoryDialog.category.name}
              onChange={(e) => setCategoryDialog({
                ...categoryDialog,
                category: { ...categoryDialog.category, name: e.target.value }
              })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={categoryDialog.category.description}
              onChange={(e) => setCategoryDialog({
                ...categoryDialog,
                category: { ...categoryDialog.category, description: e.target.value }
              })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={categoryDialog.category.is_active}
                  onChange={(e) => setCategoryDialog({
                    ...categoryDialog,
                    category: { ...categoryDialog.category, is_active: e.target.checked }
                  })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog({ ...categoryDialog, open: false })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveCategory}>
            {categoryDialog.mode === 'add' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Specifications Management Dialog */}
      <SpecificationsDialog
        open={specsDialog.open}
        onClose={() => setSpecsDialog({ ...specsDialog, open: false })}
        categoryId={specsDialog.categoryId}
        categoryName={specsDialog.categoryName}
        specifications={specsDialog.specifications}
        onSpecsUpdated={() => {
          loadCategories();
          setSpecsDialog({ ...specsDialog, open: false });
        }}
        showSnackbar={showSnackbar}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryManagement;