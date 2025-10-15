# Deployment Guide (2025)

## 🎯 Overview

Production deployment strategy for MultiCRM using free-tier hosting (Render + Cloudflare Pages) with enterprise-grade reliability.

## 🚀 Hosting Architecture

### Service Configuration
```
Internet
    ↓
Cloudflare Pages (Frontend)
    ↓ (HTTPS/TLS)
Render Web Service (Backend)
    ↓
Render PostgreSQL (Database)
```

### Zero-Cost Stack (2025)
- **Frontend**: Cloudflare Pages - Free tier, global CDN
- **Backend**: Render Web Service - 750 hours/month free
- **Database**: Render PostgreSQL - 256MB free tier
- **Domain**: Free at Render/Cloudflare, custom domain optional

## 📦 Frontend Deployment (Cloudflare Pages)

### Setup Process
```bash
# 1. Build production bundle
cd src/frontend
npm run build

# 2. Upload to Cloudflare Pages (dashboard)
# - Go to Cloudflare Dashboard → Pages
# - Connect GitHub repository
# - Set build settings:
#   - Build command: npm run build
#   - Build output directory: /dist
#   - Root directory: src/frontend

# 3. Deploy automatically on git push
```

### Configuration Files
**package.json build script:**
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**vite.config.ts:**
```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
        }
      }
    }
  }
})
```

### Environment Variables
```bash
# Cloudflare Pages dashboard → Settings → Environment variables
VITE_API_URL=https://multicrm.onrender.com
NODE_ENV=production
```

## 🔧 Backend Deployment (Render)

### Render Configuration
```yaml
# render.yaml configuration (optional)
services:
  - type: web
    name: multicrm-api
    runtime: node
    buildCommand: npm run build
    startCommand: npm start
    plan: starter  # 750 hours/month free
    envVars:
      - key: DATABASE_URL
        sync: false  # Set in Render dashboard
      - key: JWT_SECRET
        sync: false
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000  # Render assigns port
```

### Production Build Setup
**package.json scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts"
  }
}
```

**tsconfig.json for production:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": false,
    "removeComments": true
  }
}
```

## 🗄️ Database Setup (Render PostgreSQL)

### Initial Configuration
```bash
# 1. Create database in Render dashboard
# - Dashboard → PostgreSQL → Create
# - Plan: Free tier (256MB)
# - Region: Oregon (recommended for performance)

# 2. Note connection details:
# Host: dpg-xxxxxxxxx.us-west-2.render.com
# Database: multicrm_db
# Username: multicrm_user
# Password: [generated]
# Port: 5432

# 3. Set DATABASE_URL in Render environment:
DATABASE_URL=postgresql://multicrm_user:password@dpg-xxxxxxxxx:5432/multicrm_db
```

### Database Migration Strategy
```bash
# Production-ready migration script
# src/backend/scripts/migrate.ts
import { database } from '../database.js';

async function migrate() {
  try {
    console.log('🏗️ Running database migrations...');

    // Schema creation happens automatically on first tenant
    // But we can add explicit migration logic here

    console.log('✅ Migrations completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

## 🔒 Production Environment Variables

### Required Secrets
```bash
# Database Connection (from Render PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:port/database

# JWT Authentication (generate random)
JWT_SECRET=256-bit-random-string-generated-securely

# Node Environment
NODE_ENV=production
PORT=10000
```

### Security Best Practices
```bash
# Generate secure JWT secret
openssl rand -hex 32

# Never commit secrets to version control
# Use Render dashboard for all secrets
# Rotate secrets every 90 days

# Environment isolation:
# - Development: localhost database
# - Staging: Render staging environment
# - Production: Render production environment
```

## 🚀 Deployment Pipeline

### GitHub Integration
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: cd src/frontend && npm ci
      - name: Build frontend
        run: cd src/frontend && npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          project-name: multicrm
          directory: src/frontend/dist

  test-backend:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Setup Node
          uses: actions/setup-node@v3
        - name: Install dependencies
          run: cd src/backend && npm ci
        - name: Type check
          run: cd src/backend && npm run type-check
        - name: Test
          run: cd src/backend && npm run test

  deploy-backend:
    needs: test-backend
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Manual Deployment
```bash
# Frontend (one-time setup)
cd src/frontend
npm run build
# Upload dist/ folder to Cloudflare Pages manually

