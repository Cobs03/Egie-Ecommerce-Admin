# Product Category Filter Fix

## Issue
When clicking the category filter dropdown, the app crashed with a white screen. The error was:
- "Objects are not valid as React child"
- "Encountered two children with the same key"

## Root Cause
The `selected_components` field in the products table stores an array of **objects** with structure:
```json
[
  { "id": 1, "name": "CPU" },
  { "id": 2, "name": "GPU" }
]
```

But the code was treating them as strings, causing:
1. **Category dropdown**: Trying to render objects as menu items
2. **Category filtering**: Using `.includes()` which doesn't work with objects
3. **Category display**: Showing `[object Object]` instead of category names

## Solution

### 1. Fixed `DiscountService.getProductCategories()`
**Before:**
```javascript
product.selected_components.forEach(comp => categoriesSet.add(comp));
```

**After:**
```javascript
product.selected_components.forEach(comp => {
  // Handle both object {id, name} and string formats
  const categoryName = typeof comp === 'object' && comp !== null ? comp.name : comp;
  if (categoryName) {
    categoriesSet.add(categoryName);
  }
});
```

### 2. Fixed Category Filtering in ProductSelectionDialog
**Before:**
```javascript
result = result.filter((product) =>
  product.selected_components &&
  product.selected_components.includes(categoryFilter)
);
```

**After:**
```javascript
result = result.filter((product) => {
  if (!product.selected_components || !Array.isArray(product.selected_components)) {
    return false;
  }
  // Handle both object {id, name} and string formats
  return product.selected_components.some(comp => {
    const componentName = typeof comp === 'object' && comp !== null ? comp.name : comp;
    return componentName === categoryFilter;
  });
});
```

### 3. Fixed Category Display in Product List
**Before:**
```javascript
<Chip label={String(product.selected_components[0])} />
```

**After:**
```javascript
{product.selected_components && product.selected_components.length > 0 && (() => {
  const firstComp = product.selected_components[0];
  const componentName = typeof firstComp === 'object' && firstComp !== null ? firstComp.name : firstComp;
  return (
    <Chip label={String(componentName)} size="small" />
  );
})()}
```

## Files Modified
1. `src/services/DiscountService.js` - Updated `getProductCategories()` method
2. `src/view/Promotions/Promotion Components/ProductSelectionDialog.jsx` - Updated filtering and display logic

## Testing Checklist
- [x] Category dropdown loads without errors
- [x] Categories show proper names (CPU, GPU, etc.) not [object Object]
- [x] Filtering by category works correctly
- [x] Product list shows correct category chips
- [x] No duplicate key warnings
- [x] No white screen crashes

## Notes
- The fix handles both object format `{id, name}` and string format for backward compatibility
- All category comparisons now properly extract the `name` property from component objects
- The solution is defensive - checks for null, undefined, and type before accessing properties
