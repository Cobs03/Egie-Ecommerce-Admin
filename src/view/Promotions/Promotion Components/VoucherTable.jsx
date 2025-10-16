import React, { useState, useMemo } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";

const VoucherTable = ({ vouchers, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [nameSortAnchor, setNameSortAnchor] = useState(null);
  const [reduceSortAnchor, setReduceSortAnchor] = useState(null);
  const [limitSortAnchor, setLimitSortAnchor] = useState(null);
  const [usedSortAnchor, setUsedSortAnchor] = useState(null);

  const [nameSort, setNameSort] = useState(null); // 'asc', 'desc', 'recent'
  const [reduceSort, setReduceSort] = useState(null); // 'percent', 'fixed'
  const [limitSort, setLimitSort] = useState(null); // 'highest', 'lowest'
  const [usedSort, setUsedSort] = useState(null); // 'highest', 'lowest'

  const handleMenuOpen = (event, voucher) => {
    setAnchorEl(event.currentTarget);
    setSelectedVoucher(voucher);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVoucher(null);
  };

  const handleEditClick = () => {
    onEdit(selectedVoucher);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    onDelete(selectedVoucher);
    handleMenuClose();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter handlers
  const handleNameSortOpen = (event) => {
    setNameSortAnchor(event.currentTarget);
  };

  const handleReduceSortOpen = (event) => {
    setReduceSortAnchor(event.currentTarget);
  };

  const handleLimitSortOpen = (event) => {
    setLimitSortAnchor(event.currentTarget);
  };

  const handleUsedSortOpen = (event) => {
    setUsedSortAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setNameSortAnchor(null);
    setReduceSortAnchor(null);
    setLimitSortAnchor(null);
    setUsedSortAnchor(null);
  };

  // Filtered and sorted vouchers
  const sortedVouchers = useMemo(() => {
    let result = [...vouchers];

    // Apply name sort
    if (nameSort === "asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (nameSort === "desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (nameSort === "recent") {
      result.sort((a, b) => b.id - a.id); // Assuming higher ID = more recent
    }

    // Apply reduce (type) filter
    if (reduceSort === "percent") {
      result = result.filter((v) => v.price.includes("%"));
    } else if (reduceSort === "fixed") {
      result = result.filter((v) => v.price.includes("₱"));
    }

    // Apply limit sort
    if (limitSort === "highest") {
      result.sort((a, b) => b.limit - a.limit);
    } else if (limitSort === "lowest") {
      result.sort((a, b) => a.limit - b.limit);
    }

    // Apply used sort
    if (usedSort === "highest") {
      result.sort((a, b) => b.used - a.used);
    } else if (usedSort === "lowest") {
      result.sort((a, b) => a.used - b.used);
    }

    return result;
  }, [vouchers, nameSort, reduceSort, limitSort, usedSort]);

  return (
    <>
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F5F5F5" }}>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">NAME</Typography>
                  <IconButton size="small" onClick={handleNameSortOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CODE</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">REDUCE</Typography>
                  <IconButton size="small" onClick={handleReduceSortOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ACTIVE FROM</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">LIMIT</Typography>
                  <IconButton size="small" onClick={handleLimitSortOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">USED</Typography>
                  <IconButton size="small" onClick={handleUsedSortOpen}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedVouchers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((voucher) => (
                <TableRow
                  key={voucher.id}
                  sx={{
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {voucher.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{voucher.code}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {voucher.price}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {voucher.active}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{voucher.limit}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{voucher.used}</Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuOpen(e, voucher)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {sortedVouchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No vouchers found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedVouchers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          sx={{
            backgroundColor: "#E4FDE1",
            borderTop: "1px solid #e0e0e0",
            "& .MuiTablePagination-toolbar": {
              justifyContent: "flex-start",
              paddingLeft: 2,
            },
            "& .MuiTablePagination-spacer": {
              display: "none",
            },
            "& .MuiTablePagination-displayedRows": {
              marginLeft: 0,
            },
            "& .MuiTablePagination-actions": {
              marginLeft: 2,
            },
          }}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEditClick}>Edit Details</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          Delete Voucher
        </MenuItem>
      </Menu>

      {/* Name Sort Popover */}
      <Popover
        open={Boolean(nameSortAnchor)}
        anchorEl={nameSortAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          <ListItem
            button
            onClick={() => {
              setNameSort("asc");
              handleFilterClose();
            }}
            selected={nameSort === "asc"}
          >
            <ListItemText primary="A-Z" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setNameSort("desc");
              handleFilterClose();
            }}
            selected={nameSort === "desc"}
          >
            <ListItemText primary="Z-A" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setNameSort("recent");
              handleFilterClose();
            }}
            selected={nameSort === "recent"}
          >
            <ListItemText primary="Recent" />
          </ListItem>
          {nameSort && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setNameSort(null);
                  handleFilterClose();
                }}
              >
                <ListItemText
                  primary="Clear Sort"
                  sx={{ color: "text.secondary" }}
                />
              </ListItem>
            </>
          )}
        </List>
      </Popover>

      {/* Reduce (Type) Filter Popover */}
      <Popover
        open={Boolean(reduceSortAnchor)}
        anchorEl={reduceSortAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          <ListItem
            button
            onClick={() => {
              setReduceSort("percent");
              handleFilterClose();
            }}
            selected={reduceSort === "percent"}
          >
            <ListItemText primary="Percent (%)" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setReduceSort("fixed");
              handleFilterClose();
            }}
            selected={reduceSort === "fixed"}
          >
            <ListItemText primary="Fixed (₱)" />
          </ListItem>
          {reduceSort && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setReduceSort(null);
                  handleFilterClose();
                }}
              >
                <ListItemText
                  primary="Clear Filter"
                  sx={{ color: "text.secondary" }}
                />
              </ListItem>
            </>
          )}
        </List>
      </Popover>

      {/* Limit Sort Popover */}
      <Popover
        open={Boolean(limitSortAnchor)}
        anchorEl={limitSortAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          <ListItem
            button
            onClick={() => {
              setLimitSort("highest");
              handleFilterClose();
            }}
            selected={limitSort === "highest"}
          >
            <ListItemText primary="Highest" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setLimitSort("lowest");
              handleFilterClose();
            }}
            selected={limitSort === "lowest"}
          >
            <ListItemText primary="Lowest" />
          </ListItem>
          {limitSort && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setLimitSort(null);
                  handleFilterClose();
                }}
              >
                <ListItemText
                  primary="Clear Sort"
                  sx={{ color: "text.secondary" }}
                />
              </ListItem>
            </>
          )}
        </List>
      </Popover>

      {/* Used Sort Popover */}
      <Popover
        open={Boolean(usedSortAnchor)}
        anchorEl={usedSortAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          <ListItem
            button
            onClick={() => {
              setUsedSort("highest");
              handleFilterClose();
            }}
            selected={usedSort === "highest"}
          >
            <ListItemText primary="Highest" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setUsedSort("lowest");
              handleFilterClose();
            }}
            selected={usedSort === "lowest"}
          >
            <ListItemText primary="Lowest" />
          </ListItem>
          {usedSort && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setUsedSort(null);
                  handleFilterClose();
                }}
              >
                <ListItemText
                  primary="Clear Sort"
                  sx={{ color: "text.secondary" }}
                />
              </ListItem>
            </>
          )}
        </List>
      </Popover>
    </>
  );
};

export default VoucherTable;