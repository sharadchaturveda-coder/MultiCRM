# Troubleshooting Guide (2025)

## 🎯 Overview

Common issues and solutions for MultiCRM development and deployment problems.

## 🔧 First Response Checklist

**Before reporting issues:**
- [ ] Check [TOC](toc.md) for relevant documentation
- [ ] Review console logs for error messages
- [ ] Test locally before assuming production issues
- [ ] Verify environment variables are set correctly
- [ ] Confirm database connectivity and credentials

**Quick diagnostic commands:**
```bash
# Backend health check
curl -s http://localhost:3001/health | jq .

# Database connection test (if using psql)
psql "$DATABASE_URL" -c "SELECT 1;"

# Frontend build verification
cd src/frontend && npm run build && npm run preview

# TypeScript compilation check
npm run type-check
```

## 💻 Development Environment Issues

### PostgreSQL Connection Problems

**Error: "FATAL: password authentication failed"**
```bash
# Solution: Reset PostgreSQL password
sudo -u postgres psql
ALTER USER multicrm_user PASSWORD 'new_password';
\q

# Update .env file with new password
DATABASE_URL=postgresql://multicrm_user:new_password@localhost:5432/multicrm
```

**Error: "could not connect to server"**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL service
sudo systemctl start postgresql

# For macOS with Homebrew
brew services start postgresql

# Verify connection
pg_isready -h localhost
```

**Error: "database does not exist"**
```bash
# Create database as postgres user
sudo -u postgres createdb multicrm

# Grant permissions to user
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE multicrm TO multicrm_user;"

# Initialize schema
cd src/backend && npm run migrate
```

### Node.js Version Conflicts

**Error: "Cannot find module" or version mismatch**
```bash
# Check node version
node --version

# Use nvm to switch versions (if available)
nvm use 20  # or appropriate LTS version

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# If using workspaces
npm run clean && npm install
```

### TypeScript Compilation Issues

**Error: "Cannot find name" or type errors**
```bash
# Clear TypeScript cache
cd src/backend && npx tsc --build --clean

# Rebuild with verbose output
npx tsc --listFiles --strict src/index.ts

# Check shared types are available
cd src/shared && npm run build
cd ../backend && npm run type-check
```

### Frontend Build Failures

**Vite build errors with import paths**
```bash
# Clear Vite cache
cd src/frontend
rm -rf node_modules/.vite dist

# Check import paths in tsconfig
cat tsconfig.json | jq '.compilerOptions.paths'

# Reinstall dependencies
rm package-lock.json && npm install
npm run build
```

## 🌐 API Development Issues

### Tenant Isolation Problems

**Error: "Tenant not found" or cross-tenant data access**
```typescript
// Debug tenant middleware
import { Request, Response } from 'express';

app.use('/api/*', (req: Request, res: Response, next) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  console.log('Tenant ID:', tenantId, 'URL:', req.path);

  if (!tenantId) {
    return res.status(400).json({ error: 'Missing x-tenant-id header' });
  }
  next();
});

// Test tenant creation first
curl -X POST http://localhost:3001/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Corp", "domain": "test.com"}'
```

### Database Query Failures

**Error: "relation does not exist"**
```bash
# Check if tenant schema was created
psql "$DATABASE_URL" -c "\dn"  # List schemas

# Manually create schema if missing
psql "$DATABASE_URL" -c "CREATE SCHEMA IF NOT EXISTS tenant_test;"

# Verify tables exist in schema
psql "$DATABASE_URL" -c "SET search_path TO tenant_test; \dt;"
```

**SQL injection or parameter errors**
```typescript
// Use parameterized queries (safer)
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Safe query pattern
const result = await pool.query(
  'SELECT * FROM contacts WHERE tenant_id = $1 AND email = $2',
  [tenantId, email]
);

