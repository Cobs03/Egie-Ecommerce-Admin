import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  TextField,
  Alert,
  Button,
} from "@mui/material";
import {
  Palette as PaletteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

const ColorsTab = ({ settings, onChange, onReset, onSave, loading }) => {
  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PaletteIcon color="primary" />
            <Typography variant="h6">Color Scheme</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" mb={1}>Primary Color</Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: settings.primaryColor,
                      borderRadius: 2,
                      border: "2px solid #e0e0e0",
                      cursor: "pointer",
                    }}
                    component="label"
                  >
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => onChange("primaryColor", e.target.value)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                  </Box>
                  <TextField
                    value={settings.primaryColor}
                    onChange={(e) => onChange("primaryColor", e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Used for buttons, links, and primary actions
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" mb={1}>Secondary Color</Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: settings.secondaryColor,
                      borderRadius: 2,
                      border: "2px solid #e0e0e0",
                      cursor: "pointer",
                    }}
                    component="label"
                  >
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => onChange("secondaryColor", e.target.value)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                  </Box>
                  <TextField
                    value={settings.secondaryColor}
                    onChange={(e) => onChange("secondaryColor", e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Used for headers and secondary elements
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" mb={1}>Accent Color</Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: settings.accentColor,
                      borderRadius: 2,
                      border: "2px solid #e0e0e0",
                      cursor: "pointer",
                    }}
                    component="label"
                  >
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => onChange("accentColor", e.target.value)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                  </Box>
                  <TextField
                    value={settings.accentColor}
                    onChange={(e) => onChange("accentColor", e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Used for highlights and special elements
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            Color changes will be reflected across the customer website
          </Alert>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default ColorsTab;
