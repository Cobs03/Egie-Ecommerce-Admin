import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Avatar,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";

const LogDetailDrawer = ({ open, onClose, log }) => {
  const navigate = useNavigate();

  if (!log) return null;

  // Get icon based on module
  const getModuleIcon = () => {
    switch (log.module) {
      case "Products":
        return <ShoppingBagIcon />;
      case "Bundles":
        return <CategoryIcon />;
      case "Users":
        return <PersonIcon />;
      default:
        return <InventoryIcon />;
    }
  };

  // Get color based on action type
  const getActionColor = () => {
    if (log.action.includes("Delete")) return "#FF5252";
    if (log.action.includes("Create")) return "#00E676";
    if (log.action.includes("Update")) return "#2196F3";
    return "#FFC107";
  };

  // Copy log ID to clipboard
  const handleCopyLogId = () => {
    navigator.clipboard.writeText(log.id);
    alert("Log ID copied to clipboard!");
  };

  // Navigate to the item
  const handleViewItem = () => {
    if (log.module === "Products" && log.metadata?.productName) {
      navigate("/product/inventory");
    } else if (log.module === "Bundles") {
      navigate("/product/bundles");
    } else if (log.module === "Users") {
      navigate("/users");
    }
    onClose();
  };

  // Render change item
  const renderChange = (label, oldValue, newValue, icon) => {
    if (oldValue === undefined || newValue === undefined) return null;

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          mb: 1.5,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          color="rgba(255, 255, 255, 0.7)"
          display="flex"
          alignItems="center"
          gap={0.5}
          mb={1}
        >
          {icon} {label}
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Box flex={1}>
            <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
              Before
            </Typography>
            <Typography variant="body2" fontWeight={600} color="#fff">
              {String(oldValue)}
            </Typography>
          </Box>
          <ArrowForwardIcon sx={{ color: "#00E676", fontSize: 20 }} />
          <Box flex={1}>
            <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
              After
            </Typography>
            <Typography variant="body2" fontWeight={600} color="#00E676">
              {String(newValue)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 500 },
          bgcolor: "#1a1a1a",
          color: "#fff",
        },
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        sx={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              bgcolor: getActionColor(),
              p: 1,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {getModuleIcon()}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Log Details
            </Typography>
            <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
              {log.action}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {/* User Information */}
        <Box mb={3}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="rgba(255, 255, 255, 0.5)"
            mb={1}
            display="block"
          >
            PERFORMED BY
          </Typography>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              src={log.userAvatar || log.avatar_url}
              sx={{
                bgcolor: "#00E676",
                color: "#000",
                width: 48,
                height: 48,
                fontWeight: 700,
              }}
            >
              {!log.userAvatar && !log.avatar_url && (log.userName?.charAt(0) || log.user?.charAt(0) || "?")}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {log.userName || "Unknown User"}
              </Typography>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
                {log.user}
              </Typography>
              <Box mt={0.5}>
                <Chip
                  label={
                    log.userRole?.charAt(0).toUpperCase() +
                    log.userRole?.slice(1)
                  }
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    bgcolor:
                      log.userRole === "admin"
                        ? "#00E676"
                        : log.userRole === "manager"
                        ? "#E0E0E0"
                        : "transparent",
                    color:
                      log.userRole === "admin"
                        ? "#000"
                        : log.userRole === "manager"
                        ? "#000"
                        : "#fff",
                    border:
                      log.userRole === "employee" ? "1px solid #666" : "none",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 3 }} />

        {/* Action Summary */}
        <Box mb={3}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="rgba(255, 255, 255, 0.5)"
            mb={1}
            display="block"
          >
            ACTION SUMMARY
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "rgba(0, 230, 118, 0.1)",
              border: "1px solid rgba(0, 230, 118, 0.3)",
            }}
          >
            <Typography variant="body2" color="#fff" mb={0.5}>
              <strong>{log.action}</strong>
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
              {log.details}
            </Typography>
            <Box display="flex" gap={1} mt={1.5}>
              <Chip
                label={log.module}
                size="small"
                sx={{
                  bgcolor: "rgba(33, 150, 243, 0.2)",
                  color: "#2196F3",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
              <Chip
                label={log.timestamp}
                size="small"
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "0.75rem",
                }}
              />
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 3 }} />

        {/* Detailed Changes */}
        {log.metadata?.detailedChanges && (
          <Box mb={3}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="rgba(255, 255, 255, 0.5)"
              mb={1.5}
              display="block"
            >
              DETAILED CHANGES
            </Typography>

            {/* Name Change */}
            {log.metadata.detailedChanges.name &&
              renderChange(
                "Name",
                log.metadata.detailedChanges.name.old,
                log.metadata.detailedChanges.name.new,
                "📝"
              )}

            {/* Price Change */}
            {log.metadata.detailedChanges.price &&
              renderChange(
                "Price",
                `$${log.metadata.detailedChanges.price.old}`,
                `$${log.metadata.detailedChanges.price.new}`,
                "💰"
              )}

            {/* Description Change */}
            {log.metadata.detailedChanges.description &&
              renderChange(
                "Description",
                log.metadata.detailedChanges.description.old,
                log.metadata.detailedChanges.description.new,
                "📄"
              )}

            {/* Stock Change */}
            {log.metadata.detailedChanges.stock &&
              renderChange(
                "Stock Quantity",
                log.metadata.detailedChanges.stock.old,
                log.metadata.detailedChanges.stock.new,
                "📦"
              )}

            {/* Warranty Change */}
            {log.metadata.detailedChanges.warranty &&
              renderChange(
                "Warranty",
                log.metadata.detailedChanges.warranty.old,
                log.metadata.detailedChanges.warranty.new,
                "🛡️"
              )}

            {/* Official Price Change */}
            {log.metadata.detailedChanges.officialPrice &&
              renderChange(
                "Official Price",
                `$${log.metadata.detailedChanges.officialPrice.old}`,
                `$${log.metadata.detailedChanges.officialPrice.new}`,
                "💵"
              )}

            {/* Discount Change */}
            {log.metadata.detailedChanges.discount &&
              renderChange(
                "Discount",
                `${log.metadata.detailedChanges.discount.old}%`,
                `${log.metadata.detailedChanges.discount.new}%`,
                "🏷️"
              )}

            {/* Image Changes */}
            {log.metadata.detailedChanges.images && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="rgba(255, 255, 255, 0.7)"
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  mb={1}
                >
                  🖼️ Images
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Box>
                    <Typography
                      variant="caption"
                      color="rgba(255, 255, 255, 0.5)"
                    >
                      Count
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#fff">
                      {log.metadata.detailedChanges.images.oldCount} →{" "}
                      <span style={{ color: "#00E676" }}>
                        {log.metadata.detailedChanges.images.newCount}
                      </span>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="rgba(255, 255, 255, 0.5)"
                    >
                      Added
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#00E676"
                    >
                      +{log.metadata.detailedChanges.images.added}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="rgba(255, 255, 255, 0.5)"
                    >
                      Removed
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#FF5252"
                    >
                      -{log.metadata.detailedChanges.images.removed}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Variant Changes */}
            {log.metadata.detailedChanges.variants && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="rgba(255, 255, 255, 0.7)"
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  mb={1}
                >
                  🔧 Variants
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Box>
                    <Typography
                      variant="caption"
                      color="rgba(255, 255, 255, 0.5)"
                    >
                      Count
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#fff">
                      {log.metadata.detailedChanges.variants.oldCount} →{" "}
                      <span style={{ color: "#00E676" }}>
                        {log.metadata.detailedChanges.variants.newCount}
                      </span>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="rgba(255, 255, 255, 0.5)"
                    >
                      Added
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#00E676"
                    >
                      +{log.metadata.detailedChanges.variants.added}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="rgba(255, 255, 255, 0.5)"
                    >
                      Removed
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#FF5252"
                    >
                      -{log.metadata.detailedChanges.variants.removed}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="rgba(255, 255, 255, 0.5)"
                    >
                      Modified
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#FFC107"
                    >
                      ~{log.metadata.detailedChanges.variants.modified}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Show detailed modification list if available */}
                {log.metadata.detailedChanges.variants.modifiedDetails && 
                 log.metadata.detailedChanges.variants.modifiedDetails.length > 0 && (
                  <Box mt={2} pt={2} borderTop="1px solid rgba(255, 255, 255, 0.1)">
                    <Typography
                      variant="caption"
                      color="rgba(255, 255, 255, 0.5)"
                      mb={1}
                      display="block"
                    >
                      MODIFIED VARIANTS
                    </Typography>
                    {log.metadata.detailedChanges.variants.modifiedDetails.map((mod, idx) => (
                      <Box
                        key={idx}
                        mb={1}
                        p={1}
                        bgcolor="rgba(255, 193, 7, 0.1)"
                        borderRadius={1}
                        border="1px solid rgba(255, 193, 7, 0.3)"
                      >
                        <Typography variant="body2" fontWeight={600} color="#FFC107" mb={0.5}>
                          {mod.name}
                        </Typography>
                        <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                          {mod.changes}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        )}

        {/* Additional Metadata */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <Box mb={3}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="rgba(255, 255, 255, 0.5)"
              mb={1.5}
              display="block"
            >
              ADDITIONAL INFORMATION
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {log.metadata.productName && (
                <Box mb={1}>
                  <Typography
                    variant="caption"
                    color="rgba(255, 255, 255, 0.5)"
                  >
                    Product Name
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#fff">
                    {log.metadata.productName}
                  </Typography>
                </Box>
              )}
              {log.metadata.sku && (
                <Box mb={1}>
                  <Typography
                    variant="caption"
                    color="rgba(255, 255, 255, 0.5)"
                  >
                    Code
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#fff">
                    {log.metadata.sku}
                  </Typography>
                </Box>
              )}
              {log.metadata.changes && log.metadata.changes.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    color="rgba(255, 255, 255, 0.5)"
                    mb={0.5}
                    display="block"
                  >
                    Fields Changed
                  </Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {log.metadata.changes.map((change, index) => (
                      <Chip
                        key={index}
                        label={change}
                        size="small"
                        sx={{
                          bgcolor: "rgba(33, 150, 243, 0.2)",
                          color: "#2196F3",
                          fontSize: "0.7rem",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      {/* Footer Actions */}
      <Box
        p={2}
        sx={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyLogId}
            sx={{
              color: "#fff",
              borderColor: "rgba(255, 255, 255, 0.3)",
              textTransform: "none",
              "&:hover": {
                borderColor: "#fff",
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Copy ID
          </Button>
          {log.module !== "System" && (
            <Button
              fullWidth
              variant="contained"
              endIcon={<OpenInNewIcon />}
              onClick={handleViewItem}
              sx={{
                bgcolor: "#00E676",
                color: "#000",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "#00C853",
                },
              }}
            >
              View {log.module === "Products" ? "Product" : log.module === "Bundles" ? "Bundle" : "Item"}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
};

export default LogDetailDrawer;
