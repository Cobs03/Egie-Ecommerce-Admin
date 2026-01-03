import React from "react";
import { Dialog, Button, Typography, Stack, Box } from "@mui/material";

const DiscountDeleteDialog = ({ open, onClose, discount, onConfirmDelete, showSnackbar }) => {
  const handleDelete = () => {
    onConfirmDelete(discount);
    showSnackbar(`Discount "${discount?.name}" deleted successfully!`, "success");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 4, p: 2, minWidth: 420, maxWidth: 520 },
      }}
    >
      <Box p={2}>
        <Stack spacing={2}>
          <Typography
            fontWeight="bold"
            fontSize={18}
            color="error"
            display="flex"
            alignItems="center"
            mb={1}
          >
            <span style={{ fontSize: 22, marginRight: 8 }}>⚠️</span>
            Are you sure you want to delete this discount?
          </Typography>
          <Typography>
            Deleting a discount is permanent and cannot be undone.
          </Typography>
          <Typography>Once removed:</Typography>
          <ul style={{ margin: 0, paddingLeft: 22 }}>
            <li>The discount will no longer be available to customers.</li>
            <li>
              All associated data (usage count, activation period) will be
              deleted.
            </li>
            <li>Active orders using this discount may be affected.</li>
            <li>This action cannot be reversed.</li>
          </ul>
          <Typography
            fontWeight="bold"
            color="success.main"
            display="flex"
            alignItems="center"
            mt={1}
          >
            <span style={{ fontSize: 20, marginRight: 6 }}>✅</span>
            Only proceed if you're certain this discount is no longer needed.
          </Typography>
          <Stack direction="row" spacing={2} mt={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                background: "#2196F3",
                color: "#fff",
                borderRadius: 1,
                fontWeight: "bold",
                minWidth: 120,
                "&:hover": { background: "#1769aa" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleDelete}
              sx={{
                background: "#F44336",
                color: "#fff",
                borderRadius: 1,
                fontWeight: "bold",
                minWidth: 140,
                "&:hover": { background: "#d32f2f" },
              }}
            >
              Delete Discount
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default DiscountDeleteDialog;