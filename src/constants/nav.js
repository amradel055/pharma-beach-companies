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
      { label: 'لوحة التشغيل', to: '/operations', icon: 'pi pi-desktop' },
    ],
  },
  {
    label: 'العمليات',
    permission: 'manage_orders',
    flat: true,
    items: [
      { label: 'الحجوزات', to: '/village-bookings', icon: 'pi pi-clipboard' },
      { label: 'الشاليهات', to: '/village-chalets', icon: 'pi pi-home' },
    ],
  },
  {
    label: 'إدارة المستخدمين',
    permission: 'manage_users',
    icon: 'pi pi-users',
    items: [
      { label: 'المستخدمين', to: '/users', icon: 'pi pi-users' },
      { label: 'الملاك', to: '/owners', icon: 'pi pi-user' },
      { label: 'الشركات', to: '/companies', icon: 'pi pi-briefcase' },
      { label: 'الأدوار', to: '/roles', icon: 'pi pi-key' },
      // Folded in from the old standalone "المالية" section — keeps its own
      // permission so FINANCIAL_MEMBER still sees it (as a flat link).
      { label: 'سندات القبض', to: '/company-payments', icon: 'pi pi-receipt', permission: 'manage_company_payments' },
    ],
  },
  {
    label: 'إدارة الشاليهات',
    permission: 'manage_chalets',
    icon: 'pi pi-building',
    items: [
      { label: 'المجموعات', to: '/chalet-groups', icon: 'pi pi-folder' },
      { label: 'الكماليات', to: '/settings/amenities', icon: 'pi pi-sparkles' },
      // Folded in from the old standalone "الأمن" section — keeps its own
      // permission so SECURITY still sees it (as a flat link).
      { label: 'مسح QR', to: '/qr-scan', icon: 'pi pi-qrcode', permission: 'scan_qr' },
    ],
  },
  {
    label: 'إعدادات النظام',
    permission: 'manage_settings',
    icon: 'pi pi-cog',
    items: [
      { label: 'القيم المرجعية', to: '/settings/lookups', icon: 'pi pi-sliders-h' },
      { label: 'القرى', to: '/villages', icon: 'pi pi-map-marker' },
      { label: 'إعدادات النظام', to: '/settings/system', icon: 'pi pi-cog' },
    ],
  },
]
