# API Advanced Features Guide

## 🔄 Batch Operations (Planned)

### Bulk Create
```bash
POST /api/contacts/bulk
x-tenant-id: d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a
Content-Type: application/json

[
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@test.com"
  },
  {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@test.com"
  }
]

# Response
{
  "success": true,
  "data": {
    "created": 2,
    "failed": 0,
    "results": [
      { "id": "uuid-1", "first_name": "John", "status": "created" },
      { "id": "uuid-2", "first_name": "Jane", "status": "created" }
    ]
  }
}
```

### Bulk Update
```bash
PATCH /api/leads/bulk
x-tenant-id: d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2"],
  "data": { "status": "qualified" }
}

# Response
{
  "success": true,
  "data": {
    "updated": 2,
    "failed": 0
  }
}
```

## 🔒 Security Features

### Data Isolation
- PostgreSQL schema per tenant ensures zero cross-tenant data access
- All queries include tenant context validation
- Request headers required for tenant identification

### Input Validation
- TypeScript interfaces enforce data structure
- SQL injection prevention via parameterized queries
- XSS protection through input sanitization

### Rate Limiting (Planned)
```bash
# Automatic protection against abuse
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1634054400

# Response when limit exceeded
{
  "success": false,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds",
  "retry_after": 60
}
```

## 🧪 Testing & Development

### Health Check
```bash
GET /health

# Returns database connectivity status
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-15T14:00:00Z"
}
```

### Development Helpers
```bash
# Clear tenant data (development only)
POST /api/tenants/{id}/reset

# Get API performance metrics (future)
GET /api/metrics
```

### Load Testing (Planned)
```bash
# Simulate concurrent tenant operations
npm run test:load -- --tenants=100 --requests=1000 --concurrency=10
```

## 📋 SDK & Integration

### TypeScript SDK (Planned)
```typescript
import { MultiCRMClient } from '@multicrm/sdk';

const client = new MultiCRMClient({
  baseUrl: 'https://multicrm.onrender.com',
  tenantId: 'your-tenant-id'
});

// Promised-based API
const contact = await client.contacts.create({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@email.com'
});

// Automatic error handling
try {
  const contacts = await client.contacts.list({
    page: 1,
    limit: 10,
    search: 'john'
  });
  console.log(`Found ${contacts.total} contacts`);
} catch (error) {
  if (error instanceof MultiCRMError) {
    console.error('API Error:', error.message);
  }
}
```

### Integration Examples

#### Zapier Webhook Integration
```typescript
// Webhook endpoint for lead creation
app.post('/webhooks/zapier/leads', async (req, res) => {
  const { tenant_id, lead_data } = req.body;

  try {
    const lead = await createLead(lead_data, tenant_id);
    res.json({ success: true, lead });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Zapier configuration:
// - URL: https://multicrm.onrender.com/webhooks/zapier/leads
// - Method: POST
// - Body: { "tenant_id": "uuid", "lead_data": {...} }
```

#### Salesforce Sync
```typescript
// Bidirectional sync with Salesforce
import { SalesforceClient } from '@salesforce/core';

const syncService = {
  async exportToSalesforce(tenantId: string) {
    const leads = await getLeads({ tenant_id: tenantId, status: 'qualified' });

    for (const lead of leads) {
      await salesforce.createLead({
        FirstName: lead.first_name,
        LastName: lead.last_name,
        Email: lead.email,
        Status: lead.status,
        Custom_MultiCRM_ID__c: lead.id
      });
    }
  },

  async importFromSalesforce(tenantId: string) {
    const salesforceLeads = await salesforce.query(
      'SELECT Id, FirstName, LastName, Email FROM Lead WHERE Custom_Sync_Status__c = null'
    );

    for (const sfLead of salesforceLeads) {
      await createLead({
        first_name: sfLead.FirstName,
        last_name: sfLead.LastName,
        email: sfLead.Email,
        source: 'salesforce'
      }, tenantId);

      await salesforce.update(sfLead.Id, {
        Custom_Sync_Status__c: 'synced'
      });
    }
  }
};
```

#### Google Workspace Calendar Sync
```typescript
// Calendar integration for appointments
const calendarService = {
  async createCalendarEvent(tenantId: string, appointmentId: string) {
    const appointment = await getAppointment(appointmentId);

    await google.calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary: appointment.title,
        description: appointment.notes,
        start: { dateTime: appointment.start_time },
        end: { dateTime: appointment.end_time },
        attendees: [
          { email: appointment.contact_email }
        ]
      }
    });
  }
};
```

#### Data Export/Import
```typescript
// CSV/Excel export functionality
const exportService = {
  async exportContacts(tenantId: string, format: 'csv'|'excel') {
    const contacts = await getContacts({ tenant_id: tenantId });

    if (format === 'csv') {
      const csv = contacts.map(c =>
        `${c.first_name},${c.last_name},${c.email}`
      ).join('\n');

      return csv;
    }

    // Excel implementation using xlsx library
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(contacts);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    return XLSX.write(workbook, { type: 'buffer' });
  }
};
```

### API Versioning (Planned)
```typescript
// Version-aware routing
app.use('/api/v1/:tenantId', tenantMiddleware, v1Routes);
app.use('/api/v2/:tenantId', tenantMiddleware, v2Routes);

// Backward compatibility headers
response.setHeader('X-API-Version', 'v1');
response.setHeader('X-API-Deprecation', 'v1 will be deprecated on 2026-01-01');
```

### Real-time WebSocket Support (Planned)
```typescript
// Real-time updates for dashboard
const socketService = {
  notifyClients(tenantId: string, event: string, data: any) {
    const clients = connectedClients.get(tenantId) || [];
    clients.forEach(client => {
      if (client.subscribed.includes(event)) {
        client.socket.emit(event, data);
      }
    });
  }
};

// Usage in API responses
app.post('/api/contacts', async (req, res) => {
  const contact = await createContact(req.body, req.tenantId);

  // Notify all connected dashboard clients
  socketService.notifyClients(req.tenantId, 'contact:created', contact);

  res.json({ success: true, data: contact });
});
```

---

**Navigation:**
- [Entity Operations](api-entity-operations.md) - Basic CRUD endpoints
- [Main API Reference](api-reference.md) for query parameters and error codes

**See Also:** [Troubleshooting Guide](../troubleshooting.md) for debugging API issues.
