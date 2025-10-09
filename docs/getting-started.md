# Getting Started Guide

## 📋 Prerequisites (5 minutes)

Required:
- **PostgreSQL 12+** installed and running
- **Node.js 18+** installed
- **Terminal/Command Prompt** access

## ⚡ Setup Database (2 minutes)

### PostgreSQL Setup
```bash
# Create database and user
sudo -u postgres psql

# Execute these commands:
CREATE DATABASE multicrm;
CREATE USER multicrm_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE multicrm TO multicrm_user;
\q
```

### Verify Connection
```bash
# Test access works
psql -h localhost -U multicrm_user -d multicrm -c "SELECT 1;"
```

## 🛠️ Install & Configure (3 minutes)

### Clone & Install
```bash
# Clone repository
git clone <repository-url>
cd multicrm

# Install backend dependencies
cd src/backend
npm install

# Install shared types
cd ../shared
npm install
npm run build
```

### Environment Setup
```bash
# Return to backend
cd ../backend

# Copy environment template
cp .env.example .env

# Edit with your credentials
# Update DB_USER, DB_PASSWORD, JWT_SECRET
```

### Initialize Database
```bash
# Run schema migration
npm run migrate
```

## 🚀 Run Application (1 minute)

### Start Development Server
```bash
# Start with hot reload
npm run dev
```

### Verify Health
```bash
# Check system is running
curl http://localhost:3001/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-09T13:30:00.000Z",
  "database": "connected"
}
```

## 🎯 Create First Tenant (1 minute)

### Test API Functionality
```bash
# Create your first tenant
curl -X POST http://localhost:3001/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Corporation",
    "domain": "demo.com"
  }'
```

### Store Tenant ID
```bash
# Response includes tenant_id for future requests
# Save this UUID: d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a
```

### List Tenants
```bash
# Verify tenant was created
curl http://localhost:3001/api/tenants
```

## 🔧 Common Setup Issues

### PostgreSQL Connection Failed
```bash
# Check if PostgreSQL is running
sudo systemctl is-active postgresql

# Start if needed
sudo systemctl start postgresql

# Test connection
psql -h localhost -U multicrm_user -d multicrm -c "SELECT version();"
```

### Port 3001 Already in Use
```bash
# Find what's using the port
lsof -i :3001

# Kill process or change port
# Edit .env: PORT=3002
```

### Database Migration Errors
```sql
-- Manual database reset if needed
sudo -u postgres psql -d multicrm
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO multicrm_user;
\q

# Then: cd src/backend && npm run migrate
```

### TypeScript Build Errors
```bash
# Rebuild shared types
cd src/shared
rm -rf node_modules dist
npm install
npm run build

# Check backend
cd ../backend
npm run type-check
```

## 🧪 Extended Verification

### Test Multi-Tenant Isolation
```bash
# Create second tenant
curl -X POST http://localhost:3001/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Corp", "domain": "test.com"}'

# Verify both tenants exist
curl http://localhost:3001/api/tenants | jq '.data | length'
# Should return: 2
```

### Database Inspection
```sql
-- Check tenant schemas created
sudo -u postgres psql -d multicrm -c "\dn"

-- View user tables in master
sudo -u postgres psql -d multicrm -c "\dt"
```

## 📱 Advanced Setup Options

### Docker Development (Optional)
```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: multicrm
      POSTGRES_USER: multicrm_user
      POSTGRES_PASSWORD: secure_password_here
    ports:
      - "5432:5432"
```

### IDE Configuration
```json
// VS Code settings.json
{
  "typescript.preferences.noSemicolons": "off",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 🎉 You're Ready!

**What you have running:**
- ✅ Multi-tenant PostgreSQL database
- ✅ Express.js API server with TypeScript
- ✅ Health monitoring endpoint
- ✅ Tenant creation/management APIs
- ✅ Auto-scaling database connections

**Next steps:**
1. [Add users](api-reference.md) to tenants
2. [Create contacts](api-reference.md) and other entities  
3. [Clone for domains](domain-adaptation.md) like school/hospital CRM
4. [Deploy to production](deployment.md)

**See issues?** Check [troubleshooting.md](troubleshooting.md) first.
