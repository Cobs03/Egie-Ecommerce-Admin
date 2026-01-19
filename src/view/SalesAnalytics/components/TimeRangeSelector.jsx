import React from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

/**
 * TimeRangeSelector Component
 * Allows users to select predefined time ranges or custom date ranges
 * 
 * @param {Object} props
 * @param {string} props.timeRange - Current selected time range (day/week/month/year/custom)
 * @param {Function} props.onTimeRangeChange - Callback when time range changes
 * @param {string} props.customStartDate - Custom start date value
 * @param {Function} props.onCustomStartDateChange - Callback for custom start date
 * @param {string} props.customEndDate - Custom end date value
 * @param {Function} props.onCustomEndDateChange - Callback for custom end date
 */
const TimeRangeSelector = ({
  timeRange,
  onTimeRangeChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange
}) => {
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      case 'custom': return 'Custom Range';
      default: return 'This Month';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => onTimeRangeChange(e.target.value)}
            >
              <MenuItem value="day">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          {timeRange === 'custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => onCustomStartDateChange(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <Typography variant="body2">to</Typography>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomEndDateChange(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </>
          )}

          <Chip
            icon={<CalendarIcon />}
            label={getTimeRangeLabel()}
            color="primary"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TimeRangeSelector;
