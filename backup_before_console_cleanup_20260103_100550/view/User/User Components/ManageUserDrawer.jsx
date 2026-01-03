import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Drawer,
  Stack,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AdminLogService from "../../../services/AdminLogService";
import { formatLastLogin, getLastLoginChipStyle } from "../../../utils/dateUtils";

const badgeColors = {
  Admin: { bgcolor: "#00E676", color: "#000" },
  Manager: { bgcolor: "#E0E0E0", color: "#000" },
  Employee: { 
    bgcolor: "transparent", 
    color: "#fff", 
    border: "1px solid #666" 
  },
};

const ManageUserDrawer = ({ 
  open, 
  onClose, 
  user, 
  onPromote,
  onDemote,
  onDelete 
}) => {
  const navigate = useNavigate();
  const [activityLog, setActivityLog] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch activity logs when drawer opens
  useEffect(() => {
    if (open && user?.id) {
      fetchActivityLogs();
    }
  }, [open, user?.id]);

  const fetchActivityLogs = async () => {
    if (!user?.id) return;
    
    setLoadingLogs(true);
    try {
      const { data, error } = await AdminLogService.getUserLogs(user.id, 5);
      if (!error && data) {
        const formattedLogs = data.map(log => ({
          action: log.action_description,
          time: AdminLogService.formatTimeAgo(log.created_at),
          type: log.action_type,
        }));
        setActivityLog(formattedLogs);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      // Show empty state if no logs
      setActivityLog([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Safety check: if user doesn't exist or doesn't have access property, return null
  if (!user || !user.access || !Array.isArray(user.access)) {
    return null;
  }

  // Hierarchy: Admin > Manager > Employee
  const roleHierarchy = ["Employee", "Manager", "Admin"];
  
  // Get current highest role
  const getCurrentRole = () => {
    if (user.access.includes("Admin")) return "Admin";
    if (user.access.includes("Manager")) return "Manager";
    return "Employee";
  };

  const currentRole = getCurrentRole();
  const currentRoleIndex = roleHierarchy.indexOf(currentRole);

  // Can promote if not at highest role (Admin)
  const canPromote = currentRole !== "Admin";
  
  // Can demote if above Employee level
  const canDemote = currentRole !== "Employee";

  // Determine status chip based on lastLogin
  const getStatusChip = () => {
    const lastLoginText = formatLastLogin(user.lastLoginRaw);
    const chipStyle = getLastLoginChipStyle(user.lastLoginRaw);
    
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

const handleSeeMoreLogs = () => {
  onClose();
  navigate("/logs");
};

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          bgcolor: "#1a1a1a",
          color: "#fff",
          p: 0,
        },
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
            bgcolor: "#2a2a2a",
            "&:hover": { bgcolor: "#3a3a3a" },
          }}
          size="small"
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* User Profile Section */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        py={3}
        px={2}
      >
        <Avatar
          src={user.avatar}
          alt={user.name}
          sx={{
            width: 100,
            height: 100,
            mb: 2,
            fontSize: "2.5rem",
            bgcolor: "#666",
            color: "#fff",
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          {user.name}
        </Typography>
        <Typography variant="body2" color="#999" mb={0.5}>
          {user.email}
        </Typography>
        <Typography variant="caption" color="#666" display="block">
          Date Joined: {user.dateAdded}
        </Typography>
        <Typography variant="caption" color="#666" display="block">
          Last Login: {user.lastLogin}
        </Typography>
        {user.phoneNumber && user.phoneNumber !== 'N/A' && (
          <Typography variant="caption" color="#666" display="block">
            Phone: {user.phoneNumber}
          </Typography>
        )}
      </Box>

      <Box px={2}>
        <Divider sx={{ bgcolor: "#333" }} />
      </Box>

      {/* Update Permission Section */}
      <Box px={2} py={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Typography variant="subtitle2" fontWeight={700} color="#fff">
            Update Permission
          </Typography>

          {/* Promote/Demote Buttons */}
          <Stack direction="row" spacing={1}>
            {canPromote && (
              <IconButton
                size="small"
                onClick={onPromote}
                sx={{
                  width: 28,
                  height: 28,
                  border: "1px solid #00E676",
                  bgcolor: "#2a2a2a",
                  color: "#00E676",
                  "&:hover": {
                    bgcolor: "#3a3a3a",
                    borderColor: "#00C853",
                  },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            )}
            {canDemote && (
              <IconButton
                size="small"
                onClick={onDemote}
                sx={{
                  width: 28,
                  height: 28,
                  border: "1px solid #FF5252",
                  bgcolor: "#2a2a2a",
                  color: "#FF5252",
                  "&:hover": {
                    bgcolor: "#3a3a3a",
                    borderColor: "#E53935",
                  },
                }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Box>

        {/* Role Chip - Show only current highest role */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={currentRole}
            size="small"
            sx={{
              bgcolor: badgeColors[currentRole].bgcolor,
              color: badgeColors[currentRole].color,
              border: badgeColors[currentRole].border,
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        </Stack>
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
          <Typography variant="subtitle2" fontWeight={700} color="#fff">
            Activity Log
          </Typography>
          <Button
            size="small"
            onClick={handleSeeMoreLogs}
            sx={{
              color: "#00E676",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.75rem",
              minWidth: "auto",
              padding: "4px 8px",
              "&:hover": {
                bgcolor: "rgba(0, 230, 118, 0.1)",
              },
            }}
            endIcon={<ChevronRightIcon fontSize="small" />}
          >
            See Logs
          </Button>
        </Box>

        {loadingLogs ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} sx={{ color: "#00E676" }} />
          </Box>
        ) : activityLog.length === 0 ? (
          <Box py={3} textAlign="center">
            <Typography variant="body2" color="#666">
              No activity logs yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {activityLog.map((item, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 0,
                  py: 1,
                  borderBottom:
                    index < activityLog.length - 1 ? "1px solid #2a2a2a" : "none",
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
                <ChevronRightIcon fontSize="small" sx={{ color: "#666" }} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Spacer to push delete button to bottom */}
      <Box flex={1} />

      {/* Delete User Button */}
      <Box p={2}>
        <Button
          variant="contained"
          fullWidth
          onClick={onDelete}
          sx={{
            bgcolor: "#E53935",
            color: "#fff",
            fontWeight: 700,
            py: 1.5,
            borderRadius: 1,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#C62828",
            },
          }}
        >
          DELETE USER
        </Button>
      </Box>
    </Drawer>
  );
};

export default ManageUserDrawer;