// @context: shared-types
// @depends: none (root type definitions)
// @exports: CRM entity types, API contracts, utility types, enums
// =============
// ENUMS & CONSTANTS
// =============
export var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "new";
    LeadStatus["CONTACTED"] = "contacted";
    LeadStatus["QUALIFIED"] = "qualified";
    LeadStatus["PROPOSAL"] = "proposal";
    LeadStatus["NEGOTIATION"] = "negotiation";
    LeadStatus["CLOSED_WON"] = "closed_won";
    LeadStatus["CLOSED_LOST"] = "closed_lost";
})(LeadStatus || (LeadStatus = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (TaskStatus = {}));
export var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["SENT"] = "sent";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["OVERDUE"] = "overdue";
    InvoiceStatus["CANCELLED"] = "cancelled";
})(InvoiceStatus || (InvoiceStatus = {}));
export var CommunicationType;
(function (CommunicationType) {
    CommunicationType["EMAIL"] = "email";
    CommunicationType["PHONE"] = "phone";
    CommunicationType["SMS"] = "sms";
    CommunicationType["WHATSAPP"] = "whatsapp";
    CommunicationType["IN_PERSON"] = "in_person";
})(CommunicationType || (CommunicationType = {}));
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["SALES_REP"] = "sales_rep";
    UserRole["MANAGER"] = "manager";
    UserRole["USER"] = "user";
})(UserRole || (UserRole = {}));
