import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [logoUrl, setLogoUrl] = useState("https://i.ibb.co/Cpx2BBt5");

  useEffect(() => {
    fetchWebsiteLogo();
  }, []);

  const fetchWebsiteLogo = async () => {
    try {
      const { data, error } = await supabase
        .from("website_settings")
        .select("logo_url")
        .single();

      if (data && data.logo_url) {
        setLogoUrl(data.logo_url);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left Side - Forgot Password Form */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          bgcolor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              {/* Logo */}
              <Box
                component="img"
                src={logoUrl}
              alt="EGIE Logo"
              sx={{
                width: 80,
                height: 80,
                objectFit: "contain",
                mb: 2,
                mx: "auto",
              }}
            />

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                color: "#fff",
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Reset Your Password
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: "#9e9e9e",
                mb: 3,
              }}
            >
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
          </Box>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset link has been sent to your email! Please check your inbox.
            </Alert>
          )}

          {/* Reset Password Form */}
          {!success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box component="form" onSubmit={handleResetPassword}>
              {/* Email Field */}
              <Typography
                variant="body2"
                sx={{ color: "#fff", mb: 1, fontSize: 14 }}
              >
                Email Address
              </Typography>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@egie.com"
                required
                disabled={loading}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fff",
                    borderRadius: 1,
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "2px solid #00E676",
                    },
                  },
                  "& input": {
                    color: "#000",
                  },
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: "#00E676",
                  color: "#000",
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: 1,
                  mb: 2,
                  "&:hover": {
                    bgcolor: "#00C853",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#004d2a",
                    color: "#666",
                  },
                }}
              >
                {loading ? "SENDING..." : "SEND RESET LINK"}
              </Button>

              {/* Back to Login Link */}
              <Link
                to="/auth"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: "#00E676",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                <ArrowBackIcon fontSize="small" />
                Back to Login
              </Link>
            </Box>
            </motion.div>
          )}

          {/* Success - Back to Login */}
          {success && (
            <Link
              to="/auth"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: "#00E676",
                textDecoration: "none",
                fontSize: "14px",
                marginTop: "16px",
              }}
            >
              <ArrowBackIcon fontSize="small" />
              Back to Login
            </Link>
          )}
        </Container>
      </Box>

      {/* Right Side - Image */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: "50%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src="https://i.ibb.co/yF04zrC9/vecteezy-computer-electronic-chip-with-processor-transistors-29336852.jpg"
          alt="Computer Chip"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>
    </Box>
  );
};

export default ForgotPassword;
