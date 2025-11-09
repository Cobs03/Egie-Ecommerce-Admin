# Edit Component Image Upload Feature

## Overview
This guide documents the image upload functionality for **editing existing components** in the Product Upload page.

---

## 🎯 Feature Scope

### What This Feature Does
- Allows editing component/category images when modifying existing components
- Shows current component image in the edit dialog
- Supports uploading a new image to replace the existing one
- Allows removing the component image entirely
- Handles old image deletion when replacing with a new image

### Where This Feature Works
- **Location**: Product Upload Page → Components Slider → Three-dot menu → Edit Component
- **Dialog**: "Edit Component" dialog in ComponentsSlider.jsx

---

## 📁 Files Modified

### 1. ComponentsSlider.jsx
**Path**: `src/view/Product/ProductComponents/ProductCreate Components/ComponentsSlider.jsx`

**Changes Made**:

#### Added Imports
```javascript
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
```

#### Added State Management
```javascript
// Edit dialog state
const [editImageFile, setEditImageFile] = useState(null);
const [editImagePreview, setEditImagePreview] = useState(null);
```

#### Updated handleOpenEdit
```javascript
const handleOpenEdit = () => {
  setEditData({
    name: selectedComponentForAction.name,
    description: selectedComponentForAction.description || "",
  });
  // Show existing image if available
  if (selectedComponentForAction.image_url) {
    setEditImagePreview(selectedComponentForAction.image_url);
  }
  setOpenEditDialog(true);
  handleCloseContextMenu();
};
```

#### Added Image Handlers
```javascript
// Handle image change for edit
const handleEditImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setEditImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

// Handle remove image for edit
const handleRemoveEditImage = () => {
  setEditImageFile(null);
  setEditImagePreview(null);
};
```

#### Updated handleSaveEdit
```javascript
const handleSaveEdit = () => {
  if (onEditComponent) {
    const updatedData = {
      ...editData,
      imageFile: editImageFile,
      removeImage: !editImagePreview, // Flag to indicate image should be removed
    };
    onEditComponent(selectedComponentForAction.id, updatedData);
  }
  handleCloseEdit();
};
```

#### Added Image Upload UI to Dialog
```jsx
{/* Image Upload Section */}
<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
  <Typography variant="subtitle2" color="text.secondary">
    Component Image
  </Typography>
  {editImagePreview ? (
    <Box sx={{ position: "relative", display: "inline-block", maxWidth: 200 }}>
      <Box
        component="img"
        src={editImagePreview}
        alt="Preview"
        sx={{
          width: "100%",
          height: 150,
          objectFit: "cover",
          borderRadius: 1,
          border: "1px solid #e0e0e0",
        }}
      />
      <IconButton
        onClick={handleRemoveEditImage}
        size="small"
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          bgcolor: "background.paper",
          boxShadow: 1,
          "&:hover": { bgcolor: "error.light", color: "white" },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  ) : (
    <Button
      variant="outlined"
      component="label"
      startIcon={<CloudUploadIcon />}
      sx={{
        borderColor: "#e0e0e0",
        color: "#424242",
        width: "fit-content",
      }}
    >
      Upload Image
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={handleEditImageChange}
      />
    </Button>
  )}
  <Typography variant="caption" color="text.secondary">
    Recommended: JPG, PNG, WEBP, or GIF (max 5MB)
  </Typography>
</Box>
```

---

### 2. ProductCreate.jsx
**Path**: `src/view/Product/ProductComponents/ProductCreate.jsx`

**Changes Made**:

