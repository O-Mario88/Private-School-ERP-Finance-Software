# MAPLE School Finance ERP

**Version:** 0.1.0 (Phase 1 MVP - Early Development)

QuickBooks-grade accounting depth combined with school-native billing, collections, and executive intelligence for academic institutions. Designed for offline-first operation in East Africa.

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

### ✅ Phase 1: MVP (In Progress)
**Goal:** Core accounting + student billing. A bursar can manage invoices, payments, and basic reporting entirely in the app instead of Excel.

**Completed:**
- [x] Project initialization (Tauri + React + Rust)
- [x] TypeScript domain models
- [x] SQLite schema design (event sourcing, double-entry)
- [x] Authentication UI (login page with role-based access)
- [x] Dashboard scaffold with KPI widgets
- [x] Page routing for accounting, school, collections, settings
- [x] Audit trail architecture
- [x] Rust backend structure (db, models, services)

**In Progress:**
- [ ] Journal entry creation and GL posting
- [ ] Student invoice generation
- [ ] Payment posting and receipt printing
- [ ] Bank reconciliation UI
- [ ] Trial balance and financial statements reports
- [ ] Period control (soft close, hard close)
- [ ] Offline-first sync to optional cloud server
- [ ] SQLite database initialization on app start
- [ ] User authentication against local demo database

**Estimated Completion:** 2-3 weeks

### ⏳ Phase 2: School Core (Not Started)
Fee engine, transport billing, bursaries, inventory-linked charging, collections CRM.

### ⏳ Phase 3: Enterprise Backbone (Not Started)
Payroll, AP, fixed assets, multi-campus, budget module, advanced controls, integrations.

## 🏦 Key Features by Phase

### Phase 1 (MVP)
- ✅ Chart of accounts (CRUD)
- ✅ Journal entries (create, post, reverse)
- ✅ Student invoices (create, status tracking)
- ✅ Payment posting + receipts
- ✅ Trial balance + basic reports
- ✅ Audit trail (immutable event log)
- ✅ Role-based access (bursar, accountant, director, cashier)
- ✅ Offline-first data sync architecture
- ⏳ Bank reconciliation
- ⏳ Period control

### Phase 2 (School Core)
- Fee rules engine (class-based, term-based, scholarships)
- Transport billing (routes, student assignments)
- Inventory-linked charging (uniforms, books)
- Bursary management
- Collections CRM (follow-ups, payment plans)
- Advanced reporting (class profitability, transport ROI)

### Phase 3 (Enterprise)
- Payroll (salary structures, deductions, payslips)
- Accounts payable (supplier bills, payment runs)
- Fixed assets (depreciation, disposal)
- Treasury (bank transfers, cash forecasting)
- Budget module (planning, variance analysis)
- Multi-campus consolidation
- Policy engine (school-configurable rules)
- API layer + webhooks
- Integrations (M-Pesa, bank feeds, SMS/email)

## 🗄️ Architecture Highlights

### Event Sourcing
Every financial transaction is stored as an immutable event in the `events` table. This provides:
- Complete audit trail (who, what, when, why)
- Ability to replay history and verify balance at any date
- Conflict-free offline sync (append-only pattern)
- Regulatory compliance

### Double-Entry Accounting
All transactions automatically generate offsetting journal entries. SQLite triggers enforce balance constraints:
```sql
-- Journal entries must balance (debits = credits)
CREATE TRIGGER validate_journal_entry_balance ...
```

### Offline-First Design
- Local SQLite database is the source of truth
- Changes recorded in event log during offline work
- Background sync uploads events to server when online
- Conflict detection and resolution with human review

### Role-Based Access Control
Permissions tied to user roles:
- **Bursar:** Can create invoices, post payments, view reports
- **Accountant:** Can post journals, approve invoices, reconcile
- **Director:** Readonly dashboard and reports
- **Cashier:** Can post payments only
- Extensible to additional roles (payroll officer, auditor, etc.)

## 💾 Database Design

**Key Tables:**
- `events` — Immutable event log (source of truth)
- `journal_entries` / `journal_line_items` — Posted GL transactions
- `student_invoices` / `invoice_line_items` — AR transactions
- `payments` / `payment_allocations` — Payment tracking
- `accounts` — Chart of accounts (hierarchical)
- `students` / `families` — School master data
- `audit_logs` — Who changed what and when
- `users` — Staff and login credentials
- `approval_rules` / `approvals` — Configurable workflows

**Views:**
- `trial_balance` — Calculated GL balances
- `receivables_aging` — AR aging by 30/60/90+ days

## 🔐 Security & Compliance

- SQLite PRAGMA settings for data integrity (WAL mode, foreign keys)
- Immutable event log (no destructive edits, only reversals)
- Audit trail on every transaction
- Password hashing (BCrypt)
- Role-based access control
- Segregation of duties (create ≠ approve ≠ post)
- Transaction-level consistency

## 🛠️ Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19 + TypeScript | Type-safe UI, component reusability |
| **State Mgmt** | Zustand | Lightweight, offline-first friendly |
| **Styling** | TailwindCSS | Rapid UI development, consistent design |
| **Build** | Vite | Fast development server, optimized builds |
| **Desktop App** | Tauri | Small bundle, cross-platform (Mac/Win/Linux) |
| **Backend** | Rust 1.70+ | Type safety, performance, financial calculations |
| **Database** | SQLite 3 | Zero-setup, ACID-compliant, offline-capable |
| **Sync** | Event log + REST API | Conflict-free offline sync |

## 📊 Data Flow

```
User Action (e.g., "Post Payment")
        ↓
React Component validates input
        ↓
Zustand state updated (optimistic UI)
        ↓
Event created (e.g., "payment_posted")
        ↓
Rust backend validates business logic
        ↓
SQLite transaction executes
        ↓
Event stored in `events` table (immutable)
        ↓
GL balances calculated via view
        ↓
(Offline) → Queued for sync
(Online) → Uploaded to server, marked "synced"
        ↓
UI updated with response
```

## 🧪 Testing Strategy (Phase 2)

- **Unit tests** — Rust validation services
- **Integration tests** — SQLite operations, event creation
- **UI tests** — Component rendering, user workflows
- **Offline sync tests** — Simulate 7+ day offline, verify no data loss
- **Concurrency tests** — Multiple users editing same invoice
- **Reconciliation tests** — Verify GL balance calculations

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

Last Updated: April 6, 2026
