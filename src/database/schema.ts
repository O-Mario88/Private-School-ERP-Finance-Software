/**
 * MAPLE SCHOOL FINANCE ERP — Complete SQLite Schema
 * Covers all modules: Institution, Students, Billing, Payments, Collections,
 * Transport, Inventory, Kitchen, Scholarships, Accounting, Expenses, Budgets,
 * Payroll, Assets, Treasury, Audit, and Sync.
 *
 * Every table includes sync-ready fields for future cloud connectivity.
 */

export const SCHEMA_VERSION = 1;

export const SCHEMA_SQL = `
-- ============================================================================
-- SCHEMA VERSION CONTROL
-- ============================================================================
CREATE TABLE IF NOT EXISTS schema_version (
  version       INTEGER PRIMARY KEY,
  applied_at    TEXT DEFAULT (datetime('now')),
  migration_name TEXT NOT NULL
);

-- ============================================================================
-- A. INSTITUTION / SETUP
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutions (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  short_name      TEXT,
  registration_no TEXT,
  motto           TEXT,
  address         TEXT,
  city            TEXT,
  country         TEXT DEFAULT 'UG',
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  logo_url        TEXT,
  currency_code   TEXT DEFAULT 'UGX',
  fiscal_year_start_month INTEGER DEFAULT 1,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS campuses (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  code            TEXT NOT NULL,
  address         TEXT,
  phone           TEXT,
  email           TEXT,
  principal_name  TEXT,
  is_main         INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS academic_years (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  start_date      TEXT NOT NULL,
  end_date        TEXT NOT NULL,
  is_current      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS terms (
  id              TEXT PRIMARY KEY,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id),
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  term_number     INTEGER NOT NULL,
  start_date      TEXT NOT NULL,
  end_date        TEXT NOT NULL,
  is_current      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS departments (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  name            TEXT NOT NULL,
  code            TEXT,
  head_user_id    TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS cost_centers (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  name            TEXT NOT NULL,
  code            TEXT NOT NULL,
  department_id   TEXT REFERENCES departments(id),
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS classes (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  name            TEXT NOT NULL,
  level           INTEGER,
  section         TEXT,
  capacity        INTEGER,
  class_teacher_id TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS streams (
  id              TEXT PRIMARY KEY,
  class_id        TEXT NOT NULL REFERENCES classes(id),
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  capacity        INTEGER,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS roles (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  description     TEXT,
  is_system       INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS permissions (
  id              TEXT PRIMARY KEY,
  role_id         TEXT NOT NULL REFERENCES roles(id),
  resource        TEXT NOT NULL,
  action          TEXT NOT NULL,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  email           TEXT NOT NULL,
  password_hash   TEXT NOT NULL DEFAULT '',
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'cashier',
  role_id         TEXT REFERENCES roles(id),
  phone           TEXT,
  avatar_url      TEXT,
  is_active       INTEGER DEFAULT 1,
  last_login      TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS institution_settings (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  setting_key     TEXT NOT NULL,
  setting_value   TEXT,
  category        TEXT DEFAULT 'general',
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  UNIQUE(institution_id, setting_key)
);

CREATE TABLE IF NOT EXISTS branding_settings (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  logo_url        TEXT,
  primary_color   TEXT DEFAULT '#1e40af',
  secondary_color TEXT DEFAULT '#3b82f6',
  header_text     TEXT,
  footer_text     TEXT,
  receipt_template TEXT DEFAULT 'default',
  invoice_template TEXT DEFAULT 'default',
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- B. STUDENTS / GUARDIANS
-- ============================================================================
CREATE TABLE IF NOT EXISTS guardians (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  relationship    TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  occupation      TEXT,
  employer        TEXT,
  national_id     TEXT,
  is_primary_payer INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  created_by      TEXT,
  deleted_at      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS students (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  admission_no    TEXT NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  other_names     TEXT,
  date_of_birth   TEXT,
  gender          TEXT CHECK(gender IN ('M','F','Other')),
  nationality     TEXT DEFAULT 'Ugandan',
  class_id        TEXT REFERENCES classes(id),
  stream_id       TEXT REFERENCES streams(id),
  admission_date  TEXT NOT NULL,
  photo_url       TEXT,
  is_boarder      INTEGER DEFAULT 0,
  has_transport    INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','graduated','transferred','withdrawn','suspended')),
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  created_by      TEXT,
  deleted_at      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS student_guardians (
  id              TEXT PRIMARY KEY,
  student_id      TEXT NOT NULL REFERENCES students(id),
  guardian_id     TEXT NOT NULL REFERENCES guardians(id),
  relationship    TEXT NOT NULL,
  is_primary      INTEGER DEFAULT 0,
  is_emergency    INTEGER DEFAULT 0,
  can_pickup      INTEGER DEFAULT 1,
  created_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(student_id, guardian_id)
);

CREATE TABLE IF NOT EXISTS student_financial_profiles (
  id              TEXT PRIMARY KEY,
  student_id      TEXT NOT NULL REFERENCES students(id) UNIQUE,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  total_billed    REAL DEFAULT 0,
  total_paid      REAL DEFAULT 0,
  total_balance   REAL DEFAULT 0,
  total_arrears   REAL DEFAULT 0,
  advance_credit  REAL DEFAULT 0,
  financial_status TEXT DEFAULT 'good_standing',
  last_payment_date TEXT,
  last_invoice_date TEXT,
  updated_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS student_status_changes (
  id              TEXT PRIMARY KEY,
  student_id      TEXT NOT NULL REFERENCES students(id),
  from_status     TEXT NOT NULL,
  to_status       TEXT NOT NULL,
  reason          TEXT,
  effective_date  TEXT NOT NULL,
  changed_by      TEXT NOT NULL,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- C. BILLING
-- ============================================================================
CREATE TABLE IF NOT EXISTS fee_categories (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  code            TEXT NOT NULL,
  gl_account_id   TEXT,
  description     TEXT,
  is_mandatory    INTEGER DEFAULT 1,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS fee_templates (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  academic_year_id TEXT REFERENCES academic_years(id),
  term_id         TEXT REFERENCES terms(id),
  class_id        TEXT REFERENCES classes(id),
  applies_to      TEXT DEFAULT 'all',
  status          TEXT DEFAULT 'active',
  total_amount    REAL DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS fee_template_lines (
  id              TEXT PRIMARY KEY,
  template_id     TEXT NOT NULL REFERENCES fee_templates(id),
  fee_category_id TEXT NOT NULL REFERENCES fee_categories(id),
  description     TEXT NOT NULL,
  amount          REAL NOT NULL,
  is_optional     INTEGER DEFAULT 0,
  sort_order      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_fee_assignments (
  id              TEXT PRIMARY KEY,
  student_id      TEXT NOT NULL REFERENCES students(id),
  template_id     TEXT NOT NULL REFERENCES fee_templates(id),
  term_id         TEXT REFERENCES terms(id),
  override_amount REAL,
  status          TEXT DEFAULT 'active',
  assigned_at     TEXT DEFAULT (datetime('now')),
  assigned_by     TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS discount_rules (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  discount_type   TEXT NOT NULL,
  value           REAL NOT NULL,
  is_percentage   INTEGER DEFAULT 0,
  max_amount      REAL,
  fee_category_id TEXT REFERENCES fee_categories(id),
  class_id        TEXT REFERENCES classes(id),
  conditions      TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS student_discounts (
  id              TEXT PRIMARY KEY,
  student_id      TEXT NOT NULL REFERENCES students(id),
  discount_rule_id TEXT NOT NULL REFERENCES discount_rules(id),
  term_id         TEXT REFERENCES terms(id),
  amount          REAL NOT NULL,
  reason          TEXT,
  approved_by     TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS billing_cycles (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  term_id         TEXT NOT NULL REFERENCES terms(id),
  name            TEXT NOT NULL,
  billing_date    TEXT NOT NULL,
  due_date        TEXT NOT NULL,
  status          TEXT DEFAULT 'draft',
  total_billed    REAL DEFAULT 0,
  student_count   INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS invoices (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  guardian_id     TEXT REFERENCES guardians(id),
  invoice_number  TEXT NOT NULL,
  invoice_date    TEXT NOT NULL,
  due_date        TEXT NOT NULL,
  term_id         TEXT REFERENCES terms(id),
  academic_year_id TEXT REFERENCES academic_years(id),
  subtotal        REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  tax_amount      REAL DEFAULT 0,
  total_amount    REAL NOT NULL,
  paid_amount     REAL DEFAULT 0,
  balance         REAL NOT NULL,
  status          TEXT DEFAULT 'draft' CHECK(status IN ('draft','issued','partially_paid','fully_paid','overdue','cancelled','written_off')),
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  created_by      TEXT,
  deleted_at      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS invoice_lines (
  id              TEXT PRIMARY KEY,
  invoice_id      TEXT NOT NULL REFERENCES invoices(id),
  fee_category_id TEXT REFERENCES fee_categories(id),
  description     TEXT NOT NULL,
  quantity        REAL DEFAULT 1,
  unit_price      REAL NOT NULL,
  amount          REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  sort_order      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS credit_notes (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  invoice_id      TEXT REFERENCES invoices(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  credit_note_no  TEXT NOT NULL,
  amount          REAL NOT NULL,
  reason          TEXT NOT NULL,
  status          TEXT DEFAULT 'draft',
  approved_by     TEXT,
  approved_at     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS debit_notes (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  invoice_id      TEXT REFERENCES invoices(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  debit_note_no   TEXT NOT NULL,
  amount          REAL NOT NULL,
  reason          TEXT NOT NULL,
  status          TEXT DEFAULT 'draft',
  approved_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS installment_plans (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  invoice_id      TEXT REFERENCES invoices(id),
  total_amount    REAL NOT NULL,
  installments    INTEGER NOT NULL,
  installment_amount REAL NOT NULL,
  start_date      TEXT NOT NULL,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- D. PAYMENTS / RECEIPTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  student_id      TEXT REFERENCES students(id),
  guardian_id     TEXT REFERENCES guardians(id),
  payment_number  TEXT NOT NULL,
  payment_date    TEXT NOT NULL,
  amount          REAL NOT NULL,
  payment_method  TEXT NOT NULL CHECK(payment_method IN ('cash','cheque','bank_transfer','mobile_money','card','credit')),
  reference_no    TEXT,
  bank_account_id TEXT REFERENCES bank_accounts(id),
  description     TEXT,
  unapplied       REAL DEFAULT 0,
  status          TEXT DEFAULT 'recorded' CHECK(status IN ('recorded','allocated','reversed','voided')),
  received_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  created_by      TEXT,
  deleted_at      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS payment_allocations (
  id              TEXT PRIMARY KEY,
  payment_id      TEXT NOT NULL REFERENCES payments(id),
  invoice_id      TEXT NOT NULL REFERENCES invoices(id),
  amount          REAL NOT NULL,
  allocated_at    TEXT DEFAULT (datetime('now')),
  allocated_by    TEXT,
  UNIQUE(payment_id, invoice_id)
);

CREATE TABLE IF NOT EXISTS receipts (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  payment_id      TEXT NOT NULL REFERENCES payments(id),
  receipt_number  TEXT NOT NULL,
  receipt_date    TEXT NOT NULL,
  amount          REAL NOT NULL,
  student_name    TEXT,
  class_name      TEXT,
  payment_method  TEXT,
  description     TEXT,
  issued_by       TEXT,
  printed_count   INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'issued',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS receipt_reprints (
  id              TEXT PRIMARY KEY,
  receipt_id      TEXT NOT NULL REFERENCES receipts(id),
  reprinted_by    TEXT NOT NULL,
  reason          TEXT NOT NULL,
  reprinted_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS refunds (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  payment_id      TEXT NOT NULL REFERENCES payments(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  amount          REAL NOT NULL,
  reason          TEXT NOT NULL,
  approved_by     TEXT,
  status          TEXT DEFAULT 'pending',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS unidentified_payments (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  amount          REAL NOT NULL,
  payment_date    TEXT NOT NULL,
  payment_method  TEXT,
  reference_no    TEXT,
  bank_reference  TEXT,
  notes           TEXT,
  resolved        INTEGER DEFAULT 0,
  resolved_payment_id TEXT REFERENCES payments(id),
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS bank_deposit_slips (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  bank_account_id TEXT NOT NULL REFERENCES bank_accounts(id),
  deposit_date    TEXT NOT NULL,
  total_amount    REAL NOT NULL,
  reference_no    TEXT,
  status          TEXT DEFAULT 'pending',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS mobile_money_payments (
  id              TEXT PRIMARY KEY,
  payment_id      TEXT REFERENCES payments(id),
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  provider        TEXT NOT NULL,
  phone_number    TEXT NOT NULL,
  transaction_id  TEXT,
  amount          REAL NOT NULL,
  status          TEXT DEFAULT 'pending',
  confirmed_at    TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- E. COLLECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS arrears_reviews (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  term_id         TEXT REFERENCES terms(id),
  review_date     TEXT NOT NULL,
  total_arrears   REAL NOT NULL,
  student_count   INTEGER NOT NULL,
  reviewed_by     TEXT,
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS collection_followups (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  guardian_id     TEXT REFERENCES guardians(id),
  staff_id        TEXT NOT NULL,
  followup_type   TEXT NOT NULL CHECK(followup_type IN ('call','sms','email','letter','in_person','home_visit')),
  followup_date   TEXT NOT NULL,
  notes           TEXT,
  outcome         TEXT,
  next_followup   TEXT,
  amount_promised REAL,
  promise_date    TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS payment_commitments (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  guardian_id     TEXT REFERENCES guardians(id),
  amount          REAL NOT NULL,
  promised_date   TEXT NOT NULL,
  actual_date     TEXT,
  actual_amount   REAL,
  status          TEXT DEFAULT 'pending' CHECK(status IN ('pending','fulfilled','partial','broken','expired')),
  followup_id     TEXT REFERENCES collection_followups(id),
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS writeoff_requests (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  invoice_id      TEXT REFERENCES invoices(id),
  amount          REAL NOT NULL,
  reason          TEXT NOT NULL,
  requested_by    TEXT NOT NULL,
  approved_by     TEXT,
  status          TEXT DEFAULT 'pending',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- F. TRANSPORT
-- ============================================================================
CREATE TABLE IF NOT EXISTS transport_routes (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  route_name      TEXT NOT NULL,
  route_code      TEXT,
  distance_km     REAL,
  cost_per_term   REAL NOT NULL,
  cost_per_month  REAL,
  driver_name     TEXT,
  driver_phone    TEXT,
  vehicle_reg     TEXT,
  vehicle_capacity INTEGER,
  current_students INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS transport_stages (
  id              TEXT PRIMARY KEY,
  route_id        TEXT NOT NULL REFERENCES transport_routes(id),
  stage_name      TEXT NOT NULL,
  distance_km     REAL,
  pickup_time     TEXT,
  dropoff_time    TEXT,
  cost_override   REAL,
  sort_order      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_transport_assignments (
  id              TEXT PRIMARY KEY,
  student_id      TEXT NOT NULL REFERENCES students(id),
  route_id        TEXT NOT NULL REFERENCES transport_routes(id),
  stage_id        TEXT REFERENCES transport_stages(id),
  term_id         TEXT REFERENCES terms(id),
  direction       TEXT DEFAULT 'both' CHECK(direction IN ('to_school','from_school','both')),
  status          TEXT DEFAULT 'active',
  assigned_date   TEXT DEFAULT (date('now')),
  assigned_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS transport_fee_overrides (
  id              TEXT PRIMARY KEY,
  student_id      TEXT NOT NULL REFERENCES students(id),
  route_id        TEXT NOT NULL REFERENCES transport_routes(id),
  term_id         TEXT REFERENCES terms(id),
  override_amount REAL NOT NULL,
  reason          TEXT,
  approved_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- G. INVENTORY (School Store)
-- ============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  contact_person  TEXT,
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  tax_id          TEXT,
  bank_name       TEXT,
  bank_account    TEXT,
  payment_terms   INTEGER DEFAULT 30,
  credit_limit    REAL,
  rating          INTEGER,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  deleted_at      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  name            TEXT NOT NULL,
  sku             TEXT,
  category        TEXT NOT NULL,
  unit_of_measure TEXT DEFAULT 'piece',
  unit_cost       REAL NOT NULL,
  selling_price   REAL,
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_level   INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  supplier_id     TEXT REFERENCES suppliers(id),
  location        TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS stock_receipts (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  item_id         TEXT NOT NULL REFERENCES inventory_items(id),
  supplier_id     TEXT REFERENCES suppliers(id),
  quantity        INTEGER NOT NULL,
  unit_cost       REAL NOT NULL,
  total_cost      REAL NOT NULL,
  receipt_date    TEXT NOT NULL,
  reference_no    TEXT,
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  item_id         TEXT NOT NULL REFERENCES inventory_items(id),
  adjustment_type TEXT NOT NULL CHECK(adjustment_type IN ('increase','decrease','damage','expired','correction')),
  quantity        INTEGER NOT NULL,
  reason          TEXT NOT NULL,
  approved_by     TEXT,
  adjustment_date TEXT DEFAULT (date('now')),
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS student_issues (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  item_id         TEXT NOT NULL REFERENCES inventory_items(id),
  quantity        INTEGER NOT NULL,
  unit_cost       REAL NOT NULL,
  total_cost      REAL NOT NULL,
  issue_date      TEXT NOT NULL,
  term_id         TEXT REFERENCES terms(id),
  invoiced        INTEGER DEFAULT 0,
  invoice_id      TEXT REFERENCES invoices(id),
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS student_returns (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  issue_id        TEXT NOT NULL REFERENCES student_issues(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  item_id         TEXT NOT NULL REFERENCES inventory_items(id),
  quantity        INTEGER NOT NULL,
  reason          TEXT,
  return_date     TEXT DEFAULT (date('now')),
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS reorder_requests (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  item_id         TEXT NOT NULL REFERENCES inventory_items(id),
  supplier_id     TEXT REFERENCES suppliers(id),
  quantity        INTEGER NOT NULL,
  estimated_cost  REAL,
  urgency         TEXT DEFAULT 'normal',
  status          TEXT DEFAULT 'pending',
  approved_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- H. KITCHEN INVENTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS kitchen_items (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  unit_of_measure TEXT NOT NULL,
  unit_cost       REAL NOT NULL,
  quantity_on_hand REAL DEFAULT 0,
  min_stock_level REAL DEFAULT 0,
  supplier_id     TEXT REFERENCES suppliers(id),
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS kitchen_stock_receipts (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  item_id         TEXT NOT NULL REFERENCES kitchen_items(id),
  supplier_id     TEXT REFERENCES suppliers(id),
  quantity        REAL NOT NULL,
  unit_cost       REAL NOT NULL,
  total_cost      REAL NOT NULL,
  receipt_date    TEXT NOT NULL,
  delivery_note   TEXT,
  quality_check   TEXT DEFAULT 'passed',
  received_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS kitchen_requisitions (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  requisition_no  TEXT NOT NULL,
  requested_by    TEXT NOT NULL,
  request_date    TEXT NOT NULL,
  purpose         TEXT,
  status          TEXT DEFAULT 'pending',
  approved_by     TEXT,
  approved_at     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS kitchen_stock_issues (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  requisition_id  TEXT REFERENCES kitchen_requisitions(id),
  item_id         TEXT NOT NULL REFERENCES kitchen_items(id),
  quantity        REAL NOT NULL,
  unit_cost       REAL NOT NULL,
  issue_date      TEXT NOT NULL,
  issued_by       TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS kitchen_consumption_logs (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  item_id         TEXT NOT NULL REFERENCES kitchen_items(id),
  quantity_used   REAL NOT NULL,
  meal_type       TEXT CHECK(meal_type IN ('breakfast','lunch','dinner','snack')),
  consumption_date TEXT NOT NULL,
  servings        INTEGER,
  cost_per_serving REAL,
  logged_by       TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS kitchen_returns (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  item_id         TEXT NOT NULL REFERENCES kitchen_items(id),
  quantity        REAL NOT NULL,
  reason          TEXT,
  return_date     TEXT DEFAULT (date('now')),
  created_by      TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS kitchen_wastage (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  item_id         TEXT NOT NULL REFERENCES kitchen_items(id),
  quantity        REAL NOT NULL,
  reason          TEXT NOT NULL,
  wastage_date    TEXT NOT NULL,
  cost            REAL,
  reported_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS kitchen_stock_counts (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  count_date      TEXT NOT NULL,
  status          TEXT DEFAULT 'in_progress',
  counted_by      TEXT,
  verified_by     TEXT,
  total_items     INTEGER DEFAULT 0,
  discrepancies   INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS kitchen_menu_plans (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  week_start      TEXT NOT NULL,
  week_end        TEXT NOT NULL,
  day_of_week     INTEGER NOT NULL,
  meal_type       TEXT NOT NULL,
  menu_items      TEXT,
  estimated_cost  REAL,
  actual_cost     REAL,
  servings        INTEGER,
  status          TEXT DEFAULT 'planned',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS kitchen_budget_lines (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  budget_id       TEXT REFERENCES budgets(id),
  category        TEXT NOT NULL,
  period          TEXT NOT NULL,
  budgeted        REAL NOT NULL,
  actual          REAL DEFAULT 0,
  variance        REAL DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS kitchen_stock_adjustments (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  item_id         TEXT NOT NULL REFERENCES kitchen_items(id),
  adjustment_type TEXT NOT NULL,
  quantity        REAL NOT NULL,
  reason          TEXT NOT NULL,
  adjusted_by     TEXT,
  adjustment_date TEXT DEFAULT (date('now')),
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- I. SCHOLARSHIP / SPONSOR
-- ============================================================================
CREATE TABLE IF NOT EXISTS sponsors (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  type            TEXT DEFAULT 'individual',
  contact_person  TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  total_committed REAL DEFAULT 0,
  total_disbursed REAL DEFAULT 0,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS scholarships (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  sponsor_id      TEXT REFERENCES sponsors(id),
  name            TEXT NOT NULL,
  type            TEXT DEFAULT 'full',
  coverage_pct    REAL DEFAULT 100,
  max_amount      REAL,
  max_students    INTEGER,
  current_students INTEGER DEFAULT 0,
  academic_year_id TEXT REFERENCES academic_years(id),
  criteria        TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS bursary_applications (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  scholarship_id  TEXT REFERENCES scholarships(id),
  amount_requested REAL NOT NULL,
  amount_approved REAL,
  justification   TEXT,
  family_income   REAL,
  academic_merit  TEXT,
  status          TEXT DEFAULT 'submitted',
  reviewed_by     TEXT,
  reviewed_at     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS scholarship_renewals (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  scholarship_id  TEXT NOT NULL REFERENCES scholarships(id),
  student_id      TEXT NOT NULL REFERENCES students(id),
  academic_year_id TEXT REFERENCES academic_years(id),
  previous_amount REAL,
  renewed_amount  REAL,
  performance_gpa REAL,
  status          TEXT DEFAULT 'pending',
  reviewed_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- J. ACCOUNTING
-- ============================================================================
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  code            TEXT NOT NULL,
  name            TEXT NOT NULL,
  account_type    TEXT NOT NULL CHECK(account_type IN ('asset','liability','equity','revenue','expense')),
  parent_id       TEXT REFERENCES chart_of_accounts(id),
  department_id   TEXT REFERENCES departments(id),
  cost_center_id  TEXT REFERENCES cost_centers(id),
  description     TEXT,
  is_header       INTEGER DEFAULT 0,
  is_active       INTEGER DEFAULT 1,
  normal_balance  TEXT CHECK(normal_balance IN ('debit','credit')),
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local',
  UNIQUE(institution_id, code)
);

CREATE TABLE IF NOT EXISTS opening_balances (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  account_id      TEXT NOT NULL REFERENCES chart_of_accounts(id),
  fiscal_year_id  TEXT REFERENCES academic_years(id),
  debit_amount    REAL DEFAULT 0,
  credit_amount   REAL DEFAULT 0,
  effective_date  TEXT NOT NULL,
  entered_by      TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS journals (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  journal_number  TEXT NOT NULL,
  journal_date    TEXT NOT NULL,
  description     TEXT NOT NULL,
  reference       TEXT,
  source_type     TEXT,
  source_id       TEXT,
  period_id       TEXT REFERENCES accounting_periods(id),
  total_debit     REAL NOT NULL,
  total_credit    REAL NOT NULL,
  status          TEXT DEFAULT 'draft' CHECK(status IN ('draft','submitted','approved','posted','reversed')),
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS journal_lines (
  id              TEXT PRIMARY KEY,
  journal_id      TEXT NOT NULL REFERENCES journals(id),
  account_id      TEXT NOT NULL REFERENCES chart_of_accounts(id),
  debit_amount    REAL DEFAULT 0,
  credit_amount   REAL DEFAULT 0,
  description     TEXT,
  cost_center_id  TEXT REFERENCES cost_centers(id),
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS journal_approvals (
  id              TEXT PRIMARY KEY,
  journal_id      TEXT NOT NULL REFERENCES journals(id),
  approver_id     TEXT NOT NULL,
  action          TEXT NOT NULL CHECK(action IN ('approve','reject','return')),
  comments        TEXT,
  approved_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS journal_postings (
  id              TEXT PRIMARY KEY,
  journal_id      TEXT NOT NULL REFERENCES journals(id),
  posted_by       TEXT NOT NULL,
  posted_at       TEXT DEFAULT (datetime('now')),
  period_id       TEXT REFERENCES accounting_periods(id),
  reversed        INTEGER DEFAULT 0,
  reversal_id     TEXT REFERENCES journals(id)
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  account_name    TEXT NOT NULL,
  account_number  TEXT NOT NULL,
  bank_name       TEXT NOT NULL,
  branch          TEXT,
  currency        TEXT DEFAULT 'UGX',
  gl_account_id   TEXT REFERENCES chart_of_accounts(id),
  opening_balance REAL DEFAULT 0,
  current_balance REAL DEFAULT 0,
  is_active       INTEGER DEFAULT 1,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS bank_statements (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  bank_account_id TEXT NOT NULL REFERENCES bank_accounts(id),
  statement_date  TEXT NOT NULL,
  opening_balance REAL NOT NULL,
  closing_balance REAL NOT NULL,
  file_name       TEXT,
  imported_at     TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS bank_statement_lines (
  id              TEXT PRIMARY KEY,
  statement_id    TEXT NOT NULL REFERENCES bank_statements(id),
  transaction_date TEXT NOT NULL,
  description     TEXT NOT NULL,
  reference       TEXT,
  debit_amount    REAL DEFAULT 0,
  credit_amount   REAL DEFAULT 0,
  balance         REAL,
  matched         INTEGER DEFAULT 0,
  matched_payment_id TEXT REFERENCES payments(id),
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  bank_account_id TEXT NOT NULL REFERENCES bank_accounts(id),
  reconciliation_date TEXT NOT NULL,
  statement_balance REAL NOT NULL,
  book_balance    REAL NOT NULL,
  difference      REAL DEFAULT 0,
  status          TEXT DEFAULT 'in_progress',
  reconciled_by   TEXT,
  completed_at    TEXT,
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS bank_transfers (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  from_account_id TEXT NOT NULL REFERENCES bank_accounts(id),
  to_account_id   TEXT NOT NULL REFERENCES bank_accounts(id),
  amount          REAL NOT NULL,
  transfer_date   TEXT NOT NULL,
  reference       TEXT,
  journal_id      TEXT REFERENCES journals(id),
  status          TEXT DEFAULT 'pending',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS accounting_periods (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  start_date      TEXT NOT NULL,
  end_date        TEXT NOT NULL,
  status          TEXT DEFAULT 'open' CHECK(status IN ('open','soft_closed','hard_closed')),
  closed_by       TEXT,
  closed_at       TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- K. EXPENSES / PROCUREMENT
-- ============================================================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  code            TEXT,
  gl_account_id   TEXT REFERENCES chart_of_accounts(id),
  budget_category TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS expense_requests (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  category_id     TEXT REFERENCES expense_categories(id),
  request_number  TEXT NOT NULL,
  description     TEXT NOT NULL,
  amount          REAL NOT NULL,
  requested_by    TEXT NOT NULL,
  department_id   TEXT REFERENCES departments(id),
  urgency         TEXT DEFAULT 'normal',
  status          TEXT DEFAULT 'draft',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS expense_approvals (
  id              TEXT PRIMARY KEY,
  expense_id      TEXT NOT NULL REFERENCES expense_requests(id),
  approver_id     TEXT NOT NULL,
  action          TEXT NOT NULL,
  comments        TEXT,
  approved_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchase_requests (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  request_number  TEXT NOT NULL,
  requested_by    TEXT NOT NULL,
  department_id   TEXT REFERENCES departments(id),
  description     TEXT,
  total_amount    REAL DEFAULT 0,
  status          TEXT DEFAULT 'draft',
  approved_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  supplier_id     TEXT NOT NULL REFERENCES suppliers(id),
  po_number       TEXT NOT NULL,
  order_date      TEXT NOT NULL,
  delivery_date   TEXT,
  total_amount    REAL NOT NULL,
  status          TEXT DEFAULT 'draft',
  approved_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS goods_receipts (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  po_id           TEXT REFERENCES purchase_orders(id),
  supplier_id     TEXT NOT NULL REFERENCES suppliers(id),
  receipt_date    TEXT NOT NULL,
  receipt_number  TEXT NOT NULL,
  total_amount    REAL NOT NULL,
  status          TEXT DEFAULT 'received',
  received_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS supplier_invoices (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  supplier_id     TEXT NOT NULL REFERENCES suppliers(id),
  invoice_number  TEXT NOT NULL,
  invoice_date    TEXT NOT NULL,
  due_date        TEXT NOT NULL,
  total_amount    REAL NOT NULL,
  tax_amount      REAL DEFAULT 0,
  paid_amount     REAL DEFAULT 0,
  balance         REAL NOT NULL,
  po_id           TEXT REFERENCES purchase_orders(id),
  journal_id      TEXT REFERENCES journals(id),
  status          TEXT DEFAULT 'draft' CHECK(status IN ('draft','approved','partially_paid','paid','cancelled')),
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS expense_payments (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  supplier_invoice_id TEXT REFERENCES supplier_invoices(id),
  supplier_id     TEXT NOT NULL REFERENCES suppliers(id),
  amount          REAL NOT NULL,
  payment_date    TEXT NOT NULL,
  payment_method  TEXT NOT NULL,
  reference_no    TEXT,
  bank_account_id TEXT REFERENCES bank_accounts(id),
  journal_id      TEXT REFERENCES journals(id),
  status          TEXT DEFAULT 'pending',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- L. BUDGETS
-- ============================================================================
CREATE TABLE IF NOT EXISTS budget_categories (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  code            TEXT,
  parent_id       TEXT REFERENCES budget_categories(id),
  sort_order      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS budget_item_groups (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  category_id     TEXT NOT NULL REFERENCES budget_categories(id),
  name            TEXT NOT NULL,
  code            TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS budget_items (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  group_id        TEXT NOT NULL REFERENCES budget_item_groups(id),
  name            TEXT NOT NULL,
  code            TEXT,
  gl_account_id   TEXT REFERENCES chart_of_accounts(id),
  default_amount  REAL DEFAULT 0,
  frequency       TEXT DEFAULT 'annual',
  priority        TEXT DEFAULT 'essential',
  sort_order      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS budget_subitems (
  id              TEXT PRIMARY KEY,
  item_id         TEXT NOT NULL REFERENCES budget_items(id),
  name            TEXT NOT NULL,
  unit_cost       REAL NOT NULL,
  quantity        REAL DEFAULT 1,
  total           REAL NOT NULL,
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budgets (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  academic_year_id TEXT REFERENCES academic_years(id),
  name            TEXT NOT NULL,
  version         INTEGER DEFAULT 1,
  total_amount    REAL DEFAULT 0,
  status          TEXT DEFAULT 'draft' CHECK(status IN ('draft','submitted','under_review','approved','active','closed','returned','revised')),
  approved_by     TEXT,
  approved_at     TEXT,
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS budget_lines (
  id              TEXT PRIMARY KEY,
  budget_id       TEXT NOT NULL REFERENCES budgets(id),
  category_id     TEXT REFERENCES budget_categories(id),
  item_id         TEXT REFERENCES budget_items(id),
  gl_account_id   TEXT REFERENCES chart_of_accounts(id),
  period          TEXT NOT NULL,
  description     TEXT,
  budgeted_amount REAL NOT NULL,
  revised_amount  REAL,
  actual_amount   REAL DEFAULT 0,
  variance        REAL DEFAULT 0,
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS budget_submissions (
  id              TEXT PRIMARY KEY,
  budget_id       TEXT NOT NULL REFERENCES budgets(id),
  submitted_by    TEXT NOT NULL,
  submitted_at    TEXT DEFAULT (datetime('now')),
  version         INTEGER NOT NULL,
  notes           TEXT,
  status          TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS budget_approvals (
  id              TEXT PRIMARY KEY,
  budget_id       TEXT NOT NULL REFERENCES budgets(id),
  approver_id     TEXT NOT NULL,
  action          TEXT NOT NULL,
  comments        TEXT,
  approved_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budget_revisions (
  id              TEXT PRIMARY KEY,
  budget_id       TEXT NOT NULL REFERENCES budgets(id),
  line_id         TEXT REFERENCES budget_lines(id),
  previous_amount REAL NOT NULL,
  new_amount      REAL NOT NULL,
  reason          TEXT NOT NULL,
  approved_by     TEXT,
  revision_date   TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS supplementary_budgets (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  original_budget_id TEXT NOT NULL REFERENCES budgets(id),
  name            TEXT NOT NULL,
  amount          REAL NOT NULL,
  justification   TEXT NOT NULL,
  status          TEXT DEFAULT 'draft',
  approved_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS budget_exception_approvals (
  id              TEXT PRIMARY KEY,
  budget_id       TEXT NOT NULL REFERENCES budgets(id),
  line_id         TEXT REFERENCES budget_lines(id),
  exception_type  TEXT NOT NULL,
  amount          REAL NOT NULL,
  reason          TEXT NOT NULL,
  requested_by    TEXT NOT NULL,
  approved_by     TEXT,
  status          TEXT DEFAULT 'pending',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- M. PAYROLL
-- ============================================================================
CREATE TABLE IF NOT EXISTS employees (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  user_id         TEXT REFERENCES users(id),
  employee_number TEXT NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  department_id   TEXT REFERENCES departments(id),
  department      TEXT,
  position        TEXT NOT NULL,
  hire_date       TEXT NOT NULL,
  termination_date TEXT,
  bank_name       TEXT,
  bank_account    TEXT,
  bank_branch     TEXT,
  tax_id          TEXT,
  social_security_no TEXT,
  basic_salary    REAL NOT NULL,
  gross_salary    REAL NOT NULL,
  status          TEXT DEFAULT 'active' CHECK(status IN ('active','on_leave','terminated','suspended')),
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT,
  created_by      TEXT,
  deleted_at      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS payroll_periods (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  start_date      TEXT NOT NULL,
  end_date        TEXT NOT NULL,
  pay_date        TEXT NOT NULL,
  status          TEXT DEFAULT 'open',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS earnings_deductions (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  code            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK(type IN ('earning','deduction')),
  category        TEXT,
  is_statutory    INTEGER DEFAULT 0,
  is_percentage   INTEGER DEFAULT 0,
  default_value   REAL DEFAULT 0,
  max_amount      REAL,
  gl_account_id   TEXT REFERENCES chart_of_accounts(id),
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS payroll_adjustments (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  employee_id     TEXT NOT NULL REFERENCES employees(id),
  earning_deduction_id TEXT REFERENCES earnings_deductions(id),
  type            TEXT NOT NULL CHECK(type IN ('earning','deduction')),
  amount          REAL NOT NULL,
  effective_from  TEXT NOT NULL,
  effective_to    TEXT,
  reason          TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  period_id       TEXT REFERENCES payroll_periods(id),
  pay_period      TEXT NOT NULL,
  run_date        TEXT NOT NULL,
  total_gross     REAL DEFAULT 0,
  total_deductions REAL DEFAULT 0,
  total_net       REAL DEFAULT 0,
  employee_count  INTEGER DEFAULT 0,
  journal_id      TEXT REFERENCES journals(id),
  status          TEXT DEFAULT 'draft' CHECK(status IN ('draft','calculated','approved','posted','reversed')),
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  approved_by     TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS payroll_run_items (
  id              TEXT PRIMARY KEY,
  run_id          TEXT NOT NULL REFERENCES payroll_runs(id),
  employee_id     TEXT NOT NULL REFERENCES employees(id),
  basic_salary    REAL NOT NULL,
  total_earnings  REAL DEFAULT 0,
  gross_salary    REAL NOT NULL,
  paye            REAL DEFAULT 0,
  nssf            REAL DEFAULT 0,
  other_deductions REAL DEFAULT 0,
  total_deductions REAL DEFAULT 0,
  net_salary      REAL NOT NULL,
  created_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(run_id, employee_id)
);

CREATE TABLE IF NOT EXISTS payroll_approvals (
  id              TEXT PRIMARY KEY,
  run_id          TEXT NOT NULL REFERENCES payroll_runs(id),
  approver_id     TEXT NOT NULL,
  action          TEXT NOT NULL,
  comments        TEXT,
  approved_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payslip_batches (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  run_id          TEXT NOT NULL REFERENCES payroll_runs(id),
  generated_at    TEXT DEFAULT (datetime('now')),
  employee_count  INTEGER NOT NULL,
  delivery_method TEXT DEFAULT 'email',
  status          TEXT DEFAULT 'generated',
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS final_dues (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  employee_id     TEXT NOT NULL REFERENCES employees(id),
  termination_date TEXT NOT NULL,
  basic_due       REAL DEFAULT 0,
  leave_encashment REAL DEFAULT 0,
  gratuity        REAL DEFAULT 0,
  deductions      REAL DEFAULT 0,
  net_due         REAL NOT NULL,
  status          TEXT DEFAULT 'calculated',
  approved_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- FIXED ASSETS
-- ============================================================================
CREATE TABLE IF NOT EXISTS asset_categories (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  name            TEXT NOT NULL,
  depreciation_method TEXT DEFAULT 'straight_line',
  useful_life_months INTEGER NOT NULL,
  residual_pct    REAL DEFAULT 0,
  asset_account_id TEXT REFERENCES chart_of_accounts(id),
  depreciation_account_id TEXT REFERENCES chart_of_accounts(id),
  accum_depr_account_id TEXT REFERENCES chart_of_accounts(id),
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS fixed_assets (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  campus_id       TEXT REFERENCES campuses(id),
  asset_number    TEXT NOT NULL,
  description     TEXT NOT NULL,
  category_id     TEXT NOT NULL REFERENCES asset_categories(id),
  acquisition_date TEXT NOT NULL,
  acquisition_cost REAL NOT NULL,
  residual_value  REAL DEFAULT 0,
  useful_life_months INTEGER NOT NULL,
  depreciation_method TEXT DEFAULT 'straight_line',
  accumulated_depr REAL DEFAULT 0,
  net_book_value  REAL NOT NULL,
  location        TEXT,
  serial_number   TEXT,
  status          TEXT DEFAULT 'active' CHECK(status IN ('active','disposed','written_off','fully_depreciated')),
  disposed_date   TEXT,
  disposal_proceeds REAL,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local',
  sync_version    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS depreciation_runs (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  asset_id        TEXT NOT NULL REFERENCES fixed_assets(id),
  period          TEXT NOT NULL,
  amount          REAL NOT NULL,
  accumulated     REAL NOT NULL,
  net_book_value  REAL NOT NULL,
  journal_id      TEXT REFERENCES journals(id),
  posted_at       TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local',
  UNIQUE(asset_id, period)
);

-- ============================================================================
-- TREASURY
-- ============================================================================
CREATE TABLE IF NOT EXISTS cash_forecasts (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  forecast_date   TEXT NOT NULL,
  category        TEXT NOT NULL,
  description     TEXT,
  projected       REAL NOT NULL,
  actual          REAL,
  variance        REAL,
  created_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- N. AUDIT / CONTROL
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_events (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       TEXT,
  user_id         TEXT,
  user_name       TEXT,
  details         TEXT,
  old_value       TEXT,
  new_value       TEXT,
  ip_address      TEXT,
  risk_level      TEXT DEFAULT 'low' CHECK(risk_level IN ('low','medium','high','critical')),
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS backdated_approvals (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  entity_type     TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  original_date   TEXT NOT NULL,
  backdated_to    TEXT NOT NULL,
  reason          TEXT NOT NULL,
  approved_by     TEXT,
  status          TEXT DEFAULT 'pending',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS suspicious_transactions (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  entity_type     TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  reason          TEXT NOT NULL,
  risk_score      INTEGER DEFAULT 0,
  flagged_by      TEXT DEFAULT 'system',
  reviewed_by     TEXT,
  status          TEXT DEFAULT 'flagged',
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS permission_changes (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  user_id         TEXT NOT NULL,
  changed_by      TEXT NOT NULL,
  old_role        TEXT,
  new_role        TEXT,
  old_permissions TEXT,
  new_permissions TEXT,
  reason          TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exception_reviews (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  exception_type  TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       TEXT,
  description     TEXT NOT NULL,
  requested_by    TEXT NOT NULL,
  reviewed_by     TEXT,
  status          TEXT DEFAULT 'pending',
  resolution      TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  sync_status     TEXT DEFAULT 'local'
);

-- ============================================================================
-- O. SYNC / OFFLINE CONTROL
-- ============================================================================
CREATE TABLE IF NOT EXISTS devices (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  device_name     TEXT NOT NULL,
  device_type     TEXT,
  os_info         TEXT,
  last_seen       TEXT,
  is_active       INTEGER DEFAULT 1,
  registered_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sync_status (
  id              TEXT PRIMARY KEY,
  device_id       TEXT NOT NULL REFERENCES devices(id),
  table_name      TEXT NOT NULL,
  last_synced_at  TEXT,
  local_version   INTEGER DEFAULT 0,
  server_version  INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'idle',
  UNIQUE(device_id, table_name)
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id              TEXT PRIMARY KEY,
  table_name      TEXT NOT NULL,
  record_id       TEXT NOT NULL,
  operation       TEXT NOT NULL CHECK(operation IN ('insert','update','delete')),
  payload         TEXT,
  queued_at       TEXT DEFAULT (datetime('now')),
  retry_count     INTEGER DEFAULT 0,
  last_retry      TEXT,
  error_message   TEXT,
  status          TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS sync_conflicts (
  id              TEXT PRIMARY KEY,
  table_name      TEXT NOT NULL,
  record_id       TEXT NOT NULL,
  local_data      TEXT,
  remote_data     TEXT,
  conflict_type   TEXT DEFAULT 'data_mismatch',
  resolution      TEXT,
  resolved_by     TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  resolved_at     TEXT
);

CREATE TABLE IF NOT EXISTS backup_schedules (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  schedule_type   TEXT DEFAULT 'daily',
  last_backup     TEXT,
  next_backup     TEXT,
  backup_location TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS restore_requests (
  id              TEXT PRIMARY KEY,
  institution_id  TEXT NOT NULL REFERENCES institutions(id),
  backup_date     TEXT NOT NULL,
  requested_by    TEXT NOT NULL,
  reason          TEXT NOT NULL,
  status          TEXT DEFAULT 'pending',
  completed_at    TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_institution ON students(institution_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_admission ON students(admission_no);
CREATE INDEX IF NOT EXISTS idx_guardians_institution ON guardians(institution_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_receipts_payment ON receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON journals(journal_date);
CREATE INDEX IF NOT EXISTS idx_journals_status ON journals(status);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_employees_institution ON employees(institution_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON payroll_runs(pay_period);
CREATE INDEX IF NOT EXISTS idx_suppliers_institution ON suppliers(institution_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_supplier ON supplier_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_budget_lines_budget ON budget_lines(budget_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_category ON fixed_assets(category_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_followups_student ON collection_followups(student_id);
CREATE INDEX IF NOT EXISTS idx_transport_assignments_student ON student_transport_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_kitchen_items_category ON kitchen_items(category);
CREATE INDEX IF NOT EXISTS idx_bursary_applications_student ON bursary_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(institution_id, code);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
`;

/** Run the schema on the given database */
export function applySchema(db: import('sql.js').Database): void {
  db.run(SCHEMA_SQL);

  // Record schema version
  const existing = db.exec("SELECT version FROM schema_version WHERE version = " + SCHEMA_VERSION);
  if (!existing.length || !existing[0].values.length) {
    db.run(
      "INSERT OR IGNORE INTO schema_version (version, migration_name) VALUES (?, ?)",
      [SCHEMA_VERSION, 'initial_schema_v1']
    );
  }
}
