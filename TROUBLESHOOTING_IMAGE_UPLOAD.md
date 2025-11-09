# 🔍 Image Upload Troubleshooting Guide

## Quick Diagnosis Tool

Copy and paste this checklist to identify your exact problem:

---

## ✅ Problem Checker

### Test 1: Can you see the upload button?
- [ ] YES → Go to Test 2
- [ ] NO → Component not updated, check ComponentsSlider.jsx

### Test 2: Can you select an image?
- [ ] YES → Go to Test 3
- [ ] NO → File input broken, check browser permissions

### Test 3: Does preview show after selecting?
- [ ] YES → Go to Test 4
- [ ] NO → handleImageChange broken, check browser console

### Test 4: Does "Success" notification appear after saving?
- [ ] YES → Go to Test 5
- [ ] NO → Upload is failing, go to **Section A**

### Test 5: Is image saved in Supabase Storage?
- [ ] YES → Go to Test 6
- [ ] NO → Storage bucket issue, go to **Section B**

### Test 6: Is image_url saved in database?
- [ ] YES → Go to Test 7
- [ ] NO → Database save failed, go to **Section C**

### Test 7: Does image show in admin panel slider?
- [ ] YES → Go to Test 8
- [ ] NO → Frontend fetch issue, go to **Section D**

### Test 8: Does image show in ecommerce app?
- [ ] YES → ✅ **WORKING PERFECTLY!**
- [ ] NO → Frontend display issue, go to **Section E**

---

## Section A: Upload Failing (Success notification not showing)

### Check 1: Browser Console Errors
```
1. Open DevTools (F12)
2. Go to Console tab
3. Click "Add Component"
4. Look for red errors

Common errors:
- "Cannot read property 'upload' of undefined" → Supabase not initialized
- "Storage bucket not found" → Bucket doesn't exist
- "403 Forbidden" → Missing permissions
```

### Check 2: Network Tab
```
1. Open DevTools → Network tab
2. Filter: "storage"
3. Click "Add Component"
4. Look for failed requests (red)

If you see:
- POST /storage/v1/object/products → Failed → Bucket issue
- 404 → Bucket doesn't exist
- 403 → Missing upload policy
```

### Fix:
```sql
-- Run in Supabase SQL Editor:
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'products';

-- If no result, create bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

-- Add upload policy:
CREATE POLICY "Authenticated users can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);
```

---

## Section B: Storage Bucket Issue

### Check 1: Does bucket exist?
```sql
-- Run in Supabase SQL Editor:
SELECT 
  id, 
  name, 
  public,
  created_at
FROM storage.buckets 
WHERE name = 'products';

-- Expected result:
-- | id      | name     | public | created_at           |
-- |---------|----------|--------|----------------------|
-- | products| products | true   | 2024-11-02 10:00:00 |
```

### Check 2: Is bucket public?
```sql
-- Check if public = true
SELECT name, public FROM storage.buckets WHERE name = 'products';

-- If public = false, fix it:
UPDATE storage.buckets SET public = true WHERE name = 'products';
```

### Check 3: Are policies set up?
```sql
-- Check storage policies
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN '👁️ View/Download'
    WHEN cmd = 'INSERT' THEN '📤 Upload'
    WHEN cmd = 'DELETE' THEN '🗑️ Delete'
    WHEN cmd = 'UPDATE' THEN '✏️ Update'
  END as description
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%category%';
```

### Fix: Create all policies
```sql
-- Run COMPLETE_STORAGE_SETUP.sql from database folder
-- Or manually run Step 3 from that file
```

---

## Section C: Database Save Failed

### Check 1: Does column exist?
```sql
-- Verify image_url column
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_categories' 
AND column_name = 'image_url';

-- Expected result:
-- | column_name | data_type | is_nullable |
-- |-------------|-----------|-------------|
-- | image_url   | text      | YES         |
```

