# Waste Diversion App - AI Development Guide

## Project Overview

This is the **Waste Diversion App** for Soil Seed & Water (SSW). It manages waste intake operations, scale house transactions, and environmental impact tracking.

**Live URL**: https://wasteprogram.vercel.app/
**Deployment**: Vercel (auto-deploy from main branch)

---

## CRITICAL: Shared Database Architecture

### Database Configuration

This application shares a Supabase PostgreSQL database with the **Organic Soil Wholesale** application.

**Database Instance**: `govktyrtmwzbzqkmzmrf.supabase.co`
**Connection**: Via Supabase pooler (connection string in environment variables)

### Table Naming Convention

**ALL Waste Diversion tables use the `wd_` prefix** to avoid conflicts with Organic Soil Wholesale tables.

| This App (wd_*) | Purpose |
|-----------------|---------|
| `wd_clients` | Waste client accounts |
| `wd_contracts` | Service agreements |
| `wd_waste_intakes` | Intake tickets |
| `wd_contamination_reports` | Contamination tracking |
| `wd_waste_type_configs` | Waste type definitions |
| `wd_daily_operations` | Daily summaries |
| `wd_environmental_metrics` | Environmental impact |
| `wd_users` | App users (audit trail) |
| `wd_scale_transactions` | Weight tickets |
| `wd_bills_of_lading` | BOL documents |
| `wd_company_trucks` | Fleet management |
| `wd_drivers` | Driver roster |

### DO NOT MODIFY These Tables

The following tables belong to **Organic Soil Wholesale** and must NOT be modified by this application:

- `products`, `orders`, `users` (customer accounts)
- `admin_users`, `admin_sessions`, `audit_logs`
- `onboarding_requests`, `contact_messages`
- `pricing_tiers`, `size_categories`, `delivery_zones`, `price_history`
- `representatives`, `representative_contacts`

**Rule**: If a table doesn't start with `wd_`, it belongs to Organic Soil Wholesale - DO NOT touch it.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Styling | Tailwind CSS |
| UI Components | Radix UI, Lucide React |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Deployment | Vercel |

---

## Project Structure

```
waste-diversion-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── schedule/           # Field team schedule portal
│   │   ├── intakes/            # Intake management
│   │   ├── clients/            # Client management
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn/ui components
│   │   └── ...
│   └── lib/                    # Utilities
├── prisma/
│   ├── schema.prisma           # Database schema (wd_* tables)
│   └── migration.sql           # Generated migration SQL
├── supabase/
│   └── migrations/             # Supabase migrations
├── scripts/
│   ├── verify-all-tables.js    # Verify database tables
│   └── test-supabase.js        # Test Supabase connection
└── .env                        # Environment variables
```

---

## Database Schema (Prisma)

The schema is defined in `prisma/schema.prisma`. Key points:

1. **Provider**: PostgreSQL (Supabase)
2. **Table Mapping**: Every model uses `@@map("wd_tablename")`
3. **IDs**: CUID strings (not auto-increment integers)

### Adding New Tables

When adding new tables to this application:

1. **Always use `wd_` prefix** in the `@@map()` directive
2. Use CUID for IDs: `id String @id @default(cuid())`
3. Include timestamps: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`

Example:
```prisma
model NewFeature {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("wd_new_features")  // CRITICAL: Always use wd_ prefix
}
```

### Running Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to Supabase
npx prisma db push

# Or use Supabase CLI for migrations
supabase db push
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RESEND_API_KEY` | Email service API key |

All variables are configured in:
- Local: `.env` file
- Production: Vercel environment variables

---

## Development Workflow

### Starting Development

```bash
cd waste-diversion-app
npm install
npm run dev
```

### Testing Database Connection

```bash
node scripts/test-supabase.js
node scripts/verify-all-tables.js
```

### Deploying Changes

Push to `main` branch triggers auto-deploy to Vercel.

```bash
git add .
git commit -m "feat: Description of change"
git push origin main
```

---

## API Routes

All API routes are in `src/app/api/`:

| Route | Purpose |
|-------|---------|
| `/api/clients` | Client CRUD |
| `/api/intakes` | Waste intake management |
| `/api/dashboard` | Dashboard statistics |

### API Pattern

```typescript
// src/app/api/example/route.ts
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = await prisma.client.findMany()  // Uses wd_clients table
  return Response.json(data)
}
```

---

## Key Features

### 1. Dashboard (`/`)
- YTD metrics: waste diverted, revenue, intake count
- Monthly trend charts
- Environmental impact metrics

### 2. Field Team Schedule (`/schedule`)
- Today view with real-time delivery tracking
- Monthly calendar with color-coded dates
- Load tracking with VR numbers

### 3. Intake Management (`/intakes`)
- New intake form
- Contamination checklist
- Client/SSW delivery options

### 4. Client Management (`/clients`)
- Client directory
- Onboarding workflow
- Contract management

---

## Important Notes for AI Development

1. **Never query tables without `wd_` prefix** - they belong to Organic Soil Wholesale
2. **Always use Prisma** for database operations (not raw Supabase client)
3. **Check `prisma/schema.prisma`** before assuming table structure
4. **Run `npx prisma generate`** after schema changes
5. **Test locally** with `npm run dev` before pushing

---

## Contact

**Company**: Soil Seed & Water
**Email**: ralvarez@soilseedandwater.com
**Gmail MCP**: Use `mcp__gmail-soilseed__*` tools for this project
