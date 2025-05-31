import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const vouchers = [
  {
    name: "Free Delivery",
    code: "A10KLJ",
    price: "₱ 50",
    active: "05/05/24 - 06/06/25",
    limit: 49,
    used: 1,
  },
  {
    name: "Discount",
    code: "8X1L05",
    price: "₱ 10",
    active: "05/05/24 - 06/06/25",
    limit: 48,
    used: 0,
  },
];

const Promotions = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editVoucher, setEditVoucher] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (event, voucher) => {
    setAnchorEl(event.currentTarget);
    setSelectedVoucher(voucher);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVoucher(null);
  };

  const handleEditClick = (voucher) => {
    setEditVoucher(voucher);
    setIsAddMode(false);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleAddClick = () => {
    setEditVoucher(null);
    setIsAddMode(true);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditVoucher(null);
    setIsAddMode(false);
  };

  const handleDeleteClick = (voucher) => {
    setSelectedVoucher(voucher);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedVoucher(null);
  };

  return (
    <Box p={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          Promotions Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: "#27EF3C",
            color: "#fff",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#1ec32e" },
          }}
          onClick={handleAddClick}
        >
          Add voucher
        </Button>
      </Stack>

      <Paper elevation={1} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Grid
          container
          alignItems="center"
          p={2}
          sx={{
            fontWeight: "bold",
          }}
        >
          <Grid item sx={{ width: 260 }}>
            Name
          </Grid>
          <Grid item sx={{ width: 120 }}>
            Code
          </Grid>
          <Grid item sx={{ width: 80 }}>
            Price
          </Grid>
          <Grid item sx={{ width: 180 }}>
            Active from
          </Grid>
          <Grid item sx={{ width: 120 }}>
            Limit
          </Grid>
          <Grid item sx={{ width: 80 }}>
            Used
          </Grid>
          <Grid item sx={{ width: 60 }} />
        </Grid>
        <Divider />
        {vouchers.map((voucher, idx) => (
          <React.Fragment key={voucher.code}>
            <Grid
              container
              alignItems="center"
              p={2}
              sx={{
                "&:hover": { bgcolor: "action.hover" },
                fontSize: 16,
              }}
            >
              <Grid item sx={{ width: 260 }}>
                {voucher.name}
              </Grid>
              <Grid item sx={{ width: 120 }}>
                {voucher.code}
              </Grid>
              <Grid item sx={{ width: 80 }}>
                {voucher.price}
              </Grid>
              <Grid item sx={{ width: 180 }}>
                {voucher.active}
              </Grid>
              <Grid item sx={{ width: 120 }}>
                {voucher.limit}
              </Grid>
              <Grid item sx={{ width: 100 }}>
                {voucher.used}
              </Grid>
              <Grid item sx={{ width: 60 }}>
                <IconButton
                  onClick={(e) => handleMenuOpen(e, voucher)}
                  size="small"
                >
                  <MoreVertIcon />
                </IconButton>
              </Grid>
            </Grid>
            {idx < vouchers.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { minWidth: 150, borderRadius: 2, p: 0.5 },
        }}
      >
        <MenuItem
          onClick={() => handleEditClick(selectedVoucher)}
          sx={{ color: "#1976d2", fontWeight: "bold", borderRadius: 1 }}
        >
          Edit Details
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteClick(selectedVoucher)}
          sx={{
            color: "#fff",
            backgroundColor: "#F44336",
            fontWeight: "bold",
            borderRadius: 1,
            mt: 1,
            "&:hover": { backgroundColor: "#d32f2f" },
          }}
        >
          Delete Voucher
        </MenuItem>
      </Menu>

      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        PaperProps={{
          sx: { borderRadius: 4, p: 2, minWidth: 370, maxWidth: 420 },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {isAddMode ? "Create New Voucher" : "Edit Voucher"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              maxHeight: "calc(100vh - 300px)",
              overflowY: "auto",
              pr: 1, // Add some padding for the scrollbar
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#888",
                borderRadius: "4px",
                "&:hover": {
                  background: "#555",
                },
              },
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Name"
                fullWidth
                defaultValue={editVoucher?.name || ""}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Code"
                fullWidth
                inputProps={{ maxLength: 6 }}
                defaultValue={editVoucher?.code || ""}
                helperText="6 characters"
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Price"
                fullWidth
                defaultValue={editVoucher?.price || ""}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Active"
                  placeholder="01/01/01"
                  fullWidth
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <Typography>to</Typography>
                <TextField
                  placeholder="01/01/01"
                  fullWidth
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Stack>
              <TextField
                label="Limit"
                fullWidth
                defaultValue={editVoucher?.limit || ""}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <Box mt={1}>
                <Typography fontSize={14} fontWeight="bold" mb={0.5}>
                  📝 Reminder: How to Create a Valid Voucher
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                  <li style={{ color: "red" }}>
                    Fill in Name, Code, Price, Active Dates, and Limit.
                  </li>
                  <li style={{ color: "red" }}>
                    The Code must be 6 characters long.
                  </li>
                  <li style={{ color: "red" }}>
                    Make sure Price and Limit are numeric and not empty.
                  </li>
                  <li style={{ color: "red" }}>
                    Select a valid start and end date (future or current date).
                  </li>
                  <li style={{ color: "red" }}>
                    Double-check all fields before clicking{" "}
                    {isAddMode ? "Create" : "Save Changes"}.
                  </li>
                </ul>
                <Typography fontSize={13} color="text.secondary" mt={1}>
                  <b>
                    Only click {isAddMode ? "Create" : "Save Changes"} when all
                    fields are accurate and intentional.
                  </b>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Stack direction="row" spacing={2} width="100%">
            <Button
              variant="contained"
              fullWidth
              onClick={handleEditDialogClose}
              sx={{
                background: "#F44336",
                color: "#fff",
                borderRadius: 2,
                fontWeight: "bold",
                "&:hover": { background: "#d32f2f" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleEditDialogClose}
              sx={{
                background: "#27EF3C",
                color: "#fff",
                borderRadius: 2,
                fontWeight: "bold",
                "&:hover": { background: "#1ec32e" },
              }}
            >
              {isAddMode ? "Create" : "Save Changes"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
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
              Are you sure you want to delete this voucher?
            </Typography>
            <Typography>
              Deleting a voucher is permanent and cannot be undone.
            </Typography>
            <Typography>Once removed:</Typography>
            <ul style={{ margin: 0, paddingLeft: 22 }}>
              <li>The voucher will no longer be usable by customers.</li>
              <li>
                All associated data (usage count, activation period) will be
                deleted.
              </li>
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
              Only proceed if you're certain this voucher is no longer needed.
            </Typography>
            <Stack direction="row" spacing={2} mt={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={handleDeleteDialogClose}
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
                sx={{
                  background: "#F44336",
                  color: "#fff",
                  borderRadius: 1,
                  fontWeight: "bold",
                  minWidth: 140,
                  "&:hover": { background: "#d32f2f" },
                }}
                // onClick={handleDeleteVoucher} // Implement your delete logic here
              >
                Delete Voucher
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Promotions;
