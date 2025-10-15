# API Reference Guide (2025)

## 🎯 Overview

Complete REST API documentation for the MultiCRM multi-tenant platform, providing tenant-isolated CRUD operations across all business entities.

## 🔐 Authentication & Tenancy

**See: [Authentication & Tenancy Guide](api-authentication.md)** - Complete authentication patterns and tenant isolation details.

## 🏢 Tenant Management

**See: [Tenant Operations Guide](api-tenant-operations.md)** - Complete tenant lifecycle management.

## � Entity Operations

**See: [Entity Operations Guide](api-entity-operations.md)** - Complete CRUD operations for contacts, organizations, leads, tasks, and invoices.

## 🔍 Query Parameters

### Filtering & pagination
```bash
# Multiple filters supported
GET /api/contacts?organization_id=uuid&user_id=uuid&search=john&page=1&limit=20

# Date range filtering (planned)
GET /api/contacts?created_after=2025-01-01&updated_before=2025-12-31
```

### Search Functionality
```bash
# Search across multiple fields
GET /api/contacts?search=john.doe@email.com  # matches email
GET /api/contacts?search=doe                  # matches last_name
GET /api/contacts?search=555-0123             # matches phone
```

## 🚨 Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Missing required fields, invalid data |
| 401 | Unauthorized | Authentication required (future) |
| 403 | Forbidden | Insufficient permissions (future) |
| 404 | Not Found | Resource doesn't exist or wrong tenant |
| 409 | Conflict | Duplicate data (email, etc.) |
| 422 | Validation Error | Business logic violations |
| 429 | Rate Limited | Too many requests (future) |
| 500 | Internal Error | Server/database errors |

## � Batch Operations (Planned)

### Bulk Create
```bash
POST /api/contacts/bulk
[
  { "first_name": "John", "email": "john@test.com" },
  { "first_name": "Jane", "email": "jane@test.com" }
]
```

### Bulk Update
```bash
PATCH /api/leads/bulk
{
  "ids": ["uuid1", "uuid2"],
  "data": { "status": "qualified" }
}
```

**See: [Advanced Features Guide](api-advanced-features.md)** - Security features, SDK, and integrations.

---

**Navigation:**
- [Authentication](api-authentication.md) - Security patterns
- [Tenant Operations](api-tenant-operations.md) - Multi-tenant management
- [Entity Operations](api-entity-operations.md) - CRUD for all entities
- [Advanced Features](api-advanced-features.md) - Batch ops, security, integrations
