import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Box, Stack, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, List, ListItem, ListItemText, Chip, CircularProgress, Button, Avatar, ListItemAvatar, Tooltip, ButtonBase } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DashboardService from "../../../services/DashboardService";
import { ProductService } from "../../../services/ProductService";

const Inventory = () => {
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalBundles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalProducts, setModalProducts] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = async (type) => {
    setModalType(type);
    setModalOpen(true);
    setModalLoading(true);
    
    try {
      const result = await ProductService.getAllProducts();
      if (result.success) {
        const filtered = result.data.filter(product => {
          const stock = product.stock_quantity || product.stock || 0;
          if (type === 'lowStock') {
            return stock > 0 && stock <= 10;
          } else if (type === 'outOfStock') {
            return stock === 0;
          }
          return false;
        });
        setModalProducts(filtered);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalProducts([]);
  };

  const handleDownloadExcel = () => {
    // Prepare data for Excel
    const headers = ['Product Name', 'SKU', 'Stock Quantity', 'Status'];
    const rows = modalProducts.map(product => [
      product.name,
      product.sku || 'N/A',
      product.stock_quantity || product.stock || 0,
      modalType === 'outOfStock' ? 'Out of Stock' : 'Low Stock'
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${modalType === 'outOfStock' ? 'out_of_stock' : 'low_stock'}_products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const stats = await DashboardService.getInventoryStats();
        setInventoryStats(stats);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  if (loading) {
    return (
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 1,
          minWidth: 240,
          minHeight: 180,
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
  const hasLowStock = inventoryStats.lowStock > 0;
  const hasOutOfStock = inventoryStats.outOfStock > 0;

  const handleNavigate = (filter) => {
    navigate("/products", { state: { filterType: filter } });
  };

  const formatCount = (value) => {
    const num = parseInt(value);
    return !isNaN(num) && num > 99 ? "99+" : value.toString();
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.15)" : 3,
        padding: 1,
        minWidth: 240,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        border: hasOutOfStock ? "2px solid #f44336" : hasLowStock ? "2px solid #ff9800" : "none",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Inventory
          </Typography>
          {hasOutOfStock && (
            <Box
              sx={{
                bgcolor: "#f44336",
                color: "#fff",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              CRITICAL
            </Box>
          )}
          {!hasOutOfStock && hasLowStock && (
            <Box
              sx={{
                bgcolor: "#ff9800",
                color: "#fff",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              WARNING
            </Box>
          )}
        </Box>

        <Stack spacing={1}>
          {/* Total Products */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" fontWeight={500}>
              Total Products
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {(inventoryStats.totalProducts || 0).toLocaleString()}
            </Typography>
          </Box>

          {/* Low Stocks */}
          <Tooltip title="Click to view low stock products" arrow placement="top">
            <ButtonBase
              onClick={() => handleNavigate('lowStock')}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                bgcolor: hasLowStock ? "#fff3e0" : "transparent",
                p: 1,
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#ffe0b2",
                  transform: "scale(1.02)",
                },
              }}
            >
            <Typography variant="body2" fontWeight={500} color="#ff9800">
              ⚠️ Low Stocks
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              {inventoryStats.lowStock > 99 ? (
                <Tooltip title={`Actual count: ${inventoryStats.lowStock}`} arrow>
                  <Typography variant="body2" fontWeight={700} color="#ff9800">
                    {formatCount(inventoryStats.lowStock)}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography variant="body2" fontWeight={700} color="#ff9800">
                  {formatCount(inventoryStats.lowStock)}
                </Typography>
              )}
              {hasLowStock && (
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal('lowStock');
                  }}
                  sx={{ 
                    p: 0.5,
                    '&:hover': { bgcolor: '#ffb74d' }
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: "#ff9800" }} />
                </IconButton>
              )}
            </Box>
          </ButtonBase>
          </Tooltip>

          {/* Out of Stock */}
          <Tooltip title="Click to view out of stock products" arrow placement="top">
            <ButtonBase
              onClick={() => handleNavigate('outOfStock')}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                bgcolor: hasOutOfStock ? "#ffebee" : "transparent",
                p: 1,
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#ffcdd2",
                  transform: "scale(1.02)",
                },
              }}
            >
            <Typography variant="body2" fontWeight={500} color="#f44336">
              🚫 Out of Stock
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              {inventoryStats.outOfStock > 99 ? (
                <Tooltip title={`Actual count: ${inventoryStats.outOfStock}`} arrow>
                  <Typography variant="body2" fontWeight={700} color="#f44336">
                    {formatCount(inventoryStats.outOfStock)}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography variant="body2" fontWeight={700} color="#f44336">
                  {formatCount(inventoryStats.outOfStock)}
                </Typography>
              )}
              {hasOutOfStock && (
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal('outOfStock');
                  }}
                  sx={{ 
                    p: 0.5,
                    '&:hover': { bgcolor: '#ef9a9a' }
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: "#f44336" }} />
                </IconButton>
              )}
            </Box>
          </ButtonBase>
          </Tooltip>

          {/* Total Bundles */}
          <Tooltip title="Click to view product bundles" arrow placement="top">
            <ButtonBase
              onClick={() => handleNavigate('bundles')}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                bgcolor: inventoryStats.totalBundles > 0 ? "#e3f2fd" : "transparent",
                p: 1,
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#bbdefb",
                  transform: "scale(1.02)",
                },
              }}
            >
            <Typography variant="body2" fontWeight={500} color="#2196f3">
              📦 Total Bundles
            </Typography>
            {inventoryStats.totalBundles > 99 ? (
              <Tooltip title={`Actual count: ${inventoryStats.totalBundles}`} arrow>
                <Typography variant="body2" fontWeight={700} color="#2196f3">
                  {formatCount(inventoryStats.totalBundles)}
                </Typography>
              </Tooltip>
            ) : (
              <Typography variant="body2" fontWeight={700} color="#2196f3">
                {formatCount(inventoryStats.totalBundles)}
              </Typography>
            )}
          </ButtonBase>
          </Tooltip>
        </Stack>
      </CardContent>

      {/* Modal for showing products */}
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: modalType === 'outOfStock' ? '#ffebee' : '#fff3e0',
          color: modalType === 'outOfStock' ? '#f44336' : '#ff9800'
        }}>
          <Typography variant="h6" fontWeight={600}>
            {modalType === 'lowStock' ? '⚠️ Low Stock Products' : '🚫 Out of Stock Products'}
          </Typography>
          <Box display="flex" gap={1}>
            {modalProducts.length > 0 && (
              <IconButton
                size="small"
                onClick={handleDownloadExcel}
                sx={{ 
                  bgcolor: modalType === 'outOfStock' ? '#f44336' : '#ff9800',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: modalType === 'outOfStock' ? '#d32f2f' : '#f57c00'
                  },
                  width: 32,
                  height: 32
                }}
                title="Download Products"
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
          ) : modalProducts.length === 0 ? (
            <Typography align="center" color="text.secondary" py={4}>
              No products found
            </Typography>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {modalProducts.map((product, index) => {
                const stock = product.stock_quantity || product.stock || 0;
                const imageUrl = product.images && product.images.length > 0 
                  ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
                  : 'https://placehold.co/60x60/e2e8f0/64748b?text=No+Image';
                
                return (
                  <ListItem 
                    key={product.id}
                    sx={{ 
                      borderBottom: index < modalProducts.length - 1 ? '1px solid #eee' : 'none',
                      py: 1.5,
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={imageUrl}
                        alt={product.name}
                        variant="rounded"
                        sx={{ 
                          width: 60, 
                          height: 60,
                          border: '2px solid #f0f0f0'
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      sx={{ ml: 2 }}
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight={500}>
                            {product.name}
                          </Typography>
                          <Chip 
                            label={`${stock} in stock`}
                            size="small"
                            color={stock === 0 ? "error" : "warning"}
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          SKU: {product.sku || 'N/A'}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
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
              bgcolor: modalType === 'outOfStock' ? '#f44336' : '#ff9800',
              '&:hover': {
                bgcolor: modalType === 'outOfStock' ? '#d32f2f' : '#f57c00'
              },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            View in Product Management
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
  );
};

export default Inventory;
