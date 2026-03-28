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
]

export function seedUsers() {
  try {
    const existing = JSON.parse(localStorage.getItem('pb_users') || '[]')
    const hasSeedAdmin = existing.some((u) => u.id === 'seed_admin_001')
    if (hasSeedAdmin) return

    // Add seed users without removing existing customer accounts
    const merged = [...existing]
    for (const seedUser of SEED_USERS) {
      if (!merged.some((u) => u.email === seedUser.email)) {
        merged.push(seedUser)
      }
    }
    localStorage.setItem('pb_users', JSON.stringify(merged))
  } catch {
    localStorage.setItem('pb_users', JSON.stringify(SEED_USERS))
  }
}
