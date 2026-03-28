export const ROLES = {
  SITE_ADMIN: 'site_admin',
  SITE_CS: 'site_cs',
  VILLAGE_CS: 'village_cs',
  OWNER: 'owner',
  BROKER: 'broker',
  AGENT: 'agent',
  CUSTOMER: 'customer',
}

export const ROLE_LABELS = {
  [ROLES.SITE_ADMIN]: 'أدمن الموقع',
  [ROLES.SITE_CS]: 'خدمة عملاء الأدمن',
  [ROLES.VILLAGE_CS]: 'خدمة عملاء القرية',
  [ROLES.OWNER]: 'مالك',
  [ROLES.BROKER]: 'بروكر',
  [ROLES.AGENT]: 'مندوب',
  [ROLES.CUSTOMER]: 'عميل',
}

// Ordered from highest to lowest privilege
export const ROLE_HIERARCHY = [
  ROLES.SITE_ADMIN,
  ROLES.SITE_CS,
  ROLES.VILLAGE_CS,
  ROLES.OWNER,
  ROLES.BROKER,
  ROLES.AGENT,
  ROLES.CUSTOMER,
]

// All roles that can access the admin dashboard
export const ADMIN_ROLES = [
  ROLES.SITE_ADMIN,
  ROLES.SITE_CS,
  ROLES.VILLAGE_CS,
  ROLES.OWNER,
  ROLES.BROKER,
  ROLES.AGENT,
]

// Permission-to-roles mapping
export const PERMISSIONS = {
  // Account management
  manage_users: [ROLES.SITE_ADMIN, ROLES.SITE_CS, ROLES.VILLAGE_CS],

  // Chalet management
  manage_chalets: [ROLES.SITE_ADMIN, ROLES.SITE_CS],
  manage_search_attributes: [ROLES.SITE_ADMIN, ROLES.SITE_CS],
  manage_amenities: [ROLES.SITE_ADMIN, ROLES.SITE_CS],

  // Approvals
  manage_approvals: [ROLES.SITE_ADMIN],

  // Owner dashboard
  view_owner_dashboard: [ROLES.SITE_ADMIN, ROLES.OWNER],

  // Village management
  view_village_dashboard: [ROLES.SITE_ADMIN, ROLES.VILLAGE_CS],

  // Broker dashboard
  view_broker_dashboard: [ROLES.SITE_ADMIN, ROLES.BROKER],

  // Agent
  view_agent_permits: [ROLES.SITE_ADMIN, ROLES.AGENT],

  // CS operations
  manage_orders: [ROLES.SITE_ADMIN, ROLES.VILLAGE_CS],
  view_permits: [ROLES.SITE_ADMIN, ROLES.VILLAGE_CS, ROLES.AGENT],

  // Coupons
  manage_coupons: [ROLES.SITE_ADMIN, ROLES.SITE_CS],

  // Reports (financial)
  view_financial_reports: [ROLES.SITE_ADMIN, ROLES.SITE_CS, ROLES.OWNER, ROLES.BROKER, ROLES.VILLAGE_CS],
}

// Roles that can be created by each role
export const CREATABLE_ROLES = {
  [ROLES.SITE_ADMIN]: [ROLES.SITE_CS, ROLES.VILLAGE_CS, ROLES.OWNER, ROLES.BROKER, ROLES.AGENT],
  [ROLES.SITE_CS]: [ROLES.VILLAGE_CS, ROLES.OWNER, ROLES.BROKER, ROLES.AGENT],
  [ROLES.VILLAGE_CS]: [ROLES.OWNER, ROLES.BROKER, ROLES.AGENT],
}
