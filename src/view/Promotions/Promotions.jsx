import React, { useState, useEffect } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { AdminLogService } from "../../services/AdminLogService";
import { useAuth } from "../../contexts/AuthContext";
import PopupAdService from "../../services/PopupAdService";
import PromotionsHeader from "./Promotion Components/PromotionsHeader";
import VoucherTable from "./Promotion Components/VoucherTable";
import DiscountTable from "./Promotion Components/DiscountsTable";
import PopupAdsTab from "./Promotion Components/PopupAdsTab";
import VoucherEditDialog from "./Promotion Components/VoucherEditDialog";
import VoucherDeleteDialog from "./Promotion Components/VoucherDeleteDialog";
import DiscountEditDialog from "./Promotion Components/DiscountEditDialog";
import DiscountDeleteDialog from "./Promotion Components/DiscountDeleteDialog";
import { VoucherService } from "../../services/VoucherService";
import { DiscountService } from "../../services/DiscountService";
import { supabase } from "../../lib/supabase";

const Promotions = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [voucherEditOpen, setVoucherEditOpen] = useState(false);
  const [voucherDeleteOpen, setVoucherDeleteOpen] = useState(false);
  const [discountEditOpen, setDiscountEditOpen] = useState(false);
  const [discountDeleteOpen, setDiscountDeleteOpen] = useState(false);

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [activeTab, setActiveTab] = useState("vouchers");
  const [searchQuery, setSearchQuery] = useState("");

  // Success notification state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Load vouchers and discounts from database
  useEffect(() => {
    loadVouchers();
    loadDiscounts();
  }, []);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const result = await VoucherService.getAllVouchers();
      if (result.success) {
        // Transform database format to UI format
        const transformedVouchers = result.data.map(voucher => {
          // Format dates for display
          const validFrom = new Date(voucher.valid_from);
          const validUntil = new Date(voucher.valid_until);
          const dateRange = `${validFrom.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })} - ${validUntil.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}`;

          // Format price based on discount type
          const discountType = voucher.discount_type || 'fixed';
          const formattedPrice = discountType === 'percent'
            ? `${voucher.price}%`
            : `₱ ${voucher.price.toFixed(2)}`;

          return {
            id: voucher.id,
            name: voucher.name,
            code: voucher.code,
            type: discountType, // Include type for UI
            price: formattedPrice, // Format based on type
            active: dateRange, // Format: "05/05/24 - 06/06/25"
            limit: voucher.usage_limit,
            used: voucher.usage_count,
            // Keep original data for editing
            validFrom: voucher.valid_from,
            validUntil: voucher.valid_until,
            description: voucher.description,
            isActive: voucher.is_active,
            perCustomerLimit: voucher.per_customer_limit,
            minPurchase: voucher.min_purchase_amount,
            discountType: discountType // Keep for edit dialog
          };
        });

        setVouchers(transformedVouchers);
        setFilteredVouchers(transformedVouchers);
      } else {
        showSnackbar("Failed to load vouchers", "error");
      }
    } catch (error) {
      console.error("Error loading vouchers:", error);
      showSnackbar("Error loading vouchers", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDiscounts = async () => {
    try {
      const result = await DiscountService.getAllDiscounts();
      if (result.success) {
        // Debug: Log the raw data to see what we're getting
        console.log('Raw discount data from database:', result.data);

        // Transform database format to UI format
        const transformedDiscounts = result.data.map(discount => {
          // Debug: Log each discount's date fields
          console.log('Discount:', discount.name, 'valid_from:', discount.valid_from, 'valid_until:', discount.valid_until);

          // Format dates for display with better error handling
          let dateRange = 'N/A';

          try {
            if (discount.valid_from && discount.valid_until) {
              // Parse dates - handle both YYYY-MM-DD and ISO timestamp formats
              // Extract just the date part if it's a timestamp
              const fromDateStr = discount.valid_from.split('T')[0];
              const toDateStr = discount.valid_until.split('T')[0];

              const validFrom = new Date(fromDateStr + 'T00:00:00Z');
              const validUntil = new Date(toDateStr + 'T00:00:00Z');

              // Format dates correctly
              const formatDate = (date) => {
                if (isNaN(date.getTime())) return 'Invalid';
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                const year = String(date.getUTCFullYear()).slice(-2);
                return `${month}/${day}/${year}`;
              };

              dateRange = `${formatDate(validFrom)} - ${formatDate(validUntil)}`;
              console.log('Formatted date range:', dateRange);
            } else {
              console.warn('Missing date fields for discount:', discount.name);
            }
          } catch (dateError) {
            console.error('Error parsing dates for discount:', discount.id, dateError);
            dateRange = 'Invalid Date';
          }

          return {
            id: discount.id,
            name: discount.name,
            type: discount.discount_type, // "percent" or "fixed"
            value: discount.discount_value,
            dates: dateRange, // Format: "06/01/25 - 06/30/25"
            used: discount.usage_count || 0,
            appliesTo: discount.applies_to || 'All Products',
            minSpend: discount.min_spend,
            userEligibility: discount.user_eligibility || 'All Users',
            usageLimit: discount.usage_limit,
            // Keep original data for editing - store just the date part
            validFrom: discount.valid_from ? discount.valid_from.split('T')[0] : null,
            validUntil: discount.valid_until ? discount.valid_until.split('T')[0] : null,
            description: discount.description,
            isActive: discount.is_active,
            maxDiscountAmount: discount.max_discount_amount,
            // Product IDs from database
            applicableProducts: discount.applicable_products || [],
            applyToType: discount.apply_to_type || 'all'
          };
        });

        setDiscounts(transformedDiscounts);
        setFilteredDiscounts(transformedDiscounts);
      } else {
        showSnackbar("Failed to load discounts", "error");
      }
    } catch (error) {
      console.error("Error loading discounts:", error);
      showSnackbar("Error loading discounts", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Voucher handlers
  const handleEditVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setIsAddMode(false);
    setVoucherEditOpen(true);
  };

  const handleDeleteVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setVoucherDeleteOpen(true);
  };

  const handleSaveVoucher = async (voucherData) => {
    try {
      if (isAddMode) {
        // Create new voucher
        const result = await VoucherService.createVoucher({
          name: voucherData.name,
          code: voucherData.code,
          discountType: voucherData.discountType || 'fixed', // Add discount type
          price: typeof voucherData.price === 'string'
            ? parseFloat(voucherData.price.replace(/[₱,%\s]/g, ''))
            : voucherData.price,
          validFrom: voucherData.validFrom,
          validUntil: voucherData.validUntil,
          usageLimit: parseInt(voucherData.limit),
          description: voucherData.description || '',
          isActive: true,
          perCustomerLimit: voucherData.perCustomerLimit || 1,
          minPurchaseAmount: voucherData.minPurchase || 0
        });

        if (result.success) {
          await loadVouchers();

          // Send notification to customers
          try {
            const discountValue = voucherData.discountType === 'percent'
              ? `${voucherData.price}%`
              : `₱${voucherData.price}`;

            const message = voucherData.description
              ? voucherData.description
              : `Use the code ${voucherData.code} for ${discountValue} discount`;

            console.log('Sending voucher notification with params:', {
              p_title: voucherData.name || 'New Voucher Available',
              p_message: message,
              p_voucher_id: result.data.id,
              p_discount_id: null,
              p_action_type: 'copy_code',
              p_action_data: { code: voucherData.code, discount: discountValue },
              p_target_users: 'all'
            });

            const { data: notifResult, error: notifError } = await supabase.rpc('create_promotion_notification', {
              p_title: voucherData.name || 'New Voucher Available',
              p_message: message,
              p_voucher_id: result.data.id,
              p_discount_id: null,
              p_action_type: 'copy_code',
              p_action_data: { code: voucherData.code, discount: discountValue },
              p_target_users: 'all'
            });

            console.log('Notification RPC result:', { notifResult, notifError });

            if (notifError) {
              console.error('Notification error:', notifError);
              showSnackbar("Voucher created but notification failed: " + notifError.message, "warning");
            } else {
              console.log(`Notification sent to ${notifResult} customers`);
              showSnackbar(`Voucher created and ${notifResult} customers notified!`, "success");
            }
          } catch (notifError) {
            console.error('Error sending notification:', notifError);
            showSnackbar("Voucher created but notification failed", "warning");
          }
        } else {
          showSnackbar(result.error || "Failed to create voucher", "error");
        }
      } else {
        // Update existing voucher
        const result = await VoucherService.updateVoucher(voucherData.id, {
          name: voucherData.name,
          code: voucherData.code,
          discountType: voucherData.discountType || 'fixed', // Add discount type
          price: typeof voucherData.price === 'string'
            ? parseFloat(voucherData.price.replace(/[₱,%\s]/g, ''))
            : voucherData.price,
          validFrom: voucherData.validFrom,
          validUntil: voucherData.validUntil,
          usageLimit: parseInt(voucherData.limit),
          description: voucherData.description || '',
          isActive: voucherData.isActive !== false,
          perCustomerLimit: voucherData.perCustomerLimit || 1,
          minPurchaseAmount: voucherData.minPurchase || 0
        });

        if (result.success) {
          await loadVouchers();
          showSnackbar("Voucher updated successfully!", "success");
        } else {
          showSnackbar(result.error || "Failed to update voucher", "error");
        }
      }
    } catch (error) {
      console.error("Error saving voucher:", error);
      showSnackbar("Error saving voucher", "error");
    }
  };

  const handleConfirmDeleteVoucher = async (voucher) => {
    try {
      const result = await VoucherService.deleteVoucher(voucher.id);
      if (result.success) {
        await loadVouchers();
        showSnackbar("Voucher deleted successfully!", "success");
      } else {
        showSnackbar(result.error || "Failed to delete voucher", "error");
      }
    } catch (error) {
      console.error("Error deleting voucher:", error);
      showSnackbar("Error deleting voucher", "error");
    }
  };

  // Discount handlers
  const handleEditDiscount = async (discount) => {
    try {
      // Load full product objects if there are applicable products
      let specificProducts = [];
      if (discount.applicableProducts && discount.applicableProducts.length > 0) {
        const result = await DiscountService.getProductsByIds(discount.applicableProducts);
        if (result.success) {
          specificProducts = result.data;
        }
      }

      // Add the loaded products to the discount object
      const discountWithProducts = {
        ...discount,
        specificProducts: specificProducts
      };

      setSelectedDiscount(discountWithProducts);
      setIsAddMode(false);
      setDiscountEditOpen(true);
    } catch (error) {
      console.error('Error loading discount products:', error);
      showSnackbar('Error loading discount details', 'error');
    }
  };

  const handleDeleteDiscount = (discount) => {
    setSelectedDiscount(discount);
    setDiscountDeleteOpen(true);
  };

  const handleSaveDiscount = async (discountData) => {
    try {
      // Extract product IDs from specificProducts array
      const applicableProducts = discountData.specificProducts?.map(p => p.id) || [];
      const applyToType = applicableProducts.length > 0 ? 'specific_products' : 'all';

      if (isAddMode) {
        // Create new discount
        const result = await DiscountService.createDiscount({
          name: discountData.name,
          discountType: discountData.type,
          discountValue: parseFloat(discountData.value),
          validFrom: discountData.validFrom,
          validUntil: discountData.validUntil,
          appliesTo: applicableProducts.length > 0 ? 'Specific Products' : 'All Products',
          applyToType: applyToType,
          applicableProducts: applicableProducts,
          minSpend: discountData.minSpend || null,
          userEligibility: discountData.userEligibility || 'All Users',
          description: discountData.description || '',
          isActive: true,
          maxDiscountAmount: discountData.maxDiscountAmount || null
        });

        if (result.success) {
          await loadDiscounts();

          // Send notification to customers
          try {
            const discountValue = discountData.type === 'percentage'
              ? `${discountData.value}%`
              : `₱${discountData.value}`;

            const productScope = applicableProducts.length > 0
              ? 'on selected products'
              : 'store-wide';

            const message = discountData.description
              ? discountData.description
              : `Enjoy ${discountValue} off ${productScope}!`;

            console.log('Sending discount notification with params:', {
              p_title: discountData.name || 'New Discount Available',
              p_message: message,
              p_voucher_id: null,
              p_discount_id: result.data.id,
              p_action_type: 'view_products',
              p_action_data: {
                discount: discountValue,
                productIds: applicableProducts
              },
              p_target_users: 'all'
            });

            const { data: notifResult, error: notifError } = await supabase.rpc('create_promotion_notification', {
              p_title: discountData.name || 'New Discount Available',
              p_message: message,
              p_voucher_id: null,
              p_discount_id: result.data.id,
              p_action_type: 'view_products',
              p_action_data: {
                discount: discountValue,
                productIds: applicableProducts
              },
              p_target_users: 'all'
            });

            console.log('Notification RPC result:', { notifResult, notifError });

            if (notifError) {
              console.error('Notification error:', notifError);
              showSnackbar("Discount created but notification failed: " + notifError.message, "warning");
            } else {
              console.log(`Notification sent to ${notifResult} customers`);
              showSnackbar(`Discount created and ${notifResult} customers notified!`, "success");
            }
          } catch (notifError) {
            console.error('Error sending notification:', notifError);
            showSnackbar("Discount created but notification failed", "warning");
          }
        } else {
          showSnackbar(result.error || "Failed to create discount", "error");
        }
      } else {
        // Update existing discount
        const result = await DiscountService.updateDiscount(discountData.id, {
          name: discountData.name,
          discountType: discountData.type,
          discountValue: parseFloat(discountData.value),
          validFrom: discountData.validFrom,
          validUntil: discountData.validUntil,
          appliesTo: applicableProducts.length > 0 ? 'Specific Products' : 'All Products',
          applyToType: applyToType,
          applicableProducts: applicableProducts,
          minSpend: discountData.minSpend || null,
          userEligibility: discountData.userEligibility || 'All Users',
          description: discountData.description || '',
          isActive: discountData.isActive !== false,
          maxDiscountAmount: discountData.maxDiscountAmount || null
        });

        if (result.success) {
          await loadDiscounts();
          showSnackbar("Discount updated successfully!", "success");
        } else {
          showSnackbar(result.error || "Failed to update discount", "error");
        }
      }
    } catch (error) {
      console.error("Error saving discount:", error);
      showSnackbar("Error saving discount", "error");
    }
  };

  const handleConfirmDeleteDiscount = async (discount) => {
    try {
      const result = await DiscountService.deleteDiscount(discount.id);
      if (result.success) {
        await loadDiscounts();
        showSnackbar("Discount deleted successfully!", "success");
      } else {
        showSnackbar(result.error || "Failed to delete discount", "error");
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      showSnackbar("Error deleting discount", "error");
    }
  };

  // Search handlers
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (activeTab === "vouchers") {
      if (!query.trim()) {
        setFilteredVouchers(vouchers);
        return;
      }
      const filtered = vouchers.filter(
        (voucher) =>
          voucher.name.toLowerCase().includes(query.toLowerCase()) ||
          voucher.code.toLowerCase().includes(query.toLowerCase()) ||
          voucher.price.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredVouchers(filtered);
    } else {
      if (!query.trim()) {
        setFilteredDiscounts(discounts);
        return;
      }
      const filtered = discounts.filter(
        (discount) =>
          discount.name.toLowerCase().includes(query.toLowerCase()) ||
          discount.appliesTo.toLowerCase().includes(query.toLowerCase()) ||
          discount.userEligibility.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDiscounts(filtered);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    if (tab === "vouchers") {
      setFilteredVouchers(vouchers);
    } else if (tab === "discount") {
      setFilteredDiscounts(discounts);
    }
    // popupads tab doesn't need search filtering
  };

  const handleAddClick = () => {
    setIsAddMode(true);
    if (activeTab === "vouchers") {
      setSelectedVoucher(null);
      setVoucherEditOpen(true);
    } else if (activeTab === "discount") {
      setSelectedDiscount(null);
      setDiscountEditOpen(true);
    }
    // popupads tab handles its own add button
  };

  const handleDownload = async () => {
    try {
      if (activeTab === "vouchers") {
        if (filteredVouchers.length === 0) {
          showSnackbar('No vouchers to export', 'error');
          return;
        }

        // Create Excel data from vouchers
        const excelData = filteredVouchers.map((voucher, index) => ({
          'No': index + 1,
          'Name': voucher.name || 'N/A',
          'Code': voucher.code || 'N/A',
          'Type': voucher.type === 'percent' ? 'Percentage' : 'Fixed Amount',
          'Discount': voucher.price || 'N/A',
          'Valid Period': voucher.active || 'N/A',
          'Usage Limit': voucher.limit || 'N/A',
          'Used': voucher.used || 0,
          'Remaining': (voucher.limit - voucher.used) || 0,
          'Min Purchase': voucher.minPurchase ? `₱${voucher.minPurchase}` : 'None',
          'Status': voucher.isActive ? 'Active' : 'Inactive'
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Vouchers");

        ws['!cols'] = [
          { wch: 5 },  { wch: 25 }, { wch: 15 }, { wch: 15 },
          { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 10 },
          { wch: 12 }, { wch: 15 }, { wch: 10 }
        ];

        const date = new Date().toISOString().split('T')[0];
        const fileName = `Vouchers_${date}.xlsx`;
        XLSX.writeFile(wb, fileName);

        await AdminLogService.createLog(
          user?.id,
          'download',
          'voucher',
          null,
          { count: filteredVouchers.length, fileName }
        );

        setSuccessMessage(`Successfully downloaded ${filteredVouchers.length} voucher records`);
        setShowSuccess(true);

      } else if (activeTab === "discount") {
        if (filteredDiscounts.length === 0) {
          showSnackbar('No discounts to export', 'error');
          return;
        }

        // Create Excel data from discounts
        const excelData = filteredDiscounts.map((discount, index) => {
          const typeValue = discount.type === 'percent' 
            ? `${discount.value}%` 
            : `₱${discount.value}`;
          
          return {
            'No': index + 1,
            'Name': discount.name || 'N/A',
            'Type/Value': typeValue,
            'Dates': discount.dates || 'N/A',
            'Used': discount.used || 0,
            'Applies To': discount.appliesTo || 'All Products',
            'Min Spend': discount.minSpend ? `₱${discount.minSpend}` : 'N/A',
            'User Eligibility': discount.userEligibility || 'All Users'
          };
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Discounts");

        ws['!cols'] = [
          { wch: 5 },  // No
          { wch: 20 }, // Name
          { wch: 15 }, // Type/Value
          { wch: 25 }, // Dates
          { wch: 10 }, // Used
          { wch: 20 }, // Applies To
          { wch: 15 }, // Min Spend
          { wch: 20 }  // User Eligibility
        ];

        const date = new Date().toISOString().split('T')[0];
        const fileName = `Discounts_${date}.xlsx`;
        XLSX.writeFile(wb, fileName);

        await AdminLogService.createLog(
          user?.id,
          'download',
          'discount',
          null,
          { count: filteredDiscounts.length, fileName }
        );

        setSuccessMessage(`Successfully downloaded ${filteredDiscounts.length} discount records`);
        setShowSuccess(true);

      } else if (activeTab === "popupads") {
        // Fetch popup ads data
        const { data, error } = await PopupAdService.getAllPopupAds();

        if (error || !data || data.length === 0) {
          showSnackbar('No popup ads to export', 'error');
          return;
        }

        // Create Excel data from popup ads
        const excelData = data.map((popup, index) => ({
          'No': index + 1,
          'Title': popup.title || 'N/A',
          'Link Type': popup.link_type || 'N/A',
          'Link URL': popup.link_url || 'N/A',
          'Display Frequency': popup.display_frequency || 'N/A',
          'Delay (seconds)': popup.delay_seconds || 'N/A',
          'Auto Close (seconds)': popup.auto_close_seconds || 'Manual',
          'Show on Pages': Array.isArray(popup.show_on_pages) ? popup.show_on_pages.join(', ') : 'N/A',
          'Target Audience': popup.target_audience || 'N/A',
          'Start Date': popup.start_date ? new Date(popup.start_date).toLocaleDateString() : 'N/A',
          'End Date': popup.end_date ? new Date(popup.end_date).toLocaleDateString() : 'N/A',
          'Views': popup.view_count || 0,
          'Clicks': popup.click_count || 0,
          'Status': popup.is_active ? 'Active' : 'Inactive'
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Popup Ads");

        ws['!cols'] = [
          { wch: 5 },  { wch: 30 }, { wch: 12 }, { wch: 40 },
          { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 25 },
          { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
          { wch: 10 }, { wch: 10 }
        ];

        const date = new Date().toISOString().split('T')[0];
        const fileName = `PopupAds_${date}.xlsx`;
        XLSX.writeFile(wb, fileName);

        await AdminLogService.createLog(
          user?.id,
          'download',
          'popup_ad',
          null,
          { count: data.length, fileName }
        );

        setSuccessMessage(`Successfully downloaded ${data.length} popup ad records`);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error downloading Excel:', error);
      showSnackbar('Failed to download data', 'error');
    }
  };

  return (
    <Box p={4}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PromotionsHeader
          onAddVoucher={handleAddClick}
          onDownload={handleDownload}
          onSearch={handleSearch}
          onTabChange={handleTabChange}
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
        />
      </motion.div>

      {/* Conditional Table Rendering */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "vouchers" ? (
          <VoucherTable
            vouchers={filteredVouchers}
            onEdit={handleEditVoucher}
            onDelete={handleDeleteVoucher}
            loading={loading}
          />
        ) : activeTab === "discount" ? (
          <DiscountTable
            discounts={filteredDiscounts}
            onEdit={handleEditDiscount}
            onDelete={handleDeleteDiscount}
            loading={loading}
          />
        ) : activeTab === "popupads" ? (
          <PopupAdsTab />
        ) : null}
      </motion.div>

      {/* Voucher Dialogs */}
      <VoucherEditDialog
        open={voucherEditOpen}
        onClose={() => setVoucherEditOpen(false)}
        voucher={selectedVoucher}
        isAddMode={isAddMode}
        onSave={handleSaveVoucher}
        showSnackbar={showSnackbar}
      />

      <VoucherDeleteDialog
        open={voucherDeleteOpen}
        onClose={() => setVoucherDeleteOpen(false)}
        voucher={selectedVoucher}
        onConfirmDelete={handleConfirmDeleteVoucher}
        showSnackbar={showSnackbar}
      />

      {/* Discount Dialogs */}
      <DiscountEditDialog
        open={discountEditOpen}
        onClose={() => setDiscountEditOpen(false)}
        discount={selectedDiscount}
        isAddMode={isAddMode}
        onSave={handleSaveDiscount}
        showSnackbar={showSnackbar}
      />

      <DiscountDeleteDialog
        open={discountDeleteOpen}
        onClose={() => setDiscountDeleteOpen(false)}
        discount={selectedDiscount}
        onConfirmDelete={handleConfirmDeleteDiscount}
        showSnackbar={showSnackbar}
      />

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Success Notification */}
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

export default Promotions;