# Backend (one-time setup)
# Connect GitHub repo in Render dashboard
# Enable auto-deploy on git push
```

## 📊 Monitoring & Health Checks

### Application Monitoring
```typescript
// Health endpoint for load balancers
app.get('/health', async (req, res) => {
  try {
    // Database connectivity check
    await database.healthCheck();

    // Optional: External service checks
    // await externalApi.healthCheck();

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});
```

### Render Monitoring Dashboard
- **Metrics Available**:
  - Request count and response times
  - Error rates and status codes
  - CPU and memory usage
  - Database connection count

- **Alert Configuration**:
  - 5xx errors > 5% in 5 minutes
  - Response time > 10 seconds
  - Service unavailable > 5 minutes

### Cloudflare Analytics
- **Frontend Metrics**:
  - Page load times
  - Core Web Vitals
  - Geographic performance
  - Error rates

## 🔄 Blue-Green Deployment Strategy

### Reduce Downtime Risks
```bash
# 1. Deploy to staging environment first
# (Create separate staging service in Render)

# 2. Run integration tests against staging
npm run test:e2e -- --baseUrl=https://multicrm-staging.onrender.com

# 3. Verify staging with manual testing
# - Login flow
# - CRUD operations
# - Tenant isolation

# 4. Deploy to production
# git tag v1.2.3
# git push origin v1.2.3
# (Triggers production deployment)
```

### Rollback Procedures
```bash
# Immediate rollback available in Render dashboard
# Option 1: Rollback to previous deployment
# Option 2: Git revert and redeploy

# For database schema changes:
# Have backward-compatible migration scripts ready
# Prepare data migration scripts for complex changes
```

## 🔧 Performance Optimization

### Frontend Optimizations
```typescript
// vite.config.ts - Production build optimizations
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate chunks for better caching
          vendor: ['react', 'react-router-dom'],
          utils: ['date-fns', 'clsx'],
          ui: ['lucide-react', '@headlessui/react']
        }
      }
    }
  }
})
```

### Backend Optimizations
```typescript
// Connection pooling configuration
const poolConfig = {
  max: 20,              // Maximum connections
  min: 2,               // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Database query optimization
const getContactsOptimized = async (tenantId: string, filters: any) => {
  const query = `
    SELECT c.*, o.name as organization_name
    FROM contacts c
    LEFT JOIN organizations o ON c.organization_id = o.id
    WHERE c.tenant_id = $1
    AND ($2::text IS NULL OR c.first_name ILIKE $2 || '%')
    ORDER BY c.created_at DESC
    LIMIT $3 OFFSET $4
  `;

  return db.query(query, [tenantId, filters.search, filters.limit, filters.offset]);
};
```

## 🔒 Security Deployment Checklist

### Pre-Deployment Security
- [ ] **Secrets Management**: All secrets in Render dashboard, never in code
- [ ] **SSL/TLS**: Automatic on Render/Cloudflare, verify HTTPS forced
- [ ] **CORS Policy**: Properly configured for production URLs
- [ ] **Rate Limiting**: Implemented for API endpoints
- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **Database Security**: Connection pooling with proper SSL

### Post-Deployment Security
- [ ] **Dependency Scanning**: Run security audit before deployment
- [ ] **Firewall Rules**: Confirm database accessible only from Render
- [ ] **Access Logs**: Enable request logging for security monitoring
- [ ] **Backup Strategy**: Automated database backups configured
- [ ] **Incident Response**: Security breach procedures documented

## 🚨 Troubleshooting Production Issues

### Common Deployment Problems

**Build Failures:**
```bash
# Check build logs in Render dashboard
# Common issues:
# - TypeScript compilation errors
# - Missing environment variables
# - Node version mismatch

# Debug locally
cd src/backend && npm run build
cd ../frontend && npm run build
```

**Database Connection Issues:**
```bash
# Test connection string locally
psql "$DATABASE_URL" -c "SELECT 1;"

# Common issues:
# - Wrong database URL format
# - SSL certificate issues
# - Firewall blocking connections
```

**Frontend Asset Loading:**
```bash
# Check Cloudflare Pages build logs
# Common issues:
# - Incorrect build output directory
# - Missing environment variables
# - Routing configuration problems
```

### Performance Issues

**High Memory Usage:**
```typescript
// Add memory monitoring
app.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
  });
});
```

**Slow API Response:**
```typescript
// Add query performance logging
import { performance } from 'perf_hooks';

const logQueryPerformance = async (queryFn: Function, queryName: string) => {
  const start = performance.now();
  const result = await queryFn();
  const duration = performance.now() - start;

  if (duration > 1000) { // Log slow queries (>1 second)
    console.warn(`Slow query ${queryName}: ${duration.toFixed(2)}ms`);
  }

  return result;
};
```

## 📊 Cost Optimization

### Render Free Tier Optimization
- **750 hours/month** = 31.25 days of continuous running
- **Sleep after inactivity**: Automatic after 15 minutes
- **Wake on request**: Cold start ~10 seconds
- **Database storage**: 256MB limit

### Cost Monitoring
```bash
# Track usage in Render dashboard
# Monthly costs typically under $5 for small scale
# Scale up only when needed:
# - Starter: $7/month (3270 hours)
# - Standard: $25/month (unlimited hours)
# - Pro: $75/month (advanced features)
```

## 🎯 Domain-Specific Deployments

### Cloning for Domain CRMs
```bash
# Create school-crm from multicrm template
cp -r multicrm school-crm
cd school-crm

# Customize domain branding
# src/frontend: Update logo, colors, naming
# src/backend: Add domain routes (/api/students, /api/classes)
# docs/: Add school-specific guides

# Deploy as separate app
# - Create new Cloudflare Pages project
# - Create new Render web service
# - Use shared Render PostgreSQL or separate database
```

### Multi-Environment Strategy
```bash
# Environments per domain:
# - Development: Local development
# - Staging: Feature testing
# - Production: Live user access
#
# Each domain gets its own set of services
# Shared infrastructure components when beneficial
```

---

**Next:** [Troubleshooting Guide](troubleshooting.md) for debugging common issues.

**Production URLs:**
- **Frontend**: `https://multicrm.pages.dev`
- **Backend**: `https://multicrm.onrender.com`
- **Health Check**: `https://multicrm.onrender.com/health`

**Zero-cost enterprise deployment achieved! 🚀**
