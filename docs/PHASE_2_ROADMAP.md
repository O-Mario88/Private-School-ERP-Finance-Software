# Phase 2: School Core Implementation Roadmap

**Duration:** ~8 weeks (May 6 - June 30, 2026)  
**Goal:** Transform MAPLE from a generic student billing system into a school-native platform with intelligent fee management, transport logistics, and proactive collections.

---

## 📋 Phase 2 Overview

Phase 2 builds on Phase 1's solid accounting foundation to add school-specific revenue streams and collections intelligence. Schools will move from manual fee calculations and payment chasing to automated, rule-driven billing and smart follow-up prioritization.

### Strategic Impact
- **Fee Revenue Control:** 40% reduction in billing errors through rules engine
- **Transport Efficiency:** Real-time route and seat capacity visibility
- **Collection Velocity:** 25-30% improvement via CRM-driven follow-ups
- **Data Insights:** Class-level and student-level profitability analysis

---

## 🎯 Feature Breakdown

### Feature 1: Fee Rules Engine (Week 1-3)
**Status:** Not started  
**Complexity:** High  
**Dependencies:** Phase 1 complete

#### Scope
Define and execute complex fee structures without manual invoice editing.

#### User Stories
1. **Define Fee Rules** (Bursar)
   - Create rules: "Class IV pays 50,000 KES/term" + "Direct entrants pay 10% discount"
   - Define conditions: class, stream, cohort, fee type, term
   - Set effective dates and versioning (audit trail)
   - Bulk apply: Select students → auto-generate invoices

2. **Manage Fee Types** (Accountant)
   - Tuition, transport, uniforms, lunch, activities, medical, exam fees
   - Deferred vs. upfront
   - Recurring (term/year) vs. one-time
   - Linked to GL accounts (automation)

3. **Scholarship & Discount Rules** (Director)
   - Scholarship levels (100% free, 50% partial, bursary)
   - Apply retroactively (recalculate historical invoices)
   - Override capability with approval workflow

#### Database Schema Changes
```sql
-- New Tables
CREATE TABLE fee_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,             -- "Tuition", "Transport"
  description TEXT,
  account_id TEXT NOT NULL,       -- GL account (debit AR, credit revenue)
  recurrence TEXT,                -- "term", "year", "once"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE fee_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,             -- "Class IV Tuition 2026"
  fee_type_id TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  conditions JSON,                -- {"class": "IV", "stream": null}
  discount_pct DECIMAL(5,2),
  effective_from DATE NOT NULL,
  effective_to DATE,
  version INT DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (fee_type_id) REFERENCES fee_types(id),
  UNIQUE (name, version)
);

CREATE TABLE student_scholarships (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  scholarship_type TEXT,          -- "full", "partial", "bursary"
  percentage DECIMAL(5,2),        -- e.g., 50 for 50% discount
  reason TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP,
  effective_from DATE NOT NULL,
  effective_to DATE,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- View: Calculate effective fee for a student
CREATE VIEW student_effective_fees AS
SELECT 
  s.id as student_id,
  ft.id as fee_type_id,
  ft.name as fee_name,
  fr.amount,
  COALESCE(ss.percentage, 0) as discount_pct,
  (fr.amount * (100 - COALESCE(ss.percentage, 0)) / 100) as effective_amount
FROM students s
JOIN fee_rules fr ON (
  (fr.conditions::json->>'class' IS NULL OR fr.conditions::json->>'class' = s.class) AND
  (fr.conditions::json->>'stream' IS NULL OR fr.conditions::json->>'stream' = s.stream)
)
JOIN fee_types ft ON fr.fee_type_id = ft.id
LEFT JOIN student_scholarships ss ON ss.student_id = s.id AND ss.is_active = TRUE
WHERE fr.is_active = TRUE 
  AND CURRENT_DATE >= fr.effective_from 
  AND (fr.effective_to IS NULL OR CURRENT_DATE <= fr.effective_to);
```

