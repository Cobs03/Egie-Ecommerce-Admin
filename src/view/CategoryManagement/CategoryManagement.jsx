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
    category: { name: '', description: '', is_active: true, image_url: '' }
  });
  
  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  
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
      category: { name: '', description: '', is_active: true, image_url: '' }
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEditCategory = (category) => {
    setCategoryDialog({
      open: true,
      mode: 'edit',
      category: { ...category }
    });
    setImageFile(null);
    setImagePreview(category.image_url || null);
  };

  // Handle image file selection
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
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCategoryDialog({
      ...categoryDialog,
      category: { ...categoryDialog.category, image_url: '' }
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
      setUploading(true);
      const { category, mode } = categoryDialog;
      
      if (!category.name.trim()) {
        showSnackbar('Category name is required', 'error');
        setUploading(false);
        return;
      }

      let imageUrl = category.image_url || '';

      // Upload image if a new file was selected
      if (imageFile) {
        const uploadResult = await CategoryService.uploadCategoryImage(imageFile, category.name);
        if (uploadResult.success) {
          imageUrl = uploadResult.data;
        } else {
          showSnackbar('Failed to upload image: ' + uploadResult.error, 'error');
          setUploading(false);
          return;
        }
      }

      const categoryData = {
        ...category,
        slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        display_order: categories.length + 1,
        image_url: imageUrl
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
        setImageFile(null);
        setImagePreview(null);
        loadCategories();
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      showSnackbar('Error saving category', 'error');
    } finally {
      setUploading(false);
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
                {/* Category Image */}
                {category.image_url && (
                  <Box
                    component="img"
                    src={category.image_url}
                    alt={category.name}
                    sx={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      bgcolor: '#f5f5f5'
                    }}
                  />
                )}
                
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

            {/* Image Upload Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Category Image
              </Typography>
              
              {imagePreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Category preview"
                    sx={{
                      width: '100%',
                      maxWidth: '200px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid #ddd'
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
                  sx={{ py: 2 }}
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
                Recommended: Square image (500x500px) for best display
              </Typography>
            </Box>

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
          <Button 
            onClick={() => {
              setCategoryDialog({ ...categoryDialog, open: false });
              setImageFile(null);
              setImagePreview(null);
            }}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveCategory}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : (categoryDialog.mode === 'add' ? 'Create' : 'Update')}
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