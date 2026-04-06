# Pharma Beach - Test Accounts

## Seed Users (Auto-created on first run)

> Clear localStorage to re-seed these accounts.

| Email | Password | Role | Arabic Label |
|-------|----------|------|-------------|
| `admin@test.com` | `123456` | Site Admin | أدمن الموقع |
| `sitecs@test.com` | `123456` | Site CS | خدمة عملاء الأدمن |
| `villageadmin@test.com` | `123456` | Village Admin | أدمن القرية |
| `villagecs@test.com` | `123456` | Village CS | خدمة عملاء القرية |
| `owner@test.com` | `123456` | Owner | مالك |
| `broker@test.com` | `123456` | Broker | بروكر |
| `agent@test.com` | `123456` | Agent | مندوب |


## Role Hierarchy (highest to lowest)

1. **Site Admin** - Full access to all dashboards, approvals, settings
2. **Site CS** - Chalet CRUD, search attributes, amenities, user management
3. **Village Admin** - Village dashboard, financial reports, orders, permits, user management
4. **Village CS** - Orders queue, permits, operational screens only (no financial reports)
5. **Owner** - Own chalets dashboard, calendar, financial KPIs, reports
6. **Broker** - Agents list, performance tracking, commission reports
7. **Agent** - Permits view for own bookings only
8. **Customer** - Public booking flow only (no admin access)

## Permissions per Role

| Permission | Site Admin | Site CS | Village Admin | Village CS | Owner | Broker | Agent |
|------------|:---------:|:-------:|:------------:|:----------:|:-----:|:------:|:-----:|
| Manage Users | x | x | x | x | | | |
| Manage Chalets | x | x | | | | | |
| Manage Search Attributes | x | x | | | | | |
| Manage Amenities | x | x | | | | | |
| Manage Approvals | x | | | | | | |
| Owner Dashboard | x | | | | x | | |
| Village Dashboard | x | | x | | | | |
| Broker Dashboard | x | | | | | x | |
| Agent Permits | x | | | | | | x |
| Manage Orders | x | | x | x | | | |
| View Permits | x | | x | x | | | x |
| Manage Coupons | x | x | | | | | |
| Financial Reports | x | x | x | | x | x | |

## Notes

- Admin users are redirected to `/admin` after login
- Customer accounts registered via the public registration form get `role: customer`
- Inactive accounts (`active: false`) cannot login and see "الحساب غير مفعل"
- Seed data only runs once (checks for `seed_admin_001` in localStorage)
