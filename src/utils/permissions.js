/**
 * Role-Based Access Control (RBAC) System
 * Based on Admin Role Hierarchy Guide
 */

// Role hierarchy levels
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

// Permission categories
export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  USER_PROMOTE: 'user.promote',
  USER_DEMOTE: 'user.demote',
  USER_VIEW_LOGS: 'user.view_logs',
  USER_BAN: 'user.ban',
  USER_EXPORT: 'user.export',
  USER_VIEW: 'user.view',

  // Product Management
  PRODUCT_CREATE: 'product.create',
  PRODUCT_EDIT: 'product.edit',
  PRODUCT_DELETE: 'product.delete',
  PRODUCT_MANAGE_VARIANTS: 'product.manage_variants',
  PRODUCT_UPDATE_STOCK: 'product.update_stock',
  PRODUCT_SET_PRICE: 'product.set_price',
  PRODUCT_MANAGE_CATEGORIES: 'product.manage_categories',
  PRODUCT_UPLOAD_IMAGES: 'product.upload_images',
  PRODUCT_DELETE_IMAGES: 'product.delete_images',
  PRODUCT_MANAGE_SPECS: 'product.manage_specs',

  // Bundle Management
  BUNDLE_CREATE: 'bundle.create',
  BUNDLE_EDIT: 'bundle.edit',
  BUNDLE_DELETE: 'bundle.delete',
  BUNDLE_SET_PRICE: 'bundle.set_price',

  // Order Management
  ORDER_VIEW: 'order.view',
  ORDER_ACCEPT: 'order.accept',
  ORDER_REJECT: 'order.reject',
  ORDER_UPDATE_STATUS: 'order.update_status',
  ORDER_CANCEL: 'order.cancel',
  ORDER_REFUND: 'order.refund',
  ORDER_MANAGE_SHIPPING: 'order.manage_shipping',
  ORDER_EXPORT: 'order.export',

  // Payment & Financial
  PAYMENT_VIEW: 'payment.view',
  PAYMENT_REFUND: 'payment.refund',
  PAYMENT_MANAGE_METHODS: 'payment.manage_methods',
  PAYMENT_VIEW_REPORTS: 'payment.view_reports',
  PAYMENT_EXPORT: 'payment.export',

  // Promotions & Marketing
  PROMO_CREATE: 'promo.create',
  PROMO_EDIT: 'promo.edit',
  PROMO_DELETE: 'promo.delete',
  PROMO_SET_RULES: 'promo.set_rules',
  PROMO_MANAGE_CAMPAIGNS: 'promo.manage_campaigns',

  // Feedback & Support
  FEEDBACK_VIEW: 'feedback.view',
  FEEDBACK_REPLY: 'feedback.reply',
  FEEDBACK_DELETE: 'feedback.delete',
  SUPPORT_MANAGE: 'support.manage',

  // Shipping Management
  SHIPPING_VIEW: 'shipping.view',
  SHIPPING_UPDATE_STATUS: 'shipping.update_status',
  SHIPPING_MANAGE_PROVIDERS: 'shipping.manage_providers',
  SHIPPING_SET_RATES: 'shipping.set_rates',

  // System & Settings
  SYSTEM_ACCESS: 'system.access',
  SYSTEM_INTEGRATIONS: 'system.integrations',
  SYSTEM_EMAIL_CONFIG: 'system.email_config',
  SYSTEM_DATABASE: 'system.database',
  SYSTEM_LOGS: 'system.logs',
  SYSTEM_BACKUP: 'system.backup'
};

