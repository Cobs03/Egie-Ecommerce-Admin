import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Palette as PaletteIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ContactMail as ContactMailIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { AdminLogService } from "../../services/AdminLogService";
import {
  BrandingTab,
  ColorsTab,
  ContactTab,
  AboutUsTab,
  TermsTab,
  PrivacyTab,
  PolicyDialog,
  ConfirmDialog,
} from "./components";
import dummyData from "./dummyData.json";

const WebsiteSettings = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.is_admin === true || profile?.role === 'admin';
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [originalSettings, setOriginalSettings] = useState(null); // Track original values
  const [settings, setSettings] = useState({
    brandName: "",
    logoUrl: "",
    authBackgroundUrl: "",
    primaryColor: "#22c55e",
    secondaryColor: "#2176ae",
    accentColor: "#ffe14d",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    showroomHours: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    twitterUrl: "",
    aboutUsTitle: "",
    aboutUsContent: "",
    footerText: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [authBackgroundFile, setAuthBackgroundFile] = useState(null);
  const [authBackgroundPreview, setAuthBackgroundPreview] = useState(null);
  const [termsItems, setTermsItems] = useState(dummyData.termsItems);
  const [privacyItems, setPrivacyItems] = useState(dummyData.privacyItems);
  
  // Dialog states
  const [policyDialog, setPolicyDialog] = useState({
    open: false,
    mode: 'add', // 'add' or 'edit'
    type: 'terms', // 'terms' or 'privacy'
    policy: { id: null, title: '', description: '' }
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '', // 'add', 'edit', 'delete', 'reset', 'save'
    policyType: '', // 'terms' or 'privacy'
    policy: null
  });

  useEffect(() => {
    fetchSettings();
    fetchTermsItems();
    fetchPrivacyItems();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("website_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const settingsData = {
          brandName: data.brand_name || "",
          logoUrl: data.logo_url || "",
          authBackgroundUrl: data.auth_background_url || "",
          primaryColor: data.primary_color || "#22c55e",
          secondaryColor: data.secondary_color || "#2176ae",
          accentColor: data.accent_color || "#ffe14d",
          contactEmail: data.contact_email || "",
          contactPhone: data.contact_phone || "",
          contactAddress: data.contact_address || "",
          showroomHours: data.showroom_hours || "",
          facebookUrl: data.facebook_url || "",
          instagramUrl: data.instagram_url || "",
          tiktokUrl: data.tiktok_url || "",
          twitterUrl: data.twitter_url || "",
          aboutUsTitle: data.about_us_title || "",
          aboutUsContent: data.about_us_content || "",
          footerText: data.footer_text || "",
        };
        setSettings(settingsData);
        setOriginalSettings(settingsData); // Store original for comparison
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  };

  const fetchTermsItems = async () => {
    try {
      const { data, error } = await supabase
        .from("website_policies")
        .select("*")
        .eq("type", "terms")
        .order("created_at", { ascending: true });

      if (error && error.code !== "PGRST116") throw error;

      setTermsItems(data || []);
    } catch (error) {
      console.error("Error fetching terms:", error);
      toast.error("Failed to load terms");
    }
  };

  const fetchPrivacyItems = async () => {
    try {
      const { data, error } = await supabase
        .from("website_policies")
        .select("*")
        .eq("type", "privacy")
        .order("created_at", { ascending: true });

      if (error && error.code !== "PGRST116") throw error;

      setPrivacyItems(data || []);
    } catch (error) {
      console.error("Error fetching privacy items:", error);
      toast.error("Failed to load privacy items");
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuthBackgroundChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAuthBackgroundFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAuthBackgroundPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return settings.logoUrl;

    try {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
      return settings.logoUrl;
    }
  };

  const uploadAuthBackground = async () => {
    if (!authBackgroundFile) return settings.authBackgroundUrl;

    try {
      const fileExt = authBackgroundFile.name.split(".").pop();
      const fileName = `auth-bg-${Date.now()}.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, authBackgroundFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading auth background:", error);
      toast.error("Failed to upload authentication background");
      return settings.authBackgroundUrl;
    }
  };

  const handleSaveClick = () => {
    setConfirmDialog({
      open: true,
      type: 'save',
      policyType: '',
      policy: null
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let logoUrl = settings.logoUrl;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      let authBackgroundUrl = settings.authBackgroundUrl;
      if (authBackgroundFile) {
        authBackgroundUrl = await uploadAuthBackground();
      }

      // Combine terms items into HTML string
      const termsHtml = termsItems.map(item => 
        `<section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">${item.title}</h2>
          <p class="mb-4">${item.description}</p>
        </section>`
      ).join('\n');

      // Combine privacy items into HTML string
      const privacyHtml = privacyItems.map(item => 
        `<section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">${item.title}</h2>
          <p class="mb-4">${item.description}</p>
        </section>`
      ).join('\n');

      const { error } = await supabase
        .from("website_settings")
        .upsert({
          id: 1,
          brand_name: settings.brandName,
          logo_url: logoUrl,
          auth_background_url: authBackgroundUrl,
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
          accent_color: settings.accentColor,
          contact_email: settings.contactEmail,
          contact_phone: settings.contactPhone,
          contact_address: settings.contactAddress,
          showroom_hours: settings.showroomHours,
          facebook_url: settings.facebookUrl,
          instagram_url: settings.instagramUrl,
          tiktok_url: settings.tiktokUrl,
          twitter_url: settings.twitterUrl,
          about_us_title: settings.aboutUsTitle,
          about_us_content: settings.aboutUsContent,
          footer_text: settings.footerText,
          terms_and_conditions: termsHtml || null,
          privacy_policy: privacyHtml || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // Create admin log for settings update
      if (user?.id && originalSettings) {
        const changedFields = [];
        const detailedChanges = {};
        
        // Check for file uploads
        if (logoFile) {
          changedFields.push('logo');
          detailedChanges.logo = { action: 'uploaded' };
        }
        if (authBackgroundFile) {
          changedFields.push('auth_background');
          detailedChanges.auth_background = { action: 'uploaded' };
        }
        
        // Check contact info changes
        if (originalSettings.contactEmail !== settings.contactEmail) {
          changedFields.push('contact_email');
          detailedChanges.contact_email = { 
            old: originalSettings.contactEmail, 
            new: settings.contactEmail 
          };
        }
        if (originalSettings.contactPhone !== settings.contactPhone) {
          changedFields.push('contact_phone');
          detailedChanges.contact_phone = { 
            old: originalSettings.contactPhone, 
            new: settings.contactPhone 
          };
        }
        if (originalSettings.contactAddress !== settings.contactAddress) {
          changedFields.push('contact_address');
          detailedChanges.contact_address = { 
            old: originalSettings.contactAddress, 
            new: settings.contactAddress 
          };
        }
        if (originalSettings.showroomHours !== settings.showroomHours) {
          changedFields.push('showroom_hours');
          detailedChanges.showroom_hours = { 
            old: originalSettings.showroomHours, 
            new: settings.showroomHours 
          };
        }
        
        // Check branding changes
        if (originalSettings.brandName !== settings.brandName) {
          changedFields.push('brand_name');
          detailedChanges.brand_name = { 
            old: originalSettings.brandName, 
            new: settings.brandName 
          };
        }
        
        // Check color changes
        if (originalSettings.primaryColor !== settings.primaryColor || 
            originalSettings.secondaryColor !== settings.secondaryColor || 
            originalSettings.accentColor !== settings.accentColor) {
          changedFields.push('colors');
          detailedChanges.colors = {
            primary: { old: originalSettings.primaryColor, new: settings.primaryColor },
            secondary: { old: originalSettings.secondaryColor, new: settings.secondaryColor },
            accent: { old: originalSettings.accentColor, new: settings.accentColor }
          };
        }
        
        // Check social media changes
        if (originalSettings.facebookUrl !== settings.facebookUrl ||
            originalSettings.instagramUrl !== settings.instagramUrl ||
            originalSettings.tiktokUrl !== settings.tiktokUrl ||
            originalSettings.twitterUrl !== settings.twitterUrl) {
          changedFields.push('social_media');
        }
        
        // Only log if there are actual changes
        if (changedFields.length > 0) {
          const changesText = ` (updated: ${changedFields.join(', ')})`;
          
          await AdminLogService.createLog({
            userId: user.id,
            actionType: 'website_settings_update',
            actionDescription: `Updated website settings${changesText}`,
            targetType: 'website_settings',
            targetId: '1',
            metadata: {
              changedFields,
              detailedChanges,
              brandName: settings.brandName,
            },
          });
        }
      }

      // Refetch to get latest data
      await fetchSettings();
      
      setLogoFile(null);
      setLogoPreview(null);
      setAuthBackgroundFile(null);
      setAuthBackgroundPreview(null);
      handleConfirmDialogClose();
      
      // Show success notification after dialog closes
      setSuccessMessage("Settings saved successfully! Changes are now live.");
      setShowSuccess(true);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSuccessMessage("Failed to save settings. Please try again.");
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleResetClick = () => {
    setConfirmDialog({
      open: true,
      type: 'reset',
      policyType: '',
      policy: null
    });
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await fetchSettings();
      await fetchTermsItems();
      await fetchPrivacyItems();
      setLogoFile(null);
      setLogoPreview(null);
      toast.success("Settings reset successfully!");
      handleConfirmDialogClose();
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error("Failed to reset settings");
    } finally {
      setLoading(false);
    }
  };

  // Policy dialog field change handler
  const handlePolicyFieldChange = (field, value) => {
    setPolicyDialog({
      ...policyDialog,
      policy: { ...policyDialog.policy, [field]: value }
    });
  };

  // Policy handlers
  const handleAddPolicy = (type) => {
    setPolicyDialog({
      open: true,
      mode: 'add',
      type: type,
      policy: { id: null, title: '', description: '' }
    });
  };

  const handleEditPolicy = (policy, type) => {
    setPolicyDialog({
      open: true,
      mode: 'edit',
      type: type,
      policy: { ...policy }
    });
  };

  const handleDeletePolicy = (policy, type) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      policyType: type,
      policy
    });
  };

  const handlePolicyDialogClose = () => {
    setPolicyDialog({
      open: false,
      mode: 'add',
      type: 'terms',
      policy: { id: null, title: '', description: '' }
    });
  };

  const handlePolicyDialogSave = () => {
    setConfirmDialog({
      open: true,
      type: policyDialog.mode,
      policyType: policyDialog.type,
      policy: policyDialog.policy
    });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      type: '',
      policyType: '',
      policy: null
    });
  };

  const handleConfirmAction = async () => {
    const { type, policyType, policy } = confirmDialog;
    // Handle reset and save actions
    if (type === 'reset') {
      await handleReset();
      return;
    }
    
    if (type === 'save') {
      await handleSave();
      return;
    }
    
    try {
      let updatedTermsItems = termsItems;
      let updatedPrivacyItems = privacyItems;

      if (type === 'add') {
        const newItem = {
          id: `${policyType}-${Date.now()}`,
          title: policy.title,
          description: policy.description,
          type: policyType,
          created_at: new Date().toISOString()
        };
        
        if (policyType === 'terms') {
          updatedTermsItems = [...termsItems, newItem];
          setTermsItems(updatedTermsItems);
        } else if (policyType === 'privacy') {
          updatedPrivacyItems = [...privacyItems, newItem];
          setPrivacyItems(updatedPrivacyItems);
        }
        
        toast.success("Item added successfully!");
      } else if (type === 'edit') {
        if (policyType === 'terms') {
          updatedTermsItems = termsItems.map(item => 
            item.id === policy.id 
              ? { ...item, title: policy.title, description: policy.description }
              : item
          );
          setTermsItems(updatedTermsItems);
        } else if (policyType === 'privacy') {
          updatedPrivacyItems = privacyItems.map(item => 
            item.id === policy.id 
              ? { ...item, title: policy.title, description: policy.description }
              : item
          );
          setPrivacyItems(updatedPrivacyItems);
        }
        
        toast.success("Item updated successfully!");
      } else if (type === 'delete') {
        if (policyType === 'terms') {
          updatedTermsItems = termsItems.filter(item => item.id !== policy.id);
          setTermsItems(updatedTermsItems);
        } else if (policyType === 'privacy') {
          updatedPrivacyItems = privacyItems.filter(item => item.id !== policy.id);
          setPrivacyItems(updatedPrivacyItems);
        }
        
        toast.success("Item deleted successfully!");
      }

      // Auto-save to database after any change
      const termsHtml = updatedTermsItems.map(item => 
        `<section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">${item.title}</h2>
          <p class="mb-4">${item.description}</p>
        </section>`
      ).join('\n');

      const privacyHtml = updatedPrivacyItems.map(item => 
        `<section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">${item.title}</h2>
          <p class="mb-4">${item.description}</p>
        </section>`
      ).join('\n');

      await supabase
        .from("website_settings")
        .upsert({
          id: 1,
          terms_and_conditions: termsHtml || null,
          privacy_policy: privacyHtml || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      handleConfirmDialogClose();
      handlePolicyDialogClose();
    } catch (error) {
      console.error("Error handling policy action:", error);
      toast.error("Failed to save changes");
    }
  };









  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb={3}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontFamily: "Bruno Ace SC" }}>
            WEBSITE SETTINGS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize your customer-facing website appearance and policies
          </Typography>
          {!isAdmin && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "info.lighter",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "info.main",
              }}
            >
              <Typography variant="body2" color="info.main" fontWeight={600}>
                ℹ️ Read-Only Mode: You can view these settings but only administrators can make changes.
              </Typography>
            </Box>
          )}
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Branding" icon={<ImageIcon />} iconPosition="start" />
          <Tab label="Colors" icon={<PaletteIcon />} iconPosition="start" />
          <Tab label="Contact" icon={<ContactMailIcon />} iconPosition="start" />
          <Tab label="About Us" icon={<InfoIcon />} iconPosition="start" />
          <Tab label="Terms" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Privacy" icon={<DescriptionIcon />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 0 && (
              <BrandingTab 
              settings={settings}
              logoPreview={logoPreview}
              authBackgroundPreview={authBackgroundPreview}
              onLogoChange={handleLogoChange}
              onAuthBackgroundChange={handleAuthBackgroundChange}
              onChange={handleChange}
              onReset={handleResetClick}
              onSave={handleSaveClick}
              loading={loading}
              readOnly={!isAdmin}
            />
          )}
          {activeTab === 2 && (
            <ContactTab 
              settings={settings}
              onChange={handleChange}
              onReset={handleResetClick}
              onSave={handleSaveClick}
              loading={loading}
              readOnly={!isAdmin}
            />
          )}
          {activeTab === 3 && (
            <AboutUsTab 
              settings={settings}
              onChange={handleChange}
              onReset={handleResetClick}
              onSave={handleSaveClick}
              loading={loading}
              readOnly={!isAdmin}
            />
          )}
          {activeTab === 4 && (
            <TermsTab 
              termsItems={termsItems}
              onAdd={handleAddPolicy}
              onEdit={handleEditPolicy}
              onDelete={handleDeletePolicy}
              readOnly={!isAdmin}
            />
          )}
          {activeTab === 5 && (
            <PrivacyTab 
              privacyItems={privacyItems}
              onAdd={handleAddPolicy}
              onEdit={handleEditPolicy}
              onDelete={handleDeletePolicy}
              readOnly={!isAdmin}
            />
          )}
          </motion.div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Policy Add/Edit Dialog */}
      <PolicyDialog 
        open={policyDialog.open}
        mode={policyDialog.mode}
        policy={policyDialog.policy}
        onClose={handlePolicyDialogClose}
        onSave={handlePolicyDialogSave}
        onChange={handlePolicyFieldChange}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        open={confirmDialog.open}
        type={confirmDialog.type}
        policy={confirmDialog.policy}
        onClose={handleConfirmDialogClose}
        onConfirm={handleConfirmAction}
      />

      {/* Success Notification Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WebsiteSettings;
