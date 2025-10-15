# API Tenant Operations Guide

## 🏢 Tenant Management

### Create Tenant
```bash
POST /api/tenants
Content-Type: application/json

{
  "name": "Acme Corporation",
  "domain": "acme.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a",
    "name": "Acme Corporation",
    "domain": "acme.com",
    "created_at": "2025-10-15T14:00:00Z",
    "updated_at": "2025-10-15T14:00:00Z"
  },
  "message": "Tenant created successfully"
}
```

### Get Specific Tenant
```bash
GET /api/tenants/{tenant_id}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a",
    "name": "Acme Corporation",
    "domain": "acme.com",
    "created_at": "2025-10-15T14:00:00Z"
  }
}
```

### List Tenants
```bash
GET /api/tenants
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a",
      "name": "Acme Corporation",
      "domain": "acme.com",
      "created_at": "2025-10-15T14:00:00Z"
    }
  ]
}
```

### Update Tenant (Planned)
```bash
PATCH /api/tenants/{tenant_id}
Content-Type: application/json

{
  "name": "Updated Corporation Name"
}
```

### Deactivate Tenant (Planned)
```bash
DELETE /api/tenants/{tenant_id}
```

## 🔄 Tenant Lifecycle

### States
- **Active**: Normal tenant operations
- **Suspended**: Billing issues, temporary blocks
- **Inactive**: Soft deleted, can be restored
- **Deleted**: Permanently removed (GDPR compliant)

### Operations
```typescript
// Tenant creation workflow
const created = await tenantService.create({
  name: "New Company",
  domain: "newcompany.com"
});

// Automatic schema provisioning
await schemaService.createTenantSchema(created.id);

// Tenant activation
await tenantService.activate(created.id);
```

### Cleanup (Development Only)
```bash
# Clear all tenant data (dev only)
POST /api/tenants/{tenant_id}/reset

# Hard delete tenant (dev only)
DELETE /api/tenants/{tenant_id}/force
```

## 🛡️ Tenant Security

### Isolation Enforcement
- All multi-tenant data operations require `x-tenant-id` header
- Database-level schema isolation prevents cross-contamination
- Query parameters automatically scoped to tenant context

### Access Control (Planned)
```typescript
// Role-based tenant access
enum TenantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest'
}

// Permission matrix
const PERMISSIONS = {
  [TenantRole.OWNER]: ['*'],
  [TenantRole.ADMIN]: ['read', 'write', 'manage_users'],
  [TenantRole.MEMBER]: ['read', 'write'],
  [TenantRole.GUEST]: ['read']
};
```

## 📊 Tenant Analytics

### Usage Metrics (Planned)
```bash
GET /api/tenants/{tenant_id}/metrics

# Returns tenant usage data
{
  "api_calls": 14532,
  "storage_mb": 256,
  "active_users": 15,
  "data_objects": 4321
}
```

### Billing Integration (Planned)
```bash
GET /api/tenants/{tenant_id}/billing

# Returns billing information
{
  "plan": "professional",
  "monthly_cost": 99.00,
  "usage_overage": 15.50,
  "next_billing_date": "2025-11-01"
}
```

---

**Next:** [Entity Operations Guide](api-entity-operations.md) - Complete CRUD operations for all business entities.

**See Also:** [Authentication Guide](api-authentication.md) for security patterns.
