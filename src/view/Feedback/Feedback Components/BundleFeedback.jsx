import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Avatar,
  Stack,
  Box,
  IconButton,
  Collapse,
  Rating,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  FilterList,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const ReviewRow = ({ review, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Extract data from database format
  const bundleName = review.bundles?.bundle_name || 'Unknown Bundle';
  const bundleImage = review.bundles?.images?.[0] || null;
  
  // Get customer name and avatar from profile
  const customerFirstName = review.customer?.first_name || '';
  const customerLastName = review.customer?.last_name || '';
  const customerFullName = `${customerFirstName} ${customerLastName}`.trim();
  const userName = customerFullName || review.customer?.email?.split('@')[0] || 'Anonymous';
  const userAvatar = review.customer?.avatar_url || null;
  
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'A';
  const reviewText = review.comment || 'No comment';
  const reviewTitle = review.title || '';

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onDelete(review.id, review);
  };
  
  // Format date
  const createdDate = new Date(review.created_at);
  const formattedDate = createdDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Avatar color
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899', '#6366f1'];
  const colorIndex = parseInt(review.user_id?.substring(0, 8) || '0', 16) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <>
      <TableRow
        sx={{
          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
          cursor: "pointer",
        }}
      >
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ mr: 1 }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={2} alignItems="center">
            {bundleImage ? (
              <Avatar src={bundleImage} variant="square" sx={{ width: 40, height: 40 }} />
            ) : (
              <Avatar variant="square" sx={{ width: 40, height: 40, bgcolor: '#e0e0e0', color: '#666' }}>
                {bundleName.charAt(0)}
              </Avatar>
            )}
            <Typography variant="body2" fontWeight={500}>
              {bundleName}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar 
              src={userAvatar} 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: userAvatar ? 'transparent' : avatarColor, 
                color: 'white' 
              }}
            >
              {!userAvatar && userInitials}
            </Avatar>
            <Typography variant="body2" fontWeight={500}>
              {userName}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Rating
            value={review.rating}
            readOnly
            size="small"
            icon={<StarIcon fontSize="inherit" htmlColor="#FFD600" />}
            emptyIcon={<StarBorderIcon fontSize="inherit" />}
          />
        </TableCell>
        <TableCell>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {reviewText.length > 50
              ? `${reviewText.substring(0, 50)}...`
              : reviewText}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {formattedDate}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formattedTime}
          </Typography>
        </TableCell>
        <TableCell>
          {onDelete && (
            <IconButton
              size="small"
              onClick={handleDeleteClick}
              sx={{
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'white'
                }
              }}
              title="Delete Review"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 3, bgcolor: "#f5f5f5", borderRadius: 2, boxShadow: 1 }}>
              <Stack direction="row" spacing={3} alignItems="flex-start" mb={2}>
                {bundleImage ? (
                  <Avatar src={bundleImage} variant="square" sx={{ width: 80, height: 80 }} />
                ) : (
                  <Avatar variant="square" sx={{ width: 80, height: 80, bgcolor: '#e0e0e0', color: '#666', fontSize: '2rem' }}>
                    {bundleName.charAt(0)}
                  </Avatar>
                )}
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} mb={0.5}>
                    {bundleName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Avatar 
                      src={userAvatar} 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        bgcolor: userAvatar ? 'transparent' : avatarColor, 
                        color: 'white' 
                      }}
                    >
                      {!userAvatar && userInitials}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.customer?.email || 'No email available'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Rating
                      value={review.rating}
                      readOnly
                      icon={<StarIcon fontSize="inherit" htmlColor="#FFD600" />}
                      emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formattedDate} at {formattedTime}
                    </Typography>
                  </Stack>
                  {reviewTitle && (
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                      {reviewTitle}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {reviewText}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          <Typography variant="h6" component="span">
            Delete Bundle Review
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure you want to delete this review from {userName}?
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600} mb={0.5}>
              Bundle: {bundleName}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Rating
                value={review.rating}
                readOnly
                size="small"
                icon={<StarIcon fontSize="inherit" htmlColor="#FFD600" />}
                emptyIcon={<StarBorderIcon fontSize="inherit" />}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              "{reviewText.substring(0, 100)}{reviewText.length > 100 ? '...' : ''}"
            </Typography>
          </Box>
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowDeleteModal(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" startIcon={<DeleteIcon />}>
            Delete Review
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const BundleFeedback = ({ reviews, onDelete, loading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleRatingFilter = (rating) => {
    setRatingFilter(rating);
    setPage(0);
    handleFilterClose();
  };

  // Filter reviews by rating
  const filteredReviews = useMemo(() => {
    if (!ratingFilter) return reviews;
    return reviews.filter((review) => review.rating === ratingFilter);
  }, [reviews, ratingFilter]);

  // Paginate reviews
  const paginatedReviews = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredReviews.slice(start, end);
  }, [filteredReviews, page, rowsPerPage]);

  return (
    <Paper elevation={0} sx={{ width: "100%", overflow: "hidden", border: '1px solid #e0e0e0' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell sx={{ width: 50 }} />
              <TableCell sx={{ fontWeight: 700 }}>Bundle</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight={700}>
                    Rating
                  </Typography>
                  <IconButton size="small" onClick={handleFilterClick}>
                    <FilterList fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Review</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading bundle reviews...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    {ratingFilter 
                      ? `No ${ratingFilter}-star reviews found`
                      : 'No bundle reviews yet'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedReviews.map((review) => (
                <ReviewRow key={review.id} review={review} onDelete={onDelete} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredReviews.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ borderTop: '1px solid #e0e0e0' }}
      />

      {/* Rating Filter Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}>
        <MenuItem onClick={() => handleRatingFilter(null)}>
          <Typography variant="body2">All Ratings</Typography>
        </MenuItem>
        {[5, 4, 3, 2, 1].map((rating) => (
          <MenuItem key={rating} onClick={() => handleRatingFilter(rating)}>
            <Rating value={rating} readOnly size="small" sx={{ mr: 1 }} />
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};

export default BundleFeedback;