#### Implementation Tasks
- [ ] Design fee_types, fee_rules, scholarships tables (1d)
- [ ] Build Rust service: `CalculateFeeService` (apply rules, evaluate conditions) (2d)
- [ ] Build Rust: Bulk invoice generation from rules (1d)
- [ ] Frontend: FeeRulesManager component (define/edit rules) (2d)
- [ ] Frontend: ScholarshipManager component (assign scholarships) (1d)
- [ ] Integration: Auto-default fees on student creation (1d)
- [ ] Tests: Rule evaluation, discount application, versioning (1d)

#### Acceptance Criteria
- ✅ Create fee rule "Class IV, Term 1" = 50,000 KES
- ✅ Apply 20% scholarship discount to 5 students
- ✅ Bulk generate 50 invoices from rules (verify GL posting)
- ✅ Version fee rules; audit trail shows all changes
- ✅ Historical invoice recalculation on scholarship change

---

### Feature 2: Transport Billing System (Week 2-4)
**Status:** Not started  
**Complexity:** High  
**Dependencies:** Fee rules engine (partial)

#### Scope
Manage transport routes, student assignments, and automated billing per student per route.

#### User Stories
1. **Route Management** (Transport Officer)
   - Create routes: "Route A: Nairobi CBD" with capacity (25 students max)
   - Set schedule: Pick-up time, drop-off time, operating days
   - Assign students: Drag-and-drop or bulk upload
   - Track capacity: Real-time seat visibility

2. **Transport Billing** (Bursar)
   - Auto-generate monthly charges: Route A = 3,000 KES/student/month
   - Pro-rate: Student joins mid-month → 1,500 KES
   - Handle dropouts: Reverse charge on exit date
   - Bundle with tuition or separate invoice

3. **Route Profitability** (Director)
   - Dashboard: Revenue vs. cost per route
   - Driver & vehicle costs (Phase 3)
   - Occupancy rate: Avg 22/25 seats

#### Database Schema Changes
```sql
CREATE TABLE transport_routes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,             -- "Route A: Nairobi CBD"
  pickup_location TEXT,
  dropoff_location TEXT,
  pickup_time TEXT,               -- "07:00"
  dropoff_time TEXT,              -- "08:30"
  capacity INT NOT NULL,
  operating_days TEXT,            -- "monday,tuesday,wednesday,thursday,friday" (JSON array)
  monthly_rate DECIMAL(10,2),
  status TEXT DEFAULT 'active',   -- "active", "inactive", "seasonal"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL
);

CREATE TABLE transport_assignments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  route_id TEXT NOT NULL,
  assignment_date DATE NOT NULL,  -- When student started
  exit_date DATE,                 -- When student left (NULL = still active)
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (route_id) REFERENCES transport_routes(id),
  UNIQUE (student_id, route_id, assignment_date)
);

CREATE TABLE transport_charges (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  route_id TEXT NOT NULL,
  billing_month DATE NOT NULL,    -- "2026-05-01"
  amount DECIMAL(10,2) NOT NULL,
  invoice_id TEXT,                -- Link to invoice
  status TEXT DEFAULT 'pending',  -- "pending", "invoiced", "paid"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (route_id) REFERENCES transport_routes(id),
  FOREIGN KEY (invoice_id) REFERENCES student_invoices(id)
);

-- View: Current route occupancy
CREATE VIEW route_occupancy AS
SELECT 
  tr.id, tr.name, tr.capacity,
  COUNT(ta.id) as current_students,
  ROUND(100.0 * COUNT(ta.id) / tr.capacity, 1) as occupancy_pct
FROM transport_routes tr
LEFT JOIN transport_assignments ta ON tr.id = ta.route_id 
  AND ta.assignment_date <= CURRENT_DATE 
  AND (ta.exit_date IS NULL OR ta.exit_date >= CURRENT_DATE)
GROUP BY tr.id, tr.name, tr.capacity;
```

