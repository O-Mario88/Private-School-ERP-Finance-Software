/**
 * MAPLE SCHOOL FINANCE ERP
 * Core Domain Models and Types
 * 
 * These types represent the core financial entities and events
 * used throughout the system. Designed for offline-first event sourcing.
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DIRECTOR = 'director',
  HEADTEACHER = 'headteacher',
  BURSAR = 'bursar',
  ACCOUNTANT = 'accountant',
  CASHIER = 'cashier',
  ADMISSIONS_OFFICER = 'admissions_officer',
  STOREKEEPER = 'storekeeper',
  TRANSPORT_MANAGER = 'transport_manager',
  PAYROLL_OFFICER = 'payroll_officer',
  DEPARTMENT_HEAD = 'department_head',
  AUDITOR = 'auditor',
  BOARD_FINANCE_VIEWER = 'board_finance_viewer',
  PARENT_PORTAL = 'parent_portal',
}

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PARTIALLY_PAID = 'partially_paid',
  FULLY_PAID = 'fully_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  WRITTEN_OFF = 'written_off',
}

export enum PaymentMethod {
  CASH = 'cash',
  CHEQUE = 'cheque',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
  CREDIT = 'credit',
}

export enum TransactionType {
  INVOICE_CREATED = 'invoice_created',
  PAYMENT_POSTED = 'payment_posted',
  JOURNAL_ENTRY = 'journal_entry',
  CREDIT_NOTE = 'credit_note',
  DEBIT_NOTE = 'debit_note',
  REVERSAL = 'reversal',
  ADJUSTMENT = 'adjustment',
}

export enum SyncStatus {
  LOCAL = 'local',
  SYNCED = 'synced',
  PENDING = 'pending',
  CONFLICT = 'conflict',
}

// ============================================================================
// CORE ACCOUNTING TYPES
// ============================================================================

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  accountType: AccountType;
  parentAccountId?: string;
  departmentId?: string;
  costCenterId?: string;
  status: AccountStatus;
  description?: string;
  createdDate: Date;
  createdBy: string;
  modifiedDate?: Date;
  modifiedBy?: string;
  isActive: boolean;
}

export interface JournalEntry {
  id: string;
  entryDate: Date;
  referenceNumber: string;
  description: string;
  lineItems: JournalLineItem[];
  createdBy: string;
  createdDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  postedBy?: string;
  postedDate?: Date;
  status: 'draft' | 'submitted' | 'approved' | 'posted' | 'reversed';
  auditTrail: AuditLogEntry[];
}

export interface JournalLineItem {
  id: string;
  accountId: string;
  debitAmount?: number;
  creditAmount?: number;
  lineDescription?: string;
  transactionId?: string; // Links to source transaction (invoice, payment, etc.)
  entityVersion: number; // For concurrency control
}

export interface FinancialEvent {
  id: string;
  eventType: TransactionType;
  aggregateId: string; // The entity this event affects (invoice_id, account_id, etc.)
  aggregateVersion: number; // Versioning for concurrency control
  timestamp: number; // Unix timestamp (milliseconds)
  userId: string; // Who created this event
  deviceId?: string; // Which device (for offline sync tracking)
  data: Record<string, any>; // Event-specific payload
  syncStatus: SyncStatus;
  createdAt: Date;
  syncedAt?: Date;
  conflictNotes?: string;
}

// ============================================================================
// SCHOOL FINANCE TYPES
// ============================================================================

export interface Student {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'M' | 'F' | 'Other';
  classId: string;
  streamId?: string;
  familyId: string;
  admissionDate: Date;
  status: 'active' | 'inactive' | 'graduated' | 'transferred' | 'withdrawn';
  isBoarder: boolean;
  transportStatus?: 'not_assigned' | 'enrolled' | 'suspended';
  financialStatus: 'good_standing' | 'arrears' | 'suspended' | 'cleared';
  createdDate: Date;
  modifiedDate?: Date;
}

export interface Family {
  id: string;
  familyName: string;
  email?: string;
  phone?: string;
  address?: string;
  primaryPayerId?: string; // User ID
  secondaryPayerId?: string;
  students: string[]; // Array of student IDs
  totalBalance: number; // Roll-up balance across all students
  totalArrears: number;
  advanceCredit: number;
  createdDate: Date;
}

export interface StudentInvoice {
  id: string;
  studentId: string;
  familyId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  term?: string;
  academicYear?: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paidAmount: number;
  balanceAmount: number;
  discountApprovalId?: string;
  scholarshipApplied?: number;
  createdBy: string;
  createdDate: Date;
  modifiedDate?: Date;
  auditTrail: AuditLogEntry[];
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  feeType: string; // 'tuition', 'transport', 'uniform', 'activity', etc.
  description: string;
  quantity: number;
  unitRate: number;
  lineAmount: number;
  accountCodeId?: string; // GL account to post to
  scholarshipAmount?: number;
  discountAmount?: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  familyId: string;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  amount: number;
  referenceNumber?: string; // Cheque number, M-Pesa ref, etc.
  description?: string;
  allocations: PaymentAllocation[]; // Invoices this payment is applied to
  unappliedBalance: number;
  status: 'recorded' | 'matched' | 'reversed';
  createdBy: string;
  createdDate: Date;
  bankAccountId?: string;
  auditTrail: AuditLogEntry[];
}

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  allocatedAmount: number;
  allocationDate: Date;
}

// ============================================================================
// APPROVAL & CONTROL TYPES
// ============================================================================

export interface ApprovalRule {
  id: string;
  name: string;
  transactionType: TransactionType;
  condition: string; // e.g., "amount > 50000" or "feeType == 'discount'"
  requiredRole: UserRole;
  sequenceOrder: number; // 1, 2, 3 for multi-step
  isActive: boolean;
  createdDate: Date;
  createdBy: string;
}

export interface Approval {
  id: string;
  transactionId: string;
  transactionType: TransactionType;
  approvalRuleId: string;
  assignedTo: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  approverUserId?: string;
  approvalDate?: Date;
  comments?: string;
  createdDate: Date;
}

export interface AuditLogEntry {
  id: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'post' | 'reverse';
  entityType: string; // 'invoice', 'payment', 'journal_entry', etc.
  entityId: string;
  userId: string;
  timestamp: Date;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  reason?: string;
  affectedFields?: string[];
  ipAddress?: string;
}

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface User {
  id: string;
  email: string;
  password_hash: string; // BCrypt hash
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[]; // Fine-grained permissions
  isActive: boolean;
  lastLogin?: Date;
  createdDate: Date;
  createdBy: string;
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  permissions: string[];
  loginTime: Date;
  lastActivityTime: Date;
  isOfflineMode: boolean;
}

// ============================================================================
// REPORTING & ANALYTICS
// ============================================================================

export interface TrialBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
}

export interface ReceivablesAging {
  familyId: string;
  familyName: string;
  current: number;
  thirtyDays: number;
  sixtyDays: number;
  ninetyDays: number;
  over90Days: number;
  totalArrears: number;
}

export interface KPIMetrics {
  totalBilled: number;
  totalCollected: number;
  collectionRate: number; // percentage
  totalArrears: number;
  averagePaymentDays: number;
  topDebtors: Array<{ familyId: string; familyName: string; amount: number }>;
  cashPosition: number;
}

// ============================================================================
// API/SYNC REQUEST/RESPONSE TYPES
// ============================================================================

export interface SyncRequest {
  deviceId: string;
  lastSyncTimestamp: number;
  events: FinancialEvent[];
}

export interface SyncResponse {
  serverTimestamp: number;
  remoteEvents: FinancialEvent[];
  conflicts: SyncConflict[];
  status: 'success' | 'partial_conflict' | 'error';
}

export interface SyncConflict {
  localEvent: FinancialEvent;
  remoteEvent: FinancialEvent;
  aggregateId: string;
  resolutionRequired: boolean;
  suggestedResolution: 'local_wins' | 'remote_wins' | 'manual_merge';
}

export interface ImportResult {
  recordsImported: number;
  recordsSkipped: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  rowNumber: number;
  field: string;
  value: string;
  message: string;
}
