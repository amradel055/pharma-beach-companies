export const ROLES = {
  SITE_ADMIN: 'site_admin',
  SITE_CS: 'site_cs',
  VILLAGE_ADMIN: 'village_admin',
  VILLAGE_CS: 'village_cs',
  OWNER: 'owner',
  BROKER: 'broker',
  AGENT: 'agent',
  OPERATOR: 'operator',
  SECURITY: 'security',
}

export const ROLE_LABELS = {
  [ROLES.SITE_ADMIN]: 'أدمن الموقع',
  [ROLES.SITE_CS]: 'خدمة عملاء الأدمن',
  [ROLES.VILLAGE_ADMIN]: 'أدمن القرية',
  [ROLES.VILLAGE_CS]: 'خدمة عملاء القرية',
  [ROLES.OWNER]: 'مالك',
  [ROLES.BROKER]: 'بروكر',
  [ROLES.AGENT]: 'مندوب',
  [ROLES.OPERATOR]: 'مشغل',
  [ROLES.SECURITY]: 'أمن',
}

// Ordered from highest to lowest privilege
export const ROLE_HIERARCHY = [
  ROLES.SITE_ADMIN,
  ROLES.SITE_CS,
  ROLES.VILLAGE_ADMIN,
  ROLES.VILLAGE_CS,
  ROLES.OWNER,
  ROLES.BROKER,
  ROLES.AGENT,
  ROLES.OPERATOR,
  ROLES.SECURITY,
]

// All roles that can access the admin dashboard (every internal role)
export const ADMIN_ROLES = [
  ROLES.SITE_ADMIN,
  ROLES.SITE_CS,
  ROLES.VILLAGE_ADMIN,
  ROLES.VILLAGE_CS,
  ROLES.OWNER,
  ROLES.BROKER,
  ROLES.AGENT,
  ROLES.OPERATOR,
  ROLES.SECURITY,
]

// Permission-to-roles mapping
export const PERMISSIONS = {
  // Account management
  manage_users: [ROLES.SITE_ADMIN, ROLES.SITE_CS, ROLES.VILLAGE_ADMIN, ROLES.VILLAGE_CS],

  // Chalet management
  manage_chalets: [ROLES.SITE_ADMIN, ROLES.SITE_CS],
  manage_search_attributes: [ROLES.SITE_ADMIN, ROLES.SITE_CS],
  manage_amenities: [ROLES.SITE_ADMIN, ROLES.SITE_CS],

  // Approvals
  manage_approvals: [ROLES.SITE_ADMIN],

  // Owner dashboard
  view_owner_dashboard: [ROLES.SITE_ADMIN, ROLES.OWNER],

  // Village management (financial reports — not for Village CS per story F2)
  view_village_dashboard: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN],

  // Broker dashboard
  view_broker_dashboard: [ROLES.SITE_ADMIN, ROLES.BROKER],

  // Agent
  view_agent_permits: [ROLES.SITE_ADMIN, ROLES.AGENT],

  // Operator management
  manage_operators: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN],
  view_operator_dashboard: [ROLES.SITE_ADMIN, ROLES.OPERATOR],

  // Security management
  manage_security: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN],
  scan_qr: [ROLES.SECURITY],

  // CS operations
  manage_orders: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN, ROLES.VILLAGE_CS],
  view_permits: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN, ROLES.VILLAGE_CS, ROLES.AGENT],

  // Coupons
  manage_coupons: [ROLES.SITE_ADMIN, ROLES.SITE_CS],

  // Reports (financial)
  view_financial_reports: [ROLES.SITE_ADMIN, ROLES.SITE_CS, ROLES.VILLAGE_ADMIN, ROLES.OWNER, ROLES.BROKER],

  // Village daily report
  view_village_report: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN],

  // Agents page visibility
  view_agents_page: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN, ROLES.BROKER],

  // General settings
  manage_settings: [ROLES.SITE_ADMIN],
}

// Roles that can be created by each role
export const CREATABLE_ROLES = {
  [ROLES.SITE_ADMIN]: [ROLES.SITE_CS, ROLES.VILLAGE_ADMIN, ROLES.VILLAGE_CS, ROLES.OWNER, ROLES.BROKER, ROLES.AGENT, ROLES.OPERATOR, ROLES.SECURITY],
  [ROLES.SITE_CS]: [ROLES.VILLAGE_ADMIN, ROLES.VILLAGE_CS, ROLES.OWNER, ROLES.BROKER, ROLES.AGENT],
  [ROLES.VILLAGE_ADMIN]: [ROLES.VILLAGE_CS, ROLES.OWNER, ROLES.BROKER, ROLES.AGENT, ROLES.OPERATOR, ROLES.SECURITY],
  [ROLES.VILLAGE_CS]: [ROLES.OWNER, ROLES.BROKER, ROLES.AGENT],
}