#### Implementation Tasks
- [ ] Design transport_routes, assignments, charges tables (1d)
- [ ] Build Rust: TransportBillingService (pro-rata calculation, exit handling) (2d)
- [ ] Build Rust: Auto-generate transport charges monthly (1d)
- [ ] Frontend: RouteManager (CRUD routes, capacity indicators) (2d)
- [ ] Frontend: StudentTransportAssignment (drag-drop, bulk upload) (2d)
- [ ] Frontend: Transport Profitability Report (revenue, occupancy, trends) (1d)
- [ ] Integration: Link transport charges to invoices (0.5d)
- [ ] Tests: Pro-rata calculation, capacity rules, occupancy tracking (1d)

#### Acceptance Criteria
- ✅ Create "Route A" with 25-seat capacity, 3,000 KES/month
- ✅ Assign 22 students; occupancy shows 88%
- ✅ Generate May charges: 22 × 3,000 = 66,000 KES
- ✅ Student exits mid-month: Refund 1,500 KES (pro-rated)
- ✅ Dashboard shows occupancy trend and revenue by route

---

### Feature 3: Inventory-Linked Charging (Week 3-4)
**Status:** Not started  
**Complexity:** Medium  
**Dependencies:** Fee rules engine

#### Scope
Tie invoices to physical inventory (uniforms, textbooks) with stock management and cost tracking.

#### User Stories
1. **Inventory Item Setup** (Storekeeper)
   - Create items: "School Uniform - Class III" (unit cost 2,500 KES)
   - Set price-to-student: 3,000 KES (500 markup)
   - Track stock: Allocate 50 units for Class III

2. **Bundle Charging** (Bursar)
   - Auto-include uniform in Year 1 invoices
   - Replacement charging: Damaged uniform → new invoice
   - Track issuance: Who got what, when, condition

3. **Inventory Visibility** (Director)
   - Stock by class and item
   - Cost of goods sold (COGS) tracking
   - Margin analysis: Cost vs. student revenue

#### Database Schema Changes
```sql
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,             -- "School Uniform - Class III"
  description TEXT,
  category TEXT,                  -- "uniform", "book", "supplies"
  unit_cost DECIMAL(10,2),        -- What school paid
  student_price DECIMAL(10,2),    -- What student charged
  quantity_on_hand INT DEFAULT 0,
  reorder_level INT,              -- Alert at this qty
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_allocations (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INT DEFAULT 1,
  issue_date DATE,
  condition TEXT,                 -- "good", "damaged", "returned"
  issued_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (item_id) REFERENCES inventory_items(id),
  FOREIGN KEY (issued_by) REFERENCES users(id)
);

CREATE TABLE inventory_charges (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2),
  charge_date DATE NOT NULL,
  reason TEXT,                    -- "initial", "replacement", "additional"
  invoice_id TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (item_id) REFERENCES inventory_items(id),
  FOREIGN KEY (invoice_id) REFERENCES student_invoices(id)
);
```

#### Implementation Tasks
- [ ] Design inventory tables (1d)
- [ ] Build Rust: Inventory service (stock tracking, COGS) (1d)
- [ ] Build Rust: Auto-charge on allocations (1d)
- [ ] Frontend: InventoryManager (CRUD items, stock) (1d)
- [ ] Frontend: AllocationTracker (issue items, track condition) (1d)
- [ ] Integration: Bundle items with invoices via fee rules (1d)
- [ ] Tests: Stock depletion, charging, COGS calculations (0.5d)

#### Acceptance Criteria
- ✅ Create "School Uniform - Class III": cost 2,500, sell 3,000
- ✅ Allocate 50 uniforms to Class III students
- ✅ Auto-charge 3,000 KES per student on invoice
- ✅ Mark damaged uniform → generate replacement charge
- ✅ Report: 125 items issued, 2,500 × 125 = 312,500 COGS

---

### Feature 4: Bursary Management (Week 4-5)
**Status:** Not started  
**Complexity:** Medium  
**Dependencies:** Scholarships (Fee engine)

#### Scope
Track bursary applications, approvals, and disbursements with audit trail.

