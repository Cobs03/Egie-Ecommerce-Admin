import React from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Button,
  InputAdornment,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { SiTiktok } from "react-icons/si";

const ContactTab = ({ settings, onChange, onReset, onSave, loading }) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Contact Information
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage your business contact details displayed on the website
      </Typography>

      <Grid container spacing={3}>
        {/* Email */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact Email"
            value={settings.contactEmail || ""}
            onChange={(e) => onChange("contactEmail", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            helperText="Email shown in footer and contact pages"
          />
        </Grid>

        {/* Phone */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact Phone"
            value={settings.contactPhone || ""}
            onChange={(e) => onChange("contactPhone", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
            }}
            helperText="Phone number shown in footer"
          />
        </Grid>

        {/* Address */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Showroom Address"
            value={settings.contactAddress || ""}
            onChange={(e) => onChange("contactAddress", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationIcon color="action" />
                </InputAdornment>
              ),
            }}
            helperText="Physical store address"
          />
        </Grid>

        {/* Business Hours */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Business Hours"
            value={settings.showroomHours || ""}
            onChange={(e) => onChange("showroomHours", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon color="action" />
                </InputAdornment>
              ),
            }}
            helperText="e.g., Mon-Sunday: 8:00 AM - 5:30 PM"
          />
        </Grid>

        {/* Social Media Section */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom mt={2}>
            Social Media Links
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Add your social media profile URLs
          </Typography>
        </Grid>

        {/* Facebook */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Facebook URL"
            value={settings.facebookUrl || ""}
            onChange={(e) => onChange("facebookUrl", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FacebookIcon color="action" />
                </InputAdornment>
              ),
            }}
            placeholder="https://facebook.com/yourpage"
          />
        </Grid>

        {/* Instagram */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Instagram URL"
            value={settings.instagramUrl || ""}
            onChange={(e) => onChange("instagramUrl", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InstagramIcon color="action" />
                </InputAdornment>
              ),
            }}
            placeholder="https://instagram.com/yourprofile"
          />
        </Grid>

        {/* TikTok */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="TikTok URL (Optional)"
            value={settings.tiktokUrl || ""}
            onChange={(e) => onChange("tiktokUrl", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SiTiktok style={{ color: "#9e9e9e" }} />
                </InputAdornment>
              ),
            }}
            placeholder="https://tiktok.com/@yourprofile"
          />
        </Grid>

        {/* Twitter */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Twitter/X URL (Optional)"
            value={settings.twitterUrl || ""}
            onChange={(e) => onChange("twitterUrl", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TwitterIcon color="action" />
                </InputAdornment>
              ),
            }}
            placeholder="https://twitter.com/yourhandle"
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

export default ContactTab;
