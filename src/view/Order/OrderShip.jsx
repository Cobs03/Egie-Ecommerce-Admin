import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";

const OrderShip = ({ visible, onClose, onShipped, order }) => {
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");

  // Generate tracking number when courier is selected
  useEffect(() => {
    if (courier) {
      const prefix = courier.split(" ")[0].toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      setTracking(`${prefix}${timestamp}${random}`);
    } else {
      setTracking("");
    }
  }, [courier]);

  if (!visible) return null;

  const textColor = { color: "#222" };
  const cursorPointer = { cursor: "pointer" };

  const handleShipped = () => {
    // Call the onShipped callback which will handle closing both modal and drawer
    onShipped();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 32,
          minWidth: 400,
          maxWidth: 500,
          boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ textAlign: "center", fontWeight: 600, ...textColor }}>
          Shipping Process
        </h2>
        <div style={{ margin: "16px 0", fontSize: 15, ...textColor }}>
          <div>
            <b>Name:</b> <span style={textColor}>{order?.name}</span>
          </div>
          <div>
            <b>Email Address:</b> <span style={textColor}>{order?.email}</span>
          </div>
          <div>
            <b>Phone:</b> <span style={textColor}>{order?.phone}</span>
          </div>
          <div>
            <b>Address:</b> <span style={textColor}>{order?.address}</span>
          </div>
          <div>
            <b>Payment Method:</b>{" "}
            <span style={textColor}>{order?.paymentMethod}</span>
          </div>
        </div>
        <hr />
        <div style={{ margin: "16px 0" }}>
          <div style={{ fontWeight: 500, marginBottom: 8, ...textColor }}>
            Choose Couriers
          </div>
          <select
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 5,
              border: "1px solid #ccc",
              marginBottom: 8,
              ...textColor,
              ...cursorPointer,
            }}
          >
            <option value="">Choose Courier</option>
            <option value="J&T Express">J&T Express</option>
            <option value="LBC Express">LBC Express</option>
            <option value="Ninja Van">Ninja Van</option>
            <option value="JRS Express">JRS Express</option>
          </select>
          <input
            type="text"
            placeholder="Tracking Number"
            value={tracking}
            readOnly
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 5,
              border: "1px solid #ccc",
              marginBottom: 8,
              ...textColor,
              backgroundColor: "#f5f5f5",
            }}
          />
          <div
            style={{ fontSize: 12, color: "#888", marginTop: 4, ...textColor }}
          >
            Use PHL if your order is handling delivery — no need for courier
            tracking
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#FF2323",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              padding: "10px 32px",
              fontWeight: 600,
              ...cursorPointer,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleShipped}
            disabled={!courier || !tracking}
            style={{
              background: courier && tracking ? "#00D100" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              padding: "10px 32px",
              fontWeight: 600,
              ...cursorPointer,
            }}
          >
            Shipped
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderShip;
