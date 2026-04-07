# MAPLE School Finance ERP — DATA CAPTURE / INPUT FORMS SPECIFICATION

**Version:** 1.0.0  
**Last Updated:** 2025-07-14  
**Country Context:** Uganda (UGX, URA TIN, PAYE/NSSF/LST, MTN MoMo/Airtel Money)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Form Architecture](#2-form-architecture)
3. [Module 1 — Authentication & User Management (5 Forms)](#3-module-1--authentication--user-management)
4. [Module 2 — Institution Setup (8 Forms)](#4-module-2--institution-setup)
5. [Module 3 — Student & Family Management (9 Forms)](#5-module-3--student--family-management)
6. [Module 4 — Fee Rules & Billing Engine (8 Forms)](#6-module-4--fee-rules--billing-engine)
7. [Module 5 — Invoice Management (6 Forms)](#7-module-5--invoice-management)
8. [Module 6 — Payments & Receipting (7 Forms)](#8-module-6--payments--receipting)
9. [Module 7 — Collections & Follow-Up (6 Forms)](#9-module-7--collections--follow-up)
10. [Module 8 — Transport (5 Forms)](#10-module-8--transport)
11. [Module 9 — Inventory & Store (6 Forms)](#11-module-9--inventory--store)
12. [Module 10 — Accounting & GL (8 Forms)](#12-module-10--accounting--gl)
13. [Module 11 — Payroll (8 Forms)](#13-module-11--payroll)
14. [Module 12 — Accounts Payable (7 Forms)](#14-module-12--accounts-payable)
15. [Module 13 — Treasury & Banking (5 Forms)](#15-module-13--treasury--banking)
16. [Module 14 — Fixed Assets (5 Forms)](#16-module-14--fixed-assets)
17. [Module 15 — Budget (5 Forms)](#17-module-15--budget)
18. [Module 16 — Scholarships & Bursaries (4 Forms)](#18-module-16--scholarships--bursaries)
19. [Cross-Cutting Concerns](#19-cross-cutting-concerns)
20. [Appendix A — Validation Rules Reference](#20-appendix-a--validation-rules-reference)
21. [Appendix B — Role-Form Permission Matrix](#21-appendix-b--role-form-permission-matrix)
22. [Appendix C — Offline Behavior Matrix](#22-appendix-c--offline-behavior-matrix)

---

## 1. Overview

This specification defines **104 data-capture forms** across **16 functional modules** for the MAPLE School Finance ERP. Each form is described with:

- **Field-level schema** (name, type, constraints, default, help text)
- **Validation rules** (client-side and server-side)
- **Workflow states** (draft → submitted → approved → posted)
- **Offline behavior** (which forms work offline, queue behavior)
- **Approval rules** (who must approve, thresholds)
- **Role mapping** (which roles can create, edit, view, approve, delete)
- **Uganda context** (UGX, TIN, PAYE/NSSF/LST, MoES references)

### Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Offline-first** | All forms save to local SQLite immediately; sync queue handles upload |
| **Event-sourced** | Every form submission creates an immutable FinancialEvent |
| **Audit-complete** | Every field change logged with userId, timestamp, old/new value |
| **Role-gated** | Forms only render for users with the required permission |
| **Uganda-localized** | Currency UGX, tax TIN, statutory deductions PAYE/NSSF/LST |

### Field Type Reference

| Type Code | Description | Storage |
|-----------|-------------|---------|
| `TEXT` | Free-text input ≤ 255 chars | `VARCHAR(255)` |
| `LONGTEXT` | Multi-line text ≤ 2000 chars | `TEXT` |
| `INTEGER` | Whole number | `INTEGER` |
| `DECIMAL(p,s)` | Fixed-point number with p digits, s scale | `REAL` |
| `CURRENCY` | UGX amount, displayed with thousands separator | `INTEGER` (store in whole shillings) |
| `DATE` | Calendar date (YYYY-MM-DD) | `TEXT` |
| `DATETIME` | Timestamp (ISO 8601) | `TEXT` |
| `BOOLEAN` | Toggle true/false | `INTEGER (0/1)` |
| `ENUM(values)` | Dropdown/select from predefined list | `TEXT` |
| `UUID` | Auto-generated unique identifier | `TEXT` |
| `EMAIL` | Email with validation | `TEXT` |
| `PHONE` | Uganda phone format (+256...) | `TEXT` |
| `FILE` | File upload (image/PDF) | `BLOB` or path |
| `SEARCH` | Autocomplete lookup against another entity | `TEXT (FK)` |

---

## 2. Form Architecture

### 2.1 Form Component Structure

Every form in the system follows a consistent React component pattern:

```
FormContainer
├── FormHeader (title, breadcrumb, save/cancel buttons)
├── FormBody
│   ├── FormSection (collapsible, with section title)
│   │   ├── FormField (label + input + validation + help)
│   │   └── ...
│   └── ...
├── FormFooter (action buttons: Save Draft, Submit, Approve, Post)
└── FormAuditTrail (expandable log of all changes)
```

### 2.2 Form States

```
┌──────────┐    Submit    ┌───────────┐   Approve   ┌──────────┐    Post     ┌────────┐
│  DRAFT   │────────────→│ SUBMITTED │────────────→│ APPROVED │───────────→│ POSTED │
└──────────┘              └───────────┘              └──────────┘            └────────┘
     │                         │                          │                      │
     │         Reject          │                          │      Reverse         │
     │◄────────────────────────┘                          │◄─────────────────────┘
     │                                                    │
     ▼                                                    ▼
┌──────────┐                                        ┌──────────┐
│ DELETED  │                                        │ REVERSED │
└──────────┘                                        └──────────┘
```

### 2.3 Offline Queue Behavior

When offline, forms save locally and enqueue a sync event:

1. User fills form → Saves to local SQLite with `syncStatus = 'LOCAL'`
2. Sync engine detects connectivity → Pushes events to server
3. Server processes → Returns acknowledgment → `syncStatus = 'SYNCED'`
4. Conflict detected → `syncStatus = 'CONFLICT'` → User resolves manually

### 2.4 Validation Layers

| Layer | When | Where |
|-------|------|-------|
| **Field-level** | onChange/onBlur | React component (instant feedback) |
| **Form-level** | onSubmit | React form handler (cross-field rules) |
| **Business rule** | Pre-save | Rust backend service (amount limits, period checks) |
| **Database** | Insert/Update | SQLite constraints (FK, UNIQUE, NOT NULL) |

---

## 3. Module 1 — Authentication & User Management

### Form 1.1: Login

| Property | Value |
|----------|-------|
| **Form ID** | `AUTH-001` |
| **Title** | Sign In |
| **Roles** | All (unauthenticated) |
| **Offline** | Yes (cached credentials for 30 days) |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Email | EMAIL | Yes | Valid email format | — | Your registered email address |
| 2 | Password | TEXT | Yes | Min 8 chars | — | Case-sensitive |
| 3 | Remember Me | BOOLEAN | No | — | `false` | Keep session for 30 days |
| 4 | Campus | ENUM(campuses) | Conditional | Required if multi-campus | Auto-select if 1 | Select campus to log into |

**Validation Rules:**
- `V-AUTH-001`: Email must match a registered user
- `V-AUTH-002`: Password must match stored BCrypt hash
- `V-AUTH-003`: User must have `isActive = true`
- `V-AUTH-004`: After 5 failed attempts, lock for 15 minutes

**Offline Behavior:**
- Cache last successful credentials (hashed) locally
- Allow offline login if credentials match cached hash
- Display OfflineIndicator badge on successful offline login
- Queue login event for server when connectivity resumes

---

### Form 1.2: User Registration (Admin Only)

| Property | Value |
|----------|-------|
| **Form ID** | `AUTH-002` |
| **Title** | Create User Account |
| **Roles** | SUPER_ADMIN |
| **Offline** | Yes (syncs when online) |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | First Name | TEXT | Yes | 2-50 chars, alpha + spaces | — | Legal first name |
| 2 | Last Name | TEXT | Yes | 2-50 chars, alpha + spaces | — | Legal surname |
| 3 | Email | EMAIL | Yes | Unique across users | — | Will be used for login |
| 4 | Role | ENUM(UserRole) | Yes | From UserRole enum | — | Determines permissions |
| 5 | Assigned Campus(es) | SEARCH[] | Conditional | Required for non-SUPER_ADMIN | All | Campus scope |
| 6 | Phone | PHONE | No | +256XXXXXXXXX format | — | Mobile number |
| 7 | Temporary Password | TEXT | Yes | Min 8, 1 upper, 1 digit | Auto-gen | User must change on first login |
| 8 | Force Password Change | BOOLEAN | No | — | `true` | Require change at first login |
| 9 | Is Active | BOOLEAN | No | — | `true` | Deactivate to block login |

**Validation Rules:**
- `V-AUTH-005`: Email must be unique system-wide
- `V-AUTH-006`: Temporary password meets complexity (≥8 chars, 1 uppercase, 1 digit)
- `V-AUTH-007`: Cannot create SUPER_ADMIN unless current user is SUPER_ADMIN
- `V-AUTH-008`: At least one campus must be assigned for campus-scoped roles

---

### Form 1.3: Change Password

| Property | Value |
|----------|-------|
| **Form ID** | `AUTH-003` |
| **Title** | Change Password |
| **Roles** | All (authenticated) |
| **Offline** | No (requires server to update hash) |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Current Password | TEXT | Yes | Must match stored hash | — | Enter current password |
| 2 | New Password | TEXT | Yes | Min 8, 1 upper, 1 digit, 1 special | — | Choose a strong password |
| 3 | Confirm Password | TEXT | Yes | Must match New Password | — | Re-enter new password |

**Validation Rules:**
- `V-AUTH-009`: Current password must match stored BCrypt hash
- `V-AUTH-010`: New password ≠ current password
- `V-AUTH-011`: New password ≠ any of last 5 passwords
- `V-AUTH-012`: Confirm password must exactly match new password

---

### Form 1.4: User Profile Edit

| Property | Value |
|----------|-------|
| **Form ID** | `AUTH-004` |
| **Title** | My Profile |
| **Roles** | All (own profile) |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | First Name | TEXT | Yes | 2-50 chars | Current | — |
| 2 | Last Name | TEXT | Yes | 2-50 chars | Current | — |
| 3 | Phone | PHONE | No | +256XXXXXXXXX | Current | — |
| 4 | Profile Photo | FILE | No | JPG/PNG ≤ 2MB | — | Square crop recommended |
| 5 | Email Notifications | BOOLEAN | No | — | `true` | Receive email alerts |

---

### Form 1.5: Role Permission Editor

| Property | Value |
|----------|-------|
| **Form ID** | `AUTH-005` |
| **Title** | Role Permissions |
| **Roles** | SUPER_ADMIN |
| **Offline** | No |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Role | ENUM(UserRole) | Yes | — | — | Select role to configure |
| 2 | Permissions Matrix | GRID | Yes | Per-module CRUD + Approve | Preset | Check/uncheck individual permissions |
| 3 | Budget Approval Limit | CURRENCY | No | ≥ 0 | 0 | Max amount role can approve without escalation |

**Permission Matrix Columns:** Create, Read, Update, Delete, Approve, Export, Print

**Permission Matrix Rows (Modules):** Dashboard, Students, Billing, Invoices, Payments, Receipts, Collections, Transport, Inventory, Accounting, Payroll, AP, Treasury, Assets, Budget, Scholarships, Audit, Reports, Settings

---

## 4. Module 2 — Institution Setup

### Form 2.1: Institution Profile

| Property | Value |
|----------|-------|
| **Form ID** | `INST-001` |
| **Title** | Institution Settings |
| **Roles** | SUPER_ADMIN, DIRECTOR |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Institution Name | TEXT | Yes | 2-100 chars | — | Full legal name |
| 2 | Short Name / Abbreviation | TEXT | No | 2-20 chars | — | Used in headers |
| 3 | URA TIN | TEXT | Yes | 10-digit TIN format | — | Uganda Revenue Authority TIN |
| 4 | Registration Number | TEXT | No | — | — | MoES registration number |
| 5 | Logo | FILE | No | PNG/JPG ≤ 5MB, min 200×200px | — | Used on invoices + receipts |
| 6 | Address Line 1 | TEXT | Yes | — | — | Physical address |
| 7 | Address Line 2 | TEXT | No | — | — | P.O. Box, etc. |
| 8 | City / Town | TEXT | Yes | — | Kampala | — |
| 9 | District | TEXT | No | — | — | Administrative district |
| 10 | Country | ENUM | Yes | — | Uganda | — |
| 11 | Phone | PHONE | Yes | +256XXXXXXXXX | — | Main switchboard |
| 12 | Email | EMAIL | Yes | — | — | Official email |
| 13 | Website | TEXT | No | URL format | — | School website |
| 14 | Currency | ENUM | Yes | — | UGX | System-wide currency |
| 15 | Timezone | ENUM | Yes | — | Africa/Kampala | — |
| 16 | Financial Year Start | ENUM(month) | Yes | Jan–Dec | January | First month of fiscal year |
| 17 | Invoice Prefix | TEXT | No | 2-5 chars | INV | Prefix for invoice numbers |
| 18 | Receipt Prefix | TEXT | No | 2-5 chars | RCT | Prefix for receipt numbers |
| 19 | Default Payment Terms (Days) | INTEGER | No | 0-365 | 30 | Default invoice due period |

**Validation Rules:**
- `V-INST-001`: TIN must be valid 10-digit URA format
- `V-INST-002`: Logo must be ≥ 200×200 pixels
- `V-INST-003`: Financial year start cannot be changed mid-year if journals exist

---

### Form 2.2: Campus Management

| Property | Value |
|----------|-------|
| **Form ID** | `INST-002` |
| **Title** | Manage Campuses |
| **Roles** | SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Campus Name | TEXT | Yes | 2-100 chars, unique | — | e.g., "Bugolobi Campus" |
| 2 | Campus Code | TEXT | Yes | 2-10 chars, unique, alpha-num | — | e.g., "BUG" |
| 3 | Address | TEXT | No | — | — | Physical address |
| 4 | Phone | PHONE | No | +256XXXXXXXXX | — | Campus phone |
| 5 | Email | EMAIL | No | — | — | Campus email |
| 6 | Head Teacher | SEARCH(Employee) | No | — | — | Assigned head |
| 7 | Active | BOOLEAN | No | — | `true` | Deactivate to hide from UI |
| 8 | Bank Account | SEARCH(BankAccount) | No | — | — | Default bank for this campus |

**Validation Rules:**
- `V-INST-004`: campusName must be unique across institution
- `V-INST-005`: campusCode must be unique, 2-10 alphanumeric chars
- `V-INST-006`: Cannot deactivate campus with active students enrolled

---

### Form 2.3: Academic Year Setup

| Property | Value |
|----------|-------|
| **Form ID** | `INST-003` |
| **Title** | Academic Year Configuration |
| **Roles** | SUPER_ADMIN, DIRECTOR, HEADTEACHER |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Academic Year | TEXT | Yes | Format: "2025" or "2024/2025" | Current year | — |
| 2 | Start Date | DATE | Yes | — | Feb 1 | First day of year |
| 3 | End Date | DATE | Yes | Must be > Start Date | Dec 15 | Last day of year |
| 4 | Term 1 Start | DATE | Yes | Between start/end | — | — |
| 5 | Term 1 End | DATE | Yes | > Term 1 Start | — | — |
| 6 | Term 2 Start | DATE | Yes | > Term 1 End | — | — |
| 7 | Term 2 End | DATE | Yes | > Term 2 Start | — | — |
| 8 | Term 3 Start | DATE | Yes | > Term 2 End | — | — |
| 9 | Term 3 End | DATE | Yes | > Term 3 Start | — | — |
| 10 | Is Current Year | BOOLEAN | No | Only one year can be current | `false` | Marks as active year |

**Validation Rules:**
- `V-INST-007`: Terms must not overlap
- `V-INST-008`: All terms must fall within academic year start/end
- `V-INST-009`: Only one academic year can be marked as current
- `V-INST-010`: Cannot modify a closed academic year with posted journals

---

### Form 2.4: Class / Level Setup

| Property | Value |
|----------|-------|
| **Form ID** | `INST-004` |
| **Title** | Classes & Streams |
| **Roles** | SUPER_ADMIN, HEADTEACHER |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Class Name | TEXT | Yes | 2-50 chars | — | e.g., "S1", "S2", "S3" |
| 2 | Level | ENUM(O-Level, A-Level) | Yes | — | O-Level | O-Level (S1-S4), A-Level (S5-S6) |
| 3 | Section / Stage | ENUM(Lower, Upper, Advanced) | No | — | — | Grouping for fee rules |
| 4 | Campus | SEARCH(Campus) | Yes | — | Default campus | — |
| 5 | Capacity | INTEGER | No | 0-500 | 40 | Max students per class |
| 6 | Streams | REPEATER | No | — | — | Sub-divisions within class |
| 6a | └ Stream Name | TEXT | Yes | 2-20 chars | — | e.g., "East", "West" |
| 6b | └ Stream Capacity | INTEGER | No | 0-100 | 40 | — |
| 7 | Class Teacher | SEARCH(Employee) | No | — | — | Assigned teacher |
| 8 | Active | BOOLEAN | No | — | `true` | — |

**Validation Rules:**
- `V-INST-011`: Class name must be unique within campus
- `V-INST-012`: Stream name must be unique within class
- `V-INST-013`: Cannot deactivate class with enrolled students

---

### Form 2.5: Chart of Accounts

| Property | Value |
|----------|-------|
| **Form ID** | `INST-005` |
| **Title** | Chart of Accounts |
| **Roles** | SUPER_ADMIN, BURSAR, ACCOUNTANT |
| **Offline** | Yes |
| **Approval** | BURSAR approves new accounts |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Account Code | TEXT | Yes | Unique, numeric, 4-6 digits | — | e.g., "1100" for Cash |
| 2 | Account Name | TEXT | Yes | 2-100 chars | — | e.g., "Cash at Bank - Stanbic" |
| 3 | Account Type | ENUM(Asset,Liability,Equity,Revenue,Expense) | Yes | — | — | Fundamental classification |
| 4 | Parent Account | SEARCH(ChartOfAccount) | No | — | — | For sub-accounts |
| 5 | Department | SEARCH(Department) | No | — | — | Cost center |
| 6 | Description | LONGTEXT | No | — | — | Purpose/usage notes |
| 7 | Is Active | BOOLEAN | No | — | `true` | — |

**Validation Rules:**
- `V-INST-014`: Account code must be unique
- `V-INST-015`: Parent account must have same or compatible account type
- `V-INST-016`: Cannot deactivate account with non-zero balance
- `V-INST-017`: Account code format must follow institution's numbering scheme

---

### Form 2.6: Bank Account Setup

| Property | Value |
|----------|-------|
| **Form ID** | `INST-006` |
| **Title** | Bank Accounts |
| **Roles** | SUPER_ADMIN, BURSAR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Bank Name | TEXT | Yes | — | — | e.g., "Stanbic Bank", "Centenary Bank" |
| 2 | Branch | TEXT | No | — | — | e.g., "Kampala Road Branch" |
| 3 | Account Name | TEXT | Yes | — | — | Account holder name |
| 4 | Account Number | TEXT | Yes | Unique | — | Bank account number |
| 5 | Currency | ENUM | Yes | — | UGX | Account currency |
| 6 | GL Account | SEARCH(ChartOfAccount) | Yes | Must be Asset type | — | Linked GL account |
| 7 | Is Default | BOOLEAN | No | Only one default per currency | `false` | Primary collection account |
| 8 | Campus | SEARCH(Campus) | No | — | All | Scope to specific campus |
| 9 | Active | BOOLEAN | No | — | `true` | — |

**Validation Rules:**
- `V-INST-018`: Account number must be unique
- `V-INST-019`: GL account must be of type Asset
- `V-INST-020`: Only one bank account can be default per currency

---

### Form 2.7: Department Setup

| Property | Value |
|----------|-------|
| **Form ID** | `INST-007` |
| **Title** | Departments |
| **Roles** | SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Department Name | TEXT | Yes | 2-50 chars, unique | — | e.g., "Sciences", "Administration" |
| 2 | Department Code | TEXT | Yes | 2-10 chars, unique | — | e.g., "SCI", "ADM" |
| 3 | Head of Department | SEARCH(Employee) | No | — | — | — |
| 4 | Campus | SEARCH(Campus) | No | — | All | — |
| 5 | Cost Center Code | TEXT | No | — | — | For budget tracking |
| 6 | Active | BOOLEAN | No | — | `true` | — |

---

### Form 2.8: Policy Rules Engine

| Property | Value |
|----------|-------|
| **Form ID** | `INST-008` |
| **Title** | Business Policy Rules |
| **Roles** | SUPER_ADMIN, DIRECTOR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Rule Name | TEXT | Yes | 2-100 chars | — | e.g., "Spending Limit - Bursar" |
| 2 | Category | ENUM(PolicyCategory) | Yes | — | GENERAL | — |
| 3 | Condition Field | TEXT | Yes | — | — | e.g., "amount", "feeType" |
| 4 | Condition Operator | ENUM(>, <, >=, <=, ==, !=, IN) | Yes | — | — | Comparison operator |
| 5 | Condition Value | TEXT | Yes | — | — | Threshold value |
| 6 | Action | ENUM(PolicyAction) | Yes | — | WARN | What to do when triggered |
| 7 | Required Approver Role | ENUM(UserRole) | Conditional | Required for REQUIRE_APPROVAL | — | Who must approve |
| 8 | Active | BOOLEAN | No | — | `true` | — |
| 9 | Priority | INTEGER | No | 1-100 | 50 | Higher = evaluated first |

**Validation Rules:**
- `V-INST-021`: Rule name must be unique within category
- `V-INST-022`: If action is REQUIRE_APPROVAL, required approver role is mandatory
- `V-INST-023`: Condition value must be valid for the condition field type

---

## 5. Module 3 — Student & Family Management

### Form 3.1: Student Registration

| Property | Value |
|----------|-------|
| **Form ID** | `STU-001` |
| **Title** | Register New Student |
| **Roles** | ADMISSIONS_OFFICER, SUPER_ADMIN, HEADTEACHER |
| **Offline** | Yes |
| **Approval** | HEADTEACHER approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Registration Number | TEXT | Yes | Auto-generated, unique | Auto | Format: MAPLE/YYYY/NNNN |
| 2 | First Name | TEXT | Yes | 2-50 chars | — | Legal first name |
| 3 | Last Name | TEXT | Yes | 2-50 chars | — | Legal surname |
| 4 | Other Names | TEXT | No | — | — | Middle / clan name |
| 5 | Date of Birth | DATE | No | Must be in past, age 3-25 | — | — |
| 6 | Gender | ENUM(M, F, Other) | No | — | — | — |
| 7 | Nationality | TEXT | No | — | Ugandan | — |
| 8 | National ID / Birth Cert | TEXT | No | — | — | NIN or birth certificate number |
| 9 | Class | SEARCH(Class) | Yes | Active classes only | — | Enrollment class |
| 10 | Stream | SEARCH(Stream) | Conditional | Required if class has streams | — | — |
| 11 | Campus | SEARCH(Campus) | Yes | — | Default | — |
| 12 | Admission Date | DATE | Yes | ≤ today | Today | — |
| 13 | Is Boarder | BOOLEAN | No | — | `false` | Boarding student? |
| 14 | Family | SEARCH(Family) \| NEW | Yes | Select existing or create | — | Link to parent/guardian |
| 15 | Sponsor Type | ENUM(Parent, Guardian, Organization, Self) | No | — | Parent | Who pays fees |
| 16 | Medical Notes | LONGTEXT | No | — | — | Allergies, conditions |
| 17 | Previous School | TEXT | No | — | — | Transfer from |
| 18 | Photo | FILE | No | JPG/PNG ≤ 2MB | — | Passport photo |

**Validation Rules:**
- `V-STU-001`: Registration number must be unique
- `V-STU-002`: Age must be between 3 and 25 at admission date
- `V-STU-003`: Class capacity must not be exceeded
- `V-STU-004`: Family must exist or be created inline
- `V-STU-005`: If boarder, boarding fee rule must exist for the class

**Events Generated:**
- `STUDENT_REGISTERED` → Creates student record + links to family
- `STUDENT_ENROLLED` → Triggers fee schedule generation for term

---

### Form 3.2: Family / Guardian Registration

| Property | Value |
|----------|-------|
| **Form ID** | `STU-002` |
| **Title** | Register Family / Guardian |
| **Roles** | ADMISSIONS_OFFICER, SUPER_ADMIN, CASHIER |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Family Name | TEXT | Yes | 2-80 chars | — | Surname / household name |
| 2 | Primary Guardian Name | TEXT | Yes | — | — | Full name of payer |
| 3 | Relationship | ENUM(Father, Mother, Guardian, Organization) | Yes | — | — | — |
| 4 | Phone (Primary) | PHONE | Yes | +256XXXXXXXXX | — | Mobile money number |
| 5 | Phone (Secondary) | PHONE | No | +256XXXXXXXXX | — | Alternate contact |
| 6 | Email | EMAIL | No | — | — | For receipts & invoices |
| 7 | Address | TEXT | No | — | — | Physical address |
| 8 | Employer | TEXT | No | — | — | For credit assessment |
| 9 | Occupation | TEXT | No | — | — | — |
| 10 | NIN (National ID) | TEXT | No | CM/CF + 12 digits | — | National Identification Number |
| 11 | TIN | TEXT | No | 10-digit URA TIN | — | For tax receipts |
| 12 | Secondary Guardian Name | TEXT | No | — | — | Second payer |
| 13 | Pay Via Mobile Money | BOOLEAN | No | — | `false` | Enable MoMo payments |
| 14 | Mobile Money Provider | ENUM(MTN MoMo, Airtel Money) | Conditional | Required if MoMo = true | — | — |
| 15 | Notes | LONGTEXT | No | — | — | Special arrangements |

**Validation Rules:**
- `V-STU-006`: Primary phone must be valid Uganda format
- `V-STU-007`: If MoMo enabled, provider must be selected
- `V-STU-008`: Family name must be provided

---

### Form 3.3: Student Transfer (Between Classes)

| Property | Value |
|----------|-------|
| **Form ID** | `STU-003` |
| **Title** | Transfer Student |
| **Roles** | HEADTEACHER, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | HEADTEACHER approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student | SEARCH(Student) | Yes | Active students only | — | — |
| 2 | Current Class | TEXT | Readonly | Auto-populated | — | — |
| 3 | New Class | SEARCH(Class) | Yes | Active, different from current | — | — |
| 4 | New Stream | SEARCH(Stream) | Conditional | If new class has streams | — | — |
| 5 | Transfer Date | DATE | Yes | ≤ today | Today | Effective date |
| 6 | Reason | LONGTEXT | No | — | — | Transfer reason |
| 7 | Adjust Fee Schedule | BOOLEAN | No | — | `true` | Recalculate fees for new class |

**Validation Rules:**
- `V-STU-009`: New class must differ from current class
- `V-STU-010`: New class capacity must not be exceeded
- `V-STU-011`: Outstanding fees must be ≤ institution threshold to transfer

**Events Generated:**
- `STUDENT_TRANSFERRED` → Updates class, optionally regenerates fee schedule

---

### Form 3.4: Student Withdrawal / Exit

| Property | Value |
|----------|-------|
| **Form ID** | `STU-004` |
| **Title** | Withdraw / Exit Student |
| **Roles** | HEADTEACHER, SUPER_ADMIN, DIRECTOR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student | SEARCH(Student) | Yes | Active students | — | — |
| 2 | Exit Type | ENUM(Withdrawn, Transferred, Graduated, Expelled) | Yes | — | Withdrawn | — |
| 3 | Exit Date | DATE | Yes | ≤ today | Today | — |
| 4 | Reason | LONGTEXT | Yes | Min 10 chars | — | Reason for exit |
| 5 | Clearance Status | ENUM(Cleared, Not Cleared) | Yes | — | Not Cleared | — |
| 6 | Outstanding Balance | CURRENCY | Readonly | Auto-calculated | — | — |
| 7 | Write Off Balance | BOOLEAN | No | — | `false` | Write off remaining balance |
| 8 | Write Off Reason | LONGTEXT | Conditional | Required if writing off | — | — |
| 9 | Destination School | TEXT | Conditional | Required if Transferred | — | — |

**Validation Rules:**
- `V-STU-012`: Student must be active
- `V-STU-013`: If write off, reason is required and DIRECTOR approval needed
- `V-STU-014`: Exit type "Graduated" only allowed for S4 and S6 students

**Events Generated:**
- `STUDENT_WITHDRAWN` → Deactivates student, optionally writes off balance
- `CREDIT_NOTE_CREATED` (if pro-rata refund applies)

---

### Form 3.5: Student Status Change

| Property | Value |
|----------|-------|
| **Form ID** | `STU-005` |
| **Title** | Change Student Status |
| **Roles** | HEADTEACHER, SUPER_ADMIN, BURSAR |
| **Offline** | Yes |
| **Approval** | HEADTEACHER approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student | SEARCH(Student) | Yes | — | — | — |
| 2 | Current Status | TEXT | Readonly | — | — | — |
| 3 | New Status | ENUM(active, inactive, suspended) | Yes | Different from current | — | — |
| 4 | Reason | LONGTEXT | Yes | Min 10 chars | — | — |
| 5 | Effective Date | DATE | Yes | — | Today | — |
| 6 | Reinstatement Date | DATE | Conditional | Required for suspended | — | Expected return |

---

### Form 3.6: Bulk Promotion / Graduation

| Property | Value |
|----------|-------|
| **Form ID** | `STU-006` |
| **Title** | End-of-Year Promotion |
| **Roles** | HEADTEACHER, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Academic Year | SEARCH(AcademicYear) | Yes | Current year | Current | — |
| 2 | From Class | SEARCH(Class) | Yes | — | — | Current class |
| 3 | To Class | SEARCH(Class) | Yes | Must be next level or "Graduated" | Auto | Promotion target |
| 4 | Students | CHECKBOX_LIST(Students) | Yes | From selected class | All active | Select who promotes |
| 5 | Exceptions | REPEATER | No | — | — | Students held back |
| 5a | └ Student | SEARCH(Student) | Yes | — | — | — |
| 5b | └ Action | ENUM(Retain, Withdraw) | Yes | — | Retain | — |
| 5c | └ Reason | TEXT | Yes | — | — | — |
| 6 | Effective Date | DATE | Yes | — | Year end +1 | — |

**Validation Rules:**
- `V-STU-015`: To Class must be sequential (S1→S2, S4→S5, etc.) or "Graduated"
- `V-STU-016`: S4 students can graduate (O-Level complete) or promote to S5
- `V-STU-017`: S6 students can only graduate
- `V-STU-018`: Students with balance > threshold get warning (not blocked)

---

### Form 3.7: Family Financial Summary (View)

| Property | Value |
|----------|-------|
| **Form ID** | `STU-007` |
| **Title** | Family Account Statement |
| **Roles** | BURSAR, CASHIER, ACCOUNTANT, SUPER_ADMIN |
| **Offline** | Yes (local data) |
| **Approval** | None (read-only / printable) |

**Fields (Filter Criteria):**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Family | SEARCH(Family) | Yes | — | — | — |
| 2 | Date From | DATE | No | — | Year start | — |
| 3 | Date To | DATE | No | — | Today | — |
| 4 | Include All Students | BOOLEAN | No | — | `true` | — |

**Output Columns:** Date, Reference, Description, Debit (UGX), Credit (UGX), Balance (UGX)

---

### Form 3.8: Student Import (Bulk)

| Property | Value |
|----------|-------|
| **Form ID** | `STU-008` |
| **Title** | Bulk Student Import |
| **Roles** | SUPER_ADMIN, ADMISSIONS_OFFICER |
| **Offline** | No (requires validation server) |
| **Approval** | HEADTEACHER approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | CSV File | FILE | Yes | .csv, ≤ 5MB, max 5000 rows | — | Template downloadable |
| 2 | Academic Year | SEARCH(AcademicYear) | Yes | — | Current | — |
| 3 | Default Campus | SEARCH(Campus) | Yes | — | Default | — |
| 4 | Skip Duplicates | BOOLEAN | No | — | `true` | Skip matching reg numbers |
| 5 | Dry Run | BOOLEAN | No | — | `true` | Validate without importing |

**CSV Columns:** RegistrationNumber, FirstName, LastName, DateOfBirth, Gender, ClassName, StreamName, FamilyName, GuardianName, GuardianPhone, IsBoarder

**Validation:**
- `V-STU-019`: All required columns must be present
- `V-STU-020`: Registration numbers must be unique
- `V-STU-021`: Class names must match existing classes
- Display validation summary before import: X valid, Y errors, Z warnings

---

### Form 3.9: Student Search / Filter

| Property | Value |
|----------|-------|
| **Form ID** | `STU-009` |
| **Title** | Student Directory |
| **Roles** | All authenticated |
| **Offline** | Yes |
| **Approval** | None (read-only) |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Search Text | TEXT | No | Min 2 chars | — | Name or reg number |
| 2 | Class | ENUM(Classes) | No | — | All | — |
| 3 | Campus | ENUM(Campuses) | No | — | User's campus | — |
| 4 | Status | ENUM(active, inactive, etc.) | No | — | active | — |
| 5 | Financial Status | ENUM(good_standing, arrears, suspended) | No | — | All | — |
| 6 | Boarder | ENUM(All, Boarder, Day) | No | — | All | — |

---

## 6. Module 4 — Fee Rules & Billing Engine

### Form 4.1: Fee Rule Definition

| Property | Value |
|----------|-------|
| **Form ID** | `FEE-001` |
| **Title** | Create / Edit Fee Rule |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Fee Type | ENUM(FeeType) | Yes | — | TUITION | — |
| 2 | Description | TEXT | Yes | — | — | e.g., "Tuition - S1 Term 1" |
| 3 | Class(es) | SEARCH[](Class) | Yes | One or more | — | Apply to which classes |
| 4 | Term | ENUM(Term 1, Term 2, Term 3, Annual) | Yes | — | — | Billing period |
| 5 | Academic Year | SEARCH(AcademicYear) | Yes | — | Current | — |
| 6 | Amount (UGX) | CURRENCY | Yes | > 0 | — | Fee amount per student |
| 7 | Boarding Surcharge | CURRENCY | Conditional | ≥ 0 | 0 | Extra for boarders |
| 8 | Effective Date | DATE | Yes | — | Term start | When rule becomes active |
| 9 | End Date | DATE | No | > Effective | Term end | — |
| 10 | GL Revenue Account | SEARCH(ChartOfAccount) | Yes | Revenue type only | — | Where to post revenue |
| 11 | GL Receivable Account | SEARCH(ChartOfAccount) | Yes | Asset type only | — | AR account |
| 12 | Active | BOOLEAN | No | — | `true` | — |
| 13 | Campus Scope | SEARCH[](Campus) | No | — | All | Limit to campuses |
| 14 | Notes | LONGTEXT | No | — | — | — |

**Validation Rules:**
- `V-FEE-001`: Amount must be > 0
- `V-FEE-002`: GL revenue account must be Revenue type
- `V-FEE-003`: GL receivable account must be Asset type
- `V-FEE-004`: No duplicate rule for same class + term + fee type + year
- `V-FEE-005`: End date must be after effective date if provided

---

### Form 4.2: Fee Discount Rule

| Property | Value |
|----------|-------|
| **Form ID** | `FEE-002` |
| **Title** | Fee Discount Rule |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Fee Rule | SEARCH(FeeRule) | Yes | Active rules | — | Which fee this discounts |
| 2 | Discount Type | ENUM(DiscountType) | Yes | — | — | — |
| 3 | Discount Value | DECIMAL(10,2) | Yes | > 0 | — | Amount or percentage |
| 4 | Is Percentage | BOOLEAN | Yes | — | `false` | Toggle % vs flat |
| 5 | Max Students | INTEGER | No | > 0 | — | Cap on beneficiaries |
| 6 | Max Discount Amount | CURRENCY | Conditional | Required if percentage | — | Cap on per-student discount |
| 7 | Active | BOOLEAN | No | — | `true` | — |

**Validation Rules:**
- `V-FEE-006`: If percentage, value must be 0.01-100
- `V-FEE-007`: If flat amount, must not exceed fee rule amount
- `V-FEE-008`: Max discount cap required for percentage discounts

---

### Form 4.3: Fee Schedule Preview

| Property | Value |
|----------|-------|
| **Form ID** | `FEE-003` |
| **Title** | Preview Fee Schedule |
| **Roles** | BURSAR, CASHIER, ACCOUNTANT |
| **Offline** | Yes |
| **Approval** | None (read-only) |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student | SEARCH(Student) | Yes | — | — | — |
| 2 | Term | ENUM(terms) | Yes | — | Current term | — |
| 3 | Academic Year | SEARCH(AcademicYear) | Yes | — | Current | — |

**Output:** Table of fee line items with amounts, discounts, scholarships, and final total in UGX.

---

### Form 4.4: Billing Run (Batch Invoice Generation)

| Property | Value |
|----------|-------|
| **Form ID** | `FEE-004` |
| **Title** | Generate Invoices (Billing Run) |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | BURSAR approves, DIRECTOR approves if > UGX 50,000,000 total |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Academic Year | SEARCH(AcademicYear) | Yes | — | Current | — |
| 2 | Term | ENUM(terms) | Yes | — | Current | — |
| 3 | Class(es) | SEARCH[](Class) | Yes | One or more | All | Target classes |
| 4 | Campus | SEARCH(Campus) | No | — | All | — |
| 5 | Include Boarders | BOOLEAN | No | — | `true` | — |
| 6 | Due Date | DATE | Yes | Future date | Term start + 14 | — |
| 7 | Preview Mode | BOOLEAN | No | — | `true` | Preview before generating |
| 8 | Carry Forward Balance | BOOLEAN | No | — | `true` | Include previous term arrears |

**Validation Rules:**
- `V-FEE-009`: Fee rules must exist for selected classes/term
- `V-FEE-010`: Invoices not already generated for selected class/term
- `V-FEE-011`: Due date must be in the future

**Events Generated:**
- `INVOICE_CREATED` × N (one per student)
- `BILLING_RUN_COMPLETED` (batch summary event)

---

### Form 4.5: Fee Waiver / Exemption

| Property | Value |
|----------|-------|
| **Form ID** | `FEE-005` |
| **Title** | Fee Waiver Request |
| **Roles** | BURSAR, HEADTEACHER |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student | SEARCH(Student) | Yes | — | — | — |
| 2 | Invoice | SEARCH(StudentInvoice) | Yes | Open invoices for student | — | — |
| 3 | Fee Line Item | SEARCH(InvoiceLineItem) | Yes | Items on selected invoice | — | — |
| 4 | Waiver Type | ENUM(Full, Partial) | Yes | — | — | — |
| 5 | Waiver Amount | CURRENCY | Conditional | Required if Partial; ≤ line amount | — | — |
| 6 | Reason | LONGTEXT | Yes | Min 20 chars | — | Detailed justification |
| 7 | Supporting Document | FILE | No | PDF ≤ 10MB | — | Approval letter, etc. |

**Validation Rules:**
- `V-FEE-012`: Waiver amount cannot exceed line item amount
- `V-FEE-013`: Reason must be at least 20 characters
- `V-FEE-014`: Cannot waive already paid fee lines

---

### Form 4.6: Fee Template (Quick Setup)

| Property | Value |
|----------|-------|
| **Form ID** | `FEE-006` |
| **Title** | Fee Template |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Template Name | TEXT | Yes | 2-50 chars, unique | — | e.g., "O-Level Standard" |
| 2 | Level | ENUM(O-Level, A-Level) | Yes | — | — | — |
| 3 | Fee Items | REPEATER | Yes | At least 1 | — | — |
| 3a | └ Fee Type | ENUM(FeeType) | Yes | — | — | — |
| 3b | └ Description | TEXT | Yes | — | — | — |
| 3c | └ Amount (UGX) | CURRENCY | Yes | > 0 | — | — |
| 3d | └ Boarding Extra (UGX) | CURRENCY | No | ≥ 0 | 0 | — |
| 3e | └ GL Account | SEARCH(CoA) | Yes | Revenue type | — | — |
| 4 | Total | CURRENCY | Readonly | Sum of amounts | — | — |

---

### Form 4.7: Fee Adjustment

| Property | Value |
|----------|-------|
| **Form ID** | `FEE-007` |
| **Title** | Fee Rule Adjustment |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Fee Rule | SEARCH(FeeRule) | Yes | Active rules | — | — |
| 2 | Current Amount | CURRENCY | Readonly | — | — | — |
| 3 | New Amount | CURRENCY | Yes | > 0, ≠ current | — | — |
| 4 | Effective Date | DATE | Yes | — | Today | — |
| 5 | Reason | LONGTEXT | Yes | Min 10 chars | — | — |
| 6 | Apply to Existing Invoices | BOOLEAN | No | — | `false` | Recalculate open invoices |

**Validation Rules:**
- `V-FEE-015`: New amount must differ from current
- `V-FEE-016`: If applying to existing invoices, only DRAFT/ISSUED invoices affected
- `V-FEE-017`: Adjustment > 20% requires DIRECTOR approval

---

### Form 4.8: Fee Structure Report Filter

| Property | Value |
|----------|-------|
| **Form ID** | `FEE-008` |
| **Title** | Fee Structure Report |
| **Roles** | BURSAR, DIRECTOR, BOARD_FINANCE_VIEWER |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Academic Year | SEARCH(AcademicYear) | Yes | — | Current | — |
| 2 | Term | ENUM(terms) | No | — | All | — |
| 3 | Level | ENUM(O-Level, A-Level, All) | No | — | All | — |
| 4 | Campus | SEARCH(Campus) | No | — | All | — |

---

## 7. Module 5 — Invoice Management

### Form 5.1: Manual Invoice Creation

| Property | Value |
|----------|-------|
| **Form ID** | `INV-001` |
| **Title** | Create Student Invoice |
| **Roles** | BURSAR, CASHIER, ACCOUNTANT |
| **Offline** | Yes |
| **Approval** | BURSAR approves if amount > UGX 5,000,000 |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Invoice Number | TEXT | Yes | Auto-generated, unique | Auto | Format: INV-YYYY-NNNN |
| 2 | Student | SEARCH(Student) | Yes | Active students | — | — |
| 3 | Family | TEXT | Readonly | Auto from student | — | — |
| 4 | Invoice Date | DATE | Yes | ≤ today | Today | — |
| 5 | Due Date | DATE | Yes | ≥ Invoice Date | +30 days | — |
| 6 | Term | ENUM(terms) | Yes | — | Current | — |
| 7 | Academic Year | SEARCH(AcademicYear) | Yes | — | Current | — |
| 8 | Line Items | REPEATER | Yes | At least 1 | — | — |
| 8a | └ Fee Type | ENUM(FeeType) | Yes | — | — | — |
| 8b | └ Description | TEXT | Yes | — | — | — |
| 8c | └ Quantity | INTEGER | Yes | ≥ 1 | 1 | — |
| 8d | └ Unit Rate (UGX) | CURRENCY | Yes | > 0 | — | — |
| 8e | └ Amount (UGX) | CURRENCY | Readonly | Qty × Rate | — | — |
| 8f | └ GL Account | SEARCH(CoA) | Yes | Revenue type | — | — |
| 9 | Subtotal | CURRENCY | Readonly | Sum of line amounts | — | — |
| 10 | Scholarship Applied | CURRENCY | No | ≤ Subtotal | 0 | — |
| 11 | Total Amount | CURRENCY | Readonly | Subtotal - Scholarship | — | — |
| 12 | Notes | LONGTEXT | No | — | — | — |
| 13 | Status | ENUM(DRAFT, ISSUED) | Yes | — | DRAFT | — |

**Validation Rules:**
- `V-INV-001`: At least one line item required
- `V-INV-002`: Line amount = Qty × Unit Rate
- `V-INV-003`: Total must be > 0
- `V-INV-004`: Due date must be ≥ invoice date
- `V-INV-005`: GL accounts must be Revenue type
- `V-INV-006`: Invoice number unique across institution

**Events Generated:**
- `INVOICE_CREATED` → DR Accounts Receivable / CR Tuition Revenue (per line)

---

### Form 5.2: Invoice Edit

| Property | Value |
|----------|-------|
| **Form ID** | `INV-002` |
| **Title** | Edit Invoice |
| **Roles** | BURSAR, ACCOUNTANT |
| **Offline** | Yes |
| **Approval** | BURSAR approves if amount changed > 10% |

Only DRAFT invoices can be edited. ISSUED invoices require a credit note (Form 5.4).

**Editable Fields:** Same as INV-001, but Invoice Number and Student are readonly.

**Validation Rules:**
- `V-INV-007`: Only DRAFT status can be edited
- `V-INV-008`: ISSUED invoices must use credit note for adjustments
- `V-INV-009`: Amount increase > 10% requires BURSAR approval

---

### Form 5.3: Invoice Cancellation

| Property | Value |
|----------|-------|
| **Form ID** | `INV-003` |
| **Title** | Cancel Invoice |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Invoice | SEARCH(StudentInvoice) | Yes | DRAFT or ISSUED only | — | — |
| 2 | Cancellation Reason | LONGTEXT | Yes | Min 20 chars | — | — |
| 3 | Supporting Document | FILE | No | — | — | — |

**Validation Rules:**
- `V-INV-010`: Cannot cancel PARTIALLY_PAID or FULLY_PAID invoices (use credit note)
- `V-INV-011`: Cancellation reason required

**Events Generated:**
- `INVOICE_CANCELLED` → Reverses all GL postings

---

### Form 5.4: Credit Note

| Property | Value |
|----------|-------|
| **Form ID** | `INV-004` |
| **Title** | Issue Credit Note |
| **Roles** | BURSAR, ACCOUNTANT |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Credit Note Number | TEXT | Yes | Auto-generated | Auto | CN-YYYY-NNNN |
| 2 | Original Invoice | SEARCH(StudentInvoice) | Yes | ISSUED or later | — | — |
| 3 | Date | DATE | Yes | ≤ today | Today | — |
| 4 | Credit Items | REPEATER | Yes | ≥ 1 | — | — |
| 4a | └ Original Line | SEARCH(InvoiceLineItem) | Yes | From original invoice | — | — |
| 4b | └ Credit Amount (UGX) | CURRENCY | Yes | ≤ original line amount | — | — |
| 4c | └ Reason | TEXT | Yes | — | — | — |
| 5 | Total Credit | CURRENCY | Readonly | Sum of credit amounts | — | — |
| 6 | Notes | LONGTEXT | No | — | — | — |

**Validation Rules:**
- `V-INV-012`: Credit amount per line ≤ original line amount minus prior credits
- `V-INV-013`: Total credit ≤ invoice total minus payments received

**Events Generated:**
- `CREDIT_NOTE_CREATED` → DR Revenue / CR Accounts Receivable

---

### Form 5.5: Debit Note

| Property | Value |
|----------|-------|
| **Form ID** | `INV-005` |
| **Title** | Issue Debit Note |
| **Roles** | BURSAR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Debit Note Number | TEXT | Yes | Auto-generated | Auto | DN-YYYY-NNNN |
| 2 | Student | SEARCH(Student) | Yes | — | — | — |
| 3 | Date | DATE | Yes | ≤ today | Today | — |
| 4 | Items | REPEATER | Yes | ≥ 1 | — | — |
| 4a | └ Description | TEXT | Yes | — | — | — |
| 4b | └ Amount (UGX) | CURRENCY | Yes | > 0 | — | — |
| 4c | └ GL Account | SEARCH(CoA) | Yes | — | — | — |
| 5 | Total | CURRENCY | Readonly | Sum | — | — |
| 6 | Reason | LONGTEXT | Yes | — | — | — |

**Events Generated:**
- `DEBIT_NOTE_CREATED` → DR Accounts Receivable / CR per-line GL

---

### Form 5.6: Invoice Search / Filter

| Property | Value |
|----------|-------|
| **Form ID** | `INV-006` |
| **Title** | Invoice Register |
| **Roles** | BURSAR, CASHIER, ACCOUNTANT, DIRECTOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Search | TEXT | No | Inv # or student name | — | — |
| 2 | Status | ENUM(InvoiceStatus) | No | — | All | — |
| 3 | Date From | DATE | No | — | Month start | — |
| 4 | Date To | DATE | No | — | Today | — |
| 5 | Class | SEARCH(Class) | No | — | All | — |
| 6 | Campus | SEARCH(Campus) | No | — | User's campus | — |
| 7 | Min Amount | CURRENCY | No | ≥ 0 | — | — |
| 8 | Max Amount | CURRENCY | No | ≥ Min | — | — |

---

## 8. Module 6 — Payments & Receipting

### Form 6.1: Record Payment / Receipt

| Property | Value |
|----------|-------|
| **Form ID** | `PAY-001` |
| **Title** | Record Payment |
| **Roles** | CASHIER, BURSAR, ACCOUNTANT |
| **Offline** | Yes |
| **Approval** | None for ≤ UGX 5,000,000; BURSAR above |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Receipt Number | TEXT | Yes | Auto-generated, unique | Auto | RCT-YYYY-NNNN |
| 2 | Family | SEARCH(Family) | Yes | — | — | — |
| 3 | Student | SEARCH(Student) | Conditional | If family has multiple students | — | — |
| 4 | Payment Date | DATE | Yes | ≤ today | Today | — |
| 5 | Payment Method | ENUM(PaymentMethod) | Yes | — | CASH | — |
| 6 | Amount (UGX) | CURRENCY | Yes | > 0 | — | — |
| 7 | Reference Number | TEXT | Conditional | Required for non-Cash | — | MoMo ref, cheque #, transfer ref |
| 8 | Bank Account | SEARCH(BankAccount) | Conditional | Required for bank_transfer | — | — |
| 9 | MoMo Provider | ENUM(MTN MoMo, Airtel Money) | Conditional | Required if mobile_money | — | — |
| 10 | MoMo Transaction ID | TEXT | Conditional | Required if mobile_money | — | — |
| 11 | Description | TEXT | No | — | — | Payment notes |
| 12 | Invoice Allocation | REPEATER | No | — | Auto (FIFO) | — |
| 12a | └ Invoice | SEARCH(StudentInvoice) | Yes | Open invoices for family | — | — |
| 12b | └ Amount (UGX) | CURRENCY | Yes | ≤ invoice balance | — | — |
| 13 | Unapplied Balance | CURRENCY | Readonly | Amount - allocated | — | — |

**Validation Rules:**
- `V-PAY-001`: Amount must be > 0
- `V-PAY-002`: Total allocation ≤ payment amount
- `V-PAY-003`: Each allocation ≤ invoice outstanding balance
- `V-PAY-004`: Reference number required for non-cash methods
- `V-PAY-005`: MoMo transaction ID must be unique
- `V-PAY-006`: Payment date cannot be in a closed accounting period

**Events Generated:**
- `PAYMENT_POSTED` → DR Cash/Bank / CR Accounts Receivable
- `PAYMENT_ALLOCATED` × N (per invoice allocation)

---

### Form 6.2: Payment Reversal

| Property | Value |
|----------|-------|
| **Form ID** | `PAY-002` |
| **Title** | Reverse Payment |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Payment | SEARCH(Payment) | Yes | Status = recorded/matched | — | — |
| 2 | Reversal Reason | LONGTEXT | Yes | Min 20 chars | — | — |
| 3 | Reversal Date | DATE | Yes | ≤ today | Today | — |
| 4 | Supporting Document | FILE | No | — | — | — |

**Validation Rules:**
- `V-PAY-007`: Cannot reverse payments in closed periods
- `V-PAY-008`: Reversal creates equal and opposite journal entry
- `V-PAY-009`: All allocations are reversed automatically

**Events Generated:**
- `REVERSAL` → CR Cash/Bank / DR Accounts Receivable

---

### Form 6.3: Bulk Mobile Money Import

| Property | Value |
|----------|-------|
| **Form ID** | `PAY-003` |
| **Title** | Import MoMo Payments |
| **Roles** | BURSAR, CASHIER |
| **Offline** | No (requires statement file) |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Provider | ENUM(MTN MoMo, Airtel Money) | Yes | — | MTN MoMo | — |
| 2 | Statement File | FILE | Yes | CSV/Excel ≤ 10MB | — | MoMo statement export |
| 3 | Date Range | DATE_RANGE | Yes | — | Last 7 days | — |
| 4 | Auto-Match | BOOLEAN | No | — | `true` | Match by phone → family |
| 5 | Default Bank Account | SEARCH(BankAccount) | Yes | — | MoMo float account | — |

**Processing:**
1. Parse statement → extract transactions
2. Match phone number → Family → Student
3. Display: Matched (auto-allocate), Unmatched (manual), Duplicates (skip)
4. User reviews → Approves → Creates Payment records

---

### Form 6.4: Bank Statement Import

| Property | Value |
|----------|-------|
| **Form ID** | `PAY-004` |
| **Title** | Import Bank Statement |
| **Roles** | BURSAR, ACCOUNTANT |
| **Offline** | No |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Bank Account | SEARCH(BankAccount) | Yes | — | — | — |
| 2 | Statement File | FILE | Yes | CSV/OFX/MT940 ≤ 10MB | — | Bank export file |
| 3 | Statement Period | DATE_RANGE | Yes | — | — | — |
| 4 | Auto-Match | BOOLEAN | No | — | `true` | Match by reference |

---

### Form 6.5: Payment Allocation (Manual)

| Property | Value |
|----------|-------|
| **Form ID** | `PAY-005` |
| **Title** | Allocate Unapplied Payment |
| **Roles** | CASHIER, BURSAR |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Payment | SEARCH(Payment) | Yes | Has unapplied balance | — | — |
| 2 | Unapplied Amount | CURRENCY | Readonly | — | — | — |
| 3 | Allocations | REPEATER | Yes | ≥ 1 | — | — |
| 3a | └ Invoice | SEARCH(StudentInvoice) | Yes | Family's open invoices | — | — |
| 3b | └ Amount (UGX) | CURRENCY | Yes | ≤ invoice balance & ≤ remaining unapplied | — | — |

**Validation Rules:**
- `V-PAY-010`: Total allocations ≤ unapplied balance
- `V-PAY-011`: Per-invoice allocation ≤ invoice outstanding

---

### Form 6.6: Receipt Reprint / Email

| Property | Value |
|----------|-------|
| **Form ID** | `PAY-006` |
| **Title** | Receipt Actions |
| **Roles** | CASHIER, BURSAR |
| **Offline** | Yes (reprint only) |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Payment | SEARCH(Payment) | Yes | — | — | — |
| 2 | Action | ENUM(Print, Email, Download PDF) | Yes | — | Print | — |
| 3 | Email To | EMAIL | Conditional | Required for Email | Family email | — |
| 4 | Include Statement | BOOLEAN | No | — | `false` | Attach family statement |

---

### Form 6.7: Payment Search / Filter

| Property | Value |
|----------|-------|
| **Form ID** | `PAY-007` |
| **Title** | Payment Register |
| **Roles** | CASHIER, BURSAR, ACCOUNTANT, DIRECTOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Search | TEXT | No | Receipt #, name, reference | — | — |
| 2 | Payment Method | ENUM(PaymentMethod) | No | — | All | — |
| 3 | Date From | DATE | No | — | Month start | — |
| 4 | Date To | DATE | No | — | Today | — |
| 5 | Min Amount | CURRENCY | No | — | — | — |
| 6 | Max Amount | CURRENCY | No | — | — | — |
| 7 | Status | ENUM(recorded, matched, reversed) | No | — | All | — |
| 8 | Campus | SEARCH(Campus) | No | — | User's campus | — |

---

## 9. Module 7 — Collections & Follow-Up

### Form 7.1: Payment Plan

| Property | Value |
|----------|-------|
| **Form ID** | `COL-001` |
| **Title** | Create Payment Plan |
| **Roles** | BURSAR, CASHIER |
| **Offline** | Yes |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student | SEARCH(Student) | Yes | With outstanding balance | — | — |
| 2 | Total Outstanding | CURRENCY | Readonly | Auto-calculated | — | — |
| 3 | Plan Start Date | DATE | Yes | ≥ today | Today | — |
| 4 | Number of Installments | INTEGER | Yes | 2-12 | 3 | — |
| 5 | Installment Amount | CURRENCY | Yes | Plan total / N | Auto | — |
| 6 | Frequency | ENUM(Weekly, Bi-Weekly, Monthly) | Yes | — | Monthly | — |
| 7 | Invoice(s) Covered | SEARCH[](StudentInvoice) | No | — | All open | — |
| 8 | Terms & Conditions | LONGTEXT | No | — | Template | — |
| 9 | Guardian Acknowledgment | BOOLEAN | Yes | Must be true | `false` | Guardian has agreed |

**Validation Rules:**
- `V-COL-001`: Installment amount × N must equal plan total
- `V-COL-002`: Guardian acknowledgment must be true
- `V-COL-003`: Plan start date must be today or future
- `V-COL-004`: Only one active plan per student

**Auto-Generated:** Installment schedule with due dates based on frequency

---

### Form 7.2: Follow-Up Activity

| Property | Value |
|----------|-------|
| **Form ID** | `COL-002` |
| **Title** | Log Follow-Up |
| **Roles** | CASHIER, BURSAR |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student | SEARCH(Student) | Yes | With arrears | — | — |
| 2 | Activity Type | ENUM(FollowUpActivityType) | Yes | — | CALL | — |
| 3 | Date | DATE | Yes | ≤ today | Today | — |
| 4 | Contact Person | TEXT | No | — | Guardian name | — |
| 5 | Notes | LONGTEXT | Yes | Min 10 chars | — | Summary of interaction |
| 6 | Outcome | ENUM(Promise to Pay, Will Discuss, Refused, No Answer, Paid) | Yes | — | — | — |
| 7 | Promise Amount | CURRENCY | Conditional | Required if Promise to Pay | — | — |
| 8 | Promise Date | DATE | Conditional | Required if Promise to Pay | — | — |
| 9 | Next Follow-Up Date | DATE | No | ≥ today | +7 days | — |

---

### Form 7.3: Demand Letter Generation

| Property | Value |
|----------|-------|
| **Form ID** | `COL-003` |
| **Title** | Generate Demand Letter |
| **Roles** | BURSAR |
| **Offline** | Yes |
| **Approval** | HEADTEACHER approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student(s) | SEARCH[](Student) | Yes | With arrears > threshold | — | — |
| 2 | Letter Type | ENUM(Reminder, Warning, Final Demand) | Yes | — | Reminder | — |
| 3 | Grace Period (Days) | INTEGER | Yes | 1-90 | 14 | — |
| 4 | Include Statement | BOOLEAN | No | — | `true` | — |
| 5 | Delivery Method | ENUM(Print, Email, SMS) | Yes | — | Print | — |
| 6 | Letter Date | DATE | Yes | — | Today | — |
| 7 | Custom Message | LONGTEXT | No | — | Template | — |

---

### Form 7.4: Aging Bucket Configuration

| Property | Value |
|----------|-------|
| **Form ID** | `COL-004` |
| **Title** | Aging Bucket Settings |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Bucket 1 Label | TEXT | Yes | — | 1-30 Days | — |
| 2 | Bucket 1 Days | INTEGER | Yes | — | 30 | — |
| 3 | Bucket 2 Label | TEXT | Yes | — | 31-60 Days | — |
| 4 | Bucket 2 Days | INTEGER | Yes | — | 60 | — |
| 5 | Bucket 3 Label | TEXT | Yes | — | 61-90 Days | — |
| 6 | Bucket 3 Days | INTEGER | Yes | — | 90 | — |
| 7 | Bucket 4 Label | TEXT | Yes | — | 91+ Days | — |
| 8 | Auto-Escalation | BOOLEAN | No | — | `false` | Auto send letters |

---

### Form 7.5: Write-Off Request

| Property | Value |
|----------|-------|
| **Form ID** | `COL-005` |
| **Title** | Bad Debt Write-Off |
| **Roles** | BURSAR |
| **Offline** | Yes |
| **Approval** | DIRECTOR + BOARD_FINANCE_VIEWER approve |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student | SEARCH(Student) | Yes | — | — | — |
| 2 | Invoice(s) | SEARCH[](StudentInvoice) | Yes | Open invoices | — | — |
| 3 | Write-Off Amount | CURRENCY | Yes | ≤ total outstanding | — | — |
| 4 | Reason | LONGTEXT | Yes | Min 50 chars | — | — |
| 5 | Supporting Documents | FILE[] | Yes | ≥ 1 | — | Follow-up history |
| 6 | GL Expense Account | SEARCH(CoA) | Yes | Expense type | — | Bad debt expense account |

**Events Generated:**
- `ADJUSTMENT` → DR Bad Debt Expense / CR Accounts Receivable

---

### Form 7.6: Collections Dashboard Filter

| Property | Value |
|----------|-------|
| **Form ID** | `COL-006` |
| **Title** | Collections Dashboard |
| **Roles** | BURSAR, CASHIER, DIRECTOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Academic Year | SEARCH(AcademicYear) | Yes | — | Current | — |
| 2 | Term | ENUM(terms) | No | — | Current | — |
| 3 | Class | SEARCH(Class) | No | — | All | — |
| 4 | Campus | SEARCH(Campus) | No | — | User's campus | — |
| 5 | Aging Bucket | ENUM(Current, 1-30, 31-60, 61-90, 91+) | No | — | All | — |

---

## 10. Module 8 — Transport

### Form 8.1: Transport Route

| Property | Value |
|----------|-------|
| **Form ID** | `TRN-001` |
| **Title** | Create / Edit Route |
| **Roles** | TRANSPORT_MANAGER, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Route Name | TEXT | Yes | 2-50 chars, unique | — | e.g., "Ntinda - Bugolobi" |
| 2 | Route Code | TEXT | No | Unique | Auto | — |
| 3 | Cost Per Term (UGX) | CURRENCY | Yes | > 0 | — | Per-student transport fee |
| 4 | Campus | SEARCH(Campus) | Yes | — | Default | — |
| 5 | Pickup Points | REPEATER | Yes | ≥ 2 | — | — |
| 5a | └ Point Name | TEXT | Yes | — | — | e.g., "Ntinda Trading Centre" |
| 5b | └ Pickup Time | TIME | No | — | — | Expected pickup |
| 5c | └ Sequence | INTEGER | Yes | — | Auto | Order of stops |
| 6 | Driver Name | TEXT | No | — | — | — |
| 7 | Driver Phone | PHONE | No | +256XXXXXXXXX | — | — |
| 8 | Vehicle Registration | TEXT | No | UAX NNN or similar | — | Uganda plate format |
| 9 | Vehicle Capacity | INTEGER | No | 1-100 | — | Max students |
| 10 | GL Revenue Account | SEARCH(CoA) | Yes | Revenue type | — | Transport revenue |
| 11 | Active | BOOLEAN | No | — | `true` | — |

**Validation Rules:**
- `V-TRN-001`: Route name unique within campus
- `V-TRN-002`: At least 2 pickup points required
- `V-TRN-003`: Cost per term > 0

---

### Form 8.2: Student Transport Assignment

| Property | Value |
|----------|-------|
| **Form ID** | `TRN-002` |
| **Title** | Assign Student to Route |
| **Roles** | TRANSPORT_MANAGER, ADMISSIONS_OFFICER |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student | SEARCH(Student) | Yes | Active, not already assigned | — | — |
| 2 | Route | SEARCH(TransportRoute) | Yes | Active routes | — | — |
| 3 | Pickup Point | SEARCH(PickupPoint) | Yes | Points on selected route | — | — |
| 4 | Term | ENUM(terms) | Yes | — | Current | — |
| 5 | Assignment Date | DATE | Yes | — | Today | — |
| 6 | Notes | TEXT | No | — | — | — |

**Validation Rules:**
- `V-TRN-004`: Student not already assigned to a route for the term
- `V-TRN-005`: Route capacity not exceeded
- `V-TRN-006`: Assignment triggers transport fee addition to student invoice

---

### Form 8.3: Bulk Transport Assignment

| Property | Value |
|----------|-------|
| **Form ID** | `TRN-003` |
| **Title** | Bulk Assign Transport |
| **Roles** | TRANSPORT_MANAGER |
| **Offline** | Yes |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Route | SEARCH(TransportRoute) | Yes | — | — | — |
| 2 | Term | ENUM(terms) | Yes | — | Current | — |
| 3 | Students | CHECKBOX_LIST(Students) | Yes | Active, unassigned | — | — |
| 4 | Default Pickup Point | SEARCH(PickupPoint) | No | — | — | — |

---

### Form 8.4: Transport Discontinuation

| Property | Value |
|----------|-------|
| **Form ID** | `TRN-004` |
| **Title** | Remove from Transport |
| **Roles** | TRANSPORT_MANAGER, BURSAR |
| **Offline** | Yes |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Assignment | SEARCH(StudentTransportAssignment) | Yes | Active only | — | — |
| 2 | Effective Date | DATE | Yes | — | Today | — |
| 3 | Reason | TEXT | Yes | — | — | — |
| 4 | Pro-rata Refund | BOOLEAN | No | — | `false` | Credit unused portion |
| 5 | Refund Amount | CURRENCY | Conditional | Auto-calculated if pro-rata | — | — |

---

### Form 8.5: Transport Report Filter

| Property | Value |
|----------|-------|
| **Form ID** | `TRN-005` |
| **Title** | Transport Report |
| **Roles** | TRANSPORT_MANAGER, BURSAR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Route | SEARCH(TransportRoute) | No | — | All | — |
| 2 | Term | ENUM(terms) | No | — | Current | — |
| 3 | Campus | SEARCH(Campus) | No | — | All | — |

---

## 11. Module 9 — Inventory & Store

### Form 9.1: Inventory Item

| Property | Value |
|----------|-------|
| **Form ID** | `INV-S01` |
| **Title** | Create / Edit Inventory Item |
| **Roles** | STOREKEEPER, BURSAR |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Item Name | TEXT | Yes | 2-100 chars, unique | — | e.g., "S1 Mathematics Textbook" |
| 2 | Item Code | TEXT | No | Unique | Auto | — |
| 3 | Item Type | ENUM(uniform, book, stationery, other) | Yes | — | other | — |
| 4 | Unit Cost (UGX) | CURRENCY | Yes | > 0 | — | Cost price per unit |
| 5 | Selling Price (UGX) | CURRENCY | No | ≥ unit cost | — | If sold to students |
| 6 | Quantity On Hand | INTEGER | Yes | ≥ 0 | 0 | Current stock level |
| 7 | Reorder Level | INTEGER | No | ≥ 0 | — | Alert when stock falls below |
| 8 | Supplier | SEARCH(Supplier) | No | — | — | Primary supplier |
| 9 | GL Inventory Account | SEARCH(CoA) | No | Asset type | — | Stock account |
| 10 | GL COGS Account | SEARCH(CoA) | No | Expense type | — | Cost of goods sold |
| 11 | Campus | SEARCH(Campus) | No | — | All | — |
| 12 | Active | BOOLEAN | No | — | `true` | — |
| 13 | Photo | FILE | No | JPG/PNG ≤ 2MB | — | — |

---

### Form 9.2: Stock Receipt (Goods Received)

| Property | Value |
|----------|-------|
| **Form ID** | `INV-S02` |
| **Title** | Receive Stock |
| **Roles** | STOREKEEPER |
| **Offline** | Yes |
| **Approval** | BURSAR approves if > UGX 2,000,000 |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | GRN Number | TEXT | Yes | Auto-generated | Auto | Goods Received Note |
| 2 | Supplier | SEARCH(Supplier) | Yes | — | — | — |
| 3 | Delivery Date | DATE | Yes | ≤ today | Today | — |
| 4 | Supplier Invoice Ref | TEXT | No | — | — | — |
| 5 | Items | REPEATER | Yes | ≥ 1 | — | — |
| 5a | └ Item | SEARCH(InventoryItem) | Yes | — | — | — |
| 5b | └ Quantity Received | INTEGER | Yes | > 0 | — | — |
| 5c | └ Unit Cost (UGX) | CURRENCY | Yes | > 0 | — | — |
| 5d | └ Total (UGX) | CURRENCY | Readonly | Qty × Cost | — | — |
| 6 | Total Amount | CURRENCY | Readonly | Sum | — | — |
| 7 | Notes | TEXT | No | — | — | — |

**Events Generated:**
- `INVENTORY_RECEIVED` → Increases stock levels, DR Inventory / CR AP/Cash

---

### Form 9.3: Stock Issue (to Students/Departments)

| Property | Value |
|----------|-------|
| **Form ID** | `INV-S03` |
| **Title** | Issue Stock |
| **Roles** | STOREKEEPER |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Issue Number | TEXT | Yes | Auto-generated | Auto | — |
| 2 | Issue To | ENUM(Student, Department, Other) | Yes | — | Student | — |
| 3 | Student | SEARCH(Student) | Conditional | Required if Student | — | — |
| 4 | Department | SEARCH(Department) | Conditional | Required if Department | — | — |
| 5 | Issue Date | DATE | Yes | — | Today | — |
| 6 | Items | REPEATER | Yes | ≥ 1 | — | — |
| 6a | └ Item | SEARCH(InventoryItem) | Yes | — | — | — |
| 6b | └ Quantity | INTEGER | Yes | ≤ on-hand stock | — | — |
| 6c | └ Unit Cost (UGX) | CURRENCY | Readonly | From item | — | — |
| 7 | Charge to Student | BOOLEAN | No | — | `true` | Add to student invoice |

**Validation Rules:**
- `V-INV-S01`: Quantity ≤ available stock
- `V-INV-S02`: If charge to student, creates invoice line item

---

### Form 9.4: Stock Adjustment

| Property | Value |
|----------|-------|
| **Form ID** | `INV-S04` |
| **Title** | Stock Count Adjustment |
| **Roles** | STOREKEEPER |
| **Offline** | Yes |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Adjustment Number | TEXT | Yes | Auto-generated | Auto | — |
| 2 | Item | SEARCH(InventoryItem) | Yes | — | — | — |
| 3 | Current Quantity | INTEGER | Readonly | From system | — | — |
| 4 | Physical Count | INTEGER | Yes | ≥ 0 | — | Actual count |
| 5 | Variance | INTEGER | Readonly | Physical - Current | — | — |
| 6 | Reason | LONGTEXT | Yes | Min 10 chars | — | — |
| 7 | Adjustment Date | DATE | Yes | — | Today | — |

---

### Form 9.5: Inventory Allocation to Class

| Property | Value |
|----------|-------|
| **Form ID** | `INV-S05` |
| **Title** | Allocate Inventory to Class |
| **Roles** | STOREKEEPER, BURSAR |
| **Offline** | Yes |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Class | SEARCH(Class) | Yes | — | — | — |
| 2 | Term | ENUM(terms) | Yes | — | Current | — |
| 3 | Items | REPEATER | Yes | ≥ 1 | — | — |
| 3a | └ Item | SEARCH(InventoryItem) | Yes | — | — | — |
| 3b | └ Qty Per Student | INTEGER | Yes | ≥ 1 | 1 | — |
| 3c | └ Unit Cost (UGX) | CURRENCY | Readonly | From item | — | — |
| 4 | Auto-Invoice | BOOLEAN | No | — | `true` | Add to student invoices |

---

### Form 9.6: Inventory Report Filter

| Property | Value |
|----------|-------|
| **Form ID** | `INV-S06` |
| **Title** | Inventory Report |
| **Roles** | STOREKEEPER, BURSAR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Item Type | ENUM(uniform, book, stationery, other, All) | No | — | All | — |
| 2 | Stock Status | ENUM(All, Below Reorder, Out of Stock) | No | — | All | — |
| 3 | Campus | SEARCH(Campus) | No | — | All | — |

---

## 12. Module 10 — Accounting & GL

### Form 10.1: Journal Entry

| Property | Value |
|----------|-------|
| **Form ID** | `GL-001` |
| **Title** | Manual Journal Entry |
| **Roles** | ACCOUNTANT, BURSAR |
| **Offline** | Yes |
| **Approval** | BURSAR approves; DIRECTOR if > UGX 10,000,000 |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Entry Date | DATE | Yes | Within open period | Today | — |
| 2 | Reference Number | TEXT | Yes | Auto-generated | Auto | JE-YYYY-NNNN |
| 3 | Description | TEXT | Yes | Min 10 chars | — | Purpose of entry |
| 4 | Line Items | REPEATER | Yes | ≥ 2 | — | — |
| 4a | └ Account | SEARCH(ChartOfAccount) | Yes | Active accounts | — | GL account |
| 4b | └ Description | TEXT | No | — | — | Line memo |
| 4c | └ Debit (UGX) | CURRENCY | Conditional | > 0, or Credit must be filled | — | — |
| 4d | └ Credit (UGX) | CURRENCY | Conditional | > 0, or Debit must be filled | — | — |
| 4e | └ Department | SEARCH(Department) | No | — | — | Cost center |
| 5 | Total Debits | CURRENCY | Readonly | Sum of debits | — | — |
| 6 | Total Credits | CURRENCY | Readonly | Sum of credits | — | — |
| 7 | Difference | CURRENCY | Readonly | Must be 0 | — | Must balance |
| 8 | Attachments | FILE[] | No | PDF/JPG ≤ 10MB each | — | — |

**Validation Rules:**
- `V-GL-001`: Total debits must equal total credits (balanced entry)
- `V-GL-002`: At least 2 line items required
- `V-GL-003`: Each line must have either debit or credit (not both)
- `V-GL-004`: Entry date must be within an open accounting period
- `V-GL-005`: Description must be ≥ 10 characters
- `V-GL-006`: All accounts must be active

**Events Generated:**
- `JOURNAL_ENTRY` → Updates GL balances for all affected accounts

---

### Form 10.2: Journal Entry Reversal

| Property | Value |
|----------|-------|
| **Form ID** | `GL-002` |
| **Title** | Reverse Journal Entry |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Original Entry | SEARCH(JournalEntry) | Yes | Status = posted | — | — |
| 2 | Reversal Date | DATE | Yes | Within open period | Today | — |
| 3 | Reason | LONGTEXT | Yes | Min 20 chars | — | — |
| 4 | Auto-Repost | BOOLEAN | No | — | `false` | Create correcting entry |

**Validation Rules:**
- `V-GL-007`: Can only reverse posted entries
- `V-GL-008`: Reversal date must be in open period
- `V-GL-009`: Creates exact opposite journal entry

---

### Form 10.3: Accounting Period Management

| Property | Value |
|----------|-------|
| **Form ID** | `GL-003` |
| **Title** | Accounting Periods |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | No |
| **Approval** | DIRECTOR approves close |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Period Name | TEXT | Yes | — | — | e.g., "January 2025" |
| 2 | Start Date | DATE | Yes | — | — | — |
| 3 | End Date | DATE | Yes | > Start | — | — |
| 4 | Status | ENUM(Open, Closed, Locked) | Yes | — | Open | — |
| 5 | Fiscal Year | TEXT | Yes | — | Current year | — |
| 6 | Close Date | DATE | Conditional | Required for closing | — | When was it closed |
| 7 | Closed By | TEXT | Readonly | Auto | — | — |

**Validation Rules:**
- `V-GL-010`: Cannot close period with unposted journals
- `V-GL-011`: Cannot reopen a Locked period
- `V-GL-012`: Periods must be contiguous within fiscal year

---

### Form 10.4: Recurring Journal Template

| Property | Value |
|----------|-------|
| **Form ID** | `GL-004` |
| **Title** | Recurring Journal |
| **Roles** | ACCOUNTANT, BURSAR |
| **Offline** | Yes |
| **Approval** | BURSAR approves template |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Template Name | TEXT | Yes | Unique | — | e.g., "Monthly Depreciation" |
| 2 | Frequency | ENUM(Monthly, Quarterly, Annually) | Yes | — | Monthly | — |
| 3 | Next Run Date | DATE | Yes | ≥ today | — | — |
| 4 | End Date | DATE | No | > Next Run | — | — |
| 5 | Description | TEXT | Yes | — | — | Appears on generated JE |
| 6 | Line Items | REPEATER | Yes | ≥ 2 | — | Same as GL-001 line items |
| 7 | Auto-Post | BOOLEAN | No | — | `false` | Post without review |
| 8 | Active | BOOLEAN | No | — | `true` | — |

---

### Form 10.5: Bank Reconciliation

| Property | Value |
|----------|-------|
| **Form ID** | `GL-005` |
| **Title** | Bank Reconciliation |
| **Roles** | ACCOUNTANT, BURSAR |
| **Offline** | No (needs statement) |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Bank Account | SEARCH(BankAccount) | Yes | — | — | — |
| 2 | Statement Date | DATE | Yes | — | Month end | — |
| 3 | Statement Balance (UGX) | CURRENCY | Yes | — | — | Per bank statement |
| 4 | Book Balance (UGX) | CURRENCY | Readonly | From GL | — | — |
| 5 | Unreconciled Items | CHECKBOX_LIST | Yes | — | All unmatched | Check = reconciled |
| 6 | Adjusted Balance | CURRENCY | Readonly | Calculated | — | — |
| 7 | Difference | CURRENCY | Readonly | Must be 0 | — | — |
| 8 | Notes | LONGTEXT | No | — | — | — |

**Validation Rules:**
- `V-GL-013`: Final difference must be UGX 0
- `V-GL-014`: All items must be reconciled or noted

---

### Form 10.6: Trial Balance Report Filter

| Property | Value |
|----------|-------|
| **Form ID** | `GL-006` |
| **Title** | Trial Balance |
| **Roles** | ACCOUNTANT, BURSAR, AUDITOR, DIRECTOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | As of Date | DATE | Yes | — | Today | — |
| 2 | Campus | SEARCH(Campus) | No | — | All | — |
| 3 | Department | SEARCH(Department) | No | — | All | — |
| 4 | Show Zero Balances | BOOLEAN | No | — | `false` | — |
| 5 | Account Type | ENUM(All, Assets, Liabilities, Equity, Revenue, Expenses) | No | — | All | — |

---

### Form 10.7: Income Statement Filter

| Property | Value |
|----------|-------|
| **Form ID** | `GL-007` |
| **Title** | Income Statement / P&L |
| **Roles** | BURSAR, DIRECTOR, BOARD_FINANCE_VIEWER, AUDITOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Period From | DATE | Yes | — | Year start | — |
| 2 | Period To | DATE | Yes | — | Today | — |
| 3 | Campus | SEARCH(Campus) | No | — | All | — |
| 4 | Department | SEARCH(Department) | No | — | All | — |
| 5 | Comparative Period | BOOLEAN | No | — | `false` | Show prior year |

---

### Form 10.8: Balance Sheet Filter

| Property | Value |
|----------|-------|
| **Form ID** | `GL-008` |
| **Title** | Balance Sheet |
| **Roles** | BURSAR, DIRECTOR, BOARD_FINANCE_VIEWER, AUDITOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | As of Date | DATE | Yes | — | Today | — |
| 2 | Campus | SEARCH(Campus) | No | — | All | — |
| 3 | Comparative | BOOLEAN | No | — | `false` | Show prior year |

---

## 13. Module 11 — Payroll

### Form 11.1: Employee Registration

| Property | Value |
|----------|-------|
| **Form ID** | `HR-001` |
| **Title** | Register Employee |
| **Roles** | PAYROLL_OFFICER, SUPER_ADMIN |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Employee Number | TEXT | Yes | Auto-generated, unique | Auto | EMP-NNNN |
| 2 | First Name | TEXT | Yes | 2-50 chars | — | — |
| 3 | Last Name | TEXT | Yes | 2-50 chars | — | — |
| 4 | Date of Birth | DATE | No | Age 18-70 | — | — |
| 5 | Gender | ENUM(M, F) | No | — | — | — |
| 6 | National ID (NIN) | TEXT | No | — | — | — |
| 7 | Department | SEARCH(Department) | Yes | — | — | — |
| 8 | Position / Title | TEXT | Yes | — | — | Job title |
| 9 | Campus | SEARCH(Campus) | Yes | — | Default | — |
| 10 | Hire Date | DATE | Yes | — | Today | — |
| 11 | Employment Type | ENUM(Full-Time, Part-Time, Contract) | Yes | — | Full-Time | — |
| 12 | TIN | TEXT | Yes | URA TIN format | — | Tax Identification Number |
| 13 | NSSF Number | TEXT | No | — | — | National Social Security Fund |
| 14 | Bank Name | TEXT | No | — | — | Salary bank |
| 15 | Bank Account Number | TEXT | No | — | — | — |
| 16 | Bank Branch | TEXT | No | — | — | — |
| 17 | Phone | PHONE | No | +256XXXXXXXXX | — | — |
| 18 | Email | EMAIL | No | — | — | — |
| 19 | Emergency Contact | TEXT | No | — | — | — |
| 20 | Emergency Phone | PHONE | No | — | — | — |
| 21 | Photo | FILE | No | JPG/PNG ≤ 2MB | — | — |
| 22 | Status | ENUM(EmployeeStatus) | No | — | ACTIVE | — |

**Validation Rules:**
- `V-HR-001`: Employee number must be unique
- `V-HR-002`: TIN must be valid URA format
- `V-HR-003`: Hire date cannot be in the future

---

### Form 11.2: Salary Structure

| Property | Value |
|----------|-------|
| **Form ID** | `HR-002` |
| **Title** | Salary Grade / Structure |
| **Roles** | PAYROLL_OFFICER, DIRECTOR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Structure Name | TEXT | Yes | Unique | — | e.g., "Grade T1 - Teacher" |
| 2 | Grade Level | TEXT | No | — | — | e.g., "T1", "A1" |
| 3 | Basic Salary (UGX) | CURRENCY | Yes | > 0 | — | Monthly basic |
| 4 | Housing Allowance (UGX) | CURRENCY | No | ≥ 0 | 0 | — |
| 5 | Transport Allowance (UGX) | CURRENCY | No | ≥ 0 | 0 | — |
| 6 | Medical Allowance (UGX) | CURRENCY | No | ≥ 0 | 0 | — |
| 7 | Other Allowances (UGX) | CURRENCY | No | ≥ 0 | 0 | — |
| 8 | Gross Salary (UGX) | CURRENCY | Readonly | Sum of above | — | — |
| 9 | Effective Date | DATE | Yes | — | Today | — |
| 10 | Active | BOOLEAN | No | — | `true` | — |

**Validation Rules:**
- `V-HR-004`: Structure name must be unique
- `V-HR-005`: Basic salary must be > UGX 0
- `V-HR-006`: Gross = Basic + all allowances

---

### Form 11.3: Employee Deduction Setup

| Property | Value |
|----------|-------|
| **Form ID** | `HR-003` |
| **Title** | Employee Deduction |
| **Roles** | PAYROLL_OFFICER |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Employee | SEARCH(Employee) | Yes | Active only | — | — |
| 2 | Deduction Type | SEARCH(DeductionType) | Yes | — | — | e.g., "Saccos Savings" |
| 3 | Amount / Rate | DECIMAL | Yes | > 0 | — | — |
| 4 | Is Percentage | BOOLEAN | Yes | — | `false` | Of gross salary |
| 5 | Start Date | DATE | Yes | — | Today | — |
| 6 | End Date | DATE | No | > Start | — | — |
| 7 | Active | BOOLEAN | No | — | `true` | — |

---

### Form 11.4: Payroll Run

| Property | Value |
|----------|-------|
| **Form ID** | `HR-004` |
| **Title** | Process Monthly Payroll |
| **Roles** | PAYROLL_OFFICER |
| **Offline** | Yes |
| **Approval** | BURSAR approves, DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Pay Period | TEXT | Yes | Format: "2025-07" | Current month | — |
| 2 | Run Date | DATE | Yes | — | Today | — |
| 3 | Campus | SEARCH(Campus) | No | — | All | — |
| 4 | Department | SEARCH(Department) | No | — | All | — |
| 5 | Preview | BOOLEAN | No | — | `true` | Calculate without posting |

**Auto-Calculated Per Employee:**

| Field | Calculation |
|-------|-------------|
| Basic Salary | From salary structure |
| Total Allowances | Housing + Transport + Medical + Other |
| Gross Salary | Basic + Allowances |
| PAYE | URA progressive tax brackets |
| NSSF (Employee) | 5% of gross |
| NSSF (Employer) | 10% of gross |
| LST (Local Service Tax) | Uganda local government tax schedule |
| Voluntary Deductions | From employee deduction setup |
| Total Deductions | PAYE + NSSF + LST + Voluntary |
| Net Salary | Gross - Total Deductions |

**Uganda Statutory Deductions:**

| Deduction | Rate | Cap |
|-----------|------|-----|
| PAYE | Progressive: 0% up to UGX 235,000/mo; 10% on 235,001-335,000; 20% on 335,001-410,000; 30% on 410,001-10M; 40% above 10M | — |
| NSSF Employee | 5% of gross | — |
| NSSF Employer | 10% of gross | — |
| LST | UGX 10,000-100,000/year based on income bracket | Per local govt schedule |

**Validation Rules:**
- `V-HR-007`: Pay period must not already have a POSTED payroll
- `V-HR-008`: All employees must have salary structures assigned
- `V-HR-009`: PAYE calculated per URA brackets
- `V-HR-010`: Payroll total must balance (sum of nets + deductions = sum of gross)

**Events Generated:**
- `PAYROLL_POSTED` → Multiple journal entries:
  - DR Salary Expense / CR PAYE Payable, NSSF Payable, LST Payable, Net Salary Payable
  - DR NSSF Expense (employer) / CR NSSF Payable (employer)

---

### Form 11.5: Payslip Viewer

| Property | Value |
|----------|-------|
| **Form ID** | `HR-005` |
| **Title** | Employee Payslip |
| **Roles** | PAYROLL_OFFICER, BURSAR, Employee (own) |
| **Offline** | Yes |
| **Approval** | None (read-only) |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Employee | SEARCH(Employee) | Yes | — | Self (if employee) | — |
| 2 | Pay Period | TEXT | Yes | — | Current month | — |

**Output Fields:** Employee details, Earnings breakdown, Deductions breakdown, Net pay, YTD totals

**Actions:** Print, Download PDF, Email to employee

---

### Form 11.6: Payroll Reversal

| Property | Value |
|----------|-------|
| **Form ID** | `HR-006` |
| **Title** | Reverse Payroll Run |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | No |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Payroll Run | SEARCH(PayrollRun) | Yes | Status = POSTED | — | — |
| 2 | Reason | LONGTEXT | Yes | Min 20 chars | — | — |
| 3 | Reversal Date | DATE | Yes | Open period | Today | — |

---

### Form 11.7: Deduction Type Setup

| Property | Value |
|----------|-------|
| **Form ID** | `HR-007` |
| **Title** | Deduction Type |
| **Roles** | PAYROLL_OFFICER, BURSAR |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Name | TEXT | Yes | Unique | — | e.g., "SACCO Savings" |
| 2 | Code | TEXT | Yes | Unique, 2-10 | — | — |
| 3 | Category | ENUM(DeductionCategory) | Yes | — | VOLUNTARY | — |
| 4 | Is Percentage | BOOLEAN | Yes | — | `false` | — |
| 5 | Default Value | DECIMAL | Yes | > 0 | — | — |
| 6 | Max Amount (UGX) | CURRENCY | No | — | — | Cap |
| 7 | GL Payable Account | SEARCH(CoA) | No | Liability type | — | — |
| 8 | Active | BOOLEAN | No | — | `true` | — |

---

### Form 11.8: Employee Termination

| Property | Value |
|----------|-------|
| **Form ID** | `HR-008` |
| **Title** | Terminate Employee |
| **Roles** | PAYROLL_OFFICER, DIRECTOR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Employee | SEARCH(Employee) | Yes | Active employees | — | — |
| 2 | Termination Date | DATE | Yes | — | Today | — |
| 3 | Reason | ENUM(Resignation, Redundancy, Dismissal, Retirement, End of Contract) | Yes | — | — | — |
| 4 | Final Pay | BOOLEAN | Yes | — | `true` | Calculate final pay |
| 5 | Notice Period Paid | BOOLEAN | No | — | `false` | — |
| 6 | Gratuity Amount (UGX) | CURRENCY | Conditional | — | — | If applicable |
| 7 | Leave Days Outstanding | INTEGER | No | — | Auto | — |
| 8 | Leave Payout (UGX) | CURRENCY | Conditional | Auto-calculated | — | — |
| 9 | Notes | LONGTEXT | No | — | — | — |

---

## 14. Module 12 — Accounts Payable

### Form 12.1: Supplier Registration

| Property | Value |
|----------|-------|
| **Form ID** | `AP-001` |
| **Title** | Register Supplier |
| **Roles** | BURSAR, ACCOUNTANT |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Supplier Name | TEXT | Yes | 2-100 chars | — | Legal business name |
| 2 | Contact Person | TEXT | No | — | — | — |
| 3 | Email | EMAIL | No | — | — | — |
| 4 | Phone | PHONE | No | +256XXXXXXXXX | — | — |
| 5 | Address | TEXT | No | — | — | Physical/postal address |
| 6 | TIN | TEXT | No | URA TIN 10-digit | — | Tax Identification Number |
| 7 | Bank Name | TEXT | No | — | — | — |
| 8 | Bank Account Number | TEXT | No | — | — | — |
| 9 | Bank Branch | TEXT | No | — | — | — |
| 10 | Payment Terms (Days) | INTEGER | Yes | 0-365 | 30 | — |
| 11 | Credit Limit (UGX) | CURRENCY | No | ≥ 0 | — | Max outstanding |
| 12 | Category | ENUM(Utilities, Stationery, Services, Food, Maintenance, Other) | No | — | Other | — |
| 13 | Status | ENUM(SupplierStatus) | No | — | ACTIVE | — |

**Validation Rules:**
- `V-AP-001`: Supplier name must be unique (or near-match warning)
- `V-AP-002`: TIN format validated if provided

---

### Form 12.2: Supplier Invoice (Bill Entry)

| Property | Value |
|----------|-------|
| **Form ID** | `AP-002` |
| **Title** | Enter Supplier Bill |
| **Roles** | ACCOUNTANT, BURSAR |
| **Offline** | Yes |
| **Approval** | BURSAR approves; DIRECTOR if > UGX 5,000,000 |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Supplier | SEARCH(Supplier) | Yes | Active suppliers | — | — |
| 2 | Invoice Number | TEXT | Yes | Unique per supplier | — | Supplier's invoice # |
| 3 | Invoice Date | DATE | Yes | ≤ today | Today | — |
| 4 | Due Date | DATE | Yes | ≥ Invoice Date | +terms days | — |
| 5 | Line Items | REPEATER | Yes | ≥ 1 | — | — |
| 5a | └ Description | TEXT | Yes | — | — | — |
| 5b | └ GL Account | SEARCH(CoA) | Yes | Expense/Asset type | — | — |
| 5c | └ Quantity | DECIMAL | Yes | > 0 | 1 | — |
| 5d | └ Unit Price (UGX) | CURRENCY | Yes | > 0 | — | — |
| 5e | └ Amount (UGX) | CURRENCY | Readonly | Qty × Price | — | — |
| 5f | └ Tax Amount (UGX) | CURRENCY | No | ≥ 0 | 0 | VAT if applicable |
| 6 | Subtotal (UGX) | CURRENCY | Readonly | Sum of amounts | — | — |
| 7 | Tax Total (UGX) | CURRENCY | Readonly | Sum of taxes | — | — |
| 8 | Total (UGX) | CURRENCY | Readonly | Sub + Tax | — | — |
| 9 | Notes | LONGTEXT | No | — | — | — |
| 10 | Attachment | FILE | No | PDF ≤ 10MB | — | Scan of invoice |
| 11 | Budget Check | TEXT | Readonly | Auto | — | Shows remaining budget |

**Validation Rules:**
- `V-AP-003`: Invoice number unique per supplier
- `V-AP-004`: GL accounts must be Expense or Asset type
- `V-AP-005`: Total ≤ supplier credit limit (warning, not blocking)
- `V-AP-006`: Budget check – warn if line exceeds departmental budget

**Events Generated:**
- `SUPPLIER_BILL_POSTED` → DR Expense accounts / CR Accounts Payable

---

### Form 12.3: Payment Run (AP)

| Property | Value |
|----------|-------|
| **Form ID** | `AP-003` |
| **Title** | Supplier Payment Run |
| **Roles** | BURSAR |
| **Offline** | No (requires bank details) |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Payment Date | DATE | Yes | — | Today | — |
| 2 | Bank Account | SEARCH(BankAccount) | Yes | — | Default | — |
| 3 | Payment Method | ENUM(Bank Transfer, Cheque, Mobile Money, Cash) | Yes | — | Bank Transfer | — |
| 4 | Invoices to Pay | CHECKBOX_LIST(SupplierInvoice) | Yes | Approved, unpaid | — | — |
| 5 | Total Payment (UGX) | CURRENCY | Readonly | Sum of selected | — | — |
| 6 | Notes | TEXT | No | — | — | — |

**Validation Rules:**
- `V-AP-007`: Bank account must have sufficient balance (warning)
- `V-AP-008`: All selected invoices must be in APPROVED status
- `V-AP-009`: Payment total recorded per supplier

**Events Generated:**
- `SUPPLIER_PAYMENT_POSTED` → DR Accounts Payable / CR Bank

---

### Form 12.4: Individual Supplier Payment

| Property | Value |
|----------|-------|
| **Form ID** | `AP-004` |
| **Title** | Pay Supplier |
| **Roles** | BURSAR, ACCOUNTANT |
| **Offline** | Yes |
| **Approval** | BURSAR approves; DIRECTOR if > UGX 5,000,000 |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Supplier | SEARCH(Supplier) | Yes | — | — | — |
| 2 | Payment Date | DATE | Yes | — | Today | — |
| 3 | Method | ENUM(Bank Transfer, Cheque, Mobile Money, Cash) | Yes | — | — | — |
| 4 | Amount (UGX) | CURRENCY | Yes | > 0 | — | — |
| 5 | Reference | TEXT | Conditional | Required for non-cash | — | Transfer ref / cheque # |
| 6 | Bank Account | SEARCH(BankAccount) | Yes | — | — | — |
| 7 | Invoice(s) to Apply | SEARCH[](SupplierInvoice) | No | — | FIFO | — |
| 8 | Notes | TEXT | No | — | — | — |

---

### Form 12.5: Supplier Payment Reversal

| Property | Value |
|----------|-------|
| **Form ID** | `AP-005` |
| **Title** | Reverse Supplier Payment |
| **Roles** | BURSAR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Payment | SEARCH(SupplierPayment) | Yes | Status = PROCESSED | — | — |
| 2 | Reason | LONGTEXT | Yes | Min 20 chars | — | — |
| 3 | Reversal Date | DATE | Yes | Open period | Today | — |

---

### Form 12.6: Supplier Aging Report Filter

| Property | Value |
|----------|-------|
| **Form ID** | `AP-006` |
| **Title** | Accounts Payable Aging |
| **Roles** | BURSAR, DIRECTOR, AUDITOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | As of Date | DATE | Yes | — | Today | — |
| 2 | Supplier | SEARCH(Supplier) | No | — | All | — |
| 3 | Campus | SEARCH(Campus) | No | — | All | — |

---

### Form 12.7: Purchase Order (Optional)

| Property | Value |
|----------|-------|
| **Form ID** | `AP-007` |
| **Title** | Purchase Order |
| **Roles** | DEPARTMENT_HEAD, BURSAR |
| **Offline** | Yes |
| **Approval** | BURSAR approves; DIRECTOR if > UGX 10,000,000 |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | PO Number | TEXT | Yes | Auto-generated | Auto | PO-YYYY-NNNN |
| 2 | Supplier | SEARCH(Supplier) | Yes | — | — | — |
| 3 | Requested By | TEXT | Readonly | Current user | — | — |
| 4 | Department | SEARCH(Department) | Yes | — | User's dept | — |
| 5 | Items | REPEATER | Yes | ≥ 1 | — | — |
| 5a | └ Description | TEXT | Yes | — | — | — |
| 5b | └ Quantity | DECIMAL | Yes | > 0 | — | — |
| 5c | └ Estimated Price (UGX) | CURRENCY | Yes | > 0 | — | — |
| 5d | └ Budget Line | SEARCH(BudgetLine) | No | — | — | — |
| 6 | Total (UGX) | CURRENCY | Readonly | Sum | — | — |
| 7 | Delivery Date | DATE | No | — | — | — |
| 8 | Justification | LONGTEXT | Yes | — | — | — |
| 9 | Status | ENUM(Draft, Submitted, Approved, Received, Cancelled) | Yes | — | Draft | — |

---

## 15. Module 13 — Treasury & Banking

### Form 13.1: Bank Transfer

| Property | Value |
|----------|-------|
| **Form ID** | `TRS-001` |
| **Title** | Inter-Bank Transfer |
| **Roles** | BURSAR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves if > UGX 10,000,000 |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Transfer Date | DATE | Yes | ≤ today | Today | — |
| 2 | From Account | SEARCH(BankAccount) | Yes | — | — | — |
| 3 | To Account | SEARCH(BankAccount) | Yes | ≠ From Account | — | — |
| 4 | Amount (UGX) | CURRENCY | Yes | > 0, ≤ from account balance | — | — |
| 5 | Reference | TEXT | No | — | Auto | — |
| 6 | Purpose | TEXT | Yes | — | — | — |
| 7 | Notes | TEXT | No | — | — | — |

**Validation Rules:**
- `V-TRS-001`: From and To accounts must differ
- `V-TRS-002`: Amount ≤ from account balance (warning)
- `V-TRS-003`: Transfer date must be in open period

**Events Generated:**
- `BANK_TRANSFER` → DR To-Bank / CR From-Bank

---

### Form 13.2: Cash Forecast Entry

| Property | Value |
|----------|-------|
| **Form ID** | `TRS-002` |
| **Title** | Cash Flow Forecast |
| **Roles** | BURSAR |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Period | TEXT | Yes | — | Next month | — |
| 2 | Category | ENUM(CashForecastCategory) | Yes | — | — | — |
| 3 | Description | TEXT | Yes | — | — | — |
| 4 | Expected Amount (UGX) | CURRENCY | Yes | > 0 | — | — |
| 5 | Expected Date | DATE | Yes | — | — | — |
| 6 | Confidence | ENUM(High, Medium, Low) | No | — | Medium | — |
| 7 | Notes | TEXT | No | — | — | — |

---

### Form 13.3: Petty Cash Voucher

| Property | Value |
|----------|-------|
| **Form ID** | `TRS-003` |
| **Title** | Petty Cash Voucher |
| **Roles** | CASHIER, BURSAR |
| **Offline** | Yes |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Voucher Number | TEXT | Yes | Auto-generated | Auto | PCV-YYYY-NNNN |
| 2 | Date | DATE | Yes | ≤ today | Today | — |
| 3 | Description | TEXT | Yes | — | — | — |
| 4 | Amount (UGX) | CURRENCY | Yes | > 0, ≤ petty cash limit | — | — |
| 5 | GL Account | SEARCH(CoA) | Yes | Expense type | — | — |
| 6 | Department | SEARCH(Department) | No | — | — | — |
| 7 | Receipt Attached | BOOLEAN | Yes | — | — | Physical receipt available |
| 8 | Attachment | FILE | No | — | — | Photo of receipt |
| 9 | Received By | TEXT | Yes | — | — | Who received the cash |

**Validation Rules:**
- `V-TRS-004`: Amount ≤ institution's petty cash transaction limit
- `V-TRS-005`: Petty cash fund must have sufficient balance

---

### Form 13.4: Petty Cash Replenishment

| Property | Value |
|----------|-------|
| **Form ID** | `TRS-004` |
| **Title** | Replenish Petty Cash |
| **Roles** | BURSAR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Date | DATE | Yes | — | Today | — |
| 2 | Amount (UGX) | CURRENCY | Yes | > 0 | Total spent since last replenish | — |
| 3 | From Bank Account | SEARCH(BankAccount) | Yes | — | Default | — |
| 4 | Summary of Vouchers | TEXT | Readonly | — | Auto | Number of vouchers, total |

---

### Form 13.5: Treasury Dashboard Filter

| Property | Value |
|----------|-------|
| **Form ID** | `TRS-005` |
| **Title** | Treasury Overview |
| **Roles** | BURSAR, DIRECTOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | As of Date | DATE | Yes | — | Today | — |
| 2 | Campus | SEARCH(Campus) | No | — | All | — |

---

## 16. Module 14 — Fixed Assets

### Form 14.1: Asset Registration

| Property | Value |
|----------|-------|
| **Form ID** | `FA-001` |
| **Title** | Register Fixed Asset |
| **Roles** | ACCOUNTANT, BURSAR |
| **Offline** | Yes |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Asset Tag | TEXT | Yes | Auto or manual, unique | Auto | FA-YYYY-NNNN |
| 2 | Asset Name | TEXT | Yes | — | — | e.g., "Toyota Coaster School Bus" |
| 3 | Description | LONGTEXT | No | — | — | — |
| 4 | Category | ENUM(Vehicle, Furniture, IT Equipment, Building, Land, Other) | Yes | — | — | — |
| 5 | Serial / Registration | TEXT | No | — | — | e.g., UAB 123X (vehicle) |
| 6 | Purchase Date | DATE | Yes | ≤ today | — | — |
| 7 | Purchase Cost (UGX) | CURRENCY | Yes | > 0 | — | — |
| 8 | Supplier | SEARCH(Supplier) | No | — | — | Purchased from |
| 9 | Supplier Invoice | SEARCH(SupplierInvoice) | No | — | — | Link to AP |
| 10 | Useful Life (Months) | INTEGER | Yes | > 0 | 60 | — |
| 11 | Salvage Value (UGX) | CURRENCY | No | < Purchase Cost | 0 | — |
| 12 | Depreciation Method | ENUM(DepreciationMethod) | Yes | — | STRAIGHT_LINE | — |
| 13 | GL Asset Account | SEARCH(CoA) | Yes | Asset type | — | — |
| 14 | GL Depreciation Account | SEARCH(CoA) | Yes | Expense type | — | — |
| 15 | GL Accum Depn Account | SEARCH(CoA) | Yes | Asset type (contra) | — | — |
| 16 | Location / Campus | SEARCH(Campus) | Yes | — | Default | — |
| 17 | Department | SEARCH(Department) | No | — | — | — |
| 18 | Status | ENUM(AssetStatus) | No | — | ACTIVE | — |
| 19 | Photo | FILE | No | — | — | — |

**Validation Rules:**
- `V-FA-001`: Asset tag must be unique
- `V-FA-002`: Salvage value < purchase cost
- `V-FA-003`: Useful life > 0 months
- `V-FA-004`: GL accounts must match expected types

---

### Form 14.2: Run Depreciation

| Property | Value |
|----------|-------|
| **Form ID** | `FA-002` |
| **Title** | Monthly Depreciation Run |
| **Roles** | ACCOUNTANT, BURSAR |
| **Offline** | Yes |
| **Approval** | BURSAR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Period | TEXT | Yes | YYYY-MM | Current month | — |
| 2 | Campus | SEARCH(Campus) | No | — | All | — |
| 3 | Preview | BOOLEAN | No | — | `true` | — |

**Auto-Calculated Per Asset:**
- Straight Line: `(Cost - Salvage) / UsefulLifeMonths`
- Reducing Balance: `(NBV × Annual Rate) / 12`

**Events Generated:**
- `DEPRECIATION_POSTED` → DR Depreciation Expense / CR Accumulated Depreciation (per asset)

---

### Form 14.3: Asset Disposal

| Property | Value |
|----------|-------|
| **Form ID** | `FA-003` |
| **Title** | Dispose Fixed Asset |
| **Roles** | BURSAR |
| **Offline** | Yes |
| **Approval** | DIRECTOR + BOARD_FINANCE_VIEWER approve |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Asset | SEARCH(FixedAsset) | Yes | ACTIVE only | — | — |
| 2 | Disposal Date | DATE | Yes | ≤ today | Today | — |
| 3 | Disposal Method | ENUM(Sold, Scrapped, Donated, Written Off) | Yes | — | — | — |
| 4 | Proceeds (UGX) | CURRENCY | Conditional | Required if Sold | — | — |
| 5 | Net Book Value | CURRENCY | Readonly | Auto | — | — |
| 6 | Gain/Loss | CURRENCY | Readonly | Proceeds - NBV | — | — |
| 7 | Reason | LONGTEXT | Yes | — | — | — |
| 8 | Buyer / Recipient | TEXT | Conditional | Required if Sold/Donated | — | — |

**Events Generated:**
- `ASSET_DISPOSED` → DR Cash, DR Accum Depn / CR Asset, CR/DR Gain or Loss

---

### Form 14.4: Asset Transfer

| Property | Value |
|----------|-------|
| **Form ID** | `FA-004` |
| **Title** | Transfer Asset Between Locations |
| **Roles** | ACCOUNTANT, BURSAR |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Asset | SEARCH(FixedAsset) | Yes | — | — | — |
| 2 | From Campus | TEXT | Readonly | Current | — | — |
| 3 | To Campus | SEARCH(Campus) | Yes | ≠ current | — | — |
| 4 | Transfer Date | DATE | Yes | — | Today | — |
| 5 | Reason | TEXT | No | — | — | — |

---

### Form 14.5: Asset Register Report Filter

| Property | Value |
|----------|-------|
| **Form ID** | `FA-005` |
| **Title** | Fixed Asset Register |
| **Roles** | ACCOUNTANT, BURSAR, AUDITOR, DIRECTOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Category | ENUM(categories) | No | — | All | — |
| 2 | Campus | SEARCH(Campus) | No | — | All | — |
| 3 | Status | ENUM(AssetStatus) | No | — | ACTIVE | — |
| 4 | As of Date | DATE | No | — | Today | — |

---

## 17. Module 15 — Budget

### Form 15.1: Budget Creation

| Property | Value |
|----------|-------|
| **Form ID** | `BDG-001` |
| **Title** | Create Annual Budget |
| **Roles** | BURSAR, DEPARTMENT_HEAD |
| **Offline** | Yes |
| **Approval** | BURSAR submits → DIRECTOR approves → BOARD approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Budget Name | TEXT | Yes | Unique | — | e.g., "2025 Annual Budget" |
| 2 | Fiscal Year | TEXT | Yes | — | Current | — |
| 3 | Campus | SEARCH(Campus) | No | — | All | Scope |
| 4 | Department | SEARCH(Department) | No | — | All | Scope |
| 5 | Budget Lines | REPEATER | Yes | ≥ 1 | — | — |
| 5a | └ GL Account | SEARCH(CoA) | Yes | Expense/Revenue | — | — |
| 5b | └ Description | TEXT | Yes | — | — | — |
| 5c | └ Q1 Amount (UGX) | CURRENCY | Yes | — | — | Jan-Mar |
| 5d | └ Q2 Amount (UGX) | CURRENCY | Yes | — | — | Apr-Jun |
| 5e | └ Q3 Amount (UGX) | CURRENCY | Yes | — | — | Jul-Sep |
| 5f | └ Q4 Amount (UGX) | CURRENCY | Yes | — | — | Oct-Dec |
| 5g | └ Annual Total (UGX) | CURRENCY | Readonly | Sum Q1-Q4 | — | — |
| 6 | Revenue Total (UGX) | CURRENCY | Readonly | Sum revenue lines | — | — |
| 7 | Expense Total (UGX) | CURRENCY | Readonly | Sum expense lines | — | — |
| 8 | Surplus / Deficit (UGX) | CURRENCY | Readonly | Revenue - Expense | — | — |
| 9 | Status | ENUM(BudgetStatus) | Yes | — | DRAFT | — |
| 10 | Notes | LONGTEXT | No | — | — | — |

**Validation Rules:**
- `V-BDG-001`: Budget name must be unique
- `V-BDG-002`: All line amounts ≥ 0
- `V-BDG-003`: At least one budget line required

---

### Form 15.2: Budget Revision

| Property | Value |
|----------|-------|
| **Form ID** | `BDG-002` |
| **Title** | Revise Budget |
| **Roles** | BURSAR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Budget | SEARCH(Budget) | Yes | Status = ACTIVE | — | — |
| 2 | Revision Number | INTEGER | Readonly | Auto-increment | — | — |
| 3 | Revised Lines | REPEATER | Yes | ≥ 1 | — | — |
| 3a | └ Budget Line | SEARCH(BudgetLine) | Yes | — | — | — |
| 3b | └ Current Amount (UGX) | CURRENCY | Readonly | — | — | — |
| 3c | └ New Amount (UGX) | CURRENCY | Yes | — | — | — |
| 3d | └ Variance (UGX) | CURRENCY | Readonly | New - Current | — | — |
| 3e | └ Reason | TEXT | Yes | — | — | — |
| 4 | Revision Date | DATE | Yes | — | Today | — |
| 5 | Justification | LONGTEXT | Yes | Min 20 chars | — | — |

---

### Form 15.3: Budget vs Actual Report Filter

| Property | Value |
|----------|-------|
| **Form ID** | `BDG-003` |
| **Title** | Budget vs Actual |
| **Roles** | BURSAR, DIRECTOR, DEPARTMENT_HEAD, AUDITOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Budget | SEARCH(Budget) | Yes | — | Active budget | — |
| 2 | Period | ENUM(Q1, Q2, Q3, Q4, YTD, Full Year) | Yes | — | YTD | — |
| 3 | Campus | SEARCH(Campus) | No | — | All | — |
| 4 | Department | SEARCH(Department) | No | — | All | — |
| 5 | Show Variances Only | BOOLEAN | No | — | `false` | Hide on-budget lines |

---

### Form 15.4: Budget Transfer

| Property | Value |
|----------|-------|
| **Form ID** | `BDG-004` |
| **Title** | Inter-Line Budget Transfer |
| **Roles** | BURSAR |
| **Offline** | Yes |
| **Approval** | DIRECTOR approves |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | From Budget Line | SEARCH(BudgetLine) | Yes | — | — | — |
| 2 | To Budget Line | SEARCH(BudgetLine) | Yes | ≠ From | — | — |
| 3 | Transfer Amount (UGX) | CURRENCY | Yes | ≤ From line remaining | — | — |
| 4 | Reason | LONGTEXT | Yes | — | — | — |
| 5 | Effective Period | ENUM(Q1-Q4) | Yes | — | Current | — |

---

### Form 15.5: Budget Close

| Property | Value |
|----------|-------|
| **Form ID** | `BDG-005` |
| **Title** | Close Budget Year |
| **Roles** | BURSAR, SUPER_ADMIN |
| **Offline** | No |
| **Approval** | DIRECTOR + BOARD approve |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Budget | SEARCH(Budget) | Yes | ACTIVE status | — | — |
| 2 | Close Date | DATE | Yes | — | Year end | — |
| 3 | Carry Forward Unspent | BOOLEAN | No | — | `false` | Transfer unspent to next year |
| 4 | Notes | LONGTEXT | No | — | — | — |

---

## 18. Module 16 — Scholarships & Bursaries

### Form 16.1: Bursary Application

| Property | Value |
|----------|-------|
| **Form ID** | `SCH-001` |
| **Title** | Bursary / Scholarship Application |
| **Roles** | ADMISSIONS_OFFICER, HEADTEACHER |
| **Offline** | Yes |
| **Approval** | HEADTEACHER recommends → DIRECTOR approves → BOARD approves (if > UGX 2,000,000/term) |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Student | SEARCH(Student) | Yes | Active | — | — |
| 2 | Scholarship Type | ENUM(Government Bursary (MoES), District Bursary, Internal Scholarship, Makerere Foundation, External Sponsor, Other) | Yes | — | — | — |
| 3 | Amount Requested (UGX) | CURRENCY | Yes | > 0 | — | Per term |
| 4 | Academic Year | SEARCH(AcademicYear) | Yes | — | Current | — |
| 5 | Term(s) Applied | ENUM[](Term 1, Term 2, Term 3) | Yes | — | All | — |
| 6 | Justification | LONGTEXT | Yes | Min 50 chars | — | Why student deserves |
| 7 | Academic Performance | ENUM(Excellent, Good, Average, Below Average) | No | — | — | — |
| 8 | Financial Need | ENUM(Critical, High, Medium, Low) | No | — | — | — |
| 9 | Supporting Documents | FILE[] | No | — | — | MoES letter, income certs |
| 10 | Sponsor Name | TEXT | Conditional | Required for External | — | — |
| 11 | Sponsor Contact | TEXT | Conditional | Required for External | — | — |
| 12 | Notes | LONGTEXT | No | — | — | — |

**Validation Rules:**
- `V-SCH-001`: Amount ≤ total fees for the term(s)
- `V-SCH-002`: Justification ≥ 50 characters
- `V-SCH-003`: Only one active bursary per student per type per term

---

### Form 16.2: Bursary Approval

| Property | Value |
|----------|-------|
| **Form ID** | `SCH-002` |
| **Title** | Approve / Reject Bursary |
| **Roles** | HEADTEACHER, DIRECTOR, BOARD_FINANCE_VIEWER |
| **Offline** | Yes |
| **Approval** | Multi-level (see form 16.1) |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Application | SEARCH(BursaryRequest) | Yes | Status = SUBMITTED | — | — |
| 2 | Decision | ENUM(Approved, Rejected, Deferred) | Yes | — | — | — |
| 3 | Approved Amount (UGX) | CURRENCY | Conditional | Required if Approved; ≤ Requested | — | — |
| 4 | Effective Date | DATE | Conditional | Required if Approved | — | — |
| 5 | Conditions | LONGTEXT | No | — | — | Academic performance requirements, etc. |
| 6 | Notes | LONGTEXT | Yes | — | — | — |

**Events Generated:**
- `BURSARY_APPROVED` → Creates credit note or fee adjustment on student invoices

---

### Form 16.3: Bursary Disbursement Tracking

| Property | Value |
|----------|-------|
| **Form ID** | `SCH-003` |
| **Title** | Record Bursary Disbursement |
| **Roles** | BURSAR, CASHIER |
| **Offline** | Yes |
| **Approval** | None |

**Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Approved Bursary | SEARCH(BursaryApproval) | Yes | Approved status | — | — |
| 2 | Disbursement Date | DATE | Yes | — | Today | — |
| 3 | Amount Applied (UGX) | CURRENCY | Yes | ≤ approved amount | — | — |
| 4 | Applied to Invoices | SEARCH[](StudentInvoice) | Yes | Open invoices | — | — |
| 5 | Reference | TEXT | No | — | — | MoES ref, etc. |

**Events Generated:**
- `BURSARY_DISBURSED` → DR Bursary Expense or Receivable / CR Student AR

---

### Form 16.4: Scholarship Report Filter

| Property | Value |
|----------|-------|
| **Form ID** | `SCH-004` |
| **Title** | Scholarship / Bursary Report |
| **Roles** | BURSAR, DIRECTOR, AUDITOR |
| **Offline** | Yes |
| **Approval** | None |

**Filter Fields:**

| # | Field | Type | Required | Constraints | Default | Help |
|---|-------|------|----------|-------------|---------|------|
| 1 | Academic Year | SEARCH(AcademicYear) | Yes | — | Current | — |
| 2 | Scholarship Type | ENUM(types) | No | — | All | — |
| 3 | Status | ENUM(BursaryStatus) | No | — | All | — |
| 4 | Class | SEARCH(Class) | No | — | All | — |
| 5 | Campus | SEARCH(Campus) | No | — | All | — |

---

## 19. Cross-Cutting Concerns

### 19.1 Audit Log (Automatic)

Every form submission automatically generates an `AuditLogEntry`:

| Field | Source |
|-------|--------|
| `action` | create / update / delete / approve / post / reverse |
| `entityType` | Form's entity (invoice, payment, journal, etc.) |
| `entityId` | Record ID |
| `userId` | Current user |
| `timestamp` | Now |
| `oldValue` | Previous state (for updates) |
| `newValue` | New state |
| `reason` | From form's reason/notes field |
| `affectedFields` | List of changed fields |

### 19.2 Notification Rules

The following form actions trigger notifications:

| Trigger | Recipients | Channel |
|---------|-----------|---------|
| Invoice created | Family (email/SMS) | Async |
| Payment received | Family (email) + Cashier | Instant |
| Approval pending | Approver role | In-app + email |
| Budget threshold (80%) | BURSAR | In-app |
| Payroll ready for approval | DIRECTOR | In-app + email |
| Overdue invoice (7 days) | BURSAR, CASHIER | In-app |
| Stock below reorder | STOREKEEPER | In-app |
| Bursary approved | ADMISSIONS_OFFICER, Family | Email |

### 19.3 Data Retention

| Data Type | Retention | Policy |
|-----------|-----------|--------|
| Financial events | Permanent | Never deleted (event sourced) |
| Audit logs | 10 years | Legal requirement |
| Student records | 7 years post-exit | MoES regulation |
| Payroll records | 10 years | URA requirement |
| Session logs | 1 year | Rolling cleanup |

### 19.4 Error Handling

All forms implement consistent error handling:

| Error Type | User Experience |
|-----------|-----------------|
| Validation error | Red border + inline message below field |
| Business rule violation | Toast notification + form stays open |
| Network timeout (online) | Auto-retry 3×, then save locally with sync queue |
| Concurrent edit conflict | Side-by-side diff view, user picks resolution |
| Permission denied | Form renders readonly with "Insufficient permissions" banner |

---

## 20. Appendix A — Validation Rules Reference

### Summary by Module

| Module | Rules | Range |
|--------|-------|-------|
| Auth | 12 | V-AUTH-001 to V-AUTH-012 |
| Institution | 23 | V-INST-001 to V-INST-023 |
| Students | 21 | V-STU-001 to V-STU-021 |
| Fees | 17 | V-FEE-001 to V-FEE-017 |
| Invoices | 13 | V-INV-001 to V-INV-013 |
| Payments | 11 | V-PAY-001 to V-PAY-011 |
| Collections | 4 | V-COL-001 to V-COL-004 |
| Transport | 6 | V-TRN-001 to V-TRN-006 |
| Inventory | 2 | V-INV-S01 to V-INV-S02 |
| Accounting | 14 | V-GL-001 to V-GL-014 |
| Payroll | 10 | V-HR-001 to V-HR-010 |
| AP | 9 | V-AP-001 to V-AP-009 |
| Treasury | 5 | V-TRS-001 to V-TRS-005 |
| Assets | 4 | V-FA-001 to V-FA-004 |
| Budget | 3 | V-BDG-001 to V-BDG-003 |
| Scholarships | 3 | V-SCH-001 to V-SCH-003 |
| **Total** | **137** | — |

---

## 21. Appendix B — Role-Form Permission Matrix

| Form ID | SUPER_ADMIN | DIRECTOR | HEADTEACHER | BURSAR | ACCOUNTANT | CASHIER | ADMISSIONS | STOREKEEPER | TRANSPORT | PAYROLL | DEPT_HEAD | AUDITOR | BOARD |
|---------|:-----------:|:--------:|:-----------:|:------:|:----------:|:-------:|:----------:|:-----------:|:---------:|:-------:|:---------:|:-------:|:-----:|
| AUTH-001 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AUTH-002 | ✓ | | | | | | | | | | | | |
| AUTH-003 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AUTH-004 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AUTH-005 | ✓ | | | | | | | | | | | | |
| INST-001 | ✓ | ✓ | | | | | | | | | | | |
| INST-002 | ✓ | | | | | | | | | | | | |
| INST-003 | ✓ | ✓ | ✓ | | | | | | | | | | |
| INST-004 | ✓ | | ✓ | | | | | | | | | | |
| INST-005 | ✓ | | | ✓ | ✓ | | | | | | | | |
| INST-006 | ✓ | | | ✓ | | | | | | | | | |
| INST-007 | ✓ | | | | | | | | | | | | |
| INST-008 | ✓ | ✓ | | | | | | | | | | | |
| STU-001 | ✓ | | ✓ | | | | ✓ | | | | | | |
| STU-002 | ✓ | | | | | ✓ | ✓ | | | | | | |
| FEE-001 | ✓ | | | ✓ | | | | | | | | | |
| FEE-004 | ✓ | | | ✓ | | | | | | | | | |
| INV-001 | | | | ✓ | ✓ | ✓ | | | | | | | |
| PAY-001 | | | | ✓ | ✓ | ✓ | | | | | | | |
| GL-001 | | | | ✓ | ✓ | | | | | | | | |
| HR-001 | ✓ | | | | | | | | | ✓ | | | |
| HR-004 | | | | | | | | | | ✓ | | | |
| AP-002 | | | | ✓ | ✓ | | | | | | | | |
| AP-003 | | | | ✓ | | | | | | | | | |
| FA-001 | | | | ✓ | ✓ | | | | | | | | |
| BDG-001 | | | | ✓ | | | | | | | ✓ | | |
| SCH-001 | | | ✓ | | | | ✓ | | | | | | |
| TRN-001 | ✓ | | | | | | | | ✓ | | | | |

*Note: This is a representative subset. Full matrix includes all 104 forms × 14 roles.*

---

## 22. Appendix C — Offline Behavior Matrix

| Form ID | Offline Create | Offline Edit | Offline Approve | Sync Priority | Conflict Resolution |
|---------|:-:|:-:|:-:|:-:|:-:|
| AUTH-001 | ✓ (cached) | — | — | — | — |
| AUTH-002 | ✓ | ✓ | — | Medium | Server wins (new user) |
| STU-001 | ✓ | ✓ | ✓ | High | Manual merge |
| INV-001 | ✓ | ✓ | ✓ | High | Version check |
| PAY-001 | ✓ | — | — | Critical | Manual (money) |
| PAY-003 | — | — | — | — | Online only |
| GL-001 | ✓ | — | ✓ | High | Version check |
| GL-003 | — | — | — | — | Online only |
| GL-005 | — | — | — | — | Online only |
| HR-004 | ✓ | — | ✓ | High | Manual merge |
| AP-003 | — | — | — | — | Online only |
| BDG-001 | ✓ | ✓ | — | Medium | Last writer wins |
| SCH-001 | ✓ | ✓ | ✓ | Medium | Manual merge |
| TRS-001 | ✓ | — | — | High | Version check |

**Sync Priority:**
- **Critical:** Synced immediately when online (payments, receipts)  
- **High:** Synced within 30 seconds (invoices, journals)  
- **Medium:** Synced within 5 minutes (master data, budgets)  
- **Low:** Synced within 30 minutes (settings, profiles)

---

*End of DATA CAPTURE / INPUT FORMS specification. Total: 104 forms, 137 validation rules, 16 modules.*
