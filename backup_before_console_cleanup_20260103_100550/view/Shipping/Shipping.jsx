import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Snackbar, Alert } from "@mui/material";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { AdminLogService } from "../../services/AdminLogService";
import ShippingHeader from "./Shipping Components/ShippingHeader";
import ShippingTable from "./Shipping Components/ShippingTable";
import { ShippingService } from "../../services/ShippingService";
import { getImageUrl } from "../../lib/imageHelper";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../utils/permissions";
import { useAuth } from "../../contexts/AuthContext";

const Shipping = () => {
  // ALL HOOKS AT THE TOP
  const permissions = usePermissions();
  const { loading: authLoading, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Success notification state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load shipments on component mount
  useEffect(() => {
    loadShipments();
  }, []);

  // Define loadShipments function (hoisted)
  async function loadShipments() {
    setLoading(true);
    try {
      const { data, error } = await ShippingService.getAllShipments();

      if (error) {
        console.error('🚚 SHIPPING - Error loading shipments:', error);
        toast.error('Failed to load shipments');
        setShipments([]);
        return;
      }

      if (data && Array.isArray(data)) {
        // Transform database data to match component's expected format
        const transformedShipments = data.map(order => {
          // Get customer info
          const customerName = order.user_profile
            ? `${order.user_profile.first_name} ${order.user_profile.last_name}`
            : order.shipping_addresses?.full_name || 'Unknown';

          // Get first product name and order number
          const productName = order.order_items?.[0]?.product_name || 'N/A';
          
          // Calculate TAT (Turn Around Time) status
          const shippedDate = order.shipped_at ? new Date(order.shipped_at) : null;
          const deliveredDate = order.delivered_at ? new Date(order.delivered_at) : null;
          const now = new Date();
          
          let tatStatus = 'Ontime';
          if (order.status === 'delivered' && deliveredDate && shippedDate) {
            const daysDiff = Math.floor((deliveredDate - shippedDate) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 2) tatStatus = 'Early';
            else if (daysDiff > 5) tatStatus = 'Delayed';
          } else if (order.status === 'shipped' && shippedDate) {
            const daysSinceShipped = Math.floor((now - shippedDate) / (1000 * 60 * 60 * 24));
            if (daysSinceShipped > 5) tatStatus = 'Delayed';
          }

          // Build address
          const addr = order.shipping_addresses;
          const shippingAddress = addr
            ? [addr.street_address, addr.barangay, addr.city, addr.province, addr.postal_code]
                .filter(Boolean)
                .join(', ')
            : 'N/A';

          return {
            id: order.id,
            customer: customerName,
            order: {
              name: productName,
              code: order.order_number
            },
            courier: order.courier_name || 'N/A',
            confirmation: (order.payments?.[0]?.payment_status === 'paid' || order.payments?.[0]?.payment_status === 'completed') ? 'Completed' : 'Pending',
            status: order.status === 'shipped' ? 'Out for Delivery' : 'Delivered',
            tat: tatStatus,
            tracking_number: order.tracking_number || 'N/A',
            shipping_address: shippingAddress,
            contact_number: addr?.phone || order.user_profile?.phone || 'N/A',
            shipped_date: shippedDate ? shippedDate.toISOString().split('T')[0] : 'N/A',
            delivered_date: deliveredDate ? deliveredDate.toISOString().split('T')[0] : null,
            estimated_delivery: shippedDate
              ? new Date(shippedDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              : 'N/A',
            notes: order.order_notes || '',
            rawData: order
          };
        });

        setShipments(transformedShipments);
      } else {
        setShipments([]);
      }
    } catch (error) {
      console.error('🚚 SHIPPING - Error in loadShipments:', error);
      toast.error('Failed to load shipments');
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }

  const handleExport = async () => {
    try {
      // Create Excel data from filtered shipments
      const excelData = filteredShipments.map((shipment, index) => ({
        'No': index + 1,
        'Order Code': shipment.order.code || 'N/A',
        'Customer': shipment.customer || 'N/A',
        'Product': shipment.order.name || 'N/A',
        'Courier': shipment.courier || 'N/A',
        'Tracking Number': shipment.tracking_number || 'N/A',
        'Status': shipment.status || 'N/A',
        'TAT': shipment.tat || 'N/A',
        'Confirmation': shipment.confirmation || 'N/A',
        'Shipped Date': shipment.shipped_date || 'N/A',
        'Delivered Date': shipment.delivered_date || 'N/A',
        'Contact Number': shipment.contact_number || 'N/A',
        'Shipping Address': shipment.shipping_address || 'N/A'
      }));

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Shipments");

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // No
        { wch: 20 }, // Order Code
        { wch: 25 }, // Customer
        { wch: 30 }, // Product
        { wch: 15 }, // Courier
        { wch: 25 }, // Tracking Number
        { wch: 20 }, // Status
        { wch: 10 }, // TAT
        { wch: 15 }, // Confirmation
        { wch: 15 }, // Shipped Date
        { wch: 15 }, // Delivered Date
        { wch: 20 }, // Contact Number
        { wch: 50 }  // Shipping Address
      ];

      // Generate file name with current date
      const date = new Date().toISOString().split('T')[0];
      const fileName = `Shipments_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);

      // Log admin action
      await AdminLogService.createLog(
        user?.id,
        'download',
        'shipment',
        null,
        { count: filteredShipments.length, fileName }
      );

      // Show success notification
      setSuccessMessage(`Successfully downloaded ${filteredShipments.length} shipment records`);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download shipments');
    }
  };

  const handleDeleteShipment = (orderCode) => {
    setShipments((prevShipments) =>
      prevShipments.filter((shipment) => shipment.order.code !== orderCode)
    );
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </Box>
    );
  }

  // Check if user has permission to view shipments
  if (!permissions.can(PERMISSIONS.SHIPPING_VIEW)) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have permission to view shipping records.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Only Admins and Managers can access this page.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.order.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.courier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box p={3}>
      <Toaster position="bottom-right" richColors />

      <ShippingHeader
        totalShipments={shipments.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={handleExport}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ShippingTable
          shipments={filteredShipments}
          onDeleteShipment={handleDeleteShipment}
          loading={loading}
        />
      </motion.div>

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%', bgcolor: '#4caf50', color: 'white' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Shipping;
