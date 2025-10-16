import React, { useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import PromotionsHeader from "./Promotion Components/PromotionsHeader";
import VoucherTable from "./Promotion Components/VoucherTable";
import DiscountTable from "./Promotion Components/DiscountsTable";
import VoucherEditDialog from "./Promotion Components/VoucherEditDialog";
import VoucherDeleteDialog from "./Promotion Components/VoucherDeleteDialog";
import DiscountEditDialog from "./Promotion Components/DiscountEditDialog";
import DiscountDeleteDialog from "./Promotion Components/DiscountDeleteDialog";
import { vouchers as initialVouchers } from "./Promotion Components/promotionData";
import { discounts as initialDiscounts } from "./Promotion Components/discountData";

const Promotions = () => {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [filteredVouchers, setFilteredVouchers] = useState(initialVouchers);
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [filteredDiscounts, setFilteredDiscounts] = useState(initialDiscounts);
  
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

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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

  const handleSaveVoucher = (voucherData) => {
    if (isAddMode) {
      const newVoucher = {
        ...voucherData,
        id: vouchers.length + 1,
        used: 0,
      };
      const updatedVouchers = [...vouchers, newVoucher];
      setVouchers(updatedVouchers);
      setFilteredVouchers(updatedVouchers);
    } else {
      const updatedVouchers = vouchers.map((v) =>
        v.id === voucherData.id ? voucherData : v
      );
      setVouchers(updatedVouchers);
      setFilteredVouchers(updatedVouchers);
    }
  };

  const handleConfirmDeleteVoucher = (voucher) => {
    const updatedVouchers = vouchers.filter((v) => v.id !== voucher.id);
    setVouchers(updatedVouchers);
    setFilteredVouchers(updatedVouchers);
  };

  // Discount handlers
  const handleEditDiscount = (discount) => {
    setSelectedDiscount(discount);
    setIsAddMode(false);
    setDiscountEditOpen(true);
  };

  const handleDeleteDiscount = (discount) => {
    setSelectedDiscount(discount);
    setDiscountDeleteOpen(true);
  };

  const handleSaveDiscount = (discountData) => {
    if (isAddMode) {
      const newDiscount = {
        ...discountData,
        id: discounts.length + 1,
        used: 0,
      };
      const updatedDiscounts = [...discounts, newDiscount];
      setDiscounts(updatedDiscounts);
      setFilteredDiscounts(updatedDiscounts);
    } else {
      const updatedDiscounts = discounts.map((d) =>
        d.id === discountData.id ? discountData : d
      );
      setDiscounts(updatedDiscounts);
      setFilteredDiscounts(updatedDiscounts);
    }
  };

  const handleConfirmDeleteDiscount = (discount) => {
    const updatedDiscounts = discounts.filter((d) => d.id !== discount.id);
    setDiscounts(updatedDiscounts);
    setFilteredDiscounts(updatedDiscounts);
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
    } else {
      setFilteredDiscounts(discounts);
    }
  };

  const handleAddClick = () => {
    setIsAddMode(true);
    if (activeTab === "vouchers") {
      setSelectedVoucher(null);
      setVoucherEditOpen(true);
    } else {
      setSelectedDiscount(null);
      setDiscountEditOpen(true);
    }
  };

  const handleDownload = () => {
    showSnackbar(
      `Exporting ${activeTab === "discount" ? "Discounts" : "Vouchers"}...`,
      "info"
    );
  };

  return (
    <Box p={4}>
      <PromotionsHeader
        onAddVoucher={handleAddClick}
        onDownload={handleDownload}
        onSearch={handleSearch}
        onTabChange={handleTabChange}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />

      {/* Conditional Table Rendering */}
      {activeTab === "vouchers" ? (
        <VoucherTable
          vouchers={filteredVouchers}
          onEdit={handleEditVoucher}
          onDelete={handleDeleteVoucher}
        />
      ) : (
        <DiscountTable
          discounts={filteredDiscounts}
          onEdit={handleEditDiscount}
          onDelete={handleDeleteDiscount}
        />
      )}

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
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
    </Box>
  );
};

export default Promotions;
