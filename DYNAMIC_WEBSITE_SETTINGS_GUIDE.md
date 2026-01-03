# Dynamic Website Settings - Complete Guide

## ✅ What's Been Implemented

### Admin Panel - Website Settings Tab
Now includes **6 tabs** for easy content management:

1. **Branding** - Logo & website name
2. **Colors** - Theme colors (primary, secondary, accent)  
3. **Contact** - ⭐ NEW: Email, phone, address, business hours, social media  
4. **About Us** - ⭐ NEW: About page content & footer text  
5. **Terms** - Terms & Conditions management  
6. **Privacy** - Privacy Policy management  

### Database Updates
New columns added to `website_settings` table:
- `contact_email` - Support email
- `contact_phone` - Contact number
- `contact_address` - Physical store location
- `showroom_hours` - Business operating hours
- `facebook_url` - Facebook page link
- `instagram_url` - Instagram profile link
- `tiktok_url` - TikTok profile link (optional)
- `twitter_url` - Twitter/X profile link (optional)
- `about_us_title` - About page heading
- `about_us_content` - About page description
- `footer_text` - Copyright text (e.g., "All rights reserved.")

### Ecommerce Site Updates
**✅ Footer Component** - Now dynamically loads:
- Contact email (was: `support@[yourstorename].com`)
- Contact phone (was: `(123) 456-7890`)
- Social media links (Facebook, Instagram)
- Brand name in copyright
- Footer text
- Current year automatically

---

## 🚀 How to Use (Admin Guide)

### Step 1: Run Database Migration
Execute this SQL file **once** in Supabase SQL Editor:
\`\`\`
File: Egie-Ecommerce-Admin/database/UPDATE_WEBSITE_SETTINGS_ADD_CONTACT.sql
\`\`\`

This adds all new columns to your database.

### Step 2: Update Settings in Admin Panel

1. **Login to Admin Panel**
2. **Go to "Website" tab** in sidebar
3. **Select the tab** you want to update:

#### Contact Tab:
- Enter your real email: `yourbusiness@gmail.com`
- Enter your phone: `+63 999 123 4567`
- Enter your address: `123 Main St, Manila, Philippines`
- Enter hours: `Mon-Sat: 9:00 AM - 6:00 PM`
- Paste social media URLs:
  - Facebook: `https://facebook.com/yourbusiness`
  - Instagram: `https://instagram.com/yourbusiness`
  - TikTok: (optional)
  - Twitter: (optional)

#### About Us Tab:
- Title: `About Our Gaming Store`
- Content: Write your company story, mission, what makes you special
- Footer Text: `All rights reserved.` or custom message

4. **Click "Save Changes"** button
5. **Check ecommerce site** - changes appear instantly!

---

## 📋 What Still Needs to Be Updated

These ecommerce pages still have **hardcoded content** that should load from database:

### 🔄 To Update Next:

1. **Header Banner** (Green bar at top)
   - Shows: Hours, Address, Phone, "Contact Us" link
   - Currently hardcoded
   - Should load from `settings.showroomHours`, `settings.contactAddress`, etc.

2. **Contact Us Page** (`/contactus`)
   - Contact form page
   - Should display dynamic email, phone, address
   - Currently may have hardcoded placeholders

3. **About Us Page** (`/about`)
   - Currently hardcoded or missing
   - Should load from `settings.aboutUsTitle` and `settings.aboutUsContent`

4. **Terms Page** (`/terms`)
   - Currently has static content
   - Should load from `website_policies` table where `type='terms'`

5. **Privacy Policy Page** (`/privacy`)
   - Currently has static content  
   - Should load from `website_policies` table where `type='privacy'`

6. **404 Error Page**
   - Footer shows "Egie Gameshop" (hardcoded)
   - Should load from `settings.brandName`

7. **Payment Failed Page**
   - Shows hardcoded support email
   - Should load from `settings.contactEmail`

---

## 💻 Technical Implementation

### Files Created/Modified:

**Admin Panel:**
- ✅ `ContactTab.jsx` - New contact info form
- ✅ `AboutUsTab.jsx` - New about us form
- ✅ `WebsiteSettings.jsx` - Updated to include new tabs
- ✅ `UPDATE_WEBSITE_SETTINGS_ADD_CONTACT.sql` - Database migration

**Ecommerce Site:**
- ✅ `useWebsiteSettings.js` - New custom hook to fetch settings
- ✅ `Footer.jsx` - Updated to use dynamic settings

**To Be Updated:**
- ⏳ Header banner component
- ⏳ Contact Us page
- ⏳ About Us page  
- ⏳ Terms page
- ⏳ Privacy page
- ⏳ 404 page
- ⏳ Payment pages

---

## 🎯 Quick Start for Next Developer

### To Update Any Ecommerce Page:

1. **Import the hook:**
\`\`\`jsx
import { useWebsiteSettings } from '../../hooks/useWebsiteSettings';
\`\`\`

2. **Use in component:**
\`\`\`jsx
const YourComponent = () => {
  const { settings, loading } = useWebsiteSettings();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Email: {settings?.contactEmail}</p>
      <p>Phone: {settings?.contactPhone}</p>
      <p>Hours: {settings?.showroomHours}</p>
    </div>
  );
};
\`\`\`

3. **Available settings fields:**
\`\`\`javascript
settings.brandName         // "EGIE Gameshop"
settings.contactEmail      // "support@egiegameshop.com"
settings.contactPhone      // "(123) 456-7890"
settings.contactAddress    // "1234 Street Address..."
settings.showroomHours     // "Mon-Sunday: 8:00 AM - 5:30 PM"
settings.facebookUrl       // "https://facebook.com/..."
settings.instagramUrl      // "https://instagram.com/..."
settings.tiktokUrl         // "" (optional)
settings.twitterUrl        // "" (optional)
settings.aboutUsTitle      // "About Us"
settings.aboutUsContent    // "Welcome to our gaming store!"
settings.footerText        // "All rights reserved."
settings.logoUrl           // URL to uploaded logo
settings.primaryColor      // "#22c55e"
settings.secondaryColor    // "#2176ae"
settings.accentColor       // "#ffe14d"
\`\`\`

---

## ✨ Benefits

**For Business Owners:**
- ✅ Change contact info anytime (no developer needed)
- ✅ Update social media links instantly
- ✅ Modify about us content easily
- ✅ Manage terms & privacy policies
- ✅ Consistent branding across site

**For Developers:**
- ✅ No more hardcoded strings to find/replace
- ✅ Centralized settings management
- ✅ Easy to add more configurable fields
- ✅ Clean, maintainable code

---

## 🐛 Troubleshooting

**Settings not showing on ecommerce site?**
- Run the SQL migration script first
- Check if `website_settings` table has data
- Hard refresh browser (Ctrl+Shift+R)
- Check console for errors

**Can't save in admin panel?**
- Verify you're logged in as admin
- Check Supabase connection
- Ensure all required fields filled
- Check Network tab for failed requests

**Old email still showing?**
- Clear browser cache
- Check if component is using `useWebsiteSettings` hook
- Verify database has new column values
- Refresh page completely

---

## 📞 Current Status

### ✅ Completed:
- Database schema updated
- Admin panel with 6 tabs
- Footer using dynamic settings
- Contact info management
- Social media links management
- About Us content management

### ⏳ In Progress:
- Updating remaining ecommerce pages
- Terms/Privacy pages loading from database
- Header banner using dynamic content

### 🎯 Next Steps:
1. Update header banner component
2. Update Contact Us page
3. Update About Us page
4. Update Terms page to load from database
5. Update Privacy page to load from database
6. Update 404 page
7. Update payment-related pages

---

**Date:** January 3, 2026  
**Status:** Core functionality complete, additional pages need updates  
**Priority:** Medium - Footer working, other pages can be updated gradually
