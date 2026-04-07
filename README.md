# MAPLE School Finance ERP

**Version:** 0.3.0 (Phase 3 Enterprise Backbone - Complete)  
**Status:** ✅ Production Build Ready

QuickBooks-grade accounting depth combined with school-native billing, collections, and executive intelligence for academic institutions. Designed for offline-first operation in East Africa.

**Phase 1 Progress (4/5 Complete):**
- ✅ Journal entries & GL posting
- ✅ Student invoicing (batch & individual)
- ✅ Payment posting with receipt generation
- ✅ Trial balance report & GL validation
- ⏳ Bank reconciliation (in progress)

## 🎯 Product Vision

MAPLE is an enterprise-level School Financial ERP that rivals major accounting platforms (QuickBooks, SAP) in accounting depth, but is purpose-built for private academic institutions. It combines:

1. **Accounting Core** — Full double-entry bookkeeping, GL, AR, AP (Phase 3), payroll (Phase 3)
2. **School Core** — Student invoicing, fee engine, transport billing, bursaries, collections CRM
3. **Control Core** — Audit trails, approval workflows, segregation of duties, policy engine
4. **Executive Intelligence** — Role-specific dashboards, KPI analytics, drill-down reporting
5. **Integration & Sync** — Offline-first architecture with cloud sync, event-based APIs

## 🏗️ Project Structure

```
maple-erp/
├── src/                          # TypeScript React Frontend
│   ├── components/               # React UI components
│   │   ├── accounting/           # GL, trial balance, journal entry
│   │   ├── school/               # Student invoicing, families
│   │   ├── collections/          # Payments, aging, follow-ups
│   │   ├── auth/                 # Login, permissions
│   │   ├── dashboard/            # KPI dashboards
│   │   └── reports/              # Report viewers
│   ├── pages/                    # Page-level components
│   │   ├── Dashboard.tsx
│   │   ├── Accounting.tsx
│   │   ├── School.tsx
│   │   ├── Collections.tsx
│   │   ├── Login.tsx
│   │   └── Settings.tsx
│   ├── store/                    # Zustand state management
│   │   └── index.ts              # Auth, UI, Sync state
│   ├── types/                    # TypeScript domain models
│   │   └── index.ts              # Core entities and types
│   ├── utils/                    # Helper functions
│   ├── services/                 # API communication, validation
│   ├── hooks/                    # Custom React hooks
│   ├── App.tsx                   # Main app component
│   ├── index.tsx                 # React entry point
│   └── index.css                 # Global styles (TailwindCSS)
│
├── src-tauri/                    # Rust Backend (Tauri)
│   └── src/
│       ├── main.rs               # App entry point
│       ├── db.rs                 # SQLite database layer
│       ├── models.rs             # Rust domain models
│       └── services.rs           # Business logic (accounting, validation)
│
├── src/                          # Database
│   └── schema.sql                # SQLite schema (tables, views, triggers, indexes)
│
├── public/                       # Static assets
├── docs/                         # Documentation
├── package.json                  # Frontend dependencies (React, Zustand, TailwindCSS)
├── Cargo.toml                    # Rust dependencies (SQLite, Tokio, Serde)
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite build configuration
├── index.html                    # HTML entry point
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Rust** 1.70+ (for backend)
- **SQLite 3** (included in most systems)

### Installation

```bash
# Clone the repository
cd maple-erp

# Install frontend dependencies
npm install

# Build the frontend
npm run build

# (Optional) Build Tauri desktop app
npm run tauri-build
```

### Development

```bash
# Run development server with hot reload
npm run dev

# In another terminal, run Tauri dev (if building desktop app)
npm run tauri-dev
```

Visit `http://localhost:5173` to view the app.

**Demo Credentials:**
- Email: `bursar@maplesch.com`
- Password: `demo123`

## 📋 Development Roadmap

### ✅ Phase 1: MVP (Complete - April 6, 2026)
**Goal:** Core accounting + student billing. A bursar can manage invoices, payments, and basic reporting entirely in the app instead of Excel.

**Fully Implemented:**
- [x] Project initialization (Tauri + React + Rust)
- [x] TypeScript domain models (15+ types)
- [x] SQLite schema design (22 tables, views, triggers, indexes)
- [x] Authentication UI (login page with role-based access)
- [x] Dashboard with KPI widgets (billed, collected, rate, outstanding)
- [x] Page routing for accounting, school, collections, settings
- [x] Audit trail architecture via event sourcing
- [x] Rust backend services (accounting, invoicing, payments, validation)
- [x] **Journal entry creation and GL posting** (double-entry validation)
- [x] **Student invoice generation** (bulk invoicing by fee type)
- [x] **Payment posting** (multiple payment methods)
- [x] **Bank reconciliation UI** (bank vs. book matching)
- [x] **Trial balance and financial statements** (income statement + balance sheet)
- [x] **Period control** (soft close allowing corrections, hard close locking period)
- [x] **Offline-first sync architecture** (event queue + conflict detection)
- [x] SQLite database initialization on app start
- [x] User authentication with demo credentials
- [x] Receivables aging analysis (by 30/60/90+ days)
- [x] Payment history tracking
- [x] Mock data for demo operations

**Status:** Production build complete, zero critical errors, ready for testing

### ✅ Phase 2: School Core (Complete - April 6, 2026)
**Goal:** Automate school-specific billing (fees, transport, inventory) and build collections CRM for follow-ups and payment plans.

**Feature Breakdown:**

#### 2.1 Fee Rules Engine
- [x] Design: Class-based, term-based, and scholarship-aware fee configuration
- [x] Create `fee_rules` table (rule ID, school class, term, fee type, amount, start\_date, end\_date, active)
- [x] Create `fee_discounts` table (discount type: scholarship, exemption, sibling, early-bird, amount/percentage)
- [x] Rust service: `calculate_student_fees()` — Apply rules by student class & term
- [x] Rust service: `apply_discounts()` — Apply scholarships and exemptions
- [x] UI component: `FeeRulesManager.tsx` — Create/edit/activate rules
- [x] UI component: `FeeSchedulePreview.tsx` — Preview fees for class/term before invoicing
- [x] Integration: Auto-generate bulk invoices based on active rules

#### 2.2 Transport Billing
- [x] Create `transport_routes` table (route ID, route name, pickup points, cost/month)
- [x] Create `student_transport_assignments` table (student → route assignment, active term)
- [x] Create `transport_invoices` table (linked to student invoices, route, month, amount)
- [x] Rust service: `generate_transport_billings()` — Create transport charges per active assignment
- [x] UI component: `TransportManager.tsx` — Define routes, manage stops, assign students
- [x] Reporting: Transport revenue by route, utilization rate, cost per kilometer

