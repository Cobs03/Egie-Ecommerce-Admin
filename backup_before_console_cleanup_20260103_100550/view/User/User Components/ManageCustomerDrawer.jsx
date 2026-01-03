import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Drawer,
  Divider,
  Button,
  List,
  ListItem,
  Chip,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BlockIcon from "@mui/icons-material/Block";
import { formatLastLogin, getLastLoginChipStyle } from "../../../utils/dateUtils";

// Import permission system
import { usePermissions } from "../../../hooks/usePermissions";
import { PERMISSIONS } from "../../../utils/permissions";

const ManageCustomerDrawer = ({ 
  open, 
  onClose, 
  customer,
  onBan,
  onUnban
}) => {
  const navigate = useNavigate();
  const permissions = usePermissions();

  if (!customer) return null;

  // Check if customer is banned
  const isBanned = customer.status === 'banned';

  // Mock activity log data - This should come from your backend
  const activityLog = [
    { action: "Updated Keyboard Stock", time: "18s ago" },
    { action: "Ordered Special Bundle Complete", time: "1hr 15m ago" },
    { action: "Ordered Special Bundle", time: "Yesterday" },
    { action: "Updated a Password", time: "Yesterday" },
  ];

  // Determine status chip based on ban status and lastLogin
  const getStatusChip = () => {
    // If banned, show banned status
    if (isBanned) {
      return {
        label: "Banned",
        size: "small",
        sx: {
          fontWeight: 700,
          fontSize: "0.7rem",
          borderRadius: "12px",
          px: 1.5,
          bgcolor: "#E53935",
          color: "#fff",
        }
      };
    }

    // Otherwise show activity status using utility functions
    const lastLoginText = formatLastLogin(customer.lastLoginRaw);
    const chipStyle = getLastLoginChipStyle(customer.lastLoginRaw);
    
    return {
      label: lastLoginText,
      size: "small",
      sx: {
        fontWeight: 700,
        fontSize: "0.7rem",
        borderRadius: "12px",
        px: 1.5,
        ...chipStyle,
      }
    };
  };

  const statusChip = getStatusChip();

  const handleSeeAllLogs = () => {
    onClose(); // Close drawer
    navigate("/logs"); // Navigate to logs page
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ 
        sx: { 
          width: 300, 
          bgcolor: "#000",
          color: "#fff",
          p: 0,
        } 
      }}
    >
      {/* Header with Status & Close */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        bgcolor="#000"
      >
        <Chip {...statusChip} />
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: "#fff",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" }
          }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Customer Profile Section */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        py={3}
        px={2}
      >
        <Avatar
          src={customer.avatar}
          alt={customer.name}
          sx={{ 
            width: 80, 
            height: 80, 
            mb: 2,
            fontSize: "2rem",
            bgcolor: "#fff",
            color: "#000"
          }}
        >
          {customer.name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          {customer.name}
        </Typography>
        <Typography variant="body2" color="#999" mb={0.5}>
          {customer.email}
        </Typography>
        <Typography variant="caption" color="#999">
          {customer.phoneNumber || "(+63) 9184548421"}
        </Typography>
      </Box>

      <Box px={2}>
        <Divider sx={{ bgcolor: "#333" }} />
      </Box>

      {/* Date Joined & Last Login Section */}
      <Box px={2} py={2}>
        <Typography variant="caption" color="#666">
          Date Joined:
        </Typography>
        <Typography variant="body2" color="#fff" fontWeight={600} mb={1}>
          {customer.dateAdded}
        </Typography>
        <Typography variant="caption" color="#666">
          Last Login:
        </Typography>
        <Typography variant="body2" color="#fff" fontWeight={600}>
          {customer.lastLogin}
        </Typography>
      </Box>

      <Box px={2}>
        <Divider sx={{ bgcolor: "#333" }} />
      </Box>

      {/* Activity Log Section */}
      <Box px={2} py={2}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          mb={1.5}
        >
          <Typography 
            variant="subtitle2" 
            fontWeight={700}
            color="#fff"
          >
            Activity Log
          </Typography>
          <Button
            size="small"
            onClick={handleSeeAllLogs}
            sx={{
              color: "#00E676",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.75rem",
              minWidth: "auto",
              padding: "4px 8px",
              "&:hover": {
                bgcolor: "rgba(0, 230, 118, 0.1)",
              }
            }}
            endIcon={<ChevronRightIcon fontSize="small" />}
          >
            See Logs
          </Button>
        </Box>
        <List sx={{ p: 0 }}>
          {activityLog.map((item, index) => (
            <ListItem 
              key={index} 
              sx={{ 
                px: 0, 
                py: 1,
                borderBottom: index < activityLog.length - 1 ? "1px solid #2a2a2a" : "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}
            >
              <Box flex={1}>
                <Typography variant="body2" color="#fff" mb={0.25}>
                  {item.action}
                </Typography>
                <Typography variant="caption" color="#666">
                  {item.time}
                </Typography>
              </Box>
              <ChevronRightIcon fontSize="small" sx={{ color: "#666", mt: 0.5 }} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Spacer to push ban button to bottom */}
      <Box flex={1} />

      {/* Ban/Unban Customer Button */}
      <Box p={2}>
        <Tooltip 
          title={!permissions.can(PERMISSIONS.USER_BAN) ? "You don't have permission to ban/unban customers. Only Managers and Admins can ban customers." : ""}
          arrow
        >
          <span>
            <Button
              variant="contained"
              fullWidth
              onClick={isBanned ? onUnban : onBan}
              disabled={!permissions.can(PERMISSIONS.USER_BAN)}
              sx={{ 
                bgcolor: !permissions.can(PERMISSIONS.USER_BAN) 
                  ? "#ccc" 
                  : (isBanned ? "#00E676" : "#E53935"),
                color: !permissions.can(PERMISSIONS.USER_BAN)
                  ? "#666"
                  : (isBanned ? "#000" : "#fff"),
                fontWeight: 700,
                py: 1.5,
                borderRadius: 1,
                textTransform: "none",
                "&:hover": { 
                  bgcolor: !permissions.can(PERMISSIONS.USER_BAN)
                    ? "#ccc"
                    : (isBanned ? "#00C853" : "#C62828")
                },
                "&.Mui-disabled": {
                  bgcolor: "#ccc",
                  color: "#666"
                }
              }}
            >
              {!permissions.can(PERMISSIONS.USER_BAN) && <BlockIcon fontSize="small" sx={{ mr: 1 }} />}
              {isBanned ? "Unban Customer" : "Ban Customer"}
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default ManageCustomerDrawer;