### Check 2: Can you manually insert?
```sql
-- Test manual insert
INSERT INTO product_categories (name, slug, image_url, is_active)
VALUES ('Test Category', 'test-category', 'https://example.com/test.jpg', true);

-- Check if it worked
SELECT id, name, image_url FROM product_categories WHERE name = 'Test Category';

-- Clean up test
DELETE FROM product_categories WHERE name = 'Test Category';
```

### Fix: Add column
```sql
-- If column doesn't exist, add it:
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

---

## Section D: Image Not Showing in Admin Panel Slider

### Check 1: Is data fetched correctly?
```javascript
// Open browser console on admin panel and run:
const categories = await fetch('/api/categories').then(r => r.json());
console.log('Categories:', categories);
console.log('First category image_url:', categories[0]?.image_url);

// Should show: image_url: "https://..."
// If undefined → Frontend not fetching image_url field
```

### Check 2: Inspect component state
```
1. Open React DevTools
2. Find ComponentsSlider component
3. Check props.categories
4. Look for image_url in each category object

If missing → ProductCreate not fetching image_url
```

### Fix: Update frontend fetch
```javascript
// In ProductService.getCategories() or CategoryService.getCategories()
// Make sure query includes image_url:

const { data, error } = await supabase
  .from('product_categories')
  .select('id, name, slug, description, image_url, icon_url, is_active, display_order')
  //                                    ^^^^^^^^^ MUST BE HERE!
  .eq('is_active', true)
  .order('display_order', { ascending: true });
```

---

## Section E: Image Not Showing in Ecommerce App

### Check 1: Is frontend fetching image_url?
```javascript
// Frontend - Check ProductService.getCategories()
// File: ECOMMERCE_SOFTWARE/Egie-Ecommerce/src/services/ProductService.js

// Should look like:
static async getCategories() {
  const { data, error } = await supabase
    .from('product_categories')
    .select('id, name, slug, image_url, icon_url, display_order')
    //                        ^^^^^^^^^ MUST BE HERE!
    .eq('is_active', true)
    .order('display_order', { ascending: true });
    
  return data || [];
}
```

### Check 2: Is Category.jsx using image_url?
```javascript
// Frontend - Check Category.jsx
// File: ECOMMERCE_SOFTWARE/Egie-Ecommerce/src/views/Products/Product Components/Category.jsx

// Should have priority system:
let imageUrl = '/images/default-category.png';
if (typeof category === 'object') {
  if (category.image_url) {
    imageUrl = category.image_url;  // ← Priority 1: Uploaded image
  } else if (category.icon_url) {
    imageUrl = category.icon_url;   // ← Priority 2: Legacy
  }
  // ... fallbacks
}
```

### Check 3: CORS Issue?
```javascript
// Open browser console on frontend and test:
fetch('https://your-project.supabase.co/storage/v1/object/public/products/categories/test.jpg')
  .then(r => console.log('CORS test:', r.status))
  .catch(e => console.error('CORS error:', e));

// If CORS error → Bucket not public or missing policy
```

### Fix: Update frontend files
```javascript
// 1. Update ProductService.getCategories()
// Add image_url to select()

// 2. Update Category.jsx  
// Add image_url priority check

// 3. Clear browser cache and reload
```

---

## 🔬 Deep Debugging

### Full Upload Flow Test

Run this step-by-step in browser console (Admin Panel):

```javascript
// 1. Check if Supabase is initialized
console.log('Supabase initialized:', !!window.supabase);

// 2. Check if storage is accessible
const { data: buckets } = await supabase.storage.listBuckets();
console.log('Available buckets:', buckets);

// 3. Check if products bucket exists
const productsBucket = buckets.find(b => b.name === 'products');
console.log('Products bucket:', productsBucket);

// 4. Test upload (create a test file)
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('products')
  .upload('test.txt', testFile);
console.log('Upload test:', { data: uploadData, error: uploadError });

// 5. Test public URL
const { data: urlData } = supabase.storage
  .from('products')
  .getPublicUrl('test.txt');
console.log('Public URL:', urlData.publicUrl);