#### Updated handleEditComponent Function
```javascript
const handleEditComponent = async (componentId, updatedData) => {
  try {
    // Find the current category to get its current image_url
    const currentCategory = categories.find(cat => cat.id === componentId);
    let imageUrl = currentCategory?.image_url || '';

    // Handle image upload if a new image was provided
    if (updatedData.imageFile) {
      const uploadResult = await CategoryService.uploadCategoryImage(
        updatedData.imageFile,
        updatedData.name
      );

      if (uploadResult.success) {
        imageUrl = uploadResult.data;

        // Delete old image if it exists and is different from the new one
        if (currentCategory?.image_url && currentCategory.image_url !== imageUrl) {
          await CategoryService.deleteCategoryImage(currentCategory.image_url);
        }
      } else {
        setErrorMessage(`Failed to upload image: ${uploadResult.error}`);
        setShowError(true);
        return;
      }
    } else if (updatedData.removeImage) {
      // Remove image if requested
      if (currentCategory?.image_url) {
        await CategoryService.deleteCategoryImage(currentCategory.image_url);
      }
      imageUrl = null;
    }

    // Update in database
    const result = await CategoryService.updateCategory(componentId, {
      name: updatedData.name,
      description: updatedData.description,
      image_url: imageUrl
    });

    if (result.success) {
      // Update in local categories list
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === componentId
            ? { 
                ...cat, 
                name: updatedData.name, 
                description: updatedData.description,
                image_url: imageUrl 
              }
            : cat
        )
      );

      // Update in selectedComponents if it's selected
      setSelectedComponents((prev) =>
        prev.map((comp) =>
          comp.id === componentId
            ? { 
                ...comp, 
                name: updatedData.name, 
                description: updatedData.description,
                image_url: imageUrl 
              }
            : comp
        )
      );

      // Show success message
      setSuccessMessage(`Category "${updatedData.name}" updated successfully!`);
      setShowSuccess(true);
    }
  } catch (error) {
    console.error('Error updating category:', error);
    setErrorMessage(`Error updating category: ${error.message}`);
    setShowError(true);
  }
};
```

---

## 🎨 User Interface

### Edit Component Dialog Structure

```
┌─────────────────────────────────────────┐
│  Edit Component                    [X]  │
├─────────────────────────────────────────┤
│                                         │
│  Component Name                         │
│  ┌────────────────────────────────┐    │
│  │ [Category Name Input]          │    │
│  └────────────────────────────────┘    │
│                                         │
│  Description                            │
│  ┌────────────────────────────────┐    │
│  │ [Multiline Description]        │    │
│  │                                │    │
│  └────────────────────────────────┘    │
│                                         │
│  Component Image                        │
│  ┌─────────────────────────┐           │
│  │  [Current Image]    [X] │  OR       │
│  │                         │           │
│  └─────────────────────────┘           │
│                                         │
│  [📤 Upload Image Button]               │
│  Recommended: JPG, PNG, WEBP (max 5MB) │
│                                         │
│                       [Cancel] [Save]  │
└─────────────────────────────────────────┘
```

### UI Behavior

1. **When Dialog Opens**:
   - Shows existing image if component has `image_url`
   - Shows "Upload Image" button if no image exists

2. **When Uploading New Image**:
   - Click "Upload Image" → File picker opens
   - Select image → Preview displays immediately
   - Remove button (X) appears on top-right of preview
   - Can remove and upload again before saving

3. **When Removing Image**:
   - Click X button on preview → Image removed
   - "Upload Image" button reappears
   - Saving will remove image from database

---

## 🔄 Data Flow

### Edit Component with New Image
```
User clicks Edit → ComponentsSlider.jsx (handleOpenEdit)
                ↓
        Shows existing image from category.image_url
                ↓
User uploads new image → handleEditImageChange
                ↓
        File validated (type, size)
                ↓
        Preview generated (base64)
                ↓
User clicks Save → handleSaveEdit
                ↓
        Pass imageFile to ProductCreate.jsx
                ↓
ProductCreate.handleEditComponent
                ↓
        1. Upload new image to Storage
        2. Get new image URL
        3. Delete old image from Storage
        4. Update database with new image_url
        5. Update local state
                ↓
        Success message displayed
```

### Edit Component - Remove Image
```
User clicks Edit → Shows existing image
                ↓
User clicks X (remove) → handleRemoveEditImage
                ↓
        Preview cleared
        removeImage flag set
                ↓
User clicks Save → handleSaveEdit
                ↓
ProductCreate.handleEditComponent
                ↓
        1. Delete image from Storage
        2. Update database (image_url = null)
        3. Update local state
                ↓
        Success message displayed
```

---

## ✅ Testing Guide

### Test Case 1: Edit Component - Upload New Image
1. Go to Product Upload page
2. Click three-dot menu on a component
3. Click "Edit Component"
4. If image exists, it should display
5. Click "Upload Image" or replace existing
6. Select a valid image file
7. Preview should display
8. Click "Save Changes"
9. ✅ Image should update in components slider
10. ✅ Image should save to database
11. ✅ Old image should be deleted from Storage

