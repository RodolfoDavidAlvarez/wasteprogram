# Authentication Setup Instructions

## Overview

The Waste Diversion App now uses Supabase Auth for authentication. This guide explains how to set up the admin user and run the necessary migrations.

## Step 1: Update Database Schema

The User table has been updated to include `authUserId` to link with Supabase Auth. Run the migration:

```bash
# Option 1: Using Prisma (recommended if DATABASE_URL is correctly configured)
cd waste-diversion-app
npx prisma db push

# Option 2: Apply the migration directly via Supabase
# The SQL migration file is at: supabase/migrations/20251220000000_update_users_table.sql
# You can apply it via Supabase dashboard or CLI
```

If you get a "Tenant or user not found" error, ensure your `DATABASE_URL` in `.env` is correct.

## Step 2: Create Admin User

Run the admin user creation script:

```bash
cd waste-diversion-app

# Set a temporary password (or it will default to "ChangeMe123!")
export ADMIN_INITIAL_PASSWORD="YourSecurePassword123!"

# Run the script
npx ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/create-admin-user.ts
```

This script will:

1. Create Rodolfo Alvarez as a user in Supabase Auth (if not already exists)
2. Link the Supabase Auth user to our database `wd_users` table
3. Set the role as "admin"

**Login credentials:**

- Email: `ralvarez@soilseedandwater.com`
- Password: The password you set (or "ChangeMe123!" if not set)
- ⚠️ **Important**: Change the password after first login!

## Step 3: Test Login

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to `/login`
4. Login with the credentials above
5. You should be redirected to the dashboard

## Protected Routes

All routes except these are protected (require authentication):

- `/login` - Login page
- `/congress-arrival` - Public driver check-in page

## Environment Variables Required

Make sure these are set in your `.env` file:

```env
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_postgres_connection_string
```

## Adding More Users

To add more admin users, you can:

1. Use the Supabase Auth admin API directly
2. Modify the `create-admin-user.ts` script to accept parameters
3. Use the Supabase dashboard to invite users via email

Then create a corresponding record in `wd_users` table with the `authUserId` linking to the Supabase Auth user ID.