#### User Stories
1. **Bursary Application** (Student/Parent)
   - Submit form: Financial hardship statement, supporting docs
   - Status tracking: Submitted → Reviewed → Approved/Rejected
   - Amount requested vs. awarded

2. **Approval Workflow** (Bursar/Director)
   - View applications with KPIs (total requested, approval rate)
   - Approve/reject with optional notes
   - Set disbursement method: Discount on invoice, lump-sum credit, waive charges

3. **Disbursement & Accounting** (Accountant)
   - Track bursary reserve GL account (funding source)
   - Disburse to student account as credit
   - Reverse on dropout/graduation

#### Database Schema Changes
```sql
CREATE TABLE bursary_applications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  application_date DATE NOT NULL,
  amount_requested DECIMAL(12,2),
  financial_statement TEXT,       -- Narrative
  supporting_docs TEXT,           -- JSON: ["file1.pdf", "file2.jpg"]
  status TEXT DEFAULT 'submitted', -- "submitted", "reviewed", "approved", "rejected"
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  approval_notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE bursary_awards (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  amount_awarded DECIMAL(12,2),
  disbursement_method TEXT,       -- "discount", "credit", "waive"
  disbursement_date DATE,
  grant_account_id TEXT,          -- GL account for bursary reserve
  status TEXT DEFAULT 'pending',  -- "pending", "disbursed", "reversed"
  FOREIGN KEY (application_id) REFERENCES bursary_applications(id),
  FOREIGN KEY (grant_account_id) REFERENCES accounts(id)
);
```

#### Implementation Tasks
- [ ] Design bursary tables (0.5d)
- [ ] Build Rust: BursaryService (apply awards, reversals) (1d)
- [ ] Frontend: BursaryApplicationForm (submit, file upload) (1.5d)
- [ ] Frontend: BursaryApprovalDashboard (review, approve/reject) (1d)
- [ ] Integration: Apply awards to scholarships/discounts (1d)
- [ ] Tests: Approval workflow, GL posting, reversal (1d)

#### Acceptance Criteria
- ✅ Student submits bursary application
- ✅ Bursar approves 25,000 KES (full tuition waive)
- ✅ Scholarship applied; no charge on invoice
- ✅ Bursary reserve account debited
- ✅ Audit log shows full approval chain

---

### Feature 5: Collections CRM (Week 5-7)
**Status:** Not started  
**Complexity:** High  
**Dependencies:** Phase 1 AR core + all fee engines

#### Scope
Smart follow-up management with engagement history, payment plan negotiation, and escalation workflows.

#### User Stories
1. **Receivables Dashboard** (Bursar/Collections Officer)
   - Student list sorted by: days overdue, amount owed, payment score
   - Filters: Payment status, overdue threshold, class, family
   - Quick stats: Total outstanding, high-risk students (90+ days)

2. **Engagement & Follow-ups** (Collections Officer)
   - Create follow-ups: "Call parent", "Send SMS", "Email invoice", "Home visit"
   - Track interactions: Who, what, when, outcome
   - Engagement score: Responsive vs. avoidant families
   - Communication history per student/family

3. **Payment Plans** (Bursar)
   - Negotiate: "1,000 KES weekly for 10 weeks"
   - Validation: Must not exceed total outstanding
   - Adherence tracking: On-time, missed, partial payments
   - Escalate if payments miss

4. **Collections Workflows** (Director)
   - Escalation rules: 30 days → SMS, 60 days → call, 90 days → legal
   - Bulk actions: Send SMS to 30+ overdue students
   - Collections effectiveness report: Recovery rate by day bucket

