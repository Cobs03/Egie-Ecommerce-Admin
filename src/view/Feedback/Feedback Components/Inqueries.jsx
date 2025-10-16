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
  Button,
  IconButton,
  Collapse,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  FilterList,
  Check,
} from "@mui/icons-material";
import FeedbackModal from "./FeedbackModal";
import { customerInquiries } from "./feedbackData";

const INQUIRIES_PER_PAGE = 10;

// Filter Header Component
const FilterHeader = ({ label, options, selected, onSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value) => {
    onSelect(value);
    handleClose();
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ cursor: "pointer" }}
        onClick={handleClick}
      >
        <Typography fontWeight={700}>{label}</Typography>
        <FilterList fontSize="small" />
      </Stack>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 150 },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            sx={{
              bgcolor: selected === option.value ? "#E8F5E9" : "transparent",
            }}
          >
            {selected === option.value && (
              <ListItemIcon>
                <Check fontSize="small" sx={{ color: "#00E676" }} />
              </ListItemIcon>
            )}
            <ListItemText inset={selected !== option.value}>
              {option.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const InquiryRow = ({ inquiry, onReply }) => {
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
            <Avatar variant="square" sx={{ width: 32, height: 32 }}>
              {inquiry.customerName.charAt(0)}
            </Avatar>
            <Box>
              <Typography fontWeight={600}>{inquiry.customerName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {inquiry.email}
              </Typography>
            </Box>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {inquiry.productName}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 300,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {inquiry.question.length > 15
              ? `${inquiry.question.substring(0, 15)}...`
              : inquiry.question}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {inquiry.date} / {inquiry.time}
          </Typography>
        </TableCell>
        <TableCell>
          {inquiry.status === "Question" && (
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onReply(inquiry);
              }}
              sx={{
                borderColor: "#00E676",
                color: "#00E676",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#00C853",
                  bgcolor: "rgba(0, 230, 118, 0.04)",
                },
              }}
            >
              Reply
            </Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Stack direction="row" spacing={2} mb={2}>
                <Avatar variant="square" sx={{ width: 40, height: 40 }}>
                  {inquiry.customerName.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600} mb={0.5}>
                    {inquiry.customerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {inquiry.email} • {inquiry.date} / {inquiry.time}
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Product: {inquiry.productName}
              </Typography>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Customer Inquiry:
              </Typography>
              <Typography variant="body2" mb={2}>
                {inquiry.question}
              </Typography>

              {inquiry.status === "Replied" && inquiry.reply && (
                <>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Admin Reply:
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    {inquiry.reply}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Replied on: {inquiry.repliedDate} / {inquiry.repliedTime}
                  </Typography>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Inqueries = ({ filter = "Question", searchQuery = "" }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(INQUIRIES_PER_PAGE);
  const [modalOpen, setModalOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [inquiriesList, setInquiriesList] = useState(customerInquiries);

  // Filter states
  const [customerSort, setCustomerSort] = useState("recent");
  const [dateFilter, setDateFilter] = useState("all");

  const customerOptions = [
    { label: "Recent", value: "recent" },
    { label: "A-Z", value: "asc" },
    { label: "Z-A", value: "desc" },
  ];

  const dateOptions = [
    { label: "All Time", value: "all" },
    { label: "Last 24 Hours", value: "24hrs" },
    { label: "Last Week", value: "week" },
    { label: "Last Month", value: "month" },
    { label: "Last Year", value: "year" },
  ];

  const handleReply = (inquiry) => {
    setActiveInquiry(inquiry);
    setModalOpen(true);
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) {
      alert("Please enter a reply message");
      return;
    }

    // Get current date and time
    const now = new Date();
    const replyDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const replyTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Update the inquiry with reply
    setInquiriesList((prevList) =>
      prevList.map((inquiry) =>
        inquiry.id === activeInquiry.id
          ? {
              ...inquiry,
              status: "Replied",
              reply: replyText,
              repliedDate: replyDate,
              repliedTime: replyTime,
            }
          : inquiry
      )
    );

    // Close modal and reset
    setReplyText("");
    setModalOpen(false);
    setActiveInquiry(null);

    // Show success message
    alert(`Reply sent successfully to ${activeInquiry.email}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter and sort inquiries
  const filteredInquiries = useMemo(() => {
    let result = inquiriesList.filter((inquiry) => {
      const matchesStatus = inquiry.status === filter;
      const matchesSearch =
        inquiry.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.question.toLowerCase().includes(searchQuery.toLowerCase());

      // Date filtering
      let matchesDate = true;
      if (dateFilter !== "all") {
        const inquiryDate = new Date(inquiry.date);
        const now = new Date();
        const diffTime = now - inquiryDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        switch (dateFilter) {
          case "24hrs":
            matchesDate = diffDays <= 1;
            break;
          case "week":
            matchesDate = diffDays <= 7;
            break;
          case "month":
            matchesDate = diffDays <= 30;
            break;
          case "year":
            matchesDate = diffDays <= 365;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesStatus && matchesSearch && matchesDate;
    });

    // Sort by customer
    if (customerSort === "asc") {
      result.sort((a, b) => a.customerName.localeCompare(b.customerName));
    } else if (customerSort === "desc") {
      result.sort((a, b) => b.customerName.localeCompare(a.customerName));
    } else if (customerSort === "recent") {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return result;
  }, [inquiriesList, filter, searchQuery, customerSort, dateFilter]);

  return (
    <Box sx={{ mt: 2 }}>
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F5F5F5" }}>
              <TableCell sx={{ width: 50 }} />
              <TableCell>
                <FilterHeader
                  label="Customer"
                  options={customerOptions}
                  selected={customerSort}
                  onSelect={setCustomerSort}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Inquiry</TableCell>
              <TableCell>
                <FilterHeader
                  label="Date"
                  options={dateOptions}
                  selected={dateFilter}
                  onSelect={setDateFilter}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInquiries
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((inquiry) => (
                <InquiryRow
                  key={inquiry.id}
                  inquiry={inquiry}
                  onReply={handleReply}
                />
              ))}
            {filteredInquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No inquiries found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInquiries.length}
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

      <FeedbackModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setReplyText("");
          setActiveInquiry(null);
        }}
        onSubmit={handleSubmitReply}
        replyText={replyText}
        setReplyText={setReplyText}
        inquiry={activeInquiry}
      />
    </Box>
  );
};

export default Inqueries;
