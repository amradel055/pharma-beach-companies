// Single source of truth for the admin navigation.
//
// Gating is per-item: an item is visible when the user has `item.permission`
// (or, if the item has none, the section's `permission`). A section is shown
// only if at least one of its items is visible — and if exactly one item is
// visible it renders as a flat link instead of a one-entry dropdown (so a
// SECURITY user sees a plain "مسح QR", a FINANCIAL_MEMBER a plain
// "سندات القبض", while a SUPER_ADMIN gets the full grouped menu).
//
// `flat` → always render each item as its own navbar link.
// Order matters — `لوحة التشغيل` is intentionally first (admin's landing page).
export const NAV_SECTIONS = [
  {
    label: 'لوحة التشغيل',
    permission: 'view_operator_dashboard',
    items: [
      { label: 'لوحة التشغيل', to: '/admin/operations', icon: 'pi pi-desktop' },
    ],
  },
  {
    label: 'العمليات',
    permission: 'manage_orders',
    flat: true,
    items: [
      { label: 'الحجوزات', to: '/admin/village-bookings', icon: 'pi pi-clipboard' },
      { label: 'الشاليهات', to: '/admin/village-chalets', icon: 'pi pi-home' },
    ],
  },
  {
    label: 'إدارة المستخدمين',
    permission: 'manage_users',
    icon: 'pi pi-users',
    items: [
      { label: 'المستخدمين', to: '/admin/users', icon: 'pi pi-users' },
      { label: 'الملاك', to: '/admin/owners', icon: 'pi pi-user' },
      { label: 'الشركات', to: '/admin/companies', icon: 'pi pi-briefcase' },
      { label: 'الأدوار', to: '/admin/roles', icon: 'pi pi-key' },
      // Folded in from the old standalone "المالية" section — keeps its own
      // permission so FINANCIAL_MEMBER still sees it (as a flat link).
      { label: 'سندات القبض', to: '/admin/company-payments', icon: 'pi pi-receipt', permission: 'manage_company_payments' },
    ],
  },
  {
    label: 'إدارة الشاليهات',
    permission: 'manage_chalets',
    icon: 'pi pi-building',
    items: [
      { label: 'المجموعات', to: '/admin/chalet-groups', icon: 'pi pi-folder' },
      { label: 'الكماليات', to: '/admin/settings/amenities', icon: 'pi pi-sparkles' },
      // Folded in from the old standalone "الأمن" section — keeps its own
      // permission so SECURITY still sees it (as a flat link).
      { label: 'مسح QR', to: '/admin/qr-scan', icon: 'pi pi-qrcode', permission: 'scan_qr' },
    ],
  },
  {
    label: 'إعدادات النظام',
    permission: 'manage_settings',
    icon: 'pi pi-cog',
    items: [
      { label: 'القيم المرجعية', to: '/admin/settings/lookups', icon: 'pi pi-sliders-h' },
      { label: 'القرى', to: '/admin/villages', icon: 'pi pi-map-marker' },
      { label: 'إعدادات النظام', to: '/admin/settings/system', icon: 'pi pi-cog' },
    ],
  },
]
