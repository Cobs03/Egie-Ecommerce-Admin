# Role-Based Access Control (RBAC) Implementation Guide

## 📋 Overview

This system implements comprehensive role-based access control for the Egie Admin Panel based on the Admin Role Hierarchy. It includes:

- ✅ Permission definitions for all features
- ✅ Role-based permission mappings (Admin, Manager, Employee)
- ✅ React hooks for permission checking
- ✅ Protected action components
- ✅ Error handling and user-friendly messages

---

## 🎯 Quick Start

### 1. Import the Permission Hook

```jsx
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/permissions';
```

### 2. Check Permissions in Your Component

```jsx
function MyComponent() {
  const permissions = usePermissions();
  
  // Check single permission
  if (permissions.canDeleteProduct) {
    // Show delete button
  }
  
  // Or use the generic method
  if (permissions.can(PERMISSIONS.PRODUCT_DELETE)) {
    // Show delete button
  }
  
  return (
    <div>
      {permissions.canCreateProduct && (
        <Button>Create Product</Button>
      )}
    </div>
  );
}
```

### 3. Protect Actions with ProtectedAction Component

```jsx
import ProtectedAction from '../components/ProtectedAction';
import { PERMISSIONS } from '../utils/permissions';

function ProductActions() {
  return (
    <div>
      {/* This button only shows for users with delete permission */}
      <ProtectedAction 
        permission={PERMISSIONS.PRODUCT_DELETE}
        showError={false}
      >
        <Button onClick={handleDelete}>Delete Product</Button>
      </ProtectedAction>
      
      {/* This shows an error message if user lacks permission */}
      <ProtectedAction 
        permission={PERMISSIONS.USER_CREATE}
        action="create new users"
      >
        <Button onClick={handleCreateUser}>Create User</Button>
      </ProtectedAction>
    </div>
  );
}
```

---

## 🔐 Permission System

### Available Permissions

#### User Management
- `USER_CREATE` - Create new users
- `USER_EDIT` - Edit user profiles
- `USER_DELETE` - Delete users
- `USER_PROMOTE` - Promote users to higher roles
- `USER_DEMOTE` - Demote users to lower roles
- `USER_VIEW_LOGS` - View activity logs
- `USER_BAN` - Ban/unban customers
- `USER_EXPORT` - Export user data
- `USER_VIEW` - View user list

#### Product Management
- `PRODUCT_CREATE` - Create products
- `PRODUCT_EDIT` - Edit products
- `PRODUCT_DELETE` - Delete products
- `PRODUCT_MANAGE_VARIANTS` - Manage product variants
- `PRODUCT_UPDATE_STOCK` - Update stock quantities
- `PRODUCT_SET_PRICE` - Set product prices
- `PRODUCT_MANAGE_CATEGORIES` - Manage categories
- `PRODUCT_UPLOAD_IMAGES` - Upload product images
- `PRODUCT_DELETE_IMAGES` - Delete product images
- `PRODUCT_MANAGE_SPECS` - Manage specifications

#### Order Management
- `ORDER_VIEW` - View orders
- `ORDER_ACCEPT` - Accept orders
- `ORDER_REJECT` - Reject orders
- `ORDER_UPDATE_STATUS` - Update order status
- `ORDER_CANCEL` - Cancel orders
- `ORDER_REFUND` - Process refunds
- `ORDER_MANAGE_SHIPPING` - Manage shipping
- `ORDER_EXPORT` - Export orders

#### Bundle Management
- `BUNDLE_CREATE` - Create bundles
- `BUNDLE_EDIT` - Edit bundles
- `BUNDLE_DELETE` - Delete bundles
- `BUNDLE_SET_PRICE` - Set bundle prices

#### Promotions
- `PROMO_CREATE` - Create promotions
- `PROMO_EDIT` - Edit promotions
- `PROMO_DELETE` - Delete promotions
- `PROMO_SET_RULES` - Set promotion rules
- `PROMO_MANAGE_CAMPAIGNS` - Manage campaigns

