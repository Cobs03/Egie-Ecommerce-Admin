// components/ReplyModal.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";

const FeedbackModal = ({
  open,
  onClose,
  onSubmit,
  replyText,
  setReplyText,
  inquiry,
}) => {
  if (!inquiry) return null;

  const handleSubmit = () => {
    if (!replyText.trim()) {
      alert("Please enter a reply message");
      return;
    }
    onSubmit();
  };

  // Extract customer and product info
  const customerName = inquiry.customer 
    ? `${inquiry.customer.first_name} ${inquiry.customer.last_name}`.trim()
    : 'Unknown Customer';
  const customerEmail = inquiry.customer?.email || 'No email';
  const customerAvatar = inquiry.customer?.avatar_url || null;
  const productName = inquiry.product?.name || 'Unknown Product';
  const userInitials = customerName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
          zIndex: 1551,
        },
      }}
      sx={{
        zIndex: 1550,
        "& .MuiDialog-container": {
          zIndex: 1550,
        },
      }}
      BackdropProps={{
        sx: {
          zIndex: 1540,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 24,
          pb: 2,
        }}
      >
        {inquiry.status === 'closed' 
          ? '🔒 Closed Inquiry - View Only' 
          : (inquiry.replies && inquiry.replies.length > 0 ? 'View Conversation' : 'Reply to Customer Inquiry')}
      </DialogTitle>

      <DialogContent>
        {/* Customer Information */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar 
              src={customerAvatar} 
              variant="square" 
              sx={{ width: 48, height: 48 }}
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

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Product:</strong> {productName}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Subject:</strong> {inquiry.subject}
          </Typography>
          <Typography variant="body2">
            <strong>Date:</strong> {formatDate(inquiry.created_at)} at {formatTime(inquiry.created_at)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Conversation Thread */}
        <Box sx={{ mb: 3, maxHeight: '300px', overflowY: 'auto' }}>
          {/* Original Question */}
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Avatar src={customerAvatar} sx={{ width: 28, height: 28 }}>
                {!customerAvatar && userInitials}
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                {customerName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(inquiry.created_at)} at {formatTime(inquiry.created_at)}
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              sx={{
                p: 2,
                bgcolor: "#fff3e0",
                borderRadius: 1,
                borderLeft: "4px solid #ff9800",
              }}
            >
              {inquiry.question}
            </Typography>
          </Box>

          {/* All Replies */}
          {inquiry.replies && inquiry.replies.length > 0 && (
            <>
              {inquiry.replies.map((reply, index) => {
                const replyUserName = reply.user 
                  ? `${reply.user.first_name} ${reply.user.last_name}`.trim()
                  : 'Unknown User';
                const replyUserAvatar = reply.user?.avatar_url || null;
                const replyUserInitials = replyUserName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                const isAdminReply = reply.is_admin_reply;

                return (
                  <Box key={reply.id} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Avatar 
                        src={replyUserAvatar} 
                        sx={{ 
                          width: 28, 
                          height: 28,
                          bgcolor: isAdminReply ? '#00E676' : '#ccc'
                        }}
                      >
                        {!replyUserAvatar && replyUserInitials}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {replyUserName}
                      </Typography>
                      {isAdminReply && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            bgcolor: '#00E676', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            fontWeight: 600
                          }}
                        >
                          {reply.user?.role || 'Staff'}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(reply.created_at)} at {formatTime(reply.created_at)}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        p: 2,
                        bgcolor: isAdminReply ? "#e3f2fd" : "#f5f5f5",
                        borderRadius: 1,
                        borderLeft: isAdminReply ? "4px solid #2196f3" : "4px solid #ccc",
                      }}
                    >
                      {reply.reply_text}
                    </Typography>
                  </Box>
                );
              })}
            </>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Reply Text Field - Only show if not closed */}
        {inquiry.status !== 'closed' ? (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Your Reply:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#00E676",
                  },
                  "&:hover fieldset": {
                    borderColor: "#00C853",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00E676",
                  },
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              This reply will be sent to {customerEmail}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3, bgcolor: "#FFF3E0", borderRadius: 1, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              🔒 This inquiry is closed. No further replies can be sent.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: inquiry.status === 'closed' ? "#00E676" : "#FF2323",
            color: inquiry.status === 'closed' ? "#00E676" : "#FF2323",
            fontWeight: 600,
            px: 4,
            "&:hover": {
              borderColor: inquiry.status === 'closed' ? "#00C853" : "#DD1111",
              bgcolor: inquiry.status === 'closed' ? "rgba(0, 230, 118, 0.04)" : "rgba(255, 35, 35, 0.04)",
            },
          }}
        >
          {inquiry.status === 'closed' ? 'Close' : 'Cancel'}
        </Button>
        {inquiry.status !== 'closed' && (
          <Button
            onClick={handleSubmit}
            disabled={!replyText.trim()}
            variant="contained"
            sx={{
              bgcolor: "#00E676",
              color: "#000",
              fontWeight: 600,
              px: 4,
              "&:hover": {
                bgcolor: "#00C853",
              },
              "&:disabled": {
                bgcolor: "#ccc",
                color: "#666",
              },
            }}
          >
            Send Reply
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal;
