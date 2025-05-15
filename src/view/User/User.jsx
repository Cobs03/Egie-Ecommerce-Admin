import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Paper,
  Chip,
  Grid,
  Divider,
  Stack,
  Drawer,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {
  MoreVert,
  Search,
  FilterList,
  PersonAdd,
  SortByAlpha,
  SortByAlphaOutlined,
} from "@mui/icons-material";

const users = [
  {
    name: "Mik ko",
    email: "mikko@gmail.com",
    dateAdded: "April 5, 1972",
    access: ["Admin", "Manager", "Employee"],
    avatar: "https://via.placeholder.com/40",
  },
  {
    name: "Mik ko",
    email: "mikko2@gmail.com",
    dateAdded: "April 5, 1972",
    access: ["Manager", "Employee"],
    avatar: "https://via.placeholder.com/40",
  },
  {
    name: "Jacob Bautista",
    email: "jacobbautista@gmail.com",
    dateAdded: "April 5, 3002",
    access: ["Employee"],
    avatar: "https://via.placeholder.com/40",
  },
];

const badgeColors = {
  Admin: { color: "success", variant: "filled" },
  Manager: { color: "default", variant: "filled" },
  Employee: { color: "default", variant: "outlined" },
};

const roleOrder = {
  Admin: 0,
  Manager: 1,
  Employee: 2,
};