#### Payment & Financial
- `PAYMENT_VIEW` - View payments
- `PAYMENT_REFUND` - Process refunds
- `PAYMENT_MANAGE_METHODS` - Manage payment methods
- `PAYMENT_VIEW_REPORTS` - View financial reports
- `PAYMENT_EXPORT` - Export financial data

#### System & Settings
- `SYSTEM_ACCESS` - Access system settings
- `SYSTEM_INTEGRATIONS` - Manage integrations
- `SYSTEM_EMAIL_CONFIG` - Configure email templates
- `SYSTEM_DATABASE` - Database management
- `SYSTEM_LOGS` - View system logs
- `SYSTEM_BACKUP` - Backup/restore data

---

## 👥 Role Permissions Matrix

### 🔴 ADMIN (Full Access)
- ✅ ALL permissions

### 🟡 MANAGER (Operational Access)
- ✅ Product Management (full)
- ✅ Bundle Management (full)
- ✅ Order Management (full, with limits on refunds up to $500)
- ✅ Promotions (full)
- ✅ Shipping (view and update status)
- ✅ Feedback (view and reply, cannot delete)
- ✅ Payments (view and limited refunds)
- ✅ View logs
- ❌ User Management
- ❌ System Settings

### 🟢 EMPLOYEE (Limited Access)
- ✅ Create products
- ✅ Edit own products
- ✅ Update stock and prices (within range)
- ✅ Create bundles
- ✅ Edit own bundles
- ✅ View and accept orders
- ✅ Update basic order status
- ✅ View payments (read-only)
- ✅ View customers (read-only)
- ✅ Reply to basic feedback
- ❌ Delete anything
- ❌ Reject/cancel orders
- ❌ Process refunds
- ❌ Manage users
- ❌ Create promotions
- ❌ Access system settings

---

## 💻 Usage Examples

### Example 1: Product Management

```jsx
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/permissions';
import ProtectedAction from '../components/ProtectedAction';
import { PermissionError } from '../utils/permissionErrors';

function ProductManagement() {
  const permissions = usePermissions();
  
  const handleDelete = async (productId) => {
    // Check permission before action
    if (!permissions.canDeleteProduct) {
      alert('You do not have permission to delete products');
      return;
    }
    
    // Or throw a proper error
    if (!permissions.can(PERMISSIONS.PRODUCT_DELETE)) {
      throw new PermissionError(
        PERMISSIONS.PRODUCT_DELETE,
        permissions.role,
        'delete products'
      );
    }
    
    // Proceed with deletion
    await deleteProduct(productId);
  };
  
  return (
    <Box>
      {/* Everyone can see this */}
      <Button onClick={handleCreate}>Create Product</Button>
      
      {/* Only users with delete permission see this */}
      <ProtectedAction permission={PERMISSIONS.PRODUCT_DELETE} showError={false}>
        <Button onClick={handleDelete} color="error">
          Delete Product
        </Button>
      </ProtectedAction>
      
      {/* Show error message if user clicks but lacks permission */}
      <ProtectedAction permission={PERMISSIONS.PRODUCT_MANAGE_CATEGORIES}>
        <Button onClick={handleManageCategories}>
          Manage Categories
        </Button>
      </ProtectedAction>
    </Box>
  );
}
```

### Example 2: Order Management

