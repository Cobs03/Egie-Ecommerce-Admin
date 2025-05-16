import React, { useState } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Typography,
  Rating,
  Stack,
  Pagination,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ProductFeedback = ({
  paginatedReviews,
  expanded,
  setExpanded,
  reviewPage,
  setReviewPage,
  REVIEWS_PER_PAGE,
  totalReviews,
}) => {
  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem("feedbackTab");
    return savedTab !== null ? Number(savedTab) : 0;
  });

  const [inquiryFilter, setInquiryFilter] = useState(() => {
    return localStorage.getItem("inquiryFilter") || "Question";
  });

  return (
    <Box sx={{ mt: 2 }}>
      {paginatedReviews.map((row, idx) => {
        const globalIdx = (reviewPage - 1) * REVIEWS_PER_PAGE + idx;
        const isExpanded = expanded === globalIdx;
        return (
          <Accordion
            key={globalIdx}
            expanded={isExpanded}
            onChange={() => setExpanded(isExpanded ? false : globalIdx)}
            sx={{ position: "relative" }}
          >
            <AccordionSummary
              aria-controls={`panel${globalIdx}-content`}
              id={`panel${globalIdx}-header`}
              sx={{
                flexDirection: "row",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ width: "100%" }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ minWidth: 200 }}
                >
                  <Avatar src={row.productImg} variant="square" />
                  <Typography variant="subtitle2">{row.productName}</Typography>
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ minWidth: 120 }}
                >
                  <Avatar sx={{ width: 24, height: 24 }} />
                  <Typography variant="body2">{row.username}</Typography>
                </Stack>
                <Rating
                  value={row.rating}
                  readOnly
                  icon={<StarIcon fontSize="inherit" htmlColor="#FFD600" />}
                  emptyIcon={<StarBorderIcon fontSize="inherit" />}
                  sx={{ minWidth: 100 }}
                />
                {!isExpanded && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ width: 290 }}
                    noWrap
                  >
                    {row.review}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  sx={{ minWidth: 100, textAlign: "right" }}
                >
                  {row.date}
                </Typography>
              </Stack>
              {/* Expand icon absolutely positioned at top right */}
              <ExpandMoreIcon
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 16,
                  transition: "transform 0.2s",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  zIndex: 1,
                }}
              />
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{row.review}</Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination
          count={Math.ceil(totalReviews / REVIEWS_PER_PAGE)}
          page={reviewPage}
          onChange={(_, value) => setReviewPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ProductFeedback;
