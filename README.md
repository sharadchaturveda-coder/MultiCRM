# MultiCRM Template 🚀

A modular, multi-tenant CRM template designed for rapid business domain adaptation using free open-source technologies.

## 🌟 Mission

Create a **production-ready, reusable CRM foundation** that can be quickly adapted for specific business domains (School CRM, Hotel CRM, Hospital CRM, etc.) while maintaining strict separation of concerns and enterprise-grade architecture.

## 🚀 Quick Start

**Get running in 5 minutes:**
```bash
git clone <repository-url>
cd multicrm
# Follow setup guide below
```

## 📊 Current Status

| Component | Status | Description |
|-----------|--------|-------------|
| **Multi-Tenant Backend** | ✅ **PRODUCTION** | Express + PostgreSQL with full schema isolation deployed on Render |
| **Tenant Management APIs** | ✅ **PRODUCTION** | Complete CRUD for tenants with automatic schema provisioning |
| **CRM Database Schema** | ✅ **COMPLETE** | Full entity tables (users, contacts, organizations, leads, tasks) per tenant |
| **Shared Type System** | ✅ **PRODUCTION** | TypeScript interfaces across frontend/backend/shared modules |
| **React Frontend** | ✅ **PRODUCTION** | Vite + Tailwind UI with tenant context, routing, and data management |
| **Database Multi-Tenancy** | ✅ **ADVANCED** | PostgreSQL schema-per-tenant with connection pooling |
| **Infrastructure** | ✅ **DEPLOYED** | Render backend + ready for Cloudflare Pages frontend deployment |
| **Security & Environment** | ✅ **SECURE** | JWT framework, environment secrets, SSL connections |
| **Testing Suite** | ⚠️ **PLANNED** | Contract-based E2E tests (infrastructure ready) |

## 📋 Documentation

Complete documentation available in the [`docs/`](./docs/) folder:

- **[Getting Started](./docs/getting-started.md)** - Complete setup guide
- **[Frontend Guide](./docs/frontend-guide.md)** - React/Vite development patterns
- **[Backend Guide](./docs/backend-guide.md)** - Express/PostgreSQL server patterns
- **[Architecture](./docs/overview.md)** - Technical stack & current status
- **[Data Model](./docs/data-model.md)** - Entity relationships & schemas
- **[Future Roadmap](./docs/future-roadmap.md)** - Development priorities & timeline
- **[Specifications](../specs/)** - SDD workflow (Specs → Plans → Tasks → Code)

**📋 Product Requirements Document (PRD):** [`specs/001-universal-crm-core/spec.md`](../specs/001-universal-crm-core/spec.md)

## 🎯 Use Cases

**Instantly create CRMs for:**
- 🏫 **School CRM** - Student management, classes, grades
- 🏨 **Hotel CRM** - Reservations, guests, room management
- 🏥 **Hospital CRM** - Patients, appointments, medical records
- 📦 **Generic CRM** - Contacts, leads, tasks, invoices

**Template Cloning:**
```bash
# Create specialized CRM
cp -r multicrm school-crm
cd school-crm/src/shared/src
# Add Student, Class, Grade entities
# Extend with domain logic
```

---

## 🔑 Key Features

### ✅ **Enterprise Multi-Tenancy**
- PostgreSQL schema isolation per tenant
- Automatic tenant database provisioning
- Header-based tenant routing (`x-tenant-id`)
- Guaranteed data privacy and security

### ✅ **Specification-Driven Development (SDD)**
**"Specifications define truth. Code merely fulfills it."**

- **Intent-Driven Development**: WHAT before HOW
- **Multi-Phase Refinement**: Requirements → Design → Planning → Execution
- **Rich Specifications**: Structured documents with internal logic
- **SSDD Workflow**: `/specify` → `/plan` → `/tasks` → Code
- **Constitutional Gates**: Simplicity, test-first, anti-abstraction principles

**📋 All specs available in `specs/` folder**

### ✅ **TypeScript Throughout**
- End-to-end type safety
- API contract validation
- IntelliSense across all layers
- Compilation-time error catching

### ✅ **Production Ready**
- Error handling and logging
- Environment-based configuration
- Database connection pooling
- Graceful shutdown handling

---

## 📖 Quick Setup

```bash
# 1. Setup PostgreSQL database
createdb multicrm
createuser multicrm_user --password

# 2. Clone and install
git clone <repository-url>
cd multicrm

# 3. Install dependencies
cd src/shared && npm install && npm run build
cd ../backend && npm install

# 4. Configure environment
cp src/backend/.env.example src/backend/.env
# Edit with your PostgreSQL credentials

# 5. Initialize database
cd src/backend && npm run migrate

# 6. Start server
npm run dev

# 7. Test API
curl http://localhost:3001/health
```

**📖 Full Setup:** [Complete Getting Started Guide](./docs/getting-started.md)

---

## 📚 Project Structure

```
multicrm/
├── 📄 README.md              # This overview
├── 📚 docs/                   # 📖 Complete documentation
├── 📋 specs/                  # Project specifications
├── 🔧 src/                    # Source code
│   ├── shared/               # TypeScript type contracts
│   ├── backend/              # Express API server
│   └── frontend/             # React application (planned)
└── 🧪 tests/                  # Test suite (planned)
```

---

## 🤝 Contributing

**Contracts-First Development:**
1. Write specifications in `specs/`
2. Implementation follows contracts
3. Tests validate contracts

**Code Standards:**
- TypeScript strict mode always
- Multi-tenant isolation required
- Documentation alongside code
- Test coverage for all features

---

## 📄 License

**MIT Licensed** - Free for commercial and non-commercial use.

---

**🚀 Ready to build enterprise CRMs!** See [`docs/`](./docs/) for complete documentation.
# MultiCRM
