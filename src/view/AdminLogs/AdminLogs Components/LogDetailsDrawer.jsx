import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Chip,
  Avatar,
  Paper,
  Button,
} from "@mui/material";
import {
  Close,
  AccountCircle,
  Event,
  Category,
  Description,
  Computer,
  LocationOn,
  CheckCircle,
  Error,
  Warning,
  Edit,
  Delete,
  AddCircle,
  Reply,
  LocalShipping,
  FileDownload,
} from "@mui/icons-material";

const LogDetailsDrawer = ({ open, onClose, log }) => {
  if (!log) return null;

  // Get action icon and color
  const getActionConfig = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("update") || actionLower.includes("changed")) {
      return { icon: <Edit />, color: "#FF9800" };
    } else if (actionLower.includes("create")) {
      return { icon: <AddCircle />, color: "#4CAF50" };
    } else if (actionLower.includes("delete")) {
      return { icon: <Delete />, color: "#F44336" };
    } else if (actionLower.includes("accept")) {
      return { icon: <AccountCircle />, color: "#2196F3" };
    } else if (actionLower.includes("repl")) {
      return { icon: <Reply />, color: "#9C27B0" };
    } else if (actionLower.includes("ship")) {
      return { icon: <LocalShipping />, color: "#00BCD4" };
    }
    return { icon: <AccountCircle />, color: "#9E9E9E" };
  };

  const actionConfig = getActionConfig(log.action);

  // Get outcome icon
  const getOutcomeIcon = (outcome) => {
    switch (outcome) {
      case "Success":
        return <CheckCircle sx={{ color: "#4CAF50" }} />;
      case "Failure":
        return <Error sx={{ color: "#F44336" }} />;
      case "Error":
        return <Error sx={{ color: "#F44336" }} />;
      default:
        return <Warning sx={{ color: "#FF9800" }} />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "#F44336";
      case "High":
        return "#FF9800";
      case "Normal":
        return "#2196F3";
      case "Low":
        return "#4CAF50";
      default:
        return "#9E9E9E";
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 500 },
          zIndex: 1400, // Higher than AI chat (usually 1300)
        },
      }}
      ModalProps={{
        sx: {
          zIndex: 1400, // Match drawer z-index
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#000",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Log Details
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
          <Stack spacing={3}>
            {/* User Information */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: "#F5F5F5" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: actionConfig.color,
                    fontSize: "1.5rem",
                  }}
                >
                  {log.user.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold">
                    {log.user}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {log.userType || "Admin"} • {log.userRole || "Administrator"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Action & Status */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                Action & Status
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    icon={actionConfig.icon}
                    label={log.action}
                    sx={{
                      bgcolor: actionConfig.color,
                      color: "#fff",
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: "inherit" },
                    }}
                  />
                  <Chip
                    label={log.module}
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={log.severity || "Normal"}
                    size="small"
                    sx={{
                      bgcolor: getSeverityColor(log.severity || "Normal"),
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={getOutcomeIcon(log.outcome || "Success")}
                    label={log.outcome || "Success"}
                    size="small"
                    color={
                      log.outcome === "Success"
                        ? "success"
                        : log.outcome === "Failure"
                        ? "error"
                        : "warning"
                    }
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* Timestamp */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <Event fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Timestamp
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" ml={3.5}>
                {log.timestamp}
              </Typography>
            </Box>

            {/* Details */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <Description fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Details
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" ml={3.5}>
                {log.details}
              </Typography>
            </Box>

            {/* Previous vs New Value (for edits) */}
            {log.previousValue && log.newValue && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: "#FFF9E6" }}>
                <Typography variant="subtitle2" fontWeight="bold" mb={1.5}>
                  Changes Made
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" color="error.main" fontWeight="bold">
                      BEFORE:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.previousValue}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      AFTER:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.newValue}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* Technical Information */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1.5}>
                Technical Information
              </Typography>
              <Stack spacing={1.5}>
                {/* IP Address */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Computer fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      IP Address
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {log.ipAddress || "192.168.1.100"}
                    </Typography>
                  </Box>
                </Stack>

                {/* Location */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationOn fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {log.location || "Manila, Philippines"}
                    </Typography>
                  </Box>
                </Stack>

                {/* User Agent */}
                {log.userAgent && (
                  <Box ml={3.5}>
                    <Typography variant="caption" color="text.secondary">
                      User Agent
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        wordBreak: "break-all",
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {log.userAgent}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Additional Metadata */}
            {log.metadata && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: "#F5F5F5" }}>
                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                  Additional Information
                </Typography>
                <Stack spacing={0.5}>
                  {Object.entries(log.metadata).map(([key, value]) => (
                    <Stack
                      key={key}
                      direction="row"
                      spacing={1}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        {key}:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Log ID */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Log ID: {log.id}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #e0e0e0",
            bgcolor: "#FAFAFA",
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              sx={{
                borderColor: "#000",
                color: "#000",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#000",
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<FileDownload />}
              onClick={handleExport}
              sx={{
                bgcolor: "#27EF3C",
                color: "#000",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#1ec32e",
                },
              }}
            >
              Export
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default LogDetailsDrawer;