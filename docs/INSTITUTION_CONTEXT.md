# MAPLE School Finance ERP — INSTITUTION-CONTEXT BEHAVIOR SPECIFICATION

**Version:** 1.0.0  
**Last Updated:** 2025-07-14  
**Country Context:** Uganda (UGX, multi-campus private schools)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Institution Data Model](#2-institution-data-model)
3. [Session & Authentication Context](#3-session--authentication-context)
4. [Campus Scoping Rules](#4-campus-scoping-rules)
5. [Institution-Aware UI Behavior](#5-institution-aware-ui-behavior)
6. [Institution-Aware Forms](#6-institution-aware-forms)
7. [Institution-Aware Reports](#7-institution-aware-reports)
8. [Permission Scoping](#8-permission-scoping)
9. [Offline Context Rules](#9-offline-context-rules)
10. [Multi-Campus Operations](#10-multi-campus-operations)
11. [Institution Configuration Hierarchy](#11-institution-configuration-hierarchy)
12. [Monitoring & Health](#12-monitoring--health)
13. [Multi-Campus Expansion Guide](#13-multi-campus-expansion-guide)

---

## 1. Overview

MAPLE ERP operates within the context of a single **institution** (school) that may have multiple **campuses**. This specification defines how institution context flows through every layer of the system — from login to data isolation, UI rendering, reports, and offline behavior.

### Core Concepts

| Concept | Definition |
|---------|-----------|
| **Institution** | The top-level legal entity (e.g., "Maple Private School") |
| **Campus** | A physical campus within the institution (e.g., "Bugolobi Campus", "Kololo Campus") |
| **Session Context** | The active institution + campus + user + role for the current session |
| **Scope** | Which data a user can see/modify based on role and campus assignment |
| **Cross-Campus** | Operations that span multiple campuses (consolidation, transfers) |

### Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Single institution** | One ERP instance = one institution (school entity) |
| **Multi-campus** | 1-N campuses under one institution |
| **Data isolation** | Users see only their campus data by default |
| **Consolidation** | SUPER_ADMIN/DIRECTOR can see all campuses |
| **Portable** | Institution context stored locally for offline access |
| **Configurable** | Institution settings cascade: Institution → Campus → Department |

---

## 2. Institution Data Model

### 2.1 Entity Hierarchy

```
Institution (1)
├── Campus (1..N)
│   ├── Department (0..N)
│   │   ├── Employee (0..N)
│   │   └── Budget Lines (0..N)
│   ├── Class (1..N)
│   │   ├── Stream (0..N)
│   │   └── Student (0..N)
│   ├── Transport Route (0..N)
│   ├── Bank Account (0..N)
│   └── Inventory Location (0..N)
├── Chart of Accounts (shared)
├── Academic Year & Terms (shared)
├── Fee Rules (campus-scoped or shared)
├── Supplier Register (shared)
├── Payroll Structures (shared)
└── System Settings (institution-level)
```

### 2.2 Institution Entity

```typescript
interface Institution {
  id: string;
  name: string;                    // "Maple Private School"
  shortName: string;               // "MAPLE" or "MPS"
  tin: string;                     // URA Tax Identification Number
  moesRegistration?: string;       // MoES registration number
  logo?: Blob;                     // Institution logo (used on all documents)
  address: {
    line1: string;                // "Plot 12, Luthuli Avenue"
    line2?: string;               // "P.O. Box 12345, Kampala"
    city: string;                 // "Kampala"
    district?: string;            // "Kampala"
    country: string;              // "Uganda"
  };
  phone: string;                   // "+256 414 123456"
  email: string;                   // "info@maple.ac.ug"
  website?: string;                // "https://maple.ac.ug"
  currency: string;                // "UGX"
  timezone: string;                // "Africa/Kampala"
  fiscalYearStart: number;         // 1 (January)
  invoicePrefix: string;           // "INV"
  receiptPrefix: string;           // "RCT"
  defaultPaymentTermsDays: number; // 30
  pettyCashLimit: number;          // UGX max per voucher
  createdAt: string;
}
```

### 2.3 Campus Entity

```typescript
interface Campus {
  id: string;
  institutionId: string;
  campusName: string;              // "Bugolobi Campus"
  campusCode: string;              // "BUG"
  address?: string;                // "Plot 45, Luthuli Close, Bugolobi"
  phone?: string;                  // "+256 414 234567"
  email?: string;                  // "bugolobi@maple.ac.ug"
  headTeacherId?: string;          // Employee ID
  defaultBankAccountId?: string;   // Bank account for this campus
  active: boolean;
  createdAt: string;
}
```

### 2.4 Campus Assignment

Users are assigned to one or more campuses:

```typescript
interface UserCampusAssignment {
  userId: string;
  campusId: string;
  isPrimary: boolean;              // Primary campus (default on login)
  assignedAt: string;
  assignedBy: string;
}
```

**Assignment Rules:**
- SUPER_ADMIN: Automatically assigned to ALL campuses
- DIRECTOR: Automatically assigned to ALL campuses
- AUDITOR: Read access to ALL campuses
- BOARD_FINANCE_VIEWER: Read access to ALL campuses
- All other roles: Must be explicitly assigned to one or more campuses

---

## 3. Session & Authentication Context

### 3.1 Session Data Structure

When a user logs in, a session context is established:

```typescript
interface SessionContext {
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  permissions: string[];
  
  // Institution context
  institution: {
    id: string;
    name: string;
    shortName: string;
    logo?: string;                 // Base64 or file path
    currency: string;
    timezone: string;
  };
  
  // Campus context
  activeCampus: {
    id: string;
    campusName: string;
    campusCode: string;
  };
  assignedCampuses: Campus[];      // All campuses user can access
  isAllCampuses: boolean;          // true for SUPER_ADMIN, DIRECTOR
  
  // Session metadata
  loginTime: string;
  lastActivityTime: string;
  isOfflineMode: boolean;
  deviceId: string;
}
```

### 3.2 Login Flow with Campus Selection

```
User enters email + password
       │
       ▼
┌─────────────────┐
│ Validate        │── Invalid → Error "Invalid credentials"
│ Credentials     │
└────────┬────────┘
         │ Valid
         ▼
┌─────────────────┐
│ Load Institution│── Load institution data into context
│ Context         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     User has 1 campus?
│ Campus Count    │──── Yes → Auto-select → Dashboard
│ Check           │
└────────┬────────┘
         │ No (multiple campuses)
         ▼
┌─────────────────┐
│ Campus Selector │── User picks campus → Dashboard
│ Dialog          │
└─────────────────┘
```

### 3.3 Campus Switching (Runtime)

Users with multi-campus access can switch without re-authentication:

1. Header shows current campus name and dropdown selector
2. Switching campus:
   - Saves current page state
   - Updates `activeCampus` in session
   - Reloads current page data for new campus
   - Sidebar badges update (notification counts, pending approvals)
3. "All Campuses" option available only for SUPER_ADMIN, DIRECTOR, AUDITOR, BOARD

```
┌──────────────────────────────────────────┐
│ Header                                    │
│ ┌──────────────┐  ┌───────────────────┐  │
│ │ 🏫 MAPLE     │  │ Bugolobi Campus ▼│  │
│ └──────────────┘  ├───────────────────┤  │
│                    │ Bugolobi Campus ✓│  │
│                    │ Kololo Campus     │  │
│                    │ ─────────────────│  │
│                    │ All Campuses     │  │
│                    └───────────────────┘  │
└──────────────────────────────────────────┘
```

### 3.4 Session Timeout Rules

| Rule | Value | Behavior |
|------|-------|----------|
| Inactivity timeout | 30 minutes | Show warning at 25 min, auto-logout at 30 |
| Maximum session | 12 hours | Force re-login after 12 hours |
| Remember me | 30 days | Keep credentials cached for offline login |
| Concurrent sessions | Allowed | Same user on multiple devices |
| Session lock | On OS lock | Require re-entry of password |

---

## 4. Campus Scoping Rules

### 4.1 Data Scoping by Entity

Every data entity is scoped at one of three levels:

| Scope Level | Description | Example |
|-------------|-------------|---------|
| **Institution** | Shared across all campuses | Chart of Accounts, Suppliers, Fee templates |
| **Campus** | Belongs to one specific campus | Students, Classes, Routes, Petty Cash |
| **User** | Personal to the user | Preferences, saved filters, notifications |

### 4.2 Entity-Level Scoping Rules

| Entity | Scope | Campus Field | Cross-Campus Visible? |
|--------|-------|-------------|:----:|
| **Student** | Campus | `campusId` on class | No (unless cross-campus role) |
| **Class** | Campus | `campusId` | No |
| **Family** | Institution | — | Yes (children at different campuses) |
| **Student Invoice** | Campus | Via student → class → campus | No |
| **Payment** | Campus | Via family & bank | Logged at receiving campus |
| **Journal Entry** | Institution | Optional `campusId` | Yes (for consolidation) |
| **Chart of Accounts** | Institution | — | Always visible |
| **Bank Account** | Campus or Inst | Optional `campusId` | Configurable |
| **Employee** | Campus | `campusId` | No |
| **Payroll Run** | Campus or Inst | Optional `campusId` | Depends on scope |
| **Supplier** | Institution | — | Always visible |
| **Supplier Invoice** | Institution | — | Yes |
| **Fixed Asset** | Campus | `locationCampusId` | No |
| **Transport Route** | Campus | `campusId` | No |
| **Inventory Item** | Campus | `campusId` | No |
| **Budget** | Campus or Inst | Optional `campusId` | Depends on scope |
| **Bursary Request** | Campus | Via student | No |
| **Fee Rule** | Campus or Inst | Optional `campusScope[]` | Depends on scope |
| **Academic Year** | Institution | — | Always shared |
| **Policy Rule** | Institution | — | Always shared |
| **Audit Log** | Institution | `campusId` in context | Full access for auditors |

### 4.3 Query Scoping Logic

Every database query automatically applies campus filtering:

```rust
fn apply_campus_scope(query: &mut Query, session: &SessionContext) {
    if session.is_all_campuses {
        // SUPER_ADMIN, DIRECTOR: no filter (see all)
        return;
    }
    
    match session.active_campus.id.as_str() {
        "ALL" => {
            // User viewing all their campuses
            let campus_ids: Vec<&str> = session
                .assigned_campuses
                .iter()
                .map(|c| c.id.as_str())
                .collect();
            query.add_filter("campus_id IN (?)", campus_ids);
        }
        campus_id => {
            // Single campus mode
            query.add_filter("campus_id = ?", campus_id);
        }
    }
}
```

### 4.4 Cross-Campus Data Access

Some operations require cross-campus data access:

| Operation | Who Can Do It | How |
|-----------|--------------|-----|
| View consolidated reports | DIRECTOR, AUDITOR, BOARD | Select "All Campuses" |
| Transfer student between campuses | HEADTEACHER (both), SUPER_ADMIN | Student Transfer form with campus field |
| Transfer asset between campuses | BURSAR, SUPER_ADMIN | Asset Transfer form |
| Cross-campus bank transfers | BURSAR, DIRECTOR | Bank Transfer form (both accounts visible) |
| Family with children at different campuses | CASHIER, BURSAR | Family record is institution-wide |
| Consolidated payroll | PAYROLL_OFFICER, DIRECTOR | Select "All" campuses in payroll run |
| Cross-campus budget | BURSAR, DIRECTOR | Budget with scope = institution |

---

## 5. Institution-Aware UI Behavior

### 5.1 Branding

Institution branding appears throughout the UI:

| UI Element | Branding |
|-----------|----------|
| **Login page** | Institution logo + name |
| **Header bar** | Institution short name + campus name |
| **Sidebar footer** | Institution name, version |
| **Page titles** | Include campus name when scoped |
| **PDF headers** | Full institution name + logo + address |
| **Email templates** | Institution letterhead |
| **Receipt watermark** | Institution logo at 10% opacity |
| **Favicon** | Institution logo (16×16) |

### 5.2 Theme / Colors

Institution can configure brand colors:

```typescript
interface InstitutionTheme {
  primaryColor: string;       // e.g., "#1a5276" (MAPLE blue)
  accentColor: string;        // e.g., "#27ae60" (green)
  logoUrl?: string;           // Path to logo file
  faviconUrl?: string;        // 16×16 icon
  loginBackground?: string;   // Background image for login page
}
```

**Application in UI:**
- Sidebar active state uses `primaryColor`
- Action buttons use `primaryColor`
- Success states use `accentColor`
- Dashboard metric cards use brand gradient
- PDF documents use `primaryColor` for headers

### 5.3 Dashboard Context

The Dashboard renders differently based on context:

#### Single Campus View (Default)

```
┌─────────────────────────────────────────────────┐
│ Dashboard — Bugolobi Campus                      │
├─────────────────┬───────────────────────────────┤
│ Students: 420   │ Collection Rate: 78%           │
│ Revenue: 1.2B   │ Outstanding: 340M UGX         │
│ ...             │ ...                            │
└─────────────────┴───────────────────────────────┘
```

#### All Campuses View (SUPER_ADMIN/DIRECTOR)

```
┌─────────────────────────────────────────────────┐
│ Dashboard — All Campuses (Consolidated)          │
├───────────┬──────────┬──────────┬───────────────┤
│           │ Bugolobi │ Kololo   │ Total         │
├───────────┼──────────┼──────────┼───────────────┤
│ Students  │ 420      │ 380      │ 800           │
│ Revenue   │ 1.2B     │ 1.1B     │ 2.3B          │
│ Collected │ 78%      │ 82%      │ 80%           │
│ Arrears   │ 340M     │ 250M     │ 590M          │
└───────────┴──────────┴──────────┴───────────────┘
```

### 5.4 Sidebar Badge Context

Sidebar badges (notification counts) are campus-scoped:

| Badge | Scope | Shows |
|-------|-------|-------|
| Pending Approvals | User's campus(es) | Count of items needing user's approval |
| Overdue Invoices | Active campus | Students with overdue balances |
| Low Stock Alerts | Active campus | Items below reorder level |
| Sync Queue | Device | Pending sync items count |
| Follow-Up Due | Active campus | Collections follow-ups due today |

### 5.5 Currency Display

All monetary values display according to institution settings:

```typescript
function formatCurrency(amount: number, session: SessionContext): string {
  const currency = session.institution.currency; // "UGX"
  
  // UGX: No decimals, thousands separator with commas
  if (currency === "UGX") {
    return `UGX ${amount.toLocaleString('en-UG', { 
      maximumFractionDigits: 0 
    })}`;
  }
  
  // Default: 2 decimal places
  return `${currency} ${amount.toLocaleString('en-UG', { 
    minimumFractionDigits: 2 
  })}`;
}
```

**Examples:**
- `UGX 2,700,000` (no decimals for UGX)
- `UGX 0` (never negative display without explicit debit/credit context)
- Input fields: numeric with thousands separator, no decimal entry for UGX

### 5.6 Date & Time Display

```typescript
function formatDate(date: string, session: SessionContext): string {
  return new Date(date).toLocaleDateString('en-UG', {
    timeZone: session.institution.timezone, // "Africa/Kampala"
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  // Output: "14 Jul 2025"
}
```

---

## 6. Institution-Aware Forms

### 6.1 Form Context Injection

Every form receives the session context and applies these behaviors:

| Form Behavior | Context Source | Implementation |
|--------------|---------------|----------------|
| **Campus field** | `activeCampus` | Auto-populated, hidden if single campus |
| **Currency labels** | `institution.currency` | "Amount (UGX)" |
| **Phone validation** | Country = Uganda | +256 format validation |
| **TIN format** | Uganda URA | 10-digit validation |
| **Academic levels** | Uganda curriculum | O-Level (S1-S4), A-Level (S5-S6) |
| **Terms** | Uganda school calendar | Term 1, Term 2, Term 3 |
| **Date format** | `institution.timezone` | DD/MM/YYYY display, ISO storage |
| **Tax calculations** | URA brackets | PAYE, NSSF, LST |
| **Bank names** | Uganda banks | Stanbic, Centenary, dfcu, BoA |
| **Mobile money** | Uganda providers | MTN MoMo, Airtel Money |

### 6.2 Auto-Population Rules

Forms auto-populate fields from context:

| Field | Source | Override? |
|-------|--------|:---:|
| Campus | Session `activeCampus` | Yes (if multi-campus) |
| Academic Year | Current active year | Yes |
| Term | Current term based on date | Yes |
| Currency | Institution `currency` | No |
| Created By | Session `userId` | No |
| Created At | Current timestamp | No |
| Invoice Prefix | Institution `invoicePrefix` | No |
| Receipt Prefix | Institution `receiptPrefix` | No |
| Default Payment Terms | Institution `defaultPaymentTermsDays` | Yes |
| Default Bank Account | Campus `defaultBankAccountId` | Yes |

### 6.3 Lookup Field Scoping

Dropdown / search fields filter based on context:

| Lookup Field | Scoping Rule |
|-------------|-------------|
| Student | Active campus only (unless cross-campus role) |
| Class | Active campus only |
| Employee | Active campus only |
| Transport Route | Active campus only |
| Inventory Item | Active campus only |
| Bank Account | Campus-assigned or institution-wide |
| GL Account | Institution-wide (shared) |
| Supplier | Institution-wide (shared) |
| Family | Institution-wide (may have cross-campus children) |
| Department | Active campus or institution shared |

### 6.4 Number Sequence Generation

Auto-generated numbers include campus context:

```
Invoice:  INV-{CAMPUS_CODE}-{YYYY}-{SEQUENCE}
          INV-BUG-2025-00142

Receipt:  RCT-{CAMPUS_CODE}-{YYYY}-{SEQUENCE}
          RCT-BUG-2025-01583

Journal:  JE-{YYYY}-{SEQUENCE}  (institution-wide, no campus prefix)
          JE-2025-00089

Employee: EMP-{CAMPUS_CODE}-{SEQUENCE}
          EMP-BUG-0045

Asset:    FA-{CAMPUS_CODE}-{YYYY}-{SEQUENCE}
          FA-KOL-2025-0012

PO:       PO-{CAMPUS_CODE}-{YYYY}-{SEQUENCE}
          PO-BUG-2025-0003
```

When campus code is included:
- Numbers are unique within the campus
- Cross-campus uniqueness ensured by code prefix
- Offline numbers use device suffix (resolved on sync)

---

## 7. Institution-Aware Reports

### 7.1 Report Scope Selector

Every report includes a campus scope selector:

```
┌─────────────────────────────────────────┐
│ Report: Fee Collection Summary          │
│                                         │
│ Campus: [Bugolobi ▼]  [All Campuses]    │
│ Term:   [Term 2 ▼]                      │
│ Year:   [2025 ▼]                        │
│                                         │
│ [Generate Report]                       │
└─────────────────────────────────────────┘
```

### 7.2 Report Header

All generated reports include:

```
┌─────────────────────────────────────────────┐
│ [Logo]  MAPLE PRIVATE SCHOOL                │
│         Bugolobi Campus                     │
│         Plot 12, Luthuli Avenue, Bugolobi   │
│         P.O. Box 12345, Kampala, Uganda     │
│         Tel: +256 414 123456                │
│         TIN: 1000123456                     │
│                                             │
│ FEE COLLECTION SUMMARY                     │
│ Term 2, 2025                               │
│ Generated: 14 Jul 2025 at 14:32 EAT       │
│ Generated by: John Mukasa (Bursar)         │
└─────────────────────────────────────────────┘
```

### 7.3 Consolidated vs Campus Reports

| Report Mode | Content | Footer |
|-----------|---------|--------|
| **Single Campus** | Data from selected campus only | "Campus: Bugolobi" |
| **All Campuses** | Aggregated data, with per-campus breakdown | "Consolidated: All Campuses" |
| **Comparative** | Side-by-side campus columns | Campus names as column headers |

**Consolidation Rules:**
- Revenue/expenses are summed across campuses
- Inter-campus transactions are eliminated in consolidated view
- GL trial balance shows consolidated with optional campus detail
- Student counts are summed
- Collection rates are weighted averages

### 7.4 Report Access by Role

| Report Category | SUPER_ADMIN | DIRECTOR | BURSAR | ACCOUNTANT | CASHIER | AUDITOR | BOARD |
|----------------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Financial Statements | ✓ All | ✓ All | ✓ Campus | ✓ Campus | — | ✓ All | ✓ All |
| Fee Reports | ✓ All | ✓ All | ✓ Campus | ✓ Campus | ✓ Campus | ✓ All | ✓ All |
| Payroll Reports | ✓ All | ✓ All | ✓ Campus | — | — | ✓ All | — |
| Student Reports | ✓ All | ✓ All | ✓ Campus | — | ✓ Campus | ✓ All | — |
| Audit Reports | ✓ All | ✓ All | — | — | — | ✓ All | — |
| Budget Reports | ✓ All | ✓ All | ✓ All | — | — | ✓ All | ✓ All |

---

## 8. Permission Scoping

### 8.1 Permission Model

Permissions are structured as: `{module}.{action}.{scope}`

```
Examples:
  students.create.campus       — Create students at own campus
  invoices.view.all           — View invoices across all campuses
  payroll.approve.campus      — Approve payroll for own campus
  reports.export.all          — Export reports for all campuses
  settings.edit.institution   — Edit institution-level settings
```

### 8.2 Scope Levels

| Scope | Description | Who Gets It |
|-------|-------------|-------------|
| `own` | Only records created by this user | Rarely used (cashier viewing own receipts) |
| `campus` | Records at user's assigned campus(es) | Most operational roles |
| `all` | All records across all campuses | SUPER_ADMIN, DIRECTOR, AUDITOR |
| `institution` | Institution-level settings/config | SUPER_ADMIN only |

### 8.3 Role → Permission Mapping

#### SUPER_ADMIN
```
*.*.all                    — Full access to everything
settings.edit.institution  — Can modify institution settings
users.manage.all           — Create/edit/deactivate users
roles.manage.institution   — Modify role permissions
```

#### DIRECTOR
```
*.view.all                 — Can view everything across campuses
*.approve.all              — Can approve any transaction
reports.export.all         — Can export any report
settings.view.institution  — Can view (not edit) institution settings
```

#### BURSAR
```
invoices.*.campus          — Full invoice CRUD at campus
payments.*.campus          — Full payment CRUD at campus
journals.*.campus          — Full journal CRUD at campus
budget.*.all               — Budget across all campuses
reports.*.campus           — All reports at campus level
payroll.approve.campus     — Approve payroll
ap.*.campus                — Full AP access
treasury.*.campus          — Treasury operations
```

#### ACCOUNTANT
```
journals.create.campus     — Create journal entries
journals.view.campus       — View journals
invoices.create.campus     — Create invoices
ap.create.campus          — Enter supplier bills
reports.view.campus        — View reports
```

#### CASHIER
```
payments.create.campus     — Record payments
payments.view.campus       — View payment history
receipts.print.campus      — Reprint receipts
invoices.view.campus       — View (not create) invoices
students.view.campus       — View student records
```

#### ADMISSIONS_OFFICER
```
students.create.campus     — Register students
students.edit.campus       — Edit student records
families.*.campus          — Family management
bursaries.create.campus    — Submit bursary applications
```

#### HEADTEACHER
```
students.*.campus          — Full student management
classes.*.campus           — Class management
bursaries.approve.campus   — Recommend bursaries
reports.view.campus        — View academic/financial reports
```

#### TRANSPORT_MANAGER
```
transport.*.campus         — Full transport management
students.view.campus       — View student records
```

#### STOREKEEPER
```
inventory.*.campus         — Full inventory management
students.view.campus       — View students (for issuance)
```

#### PAYROLL_OFFICER
```
employees.*.campus         — Employee management
payroll.create.campus      — Run payroll
payroll.view.campus        — View payroll history
```

#### DEPARTMENT_HEAD
```
budget.create.campus       — Create departmental budget
budget.view.campus         — View budget vs actual
po.create.campus           — Create purchase orders
reports.view.campus        — View departmental reports
```

#### AUDITOR
```
*.view.all                 — Read-only access to everything
audit.*.all                — Full audit log access
reports.export.all         — Export any report
```

#### BOARD_FINANCE_VIEWER
```
reports.view.all           — View consolidated reports
budget.view.all            — View budget
budget.approve.all         — Approve budget
```

### 8.4 Permission Check Logic

```typescript
function checkPermission(
  session: SessionContext,
  module: string,
  action: string,
  entityCampusId?: string
): boolean {
  // 1. Check if role has the required permission
  const permKey = `${module}.${action}`;
  const permission = session.permissions.find(p => p.startsWith(permKey));
  
  if (!permission) return false;
  
  // 2. Extract scope
  const scope = permission.split('.')[2]; // 'own', 'campus', 'all', 'institution'
  
  // 3. Apply scope check
  switch (scope) {
    case 'all':
    case 'institution':
      return true;
      
    case 'campus':
      if (!entityCampusId) return true; // Institution-wide entity
      return session.assignedCampuses.some(c => c.id === entityCampusId);
      
    case 'own':
      // Check entity.createdBy === session.userId (done at query level)
      return true;
      
    default:
      return false;
  }
}
```

### 8.5 UI Permission Effects

| Permission State | UI Behavior |
|-----------------|-------------|
| No read permission | Menu item hidden, route redirects to 403 |
| Read only | Form fields are readonly, action buttons hidden |
| Read + Create | "New" button visible, form editable |
| Read + Edit | Edit button on records, form editable |
| Read + Delete | Delete button visible with confirmation |
| Read + Approve | Approve/Reject buttons on pending items |
| Read + Export | Export button on report viewers |
| Read + Print | Print button on documents |

---

## 9. Offline Context Rules

### 9.1 Context Caching

On successful login, the following context is cached locally:

```typescript
interface CachedContext {
  // Authentication
  credentials: {
    email: string;
    passwordHash: string;          // BCrypt hash for offline re-auth
    lastOnlineAuth: string;        // Timestamp of last server auth
    maxOfflineDays: number;        // 30 days default
  };
  
  // Institution
  institution: Institution;        // Full institution record
  campuses: Campus[];              // All campuses
  theme: InstitutionTheme;         // Brand colors/logo
  
  // User
  session: SessionContext;         // Full session data
  permissions: string[];           // Cached permission set
  
  // Reference data
  chartOfAccounts: ChartOfAccount[];
  academicYears: AcademicYear[];
  currentTerm: Term;
  feeRules: FeeRule[];
  taxConfig: TaxConfiguration;
  numberSequences: NumberSequence[];
}
```

### 9.2 Offline Login Rules

| Rule | Behavior |
|------|----------|
| Cached credentials valid | Allow login, show offline indicator |
| Cached credentials expired (>30 days) | Block login, require online auth |
| No cached credentials | Block login, require online auth |
| Password changed on server | Next online auth invalidates cache |
| Role changed on server | Next sync updates permissions |
| User deactivated on server | Next sync forces logout |

### 9.3 Campus Context Offline

When offline:
- Campus switching allowed (between cached campuses)
- Cannot add new campus or modify campus settings
- Data for all assigned campuses is available
- Cross-campus reports use cached data (may be stale)
- New records tagged with campus ID for sync routing

### 9.4 Offline Data Freshness

| Data Category | Cache Duration | Refresh Trigger |
|--------------|----------------|-----------------|
| Institution settings | Until changed | Any settings change |
| Campus list | Until changed | Campus added/removed |
| Chart of accounts | Until changed | Account created/modified |
| Fee rules | Termly | Term change / manual |
| Student roster | Daily | Login / background sync |
| Financial data | Real-time sync | Every transaction |
| Reports | Computed from local | Always from local data |
| Tax configuration | Until changed | Manual update |

---

## 10. Multi-Campus Operations

### 10.1 Student Transfer Between Campuses

```
Step 1: HEADTEACHER at origin campus initiates transfer
Step 2: System checks student balance (warn if arrears)
Step 3: HEADTEACHER at destination campus approves
Step 4: Student moved:
        - Class updated to destination campus class
        - Student campus ID updated
        - Financial history preserved (institution-wide family)
        - Transport assignment deactivated
        - Inventory items noted (uniforms may differ)
Step 5: Fee schedule regenerated for destination campus/class
Step 6: Audit trail records both campus IDs
```

### 10.2 Inter-Campus Financial Entries

When money moves between campuses (e.g., shared expenses):

```
Campus A pays for institution-wide insurance:

JE at Institution level:
  DR 6500 Insurance Expense           UGX 5,400,000
  CR 1210 Stanbic Bank (Campus A)     UGX 5,400,000

Allocation JE:
  DR 6500 Insurance (Campus B share)  UGX 2,700,000
  CR 6500 Insurance (Campus A offset) UGX 2,700,000
  
  Tagged: campus_a_id, campus_b_id
```

### 10.3 Consolidated Reporting

For consolidated "All Campuses" reports:

| Data Point | Consolidation Rule |
|-----------|-------------------|
| Revenue | Sum of all campuses |
| Expenses | Sum of all campuses |
| Student count | Sum of all campuses |
| Collection rate | Weighted average by billed amount |
| Cash position | Sum of all bank accounts |
| AR aging | Sum across campuses, detail available |
| Payroll | Sum by department across campuses |

### 10.4 Shared Resources

| Resource | Sharing Model |
|----------|--------------|
| Suppliers | Institution-wide; any campus can use |
| Chart of accounts | Institution-wide; all campuses use same CoA |
| Fee templates | Configurable; can be shared or campus-specific |
| Payroll structures | Institution-wide; grades apply across campuses |
| Tax configuration | Institution-wide; same URA rules |
| Academic calendar | Institution-wide; same terms for all campuses |
| Bank accounts | Can be shared or campus-specific |
| Transport routes | Campus-specific |
| Inventory | Campus-specific with transfer capability |

---

## 11. Institution Configuration Hierarchy

### 11.1 Configuration Cascade

Settings cascade from Institution → Campus → Department → User:

```
Institution Level (defaults)
    │
    ├── Currency: UGX
    ├── Timezone: Africa/Kampala
    ├── Fiscal Year Start: January
    ├── Payment Terms: 30 days
    ├── Petty Cash Limit: UGX 500,000
    ├── Approval Thresholds: { ... }
    │
    └── Campus Level (override)
        │
        ├── Default Bank Account: campus-specific
        ├── Head Teacher: campus-specific
        ├── Address: campus-specific
        ├── Phone: campus-specific
        │
        └── Department Level (override)
            │
            ├── Budget Lines: department-specific
            ├── Cost Center: department-specific
            └── Approval Limit: department-specific
```

### 11.2 Setting Resolution Order

When the system needs a configuration value:

```typescript
function resolveSetting(key: string, context: {
  institutionId: string,
  campusId?: string,
  departmentId?: string,
  userId?: string
}): any {
  // Check in order: User → Department → Campus → Institution → System Default
  
  if (context.userId) {
    const userSetting = getUserSetting(key, context.userId);
    if (userSetting !== undefined) return userSetting;
  }
  
  if (context.departmentId) {
    const deptSetting = getDepartmentSetting(key, context.departmentId);
    if (deptSetting !== undefined) return deptSetting;
  }
  
  if (context.campusId) {
    const campusSetting = getCampusSetting(key, context.campusId);
    if (campusSetting !== undefined) return campusSetting;
  }
  
  const instSetting = getInstitutionSetting(key, context.institutionId);
  if (instSetting !== undefined) return instSetting;
  
  return getSystemDefault(key);
}
```

### 11.3 Configurable Settings

| Setting | Level | Type | Default |
|---------|-------|------|---------|
| `currency` | Institution | ENUM | UGX |
| `timezone` | Institution | ENUM | Africa/Kampala |
| `fiscal_year_start` | Institution | INTEGER (month) | 1 (January) |
| `invoice_prefix` | Institution | TEXT | INV |
| `receipt_prefix` | Institution | TEXT | RCT |
| `payment_terms_days` | Institution | INTEGER | 30 |
| `petty_cash_limit` | Institution / Campus | CURRENCY | 500,000 |
| `default_bank_account` | Campus | FK | — |
| `approval_threshold_payment` | Institution | CURRENCY | 5,000,000 |
| `approval_threshold_journal` | Institution | CURRENCY | 10,000,000 |
| `approval_threshold_supplier` | Institution | CURRENCY | 5,000,000 |
| `session_timeout_minutes` | Institution | INTEGER | 30 |
| `remember_me_days` | Institution | INTEGER | 30 |
| `offline_cache_days` | Institution | INTEGER | 30 |
| `period_grace_days` | Institution | INTEGER | 5 |
| `enforce_budget_check` | Institution | BOOLEAN | true |
| `allow_over_budget` | Institution | BOOLEAN | false (warn only) |
| `auto_allocate_payments` | Institution | BOOLEAN | true (FIFO) |
| `date_format` | Institution | ENUM | DD/MM/YYYY |
| `print_paper_size` | Institution | ENUM | A4 |
| `receipt_copies` | Campus | INTEGER | 2 |
| `sms_notifications` | Institution | BOOLEAN | false |
| `email_notifications` | Institution | BOOLEAN | true |

---

## 12. Monitoring & Health

### 12.1 System Health Dashboard (SUPER_ADMIN only)

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| Active Users | Currently logged in | — |
| Sync Queue Depth | Pending items to sync | > 100 items |
| Last Sync Time | Per device | > 24 hours ago |
| DB Size | SQLite database file size | > 2 GB |
| Offline Devices | Devices not synced recently | Any > 48 hours |
| Pending Approvals | Items awaiting approval | > 50 items |
| Error Rate | Failed operations per hour | > 5/hour |
| Audit Log Size | Total audit records | > 1M records |

### 12.2 Campus Health Card

Per-campus health indicators:

| Indicator | Green | Yellow | Red |
|-----------|-------|--------|-----|
| Collection Rate | > 80% | 60-80% | < 60% |
| Sync Status | All synced | < 4 hours behind | > 4 hours behind |
| Budget Compliance | < 90% spent | 90-100% | > 100% (over) |
| Overdue Invoices | < 10% | 10-25% | > 25% |
| Pending Approvals | < 5 items | 5-20 | > 20 |
| Staff Payroll | Current | 1 month behind | > 1 month |

### 12.3 Data Integrity Checks

Run automatically on each startup and daily at midnight:

| Check | Action |
|-------|--------|
| GL balance verification | Recalculate from events, compare to stored |
| AR sub-ledger reconciliation | Sum student balances = AR GL balance |
| AP sub-ledger reconciliation | Sum supplier balances = AP GL balance |
| Audit log hash chain | Verify no gaps or tampering |
| Number sequence gaps | Report missing sequence numbers |
| Orphan records | Records referencing deleted parents |
| Duplicate detection | Same invoice/receipt numbers |
| Period integrity | Postings only in open periods |

---

## 13. Multi-Campus Expansion Guide

### 13.1 Adding a New Campus

Step-by-step process for expanding to a new campus:

| Step | Action | Who |
|------|--------|-----|
| 1 | Create campus record (INST-002) | SUPER_ADMIN |
| 2 | Set up campus-specific bank accounts (INST-006) | SUPER_ADMIN |
| 3 | Create classes for new campus (INST-004) | SUPER_ADMIN |
| 4 | Configure fee rules for new campus (FEE-001) | BURSAR |
| 5 | Set up transport routes (TRN-001) | TRANSPORT_MANAGER |
| 6 | Assign employees to new campus | PAYROLL_OFFICER |
| 7 | Create user accounts for campus staff (AUTH-002) | SUPER_ADMIN |
| 8 | Assign users to new campus | SUPER_ADMIN |
| 9 | Configure campus-specific settings | SUPER_ADMIN |
| 10 | Register students (STU-001 or STU-008 bulk) | ADMISSIONS |
| 11 | Generate initial invoices (FEE-004) | BURSAR |
| 12 | Verify campus appears in all reports | BURSAR |

### 13.2 Campus Independence vs Shared Operations

| Operation | Independent | Shared |
|-----------|:-:|:-:|
| Student enrollment | ✓ | — |
| Fee billing | ✓ | — (unless shared fee rules) |
| Payment collection | ✓ | — |
| Journal entries | ✓ | Optional (institution-level) |
| Bank reconciliation | ✓ | — |
| Payroll | ✓ | Optional (merged run) |
| Transport | ✓ | — |
| Inventory | ✓ | — (transfer between) |
| Supplier management | — | ✓ |
| Chart of accounts | — | ✓ |
| Academic calendar | — | ✓ |
| Tax configuration | — | ✓ |
| Budget | ✓ | ✓ (consolidated view) |
| Audit | — | ✓ (institution-wide) |
| Financial statements | ✓ | ✓ (consolidated) |

### 13.3 Data Migration for New Campus

If a new campus is an existing school being absorbed:

1. **Import students** via bulk import (STU-008)
2. **Import opening balances** via manual JE (GL-001)
3. **Import assets** via bulk asset registration
4. **Import employees** with existing TIN/NSSF numbers
5. **Configure fee rules** for the campus
6. **Verify trial balance** after opening entry
7. **Run parallel** for one month before cutover

---

*End of INSTITUTION-CONTEXT BEHAVIOR specification.*
