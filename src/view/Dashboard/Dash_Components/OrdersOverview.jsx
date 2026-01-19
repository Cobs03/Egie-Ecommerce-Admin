import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Box, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Chip, CircularProgress, Button, Tooltip, ButtonBase } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DashboardService from "../../../services/DashboardService";
import { motion } from "framer-motion";

// Helper component for the stacked progress bar
const OrderProgressBar = ({ completed, ongoing, total }) => {
  const completedPercentage = (completed / total) * 100;
  const ongoingPercentage = (ongoing / total) * 100;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Tooltip
      title={`${completed} out of ${total} orders`}
      arrow
      placement="top"
    >
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          flex: 1,
          height: 12,
          borderRadius: 6,
          bgcolor: "#357100",
          overflow: "hidden",
          transform: isHovered ? "scaleY(1.2)" : "scaleY(1)",
          transition: "transform 0.2s ease",
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            width: `${completedPercentage}%`,
            height: "100%",
            bgcolor: "#63e01d",
            float: "left",
            transition: "width 0.4s ease",
          }}
        />
        <Box
          sx={{
            width: `${ongoingPercentage}%`,
            height: "100%",
            bgcolor: "#388e3c",
            float: "left",
            transition: "width 0.4s ease",
          }}
        />
      </Box>
    </Tooltip>
  );
};

