import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Container,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { supabase } from "../../lib/supabase";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin, first_name, last_name")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        setError("Error loading user profile. Please contact administrator.");
        setLoading(false);
        return;
      }

      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        setError("Access denied. This portal is for administrators only.");
        setLoading(false);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left Side - Login Form */}
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
              Power Up Your Build – Premium Parts.
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "#fff",
                fontWeight: 700,
                mb: 2,
              }}
            >
              Peak Performance.
            </Typography>

            {/* Welcome Message */}
            <Typography
              variant="body2"
              sx={{
                color: "#9e9e9e",
                mb: 3,
              }}
            >
              Welcome back! Please{" "}
              <Box component="span" sx={{ color: "#00E676", fontWeight: 600 }}>
                log in
              </Box>{" "}
              to your account to continue
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin}>
            {/* Email Field */}
            <Typography
              variant="body2"
              sx={{ color: "#fff", mb: 1, fontSize: 14 }}
            >
              Email
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

            {/* Password Field */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" sx={{ color: "#fff", fontSize: 14 }}>
                Password
              </Typography>
              <Link
                to="/forgot-password"
                style={{
                  color: "#00E676",
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                Forgot Password?
              </Link>
            </Box>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
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

            {/* Login Button */}
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
                "&:hover": {
                  bgcolor: "#00C853",
                },
                "&.Mui-disabled": {
                  bgcolor: "#004d2a",
                  color: "#666",
                },
              }}
            >
              {loading ? "SIGNING IN..." : "LOG IN"}
            </Button>

          </Box>
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

export default SignIn;
