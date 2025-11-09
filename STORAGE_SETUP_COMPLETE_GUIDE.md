# 🪣 Complete Supabase Storage Setup Guide

## 🚨 Problem You're Facing

**Symptoms**:
- ✅ Upload button appears in Add/Edit Component dialogs
- ✅ You can select images
- ✅ "Successfully added/updated" notification shows
- ❌ **BUT images don't save**
- ❌ **Images don't appear in ecommerce app**
- ❌ When editing component, uploaded image doesn't show

**Root Cause**: Missing Supabase Storage bucket to store the images!

---

## 📋 Quick Fix Checklist

Follow these steps **IN ORDER**:

### Step 1: Create Storage Bucket ✅
### Step 2: Run Database Migration ✅
### Step 3: Test Upload Flow ✅
### Step 4: Verify Frontend Display ✅

---

## 🪣 Step 1: Create Supabase Storage Bucket

### 1.1 Login to Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"Storage"** in the left sidebar

### 1.2 Create "products" Bucket
1. Click **"New bucket"** button
2. Fill in the details:
   ```
   Name: products
   Public bucket: ✅ YES (check this!)
   File size limit: 5242880 (5MB)
   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
   ```
3. Click **"Create bucket"**

### 1.3 Set Bucket Permissions (CRITICAL!)

After creating the bucket, you need to set up policies:

1. Click on the **"products"** bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

**Policy 1: Public Read Access** (Allow everyone to view images)
```sql
-- Policy Name: Public read access
-- Allowed operation: SELECT

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');
```

**Policy 2: Authenticated Upload** (Allow logged-in users to upload)
```sql
-- Policy Name: Authenticated users can upload
-- Allowed operation: INSERT

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Authenticated Delete** (Allow logged-in users to delete)
```sql
-- Policy Name: Authenticated users can delete
-- Allowed operation: DELETE

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);
```

### 1.4 Verify Bucket Creation

Run this in **SQL Editor**:
```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'products';

-- Should return:
-- | id | name     | public |
-- |----|----------|--------|
-- | .. | products | true   |
```

---

## 💾 Step 2: Run Database Migration

### 2.1 Add image_url Column

Go to **SQL Editor** → **New Query** → Paste and run:

```sql
-- Add image_url column to product_categories table
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'product_categories';

-- Should now show image_url column
```

### 2.2 Verify Table Structure

```sql
-- Check current categories
SELECT id, name, slug, image_url, is_active 
FROM product_categories 
LIMIT 5;

-- image_url should be NULL for existing categories
```

---

## 🧪 Step 3: Test Upload Flow

### 3.1 Test in Admin Panel

1. **Go to Product Upload page**
2. **Click "ADD NEW COMPONENT"**
3. **Fill in details**:
   - Name: `Test Category`
   - Description: `Testing image upload`
4. **Click "Upload Image"**
5. **Select an image** (JPG, PNG, WEBP, GIF under 5MB)
6. **See preview** appear
7. **Click "Add Component"**
8. **Check notification**: "Successfully added"

### 3.2 Verify in Database

Run in **SQL Editor**:
```sql
-- Check if category was created with image
SELECT id, name, image_url, created_at 
FROM product_categories 
WHERE name = 'Test Category';

-- image_url should look like:
-- https://your-project.supabase.co/storage/v1/object/public/products/categories/test-category_1234567890.jpg
```

### 3.3 Verify in Storage

1. Go to **Storage** → **products** bucket
2. Open **categories** folder
3. You should see your uploaded image file
4. Click on the file → Click **"Get URL"**
5. Copy URL and paste in browser
6. Image should display! ✅

---

## 🎨 Step 4: Verify Frontend Display

### 4.1 Test in Ecommerce App

1. **Go to your ecommerce frontend**
2. **Navigate to Products/Categories page**
3. **Look for the category carousel**
4. **Your uploaded image should display!**

### 4.2 If Image Doesn't Show

**Check Console Errors**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors like:
   - `404 Not Found` - Bucket doesn't exist
   - `403 Forbidden` - Missing permissions
   - `CORS error` - Bucket not public

**Debug Steps**:
```javascript
// Open browser console on frontend and run:
fetch('https://your-project.supabase.co/storage/v1/object/public/products/categories/test.jpg')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Error:', e));

