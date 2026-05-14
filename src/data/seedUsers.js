import { ROLES } from '@/constants/roles'

const SEED_USERS = [
  {
    id: 'seed_super_admin_001',
    name: 'أحمد السوبر أدمن',
    email: 'super@test.com',
    phone: '01000000001',
    password: '123456',
    role: ROLES.SUPER_ADMIN,
    active: true,
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_admin_company_001',
    name: 'فاطمة أدمن الشركة',
    email: 'admin-company@test.com',
    phone: '01000000002',
    password: '123456',
    role: ROLES.ADMIN_COMPANY,
    active: true,
    avatar: null,
    chaletIds: [1, 2, 3],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_admin_village_001',
    name: 'فاطمة أدمن القرية',
    email: 'admin-village@test.com',
    phone: '01000000003',
    password: '123456',
    role: ROLES.ADMIN_VILLAGE,
    active: true,
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_cs_company_001',
    name: 'سارة خدمة الشركة',
    email: 'cs-company@test.com',
    phone: '01000000004',
    password: '123456',
    role: ROLES.CUSTOMER_SERVICE_COMPANY,
    active: true,
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_head_cs_village_001',
    name: 'هند رئيسة خدمة القرية',
    email: 'head-cs-village@test.com',
    phone: '01000000005',
    password: '123456',
    role: ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE,
    active: true,
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_cs_village_001',
    name: 'محمد خدمة القرية',
    email: 'cs-village@test.com',
    phone: '01000000006',
    password: '123456',
    role: ROLES.CUSTOMER_SERVICE_VILLAGE,
    active: true,
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_broker_001',
    name: 'عمر بروكر الشركة',
    email: 'broker-company@test.com',
    phone: '01000000007',
    password: '123456',
    role: ROLES.BROKER_COMPANY,
    active: true,
    avatar: null,
    commissionPercent: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_broker_village_001',
    name: 'كريم بروكر القرية',
    email: 'broker-village@test.com',
    phone: '01000000008',
    password: '123456',
    role: ROLES.BROKER_VILLAGE,
    active: true,
    avatar: null,
    commissionPercent: 8,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_financial_001',
    name: 'منى المحاسبة',
    email: 'financial@test.com',
    phone: '01000000009',
    password: '123456',
    role: ROLES.FINANCIAL_MEMBER,
    active: true,
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_operation_001',
    name: 'حسن المشغل',
    email: 'operation@test.com',
    phone: '01000000010',
    password: '123456',
    role: ROLES.OPERATION,
    active: true,
    avatar: null,
    commissionPercent: 8,
    assignedChaletIds: [1, 2, 3],
    villageId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_security_001',
    name: 'علي الأمن',
    email: 'security@test.com',
    phone: '01000000011',
    password: '123456',
    role: ROLES.SECURITY,
    active: true,
    avatar: null,
    nationalId: '29901011234567',
    villageId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

export function seedUsers() {
  try {
    const existing = JSON.parse(localStorage.getItem('pb_users') || '[]')

    // Add any missing seed users (handles newly added roles)
    const merged = [...existing]
    let changed = false
    for (const seedUser of SEED_USERS) {
      if (!merged.some((u) => u.id === seedUser.id || u.email === seedUser.email)) {
        merged.push(seedUser)
        changed = true
      }
    }
    if (!changed && existing.length > 0) return
    localStorage.setItem('pb_users', JSON.stringify(merged))
  } catch {
    localStorage.setItem('pb_users', JSON.stringify(SEED_USERS))
  }
}
