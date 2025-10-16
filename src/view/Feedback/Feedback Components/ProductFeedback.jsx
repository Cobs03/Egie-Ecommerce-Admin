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
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  FilterList,
} from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const ReviewRow = ({ review }) => {
  const [open, setOpen] = useState(false);

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
            <Avatar src={review.productImg} variant="square" />
            <Typography variant="body2" fontWeight={500}>
              {review.productName}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 32, height: 32 }}>
              {review.username.charAt(0)}
            </Avatar>
            <Typography variant="body2" fontWeight={500}>
              {review.username}
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
            {review.review.length > 15
              ? `${review.review.substring(0, 15)}...`
              : review.review}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {review.date}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {review.time}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
                <Avatar src={review.productImg} variant="square" sx={{ width: 60, height: 60 }} />
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                    {review.productName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {review.username.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500}>
                      {review.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • {review.date} / {review.time}
                    </Typography>
                  </Stack>
                  <Rating
                    value={review.rating}
                    readOnly
                    size="small"
                    icon={<StarIcon fontSize="inherit" htmlColor="#FFD600" />}
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    sx={{ mb: 1 }}
                  />
                </Box>
              </Stack>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Review:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {review.review}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
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
  paginatedReviews,
  reviewPage,
  setReviewPage,
  REVIEWS_PER_PAGE,
  totalReviews,
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
    let filtered = [...paginatedReviews];

    // Filter by rating
    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(review => {
        const reviewDate = new Date(review.date);
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
    if (productFilter === "a-z") {
      filtered.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (productFilter === "z-a") {
      filtered.sort((a, b) => b.productName.localeCompare(a.productName));
    } else if (productFilter === "recent") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return filtered;
  }, [paginatedReviews, productFilter, ratingFilter, dateFilter]);

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
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedReviews
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((review) => (
                <ReviewRow key={review.id} review={review} />
              ))}
            {filteredAndSortedReviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No reviews found
                  </Typography>
                </TableCell>
              </TableRow>
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
