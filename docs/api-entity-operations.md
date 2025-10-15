# API Entity Operations Guide

## 👥 Contacts API

### Create Contact
```bash
POST /api/contacts
x-tenant-id: d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@email.com",
  "phone": "+1-555-0123",
  "organization_id": "uuid"  // optional
}
```

### Get Contact
```bash
GET /api/contacts/{contact_id}
x-tenant-id: d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a
```

### Update Contact
```bash
PATCH /api/contacts/{contact_id}
x-tenant-id: d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a
Content-Type: application/json

{
  "email": "john.doe.updated@email.com"
}
```

### List Contacts
```bash
GET /api/contacts?organization_id={org_id}&search={query}&page=1&limit=10
x-tenant-id: d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a
```

### Delete Contact
```bash
DELETE /api/contacts/{contact_id}
x-tenant-id: d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a
```

## 🏢 Organizations API

### CRUD Operations
```bash
POST   /api/organizations  - Create organization
GET    /api/organizations/{id} - Get single
PATCH  /api/organizations/{id} - Update
DELETE /api/organizations/{id} - Delete
GET    /api/organizations?search=X&page=1&limit=10 - List with filters
```

## 📋 Leads API

### Pipeline Operations
```bash
# Create lead
POST /api/leads
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@prospect.com",
  "status": "new",
  "organization_id": "uuid"
}

# Update lead status (move through pipeline)
PATCH /api/leads/{lead_id}
{
  "status": "qualified"
}

# Get leads by status
GET /api/leads?status=qualified&organization_id={org_id}
```

## 📝 Tasks API

### Task Management
```bash
POST /api/tasks
{
  "title": "Follow up with John Doe",
  "description": "Send proposal",
  "status": "todo",
  "user_id": "assigned_uuid",
  "due_date": "2025-10-20T00:00:00Z"
}

# Update task status
PATCH /api/tasks/{task_id}
{
  "status": "completed"
}
```

## 💰 Invoices API

### Billing Operations
```bash
POST /api/invoices
{
  "contact_id": "customer_uuid",
  "amount": 1500.00,
  "due_date": "2025-11-01T00:00:00Z",
  "status": "draft"
}

# Mark as paid
PATCH /api/invoices/{invoice_id}
{
  "status": "paid"
}
```

## 🔔 Communications API (Planned)

### Log Interactions
```bash
POST /api/communications
{
  "contact_id": "customer_uuid",
  "type": "email",
  "subject": "Re: Your inquiry",
  "body": "Here's the information you requested...",
  "user_id": "salesperson_uuid"
}
```

## 📊 Dashboard Analytics (Planned)

### Get Metrics
```bash
GET /api/dashboard/metrics
x-tenant-id: d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a

# Returns KPI data for charts
{
  "revenue": { "total": 45000, "monthly": 12500 },
  "pipeline": { "total": 89000, "by_stage": {...} },
  "contacts": { "active": 156, "new_this_month": 23 },
  "tasks": { "completed": 89, "overdue": 5 }
}
```

---

**Next:** [Advanced Features Guide](api-advanced-features.md) - Batch operations, security, SDK, and integrations.

**See Also:** [Main API Reference](api-reference.md) for query parameters and error codes.
