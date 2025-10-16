import React, { useState } from "react";
import { Box, Typography, TextField, Button, Stack } from "@mui/material";
import { Search, FileDownload } from "@mui/icons-material";
import ProductFeedback from "./Feedback Components/ProductFeedback";
import Inqueries from "./Feedback Components/Inqueries";
import { productReviews, REVIEWS_PER_PAGE } from "./Feedback Components/feedbackData";

const Feedback = () => {
  const [activeTab, setActiveTab] = useState("reviews");
  const [inquiryFilter, setInquiryFilter] = useState("Question");
  const [expanded, setExpanded] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const paginatedReviews = productReviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );

  const handleDownloadFile = () => {
    console.log("Downloading feedback data...");
  };

  // Filter reviews based on search
  const filteredReviews = paginatedReviews.filter(
    (review) =>
      review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.review.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              variant={inquiryFilter === "Question" ? "contained" : "outlined"}
              onClick={() => setInquiryFilter("Question")}
              sx={{
                bgcolor: inquiryFilter === "Question" ? "#00E676" : "transparent",
                color: inquiryFilter === "Question" ? "#000" : "#00E676",
                borderColor: "#00E676",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "20px",
                px: 3,
                "&:hover": {
                  bgcolor: inquiryFilter === "Question" ? "#00C853" : "rgba(0, 230, 118, 0.1)",
                  borderColor: "#00C853",
                },
              }}
            >
              Question
            </Button>
            <Button
              variant={inquiryFilter === "Replied" ? "contained" : "outlined"}
              onClick={() => setInquiryFilter("Replied")}
              sx={{
                bgcolor: inquiryFilter === "Replied" ? "#00E676" : "transparent",
                color: inquiryFilter === "Replied" ? "#000" : "#00E676",
                borderColor: "#00E676",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "20px",
                px: 3,
                "&:hover": {
                  bgcolor: inquiryFilter === "Replied" ? "#00C853" : "rgba(0, 230, 118, 0.1)",
                  borderColor: "#00C853",
                },
              }}
            >
              Replied
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
        <ProductFeedback
          paginatedReviews={filteredReviews}
          expanded={expanded}
          setExpanded={setExpanded}
          reviewPage={reviewPage}
          setReviewPage={setReviewPage}
          REVIEWS_PER_PAGE={REVIEWS_PER_PAGE}
          totalReviews={productReviews.length}
        />
      )}

      {/* Inquiries Tab */}
      {activeTab === "inquiries" && (
        <Inqueries filter={inquiryFilter} searchQuery={searchQuery} />
      )}
    </Box>
  );
};

export default Feedback;
