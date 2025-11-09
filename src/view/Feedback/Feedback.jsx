import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Stack, CircularProgress } from "@mui/material";
import { Search, FileDownload } from "@mui/icons-material";
import ProductFeedback from "./Feedback Components/ProductFeedback";
import Inqueries from "./Feedback Components/Inqueries";
import ReviewService from "../../services/ReviewService";
import { toast, Toaster } from "sonner";

const REVIEWS_PER_PAGE = 10;

const Feedback = () => {
  const [activeTab, setActiveTab] = useState("reviews");
  const [inquiryFilter, setInquiryFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [stats, setStats] = useState({ total: 0, averageRating: 0, byRating: {} });

  // Load reviews from database
  useEffect(() => {
    if (activeTab === "reviews") {
      loadReviews();
      loadStats();
    }
  }, [reviewPage, searchQuery, activeTab]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data, error, total } = await ReviewService.getAllReviews({
        search: searchQuery,
        limit: REVIEWS_PER_PAGE,
        offset: (reviewPage - 1) * REVIEWS_PER_PAGE
      });

      if (error) {
        toast.error('Failed to load reviews', { description: error });
      } else {
        setReviews(data || []);
        setTotalReviews(total || 0);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await ReviewService.getReviewStats();
      if (!error && data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDeleteReview = async (reviewId, reviewData) => {
    try {
      const { error } = await ReviewService.deleteReview(reviewId, reviewData);
      if (error) {
        toast.error('Failed to delete review', { description: error.message });
      } else {
        toast.success('Review deleted successfully');
        loadReviews();
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Something went wrong');
    }
  };

  const handleDownloadFile = () => {
    if (reviews.length === 0) {
      toast.error('No reviews to export');
      return;
    }

    // Export reviews to CSV
    const headers = ['Product', 'Customer', 'Email', 'Rating', 'Title', 'Review', 'Date', 'Time'];
    const csvData = reviews.map(review => {
      const productName = review.products?.name || review.products?.title || 'Unknown Product';
      const userName = review.user_name || review.user_email?.split('@')[0] || 'Anonymous';
      const date = new Date(review.created_at);
      
      return [
        `"${productName}"`,
        `"${userName}"`,
        `"${review.user_email || ''}"`,
        review.rating,
        `"${review.title || ''}"`,
        `"${(review.comment || '').replace(/"/g, '""')}"`,
        date.toLocaleDateString(),
        date.toLocaleTimeString()
      ].join(',');
    });

    const csv = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reviews_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Reviews exported successfully');
  };

  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

  return (
    <Box p={4}>
      {/* Title */}
      <Typography variant="h4" fontWeight={700} mb={3}>
        FEEDBACK MANAGEMENT
      </Typography>

      {/* Search Bar & Pill Tabs */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        p={1.5}
        bgcolor="#000"
        borderRadius={2}
        boxShadow={2}
      >
        <TextField
          size="small"
          placeholder="Search Feedback"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <Search fontSize="small" sx={{ mr: 1, color: "#000" }} />
            ),
          }}
          sx={{
            bgcolor: "#fff",
            borderRadius: 1,
            minWidth: 300,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { border: "none" },
            },
          }}
        />
        <Box flex={1} />

        {/* Pill-Style Tabs */}
        <Stack direction="row" spacing={0.5}>
          <Button
            onClick={() => setActiveTab("reviews")}
            sx={{
              bgcolor: activeTab === "reviews" ? "#00E676" : "transparent",
              color: activeTab === "reviews" ? "#000" : "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "20px",
              px: 3,
              py: 0.75,
              minWidth: 140,
              border: activeTab === "reviews" ? "none" : "2px solid #fff",
              "&:hover": {
                bgcolor: activeTab === "reviews" ? "#00C853" : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Product Reviews
          </Button>
          <Button
            onClick={() => setActiveTab("inquiries")}
            sx={{
              bgcolor: activeTab === "inquiries" ? "#00E676" : "transparent",
              color: activeTab === "inquiries" ? "#000" : "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "20px",
              px: 3,
              py: 0.75,
              minWidth: 140,
              border: activeTab === "inquiries" ? "none" : "2px solid #fff",
              "&:hover": {
                bgcolor: activeTab === "inquiries" ? "#00C853" : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Inquiries
          </Button>
        </Stack>
      </Box>

      {/* Filter Buttons & Export Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        {/* Filter buttons for Inquiries tab */}
        {activeTab === "inquiries" ? (
          <Stack direction="row" spacing={2}>
            <Button
              variant={inquiryFilter === "all" ? "contained" : "outlined"}
              onClick={() => setInquiryFilter("all")}
              sx={{
                bgcolor: inquiryFilter === "all" ? "#00E676" : "transparent",
                color: inquiryFilter === "all" ? "#000" : "#00E676",
                borderColor: "#00E676",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "20px",
                px: 3,
                "&:hover": {
                  bgcolor: inquiryFilter === "all" ? "#00C853" : "rgba(0, 230, 118, 0.1)",
                  borderColor: "#00C853",
                },
              }}
            >
              All
            </Button>
            <Button
              variant={inquiryFilter === "pending" ? "contained" : "outlined"}
              onClick={() => setInquiryFilter("pending")}
              sx={{
                bgcolor: inquiryFilter === "pending" ? "#00E676" : "transparent",
                color: inquiryFilter === "pending" ? "#000" : "#00E676",
                borderColor: "#00E676",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "20px",
                px: 3,
                "&:hover": {
                  bgcolor: inquiryFilter === "pending" ? "#00C853" : "rgba(0, 230, 118, 0.1)",
                  borderColor: "#00C853",
                },
              }}
            >
              Pending
            </Button>
            <Button
              variant={inquiryFilter === "answered" ? "contained" : "outlined"}
              onClick={() => setInquiryFilter("answered")}
              sx={{
                bgcolor: inquiryFilter === "answered" ? "#00E676" : "transparent",
                color: inquiryFilter === "answered" ? "#000" : "#00E676",
                borderColor: "#00E676",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "20px",
                px: 3,
                "&:hover": {
                  bgcolor: inquiryFilter === "answered" ? "#00C853" : "rgba(0, 230, 118, 0.1)",
                  borderColor: "#00C853",
                },
              }}
            >
              Answered
            </Button>
            <Button
              variant={inquiryFilter === "closed" ? "contained" : "outlined"}
              onClick={() => setInquiryFilter("closed")}
              sx={{
                bgcolor: inquiryFilter === "closed" ? "#00E676" : "transparent",
                color: inquiryFilter === "closed" ? "#000" : "#00E676",
                borderColor: "#00E676",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "20px",
                px: 3,
                "&:hover": {
                  bgcolor: inquiryFilter === "closed" ? "#00C853" : "rgba(0, 230, 118, 0.1)",
                  borderColor: "#00C853",
                },
              }}
            >
              Closed
            </Button>
          </Stack>
        ) : (
          <Box /> // Empty box to maintain layout spacing
        )}

        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={handleDownloadFile}
          sx={{
            borderColor: "#1976d2",
            color: "#1976d2",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              borderColor: "#115293",
              bgcolor: "rgba(25, 118, 210, 0.04)",
            },
          }}
        >
          {activeTab === "reviews" ? "Export Reviews" : "Export Inquiries"}
        </Button>
      </Box>

      {/* Product Reviews Tab */}
      {activeTab === "reviews" && (
        <>
          {/* Statistics Dashboard */}
          {!loading && stats && stats.total > 0 && (
            <Box sx={{ mb: 3, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, boxShadow: 1 }}>
              <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
                <Box>
                  <Typography variant="h3" fontWeight={700} color="#00E676">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Reviews
                  </Typography>
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="h3" fontWeight={700}>
                      {stats.averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="h5" color="#FFD600">★</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Average Rating
                  </Typography>
                </Box>
                <Box flex={1} minWidth={300}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    Rating Distribution
                  </Typography>
                  <Stack spacing={0.5}>
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = stats.byRating[rating] || 0;
                      const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      return (
                        <Stack key={rating} direction="row" alignItems="center" spacing={1}>
                          <Typography variant="caption" sx={{ minWidth: 25, fontWeight: 600 }}>
                            {rating}★
                          </Typography>
                          <Box 
                            sx={{ 
                              flex: 1, 
                              height: 10, 
                              bgcolor: '#e0e0e0', 
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <Box 
                              sx={{ 
                                height: '100%', 
                                width: `${percentage}%`, 
                                bgcolor: '#FFD600',
                                transition: 'width 0.3s ease'
                              }} 
                            />
                          </Box>
                          <Typography variant="caption" sx={{ minWidth: 40, fontWeight: 600 }}>
                            {count} ({percentage.toFixed(0)}%)
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}
          
          <ProductFeedback
            reviews={reviews}
            loading={loading}
            onDelete={handleDeleteReview}
            reviewPage={reviewPage}
            setReviewPage={setReviewPage}
            totalReviews={totalReviews}
            reviewsPerPage={REVIEWS_PER_PAGE}
          />
        </>
      )}

      {/* Inquiries Tab */}
      {activeTab === "inquiries" && (
        <Inqueries filter={inquiryFilter} searchQuery={searchQuery} />
      )}

      <Toaster position="bottom-right" richColors />
    </Box>
  );
};

export default Feedback;
