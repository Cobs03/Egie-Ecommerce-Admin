import React, { useState } from "react";
import { Box } from "@mui/material";
import { toast, Toaster } from "sonner";
import ShippingHeader from "./Shipping Components/ShippingHeader";
import ShippingTable from "./Shipping Components/ShippingTable";
import { mockShipments } from "./Shipping Components/shippingData";

const Shipping = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [shipments, setShipments] = useState(mockShipments);

  const handleExport = () => {
    toast.success("Shipments exported successfully!", { duration: 2000 });
    // Add your export logic here (e.g., CSV download)
  };

  const handleDeleteShipment = (orderCode) => {
    setShipments((prevShipments) =>
      prevShipments.filter((shipment) => shipment.order.code !== orderCode)
    );
  };

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

      <ShippingTable
        shipments={filteredShipments}
        onDeleteShipment={handleDeleteShipment}
      />
    </Box>
  );
};

export default Shipping;
