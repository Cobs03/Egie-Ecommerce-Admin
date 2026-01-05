import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Stack, CircularProgress, Snackbar, Alert } from "@mui/material";
import { Search, FileDownload } from "@mui/icons-material";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { AdminLogService } from "../../services/AdminLogService";
import ProductFeedback from "./Feedback Components/ProductFeedback";
import BundleFeedback from "./Feedback Components/BundleFeedback";
import Inqueries from "./Feedback Components/Inqueries";
import ReviewService from "../../services/ReviewService";
import InquiryService from "../../services/InquiryService";
import { toast, Toaster } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

const REVIEWS_PER_PAGE = 10;

const Feedback = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("reviews");
  const [inquiryFilter, setInquiryFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [bundleReviews, setBundleReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalBundleReviews, setTotalBundleReviews] = useState(0);
  const [stats, setStats] = useState({ total: 0, averageRating: 0, byRating: {} });
  const [bundleStats, setBundleStats] = useState({ total: 0, averageRating: 0, byRating: {} });
  
  // Success notification state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load reviews from database
  useEffect(() => {
    if (activeTab === "reviews") {
      loadReviews();
      loadStats();
    } else if (activeTab === "bundles") {
      loadBundleReviews();
      loadBundleStats();
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

  const loadBundleReviews = async () => {
    setLoading(true);
    try {
      const { data, error, total } = await ReviewService.getAllBundleReviews({
        search: searchQuery,
        limit: REVIEWS_PER_PAGE,
        offset: (reviewPage - 1) * REVIEWS_PER_PAGE
      });

      if (error) {
        toast.error('Failed to load bundle reviews', { description: error });
      } else {
        setBundleReviews(data || []);
        setTotalBundleReviews(total || 0);
      }
    } catch (error) {
      console.error('Error loading bundle reviews:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const loadBundleStats = async () => {
    try {
      const { data, error } = await ReviewService.getBundleReviewStats();
      if (!error && data) {
        setBundleStats(data);
      }
    } catch (error) {
      console.error('Error loading bundle stats:', error);
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

  const handleDeleteBundleReview = async (reviewId, reviewData) => {
    try {
      const { error } = await ReviewService.deleteBundleReview(reviewId, reviewData);
      if (error) {
        toast.error('Failed to delete bundle review', { description: error.message });
      } else {
        toast.success('Bundle review deleted successfully');
        loadBundleReviews();
        loadBundleStats();
      }
    } catch (error) {
      console.error('Error deleting bundle review:', error);
      toast.error('Something went wrong');
    }
  };

  const handleDownloadFile = async () => {
    if (activeTab === 'bundles') {
      return handleDownloadBundleReviews();
    }

    if (reviews.length === 0) {
      toast.error('No reviews to export');
      return;
    }

    try {
      // Create Excel data from reviews
      const excelData = reviews.map((review, index) => {
        const productName = review.products?.name || review.products?.title || 'Unknown Product';
        const userName = review.user_name || review.user_email?.split('@')[0] || 'Anonymous';
        const date = new Date(review.created_at);
        
        return {
          'No': index + 1,
          'Product': productName,
          'Customer': userName,
          'Email': review.user_email || 'N/A',
          'Rating': review.rating,
          'Title': review.title || 'N/A',
          'Review': review.comment || 'N/A',
          'Date': date.toLocaleDateString(),
          'Time': date.toLocaleTimeString()
        };
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reviews");

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // No
        { wch: 30 }, // Product
        { wch: 20 }, // Customer
        { wch: 25 }, // Email
        { wch: 10 }, // Rating
        { wch: 30 }, // Title
        { wch: 50 }, // Review
        { wch: 15 }, // Date
        { wch: 15 }  // Time
      ];

      // Generate file name with current date
      const date = new Date().toISOString().split('T')[0];
      const fileName = `Reviews_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);

      // Log admin action
      await AdminLogService.createLog(
        user?.id,
        'download',
        'review',
        null,
        { count: reviews.length, fileName }
      );

      // Show success notification
      setSuccessMessage(`Successfully downloaded ${reviews.length} review records`);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download reviews');
    }
  };

  const handleDownloadBundleReviews = async () => {
    if (bundleReviews.length === 0) {
      toast.error('No bundle reviews to export');
      return;
    }

    try {
      // Create Excel data from bundle reviews
      const excelData = bundleReviews.map((review, index) => {
        const bundleName = review.bundles?.bundle_name || 'Unknown Bundle';
        const customerFirstName = review.customer?.first_name || '';
        const customerLastName = review.customer?.last_name || '';
        const userName = `${customerFirstName} ${customerLastName}`.trim() || 'Anonymous';
        const date = new Date(review.created_at);
        
        return {
          'No': index + 1,
          'Bundle': bundleName,
          'Customer': userName,
          'Email': review.customer?.email || 'N/A',
          'Rating': review.rating,
          'Title': review.title || 'N/A',
          'Review': review.comment || 'N/A',
          'Date': date.toLocaleDateString(),
          'Time': date.toLocaleTimeString()
        };
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bundle Reviews");

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // No
        { wch: 30 }, // Bundle
        { wch: 20 }, // Customer
        { wch: 25 }, // Email
        { wch: 10 }, // Rating
        { wch: 30 }, // Title
        { wch: 50 }, // Review
        { wch: 15 }, // Date
        { wch: 15 }  // Time
      ];

      // Generate file name with current date
      const date = new Date().toISOString().split('T')[0];
      const fileName = `Bundle_Reviews_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);

      // Log admin action
      await AdminLogService.createLog(
        user?.id,
        'download',
        'bundle_review',
        null,
        { count: bundleReviews.length, fileName }
      );

      // Show success notification
      setSuccessMessage(`Successfully downloaded ${bundleReviews.length} bundle review records`);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download bundle reviews');
    }
  };

  const handleDownloadInquiries = async () => {
    try {
      // Fetch all inquiries based on current filter and search
      const { data, error } = await InquiryService.getAllInquiries({
        status: inquiryFilter === 'all' ? undefined : inquiryFilter,
        search: searchQuery
      });

      if (error || !data || data.length === 0) {
        toast.error('No inquiries to export');
        return;
      }

      // Create Excel data from inquiries
      const excelData = data.map((inquiry, index) => {
        const customerName = inquiry.customer
          ? `${inquiry.customer.first_name} ${inquiry.customer.last_name}`
          : 'Guest';
        const customerEmail = inquiry.customer?.email || inquiry.guest_email || 'N/A';
        const productName = inquiry.product?.name || 'N/A';
        const date = new Date(inquiry.created_at);
        
        return {
          'No': index + 1,
          'Customer': customerName,
          'Email': customerEmail,
          'Product': productName,
          'Subject': inquiry.subject || 'N/A',
          'Question': inquiry.question || 'N/A',
          'Status': inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1),
          'Replies': inquiry.reply_count || 0,
          'Date': date.toLocaleDateString(),
          'Time': date.toLocaleTimeString()
        };
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inquiries");

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // No
        { wch: 25 }, // Customer
        { wch: 30 }, // Email
        { wch: 30 }, // Product
        { wch: 30 }, // Subject
        { wch: 50 }, // Question
        { wch: 12 }, // Status
        { wch: 10 }, // Replies
        { wch: 15 }, // Date
        { wch: 15 }  // Time
      ];

      // Generate file name with current date
      const date = new Date().toISOString().split('T')[0];
      const fileName = `Inquiries_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);

      // Log admin action
      await AdminLogService.createLog(
        user?.id,
        'download',
        'inquiry',
        null,
        { count: data.length, fileName }
      );

      // Show success notification
      setSuccessMessage(`Successfully downloaded ${data.length} inquiry records`);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download inquiries');
    }
  };

  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

  return (
    <Box p={4}>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight={700} mb={3} sx={{ fontFamily: "Bruno Ace SC" }}>
          FEEDBACK MANAGEMENT
        </Typography>
      </motion.div>

      {/* Search Bar & Pill Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
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
            onClick={() => setActiveTab("bundles")}
            sx={{
              bgcolor: activeTab === "bundles" ? "#00E676" : "transparent",
              color: activeTab === "bundles" ? "#000" : "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "20px",
              px: 3,
              py: 0.75,
              minWidth: 140,
              border: activeTab === "bundles" ? "none" : "2px solid #fff",
              "&:hover": {
                bgcolor: activeTab === "bundles" ? "#00C853" : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Bundle Reviews
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
      </motion.div>

      {/* Filter Buttons & Export Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
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
          onClick={activeTab === "reviews" ? handleDownloadFile : activeTab === "bundles" ? handleDownloadFile : handleDownloadInquiries}
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
          {activeTab === "reviews" ? "Download Reviews" : activeTab === "bundles" ? "Download Bundle Reviews" : "Download Inquiries"}
        </Button>
      </Box>
      </motion.div>

      {/* Product Reviews Tab */}
      {activeTab === "reviews" && (
        <motion.div
          key="reviews"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
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
        </motion.div>
      )}

      {/* Bundle Reviews Tab */}
      {activeTab === "bundles" && (
        <motion.div
          key="bundles"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
        <>
          {/* Statistics Dashboard */}
          {!loading && bundleStats && bundleStats.total > 0 && (
            <Box sx={{ mb: 3, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, boxShadow: 1 }}>
              <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
                <Box>
                  <Typography variant="h3" fontWeight={700} color="#00E676">
                    {bundleStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Reviews
                  </Typography>
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="h3" fontWeight={700}>
                      {bundleStats.averageRating.toFixed(1)}
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
                      const count = bundleStats.byRating[rating] || 0;
                      const percentage = bundleStats.total > 0 ? (count / bundleStats.total) * 100 : 0;
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
          
          <BundleFeedback
            reviews={bundleReviews}
            loading={loading}
            onDelete={handleDeleteBundleReview}
          />
        </>
        </motion.div>
      )}

      {/* Inquiries Tab */}
      {activeTab === "inquiries" && (
        <motion.div
          key="inquiries"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Inqueries filter={inquiryFilter} searchQuery={searchQuery} />
        </motion.div>
      )}

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%', bgcolor: '#4caf50', color: 'white' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Toaster position="bottom-right" richColors />
    </Box>
  );
};

export default Feedback;
