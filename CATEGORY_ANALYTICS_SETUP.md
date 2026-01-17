# Category Analytics Setup Guide

## What Was Added

You now have **separate analytics for both Brands and Categories**:

### **Brand Analysis Tab** (Tab 3)
- Shows sales by manufacturer/brand (Samsung, MSI, etc.)
- Displays which brands are selling the most units
- Uses the existing `brands` table

### **Category Analysis Tab** (Tab 4) 
- Shows sales by product category (Monitors, Graphics Cards, Keyboards, etc.)
- Displays the top-selling product in each category
- Shows how many different products sold per category
- Uses the `product_categories` and `product_category_assignments` tables

## Setup Steps

### 1. Run the Database Function
Execute this SQL in your Supabase SQL Editor:

```bash
# Open the file:
database/CATEGORY_SALES_FUNCTION.sql
```

Copy and run the entire contents in Supabase SQL Editor.

### 2. Ensure Tables Exist
Make sure you have run the dynamic schema setup:

```bash
# These tables must exist:
- product_categories
- product_category_assignments
```

If they don't exist, run:
```bash
database/CLEAN_DYNAMIC_SCHEMA.sql
```

### 3. Assign Products to Categories
Your products need to be assigned to categories via the `product_category_assignments` table:

```sql
-- Example: Assign a product to a category
INSERT INTO product_category_assignments (product_id, category_id, specifications)
VALUES 
  ('product-uuid-here', 'category-uuid-here', '{}');
```

You can do this through your admin panel or directly in Supabase.

## What You'll See

### Brand Analysis Shows:
- **Pie Chart**: Distribution of sales across brands
- **Cards**: Each brand with:
  - Unit count
  - Percentage of total sales
- **Bar Chart**: Visual comparison of brand performance

### Category Analysis Shows:
- **Pie Chart**: Distribution of sales across categories
- **Cards**: Each category with:
  - Unit count sold
  - Number of different products in that category
  - Top-selling product name and its sales count
  - Percentage of total sales
- **Bar Chart**: Visual comparison of category performance
- **Tooltip Details**: Revenue and top product when hovering

## Data Requirements

For categories to show data, you need:
1. ✅ Categories created in `product_categories` table
2. ✅ Products assigned to categories in `product_category_assignments` table
3. ✅ Orders with those products (status: 'completed' or 'delivered')

## Example Data Check

```sql
-- Check if you have categories
SELECT * FROM product_categories;

-- Check if products are assigned to categories
SELECT 
  p.name as product_name,
  pc.name as category_name
FROM products p
JOIN product_category_assignments pca ON pca.product_id = p.id
JOIN product_categories pc ON pc.id = pca.category_id;

-- Check sales data
SELECT * FROM get_actual_category_sales(
  NOW() - INTERVAL '30 days',
  NOW()
);
```

## Benefits

- **Better Insights**: See both manufacturer performance (brands) and product type performance (categories)
- **Inventory Planning**: Know which product categories are hot sellers
- **Marketing**: Target promotions based on category and brand performance
- **Product Strategy**: Identify which categories need more product variety