// Should return: Status: 404 (file not found) or 200 (success)
// Should NOT return: CORS error or 403
```

---

## 🔍 Step 5: Test Edit Component with Image

### 5.1 Edit Existing Component

1. **Go to Product Upload page**
2. **Find a component in the slider**
3. **Click three-dot menu → "Edit Component"**
4. **Dialog should show**:
   - ✅ If component has image → Image displays in preview
   - ✅ If no image → "Upload Image" button shows

### 5.2 Change Image

1. **Click "Upload Image"** (or replace existing)
2. **Select new image**
3. **Preview should update immediately**
4. **Click "Save Changes"**
5. **Check notification**: "Updated successfully"

### 5.3 Verify Edit in Database

```sql
-- Check updated category
SELECT id, name, image_url, updated_at 
FROM product_categories 
WHERE name = 'Your Category Name';

-- image_url should be updated to new URL
```

### 5.4 Verify Old Image Deleted

1. Go to **Storage** → **products/categories/**
2. Old image file should be **deleted** automatically
3. Only new image should exist

---

## 🎯 Complete Test Scenario

### Scenario 1: Create Category with Image
```
1. Click "ADD NEW COMPONENT"
2. Name: "Electronics"
3. Description: "Electronic devices"
4. Upload image: electronics.jpg
5. Click "Add Component"
6. ✅ Success notification
7. ✅ Image appears in slider
8. ✅ Image saved to Storage
9. ✅ URL saved to database
10. ✅ Image shows in frontend ecommerce app
```

### Scenario 2: Edit Category - Change Image
```
1. Edit "Electronics" category
2. Current image displays in dialog ✅
3. Upload new image: electronics-new.jpg
4. Click "Save Changes"
5. ✅ Success notification
6. ✅ New image appears in slider
7. ✅ New image saved to Storage
8. ✅ Old image deleted from Storage
9. ✅ Database updated with new URL
10. ✅ New image shows in frontend
```

### Scenario 3: Edit Category - Remove Image
```
1. Edit "Electronics" category
2. Current image displays
3. Click X button to remove
4. Click "Save Changes"
5. ✅ Success notification
6. ✅ Image removed from slider
7. ✅ Image deleted from Storage
8. ✅ Database image_url set to null
9. ✅ Default placeholder shows in frontend
```

---

## 🐛 Troubleshooting

### Issue 1: "Error uploading image"

**Possible Causes**:
- ❌ Bucket doesn't exist
- ❌ Bucket is not public
- ❌ Missing upload policy

**Solution**:
```sql
-- Check bucket exists and is public
SELECT name, public FROM storage.buckets WHERE name = 'products';

-- Should return: public = true
```

If false, update:
```sql
UPDATE storage.buckets SET public = true WHERE name = 'products';
```

### Issue 2: Image uploads but doesn't display in frontend

**Possible Causes**:
- ❌ Bucket not public
- ❌ Missing read policy
- ❌ Frontend not fetching image_url

**Solution**:
1. Check bucket policies (Step 1.3)
2. Check frontend ProductService.getCategories() includes image_url:
```javascript
// Should have:
.select('id, name, slug, image_url, icon_url, display_order')
```

### Issue 3: "Successfully added" but image_url is null in database

**Possible Causes**:
- ❌ Upload failed silently
- ❌ image_url column doesn't exist

**Solution**:
```sql
-- Verify column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'product_categories' AND column_name = 'image_url';

-- If no result, run:
ALTER TABLE product_categories ADD COLUMN image_url TEXT;
```

### Issue 4: Old images not being deleted when editing

**Possible Causes**:
- ❌ Missing delete policy
- ❌ Delete method not called

**Solution**:
1. Add delete policy (Step 1.3 - Policy 3)
2. Check browser console for delete errors
3. Verify CategoryService.deleteCategoryImage() is called

### Issue 5: 403 Forbidden when viewing images

**Possible Causes**:
- ❌ Bucket not public
- ❌ Missing read policy

**Solution**:
```sql
-- Make bucket public
UPDATE storage.buckets SET public = true WHERE name = 'products';

