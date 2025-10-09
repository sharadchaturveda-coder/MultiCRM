export type UUID = string;
export type Timestamp = string;
export type Decimal = number;
export type JsonObject = Record<string, any>;
export interface BaseEntity {
    id: UUID;
    created_at: Timestamp;
    updated_at: Timestamp;
}
export interface TenantEntity extends BaseEntity {
    tenant_id: UUID;
}
export interface Tenant extends BaseEntity {
    name: string;
    domain: string;
}
export interface User extends TenantEntity {
    tenant_id: UUID;
    tenant: Tenant;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: string;
    contacts?: Contact[];
    tasks?: Task[];
    communications?: Communication[];
}
export interface Contact extends TenantEntity {
    tenant_id: UUID;
    user_id: UUID;
    organization_id?: UUID;
    tenant: Tenant;
    user: User;
    organization?: Organization;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    communications?: Communication[];
}
export interface Organization extends TenantEntity {
    tenant_id: UUID;
    tenant: Tenant;
    name: string;
    industry: string;
    address: string;
    contacts?: Contact[];
    leads?: Lead[];
}
export interface Lead extends TenantEntity {
    tenant_id: UUID;
    organization_id?: UUID;
    tenant: Tenant;
    organization?: Organization;
    pipeline?: Pipeline;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
    source: string;
}
export interface Pipeline extends TenantEntity {
    tenant_id: UUID;
    tenant: Tenant;
    name: string;
    description: string;
    leads?: Lead[];
}
export interface Task extends TenantEntity {
    tenant_id: UUID;
    user_id: UUID;
    tenant: Tenant;
    user: User;
    title: string;
    description: string;
    status: string;
    due_date: Timestamp;
}
export interface Invoice extends TenantEntity {
    tenant_id: UUID;
    contact_id: UUID;
    tenant: Tenant;
    contact: Contact;
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
    tenant: Tenant;
    user: User;
    contact: Contact;
    type: string;
    subject: string;
    body: string;
    sent_at: Timestamp;
}
export interface DashboardWidget extends TenantEntity {
    tenant_id: UUID;
    user_id: UUID;
    tenant: Tenant;
    user: User;
    title: string;
    type: string;
    config: JsonObject;
}
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
export declare enum LeadStatus {
    NEW = "new",
    CONTACTED = "contacted",
    QUALIFIED = "qualified",
    PROPOSAL = "proposal",
    NEGOTIATION = "negotiation",
    CLOSED_WON = "closed_won",
    CLOSED_LOST = "closed_lost"
}
export declare enum TaskStatus {
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum InvoiceStatus {
    DRAFT = "draft",
    SENT = "sent",
    PAID = "paid",
    OVERDUE = "overdue",
    CANCELLED = "cancelled"
}
export declare enum CommunicationType {
    EMAIL = "email",
    PHONE = "phone",
    SMS = "sms",
    WHATSAPP = "whatsapp",
    IN_PERSON = "in_person"
}
export declare enum UserRole {
    ADMIN = "admin",
    SALES_REP = "sales_rep",
    MANAGER = "manager",
    USER = "user"
}
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
