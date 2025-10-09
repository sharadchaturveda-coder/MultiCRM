// UUID type for identifiers
export type UUID = string;

// Common timestamps
export type Timestamp = string; // ISO 8601 format

// Decimal type for amounts
export type Decimal = number;

// JSON type for configurations
export type JsonObject = Record<string, any>;

// Base entity interface
export interface BaseEntity {
  id: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Multi-tenant base interface
export interface TenantEntity extends BaseEntity {
  tenant_id: UUID;
}

// =============
// CORE ENTITIES
// =============

export interface Tenant extends BaseEntity {
  name: string;
  domain: string;
}

export interface User extends TenantEntity {
  tenant_id: UUID;
  tenant: Tenant; // relation
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  contacts?: Contact[]; // relation
  tasks?: Task[]; // relation
  communications?: Communication[]; // relation
}

export interface Contact extends TenantEntity {
  tenant_id: UUID;
  user_id: UUID;
  organization_id?: UUID;
  tenant: Tenant; // relation
  user: User; // relation
  organization?: Organization; // relation
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  communications?: Communication[]; // relation
}

export interface Organization extends TenantEntity {
  tenant_id: UUID;
  tenant: Tenant; // relation
  name: string;
  industry: string;
  address: string;
  contacts?: Contact[]; // relation
  leads?: Lead[]; // relation
}

export interface Lead extends TenantEntity {
  tenant_id: UUID;
  organization_id?: UUID;
  tenant: Tenant; // relation
  organization?: Organization; // relation
  pipeline?: Pipeline; // relation
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
}

export interface Pipeline extends TenantEntity {
  tenant_id: UUID;
  tenant: Tenant; // relation
  name: string;
  description: string;
  leads?: Lead[]; // relation
}

export interface Task extends TenantEntity {
  tenant_id: UUID;
  user_id: UUID;
  tenant: Tenant; // relation
  user: User; // relation
  title: string;
  description: string;
  status: string;
  due_date: Timestamp;
}

export interface Invoice extends TenantEntity {
  tenant_id: UUID;
  contact_id: UUID;
  tenant: Tenant; // relation
  contact: Contact; // relation
  invoice_number: string;
  issue_date: Timestamp;
  due_date: Timestamp;
  amount: Decimal;
  status: string;
}

export interface Communication extends TenantEntity {
  tenant_id: UUID;
  user_id: UUID;
  contact_id: UUID;
  tenant: Tenant; // relation
  user: User; // relation
  contact: Contact; // relation
  type: string; // email, phone, etc.
  subject: string;
  body: string;
  sent_at: Timestamp;
}

export interface DashboardWidget extends TenantEntity {
  tenant_id: UUID;
  user_id: UUID;
  tenant: Tenant; // relation
  user: User; // relation
  title: string;
  type: string;
  config: JsonObject;
}

// =============
// API REQUEST/RESPONSE TYPES
// =============

export interface CreateTenantRequest {
  name: string;
  domain: string;
}

export interface CreateUserRequest {
  tenant_id: UUID;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
}

export interface CreateContactRequest {
  tenant_id: UUID;
  user_id: UUID;
  organization_id?: UUID;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

export interface UpdateContactRequest {
  organization_id?: UUID;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

// =============
// ENUMS & CONSTANTS
// =============

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

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

export enum CommunicationType {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  IN_PERSON = 'in_person'
}

export enum UserRole {
  ADMIN = 'admin',
  SALES_REP = 'sales_rep',
  MANAGER = 'manager',
  USER = 'user'
}

// =============
// UTILITY TYPES
// =============

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type SearchParams = {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