-- Add read policy
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');
```

---

## 🔐 Security Best Practices

### File Size Limits
```javascript
// In CategoryService.uploadCategoryImage(), add validation:
if (file.size > 5 * 1024 * 1024) {
  throw new Error('Image size must be less than 5MB');
}
```

### File Type Validation
```javascript
const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
if (!validTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}
```

### Rate Limiting
Consider adding rate limiting for uploads:
```sql
-- Limit uploads per user per minute
CREATE POLICY "Rate limit uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND (
    SELECT COUNT(*) 
    FROM storage.objects 
    WHERE owner = auth.uid() 
    AND created_at > NOW() - INTERVAL '1 minute'
  ) < 10
);
```

---

## 📊 Monitoring

### Check Storage Usage
```sql
-- Total files in products bucket
SELECT COUNT(*) as total_files
FROM storage.objects
WHERE bucket_id = 'products';

-- Total size of category images
SELECT 
  COUNT(*) as total_images,
  SUM(metadata->>'size')::bigint / 1024 / 1024 as total_size_mb
FROM storage.objects
WHERE bucket_id = 'products' 
AND name LIKE 'categories/%';
```

### List All Category Images
```sql
-- Get all categories with images
SELECT 
  pc.id,
  pc.name,
  pc.image_url,
  pc.created_at
FROM product_categories pc
WHERE pc.image_url IS NOT NULL
ORDER BY pc.created_at DESC;
```

---

## 📝 SQL Scripts

### Quick Setup Script (Run All at Once)
```sql
-- 1. Create bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Add image_url column
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Create policies
CREATE POLICY IF NOT EXISTS "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- 4. Verify setup
SELECT 'Bucket exists and is public' as status, * 
FROM storage.buckets 
WHERE name = 'products' AND public = true;

SELECT 'image_url column exists' as status, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'product_categories' AND column_name = 'image_url';
```

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Supabase Storage bucket "products" exists
- [ ] Bucket is set to **public**
- [ ] Bucket has read/upload/delete policies
- [ ] Database has image_url column
- [ ] Can upload image in Add Component dialog
- [ ] Image preview shows before saving
- [ ] Success notification appears after save
- [ ] Image file appears in Storage bucket
- [ ] Database has image URL saved
- [ ] Image displays in admin component slider
- [ ] Image displays in frontend ecommerce app
- [ ] Can edit component and see current image
- [ ] Can replace image when editing
- [ ] Old image is deleted automatically
- [ ] Can remove image completely
- [ ] File validation works (size, type)

---

## 🎉 Expected Results

### After Setup
```
1. Admin Panel:
   ✅ Add Component → Upload image → Preview shows
   ✅ Save → Success notification
   ✅ Component slider shows image
   ✅ Edit component → Current image displays
   ✅ Replace image → Old image deleted, new one saved

2. Database:
   ✅ image_url column populated with Storage URL
   ✅ Example: https://proj.supabase.co/storage/v1/object/public/products/categories/electronics_1699999999999.jpg

3. Supabase Storage:
   ✅ products/categories/ folder contains images
   ✅ Files named: category-name_timestamp.ext
   ✅ Old images deleted when replaced

4. Frontend Ecommerce:
   ✅ Category carousel shows uploaded images
   ✅ Fallback to default if no image
   ✅ Images load quickly (cached)
```

---

## 🚀 Next Steps

After successful setup:

1. **Test with multiple categories**
2. **Upload various image formats** (JPG, PNG, WEBP, GIF)
3. **Test edit/replace/remove flows**
4. **Verify frontend display**
5. **Monitor storage usage**

---

## 📞 Need Help?

If images still don't save after following this guide:

1. **Check browser console** for errors
2. **Check Supabase logs** (Dashboard → Logs)
3. **Verify all policies are active** (Storage → Policies)
4. **Test direct URL access** to an uploaded image
5. **Check .env file** has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

---

**Last Updated**: November 2024  
**Status**: Complete Setup Guide  
**Tested**: ✅ Admin Panel & Frontend
