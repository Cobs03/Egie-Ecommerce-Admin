import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack, LinearProgress, Chip, Button, IconButton, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";
import MouseIcon from "@mui/icons-material/Mouse";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DashboardService from "../../../services/DashboardService";
import { ProductService } from "../../../services/ProductService";

const MostClicked = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const navigate = useNavigate();

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

  const handleViewProduct = async (product) => {
    try {
      // Fetch complete product details
      const result = await ProductService.getProductById(product.product_id);
      if (result.success && result.data) {
        const fullProduct = result.data;
        
        // Transform images to proper format [{url: "..."}]
        let transformedImages = [];
        if (fullProduct.images && Array.isArray(fullProduct.images)) {
          transformedImages = fullProduct.images.map(img => {
            // If already an object with url property, keep it
            if (typeof img === 'object' && img.url) {
              return img;
            }
            // If it's a string, wrap it in object
            return { url: img };
          });
        } else if (fullProduct.image) {
          // Fallback to single image field
          transformedImages = [{ url: fullProduct.image }];
        }
        
        // Calculate total stock from variants if they exist
        const variants = fullProduct.variants || [];
        const totalStock = variants.length > 0 
          ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
          : (Number(fullProduct.stock_quantity) || Number(fullProduct.stock) || 0);
        
        // Format last edit date if available
        let lastEditFormatted = null;
        if (fullProduct.updated_at) {
          const date = new Date(fullProduct.updated_at);
          lastEditFormatted = date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
        }
        
        // Transform to match ProductView expected format
        const transformedProduct = {
          id: fullProduct.id,
          name: fullProduct.name,
          description: fullProduct.description || "",
          images: transformedImages,
          price: fullProduct.price || 0,
          stock: totalStock,
          brand: fullProduct.brand || "",
          brand_id: fullProduct.brand_id || null,
          category: fullProduct.category || "",
          subCategory: fullProduct.subCategory || "",
          tags: fullProduct.tags || [],
          selectedComponents: fullProduct.selected_components || fullProduct.selectedComponents || [],
          components: fullProduct.selected_components || fullProduct.selectedComponents || [],
          variants: variants,
          specifications: fullProduct.specifications || {},
          warranty: fullProduct.warranty || "",
          officialPrice: fullProduct.metadata?.officialPrice || fullProduct.officialPrice || fullProduct.price,
          initialPrice: fullProduct.metadata?.initialPrice || fullProduct.initialPrice || fullProduct.price,
          discount: fullProduct.metadata?.discount || fullProduct.discount || 0,
          sku: fullProduct.sku || "",
          lastEdit: lastEditFormatted,
          editedBy: fullProduct.updated_by || "Admin User",
          isEditMode: false,
        };
        
        navigate("/products/view", {
          state: transformedProduct,
        });
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleDownloadAll = async () => {
    try {
      // Fetch ALL clicked products without limit
      const response = await DashboardService.getMostClickedProducts();
      if (!response.success || !response.data || response.data.length === 0) {
        alert('No data available to download');
        return;
      }

      // Fetch full product details for each product to get additional data
      const enrichedData = await Promise.all(
        response.data.map(async (product, index) => {
          try {
            const result = await ProductService.getProductById(product.product_id);
            if (result.success && result.data) {
              const fullProduct = result.data;
              const variants = fullProduct.variants || [];
              const totalStock = variants.length > 0 
                ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
                : (Number(fullProduct.stock_quantity) || Number(fullProduct.stock) || 0);
              
              const price = fullProduct.price || (variants.length > 0 ? variants[0].price : 0);
              
              // Get total sales from order_items (simplified - would need actual query)
              // For now, we'll leave as 'N/A' unless you have a sales field
              const totalSales = 'N/A'; // This would need to be fetched from order_items table
              
              // Calculate conversion rate if we had sales data
              const conversionRate = totalSales !== 'N/A' 
                ? `${((totalSales / (product.totalClicks || 1)) * 100).toFixed(2)}%`
                : 'N/A';
              
              // Get category from components or metadata
              const components = fullProduct.selected_components || fullProduct.selectedComponents || [];
              const category = components.length > 0 ? components[0].category : (fullProduct.metadata?.category || 'General');
              
              const stockStatus = totalStock > 0 ? 'In Stock' : 'Out of Stock';
              
              return {
                rank: index + 1,
                product_name: product.product_name || 'N/A',
                totalClicks: product.totalClicks || 0,
                totalSales: totalSales,
                conversionRate: conversionRate,
                price: Number(price).toFixed(2),
                currentStock: totalStock,
                stockStatus: stockStatus,
                category: category,
                brand: fullProduct.brand || 'N/A',
                sku: fullProduct.sku || 'N/A',
                image_url: product.product_image || 'N/A'
              };
            }
          } catch (error) {
            console.error(`Error fetching details for product ${product.product_id}:`, error);
          }
          
          // Fallback if fetch fails
          return {
            rank: index + 1,
            product_name: product.product_name || 'N/A',
            totalClicks: product.totalClicks || 0,
            totalSales: 'N/A',
            conversionRate: 'N/A',
            price: 'N/A',
            currentStock: 'N/A',
            stockStatus: 'N/A',
            category: 'N/A',
            brand: 'N/A',
            sku: 'N/A',
            image_url: product.product_image || 'N/A'
          };
        })
      );

      // Create CSV content
      const headers = ['Rank', 'Product Name', 'Total Clicks', 'Total Sales', 'Conversion Rate', 'Price (₱)', 'Current Stock', 'Stock Status', 'Category', 'Brand', 'SKU', 'Image URL'];
      const rows = enrichedData.map(product => [
        product.rank,
        product.product_name,
        product.totalClicks,
        product.totalSales,
        product.conversionRate,
        product.price,
        product.currentStock,
        product.stockStatus,
        product.category,
        product.brand,
        product.sku,
        product.image_url
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
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
        sx={{
          background: "linear-gradient(135deg, #8b5cf615 0%, #ec489915 100%)",
          borderRadius: 3,
          boxShadow: isCardHovered ? "0 8px 24px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.07)",
          padding: 2,
          minWidth: 300,
          margin: 1,
          overflow: "hidden",
          border: isCardHovered ? "1px solid #e0e0e0" : "1px solid transparent",
          transform: isCardHovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              <MouseIcon sx={{ color: "#8b5cf6" }} />
              <Typography variant="h6" fontWeight={700}>
                Most Clicked Products
              </Typography>
              <Chip label="Top Clicks" size="small" sx={{ bgcolor: "#8b5cf6", color: "#fff" }} />
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
            {products.map((product, index) => {
              const percentage = ((product.totalClicks / maxClicks) * 100).toFixed(1);
              const isHovered = hoveredProduct === product.product_id;
              return (
                <motion.div
                  key={product.product_id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    onMouseEnter={() => setHoveredProduct(product.product_id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isHovered ? "#f9f9f9" : "transparent",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Box display="flex" alignItems="center" gap={1} flex={1}>
                        <Chip 
                          label={`#${index + 1}`} 
                          size="small" 
                          sx={{ 
                            minWidth: 36,
                            height: 24,
                            bgcolor: COLORS[index],
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 11
                          }} 
                        />
                        <Tooltip title={product.product_name} arrow placement="top">
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ flex: 1 }}
                          >
                            {truncateText(product.product_name)}
                          </Typography>
                        </Tooltip>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Tooltip
                          title={`Total Clicks: ${product.totalClicks}`}
                          arrow
                          placement="top"
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {percentage}%
                          </Typography>
                        </Tooltip>
                        <Tooltip title="View Product Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProduct(product);
                            }}
                            sx={{
                              opacity: isHovered ? 1 : 0,
                              transition: "opacity 0.3s ease",
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Tooltip
                      title={`${product.totalClicks} clicks out of ${maxClicks} total`}
                      arrow
                      placement="bottom"
                    >
                      <LinearProgress
                        variant="determinate"
                        value={parseFloat(percentage)}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: "#f5f5f5",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: COLORS[index],
                            borderRadius: 5,
                            transition: "transform 0.4s ease",
                          },
                        }}
                      />
                    </Tooltip>
                  </Box>
                </motion.div>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MostClicked;
