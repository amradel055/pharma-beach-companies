// Frontend role slugs — must match the lowercase form of backend role names.
// Backend sends roles as uppercase (e.g. "ADMIN_VILLAGE"); auth.js maps them
// to these slugs via API_ROLE_TO_SLUG.
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_COMPANY: 'admin_company',
  ADMIN_VILLAGE: 'admin_village',
  CUSTOMER_SERVICE_COMPANY: 'customer_service_company',
  HEAD_CUSTOMER_SERVICE_VILLAGE: 'head_customer_service_village',
  CUSTOMER_SERVICE_VILLAGE: 'customer_service_village',
  BROKER_COMPANY: 'broker_company',
  BROKER_VILLAGE: 'broker_village',
  FINANCIAL_MEMBER: 'financial_member',
  OPERATION: 'operation',
  SECURITY: 'security',
  CLIENT: 'client',
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'سوبر أدمن',
  [ROLES.ADMIN_COMPANY]: 'أدمن الشركة',
  [ROLES.ADMIN_VILLAGE]: 'أدمن القرية',
  [ROLES.CUSTOMER_SERVICE_COMPANY]: 'خدمة عملاء الشركة',
  [ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE]: 'رئيس خدمة عملاء القرية',
  [ROLES.CUSTOMER_SERVICE_VILLAGE]: 'خدمة عملاء القرية',
  [ROLES.BROKER_COMPANY]: 'بروكر الشركة',
  [ROLES.BROKER_VILLAGE]: 'بروكر القرية',
  [ROLES.FINANCIAL_MEMBER]: 'محاسب',
  [ROLES.OPERATION]: 'مشغل',
  [ROLES.SECURITY]: 'أمن',
  [ROLES.CLIENT]: 'عميل',
}

// High → low privilege
export const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN_COMPANY,
  ROLES.ADMIN_VILLAGE,
  ROLES.CUSTOMER_SERVICE_COMPANY,
  ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE,
  ROLES.CUSTOMER_SERVICE_VILLAGE,
  ROLES.FINANCIAL_MEMBER,
  ROLES.BROKER_COMPANY,
  ROLES.BROKER_VILLAGE,
  ROLES.OPERATION,
  ROLES.SECURITY,
  ROLES.CLIENT,
]

// All roles that can access the admin dashboard. CLIENT is intentionally
// excluded — they are end-users, not staff.
export const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN_COMPANY,
  ROLES.ADMIN_VILLAGE,
  ROLES.CUSTOMER_SERVICE_COMPANY,
  ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE,
  ROLES.CUSTOMER_SERVICE_VILLAGE,
  ROLES.BROKER_COMPANY,
  ROLES.BROKER_VILLAGE,
  ROLES.FINANCIAL_MEMBER,
  ROLES.OPERATION,
  ROLES.SECURITY,
]

// Convenience aliases for grouped checks
const ANY_ADMIN = [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE]
const ANY_BROKER = [ROLES.BROKER_COMPANY, ROLES.BROKER_VILLAGE]
const ANY_CS = [
  ROLES.CUSTOMER_SERVICE_COMPANY,
  ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE,
  ROLES.CUSTOMER_SERVICE_VILLAGE,
]

export const PERMISSIONS = {
  // Account management
  manage_users: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE],

  // Chalet management
  manage_chalets: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.CUSTOMER_SERVICE_COMPANY],
  manage_search_attributes: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.CUSTOMER_SERVICE_COMPANY],
  manage_amenities: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.CUSTOMER_SERVICE_COMPANY],

  // Approvals — SUPER_ADMIN only
  manage_approvals: [ROLES.SUPER_ADMIN],

  // Bookings calendar (the page formerly known as "Owner dashboard").
  // Kept under this permission key to avoid churn in route meta.
  view_owner_dashboard: [...ANY_ADMIN],

  // Village financial reports
  view_village_dashboard: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.FINANCIAL_MEMBER],

  // Broker dashboard
  view_broker_dashboard: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ...ANY_BROKER],

  // Operator management
  manage_operators: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE],
  view_operator_dashboard: [ROLES.SUPER_ADMIN, ROLES.OPERATION],

  // Security management
  manage_security: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE],
  scan_qr: [ROLES.SUPER_ADMIN, ROLES.SECURITY],

  // CS operations
  manage_orders: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ...ANY_CS],
  view_permits: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ...ANY_CS],

  // Coupons
  manage_coupons: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.CUSTOMER_SERVICE_COMPANY],

  // Reports (financial)
  view_financial_reports: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.FINANCIAL_MEMBER, ROLES.CUSTOMER_SERVICE_COMPANY, ...ANY_BROKER],

  // Village daily report
  view_village_report: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE],

  // General settings — SUPER_ADMIN only
  manage_settings: [ROLES.SUPER_ADMIN],
}

// Which roles each role is allowed to create from the user-management UI.
// Adjust per business rules as needed.
export const CREATABLE_ROLES = {
  [ROLES.SUPER_ADMIN]: [
    ROLES.ADMIN_COMPANY,
    ROLES.ADMIN_VILLAGE,
    ROLES.CUSTOMER_SERVICE_COMPANY,
    ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE,
    ROLES.CUSTOMER_SERVICE_VILLAGE,
    ROLES.BROKER_COMPANY,
    ROLES.BROKER_VILLAGE,
    ROLES.FINANCIAL_MEMBER,
    ROLES.OPERATION,
    ROLES.SECURITY,
  ],
  [ROLES.ADMIN_COMPANY]: [
    ROLES.ADMIN_VILLAGE,
    ROLES.CUSTOMER_SERVICE_COMPANY,
    ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE,
    ROLES.CUSTOMER_SERVICE_VILLAGE,
    ROLES.BROKER_COMPANY,
    ROLES.BROKER_VILLAGE,
    ROLES.FINANCIAL_MEMBER,
  ],
  [ROLES.ADMIN_VILLAGE]: [
    ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE,
    ROLES.CUSTOMER_SERVICE_VILLAGE,
    ROLES.BROKER_VILLAGE,
    ROLES.OPERATION,
    ROLES.SECURITY,
  ],
  [ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE]: [ROLES.CUSTOMER_SERVICE_VILLAGE],
}
