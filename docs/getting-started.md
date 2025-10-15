# Getting Started Guide (2025)

## 🎯 Overview

Complete setup guide to get MultiCRM running locally in 30 minutes, from zero to working CRM platform.

## ✅ Prerequisites Check

**System Requirements:**
- **Node.js**: 20.x LTS (check with `node --version`)
- **PostgreSQL**: 15.x (check with `psql --version`)
- **Git**: 2.x (check with `git --version`)
- **npm**: 10.x (comes with Node.js)

**Quick validation:**
```bash
node --version && npm --version && psql --version && git --version
```

### Install Missing Dependencies

**Node.js Installation (if needed):**
```bash
# macOS with Homebrew
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows: Download from nodejs.org
# or use Chocolatey: choco install nodejs
```

**PostgreSQL Installation:**
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows: Download from postgresql.org
# or use Chocolatey: choco install postgresql
```

## 🎯 Step 1: Clone & Setup Repository

### Clone Repository
```bash
# Clone the repository
git clone https://github.com/sharadchaturveda-coder/MultiCRM.git multicrm
cd multicrm

# Verify structure
ls -la
# Should see: constitution.md, docs/, package.json, specs/, src/
```

### Install Dependencies
```bash
# Install all workspace dependencies
npm install

# Verify installation
npm run type-check  # Should pass without errors
```

## 🗄️ Step 2: Database Setup

### Create Database & User
```bash
# Connect as postgres superuser (Linux/macOS)
sudo -u postgres psql

# Create database and user
CREATE DATABASE multicrm;
CREATE USER multicrm_user WITH ENCRYPTED PASSWORD 'multicrm_password_2025';
GRANT ALL PRIVILEGES ON DATABASE multicrm TO multicrm_user;
\q

# For Windows: Run psql as Administrator or use pgAdmin
# Create same database and user through GUI
```

### Verify Database Connection
```bash
# Test connection with new user
PGPASSWORD=multicrm_password_2025 psql -h localhost -U multicrm_user -d multicrm -c "SELECT version();"
```

## ⚙️ Step 3: Environment Configuration

### Create Backend Environment File
```bash
cd src/backend

# Copy and edit environment template
cp .env.example .env

# Edit .env file with your database credentials
cat > .env << EOF
DATABASE_URL=postgresql://multicrm_user:multicrm_password_2025@localhost:5432/multicrm
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=3001
EOF

# Make script executable (if needed)
chmod +x scripts/init.ts
```

### Initialize Database Schema
```bash
# Run database initialization scripts
npm run migrate

# Verify schemas were created
PGPASSWORD=multicrm_password_2025 psql -h localhost -U multicrm_user -d multicrm -c "\dn"
# Should show: tenant_xxxxx schemas created
```

## 🚀 Step 4: Launch Backend API

### Start Development Server
```bash
# In src/backend directory
npm run dev

# Expected output:
# 📊 Database: postgresql://multicrm_user:****@localhost:5432/multicrm
# ✅ Master database connection established
# 🚀 Server running on http://localhost:3001
# 📊 Health check available at http://localhost:3001/health
```

### Test Backend Health
```bash
# Test health endpoint
curl -s http://localhost:3001/health | jq .
# Should return: {"status":"ok","timestamp":"2025-10-15T...","version":"1.0.0"}

# Test tenant creation
curl -X POST http://localhost:3001/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "Demo Company", "domain": "demo.com"}' | jq .

# Should return tenant object with UUID
```

## 🎨 Step 5: Launch Frontend Interface

### Open New Terminal Window
```bash
# Terminal 2: Start frontend
cd src/frontend
npm run dev

# Expected output:
# Vite dev server running on http://localhost:5173
```

### Access MultiCRM Interface
- **Frontend URL**: http://localhost:5173
- **Backend API**: http://localhost:3001/health

## 🎯 Step 6: Create Your First Tenant

### Via API (Terminal)
```bash
# Create first tenant
curl -X POST http://localhost:3001/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Company",
    "domain": "mycompany.com"
  }' | jq .

# Response will include tenant UUID - note it for next steps
```

### Via Frontend Interface (Browser)
1. Open http://localhost:5173
2. You should see the MultiCRM dashboard
3. Look for tenant selector (dropdown or selector)
4. Select your newly created tenant

## 📋 Step 7: Explore CRM Features

### Test Contact Management
```bash
# Get the tenant ID from earlier response
TENANT_ID="your-tenant-uuid-here"

# Create sample contact
curl -X POST http://localhost:3001/api/contacts \
  -H "x-tenant-id: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "phone": "+1-555-0123"
  }' | jq .

# List all contacts
curl http://localhost:3001/api/contacts \
  -H "x-tenant-id: $TENANT_ID" | jq .

# Search contacts
curl "http://localhost:3001/api/contacts?search=john" \
  -H "x-tenant-id: $TENANT_ID" | jq .
