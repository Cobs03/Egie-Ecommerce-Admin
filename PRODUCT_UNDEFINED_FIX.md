# Product Display "undefined" Fix

## Issue
Selected products in the discount dialog were showing as:
```
undefined aadda - ₱4
undefined aafa - ₱4
undefined adadad - ₱4
```

The word "undefined" appeared before each product name.

## Root Cause
In `DiscountEditDialog.jsx` line 510, the code was trying to display:
```jsx
label={`${product.image} ${product.name} - ₱${product.price.toLocaleString()}`}
```

**Problem**: The database schema uses `images` (array), not `image` (string).
- Database field: `images` = `["url1.jpg", "url2.jpg"]` (array)
- Code was looking for: `product.image` (doesn't exist)
- Result: `undefined` was rendered as text

## Solution

### Before:
```jsx
{formData.specificProducts.map((product) => (
  <Chip
    label={`${product.image} ${product.name} - ₱${product.price.toLocaleString()}`}
    onDelete={() => handleRemoveProduct(product.id)}
  />
))}
```

### After:
```jsx
{formData.specificProducts.map((product) => {
  // Get product image - handle both array and string formats
  const productImage = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : product.image || '';
  
  return (
    <Chip
      label={`${product.name} - ₱${product.price.toLocaleString()}`}
      onDelete={() => handleRemoveProduct(product.id)}
    />
  );
})}
```

## Changes Made
1. **Removed `product.image`** from the label since it was causing "undefined"
2. **Added defensive image handling** (prepared for future use if needed)
3. **Simplified display** to show only: `product name - ₱price`

## Result
Now displays correctly:
```
aadda - ₱4
aafa - ₱4
adadad - ₱4
```

## Files Modified
- `src/view/Promotions/Promotion Components/DiscountEditDialog.jsx` (line 507-525)

## Testing
- [x] Select products from dialog
- [x] Products display without "undefined"
- [x] Product name shows correctly
- [x] Price displays with proper formatting
- [x] Remove product works correctly
- [x] Clear All works correctly

## Notes
- The product image extraction logic is still in place for future use
- Currently only displaying product name and price in the chip
- If you want to show images later, you can use the `productImage` variable that's already prepared
