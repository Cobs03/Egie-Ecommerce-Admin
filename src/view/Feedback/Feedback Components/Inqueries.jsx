import React, { useState, useMemo, useEffect } from "react";
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Rating,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  FilterList,
  Check,
  Send as SendIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { StarBorder as StarBorderIcon, Star as StarIcon } from "@mui/icons-material";
import InquiryService from "../../../services/InquiryService";
import { toast } from "sonner";
import FeedbackModal from "./FeedbackModal";

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

const InquiryRow = ({ inquiry, onReply, onClose }) => {
  const [open, setOpen] = useState(false);

  // Handle expand/collapse
  const handleToggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const customerName = inquiry.customer 
    ? `${inquiry.customer.first_name} ${inquiry.customer.last_name}`.trim()
    : 'Unknown Customer';
  const customerEmail = inquiry.customer?.email || 'No email';
  const productName = inquiry.product?.name || 'Unknown Product';
  const productImage = inquiry.product?.images?.[0] || null;
  const customerAvatar = inquiry.customer?.avatar_url || null;
  const userInitials = customerName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  // Status chip color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      answered: 'success',
      closed: 'default',
      flagged: 'error'
    };
    return colors[status] || 'default';
  };

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
            onClick={handleToggleOpen}
            sx={{ mr: 1 }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              src={customerAvatar} 
              variant="square" 
              sx={{ width: 32, height: 32 }}
            >
              {!customerAvatar && userInitials}
            </Avatar>
            <Box>
              <Typography fontWeight={600}>{customerName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {customerEmail}
              </Typography>
            </Box>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            {productImage && (
              <Avatar 
                src={productImage} 
                variant="square" 
                sx={{ width: 24, height: 24 }}
              />
            )}
            <Typography variant="body2" fontWeight={500}>
              {productName}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
            {inquiry.subject}
          </Typography>
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
            {inquiry.question}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {formatDate(inquiry.created_at)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTime(inquiry.created_at)}
          </Typography>
        </TableCell>
        <TableCell>
          <Stack spacing={1} alignItems="flex-start">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                label={inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)} 
                size="small" 
                color={getStatusColor(inquiry.status)}
              />
              {inquiry.unread_by_staff > 0 && (
                <Chip 
                  label={`${inquiry.unread_by_staff} NEW`} 
                  size="small" 
                  sx={{ 
                    bgcolor: '#ff1744', 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }}
                />
              )}
            </Stack>
            {inquiry.reply_count > 0 && (
              <Typography variant="caption" color="text.secondary">
                {inquiry.reply_count} {inquiry.reply_count === 1 ? 'reply' : 'replies'}
              </Typography>
            )}
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}>
              {/* Customer Question */}
              <Stack direction="row" spacing={2} mb={3}>
                <Avatar 
                  src={customerAvatar} 
                  variant="square" 
                  sx={{ width: 48, height: 48 }}
                >
                  {!customerAvatar && userInitials}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body1" fontWeight={600} mb={0.5}>
                    {customerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    {customerEmail} • {formatDate(inquiry.created_at)} at {formatTime(inquiry.created_at)}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600} mb={0.5} color="primary.main">
                    {inquiry.subject}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {inquiry.question}
                  </Typography>
                </Box>
              </Stack>

              {/* Product Info */}
              <Stack direction="row" spacing={1} alignItems="center" mb={2} py={2} borderTop="1px solid #e0e0e0">
                {productImage && (
                  <Avatar src={productImage} variant="square" sx={{ width: 32, height: 32 }} />
                )}
                <Typography variant="body2" fontWeight={600}>
                  Product: {productName}
                </Typography>
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {/* Send Reply Button - Hide if closed */}
                {inquiry.status !== "closed" && (
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<SendIcon />}
                    onClick={() => onReply(inquiry)}
                    sx={{ 
                      bgcolor: "#00E676",
                      color: "#000",
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      "&:hover": {
                        bgcolor: "#00C853",
                      },
                    }}
                  >
                    Send Reply
                  </Button>
                )}

                {/* View Conversation Button - Show if closed */}
                {inquiry.status === "closed" && (
                  <Button
                    variant="outlined"
                    size="medium"
                    startIcon={<SendIcon />}
                    onClick={() => onReply(inquiry)}
                    sx={{ 
                      borderColor: "#00E676",
                      color: "#00E676",
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      "&:hover": {
                        borderColor: "#00C853",
                        bgcolor: "rgba(0, 230, 118, 0.08)",
                      },
                    }}
                  >
                    View Conversation
                  </Button>
                )}

                {/* Close Button - Only show if not already closed */}
                {inquiry.status !== "closed" && (
                  <Button
                    variant="outlined"
                    size="medium"
                    startIcon={<CloseIcon />}
                    onClick={() => onClose(inquiry.id)}
                    sx={{ 
                      borderColor: "#FF6B6B",
                      color: "#FF6B6B",
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      "&:hover": {
                        borderColor: "#FF5252",
                        bgcolor: "rgba(255, 107, 107, 0.08)",
                      },
                    }}
                  >
                    Close Inquiry
                  </Button>
                )}
              </Stack>

              {/* Show note if answered */}
              {inquiry.status === "answered" && (
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: "#00E676" }} fontWeight={600}>
                  ✓ This inquiry has been answered ({inquiry.reply_count} {inquiry.reply_count === 1 ? 'reply' : 'replies'})
                </Typography>
              )}

              {/* Show note if closed */}
              {inquiry.status === "closed" && (
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: "#FF6B6B" }} fontWeight={600}>
                  🔒 This inquiry has been closed ({inquiry.reply_count} {inquiry.reply_count === 1 ? 'reply' : 'replies'})
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Inqueries = ({ filter = "all", searchQuery = "" }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(INQUIRIES_PER_PAGE);
  const [modalOpen, setModalOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [inquiriesList, setInquiriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Load inquiries from database
  useEffect(() => {
    loadInquiries();
  }, [filter, searchQuery, page, rowsPerPage]);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const statusMap = {
        'pending': 'pending',
        'answered': 'answered',
        'closed': 'closed',
        'all': null
      };

      const { data, count } = await InquiryService.getAllInquiries({
        status: statusMap[filter] !== undefined ? statusMap[filter] : null,
        search: searchQuery,
        limit: rowsPerPage,
        offset: page * rowsPerPage
      });

      setInquiriesList(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (inquiry) => {
    // Load full inquiry with all replies
    const { data } = await InquiryService.getInquiryWithReplies(inquiry.id);
    setActiveInquiry(data);
    setModalOpen(true);
    
    // Mark replies as read when opening reply modal (staff is reading to reply)
    if (inquiry.unread_by_staff > 0) {
      await handleMarkAsRead(inquiry.id);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    try {
      const { error } = await InquiryService.createReply(activeInquiry.id, replyText);

      if (!error) {
        toast.success('Reply sent successfully!');
        setReplyText("");
        setModalOpen(false);
        setActiveInquiry(null);
        loadInquiries(); // Refresh list
      } else {
        toast.error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Something went wrong');
    }
  };

  const handleCloseInquiry = async (inquiryId) => {
    try {
      const { error } = await InquiryService.updateInquiryStatus(inquiryId, 'closed');
      
      if (!error) {
        toast.success('Inquiry closed successfully!');
        loadInquiries(); // Refresh list
      } else {
        toast.error('Failed to close inquiry');
      }
    } catch (error) {
      console.error('Error closing inquiry:', error);
      toast.error('Something went wrong');
    }
  };

  const handleMarkAsRead = async (inquiryId) => {
    try {
      const { error } = await InquiryService.markRepliesAsReadByAdmin(inquiryId);
      
      if (!error) {
        // Force reload to get fresh data from database
        await loadInquiries();
      } else {
        console.error('Error marking as read:', error);
      }
    } catch (error) {
      console.error('Error in handleMarkAsRead:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtering and sorting are now handled by the backend
  // The loadInquiries function already applies status filter and search query

  return (
    <Box sx={{ mt: 2 }}>
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F5F5F5" }}>
              <TableCell sx={{ width: 50 }} />
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Subject / Question</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
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
                      Loading inquiries...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : inquiriesList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No inquiries found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              inquiriesList.map((inquiry) => (
                <InquiryRow
                  key={inquiry.id}
                  inquiry={inquiry}
                  onReply={handleReply}
                  onClose={handleCloseInquiry}
                />
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
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
