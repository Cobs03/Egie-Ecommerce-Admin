import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Tooltip from "@mui/material/Tooltip";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const Card = ({
  title,
  value,
  percentage,
  period,
  icon,
  percentageColor = "#22c55e",
  percentageBg = "#dcfce7",
  iconBg = "#f3f4f6",
  trendData = [],
  onPeriodChange,
  onClick,
  tooltipText,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [isHovered, setIsHovered] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
    handleClose();
  };

  const options = ["Today", "In the Last Day", "In the Last Week", "In the Last Month"];

  const cardContent = (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.07)",
        padding: 24,
        minWidth: 240,
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        margin: 8,
        cursor: onClick ? "pointer" : "default",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: isHovered ? "1px solid #e0e0e0" : "1px solid transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div
          style={{
            background: iconBg,
            borderRadius: 12,
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: "#888", fontWeight: 500 }}>
            {title}
          </div>
        </div>
        
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={open ? "long-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          style={{ position: "absolute", top: 8, right: 8, color: "#bbb" }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          MenuListProps={{
            "aria-labelledby": "long-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: 48 * 4.5,
              width: "20ch",
            },
          }}
        >
          {options.map((option) => (
            <MenuItem
              key={option}
              selected={option === selectedPeriod}
              onClick={() => handleMenuItemClick(option)}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </div>
      
      {/* Value and Trend Chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 42, fontWeight: 700, flex: 1 }}>
          {value}
        </div>
        {trendData && trendData.length > 0 && (
          <div style={{ width: 100, height: 50, marginBottom: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={percentageColor} 
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* Percentage and Period */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            background: percentageBg,
            color: percentageColor,
            borderRadius: 16,
            padding: "2px 12px",
            fontWeight: 600,
            fontSize: 14,
            marginRight: 8,
          }}
        >
          {percentage}
        </div>
        <div style={{ color: "#888", fontSize: 14 }}>{selectedPeriod}</div>
      </div>
    </div>
  );

  return tooltipText ? (
    <Tooltip title={tooltipText} arrow placement="top">
      {cardContent}
    </Tooltip>
  ) : (
    cardContent
  );
};

export default Card;
