# Dependency Map

Multirepo structure with shallow imports (max 2 levels deep). Each module exposes public API via index.ts.

## Root Level
```
multicrm/
├─ context.json (navigation index)
├─ docs/ (documentation)
├─ meta/ (governance)
├─ scripts/ (toolchain)
├─ specs/ (specifications)
├─ src/ (implementation)
└─ tests/ (testing)
```

## Implementation Dependencies
```
src/
├─ backend/
│  ├─ uses src/shared/types.ts
│  ├─ uses src/backend/config.ts
│  ├─ uses src/backend/database.ts
│  ├─ uses src/backend/middleware/tenant.ts
│  ├─ uses src/backend/routes/tenants.ts
│  └─ entry: src/backend/src/index.ts
├─ frontend/
│  ├─ uses src/shared/types.ts
│  ├─ uses src/frontend/context/TenantContext.tsx
│  ├─ uses src/frontend/services/api.ts
│  ├─ uses src/frontend/pages/ (dashboard, contacts, etc.)
│  ├─ uses src/frontend/hooks/ (tenant-aware hooks)
│  └─ entry: src/frontend/src/main.tsx
└─ shared/
   ├─ exports types from src/shared/src/types.ts
   ├─ exports utilities from src/shared/src/index.ts
   └─ no external dependencies
```

## Governance Dependencies
```
meta/
├─ meta.md defines constitutional constraints
├─ decisions/ledger.md tracks architectural decisions
└─ influences all specs via validate-meta-inheritance.js

specs/
├─ 000-foundation/spec-dd.md defines SDD process
├─ 001-universal-crm-core/ defines CRM entities
└─ feeds into tasks via spec-to-tasks.js
```

## Tool Dependencies
```
scripts/
├─ spec-to-tasks.js : specs/ → tasks/ generator
├─ validate-meta-inheritance.js : spec.md → compliance checker
├─ system-status.js : ecosystem health analyzer
├─ check-review-queue.js : decision aging monitor
└─ lessons-export.js : domain learning capturer

docs/
├─ _index.md : knowledge locator
├─ workflow-final-report.md : process documentation
└─ dependency-map.md : this file
