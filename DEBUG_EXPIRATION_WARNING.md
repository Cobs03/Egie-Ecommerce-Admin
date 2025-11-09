# Expiration Warning Debug Guide - Enhanced Logging

## What I Added

### Comprehensive Console Logging
Now you'll see detailed logs in your browser console when:
1. Opening edit dialogs
2. Dates are being parsed
3. Expiration calculations are made
4. Components are rendering

## How to Debug

### Step 1: Open Browser Console
1. Press **F12** in your browser
2. Go to **Console** tab
3. Clear console (trash icon) for clean output

### Step 2: Edit a Discount or Voucher
Click "Edit" on any discount or voucher

### Step 3: Check Console Logs

You should see logs like this:

#### For Discounts:
```
🔍 Discount data received: {id: 1, name: "DISCOUNT1", validFrom: "2025-10-19", validUntil: "2025-10-31", ...}
📅 Parsed dates: {activeFrom: "2025-10-19T00:00:00+08:00", activeTo: "2025-10-31T00:00:00+08:00"}
⚠️ Discount expiration check: {
  now: "2025-10-19T...",
  activeTo: "2025-10-31T...",
  daysLeft: 12,
  hoursLeft: 288,
  willShow: false,
  calculation: "2025-10-31T... - 2025-10-19T... = 12 days"
}
💡 Rendering discount dialog, showExpirationWarning: false, daysUntilExpiry: 12, hoursUntilExpiry: 288
```

#### For Vouchers:
```
🔍 Voucher data received: {id: 1, name: "SUMEER", code: "DDDDDD", active: "10/19/25 - 10/31/25", ...}
📅 Split dates: {activeFrom: "10/19/25", activeTo: "10/31/25"}
⚠️ Voucher expiration check: {
  activeTo: "10/31/25",
  expiryDate: "2025-10-31T00:00:00+08:00",
  now: "2025-10-19T...",
  daysLeft: 12,
  hoursLeft: 288,
  willShow: false,
  calculation: "2025-10-31T... - 2025-10-19T... = 12 days"
}
💡 Rendering voucher dialog, showExpirationWarning: false, daysUntilExpiry: 12, hoursUntilExpiry: 288
```

## Interpret the Logs

### Log Icons Meaning:
- 🔍 = Data received from API/props
- 📅 = Date parsing
- ⚠️ = Expiration calculation
- ❌ = Error/missing data
- 💡 = Component rendering

### Key Values to Check:

#### 1. `daysLeft`
- **If 12** → No warning (12 > 7)
- **If 5** → Should show warning (5 ≤ 7)
- **If -2** → Expired (negative = past)

#### 2. `willShow`
- **true** → Warning should appear
- **false** → No warning (correct if daysLeft > 7)

#### 3. `showExpirationWarning` (in render log)
- **true** → Alert component will render
- **false** → Alert won't render

## Troubleshooting Scenarios

### Scenario 1: willShow is false but daysLeft is 5
**Problem:** Logic error in calculation
**Check:**
```
willShow = daysLeft >= 0 && daysLeft <= 7
```
Should be `true` if daysLeft is 0-7

### Scenario 2: willShow is true but showExpirationWarning is false
**Problem:** State not updating
**Solution:** Check if `setShowExpirationWarning(willShow)` is being called

### Scenario 3: showExpirationWarning is true but no Alert appears
**Problem:** Component rendering issue
**Check:** Look for errors in console about Alert component

### Scenario 4: No logs appearing at all
**Problem:** useEffect not running
**Solution:** 
- Check if `open` prop is true
- Check if `discount` or `voucher` prop has data
- Verify dialog is actually opening

### Scenario 5: activeTo is undefined/null
**Problem:** Data not loaded from database
**Check:**
- API response in Network tab
- Database has valid dates
- Date format matches expected format

## Testing with Different Dates

### To Test Warning Appearing:
1. **Edit a discount**
2. **Set Active To** = tomorrow or any date within 7 days
3. **Check console** - should see `willShow: true`
4. **Check UI** - should see yellow warning banner

### Example Test Values (From Oct 19, 2025):

| Set Active To | daysLeft | willShow | Expected Message |
|--------------|----------|----------|------------------|
| 10/19/2025 11:00 PM | 0 | true | "in X hours" |
| 10/20/2025 | 1 | true | "tomorrow" |
| 10/22/2025 | 3 | true | "in 3 days" |
| 10/26/2025 | 7 | true | "in 7 days" |
| 10/27/2025 | 8 | false | No warning |
| 10/31/2025 | 12 | false | No warning |

## What to Share for Help

If the warning still doesn't work, share these console logs:

1. **🔍 Data received log** - Shows what data came in
2. **📅 Parsed dates log** - Shows if dates parsed correctly
3. **⚠️ Expiration check log** - Shows calculation details
4. **💡 Rendering log** - Shows state values during render

### Copy These Exact Values:
- `daysLeft: ?`
- `willShow: ?`
- `showExpirationWarning: ?`
- `activeTo format: ?`
- `now format: ?`

## Expected Flow

```
1. Edit Dialog Opens
   ↓
2. useEffect runs
   ↓
3. 🔍 Log: Data received
   ↓
4. 📅 Log: Dates parsed
   ↓
5. ⚠️ Log: Expiration calculated
   ↓
6. State updated (setShowExpirationWarning)
   ↓
7. Component re-renders
   ↓
8. 💡 Log: Render with current state
   ↓
9. If showExpirationWarning = true
   → Yellow Alert appears
```

## Common Issues

### Issue: "daysLeft is NaN"
**Cause:** Date parsing failed
**Fix:** Check date format matches `dayjs` expectation

### Issue: "willShow is true but Alert not visible"
**Cause:** CSS/styling issue or Alert component error
**Fix:** Check browser Elements tab for Alert in DOM

### Issue: "Logs appear twice"
**Cause:** React Strict Mode (normal in development)
**Fix:** This is expected, ignore duplicates

### Issue: "State updates but Alert doesn't re-render"
**Cause:** State update not triggering re-render
**Fix:** Check dependency array in useEffect

## Next Steps

1. **Open discount/voucher edit dialog**
2. **Open console (F12)**
3. **Copy ALL console output**
4. **Share the logs** if issue persists

---

**Status:** Enhanced debug logging active
**Files:** DiscountEditDialog.jsx, VoucherEditDialog.jsx
**Branch:** voucher-functionality