#### Database Schema Changes
```sql
CREATE TABLE follow_ups (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  family_id TEXT,
  follow_up_type TEXT NOT NULL, -- "sms", "call", "email", "visit", "letter"
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT DEFAULT 'pending', -- "pending", "completed", "skipped", "failed"
  notes TEXT,
  outcome TEXT,                  -- "payment_promised", "agreed_plan", "unavailable", etc.
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (family_id) REFERENCES families(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE payment_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  family_id TEXT,
  total_amount DECIMAL(12,2),    -- Total outstanding at agreement
  installment_amount DECIMAL(10,2),
  installment_count INT,
  installment_interval INT,      -- In days
  status TEXT DEFAULT 'active',  -- "active", "completed", "defaulted"
  agreement_date DATE NOT NULL,
  agreed_by TEXT,                -- Collections officer
  notes TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (family_id) REFERENCES families(id),
  FOREIGN KEY (agreed_by) REFERENCES users(id)
);

CREATE TABLE payment_plan_schedules (
  id TEXT PRIMARY KEY,
  payment_plan_id TEXT NOT NULL,
  due_date DATE NOT NULL,
  due_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_date DATE,
  status TEXT DEFAULT 'pending', -- "pending", "paid", "partial", "overdue"
  FOREIGN KEY (payment_plan_id) REFERENCES payment_plans(id)
);

-- View: Student Collections Status
CREATE VIEW student_collections_status AS
SELECT 
  s.id, s.name, f.id as family_id,
  ROUND(COALESCE(SUM(CASE WHEN ii.status IN ('open', 'partial') THEN ii.amount_due ELSE 0 END), 0), 2) as total_outstanding,
  ROUND(COALESCE(SUM(CASE WHEN CURRENT_DATE - last_payment_date > 90 THEN ii.amount_due ELSE 0 END), 0), 2) as over_90_days,
  MAX(f.last_contact_date) as last_contact,
  COALESCE(pp.status, 'none') as payment_plan_status,
  COUNT(fu.id) as engagements_30d
FROM students s
LEFT JOIN families f ON s.family_id = f.id
LEFT JOIN invoices ii ON s.id = ii.student_id
LEFT JOIN payment_plans pp ON s.id = pp.student_id AND pp.status = 'active'
LEFT JOIN follow_ups fu ON s.id = fu.student_id AND fu.created_at > CURRENT_DATE - 30
GROUP BY s.id, s.name, f.id, pp.status;
```

#### Implementation Tasks
- [ ] Design follow_ups, payment_plans tables (1d)
- [ ] Build Rust: CollectionsService (engagement scoring, escalation rules) (2d)
- [ ] Build Rust: Payment plan validation and schedule generation (1d)
- [ ] Frontend: ReceivablesDashboard (sortable, filterable list) (2d)
- [ ] Frontend: FollowUpTracker (log interactions, bulk actions) (2d)
- [ ] Frontend: PaymentPlanNegotiator (create/edit/track plans) (1.5d)
- [ ] Frontend: Collections Report (recovery rate, effectiveness) (1d)
- [ ] Integration: Auto-escalate rules, SMS/email triggering (Phase 3) (optional)
- [ ] Tests: Escalation logic, plan validation, scoring (1d)

#### Acceptance Criteria
- ✅ Dashboard shows 15 students >60 days overdue, 40,000 KES total
- ✅ Create follow-up "Call parent" for top 5 overdue students
- ✅ Negotiate payment plan: 5,000 KES weekly × 8 weeks
- ✅ Track 3 payments on plan; system alerts on missed payment
- ✅ Report: 12 payment plans active, 75% adherence rate

---

### Feature 6: Advanced Reporting (Week 6-8)
**Status:** Not started  
**Complexity:** Medium  
**Dependencies:** All Phase 2 features

#### Scope
School-specific dashboards with drill-down analytics on fees, transport, bursaries, and collections.

#### Reports
1. **Fee Revenue Report** (Director)
   - Revenue by fee type (tuition vs. activities vs. transport)
   - Variance: Budget vs. actual
   - By class: Class IV = 2.5M projected, 2.1M actual
   - Drill-down: Click "Class IV" → invoices, outstanding, payment terms

2. **Transport Profitability** (Director)
   - Revenue and cost per route
   - Occupancy trends (weekly)
   - Student acquisition/churn rate per route
   - ROI: Comparing routes