// 6. Test fetch
fetch(urlData.publicUrl)
  .then(r => console.log('URL accessible:', r.ok))
  .catch(e => console.error('URL not accessible:', e));

// 7. Cleanup
await supabase.storage.from('products').remove(['test.txt']);
console.log('Test file removed');
```

### Database State Check

```sql
-- Check complete category state
SELECT 
  id,
  name,
  slug,
  image_url,
  CASE 
    WHEN image_url IS NOT NULL THEN '✅ Has image'
    ELSE '❌ No image'
  END as image_status,
  is_active,
  created_at,
  updated_at
FROM product_categories
ORDER BY created_at DESC
LIMIT 10;

-- Check if images exist in storage
SELECT 
  name as filename,
  metadata->>'size' as size_bytes,
  created_at
FROM storage.objects
WHERE bucket_id = 'products'
AND name LIKE 'categories/%'
ORDER BY created_at DESC;
```

---

## 🎯 Most Common Issues & Fixes

### Issue 1: "Success" but image_url is NULL
**Cause**: Upload succeeds but URL not saved to database  
**Fix**:
```javascript
// In ProductCreate.jsx handleConfirmAddComponent()
// Make sure this line exists:
const categoryData = {
  name,
  slug,
  description,
  image_url: imageUrl || null,  // ← THIS LINE!
  is_active: true
};
```

### Issue 2: Image uploads but doesn't display
**Cause**: Bucket not public  
**Fix**:
```sql
UPDATE storage.buckets SET public = true WHERE name = 'products';
```

### Issue 3: 403 Forbidden when viewing image
**Cause**: Missing read policy  
**Fix**:
```sql
CREATE POLICY "Anyone can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');
```

### Issue 4: Can't upload - "Bucket not found"
**Cause**: Bucket doesn't exist  
**Fix**:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);
```

### Issue 5: Old images not deleted when editing
**Cause**: Missing delete policy  
**Fix**:
```sql
CREATE POLICY "Authenticated users can delete category images"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');
```

---

## 📋 Quick Fix Checklist

If nothing works, run this checklist:

```
[ ] 1. Run COMPLETE_STORAGE_SETUP.sql
[ ] 2. Verify bucket exists and is public
[ ] 3. Verify image_url column exists
[ ] 4. Verify all 4 storage policies exist
[ ] 5. Clear browser cache
[ ] 6. Log out and log back in
[ ] 7. Check browser console for errors
[ ] 8. Check Supabase logs (Dashboard → Logs)
[ ] 9. Test upload with small image (< 1MB)
[ ] 10. Verify .env has correct Supabase credentials
```

---

## 🆘 Still Not Working?

### Gather Debug Info

Run these and share the output:

```sql
-- 1. Bucket info
SELECT * FROM storage.buckets WHERE name = 'products';

-- 2. Policies
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. Column info
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'product_categories' AND column_name = 'image_url';

-- 4. Recent categories
SELECT id, name, image_url, created_at 
FROM product_categories 
ORDER BY created_at DESC LIMIT 5;

-- 5. Recent uploads
SELECT name, created_at FROM storage.objects 
WHERE bucket_id = 'products' 
ORDER BY created_at DESC LIMIT 5;
```

```javascript
// Browser console (Admin Panel)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Logged in:', !!(await supabase.auth.getUser()).data.user);
```

---

## ✅ Success Indicators

You know it's working when:

1. ✅ Click "Upload Image" → File picker opens
2. ✅ Select image → Preview shows immediately
3. ✅ Click "Add Component" → Success notification
4. ✅ Check Supabase Storage → File appears in products/categories/
5. ✅ Query database → image_url is populated
6. ✅ Check admin slider → Image displays
7. ✅ Check frontend → Image displays in category carousel
8. ✅ Edit component → Current image shows in dialog
9. ✅ Replace image → Old one deleted, new one saved
10. ✅ No console errors anywhere

---

**Last Updated**: November 2024  
**Need more help?**: Check STORAGE_SETUP_COMPLETE_GUIDE.md