const OrdersOverview = () => {
  const navigate = useNavigate();
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [ongoingOrders, setOngoingOrders] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalOrders, setModalOrders] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const handleNavigate = (orderType) => {
    // Map order types to order status filters
    const statusMap = {
      'completed': 'completed',
      'ongoing': 'processing',
      'new': 'pending'
    };
    navigate("/orders", { state: { filterStatus: statusMap[orderType] } });
  };

  const handleOpenModal = async (type) => {
    setModalType(type);
    setModalOpen(true);
    setModalLoading(true);
    
    try {
      const result = await DashboardService.getOrdersByStatus(type);
      setModalOrders(result.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalOrders([]);
  };

  const handleDownloadExcel = () => {
    const headers = ['Order ID', 'Customer', 'Total Amount', 'Status', 'Date'];
    const rows = modalOrders.map(order => [
      order.id || 'N/A',
      order.customer_name || 'N/A',
      order.total_amount || 0,
      modalType.charAt(0).toUpperCase() + modalType.slice(1),
      new Date(order.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `\"${cell}\"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${modalType}_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const stats = await DashboardService.getOrdersOverview();
        setTotalOrders(stats.total);
        setCompletedOrders(stats.completed);
        setOngoingOrders(stats.ongoing);
        setNewOrders(stats.new);
      } catch (error) {
        console.error("Error fetching orders overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, []);

  if (loading) {
    return (
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 1,
          minWidth: 300,
          minHeight: 150,
          margin: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Loading...</Typography>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 1,
          minWidth: 300,
          minHeight: 150,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          margin: 1,
          overflow: "hidden",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
        }}
      >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Orders Overview
        </Typography>

        <Stack spacing={2}>
          {/* Completed Orders */}
          <Tooltip title="Click to view completed orders" arrow placement="top">
            <ButtonBase
              onClick={() => handleNavigate('completed')}
              onMouseEnter={() => setHoveredSection("completed")}
              onMouseLeave={() => setHoveredSection(null)}
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                p: 1,
                borderRadius: 1,
                bgcolor: hoveredSection === "completed" ? "#f5f5f5" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  width: 100,
                  flexShrink: 0,
                }}
              >
                Completed
              </Typography>
              <OrderProgressBar
                completed={completedOrders}
                ongoing={0}
                total={totalOrders}
              />
              <Tooltip title={`${((completedOrders / totalOrders) * 100).toFixed(1)}% completed`}>
                <Typography variant="body2" fontWeight={500} sx={{ ml: 2, cursor: "pointer" }}>
                  {completedOrders}
                </Typography>
              </Tooltip>
              {completedOrders > 0 && (
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal('completed');
                  }} 
                  sx={{ ml: 0.5 }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: "#63e01d" }} />
                </IconButton>
              )}
            </ButtonBase>
          </Tooltip>

          {/* Ongoing Orders */}
          <Tooltip title="Click to view ongoing orders" arrow placement="top">
            <ButtonBase
              onClick={() => handleNavigate('ongoing')}
              onMouseEnter={() => setHoveredSection("ongoing")}
              onMouseLeave={() => setHoveredSection(null)}
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                p: 1,
                borderRadius: 1,
                bgcolor: hoveredSection === "ongoing" ? "#f5f5f5" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  width: 100,
                  flexShrink: 0,
                }}
              >
                Ongoing
              </Typography>
              <OrderProgressBar
                completed={ongoingOrders}
                ongoing={0}
                total={totalOrders}
              />
              <Tooltip title={`${((ongoingOrders / totalOrders) * 100).toFixed(1)}% ongoing`}>
                <Typography variant="body2" fontWeight={500} sx={{ ml: 2, cursor: "pointer" }}>
                  {ongoingOrders}
                </Typography>
              </Tooltip>
              {ongoingOrders > 0 && (
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal('ongoing');
                  }} 
                  sx={{ ml: 0.5 }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: "#388e3c" }} />
                </IconButton>
              )}
            </ButtonBase>
          </Tooltip>

          {/* New Orders */}
          <Tooltip title="Click to view new orders" arrow placement="top">
            <ButtonBase
              onClick={() => handleNavigate('new')}
              onMouseEnter={() => setHoveredSection("new")}
              onMouseLeave={() => setHoveredSection(null)}
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                p: 1,
                borderRadius: 1,
                bgcolor: hoveredSection === "new" ? "#f5f5f5" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  width: 100,
                  flexShrink: 0,
                }}
              >
                New
              </Typography>
              <OrderProgressBar
                completed={newOrders}
                ongoing={0}
                total={totalOrders}
              />
              <Tooltip title={`${((newOrders / totalOrders) * 100).toFixed(1)}% new`}>
                <Typography variant="body2" fontWeight={500} sx={{ ml: 2, cursor: "pointer" }}>
                  {newOrders}
                </Typography>
              </Tooltip>
              {newOrders > 0 && (
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal('new');
                  }} 
                  sx={{ ml: 0.5 }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: "#357100" }} />
                </IconButton>
              )}
            </ButtonBase>
          </Tooltip>
        </Stack>
      </CardContent>

      {/* Orders Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
          {modalType.charAt(0).toUpperCase() + modalType.slice(1)} Orders
          <Box display="flex" gap={1} alignItems="center">
            {modalOrders.length > 0 && (
              <IconButton
                size="small"
                onClick={handleDownloadExcel}
                sx={{ 
                  bgcolor: "#63e01d", 
                  color: "#fff",
                  '&:hover': { bgcolor: "#56c018" },
                  width: 32,
                  height: 32
                }}
                title="Download Orders"
              >
                <DownloadIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {modalLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : modalOrders.length === 0 ? (
            <Typography align="center" color="text.secondary" py={4}>
              No orders found
            </Typography>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {modalOrders.map((order, index) => (
                <ListItem
                  key={order.id}
                  sx={{
                    borderBottom: index < modalOrders.length - 1 ? '1px solid #eee' : 'none',
                    py: 1.5,
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight={500}>
                          Order #{order.id?.slice(0, 8)}
                        </Typography>
                        <Chip label={`₱${order.total_amount?.toLocaleString()}`} size="small" color="primary" />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Customer: {order.customer_name || 'N/A'} • {new Date(order.created_at).toLocaleDateString()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={() => {
              handleCloseModal();
              handleNavigate(modalType);
            }}
            sx={{
              bgcolor: '#63e01d',
              '&:hover': {
                bgcolor: '#56c018'
              },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            View in Orders
          </Button>
          <Button
            onClick={handleCloseModal}
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
    </motion.div>
  );
};

export default OrdersOverview;
