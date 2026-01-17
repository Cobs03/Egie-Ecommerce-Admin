import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack, LinearProgress, Chip, Button, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import DownloadIcon from "@mui/icons-material/Download";
import DashboardService from "../../../services/DashboardService";

const MostClicked = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostClickedProducts = async () => {
      try {
        const response = await DashboardService.getMostClickedProducts(5);
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching most clicked products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostClickedProducts();
  }, []);

  const handleDownloadAll = async () => {
    try {
      // Fetch ALL clicked products without limit
      const response = await DashboardService.getMostClickedProducts();
      if (!response.success || !response.data || response.data.length === 0) {
        alert('No data available to download');
        return;
      }

      // Create CSV content
      const headers = ['Product Name', 'Total Clicks', 'Image URL'];
      const rows = response.data.map(product => [
        product.product_name || 'N/A',
        product.totalClicks || 0,
        product.product_image || 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `most_clicked_products_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data');
    }
  };

  if (loading) {
    return (
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 2,
          minWidth: 300,
          minHeight: 300,
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

  if (products.length === 0) {
    return (
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 2,
          minWidth: 300,
          minHeight: 300,
          margin: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>No click data available yet</Typography>
      </Card>
    );
  }

  const maxClicks = products[0]?.totalClicks || 1;
  const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  const truncateText = (text, maxLength = 15) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 2,
          minWidth: 300,
          minHeight: 300,
          margin: 1,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={700}>
                Most Clicked Products
              </Typography>
              <Chip label="Top 5" size="small" color="primary" />
            </Box>
            <IconButton
              size="small"
              onClick={handleDownloadAll}
              sx={{ 
                bgcolor: "#8b5cf6",
                color: "#fff",
                '&:hover': { 
                  bgcolor: "#7c3aed"
                },
                width: 32,
                height: 32
              }}
              title="Download All Clicked Products"
            >
              <DownloadIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Stack spacing={2.5}>
            {products.map((product, index) => (
              <Box key={product.product_id}>
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Box
                    component="img"
                    src={product.product_image || "https://placehold.co/40x40/e2e8f0/64748b?text=No+Image"}
                    alt={product.product_name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/40x40/e2e8f0/64748b?text=No+Image";
                    }}
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: 1, 
                      mr: 1.5, 
                      objectFit: "cover",
                      border: "2px solid #f0f0f0",
                      bgcolor: "#f8fafc"
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ flex: 1 }}
                  >
                    {truncateText(product.product_name)}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={COLORS[index]}
                  >
                    {product.totalClicks}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(product.totalClicks / maxClicks) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "#f0f0f0",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: COLORS[index],
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MostClicked;
