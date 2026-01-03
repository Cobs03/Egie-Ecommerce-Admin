import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Switch,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardMedia,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  BarChart as AnalyticsIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import PopupAdService from '../../../services/PopupAdService';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const PopupAdsTab = ({ triggerAdd }) => {
  const [popupAds, setPopupAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPopup, setPreviewPopup] = useState(null);
  const addButtonClickedRef = useRef(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    images: [],
    link_url: '',
    link_type: 'external',
    display_frequency: 'once_per_session',
    delay_seconds: 2,
    auto_close_seconds: null,
    show_on_pages: ['home'],
    target_audience: 'all',
    start_date: null,
    end_date: null,
    is_active: true,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    loadPopupAds();
  }, []);

  // Watch for trigger from parent Add button
  useEffect(() => {
    if (triggerAdd && triggerAdd > 0) {
      handleOpenDialog();
    }
  }, [triggerAdd]);

  const loadPopupAds = async () => {
    setLoading(true);
    const { data, error } = await PopupAdService.getAllPopupAds();
    if (error) {
      toast.error('Failed to load popup ads');
    } else {
      setPopupAds(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (popup = null) => {
    if (popup) {
      setEditingPopup(popup);
      setFormData({
        title: popup.title,
        images: popup.images || [],
        link_url: popup.link_url || '',
        link_type: popup.link_type || 'external',
        display_frequency: popup.display_frequency || 'once_per_session',
        delay_seconds: popup.delay_seconds || 2,
        auto_close_seconds: popup.auto_close_seconds,
        show_on_pages: popup.show_on_pages || ['home'],
        target_audience: popup.target_audience || 'all',
        start_date: popup.start_date ? new Date(popup.start_date) : null,
        end_date: popup.end_date ? new Date(popup.end_date) : null,
        is_active: popup.is_active,
      });
      setImageUrls(popup.images || []);
    } else {
      setEditingPopup(null);
      setFormData({
        title: '',
        images: [],
        link_url: '',
        link_type: 'external',
        display_frequency: 'once_per_session',
        delay_seconds: 2,
        auto_close_seconds: null,
        show_on_pages: ['home'],
        target_audience: 'all',
        start_date: null,
        end_date: null,
        is_active: true,
      });
      setImageUrls([]);
      setSelectedFiles([]);
    }
    setDialogOpen(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setImageUrls(urls);
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }

    if (selectedFiles.length === 0 && imageUrls.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      let uploadedImages = imageUrls;

      // Upload new images if selected
      if (selectedFiles.length > 0) {
        const { data: urls, error } = await PopupAdService.uploadPopupImages(selectedFiles);
        if (error) throw error;
        uploadedImages = urls;
      } else if (editingPopup) {
        // If editing and no new files, keep existing images
        uploadedImages = editingPopup.images || imageUrls;
      }

      const popupData = {
        ...formData,
        images: uploadedImages,
      };

      if (editingPopup) {
        const { error } = await PopupAdService.updatePopupAd(editingPopup.id, popupData);
        if (error) throw error;
        toast.success('Popup ad updated successfully');
      } else {
        const { error } = await PopupAdService.createPopupAd(popupData);
        if (error) throw error;
        toast.success('Popup ad created successfully');
      }

      setDialogOpen(false);
      setEditingPopup(null);
      setSelectedFiles([]);
      setImageUrls([]);
      loadPopupAds();
    } catch (error) {
      console.error('Error saving popup ad:', error);
      toast.error('Failed to save popup ad');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (popup) => {
    const { error } = await PopupAdService.toggleActive(popup.id, !popup.is_active);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Popup ad ${!popup.is_active ? 'activated' : 'deactivated'}`);
      loadPopupAds();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this popup ad?')) {
      const { error } = await PopupAdService.deletePopupAd(id);
      if (error) {
        toast.error('Failed to delete popup ad');
      } else {
        toast.success('Popup ad deleted successfully');
        loadPopupAds();
      }
    }
  };

  const handlePreview = (popup) => {
    setPreviewPopup(popup);
    setPreviewOpen(true);
  };

  const calculateCTR = (impressions, clicks) => {
    if (!impressions) return '0%';
    return ((clicks / impressions) * 100).toFixed(2) + '%';
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Preview</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Display Settings</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Analytics</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {popupAds.map((popup) => (
              <TableRow key={popup.id}>
                <TableCell>
                  {popup.images?.[0] && (
                    <Box
                      component="img"
                      src={popup.images[0]}
                      alt={popup.title}
                      sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{popup.title}</Typography>
                  {popup.images?.length > 1 && (
                    <Chip
                      label={`${popup.images.length} slides`}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Frequency: {popup.display_frequency.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Delay: {popup.delay_seconds}s
                  </Typography>
                </TableCell>
                <TableCell>
                  {popup.start_date && (
                    <Typography variant="body2">
                      {new Date(popup.start_date).toLocaleDateString()}
                    </Typography>
                  )}
                  {popup.end_date && (
                    <Typography variant="body2" color="text.secondary">
                      to {new Date(popup.end_date).toLocaleDateString()}
                    </Typography>
                  )}
                  {!popup.start_date && !popup.end_date && (
                    <Typography variant="body2" color="text.secondary">
                      No schedule
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      👁️ {popup.impressions || 0} views
                    </Typography>
                    <Typography variant="body2">
                      🖱️ {popup.clicks || 0} clicks
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      CTR: {calculateCTR(popup.impressions, popup.clicks)}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={popup.is_active}
                    onChange={() => handleToggleActive(popup)}
                    color="success"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Preview">
                      <IconButton size="small" onClick={() => handlePreview(popup)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(popup)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(popup.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {popupAds.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No popup ads yet. Create your first one!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPopup ? 'Edit Pop-up Ad' : 'Create Pop-up Ad'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                Upload Images (Multiple supported)
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </Button>
              {imageUrls.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  {imageUrls.map((url, index) => (
                    <Card key={index} sx={{ width: 150 }}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={url}
                        alt={`Slide ${index + 1}`}
                      />
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            <TextField
              label="Link URL (Optional)"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              fullWidth
              placeholder="https://example.com or leave empty"
            />

            <FormControl fullWidth>
              <InputLabel>Display Frequency</InputLabel>
              <Select
                value={formData.display_frequency}
                onChange={(e) => setFormData({ ...formData, display_frequency: e.target.value })}
                label="Display Frequency"
              >
                <MenuItem value="once_per_session">Once Per Session</MenuItem>
                <MenuItem value="once_per_day">Once Per Day</MenuItem>
                <MenuItem value="every_visit">Every Page Visit</MenuItem>
                <MenuItem value="once_forever">Once Forever</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Delay Before Showing (seconds)"
              type="number"
              value={formData.delay_seconds}
              onChange={(e) => setFormData({ ...formData, delay_seconds: parseInt(e.target.value) })}
              fullWidth
            />

            <TextField
              label="Auto-close After (seconds, optional)"
              type="number"
              value={formData.auto_close_seconds || ''}
              onChange={(e) => setFormData({ ...formData, auto_close_seconds: e.target.value ? parseInt(e.target.value) : null })}
              fullWidth
              placeholder="Leave empty for manual close only"
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Date (Optional)"
                value={formData.start_date}
                onChange={(date) => setFormData({ ...formData, start_date: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DateTimePicker
                label="End Date (Optional)"
                value={formData.end_date}
                onChange={(date) => setFormData({ ...formData, end_date: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : (editingPopup ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Preview</DialogTitle>
        <DialogContent>
          {previewPopup && (
            <Box sx={{ textAlign: 'center' }}>
              {previewPopup.images?.map((img, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <img
                    src={img}
                    alt={`Slide ${index + 1}`}
                    style={{ maxWidth: '100%', maxHeight: '500px' }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PopupAdsTab;