// Unsafe (never do this)
const unsafeQuery = `SELECT * FROM contacts WHERE email = '${email}'`;
```

### CORS Issues in Development

**Error: "CORS policy blocked"**
```typescript
// Update CORS configuration in src/backend/src/index.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://multicrm.pages.dev']
    : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id']
}));
```

## 🎨 Frontend Development Issues

### React Router Navigation Errors

**Error: "No routes matched location"**
```typescript
// Check route configuration in App.tsx
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/contacts" element={<Contacts />} />
      {/* Ensure routes match component paths */}
    </Routes>
  );
}
```

### Tenant Context Problems

**Error: "Tenant context not found"**
```typescript
// Wrap app with TenantProvider
import { TenantProvider } from './context/TenantContext';

function App() {
  return (
    <TenantProvider>
      <Router>
        <Routes>
          {/* routes */}
        </Routes>
      </Router>
    </TenantProvider>
  );
}

// Check context initialization
const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await apiService.getTenants();
      setTenants(response.data);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }
  };

  const contextValue = {
    tenants,
    currentTenant,
    setCurrentTenant,
    loading: false, // Add loading state if needed
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};
```

### API Integration Failures

**Error: "Network Error" or API timeouts**
```typescript
// Check API service configuration
// src/frontend/src/services/api.ts
class ApiService {
  private api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    timeout: 10000, // Increase if needed
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercept requests to add tenant header
  this.api.interceptors.request.use((config) => {
    const tenantId = localStorage.getItem('currentTenantId');
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }
    return config;
  });

  // Intercept responses for error handling
  this.api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}
```

## 🗄️ Database Schema Issues

### Migration Failures

**Error: "column already exists" or migration conflicts**
```bash
# Rollback and retry migration
cd src/backend
npm run db:rollback  # If rollback script exists

# Manual rollback for simple changes
psql "$DATABASE_URL" -c "ALTER TABLE contacts DROP COLUMN IF EXISTS new_column;"

# Check migration status
psql "$DATABASE_URL" -c "SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;"
```

### Index Performance Issues

**Slow queries on large tables**
```bash
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM contacts WHERE tenant_id = 'uuid' AND email ILIKE '%@domain.com';

-- Add composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_contacts_tenant_email ON contacts(tenant_id, email);
CREATE INDEX CONCURRENTLY idx_contacts_search ON contacts USING gin (to_tsvector('english', first_name || ' ' || last_name || ' ' || email));
```

### Schema Version Inconsistencies

**Error: "table definition differs"**
```bash
# Export current schema
pg_dump --schema-only --no-owner "$DATABASE_URL" > current_schema.sql

# Compare with expected schema
# Reset database for clean state (development only)
DROP DATABASE multicrm;
CREATE DATABASE multicrm;
# Re-run migrations from scratch
```

## 🚀 Production Deployment Issues

### Render Build Failures

**Build timeout or memory issues**
```yaml
# render.yaml optimizations
services:
  - type: web
    buildCommand: |
      npm ci --production=false
      npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_OPTIONS
        value: --max-old-space-size=1024  # Increase memory limit
```

**Missing environment variables**
```bash
# Render dashboard must have these set:
DATABASE_URL=<postgresql-connection-string>
JWT_SECRET=<256-bit-random-string>
NODE_ENV=production
PORT=10000

# Test connectivity in Render shell:
psql "$DATABASE_URL" -c "SELECT 1;"
psql "$DATABASE_URL" -c "\dn;"  # Check schemas
```

### Cloudflare Pages Issues

**Build fails or assets not loading**
```toml
# wrangler.toml (if using Wrangler)
name = "multicrm"
compatibility_date = "2025-01-15"
pages_build_output_dir = "src/frontend/dist"

[build]
command = "npm run build"
cwd = "src/frontend"

[build.environment_variables]
NODE_VERSION = "20"
VITE_API_URL = "https://multicrm.onrender.com"
```

### Performance Degradation

**Slow API responses in production**
```bash
# Enable query logging temporarily
# Add to Render environment variables:
DEBUG=multicrm:*  # Remove after debugging

# Check database performance
psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Monitor memory usage
curl https://multicrm.onrender.com/metrics
```

## 🔒 Security Issues

### Authentication Problems

**JWT token validation failures**
```typescript
// Verify JWT configuration
import jwt from 'jsonwebtoken';

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
};

