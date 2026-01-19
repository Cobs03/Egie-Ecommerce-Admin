import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack, IconButton, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Chip, CircularProgress, Button } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import DashboardService from "../../../services/DashboardService";

// Helper component for the stacked progress bar
const OrderProgressBar = ({ completed, ongoing, total }) => {
  const completedPercentage = (completed / total) * 100;
  const ongoingPercentage = (ongoing / total) * 100;

  return (
    <Box
      sx={{
        width: "100%",
        height: 12,
        borderRadius: 6,
        bgcolor: "#357100",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: `${completedPercentage}%`,
          height: "100%",
          bgcolor: "#63e01d", // Light green for completed
          float: "left",
        }}
      />
      <Box
        sx={{
          width: `${ongoingPercentage}%`,
          height: "100%",
          bgcolor: "#388e3c", // Darker green for ongoing
          float: "left",
        }}
      />
    </Box>
  );
};

const OrdersOverview = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [ongoingOrders, setOngoingOrders] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'completed', 'ongoing', 'new'
  const [modalOrders, setModalOrders] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

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
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Orders Overview
        </Typography>

        <Stack spacing={2}>
          {/* Completed Orders */}
          <Box display="flex" alignItems="center">
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
            <Typography variant="body2" fontWeight={500} sx={{ ml: 2 }}>
              {completedOrders}
            </Typography>
            {completedOrders > 0 && (
              <IconButton size="small" onClick={() => handleOpenModal('completed')} sx={{ ml: 0.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: "#63e01d" }} />
              </IconButton>
            )}
          </Box>

          {/* Ongoing Orders */}
          <Box display="flex" alignItems="center">
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
            <Typography variant="body2" fontWeight={500} sx={{ ml: 2 }}>
              {ongoingOrders}
            </Typography>
            {ongoingOrders > 0 && (
              <IconButton size="small" onClick={() => handleOpenModal('ongoing')} sx={{ ml: 0.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: "#388e3c" }} />
              </IconButton>
            )}
          </Box>

          {/* New Orders */}
          <Box display="flex" alignItems="center">
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
            <Typography variant="body2" fontWeight={500} sx={{ ml: 2 }}>
              {newOrders}
            </Typography>
            {newOrders > 0 && (
              <IconButton size="small" onClick={() => handleOpenModal('new')} sx={{ ml: 0.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: "#357100" }} />
              </IconButton>
            )}
          </Box>
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
      </Dialog>
    </Card>
  );
};

export default OrdersOverview;
