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
  LinearProgress,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { PersonAdd, Phone, Email, Lock, CheckCircle, Visibility, VisibilityOff } from "@mui/icons-material";
import { supabase } from "../../../lib/supabase";

const AddUserDrawer = ({ open, onClose, onAddUser }) => {
  const fileInputRef = useRef();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    accessLevel: "",
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file");
        return;
      }
      
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    let label = '';
    let color = '';
    if (strength < 25) { label = 'Weak'; color = '#f44336'; }
    else if (strength < 50) { label = 'Fair'; color = '#ff9800'; }
    else if (strength < 75) { label = 'Good'; color = '#2196f3'; }
    else { label = 'Strong'; color = '#4caf50'; }

    return { strength: Math.min(strength, 100), label, color };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const uploadAvatar = async (userId, file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage (using 'profiles' bucket like ecommerce app)
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validate email format
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Validate password strength (at least 8 characters)
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        setLoading(false);
        return;
      }

      // Convert access level to lowercase role
      const roleMap = {
        'Admin': 'admin',
        'Manager': 'manager',
        'Employee': 'employee',
      };
      const role = roleMap[formData.accessLevel] || 'customer';

      // Create user with Supabase Auth
      // NOTE: Email confirmation is still required by default (good for security)
      // Employee will receive confirmation email but profile is created immediately
      // You can manually confirm them via SQL or let them confirm via email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: role,
          },
          emailRedirectTo: window.location.origin,
        }
      });

      if (authError) {
        // Handle user-friendly error messages
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          throw new Error('This email address is already registered in the system.');
        }
        throw authError;
      }

      const userId = authData.user?.id;

      if (userId) {
        // Upload avatar if selected
        let avatarUrl = null;
        if (selectedFile) {
          avatarUrl = await uploadAvatar(userId, selectedFile);
        }

        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to update the profile, if it doesn't exist, insert it
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone_number: formData.phoneNumber || null,
              avatar_url: avatarUrl,
              role: role,
              is_active: true,
              status: 'active',
            });

          if (insertError) {
            console.error('Error inserting profile:', insertError);
            // Handle user-friendly error messages
            if (insertError.code === '23505' || insertError.message.includes('duplicate key') || insertError.message.includes('profiles_email_key')) {
              throw new Error('This email address is already registered in the system.');
            }
            throw new Error('Failed to create user profile. Please try again.');
          }
        } else {
          // Profile exists, update it
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone_number: formData.phoneNumber || null,
              avatar_url: avatarUrl,
              role: role,
            })
            .eq('id', userId);

          if (updateError) {
            console.error('Error updating profile:', updateError);
          }
        }
      }
      // Show success message
      setSuccess(true);

      // Wait a moment for user to see success message
      setTimeout(() => {
        // Call parent callback to refresh list
        onAddUser();
        
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phoneNumber: "",
          accessLevel: "",
        });
        setSelectedImage(null);
        setSelectedFile(null);
        setSuccess(false);
        
        // Close drawer
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error creating user:', err);
      // Display user-friendly error message
      let errorMessage = err.message || 'Failed to create user. Please try again.';
      
      // Handle any remaining technical errors with friendly messages
      if (errorMessage.includes('duplicate key') || errorMessage.includes('already exists')) {
        errorMessage = 'This email address is already registered in the system.';
      } else if (errorMessage.includes('profiles_email_key')) {
        errorMessage = 'This email address is already registered in the system.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    formData.firstName && 
    formData.lastName && 
    formData.email && 
    formData.password && 
    formData.accessLevel &&
    validateEmail(formData.email) &&
    formData.password.length >= 8;

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

      {success && (
        <Alert 
          severity="success" 
          icon={<CheckCircle />}
          sx={{ mb: 2 }}
        >
          Employee added successfully!
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
          label="First Name"
          variant="outlined"
          size="small"
          value={formData.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          required
        />
        
        <TextField
          fullWidth
          label="Last Name"
          variant="outlined"
          size="small"
          value={formData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          required
        />

        <TextField
          fullWidth
          label="Email Address"
          variant="outlined"
          size="small"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          error={formData.email && !validateEmail(formData.email)}
          helperText={formData.email && !validateEmail(formData.email) ? "Invalid email format" : ""}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Phone Number"
          variant="outlined"
          size="small"
          placeholder="+63 9XX XXX XXXX"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box>
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            size="small"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            required
            helperText={formData.password ? `Password strength: ${passwordStrength.label}` : "Minimum 8 characters"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {formData.password && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={passwordStrength.strength}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: passwordStrength.color,
                  },
                }}
              />
            </Box>
          )}
        </Box>

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