# MAPLE School Finance ERP — Architecture Documentation

**Version:** 0.1.0 (Phase 1 MVP)  
**Last Updated:** April 6, 2026

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [Event Sourcing Pattern](#event-sourcing-pattern)
6. [Offline-First Sync Strategy](#offline-first-sync-strategy)
7. [Module Breakdown (Phase 1)](#module-breakdown-phase-1)
8. [Data Flow Diagrams](#data-flow-diagrams)
9. [Security Model](#security-model)
10. [Performance Considerations](#performance-considerations)

---

## System Architecture Overview

MAPLE is a desktop ERP built on a **hybrid architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│           React 19 Frontend (Tauri Webview)                 │
│  (Components, UI State, Offline-First Data Management)      │
└──────────────────────────┬──────────────────────────────────┘
                           │ IPC (Inter-Process Communication)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Rust Backend (Tauri Commands, Business Logic)              │
│  (Validation, Accounting Rules, Event Processing)           │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL Queries
                           ▼
┌─────────────────────────────────────────────────────────────┐
│   SQLite 3 (Event Store + Relational Data)                  │
│   (Immutable event log, GL balances, master data)           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Sync (Optional)
                           ▼
              Cloud Sync Server (Phase 3)
```

**Key Design Decisions:**

| Decision | Reason |
|----------|--------|
| **Tauri, not Electron** | Smaller bundle (2-8MB vs 150MB), faster, uses system Webview |
| **React + TypeScript** | Type safety for financial data, component-based UI |
| **Zustand State** | Lightweight offline-capable state management |
| **SQLite Local** | Zero-setup, ACID-compliant, perfect for offline-first |
| **Rust Backend** | Type safety, performance for calculations, financial math correctness |
| **Event Sourcing** | Immutable audit trail, conflict-free offline sync, regulatory compliance |

---

## Frontend Architecture

### Directory Structure

```
src/
├── components/
│   ├── accounting/          # GL, trial balance, journals
│   ├── school/              # Student invoices, families
│   ├── collections/         # Payments, aging, follow-ups
│   ├── auth/                # Login, permissions
│   ├── dashboard/           # KPI widgets
│   ├── reports/             # Report viewers
│   ├── Layout.tsx           # Main layout (sidebar + header)
│   ├── Header.tsx           # Top navigation
│   ├── Sidebar.tsx          # Side navigation
│   ├── OfflineIndicator.tsx # Offline mode badge
│   └── NotificationCenter.tsx # Toast notifications
│
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Accounting.tsx
│   ├── School.tsx
│   ├── Collections.tsx
│   └── Settings.tsx
│
├── store/
│   └── index.ts             # Zustand stores (auth, UI, sync)
│
├── types/
│   └── index.ts             # TypeScript domain models
│
├── services/
│   ├── api.ts               # HTTP client for sync
│   ├── validation.ts        # Form validation rules
│   └── offline-queue.ts     # Offline event queue manager
│
├── hooks/
│   ├── useAuth.ts           # Authentication
│   ├── useOfflineSync.ts    # Sync management
│   └── useAuditTrail.ts     # Audit logging
│
├── utils/
│   ├── format.ts            # Currency, date formatting
│   ├── validation.ts        # Business rule validators
│   └── constants.ts         # App-wide constants
│
├── App.tsx                  # Main app component + routing
├── index.tsx                # React entry point
└── index.css                # Global TailwindCSS styles
```

### Component Hierarchy

```
<App>                          # Router + auth check
├── <LoginPage>               # Authentication form
└── <Layout>                  # Main layout wrapper
    ├── <Sidebar>             # Navigation menu
    ├── <Header>              # User info + sync status
    └── <main>                # Page content
        ├── <DashboardPage>   # KPI dashboard
        ├── <AccountingPage>  # GL, journals, receipts
        ├── <SchoolPage>      # Students, invoices, families
        ├── <CollectionsPage> # Payments, aging, follow-ups
        └── <SettingsPage>    # Configuration
```

### State Management (Zustand)

Three separate stores for clarity:

**1. Auth Store** (`useAuthStore`)
```typescript
{
  user: User | null,
  session: AuthSession | null,
  isAuthenticated: boolean,
  isOfflineMode: boolean,
  setUser(user),
  setSession(session),
  logout(),
  hasPermission(permission),
  hasRole(role)
}
```

**2. UI Store** (`useUIStore`)
```typescript
{
  isSidebarOpen: boolean,
  currentModule: string,
  theme: 'light' | 'dark',
  notifications: Notification[],
  setSidebarOpen(open),
  setCurrentModule(module),
  setTheme(theme),
  addNotification(type, message),
  clearNotification(id)
}
```

**3. Sync Store** (`useSyncStore`)
```typescript
{
  isSyncing: boolean,
  lastSyncTime: Date | null,
  syncErrors: string[],
  pendingEvents: number,
  setSyncing(syncing),
  setLastSyncTime(time),
  addSyncError(error),
  clearSyncErrors(),
  setPendingEvents(count)
}
```

### Form Validation (Client-Side)

TailwindCSS + client-side validation in React:

```typescript
// Example: Invoice creation form
function InvoiceForm() {
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be positive';
    }
    if (parseFloat(amount) > 999999999.99) {
      newErrors.amount = 'Amount exceeds maximum value';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <input
      type="number"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      className={errors.amount ? 'border-red-500' : 'border-gray-300'}
    />
  );
}
```

---

## Backend Architecture

### Rust Module Structure

```
src/
├── main.rs          # App entry point, database initialization
├── db.rs            # SQLite database operations
├── models.rs        # Domain models (serialize/deserialize)
└── services.rs      # Business logic, validation
```

### Database Module (`db.rs`)

Provides low-level SQLite operations:

```rust
pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(path: &str) -> Result<Self> { ... }
    pub fn create_event(&self, event: &FinancialEvent) -> Result<()> { ... }
    pub fn get_pending_events(&self) -> Result<Vec<FinancialEvent>> { ... }
    pub fn mark_events_synced(&self, event_ids: &[String]) -> Result<()> { ... }
}
```

### Models Module (`models.rs`)

Serializable domain models:

```rust
pub struct FinancialEvent {
    pub id: String,
    pub event_type: String,           // 'invoice_created', 'payment_posted', etc.
    pub aggregate_id: String,         // Entity being changed
    pub aggregate_version: i32,       // For concurrency control
    pub timestamp: i64,               // Unix millis
    pub user_id: String,
    pub device_id: Option<String>,
    pub data: HashMap<String, Value>, // Event payload
    pub sync_status: String,          // 'local', 'synced', 'pending'
}

pub struct JournalEntry { ... }
pub struct StudentInvoice { ... }
pub struct Payment { ... }
```

### Services Module (`services.rs`)

Business logic and validation:

**AccountingService**
- `create_journal_entry()` — Validates debits = credits
- `create_invoice()` — Validates amount > 0
- `create_payment()` — Records payment event

**ValidationService**
- `validate_email()` — Email format check
- `validate_amount()` — Positive, 2 decimal places max
- `validate_date()` — YYYY-MM-DD format

---

## Database Design

### Core Tables

**1. `events`** (Immutable Event Log)
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  aggregate_version INTEGER NOT NULL,
  timestamp INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  device_id TEXT,
  data TEXT NOT NULL,  -- JSON
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMP,
  synced_at TIMESTAMP,
  conflict_notes TEXT
);
-- Every transaction recorded as immutable event
-- Indexed for fast queries by aggregate/timestamp
```

**2. `journal_entries` & `journal_line_items`**
```sql
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  reference_number TEXT UNIQUE,
  description TEXT,
  created_by TEXT FOREIGN KEY,
  status TEXT,  -- 'draft', 'submitted', 'approved', 'posted'
  ...
);

CREATE TABLE journal_line_items (
  id TEXT PRIMARY KEY,
  journal_entry_id TEXT FOREIGN KEY,
  account_id TEXT FOREIGN KEY,
  debit_amount DECIMAL(12,2),
  credit_amount DECIMAL(12,2),
  -- Constraint: only one of debit/credit is non-null
);

-- Trigger: Ensure journal entry balances
CREATE TRIGGER validate_journal_entry_balance
  AFTER INSERT ON journal_entries
  FOR EACH ROW
  BEGIN
    SELECT CASE
      WHEN (SUM(debit) - SUM(credit)) != 0
      THEN RAISE(ABORT, 'Journal must balance')
    END;
  END;
```

**3. `accounts` (Chart of Accounts)**
```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT,
  account_type TEXT,  -- 'asset','liability','equity','revenue','expense'
  parent_account_id TEXT FOREIGN KEY,  -- For hierarchies
  status TEXT,  -- 'active', 'inactive'
  ...
);
-- Supports nested accounts (e.g., 1000 > 1100 > 1110)
-- Views auto-calculate roll-up balances
```

**4. `student_invoices` & `invoice_line_items`**
```sql
CREATE TABLE student_invoices (
  id TEXT PRIMARY KEY,
  student_id TEXT FOREIGN KEY,
  family_id TEXT FOREIGN KEY,
  invoice_number TEXT UNIQUE,
  invoice_date DATE,
  due_date DATE,
  total_amount DECIMAL(12,2),
  paid_amount DECIMAL(12,2) DEFAULT 0,
  balance_amount DECIMAL(12,2),
  status TEXT,  -- 'draft','issued','partially_paid','fully_paid','overdue'
  ...
);

CREATE TABLE invoice_line_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT FOREIGN KEY,
  fee_type TEXT,  -- 'tuition','transport','uniform',etc
  amount DECIMAL(12,2),
  account_code_id TEXT FOREIGN KEY,  -- GL account
  ...
);
```

**5. `payments` & `payment_allocations`**
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  payment_number TEXT UNIQUE,
  family_id TEXT FOREIGN KEY,
  payment_date DATE,
  payment_method TEXT,  -- 'cash','cheque','bank_transfer',etc
  amount DECIMAL(12,2),
  status TEXT,  -- 'recorded','matched','reversed'
  ...
);

CREATE TABLE payment_allocations (
  id TEXT PRIMARY KEY,
  payment_id TEXT FOREIGN KEY,
  invoice_id TEXT FOREIGN KEY,
  allocated_amount DECIMAL(12,2),
  -- Allows partial/multiple allocation
);
```

**6. `audit_logs` (Complete Audit Trail)**
```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT,  -- 'create','update','delete','approve','post'
  entity_type TEXT,
  entity_id TEXT,
  user_id TEXT,
  timestamp TIMESTAMP,
  old_value TEXT,  -- JSON
  new_value TEXT,  -- JSON
  reason TEXT,
  ...
);
-- Every state change logged immutably
-- For regulatory compliance
```

### Calculated Views

**Trial Balance**
```sql
CREATE VIEW trial_balance AS
SELECT 
  a.id, a.code, a.name,
  SUM(CASE WHEN jli.debit_amount THEN jli.debit_amount ELSE 0 END) as debit,
  SUM(CASE WHEN jli.credit_amount THEN jli.credit_amount ELSE 0 END) as credit
FROM accounts a
LEFT JOIN journal_line_items jli ON a.id = jli.account_id
LEFT JOIN journal_entries je ON jli.journal_entry_id = je.id 
  AND je.status = 'posted'
GROUP BY a.id;
```

**Receivables Aging**
```sql
CREATE VIEW receivables_aging AS
SELECT 
  f.id, f.family_name,
  SUM(CASE WHEN due >= TODAY THEN balance ELSE 0 END) as current,
  SUM(CASE WHEN due < TODAY AND due >= DATE_SUB(TODAY, 30) THEN balance ELSE 0 END) as thirty_days,
  -- ... 60, 90+ days ...
  SUM(balance) as total
FROM families f
LEFT JOIN student_invoices si ON f.id = si.family_id
WHERE si.status IN ('issued','partially_paid','overdue')
GROUP BY f.id;
```

### SQLite Pragmas for Offline-First

```sql
PRAGMA journal_mode = WAL;          -- Write-Ahead Logging (fast, concurrent reads)
PRAGMA synchronous = NORMAL;        -- Balance safety + speed
PRAGMA cache_size = 10000;          -- Keep 2.5MB in RAM cache
PRAGMA temp_store = MEMORY;         -- Temporary tables in RAM
PRAGMA foreign_keys = ON;           -- Referential integrity
PRAGMA busy_timeout = 5000;         -- Wait 5s if locked
```

---

## Event Sourcing Pattern

### Philosophy

Instead of mutating data (CRUD), we **record events**:

```
Traditional (CRUD):
Invoice (BEFORE) → UPDATE status='paid' → Invoice (AFTER)
Problem: History lost, audit trail incomplete

Event Sourcing:
Event: InvoiceCreated(amount=100k, date=2026-04-06)
Event: PaymentPosted(amount=50k, invoice_id=INV-001)
Event: PaymentPosted(amount=50k, invoice_id=INV-001)
Event: PaymentAllocated(...)
Result: Can replay events to reconstruct state at any point
```

### Event Types (Phase 1)

```typescript
enum EventType {
  INVOICE_CREATED = 'invoice_created',
  PAYMENT_POSTED = 'payment_posted',
  JOURNAL_ENTRY = 'journal_entry',
  CREDIT_NOTE = 'credit_note',
  DEBIT_NOTE = 'debit_note',
  REVERSAL = 'reversal',
  ADJUSTMENT = 'adjustment',
}
```

### Event Structure

```typescript
interface FinancialEvent {
  id: string;              // uuid
  event_type: string;      // From above enum
  aggregate_id: string;    // Which invoice/payment/account this affects
  aggregate_version: number; // Optimistic locking
  timestamp: number;       // Unix ms (immutable)
  user_id: string;         // Who caused this
  device_id?: string;      // Which device (for offline tracking)
  data: {                  // Event-specific payload
    [key: string]: any;
  };
  sync_status: 'local' | 'synced' | 'pending' | 'conflict';
}
```

### Example: Invoice Event

```javascript
{
  id: 'evt_8f4c2a',
  event_type: 'invoice_created',
  aggregate_id: 'inv_001',
  aggregate_version: 1,
  timestamp: 1712448000000,  // 2026-04-06
  user_id: 'user_bursar',
  device_id: 'laptop_001',
  data: {
    invoice_number: 'INV-2026-001',
    student_id: 'std_145',
    family_id: 'fam_089',
    invoice_date: '2026-04-06',
    due_date: '2026-04-30',
    total_amount: 250000,  // KES
    line_items: [
      {
        fee_type: 'tuition',
        amount: 200000,
        account_id: 'gl_4001'
      },
      {
        fee_type: 'activity',
        amount: 50000,
        account_id: 'gl_4050'
      }
    ]
  },
  sync_status: 'local'
}
```

### Aggregate Versioning

Optimistic locking for concurrent edits:

```
Device A creates invoice (aggregate_version = 1)
Device B (offline) adds line item, expects version 1
When sync occurs:
  - Server has version 2 (B's changes synced first)
  - A's sync payload still references version 1
  - Conflict detected: ⚠️ CONFLICT
  - Resolution: Manual review + replay
```

---

## Offline-First Sync Strategy

### Principle

**Local SQLite is the source of truth. Cloud is for backup and multi-device sync.**

### Architecture

```
Device A (Offline)        Device B (Online)         Cloud Server
│                         │                         │
create invoice ──→ Event(version 1) ────────→ sync ────→ Store
payments recorded ────→ Event(version 2)    Queue    Accept
bank recon ───────→ Event(version 3)
│
[5 days offline, no sync]
│
connectivity restored ┌──────┐
                      │ Sync │
uploads events ───────→ Manager ──→ POST /sync
                      └──────┘
                        │
                  ┌─────┴──────┐
                  ▼            ▼
            Compare   Download
            versions  remote events
                 │
            ┌────┴──────┐
            ▼           ▼
         Match      Conflict
         ✓ Merge   ⚠ Review
```

### Sync Flow

**Step 1: Upload local events**
```
POST /api/sync
{
  device_id: "device_abc123",
  last_sync_timestamp: 1712000000,
  events: [
    { id: "evt_1", event_type: "invoice_created", ... },
    { id: "evt_2", event_type: "payment_posted", ... },
  ]
}
```

**Step 2: Server validates & stores**
- Re-validate all business rules (double-entry, amounts, etc.)
- Check for conflicts (same aggregate modified on multiple devices)
- Store in cloud database
- Return success + remote events

**Step 3: Client merges events**
```
local_events = [evt_1, evt_2]
remote_events = [evt_3, evt_4]  // Changes from Device B
merged = merge({ local: [...], remote: [...] })
// If conflicts found, add to conflict queue for human review
```

**Step 4: Update sync status**
```sql
UPDATE events 
SET sync_status = 'synced', synced_at = NOW()
WHERE id IN (evt_1, evt_2)
```

### Conflict Resolution

**Scenario:** Device A and B both edit the same invoice amount offline

```
Scenario 1: Same field, different values
└─ Device A: amount = 100,000
└─ Device B: amount = 120,000
└─ Resolution: Flag "conflict", show both versions, human chooses

Scenario 2: Different fields (safe merge)
└─ Device A: added line item
└─ Device B: changed due_date
└─ Resolution: Auto-merge (both changes applied)

Scenario 3: Incompatible state (GL integrity)
└─ Device A: posted invoice
└─ Device B: deleted invoice concurrently
└─ Resolution: Double-entry integrity violation, reject B's delete
```

### Conflict Detection Algorithm

```typescript
function detectConflicts(localEvents, remoteEvents): Conflict[] {
  const conflicts = [];
  
  for (let local of localEvents) {
    for (let remote of remoteEvents) {
      if (local.aggregate_id === remote.aggregate_id) {
        if (local.aggregate_version !== remote.aggregate_version) {
          // Same entity, different versions = conflict
          conflicts.push({
            aggregate_id: local.aggregate_id,
            local_version: local.aggregate_version,
            remote_version: remote.aggregate_version,
            suggested_resolution: 'manual_merge'
          });
        }
      }
    }
  }
  
  return conflicts;
}
```

### Retry & Backoff

```typescript
async function syncWithRetry(events) {
  const maxRetries = 5;
  let retryCount = 0;
  let backoff = 1000;  // Start 1s
  
  while (retryCount < maxRetries) {
    try {
      return await syncServer(events);
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) throw error;
      
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      await new Promise(r => setTimeout(r, backoff));
      backoff *= 2;
    }
  }
}
```

---

## Module Breakdown (Phase 1)

### 1. Accounting Module

**Purpose:** General ledger, journal entries, trial balance, basic financial statements.

**Key Components:**
- Chart of Accounts CRUD
- Journal Entry creation with auto double-entry
- GL posting with approval workflow
- Trial Balance calculated view
- P&L and Balance Sheet reports
- Period control (soft/hard close)

**Database Tables:**
- `accounts` — Master GL accounts
- `journal_entries`, `journal_line_items` — Posted GL transactions
- `audit_logs` — Every GL change

**User Flows:**
1. Bursar: Create chart of accounts
2. Accountant: Create journal entry (auto-generates offsetting entry)
3. Approver: Review & approve
4. Poster: Post to GL
5. Director: View trial balance

---

### 2. School Finance Module

**Purpose:** Student invoicing, family accounting, payment tracking.

**Key Components:**
- Student master records
- Family/household aggregation
- Invoice generation (manual or bulk)
- Invoice line items (tuition, activities, materials)
- Payment posting + receipt printing
- Student statements

**Database Tables:**
- `students` — Student master
- `families` — Family/guardian master
- `student_invoices`, `invoice_line_items` — AR transactions
- `payments`, `payment_allocations` — Collections

**User Flows:**
1. Admissions: Create student → link to family
2. Bursar: Generate invoices from template
3. Cashier: Post payment (cash, cheque, bank transfer)
4. Accounting: Allocate payment to invoices
5. Bursar: Print receipt
6. Parent Portal: View family statement

---

### 3. Collections & CRM Module

**Purpose:** Track payment status, aging analysis, follow-ups.

**Key Components:**
- Receivables aging (30/60/90+ days)
- Family payment status dashboard
- Collections activity tracking (calls, emails, promises)
- Payment plan setup
- Dispute management
- Collections reporting

**Database Tables:**
- `receivables_aging` — Calculated view
- (Phase 2: collections_activities, payment_plans)

**User Flows:**
1. Collections Officer: View top 20 debtors
2. Filter by days overdue (30/60/90+)
3. Click family → see all invoices + payment history
4. Log phone call / email sent
5. Record "promise to pay" by date
6. Monitor compliance

---

### 4. Settings & Configuration

**Purpose:** School info, user management, approval rules (basic), preferences.

**Key Components:**
- School information (name, registration, currency)
- User CRUD (staff accounts, roles)
- Role-based permissions
- Approval rules configuration
- Backup & restore
- Database info

**Database Tables:**
- `users` — Staff login accounts
- `approval_rules` — Configurable workflows

---

## Data Flow Diagrams

### Create Invoice Flow

```
UI (Bursar clicks "New Invoice")
  ↓
Form validation (client-side)
  ↛ Amount > 0? Due date valid?
  ↓
Create event → Zustand store
  ↓
Rust backend validation
  ↛ Student exists? Family linked? GL accounts mapped?
  ↓
Insert event into events table
  ↓
Calculate GL postings (view)
  ↓
Update student balance (view)
  ↓
Update family total (view)
  ↓
Log audit entry
  ↓
Return success → UI shows receipt
  ↓
Queue for sync (if offline)
  ↓
On reconnect: Upload to server
```

### Post Payment Flow

```
UI (Cashier clicks "Record Payment")
  ↓
Select family → Select invoices → Enter amount
  ↓
Form validation
  ↛ Amount > 0? Not exceeding total?
  ↓
Create Payment event
Create PaymentAllocated events (per invoice)
  ↓
Rust validates GL impact
  ↛ Bank/Cash account exists? GL balanced?
  ↓
Insert events → events table
  ↓
Trigger: Update invoice status
  ↛ If fully paid → status = 'fully_paid'
  ↛ If partial → status = 'partially_paid'
  ↓
Trigger: Update family balance
  ↓
Generate receipt (PDF from event data)
  ↓
Return receipt → UI
```

---

## Security Model

### Authorization (Role-Based Access Control)

**Roles & Permissions (Phase 1):**

| Role | Can Create | Can Post | Can Approve | Can View |
|------|-----------|---------|------------|----------|
| **Bursar** | Invoices, GL | No | No | All |
| **Accountant** | Journals | GL Entries | No | All |
| **Cashier** | Payments | Payments | No | Payments, Receipts |
| **Auditor** | No | No | No | All + Audit log |
| **Director** | No | No | No | Dashboard + Reports |

### Permission System

```typescript
// Fine-grained permissions
const USER_PERMISSIONS = {
  'view:invoices': true,
  'create:invoices': true,
  'approve:invoices': false,
  'post:payments': false,
  'view:audit_log': false,
  'post:gl': false,
};

// Check before rendering
{hasPermission('create:invoices') && <CreateInvoiceButton />}
```

### Segregation of Duties

- **Creator:** User who submits transaction
- **Approver:** User who reviews and approves
- **Poster:** User who posts to GL
- **Reconciler:** User who reconciles accounts

Prevents: "Same user creates AND approves AND posts"

### Data Sensitivity

- **Sensitive:** User passwords, payment method details
- **Moderate:** Student names, family contact info
- **Low:** Invoice amounts, GL balances

All stored encrypted at rest (Phase 2).

### Audit Trail

Every action logged:
```
action: 'create' | 'update' | 'delete' | 'approve' | 'post'
entity_type: 'invoice' | 'payment' | 'journal_entry'
entity_id: UUID
user_id: UUID
timestamp: ISO8601
old_value: JSON (what was)
new_value: JSON (what is)
reason: User-provided explanation (for reversals)
```

---

## Performance Considerations

### SQLite Optimizations

| Setting | Value | Why |
|---------|-------|-----|
| WAL mode | Default | Fast, concurrent reads + writes |
| Cache size | 10,000 pages | 2.5MB in RAM, reduces disk I/O |
| Synchronous | NORMAL | Balance ACID + speed |
| Temp store | MEMORY | Temporary tables in RAM |
| Busy timeout | 5s | Wait before "database locked" |

### Indexing Strategy

```sql
-- Quick lookups by common queries
CREATE INDEX idx_events_aggregate ON events(aggregate_id);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_student_invoices_family ON student_invoices(family_id);
CREATE INDEX idx_student_invoices_status ON student_invoices(status);
CREATE INDEX idx_payments_family ON payments(family_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

### Display Limits

- Default list view: 100 records (paginate)
- GL query: Limited to fiscal period
- Search results: Top 50 matches
- Charts: Last 24 months max

### Memory Management

Zustand store + local persistence plugin:
```typescript
const useAuthStore = create(
  persist(
    (set, get) => ({...}),
    { name: 'auth-storage' }  // Saves to IndexedDB
  )
);
```

---

## Next Steps (Implementation)

### Immediate (Week 1-2)
- [ ] Compile & run the React app (`npm run dev`)
- [ ] Test login (hardcoded demo user)
- [ ] Navigate between pages
- [ ] SQLite schema initialization on first run
- [ ] Basic journal entry form

### Short-term (Week 3-4)
- [ ] Journal entry posting to GL
- [ ] Trial balance calculation
- [ ] Invoice creation and amendment
- [ ] Payment posting and receipt generation
- [ ] Offline event queue

### Medium-term (Week 5-6)
- [ ] Bank reconciliation UI
- [ ] Period control (soft/hard close)
- [ ] Student statement report
- [ ] Family aging report
- [ ] Approval workflow UI

---

**Document Version:** 0.1.0  
**Last Reviewed:** April 6, 2026  
**Next Review:** May 1, 2026 (after Phase 1 MVP completion)