3. **Bursary Analysis** (Director)
   - Applications by status (submitted, approved, rejected)
   - Total disbursed vs. budget
   - Approval rate by criteria
   - By class distribution

4. **Collections Analytics** (Bursar)
   - Payment velocity: Days-to-pay by cohort
   - Default rate: % of invoices never paid
   - Collections efficiency: Cost per 1,000 KES recovered
   - Follow-up effectiveness: Conversion rate

#### Implementation Tasks
- [ ] Build Rust: ReportService (aggregation, drill-down queries) (2d)
- [ ] Frontend: FeeRevenueReportViewer (charts, tables, drill-down) (1.5d)
- [ ] Frontend: TransportROIReport (route comparison, trends) (1d)
- [ ] Frontend: BursaryAnalyticsViewer (distribution, approval rates) (1d)
- [ ] Frontend: CollectionsAnalyticsViewer (velocity, recovery, efficiency) (1.5d)
- [ ] Tests: Report calculations, filtering, drill-down (1d)

#### Acceptance Criteria
- ✅ Fee report: Class IV revenue 2.1M, Class III 1.8M
- ✅ Click "Class IV" → see 45 invoices, 1.2M outstanding
- ✅ Transport report: Route A 88% occupancy, 162K monthly revenue
- ✅ Bursary report: 12 approved (500K total), 3 rejected, 5 pending
- ✅ Collections report: Avg days-to-pay = 18 days, default rate 3%

---

## 🏗️ Architecture & Design Decisions

### 1. Fee Rules Engine: Conditions Model
```json
{
  "conditions": {
    "class": "IV",
    "stream": null,
    "cohort_year": 2019,
    "new_student": false
  },
  "discounts": [
    { "type": "sibling", "percentage": 10 },
    { "type": "scholarship", "percentage": 0 }
  ]
}
```
- Flexible JSON for easy rule extension
- NULL means "match any" (wildcard)
- Order-dependent: Earlier rules override later ones

### 2. Transport: Pro-Rata Calculation
```
Scenario: Route A = 3,000 KES/month (30 days)
Student joins May 15 → 15 days remaining in May
Charge = 3,000 × (15/30) = 1,500 KES

If student exits May 28 (exit_date = 2026-05-28):
Refund = 3,000 × (2/30) = 200 KES
```
- Stored procedure to auto-calculate on assignment/exit
- Adjustments queued for approval

### 3. Inventory: Cost Accounting
- `unit_cost`: Actual school acquisition cost
- `student_price`: Charge to student (markup)
- COGS tracked via allocation → GL posting
- Monthly inventory reconciliation report

### 4. Collections: Engagement Scoring
```
Score = 
  10 × (days_current / 30) +       // Recency (0-10)
  5 × (COUNT_follow_ups / 5) +     // Frequency (0-5)
  -15 × (days_overdue > 90) +      -- Penalty (0 or -15)
  +10 × (payment_plan_active)
  
Priority = DESC ORDER by Score
```
- High score = responsive family, low follow-up urgency
- Low score = at-risk, needs escalation

### 5. Payment Plans: Validation Rules
```
1. Total amount ≤ total_outstanding
2. Installment count ≥ 2, ≤ 26 (half-year max)
3. Installment interval ≥ 7 days
4. Warn if family already has active plan
5. GL account: Deferred Revenue (liability)
```

---

## 📊 Data Integration Points

### From Phase 1
- **students** table → Used in all Phase 2 features
- **student_invoices** → Transport/fees link here
- **accounts** → GL mapping for all charges
- **events** → Audit trail for scholarship/plan changes

### New Data Flows
```
Fee Rules Engine:
  Rule change → Event created → Historical invoice recalc (async)

Transport:
  Route change → Pro-rata calc → Charge created → Invoice line item

Bursary:
  Award approved → Scholarship created → Invoice calc → GL posting

Collections:
  Payment plan agreed → Schedule generated → Payment tracking → Escalation rule check
```

