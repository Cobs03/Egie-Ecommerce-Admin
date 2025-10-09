import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Avatar,
  Stack,
  Box,
  Chip,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { MoreVert, FilterList } from "@mui/icons-material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const badgeColors = {
  Admin: { bgcolor: "#00E676", color: "#000" },
  Manager: { bgcolor: "#E0E0E0", color: "#000" },
  Employee: { bgcolor: "transparent", color: "#000", border: "1px solid #000" },
};

const EmployeeTable = ({
  users,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onUserClick,
}) => {
  const [employeeFilterAnchor, setEmployeeFilterAnchor] = useState(null);
  const [accessFilterAnchor, setAccessFilterAnchor] = useState(null);
  const [dateFilterAnchor, setDateFilterAnchor] = useState(null);

  const [employeeSort, setEmployeeSort] = useState(null);
  const [accessFilter, setAccessFilter] = useState([]);
  const [dateSort, setDateSort] = useState(null);

  const handleEmployeeFilterOpen = (event) => {
    setEmployeeFilterAnchor(event.currentTarget);
  };

  const handleAccessFilterOpen = (event) => {
    setAccessFilterAnchor(event.currentTarget);
  };

  const handleDateFilterOpen = (event) => {
    setDateFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setEmployeeFilterAnchor(null);
    setAccessFilterAnchor(null);
    setDateFilterAnchor(null);
  };

  const handleAccessFilterChange = (role) => {
    setAccessFilter((prev) => {
      if (prev.includes(role)) {
        return prev.filter((r) => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const filteredAndSortedUsers = users
    .filter((user) => {
      if (accessFilter.length > 0) {
        return user.access.some((role) => accessFilter.includes(role));
      }
      return true;
    })
    .sort((a, b) => {
      if (employeeSort === "az") {
        return a.name.localeCompare(b.name);
      } else if (employeeSort === "za") {
        return b.name.localeCompare(a.name);
      } else if (employeeSort === "recent" || employeeSort === "oldest") {
        const dateA = new Date(a.dateAdded);
        const dateB = new Date(b.dateAdded);
        return employeeSort === "recent" ? dateB - dateA : dateA - dateB;
      }

      if (dateSort === "recent") {
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      } else if (dateSort === "oldest") {
        return new Date(a.dateAdded) - new Date(b.dateAdded);
      }

      return 0;
    });

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#F5F5F5" }}>
            <TableCell sx={{ fontWeight: 700 }}>
              <Box display="flex" alignItems="center">
                <Typography fontWeight="bold">Employee</Typography>
                <IconButton size="small" onClick={handleEmployeeFilterOpen}>
                  <FilterList fontSize="small" />
                </IconButton>
              </Box>
              <Popover
                open={Boolean(employeeFilterAnchor)}
                anchorEl={employeeFilterAnchor}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                <List sx={{ width: 200, pt: 0, pb: 0 }}>
                  <ListItem
                    button
                    onClick={() => {
                      setEmployeeSort("az");
                      handleFilterClose();
                    }}
                    selected={employeeSort === "az"}
                  >
                    <ListItemText primary="A - Z" />
                    {employeeSort === "az" && <ArrowUpwardIcon fontSize="small" />}
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => {
                      setEmployeeSort("za");
                      handleFilterClose();
                    }}
                    selected={employeeSort === "za"}
                  >
                    <ListItemText primary="Z - A" />
                    {employeeSort === "za" && <ArrowDownwardIcon fontSize="small" />}
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => {
                      setEmployeeSort("recent");
                      handleFilterClose();
                    }}
                    selected={employeeSort === "recent"}
                  >
                    <ListItemText primary="Recent" />
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => {
                      setEmployeeSort("oldest");
                      handleFilterClose();
                    }}
                    selected={employeeSort === "oldest"}
                  >
                    <ListItemText primary="Oldest" />
                  </ListItem>
                  {employeeSort && (
                    <>
                      <Divider />
                      <ListItem
                        button
                        onClick={() => {
                          setEmployeeSort(null);
                          handleFilterClose();
                        }}
                      >
                        <ListItemText primary="Clear Sort" sx={{ color: "text.secondary" }} />
                      </ListItem>
                    </>
                  )}
                </List>
              </Popover>
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              <Box display="flex" alignItems="center">
                <Typography fontWeight="bold">Access</Typography>
                <IconButton size="small" onClick={handleAccessFilterOpen}>
                  <FilterList fontSize="small" />
                </IconButton>
              </Box>
              <Popover
                open={Boolean(accessFilterAnchor)}
                anchorEl={accessFilterAnchor}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <List sx={{ width: 200, pt: 0, pb: 0 }}>
                  {["Admin", "Manager", "Employee"].map((role) => (
                    <ListItem key={role} dense>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={accessFilter.includes(role)}
                            onChange={() => handleAccessFilterChange(role)}
                            size="small"
                          />
                        }
                        label={role}
                      />
                    </ListItem>
                  ))}
                  {accessFilter.length > 0 && (
                    <>
                      <Divider />
                      <ListItem
                        button
                        onClick={() => {
                          setAccessFilter([]);
                          handleFilterClose();
                        }}
                      >
                        <ListItemText primary="Clear Filters" sx={{ color: "text.secondary" }} />
                      </ListItem>
                    </>
                  )}
                </List>
              </Popover>
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}>Last Log In</TableCell>

            <TableCell sx={{ fontWeight: 700 }}>
              <Box display="flex" alignItems="center">
                <Typography fontWeight="bold">Date Joined</Typography>
                <IconButton size="small" onClick={handleDateFilterOpen}>
                  <FilterList fontSize="small" />
                </IconButton>
              </Box>
              <Popover
                open={Boolean(dateFilterAnchor)}
                anchorEl={dateFilterAnchor}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <List sx={{ width: 200, pt: 0, pb: 0 }}>
                  <ListItem
                    button
                    onClick={() => {
                      setDateSort("recent");
                      handleFilterClose();
                    }}
                    selected={dateSort === "recent"}
                  >
                    <ListItemText primary="Recent" />
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => {
                      setDateSort("oldest");
                      handleFilterClose();
                    }}
                    selected={dateSort === "oldest"}
                  >
                    <ListItemText primary="Oldest" />
                  </ListItem>
                  {dateSort && (
                    <>
                      <Divider />
                      <ListItem
                        button
                        onClick={() => {
                          setDateSort(null);
                          handleFilterClose();
                        }}
                      >
                        <ListItemText primary="Clear Sort" sx={{ color: "text.secondary" }} />
                      </ListItem>
                    </>
                  )}
                </List>
              </Popover>
            </TableCell>

            <TableCell sx={{ fontWeight: 700 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAndSortedUsers
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((user, idx) => (
              <TableRow
                key={idx}
                sx={{
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={user.avatar} alt={user.name} />
                    <Box>
                      <Typography fontWeight={600}>{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  {user.access.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      sx={{
                        bgcolor: badgeColors[role].bgcolor,
                        color: badgeColors[role].color,
                        border: badgeColors[role].border,
                        fontWeight: 600,
                        minWidth: 80,
                        mr: 0.5,
                      }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={
                      user.lastLogin === "Active Now"
                        ? "success.main"
                        : "text.secondary"
                    }
                    fontWeight={user.lastLogin === "Active Now" ? 600 : 400}
                  >
                    {user.lastLogin}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {user.dateAdded}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onUserClick(user, idx)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          {filteredAndSortedUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No users found matching your criteria
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAndSortedUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{
          backgroundColor: "#E4FDE1",
          borderTop: "1px solid #e0e0e0",
        }}
      />
    </TableContainer>
  );
};

export default EmployeeTable;