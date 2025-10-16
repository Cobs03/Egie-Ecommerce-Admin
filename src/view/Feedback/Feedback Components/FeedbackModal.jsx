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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
          zIndex: 1551, // Dialog Paper highest
        },
      }}
      sx={{
        zIndex: 1550, // Dialog root above drawer
        "& .MuiDialog-container": {
          zIndex: 1550, // Container same level
        },
      }}
      BackdropProps={{
        sx: {
          zIndex: 1540, // Backdrop below dialog but above drawer
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
        Reply to Customer Inquiry
      </DialogTitle>

      <DialogContent>
        {/* Customer Information */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar variant="square" sx={{ width: 40, height: 40 }}>
              {inquiry.customerName.charAt(0)}
            </Avatar>
            <Box>
              <Typography fontWeight={600}>{inquiry.customerName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {inquiry.email}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Product:</strong> {inquiry.productName}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Date:</strong> {inquiry.date} / {inquiry.time}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Customer Inquiry */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Customer Inquiry:
          </Typography>
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

        {/* Reply Text Field */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Your Reply:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
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
            This reply will be sent to {inquiry.email}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "#FF2323",
            color: "#FF2323",
            fontWeight: 600,
            px: 4,
            "&:hover": {
              borderColor: "#DD1111",
              bgcolor: "rgba(255, 35, 35, 0.04)",
            },
          }}
        >
          Cancel
        </Button>
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
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal;
