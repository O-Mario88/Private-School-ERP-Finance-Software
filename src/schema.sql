/**
 * MAPLE SCHOOL FINANCE ERP
 * SQLite Schema Definition
 * 
 * Designed for offline-first event sourcing with ACID compliance
 * and double-entry accounting integrity.
 */

-- ============================================================================
-- SCHEMA VERSION CONTROL
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  migration_name TEXT NOT NULL
);

-- ============================================================================
-- AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'parent_portal',
  permissions TEXT DEFAULT '[]', -- JSON array of permission strings
  is_active BOOLEAN DEFAULT 1,
  last_login TIMESTAMP,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_offline_mode BOOLEAN DEFAULT 0,
  expires_at TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- ============================================================================
-- CHART OF ACCOUNTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK(account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_account_id TEXT REFERENCES accounts(id),
  department_id TEXT,
  cost_center_id TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'archived')),
  description TEXT,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  modified_date TIMESTAMP,
  modified_by TEXT,
  is_active BOOLEAN DEFAULT 1
);

CREATE INDEX idx_accounts_parent ON accounts(parent_account_id);
CREATE INDEX idx_accounts_code ON accounts(code);
CREATE INDEX idx_accounts_type ON accounts(account_type);

-- ============================================================================
-- SCHOOL MASTER DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stream_id TEXT,
  level INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS streams (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id),
  name TEXT NOT NULL,
  form TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  registration_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK(gender IN ('M', 'F', 'Other')),
  class_id TEXT NOT NULL REFERENCES classes(id),
  stream_id TEXT REFERENCES streams(id),
  family_id TEXT NOT NULL REFERENCES families(id),
  admission_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'graduated', 'transferred', 'withdrawn')),
  is_boarder BOOLEAN DEFAULT 0,
  transport_status TEXT DEFAULT 'not_assigned',
  financial_status TEXT DEFAULT 'good_standing',
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_date TIMESTAMP
);

CREATE INDEX idx_students_family ON students(family_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_status ON students(status);

CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  family_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  primary_payer_id TEXT REFERENCES users(id),
  secondary_payer_id TEXT REFERENCES users(id),
  total_balance DECIMAL(12, 2) DEFAULT 0,
  total_arrears DECIMAL(12, 2) DEFAULT 0,
  advance_credit DECIMAL(12, 2) DEFAULT 0,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_date TIMESTAMP
);

-- ============================================================================
-- EVENT LOG (Core of Event Sourcing Architecture)
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  aggregate_version INTEGER NOT NULL,
  timestamp INTEGER NOT NULL, -- Unix timestamp in milliseconds
  user_id TEXT NOT NULL REFERENCES users(id),
  device_id TEXT,
  data TEXT NOT NULL, -- JSON payload specific to event type
  sync_status TEXT DEFAULT 'local' CHECK(sync_status IN ('local', 'synced', 'pending', 'conflict')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP,
  conflict_notes TEXT
);

CREATE INDEX idx_events_aggregate ON events(aggregate_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_sync_status ON events(sync_status);

-- ============================================================================
-- FINANCIAL TRANSACTIONS - JOURNAL ENTRIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  entry_date DATE NOT NULL,
  reference_number TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by TEXT REFERENCES users(id),
  approved_date TIMESTAMP,
  posted_by TEXT REFERENCES users(id),
  posted_date TIMESTAMP,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'approved', 'posted', 'reversed')),
  FOREIGN KEY(created_by) REFERENCES users(id),
  FOREIGN KEY(approved_by) REFERENCES users(id),
  FOREIGN KEY(posted_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS journal_line_items (
  id TEXT PRIMARY KEY,
  journal_entry_id TEXT NOT NULL REFERENCES journal_entries(id),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  debit_amount DECIMAL(12, 2),
  credit_amount DECIMAL(12, 2),
  line_description TEXT,
  transaction_id TEXT, -- Link to source transaction
  entity_version INTEGER DEFAULT 1,
  CHECK ((debit_amount IS NOT NULL AND credit_amount IS NULL) OR (debit_amount IS NULL AND credit_amount IS NOT NULL))
);

CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_line_items_account ON journal_line_items(account_id);

-- Ensure double-entry integrity
CREATE TRIGGER validate_journal_entry_balance
AFTER INSERT ON journal_entries
FOR EACH ROW
BEGIN
  SELECT CASE
    WHEN (SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) FROM journal_line_items WHERE journal_entry_id = NEW.id) != 0
    THEN RAISE(ABORT, 'Journal entry must balance (debits must equal credits)')
  END;
