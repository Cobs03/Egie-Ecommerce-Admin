# Fix Applied: Expiration Warning Not Showing in Edit Mode

## Problem Identified
The expiration warning was **not resetting properly** when:
- Opening edit dialog with a discount/voucher that has `activeTo` date
- The state wasn't being cleared when `activeTo` was missing

## Root Cause
Missing `else` block to reset warning states when `activeTo` is null or undefined.

## Solution Applied

### DiscountEditDialog.jsx
**Before:**
```javascript
if (activeTo) {
  // Calculate and set warning
}
// ❌ No else block - states not reset
```

**After:**
```javascript
if (activeTo) {
  // Calculate and set warning
  console.log('Discount expiration check:', { daysLeft, hoursLeft, willShow: daysLeft >= 0 && daysLeft <= 7 });
} else {
  // ✅ Reset all warning states
  setShowExpirationWarning(false);
  setDaysUntilExpiry(0);
  setHoursUntilExpiry(0);
}
```

### VoucherEditDialog.jsx
**Before:**
```javascript
if (activeTo) {
  // Calculate and set warning
}
// ❌ No else block - states not reset
```

**After:**
```javascript
if (activeTo) {
  // Calculate and set warning
  console.log('Voucher expiration check:', { activeTo, expiryDate: expiryDate.format(), daysLeft, hoursLeft, willShow: daysLeft >= 0 && daysLeft <= 7 });
} else {
  // ✅ Reset all warning states
  setShowExpirationWarning(false);
  setDaysUntilExpiry(0);
  setHoursUntilExpiry(0);
}
```

## Changes Made
1. ✅ Added `else` block to reset warning states
2. ✅ Added console logging for debugging
3. ✅ Properly clears old state before setting new values

## How to Test

### Quick Test (Tomorrow Expiration)
1. Edit any discount
2. Set **Active To** = **10/20/2025** (tomorrow)
3. ✅ Should see: "⚠️ This discount will expire tomorrow!"

### Console Test
1. Open browser DevTools (F12)
2. Edit a discount/voucher
3. Check console for: `Discount expiration check: { daysLeft: X, ...willShow: true }`

### Why Your Previous Test Didn't Show Warning
Your discount expires on **10/31/2025** (12 days away)
- Warning only shows for **0-7 days**
- 12 days > 7 days = **No warning** (correct behavior!)

## Test Dates That WILL Show Warning

From today (10/19/2025):
- ✅ **10/20/2025** → "tomorrow"
- ✅ **10/21/2025** → "in 2 days"  
- ✅ **10/22/2025** → "in 3 days"
- ✅ **10/26/2025** → "in 7 days"
- ❌ **10/27/2025** → No warning (8 days)
- ❌ **10/31/2025** → No warning (12 days)

## Files Modified
- `src/view/Promotions/Promotion Components/DiscountEditDialog.jsx`
- `src/view/Promotions/Promotion Components/VoucherEditDialog.jsx`

## Next Steps
1. Test with a date within 7 days
2. Check browser console for debug logs
3. Once confirmed working, we can remove console logs

---

**Status:** ✅ Fixed - Ready for Testing
**Branch:** voucher-functionality
