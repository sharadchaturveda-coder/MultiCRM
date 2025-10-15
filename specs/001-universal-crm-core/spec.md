# Universal CRM Core – Specification v0.1

## Summary
A multi-tenant CRM skeleton designed to support multiple industries (hospitality, education, F&B) by providing a common backbone of contact management, pipelines, tasks, invoicing, and dashboards. Vertical modules extend this core.

## Goals
- Provide a reusable CRM foundation that can be specialized per vertical.
- Support SaaS multi-tenancy and offline-first operation.
- Keep UX simple and mobile-friendly for Tier-2/3 adoption.
- Enable rapid extension without rewriting the core.

## User Roles
- Super Admin (platform-level).
- Tenant Admin (org-level, manages users and billing).
- Manager (manages pipelines, tasks, reports).
- Staff/User (executes tasks, updates leads).
- External User [NEEDS CLARIFICATION: portal access?].

## Entities
- Tenant
- User
- Contact
- Organization/Account
- Lead/Opportunity
- Pipeline/Stage
- Task/Activity
- Invoice/Payment
- Communication Log
- Dashboard Widget

## Features
### Authentication & Tenant Isolation
- [ ] Multi-tenant isolation.
- [ ] RBAC with role-specific access.
- [ ] Tenant lifecycle: create → onboard → deactivate.

### Contact Management
- [ ] Add/edit contacts with name, phone, email, tags.
- [ ] Bulk import/export.
- [ ] Tag-based segmentation.

### Pipeline (Kanban)
- [ ] Configurable stages.
- [ ] Drag-and-drop opportunities.
- [ ] Card detail view with linked contact & tasks.

### Tasks
- [ ] Assign tasks with due dates/reminders.
- [ ] Status workflow: Open → In Progress → Done.

### Invoices
- [ ] Create invoices with line items, tax fields.
- [ ] Payment status (paid/unpaid/overdue).
- [ ] PDF export.
- [NEEDS CLARIFICATION: Payment gateway integration in MVP?].

### Communication Log
- [ ] Record calls, notes, emails.
- [ ] Integration hooks for WhatsApp/SMS [NEEDS CLARIFICATION].

### Dashboard
- [ ] Widget grid per role.
- Default widgets: funnel chart, tasks due, revenue counter, contact growth.

## Non-Functional Requirements
- API-first (REST/GraphQL).
- Offline-first sync (local storage + background sync).
- Responsive design (mobile-first).
- Must support multi-tenancy from day 1.

## Acceptance Criteria
- A new tenant can be created and isolated.
- Tenant admin can onboard users with roles.
- Manager can create leads and move them across pipeline stages.
- Staff can complete tasks and log communications.
- Invoices can be generated and marked paid.
- Dashboard displays accurate role-based KPIs.
- Core features remain usable offline with sync.

## Extensions (Future Specs)
- Hotel Module (reservations, housekeeping).
- School Module (admissions, attendance, grading).
- F&B Module (POS, menu, inventory).
