# Popup Ads System - Setup Guide

## What You Need

Your popup ads system requires **2 things**:

### 1. **Database Table** ✅ 
Stores popup ad data (title, images, schedule, analytics)

### 2. **Storage Bucket** ✅
Stores popup images (uses existing `products` bucket)

---

## Setup Steps

### Step 1: Run the SQL Script

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open file: `database/CREATE_POPUP_ADS_SYSTEM.sql`
3. Copy all contents
4. Paste in SQL Editor
5. Click **"Run"**

This creates:
- ✅ `popup_ads` table
- ✅ RLS policies (admin can manage, public can view active ads)
- ✅ Analytics functions (`increment_popup_impression`, `increment_popup_click`)
- ✅ Indexes for performance

### Step 2: Verify Storage Bucket

Your images will be stored in: **`products` bucket** → **`popup-ads/`** folder

Check if `products` bucket exists:
1. Go to **Supabase Dashboard** → **Storage**
2. Look for `products` bucket
3. If it doesn't exist, create it (Public bucket, 5MB limit)

---

## How It Works

### Admin Side (You already have this!)

**File:** `src/view/Promotions/Promotion Components/PopupAdsTab.jsx`

Features:
- ✅ Create/Edit popup ads
- ✅ Upload multiple images (carousel support)
- ✅ Set display frequency (once per session, daily, every visit)
- ✅ Schedule start/end dates
- ✅ Choose pages to display on (home, products, cart, all)
- ✅ Target audience (all, new users, returning, logged in, guests)
- ✅ View analytics (impressions, clicks, CTR)
- ✅ Toggle active/inactive

**Service:** `src/services/PopupAdService.js`
- getAllPopupAds() - Admin view all
- getActivePopupAds(page) - Customer view active ads
- createPopupAd() - Create new popup
- updatePopupAd() - Edit existing
- deletePopupAd() - Remove popup
- toggleActive() - Enable/disable
- trackImpression() - Analytics
- trackClick() - Analytics
- uploadPopupImages() - Upload to storage

### Customer Side

**File:** `src/components/PopupAdModal.jsx` (Customer-facing)

Features:
- ✅ Auto-display based on frequency rules
- ✅ Multi-slide carousel (if multiple images)
- ✅ Respects delay settings
- ✅ Auto-close timer (optional)
- ✅ Click tracking
- ✅ Local storage to remember shown popups
- ✅ Smooth animations

---

## Database Schema

### `popup_ads` Table

```sql
Column                Type                 Description
------------------    -----------------    ---------------------------
id                    UUID                 Primary key
title                 VARCHAR(255)         Popup title
images                TEXT[]               Array of image URLs
link_url              TEXT                 Click destination (optional)
link_type             VARCHAR(20)          'external' | 'product' | 'category' | 'none'
display_frequency     VARCHAR(30)          'once_per_session' | 'once_per_day' | 'every_visit' | 'once_forever'
delay_seconds         INTEGER              Delay before showing (default: 2)
auto_close_seconds    INTEGER              Auto-close timer (null = manual)
show_on_pages         TEXT[]               ['home', 'products', 'cart', 'all']
target_audience       VARCHAR(20)          'all' | 'new_users' | 'returning_users' | 'logged_in' | 'guests'
start_date            TIMESTAMP            Schedule start (null = immediate)
end_date              TIMESTAMP            Schedule end (null = no expiry)
is_active             BOOLEAN              Enabled/disabled
impressions           INTEGER              View count
clicks                INTEGER              Click count
created_by            UUID                 Admin who created it
created_at            TIMESTAMP            Creation date
updated_at            TIMESTAMP            Last modified
```

### RLS Policies

**Admins (authenticated + role check):**
- ✅ View all popup ads
- ✅ Create popup ads
- ✅ Update popup ads
- ✅ Delete popup ads

**Public (anon + authenticated):**
- ✅ View active popup ads (within schedule)

### Analytics Functions

```sql
-- Increment view count
SELECT increment_popup_impression('popup-uuid-here');

-- Increment click count
SELECT increment_popup_click('popup-uuid-here');
```

---

## Usage Examples

### 1. Create Welcome Popup (Admin Panel)

```
Title: "Welcome! Get 20% Off Your First Order"
Images: Upload promo banner
Link URL: /products
Display Frequency: Once per session
Show On Pages: Home
Target Audience: New users
Active: Yes
```

### 2. Flash Sale Popup

```
Title: "⚡ Flash Sale! Limited Time Only"
Images: Upload sale banner  
Link URL: /products/sale
Display Frequency: Every visit
Delay: 5 seconds
Auto-close: 10 seconds
Show On Pages: All
Start Date: Dec 20, 2025 00:00
End Date: Dec 25, 2025 23:59
```

### 3. Multi-Slide Product Showcase

