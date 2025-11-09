# VOUCHER TYPE FIX - Complete Guide

## Problem
When creating or editing a voucher with "percentage" type, it was saving incorrectly as "fixed" type. The voucher would display as "₱ 10.00" instead of "10%".

## Root Cause
The `vouchers` table in the database was missing a `discount_type` column to store whether the voucher is:
- **fixed**: A fixed amount discount (e.g., ₱100 off)
- **percent**: A percentage discount (e.g., 10% off)

## Solution Applied

### 1. Database Migration
**File**: `database/ADD_VOUCHER_TYPE_COLUMN.sql`

Added the `discount_type` column to the `vouchers` table:
```sql
ALTER TABLE vouchers 
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'fixed' 
CHECK (discount_type IN ('fixed', 'percent'));
```

**To Run**: Execute this SQL in Supabase SQL Editor

### 2. Service Layer Updates
**File**: `src/services/VoucherService.js`

Updated both `createVoucher()` and `updateVoucher()` methods to handle `discountType`:

```javascript
// In createVoucher
discount_type: voucherData.discountType || 'fixed',

// In updateVoucher
discount_type: voucherData.discountType || 'fixed',
```

### 3. Dialog Component Update
**File**: `src/view/Promotions/Promotion Components/VoucherEditDialog.jsx`

Updated `handleSave()` to send the discount type correctly:

```javascript
const voucherData = {
  ...voucher,
  discountType: formData.type, // Send the discount type (fixed or percent)
  // ... other fields
};
```

### 4. Main Component Update
**File**: `src/view/Promotions/Promotions.jsx`

#### Updated `handleSaveVoucher()`:
Added `discountType` to both create and update operations:
```javascript
discountType: voucherData.discountType || 'fixed',
```

#### Updated `loadVouchers()`:
Added logic to format price display based on discount type:
```javascript
const discountType = voucher.discount_type || 'fixed';
const formattedPrice = discountType === 'percent' 
  ? `${voucher.price}%` 
  : `₱ ${voucher.price.toFixed(2)}`;
```

## How It Works Now

### Creating a Voucher
1. User selects discount type: "Fixed Amount (₱)" or "Percentage (%)"
2. User enters the value (e.g., 10)
3. Dialog sends: `{ discountType: 'percent', price: 10 }`
4. Service saves to database: `{ discount_type: 'percent', price: 10 }`
5. Table displays: "10%"

### Editing a Voucher
1. User clicks edit on existing voucher
2. Dialog loads the `type` field from database `discount_type`
3. User changes type from "fixed" to "percent"
4. Dialog sends: `{ discountType: 'percent', price: 10 }`
5. Service updates database
6. Table refreshes and displays: "10%"

### Display Logic
- **Fixed Type**: `price: 100` → displays as **"₱ 100.00"**
- **Percent Type**: `price: 10` → displays as **"10%"**

## Testing Steps

1. **Run the SQL migration**:
   ```sql
   -- Execute database/ADD_VOUCHER_TYPE_COLUMN.sql in Supabase
   ```

2. **Test creating fixed voucher**:
   - Click "+ Add Voucher"
   - Name: "Fixed Discount"
   - Code: "FIX100"
   - Type: "Fixed Amount (₱)"
   - Amount: 100
   - Save
   - ✅ Should display as "₱ 100.00"

3. **Test creating percentage voucher**:
   - Click "+ Add Voucher"
   - Name: "Percentage Discount"
   - Code: "PCT10"
   - Type: "Percentage (%)"
   - Amount: 10
   - Save
   - ✅ Should display as "10%"

4. **Test editing voucher type**:
   - Edit existing "Fixed Discount" voucher
   - Change type to "Percentage (%)"
   - Change amount to 15
   - Save
   - ✅ Should now display as "15%"

5. **Test editing percentage voucher**:
   - Edit existing "Percentage Discount" voucher
   - Change type to "Fixed Amount (₱)"
   - Change amount to 50
   - Save
   - ✅ Should now display as "₱ 50.00"

## Data Flow

```
UI Dialog (VoucherEditDialog.jsx)
  ↓ formData.type = 'percent', formData.amount = 10
  ↓ handleSave() → { discountType: 'percent', price: 10 }
  ↓
Parent Component (Promotions.jsx)
  ↓ handleSaveVoucher() → { discountType: 'percent', price: 10 }
  ↓
Service Layer (VoucherService.js)
  ↓ createVoucher() → { discount_type: 'percent', price: 10 }
  ↓
Database (Supabase)
  ↓ INSERT INTO vouchers (discount_type, price) VALUES ('percent', 10)
  ↓
Load & Display
  ↓ loadVouchers() → reads discount_type from DB
  ↓ Formats: price = discountType === 'percent' ? '10%' : '₱ 10.00'
  ↓
UI Table
  ✅ Displays "10%"
```

## Key Field Mappings

| UI Field | Dialog State | Service Layer | Database Column | Display Format |
|----------|--------------|---------------|-----------------|----------------|
| Discount Type | `formData.type` | `discountType` | `discount_type` | (internal) |
| Amount/Value | `formData.amount` | `price` | `price` | "₱ XX.XX" or "XX%" |

## What Was Fixed

### Before ❌
- User selects "Percentage (%)" and enters "10"
- Saves to database without type information
- Always displays as "₱ 10.00" (treated as fixed)
- Edit dialog doesn't preserve the percentage type

### After ✅
- User selects "Percentage (%)" and enters "10"
- Saves to database with `discount_type = 'percent'`
- Displays correctly as "10%"
- Edit dialog loads the correct type from database
- User can switch between fixed and percentage types

## Files Modified

1. ✅ `database/ADD_VOUCHER_TYPE_COLUMN.sql` - NEW
2. ✅ `src/services/VoucherService.js` - Updated createVoucher() and updateVoucher()
3. ✅ `src/view/Promotions/Promotion Components/VoucherEditDialog.jsx` - Updated handleSave()
4. ✅ `src/view/Promotions/Promotions.jsx` - Updated handleSaveVoucher() and loadVouchers()

## Next Steps

After running the SQL migration, you should:
1. ✅ Test creating new vouchers (both fixed and percentage)
2. ✅ Test editing existing vouchers
3. ✅ Test switching types when editing
4. Consider adding the same functionality to discounts (they already have discount_type)
5. Update any voucher validation logic to handle percentage calculations differently

## Notes

- Existing vouchers in database will default to 'fixed' type (handled by migration)
- Percentage vouchers should have validation to ensure value doesn't exceed 100
- When applying vouchers during checkout, use the `discount_type` to calculate correctly:
  - **fixed**: `discount = price`
  - **percent**: `discount = (orderTotal * price) / 100`
