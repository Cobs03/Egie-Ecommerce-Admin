import React from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import {
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

const AboutUsTab = ({ settings, onChange, onReset, onSave, loading }) => {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Title */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="About Us Title"
            value={settings.aboutUsTitle || ""}
            onChange={(e) => onChange("aboutUsTitle", e.target.value)}
            helperText="Main heading for the About Us page"
          />
        </Grid>

        {/* Content */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={10}
            label="About Us Content"
            value={settings.aboutUsContent || ""}
            onChange={(e) => onChange("aboutUsContent", e.target.value)}
            helperText="Describe your business, mission, and values"
            placeholder="Tell customers about your gaming store, what makes you unique, and why they should choose you..."
          />
        </Grid>

        {/* Footer Text */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Footer Copyright Text"
            value={settings.footerText || ""}
            onChange={(e) => onChange("footerText", e.target.value)}
            helperText="Text shown after the copyright year (e.g., 'All rights reserved.')"
            placeholder="All rights reserved."
          />
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={onSave}
              disabled={loading}
              sx={{
                bgcolor: "success.main",
                "&:hover": { bgcolor: "success.dark" },
              }}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              disabled={loading}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AboutUsTab;