END;

-- ============================================================================
-- ACCOUNTS RECEIVABLE - STUDENT INVOICING
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_invoices (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  family_id TEXT NOT NULL REFERENCES families(id),
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  term TEXT,
  academic_year TEXT,
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'issued', 'partially_paid', 'fully_paid', 'overdue', 'cancelled', 'written_off')),
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  balance_amount DECIMAL(12, 2) NOT NULL,
  discount_approval_id TEXT,
  scholarship_applied DECIMAL(12, 2) DEFAULT 0,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES student_invoices(id),
  fee_type TEXT NOT NULL, -- 'tuition', 'transport', 'uniform', 'activity', etc.
  description TEXT NOT NULL,
  quantity DECIMAL(8, 2) DEFAULT 1,
  unit_rate DECIMAL(12, 2) NOT NULL,
  line_amount DECIMAL(12, 2) NOT NULL,
  account_code_id TEXT REFERENCES accounts(id),
  scholarship_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0
);

CREATE INDEX idx_invoices_student ON student_invoices(student_id);
CREATE INDEX idx_invoices_family ON student_invoices(family_id);
CREATE INDEX idx_invoices_status ON student_invoices(status);
CREATE INDEX idx_invoices_due_date ON student_invoices(due_date);

-- ============================================================================
-- PAYMENTS & RECEIPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  payment_number TEXT UNIQUE NOT NULL,
  family_id TEXT NOT NULL REFERENCES families(id),
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'cheque', 'bank_transfer', 'mobile_money', 'card', 'credit')),
  amount DECIMAL(12, 2) NOT NULL,
  reference_number TEXT, -- Cheque number, M-Pesa ref, etc.
  description TEXT,
  unapplied_balance DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'recorded' CHECK(status IN ('recorded', 'matched', 'reversed')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bank_account_id TEXT,
  FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payment_allocations (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES payments(id),
  invoice_id TEXT NOT NULL REFERENCES student_invoices(id),
  allocated_amount DECIMAL(12, 2) NOT NULL,
  allocation_date DATE NOT NULL,
  UNIQUE(payment_id, invoice_id)
);

CREATE INDEX idx_payments_family ON payments(family_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payment_allocations_payment ON payment_allocations(payment_id);

-- ============================================================================
-- APPROVAL & CONTROL
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  condition TEXT, -- e.g., "amount > 50000" or "feeType == 'discount'"
  required_role TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  approval_rule_id TEXT REFERENCES approval_rules(id),
  assigned_to TEXT NOT NULL, -- role name
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  approver_user_id TEXT REFERENCES users(id),
  approval_date TIMESTAMP,
  comments TEXT,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_transaction ON approvals(transaction_id);
CREATE INDEX idx_approvals_status ON approvals(status);

-- ============================================================================
-- AUDIT TRAIL
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL CHECK(action IN ('create', 'update', 'delete', 'approve', 'post', 'reverse')),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_value TEXT, -- JSON
  new_value TEXT, -- JSON
  reason TEXT,
  affected_fields TEXT, -- JSON array
  ip_address TEXT
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ============================================================================
-- SYNC & OFFLINE QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id),
  queued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  last_retry_date TIMESTAMP,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS sync_conflicts (
  id TEXT PRIMARY KEY,
  local_event_id TEXT REFERENCES events(id),
  remote_event_id TEXT,
  aggregate_id TEXT NOT NULL,
  resolution_required BOOLEAN DEFAULT 1,
  suggested_resolution TEXT DEFAULT 'manual_merge',
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_date TIMESTAMP,
  resolution_notes TEXT
);

-- ============================================================================
-- BANKING & TREASURY
-- ============================================================================

CREATE TABLE IF NOT EXISTS bank_accounts (
  id TEXT PRIMARY KEY,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch_code TEXT,
  currency TEXT DEFAULT 'KES',
  gl_account_id TEXT NOT NULL REFERENCES accounts(id),
  opening_balance DECIMAL(12, 2) DEFAULT 0,
  current_balance DECIMAL(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_reconciliation (
  id TEXT PRIMARY KEY,
  bank_account_id TEXT NOT NULL REFERENCES bank_accounts(id),
  reconciliation_date DATE NOT NULL,
  bank_statement_balance DECIMAL(12, 2) NOT NULL,
  book_balance DECIMAL(12, 2) NOT NULL,
  difference DECIMAL(12, 2),
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed', 'verified')),
  reconciled_by TEXT REFERENCES users(id),
  reconciled_date TIMESTAMP,
  notes TEXT
);

-- ============================================================================
-- FISCAL PERIODS & CLOSE CONTROL
-- ============================================================================

CREATE TABLE IF NOT EXISTS fiscal_periods (
  id TEXT PRIMARY KEY,
  period_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  period_status TEXT DEFAULT 'open' CHECK(period_status IN ('open', 'soft_closed', 'hard_closed')),
  is_active BOOLEAN DEFAULT 1,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS period_close_logs (
  id TEXT PRIMARY KEY,
  fiscal_period_id TEXT NOT NULL REFERENCES fiscal_periods(id),
  closed_by TEXT NOT NULL REFERENCES users(id),
  close_type TEXT CHECK(close_type IN ('soft_close', 'hard_close')),
  closed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reopen_required BOOLEAN DEFAULT 0,
  notes TEXT
);

-- ============================================================================
-- PHASE 2: SCHOOL CORE - FEE RULES ENGINE, TRANSPORT, INVENTORY, BURSARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS fee_rules (
  id TEXT PRIMARY KEY,
  school_id TEXT,
  class_id TEXT REFERENCES classes(id),
  term TEXT,
  fee_type TEXT NOT NULL, -- "tuition", "activity", etc.
  amount DECIMAL(12, 2) NOT NULL,
  effective_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL REFERENCES users(id),
  modified_at TIMESTAMP,
  modified_by TEXT
);

CREATE TABLE IF NOT EXISTS fee_discounts (
  id TEXT PRIMARY KEY,
  fee_rule_id TEXT NOT NULL REFERENCES fee_rules(id),
  discount_type TEXT NOT NULL, -- "scholarship", "sibling", "early_bird", "exemption"
  discount_value DECIMAL(12, 2) NOT NULL,
  is_percentage BOOLEAN DEFAULT 0,
  max_students INTEGER,
  max_discount_amount DECIMAL(12, 2),
  active BOOLEAN DEFAULT 1,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transport_routes (
  id TEXT PRIMARY KEY,
  route_name TEXT NOT NULL,
  cost_per_month DECIMAL(12, 2) NOT NULL,
  pickup_points TEXT, -- JSON array of locations
  driver_name TEXT,
  vehicle_registration TEXT,
  active BOOLEAN DEFAULT 1,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_transport_assignments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  route_id TEXT NOT NULL REFERENCES transport_routes(id),
  term TEXT NOT NULL,
  active BOOLEAN DEFAULT 1,
  assigned_date DATE DEFAULT CURRENT_DATE,
  assigned_by TEXT NOT NULL REFERENCES users(id),
  UNIQUE(student_id, route_id, term)
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL, -- "uniform", "book", "stationery"
  unit_cost DECIMAL(12, 2) NOT NULL,
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_level INTEGER,
  supplier_name TEXT,
  active BOOLEAN DEFAULT 1,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_allocations (
  id TEXT PRIMARY KEY,
  inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id),
  class_id TEXT REFERENCES classes(id),
  term TEXT,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(12, 2) NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bursary_requests (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  amount_requested DECIMAL(12, 2) NOT NULL,
  justification TEXT,
  request_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'submitted', -- "submitted", "approved", "rejected", "disbursed"
  created_by TEXT NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bursary_approvals (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES bursary_requests(id),
  approver_id TEXT NOT NULL REFERENCES users(id),
  approved_amount DECIMAL(12, 2) NOT NULL,
  approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  effective_date DATE
);

CREATE TABLE IF NOT EXISTS payment_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  invoice_id TEXT REFERENCES student_invoices(id),
  plan_start_date DATE NOT NULL,
  installment_amount DECIMAL(12, 2) NOT NULL,
  num_installments INTEGER NOT NULL,
  status TEXT DEFAULT 'active', -- "active", "completed", "defaulted"
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_plan_installments (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES payment_plans(id),
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  paid_date DATE,
  payment_id TEXT REFERENCES payments(id),
  status TEXT DEFAULT 'pending', -- "pending", "paid", "overdue"
  UNIQUE(plan_id, installment_number)
);

CREATE TABLE IF NOT EXISTS follow_up_activities (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  staff_id TEXT NOT NULL REFERENCES users(id),
  activity_type TEXT NOT NULL, -- "call", "email", "in_person"
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  outcome TEXT, -- "promised_payment", "promised_plan", "no_response", "obstacle"
  next_follow_up_date DATE
);

-- Indexes for Phase 2 tables
CREATE INDEX idx_fee_rules_class_term ON fee_rules(class_id, term);
CREATE INDEX idx_fee_discounts_rule ON fee_discounts(fee_rule_id);
CREATE INDEX idx_transport_assignments_student ON student_transport_assignments(student_id);
CREATE INDEX idx_transport_assignments_term ON student_transport_assignments(term);
CREATE INDEX idx_inventory_allocations_class_term ON inventory_allocations(class_id, term);
CREATE INDEX idx_bursary_requests_student ON bursary_requests(student_id);
CREATE INDEX idx_bursary_requests_status ON bursary_requests(status);
CREATE INDEX idx_payment_plans_student ON payment_plans(student_id);
CREATE INDEX idx_payment_plans_status ON payment_plans(status);
CREATE INDEX idx_payment_plan_installments_status ON payment_plan_installments(status);
CREATE INDEX idx_follow_ups_student ON follow_up_activities(student_id);

-- ============================================================================
-- PHASE 3: ENTERPRISE BACKBONE - PAYROLL, AP, ASSETS, TREASURY, BUDGET
-- ============================================================================

-- 3.1 Payroll Module
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  employee_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  hire_date DATE NOT NULL,
  termination_date DATE,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_branch TEXT,
  kra_pin TEXT,
  nhif_number TEXT,
  nssf_number TEXT,
  salary_structure_id TEXT REFERENCES salary_structures(id),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'on_leave', 'terminated', 'suspended')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS salary_structures (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level TEXT,
  basic_salary DECIMAL(12, 2) NOT NULL,
  housing_allowance DECIMAL(12, 2) DEFAULT 0,
  transport_allowance DECIMAL(12, 2) DEFAULT 0,
  medical_allowance DECIMAL(12, 2) DEFAULT 0,
  other_allowances DECIMAL(12, 2) DEFAULT 0,
  gross_salary DECIMAL(12, 2) NOT NULL,
  effective_date DATE NOT NULL,
  active BOOLEAN DEFAULT 1,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deduction_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('statutory', 'voluntary', 'loan')),
  is_percentage BOOLEAN DEFAULT 0,
  default_value DECIMAL(12, 2) DEFAULT 0,
  max_amount DECIMAL(12, 2),
  active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS employee_deductions (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id),
  deduction_type_id TEXT NOT NULL REFERENCES deduction_types(id),
  amount DECIMAL(12, 2) NOT NULL,
  is_percentage BOOLEAN DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT 1,
  UNIQUE(employee_id, deduction_type_id)
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id TEXT PRIMARY KEY,
  pay_period TEXT NOT NULL,
  run_date DATE NOT NULL,
  total_gross DECIMAL(12, 2) DEFAULT 0,
  total_deductions DECIMAL(12, 2) DEFAULT 0,
  total_net DECIMAL(12, 2) DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  journal_entry_id TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'calculated', 'approved', 'posted', 'reversed')),
  created_by TEXT NOT NULL REFERENCES users(id),
  approved_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_items (
  id TEXT PRIMARY KEY,
  payroll_run_id TEXT NOT NULL REFERENCES payroll_runs(id),
  employee_id TEXT NOT NULL REFERENCES employees(id),
  basic_salary DECIMAL(12, 2) NOT NULL,
  total_allowances DECIMAL(12, 2) DEFAULT 0,
  gross_salary DECIMAL(12, 2) NOT NULL,
  paye DECIMAL(12, 2) DEFAULT 0,
  nhif DECIMAL(12, 2) DEFAULT 0,
  nssf DECIMAL(12, 2) DEFAULT 0,
  other_deductions DECIMAL(12, 2) DEFAULT 0,
  total_deductions DECIMAL(12, 2) DEFAULT 0,
  net_salary DECIMAL(12, 2) NOT NULL,
  UNIQUE(payroll_run_id, employee_id)
);

-- 3.2 Accounts Payable
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  kra_pin TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_branch TEXT,
  payment_terms_days INTEGER DEFAULT 30,
  credit_limit DECIMAL(12, 2),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'blacklisted')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_invoices (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  balance_amount DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  journal_entry_id TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'approved', 'partially_paid', 'paid', 'cancelled')),
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_invoice_items (
  id TEXT PRIMARY KEY,
  supplier_invoice_id TEXT NOT NULL REFERENCES supplier_invoices(id),
  description TEXT NOT NULL,
  gl_account_id TEXT REFERENCES accounts(id),
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  line_amount DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payment_runs_ap (
  id TEXT PRIMARY KEY,
  run_date DATE NOT NULL,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  supplier_count INTEGER DEFAULT 0,
  bank_account_id TEXT REFERENCES bank_accounts(id),
  journal_entry_id TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'approved', 'processed', 'reversed')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_payments (
  id TEXT PRIMARY KEY,
  payment_run_id TEXT REFERENCES payment_runs_ap(id),
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  supplier_invoice_id TEXT REFERENCES supplier_invoices(id),
  amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  reference_number TEXT,
  payment_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processed', 'reversed')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.3 Fixed Assets
CREATE TABLE IF NOT EXISTS asset_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  depreciation_method TEXT DEFAULT 'straight_line' CHECK(depreciation_method IN ('straight_line', 'reducing_balance')),
  default_useful_life_months INTEGER NOT NULL,
  default_residual_percentage DECIMAL(5, 2) DEFAULT 0,
  depreciation_account_id TEXT REFERENCES accounts(id),
  accumulated_depreciation_account_id TEXT REFERENCES accounts(id),
  asset_account_id TEXT REFERENCES accounts(id),
  active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS fixed_assets (
  id TEXT PRIMARY KEY,
  asset_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES asset_categories(id),
  acquisition_date DATE NOT NULL,
  acquisition_cost DECIMAL(12, 2) NOT NULL,
  residual_value DECIMAL(12, 2) DEFAULT 0,
  useful_life_months INTEGER NOT NULL,
  depreciation_method TEXT DEFAULT 'straight_line' CHECK(depreciation_method IN ('straight_line', 'reducing_balance')),
  accumulated_depreciation DECIMAL(12, 2) DEFAULT 0,
  net_book_value DECIMAL(12, 2) NOT NULL,
  location TEXT,
  campus_id TEXT REFERENCES campuses(id),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'disposed', 'written_off', 'fully_depreciated')),
  disposed_date DATE,
  disposal_proceeds DECIMAL(12, 2),
  disposal_gain_loss DECIMAL(12, 2),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS depreciation_schedule (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES fixed_assets(id),
  period TEXT NOT NULL,
  depreciation_amount DECIMAL(12, 2) NOT NULL,
  accumulated_depreciation DECIMAL(12, 2) NOT NULL,
  net_book_value DECIMAL(12, 2) NOT NULL,
  journal_entry_id TEXT,
  posted_date DATE,
  UNIQUE(asset_id, period)
);

-- 3.4 Treasury & Cash Management
CREATE TABLE IF NOT EXISTS cash_forecasts (
  id TEXT PRIMARY KEY,
  forecast_date DATE NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('ar_inflow', 'ap_outflow', 'payroll', 'other_inflow', 'other_outflow')),
  description TEXT,
  projected_amount DECIMAL(12, 2) NOT NULL,
  actual_amount DECIMAL(12, 2),
  variance DECIMAL(12, 2),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_transfers (
  id TEXT PRIMARY KEY,
  from_bank_account_id TEXT NOT NULL REFERENCES bank_accounts(id),
  to_bank_account_id TEXT NOT NULL REFERENCES bank_accounts(id),
  amount DECIMAL(12, 2) NOT NULL,
  transfer_date DATE NOT NULL,
  reference_number TEXT,
  journal_entry_id TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'reversed')),
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 Budget Module
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  fiscal_year TEXT NOT NULL,
  name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  total_amount DECIMAL(14, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'approved', 'active', 'closed')),
  approved_by TEXT REFERENCES users(id),
  approved_date DATE,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budget_lines (
  id TEXT PRIMARY KEY,
  budget_id TEXT NOT NULL REFERENCES budgets(id),
  gl_account_id TEXT NOT NULL REFERENCES accounts(id),
  period TEXT NOT NULL,
  budgeted_amount DECIMAL(12, 2) NOT NULL,
  revised_amount DECIMAL(12, 2),
  actual_amount DECIMAL(12, 2) DEFAULT 0,
  variance DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  UNIQUE(budget_id, gl_account_id, period)
);

CREATE TABLE IF NOT EXISTS budget_revisions (
  id TEXT PRIMARY KEY,
  budget_id TEXT NOT NULL REFERENCES budgets(id),
  gl_account_id TEXT NOT NULL REFERENCES accounts(id),
  period TEXT NOT NULL,
  previous_amount DECIMAL(12, 2) NOT NULL,
  new_amount DECIMAL(12, 2) NOT NULL,
  reason TEXT NOT NULL,
  approved_by TEXT REFERENCES users(id),
  revision_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.6 Multi-Campus & Policy
CREATE TABLE IF NOT EXISTS campuses (
  id TEXT PRIMARY KEY,
  campus_name TEXT NOT NULL,
  campus_code TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  principal_name TEXT,
  is_main_campus BOOLEAN DEFAULT 0,
  active BOOLEAN DEFAULT 1,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS policy_rules (
  id TEXT PRIMARY KEY,
  rule_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('spending', 'approval', 'payroll', 'budget', 'general')),
  condition_field TEXT NOT NULL,
  condition_operator TEXT NOT NULL CHECK(condition_operator IN ('>', '<', '>=', '<=', '=', '!=')),
  condition_value DECIMAL(14, 2) NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('require_approval', 'block', 'warn', 'auto_approve')),
  required_role TEXT,
  campus_id TEXT REFERENCES campuses(id),
  active BOOLEAN DEFAULT 1,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Phase 3 Indexes
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX idx_payroll_runs_period ON payroll_runs(pay_period);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_supplier_invoices_supplier ON supplier_invoices(supplier_id);
CREATE INDEX idx_supplier_invoices_status ON supplier_invoices(status);
CREATE INDEX idx_supplier_invoices_due ON supplier_invoices(due_date);
CREATE INDEX idx_supplier_payments_supplier ON supplier_payments(supplier_id);
CREATE INDEX idx_fixed_assets_category ON fixed_assets(category_id);
CREATE INDEX idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX idx_depreciation_schedule_asset ON depreciation_schedule(asset_id);
CREATE INDEX idx_budget_lines_budget ON budget_lines(budget_id);
CREATE INDEX idx_budget_lines_account ON budget_lines(gl_account_id);
CREATE INDEX idx_policy_rules_category ON policy_rules(category);

-- ============================================================================
-- VIEWS FOR CALCULATED BALANCES
-- ============================================================================

-- Trial Balance View (calculated from journal entries)
CREATE VIEW IF NOT EXISTS trial_balance AS
SELECT 
  a.id,
  a.code,
  a.name,
  a.account_type,
  COALESCE(SUM(CASE WHEN jli.debit_amount IS NOT NULL THEN jli.debit_amount ELSE 0 END), 0) as debit_balance,
  COALESCE(SUM(CASE WHEN jli.credit_amount IS NOT NULL THEN jli.credit_amount ELSE 0 END), 0) as credit_balance
FROM accounts a
LEFT JOIN journal_line_items jli ON a.id = jli.account_id
LEFT JOIN journal_entries je ON jli.journal_entry_id = je.id AND je.status = 'posted'
GROUP BY a.id, a.code, a.name, a.account_type;

-- Receivables Aging View
CREATE VIEW IF NOT EXISTS receivables_aging AS
SELECT
  f.id as family_id,
  f.family_name,
  COALESCE(SUM(CASE WHEN si.due_date >= DATE('now') THEN si.balance_amount ELSE 0 END), 0) as current,
  COALESCE(SUM(CASE WHEN si.due_date < DATE('now') AND si.due_date >= DATE('now', '-30 days') THEN si.balance_amount ELSE 0 END), 0) as thirty_days,
  COALESCE(SUM(CASE WHEN si.due_date < DATE('now', '-30 days') AND si.due_date >= DATE('now', '-60 days') THEN si.balance_amount ELSE 0 END), 0) as sixty_days,
  COALESCE(SUM(CASE WHEN si.due_date < DATE('now', '-60 days') AND si.due_date >= DATE('now', '-90 days') THEN si.balance_amount ELSE 0 END), 0) as ninety_days,
  COALESCE(SUM(CASE WHEN si.due_date < DATE('now', '-90 days') THEN si.balance_amount ELSE 0 END), 0) as over_90_days,
  COALESCE(SUM(si.balance_amount), 0) as total_arrears
FROM families f
LEFT JOIN student_invoices si ON f.id = si.family_id AND si.status IN ('issued', 'partially_paid', 'overdue')
GROUP BY f.id, f.family_name;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_events_aggregate_version ON events(aggregate_id, aggregate_version);
CREATE INDEX idx_student_invoices_created ON student_invoices(created_date);
CREATE INDEX idx_payments_created ON payments(created_date);
CREATE INDEX idx_audit_logs_created ON audit_logs(timestamp DESC);

-- Pragmas for offline-first performance
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
PRAGMA foreign_keys = ON;
