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

// ============================================================================
// PHASE 2: SCHOOL CORE TYPES
// ============================================================================

export enum FeeType {
  TUITION = 'tuition',
  ACTIVITY = 'activity',
  TRANSPORT = 'transport',
  UNIFORM = 'uniform',
  BOOK = 'book',
  REGISTRATION = 'registration',
  EXAM = 'exam',
  OTHER = 'other',
}

export enum DiscountType {
  SCHOLARSHIP = 'scholarship',
  SIBLING = 'sibling',
  EARLY_BIRD = 'early_bird',
  EXEMPTION = 'exemption',
  OTHER = 'other',
}

export enum BursaryStatus {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
}

export enum PaymentPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
}

export enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

export enum FollowUpActivityType {
  CALL = 'call',
  EMAIL = 'email',
  IN_PERSON = 'in_person',
  SMS = 'sms',
  LETTER = 'letter',
}

export interface FeeRule {
  id: string;
  classId?: string;
  term: string;
  feeType: FeeType;
  amount: number;
  effectiveDate: string;
  endDate?: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
  modifiedAt?: string;
  modifiedBy?: string;
}

export interface FeeDiscount {
  id: string;
  feeRuleId: string;
  discountType: DiscountType;
  discountValue: number;
  isPercentage: boolean;
  maxStudents?: number;
  maxDiscountAmount?: number;
  active: boolean;
}

export interface FeeLineItem {
  feeType: FeeType;
  description: string;
  amount: number;
  discounts: FeeDiscountApplication[];
  finalAmount: number;
}

export interface FeeDiscountApplication {
  discountType: DiscountType;
  discountAmount: number;
  discountPercentage?: number;
}

export interface StudentFeeSchedule {
  studentId: string;
  classId: string;
  term: string;
  feeItems: FeeLineItem[];
  totalAmount: number;
  calculatedAt: string;
}

export interface TransportRoute {
  id: string;
  routeName: string;
  costPerMonth: number;
  pickupPoints: string[];
  driverName?: string;
  vehicleRegistration?: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface StudentTransportAssignment {
  id: string;
  studentId: string;
  routeId: string;
  term: string;
  active: boolean;
  assignedDate: string;
  assignedBy: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  itemType: 'uniform' | 'book' | 'stationery' | 'other';
  unitCost: number;
  quantityOnHand: number;
  reorderLevel?: number;
  supplierName?: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface InventoryAllocation {
  id: string;
  inventoryItemId: string;
  classId?: string;
  term: string;
  quantity: number;
  unitCost: number;
  createdBy: string;
  createdAt: string;
}

export interface BursaryRequest {
  id: string;
  studentId: string;
  amountRequested: number;
  justification?: string;
  requestDate: string;
  status: BursaryStatus;
  createdBy: string;
}

export interface BursaryApproval {
  id: string;
  requestId: string;
  approverId: string;
  approvedAmount: number;
  approvalDate: string;
  notes?: string;
  effectiveDate?: string;
}

export interface PaymentPlan {
  id: string;
  studentId: string;
  invoiceId?: string;
  planStartDate: string;
  installmentAmount: number;
  numInstallments: number;
  status: PaymentPlanStatus;
  createdBy: string;
  createdAt: string;
}

export interface PaymentPlanInstallment {
  id: string;
  planId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidDate?: string;
  paymentId?: string;
  status: InstallmentStatus;
}

export interface FollowUpActivity {
  id: string;
  studentId: string;
  staffId: string;
  activityType: FollowUpActivityType;
  activityDate: string;
  notes?: string;
  outcome?: string;
  nextFollowUpDate?: string;
}

export interface CollectionsMetrics {
  totalInvoiced: number;
  totalCollected: number;
  outstandingAmount: number;
  collectionRate: number;
  daysToCollect: number;
  planComplianceRate: number;
  followUpEffectivenessRate: number;
}

// ============================================================================
// PHASE 3: ENTERPRISE BACKBONE TYPES
// ============================================================================

export enum EmployeeStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
}

export enum PayrollRunStatus {
  DRAFT = 'draft',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  POSTED = 'posted',
  REVERSED = 'reversed',
}

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLACKLISTED = 'blacklisted',
}

export enum SupplierInvoiceStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum PaymentRunAPStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  REVERSED = 'reversed',
}

export enum AssetStatus {
  ACTIVE = 'active',
  DISPOSED = 'disposed',
  WRITTEN_OFF = 'written_off',
  FULLY_DEPRECIATED = 'fully_depreciated',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'straight_line',
  REDUCING_BALANCE = 'reducing_balance',
}

