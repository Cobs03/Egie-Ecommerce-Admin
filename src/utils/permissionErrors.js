import { PERMISSIONS, getPermissionLabel } from './permissions';

/**
 * Permission Error Class
 * Custom error for permission-related issues
 */
export class PermissionError extends Error {
  constructor(permission, userRole, action = null) {
    const actionName = action || getPermissionLabel(permission);
    const message = `Access Denied: You do not have permission to ${actionName}. Your role: ${userRole?.toUpperCase()}`;
    super(message);
    this.name = 'PermissionError';
    this.permission = permission;
    this.userRole = userRole;
    this.action = actionName;
  }
}

/**
 * Show permission error alert
 * @param {string} permission - Permission that was denied
 * @param {string} userRole - User's current role
 * @param {string} action - Custom action description
 * @returns {Object} Error alert configuration
 */
export const getPermissionErrorAlert = (permission, userRole, action = null) => {
  const actionName = action || getPermissionLabel(permission);
  
  return {
    severity: 'error',
    title: 'Access Denied',
    message: `You do not have permission to ${actionName}.`,
    details: `Your role: ${userRole?.toUpperCase()}. Contact an administrator if you need access to this feature.`
  };
};

/**
 * Get role-specific restriction message
 * @param {string} userRole - User's current role
 * @returns {string} Restriction message
 */
export const getRoleRestrictionMessage = (userRole) => {
  const messages = {
    employee: 'As an EMPLOYEE, you have limited access to system features. You can create and edit products, manage inventory, and update order statuses. Contact a Manager or Admin for additional permissions.',
    manager: 'As a MANAGER, you have operational access but cannot manage users or system settings. Contact an Admin for user management or system configuration.',
    admin: 'You have full administrative access to all features.'
  };
  
  return messages[userRole?.toLowerCase()] || messages.employee;
};

/**
 * Check if action should show confirmation based on role
 * Managers need confirmation for deletions, Admins don't
 * @param {string} userRole - User's role
 * @param {string} action - Action type (delete, cancel, etc.)
 * @returns {boolean}
 */
export const requiresConfirmation = (userRole, action) => {
  const role = userRole?.toLowerCase();
  
  // Employees should not be able to perform destructive actions at all
  if (role === 'employee') {
    return true; // Will be blocked anyway
  }
  
  // Managers need confirmation for deletions and cancellations
  if (role === 'manager') {
    return ['delete', 'cancel', 'reject', 'refund'].includes(action);
  }
  
  // Admins can perform actions without confirmation (but should still confirm for safety)
  return false;
};

/**
 * Get permission-specific help text
 * @param {string} permission - Permission constant
 * @returns {string} Help text
 */
export const getPermissionHelpText = (permission) => {
  const helpTexts = {
    [PERMISSIONS.PRODUCT_DELETE]: 'Only Admins and Managers can delete products. Employees should request deletion through their Manager.',
    [PERMISSIONS.ORDER_REJECT]: 'Only Admins and Managers can reject orders. Employees should escalate rejection requests.',
    [PERMISSIONS.ORDER_CANCEL]: 'Only Admins and Managers can cancel orders. Employees should escalate cancellation requests.',
    [PERMISSIONS.ORDER_REFUND]: 'Only Admins and Managers can process refunds. Managers are limited to $500 refunds.',
    [PERMISSIONS.USER_CREATE]: 'Only Admins can create new users (Employees, Managers, or Admins).',
    [PERMISSIONS.USER_DELETE]: 'Only Admins can delete users. Admins cannot delete other Admins.',
    [PERMISSIONS.USER_PROMOTE]: 'Only Admins can promote users to higher roles.',
    [PERMISSIONS.PROMO_CREATE]: 'Only Admins and Managers can create promotions and discounts.',
    [PERMISSIONS.PAYMENT_MANAGE_METHODS]: 'Only Admins can manage payment methods and configurations.',
    [PERMISSIONS.SYSTEM_ACCESS]: 'Only Admins can access system settings and configurations.'
  };
  
  return helpTexts[permission] || 'This action requires elevated permissions. Contact your administrator.';
};

/**
 * Format permission error for display
 * @param {Error} error - Error object
 * @param {string} userRole - User's role
 * @returns {Object} Formatted error
 */
export const formatPermissionError = (error, userRole) => {
  if (error instanceof PermissionError) {
    return {
      title: 'Permission Denied',
      message: error.message,
      action: error.action,
      role: error.userRole,
      helpText: getPermissionHelpText(error.permission)
    };
  }
  
  return {
    title: 'Access Denied',
    message: error.message || 'You do not have permission to perform this action.',
    role: userRole,
    helpText: getRoleRestrictionMessage(userRole)
  };
};

export default {
  PermissionError,
  getPermissionErrorAlert,
  getRoleRestrictionMessage,
  requiresConfirmation,
  getPermissionHelpText,
  formatPermissionError
};
