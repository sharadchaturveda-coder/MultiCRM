# Data Model

## Entities

### Tenant
-   **Attributes:**
    -   `id`: Unique identifier (UUID)
    -   `name`: Tenant name (String)
    -   `domain`: Tenant domain (String)
    -   `created_at`: Creation timestamp (DateTime)
    -   `updated_at`: Last updated timestamp (DateTime)
-   **Relations:**
    -   One-to-many with `User`
    -   One-to-many with `Organization`

### User
-   **Attributes:**
    -   `id`: Unique identifier (UUID)
    -   `tenant_id`: Foreign key to `Tenant` (UUID)
    -   `first_name`: First name (String)
    -   `last_name`: Last name (String)
    -   `email`: Email address (String)
    -   `password`: Password (String)
    -   `role`: User role (String)
    -   `created_at`: Creation timestamp (DateTime)
    -   `updated_at`: Last updated timestamp (DateTime)
-   **Relations:**
    -   Many-to-one with `Tenant`
    -   One-to-many with `Contact`
	-   One-to-many with `Task`
	-   One-to-many with `Communication`

### Contact
-   **Attributes:**
    -   `id`: Unique identifier (UUID)
    -   `tenant_id`: Foreign key to `Tenant` (UUID)
    -   `user_id`: Foreign key to `User` (UUID)
    -   `organization_id`: Foreign key to `Organization` (UUID)
    -   `first_name`: First name (String)
    -   `last_name`: Last name (String)
    -   `email`: Email address (String)
    -   `phone`: Phone number (String)
    -   `created_at`: Creation timestamp (DateTime)
    -   `updated_at`: Last updated timestamp (DateTime)
-   **Relations:**
    -   Many-to-one with `Tenant`
    -   Many-to-one with `User`
    -   Many-to-one with `Organization`
	-   One-to-many with `Communication`

### Organization
-   **Attributes:**
    -   `id`: Unique identifier (UUID)
    -   `tenant_id`: Foreign key to `Tenant` (UUID)
    -   `name`: Organization name (String)
    -   `industry`: Industry (String)
    -   `address`: Address (String)
    -   `created_at`: Creation timestamp (DateTime)
    -   `updated_at`: Last updated timestamp (DateTime)
-   **Relations:**
    -   Many-to-one with `Tenant`
    -   One-to-many with `Contact`
	-   One-to-many with `Lead`

### Lead
-   **Attributes:**
    -   `id`: Unique identifier (UUID)
    -   `tenant_id`: Foreign key to `Tenant` (UUID)
    -   `organization_id`: Foreign key to `Organization` (UUID)
    -   `first_name`: First name (String)
    -   `last_name`: Last name (String)
    -   `email`: Email address (String)
    -   `phone`: Phone number (String)
    -   `status`: Lead status (String)
    -   `source`: Lead source (String)
    -   `created_at`: Creation timestamp (DateTime)
    -   `updated_at`: Last updated timestamp (DateTime)
-   **Relations:**
    -   Many-to-one with `Tenant`
    -   Many-to-one with `Organization`
	-   Many-to-one with `Pipeline`

### Pipeline
-   **Attributes:**
    -   `id`: Unique identifier (UUID)
    -   `tenant_id`: Foreign key to `Tenant` (UUID)
    -   `name`: Pipeline name (String)
    -   `description`: Pipeline description (String)
    -   `created_at`: Creation timestamp (DateTime)
    -   `updated_at`: Last updated timestamp (DateTime)
-   **Relations:**
    -   One-to-many with `Lead`

### Task
-   **Attributes:**
    -   `id`: Unique identifier (UUID)
    -   `tenant_id`: Foreign key to `Tenant` (UUID)
    -   `user_id`: Foreign key to `User` (UUID)
    -   `title`: Task title (String)
    -   `description`: Task description (String)
    -   `status`: Task status (String)
    -   `due_date`: Due date (DateTime)
    -   `created_at`: Creation timestamp (DateTime)
    -   `updated_at`: Last updated timestamp (DateTime)
-   **Relations:**
    -   Many-to-one with `Tenant`
    -   Many-to-one with `User`

### Invoice
-   **Attributes:**
    -   `id`: Unique identifier (UUID)
    -   `tenant_id`: Foreign key to `Tenant` (UUID)
    -   `contact_id`: Foreign key to `Contact` (UUID)
    -   `invoice_number`: Invoice number (String)
    -   `issue_date`: Issue date (DateTime)
    -   `due_date`: Due date (DateTime)
    -   `amount`: Amount (Decimal)
    -   `status`: Invoice status (String)
    -   `created_at`: Creation timestamp (DateTime)
    -   `updated_at`: Last updated timestamp (DateTime)
-   **Relations:**
    -   Many-to-one with `Tenant`
    -   Many-to-one with `Contact`

### Communication
-   **Attributes:**
    -   `id`: Unique identifier (UUID)
    -   `tenant_id`: Foreign key to `Tenant` (UUID)
    -   `user_id`: Foreign key to `User` (UUID)
    -   `contact_id`: Foreign key to `Contact` (UUID)
    -   `type`: Communication type (String)
    -   `subject`: Subject (String)
    -   `body`: Body (String)
    -   `sent_at`: Sent at timestamp (DateTime)
    -   `created_at`: Creation timestamp (DateTime)
    -   `updated_at`: Last updated timestamp (DateTime)
-   **Relations:**
    -   Many-to-one with `Tenant`
    -   Many-to-one with `User`
    -   Many-to-one with `Contact`

### DashboardWidget
-   **Attributes:**
    -   `id`: Unique identifier (UUID)
    -   `tenant_id`: Foreign key to `Tenant` (UUID)
    -   `user_id`: Foreign key to `User` (UUID)
    -   `title`: Widget title (String)
    -   `type`: Widget type (String)
    -   `config`: Widget configuration (JSON)
    -   `created_at`: Creation timestamp (DateTime)
    -   `updated_at`: Last updated timestamp (DateTime)
-   **Relations:**
    -   Many-to-one with `Tenant`
    -   Many-to-one with `User`