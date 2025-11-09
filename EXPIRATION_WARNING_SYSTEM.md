# Expiration Warning System for Discounts & Vouchers

## Overview
The expiration warning system provides real-time notifications to administrators when editing discounts or vouchers that are about to expire. This helps prevent unexpected expirations and ensures timely updates to promotional campaigns.

## Features

### 1. **Automatic Warning Display**
- Warnings appear automatically at the top of edit dialogs
- Triggered when a discount/voucher will expire within 7 days
- Updates in real-time as dates are changed

### 2. **Smart Time Display**
The system intelligently displays expiration time based on urgency:

#### Hours-Based Display (< 24 hours)
- **"very soon"** - Less than 1 hour remaining
- **"in 1 hour"** - Exactly 1 hour remaining
- **"in X hours"** - 2-23 hours remaining

#### Days-Based Display (≥ 24 hours)
- **"today"** - Less than 24 hours but more than threshold
- **"tomorrow"** - 1 day remaining
- **"in X days"** - 2-7 days remaining

### 3. **Visual Alert**
- Yellow warning banner (MUI Alert component)
- Warning icon (⚠️) for immediate attention
- Positioned prominently at the top of the form

## Implementation Details

### Discount Edit Dialog
**File:** `src/view/Promotions/Promotion Components/DiscountEditDialog.jsx`

**State Variables:**
```javascript
const [showExpirationWarning, setShowExpirationWarning] = useState(false);
const [daysUntilExpiry, setDaysUntilExpiry] = useState(0);
const [hoursUntilExpiry, setHoursUntilExpiry] = useState(0);
```

**Logic:**
- Calculates days and hours until expiry using Day.js
- Shows warning if 0-7 days remaining
- Updates on initial load and date changes

### Voucher Edit Dialog
**File:** `src/view/Promotions/Promotion Components/VoucherEditDialog.jsx`

**State Variables:**
```javascript
const [showExpirationWarning, setShowExpirationWarning] = useState(false);
const [daysUntilExpiry, setDaysUntilExpiry] = useState(0);
const [hoursUntilExpiry, setHoursUntilExpiry] = useState(0);
```

**Logic:**
- Same calculation logic as discounts
- Parses voucher date format (MM/DD/YY)
- Updates dynamically with user input

## User Experience

### When Opening Edit Dialog
1. System checks the "Active To" / expiration date
2. Calculates time remaining
3. If ≤ 7 days, displays appropriate warning message
4. Message updates if user changes the expiration date

### Example Messages
- ⚠️ This discount will expire **very soon**!
- ⚠️ This discount will expire **in 3 hours**!
- ⚠️ This discount will expire **today**!
- ⚠️ This discount will expire **tomorrow**!
- ⚠️ This discount will expire **in 5 days**!

## Benefits

### 1. **Prevents Accidental Expirations**
- Clear visibility of upcoming expirations
- Allows proactive extension of active campaigns

### 2. **Improved Time Awareness**
- Hour-level precision for urgent situations
- Day-level clarity for planning ahead

### 3. **Better Decision Making**
- Admins can decide whether to extend or let expire
- Helps manage promotional timelines effectively

### 4. **Reduced Support Issues**
- Fewer customer complaints about expired promotions
- Better inventory and revenue management

## Testing Recommendations

### Test Cases
1. **7 Days Warning**
   - Set expiration to 7 days from now
   - Verify "in 7 days" message appears

2. **Tomorrow Warning**
   - Set expiration to tomorrow
   - Verify "tomorrow" message appears

3. **Today Warning**
   - Set expiration to later today
   - Verify "today" message appears

4. **Hours Warning**
   - Set expiration to 5 hours from now
   - Verify "in 5 hours" message appears

5. **Very Soon Warning**
   - Set expiration to 30 minutes from now
   - Verify "very soon" message appears

6. **No Warning**
   - Set expiration to 8+ days from now
   - Verify no warning appears

7. **Date Change Update**
   - Open edit dialog with warning
   - Change date to 10 days from now
   - Verify warning disappears

## Technical Notes

### Dependencies
- **Day.js**: For date calculations
- **@mui/material/Alert**: For warning display

### Calculation Logic
```javascript
const now = dayjs();
const daysLeft = expiryDate.diff(now, "day");
const hoursLeft = expiryDate.diff(now, "hour");

// Show warning if 0-7 days remaining
setShowExpirationWarning(daysLeft >= 0 && daysLeft <= 7);
```

### Display Logic
```javascript
{showExpirationWarning && (
  <Alert severity="warning" sx={{ mb: 2 }}>
    ⚠️ This discount will expire {
      daysUntilExpiry === 0 && hoursUntilExpiry < 24
        ? hoursUntilExpiry === 0
          ? 'very soon'
          : hoursUntilExpiry === 1
          ? 'in 1 hour'
          : `in ${hoursUntilExpiry} hours`
        : daysUntilExpiry === 0
        ? 'today'
        : daysUntilExpiry === 1
        ? 'tomorrow'
        : `in ${daysUntilExpiry} days`
    }!
  </Alert>
)}
```

## Future Enhancements

### Possible Improvements
1. **Email Notifications**: Send email alerts for expiring promotions
2. **Dashboard Widget**: Summary of expiring promotions on main dashboard
3. **Bulk Extension**: Quick action to extend multiple expiring items
4. **Color Coding**: Red for <24 hours, yellow for 1-3 days, orange for 4-7 days
5. **Sound Alerts**: Optional audio notification for critical expirations
6. **Minutes Display**: Show minutes when less than 1 hour remains
7. **Auto-Extend Option**: Suggest automatic extension for successful campaigns

## Maintenance

### Code Locations
- **Discount Edit:** `src/view/Promotions/Promotion Components/DiscountEditDialog.jsx`
- **Voucher Edit:** `src/view/Promotions/Promotion Components/VoucherEditDialog.jsx`

### Key Variables to Monitor
- `showExpirationWarning`: Boolean flag for display
- `daysUntilExpiry`: Days remaining (integer)
- `hoursUntilExpiry`: Hours remaining (integer)
- Warning threshold: Currently 7 days (can be adjusted)

### Updating the Threshold
To change the 7-day warning period, modify:
```javascript
setShowExpirationWarning(daysLeft >= 0 && daysLeft <= 7); // Change 7 to desired days
```

## Conclusion
The expiration warning system provides critical visibility into promotional campaign lifecycles, helping administrators manage discounts and vouchers more effectively. The smart time display ensures appropriate urgency levels are communicated clearly.
