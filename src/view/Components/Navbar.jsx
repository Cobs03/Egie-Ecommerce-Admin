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
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import { useAuth } from "../../contexts/AuthContext";

import {
  MdOutlineDashboard,
  MdOutlineLocalShipping,
  MdFeedback,
} from "react-icons/md";
import { TbPackage } from "react-icons/tb";
import { FaUserGroup, FaRegCreditCard, FaFileContract } from "react-icons/fa6";
import { TbChartBar } from "react-icons/tb";
import { IoDocumentTextOutline } from "react-icons/io5";
import { RiDiscountPercentFill } from "react-icons/ri";
import { VscListFlat } from "react-icons/vsc";
import { MdWebAsset } from "react-icons/md";
import { HiOutlineMail } from "react-icons/hi";
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
import AdminProfile from "../AdminProfile/AdminProfile";
import WebsiteSettings from "../WebsiteSettings/WebsiteSettings";
import Promotions from "../Promotions/Promotions";
import Shipping from "../Shipping/Shipping";
import Users from "../User/User";
import Feedback from "../Feedback/Feedback";
import Shipview from "../Shipping/Shipping Components/Shipview";
import AdminLogs from "../AdminLogs/AdminLogs";
import ContactSubmissions from "../ContactSubmissions/ContactSubmissions";
import Compliance from "../Compliance/Compliance";
import SalesAnalytics from "../SalesAnalytics/SalesAnalyticsRefactored";
import FinancialReports from "../FinancialReports/FinancialReportsRefactored";
import CustomerReports from "../CustomerReports/CustomerReportsRefactored";

// Define drawer widths
const drawerWidth = 240;
const miniDrawerWidth = 65;

// Navigation items grouped
const NAVIGATION = [
  // Standalone items (no group)
  { segment: "dashboard", title: "Dashboard", icon: <MdOutlineDashboard size={20} /> },
];

const NAVIGATION_GROUPS = [
  {
    title: "E-Commerce",
    items: [
      { segment: "products", title: "Product", icon: <TbPackage size={20} /> },
      { segment: "orders", title: "Orders", icon: <IoDocumentTextOutline size={20} /> },
      { segment: "payment", title: "Payment", icon: <FaRegCreditCard size={20} /> },
      { segment: "shipping", title: "Shipping", icon: <MdOutlineLocalShipping size={20} /> },
      { segment: "promotions", title: "Promotions", icon: <RiDiscountPercentFill size={20} /> },
    ]
  },
  {
    title: "Customer Management",
    items: [
      { segment: "users", title: "Users", icon: <FaUserGroup size={20} /> },
      { segment: "contact", title: "Contact", icon: <HiOutlineMail size={20} /> },
      { segment: "feedback", title: "Feedback", icon: <MdFeedback size={20} /> },
    ]
  },
  {
    title: "Reports & Analytics",
    items: [
      { segment: "reports/sales-analytics", title: "Sales Analytics", icon: <TbChartBar size={20} /> },
      { segment: "reports/financial", title: "Financial Reports", icon: <FaRegCreditCard size={20} /> },
      { segment: "reports/customers", title: "Customer Reports", icon: <FaUserGroup size={20} /> },
    ]
  },
  {
    title: "System",
    items: [
      { segment: "compliance", title: "Compliance", icon: <FaFileContract size={20} /> },
      { segment: "logs", title: "Logs", icon: <VscListFlat size={20} /> },
      { segment: "website-settings", title: "Website", icon: <MdWebAsset size={20} /> },
    ]
  },
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
  const [expandedGroups, setExpandedGroups] = useState({
    "E-Commerce": true,
    "Customer Management": true,
    "Reports & Analytics": true,
    "System": true,
  });
  
  // Add state for profile menu
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuAnchor);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDrawerCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleGroup = (groupTitle) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };
  
  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };
  
  const handleSettingsClick = () => {
    // Handle settings click
    navigate("/settings");
    handleProfileMenuClose();
  };
  
  const handleLogoutClick = async () => {
    try {
      handleProfileMenuClose();
      await signOut();
      // Always navigate to login, even if there was an error
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate to login page even on error
      navigate("/auth", { replace: true });
    }
  };

  // Determine if a navigation item is active
  const isActive = (segment) => {
    return location.pathname === `/${segment}` || location.pathname.startsWith(`/${segment}/`);
  };

  // Add helper function to truncate email
  const truncateEmail = (email, maxLength = 15) => {
    if (!email) return 'admin@example.com';
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength) + '...';
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
                ADMIN
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
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <List 
          sx={{ 
            pt: 1, 
            flex: 1, 
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255, 255, 255, 0.3)",
              borderRadius: "3px",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.5)",
              },
            },
            "&::-webkit-scrollbar-button": {
              display: "none",
            },
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
          }}
        >
          {/* Standalone Dashboard item */}
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
                    color: isActive(item.segment) ? "#000" : "rgba(255, 255, 255, 0.7)",
                    borderRadius: "8px",
                    mx: 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed ? 0 : 2,
                      justifyContent: "center",
                      color: "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.title}
                      sx={{
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

          {/* Navigation Groups */}
          {NAVIGATION_GROUPS.map((group) => (
            <Box key={group.title}>
              {!isCollapsed && (
                <ListItemButton
                  onClick={() => toggleGroup(group.title)}
                  sx={{
                    px: 2,
                    py: 0.5,
                    mx: 1,
                    borderRadius: "4px",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <ListItemText
                    primary={group.title}
                    sx={{
                      "& .MuiListItemText-primary": {
                        color: "rgba(255, 255, 255, 0.5)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      },
                    }}
                  />
                  {expandedGroups[group.title] ? (
                    <ExpandLessIcon sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 18 }} />
                  ) : (
                    <ExpandMoreIcon sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 18 }} />
                  )}
                </ListItemButton>
              )}
              <Collapse in={isCollapsed || expandedGroups[group.title]} timeout="auto" unmountOnExit>
                {group.items.map((item) => (
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
              </Collapse>
            </Box>
          ))}
        </List>

        {/* User profile section - UPDATED */}
        {!isCollapsed ? (
          <Box sx={{ flexShrink: 0, mb: 1, mx: 2 }}>
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
                src={profile?.avatar_url || undefined}
                sx={{ width: 32, height: 32, mr: 1.5 }}
              >
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography
                  variant="body2"
                  sx={{ 
                    color: "#fff", 
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {profile?.full_name || 'Admin User'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: "rgba(255, 255, 255, 0.7)",
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {truncateEmail(user?.email)}
                </Typography>
              </Box>
            </ListItem>
          </Box>
        ) : (
          <Box
            sx={{
              flexShrink: 0,
              mb: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Avatar
              src={profile?.avatar_url || undefined}
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
          </Box>
        )}
      </Box>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: -1,
              minWidth: 180,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1,
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
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
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
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
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
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
            <Route path="/users" element={<Users />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/shipping/view/:orderCode" element={<Shipview />} />
            <Route path="/contact" element={<ContactSubmissions />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/reports/sales-analytics" element={<SalesAnalytics />} />
            <Route path="/reports/financial" element={<FinancialReports />} />
            <Route path="/reports/customers" element={<CustomerReports />} />
            <Route path="/discount" element={<Promotions />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/logs" element={<AdminLogs />} /> {/* CHANGED from /adminlogs to /logs */}
            {/* Settings page */}
            <Route path="/settings" element={<AdminProfile />} />
            <Route path="/website-settings" element={<WebsiteSettings />} />
          </Routes>
        </Box>
      </Main>
    </Box>
  );
}

export default Navbar;
