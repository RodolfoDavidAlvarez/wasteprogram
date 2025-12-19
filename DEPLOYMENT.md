# Vercel Deployment Guide

## Current Deployment Status

**Live URL**: https://wasteprogram.vercel.app/
**Project Name**: wasteprogram
**GitHub Repository**: https://github.com/RodolfoDavidAlvarez/wasteprogram.git
**Deployment Platform**: Vercel
**Auto-Deploy**: Enabled (main branch)

---

## How Vercel Was Configured

### 1. Vercel CLI Installation

The Vercel CLI was installed globally using npm:

```bash
npm install -g vercel
```

**Installed Location**: `/Users/rodolfoalvarez/.npm-global/bin/vercel`

### 2. Project Linking

The project was linked to Vercel using:

```bash
vercel
```

This command:
- Created the `.vercel/` directory with project configuration
- Linked the local project to Vercel project ID: `prj_9ULwWJbRxQ0fJpqncqupIGfcq6Eu`
- Configured organization ID: `team_yW3kgnsHeuP0hbIBrcSeVnfe`

### 3. GitHub Integration

The repository was connected to GitHub:

```bash
git remote add origin https://github.com/RodolfoDavidAlvarez/wasteprogram.git
git push -u origin main
```

Vercel automatically detected the GitHub repository and enabled:
- Auto-deployment on push to `main` branch
- Preview deployments for pull requests
- Production deployments from `main` branch

### 4. Build Configuration

Vercel automatically detected Next.js and configured:

**Build Command**: `next build`
**Output Directory**: `.next`
**Install Command**: `npm install`
**Development Command**: `next dev`

The `package.json` includes a build script that runs Prisma generation:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### 5. Environment Variables

Environment variables were configured in Vercel Dashboard:

Required variables:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `RESEND_API_KEY` - Email service API key

Access: Vercel Dashboard → Project Settings → Environment Variables

### 6. Security Configuration

The `.gitignore` file was configured to exclude sensitive files:

```
.env
.env*.local
.env.production
.vercel
```

This ensures:
- Environment variables never committed to git
- Vercel configuration stays local
- Production secrets remain secure

---

## Deployment Workflow

### Automatic Deployment

Every push to `main` triggers a deployment:

```bash
git add .
git commit -m "feat: Your changes"
git push origin main
```

Vercel will:
1. Clone the repository
2. Install dependencies (`npm install`)
3. Generate Prisma client (`prisma generate`)
4. Build the Next.js app (`next build`)
5. Deploy to production

### Manual Deployment

Deploy directly from local machine:

```bash
vercel --prod
```

### Preview Deployments

Create a preview deployment:

```bash
vercel
```

This creates a unique URL for testing before merging to `main`.

---

## Vercel CLI Commands

### Common Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View deployment logs
vercel logs

# View project info
vercel inspect

# List deployments
vercel ls

# Remove deployment
vercel remove [deployment-url]

# Link project
vercel link

# View environment variables
vercel env ls
```

### Environment Variable Management

```bash
# Add production environment variable
vercel env add DATABASE_URL production

# Pull environment variables to local .env
vercel env pull

# Remove environment variable
vercel env rm DATABASE_URL
```

---

## Monitoring and Logs

### View Logs

**Via CLI**:
```bash
vercel logs --prod
```

**Via Dashboard**:
1. Go to https://vercel.com/dashboard
2. Select project "wasteprogram"
3. Click on latest deployment
4. View "Logs" tab

### Deployment Analytics

Access deployment analytics:
1. Vercel Dashboard → Project → Analytics
2. View metrics:
   - Response time
   - Traffic
   - Error rates
   - Build times

---

## Troubleshooting

### Build Failures

If deployment fails:

1. **Check build logs**:
   ```bash
   vercel logs
   ```

2. **Common issues**:
   - Missing environment variables
   - Prisma client not generated
   - TypeScript errors
   - Database connection issues

3. **Test build locally**:
   ```bash
   npm run build
   ```

### Database Issues

If database queries fail:

1. **Verify environment variables** in Vercel Dashboard
2. **Check Supabase connection**:
   ```bash
   node scripts/test-supabase.js
   ```
3. **Regenerate Prisma client**:
   ```bash
   npx prisma generate
   ```

### Environment Variables Not Working

1. **Pull latest env vars**:
   ```bash
   vercel env pull
   ```

2. **Verify in dashboard**:
   - Check variable names (case-sensitive)
   - Verify values are set for "Production"
   - Redeploy after changing variables

---

## Performance Optimization

### Edge Functions

Next.js API routes automatically deploy to Vercel Edge Network for low latency worldwide.

### Caching

Vercel automatically caches:
- Static pages
- Images (via Next.js Image Optimization)
- API responses (via `Cache-Control` headers)

### Build Output

The build output includes:
- Server-side rendered pages
- Static pages
- API routes
- Public assets

---

## Domain Configuration

The project is currently deployed at:
**https://wasteprogram.vercel.app/**

To add a custom domain:

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add domain: `app.soilseedandwater.com` (or desired domain)
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

---

## Team Access

The project is under organization:
**Org ID**: `team_yW3kgnsHeuP0hbIBrcSeVnfe`

To add team members:
1. Vercel Dashboard → Team Settings → Members
2. Invite via email
3. Assign role (Member, Developer, Admin)

---

## Rollback Strategy

If a deployment breaks production:

### Option 1: Via Dashboard
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Promote to Production"

### Option 2: Via Git
```bash
git revert HEAD
git push origin main
```

### Option 3: Via CLI
```bash
vercel rollback
```

---

## CI/CD Integration

Current setup:
- **Source**: GitHub
- **Branch**: main
- **Auto-deploy**: Enabled
- **Preview**: Enabled for PRs

Future enhancements:
- Add GitHub Actions for tests before deploy
- Add Lighthouse CI for performance monitoring
- Add automated database migrations

---

## Next Steps

1. Configure custom domain (optional)
2. Set up monitoring alerts
3. Add database backup automation
4. Configure branch preview deployments
5. Set up staging environment (separate Vercel project)

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js on Vercel**: https://vercel.com/docs/frameworks/nextjs
- **Vercel CLI Reference**: https://vercel.com/docs/cli
- **Vercel Support**: https://vercel.com/support

---

*Last Updated: December 19, 2024*