// Role permission mappings
const rolePermissions = {
  [ROLES.ADMIN]: [
    // User Management - Full Access
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_PROMOTE,
    PERMISSIONS.USER_DEMOTE,
    PERMISSIONS.USER_VIEW_LOGS,
    PERMISSIONS.USER_BAN,
    PERMISSIONS.USER_EXPORT,
    PERMISSIONS.USER_VIEW,

    // Product Management - Full Access
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_MANAGE_VARIANTS,
    PERMISSIONS.PRODUCT_UPDATE_STOCK,
    PERMISSIONS.PRODUCT_SET_PRICE,
    PERMISSIONS.PRODUCT_MANAGE_CATEGORIES,
    PERMISSIONS.PRODUCT_UPLOAD_IMAGES,
    PERMISSIONS.PRODUCT_DELETE_IMAGES,
    PERMISSIONS.PRODUCT_MANAGE_SPECS,

    // Bundle Management - Full Access
    PERMISSIONS.BUNDLE_CREATE,
    PERMISSIONS.BUNDLE_EDIT,
    PERMISSIONS.BUNDLE_DELETE,
    PERMISSIONS.BUNDLE_SET_PRICE,

    // Order Management - Full Access
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_ACCEPT,
    PERMISSIONS.ORDER_REJECT,
    PERMISSIONS.ORDER_UPDATE_STATUS,
    PERMISSIONS.ORDER_CANCEL,
    PERMISSIONS.ORDER_REFUND,
    PERMISSIONS.ORDER_MANAGE_SHIPPING,
    PERMISSIONS.ORDER_EXPORT,

    // Payment & Financial - Full Access
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_REFUND,
    PERMISSIONS.PAYMENT_MANAGE_METHODS,
    PERMISSIONS.PAYMENT_VIEW_REPORTS,
    PERMISSIONS.PAYMENT_EXPORT,

    // Promotions - Full Access
    PERMISSIONS.PROMO_CREATE,
    PERMISSIONS.PROMO_EDIT,
    PERMISSIONS.PROMO_DELETE,
    PERMISSIONS.PROMO_SET_RULES,
    PERMISSIONS.PROMO_MANAGE_CAMPAIGNS,

    // Feedback & Support - Full Access
    PERMISSIONS.FEEDBACK_VIEW,
    PERMISSIONS.FEEDBACK_REPLY,
    PERMISSIONS.FEEDBACK_DELETE,
    PERMISSIONS.SUPPORT_MANAGE,

    // Shipping - Full Access
    PERMISSIONS.SHIPPING_VIEW,
    PERMISSIONS.SHIPPING_UPDATE_STATUS,
    PERMISSIONS.SHIPPING_MANAGE_PROVIDERS,
    PERMISSIONS.SHIPPING_SET_RATES,

    // System & Settings - Full Access
    PERMISSIONS.SYSTEM_ACCESS,
    PERMISSIONS.SYSTEM_INTEGRATIONS,
    PERMISSIONS.SYSTEM_EMAIL_CONFIG,
    PERMISSIONS.SYSTEM_DATABASE,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.SYSTEM_BACKUP
  ],

  [ROLES.MANAGER]: [
    // User Management - Limited
    PERMISSIONS.USER_VIEW_LOGS, // Only employee logs
    PERMISSIONS.USER_BAN, // With review
    PERMISSIONS.USER_VIEW,

    // Product Management - Full Access
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.PRODUCT_DELETE, // With confirmation
    PERMISSIONS.PRODUCT_MANAGE_VARIANTS,
    PERMISSIONS.PRODUCT_UPDATE_STOCK,
    PERMISSIONS.PRODUCT_SET_PRICE,
    PERMISSIONS.PRODUCT_MANAGE_CATEGORIES,
    PERMISSIONS.PRODUCT_UPLOAD_IMAGES,
    PERMISSIONS.PRODUCT_DELETE_IMAGES,
    PERMISSIONS.PRODUCT_MANAGE_SPECS,

    // Bundle Management - Full Access
    PERMISSIONS.BUNDLE_CREATE,
    PERMISSIONS.BUNDLE_EDIT,
    PERMISSIONS.BUNDLE_DELETE, // With confirmation
    PERMISSIONS.BUNDLE_SET_PRICE,

    // Order Management - Full Access
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_ACCEPT,
    PERMISSIONS.ORDER_REJECT,
    PERMISSIONS.ORDER_UPDATE_STATUS,
    PERMISSIONS.ORDER_CANCEL, // With reason
    PERMISSIONS.ORDER_REFUND, // Up to $500 limit
    PERMISSIONS.ORDER_MANAGE_SHIPPING,
    PERMISSIONS.ORDER_EXPORT,

    // Payment & Financial - Limited
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_REFUND, // Up to $500 limit
    PERMISSIONS.PAYMENT_VIEW_REPORTS,
    // NO: PAYMENT_MANAGE_METHODS, PAYMENT_EXPORT

    // Promotions - Full Access
    PERMISSIONS.PROMO_CREATE,
    PERMISSIONS.PROMO_EDIT,
    PERMISSIONS.PROMO_DELETE, // With confirmation
    PERMISSIONS.PROMO_SET_RULES,
    PERMISSIONS.PROMO_MANAGE_CAMPAIGNS,

    // Feedback & Support - Limited
    PERMISSIONS.FEEDBACK_VIEW,
    PERMISSIONS.FEEDBACK_REPLY,
    PERMISSIONS.SUPPORT_MANAGE,
    // NO: FEEDBACK_DELETE

    // Shipping - Limited
    PERMISSIONS.SHIPPING_VIEW,
    PERMISSIONS.SHIPPING_UPDATE_STATUS,
    // NO: SHIPPING_MANAGE_PROVIDERS, SHIPPING_SET_RATES

    // System & Settings - Very Limited
    PERMISSIONS.SYSTEM_LOGS
    // NO: All other system permissions
  ],

  [ROLES.EMPLOYEE]: [
    // User Management - None
    // NO: All user permissions including USER_VIEW

    // Product Management - Limited
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT, // Own creations + assigned products
    PERMISSIONS.PRODUCT_MANAGE_VARIANTS, // Cannot delete variants
    PERMISSIONS.PRODUCT_UPDATE_STOCK,
    PERMISSIONS.PRODUCT_SET_PRICE, // Within approved range
    PERMISSIONS.PRODUCT_UPLOAD_IMAGES, // Cannot delete
    PERMISSIONS.PRODUCT_MANAGE_SPECS,
    // NO: PRODUCT_DELETE, PRODUCT_MANAGE_CATEGORIES, PRODUCT_DELETE_IMAGES

    // Bundle Management - Limited
    PERMISSIONS.BUNDLE_CREATE,
    PERMISSIONS.BUNDLE_EDIT, // Own creations only
    PERMISSIONS.BUNDLE_SET_PRICE, // Within approved range
    // NO: BUNDLE_DELETE

    // Order Management - None
    // NO: All order permissions including ORDER_VIEW

    // Payment & Financial - None
    // NO: All payment permissions including PAYMENT_VIEW

    // Promotions - None
    // NO: All promo permissions

    // Feedback & Support - Limited
    PERMISSIONS.FEEDBACK_VIEW,
    PERMISSIONS.FEEDBACK_REPLY, // Basic support only
    PERMISSIONS.SUPPORT_MANAGE, // Assigned tickets only
    // NO: FEEDBACK_DELETE

    // Shipping - None
    // NO: All shipping permissions including SHIPPING_VIEW

    // System & Settings - None
    // NO: All system permissions
  ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role (admin, manager, employee)
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  
  const normalizedRole = role.toLowerCase();
  const permissions = rolePermissions[normalizedRole];
  
  if (!permissions) return false;
  
  return permissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (role, permissions) => {
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (role, permissions) => {
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {string[]}
 */
export const getRolePermissions = (role) => {
  const normalizedRole = role?.toLowerCase();
  return rolePermissions[normalizedRole] || [];
};

/**
 * Check if role can perform action on another user
 * Admin can manage Managers and Employees
 * Manager cannot manage any users
 * Employee cannot manage any users
 * @param {string} userRole - The acting user's role
 * @param {string} targetRole - The target user's role
 * @returns {boolean}
 */
export const canManageUser = (userRole, targetRole) => {
  const hierarchy = {
    [ROLES.ADMIN]: 3,
    [ROLES.MANAGER]: 2,
    [ROLES.EMPLOYEE]: 1
  };
  
  const actorLevel = hierarchy[userRole?.toLowerCase()] || 0;
  const targetLevel = hierarchy[targetRole?.toLowerCase()] || 0;
  
  // Only admins can manage users, and they can't delete other admins
  if (userRole?.toLowerCase() === ROLES.ADMIN) {
    return targetLevel < 3; // Can manage managers and employees
  }
  
  return false;
};

/**
 * Get user-friendly permission name
 * @param {string} permission - Permission constant
 * @returns {string}
 */
export const getPermissionLabel = (permission) => {
  const labels = {
    // User Management
    [PERMISSIONS.USER_CREATE]: 'Create Users',
    [PERMISSIONS.USER_EDIT]: 'Edit Users',
    [PERMISSIONS.USER_DELETE]: 'Delete Users',
    [PERMISSIONS.USER_PROMOTE]: 'Promote Users',
    [PERMISSIONS.USER_DEMOTE]: 'Demote Users',
    [PERMISSIONS.USER_VIEW_LOGS]: 'View Activity Logs',
    [PERMISSIONS.USER_BAN]: 'Ban/Unban Customers',
    [PERMISSIONS.USER_EXPORT]: 'Export User Data',
    [PERMISSIONS.USER_VIEW]: 'View Users',

    // Product Management
    [PERMISSIONS.PRODUCT_CREATE]: 'Create Products',
    [PERMISSIONS.PRODUCT_EDIT]: 'Edit Products',
    [PERMISSIONS.PRODUCT_DELETE]: 'Delete Products',
    [PERMISSIONS.PRODUCT_MANAGE_VARIANTS]: 'Manage Product Variants',
    [PERMISSIONS.PRODUCT_UPDATE_STOCK]: 'Update Stock',
    [PERMISSIONS.PRODUCT_SET_PRICE]: 'Set Product Prices',
    [PERMISSIONS.PRODUCT_MANAGE_CATEGORIES]: 'Manage Categories',
    [PERMISSIONS.PRODUCT_UPLOAD_IMAGES]: 'Upload Product Images',
    [PERMISSIONS.PRODUCT_DELETE_IMAGES]: 'Delete Product Images',
    [PERMISSIONS.PRODUCT_MANAGE_SPECS]: 'Manage Specifications',

    // Bundle Management
    [PERMISSIONS.BUNDLE_CREATE]: 'Create Bundles',
    [PERMISSIONS.BUNDLE_EDIT]: 'Edit Bundles',
    [PERMISSIONS.BUNDLE_DELETE]: 'Delete Bundles',
    [PERMISSIONS.BUNDLE_SET_PRICE]: 'Set Bundle Prices',

    // Order Management
    [PERMISSIONS.ORDER_VIEW]: 'View Orders',
    [PERMISSIONS.ORDER_ACCEPT]: 'Accept Orders',
    [PERMISSIONS.ORDER_REJECT]: 'Reject Orders',
    [PERMISSIONS.ORDER_UPDATE_STATUS]: 'Update Order Status',
    [PERMISSIONS.ORDER_CANCEL]: 'Cancel Orders',
    [PERMISSIONS.ORDER_REFUND]: 'Process Refunds',
    [PERMISSIONS.ORDER_MANAGE_SHIPPING]: 'Manage Shipping',
    [PERMISSIONS.ORDER_EXPORT]: 'Export Orders',

    // Payment & Financial
    [PERMISSIONS.PAYMENT_VIEW]: 'View Payments',
    [PERMISSIONS.PAYMENT_REFUND]: 'Process Payment Refunds',
    [PERMISSIONS.PAYMENT_MANAGE_METHODS]: 'Manage Payment Methods',
    [PERMISSIONS.PAYMENT_VIEW_REPORTS]: 'View Financial Reports',
    [PERMISSIONS.PAYMENT_EXPORT]: 'Export Financial Data',

    // Promotions
    [PERMISSIONS.PROMO_CREATE]: 'Create Promotions',
    [PERMISSIONS.PROMO_EDIT]: 'Edit Promotions',
    [PERMISSIONS.PROMO_DELETE]: 'Delete Promotions',
    [PERMISSIONS.PROMO_SET_RULES]: 'Set Promotion Rules',
    [PERMISSIONS.PROMO_MANAGE_CAMPAIGNS]: 'Manage Campaigns',

    // Feedback & Support
    [PERMISSIONS.FEEDBACK_VIEW]: 'View Feedback',
    [PERMISSIONS.FEEDBACK_REPLY]: 'Reply to Feedback',
    [PERMISSIONS.FEEDBACK_DELETE]: 'Delete Feedback',
    [PERMISSIONS.SUPPORT_MANAGE]: 'Manage Support Tickets',

    // Shipping
    [PERMISSIONS.SHIPPING_VIEW]: 'View Shipments',
    [PERMISSIONS.SHIPPING_UPDATE_STATUS]: 'Update Shipping Status',
    [PERMISSIONS.SHIPPING_MANAGE_PROVIDERS]: 'Manage Shipping Providers',
    [PERMISSIONS.SHIPPING_SET_RATES]: 'Set Shipping Rates',

    // System
    [PERMISSIONS.SYSTEM_ACCESS]: 'Access System Settings',
    [PERMISSIONS.SYSTEM_INTEGRATIONS]: 'Manage Integrations',
    [PERMISSIONS.SYSTEM_EMAIL_CONFIG]: 'Configure Email Templates',
    [PERMISSIONS.SYSTEM_DATABASE]: 'Database Management',
    [PERMISSIONS.SYSTEM_LOGS]: 'View System Logs',
    [PERMISSIONS.SYSTEM_BACKUP]: 'Backup/Restore Data'
  };

  return labels[permission] || permission;
};

export default {
  ROLES,
  PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canManageUser,
  getPermissionLabel
};