```jsx
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/permissions';
import { getPermissionErrorAlert } from '../utils/permissionErrors';
import { Alert, Snackbar } from '@mui/material';

function OrderManagement() {
  const permissions = usePermissions();
  const [error, setError] = useState(null);
  
  const handleRejectOrder = (orderId) => {
    if (!permissions.canRejectOrders) {
      const errorAlert = getPermissionErrorAlert(
        PERMISSIONS.ORDER_REJECT,
        permissions.role
      );
      setError(errorAlert);
      return;
    }
    
    // Proceed with rejection
    rejectOrder(orderId);
  };
  
  const handleCancelOrder = (orderId) => {
    if (!permissions.canCancelOrders) {
      setError({
        severity: 'error',
        message: 'Only Managers and Admins can cancel orders. Please escalate this request.'
      });
      return;
    }
    
    // Proceed with cancellation
    cancelOrder(orderId);
  };
  
  return (
    <Box>
      {/* All roles can accept orders */}
      {permissions.canAcceptOrders && (
        <Button onClick={handleAccept}>Accept Order</Button>
      )}
      
      {/* Only Manager/Admin can reject */}
      {permissions.canRejectOrders ? (
        <Button onClick={handleRejectOrder}>Reject Order</Button>
      ) : (
        <Tooltip title="You need Manager or Admin role to reject orders">
          <span>
            <Button disabled>Reject Order</Button>
          </span>
        </Tooltip>
      )}
      
      {/* Error display */}
      <Snackbar open={!!error} onClose={() => setError(null)}>
        <Alert severity={error?.severity} onClose={() => setError(null)}>
          {error?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
```

### Example 3: User Management

```jsx
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/permissions';
import { canManageUser } from '../utils/permissions';

function UserManagement() {
  const permissions = usePermissions();
  
  const handleDeleteUser = (targetUser) => {
    // Check if user can delete users at all
    if (!permissions.canDeleteUsers) {
      alert('Only Admins can delete users');
      return;
    }
    
    // Check if user can delete this specific user
    if (!permissions.canManage(targetUser.role)) {
      alert('You cannot delete users with equal or higher roles');
      return;
    }
    
    // Proceed with deletion
    deleteUser(targetUser.id);
  };
  
  return (
    <Box>
      {/* Only admins see this */}
      {permissions.isAdmin && (
        <Button onClick={handleCreateUser}>Create New User</Button>
      )}
      
      {/* Show different UI based on role */}
      {permissions.isEmployee && (
        <Alert severity="info">
          As an Employee, you can only view user information. Contact an Admin for user management.
        </Alert>
      )}
      
      {permissions.isManager && (
        <Alert severity="info">
          As a Manager, you can view users but cannot create, edit, or delete them.
        </Alert>
      )}
    </Box>
  );
}
```

### Example 4: Navigation/Menu Items

```jsx
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/permissions';

function Sidebar() {
  const permissions = usePermissions();
  
  return (
    <List>
      {/* Everyone sees Dashboard */}
      <ListItem button onClick={() => navigate('/dashboard')}>
        <ListItemText primary="Dashboard" />
      </ListItem>
      
      {/* Everyone sees Products */}
      <ListItem button onClick={() => navigate('/products')}>
        <ListItemText primary="Products" />
      </ListItem>
      
      {/* Only Admin/Manager see Promotions */}
      {permissions.canManagePromos && (
        <ListItem button onClick={() => navigate('/promotions')}>
          <ListItemText primary="Promotions" />
        </ListItem>
      )}
      
      {/* Only Admin sees User Management */}
      {permissions.canCreateUsers && (
        <ListItem button onClick={() => navigate('/users')}>
          <ListItemText primary="Users" />
        </ListItem>
      )}
      
      {/* Only Admin sees System Settings */}
      {permissions.canAccessSystem && (
        <ListItem button onClick={() => navigate('/settings')}>
          <ListItemText primary="Settings" />
        </ListItem>
      )}
    </List>
  );
}
```

---

## 🛡️ Error Handling

### Throwing Permission Errors

```jsx
import { PermissionError } from '../utils/permissionErrors';
import { PERMISSIONS } from '../utils/permissions';

async function deleteProduct(productId, userRole) {
  // Check permission
  if (!hasPermission(userRole, PERMISSIONS.PRODUCT_DELETE)) {
    throw new PermissionError(
      PERMISSIONS.PRODUCT_DELETE,
      userRole,
      'delete this product'
    );
  }
  
  // Proceed with deletion
  await api.deleteProduct(productId);
}

// Catching permission errors
try {
  await deleteProduct(productId, user.role);
} catch (error) {
  if (error instanceof PermissionError) {
    showAlert({
      severity: 'error',
      title: 'Access Denied',
      message: error.message
    });
  }
}
```

