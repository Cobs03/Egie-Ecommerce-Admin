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
  const productName = review.products?.name || review.products?.title || 'Unknown Product';
  const productImage = review.products?.images?.[0] || null;
  
  // Get customer name and avatar from profile (first priority) or fallback to review fields
  const customerFirstName = review.customer?.first_name || '';
  const customerLastName = review.customer?.last_name || '';
  const customerFullName = `${customerFirstName} ${customerLastName}`.trim();
  const userName = customerFullName || review.user_name || review.user_email?.split('@')[0] || 'Anonymous';
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

  // Avatar color (same logic as e-commerce)
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
            {productImage ? (
              <Avatar src={productImage} variant="square" sx={{ width: 40, height: 40 }} />
            ) : (
              <Avatar variant="square" sx={{ width: 40, height: 40, bgcolor: '#e0e0e0', color: '#666' }}>
                {productName.charAt(0)}
              </Avatar>
            )}
            <Typography variant="body2" fontWeight={500}>
              {productName}
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
              onClick={(e) => {
                e.stopPropagation();
                onDelete(review.id);
              }}
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
                {productImage ? (
                  <Avatar src={productImage} variant="square" sx={{ width: 80, height: 80 }} />
                ) : (
                  <Avatar variant="square" sx={{ width: 80, height: 80, bgcolor: '#e0e0e0', color: '#666', fontSize: '2rem' }}>
                    {productName.charAt(0)}
                  </Avatar>
                )}
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} mb={0.5}>
                    {productName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
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
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.customer?.email || review.user_email || 'No email'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      • {formattedDate} at {formattedTime}
                    </Typography>
                  </Stack>
                  <Rating
                    value={review.rating}
                    readOnly
                    size="medium"
                    icon={<StarIcon fontSize="inherit" htmlColor="#FFD600" />}
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    sx={{ mb: 1 }}
                  />
                </Box>
              </Stack>
              
              {reviewTitle && (
                <>
                  <Typography variant="subtitle1" fontWeight={700} mb={1}>
                    {reviewTitle}
                  </Typography>
                </>
              )}
              
              <Typography variant="body2" fontWeight={600} mb={1} color="text.secondary">
                Review:
              </Typography>
              <Typography variant="body1" color="text.primary" mb={2} sx={{ whiteSpace: 'pre-wrap' }}>
                {reviewText}
              </Typography>

              {onDelete && (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton 
                    size="small" 
                    onClick={handleDeleteClick}
                    sx={{ 
                      color: 'error.main',
                      border: '1.5px solid',
                      borderColor: 'error.main',
                      borderRadius: 1,
                      px: 1.5,
                      py: 0.5,
                      '&:hover': { 
                        bgcolor: 'error.main', 
                        color: 'white',
                        borderColor: 'error.main'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" fontWeight={600}>Delete Review</Typography>
                  </IconButton>
                </Stack>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'error.light',
              }}
            >
              <WarningIcon sx={{ color: 'error.main', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Delete Review?
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" mb={2.5} sx={{ fontSize: '0.95rem' }}>
            This action cannot be undone. The review will be permanently deleted and this activity will be logged.
          </Typography>
          
          {/* Review Preview Card */}
          <Box 
            sx={{ 
              p: 2.5, 
              bgcolor: '#f8f9fa', 
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}
          >
            <Stack direction="row" spacing={1.5} mb={1.5}>
              {userAvatar ? (
                <Avatar src={userAvatar} sx={{ width: 40, height: 40 }} />
              ) : (
                <Avatar sx={{ width: 40, height: 40, bgcolor: avatarColor, color: 'white' }}>
                  {userInitials}
                </Avatar>
              )}
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {review.customer?.email || review.user_email}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body2" fontWeight={600} color="primary.main" mb={0.5}>
              {productName}
            </Typography>
            
            <Rating 
              value={review.rating} 
              readOnly 
              size="small" 
              sx={{ mb: 1 }}
              icon={<StarIcon fontSize="inherit" htmlColor="#FFD600" />}
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
            />
            
            {reviewTitle && (
              <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                {reviewTitle}
              </Typography>
            )}
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5
              }}
            >
              {reviewText}
            </Typography>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Posted on {formattedDate} at {formattedTime}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setShowDeleteModal(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              px: 2.5
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              px: 2.5,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.25)'
              }
            }}
          >
            Delete Review
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const FilterHeader = ({ title, options, currentFilter, onFilterChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value) => {
    onFilterChange(value);
    handleClose();
  };

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        <IconButton size="small" onClick={handleClick}>
          <FilterList fontSize="small" />
        </IconButton>
      </Stack>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 150 }
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            selected={currentFilter === option.value}
            sx={{
              bgcolor: currentFilter === option.value ? "#E4FDE1" : "transparent",
              "&:hover": {
                bgcolor: currentFilter === option.value ? "#D4EDD1" : "rgba(0, 0, 0, 0.04)",
              }
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const ProductFeedback = ({
  reviews = [],
  loading = false,
  onDelete,
  reviewPage,
  setReviewPage,
  totalReviews,
  reviewsPerPage,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productFilter, setProductFilter] = useState("recent");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const productOptions = [
    { label: "Recent", value: "recent" },
    { label: "A-Z", value: "a-z" },
    { label: "Z-A", value: "z-a" },
  ];

  const ratingOptions = [
    { label: "All Ratings", value: "all" },
    { label: "5 Stars", value: "5" },
    { label: "4 Stars", value: "4" },
    { label: "3 Stars", value: "3" },
    { label: "2 Stars", value: "2" },
    { label: "1 Star", value: "1" },
  ];

  const dateOptions = [
    { label: "All Time", value: "all" },
    { label: "Last 24 Hours", value: "24h" },
    { label: "Last Week", value: "1w" },
    { label: "Last Month", value: "1m" },
    { label: "Last Year", value: "1y" },
  ];

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(review => {
        const reviewDate = new Date(review.created_at);
        const diffTime = Math.abs(now - reviewDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "24h":
            return diffDays <= 1;
          case "1w":
            return diffDays <= 7;
          case "1m":
            return diffDays <= 30;
          case "1y":
            return diffDays <= 365;
          default:
            return true;
        }
      });
    }

    // Sort by product
    const getProductName = (review) => review.products?.name || review.products?.title || 'Unknown';
    
    if (productFilter === "a-z") {
      filtered.sort((a, b) => getProductName(a).localeCompare(getProductName(b)));
    } else if (productFilter === "z-a") {
      filtered.sort((a, b) => getProductName(b).localeCompare(getProductName(a)));
    } else if (productFilter === "recent") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  }, [reviews, productFilter, ratingFilter, dateFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F5F5F5" }}>
              <TableCell sx={{ width: 50 }} />
              <TableCell>
                <FilterHeader
                  title="Product"
                  options={productOptions}
                  currentFilter={productFilter}
                  onFilterChange={setProductFilter}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell>
                <FilterHeader
                  title="Rating"
                  options={ratingOptions}
                  currentFilter={ratingFilter}
                  onFilterChange={setRatingFilter}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Review</TableCell>
              <TableCell>
                <FilterHeader
                  title="Date"
                  options={dateOptions}
                  currentFilter={dateFilter}
                  onFilterChange={setDateFilter}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ border: 'none', py: 0 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    minHeight: '300px',
                    justifyContent: 'center',
                    gap: 1.5
                  }}>
                    <Box
                      sx={{
                        width: '60px',
                        height: '60px',
                        border: '6px solid rgba(0, 230, 118, 0.1)',
                        borderTop: '6px solid #00E676',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                    <Typography variant="body2" color="#00E676" sx={{ fontWeight: 500 }}>
                      Loading reviews...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredAndSortedReviews
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((review) => (
                    <ReviewRow key={review.id} review={review} onDelete={onDelete} />
                  ))}
                {filteredAndSortedReviews.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No reviews found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAndSortedReviews.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            backgroundColor: "#E4FDE1",
            borderTop: "1px solid #e0e0e0",
            "& .MuiTablePagination-toolbar": {
              justifyContent: "flex-start",
              paddingLeft: 2,
            },
            "& .MuiTablePagination-spacer": {
              display: "none",
            },
            "& .MuiTablePagination-displayedRows": {
              marginLeft: 0,
            },
            "& .MuiTablePagination-actions": {
              marginLeft: 2,
            },
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default ProductFeedback;
