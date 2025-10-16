# 🗂️ MultiCRM Knowledge Index

**Quick locator for governance and meta-tools. Updated: 2025-10-16**

## 📜 Constitutional Foundation

### [/constitution.md](constitution.md) - Laws of the Land
Hard rules that cannot be violated. All code must comply or fail CI/CD.

### [/meta/meta.md](meta/meta.md) - Product Charter
Value proposition, non-negotiables, stakeholder archetypes. New features inherit constraints automatically.

## 🤖 Meta-Automation Tools

### [/scripts/spec-to-tasks.js](scripts/spec-to-tasks.js) - Plan Compiler
Converts plan.md specifications into executable task breakdowns with test stubs and acceptance criteria.

### [/scripts/validate-meta-inheritance.js](scripts/validate-meta-inheritance.js) - Compliance Enforcer
Pre-commit hook ensuring specs inherit meta-spec constraints and acknowledge constitutional requirements.

### [/scripts/check-review-queue.js](scripts/check-review-queue.js) - Temporal Conscience
Scans decision ledger for overdue architectural reviews, creates prioritized review queues.

## 📊 Observability & Metrics

### [/metrics/index.json](metrics/index.json) - Health Dashboard
Rolling averages for quality gates (coverage, bundle size, response times), workflow efficiency metrics.

### [/decisions/ledger.md](decisions/ledger.md) - Institutional Memory
Chronological architectural decisions with impact scoring and quarterly review schedules.

## 🔄 Development Workflows

### Getting Started
1. [/docs/getting-started.md](docs/getting-started.md) - 30-minute setup guide
2. [/docs/development.md](docs/development.md) - Development workflow and quality gates
3. [/docs/prd.md](docs/prd.md) - Product requirements document

### Feature Development
1. **Read** [/meta/meta.md] and [/constitution.md] first
2. **Specify** requirements in `specs/###-new-feature/spec.md`
3. **Plan** architecture in `specs/###-new-feature/plan.md`
4. **Generate tasks**: `node scripts/spec-to-tasks.js specs/###-new-feature/plan.md`
5. **Develop** following task breakdown with test-first approach
6. **Commit** after `node scripts/validate-meta-inheritance.js` passes

### Operations
- **Check reviews**: `node scripts/check-review-queue.js` (weekly)
- **Validate compliance**: `node scripts/validate-meta-inheritance.js` (pre-commit)
- **Monitor metrics**: View `/metrics/index.json` for health dashboard

## 🎯 Key Directories

### [/specs/](specs/) - Specification-Driven Development
Features follow: specify → plan → tasks → code. Each feature gets its own folder with contracts, data models, quickstart guides.

### [/src/](src/) - Implementation
Modular monorepo: shared types, backend (Express), frontend (React), enterprise multi-tenancy.

### [/docs/](docs/) - Complete Documentation
Architecture, API references, deployment guides, troubleshooting - single source of truth.

## 🚀 Domain Specialization

**Template Cloning Workflow:**
```bash
cp -r multicrm [domain]-crm
cd [domain]-crm/src/shared/src
# Add domain entities (Student, Patient, Reservation, etc.)
# Extend API routes and business logic
```

**Enterprise Benefits:**
- 90%+ code reuse across domains
- TypeScript safety maintained
- Multi-tenancy works instantly
- Zero configuration deployment

**Time to Production:** 2 weeks from requirements to live system.

---

## 🏛️ Cybernetic Architecture

MultiCRM evolved from manual workflow rules → tool-assisted discipline → self-governing ecosystem.

The system now:
- **Self-documents** through automated ledger updates
- **Self-validates** compliance through inheritance checks
- **Self-improves** via reflexive review loops
- **Self-replicates** through domain template cloning
- **Self-monitors** via metrics aggregation

Welcome to institutional operating system. 🎉