### Getting User-Friendly Error Messages

```jsx
import { getPermissionHelpText, getRoleRestrictionMessage } from '../utils/permissionErrors';
import { PERMISSIONS } from '../utils/permissions';

// Get help text for a specific permission
const helpText = getPermissionHelpText(PERMISSIONS.ORDER_REFUND);
// Returns: "Only Admins and Managers can process refunds. Managers are limited to $500 refunds."

// Get general restriction message for role
const restriction = getRoleRestrictionMessage('employee');
// Returns: "As an EMPLOYEE, you have limited access..."
```

---

## 📊 Permission Checking Methods

### usePermissions Hook

```jsx
const permissions = usePermissions();

// Role checks
permissions.isAdmin        // boolean
permissions.isManager      // boolean
permissions.isEmployee     // boolean
permissions.role           // 'admin' | 'manager' | 'employee'

// Generic permission checks
permissions.can(PERMISSIONS.PRODUCT_DELETE)           // Check single permission
permissions.canAny([PERMISSIONS.ORDER_REJECT, PERMISSIONS.ORDER_CANCEL])  // Check any
permissions.canAll([PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_EDIT]) // Check all
permissions.canManage('manager')  // Can manage users with 'manager' role

// Quick access to common permissions
permissions.canCreateProduct
permissions.canDeleteProduct
permissions.canRejectOrders
permissions.canRefundOrders
permissions.canCreateUsers
permissions.canManagePromos
// ... and many more
```

---

## 🚀 Implementation Checklist

### For New Features

1. ✅ Define permission constant in `PERMISSIONS` object
2. ✅ Add permission to appropriate roles in `rolePermissions` mapping
3. ✅ Add label in `getPermissionLabel()` function
4. ✅ Add help text in `getPermissionHelpText()` if needed
5. ✅ Use `usePermissions` hook in components
6. ✅ Wrap sensitive actions in `<ProtectedAction>`
7. ✅ Add error handling for permission violations
8. ✅ Test with all three roles (Admin, Manager, Employee)

### Testing Each Role

```bash
# Test as Admin
- Can access all features
- Can create, edit, delete everything
- Can manage users and system settings

# Test as Manager
- Cannot access user management
- Cannot access system settings
- Can manage products, orders, promotions
- Needs confirmation for deletions

# Test as Employee
- Cannot delete anything
- Cannot reject/cancel orders
- Cannot access promotions or system settings
- Can only create and edit own content
```

---

## 📝 Best Practices

1. **Always check permissions before performing actions**
   ```jsx
   if (!permissions.can(PERMISSIONS.ACTION)) {
     showError('Access denied');
     return;
   }
   ```

2. **Hide UI elements users can't access**
   ```jsx
   {permissions.canDelete && <DeleteButton />}
   ```

3. **Provide helpful error messages**
   ```jsx
   <ProtectedAction permission={PERMISSIONS.ACTION} action="delete products">
     <Button>Delete</Button>
   </ProtectedAction>
   ```

4. **Log permission violations**
   ```jsx
   console.warn(`User ${user.id} attempted ${action} without permission`);
   ```

5. **Test all roles thoroughly**
   - Create test accounts for each role
   - Verify each feature with each role
   - Ensure errors show correctly

---

## 🔧 Files Created

- `/src/utils/permissions.js` - Permission definitions and checking
- `/src/utils/permissionErrors.js` - Error handling utilities
- `/src/hooks/usePermissions.js` - React hook for permissions
- `/src/components/ProtectedAction.jsx` - Component for wrapping protected UI

---

## 📞 Support

For questions or issues with the RBAC system:
1. Check this documentation
2. Review the Admin Role Hierarchy Guide
3. Check console for permission error logs
4. Contact system administrator

---

**Remember**: Security is crucial. Always validate permissions on both frontend (UX) and backend (security).
