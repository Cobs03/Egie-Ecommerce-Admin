// components/ReplyModal.jsx
import React from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const FeedbackModal = ({ open, onClose, onSubmit, replyText, setReplyText }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Reply to Inquiry
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type your reply..."
        />
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => {
            onSubmit();
            onClose();
          }}
        >
          Submit Reply
        </Button>
      </Box>
    </Modal>
  );
};

export default FeedbackModal;
