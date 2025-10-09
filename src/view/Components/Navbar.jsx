import * as React from "react";
import { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../contexts/AuthContext";

import {
  MdOutlineDashboard,
  MdOutlineLocalShipping,
  MdFeedback,
} from "react-icons/md";
import { TbPackage } from "react-icons/tb";
import { FaUserGroup, FaRegCreditCard } from "react-icons/fa6";
import { IoDocumentTextOutline } from "react-icons/io5";
import { RiDiscountPercentFill } from "react-icons/ri";
import { VscListFlat } from "react-icons/vsc";
import { MdCategory } from "react-icons/md";
import ScrollToTop from "./ScrollToTop";

// Import all necessary components
import Dashboard from "../Dashboard/dashboard";
import Product from "../Product/Product";
import ProductCreate from "../Product/ProductComponents/ProductCreate";
import ProductView from "../Product/ProductComponents/ProductView";
import BundleCreate from "../Product/ProductComponents/BundleCreate";
import BundleView from "../Product/ProductComponents/BundleView";
import Order from "../Order/Order";
import Payment from "../Payment/Payment";
import Promotions from "../Promotions/Promotions";
import Shipping from "../Shipping/Shipping";
import Users from "../User/User";
import Feedback from "../Feedback/Feedback";
import Shipview from "../Shipping/Shipview";
import AdminLogs from "../AdminLogs/AdminLogs";
import CategoryManagement from "../CategoryManagement/CategoryManagement";

// Define drawer widths
const drawerWidth = 240;
const miniDrawerWidth = 65;

// Navigation items
const NAVIGATION = [
  { segment: "dashboard", title: "Dashboard", icon: <MdOutlineDashboard size={20} /> },
  { segment: "products", title: "Product", icon: <TbPackage size={20} /> },
  { segment: "categories", title: "Categories", icon: <MdCategory size={20} /> },
  { segment: "users", title: "Users", icon: <FaUserGroup size={20} /> },
  { segment: "orders", title: "Orders", icon: <IoDocumentTextOutline size={20} /> },
  { segment: "payment", title: "Payment", icon: <FaRegCreditCard size={20} /> },
  { segment: "shipping", title: "Shipping", icon: <MdOutlineLocalShipping size={20} /> },
  { segment: "feedback", title: "Feedback", icon: <MdFeedback size={20} /> },
  { segment: "discount", title: "Promotions", icon: <RiDiscountPercentFill size={20} /> },
  { segment: "logs", title: "Logs", icon: <VscListFlat size={20} /> },
];

// Styled components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: '#f5f5f5',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  display: 'none', // Hide the top app bar
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

function Navbar() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Add state for profile menu
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuAnchor);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDrawerCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };
  
  const handleProfileClick = () => {
    // Handle profile click
    console.log("Profile clicked");
    navigate("/profile");
    handleProfileMenuClose();
  };
  
  const handleSettingsClick = () => {
    // Handle settings click
    console.log("Settings clicked");
    navigate("/settings");
    handleProfileMenuClose();
  };
  
  const handleLogoutClick = async () => {
    try {
      await signOut();
      handleProfileMenuClose();
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Determine if a navigation item is active
  const isActive = (segment) => {
    return location.pathname === `/${segment}` || location.pathname.startsWith(`/${segment}/`);
  };

  const drawer = (
    <>
      <DrawerHeader
        sx={{
          backgroundColor: "#121212",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          justifyContent: isCollapsed ? "center" : "space-between",
          px: isCollapsed ? 0 : 1,
        }}
      >
        {!isCollapsed ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
              <IconButton onClick={toggleDrawerCollapse} sx={{ color: "#fff" }}>
                <MenuOpenIcon />
              </IconButton>
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                EGIE ADMIN
              </Typography>
            </Box>
          </>
        ) : (
          <IconButton onClick={toggleDrawerCollapse} sx={{ color: "#fff" }}>
            <MenuIcon />
          </IconButton>
        )}
      </DrawerHeader>

      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <List sx={{ pt: 1 }}>
          {NAVIGATION.map((item) => (
            <ListItem key={item.segment} disablePadding>
              <Tooltip title={isCollapsed ? item.title : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate(`/${item.segment}`)}
                  sx={{
                    minHeight: 48,
                    px: isCollapsed ? 2 : 2.5,
                    my: 0.5,
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    backgroundColor: isActive(item.segment)
                      ? "#39FC1D"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isActive(item.segment)
                        ? "#39FC1D"
                        : "rgba(255, 255, 255, 0.08)",
                    },
                    borderRadius: "4px",
                    mx: 1,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed ? 0 : 2,
                      justifyContent: "center",
                      color: isActive(item.segment) ? "#000" : "#fff",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.title}
                      sx={{
                        color: isActive(item.segment) ? "#000" : "#fff",
                        "& .MuiListItemText-primary": {
                          fontWeight: isActive(item.segment) ? 600 : 400,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>

        {/* User profile section with menu */}
        {!isCollapsed ? (
          <Box sx={{ mt: "auto", mb: 1, mx: 2 }}>
            <ListItem
              component="div"
              onClick={handleProfileMenuOpen}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                },
              }}
            >
              <Avatar
                src={profile?.avatar_url || "https://xsgames.co/randomusers/avatar.php?g=male"}
                sx={{ width: 32, height: 32, mr: 1.5 }}
              >
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
              </Avatar>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#fff", fontWeight: 500 }}
                >
                  {profile?.full_name || 'Admin User'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  {user?.email || 'admin@example.com'}
                </Typography>
              </Box>
            </ListItem>
          </Box>
        ) : (
          <Box
            sx={{
              mt: "auto",
              mb: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Tooltip title={profile?.full_name || 'Admin User'} placement="right">
              <Avatar
                src={profile?.avatar_url || "https://xsgames.co/randomusers/avatar.php?g=male"}
                onClick={handleProfileMenuOpen}
                sx={{ 
                  width: 40, 
                  height: 40, 
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.8,
                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
              </Avatar>
            </Tooltip>
          </Box>
        )}
      </Box>
      
      {/* Profile Menu - Modified to appear ABOVE the profile button */}
      <Menu
        anchorEl={profileMenuAnchor}
        id="profile-menu"
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: -1,  // Negative margin to move up
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 'auto', // Change from top to bottom
              bottom: -5, // Position at bottom
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(0) rotate(45deg)', // Changed transform
              zIndex: 0,
            },
          },
        }}
        // Change these two properties to position menu above
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            backgroundColor: '#121212',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: isCollapsed ? miniDrawerWidth : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isCollapsed ? miniDrawerWidth : drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#121212',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {drawer}
      </Drawer>
      
      {/* Main content */}
      <Main open={open} sx={{ width: '100%', padding: 0 }}>
        <Box sx={{ minHeight: '100vh' }}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Product />} />
            <Route path="/products/create" element={<ProductCreate />} />
            <Route path="/products/view" element={<ProductView />} />
            <Route path="/bundles/create" element={<BundleCreate />} />
            <Route path="/bundles/view" element={<BundleView />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/users" element={<Users />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/shipping/view/:orderId" element={<Shipview />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/discount" element={<Promotions />} />
            <Route path="/logs" element={<AdminLogs />} /> {/* CHANGED from /adminlogs to /logs */}
            {/* Add routes for new profile pages */}
            <Route path="/profile" element={<div>Profile Page</div>} />
            <Route path="/settings" element={<div>Settings Page</div>} />
          </Routes>
        </Box>
      </Main>
    </Box>
  );
}

export default Navbar;
