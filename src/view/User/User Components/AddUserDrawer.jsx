import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Drawer,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { PersonAdd } from "@mui/icons-material";
import { supabase } from "../../../lib/supabase";

const AddUserDrawer = ({ open, onClose, onAddUser }) => {
  const fileInputRef = useRef();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    accessLevel: "",
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert access level to lowercase role
      const roleMap = {
        'Admin': 'admin',
        'Manager': 'manager',
        'Employee': 'employee',
      };
      const role = roleMap[formData.accessLevel] || 'customer';

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role, // This will be read by the trigger
          },
          emailRedirectTo: window.location.origin,
        }
      });

      if (authError) throw authError;

      console.log('User created:', authData);

      // Call parent callback to refresh list
      onAddUser();
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        accessLevel: "",
      });
      setSelectedImage(null);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    formData.fullName && 
    formData.email && 
    formData.password && 
    formData.accessLevel;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 400, p: 3, bgcolor: "#f5f5f5" } }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonAdd />
          <Typography variant="h6" fontWeight={700}>
            Add New User
          </Typography>
        </Stack>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Profile Picture
          </Typography>
          <Box position="relative" display="inline-block">
            <Avatar
              src={selectedImage}
              sx={{
                width: 100,
                height: 100,
                border: "2px dashed #ccc",
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {!selectedImage && <AddIcon />}
            </Avatar>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                bottom: -8,
                right: -8,
                bgcolor: "white",
                boxShadow: 1,
                "&:hover": { bgcolor: "white" },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <AddPhotoAlternateIcon fontSize="small" color="primary" />
            </IconButton>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Full Name"
          variant="outlined"
          size="small"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
        />
        <TextField
          fullWidth
          label="Email Address"
          variant="outlined"
          size="small"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          size="small"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
        />

        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Access Level
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={formData.accessLevel}
            onChange={(e) => handleInputChange("accessLevel", e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="" disabled>
              Select Access Level
            </option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </TextField>
        </Box>

        <Button
          variant="contained"
          fullWidth
          disabled={!isFormValid || loading}
          onClick={handleSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{
            bgcolor: "#000",
            color: "#fff",
            fontWeight: 700,
            "&:hover": { bgcolor: "#333" },
            "&.Mui-disabled": {
              bgcolor: "#ccc",
              color: "#666",
            },
          }}
        >
          {loading ? 'Adding User...' : 'Add User'}
        </Button>
      </Stack>
    </Drawer>
  );
};

export default AddUserDrawer;