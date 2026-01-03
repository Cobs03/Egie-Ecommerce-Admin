import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import {
  Palette as PaletteIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import {
  BrandingTab,
  ColorsTab,
  TermsTab,
  PrivacyTab,
  PolicyDialog,
  ConfirmDialog,
} from "./components";
import dummyData from "./dummyData.json";

const WebsiteSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    brandName: "",
    logoUrl: "",
    primaryColor: "#22c55e",
    secondaryColor: "#2176ae",
    accentColor: "#ffe14d",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
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
        setSettings({
          brandName: data.brand_name || "",
          logoUrl: data.logo_url || "",
          primaryColor: data.primary_color || "#22c55e",
          secondaryColor: data.secondary_color || "#2176ae",
          accentColor: data.accent_color || "#ffe14d",
        });
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

  const uploadLogo = async () => {
    if (!logoFile) return settings.logoUrl;

    try {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
      return settings.logoUrl;
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

      const { error } = await supabase
        .from("website_settings")
        .upsert({
          id: 1,
          brand_name: settings.brandName,
          logo_url: logoUrl,
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
          accent_color: settings.accentColor,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSettings({ ...settings, logoUrl });
      setLogoFile(null);
      setLogoPreview(null);
      toast.success("Settings saved successfully!");
      handleConfirmDialogClose();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
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
    
    console.log('Confirm action triggered:', { type, policyType, policy });
    
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
      if (type === 'add') {
        console.log('Adding item locally (dummy mode)');
        
        const newItem = {
          id: `${policyType}-${Date.now()}`,
          title: policy.title,
          description: policy.description,
          type: policyType,
          created_at: new Date().toISOString()
        };
        
        if (policyType === 'terms') {
          setTermsItems([...termsItems, newItem]);
        } else if (policyType === 'privacy') {
          setPrivacyItems([...privacyItems, newItem]);
        }
        
        toast.success("Item added successfully!");
      } else if (type === 'edit') {
        console.log('Editing item locally (dummy mode)');
        
        if (policyType === 'terms') {
          setTermsItems(termsItems.map(item => 
            item.id === policy.id 
              ? { ...item, title: policy.title, description: policy.description }
              : item
          ));
        } else if (policyType === 'privacy') {
          setPrivacyItems(privacyItems.map(item => 
            item.id === policy.id 
              ? { ...item, title: policy.title, description: policy.description }
              : item
          ));
        }
        
        toast.success("Item updated successfully!");
      } else if (type === 'delete') {
        console.log('Deleting item locally (dummy mode)');
        
        if (policyType === 'terms') {
          setTermsItems(termsItems.filter(item => item.id !== policy.id));
        } else if (policyType === 'privacy') {
          setPrivacyItems(privacyItems.filter(item => item.id !== policy.id));
        }
        
        toast.success("Item deleted successfully!");
      }
      
      handleConfirmDialogClose();
      handlePolicyDialogClose();
    } catch (error) {
      console.error(`Error ${type}ing item:`, error);
      toast.error(`Failed to ${type} item: ${error.message}`);
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
        >
          <Tab label="Branding" icon={<ImageIcon />} iconPosition="start" />
          <Tab label="Colors" icon={<PaletteIcon />} iconPosition="start" />
          <Tab label="Terms and Conditions" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Privacy Policy" icon={<DescriptionIcon />} iconPosition="start" />
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
              onLogoChange={handleLogoChange}
              onChange={handleChange}
              onReset={handleResetClick}
              onSave={handleSaveClick}
              loading={loading}
            />
          )}
          {activeTab === 1 && (
            <ColorsTab 
              settings={settings}
              onChange={handleChange}
              onReset={handleResetClick}
              onSave={handleSaveClick}
              loading={loading}
            />
          )}
          {activeTab === 2 && (
            <TermsTab 
              termsItems={termsItems}
              onAdd={handleAddPolicy}
              onEdit={handleEditPolicy}
              onDelete={handleDeletePolicy}
            />
          )}
          {activeTab === 3 && (
            <PrivacyTab 
              privacyItems={privacyItems}
              onAdd={handleAddPolicy}
              onEdit={handleEditPolicy}
              onDelete={handleDeletePolicy}
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
    </Box>
  );
};

export default WebsiteSettings;
