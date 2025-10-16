# 👥 Complete Role-Based Access Control (RBAC) Implementation

## 📊 Permission Matrix

| Resource | Admin | Manager | Employee |
|----------|-------|---------|----------|
| **Products** | ✅ CRUD | ✅ CRUD | 👁️ Read |
| **Bundles** | ✅ CRUD | ✅ CRUD | 👁️ Read |
| **Brands** | ✅ CRUD | ✅ CRUD | 👁️ Read |
| **Orders** | ✅ CRUD | ✅ CRUD | 👁️ Read |
| **Customers** | ✅ CRUD | ✅ CRUD | 👁️ Read |
| **Activity Logs** | 👁️ Read | 👁️ Read | 👁️ Read |
| **User Management** | ✅ CRUD | ❌ None | ❌ None |
| **Product Images** | ✅ CRUD | ✅ CRUD | 👁️ Read |

**Legend:**
- ✅ CRUD = Full Access (Create, Read, Update, Delete)
- 👁️ Read = View Only (Cannot modify)
- ❌ None = No Access

---

## 👑 Admin Role
**Complete System Control**

### ✅ Can Do:
- Create, edit, delete products
- Create, edit, delete bundles
- Create, edit, delete brands
- Manage all orders
- Manage all customers
- **Promote/demote/delete users** (unique to admin)
- Upload, edit, delete product images
- View all activity logs
- Access all admin features

### ❌ Cannot Do:
- Nothing - full access

---

## 👔 Manager Role
**Operations & Inventory Management**

### ✅ Can Do:
- **Products:** Create, edit, delete, view all
- **Bundles:** Create, edit, delete, view all
- **Brands:** Create, edit, delete, view all
- **Orders:** Process, update, view all
- **Customers:** View, manage customer data
- **Images:** Upload, edit, delete product images
- **Logs:** View all activity logs
- Create activity logs for their actions

### ❌ Cannot Do:
- Promote or demote users
- Delete users
- Access user management section
- Change user roles

### 🔒 Error Messages:
When attempting restricted actions:
```
❌ "Only admins can manage users"
❌ "Only admins can promote/demote users"
```

---

## 👤 Employee Role
**View-Only / Customer Support**

### ✅ Can Do:
- **Products:** View all products (read-only)
- **Bundles:** View all bundles (read-only)
- **Brands:** View all brands (read-only)
- **Orders:** View all orders (read-only)
- **Customers:** View customer information (read-only)
- **Images:** View product images
- **Logs:** View activity logs (read-only)
- Create logs for their own view actions

### ❌ Cannot Do:
- Create new products
- Edit existing products
- Delete products
- Create new bundles
- Edit existing bundles
- Delete bundles
- Upload or edit product images
- Modify orders
- Edit customer information
- Promote/demote users
- Delete users
- Any create/update/delete operations

### 🔒 Error Messages:
When attempting restricted actions:
```
❌ "Only admins and managers can update products"
❌ "Only admins and managers can create bundles"
❌ "Only admins and managers can delete products"
❌ "Only admins and managers can upload images"
```

---

## 🎯 Use Cases by Role

### Admin Use Cases:
1. **Full system administration**
2. Manage user accounts and roles
3. Handle escalated issues
4. System configuration
5. All manager and employee tasks

### Manager Use Cases:
1. **Inventory management** - Add new products
2. **Pricing updates** - Edit product prices
3. **Bundle creation** - Create promotional bundles
4. **Order processing** - Fulfill orders
5. **Stock management** - Update inventory levels
6. **Image management** - Upload product photos

### Employee Use Cases:
1. **Customer support** - Look up product info
2. **Order lookup** - Check order status
3. **Product inquiry** - View product details
4. **Price checking** - View current prices
5. **Stock checking** - View availability
6. **Customer info lookup** - View customer details

---

## 🔐 Security Layers

### Layer 1: Service Layer (Frontend)
**Files:** `ProductService.js`, `BundleService.js`
- Checks user role before making API calls
- Provides immediate feedback
- User-friendly error messages
- Prevents unnecessary database calls

### Layer 2: Database RLS (Backend)
**File:** `UPDATE_RLS_FOR_MANAGERS.sql`
- Enforces permissions at database level
- Cannot be bypassed by API manipulation
- Absolute security enforcement
- Separate policies for SELECT, INSERT, UPDATE, DELETE

---

