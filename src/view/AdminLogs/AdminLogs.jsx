import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Stack,
  IconButton,
  Pagination,
  CircularProgress,
  Menu,
  MenuItem,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AdminLogService from "../../services/AdminLogService";
import { supabase } from "../../lib/supabase";
import LogDetailDrawer from "./LogDetailDrawer";

const AdminLogs = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 10;

  // Filter states
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [dateRange, setDateRange] = useState("all");
  
  // Custom date range states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch all activity logs from database
  useEffect(() => {
    fetchAllLogs();
  }, []);

  const fetchAllLogs = async () => {
    try {
      setLoading(true);
      
      // Fetch logs with user profile information including role
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            role,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📊 Raw logs data:', data);

      // Transform data to match the UI format
      const transformedLogs = data.map(log => {
        const userRole = log.profiles?.role || 'employee';
        console.log(`User: ${log.profiles?.email}, Role: ${userRole}`);
        
        return {
          id: log.id,
          timestamp: new Date(log.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          user: log.profiles?.email || 'Unknown User',
          userName: log.profiles?.full_name || 'Unknown',
          userRole: userRole,
          userAvatar: log.profiles?.avatar_url || null,
          action: formatActionType(log.action_type),
          module: getModuleFromActionType(log.action_type),
          details: log.action_description,
          metadata: log.metadata,
        };
      });

      console.log('✅ Transformed logs:', transformedLogs);
      setActivityLogs(transformedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format action type for display
  const formatActionType = (actionType) => {
    const actionMap = {
      'product_create': 'Created Product',
      'product_update': 'Updated Product',
      'product_delete': 'Deleted Product',
      'bundle_create': 'Created Bundle',
      'bundle_update': 'Updated Bundle',
      'bundle_delete': 'Deleted Bundle',
      'stock_update': 'Updated Stock',
      'user_promote': 'Promoted User',
      'user_demote': 'Demoted User',
      'delete_employee': 'Deleted Employee',
      'ban_customer': 'Banned Customer',
      'unban_customer': 'Unbanned Customer',
      'variant_remove': 'Removed Variant',
    };
    return actionMap[actionType] || actionType;
  };

  // Get module name from action type
  const getModuleFromActionType = (actionType) => {
    if (actionType.includes('product') || actionType.includes('stock') || actionType.includes('variant')) {
      return 'Products';
    } else if (actionType.includes('bundle')) {
      return 'Bundles';
    } else if (actionType.includes('user') || actionType.includes('employee') || actionType.includes('customer')) {
      return 'Users';
    } else if (actionType.includes('order')) {
      return 'Orders';
    }
    return 'System';
  };

  // Filter handlers
  const handleFilterClick = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleModuleToggle = (module) => {
    setSelectedModules(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const handleActionToggle = (action) => {
    setSelectedActions(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  const handleClearFilters = () => {
    setSelectedRoles([]);
    setSelectedModules([]);
    setSelectedActions([]);
    setDateRange("all");
    setStartDate(null);
    setEndDate(null);
    setUseCustomRange(false);
  };

  const hasActiveFilters = selectedRoles.length > 0 || selectedModules.length > 0 || selectedActions.length > 0 || dateRange !== "all" || useCustomRange;

  // Handle log row click
  const handleLogClick = (log) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedLog(null);
  };

  // Apply all filters
  const filteredLogs = activityLogs.filter((log) => {
    // Search filter
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Role filter
    if (selectedRoles.length > 0) {
      const matches = selectedRoles.includes(log.userRole);
      if (!matches) {
        console.log(`❌ Filtered out: ${log.user} (role: ${log.userRole}, looking for: ${selectedRoles.join(', ')})`);
        return false;
      }
      console.log(`✅ Passed filter: ${log.user} (role: ${log.userRole})`);
    }

    // Module filter
    if (selectedModules.length > 0) {
      if (!selectedModules.includes(log.module)) return false;
    }

    // Action filter
    if (selectedActions.length > 0) {
      if (!selectedActions.includes(log.action)) return false;
    }

    // Date range filter
    if (dateRange !== "all") {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      
      // Set both dates to start of day for accurate comparison
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const logDateStart = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
      
      const daysDiff = Math.floor((todayStart - logDateStart) / (1000 * 60 * 60 * 24));

      console.log(`🔍 Date filter check for log: ${log.details}`);
      console.log(`  - Log date: ${logDate.toLocaleString()}`);
      console.log(`  - Days diff: ${daysDiff}`);
      console.log(`  - Date range: ${dateRange}`);

      if (dateRange === "today" && daysDiff !== 0) {
        console.log(`  ❌ Filtered out (not today)`);
        return false;
      }
      if (dateRange === "week" && daysDiff > 7) {
        console.log(`  ❌ Filtered out (older than 7 days)`);
        return false;
      }
      if (dateRange === "month" && daysDiff > 30) {
        console.log(`  ❌ Filtered out (older than 30 days)`);
        return false;
      }
      
      console.log(`  ✅ Passed date filter`);
    }

    // Custom date range filter
    if (useCustomRange && (startDate || endDate)) {
      const logDate = new Date(log.timestamp);
      
      // Set all dates to start of day for accurate comparison
      const logDateStart = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
      
      if (startDate) {
        const startDateStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        if (logDateStart < startDateStart) {
          console.log(`❌ Log filtered out: before start date (${logDate.toLocaleDateString()} < ${startDate.toLocaleDateString()})`);
          return false;
        }
      }
      
      if (endDate) {
        const endDateStart = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        // Include the end date by comparing if log date is after end of end date
        const endDateEnd = new Date(endDateStart.getTime() + 86400000); // Add 24 hours
        if (logDateStart >= endDateEnd) {
          console.log(`❌ Log filtered out: after end date (${logDate.toLocaleDateString()} > ${endDate.toLocaleDateString()})`);
          return false;
        }
      }
      
      console.log(`✅ Log passed custom date range filter`);
    }

    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDownload = () => {
    console.log("Downloading logs...");
    // TODO: Implement download functionality
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: "#00E676" }} />
      </Box>
    );
  }

  return (
    <Box p={4}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} mb={3}>
        LOGS
      </Typography>

      {/* Search Bar & Buttons */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        p={1.5}
        bgcolor="#000"
        borderRadius={2}
        boxShadow={2}
        gap={2}
      >
        <TextField
          size="small"
          placeholder="Search Log"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#000" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            bgcolor: "#fff",
            borderRadius: 1,
            minWidth: 300,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { border: "none" },
            },
          }}
        />

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{
              color: hasActiveFilters ? "#000" : "#fff",
              borderColor: hasActiveFilters ? "#00E676" : "#fff",
              textTransform: "none",
              fontWeight: 600,
              bgcolor: hasActiveFilters ? "#00E676" : "transparent",
              "&:hover": {
                borderColor: "#00E676",
                bgcolor: hasActiveFilters ? "#00C853" : "rgba(0, 230, 118, 0.1)",
              },
            }}
          >
            FILTER {hasActiveFilters && `(${selectedRoles.length + selectedModules.length + selectedActions.length + (dateRange !== 'all' ? 1 : 0) + (useCustomRange ? 1 : 0)})`}
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
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
            DOWNLOAD FILE
          </Button>
        </Stack>
      </Box>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          {selectedRoles.map((role) => (
            <Chip
              key={role}
              label={`Role: ${role}`}
              onDelete={() => handleRoleToggle(role)}
              sx={{
                bgcolor: "rgba(0, 230, 118, 0.2)",
                fontWeight: 600,
                "& .MuiChip-deleteIcon": {
                  color: "#00E676",
                  "&:hover": {
                    color: "#00C853",
                  },
                },
              }}
            />
          ))}
          {selectedModules.map((module) => (
            <Chip
              key={module}
              label={`Module: ${module}`}
              onDelete={() => handleModuleToggle(module)}
              sx={{
                bgcolor: "rgba(0, 230, 118, 0.2)",
                fontWeight: 600,
                "& .MuiChip-deleteIcon": {
                  color: "#00E676",
                  "&:hover": {
                    color: "#00C853",
                  },
                },
              }}
            />
          ))}
          {selectedActions.map((action) => (
            <Chip
              key={action}
              label={`Action: ${action}`}
              onDelete={() => handleActionToggle(action)}
              sx={{
                bgcolor: "rgba(0, 230, 118, 0.2)",
                fontWeight: 600,
                "& .MuiChip-deleteIcon": {
                  color: "#00E676",
                  "&:hover": {
                    color: "#00C853",
                  },
                },
              }}
            />
          ))}
          {dateRange !== "all" && (
            <Chip
              label={`Date: ${dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}`}
              onDelete={() => setDateRange("all")}
              sx={{
                bgcolor: "rgba(0, 230, 118, 0.2)",
                fontWeight: 600,
                "& .MuiChip-deleteIcon": {
                  color: "#00E676",
                  "&:hover": {
                    color: "#00C853",
                  },
                },
              }}
            />
          )}
          {useCustomRange && (startDate || endDate) && (
            <Chip
              icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
              label={`Date: ${startDate ? startDate.toLocaleDateString() : 'Start'} - ${endDate ? endDate.toLocaleDateString() : 'End'}`}
              onDelete={() => {
                setStartDate(null);
                setEndDate(null);
                setUseCustomRange(false);
              }}
              sx={{
                bgcolor: "rgba(0, 230, 118, 0.2)",
                fontWeight: 600,
                "& .MuiChip-deleteIcon": {
                  color: "#00E676",
                  "&:hover": {
                    color: "#00C853",
                  },
                },
              }}
            />
          )}
          <Button
            size="small"
            onClick={handleClearFilters}
            sx={{
              color: "#666",
              textTransform: "none",
              fontSize: "0.875rem",
              minWidth: "auto",
              "&:hover": {
                color: "#000",
              },
            }}
          >
            Clear All
          </Button>
        </Box>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 500,
            mt: 1,
          },
        }}
      >
        <Box px={2} py={1.5}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Filter Logs
          </Typography>

          {/* User Role Filter */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} mt={2} display="block">
            USER ROLE
          </Typography>
          <Box>
            {['admin', 'manager', 'employee'].map((role) => (
              <FormControlLabel
                key={role}
                control={
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    sx={{
                      color: "#E0E0E0",
                      "&.Mui-checked": {
                        color: "#00E676",
                      },
                    }}
                  />
                }
                label={role.charAt(0).toUpperCase() + role.slice(1)}
                sx={{ display: "block", ml: 0 }}
              />
            ))}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Module Filter */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
            MODULE
          </Typography>
          <Box>
            {['Products', 'Bundles', 'Users', 'Orders'].map((module) => (
              <FormControlLabel
                key={module}
                control={
                  <Checkbox
                    checked={selectedModules.includes(module)}
                    onChange={() => handleModuleToggle(module)}
                    sx={{
                      color: "#E0E0E0",
                      "&.Mui-checked": {
                        color: "#00E676",
                      },
                    }}
                  />
                }
                label={module}
                sx={{ display: "block", ml: 0 }}
              />
            ))}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Action Type Filter */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
            ACTION TYPE
          </Typography>
          <Box>
            {[
              'Created Product', 
              'Updated Product', 
              'Deleted Product', 
              'Created Bundle', 
              'Updated Bundle', 
              'Deleted Bundle', 
              'Updated Stock', 
              'Promoted User', 
              'Demoted User',
              'Deleted Employee',
              'Banned Customer',
              'Unbanned Customer'
            ].map((action) => (
              <FormControlLabel
                key={action}
                control={
                  <Checkbox
                    checked={selectedActions.includes(action)}
                    onChange={() => handleActionToggle(action)}
                    sx={{
                      color: "#E0E0E0",
                      "&.Mui-checked": {
                        color: "#00E676",
                      },
                    }}
                  />
                }
                label={action}
                sx={{ display: "block", ml: 0 }}
              />
            ))}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Date Range Filter */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
            DATE RANGE
          </Typography>
          <Stack spacing={0.5}>
            {[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
            ].map((option) => (
              <Button
                key={option.value}
                fullWidth
                variant={dateRange === option.value ? "contained" : "outlined"}
                onClick={() => {
                  setDateRange(option.value);
                }}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  bgcolor: dateRange === option.value ? "#00E676" : "transparent",
                  color: dateRange === option.value ? "#000" : "#666",
                  borderColor: dateRange === option.value ? "#00E676" : "#E0E0E0",
                  fontWeight: dateRange === option.value ? 700 : 400,
                  "&:hover": {
                    bgcolor: dateRange === option.value ? "#00C853" : "rgba(0, 230, 118, 0.1)",
                    borderColor: "#00E676",
                  },
                }}
              >
                {option.label}
              </Button>
            ))}
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Custom Date Range */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
            CUSTOM DATE RANGE
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={1.5}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                  setUseCustomRange(true);
                  setDateRange("all");
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        color: '#333',
                        '& fieldset': { borderColor: '#E0E0E0' },
                        '&:hover fieldset': { borderColor: '#00E676' },
                        '&.Mui-focused fieldset': { borderColor: '#00E676' },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#666',
                        '&.Mui-focused': { color: '#00E676' },
                      },
                    },
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                  setUseCustomRange(true);
                  setDateRange("all");
                }}
                minDate={startDate}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        color: '#333',
                        '& fieldset': { borderColor: '#E0E0E0' },
                        '&:hover fieldset': { borderColor: '#00E676' },
                        '&.Mui-focused fieldset': { borderColor: '#00E676' },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#666',
                        '&.Mui-focused': { color: '#00E676' },
                      },
                    },
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>

          <Divider sx={{ my: 1.5 }} />

          {/* Filter Actions */}
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                textTransform: "none",
                color: "#666",
                borderColor: "#E0E0E0",
                "&:hover": {
                  borderColor: "#666",
                  bgcolor: "#F5F5F5",
                },
              }}
            >
              Clear All
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFilterClose}
              sx={{
                textTransform: "none",
                bgcolor: "#00E676",
                color: "#000",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "#00C853",
                },
              }}
            >
              Apply
            </Button>
          </Stack>
        </Box>
      </Menu>

      {/* Logs Table */}
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F5F5F5" }}>
              <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>
                Timestamp
              </TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Module</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 50 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow
                key={log.id}
                onClick={() => handleLogClick(log)}
                sx={{
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  cursor: "pointer",
                }}
              >
                <TableCell>
                  <Typography variant="body2">{log.timestamp}</Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={500}>
                      {log.user}
                    </Typography>
                    <Chip
                      label={log.userRole.charAt(0).toUpperCase() + log.userRole.slice(1)}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: 
                          log.userRole === 'admin' ? '#00E676' :
                          log.userRole === 'manager' ? '#E0E0E0' :
                          'transparent',
                        color: 
                          log.userRole === 'admin' ? '#000' :
                          log.userRole === 'manager' ? '#000' :
                          '#fff',
                        border: log.userRole === 'employee' ? '1px solid #666' : 'none',
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{log.action}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {log.module}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {log.details}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogClick(log);
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No logs found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          shape="rounded"
          sx={{
            "& .MuiPaginationItem-root": {
              fontWeight: 600,
            },
            "& .MuiPaginationItem-root.Mui-selected": {
              bgcolor: "#00E676",
              color: "#000",
              "&:hover": {
                bgcolor: "#00C853",
              },
            },
          }}
        />
      </Box>

      {/* Log Detail Drawer */}
      <LogDetailDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        log={selectedLog}
      />
    </Box>
  );
};

export default AdminLogs;