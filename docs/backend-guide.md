# Backend Developer Guide (2025)

## 🎯 Overview

Enterprise-grade Express.js API server with PostgreSQL multi-tenancy, powering the MultiCRM platform with schema-based tenant isolation.

## 📁 Project Structure

```
src/backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── database.ts           # PostgreSQL connection pool
│   ├── config.ts             # Environment configuration
│   ├── middleware/
│   │   └── tenant.ts         # Tenant header validation
│   ├── routes/
│   │   └── tenants.ts        # Tenant management APIs
│   └── scripts/
│       └── init.ts           # Database initialization
├── package.json              # Backend dependencies
├── tsconfig.json             # TypeScript configuration
├── .env                      # Local environment variables
└── .env.example              # Environment template
```

## 🚀 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 22 LTS | JavaScript server environment |
| **Framework** | Express.js 4.x | REST API framework |
| **Language** | TypeScript | Type safety and IntelliSense |
| **Database** | PostgreSQL | Multi-tenant data storage |
| **ORM/Connection** | pg (node-postgres) | SQL query execution with pooling |
| **Environment** | dotenv | Configuration management |
| **Security** | helmet + CORS | Security middleware |
| **Logging** | morgan | HTTP request logging |
| **Development** | tsx | TypeScript execution in development |

## 🔧 Core Architecture

### Server Initialization (`src/index.ts`)
```typescript
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config.js'
import { database } from './database.js'
import tenantRoutes from './routes/tenants.js'
import { tenantMiddleware } from './middleware/tenant.js'

// Environment loading (ESM-safe path resolution)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const port = config.server.port

// Security + middleware stack
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealthy = await database.healthCheck()
  res.json({
    status: dbHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected'
  })
})

// API routes
app.use('/api/tenants', tenantRoutes)

// Tenant-scoped routes (require x-tenant-id)
app.use('/api/tenant/*', tenantMiddleware, (req, res) => {
  res.json({ success: true, tenantId: req.tenantId })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await database.close()
  process.exit(0)
})
```

### Multi-Tenant Database Pool (`src/database.ts`)
```typescript
class Database {
  private pools: Map<string, Pool> = new Map()
  private masterPool: Pool

  constructor() {
    this.masterPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  }

  async getTenantPool(tenantId: string): Promise<Pool> {
    if (this.pools.has(tenantId)) {
      return this.pools.get(tenantId)!
    }

    // Create new schema for tenant
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`
    await this.masterPool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)

    // Create tenant-specific tables
    await this.createTenantTables(schemaName)

    const tenantPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })

    // Set search path to tenant schema
    await tenantPool.query(`SET search_path TO ${schemaName}`)

    this.pools.set(tenantId, tenantPool)
    return tenantPool
  }

  private async createTenantTables(schemaName: string) {
    // Users, contacts, organizations, leads, tasks tables
    // All automatically created per tenant
  }
}
```

## 🛠️ Development Commands

```bash
# Start development server (auto-reload)
cd src/backend
npm run dev           # tsx watch src/index.ts

# Build for production
npm run build         # tsc → compiles to dist/

# Start production server
npm run start         # node dist/backend/src/index.js

# Database initialization (creates schemas)
npm run migrate       # tsx scripts/init.ts
```

## 🌐 Environment Configuration

### Environment Variables
```bash
# .env file (local development)
DATABASE_URL=postgresql://multicrm_user:password@localhost:5432/multicrm
JWT_SECRET=your-256-bit-secret
PORT=3001
NODE_ENV=development

# Render production (dashboard set)
DATABASE_URL=<managed by Render>
JWT_SECRET=<managed by Render>
PORT=10000  # Render assigns port
NODE_ENV=production
```

### Configuration Patterns (`src/config.ts`)
```typescript
export interface ServerConfig {
  port: number
  nodeEnv: string
}

export interface DatabaseConfig {
  connectionString: string
  ssl: { rejectUnauthorized: false }
}

export interface JwtConfig {
  secret: string
}

