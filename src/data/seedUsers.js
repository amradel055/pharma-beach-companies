import { ROLES } from '@/constants/roles'

const SEED_USERS = [
  {
    id: 'seed_admin_001',
    name: 'أحمد المدير',
    email: 'admin@test.com',
    phone: '01000000001',
    password: '123456',
    role: ROLES.SITE_ADMIN,
    active: true,
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_sitecs_001',
    name: 'سارة خدمة العملاء',
    email: 'sitecs@test.com',
    phone: '01000000002',
    password: '123456',
    role: ROLES.SITE_CS,
    active: true,
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_villagecs_001',
    name: 'محمد خدمة القرية',
    email: 'villagecs@test.com',
    phone: '01000000003',
    password: '123456',
    role: ROLES.VILLAGE_CS,
    active: true,
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_villageadmin_001',
    name: 'فاطمة أدمن القرية',
    email: 'villageadmin@test.com',
    phone: '01000000007',
    password: '123456',
    role: ROLES.VILLAGE_ADMIN,
    active: true,
    avatar: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_owner_001',
    name: 'خالد المالك',
    email: 'owner@test.com',
    phone: '01000000004',
    password: '123456',
    role: ROLES.OWNER,
    active: true,
    avatar: null,
    chaletIds: [1, 2, 3],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_broker_001',
    name: 'عمر البروكر',
    email: 'broker@test.com',
    phone: '01000000005',
    password: '123456',
    role: ROLES.BROKER,
    active: true,
    avatar: null,
    commissionPercent: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_agent_001',
    name: 'ياسر المندوب',
    email: 'agent@test.com',
    phone: '01000000006',
    password: '123456',
    role: ROLES.AGENT,
    active: true,
    avatar: null,
    brokerId: 'seed_broker_001',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_operator_001',
    name: 'حسن المشغل',
    email: 'operator@test.com',
    phone: '01000000008',
    password: '123456',
    role: ROLES.OPERATOR,
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
    phone: '01000000009',
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