```
Title: "New Arrivals This Week"
Images: [product1.jpg, product2.jpg, product3.jpg]
Link URL: /products/new
Display Frequency: Once per day
Show On Pages: Home, Products
Auto-close: 15 seconds
```

---

## Display Frequency Rules

| Setting           | Behavior                                          | Storage Key                  |
|------------------|--------------------------------------------------|------------------------------|
| `once_per_session` | Show once per browser session                    | sessionStorage              |
| `once_per_day`     | Show once every 24 hours                         | localStorage (date checked) |
| `every_visit`      | Show every time user visits the page            | No storage                  |
| `once_forever`     | Show once, never again (until cache cleared)    | localStorage (permanent)    |

---

## Analytics Metrics

### Impressions
- Counted when popup is displayed
- Tracked via `increment_popup_impression()`

### Clicks
- Counted when user clicks the popup
- Tracked via `increment_popup_click()`

### CTR (Click-Through Rate)
- Formula: `(clicks / impressions) × 100%`
- Displayed in admin panel
- Example: 50 clicks / 1000 views = 5% CTR

---

## Testing Checklist

### Backend (Database)
- [ ] Run SQL script in Supabase
- [ ] Verify `popup_ads` table exists
- [ ] Check RLS policies are active
- [ ] Test analytics functions work

### Admin Panel
- [ ] Navigate to **Promotions** → **Pop-up Ads** tab
- [ ] Create a test popup ad
- [ ] Upload images (single or multiple)
- [ ] Set schedule (start/end dates)
- [ ] Toggle active/inactive
- [ ] Edit existing popup
- [ ] Delete popup
- [ ] View analytics

### Customer Site
- [ ] Popup appears after delay
- [ ] Respects display frequency (session/daily/every/forever)
- [ ] Multi-slide carousel works (if multiple images)
- [ ] Click tracking increments counter
- [ ] Auto-close timer works (if set)
- [ ] Schedule respected (only shows within date range)
- [ ] Different pages show correct popups

### Storage
- [ ] Images upload to `products/popup-ads/` folder
- [ ] Images are publicly accessible
- [ ] No 404 errors on image URLs

---

## Troubleshooting

### Popup not showing on customer site
1. Check `is_active = true` in database
2. Verify schedule dates (start_date ≤ now ≤ end_date)
3. Check `show_on_pages` includes current page
4. Clear browser localStorage/sessionStorage
5. Check browser console for errors

### Images not uploading
1. Verify `products` storage bucket exists
2. Check bucket is public
3. Verify file size < 5MB
4. Check allowed MIME types (jpg, png, webp, gif)

### Analytics not updating
1. Verify `increment_popup_impression` function exists
2. Check RPC function permissions
3. Look for errors in browser console
4. Test function manually in SQL Editor

### RLS permission errors
1. Verify user has `admin` or `super_admin` role
2. Check `profiles` table has correct role
3. Re-run RLS policies section of SQL script

---

## File Structure

```
Admin Panel (Egie-Ecommerce-Admin):
├── database/
│   └── CREATE_POPUP_ADS_SYSTEM.sql       ← Run this first!
├── src/
│   ├── services/
│   │   └── PopupAdService.js             ← Admin CRUD operations
│   └── view/
│       └── Promotions/
│           └── Promotion Components/
│               └── PopupAdsTab.jsx       ← Admin UI

Customer Site (Egie-Ecommerce):
├── src/
│   ├── services/
│   │   └── PopupAdService.js             ← Customer display logic
│   └── components/
│       └── PopupAdModal.jsx              ← Customer popup display
```

---

## Next Steps

1. **Run the SQL script** (5 minutes)
2. **Test admin panel** - Create a popup ad (5 minutes)
3. **Test customer site** - Verify popup displays (2 minutes)
4. **Create real popups** - Welcome message, sales, promotions
5. **Monitor analytics** - Track impressions and CTR

---

## Pro Tips

### Best Practices
- ✅ Use high-quality images (1200x800px recommended)
- ✅ Keep delay_seconds between 2-5 seconds (not annoying)
- ✅ Use auto_close_seconds to prevent blocking users
- ✅ Test "once_per_session" for most popups (less intrusive)
- ✅ Target new_users for welcome messages
- ✅ Schedule flash sales with start/end dates

### Avoid
- ❌ Showing popups immediately (use 2-3s delay)
- ❌ Using "every_visit" frequency (annoying!)
- ❌ Images over 2MB (slow loading)
- ❌ Popups without auto-close (blocking UX)
- ❌ Too many active popups at once

### A/B Testing Ideas
- Test different delay_seconds (2s vs 5s vs 10s)
- Compare CTR: Image-only vs Text+Image
- Test audiences: new_users vs returning_users
- Measure conversion: Home page vs Product page popups

---

**Need Help?** Check the browser console for error messages!

**Date:** December 19, 2025
