# Data Model Reference

## Entity Reference

| Entity | Primary Key | Relationships | Purpose |
|--------|-------------|---------------|---------|
| **Tenant** | `UUID` | Root entity | Organization container |
| **User** | `UUID → tenant_id` | `tenant, contacts, tasks, communications` | User accounts |
| **Contact** | `UUID → tenant_id` | `user, organization, communications` | Customer/people records |
| **Organization** | `UUID → tenant_id` | `contacts, leads` | Company/accounts |
| **Lead** | `UUID → tenant_id` | `organization, pipeline` | Sales opportunities |
| **Pipeline** | `UUID → tenant_id` | `leads` | Sales funnel stages |
| **Task** | `UUID → tenant_id` | `user` | Work items & activities |
| **Communication** | `UUID → tenant_id` | `user, contact` | Interaction logging |
| **Invoice** | `UUID → tenant_id` | `contact` | Billing records |
| **DashboardWidget** | `UUID → tenant_id` | `user` | UI personalization |

## Entity Definitions

### Base Entity (Inherited by all)
```typescript
interface BaseEntity {
  id: UUID;                    // Primary key
  created_at: Timestamp;       // ISO datetime
  updated_at: Timestamp;       // ISO datetime
}

interface TenantEntity extends BaseEntity {
  tenant_id: UUID;             // Multi-tenant isolation
}
```

### Core Business Entities

#### Tenant (Organization Container)
```typescript
interface Tenant extends BaseEntity {
  name: string;               // "Acme Corporation"
  domain: string;             // "acme.com"
}
```

#### User (Authenticated System Users)
```typescript
interface User extends TenantEntity {
  first_name: string;         // Given name
  last_name: string;          // Family name
  email: string;              // Unique within tenant
  password: string;           // Hashed password
  role: 'admin'|'manager'|'sales_rep'|'user';
}
```

#### Contact (People Records)
```typescript
interface Contact extends TenantEntity {
  user_id: UUID;               // Owner who created record
  organization_id?: UUID;      // Optional company association
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}
```

#### Organization (Company Records)
```typescript
interface Organization extends TenantEntity {
  name: string;
  industry?: string;          // E.g., "Technology", "Healthcare"
  address?: string;
}
```

#### Lead (Sales Opportunities)
```typescript
interface Lead extends TenantEntity {
  organization_id?: UUID;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: 'new'|'contacted'|'qualified'|'proposal'|'negotiation'|'closed_won'|'closed_lost';
  source?: string;            // Lead origin tracking
}
```

#### Pipeline (Sales Funnel)
```typescript
interface Pipeline extends TenantEntity {
  name: string;               // "Standard Sales Process"
  description?: string;
}
```

#### Task (Work Items)
```typescript
interface Task extends TenantEntity {
  user_id: UUID;               // Assigned user
  title: string;
  description?: string;
  status: 'todo'|'in_progress'|'completed'|'cancelled';
  due_date?: Timestamp;
}
```

#### Communication (Activity Logging)
```typescript
interface Communication extends TenantEntity {
  user_id: UUID;               // CRM user who logged
  contact_id: UUID;            // Related contact
  type: 'email'|'phone'|'sms'|'whatsapp'|'in_person';
  subject?: string;
  body?: string;
  sent_at: Timestamp;
}
```

#### Invoice (Billing Records)
```typescript
interface Invoice extends TenantEntity {
  contact_id: UUID;            // Bill-to contact
  invoice_number: string;
  issue_date: Timestamp;
  due_date: Timestamp;
  amount: Decimal;             // Monetary amount
  status: 'draft'|'sent'|'paid'|'overdue'|'cancelled';
}
```

#### DashboardWidget (UI Customization)
```typescript
interface DashboardWidget extends TenantEntity {
  user_id: UUID;
  title: string;               // Widget display name
  type: string;                // 'chart', 'metric', 'table', etc.
  config: JsonObject;          // Type-specific configuration
}
```

## Relationship Map

```
TENANT (1 → many)
├── USERS (1:many) → CONTACTS, TASKS, COMMUNICATIONS
├── ORGANIZATIONS (1:many) → CONTACTS, LEADS
├── PIPELINES (1:many) → LEADS
├── LEADS (1:many, independent)
├── TASKS (1:many, independent)
├── INVOICES (1:many, independent)
└── COMMUNICATIONS (1:many, independent)
```

## Database Schema Pattern

### Standard Entity Table Structure
```sql
-- All tenant entities follow this pattern
CREATE TABLE tenant_{uuid}.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Entity-specific fields
  user_id UUID REFERENCES tenant_{uuid}.users(id),
  organization_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Timestamps (all entities)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes Automatically Created
```sql
-- Tenant isolation index (all entities)
CREATE INDEX idx_contacts_tenant ON tenant_{uuid}.contacts(tenant_id);

-- Relationship indexes (as needed)
CREATE INDEX idx_contacts_user ON tenant_{uuid}.contacts(user_id);
CREATE INDEX idx_contacts_email ON tenant_{uuid}.contacts(email);
```

## TypeScript Enums

### Lead Status Values
```typescript
export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}
```

### Communication Types
```typescript
export enum CommunicationType {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  IN_PERSON = 'in_person'
}
```

### User Roles
```typescript
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES_REP = 'sales_rep',
  USER = 'user'
}
```

### Task & Invoice Status
```typescript
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}
```

## Extension Pattern

### Adding Domain Entities
```typescript
// Example: School CRM extension
interface Student extends Contact {
  student_id: string;          // School identifier
  grade: string;               // Current grade level
}

interface Class extends TenantEntity {
  name: string;                // "Mathematics 10A"
  subject: string;             // "Mathematics"
  teacher_id: UUID;
  max_students: number;
}
```

### Custom Fields
```typescript
// JSON-based extensions
interface Organization extends TenantEntity {
  name: string;
  custom_data: JsonObject;      // { "ein": "12-3456789", "industry_code": "1234" }
}
```

---

**See:** [api-reference.md](api-reference.md) for API usage patterns with these entities.
