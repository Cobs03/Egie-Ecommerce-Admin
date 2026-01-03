import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  getRolePermissions,
  canManageUser,
  ROLES,
  PERMISSIONS
} from '../utils/permissions';

/**
 * Custom hook for permission checking
 * @returns {Object} Permission checking utilities
 */
export const usePermissions = () => {
  const { profile } = useAuth();
  const userRole = profile?.role?.toLowerCase() || 'employee';

  // Memoize permission checks
  const permissions = useMemo(() => ({
    // Role information
    role: userRole,
    isAdmin: userRole === ROLES.ADMIN,
    isManager: userRole === ROLES.MANAGER,
    isEmployee: userRole === ROLES.EMPLOYEE,
    
    // All permissions for this role
    allPermissions: getRolePermissions(userRole),
    
    // Permission checking functions
    can: (permission) => hasPermission(userRole, permission),
    canAny: (permissionArray) => hasAnyPermission(userRole, permissionArray),
    canAll: (permissionArray) => hasAllPermissions(userRole, permissionArray),
    canManage: (targetRole) => canManageUser(userRole, targetRole),
    
    // Quick access to common permissions
    canCreateProduct: hasPermission(userRole, PERMISSIONS.PRODUCT_CREATE),
    canEditProduct: hasPermission(userRole, PERMISSIONS.PRODUCT_EDIT),
    canDeleteProduct: hasPermission(userRole, PERMISSIONS.PRODUCT_DELETE),
    
    canCreateBundle: hasPermission(userRole, PERMISSIONS.BUNDLE_CREATE),
    canEditBundle: hasPermission(userRole, PERMISSIONS.BUNDLE_EDIT),
    canDeleteBundle: hasPermission(userRole, PERMISSIONS.BUNDLE_DELETE),
    
    canViewOrders: hasPermission(userRole, PERMISSIONS.ORDER_VIEW),
    canAcceptOrders: hasPermission(userRole, PERMISSIONS.ORDER_ACCEPT),
    canRejectOrders: hasPermission(userRole, PERMISSIONS.ORDER_REJECT),
    canCancelOrders: hasPermission(userRole, PERMISSIONS.ORDER_CANCEL),
    canRefundOrders: hasPermission(userRole, PERMISSIONS.ORDER_REFUND),
    
    canCreateUsers: hasPermission(userRole, PERMISSIONS.USER_CREATE),
    canEditUsers: hasPermission(userRole, PERMISSIONS.USER_EDIT),
    canDeleteUsers: hasPermission(userRole, PERMISSIONS.USER_DELETE),
    canViewLogs: hasPermission(userRole, PERMISSIONS.USER_VIEW_LOGS),
    
    canManagePromos: hasPermission(userRole, PERMISSIONS.PROMO_CREATE),
    canManagePayments: hasPermission(userRole, PERMISSIONS.PAYMENT_MANAGE_METHODS),
    canAccessSystem: hasPermission(userRole, PERMISSIONS.SYSTEM_ACCESS),
  }), [userRole]);

  return permissions;
};

/**
 * Hook to check if user can perform action and get error message
 * @param {string} permission - Permission to check
 * @param {string} customMessage - Custom error message (optional)
 * @returns {Object} { allowed, error }
 */
export const usePermissionCheck = (permission, customMessage = null) => {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'employee';
  
  const allowed = hasPermission(userRole, permission);
  
  const error = useMemo(() => {
    if (allowed) return null;
    
    return customMessage || `You don't have permission to perform this action. Required permission: ${permission}`;
  }, [allowed, permission, customMessage]);
  
  return { allowed, error };
};

export default usePermissions;