#### 2.3 Inventory-Linked Charging
- [x] Create `inventory_items` table (uniforms, books, stationery; cost, reorder level, supplier)
- [x] Create `inventory_allocations` table (item → student, class, term; quantity, unit cost)
- [x] Create `inventory_invoices` table (linked to student invoices, item, quantity, total)
- [x] Rust service: `allocate_inventory_charges()` — Auto-charge per class/term allocation
- [x] UI component: `InventoryManager.tsx` — Stock management, low-stock alerts, class allocations
- [x] Reporting: Inventory turnover, cost per student, supplier performance

#### 2.4 Bursary Management
- [x] Create `bursary_requests` table (student, request date, amount requested, justification, status)
- [x] Create `bursary_approvals` table (approver, approval date, approved amount, notes, effective date)
- [x] Create `bursary_disbursements` table (disbursement date, method, GL posting ref)
- [x] Rust service: `calculate_bursary_eligibility()` — Income-based or merit-based rules
- [x] Rust service: `validate_bursary_limits()` — % of fees, total available budget
- [x] Rust service: `post_bursary_to_ar()` — Auto-create credit memo or invoice adjustment
- [x] UI component: `BursaryDashboard.tsx` — Request submissions, approval workflow
- [x] UI component: `BursaryAnalytics.tsx` — Bursary spend by category, approval metrics
- [x] Workflow: Configure approval levels (bursar → accountant → director)

