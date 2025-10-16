# Activity Logs & Promote/Demote Feature - Setup Guide

## ✅ What I've Implemented

### 1. **Admin Logs Table** (`admin_logs`)
- Created SQL file: `database/CREATE_ADMIN_LOGS_TABLE.sql`
- **IMPORTANT**: Run this SQL in your Supabase SQL Editor first!

```sql
-- Table structure:
- id: Unique identifier
- user_id: Who performed the action
- action_type: Type of action (product_create, user_promote, etc.)
- action_description: Human-readable description
- target_type: What was affected (user, product, etc.)
- target_id: ID of the affected item
- metadata: Additional JSON data
- created_at: Timestamp
```

### 2. **AdminLogService** (`services/AdminLogService.js`)
Service to create and fetch activity logs:
- `createLog()` - Create a new log entry
- `getUserLogs()` - Fetch logs for a specific user
- `getAllLogs()` - Fetch all logs with user info
- `formatTimeAgo()` - Format timestamps ("2m ago", "Yesterday")

### 3. **ManageUserDrawer** - Updated Features
✅ **Real Activity Logs**
- Fetches actual logs from database when drawer opens
- Shows loading spinner while fetching
- Shows "No activity logs yet" if empty
- Displays last 5 activities

✅ **Promote Button** (Plus Icon)
- Employee → Manager → Admin
- Disabled when already Admin
- Updates database role
- Creates activity log

✅ **Demote Button** (Minus Icon)
- Admin → Manager → Employee
- Disabled when already Employee
- Updates database role
- Creates activity log

### 4. **User.jsx** - Enhanced Functionality
✅ **Database Integration**
- Promote function now updates `profiles.role` in database
- Demote function now updates `profiles.role` in database
- Both create activity logs when actions are performed
- Refreshes user list after role change

## 🚀 Setup Instructions

### Step 1: Create the admin_logs table
1. Open your Supabase project
2. Go to SQL Editor
3. Copy and paste the contents of `database/CREATE_ADMIN_LOGS_TABLE.sql`
4. Click "Run"

### Step 2: Test the Features

#### Test Promote/Demote:
1. Go to Users page
2. Click the 3 dots (•••) on any employee
3. Click the **Plus (+)** button to promote
4. Click the **Minus (-)** button to demote
5. Confirm in the dialog
6. Check that the role badge updates

#### Test Activity Logs:
1. Open the employee drawer (3 dots menu)
2. Scroll to "Activity Log" section
3. You should see:
   - Recent activities (if any)
   - "No activity logs yet" (if user hasn't done anything)
4. Click "See Logs" to view more

## 📝 How to Create Activity Logs in Other Features

When you add/update/delete products, orders, etc., create logs like this:

```javascript
import AdminLogService from '../services/AdminLogService';
import { useAuth } from '../contexts/AuthContext';

// In your component:
const { user } = useAuth();

// After creating a product:
await AdminLogService.createLog({
  userId: user.id,
  actionType: 'product_create',
  actionDescription: `Created product: ${productName}`,
  targetType: 'product',
  targetId: productId,
  metadata: { price, sku }
});

// After updating:
await AdminLogService.createLog({
  userId: user.id,
  actionType: 'product_update',
  actionDescription: `Updated stock for ${productName}`,
  targetType: 'product',
  targetId: productId,
  metadata: { oldStock: 10, newStock: 5 }
});
```

## 🎯 What's Working Now

✅ Phone numbers display dynamically in ManageUserDrawer  
✅ Logout button properly signs out users  
✅ Admin, Manager, Employee can all log in  
✅ Access denied shows on login page (not separate page)  
✅ Activity logs fetch from database  
✅ Promote button updates database and creates log  
✅ Demote button updates database and creates log  
✅ Loading states and empty states for logs  

## 📊 Activity Log Action Types

Suggested action types for consistency:

**User Management:**
- `user_create` - Created new user
- `user_update` - Updated user info
- `user_delete` - Deleted user
- `user_promote` - Promoted user role
- `user_demote` - Demoted user role
- `user_ban` - Banned customer

**Product Management:**
- `product_create` - Created product
- `product_update` - Updated product
- `product_delete` - Deleted product
- `stock_update` - Updated stock quantity

**Order Management:**
- `order_create` - New order placed
- `order_update` - Order status changed
- `order_cancel` - Order cancelled
- `order_refund` - Order refunded

**Promotions:**
- `discount_create` - Created discount
- `discount_update` - Updated discount
- `discount_delete` - Deleted discount

## 🔍 Troubleshooting

**Logs not showing?**
- Make sure you ran the CREATE_ADMIN_LOGS_TABLE.sql
- Check browser console for errors
- Verify Supabase connection

**Promote/Demote not working?**
- Check that `profiles.role` column exists
- Verify current user has permission
- Check console for errors

**Need more logs displayed?**
- Edit ManageUserDrawer.jsx line ~45
- Change `getUserLogs(user.id, 5)` to `getUserLogs(user.id, 10)`

Enjoy your new features! 🎉