### Test Case 2: Edit Component - Remove Image
1. Edit a component that has an image
2. Click X button on image preview
3. Image should disappear
4. "Upload Image" button should reappear
5. Click "Save Changes"
6. ✅ Image should be removed from slider
7. ✅ Database should show image_url = null
8. ✅ Image should be deleted from Storage

### Test Case 3: Edit Component - Keep Existing Image
1. Edit a component with an image
2. Don't change the image
3. Only edit name or description
4. Click "Save Changes"
5. ✅ Image should remain unchanged
6. ✅ Other fields should update

### Test Case 4: Edit Component - Add Image to Imageless Component
1. Edit a component without an image
2. Click "Upload Image"
3. Select image
4. Click "Save Changes"
5. ✅ Image should appear in slider
6. ✅ Image should save to database

### Test Case 5: File Validation
1. Try uploading non-image file
2. ✅ Should show error: "Please upload a valid image file"
3. Try uploading 6MB+ image
4. ✅ Should show error: "Image size should be less than 5MB"

---

## 🛠️ Prerequisites

Before testing, ensure:

1. **Database Migration**:
   ```sql
   -- Run ADD_CATEGORY_IMAGE_COLUMN.sql
   ALTER TABLE product_categories 
   ADD COLUMN IF NOT EXISTS image_url TEXT;
   ```

2. **Supabase Storage**:
   - Bucket `products` exists
   - Folder `categories/` is accessible
   - Public access enabled

3. **CategoryService Methods Available**:
   - `uploadCategoryImage(file, categoryName)`
   - `deleteCategoryImage(imageUrl)`
   - `updateCategory(categoryId, categoryData)`

---

## 🐛 Troubleshooting

### Problem: Image doesn't display after editing
**Solution**: 
- Check browser console for errors
- Verify image_url saved to database
- Check Supabase Storage bucket permissions

### Problem: "Failed to upload image" error
**Solution**:
- Verify Supabase Storage bucket exists
- Check file size (must be < 5MB)
- Check file type (JPG, PNG, WEBP, GIF only)

### Problem: Old images not being deleted
**Solution**:
- Check CategoryService.deleteCategoryImage() method
- Verify Storage bucket delete permissions
- Check browser console for delete errors

### Problem: Changes not reflected in frontend
**Solution**:
- Clear browser cache
- Check ProductService.getCategories() fetches image_url
- Verify Category.jsx uses image_url field

---

## 📋 Feature Comparison

| Feature | Add Component Dialog | Edit Component Dialog |
|---------|---------------------|----------------------|
| Upload Image | ✅ Yes | ✅ Yes |
| Remove Image | ✅ Yes | ✅ Yes |
| Show Preview | ✅ Yes | ✅ Yes |
| File Validation | ✅ Yes | ✅ Yes |
| Show Existing Image | N/A | ✅ Yes |
| Replace Existing Image | N/A | ✅ Yes |
| Delete Old Image | N/A | ✅ Yes (automatic) |

---

## 🎉 Success Criteria

✅ Edit Component dialog shows upload button
✅ Existing images display when editing
✅ Can upload new images to replace existing
✅ Can remove images by clicking X button
✅ Old images are deleted when replaced
✅ Image previews work correctly
✅ File validation prevents invalid uploads
✅ Database updates with new image_url
✅ Frontend displays updated images
✅ Success/error messages show appropriately

---

## 📚 Related Documentation

- **ADD_COMPONENT_IMAGE_UPLOAD_GUIDE.md** - Create component feature
- **CATEGORY_IMAGE_UPLOAD_GUIDE.md** - Complete upload system
- **CATEGORY_IMAGES_IMPLEMENTATION_SUMMARY.md** - Technical summary
- **COMPLETE_SETUP_GUIDE.md** - Database and storage setup

---

## 🔄 Version History

- **v1.0** - Initial implementation of Edit Component image upload
  - Added image upload UI to edit dialog
  - Added image preview and remove functionality
  - Updated handleEditComponent to handle image changes
  - Added automatic old image deletion
  - Added file validation

---

**Last Updated**: December 2024
**Status**: ✅ Complete
**Testing**: Required after database migration
