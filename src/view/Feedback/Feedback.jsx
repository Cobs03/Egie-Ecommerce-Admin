import React, { useState } from "react";
import { Box, Tabs, Tab, Button, Stack, Typography } from "@mui/material";
import ProductFeedback from "./ProductFeedback";
import Inqueries from "./Inqueries";

const productReviews = [
  {
    productImg: "https://cdn-icons-png.flaticon.com/512/69/69525.png",
    productName: "EGIE Wireless Controller",
    username: "Sarah Lee",
    rating: 4,
    review: "Great controller, works perfectly with my PC and PS5!",
    date: "Mar 15, 2024",
  },
  {
    productImg: "https://cdn-icons-png.flaticon.com/512/69/69526.png",
    productName: "EGIE Pro Gamepad",
    username: "John Smith",
    rating: 3,
    review: "Good value for the price, but the battery life could be better.",
    date: "Feb 28, 2024",
  },
  {
    productImg: "https://cdn-icons-png.flaticon.com/512/69/69527.png",
    productName: "EGIE Turbo Joystick",
    username: "Priya Patel",
    rating: 5,
    review: "Absolutely love it! Fast shipping and great packaging.",
    date: "Jan 10, 2024",
  },
  {
    productImg: "https://cdn-icons-png.flaticon.com/512/69/69528.png",
    productName: "EGIE Classic Pad",
    username: "Carlos Rivera",
    rating: 2,
    review:
      "Had some issues connecting to Bluetooth, but customer service helped.",
    date: "Dec 22, 2023",
  },
  {
    productImg: "https://cdn-icons-png.flaticon.com/512/69/69529.png",
    productName: "EGIE Elite Controller",
    username: "Anna Müller",
    rating: 5,
    review: "Best purchase this year! Highly recommend to gamers.",
    date: "Nov 5, 2023",
  },
];

function a11yProps(index) {
  return {
    id: `feedback-tab-${index}`,
    "aria-controls": `feedback-tabpanel-${index}`,
  };
}

const REVIEWS_PER_PAGE = 40;

const Feedback = () => {
  const [tab, setTab] = useState(0);
  const [inquiryFilter, setInquiryFilter] = useState("Question");
  const [expanded, setExpanded] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const paginatedReviews = productReviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Feedback
      </Typography>
      <Tabs value={tab} onChange={handleTabChange} aria-label="feedback tabs">
        <Tab label="Product Reviews" {...a11yProps(0)} />
        <Tab label="Inquiries" {...a11yProps(1)} />
      </Tabs>
      {/* Product Reviews Tab */}
      {tab === 0 && (
        <ProductFeedback
          paginatedReviews={paginatedReviews}
          expanded={expanded}
          setExpanded={setExpanded}
          reviewPage={reviewPage}
          setReviewPage={setReviewPage}
          REVIEWS_PER_PAGE={REVIEWS_PER_PAGE}
          totalReviews={productReviews.length}
        />
      )}
      {/* Inquiries Tab */}
      {tab === 1 && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant={inquiryFilter === "Question" ? "contained" : "outlined"}
              color="success"
              onClick={() => setInquiryFilter("Question")}
              sx={{ borderRadius: 3 }}
            >
              Question
            </Button>
            <Button
              variant={inquiryFilter === "Replied" ? "contained" : "outlined"}
              color="success"
              onClick={() => setInquiryFilter("Replied")}
              sx={{ borderRadius: 3 }}
            >
              Replied
            </Button>
          </Stack>
          <Inqueries filter={inquiryFilter} />
        </Box>
      )}
    </Box>
  );
};

export default Feedback;
