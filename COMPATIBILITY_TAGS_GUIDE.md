# Compatibility Tags Implementation Guide

## Overview
This feature allows you to add compatibility tags to products for better recommendations. For example, a motherboard with "AMD AM5" and "DDR5" tags will show compatible CPUs and RAM with matching tags.

## Implementation Steps

### 1. Database Setup
Run the SQL migration in Supabase:
```sql
-- Located in: database/ADD_COMPATIBILITY_TAGS_COLUMN.sql
ALTER TABLE products
ADD COLUMN IF NOT EXISTS compatibility_tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_products_compatibility_tags 
ON products USING GIN (compatibility_tags);
```

### 2. Admin Panel - Product Creation
When creating/editing a product, you'll see a new "Compatibility Tags" field with:
- **Autocomplete dropdown** with suggested tags
- **Free text input** - type custom tags and press Enter
- **Visual chips** showing selected tags
- **Easy removal** - click X on any chip to remove

#### Suggested Tags Included:
**Motherboard Compatibility:**
- Intel LGA1700, Intel LGA1200
- AMD AM5, AMD AM4

**RAM Types:**
- DDR5, DDR4, DDR3

**Storage Interfaces:**
- M.2 NVMe, SATA
- PCIe 4.0, PCIe 3.0

**Power Connectors:**
- 24-pin ATX, 8-pin EPS
- 6-pin PCIe, 8-pin PCIe

**Form Factors:**
- ATX, Micro-ATX, Mini-ITX

**GPU/Cooling:**
- Dual Slot, Triple Slot
- 120mm Fan, 140mm Fan, AIO Compatible

### 3. How to Use in Admin

**Creating a Product:**
1. Fill in basic info (name, description, etc.)
2. Scroll to "Compatibility Tags" field
3. Click the field to see suggestions OR type custom tags
4. Select/type multiple tags
5. Tags are automatically saved when you save the product

**Example for a Motherboard:**
```
Product: ASUS ROG Strix B650
Tags: AMD AM5, DDR5, PCIe 4.0, ATX
```

**Example for RAM:**
```
Product: Corsair Vengeance 32GB
Tags: DDR5, AMD AM5, Intel LGA1700
```

**Example for CPU:**
```
Product: AMD Ryzen 7 7700X
Tags: AMD AM5, DDR5
```

### 4. Frontend Implementation (Customer View)

**Query Compatible Products:**
```javascript
// Example: Show products compatible with current product's tags
const currentProduct = {
  name: "ASUS ROG Strix B650",
  compatibility_tags: ['AMD AM5', 'DDR5', 'PCIe 4.0']
};

// Find products with ANY matching tags
const { data: compatibleProducts } = await supabase
  .from('products')
  .select('*')
  .overlaps('compatibility_tags', currentProduct.compatibility_tags)
  .neq('id', currentProduct.id) // Exclude current product
  .limit(6);
```

**Filter by Category + Tags:**
```javascript
// Show only CPUs compatible with this motherboard
const { data: compatibleCPUs } = await supabase
  .from('products')
  .select('*')
  .contains('selected_components', [{ id: 'cpu-category-id' }])
  .overlaps('compatibility_tags', ['AMD AM5'])
  .limit(6);
```

### 5. Best Practices

**Tagging Strategy:**
1. **Be specific** - "AMD AM5" is better than just "AMD"
2. **Use industry standards** - Stick to known terms
3. **Multiple tags** - Add all relevant compatibility points
4. **Cross-category** - Motherboard should include CPU socket, RAM type, storage support

**Example Tag Combinations:**

**Motherboard Product:**
- Socket: AMD AM5 or Intel LGA1700
- RAM: DDR5 or DDR4
- Storage: M.2 NVMe, PCIe 4.0
- Form Factor: ATX, Micro-ATX, Mini-ITX

**CPU Product:**
- Socket: AMD AM5 or Intel LGA1700
- RAM Support: DDR5 or DDR4

**RAM Product:**
- Type: DDR5 or DDR4
- Compatible with: AMD AM5, Intel LGA1700

**Storage Product:**
- Interface: M.2 NVMe, SATA
- Speed: PCIe 4.0, PCIe 3.0

**PSU Product:**
- Connectors: 24-pin ATX, 8-pin EPS, 8-pin PCIe
- Form Factor: ATX

**GPU Product:**
- Slot Size: Dual Slot, Triple Slot
- Power: 8-pin PCIe (x2)

### 6. Testing

**After running the migration:**
1. Go to Admin → Products → Create Product
2. Verify you see "Compatibility Tags" field
3. Try selecting suggested tags
4. Try typing custom tags (press Enter)
5. Save product and verify tags are stored
6. Edit the product and verify tags load correctly

**Database Verification:**
```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'compatibility_tags';

-- Check products with tags
SELECT id, name, compatibility_tags 
FROM products 
WHERE compatibility_tags IS NOT NULL 
AND array_length(compatibility_tags, 1) > 0;
```

### 7. Benefits

✅ **Better Recommendations** - Show truly compatible products
✅ **Reduced Returns** - Customers buy compatible parts
✅ **Improved UX** - Easy product discovery
✅ **Flexible System** - Add new tags anytime
✅ **Fast Queries** - GIN index for performance
✅ **Admin Friendly** - Simple UI with suggestions

## Need Help?

If you encounter issues:
1. Check if migration ran successfully
2. Verify the column exists in products table
3. Check browser console for errors
4. Ensure you're passing the tags correctly when saving products
