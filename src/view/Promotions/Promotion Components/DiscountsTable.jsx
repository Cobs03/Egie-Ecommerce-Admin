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
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";

const DiscountTable = ({ discounts, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [nameSortAnchor, setNameSortAnchor] = useState(null);
  const [typeFilterAnchor, setTypeFilterAnchor] = useState(null);
  const [usedSortAnchor, setUsedSortAnchor] = useState(null);
  const [appliesToFilterAnchor, setAppliesToFilterAnchor] = useState(null);
  const [minSpendSortAnchor, setMinSpendSortAnchor] = useState(null);
  const [eligibilityFilterAnchor, setEligibilityFilterAnchor] = useState(null);

  const [nameSort, setNameSort] = useState(null); // 'asc', 'desc', 'recent'
  const [typeFilter, setTypeFilter] = useState(null); // 'percent', 'fixed'
  const [usedSort, setUsedSort] = useState(null); // 'highest', 'lowest'
  const [appliesToFilter, setAppliesToFilter] = useState(null); // 'all', 'specific'
  const [minSpendSort, setMinSpendSort] = useState(null); // 'highest', 'lowest'
  const [eligibilityFilter, setEligibilityFilter] = useState(null); // 'all', 'new', 'existing', 'selected'

  const handleMenuOpen = (event, discount) => {
    setAnchorEl(event.currentTarget);
    setSelectedDiscount(discount);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDiscount(null);
  };

  const handleEditClick = () => {
    onEdit(selectedDiscount);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    onDelete(selectedDiscount);
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
  const handleFilterOpen = (setter) => (event) => {
    setter(event.currentTarget);
  };

  const handleFilterClose = () => {
    setNameSortAnchor(null);
    setTypeFilterAnchor(null);
    setUsedSortAnchor(null);
    setAppliesToFilterAnchor(null);
    setMinSpendSortAnchor(null);
    setEligibilityFilterAnchor(null);
  };

  // Filtered and sorted discounts
  const sortedDiscounts = useMemo(() => {
    let result = [...discounts];

    // Apply name sort
    if (nameSort === "asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (nameSort === "desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (nameSort === "recent") {
      result.sort((a, b) => b.id - a.id);
    }

    // Apply type filter
    if (typeFilter === "percent") {
      result = result.filter((d) => d.type === "percent");
    } else if (typeFilter === "fixed") {
      result = result.filter((d) => d.type === "fixed");
    }

    // Apply used sort
    if (usedSort === "highest") {
      result.sort((a, b) => b.used - a.used);
    } else if (usedSort === "lowest") {
      result.sort((a, b) => a.used - b.used);
    }

    // Apply applies to filter
    if (appliesToFilter === "all") {
      result = result.filter((d) => d.appliesTo === "All Products");
    } else if (appliesToFilter === "specific") {
      result = result.filter((d) => d.appliesTo !== "All Products");
    }

    // Apply min spend sort
    if (minSpendSort === "highest") {
      result.sort((a, b) => (b.minSpend || 0) - (a.minSpend || 0));
    } else if (minSpendSort === "lowest") {
      result.sort((a, b) => (a.minSpend || 0) - (b.minSpend || 0));
    }

    // Apply eligibility filter
    if (eligibilityFilter) {
      result = result.filter((d) => d.userEligibility === eligibilityFilter);
    }

    return result;
  }, [discounts, nameSort, typeFilter, usedSort, appliesToFilter, minSpendSort, eligibilityFilter]);

  const formatValue = (discount) => {
    if (discount.type === "percent") {
      return `${discount.value}%`;
    }
    return `₱${discount.value}`;
  };

  const getEligibilityColor = (eligibility) => {
    switch (eligibility) {
      case "All Users":
        return "primary";
      case "New Users":
        return "success";
      case "Existing Users":
        return "warning";
      case "Selected":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <>
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F5F5F5" }}>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">NAME</Typography>
                  <IconButton size="small" onClick={handleFilterOpen(setNameSortAnchor)}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">TYPE/VALUE</Typography>
                  <IconButton size="small" onClick={handleFilterOpen(setTypeFilterAnchor)}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>DATES</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">USED</Typography>
                  <IconButton size="small" onClick={handleFilterOpen(setUsedSortAnchor)}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">APPLIES TO</Typography>
                  <IconButton size="small" onClick={handleFilterOpen(setAppliesToFilterAnchor)}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">MIN SPEND</Typography>
                  <IconButton size="small" onClick={handleFilterOpen(setMinSpendSortAnchor)}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold">USER ELIGIBILITY</Typography>
                  <IconButton size="small" onClick={handleFilterOpen(setEligibilityFilterAnchor)}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDiscounts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((discount) => (
                <TableRow
                  key={discount.id}
                  sx={{
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {discount.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatValue(discount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {discount.dates}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{discount.used}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontSize={13}>
                      {discount.appliesTo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {discount.minSpend ? `₱${discount.minSpend}` : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={discount.userEligibility}
                      size="small"
                      color={getEligibilityColor(discount.userEligibility)}
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuOpen(e, discount)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {sortedDiscounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No discounts found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedDiscounts.length}
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
          Delete Discount
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
                <ListItemText primary="Clear Sort" sx={{ color: "text.secondary" }} />
              </ListItem>
            </>
          )}
        </List>
      </Popover>

      {/* Type Filter Popover */}
      <Popover
        open={Boolean(typeFilterAnchor)}
        anchorEl={typeFilterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          <ListItem
            button
            onClick={() => {
              setTypeFilter("percent");
              handleFilterClose();
            }}
            selected={typeFilter === "percent"}
          >
            <ListItemText primary="Percent (%)" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setTypeFilter("fixed");
              handleFilterClose();
            }}
            selected={typeFilter === "fixed"}
          >
            <ListItemText primary="Fixed (₱)" />
          </ListItem>
          {typeFilter && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setTypeFilter(null);
                  handleFilterClose();
                }}
              >
                <ListItemText primary="Clear Filter" sx={{ color: "text.secondary" }} />
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
                <ListItemText primary="Clear Sort" sx={{ color: "text.secondary" }} />
              </ListItem>
            </>
          )}
        </List>
      </Popover>

      {/* Applies To Filter Popover */}
      <Popover
        open={Boolean(appliesToFilterAnchor)}
        anchorEl={appliesToFilterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          <ListItem
            button
            onClick={() => {
              setAppliesToFilter("all");
              handleFilterClose();
            }}
            selected={appliesToFilter === "all"}
          >
            <ListItemText primary="All Products" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setAppliesToFilter("specific");
              handleFilterClose();
            }}
            selected={appliesToFilter === "specific"}
          >
            <ListItemText primary="Specific Products" />
          </ListItem>
          {appliesToFilter && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setAppliesToFilter(null);
                  handleFilterClose();
                }}
              >
                <ListItemText primary="Clear Filter" sx={{ color: "text.secondary" }} />
              </ListItem>
            </>
          )}
        </List>
      </Popover>

      {/* Min Spend Sort Popover */}
      <Popover
        open={Boolean(minSpendSortAnchor)}
        anchorEl={minSpendSortAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          <ListItem
            button
            onClick={() => {
              setMinSpendSort("highest");
              handleFilterClose();
            }}
            selected={minSpendSort === "highest"}
          >
            <ListItemText primary="Highest" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setMinSpendSort("lowest");
              handleFilterClose();
            }}
            selected={minSpendSort === "lowest"}
          >
            <ListItemText primary="Lowest" />
          </ListItem>
          {minSpendSort && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setMinSpendSort(null);
                  handleFilterClose();
                }}
              >
                <ListItemText primary="Clear Sort" sx={{ color: "text.secondary" }} />
              </ListItem>
            </>
          )}
        </List>
      </Popover>

      {/* User Eligibility Filter Popover */}
      <Popover
        open={Boolean(eligibilityFilterAnchor)}
        anchorEl={eligibilityFilterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List sx={{ width: 200, pt: 0, pb: 0 }}>
          <ListItem
            button
            onClick={() => {
              setEligibilityFilter("All Users");
              handleFilterClose();
            }}
            selected={eligibilityFilter === "All Users"}
          >
            <ListItemText primary="All Users" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setEligibilityFilter("New Users");
              handleFilterClose();
            }}
            selected={eligibilityFilter === "New Users"}
          >
            <ListItemText primary="New Users" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setEligibilityFilter("Existing Users");
              handleFilterClose();
            }}
            selected={eligibilityFilter === "Existing Users"}
          >
            <ListItemText primary="Existing Users" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setEligibilityFilter("Selected");
              handleFilterClose();
            }}
            selected={eligibilityFilter === "Selected"}
          >
            <ListItemText primary="Selected" />
          </ListItem>
          {eligibilityFilter && (
            <>
              <Divider />
              <ListItem
                button
                onClick={() => {
                  setEligibilityFilter(null);
                  handleFilterClose();
                }}
              >
                <ListItemText primary="Clear Filter" sx={{ color: "text.secondary" }} />
              </ListItem>
            </>
          )}
        </List>
      </Popover>
    </>
  );
};

export default DiscountTable;