```

### Verify UI Functionality
In your browser (http://localhost:5173):

1. **Select Tenant**: Choose your created tenant
2. **Navigate Pages**: Try Dashboard, Contacts, Tasks
3. **Create Records**: Add contacts/leads/tasks through UI
4. **Search/Filter**: Test search functionality

## 🚀 Step 8: Domain Specialization (Optional)

### Create School CRM from Template
```bash
# Go back to project root
cd ../..

# Clone for school domain
cp -r multicrm school-crm
cd school-crm

# Edit shared types for school domain
# src/shared/src/types.ts - Add Student interface
```

### Customize School Entities
```typescript
// In src/shared/src/types.ts, add:
export interface Student extends Contact {
  student_id: string;      // School identifier
  grade_level: string;     // "9th Grade"
  enrollment_date: string;
  gpa?: number;
}

// Extend backend routes
// src/backend/src/routes/school.ts - Add school-specific endpoints
```

## 🧪 Step 9: Testing Setup (Optional)

### Run Tests
```bash
# Backend tests
cd src/backend
npm test

# Type check everything
npm run type-check

# Frontend tests (if configured)
cd ../frontend
npm test
```

### API Contract Testing
```bash
# Test all major endpoints
npm run test:api  # If configured

# Load testing (basic)
npm run load-test  # If configured
```

## 🔧 Step 10: Production Deployment (Optional)

### Deploy to Free Hosting
```bash
# Backend: Connect GitHub to Render
# 1. Go to render.com, create account
# 2. New Web Service from GitHub
# 3. Connect repository
# 4. Set environment variables:
#    - DATABASE_URL (create Render PostgreSQL)
#    - JWT_SECRET (generate secure random)
# 5. Deploy

# Frontend: Deploy to Cloudflare Pages
# 1. Go to cloudflare.com/pages, create account
# 2. Connect GitHub repository
# 3. Set build settings:
#    - Build command: npm run build
#    - Build output: dist
#    - Root directory: src/frontend
# 4. Set environment variable:
#    - VITE_API_URL: https://your-render-app.render.com
# 5. Deploy
```

## 🎉 Step 11: Verification Checklist

### Development Environment
- [ ] PostgreSQL running and accessible
- [ ] Database and user created with proper permissions
- [ ] Environment variables set correctly
- [ ] Backend server starts without errors
- [ ] Health check endpoint returns OK
- [ ] Frontend dev server running
- [ ] Tenant creation works
- [ ] Basic CRUD operations functional

### CRM Functionality
- [ ] Tenant selection works in UI
- [ ] Contact creation and listing functional
- [ ] Organization assignment works
- [ ] Search and filtering operational
- [ ] Data isolation between tenants confirmed

### Ready for Development
- [ ] TypeScript compilation successful
- [ ] No linting errors
- [ ] Tests pass (if configured)
- [ ] Git repository clean and ready for commits

## 🐛 Common Setup Issues

### Database Connection Issues
```bash
# Can't connect to PostgreSQL
sudo systemctl status postgresql  # Check if running
sudo systemctl start postgresql   # Start if stopped

# Permission denied
sudo -u postgres psql -c "ALTER USER multicrm_user CREATEDB;"

# Wrong password in .env
cat src/backend/.env | grep DATABASE_URL
```

### Port Conflicts
```bash
# Backend port 3001 already in use
lsof -i :3001                      # Find process using port
kill -9 <PID>                      # Kill conflicting process

# Frontend port conflicts
cd src/frontend && npm run dev -- --port 5174
```

### Node/npm Issues
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Version conflicts
nvm use 20  # If using nvm
node --version  # Should be 20.x
```

## 📞 Getting Help

If you encounter issues:

1. **Check this guide** - Most common problems covered above
2. **Review console logs** - Both backend and frontend servers
3. **Test database connectivity** - `psql "$DATABASE_URL"`
4. **Check environment variables** - `cat src/backend/.env`
5. **Review [Troubleshooting Guide](troubleshooting.md)** for advanced issues
6. **Check GitHub Issues** for similar problems

### Quick Health Checks
```bash
# All services should respond
curl http://localhost:3001/health  # Backend health
curl http://localhost:5173         # Frontend loads
psql -d multicrm -c "SELECT 1;"    # Database connectivity
```

---

## 🚀 What's Next?

**Now that you're set up:**

- **Explore Features**: Try creating contacts, organizations, and tasks
- **Customize Domains**: Follow [Domain Adaptation](domain-adaptation.md) for School/Hospital CRMs
- **Learn Development**: Study [Development Workflow](development.md) and [API Reference](api-reference.md)
- **Deploy**: Follow [Deployment Guide](deployment.md) for production hosting

**Your MultiCRM template is now active!** 🎯

*From template to working CRM in 30 minutes achieved.*
