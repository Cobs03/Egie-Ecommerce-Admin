import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";

const LogsHeader = ({ searchQuery, onSearchChange, onFilterClick, onDownload }) => {
  return (
    <>
      <Typography variant="h4" fontWeight={700} mb={2}>
        LOGS
      </Typography>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        p={1}
        bgcolor="#000"
        borderRadius={2}
        boxShadow={1}
      >
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search Logs"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "#000" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              minWidth: 300,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { border: "none" },
              },
              input: { color: "#000" },
            }}
          />
        </Stack>

        <Stack direction="row" spacing={2}>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
            sx={{
              bgcolor: "#fff",
              color: "#000",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#f5f5f5",
              },
            }}
          >
            EXPORT LOGS
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default LogsHeader;