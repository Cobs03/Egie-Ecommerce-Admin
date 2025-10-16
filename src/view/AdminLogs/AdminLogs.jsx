import React, { useState } from "react";
import { Box, Pagination } from "@mui/material";
import LogsHeader from "./AdminLogs Components/LogsHeader";
import LogsTable from "./AdminLogs Components/LogsTable";
import { activityLogs, LOGS_PER_PAGE } from "./AdminLogs Components/logsData";

const AdminLogs = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logs based on search query
  const filteredLogs = activityLogs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * LOGS_PER_PAGE,
    page * LOGS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  const handleFilterClick = () => {
    console.log("Opening filter options...");
    // TODO: Implement filter dialog/drawer
  };

  const handleDownload = () => {
    console.log("Downloading logs...");
    // TODO: Implement download functionality (CSV/PDF export)
  };

  const handleRowClick = (log) => {
    console.log("Log clicked:", log);
    // TODO: Implement log detail view/dialog
  };

  return (
    <Box p={4}>
      {/* Header with Search and Actions */}
      <LogsHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onFilterClick={handleFilterClick}
        onDownload={handleDownload}
      />

      {/* Logs Table */}
      <LogsTable logs={paginatedLogs} onRowClick={handleRowClick} />

    </Box>
  );
};

export default AdminLogs;