// Check token expiration
const isTokenExpired = (token: string) => {
  const decoded = jwt.decode(token) as any;
  return decoded?.exp < Date.now() / 1000;
};
```

### CORS and Security Headers

**CSP or security header issues**
```typescript
// Security middleware configuration
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://multicrm.pages.dev"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://multicrm.onrender.com"]
    }
  }
}));
```

## 📊 Testing Issues

### Unit Test Failures

**Mock dependencies not working**
```typescript
// Example: Mock database for unit tests
import { jest } from '@jest/globals';

jest.mock('../database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

describe('ContactService', () => {
  it('should create contact successfully', async () => {
    // Mock implementation
    const mockQuery = database.pool.query as jest.MockedFunction<typeof database.pool.query>;
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'test-id' }] });

    const result = await contactService.createContact(contactData);
    expect(result.id).toBe('test-id');
  });
});
```

### Integration Test Setup

**Database isolation in tests**
```typescript
// Use separate test database
process.env.DATABASE_URL = 'postgresql://test_user:test_pass@localhost:5432/multicrm_test';

// Clean up between tests
afterEach(async () => {
  await database.query('DELETE FROM contacts');
  await database.query('DELETE FROM tenants');
});

// Close connections after all tests
afterAll(async () => {
  await database.close();
});
```

## 🔄 Git and Collaboration Issues

### Branch Merge Conflicts

**Resolve schema conflicts**
```bash
# When schema files conflict
git checkout --theirs src/shared/src/types.ts  # Take remote version
# Manually merge changes
git add src/shared/src/types.ts
git commit

# Rebuild after schema changes
npm run type-check
npm run build
```

### Pre-commit Hook Failures

**Linting or type checking fails**
```bash
# Check what pre-commit is running
cat .git/hooks/pre-commit

# Run checks manually
npm run lint
npm run type-check

# Temporarily bypass (not recommended for commits)
git commit --no-verify  # Only for emergencies
```

## 🐛 Debugging Tools & Techniques

### Enhanced Error Logging
```typescript
// Detailed error logging middleware
app.use((error: Error, req: Request, res: Response, next: Function) => {
  console.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    requestId: req.headers['x-request-id'] || 'unknown'
  });
});
```

### Performance Profiling
```typescript
// Add performance monitoring
const profiler = require('v8-profiler-node8');

// Start profiling
app.get('/debug/profile/start', (req, res) => {
  profiler.startProfiling('profile');
  res.json({ message: 'Profiling started' });
});

// Stop and save profile
app.get('/debug/profile/stop', (req, res) => {
  const profile = profiler.stopProfiling('profile');
  profile.export()
    .pipe(fs.createWriteStream('profile.cpuprofile'))
    .on('finish', () => {
      res.json({ message: 'Profile saved', file: 'profile.cpuprofile' });
    });
});
```

### Memory Leak Detection
```typescript
// Monitor memory usage over time
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
    external: Math.round(usage.external / 1024 / 1024) + ' MB'
  });
}, 30000); // Every 30 seconds
```

## 📞 Getting Help

### Resource Order
1. **Check this troubleshooting guide**
2. **Review [TOC](toc.md) for related documentation**
3. **Search existing issues in codebase**
4. **Check [API Reference](api-reference.md) for endpoint usage**
5. **Open issue with reproduction steps**

### Issue Report Template
```
## Problem Summary
Brief description of the issue

## Environment
- OS: [Windows/Linux/macOS]
- Node Version: [20.x]
- Database: [PostgreSQL 15.x]
- Browser: [Chrome 119.x]

## Steps to Reproduce
1. Do this...
2. Then that...
3. See error...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens (including error messages)

## Additional Context
Logs, screenshots, etc.
```

---

**Next:** Check [Getting Started](getting-started.md) for initial setup help.

**Most issues resolve with:** environment variable verification + database connectivity tests + clean npm install.
