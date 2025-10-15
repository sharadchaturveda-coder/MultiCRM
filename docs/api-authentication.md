# API Authentication & Tenancy Guide

## 🔐 Authentication Patterns

### Tenant Isolation (Current)
All business endpoints require `x-tenant-id` header:
```bash
# Mandatory header on all business API calls
curl -H "x-tenant-id: d0b4c28c-8f7e-5c19-a1e3-2b7d8b9f6e5a" \
  https://multicrm.onrender.com/api/contacts
```

### JWT Authentication (Future)
```bash
# Once implemented, add Authorization header
curl -H "Authorization: Bearer <jwt-token>" \
  -H "x-tenant-id: <tenant-id>" \
  https://multicrm.onrender.com/api/contacts
```

## 📋 API Response Format

### Standard Response Structure
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### Success Examples
```json
// Create operation
{
  "success": true,
  "data": { "id": "uuid", "name": "John Doe", "created_at": "2025-01-01T00:00:00Z" },
  "message": "Contact created successfully"
}

// List operation
{
  "success": true,
  "data": [
    { "id": "uuid-1", "name": "John Doe" },
    { "id": "uuid-2", "name": "Jane Smith" }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 25 }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Email is required"
}
```

---

**Next:** [Main API Reference](api-reference.md) - Complete endpoint specifications
