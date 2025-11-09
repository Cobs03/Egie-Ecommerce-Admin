# Expiration Warning - Testing & Debugging Guide

## Current Issue Fixed
✅ Added proper state reset when `activeTo` is null
✅ Added console logging for debugging

## How to Test the Warning

### Step 1: Test with Discount
1. **Edit an existing discount** with expiration date
2. **Open browser console** (F12)
3. Look for console log: `Discount expiration check: { daysLeft: X, hoursLeft: Y, willShow: true/false }`

### Step 2: Test with Voucher  
1. **Edit an existing voucher** with expiration date
2. **Open browser console** (F12)
3. Look for console log: `Voucher expiration check: { activeTo: ..., daysLeft: X, hoursLeft: Y, willShow: true/false }`

## Why Your Current Test Didn't Show Warning

Looking at your discount screenshot:
- **Active From:** 10/19/2025 (today)
- **Active To:** 10/31/2025 (12 days from now)
- **Warning Threshold:** 7 days
- **Result:** ❌ No warning (12 days > 7 days)

## Test Scenarios

### ✅ Should Show Warning (0-7 days)

| Expiration Date | Days Away | Expected Message |
|----------------|-----------|------------------|
| 10/19/2025 3pm | 0 (5 hours) | "in 5 hours" |
| 10/19/2025 11pm | 0 (today) | "today" |
| 10/20/2025 | 1 day | "tomorrow" |
| 10/21/2025 | 2 days | "in 2 days" |
| 10/26/2025 | 7 days | "in 7 days" |

### ❌ Should NOT Show Warning (8+ days)

| Expiration Date | Days Away | Expected Result |
|----------------|-----------|-----------------|
| 10/27/2025 | 8 days | No warning |
| 10/31/2025 | 12 days | No warning |
| 11/19/2025 | 31 days | No warning |

## Quick Test Steps

### Test 1: Create Discount Expiring Tomorrow
1. Click "Add Discount"
2. Fill in discount details
3. Set **Active To** = **10/20/2025** (tomorrow)
4. ✅ Should see: "⚠️ This discount will expire tomorrow!"

### Test 2: Edit Discount to Expire in 3 Days
1. Edit existing discount
2. Change **Active To** = **10/22/2025** (3 days)
3. ✅ Should see: "⚠️ This discount will expire in 3 days!"

### Test 3: Create Voucher Expiring in 5 Hours
1. Click "Add Voucher"
2. Fill in voucher details
3. Set **Active To** = **10/19/2025 11:00 PM** (later today)
4. ✅ Should see: "⚠️ This voucher will expire in X hours!"

### Test 4: Remove Warning by Extending Date
1. Edit discount with warning showing
2. Change **Active To** = **11/19/2025** (next month)
3. ✅ Warning should disappear

## Console Debugging

### What to Look For in Console

**For Discounts:**
```javascript
Discount expiration check: {
  daysLeft: 2,
  hoursLeft: 48,
  willShow: true  // ← Should be true if daysLeft is 0-7
}
```

**For Vouchers:**
```javascript
Voucher expiration check: {
  activeTo: "10/21/25",
  expiryDate: "2025-10-21T00:00:00+08:00",
  daysLeft: 2,
  hoursLeft: 48,
  willShow: true  // ← Should be true if daysLeft is 0-7
}
```

## Common Issues & Solutions

### Issue 1: No Console Logs Appearing
**Problem:** Dialog not opening or dates not loading
**Solution:** 
- Refresh the page
- Check network tab for API errors
- Verify discount/voucher has valid dates

### Issue 2: willShow is false but should be true
**Problem:** Date calculation issue
**Solution:**
- Check console: What is `daysLeft` value?
- Verify system time is correct (current date: 10/19/2025)
- Check if `activeTo` is properly parsed

### Issue 3: Warning shows but with wrong message
**Problem:** Logic error in message display
**Solution:**
- Check `daysUntilExpiry` and `hoursUntilExpiry` values
- Verify the conditional logic in Alert component

### Issue 4: Warning doesn't update when changing date
**Problem:** Event handler not triggering
**Solution:**
- Ensure `handleDateChange` is properly connected
- Check if DatePicker is calling the handler
- Look for console logs when changing dates

## Removing Console Logs (After Testing)

Once testing is complete, remove these lines:

**In DiscountEditDialog.jsx (line ~89):**
```javascript
console.log('Discount expiration check:', { daysLeft, hoursLeft, willShow: daysLeft >= 0 && daysLeft <= 7 });
```

**In VoucherEditDialog.jsx (line ~77):**
```javascript
console.log('Voucher expiration check:', { activeTo, expiryDate: expiryDate.format(), daysLeft, hoursLeft, willShow: daysLeft >= 0 && daysLeft <= 7 });
```

## Expected User Flow

1. **Admin opens edit dialog** for discount/voucher
2. **System automatically checks** expiration date
3. **If expiring within 7 days:**
   - Yellow warning banner appears at top
   - Shows specific time remaining
   - Admin can extend date or let it expire
4. **If changing date in dialog:**
   - Warning updates in real-time
   - Appears/disappears based on new date

## Current Date for Testing
**Today:** October 19, 2025

**Quick Reference:**
- Tomorrow: 10/20/2025 (1 day - shows "tomorrow")
- 3 days: 10/22/2025 (shows "in 3 days")
- 7 days: 10/26/2025 (shows "in 7 days")
- 8 days: 10/27/2025 (no warning)

---

**Status:** Ready for testing with console debugging enabled
**Branch:** voucher-functionality
