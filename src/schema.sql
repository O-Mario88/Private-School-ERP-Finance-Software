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
