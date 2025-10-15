# Development Workflow Guide (2025)

## 🎯 Overview

Structured development process following Specification-Driven Development (SDD) principles for consistent, high-quality code contributions.

## � Development Quickstart

**30-minute setup:** See [Getting Started](../getting-started.md) - local environment, database, API testing.

**Contributing:** Following structured workflow ensures quality and consistency across team.

## 🔄 SDD Development Workflow

### Phase 1: Specification (Intent → Requirements)
```bash
# Create specification from templates
cp specs/000-foundation/templates/spec-template.md \
   specs/002-feature-name/spec.md

# Edit specifications following template structure
# Define: Problem, Solution Overview, Requirements, Success Metrics
```

### Phase 2: Plan (Requirements → Architecture)
```bash
# Generate implementation plan
cp specs/000-foundation/templates/plan-template.md \
   specs/002-feature-name/plan.md

# Architecture decisions:
# - API endpoints and data flow
# - Database schema changes
# - Frontend components needed
# - Testing approach
```

### Phase 3: Tasks (Architecture → Executable Steps)
```bash
# Break down into implementable tasks
cp specs/000-foundation/templates/tasks-template.md \
   specs/002-feature-name/tasks.md

# Task format: Action + Implementation Details + Acceptance Criteria
```

### Phase 4: Code (Tasks → Working Implementation)
```bash
# Implement following tasks in priority order
git checkout -b feature/feature-name
# Code changes with tests
npm run test          # Run test suite
git commit -m "feat: implement feature-name"
```

## 📋 Quality Gates & Standards

### Constitutional Codes (Hard Requirements)

#### ❌ Prohibitions (Will Fail Review)
- **Zero variance from specifications** - Code must implement spec exactly
- **No unnecessary complexity** - Keep simple unless complexity solves real problem
- **No technical debt introduction** - Clean code or fix issues immediately
- **No console.log debugging** - Proper logging or remove debug statements

#### ✅ Requirements (Must Include)
- **TypeScript strict mode** - All code type-safe with no `any` types
- **Complete test coverage** - Unit + integration tests for all features
- **Documentation updates** - README, API docs, guides updated
- **Working deployment** - Feature ships to staging environment

### Code Review Checklist

#### Architectural Compliance
- [ ] SDD workflow followed (spec → plan → tasks → code)
- [ ] Design patterns align with existing codebase
- [ ] Database changes use proper migrations
- [ ] API contracts match OpenAPI specifications

#### Code Quality Standards
- [ ] TypeScript strict mode passes without errors
- [ ] ESLint rules passing with zero errors
- [ ] Code complexity metrics within acceptable range
- [ ] Error handling covers all edge cases

#### Testing Requirements
- [ ] Unit tests cover all public functions (90%+ coverage)
- [ ] Integration tests verify end-to-end workflows
- [ ] Edge cases and error conditions tested
- [ ] Test performance meets baseline requirements

#### Documentation Standards
- [ ] README updated with new features
- [ ] API documentation synchronized
- [ ] Code comments for complex business logic
- [ ] Migration guides for breaking changes

## 🔄 Git Workflow & Branch Management

### Feature Branch Flow
```bash
# Create feature branch from main
git checkout -b feature/add-contact-api

# Regular commits with descriptive messages
git commit -m "api: add contact CRUD endpoints"
git commit -m "test: add contact API unit tests"
git commit -m "docs: update API reference"

# Interactive rebase before merging
git rebase -i origin/main

# Clean merge to main
git checkout main
git merge --no-ff feature/add-contact-api
```

### Commit Message Convention
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation only
- style: Code style changes
- refactor: Code refactoring
- test: Test additions
- chore: Maintenance tasks

Examples:
feat(api): add contact creation endpoint
fix(auth): resolve JWT token expiration issue
docs(readme): update setup instructions
test(contacts): add bulk import test coverage
```

### Merge Requirements
- **Green CI/CD Pipeline** - All tests passing, code quality checks
- **Approved Code Review** - Two maintainer approvals minimum
- **Up-to-Date Branch** - Conflict-free rebase with latest main
- **Documentation Complete** - All related docs updated

## 🧪 Testing Strategy

### Test Pyramid Structure
```typescript
// Unit Tests (80% of tests) - Individual functions/components
describe('ContactService.createContact', () => {
  it('should create contact with valid data', async () => {
    const contactData = { first_name: 'John', last_name: 'Doe' };
    const contact = await contactService.createContact(contactData);
    expect(contact.id).toBeDefined();
  });
});

// Integration Tests (15% of tests) - API workflows
describe('Contact API', () => {
  it('should create and retrieve contact', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .set('x-tenant-id', tenantId)
      .send({ first_name: 'Jane', last_name: 'Smith' });

    expect(response.status).toBe(201);
    const contactId = response.body.data.id;

    const getResponse = await request(app)
      .get(`/api/contacts/${contactId}`)
      .set('x-tenant-id', tenantId);

    expect(getResponse.body.data.first_name).toBe('Jane');
  });
});

