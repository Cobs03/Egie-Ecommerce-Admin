import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import {
  Image as ImageIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

const BrandingTab = ({ settings, logoPreview, onLogoChange, onChange, onReset, onSave, loading }) => {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Logo Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ImageIcon color="primary" />
                <Typography variant="h6">Logo</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                <Avatar
                  src={logoPreview || settings.logoUrl}
                  sx={{ width: 120, height: 120 }}
                  variant="rounded"
                >
                  {!logoPreview && !settings.logoUrl && <ImageIcon sx={{ fontSize: 60 }} />}
                </Avatar>

                <Box>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="logo-upload"
                    type="file"
                    onChange={onLogoChange}
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                    >
                      Upload Logo
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Recommended: 512x512px, PNG or SVG
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Brand Name */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Brand Name</Typography>
              <Divider sx={{ mb: 3 }} />
              <TextField
                fullWidth
                label="Brand Name"
                value={settings.brandName}
                onChange={(e) => onChange("brandName", e.target.value)}
                placeholder="Enter your brand name"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={onSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BrandingTab;
