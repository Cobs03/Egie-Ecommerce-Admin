import React, { useState } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Typography,
  Stack,
  Button,
  Pagination,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FeedbackModal from "./FeedbackModal";

const inquiries = [
  {
    productImg: "https://cdn-icons-png.flaticon.com/512/69/69525.png",
    username: "Emily Chen",
    inquiry: "Is this controller compatible with Nintendo Switch?",
    date: "Mar 10, 2024",
    status: "Question",
  },
  {
    productImg: "https://cdn-icons-png.flaticon.com/512/69/69526.png",
    username: "David Kim",
    inquiry: "How long is the warranty for this product?",
    date: "Mar 12, 2024",
    status: "Replied",
  },
  {
    productImg: "https://cdn-icons-png.flaticon.com/512/69/69527.png",
    username: "Fatima Zahra",
    inquiry: "Does it come with a charging cable included?",
    date: "Feb 20, 2024",
    status: "Question",
  },
  {
    productImg: "https://cdn-icons-png.flaticon.com/512/69/69528.png",
    username: "Lucas Rossi",
    inquiry: "What is the return policy if it doesn't work?",
    date: "Feb 25, 2024",
    status: "Replied",
  },
  {
    productImg: "https://cdn-icons-png.flaticon.com/512/69/69529.png",
    username: "Sophie Dubois",
    inquiry: "Is there a discount for bulk orders?",
    date: "Jan 30, 2024",
    status: "Question",
  },
];

const INQUIRIES_PER_PAGE = 40;

const Inqueries = ({ filter = "Question" }) => {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [activeInquiry, setActiveInquiry] = useState(null);

  const filteredInquiries = inquiries.filter((row) => row.status === filter);
  const paginatedInquiries = filteredInquiries.slice(
    (page - 1) * INQUIRIES_PER_PAGE,
    page * INQUIRIES_PER_PAGE
  );

  const handleReply = (inquiry) => {
    setActiveInquiry(inquiry);
    setModalOpen(true);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {paginatedInquiries.map((row, idx) => {
        const globalIdx = (page - 1) * INQUIRIES_PER_PAGE + idx;
        const isExpanded = expanded === globalIdx;
        return (
          <Accordion
            key={globalIdx}
            expanded={isExpanded}
            onChange={() => setExpanded(isExpanded ? false : globalIdx)}
            sx={{ position: "relative" }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    transition: "transform 0.2s",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              }
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
                <Avatar src={row.productImg} variant="square" />
                <Typography variant="body2" sx={{ minWidth: 120 }}>
                  {row.username}
                </Typography>
                {!isExpanded && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ width: 290 }}
                    noWrap
                  >
                    {row.inquiry}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  sx={{ minWidth: 100, textAlign: "right" }}
                >
                  {row.date}
                </Typography>
                {row.status === "Question" && (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ ml: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReply(row);
                    }}
                  >
                    Reply
                  </Button>
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{row.inquiry}</Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination
          count={Math.ceil(filteredInquiries.length / INQUIRIES_PER_PAGE)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>
      <FeedbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={() => {
          // handle reply submit here
          setReplyText("");
        }}
        replyText={replyText}
        setReplyText={setReplyText}
      />
    </Box>
  );
};

export default Inqueries;