const User = () => {
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddUserDrawerOpen, setAddUserDrawerOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedRole, setSelectedRole] = useState(null);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [promotionRole, setPromotionRole] = useState(null);
  const [usersList, setUsersList] = useState(users);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    handleFilterClose();
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    handleFilterClose();
  };

  const handleAddUserDrawerOpen = () => {
    setAddUserDrawerOpen(true);
  };

  const handleAddUserDrawerClose = () => {
    setAddUserDrawerOpen(false);
  };

  const handleDrawerOpen = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleMoreClick = (event, index) => {
    setSelectedUserIndex(index === selectedUserIndex ? null : index);
    handleDrawerOpen(usersList[index]);
  };

  const getNextRole = (currentRoles) => {
    if (currentRoles.includes("Admin")) return null;
    if (currentRoles.includes("Manager")) return "Admin";
    if (currentRoles.includes("Employee")) return "Manager";
    return "Employee";
  };

  const handlePromotionClick = (user) => {
    const nextRole = getNextRole(user.access);
    if (nextRole) {
      setPromotionRole(nextRole);
      setPromotionDialogOpen(true);
    }
  };

  const handlePromotionConfirm = () => {
    if (selectedUser && promotionRole) {
      // Update the user's access array with the new role
      const updatedUsers = usersList.map((user) => {
        if (user.email === selectedUser.email) {
          return {
            ...user,
            access: [...user.access, promotionRole],
          };
        }
        return user;
      });

      setUsersList(updatedUsers);
      setSelectedUser({
        ...selectedUser,
        access: [...selectedUser.access, promotionRole],
      });
    }
    setPromotionDialogOpen(false);
    setPromotionRole(null);
  };

  const handlePromotionCancel = () => {
    setPromotionDialogOpen(false);
    setPromotionRole(null);
  };

  const sortRoles = (roles) => {
    return [...roles].sort((a, b) => roleOrder[a] - roleOrder[b]);
  };

  const filteredUsers = usersList
    .filter((user) => {
      if (!selectedRole) return true;
      return user.access.includes(selectedRole);
    })
    .sort((a, b) => {
      if (sortOrder === "A-Z") return a.name.localeCompare(b.name);
      if (sortOrder === "Z-A") return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        User Management
      </Typography>

      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1">
          All Users ({filteredUsers.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search User"
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterClick}
          >
            Filters
          </Button>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => handleSort("A-Z")}>
              <ListItemIcon>
                <SortByAlpha fontSize="small" />
              </ListItemIcon>
              <ListItemText>A - Z</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSort("Z-A")}>
              <ListItemIcon>
                <SortByAlphaOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Z - A</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleRoleFilter("Admin")}>
              <ListItemText>Admin</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleRoleFilter("Manager")}>
              <ListItemText>Manager</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleRoleFilter("Employee")}>
              <ListItemText>Employee</ListItemText>
            </MenuItem>
          </Menu>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            sx={{ color: "white", backgroundColor: "black" }}
            onClick={handleAddUserDrawerOpen}
          >
            Add User
          </Button>
        </Stack>
      </Grid>

      <Paper elevation={1}>
        <Grid
          container
          justifyContent="space-between"
          p={2}
          sx={{
            fontWeight: "bold",
          }}
        >
          <Grid item xs={3}>
            Users
          </Grid>
          <Grid item xs={4}>
            Access
          </Grid>
          <Grid item xs={4}>
            Date Added
          </Grid>
        </Grid>
        <Divider />

        {filteredUsers.map((user, idx) => (
          <React.Fragment key={idx}>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              p={2}
            >
              <Grid item xs={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={user.avatar} alt={user.name} />
                  <Box
                    sx={{
                      minWidth: 150,
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography noWrap>{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      @{user.email}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={5}>
                <Box display="flex" justifyContent="center">
                  <Box
                    display="flex"
                    gap={1}
                    minWidth={300}
                    justifyContent="center"
                  >
                    {sortRoles(user.access).map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        color={badgeColors[role].color}
                        variant={badgeColors[role].variant}
                        size="small"
                        sx={{ minWidth: 80, justifyContent: "center" }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    {user.dateAdded}
                  </Typography>
                  <IconButton onClick={(e) => handleMoreClick(e, idx)}>
                    <MoreVert />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
            {idx < filteredUsers.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Paper>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{ sx: { width: 300, p: 2 } }}
      >
        {selectedUser && (
          <>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <GroupIcon />
                <Typography variant="h6">Manage User</Typography>
              </Stack>
              <IconButton onClick={handleDrawerClose}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
              mb={2}
            >
              <Avatar
                src={selectedUser.avatar}
                alt={selectedUser.name}
                sx={{ width: 80, height: 80, mb: 1 }}
              />
              <Typography variant="subtitle1">{selectedUser.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {selectedUser.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Date Joined : {selectedUser.dateAdded}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography fontWeight="bold" mb={1}>
              Permission
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {sortRoles(selectedUser.access).map((role) => (
                <Chip
                  key={role}
                  label={role}
                  color={badgeColors[role].color}
                  variant={badgeColors[role].variant}
                  size="small"
                />
              ))}
              {selectedUser.access.length < 3 && (
                <IconButton
                  size="small"
                  sx={{ border: "1px solid #ccc" }}
                  onClick={() => handlePromotionClick(selectedUser)}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Typography fontWeight="bold" mb={1}>
              Delete User
            </Typography>
            <Button variant="contained" color="error" size="small">
              Delete User
            </Button>
          </>
        )}
      </Drawer>

      <Drawer
        anchor="left"
        open={isAddUserDrawerOpen}
        onClose={handleAddUserDrawerClose}
        PaperProps={{ sx: { width: 400, p: 3 } }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonAdd />
            <Typography variant="h6">Add New User</Typography>
          </Stack>
          <IconButton onClick={handleAddUserDrawerClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Profile Picture
            </Typography>
            <Box
              sx={{
                width: 100,
                height: 100,
                border: "2px dashed #ccc",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <AddIcon />
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Full Name"
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            size="small"
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Access Level
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              defaultValue=""
              SelectProps={{
                native: true,
              }}
            >
              <option value="" disabled>
                Select Access Level
              </option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
            </TextField>
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{ color: "white", backgroundColor: "black" }}
          >
            Add User
          </Button>
        </Stack>
      </Drawer>

      {/* Promotion Confirmation Dialog */}
      <Dialog
        open={promotionDialogOpen}
        onClose={handlePromotionCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Promotion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to promote this user to {promotionRole}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePromotionCancel}>Cancel</Button>
          <Button
            onClick={handlePromotionConfirm}
            variant="contained"
            sx={{ color: "white", backgroundColor: "black" }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default User;