## 🚀 Implementation Checklist

### ✅ Completed:
- [x] ProductService role checks (admin + manager)
- [x] BundleService role checks (admin + manager)
- [x] Database RLS policies for all roles
- [x] Separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
- [x] Storage policies for product images
- [x] Activity log policies
- [x] Employee read-only access

### 📋 Recommended UI Enhancements:
- [ ] Hide edit/delete buttons for employees
- [ ] Show "Read-Only Mode" indicator for employees
- [ ] Disable form fields for employees
- [ ] Display role badge in navigation bar
- [ ] Add tooltips explaining permission restrictions
- [ ] Show "Upgrade to Manager" message for restricted actions

---

## 🧪 Testing Guide

### Test Admin Role:
```
✅ Login as admin
✅ Create a product → Success
✅ Edit a product → Success
✅ Delete a product → Success
✅ Promote a user to manager → Success
✅ Delete a user → Success
✅ View activity logs → Success
```

### Test Manager Role:
```
✅ Login as manager
✅ Create a product → Success
✅ Edit a product → Success
✅ Delete a product → Success
❌ Try to promote user → Error: "Only admins can manage users"
❌ Try to delete user → Error: "Only admins can manage users"
✅ View activity logs → Success
```

### Test Employee Role:
```
✅ Login as employee
✅ View products → Success (read-only)
✅ View bundles → Success (read-only)
❌ Try to edit product → Error: "Only admins and managers can update products"
❌ Try to create bundle → Error: "Only admins and managers can create bundles"
❌ Try to delete product → Error: "Only admins and managers can delete products"
❌ Try to upload image → Error: "Only admins and managers can upload images"
✅ View activity logs → Success (read-only)
```

---

## 📊 Database Policies Summary

### Products Table:
- `SELECT` - All authenticated users (admin, manager, employee)
- `INSERT` - Admin and Manager only
- `UPDATE` - Admin and Manager only
- `DELETE` - Admin and Manager only

### Bundles Table:
- `SELECT` - All authenticated users (admin, manager, employee)
- `INSERT` - Admin and Manager only
- `UPDATE` - Admin and Manager only
- `DELETE` - Admin and Manager only

### Storage (Product Images):
- `SELECT` - All authenticated users (admin, manager, employee)
- `INSERT` - Admin and Manager only
- `UPDATE` - Admin and Manager only
- `DELETE` - Admin and Manager only

### Admin Logs:
- `SELECT` - All authenticated users (admin, manager, employee)
- `INSERT` - All authenticated users (can create their own logs)

---

## 🔄 Migration Path

**Step 1:** Run SQL migration
```sql
-- Execute: database/UPDATE_RLS_FOR_MANAGERS.sql
```

**Step 2:** Verify policies
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('products', 'bundles', 'brands')
ORDER BY tablename, cmd;
```

**Step 3:** Test each role
- Admin account test
- Manager account test
- Employee account test

**Step 4:** Monitor activity logs
- Check that logs are created correctly
- Verify role information is captured
- Confirm failed attempts are not logged

---

## 💡 Best Practices

1. **Always check both layers:**
   - Service layer for UX
   - RLS policies for security

2. **Provide clear error messages:**
   - Tell users what they can't do
   - Explain why (role restrictions)

3. **Log successful actions only:**
   - Don't log failed permission checks
   - Log when actions actually succeed

4. **UI should reflect permissions:**
   - Hide buttons users can't use
   - Show role badges
   - Disable restricted form fields

5. **Test with real user accounts:**
   - Don't just test as admin
   - Verify each role separately

---

## 📞 Support & Troubleshooting

### Issue: Manager can't edit products
**Solution:** Run the SQL migration `UPDATE_RLS_FOR_MANAGERS.sql`

### Issue: Employee can edit products
**Problem:** RLS policies not applied
**Solution:** Check if policies exist in database

### Issue: Activity logs created even when action fails
**Problem:** Service layer not checking permissions
**Solution:** Service layer should check role BEFORE creating logs

### Issue: Error messages not clear
**Solution:** Check service layer error handling

---

## 🎓 Summary

This implementation provides **three-tier role-based access control**:

1. **Admin** - Full system access
2. **Manager** - Operations and inventory management
3. **Employee** - View-only customer support

Each role has specific permissions enforced at both the **frontend (service layer)** and **backend (database RLS)** levels, ensuring security and proper access control throughout the system.