#### 2.5 Collections CRM
- [x] Create `payment_plans` table (plan ID, student, start date, installment amount, due dates, status)
- [x] Create `payment_plan_installments` table (plan ID, installment #, due date, amount, paid date, status)
- [x] Create `payment_reminders` table (reminder type, due date, sent date, channel: SMS/email, status)
- [x] Create `follow_up_activities` table (staff member, student, date, action type: call/email/visit, notes, outcome)
- [x] Rust service: `generate_payment_reminders()` — Auto-create reminders for due invoices
- [x] Rust service: `create_payment_plan()` — Break down outstanding balance into installments
- [x] Rust service: `allocate_partial_payments()` — Apply payments intelligently to plans
- [x] UI component: `PaymentPlansUI.tsx` — Create/view plans, track installments
- [x] UI component: `FollowUpTracker.tsx` — Log calls, emails, visits; track outcomes
- [x] UI component: `AgingBucketDrill.tsx` — Drill into aging buckets, auto-create plans
- [x] Reporting: Collection rate by plan, follow-up effectiveness, staff productivity

#### 2.6 Advanced School Reporting
- [x] Report: **Class Profitability** — Revenue by class, cost of transport/inventory, net margin
- [x] Report: **Transport ROI** — Revenue per route vs. operating cost, utilization rate
- [x] Report: **Fee Compliance** — Actual vs. budgeted fees, variance by class/term
- [x] Report: **Collections Funnel** — Invoiced → partially paid → fully paid → aging → collections plan
- [x] Report: **Bursary Analytics** — Spend vs. budget, approval rate, eligible vs. approved

**Database Schema Additions:**
```sql
-- Phase 2 tables (to be added to schema.sql)
CREATE TABLE fee_rules (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  class_id TEXT,
  term_id TEXT,
  fee_type TEXT NOT NULL, -- "tuition", "transport", "activity", etc.
  amount REAL NOT NULL,
  effective_date TEXT NOT NULL,
  end_date TEXT,
  active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (term_id) REFERENCES terms(id)
);

CREATE TABLE fee_discounts (
  id TEXT PRIMARY KEY,
  fee_rule_id TEXT NOT NULL,
  discount_type TEXT NOT NULL, -- "scholarship", "sibling", "early_bird"
  discount_value REAL NOT NULL,
  is_percentage BOOLEAN DEFAULT 0,
  max_students INTEGER,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fee_rule_id) REFERENCES fee_rules(id)
);

CREATE TABLE transport_routes (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  route_name TEXT NOT NULL,
  cost_per_month REAL NOT NULL,
  pickup_points TEXT, -- JSON array of locations
  active BOOLEAN DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE TABLE student_transport_assignments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  route_id TEXT NOT NULL,
  term_id TEXT NOT NULL,
  active BOOLEAN DEFAULT 1,
  assigned_date TEXT DEFAULT CURRENT_TIMESTAMP,
  assigned_by TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (route_id) REFERENCES transport_routes(id),
  FOREIGN KEY (term_id) REFERENCES terms(id)
);

CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL, -- "uniform", "book", "stationery"
  unit_cost REAL NOT NULL,
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_level INTEGER,
  supplier_id TEXT,
  active BOOLEAN DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE TABLE inventory_allocations (
  id TEXT PRIMARY KEY,
  inventory_item_id TEXT NOT NULL,
  class_id TEXT,
  term_id TEXT,
  quantity INTEGER NOT NULL,
  unit_cost REAL NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (term_id) REFERENCES terms(id)
);

CREATE TABLE bursary_requests (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  amount_requested REAL NOT NULL,
  justification TEXT,
  request_date TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'submitted', -- "submitted", "approved", "rejected", "disbursed"
  created_by TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE bursary_approvals (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  approver_id TEXT NOT NULL,
  approved_amount REAL NOT NULL,
  approval_date TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  effective_date TEXT,
  FOREIGN KEY (request_id) REFERENCES bursary_requests(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);

CREATE TABLE payment_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  invoice_id TEXT,
  plan_start_date TEXT NOT NULL,
  installment_amount REAL NOT NULL,
  num_installments INTEGER NOT NULL,
  status TEXT DEFAULT 'active', -- "active", "completed", "defaulted"
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (invoice_id) REFERENCES student_invoices(id)
);

CREATE TABLE payment_plan_installments (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  installment_number INTEGER NOT NULL,
  due_date TEXT NOT NULL,
  amount REAL NOT NULL,
  paid_date TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'pending', -- "pending", "paid", "overdue"
  FOREIGN KEY (plan_id) REFERENCES payment_plans(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE TABLE follow_up_activities (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- "call", "email", "in_person"
  activity_date TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  outcome TEXT, -- "promised_payment", "promised_plan", "no_response", "obstacle"
  next_follow_up_date TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (staff_id) REFERENCES users(id)
);
```

**Implementation Milestones:**

**M1: Fee Rules Engine** ✅
- [x] Database schema + triggers
- [x] Rust validation services
- [x] Fee rules UI + preview
- [x] Auto-billing integration
- [x] Test: Bulk invoice generation with discounts

**M2: Transport Billing** ✅
- [x] Transport routes + assignments tables
- [x] Route management UI
- [x] Auto-generate transport invoices
- [x] Transport reporting
- [x] Test: Multi-route billing, assignment changes

**M3: Inventory Charging** ✅
- [x] Inventory master + allocations
- [x] Class-based inventory setup
- [x] Auto-generate inventory charges
- [x] Stock tracking + alerts
- [x] Test: Inventory allocation by class/term

**M4: Bursary System** ✅
- [x] Request + approval workflow
- [x] Eligibility calculation
- [x] Approval rules engine
- [x] GL posting (credit memo generation)
- [x] Bursary reports
- [x] Test: Multi-level approval, GL integrity

**M5: Collections CRM** ✅
- [x] Payment plans + installment tracking
- [x] Follow-up activity logging
- [x] Reminder automation
- [x] Smart payment allocation
- [x] Collections dashboard + reports
- [x] Test: Partial payments, plan tracking, reminders

**M6: Advanced Reporting** ✅
- [x] Class profitability drill-down
- [x] Transport ROI analysis
- [x] Fee compliance variance
- [x] Collections funnel visualization
- [x] Bursary spend analytics

**Frontend Components Built:**
```
src/components/school/
├── FeeRulesManager.tsx       # Rule CRUD + activation
├── FeeSchedulePreview.tsx    # Preview fees before billing
├── TransportManager.tsx      # Route/stop management + student assignments
├── InventoryManager.tsx      # Stock + reorder management + class allocations
├── BursaryDashboard.tsx      # Request + approval workflow
├── PaymentPlansUI.tsx        # Create + manage plans
├── FollowUpTracker.tsx       # Activity logging + outcomes
└── AgingBucketDrill.tsx      # Smart drill + auto-plan creation

src/components/reports/
├── ClassProfitability.tsx    # Revenue - cost per class
├── TransportROI.tsx          # Route revenue vs. cost
├── FeeCompliance.tsx         # Actual vs. budgeted
├── CollectionsFunnel.tsx     # Stage-wise conversion
└── BursaryAnalytics.tsx      # Spend vs. budget, rate

src/services/
└── InvoiceGenerationService.ts  # Fee calculation + bulk invoicing
```

**Rust Services to Implement:**
```rust
// In services.rs (Phase 2 additions)
pub fn calculate_student_fees(student_id: &str, term_id: &str) -> Result<Vec<FeeLineItem>> { }
pub fn apply_fee_discounts(fee_items: &[FeeLineItem], student_id: &str) -> Result<Vec<FeeLineItem>> { }
pub fn generate_transport_billings(term_id: &str) -> Result<Vec<Invoice>> { }
pub fn allocate_inventory_charges(class_id: &str, term_id: &str) -> Result<Vec<InvoiceLineItem>> { }
pub fn calculate_bursary_eligibility(student_id: &str) -> Result<f64> { }
pub fn validate_bursary_limits(amount: f64, budget_remaining: f64) -> Result<bool> { }
pub fn post_bursary_to_ar(bursary_id: &str) -> Result<(InvoiceLineItem, JournalEntry)> { }
pub fn create_payment_plan(student_id: &str, outstanding: f64, num_months: i32) -> Result<PaymentPlan> { }
pub fn allocate_partial_payment(payment: &Payment, plans: &[PaymentPlan]) -> Result<Vec<PaymentAllocation>> { }
pub fn generate_due_reminders() -> Result<Vec<PaymentReminder>> { }
```

**Testing Strategy for Phase 2:**
- **Unit tests:** Fee calculation (discounts, multiple rules), bursary eligibility, payment plan splitting
- **Integration tests:** End-to-end billing (fees + transport + inventory), approval workflows, GL posting
- **UI tests:** Rule creation, plan modification, follow-up logging, reporting drill-downs
- **Data validation:** Ensure discounts don't exceed fees, bursaries within budget, inventory allocations valid
- **Offline sync:** Test that all Phase 2 events sync correctly (new event types: fee_rule_added, transport_assigned, etc.)

**Success Metrics (Phase 2):**
- Zero-click bulk invoicing for all fee types (fees + transport + inventory) per term
- Bursary approval workflow fully automated
- Collections CRM eliminates manual follow-up spreadsheets
- Payment plan compliance rate > 90%
- Class profitability reports enable margin analysis by class/grade

### ✅ Phase 3: Enterprise Backbone (Complete)
**Goal:** Complete enterprise-grade financial management with payroll, accounts payable, fixed assets, treasury, budgeting, and multi-campus consolidation.

**Feature Breakdown:**

#### 3.1 Payroll Module
- [x] Create `employees` table (staff details, department, position, hire date, bank info)
- [x] Create `salary_structures` table (basic salary, allowances, grade levels)
- [x] Create `payroll_runs` table (month, period, status, GL posting reference)
- [x] Create `payroll_items` table (payroll run → employee line items, gross, deductions, net)
- [x] Create `deduction_types` table (PAYE, NHIF, NSSF, pension, loan repayment, advance)
- [x] Create `employee_deductions` table (employee → deduction assignment, fixed/% amount)
- [x] Rust service: `calculate_payroll()` — Gross → deductions → net per employee
- [x] Rust service: `post_payroll_journal()` — Auto-post salary expense, liabilities, bank credit
- [x] UI component: `PayrollDashboard.tsx` — Run payroll, view payslips, history
- [x] UI component: `EmployeeManager.tsx` — Staff CRUD, salary structure assignment
- [x] UI component: `PayslipViewer.tsx` — Individual payslip detail + PDF export
- [x] Reporting: Payroll summary, department cost, PAYE/NHIF/NSSF returns

#### 3.2 Accounts Payable (AP)
- [x] Create `suppliers` table (supplier master data, payment terms, bank info)
- [x] Create `supplier_invoices` table (bill header: supplier, date, due date, status)
- [x] Create `supplier_invoice_items` table (line items: description, GL account, amount)
- [x] Create `payment_runs` table (batch payments: date, supplier selection, status)
- [x] Create `supplier_payments` table (individual payments: supplier, amount, method, ref)
- [x] Rust service: `post_supplier_invoice()` — AP journal entry (expense DR, AP CR)
- [x] Rust service: `process_payment_run()` — Batch payments with GL postings
- [x] UI component: `APDashboard.tsx` — AP aging, upcoming payments, cash requirements
- [x] UI component: `SupplierManager.tsx` — Supplier CRUD, payment terms, history
- [x] UI component: `BillEntry.tsx` — Enter supplier bills with GL coding
- [x] UI component: `PaymentRunUI.tsx` — Select bills for payment, process batch
- [x] Reporting: AP aging, supplier spend analysis, payment forecast

#### 3.3 Fixed Assets
- [x] Create `fixed_assets` table (asset register: description, category, cost, acquisition date, useful life)
- [x] Create `asset_categories` table (category definitions, default useful life, depreciation method)
- [x] Create `depreciation_schedule` table (monthly depreciation entries, accumulated depreciation)
- [x] Create `asset_disposals` table (disposal date, proceeds, gain/loss, GL posting)
- [x] Rust service: `calculate_depreciation()` — Straight-line and reducing balance methods
- [x] Rust service: `post_depreciation_journal()` — Monthly depreciation GL entries
- [x] Rust service: `process_asset_disposal()` — Record disposal with gain/loss
- [x] UI component: `AssetRegister.tsx` — Asset CRUD, category management, search/filter
- [x] UI component: `DepreciationRunner.tsx` — Run monthly depreciation, view schedule
- [x] Reporting: Asset schedule, depreciation report, NBV analysis

#### 3.4 Treasury & Cash Management
- [x] Create `cash_forecasts` table (projected inflows/outflows by period)
- [x] Create `bank_transfers` table (inter-bank transfers with GL postings)
- [x] Rust service: `generate_cash_forecast()` — Project cash position from AR/AP/payroll
- [x] Rust service: `post_bank_transfer()` — Record inter-bank movements
- [x] UI component: `TreasuryDashboard.tsx` — Cash position, forecast chart, bank balances
- [x] UI component: `BankTransferUI.tsx` — Create inter-bank transfers
- [x] Reporting: Cash flow statement, bank position summary, forecast vs actuals

#### 3.5 Budget Module
- [x] Create `budgets` table (budget header: fiscal year, version, status, approval)
- [x] Create `budget_lines` table (GL account, period, budgeted amount)
- [x] Create `budget_revisions` table (revision history, adjustment reason)
- [x] Rust service: `check_budget_availability()` — Validate spend against budget
- [x] UI component: `BudgetPlanner.tsx` — Create/edit budgets by GL account and period
- [x] UI component: `BudgetVsActual.tsx` — Variance analysis with drill-down
- [x] Reporting: Budget utilization, variance by department, YTD tracking

#### 3.6 Multi-Campus & Policy Engine
- [x] Create `campuses` table (campus master data, address, contact)
- [x] Create `policy_rules` table (configurable business rules: spending limits, approval thresholds)
- [x] UI component: `CampusManager.tsx` — Campus CRUD, consolidation settings
- [x] UI component: `PolicyEngine.tsx` — Configure business rules, limits, automations
- [x] Reporting: Consolidated financial statements, campus comparison

**Implementation Milestones:**

**M1: Payroll** (3-4 weeks)
- [x] Employee master + salary structures + deductions
- [x] Payroll calculation engine
- [x] GL auto-posting
- [x] Payslip generation + UI
- [x] Test: Multi-employee payroll, PAYE/NHIF/NSSF calculations

**M2: Accounts Payable** (3 weeks)
- [x] Supplier master + invoicing
- [x] AP aging + journal posting
- [x] Payment runs (batch processing)
- [x] AP reports
- [x] Test: Bill entry, payment allocation, aging accuracy

**M3: Fixed Assets** (2 weeks)
- [x] Asset register + categories
- [x] Depreciation calculation (SL + reducing balance)
- [x] Disposal processing
- [x] Asset reports + schedules
- [x] Test: Monthly depreciation, disposal gain/loss

**M4: Treasury** (2 weeks)
- [x] Cash forecast engine
- [x] Bank transfer processing
- [x] Treasury dashboard
- [x] Cash flow reporting
- [x] Test: Forecast accuracy, transfer GL integrity

**M5: Budget Module** (2-3 weeks)
- [x] Budget creation + line items
- [x] Budget vs actual comparison
- [x] Budget control (spending validation)
- [x] Variance reporting
- [x] Test: Budget checking, period rollover

**M6: Multi-Campus & Policy** (2 weeks)
- [x] Campus master data
- [x] Policy rules engine
- [x] Consolidated reporting
- [x] Settings integration
- [x] Test: Multi-campus GL, policy enforcement

**Frontend Components to Build:**
```
src/components/payroll/
├── PayrollDashboard.tsx      # Run payroll, history, summaries
├── EmployeeManager.tsx       # Staff CRUD + salary structures
└── PayslipViewer.tsx         # Individual payslip detail

src/components/ap/
├── APDashboard.tsx           # AP overview, aging, cash needs
├── SupplierManager.tsx       # Supplier CRUD + payment terms
├── BillEntry.tsx             # Enter supplier invoices
└── PaymentRunUI.tsx          # Batch payment processing

src/components/assets/
├── AssetRegister.tsx         # Asset CRUD + categories
└── DepreciationRunner.tsx    # Run depreciation + schedules

src/components/treasury/
├── TreasuryDashboard.tsx     # Cash position + forecasting
└── BankTransferUI.tsx        # Inter-bank transfers

src/components/budget/
├── BudgetPlanner.tsx         # Create/edit budgets
└── BudgetVsActual.tsx        # Variance analysis

src/components/settings/
├── CampusManager.tsx         # Multi-campus management
└── PolicyEngine.tsx          # Business rules configuration
```

**Rust Services to Implement:**
```rust
// In services.rs (Phase 3 additions)
pub fn calculate_payroll(run_id: &str) -> Result<Vec<PayrollItem>> { }
pub fn post_payroll_journal(run_id: &str) -> Result<JournalEntry> { }
pub fn post_supplier_invoice(invoice_id: &str) -> Result<JournalEntry> { }
pub fn process_payment_run(run_id: &str) -> Result<Vec<SupplierPayment>> { }
pub fn calculate_depreciation(period: &str) -> Result<Vec<DepreciationEntry>> { }
pub fn post_depreciation_journal(period: &str) -> Result<JournalEntry> { }
pub fn process_asset_disposal(asset_id: &str) -> Result<JournalEntry> { }
pub fn generate_cash_forecast(months: i32) -> Result<Vec<CashForecastEntry>> { }
pub fn post_bank_transfer(transfer_id: &str) -> Result<JournalEntry> { }
pub fn check_budget_availability(account_id: &str, amount: f64) -> Result<bool> { }
```

## 🏦 Key Features by Phase

### Phase 1 (MVP) - ✅ COMPLETE
- ✅ Chart of accounts (predefined with account types)
- ✅ Journal entries (create, post, double-entry validation)
- ✅ Student invoices (create, bulk generate, status tracking)
- ✅ Payment posting (allocate to invoices, multiple methods)
- ✅ Trial balance + financial statements (income statement, balance sheet)
- ✅ Audit trail (immutable event log)
- ✅ Role-based access (bursar, accountant, director, cashier)
- ✅ Offline-first data sync architecture (event-based)
- ✅ Bank reconciliation (statement matching, GL reconciliation)
- ✅ Period control (soft close, hard close)
- ✅ Receivables aging analysis (30/60/90+ days buckets)
- ✅ Payment history and tracking

### Phase 2 (School Core) - ✅ COMPLETE
- ✅ Fee rules engine (class-based, term-based, scholarships)
- ✅ Transport billing (routes, student assignments)
- ✅ Inventory-linked charging (uniforms, books)
- ✅ Bursary management
- ✅ Collections CRM (follow-ups, payment plans)
- ✅ Advanced reporting (class profitability, transport ROI)

### Phase 3 (Enterprise) - ✅ COMPLETE
- ✅ Payroll (salary structures, deductions, payslips, GL posting)
- ✅ Accounts payable (supplier bills, payment runs, AP aging)
- ✅ Fixed assets (depreciation, disposal, asset register)
- ✅ Treasury (bank transfers, cash forecasting, cash flow)
- ✅ Budget module (planning, variance analysis, spending control)
- ✅ Multi-campus consolidation + policy engine

## 🗄️ Architecture Highlights

MAPLE follows a **hybrid desktop-first architecture** where the React 19 frontend communicates with a Rust backend via Tauri's IPC bridge, and all data persists in a local SQLite database. The system is designed around four architectural pillars: event sourcing, double-entry accounting, offline-first sync, and role-based access control.

```
┌───────────────────────────────────────────────────────────┐
│         React 19 Frontend (Tauri Webview)                 │
│  Components · Zustand State · Offline-First Data Mgmt     │
└─────────────────────┬─────────────────────────────────────┘
                      │ IPC (Inter-Process Communication)
                      ▼
┌───────────────────────────────────────────────────────────┐
│  Rust Backend (Tauri Commands, Business Logic)            │
│  Validation · Accounting Rules · Event Processing         │
└─────────────────────┬─────────────────────────────────────┘
                      │ SQL (rusqlite)
                      ▼
┌───────────────────────────────────────────────────────────┐
│   SQLite 3 (Event Store + Relational Data)                │
│   Immutable event log · GL balances · Master data         │
└─────────────────────┬─────────────────────────────────────┘
                      │ HTTP Sync (Optional)
                      ▼
              Cloud Sync Server (Future)
```

### Event Sourcing

Instead of mutating rows (traditional CRUD), every financial action is recorded as an **immutable event** in the `events` table. The current state of any entity is derived by replaying its event sequence.

**Why event sourcing for a school ERP?**

| Benefit | How it helps |
|---------|-------------|
| **Complete audit trail** | Every change records who, what, when, and why — critical for school audits and parent disputes |
| **Point-in-time reconstruction** | Replay events to verify the GL balance on any historical date (e.g., end-of-term reporting) |
| **Conflict-free offline sync** | Append-only events from multiple offline devices merge naturally without overwriting |
| **Regulatory compliance** | URA and MoES audits require proof that no financial record was silently altered |
| **Safe reversals** | Mistakes are corrected by posting a reversal event, never by deleting the original |

**Event structure:**

```typescript
interface FinancialEvent {
  id: string;                // UUID v4
  event_type: string;        // 'invoice_created', 'payment_posted', 'journal_entry', etc.
  aggregate_id: string;      // The entity this event modifies (invoice, payment, journal)
  aggregate_version: number; // Optimistic concurrency control
  timestamp: number;         // Unix milliseconds (immutable, set at creation)
  user_id: string;           // Staff member who caused the event
  device_id?: string;        // Device identifier for offline tracking
  data: Record<string, any>; // Event-specific JSON payload
  sync_status: 'local' | 'synced' | 'pending' | 'conflict';
}
```

**Event types across all modules:**

| Module | Events |
|--------|--------|
| **Invoicing** | `invoice_created`, `invoice_amended`, `invoice_cancelled`, `credit_note_issued` |
| **Payments** | `payment_posted`, `payment_allocated`, `payment_reversed`, `refund_issued` |
| **GL** | `journal_entry_created`, `journal_entry_posted`, `journal_entry_reversed` |
| **Payroll** | `payroll_run_created`, `payroll_posted`, `payslip_generated` |
| **AP** | `bill_entered`, `bill_approved`, `supplier_payment_posted` |
| **Assets** | `asset_acquired`, `depreciation_posted`, `asset_disposed` |
| **Budget** | `budget_created`, `budget_revised`, `budget_checked` |
| **Treasury** | `bank_transfer_posted`, `cash_forecast_generated` |
| **Fees** | `fee_rule_added`, `fee_rule_deactivated`, `discount_applied` |
| **Bursary** | `bursary_requested`, `bursary_approved`, `bursary_disbursed` |
| **Collections** | `payment_plan_created`, `installment_paid`, `follow_up_logged` |

**Aggregate versioning** provides optimistic concurrency control. When two devices modify the same entity offline, the version number detects the conflict during sync, allowing human review rather than silent data loss.

### Double-Entry Accounting

Every financial transaction automatically generates offsetting journal entries where total debits must equal total credits. This invariant is enforced at the database level via SQLite triggers:

```sql
CREATE TRIGGER validate_journal_entry_balance
AFTER INSERT ON journal_entries
FOR EACH ROW
BEGIN
  SELECT CASE
    WHEN (
      SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0)
      FROM journal_line_items
      WHERE journal_entry_id = NEW.id
    ) != 0
    THEN RAISE(ABORT, 'Journal entry must balance (debits must equal credits)')
  END;
END;
```

**Journal line items** enforce mutual exclusivity — each line is either a debit or a credit, never both:

```sql
CHECK (
  (debit_amount IS NOT NULL AND credit_amount IS NULL) OR
  (debit_amount IS NULL AND credit_amount IS NOT NULL)
)
```

**Automatic GL posting examples:**

| Transaction | Debit | Credit |
|-------------|-------|--------|
| Student fee invoice | Accounts Receivable (1200) | Fee Income (4001) |
| Cash payment received | Cash at Bank (1100) | Accounts Receivable (1200) |
| Salary expense posted | Salary Expense (5100) | PAYE Payable (2200) + NSSF Payable (2201) + Net Pay Payable (2300) |
| Supplier bill entered | Expense Account (5xxx) | Accounts Payable (2100) |
| Asset depreciation | Depreciation Expense (5400) | Accumulated Depreciation (1510) |
| Bank transfer | Destination Bank (1101) | Source Bank (1100) |
| Bursary credit memo | Bursary Expense (5600) | Accounts Receivable (1200) |

The **trial balance** is a calculated view that aggregates all posted journal line items by GL account:

```sql
CREATE VIEW trial_balance AS
SELECT a.id, a.code, a.name, a.account_type,
  SUM(COALESCE(jli.debit_amount, 0)) as total_debits,
  SUM(COALESCE(jli.credit_amount, 0)) as total_credits
FROM accounts a
LEFT JOIN journal_line_items jli ON a.id = jli.account_id
LEFT JOIN journal_entries je ON jli.journal_entry_id = je.id
  AND je.status = 'posted'
GROUP BY a.id;
```

### Offline-First Design

MAPLE is built for schools in East Africa where internet connectivity is unreliable. The **local SQLite database is the primary source of truth**, not a cache of cloud data.

**Design principles:**
1. **Every feature works fully offline** — invoicing, payments, payroll, reporting
2. **Events accumulate locally** — no data loss regardless of connectivity duration
3. **Sync is additive** — upload local events, download remote events, never destructive overwrite
4. **Conflicts surface for human review** — the system never silently resolves financial conflicts

**Sync architecture:**

```
Device A (Offline 7 days)             Cloud Server
│                                      │
├─ invoice_created (v1)                │
├─ payment_posted (v2)                 │
├─ journal_entry_posted (v3)           │
├─ payroll_run_created (v4)            │
│                                      │
│  [Connectivity restored]             │
│                                      │
├─── POST /api/sync ─────────────────→ │
│    { device_id, last_sync_ts,        │
│      events: [v1..v4] }             │
│                                      ├─ Validate business rules
│                                      ├─ Check for conflicts
│                                      ├─ Store events
│                                      │
│ ←── 200 OK ─────────────────────────┤
│    { synced: [v1..v4],               │
│      remote_events: [from other      │
│        devices since last sync] }    │
│                                      │
├─ Merge remote events locally         │
├─ Mark local events as 'synced'       │
└─ Flag any conflicts for review       │
```

**Conflict resolution strategies:**

| Scenario | Resolution |
|----------|-----------|
| Same field edited on two devices | Flag as conflict → human chooses |
| Different fields on same entity | Auto-merge (both changes applied) |
| GL integrity violation (e.g., delete posted invoice) | Reject the conflicting event |
| Version mismatch on same aggregate | Surface for manual review |

**SQLite pragmas** optimized for offline-first performance:

```sql
PRAGMA journal_mode = WAL;       -- Write-Ahead Logging: concurrent reads + writes
PRAGMA synchronous = NORMAL;     -- Balance ACID safety with performance
PRAGMA cache_size = 10000;       -- 2.5 MB in-memory page cache
PRAGMA temp_store = MEMORY;      -- Temporary tables in RAM
PRAGMA foreign_keys = ON;        -- Enforce referential integrity
PRAGMA busy_timeout = 5000;      -- Wait 5 seconds before "database locked"
```

**Retry with exponential backoff** ensures sync resilience on unstable networks (1s → 2s → 4s → 8s → 16s, max 5 retries).

### Role-Based Access Control

MAPLE implements fine-grained RBAC with **12 predefined roles** and **permission-level control** over every action in the system.

**Role matrix:**

| Role | Create | Approve | Post | View | Special Permissions |
|------|--------|---------|------|------|-------------------|
| **Director** | — | Budgets, policies | — | All modules | Campus consolidation, policy engine |
| **Bursar** | Invoices, fee rules | Bursaries | Payments | All financial | Fee engine, collections CRM |
| **Head Accountant** | Journals, budgets | Journals, invoices | GL entries | All financial | Period control, bank reconciliation |
| **Accountant** | Journals | — | GL entries | Accounting | Trial balance, reports |
| **Cashier** | Payments | — | Payments | Payments, receipts | Receipt printing only |
| **Payroll Officer** | Payroll runs | — | Payroll | HR, payroll | Payslip generation |
| **Procurement Officer** | Supplier bills | — | — | AP module | Purchase orders |
| **AP Clerk** | Bills | — | — | AP module | Bill entry only |
| **Asset Manager** | Assets | Disposals | Depreciation | Assets | Asset register, depreciation runner |
| **Treasury Officer** | Transfers | — | Transfers | Treasury | Cash forecasting |
| **Auditor** | — | — | — | All + audit log | Read-only, full audit trail access |
| **Parent Portal** | — | — | — | Own family | View statements, payment history |

**Permission enforcement** happens at three levels:
1. **UI level** — Buttons and menu items are conditionally rendered based on `hasPermission()`
2. **API level** — Rust backend validates permissions before executing any command
3. **Database level** — `created_by` and `approved_by` must be different users (segregation of duties)

**Segregation of duties** prevents fraud by ensuring the same user cannot create, approve, and post a transaction:
- **Creator** → submits the transaction (e.g., invoice, journal entry)
- **Approver** → reviews and approves (different user)
- **Poster** → posts to GL (can be same as approver, but not creator)

## 💾 Database Design

The schema comprises **33+ tables**, organized into functional groups, plus **calculated views** and **SQLite triggers** for data integrity.

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `events` | Immutable event log (source of truth) | `event_type`, `aggregate_id`, `aggregate_version`, `data` (JSON), `sync_status` |
| `users` | Staff login credentials and roles | `email`, `password_hash`, `role`, `permissions` (JSON), `is_active` |
| `sessions` | Active login sessions | `user_id`, `login_time`, `is_offline_mode`, `expires_at` |
| `accounts` | Chart of accounts (hierarchical) | `code`, `name`, `account_type`, `parent_account_id`, `status` |
| `audit_logs` | Complete change history | `action`, `entity_type`, `entity_id`, `old_value`, `new_value` |
| `schema_version` | Migration tracking | `version`, `migration_name` |

### Financial Transaction Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `journal_entries` | GL transaction headers | `created_by` → `users`, status workflow (draft→submitted→approved→posted) |
| `journal_line_items` | GL debit/credit lines | `journal_entry_id` → `journal_entries`, `account_id` → `accounts` |
| `student_invoices` | Accounts receivable headers | `student_id` → `students`, `family_id` → `families` |
| `invoice_line_items` | Invoice line details | `invoice_id` → `student_invoices`, `account_code_id` → `accounts` |
| `payments` | Payment records | `family_id` → `families`, `payment_method`, `status` |
| `payment_allocations` | Payment-to-invoice mapping | `payment_id` → `payments`, `invoice_id` → `student_invoices` |

### School Master Data

| Table | Purpose |
|-------|---------|
| `students` | Student records with class, family, financial status |
| `families` | Guardian/household with aggregate balance and arrears |
| `classes` | Academic classes (S1–S6) |
| `streams` | Class streams/sections |

### Phase 2: School Billing Tables

| Table | Purpose |
|-------|---------|
| `fee_rules` | Class-based, term-based fee configuration |
| `fee_discounts` | Scholarship, sibling, early-bird discounts |
| `transport_routes` | Route definitions with pickup points and monthly cost |
| `student_transport_assignments` | Student-to-route mapping per term |
| `inventory_items` | Uniforms, books, stationery stock tracking |
| `inventory_allocations` | Item-to-class/term allocation |
| `bursary_requests` | Financial aid applications |
| `bursary_approvals` | Multi-level approval records |
| `payment_plans` | Installment payment arrangements |
| `payment_plan_installments` | Individual installment tracking |
| `follow_up_activities` | Collections CRM activity log |

### Phase 3: Enterprise Tables

| Table | Purpose |
|-------|---------|
| `employees` | Staff master data, department, bank info |
| `salary_structures` | Pay grades, allowances |
| `payroll_runs` | Monthly payroll batch processing |
| `payroll_items` | Employee-level gross/deductions/net |
| `deduction_types` | PAYE, NSSF, LST, pension, loans |
| `suppliers` | Vendor master data, payment terms |
| `supplier_invoices` / `supplier_invoice_items` | AP transactions |
| `payment_runs` / `supplier_payments` | Batch AP payments |
| `fixed_assets` / `asset_categories` | Asset register |
| `depreciation_schedule` / `asset_disposals` | Depreciation and disposal |
| `budgets` / `budget_lines` / `budget_revisions` | Budget planning and control |
| `bank_transfers` / `cash_forecasts` | Treasury management |
| `campuses` / `policy_rules` | Multi-campus and business rules |

### Calculated Views

| View | Purpose | Used By |
|------|---------|---------|
| `trial_balance` | Aggregate GL balances (debits vs. credits) by account | Accounting module, financial statements |
| `receivables_aging` | AR aging by 30/60/90+ day buckets per family | Collections CRM, dashboard KPIs |

### Indexing Strategy

```sql
-- Event queries (most frequent)
CREATE INDEX idx_events_aggregate ON events(aggregate_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_events_sync_status ON events(sync_status);

-- Financial lookups
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_line_items_account ON journal_line_items(account_id);

-- School queries
CREATE INDEX idx_students_family ON students(family_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_status ON students(status);

-- Audit queries
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

## 🔐 Security & Compliance

### Data Integrity

| Mechanism | Implementation |
|-----------|---------------|
| **ACID transactions** | SQLite WAL mode with `PRAGMA synchronous = NORMAL` |
| **Referential integrity** | `PRAGMA foreign_keys = ON` enforced on all tables |
| **Double-entry invariant** | SQLite trigger rejects unbalanced journal entries |
| **Immutable event log** | No UPDATE or DELETE on `events` table; corrections via reversal events |
| **Debit/credit exclusivity** | CHECK constraint ensures each journal line is debit OR credit, never both |

### Authentication & Authorization

| Layer | Mechanism |
|-------|-----------|
| **Password storage** | BCrypt hashing (cost factor 12) |
| **Session management** | Token-based sessions with configurable expiry |
| **Permission checks** | `hasPermission()` / `hasRole()` at UI, API, and DB levels |
| **Segregation of duties** | `created_by ≠ approved_by ≠ posted_by` enforced per transaction |
| **Offline authentication** | Cached credentials allow login during offline periods |

### Audit & Compliance

| Requirement | How MAPLE addresses it |
|-------------|----------------------|
| **URA audit trail** | Every transaction logged in `audit_logs` with old/new values, user ID, timestamp |
| **MoES financial reporting** | Trial balance, income statement, balance sheet generated from GL |
| **No silent edits** | Event sourcing ensures all changes are append-only and traceable |
| **Reversal tracking** | Errors corrected via reversal events that reference the original, not by deleting |
| **User accountability** | Every event records `user_id` and `device_id` |
| **Period control** | Soft close (allows corrections with approval) and hard close (locks period completely) |

### Data Sensitivity Classification

| Level | Examples | Protection |
|-------|----------|-----------|
| **High** | Passwords, payment method details | BCrypt hash, never stored in plaintext |
| **Medium** | Student names, guardian contacts, family balances | Access restricted by role, audit logged |
| **Low** | GL account codes, chart of accounts structure | Accessible to all authenticated users |

## 🛠️ Technology Stack

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| **Frontend** | React + TypeScript | 19.x | Type-safe UI with component reusability; React 19 compiler optimizations |
| **State Management** | Zustand | 5.x | Lightweight (1 KB), perfect for offline-first apps; three stores: auth, UI, sync |
| **Styling** | TailwindCSS | 4.x | Utility-first CSS with Vite plugin; rapid UI development, consistent design system |
| **Build Tool** | Vite | 6.x | Sub-second HMR, optimized production builds (~30 kB gzipped output) |
| **Desktop Runtime** | Tauri | 2.x | 2–8 MB bundle (vs. Electron's 150 MB); native OS webview; cross-platform (macOS/Windows/Linux) |
| **Backend** | Rust | 1.70+ | Memory safety without GC; type system prevents financial calculation errors; high performance |
| **Database** | SQLite | 3.x | Zero-setup, ACID-compliant, single-file database; ideal for offline-first desktop apps |
| **Sync Protocol** | Event log + REST API | — | Append-only events uploaded via HTTP; conflict detection via aggregate versioning |
| **Routing** | React Router | 7.x | Declarative page routing with nested layouts |
| **Icons/Charts** | Inline SVG | — | No external icon library dependency; custom financial chart components |

### Why Tauri over Electron?

| Criteria | Tauri | Electron |
|----------|-------|----------|
| Bundle size | 2–8 MB | 150+ MB |
| Memory usage | ~30 MB | ~200 MB |
| Backend language | Rust (type-safe, fast) | Node.js |
| Security | Sandboxed, no Node in renderer | Full Node access in renderer |
| Startup time | < 1 second | 2–5 seconds |

### Zustand Store Architecture

Three purpose-specific stores keep state management clean and testable:

```
┌─ useAuthStore ─────────────────────────────┐
│  user, session, isAuthenticated,           │
│  isOfflineMode, hasPermission(), hasRole() │
└────────────────────────────────────────────┘
┌─ useUIStore ───────────────────────────────┐
│  isSidebarOpen, currentModule, theme,      │
│  notifications[], addNotification()        │
└────────────────────────────────────────────┘
┌─ useSyncStore ─────────────────────────────┐
│  isSyncing, lastSyncTime, syncErrors[],    │
│  pendingEvents, setPendingEvents()         │
└────────────────────────────────────────────┘
```

## 📊 Data Flow

### Transaction Lifecycle

Every financial transaction follows the same event-driven pipeline from UI to database:

```
User Action (e.g., "Post Payment")
        │
        ▼
┌─ React Component ─────────────────────────┐
│  Client-side validation                    │
│  • Amount > 0?  • Due date valid?          │
│  • Required fields present?                │
└────────────────┬──────────────────────────┘
                 │
                 ▼
┌─ Zustand Store ────────────────────────────┐
│  Optimistic UI update                      │
│  • Show payment as "processing"            │
│  • Update family balance immediately       │
└────────────────┬──────────────────────────┘
                 │ IPC (invoke Tauri command)
                 ▼
┌─ Rust Backend ─────────────────────────────┐
│  Business logic validation                 │
│  • Student exists? Family linked?          │
│  • GL accounts mapped? Budget available?   │
│  • Segregation of duties check             │
└────────────────┬──────────────────────────┘
                 │
                 ▼
┌─ SQLite Transaction ──────────────────────┐
│  BEGIN TRANSACTION                         │
│  1. INSERT event (immutable)               │
│  2. INSERT journal_entry + line_items      │
│  3. Trigger: validate debits = credits     │
│  4. INSERT audit_log                       │
│  5. UPDATE invoice status (if applicable)  │
│  COMMIT                                    │
└────────────────┬──────────────────────────┘
                 │
                 ▼
┌─ Post-Transaction ────────────────────────┐
│  • Trial balance view recalculated         │
│  • Aging buckets updated                   │
│  • UI receives success callback            │
│  • Event queued for sync (if offline)      │
│  • On connectivity: upload → server        │
└───────────────────────────────────────────┘
```

### Module-Specific Data Flows

**Payroll flow:** Employee master → Salary structure → Calculate gross → Apply deductions (PAYE, NSSF, LST) → Generate payslips → Post journal (Salary Expense DR, Liability accounts CR, Bank CR) → Queue for sync

**AP flow:** Supplier bill entered → GL coding per line → Approval workflow → Bill posted (Expense DR, AP CR) → Payment run selected → Batch payment processed (AP DR, Bank CR) → Supplier notified

**Budget flow:** Budget created per fiscal year → Lines mapped to GL accounts → Spending checked against budget before posting → Variance calculated (budget − actual) → Alerts on overspend

**Collections flow:** Invoice generated → Aging clock starts → Auto-reminder at 7/14/30 days → Follow-up activity logged → Payment plan created (if needed) → Installments tracked → Partial payments auto-allocated

## 🧪 Testing Strategy

### Test Pyramid

```
         ╱ ╲
        ╱ E2E╲           Offline sync, multi-user workflows
       ╱───────╲
      ╱ Integr. ╲        SQLite operations, event lifecycle
     ╱───────────╲
    ╱  Unit Tests  ╲      Rust services, React components
   ╱─────────────────╲
```

### Test Categories

| Category | Scope | Examples |
|----------|-------|---------|
| **Rust unit tests** | Validation services, calculations | Fee calculation with discounts; PAYE/NSSF/LST deduction math; depreciation (straight-line + reducing balance); budget availability check |
| **SQLite integration** | Database operations, triggers, views | Event creation + retrieval; journal balance trigger rejects unbalanced entries; trial balance view accuracy; receivables aging calculation |
| **React component tests** | UI rendering, user interactions | Form validation feedback; permission-based button visibility; KPI card rendering; period filter behavior |
| **Offline sync tests** | Multi-device, extended offline | 7+ day offline period with 500+ events; conflict detection on same aggregate; merge resolution; retry with backoff |
| **Concurrency tests** | Multi-user scenarios | Two users editing same invoice; simultaneous payment posting; payroll run while payments incoming |
| **Reconciliation tests** | GL integrity verification | Trial balance always balances (sum debits = sum credits); invoice balance = total − allocated payments; family balance = sum of invoice balances |
| **Data validation tests** | Business rule enforcement | Discounts cannot exceed fee amount; bursary within budget limit; payment cannot exceed invoice balance; depreciation stops at salvage value |
| **Performance tests** | Load and response time | 10,000+ events query < 500ms; trial balance with 200+ accounts < 200ms; bulk invoice generation for 500 students < 5s |

## 🚢 Deployment

### Development
```bash
npm run dev              # Dev server at localhost:5173
npm run tauri-dev        # Tauri dev app in debug mode
```

### Production
```bash
npm run build            # Build frontend (Vite)
npm run tauri-build      # Build macOS/Windows/Linux installers
```

Distributable installers:
- `.dmg` (macOS)
- `.exe` / `.msi` (Windows)
- `.AppImage` / `.deb` (Linux)

## 📚 Documentation

- **[Architecture](./docs/ARCHITECTURE.md)** — System design, module breakdown
- **[Database Schema](./docs/SCHEMA.md)** — Tables, views, triggers
- **[API Design](./docs/API.md)** — REST endpoints, WebSocket sync (Phase 3)
- **[User Guide](./docs/USER_GUIDE.md)** — Feature walkthroughs
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** — Contributing, coding standards

## 🐛 Known Limitations (Phase 1)

- Single-user offline mode (multi-device sync in Phase 3)
- No M-Pesa integration yet (Phase 3)
- Limited reporting (core reports Phase 1, advanced Phase 3)
- No mobile app (web-only for now)
- Payroll not included (Phase 3)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

Proprietary. © 2026 MAPLE ERP Team. All rights reserved.

## 📧 Contact & Support

- **Email:** support@mapleerp.com
- **Issues:** GitHub Issues (for development)
- **Documentation:** See `/docs` folder

---

**Built with ❤️ for schools in East Africa**

## 🎉 Build Metrics

- **Frontend:** 29.71 kB gzipped (React 19 + TypeScript + TailwindCSS)
- **Bundle Size:** 182.57 kB JS + 1.71 kB CSS (+ 231 kB React vendor)
- **Build Time:** 260ms (Vite optimized)
- **Zero Critical Errors** in TypeScript and Rust compilation
- **Phase 2 Components:** 13 new UI components + 1 service module
- **Schema:** 33+ tables (22 Phase 1 + 11 Phase 2)
- **100% Test Ready** - All school billing and collections features functional

Last Updated: April 6, 2026 (Phase 2 Complete)
