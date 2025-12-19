import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { supabase } from "../../lib/supabase";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long!");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left Side - Reset Password Form */}
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
          <Box sx={{ textAlign: "center", mb: 4 }}>
            {/* Logo */}
            <Box
              component="img"
              src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
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
              Set New Password
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: "#9e9e9e",
                mb: 3,
              }}
            >
              Enter your new password below.
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset successfully! Redirecting to login...
            </Alert>
          )}

          {/* Reset Password Form */}
          {!success && (
            <Box component="form" onSubmit={handleResetPassword}>
              {/* New Password Field */}
              <Typography
                variant="body2"
                sx={{ color: "#fff", mb: 1, fontSize: 14 }}
              >
                New Password
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#666" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
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

              {/* Confirm Password Field */}
              <Typography
                variant="body2"
                sx={{ color: "#fff", mb: 1, fontSize: 14 }}
              >
                Confirm Password
              </Typography>
              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: "#666" }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </Button>

              {/* Back to Login Link */}
              <Link
                to="/auth"
                style={{
                  display: "block",
                  textAlign: "center",
                  color: "#00E676",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                Back to Login
              </Link>
            </Box>
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

export default ResetPassword;
