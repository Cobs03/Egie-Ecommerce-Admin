# 🎨 Website Settings Page - Setup Guide

## Overview

A new admin page has been created to allow administrators to customize the customer-facing website.

---

## 🎯 Features

### 1. **Branding**
- Upload custom logo (200x200px or larger recommended)
- Set brand name (default: "EGIE E-Commerce")
- Logo stored in Supabase storage

### 2. **Colors**
- Primary Color (default: #22c55e - green)
- Secondary Color (default: #2176ae - blue)
- Accent Color (default: #ffe14d - yellow)
- Live color picker with hex code input

### 3. **Terms and Conditions**
- Card-based CRUD system for terms items
- Each item has a title and description
- Add, edit, and delete individual terms sections
- Confirmation dialogs for all actions
- Empty state with helpful message

### 4. **Privacy Policy**
- Card-based CRUD system for privacy items
- Each item has a title and description
- Add, edit, and delete individual privacy sections
- Confirmation dialogs for all actions
- Empty state with helpful message

---

## 📦 Installation Steps

### Step 1: Run Database Migration

Execute the SQL file in your Supabase dashboard:

```sql
-- File: database/CREATE_WEBSITE_SETTINGS.sql
```

This creates:
- `website_settings` table
- RLS policies (admin read/write, public read)
- Auto-update timestamp trigger
- Default settings row

### Step 2: Access the Page

Navigate to: **`/website-settings`**

Or click **"Website"** in the admin sidebar (bottom of navigation)

---

## 🗄️ Database Schema

### website_settings Table
```sql
CREATE TABLE website_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  brand_name TEXT DEFAULT 'EGIE E-Commerce',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#22c55e',
  secondary_color TEXT DEFAULT '#2176ae',
  accent_color TEXT DEFAULT '#ffe14d',
  terms_and_conditions TEXT,  -- Legacy, not used by new UI
  privacy_policy TEXT,          -- Legacy, not used by new UI
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  CONSTRAINT single_row_constraint CHECK (id = 1)
);
```

**Note:** Only 1 row allowed (enforced by constraint)

### website_policies Table
```sql
CREATE TABLE website_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('terms', 'privacy')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Type Values:**
- `'terms'` - Terms and Conditions items
- `'privacy'` - Privacy Policy items

**Note:** An index is created on the `type` column for better query performance

---

## 🔐 Permissions

### Admin/Manager:
✅ Read settings  
✅ Update all settings  
✅ Upload logos

### Public (Customer Website):
✅ Read settings (to display branding/policies)  
❌ Cannot modify

---

## 🎨 How to Use

### Upload Logo:
1. Click "Upload Logo" button or drop zone
2. Select PNG, JPG, or SVG file
3. Preview appears immediately
4. Click "Save Changes" to finalize

### Change Colors:
1. Go to "Colors" tab
2. Click colored box to open color picker
3. Or enter hex code manually (#RRGGBB format)
4. Click "Save Changes"

### Manage Terms and Conditions:
1. Go to "Terms and Conditions" tab
2. View all terms items as cards
3. **Add New Item:**
   - Click "Add Terms Item" button
   - Enter title and description
   - Click "Add" then confirm
4. **Edit Item:**
   - Click "Edit" button on card
   - Modify title and/or description
   - Click "Save" then confirm
5. **Delete Item:**
   - Click "Delete" button on card
   - Confirm deletion (permanent)

### Manage Privacy Policy:
1. Go to "Privacy Policy" tab
2. View all privacy items as cards
3. **Add New Item:**
   - Click "Add Privacy Item" button
   - Enter title and description
   - Click "Add" then confirm
4. **Edit Item:**
   - Click "Edit" button on card
   - Modify title and/or description
   - Click "Save" then confirm
5. **Delete Item:**
   - Click "Delete" button on card
   - Confirm deletion (permanent)

**Tips:**
- Organize terms/privacy into logical sections (e.g., "Data Collection", "User Rights", "Cookies")
- Keep each card focused on one topic for readability
- Use descriptive titles for easy navigation

---

## 🔄 Integrating with Customer Website

To use these settings in your customer-facing app:

```javascript
// Fetch branding and color settings
const { data: settings } = await supabase
  .from('website_settings')
  .select('*')
  .eq('id', 1)
  .single();

// Apply branding
document.documentElement.style.setProperty('--primary-color', settings.primary_color);
document.documentElement.style.setProperty('--secondary-color', settings.secondary_color);
document.documentElement.style.setProperty('--accent-color', settings.accent_color);
document.title = settings.brand_name;

// Display logo
<img src={settings.logo_url} alt={settings.brand_name} />

// Fetch Terms and Conditions items
const { data: termsItems } = await supabase
  .from('website_policies')
  .select('*')
  .eq('type', 'terms')
  .order('created_at', { ascending: true });

// Display terms
{termsItems.map(item => (
  <div key={item.id}>
    <h3>{item.title}</h3>
    <p>{item.description}</p>
  </div>
))}

// Fetch Privacy Policy items
const { data: privacyItems } = await supabase
  .from('website_policies')
  .select('*')
  .eq('type', 'privacy')
  .order('created_at', { ascending: true });

// Display privacy
{privacyItems.map(item => (
  <div key={item.id}>
    <h3>{item.title}</h3>
    <p>{item.description}</p>
  </div>
))}
```

---

## 📁 Files Created

### Components:
- `src/view/WebsiteSettings/WebsiteSettings.jsx` - Main page

### Database:
- `database/CREATE_WEBSITE_SETTINGS.sql` - Table setup

### Routes:
- Updated: `src/view/Components/Navbar.jsx`
  - Added import
  - Added route
  - Added sidebar menu item

---

## 🎯 Default Values

When table is created, defaults are:

```javascript
{
  brand_name: "EGIE E-Commerce",
  logo_url: null,
  primary_color: "#22c55e",  // Green
  secondary_color: "#2176ae", // Blue
  accent_color: "#ffe14d",    // Yellow
  terms_and_conditions: "",
  privacy_policy: "",
  return_policy: "",
  shipping_policy: ""
}
```

---

## ✨ Future Enhancements (Optional)

1. **Rich Text Editor** - Replace plain text with WYSIWYG editor
2. **More Colors** - Add background, text, border colors
3. **Typography** - Custom font selection
4. **Footer Settings** - Copyright text, social links
5. **SEO Settings** - Meta tags, descriptions
6. **Email Templates** - Customize transactional emails
7. **Preview Mode** - Live preview of customer site

---

## 🐛 Troubleshooting

### Logo not uploading?
- Check Supabase storage bucket exists: `product-images`
- Verify RLS policies allow authenticated users to upload
- Check file size (max 5MB recommended)

### Colors not saving?
- Ensure hex format: `#RRGGBB`
- Check admin permissions in `profiles` table

### Policies not appearing?
- Verify RLS policies allow public read access
- Check table has exactly 1 row (id=1)

---

## 📊 Page Structure

```
WebsiteSettings/
├── Tabs
│   ├── Branding (Logo + Brand Name)
│   ├── Colors (Color Scheme)
│   └── Policies (Terms, Privacy, Return, Shipping)
├── Header (Title + Save/Reset buttons)
└── Toast Notifications (Success/Error feedback)
```

---

**Status:** ✅ **COMPLETE** - Website Settings page is ready to use!
