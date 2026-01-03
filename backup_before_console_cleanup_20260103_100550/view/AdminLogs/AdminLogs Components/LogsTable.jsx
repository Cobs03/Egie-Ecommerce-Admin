import React, { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Box,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MoreVert,
  FilterList,
  ArrowUpward,
  ArrowDownward,
  AccountCircle,
  Edit,
  AddCircle,
  Delete,
  Reply,
  LocalShipping,
  Visibility,
  FileDownload,
} from "@mui/icons-material";
import LogDetailsDrawer from "./LogDetailsDrawer";

const LogsTable = ({ logs, onRowClick }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Filter and sort states
  const [timestampFilterAnchor, setTimestampFilterAnchor] = useState(null);
  const [actionFilterAnchor, setActionFilterAnchor] = useState(null);
  const [moduleFilterAnchor, setModuleFilterAnchor] = useState(null);
  
  const [timestampSort, setTimestampSort] = useState(null);
  const [actionFilter, setActionFilter] = useState([]);
  const [moduleFilter, setModuleFilter] = useState([]);

  // Menu and drawer states
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter handlers
  const handleTimestampFilterOpen = (event) => {
    setTimestampFilterAnchor(event.currentTarget);
  };

  const handleActionFilterOpen = (event) => {
    setActionFilterAnchor(event.currentTarget);
  };

  const handleModuleFilterOpen = (event) => {
    setModuleFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setTimestampFilterAnchor(null);
    setActionFilterAnchor(null);
    setModuleFilterAnchor(null);
  };

  const handleActionFilterToggle = (action) => {
    setActionFilter((prev) => {
      if (prev.includes(action)) {
        return prev.filter((a) => a !== action);
      } else {
        return [...prev, action];
      }
    });
  };

  const handleModuleFilterToggle = (module) => {
    setModuleFilter((prev) => {
      if (prev.includes(module)) {
        return prev.filter((m) => m !== module);
      } else {
        return [...prev, module];
      }
    });
  };

  // Menu handlers
  const handleMenuOpen = (event, log) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedLog(log);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleViewDetails = () => {
    setDrawerOpen(true);
    handleMenuClose();
  };

  const handleExportLog = () => {
    console.log("Exporting log:", selectedLog);
    // TODO: Implement export functionality
    handleMenuClose();
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedLog(null);
  };

  // Get unique actions and modules for filters
  const uniqueActions = [...new Set(logs.map((log) => log.action))];
  const uniqueModules = [...new Set(logs.map((log) => log.module))];

  // Get action icon and color
  const getActionConfig = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("update") || actionLower.includes("changed")) {
      return { icon: <Edit sx={{ fontSize: 16 }} />, color: "#FF9800" };
    } else if (actionLower.includes("create")) {
      return { icon: <AddCircle sx={{ fontSize: 16 }} />, color: "#4CAF50" };
    } else if (actionLower.includes("delete")) {
      return { icon: <Delete sx={{ fontSize: 16 }} />, color: "#F44336" };
    } else if (actionLower.includes("accept")) {
      return { icon: <AccountCircle sx={{ fontSize: 16 }} />, color: "#2196F3" };
    } else if (actionLower.includes("repl")) {
      return { icon: <Reply sx={{ fontSize: 16 }} />, color: "#9C27B0" };
    } else if (actionLower.includes("ship")) {
      return { icon: <LocalShipping sx={{ fontSize: 16 }} />, color: "#00BCD4" };
    }
    return { icon: <AccountCircle sx={{ fontSize: 16 }} />, color: "#9E9E9E" };
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

  // Filter and sort logs
  const filteredAndSortedLogs = logs
    .filter((log) => {
      if (actionFilter.length > 0 && !actionFilter.includes(log.action)) {
        return false;
      }
      if (moduleFilter.length > 0 && !moduleFilter.includes(log.module)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (timestampSort === "recent") {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (timestampSort === "oldest") {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
      return 0;
    });

  return (
    <>
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F5F5F5" }}>
              {/* Timestamp Column */}
              <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">Timestamp</Typography>
                  <IconButton size="small" onClick={handleTimestampFilterOpen}>
                    <FilterList fontSize="small" />
                  </IconButton>
                </Box>
                <Popover
                  open={Boolean(timestampFilterAnchor)}
                  anchorEl={timestampFilterAnchor}
                  onClose={handleFilterClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                  <List sx={{ width: 200, pt: 0, pb: 0 }}>
                    <ListItem
                      button
                      onClick={() => {
                        setTimestampSort("recent");
                        handleFilterClose();
                      }}
                      selected={timestampSort === "recent"}
                    >
                      <ListItemText primary="Recent" />
                      {timestampSort === "recent" && <ArrowDownward fontSize="small" />}
                    </ListItem>
                    <ListItem
                      button
                      onClick={() => {
                        setTimestampSort("oldest");
                        handleFilterClose();
                      }}
                      selected={timestampSort === "oldest"}
                    >
                      <ListItemText primary="Oldest" />
                      {timestampSort === "oldest" && <ArrowUpward fontSize="small" />}
                    </ListItem>
                    {timestampSort && (
                      <>
                        <Divider />
                        <ListItem
                          button
                          onClick={() => {
                            setTimestampSort(null);
                            handleFilterClose();
                          }}
                        >
                          <ListItemText
                            primary="Clear Sort"
                            sx={{ color: "text.secondary" }}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Popover>
              </TableCell>

              {/* User Column */}
              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>
                <Typography fontWeight="bold">User</Typography>
              </TableCell>

              {/* Action Column */}
              <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">Action</Typography>
                  <IconButton size="small" onClick={handleActionFilterOpen}>
                    <FilterList fontSize="small" />
                  </IconButton>
                </Box>
                <Popover
                  open={Boolean(actionFilterAnchor)}
                  anchorEl={actionFilterAnchor}
                  onClose={handleFilterClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                  <List sx={{ width: 200, pt: 0, pb: 0 }}>
                    {uniqueActions.map((action) => (
                      <ListItem
                        key={action}
                        button
                        onClick={() => handleActionFilterToggle(action)}
                        selected={actionFilter.includes(action)}
                      >
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                    {actionFilter.length > 0 && (
                      <>
                        <Divider />
                        <ListItem
                          button
                          onClick={() => {
                            setActionFilter([]);
                            handleFilterClose();
                          }}
                        >
                          <ListItemText
                            primary="Clear Filters"
                            sx={{ color: "text.secondary" }}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Popover>
              </TableCell>

              {/* Module Column */}
              <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">Module</Typography>
                  <IconButton size="small" onClick={handleModuleFilterOpen}>
                    <FilterList fontSize="small" />
                  </IconButton>
                </Box>
                <Popover
                  open={Boolean(moduleFilterAnchor)}
                  anchorEl={moduleFilterAnchor}
                  onClose={handleFilterClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                  <List sx={{ width: 200, pt: 0, pb: 0 }}>
                    {uniqueModules.map((module) => (
                      <ListItem
                        key={module}
                        button
                        onClick={() => handleModuleFilterToggle(module)}
                        selected={moduleFilter.includes(module)}
                      >
                        <ListItemText primary={module} />
                      </ListItem>
                    ))}
                    {moduleFilter.length > 0 && (
                      <>
                        <Divider />
                        <ListItem
                          button
                          onClick={() => {
                            setModuleFilter([]);
                            handleFilterClose();
                          }}
                        >
                          <ListItemText
                            primary="Clear Filters"
                            sx={{ color: "text.secondary" }}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Popover>
              </TableCell>

              {/* Severity Column */}
              <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>
                <Typography fontWeight="bold">Severity</Typography>
              </TableCell>

              {/* Outcome Column */}
              <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>
                <Typography fontWeight="bold">Outcome</Typography>
              </TableCell>

              {/* Actions Column */}
              <TableCell sx={{ fontWeight: 700, width: 50 }}></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredAndSortedLogs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => {
                const actionConfig = getActionConfig(log.action);
                return (
                  <TableRow
                    key={log.id}
                    onClick={() => onRowClick && onRowClick(log)}
                    sx={{
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                      cursor: "pointer",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {log.timestamp}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "#E0E0E0",
                            color: "#000",
                            fontSize: "0.875rem",
                          }}
                        >
                          {log.user.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {log.user}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.userType || "Admin"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={actionConfig.icon}
                        label={log.action}
                        size="small"
                        sx={{
                          bgcolor: actionConfig.color,
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          borderRadius: "16px",
                          height: 28,
                          "& .MuiChip-icon": {
                            color: "inherit",
                          },
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={log.module}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={log.severity || "Normal"}
                        size="small"
                        sx={{
                          bgcolor: getSeverityColor(log.severity || "Normal"),
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 24,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={log.outcome || "Success"}
                        size="small"
                        color={
                          log.outcome === "Success"
                            ? "success"
                            : log.outcome === "Failure"
                            ? "error"
                            : "warning"
                        }
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 24,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, log)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}

            {filteredAndSortedLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No logs found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAndSortedLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          sx={{
            backgroundColor: "#E4FDE1",
            borderTop: "1px solid #e0e0e0",
            "& .MuiTablePagination-toolbar": {
              justifyContent: "flex-start",
              paddingLeft: 2,
            },
            "& .MuiTablePagination-spacer": {
              display: "none",
            },
            "& .MuiTablePagination-displayedRows": {
              marginLeft: 0,
            },
            "& .MuiTablePagination-actions": {
              marginLeft: 2,
            },
          }}
        />
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Full Details
        </MenuItem>
        <MenuItem onClick={handleExportLog}>
          <FileDownload fontSize="small" sx={{ mr: 1 }} />
          Export Log
        </MenuItem>
      </Menu>

      {/* Log Details Drawer */}
      <LogDetailsDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        log={selectedLog}
      />
    </>
  );
};

export default LogsTable;