// End-to-End Tests (5% of tests) - Full user journeys
describe('User Registration Flow', () => {
  it('should register new user and allow login', async () => {
    // ... complete user journey test
  });
});
```

### Test-Driven Development
```typescript
// Red-Green-Refactor cycle
describe('Contact Import Feature', () => {
  it('should validate CSV format before import', () => {
    // RED: Test fails (feature not implemented)
    expect(() => validateCsv(['invalid,csv'])).toThrow();

    // GREEN: Implement minimal solution
    function validateCsv(rows: string[]) {
      if (!rows.every(row => row.includes(','))) {
        throw new Error('Invalid CSV format');
      }
    }

    // REFACTOR: Improve implementation while keeping tests green
    function validateCsvImproved(rows: string[]) {
      const headers = rows[0].split(',');
      if (headers.length < 2) {
        throw new Error('CSV must have at least 2 columns');
      }
      // ... additional validations
    }
  });
});
```

## 🔍 Code Quality Tools

### Automated Quality Checks
```bash
# Pre-commit hooks
npm run pre-commit    # Runs all quality checks

# Individual checks
npm run type-check     # TypeScript compilation
npm run lint           # ESLint code quality
npm run test           # Jest test suite
npm run coverage       # Coverage report

# Performance checks
npm run bundle-analyze # Frontend bundle analysis
npm run lighthouse     # Performance metrics
```

### Code Quality Metrics
- **Cyclomatic Complexity** < 10 per function
- **Test Coverage** > 90% for business logic
- **Bundle Size** < 500KB for frontend
- **Lighthouse Score** > 90 for performance
- **Zero ESLint Errors** on committed code

## 📊 Continuous Integration

### CI Pipeline Stages
```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Type checking
        run: npm run type-check
      - name: Linting
        run: npm run lint
      - name: Testing
        run: npm run test
      - name: Build check
        run: npm run build

  deploy_staging:
    if: github.ref == 'refs/heads/main'
    needs: test
    # Deploy to staging environment
```

### Deployment Checklist
- [ ] **Feature Flags**: New features disabled by default
- [ ] **Database Migrations**: Backward-compatible schema changes
- [ ] **Environment Variables**: New configs documented
- [ ] **Monitoring**: Health checks and alerting configured
- [ ] **Rollback Plan**: Easy reversion strategy prepared

## 🐛 Debugging & Troubleshooting

### Development Debugging
```typescript
// Debug logging (temporary, remove before commit)
import debug from 'debug';
const log = debug('multicrm:contact-service');

const contactService = {
  async createContact(data) {
    log('Creating contact with data:', data);
    const result = await db.query('INSERT INTO contacts ...');
    log('Contact created:', result);
    return result;
  }
};
```

### Production Debugging
```bash
# Enable debug logging
DEBUG=multicrm:* npm run dev

# API request debugging
curl -v -H "x-tenant-id: debug-uuid" \
  http://localhost:3001/api/contacts

# Database query debugging
npm run db:logs               # Show SQL queries
npm run db:slow-queries        # Identify performance issues
```

## 📋 Contributor Guidelines

### First Time Contributors
1. Read [Getting Started](getting-started.md) guide
2. Understand [SDD Philosophy](../specs/000-foundation/spec-dd.md)
3. Join project Slack/Discord for discussions
4. Start with "good first issue" labeled tasks

### Pull Request Template
```markdown
## Description
Brief description of changes

## SDD Compliance
- [ ] Specifications updated
- [ ] Implementation matches spec exactly
- [ ] Tests added for new functionality
- [ ] Documentation updated

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Breaking Changes
None

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Commit messages follow convention
- [ ] No console.logs or debug statements
- [ ] All tests pass locally
```

## 🎯 Development Best Practices

### Performance Optimization
```typescript
// Database query optimization
const getContacts = async (tenantId: string, filters: ContactFilters) => {
  // Use indexes for frequent queries
  const query = sql`
    SELECT * FROM contacts
    WHERE tenant_id = ${tenantId}
    AND (${filters.search}::text IS NULL OR
         first_name ILIKE '%' || ${filters.search} || '%' OR
         last_name ILIKE '%' || ${filters.search} || '%')
    ORDER BY created_at DESC
    LIMIT ${filters.limit} OFFSET ${filters.offset}
  `;
  return db.query(query);
};
```

### Error Handling Patterns
```typescript
// Consistent error responses
const handleApiError = (error: Error, res: Response) => {
  console.error('API Error:', error);

  // Don't expose internal errors to client
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: error.message
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    });
  }

  // Generic server error for unexpected issues
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

### Security Practices
```typescript
// Input validation with Zod schemas
import { z } from 'zod';

const createContactSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required').optional(),
});

const validateCreateContact = (data: unknown) => {
  return createContactSchema.parse(data);
};
```

## 📞 Support & Resources

### Getting Help
- **Documentation**: Check [TOC](toc.md) first
- **Code Examples**: Review `specs/` directory for patterns
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions

### Development Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Next:** [Deployment Guide](deployment.md) for production release processes.

**Remember:** SDD means specifications drive development. Start with `specs/` before writing code.