---

## 🧪 Testing Strategy (Phase 2)

### Unit Tests (Rust)
- `CalculateFeeService::apply_rules()` — All condition combos
- `CalculateFeeService::apply_scholarships()` — % discounts
- `TransportBillingService::pro_rata_calc()` — Join/exit dates
- `CollectionsService::engagement_score()` — Score algorithm
- `PaymentPlanService::validate_plan()` — Validation rules

### Integration Tests
- Bulk invoice generation from fee rules (22 tables touched)
- Transport assignment → charge generation → GL posting
- Bursary award → scholarship update → invoice recalc
- Payment plan schedule → payment allocation → plan adherence
- Offline sync: All events queue correctly

### E2E Tests (Playwright/Cypress)
- **Fee engine:** Create rule → Bulk generate invoices → Verify GL
- **Transport:** Add route → Assign 20 students → Pro-rata June charge
- **Bursary:** Submit app → Approve → Verify discount on invoice
- **Payment plan:** Create plan for 5,000 KES → Pay 1,500 → See "Partial"
- **Collections:** Mark overdue → Log follow-up → Escalate to management queue

### Performance Tests
- Bulk invoice generation: 500 students in <5s
- Report query: 22 tables, 10K invoices in <2s
- Sync: 100 events (mixed fee/transport/bursary) in <1s

---

## 🚀 Implementation Timeline

| Week | Feature | Tasks | Deliverable |
|------|---------|-------|-------------|
| 1-3 | Fee Engine | Schema, Rust service, UI, tests | Fee rules working end-to-end |
| 2-4 | Transport | Schema, billing service, assignment UI, reports | 50 students on routes, charges tracked |
| 3-4 | Inventory | Schema, allocation service, item manager UI | Uniforms bundled with Year 1 invoices |
| 4-5 | Bursary | Schema, approval workflow, GL integration | 10 applications processed |
| 5-7 | Collections CRM | Follow-up tracker, payment plans, escalation | 15 payment plans active |
| 6-8 | Reporting | All dashboards, drill-down, performance tuning | Directors dashboard live |
| 8 | Testing & Polish | Load tests, offline sync, edge cases | Production candidate |

---

## 📈 Success Criteria

By end of Phase 2:
- [ ] 100% of invoices auto-generated from fee rules (no manual creation)
- [ ] 95%+ attendance on payment plans (vs. 70% current default rate)
- [ ] Transport occupancy trending data available (enable capacity planning)
- [ ] 20+ bursary applications processed
- [ ] Collections follow-up time 50% reduction (automation + scoring)
- [ ] All Phase 2 reports available and drill-downable
- [ ] Zero blocking issues (all critical bugs fixed)
- [ ] Offline + online sync 100% data fidelity

---

## 🔄 Rollback Plan

If a feature encounters critical issues:
1. **Fee Rules:** Revert to Phase 1 manual invoice creation
2. **Transport:** Disable billing; students continue as non-transport
3. **Bursary:** Flag applications as pending (no disbursements)
4. **Collections:** Disable CRM features; use aging reports only
5. **All:** Event log allows historical replay to any point

---

## 📝 Dependencies on Phase 3

- **M-Pesa Integration:** Needed for auto-payment from transport charges
- **SMS/Email Triggers:** Collections escalation rules require messaging
- **API Layer:** External systems (student info systems, bank) connect here
- **Multi-campus:** Fee rules, transport routes scoped per campus

---

## 🎯 Next Steps After Phase 2

1. **Hardening:** Load test with 2,000+ students
2. **East Africa Localization:** Swahili UI, KES-specific reporting
3. **School Customization:** Config-driven rule engine (school-specific fee types)
4. **Mobile:** Read-only Collections CRM app (follow-ups on mobile)
5. **Phase 3 Planning:** Payroll, AP, integrations

---

**Document Status:** Draft (April 6, 2026)  
**Next Review:** May 6, 2026 (start of Phase 2)  
**Owner:** Development Team