export const config = {
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  database: {
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret'
  }
}
```

## 🗄️ Database Schema Architecture

### Master Database Structure
```sql
-- Shared across all tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tenant lookup
CREATE INDEX idx_tenants_domain ON tenants(domain);
```

### Tenant-Specific Schema (Auto-Created)
```sql
-- Each tenant gets isolated schema: tenant_<uuid>
CREATE SCHEMA tenant_d0b4c28c_8f7e_5c19_a1e3_2b7d8b9f6e5a;

-- User accounts per tenant
CREATE TABLE tenant_d0b4c28c_8f7e_5c19_a1e3_2b7d8b9f6e5a.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,  -- Redundant but explicit
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Similar tables for contacts, organizations, leads, tasks...
```

### Connection Pool Management
```typescript
// Schema isolation per tenant
const tenantPool = await database.getTenantPool(tenantId)
await tenantPool.query(`SELECT * FROM contacts`)  // Only sees tenant's data

// Master pool for tenant management
const masterPool = database.getMasterPool()
await masterPool.query('SELECT * FROM tenants')  // Cross-tenant data
```

## 🔄 API Architecture Patterns

### Route Structure (`src/routes/tenants.ts`)
```typescript
import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { database } from '../database.js'

const router = Router()

// POST /api/tenants - Create tenant
router.post('/', async (req: Request, res: Response) => {
  const { name, domain }: { name: string; domain: string } = req.body

  if (!name || !domain) {
    return res.status(400).json({
      success: false,
      error: 'Name and domain are required'
    })
  }

  const tenantId = uuidv4()
  const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`

  // 1. Store tenant metadata in master table
  await masterPool.query('INSERT INTO tenants (id, name, domain) VALUES ($1, $2, $3)', [
    tenantId, name, domain
  ])

  // 2. Initialize tenant-specific schema & tables
  await database.getTenantPool(tenantId)  // Triggers schema creation

  res.status(201).json({
    success: true,
    data: { id: tenantId, name, domain, ...timestamps },
    message: 'Tenant created successfully'
  })
})

// GET /api/tenants - List all tenants
router.get('/', async (req: Request, res: Response) => {
  const result = await masterPool.query('SELECT * FROM tenants ORDER BY created_at DESC')
  res.json({ success: true, data: result.rows })
})

// GET /api/tenants/:id - Get specific tenant
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await masterPool.query('SELECT * FROM tenants WHERE id = $1', [id])

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Tenant not found' })
  }

  res.json({ success: true, data: result.rows[0] })
})
```

### Middleware Pattern (`src/middleware/tenant.ts`)
```typescript
export const tenantMiddleware = async (req: Request, res: Response, next: Function) => {
  const tenantId = req.headers['x-tenant-id'] as string

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: 'Missing x-tenant-id header'
    })
  }

  try {
    // Verify tenant exists
    const masterPool = database.getMasterPool()
    const tenantResult = await masterPool.query(
      'SELECT id, name FROM tenants WHERE id = $1',
      [tenantId]
    )

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      })
    }

    // Attach tenant info to request
    req.tenantId = tenantId
    req.tenant = tenantResult.rows[0]

    next()
  } catch (error) {
    console.error('Tenant middleware error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
```

## 🚀 Production Deployment

### Render Configuration
```yaml
# render.yaml (optional - can configure in dashboard)
services:
  - type: web
    runtime: node
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false  # Set in Render dashboard
      - key: JWT_SECRET
        sync: false
```

### Environment Setup
```bash
# In Render dashboard
DATABASE_URL=postgresql://user:pass@host:port/database
JWT_SECRET=256-bit-random-string-generated-securely
NODE_ENV=production
```

### Build Process
```bash
# Render auto-executes:
npm install        # Installs dependencies
npm run build      # Compiles TypeScript to dist/
npm start          # Runs compiled JavaScript

# Health check ensures DB connectivity
curl https://your-app.render.com/health
```

## 🔒 Security & Compliance

### Security Headers (helmet)
- HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- Clickjacking protection
- MIME sniffing protection

### CORS Configuration
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend.pages.dev']
    : ['http://localhost:5173'],
  credentials: true
}))
```

### SSL/TLS (PostgreSQL)
- Render-managed SSL certificates
- Connection string includes SSL requirement
- `rejectUnauthorized: false` for self-signed cert acceptance

## 📊 Performance & Monitoring

### Database Connection Pools
- Per-tenant connection pools prevent exhaustion
- Automatic cleanup on tenant inactivity
- Max connections configurable per environment

### Health Checks
```typescript
// /health endpoint
app.get('/health', async (req, res) => {
  const dbHealthy = await database.healthCheck()
  res.json({
    status: dbHealthy ? 'ok' : 'error',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
})
```

### Logging (morgan)
```typescript
app.use(morgan('combined'))  // Apache-style logs
// Example: 127.0.0.1 - - [15/Oct/2025:18:00:00 +0000] "GET /health HTTP/1.1" 200 85
```

## 🔮 Future Enhancements

### High Priority
- [ ] **Authentication APIs**: JWT token issuance/validation
- [ ] **Tenant-specific CRUD**: Contacts, leads, tasks endpoints
- [ ] **Rate Limiting**: API throttling protection
- [ ] **Database Migrations**: Versioned schema updates

### Medium Priority
- [ ] **API Documentation**: OpenAPI/Swagger generation
- [ ] **Error Tracking**: Sentry integration
- [ ] **Caching Layer**: Redis for frequently accessed data
- [ ] **Background Jobs**: Queue system for heavy computations

### Architecture Improvements
- [ ] **GraphQL Server**: Alternative to REST endpoints
- [ ] **WebSocket Support**: Real-time notifications
- [ ] **File Upload**: Document/attachment management
- [ ] **Audit Logging**: Security and compliance tracking

## 🧾 Developer Onboarding

### New Backend Developer - 30 Minutes
1. Clone repository and `cd src/backend && npm install`
2. Copy `.env.example` to `.env` and configure PostgreSQL
3. Run `npm run migrate` to initialize database
4. Execute `npm run dev` to start server with auto-reload
5. Test `curl http://localhost:3001/health` for connectivity
6. Review `src/database.ts` for multi-tenancy understanding
7. Check `src/routes/tenants.ts` for API patterns

### Understanding Data Flow
- **Master Pool**: Manages tenant metadata (`tenants` table)
- **Tenant Pools**: Isolated per-organization data access
- **Schema Creation**: Automatic on first tenant API call
- **Connection Caching**: Pools persist for performance

### Key Files to Study First
- `src/database.ts` - Multi-tenancy architecture
- `src/config.ts` - Environment configuration patterns
- `src/routes/tenants.ts` - API structure and error handling
- `src/middleware/tenant.ts` - Security and tenant validation
- `package.json` - Scripts and dependencies

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL running
sudo systemctl is-active postgresql

# Test connection manually
psql -h localhost -U multicrm_user -d multicrm

# Verify .env values
echo $DATABASE_URL
```

**Tenant Middleware Errors**
```bash
# Test header validation
curl -H "x-tenant-id: invalid-uuid" http://localhost:3001/api/tenant/test

# Verify tenant exists
curl http://localhost:3001/api/tenants
```

**Build/Compilation Issues**
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Manual TypeScript check
npx tsc --noEmit

# Clean rebuild
npm run build
```

### Debug Commands
```bash
# Check TypeScript compilation
npm run type-check

# List database schemas (tenants)
psql $DATABASE_URL -c "\dn"

# View tenant tables
psql $DATABASE_URL -c "SET search_path TO tenant_<uuid>; \dt"

# Monitor connections
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Test health endpoint
curl -v http://localhost:3001/health
```

## 📈 Performance Monitoring

### Render Dashboard Metrics
- Response times per endpoint
- Error rates and status codes
- Database connection usage
- Memory and CPU utilization

### Database Query Monitoring
```sql
-- Slow query analysis
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Connection count monitoring
SELECT count(*) FROM pg_stat_activity
WHERE datname = 'multicrm';
```

### Memory Usage Tracking
```typescript
// Server metrics endpoint (future enhancement)
app.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage()
  res.json({
    rss: (memUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
    heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
    heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
    uptime: process.uptime()
  })
})
```

---

This guide establishes the foundation for backend development. Focus on the **multi-tenant isolation patterns** and **API structure conventions** when extending the server.
