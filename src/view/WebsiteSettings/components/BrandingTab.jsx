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
  Alert,
} from "@mui/material";
import {
  Image as ImageIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  SmartToy as SmartToyIcon,
} from "@mui/icons-material";

const BrandingTab = ({ settings, logoPreview, authBackgroundPreview, aiLogoPreview, onLogoChange, onAuthBackgroundChange, onAILogoChange, onChange, onReset, onSave, loading }) => {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Logo Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ImageIcon color="primary" />
                <Typography variant="h6">Website Logo</Typography>
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

        {/* Auth Background Image */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ImageIcon color="secondary" />
                <Typography variant="h6">Authentication Background</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Background image for all authentication pages (Admin & Ecommerce sign-in/sign-up)
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                <Box
                  sx={{
                    width: 200,
                    height: 120,
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "grey.100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed",
                    borderColor: "grey.300",
                  }}
                >
                  {(authBackgroundPreview || settings.authBackgroundUrl) ? (
                    <img
                      src={authBackgroundPreview || settings.authBackgroundUrl}
                      alt="Auth Background"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageIcon sx={{ fontSize: 60, color: "grey.400" }} />
                  )}
                </Box>

                <Box>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="auth-background-upload"
                    type="file"
                    onChange={onAuthBackgroundChange}
                  />
                  <label htmlFor="auth-background-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                    >
                      Upload Background
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Background for admin sign-in page (1920x1080px recommended)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Assistant Branding */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <SmartToyIcon color="secondary" />
                <Typography variant="h6">AI Shopping Assistant</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Customize how your AI assistant appears to customers
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* AI Logo */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      AI Assistant Logo
                    </Typography>
                    <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                      <Avatar
                        src={aiLogoPreview || settings.aiLogoUrl}
                        sx={{ width: 80, height: 80 }}
                        variant="rounded"
                      >
                        {!aiLogoPreview && !settings.aiLogoUrl && <SmartToyIcon sx={{ fontSize: 40 }} />}
                      </Avatar>

                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: "none" }}
                          id="ai-logo-upload"
                          type="file"
                          onChange={onAILogoChange}
                        />
                        <label htmlFor="ai-logo-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            size="small"
                          >
                            Upload AI Logo
                          </Button>
                        </label>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Appears in chat interface (256x256px recommended)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                {/* AI Name */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      AI Assistant Name
                    </Typography>
                    <TextField
                      fullWidth
                      label="AI Name"
                      value={settings.aiName || ""}
                      onChange={(e) => onChange("aiName", e.target.value)}
                      placeholder="e.g., TechBot, ShopAssistant, etc."
                      helperText="Custom name for your AI shopping assistant"
                    />
                  </Box>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                This customizes how your AI assistant appears in the chat box on your website
              </Alert>
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
