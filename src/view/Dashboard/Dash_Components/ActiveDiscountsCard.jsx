import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Box, IconButton, Tooltip, ToggleButtonGroup, ToggleButton } from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { DashboardService } from "../../../services/DashboardService";

const ActiveDiscountsCard = () => {
  const [discountCount, setDiscountCount] = useState(0);
  const [voucherCount, setVoucherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("discounts"); // "discounts" or "vouchers"
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await DashboardService.getActiveDiscounts();
    if (result.success) {
      setDiscountCount(result.total);
      // Assuming vouchers count might be in the result or fetched separately
      setVoucherCount(result.vouchersTotal || 0);
    }
    setLoading(false);
  };

  const handleClick = () => {
    navigate("/promotions", { state: { activeTab: viewMode } });
  };

  const handleToggle = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const currentCount = viewMode === "discounts" ? discountCount : voucherCount;
  const numericValue = parseInt(currentCount);
  const shouldShowPlus = !isNaN(numericValue) && numericValue > 99;
  const displayText = shouldShowPlus ? "99+" : currentCount.toString();
  const tooltipText = `Click to view ${viewMode === "discounts" ? "discounts" : "vouchers"}. Toggle to switch between discounts and vouchers.`;

  return (
    <Tooltip title={tooltipText} arrow placement="top">
      <Card
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.15)" : 3,
          padding: 2,
          minWidth: 240,
          minHeight: 100,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          margin: 1,
          overflow: "hidden",
          cursor: "pointer",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: isHovered ? "1px solid #e0e0e0" : "1px solid transparent",
        }}
      >
      <CardContent sx={{ flexGrow: 1, p: 1, zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleToggle}
            size="small"
            sx={{ height: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ToggleButton value="discounts" sx={{ px: 1, py: 0.5, fontSize: "0.75rem" }}>
              Discounts
            </ToggleButton>
            <ToggleButton value="vouchers" sx={{ px: 1, py: 0.5, fontSize: "0.75rem" }}>
              Vouchers
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          sx={{ mb: 0.5 }}
        >
          Active {viewMode === "discounts" ? "Discounts" : "Vouchers"}
        </Typography>
        {loading ? (
          <Typography variant="h4" fontWeight={700}>
            ...
          </Typography>
        ) : shouldShowPlus ? (
          <Tooltip title={`Actual count: ${currentCount}`} arrow placement="top">
            <Typography variant="h4" fontWeight={700} sx={{ cursor: "help" }}>
              {displayText}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="h4" fontWeight={700}>
            {displayText}
          </Typography>
        )}
      </CardContent>

      {/* Background Icon */}
      <Box
        sx={{
          position: "absolute",
          bottom: -10,
          right: -10,
          fontSize: "100px",
          color: "#f0f0f0",
          zIndex: 0,
          transform: "rotate(-15deg)",
        }}
      >
        {viewMode === "discounts" ? (
          <LocalOfferOutlinedIcon sx={{ fontSize: "inherit" }} />
        ) : (
          <CardGiftcardIcon sx={{ fontSize: "inherit" }} />
        )}
      </Box>
    </Card>
    </Tooltip>
  );
};

export default ActiveDiscountsCard;