export enum BankTransferStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REVERSED = 'reversed',
}

export enum BudgetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export enum DeductionCategory {
  STATUTORY = 'statutory',
  VOLUNTARY = 'voluntary',
  LOAN = 'loan',
}

export enum PolicyAction {
  REQUIRE_APPROVAL = 'require_approval',
  BLOCK = 'block',
  WARN = 'warn',
  AUTO_APPROVE = 'auto_approve',
}

export enum PolicyCategory {
  SPENDING = 'spending',
  APPROVAL = 'approval',
  PAYROLL = 'payroll',
  BUDGET = 'budget',
  GENERAL = 'general',
}

export enum CashForecastCategory {
  AR_INFLOW = 'ar_inflow',
  AP_OUTFLOW = 'ap_outflow',
  PAYROLL = 'payroll',
  OTHER_INFLOW = 'other_inflow',
  OTHER_OUTFLOW = 'other_outflow',
}

// --- Payroll Types ---

export interface Employee {
  id: string;
  userId?: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  hireDate: string;
  terminationDate?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  tin?: string;
  nssfNumber?: string;
  salaryStructureId?: string;
  status: EmployeeStatus;
  createdBy: string;
  createdAt: string;
}

export interface SalaryStructure {
  id: string;
  name: string;
  gradeLevel?: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  effectiveDate: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface DeductionType {
  id: string;
  name: string;
  code: string;
  category: DeductionCategory;
  isPercentage: boolean;
  defaultValue: number;
  maxAmount?: number;
  active: boolean;
}

export interface EmployeeDeduction {
  id: string;
  employeeId: string;
  deductionTypeId: string;
  amount: number;
  isPercentage: boolean;
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface PayrollRun {
  id: string;
  payPeriod: string;
  runDate: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  journalEntryId?: string;
  status: PayrollRunStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface PayrollItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  basicSalary: number;
  totalAllowances: number;
  grossSalary: number;
  paye: number;
  lst: number;
  nssf: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}

// --- AP Types ---

export interface Supplier {
  id: string;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  tin?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  paymentTermsDays: number;
  creditLimit?: number;
  status: SupplierStatus;
  createdBy: string;
  createdAt: string;
}

export interface SupplierInvoice {
  id: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  taxAmount: number;
  journalEntryId?: string;
  status: SupplierInvoiceStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface SupplierInvoiceItem {
  id: string;
  supplierInvoiceId: string;
  description: string;
  glAccountId?: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  taxAmount: number;
}

export interface PaymentRunAP {
  id: string;
  runDate: string;
  totalAmount: number;
  supplierCount: number;
  bankAccountId?: string;
  journalEntryId?: string;
  status: PaymentRunAPStatus;
  createdBy: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  paymentRunId?: string;
  supplierId: string;
  supplierInvoiceId?: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  paymentDate: string;
  status: 'pending' | 'processed' | 'reversed';
  createdBy: string;
  createdAt: string;
}

// --- Fixed Asset Types ---

export interface AssetCategory {
  id: string;
  name: string;
  depreciationMethod: DepreciationMethod;
  defaultUsefulLifeMonths: number;
  defaultResidualPercentage: number;
  depreciationAccountId?: string;
  accumulatedDepreciationAccountId?: string;
  assetAccountId?: string;
  active: boolean;
}

export interface FixedAsset {
  id: string;
  assetNumber: string;
  description: string;
  categoryId: string;
  acquisitionDate: string;
  acquisitionCost: number;
  residualValue: number;
  usefulLifeMonths: number;
  depreciationMethod: DepreciationMethod;
  accumulatedDepreciation: number;
  netBookValue: number;
  location?: string;
  campusId?: string;
  status: AssetStatus;
  disposedDate?: string;
  disposalProceeds?: number;
  disposalGainLoss?: number;
  createdBy: string;
  createdAt: string;
}

export interface DepreciationEntry {
  id: string;
  assetId: string;
  period: string;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  journalEntryId?: string;
  postedDate?: string;
}

// --- Treasury Types ---

export interface CashForecast {
  id: string;
  forecastDate: string;
  category: CashForecastCategory;
  description?: string;
  projectedAmount: number;
  actualAmount?: number;
  variance?: number;
  createdBy: string;
  createdAt: string;
}

export interface BankTransfer {
  id: string;
  fromBankAccountId: string;
  toBankAccountId: string;
  amount: number;
  transferDate: string;
  referenceNumber?: string;
  journalEntryId?: string;
  status: BankTransferStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// --- Budget Types ---

export interface Budget {
  id: string;
  fiscalYear: string;
  name: string;
  version: number;
  totalAmount: number;
  status: BudgetStatus;
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface BudgetLine {
  id: string;
  budgetId: string;
  glAccountId: string;
  period: string;
  budgetedAmount: number;
  revisedAmount?: number;
  actualAmount: number;
  variance: number;
  notes?: string;
}

export interface BudgetRevision {
  id: string;
  budgetId: string;
  glAccountId: string;
  period: string;
  previousAmount: number;
  newAmount: number;
  reason: string;
  approvedBy?: string;
  revisionDate: string;
}

// --- Multi-Campus & Policy Types ---

export interface Campus {
  id: string;
  campusName: string;
  campusCode: string;
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string;
  isMainCampus: boolean;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface PolicyRule {
  id: string;
  ruleName: string;
  category: PolicyCategory;
  conditionField: string;
  conditionOperator: '>' | '<' | '>=' | '<=' | '=' | '!=';
  conditionValue: number;
  action: PolicyAction;
  requiredRole?: string;
  campusId?: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

// ============================================================================
// FEE ENGINE TYPES (Settings → Fee Engine)
// ============================================================================

export enum FeeCategoryType {
  TUITION = 'tuition',
  BOARDING = 'boarding',
  TRANSPORT = 'transport',
  MEALS = 'meals',
  UNIFORM = 'uniform',
  BOOKS = 'books',
  ACTIVITY = 'activity',
  EXAM = 'exam',
  REGISTRATION = 'registration',
  LAB = 'lab',
  ICT = 'ict',
  LIBRARY = 'library',
  MEDICAL = 'medical',
  OTHER = 'other',
}

export interface FeeCategory {
  id: string;
  name: string;
  type: FeeCategoryType;
  glAccountId?: string;
  description?: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface FeeTemplate {
  id: string;
  name: string;
  academicYear: string;
  term: string;
  description?: string;
  lineItems: FeeTemplateLineItem[];
  totalAmount: number;
  active: boolean;
  createdBy: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface FeeTemplateLineItem {
  id: string;
  templateId: string;
  feeCategoryId: string;
  feeCategoryName: string;
  amount: number;
  optional: boolean;
  description?: string;
}

export interface BillingRule {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  criteria: BillingRuleCriteria;
  priority: number;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface BillingRuleCriteria {
  academicYear?: string;
  terms?: string[];
  classes?: string[];
  streams?: string[];
  sections?: string[];
  boardingStatus?: 'day' | 'boarding' | 'all';
  transportAssigned?: boolean;
  hostelIds?: string[];
  optionalServices?: string[];
  studentStatuses?: string[];
}

export interface DiscountWaiverRule {
  id: string;
  name: string;
  discountType: DiscountType;
  criteria: DiscountRuleCriteria;
  value: number;
  isPercentage: boolean;
  maxAmount?: number;
  maxStudents?: number;
  requiresApproval: boolean;
  approvalRoleId?: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface DiscountRuleCriteria {
  siblingCount?: number;
  staffChild?: boolean;
  scholarshipId?: string;
  sponsorId?: string;
  earlyPaymentDays?: number;
  classes?: string[];
  feeCategoryIds?: string[];
}

export interface InstallmentRule {
  id: string;
  name: string;
  templateId?: string;
  numInstallments: number;
  intervals: InstallmentInterval[];
  lateFeePercentage?: number;
  lateFeeGraceDays?: number;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface InstallmentInterval {
  installmentNumber: number;
  percentageOfTotal: number;
  dueDaysAfterTermStart: number;
  label: string;
}

export interface TransportFeeRule {
  id: string;
  name: string;
  zoneId?: string;
  zoneName?: string;
  routeId?: string;
  amountPerTerm: number;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface BoardingDayRule {
  id: string;
  name: string;
  boardingStatus: 'day' | 'boarding';
  templateId: string;
  templateName: string;
  additionalFees: { feeCategoryId: string; feeCategoryName: string; amount: number }[];
  excludedFees: string[];
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface SponsorScholarshipRule {
  id: string;
  name: string;
  sponsorName: string;
  sponsorType: 'individual' | 'organization' | 'government' | 'ngo';
  coverageType: 'full' | 'partial' | 'specific_categories';
  coveragePercentage?: number;
  coveredCategories?: string[];
  maxStudents?: number;
  currentStudents: number;
  academicYear: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface BillingCycleRule {
  id: string;
  name: string;
  academicYear: string;
  term: string;
  invoiceGenerationDate: string;
  paymentDueDate: string;
  lateFeeStartDate?: string;
  autoGenerateInvoices: boolean;
  autoApplyDiscounts: boolean;
  autoApplySponsors: boolean;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface StudentFeeMapping {
  studentId: string;
  studentName: string;
  className: string;
  templateId: string;
  templateName: string;
  appliedRules: AppliedRule[];
  appliedDiscounts: AppliedDiscount[];
  sponsorCoverage: SponsorCoverage[];
  grossAmount: number;
  totalDiscounts: number;
  totalSponsorCoverage: number;
  netPayable: number;
  installmentPlan?: { installments: { number: number; amount: number; dueDate: string }[] };
  lastCalculatedAt: string;
}

export interface AppliedRule {
  ruleId: string;
  ruleName: string;
  matchedCriteria: string;
}

export interface AppliedDiscount {
  ruleId: string;
  ruleName: string;
  discountType: DiscountType;
  amount: number;
  isPercentage: boolean;
}

export interface SponsorCoverage {
  sponsorRuleId: string;
  sponsorName: string;
  coverageAmount: number;
  coveredCategories: string[];
}

// ============================================================================
// BANK RECONCILIATION TYPES
// ============================================================================

export enum BankAccountType {
  CURRENT = 'current',
  SAVINGS = 'savings',
  MOBILE = 'mobile',
  FIXED_DEPOSIT = 'fixed_deposit',
}

export enum ReconciliationStatus {
  RECONCILED = 'reconciled',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  EXCEPTION = 'exception',
}

export enum TransactionSide {
  BANK = 'bank',
  BOOK = 'book',
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: BankAccountType;
  accountHolder: string;
  currency: string;
  openingBalance: number;
  bookBalance: number; // Balance in GL
  statementBalance: number; // Balance per bank statement
  lastReconciledDate?: Date;
  lastReconciledBalance?: number;
  reconciliationStatus: ReconciliationStatus;
  isActive: boolean;
  createdDate: Date;
  createdBy: string;
  modifiedDate?: Date;
  modifiedBy?: string;
}

export interface BankStatement {
  id: string;
  bankAccountId: string;
  statementDate: Date;
  periodStart: Date;
  periodEnd: Date;
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  transactions: BankStatementTransaction[];
  uploadedDate: Date;
  uploadedBy: string;
  fileName?: string;
}

export interface BankStatementTransaction {
  id: string;
  statementId: string;
  transactionDate: Date;
  description: string;
  amount: number;
  transactionType: 'debit' | 'credit';
  referenceNumber?: string;
  bankTransactionId?: string; // Bank's internal ID
}

export interface UnmatchedTransaction {
  id: string;
  bankAccountId: string;
  glTransactionId?: string;
  bankTransactionId?: string;
  transactionDate: Date;
  description: string;
  amount: number;
  side: TransactionSide; // Bank or Book
  transactionType: 'debit' | 'credit';
  daysOld: number;
  createdDate: Date;
}

export interface ReconciliationMatch {
  id: string;
  bankAccountId: string;
  bankTransactionId: string;
  glTransactionId: string;
  matchDate: Date;
  amount: number;
  matchedBy: string;
  matchingRules?: string[]; // e.g., ['amount_match', 'date_within_3_days']
  confidenceScore: number; // 0-100
}

export interface BankReconciliation {
  id: string;
  bankAccountId: string;
  statementId: string;
  reconciledDate: Date;
  reconciledBy: string;
  periodStart: Date;
  periodEnd: Date;
  bookOpeningBalance: number;
  bookClosingBalance: number;
  bankOpeningBalance: number;
  bankClosingBalance: number;
  matchedAmount: number;
  unmatchedAmount: number;
  discrepancy: number;
  status: ReconciliationStatus;
  adjustments: ReconciliationAdjustment[];
  notes?: string;
  approvedDate?: Date;
  approvedBy?: string;
  createdDate: Date;
}

export interface ReconciliationAdjustment {
  id: string;
  reconciliationId: string;
  description: string;
  amount: number;
  adjustmentType: 'bank_charge' | 'interest' | 'float' | 'error' | 'timing';
  accountId: string;
  createdDate: Date;
  createdBy: string;
}
