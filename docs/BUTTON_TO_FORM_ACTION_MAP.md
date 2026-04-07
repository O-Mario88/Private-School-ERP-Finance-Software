# BUTTON-TO-FORM ACTION MAP

## MAPLE School Finance ERP — Complete UI Action Specification

**Version:** 1.0.0  
**Date:** April 7, 2026  
**Status:** Implementation-Grade Specification  
**Applies To:** All Phases (1–3) + Kitchen Stores Sub-Module

---

## Table of Contents

1. [Action Mapping Overview](#1-action-mapping-overview)
2. [Global Button Design Rules](#2-global-button-design-rules)
3. [Sidebar Module-by-Module Button Map](#3-sidebar-module-by-module-button-map)
4. [Form-to-Button Master Matrix](#4-form-to-button-master-matrix)
5. [Detail Page Contextual Buttons](#5-detail-page-contextual-buttons)
6. [Table Row Actions and Bulk Actions](#6-table-row-actions-and-bulk-actions)
7. [Quick Actions / Global Create Menu](#7-quick-actions--global-create-menu)
8. [Role-Based Button Visibility](#8-role-based-button-visibility)
9. [Prefilled Context Rules](#9-prefilled-context-rules)
10. [Missing Buttons Audit](#10-missing-buttons-audit)
11. [Recommended UI Placement Rules](#11-recommended-ui-placement-rules)
12. [Phase 1 vs Phase 2 Recommendations](#12-phase-1-vs-phase-2-recommendations)

---

## 1. Action Mapping Overview

### 1.1 Purpose

Every input form in the MAPLE School Finance ERP must be reachable through a clear button, action, or workflow trigger in the UI. No form may exist without an obvious, discoverable path to open it.

This document maps **102 forms** across **17 modules** to their exact buttons, placements, roles, and prefilled context.

### 1.2 Governing Principle

> **If a form exists, it must have a visible button or action path. If a workflow requires a form, the user must be able to open it from the right module page. If a record detail page naturally leads to a related form, there must be a contextual action button there too.**

### 1.3 Form Count Summary

| Module | Form Count | Form ID Prefix |
|--------|-----------|----------------|
| Authentication & User Management | 5 | AUTH-xxx |
| Institution Setup | 8 | INST-xxx |
| Student & Family Management | 9 | STU-xxx |
| Fee Rules & Billing Engine | 8 | FEE-xxx |
| Invoice Management | 6 | INV-xxx |
| Payments & Receipting | 7 | PAY-xxx |
| Collections & Follow-Up | 6 | COL-xxx |
| Transport | 5 | TRN-xxx |
| Inventory & Store | 6 | INV-Sxx |
| Accounting & GL | 8 | GL-xxx |
| Payroll | 8 | HR-xxx |
| Accounts Payable | 7 | AP-xxx |
| Treasury & Banking | 5 | TRS-xxx |
| Fixed Assets | 5 | FA-xxx |
| Budget | 5 | BDG-xxx |
| Scholarships & Bursaries | 4 | SCH-xxx |
| Kitchen Stores & Accountability | 11 | KIT-xxx |
| **TOTAL** | **113** | |

### 1.4 Button Type Definitions

| Button Type | Description | Placement |
|-------------|-------------|-----------|
| **Primary Action** | Main page-header button, most important action on page | Page header, right-aligned |
| **Secondary Action** | Less prominent page-header button | Page header, next to primary |
| **Row Action** | Action on a specific table row | Row action menu (⋯) or inline icons |
| **Bulk Action** | Action on multiple selected rows | Table toolbar, appears on selection |
| **Detail Action** | Contextual button on record detail page | Detail page action bar |
| **Quick Action** | Global shortcut accessible from top bar or dashboard | Global ⚡ menu / Dashboard cards |
| **Inline Action** | Button within a form or card body | Card body / form section |
| **Dropdown Action** | Secondary action inside a dropdown menu | ▾ dropdown next to primary button |

### 1.5 Button Visual Hierarchy

| Priority | Style | Use |
|----------|-------|-----|
| **Primary** | Solid blue/green, bold label | Main create/submit actions |
| **Secondary** | Outlined, neutral | Alternative actions, filters |
| **Destructive** | Red outline or red text | Cancel, reverse, void, delete |
| **Approval** | Solid green, bold label | Approve, post, confirm |
| **Warning** | Amber/yellow outline | Override, exception, force actions |

---

## 2. Global Button Design Rules

### 2.1 Core Rules

1. **Every major form must have at least one primary access button** — no orphaned forms
2. **Major forms use action verbs** — "New", "Add", "Create", "Record", "Capture", "Issue", "Approve", "Request", "Process", "Generate"
3. **Buttons use plain operational language** — school finance wording, not generic software terms
4. **Create buttons appear on module list pages** — always visible in page header
5. **Related forms are accessible through contextual buttons on detail pages** — student detail → New Invoice, etc.
6. **Tables support row-level actions** — every data row has an action menu
7. **Important mass workflows support bulk actions** — Generate Invoices, Export Statements, Print Receipts
8. **All buttons respect role permissions** — invisible (not disabled) for unauthorized roles
9. **Buttons inherit institution context automatically** — campus, term, academic year prefill
10. **Destructive actions require confirmation** — Cancel Invoice, Reverse Payment, Write Off, Delete

### 2.2 Button Label Standards

**Preferred wording patterns:**

| Pattern | When to Use | Examples |
|---------|-------------|---------|
| New [Entity] | Creating a master record | New Student, New Supplier, New Account |
| Add [Entity] | Adding a child/related record | Add Guardian, Add Budget Line, Add Pickup Point |
| Create [Entity] | Creating a transaction record | Create Budget, Create Invoice |
| Record [Action] | Capturing a real-world event | Record Payment, Record Follow-up, Record Consumption |
| Capture [Source] | Importing external data | Capture Bank Deposit, Capture Mobile Money |
| Generate [Output] | Producing computed output | Generate Invoices, Generate Receipt, Generate Payslips |
| Issue [Item] | Distributing something | Issue Stock, Issue Credit Note |
| Process [Workflow] | Running a batch operation | Process Payroll, Process Payment Run |
| Approve [Entity] | Approval workflow step | Approve Budget, Approve Expense, Approve Journal |
| Start [Process] | Beginning a multi-step process | Start Reconciliation, Start Billing Run |
| Submit [Entity] | Sending for approval | Submit Budget, Submit Expense Request |
| Reverse [Action] | Undoing a posted transaction | Reverse Payment, Reverse Journal |
| Cancel [Entity] | Cancelling a draft/open record | Cancel Invoice, Cancel PO |
| Print [Document] | Producing printable output | Print Invoice, Print Receipt, Print Payslip |

### 2.3 Button Placement Rules

```
┌─────────────────────────────────────────────────────┐
│  Module Page Header                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ + Primary   │  │  Secondary  │  │  ▾ More     │ │
│  │   Action    │  │   Action    │  │   Actions   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────┤
│  Table Toolbar (appears on selection)               │
│  ☐ 5 selected   [Bulk Action 1] [Bulk Action 2]    │
├─────────────────────────────────────────────────────┤
│  Table Row                                          │
│  Data... Data... Data...          [View] [⋯ More]   │
├─────────────────────────────────────────────────────┤
│  Detail Page Action Bar                             │
│  ┌─────────┐ ┌──────────┐ ┌──────┐ ┌────────────┐  │
│  │ Primary │ │Secondary │ │ Edit │ │ ▾ More     │  │
│  │ Action  │ │ Action   │ │      │ │   Actions  │  │
│  └─────────┘ └──────────┘ └──────┘ └────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 2.4 Destructive Action Protection

All destructive actions must:
1. Be styled in **red** (outline or text)
2. Require a **confirmation dialog** with clear consequence description
3. Require **reason/note** field in the confirmation
4. Be placed in **"More Actions"** dropdown, never as primary button
5. Record the action in the **audit trail** including the reason

**Destructive actions list:**
- Cancel Invoice (INV-003)
- Reverse Payment (PAY-002)
- Reverse Journal Entry (GL-002)
- Reverse Payroll Run (HR-006)
- Reverse Supplier Payment (AP-005)
- Bad Debt Write-Off (COL-005)
- Terminate Employee (HR-008)
- Dispose Fixed Asset (FA-003)
- Withdraw Student (STU-004)

---

## 3. Sidebar Module-by-Module Button Map

### A. DASHBOARD

**Page:** Dashboard (Home)  
**Component:** `Dashboard.tsx`  
**Purpose:** Executive overview with quick actions for common tasks

#### Quick Action Cards

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Student | STU-001: Register New Student | Quick Action Card | Bursar, Admin, Registrar |
| + New Invoice | INV-001: Create Student Invoice | Quick Action Card | Bursar, Accountant |
| Record Payment | PAY-001: Record Payment | Quick Action Card | Bursar, Cashier |
| Capture Bank Deposit | PAY-004: Import Bank Statement | Quick Action Card | Bursar, Accountant |
| New Expense Request | AP-002: Enter Supplier Bill | Quick Action Card | Bursar, Accountant |
| New Journal Entry | GL-001: Manual Journal Entry | Quick Action Card | Accountant |
| Create Budget | BDG-001: Create Annual Budget | Quick Action Card | Bursar, Accountant |
| Process Payroll | HR-004: Process Monthly Payroll | Quick Action Card | Payroll Officer, Bursar |
| Start Reconciliation | GL-005: Bank Reconciliation | Quick Action Card | Accountant |
| New Supplier | AP-001: Register Supplier | Quick Action Card | Bursar, Accountant |
| Receive Kitchen Stock | KIT-002: Kitchen Stock Receipt | Quick Action Card | Storekeeper |
| Record Kitchen Consumption | KIT-005: Daily Consumption | Quick Action Card | Storekeeper, Kitchen Staff |

#### KPI Widget Drill-Down Actions

| Widget | Click Action | Opens |
|--------|-------------|-------|
| Total Billed | Drill to Invoice Register | INV-006 filtered view |
| Total Collected | Drill to Payment Register | PAY-007 filtered view |
| Collection Rate | Drill to Collections Dashboard | COL-006 |
| Outstanding | Drill to Aging Report | COL-004 aging view |
| Payroll Cost | Drill to Payroll Dashboard | HR-004 summary view |
| Budget Utilization | Drill to Budget vs Actual | BDG-003 |

---

### B. SCHOOL / INSTITUTION

**Page:** Settings → Institution  
**Component:** `Settings.tsx`, `CampusManager.tsx`, `PolicyEngine.tsx`  
**Purpose:** Institution master data, campuses, academic structure, policies

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Edit School Profile | INST-001: Institution Settings | Primary Action | Admin, Director |
| + Add Campus | INST-002: Manage Campuses | Secondary Action | Admin, Director |

#### Section-Level Buttons

| Section | Button Label | Opens Form | Type | Roles |
|---------|-------------|-----------|------|-------|
| Academic Years | + New Academic Year | INST-003: Academic Year Configuration | Inline Action | Admin, Bursar |
| Terms | + New Term | INST-003: Academic Year Configuration (term tab) | Inline Action | Admin, Bursar |
| Classes | + New Class | INST-004: Classes & Streams | Inline Action | Admin, Registrar |
| Classes | + New Stream | INST-004: Classes & Streams (stream tab) | Inline Action | Admin, Registrar |
| Chart of Accounts | + New Account | INST-005: Chart of Accounts | Inline Action | Accountant, Bursar |
| Bank Accounts | + New Bank Account | INST-006: Bank Accounts | Inline Action | Accountant, Bursar |
| Departments | + New Department | INST-007: Departments | Inline Action | Admin |
| Policies | + New Policy Rule | INST-008: Business Policy Rules | Inline Action | Admin, Director |

#### Campus Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Campus detail view | All |
| Edit | INST-002: Campus edit mode | Admin, Director |
| Deactivate | Confirmation dialog | Admin, Director |

---

### C. STUDENTS

**Page:** School (Students)  
**Component:** `School.tsx`, student sub-components  
**Purpose:** Student registration, families, financial profiles

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Student | STU-001: Register New Student | Primary Action | Bursar, Admin, Registrar |
| + Add Guardian | STU-002: Register Family / Guardian | Secondary Action | Bursar, Admin, Registrar |
| Import Students | STU-008: Bulk Student Import | Dropdown Action | Admin |

#### Student Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View Profile | Student detail page | All authorized |
| Edit | STU-001: Edit mode | Bursar, Admin, Registrar |
| New Invoice | INV-001: prefilled with student | Bursar, Accountant |
| Record Payment | PAY-001: prefilled with student | Bursar, Cashier |
| Assign Transport | TRN-002: prefilled with student | Bursar, Admin |
| Change Status | STU-005: Change Student Status | Admin, Bursar |

#### Student Table Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Generate Invoices | FEE-004: Batch billing for selected | Bursar |
| Export Statements | PDF/Excel export for selected | Bursar, Accountant |
| Assign Transport | TRN-003: Bulk transport assignment | Bursar, Admin |
| Promote Students | STU-006: End-of-Year Promotion | Admin |

#### Student Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| New Invoice | INV-001: prefilled student, class, term | Detail Action | Bursar |
| Record Payment | PAY-001: prefilled student | Detail Action | Bursar, Cashier |
| Generate Statement | PDF statement export | Detail Action | Bursar, Accountant |
| Assign Transport | TRN-002: prefilled student | Detail Action | Bursar, Admin |
| Apply Discount | FEE-005: Fee Waiver for student | Detail Action | Bursar |
| Add Guardian | STU-002: prefilled student link | Detail Action | Admin, Registrar |
| Add Scholarship | SCH-001: prefilled student | Detail Action | Bursar |
| Issue Item | INV-S03: Issue Stock to student | Detail Action | Storekeeper, Bursar |
| Change Status | STU-005: Change Student Status | Dropdown Action | Admin, Bursar |
| Transfer Student | STU-003: Transfer form | Dropdown Action | Admin |
| Withdraw Student | STU-004: Withdraw / Exit | Dropdown Action (destructive) | Admin, Director |
| View Family Summary | STU-007: Family Financial Summary | Dropdown Action | Bursar |

---

### D. BILLING (Fee Rules & Billing Engine)

**Page:** Billing  
**Component:** `FeeRulesManager.tsx`, `FeeSchedulePreview.tsx`  
**Purpose:** Fee structure configuration, billing rules, discount policies

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Fee Rule | FEE-001: Create / Edit Fee Rule | Primary Action | Bursar, Accountant |
| + New Discount Rule | FEE-002: Fee Discount Rule | Secondary Action | Bursar |
| Generate Invoices | FEE-004: Billing Run | Secondary Action | Bursar |

#### Section-Level Buttons

| Section | Button Label | Opens Form | Type | Roles |
|---------|-------------|-----------|------|-------|
| Fee Templates | + New Fee Template | FEE-006: Fee Template | Inline Action | Bursar |
| Fee Templates | Add Template Line | FEE-006: Line item sub-form | Row Action | Bursar |
| Billing Cycles | + New Billing Cycle | FEE-004: Billing Cycle Setup | Inline Action | Bursar |
| Fee Preview | Preview Fee Schedule | FEE-003: Preview Fee Schedule | Inline Action | Bursar, Accountant |

#### Fee Rules Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Fee rule detail | Bursar, Accountant |
| Edit | FEE-001: Edit mode | Bursar |
| Duplicate | FEE-001: prefilled copy | Bursar |
| Adjust | FEE-007: Fee Rule Adjustment | Bursar |
| Deactivate | Confirmation dialog | Bursar |

#### Fee Rules Table Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Activate Selected | Batch activation confirmation | Bursar |
| Deactivate Selected | Batch deactivation confirmation | Bursar |
| Generate Invoices for Selected | FEE-004: scoped to selected rules | Bursar |

---

### E. INVOICES

**Page:** Invoices  
**Component:** Invoice list + detail views  
**Purpose:** Create, manage, adjust, and output student billing documents

**Important:** School invoices are billing notices to parents/guardians/sponsors for tuition, uniform, transport, boarding, meals, scholastic materials, examination fees, development fee, ICT fee, and other approved school charges.

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Invoice | INV-001: Create Student Invoice | Primary Action | Bursar |
| Generate Batch Invoices | FEE-004: Billing Run | Secondary Action | Bursar |
| Export Register | INV-006: Invoice Register export | Dropdown Action | Bursar, Accountant |

#### Invoice Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Invoice detail page | All authorized |
| Edit Draft | INV-002: Edit Invoice (draft only) | Bursar |
| Record Payment | PAY-001: prefilled with invoice | Bursar, Cashier |
| Adjust | INV-002: Edit Invoice (posted, creates adjustment) | Bursar, Accountant |
| Credit Note | INV-004: Issue Credit Note | Bursar, Accountant |
| Debit Note | INV-005: Issue Debit Note | Bursar, Accountant |
| Cancel | INV-003: Cancel Invoice (destructive) | Bursar (requires reason) |
| Print PDF | PDF generation | All authorized |
| Share | Email/WhatsApp share flow | Bursar |

#### Invoice Table Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Print Selected | Batch PDF generation | Bursar |
| Export Selected | Excel/CSV export | Bursar, Accountant |
| Cancel Selected | Batch cancellation (with confirmation) | Bursar |

#### Invoice Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Record Payment | PAY-001: prefilled invoice, student, balance | Primary Detail Action | Bursar, Cashier |
| Print Invoice | PDF output | Secondary Detail Action | All authorized |
| Edit Draft | INV-002: Edit mode (draft only) | Detail Action | Bursar |
| Issue Credit Note | INV-004: prefilled invoice ref | Detail Action | Bursar, Accountant |
| Issue Debit Note | INV-005: prefilled invoice ref | Detail Action | Bursar, Accountant |
| Set Installment Plan | COL-001: prefilled invoice, balance | Detail Action | Bursar |
| Cancel Invoice | INV-003: Cancel with reason (destructive) | Dropdown Action (red) | Bursar |
| Share Invoice | Email/WhatsApp output | Dropdown Action | Bursar |
| View Audit Trail | Audit log filtered to this invoice | Dropdown Action | Accountant, Auditor |

---

### F. PAYMENTS

**Page:** Payments  
**Component:** Payment list + recording views  
**Purpose:** Capture all payment types, allocate to invoices, generate receipts

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + Record Payment | PAY-001: Record Payment | Primary Action | Bursar, Cashier |
| Capture Mobile Money | PAY-003: Import MoMo Payments | Secondary Action | Bursar, Cashier |
| Import Bank Statement | PAY-004: Import Bank Statement | Secondary Action | Bursar, Accountant |
| Allocate Unapplied | PAY-005: Allocate Unapplied Payment | Dropdown Action | Bursar, Accountant |

#### Payment Method Sub-Buttons (within Record Payment form)

| Tab / Button | Captures | Roles |
|-------------|----------|-------|
| Cash | Cash payment with denomination breakdown | Cashier, Bursar |
| Mobile Money (MTN MoMo) | MoMo transaction reference, phone number | Cashier, Bursar |
| Bank Deposit | Bank name, deposit slip number, date | Cashier, Bursar |
| Bank Transfer | Transfer reference, source bank | Bursar, Accountant |
| Cheque | Cheque number, bank, date | Bursar, Accountant |
| Sponsor Payment | Sponsor name, reference, allocation | Bursar |

#### Payment Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Payment detail page | All authorized |
| Allocate | PAY-005: Allocate to invoices | Bursar, Accountant |
| Generate Receipt | PAY-006: Receipt generation | Bursar, Cashier |
| Reprint Receipt | PAY-006: Receipt reprint | Bursar, Cashier |
| Reverse | PAY-002: Payment Reversal (destructive) | Bursar (requires reason) |
| View Audit Trail | Audit log for this payment | Accountant, Auditor |

#### Payment Table Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Print Receipts | Batch receipt PDF | Bursar, Cashier |
| Export Selected | Excel/CSV export | Bursar, Accountant |
| Allocate Selected | Batch allocation wizard | Bursar, Accountant |

#### Payment Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Allocate | PAY-005: Allocate to invoices | Primary Detail Action | Bursar, Accountant |
| Generate Receipt | PAY-006: Receipt output | Detail Action | Bursar, Cashier |
| Reprint Receipt | PAY-006: Reprint flow | Detail Action | Bursar, Cashier |
| Reverse Payment | PAY-002: with reason (destructive) | Dropdown Action (red) | Bursar |
| Refund | PAY-002: Refund mode | Dropdown Action | Bursar, Accountant |
| View Audit Trail | Audit log for this payment | Dropdown Action | Accountant, Auditor |

---

### G. COLLECTIONS

**Page:** Collections  
**Component:** `Collections.tsx`, `PaymentPlansUI.tsx`, `FollowUpTracker.tsx`, `AgingBucketDrill.tsx`  
**Purpose:** Arrears management, follow-ups, payment plans, write-offs

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Payment Plan | COL-001: Create Payment Plan | Primary Action | Bursar |
| Record Follow-up | COL-002: Log Follow-Up | Secondary Action | Bursar, Collections Officer |
| Generate Demand Letters | COL-003: Generate Demand Letter | Secondary Action | Bursar |

#### Aging Bucket Table Row Actions (Student Arrears)

| Action | Opens | Roles |
|--------|-------|-------|
| View Statement | Student statement PDF | Bursar, Accountant |
| Follow Up | COL-002: Log Follow-Up prefilled with student | Bursar, Collections Officer |
| Record Commitment | COL-002: Follow-up with commitment type | Bursar |
| Set Payment Plan | COL-001: prefilled with student, balance | Bursar |
| Record Payment | PAY-001: prefilled with student | Bursar, Cashier |
| Request Write-off | COL-005: Bad Debt Write-Off | Bursar (requires approval) |
| Send Demand Letter | COL-003: prefilled with student | Bursar |

#### Aging Bucket Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Generate Demand Letters | COL-003: Batch for selected students | Bursar |
| Export Statements | Batch PDF/Excel | Bursar, Accountant |
| Mark Follow-ups | COL-002: Batch follow-up logging | Bursar |

#### Payment Plan Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Record Installment | PAY-001: prefilled installment amount, plan ref | Detail Action | Bursar, Cashier |
| Modify Plan | COL-001: Edit mode | Detail Action | Bursar |
| Cancel Plan | Cancellation with reason (destructive) | Dropdown Action (red) | Bursar |
| View Student Profile | Student detail navigation | Dropdown Action | All authorized |

---

### H. TRANSPORT

**Page:** Transport  
**Component:** `TransportManager.tsx`  
**Purpose:** Route management, student assignments, transport billing

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Transport Route | TRN-001: Create / Edit Route | Primary Action | Bursar, Admin |
| Assign Students | TRN-003: Bulk Assign Transport | Secondary Action | Bursar, Admin |

#### Route Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Route detail page | All authorized |
| Edit | TRN-001: Edit mode | Bursar, Admin |
| Assign Student | TRN-002: Assign Student to Route | Bursar, Admin |
| View Collections | Route collection report | Bursar, Accountant |
| Deactivate | Confirmation dialog | Admin |

#### Route Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + Add Pickup Point | TRN-001: Add stage sub-form | Primary Detail Action | Bursar, Admin |
| Assign Students | TRN-002: prefilled with route | Detail Action | Bursar, Admin |
| Override Transport Fee | FEE-007: Fee override for route | Detail Action | Bursar |
| View Route Collections | Report filtered to route | Detail Action | Bursar, Accountant |
| Remove Student | TRN-004: Remove from Transport | Row Action on assigned list | Bursar, Admin |

#### Assigned Students Table Row Actions (on route detail)

| Action | Opens | Roles |
|--------|-------|-------|
| View Student | Student detail page | All authorized |
| Override Fee | FEE-007: Fee override for this student-route | Bursar |
| Remove from Route | TRN-004: Remove confirmation | Bursar, Admin |

---

### I. INVENTORY & STORE

**Page:** Inventory  
**Component:** `InventoryManager.tsx`  
**Purpose:** Stock management, student item issuance, reorder tracking

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Inventory Item | INV-S01: Create / Edit Inventory Item | Primary Action | Storekeeper, Bursar |
| Receive Stock | INV-S02: Receive Stock | Secondary Action | Storekeeper |
| Issue Stock | INV-S03: Issue Stock | Secondary Action | Storekeeper |

#### Inventory Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Item detail page | All authorized |
| Edit | INV-S01: Edit mode | Storekeeper, Bursar |
| Receive | INV-S02: prefilled with item | Storekeeper |
| Issue | INV-S03: prefilled with item | Storekeeper |
| Adjust | INV-S04: Stock Count Adjustment | Storekeeper, Bursar |
| View Movements | Stock movement register | Storekeeper, Bursar, Accountant |

#### Inventory Item Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Receive Stock | INV-S02: prefilled item | Primary Detail Action | Storekeeper |
| Issue Stock | INV-S03: prefilled item | Detail Action | Storekeeper |
| Adjust Stock | INV-S04: prefilled item | Detail Action | Storekeeper, Bursar |
| Allocate to Class | INV-S05: prefilled item | Detail Action | Storekeeper, Bursar |
| View Movements | Movement report for item | Detail Action | All authorized |
| Reorder Request | INV-S01: Reorder sub-form | Dropdown Action | Storekeeper |

#### Inventory Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Allocate to Class | INV-S05: Batch allocation | Storekeeper, Bursar |
| Export Report | INV-S06: Inventory Report export | Storekeeper, Bursar |
| Print Stock Count Sheet | Printable count sheet | Storekeeper |

---

### I-2. KITCHEN STORES (Sub-Module of Inventory)

**Page:** Inventory → Kitchen Stores tab  
**Component:** Kitchen sub-components  
**Purpose:** Kitchen stock management, consumption tracking, accountability

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Kitchen Item | KIT-001: Kitchen Item Master | Primary Action | Storekeeper, Kitchen Manager |
| Receive Kitchen Stock | KIT-002: Kitchen Stock Receipt | Secondary Action | Storekeeper |
| Record Consumption | KIT-005: Daily Consumption | Secondary Action | Kitchen Staff, Storekeeper |

#### Kitchen Section Buttons

| Section | Button Label | Opens Form | Type | Roles |
|---------|-------------|-----------|------|-------|
| Stock In | Receive Kitchen Stock | KIT-002: Kitchen Stock Receipt | Section Primary | Storekeeper |
| Stock Out | New Kitchen Requisition | KIT-003: Kitchen Issue Requisition | Section Primary | Kitchen Manager |
| Stock Out | Issue Kitchen Stock | KIT-004: Kitchen Stock Issue | Section Action | Storekeeper |
| Consumption | Record Consumption | KIT-005: Daily Consumption & Accountability | Section Primary | Kitchen Staff, Storekeeper |
| Returns | Record Kitchen Return | KIT-006: Kitchen Return | Section Action | Kitchen Staff |
| Wastage | Record Wastage / Loss | KIT-007: Kitchen Wastage / Loss | Section Action | Kitchen Manager, Storekeeper |
| Stock Count | New Stock Count | KIT-008: Kitchen Physical Stock Count | Section Action | Storekeeper |
| Menu Planning | Plan Menu | KIT-009: Kitchen Menu Planning | Section Action | Kitchen Manager |
| Budget | Create Kitchen Budget | KIT-010: Kitchen Budget Planning | Section Action | Bursar, Kitchen Manager |
| Adjustments | Adjust Kitchen Stock | KIT-011: Kitchen Stock Adjustment | Section Action | Storekeeper |

#### Kitchen Item Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Kitchen item detail | Storekeeper, Kitchen Manager |
| Edit | KIT-001: Edit mode | Storekeeper |
| Receive | KIT-002: prefilled item | Storekeeper |
| Issue | KIT-004: prefilled item | Storekeeper |
| Record Consumption | KIT-005: prefilled item | Kitchen Staff |
| View Movements | Stock movement register | Storekeeper, Kitchen Manager |

#### Kitchen Item Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Receive Stock | KIT-002: prefilled item | Primary Detail Action | Storekeeper |
| Issue Stock | KIT-004: prefilled item | Detail Action | Storekeeper |
| Record Consumption | KIT-005: prefilled item | Detail Action | Kitchen Staff |
| Adjust Stock | KIT-011: prefilled item | Detail Action | Storekeeper |
| View Movements | Movement register for item | Detail Action | Storekeeper, Kitchen Manager |
| Record Return | KIT-006: prefilled item | Dropdown Action | Kitchen Staff |
| Record Wastage | KIT-007: prefilled item | Dropdown Action | Kitchen Manager |

---

### J. SCHOLARSHIPS / BURSARIES / SPONSORS

**Page:** Scholarships  
**Component:** `BursaryDashboard.tsx`, `BursaryAnalytics.tsx`  
**Purpose:** Scholarship management, bursary applications, sponsor tracking

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Bursary Application | SCH-001: Bursary / Scholarship Application | Primary Action | Bursar, Admin |
| + New Sponsor | STU-002: Guardian/Sponsor form (sponsor type) | Secondary Action | Bursar |

#### Scholarship/Bursary Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Bursary detail page | All authorized |
| Edit Award | SCH-001: Edit mode | Bursar |
| Approve / Reject | SCH-002: Approve / Reject Bursary | Bursar, Director |
| Disburse | SCH-003: Record Bursary Disbursement | Bursar, Accountant |
| Renew | SCH-001: Renewal mode (prefilled) | Bursar |
| View Statement | Bursary statement report | Bursar, Accountant |

#### Bursary Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Approve | SCH-002: Approve workflow | Primary Detail Action | Director, Bursar |
| Reject | SCH-002: Reject with reason | Detail Action (red) | Director, Bursar |
| Disburse | SCH-003: Record Disbursement | Detail Action | Bursar, Accountant |
| Renew Scholarship | SCH-001: Renewal (new period, same student) | Detail Action | Bursar |
| View Student Profile | Navigate to student detail | Dropdown Action | All authorized |
| View Statement | Bursary statement | Dropdown Action | Bursar, Accountant |
| Link Additional Student | SCH-001: Add student to same award | Dropdown Action | Bursar |

---

### K. ACCOUNTING & GL

**Page:** Accounting  
**Component:** `Accounting.tsx`, `TrialBalanceReport.tsx`  
**Purpose:** General ledger, journal entries, reconciliation, period control, financial statements

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Journal Entry | GL-001: Manual Journal Entry | Primary Action | Accountant |
| Start Reconciliation | GL-005: Bank Reconciliation | Secondary Action | Accountant |
| Period Control | GL-003: Accounting Periods | Dropdown Action | Accountant, Bursar |

#### Journal Entries Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Journal detail page | Accountant, Bursar, Auditor |
| Edit Draft | GL-001: Edit mode (draft only) | Accountant |
| Approve | GL-001: Approval workflow | Accountant (approver), Bursar |
| Post | GL-001: Post confirmation | Accountant |
| Reverse | GL-002: Reverse Journal Entry (destructive) | Accountant (requires reason) |
| Print | PDF journal voucher | Accountant |

#### Journal Entries Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Approve Selected | Batch approval confirmation | Accountant (approver) |
| Post Selected | Batch posting confirmation | Accountant |
| Export Selected | Excel/CSV export | Accountant |

#### Accounting Section Buttons

| Section | Button Label | Opens Form | Type | Roles |
|---------|-------------|-----------|------|-------|
| Chart of Accounts | + New Account | INST-005: Chart of Accounts | Section Action | Accountant |
| Chart of Accounts | Enter Opening Balances | GL-001: Opening balance journal | Section Action | Accountant |
| Recurring Journals | + New Recurring Template | GL-004: Recurring Journal Template | Section Action | Accountant |
| Bank Reconciliation | Start Reconciliation | GL-005: Bank Reconciliation | Section Action | Accountant |
| Bank Reconciliation | Enter Bank Statement | PAY-004: Import Bank Statement | Section Action | Accountant |
| Reports | Trial Balance | GL-006: Trial Balance Report Filter | Section Action | Accountant, Bursar |
| Reports | Income Statement | GL-007: Income Statement / P&L | Section Action | Accountant, Bursar, Director |
| Reports | Balance Sheet | GL-008: Balance Sheet | Section Action | Accountant, Bursar, Director |

#### Journal Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Approve | Approval confirmation | Primary Detail Action | Accountant (approver) |
| Post | Post confirmation | Detail Action | Accountant |
| Add Line | GL-001: Add journal line sub-form | Detail Action (draft only) | Accountant |
| Reverse | GL-002: Reverse with reason (destructive) | Dropdown Action (red) | Accountant |
| Print Voucher | PDF journal voucher | Dropdown Action | Accountant |
| View Audit Trail | Audit log for this journal | Dropdown Action | Accountant, Auditor |

---

### L. EXPENSES & ACCOUNTS PAYABLE

**Page:** Expenses / AP  
**Component:** `APDashboard.tsx`, `BillEntry.tsx`, `SupplierManager.tsx`, `PaymentRunUI.tsx`  
**Purpose:** Supplier management, purchase orders, bills, expense payments

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Supplier Bill | AP-002: Enter Supplier Bill | Primary Action | Bursar, Accountant |
| + New Supplier | AP-001: Register Supplier | Secondary Action | Bursar, Accountant |
| Process Payment Run | AP-003: Supplier Payment Run | Secondary Action | Bursar, Accountant |
| + New Purchase Order | AP-007: Purchase Order | Dropdown Action | Bursar |

#### Supplier Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Supplier detail page | Bursar, Accountant |
| Edit | AP-001: Edit mode | Bursar, Accountant |
| New Bill | AP-002: prefilled with supplier | Bursar, Accountant |
| Pay Supplier | AP-004: Pay Supplier prefilled | Bursar, Accountant |
| View Ledger | Supplier ledger report | Accountant |

#### Supplier Bill Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Bill detail page | Bursar, Accountant |
| Edit Draft | AP-002: Edit mode (draft only) | Bursar, Accountant |
| Approve | Approval workflow | Bursar (approver) |
| Pay | AP-004: Pay Supplier prefilled with bill | Bursar, Accountant |
| Reverse Payment | AP-005: Reverse Supplier Payment | Bursar (requires reason) |
| Print | PDF output | Bursar, Accountant |

#### Supplier Bill Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Select for Payment Run | AP-003: Add to payment batch | Bursar, Accountant |
| Approve Selected | Batch approval | Bursar (approver) |
| Export Selected | Excel/CSV export | Accountant |

#### Supplier Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| New Supplier Bill | AP-002: prefilled supplier | Primary Detail Action | Bursar, Accountant |
| Record Payment | AP-004: prefilled supplier | Detail Action | Bursar, Accountant |
| New Purchase Order | AP-007: prefilled supplier | Detail Action | Bursar |
| View Ledger | Supplier ledger report | Detail Action | Accountant |
| Edit Supplier | AP-001: Edit mode | Dropdown Action | Bursar, Accountant |
| View AP Aging | AP-006: filtered to supplier | Dropdown Action | Accountant |

---

### M. BUDGETS

**Page:** Budget  
**Component:** `BudgetPlanner.tsx`, `BudgetVsActual.tsx`  
**Purpose:** Budget planning, approval, revision, variance analysis

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + Create Budget | BDG-001: Create Annual Budget | Primary Action | Bursar, Accountant |
| Budget vs Actual | BDG-003: Budget vs Actual Report | Secondary Action | Bursar, Accountant, Director |

#### Budget Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Budget detail page | All authorized |
| Edit Draft | BDG-001: Edit mode (draft only) | Bursar, Accountant |
| Submit for Approval | BDG-001: Submit workflow | Bursar |
| Approve | BDG-001: Approval confirmation | Director |
| Revise | BDG-002: Revise Budget | Bursar, Accountant |
| View Variance | BDG-003: filtered to this budget | Bursar, Accountant, Director |
| Close | BDG-005: Close Budget Year | Accountant |

#### Budget Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + Add Budget Line | BDG-001: Add line sub-form | Primary Detail Action | Bursar, Accountant |
| Submit Budget | BDG-001: Submit for approval | Detail Action | Bursar |
| Approve Budget | BDG-001: Approval confirmation | Detail Action (green) | Director |
| Revise Budget | BDG-002: Revise Budget | Detail Action | Bursar, Accountant |
| Budget Transfer (Virement) | BDG-004: Inter-Line Budget Transfer | Detail Action | Bursar, Accountant |
| Add Supplementary | BDG-002: Supplementary budget mode | Dropdown Action | Bursar |
| View Variance Report | BDG-003: filtered to this budget | Dropdown Action | All authorized |
| Close Budget Year | BDG-005: Close Budget Year (destructive) | Dropdown Action (red) | Accountant |
| Print Budget | PDF budget output | Dropdown Action | All authorized |

#### Budget Line Table Row Actions (within budget detail)

| Action | Opens | Roles |
|--------|-------|-------|
| Edit | BDG-001: Edit line item | Bursar, Accountant |
| Transfer From/To | BDG-004: Virement prefilled | Bursar, Accountant |
| View Actuals | BDG-003: Drill to GL actuals for account | Accountant |
| Delete (draft only) | Confirmation dialog | Bursar, Accountant |

#### Budget Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Approve Budget Lines | Batch line approval | Director |
| Export Budget | Excel/CSV/PDF export | All authorized |

---

### N. PAYROLL

**Page:** Payroll  
**Component:** `PayrollDashboard.tsx`, `EmployeeManager.tsx`, `PayslipViewer.tsx`  
**Purpose:** Employee management, salary processing, payslip generation

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Employee | HR-001: Register Employee | Primary Action | Payroll Officer, Admin |
| Process Payroll | HR-004: Process Monthly Payroll | Secondary Action | Payroll Officer, Bursar |
| Generate Payslips | HR-005: Payslip Generation | Dropdown Action | Payroll Officer |

#### Employee Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Employee detail page | Payroll Officer, Admin |
| Edit | HR-001: Edit mode | Payroll Officer, Admin |
| Set Salary Grade | HR-002: Salary Grade / Structure | Payroll Officer |
| Add Deduction | HR-003: Employee Deduction | Payroll Officer |
| View Payslips | HR-005: Payslip history | Payroll Officer |
| Terminate | HR-008: Terminate Employee (destructive) | Admin, Director |

#### Employee Table Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Process Payroll | HR-004: Batch for selected employees | Payroll Officer, Bursar |
| Generate Payslips | HR-005: Batch for selected | Payroll Officer |
| Export Employee List | Excel/CSV export | Payroll Officer, Admin |

#### Employee Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Set Salary Grade | HR-002: prefilled employee | Primary Detail Action | Payroll Officer |
| Add Earnings / Deductions | HR-003: prefilled employee | Detail Action | Payroll Officer |
| Add Payroll Adjustment | HR-003: One-time adjustment for employee | Detail Action | Payroll Officer |
| View Payslips | HR-005: filtered to employee | Detail Action | Payroll Officer |
| Process Final Dues | HR-008: Termination with final dues | Dropdown Action | Payroll Officer, Admin |
| Terminate Employee | HR-008: Terminate (destructive) | Dropdown Action (red) | Admin, Director |
| View Audit Trail | Audit log for employee | Dropdown Action | Auditor |

#### Payroll Run Section

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + Process Payroll | HR-004: Process Monthly Payroll | Section Primary | Payroll Officer, Bursar |
| Approve Payroll | HR-004: Approval workflow | Section Action | Bursar, Director |
| Reverse Payroll Run | HR-006: Reverse Payroll Run (destructive) | Section Action (red) | Bursar (requires reason) |
| Add Deduction Type | HR-007: Deduction Type master | Section Action | Payroll Officer |
| Generate Payslips | HR-005: Generate for approved run | Section Action | Payroll Officer |

---

### O. TREASURY & BANKING

**Page:** Treasury  
**Component:** `TreasuryDashboard.tsx`, `BankTransferUI.tsx`  
**Purpose:** Cash management, bank transfers, petty cash, forecasting

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + New Bank Transfer | TRS-001: Inter-Bank Transfer | Primary Action | Accountant, Bursar |
| + Petty Cash Voucher | TRS-003: Petty Cash Voucher | Secondary Action | Bursar, Cashier |
| Cash Forecast | TRS-002: Cash Flow Forecast | Dropdown Action | Accountant, Bursar |

#### Treasury Section Buttons

| Section | Button Label | Opens Form | Type | Roles |
|---------|-------------|-----------|------|-------|
| Bank Accounts | View Balance | Bank account detail | Row Action | Accountant, Bursar |
| Bank Accounts | Transfer | TRS-001: prefilled source bank | Row Action | Accountant, Bursar |
| Bank Accounts | Reconcile | GL-005: prefilled bank account | Row Action | Accountant |
| Petty Cash | + New Voucher | TRS-003: Petty Cash Voucher | Section Action | Bursar, Cashier |
| Petty Cash | Replenish | TRS-004: Replenish Petty Cash | Section Action | Bursar, Accountant |
| Cash Forecast | Generate Forecast | TRS-002: Cash Flow Forecast | Section Action | Accountant, Bursar |

---

### P. FIXED ASSETS

**Page:** Assets  
**Component:** `AssetRegister.tsx`, `DepreciationRunner.tsx`  
**Purpose:** Asset register, depreciation, disposal

#### Page Header Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + Register Asset | FA-001: Register Fixed Asset | Primary Action | Accountant, Bursar |
| Run Depreciation | FA-002: Monthly Depreciation Run | Secondary Action | Accountant |

#### Asset Table Row Actions

| Action | Opens | Roles |
|--------|-------|-------|
| View | Asset detail page | Accountant, Bursar |
| Edit | FA-001: Edit mode | Accountant |
| Run Depreciation | FA-002: prefilled asset | Accountant |
| Transfer Location | FA-004: Transfer Asset Between Locations | Accountant, Admin |
| Dispose | FA-003: Dispose Fixed Asset (destructive) | Accountant (requires approval) |

#### Asset Detail Page Actions

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Run Depreciation | FA-002: prefilled asset | Primary Detail Action | Accountant |
| Transfer Location | FA-004: prefilled asset | Detail Action | Accountant, Admin |
| View Depreciation Schedule | Depreciation report for asset | Detail Action | Accountant, Bursar |
| Dispose Asset | FA-003: Dispose (destructive) | Dropdown Action (red) | Accountant |
| View Audit Trail | Audit log for asset | Dropdown Action | Auditor |

#### Asset Bulk Actions

| Action | Opens | Roles |
|--------|-------|-------|
| Run Depreciation (Batch) | FA-002: Monthly batch for all active assets | Accountant |
| Export Asset Register | FA-005: Fixed Asset Register Report | Accountant, Bursar |

---

### Q. AUDIT & COMPLIANCE

**Page:** Settings → Audit / embedded in module pages  
**Purpose:** Audit review, exception handling, compliance oversight

#### Audit Section Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| Review Exception | Audit Exception Review Form | Row Action | Auditor |
| Approve Backdated Txn | Backdated Transaction Approval Form | Row Action | Auditor, Bursar |
| Correct Receipt Sequence | Receipt Sequence Correction Form | Inline Action | Auditor, Accountant |
| Review Suspicious Txn | Suspicious Transaction Review Form | Row Action | Auditor |
| Change Role / Permissions | AUTH-005: Role Permissions | Inline Action | Admin |

---

### R. SYNC / BACKUP / DEVICE CONTROL

**Page:** Settings → Sync & Backup  
**Purpose:** Device management, sync monitoring, backup/restore

#### Section Buttons

| Button Label | Opens Form | Type | Roles |
|-------------|-----------|------|-------|
| + Register Device | Device Registration Form | Primary Action | Admin |
| Review Sync Status | Sync Status Dashboard | Section View | Admin |
| Resolve Conflict | Conflict Resolution Form | Row Action | Admin |
| Set Backup Schedule | Backup Schedule Form | Inline Action | Admin |
| Request Restore | Restore Request Form | Inline Action (destructive) | Admin, Director |

---

## 4. Form-to-Button Master Matrix

### 4.1 Module 1 — Authentication & User Management

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| AUTH-001 | Sign In | Sign In | — | Login page | — | — | — | All (unauthenticated) | — |
| AUTH-002 | Create User Account | + Add User | Invite User | Settings → Users | — | — | — | Admin | Institution, campus |
| AUTH-003 | Change Password | Change Password | — | My Profile | — | — | — | All (own account) | Current user |
| AUTH-004 | My Profile | Edit Profile | — | Top-right avatar menu | — | — | — | All | Current user |
| AUTH-005 | Role Permissions | Assign Role | Change Permissions | Settings → Users | User detail | Edit Permissions (row) | — | Admin | Selected user |

### 4.2 Module 2 — Institution Setup

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| INST-001 | Institution Settings | Edit School Profile | — | Settings → Institution | — | — | — | Admin, Director | Current institution |
| INST-002 | Manage Campuses | + Add Campus | Edit Campus | Settings → Institution | Campus detail | Edit (row) | — | Admin, Director | Institution |
| INST-003 | Academic Year Config | + New Academic Year | + New Term | Settings → Academic | Year detail | Edit (row) | — | Admin, Bursar | Institution |
| INST-004 | Classes & Streams | + New Class | + New Stream | Settings → Academic | Class detail | Edit (row) | — | Admin, Registrar | Institution, campus, year |
| INST-005 | Chart of Accounts | + New Account | Import COA | Accounting → COA | Account detail | Edit (row) | — | Accountant, Bursar | Institution, parent account |
| INST-006 | Bank Accounts | + New Bank Account | — | Settings → Banking | Bank detail | Edit (row) | — | Accountant, Bursar | Institution |
| INST-007 | Departments | + New Department | — | Settings → Departments | — | Edit (row) | — | Admin | Institution |
| INST-008 | Business Policy Rules | + New Policy Rule | — | Settings → Policies | Policy detail | Edit (row) | — | Admin, Director | Institution |

### 4.3 Module 3 — Student & Family Management

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| STU-001 | Register New Student | + New Student | Import Students | Students list | — | Edit (row) | ⚡ New Student | Bursar, Admin, Registrar | Institution, campus, active year/term |
| STU-002 | Register Family/Guardian | + Add Guardian | Add Sponsor | Students list | Student detail (Add Guardian) | — | — | Bursar, Admin, Registrar | Student link (if from detail) |
| STU-003 | Transfer Student | Transfer Student | — | — | Student detail | Transfer (row) | — | Admin | Student, current class |
| STU-004 | Withdraw / Exit Student | Withdraw Student | — | — | Student detail | Withdraw (row, destructive) | — | Admin, Director | Student |
| STU-005 | Change Student Status | Change Status | — | — | Student detail | Change Status (row) | — | Admin, Bursar | Student, current status |
| STU-006 | End-of-Year Promotion | Promote Students | — | Students list (bulk) | — | — (bulk only) | — | Admin | Active year, class list |
| STU-007 | Family Financial Summary | View Family Summary | — | — | Student detail | — | — | Bursar | Student/family |
| STU-008 | Bulk Student Import | Import Students | — | Students list (dropdown) | — | — | — | Admin | Institution, campus, class |
| STU-009 | Student Directory | View Directory | — | Students list | — | — | — | All authorized | Institution filters |

### 4.4 Module 4 — Fee Rules & Billing Engine

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| FEE-001 | Create / Edit Fee Rule | + New Fee Rule | Duplicate Rule | Billing page | Fee rule detail | Edit (row) | — | Bursar, Accountant | Institution, active year |
| FEE-002 | Fee Discount Rule | + New Discount Rule | — | Billing page | Fee rule detail (Add Discount) | Edit (row) | — | Bursar | Institution, fee rule (if contextual) |
| FEE-003 | Preview Fee Schedule | Preview Fee Schedule | — | Billing page | Fee rule detail | Preview (row) | — | Bursar, Accountant | Class, term, active rules |
| FEE-004 | Generate Invoices (Billing Run) | Generate Invoices | Generate Batch Invoices | Billing page, Invoices page | — | — (bulk/batch) | — | Bursar | Institution, term, class selection |
| FEE-005 | Fee Waiver Request | Apply Discount / Waiver | — | — | Student detail | — | — | Bursar | Student, active invoices |
| FEE-006 | Fee Template | + New Fee Template | Add Template Line | Billing page | Template detail | Edit (row) | — | Bursar | Institution |
| FEE-007 | Fee Rule Adjustment | Adjust Rule | Override Fee | Billing page | Fee rule detail, Route detail | Adjust (row) | — | Bursar | Fee rule being adjusted |
| FEE-008 | Fee Structure Report Filter | Fee Structure Report | — | Billing → Reports | — | — | — | Bursar, Accountant | Institution, year, term |

### 4.5 Module 5 — Invoice Management

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| INV-001 | Create Student Invoice | + New Invoice | — | Invoices page, Students page | Student detail | New Invoice (row) | ⚡ New Invoice | Bursar | Student, class, term, institution |
| INV-002 | Edit Invoice | Edit Draft | Adjust Invoice | — | Invoice detail | Edit (row, draft only) | — | Bursar | Invoice data |
| INV-003 | Cancel Invoice | Cancel Invoice | — | — | Invoice detail | Cancel (row, destructive) | — | Bursar | Invoice, requires reason |
| INV-004 | Issue Credit Note | Issue Credit Note | — | — | Invoice detail | Credit Note (row) | — | Bursar, Accountant | Invoice ref, student, amount |
| INV-005 | Issue Debit Note | Issue Debit Note | — | — | Invoice detail | Debit Note (row) | — | Bursar, Accountant | Invoice ref, student |
| INV-006 | Invoice Register | Export Register | — | Invoices page | — | — | — | Bursar, Accountant | Institution, date range |

### 4.6 Module 6 — Payments & Receipting

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| PAY-001 | Record Payment | + Record Payment | — | Payments page, Invoices page | Invoice detail, Student detail | Record Payment (row) | ⚡ Record Payment | Bursar, Cashier | Student, invoice, balance |
| PAY-002 | Payment Reversal | Reverse Payment | Refund | — | Payment detail | Reverse (row, destructive) | — | Bursar | Payment, requires reason |
| PAY-003 | Import MoMo Payments | Capture Mobile Money | — | Payments page | — | — | — | Bursar, Cashier | Institution, date |
| PAY-004 | Import Bank Statement | Import Bank Statement | Capture Bank Deposit | Payments page, Accounting page | — | — | ⚡ Capture Bank Deposit | Bursar, Accountant | Bank account, date range |
| PAY-005 | Allocate Unapplied Payment | Allocate Unapplied | Allocate | Payments page | Payment detail | Allocate (row) | — | Bursar, Accountant | Payment, student invoices |
| PAY-006 | Receipt Reprint / Email | Generate Receipt | Reprint Receipt | — | Payment detail | Receipt (row) | — | Bursar, Cashier | Payment, student |
| PAY-007 | Payment Register | Export Register | — | Payments page | — | — | — | Bursar, Accountant | Institution, date range |

### 4.7 Module 7 — Collections & Follow-Up

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| COL-001 | Create Payment Plan | + New Payment Plan | Set Installment Plan | Collections page | Invoice detail, Student detail | Set Plan (row) | — | Bursar | Student, outstanding balance |
| COL-002 | Log Follow-Up | Record Follow-up | Record Commitment | Collections page | Student detail | Follow Up (row) | — | Bursar, Collections Officer | Student, arrears amount |
| COL-003 | Generate Demand Letter | Generate Demand Letters | Send Demand Letter | Collections page | — | Send Letter (row) | — | Bursar | Student, outstanding |
| COL-004 | Aging Bucket Settings | Configure Aging | — | Collections → Settings | — | — | — | Bursar, Accountant | Institution defaults |
| COL-005 | Bad Debt Write-Off | Request Write-off | — | — | — | Write Off (row, destructive) | — | Bursar (approval required) | Student, invoice, amount |
| COL-006 | Collections Dashboard | — (view) | — | Collections page | — | — | — | Bursar, Director | Institution, term |

### 4.8 Module 8 — Transport

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| TRN-001 | Create / Edit Route | + New Transport Route | Add Pickup Point | Transport page | Route detail | Edit (row) | — | Bursar, Admin | Institution |
| TRN-002 | Assign Student to Route | Assign Student | — | Transport page | Route detail, Student detail | Assign (row) | — | Bursar, Admin | Route or student (contextual) |
| TRN-003 | Bulk Assign Transport | Assign Students (bulk) | — | Transport page, Students page | — | — (bulk) | — | Bursar, Admin | Route, student selection |
| TRN-004 | Remove from Transport | Remove from Route | — | — | Route detail, Student detail | Remove (row) | — | Bursar, Admin | Student, route |
| TRN-005 | Transport Report | View Report | Export | Transport page | — | — | — | Bursar, Accountant | Institution, term |

### 4.9 Module 9 — Inventory & Store

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| INV-S01 | Create / Edit Inventory Item | + New Inventory Item | Reorder Request | Inventory page | Item detail | Edit (row) | — | Storekeeper, Bursar | Institution |
| INV-S02 | Receive Stock | Receive Stock | — | Inventory page | Item detail | Receive (row) | ⚡ Receive Stock | Storekeeper | Item (if contextual) |
| INV-S03 | Issue Stock | Issue Stock | Issue to Student | Inventory page | Item detail, Student detail | Issue (row) | — | Storekeeper | Item, student (if contextual) |
| INV-S04 | Stock Count Adjustment | Adjust Stock | — | Inventory page | Item detail | Adjust (row) | — | Storekeeper, Bursar | Item, current qty |
| INV-S05 | Allocate Inventory to Class | Allocate to Class | — | Inventory page | Item detail | Allocate (row) | — | Storekeeper, Bursar | Item, class, term |
| INV-S06 | Inventory Report | Export Report | — | Inventory page | — | — | — | Storekeeper, Bursar | Institution |

### 4.10 Module 10 — Accounting & GL

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| GL-001 | Manual Journal Entry | + New Journal Entry | Add Journal Line | Accounting page | Journal detail | Edit Draft (row) | ⚡ New Journal Entry | Accountant | Institution, period |
| GL-002 | Reverse Journal Entry | Reverse Journal | — | — | Journal detail | Reverse (row, destructive) | — | Accountant | Journal, requires reason |
| GL-003 | Accounting Periods | Period Control | Lock/Reopen Period | Accounting page | — | Lock/Reopen (row) | — | Accountant, Bursar | Institution, current period |
| GL-004 | Recurring Journal Template | + New Recurring Template | — | Accounting → Recurring | Template detail | Edit (row) | — | Accountant | Institution |
| GL-005 | Bank Reconciliation | Start Reconciliation | — | Accounting page | — | Reconcile (row on bank) | ⚡ Start Reconciliation | Accountant | Bank account, period |
| GL-006 | Trial Balance Report Filter | Trial Balance | — | Accounting → Reports | — | — | — | Accountant, Bursar | Institution, period |
| GL-007 | Income Statement / P&L | Income Statement | — | Accounting → Reports | — | — | — | Accountant, Bursar, Director | Institution, period |
| GL-008 | Balance Sheet | Balance Sheet | — | Accounting → Reports | — | — | — | Accountant, Bursar, Director | Institution, date |

### 4.11 Module 11 — Payroll

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| HR-001 | Register Employee | + New Employee | — | Payroll page | — | Edit (row) | — | Payroll Officer, Admin | Institution, department |
| HR-002 | Salary Grade / Structure | Set Salary Grade | — | Payroll page | Employee detail | Set Grade (row) | — | Payroll Officer | Employee |
| HR-003 | Employee Deduction | Add Deduction | Add Earnings | Payroll page | Employee detail | Add Deduction (row) | — | Payroll Officer | Employee |
| HR-004 | Process Monthly Payroll | Process Payroll | Approve Payroll | Payroll page | — | — (batch) | ⚡ Process Payroll | Payroll Officer, Bursar | Institution, month, period |
| HR-005 | Employee Payslip | Generate Payslips | View Payslip | Payroll page | Employee detail | View Payslip (row) | — | Payroll Officer | Employee, payroll run |
| HR-006 | Reverse Payroll Run | Reverse Payroll | — | Payroll page | — | Reverse (row, destructive) | — | Bursar | Payroll run, requires reason |
| HR-007 | Deduction Type | + Add Deduction Type | — | Payroll → Settings | — | Edit (row) | — | Payroll Officer | Institution |
| HR-008 | Terminate Employee | Terminate Employee | Process Final Dues | — | Employee detail | Terminate (row, destructive) | — | Admin, Director | Employee |

### 4.12 Module 12 — Accounts Payable

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| AP-001 | Register Supplier | + New Supplier | — | AP page | — | Edit (row) | ⚡ New Supplier | Bursar, Accountant | Institution |
| AP-002 | Enter Supplier Bill | + New Supplier Bill | — | AP page | Supplier detail | New Bill (row) | — | Bursar, Accountant | Supplier (if contextual) |
| AP-003 | Supplier Payment Run | Process Payment Run | — | AP page | — | — (batch) | — | Bursar, Accountant | Institution, selected bills |
| AP-004 | Pay Supplier | Pay Supplier | — | AP page | Supplier detail, Bill detail | Pay (row) | — | Bursar, Accountant | Supplier, bill, amount |
| AP-005 | Reverse Supplier Payment | Reverse Payment | — | — | Payment detail | Reverse (row, destructive) | — | Bursar | Payment, requires reason |
| AP-006 | AP Aging | AP Aging Report | — | AP page → Reports | — | — | — | Accountant | Institution, date |
| AP-007 | Purchase Order | + New Purchase Order | — | AP page | Supplier detail | — | — | Bursar | Supplier (if contextual) |

### 4.13 Module 13 — Treasury & Banking

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| TRS-001 | Inter-Bank Transfer | + New Bank Transfer | — | Treasury page | — | Transfer (row on bank) | — | Accountant, Bursar | Source bank |
| TRS-002 | Cash Flow Forecast | Cash Forecast | Generate Forecast | Treasury page | — | — | — | Accountant, Bursar | Institution, months |
| TRS-003 | Petty Cash Voucher | + Petty Cash Voucher | — | Treasury page | — | — | — | Bursar, Cashier | Petty cash account |
| TRS-004 | Replenish Petty Cash | Replenish | — | Treasury page | — | Replenish (row on PC) | — | Bursar, Accountant | Petty cash account, balance |
| TRS-005 | Treasury Overview | — (view) | — | Treasury page | — | — | — | Accountant, Bursar, Director | Institution |

### 4.14 Module 14 — Fixed Assets

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| FA-001 | Register Fixed Asset | + Register Asset | — | Assets page | — | Edit (row) | — | Accountant, Bursar | Institution, category |
| FA-002 | Monthly Depreciation Run | Run Depreciation | — | Assets page | Asset detail | Depreciate (row) | — | Accountant | Period, asset/all |
| FA-003 | Dispose Fixed Asset | Dispose Asset | — | — | Asset detail | Dispose (row, destructive) | — | Accountant | Asset, NBV |
| FA-004 | Transfer Asset Location | Transfer Location | — | — | Asset detail | Transfer (row) | — | Accountant, Admin | Asset, current location |
| FA-005 | Fixed Asset Register Report | Export Register | — | Assets page | — | — | — | Accountant, Bursar | Institution |

### 4.15 Module 15 — Budget

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| BDG-001 | Create Annual Budget | + Create Budget | Add Budget Line, Submit, Approve | Budget page | Budget detail | Edit Draft (row) | ⚡ Create Budget | Bursar, Accountant | Institution, fiscal year |
| BDG-002 | Revise Budget | Revise Budget | Add Supplementary | Budget page | Budget detail | Revise (row) | — | Bursar, Accountant | Budget header, lines |
| BDG-003 | Budget vs Actual Report | Budget vs Actual | View Variance | Budget page | Budget detail | View Variance (row) | — | Bursar, Accountant, Director | Budget, period |
| BDG-004 | Inter-Line Budget Transfer | Budget Transfer | Virement | — | Budget detail | Transfer (row on budget line) | — | Bursar, Accountant | Budget, source/target lines |
| BDG-005 | Close Budget Year | Close Budget Year | — | — | Budget detail | Close (row, destructive) | — | Accountant | Budget, fiscal year |

### 4.16 Module 16 — Scholarships & Bursaries

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| SCH-001 | Bursary / Scholarship Application | + New Bursary Application | Renew Scholarship | Scholarships page | Student detail, Bursary detail | Edit (row), Renew (row) | — | Bursar, Admin | Student (if contextual) |
| SCH-002 | Approve / Reject Bursary | Approve | Reject | — | Bursary detail | Approve/Reject (row) | — | Director, Bursar | Application details |
| SCH-003 | Record Bursary Disbursement | Disburse | — | — | Bursary detail | Disburse (row) | — | Bursar, Accountant | Approved amount, student |
| SCH-004 | Scholarship / Bursary Report | View Report | Export | Scholarships page | — | — | — | Bursar, Accountant, Director | Institution, period |

### 4.17 Module — Kitchen Stores & Accountability

| Form ID | Form Name | Primary Button | Secondary Buttons | Module/Page | Detail Page | Row Action | Quick Action | Roles | Prefilled Context |
|---------|-----------|---------------|-------------------|-------------|-------------|------------|-------------|-------|------------------|
| KIT-001 | Kitchen Item Master | + New Kitchen Item | — | Kitchen Stores page | — | Edit (row) | — | Storekeeper, Kitchen Manager | Institution |
| KIT-002 | Kitchen Stock Receipt | Receive Kitchen Stock | — | Kitchen Stores page | Kitchen item detail | Receive (row) | ⚡ Receive Kitchen Stock | Storekeeper | Item (if contextual), supplier |
| KIT-003 | Kitchen Issue Requisition | + New Requisition | — | Kitchen Stores page | — | View (row) | — | Kitchen Manager | Institution, date |
| KIT-004 | Kitchen Stock Issue | Issue Kitchen Stock | — | Kitchen Stores page | Kitchen item detail, Requisition detail | Issue (row) | — | Storekeeper | Requisition (if contextual), item |
| KIT-005 | Daily Consumption & Accountability | Record Consumption | — | Kitchen Stores page | Kitchen item detail | Record (row) | ⚡ Record Kitchen Consumption | Kitchen Staff, Storekeeper | Date, meal, items |
| KIT-006 | Kitchen Return | Record Kitchen Return | — | Kitchen Stores page | Kitchen item detail | Return (row) | — | Kitchen Staff | Item |
| KIT-007 | Kitchen Wastage / Loss | Record Wastage / Loss | — | Kitchen Stores page | Kitchen item detail | Wastage (row) | — | Kitchen Manager, Storekeeper | Item, quantity |
| KIT-008 | Kitchen Physical Stock Count | + New Stock Count | — | Kitchen Stores page | Kitchen item detail | Count (row) | — | Storekeeper | All items or selected |
| KIT-009 | Kitchen Menu Planning | Plan Menu | — | Kitchen Stores page | — | — | — | Kitchen Manager | Institution, week/date |
| KIT-010 | Kitchen Budget Planning | Create Kitchen Budget | — | Kitchen Stores page | — | — | — | Bursar, Kitchen Manager | Institution, period |
| KIT-011 | Kitchen Stock Adjustment | Adjust Kitchen Stock | — | Kitchen Stores page | Kitchen item detail | Adjust (row) | — | Storekeeper | Item, current qty |

---

## 5. Detail Page Contextual Buttons

### 5.1 Student Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Student: Nakato Sarah K.    Class: S3    Status: Active     │
│                                                              │
│  [+ New Invoice]  [Record Payment]  [Generate Statement]     │
│  [Assign Transport]  [Apply Discount]  [▾ More Actions]     │
│                                                              │
│  ▾ More Actions:                                             │
│    • Add Guardian                                            │
│    • Add Scholarship / Bursary                               │
│    • Issue Inventory Item                                    │
│    • Change Status                                           │
│    • Transfer Student                                        │
│    • Withdraw Student (red)                                  │
│    • View Family Summary                                     │
│    • View Audit Trail                                        │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Invoice Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Invoice: INV-2026-00145    Student: Nakato Sarah K.         │
│  Status: Posted    Amount: UGX 3,200,000    Due: 15 Apr 26  │
│                                                              │
│  [Record Payment]  [Print Invoice]  [▾ More Actions]         │
│                                                              │
│  ▾ More Actions:                                             │
│    • Edit Draft (if draft)                                   │
│    • Issue Credit Note                                       │
│    • Issue Debit Note                                        │
│    • Set Installment Plan                                    │
│    • Share Invoice                                           │
│    • Cancel Invoice (red)                                    │
│    • View Audit Trail                                        │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Payment Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Payment: PAY-2026-00089    Student: Nakato Sarah K.         │
│  Method: MTN MoMo    Amount: UGX 1,500,000    Status: Posted│
│                                                              │
│  [Allocate]  [Generate Receipt]  [▾ More Actions]            │
│                                                              │
│  ▾ More Actions:                                             │
│    • Reprint Receipt                                         │
│    • Reverse Payment (red)                                   │
│    • Refund                                                  │
│    • View Audit Trail                                        │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Supplier Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Supplier: Kampala Stationery Ltd    Status: Active          │
│  Payment Terms: Net 30    Outstanding: UGX 850,000           │
│                                                              │
│  [+ New Supplier Bill]  [Record Payment]  [▾ More Actions]   │
│                                                              │
│  ▾ More Actions:                                             │
│    • New Purchase Order                                      │
│    • View Ledger                                             │
│    • Edit Supplier                                           │
│    • View AP Aging                                           │
└──────────────────────────────────────────────────────────────┘
```

### 5.5 Budget Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Budget: FY 2026 Operating Budget    Status: Draft           │
│  Total: UGX 480,000,000    Lines: 24                         │
│                                                              │
│  [+ Add Budget Line]  [Submit Budget]  [▾ More Actions]      │
│                                                              │
│  ▾ More Actions:                                             │
│    • Approve Budget (green, Director only)                   │
│    • Revise Budget                                           │
│    • Budget Transfer (Virement)                              │
│    • Add Supplementary Budget                                │
│    • View Variance Report                                    │
│    • Close Budget Year (red)                                 │
│    • Print Budget                                            │
└──────────────────────────────────────────────────────────────┘
```

### 5.6 Route Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Route: Entebbe Road – Main Campus    Cost: UGX 150,000/mo  │
│  Stages: 8    Students: 34    Status: Active                 │
│                                                              │
│  [+ Add Pickup Point]  [Assign Students]  [▾ More Actions]   │
│                                                              │
│  ▾ More Actions:                                             │
│    • Override Transport Fee                                  │
│    • View Route Collections                                  │
│    • Edit Route                                              │
│    • Deactivate Route (red)                                  │
└──────────────────────────────────────────────────────────────┘
```

### 5.7 Kitchen Item Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Item: Rice (Grade 1)    Category: Dry Goods                 │
│  On Hand: 250 kg    Reorder Level: 50 kg    Unit: UGX 4,500 │
│                                                              │
│  [Receive Stock]  [Issue Stock]  [▾ More Actions]            │
│                                                              │
│  ▾ More Actions:                                             │
│    • Record Consumption                                      │
│    • Adjust Stock                                            │
│    • Record Return                                           │
│    • Record Wastage                                          │
│    • View Movements                                          │
│    • Stock Count                                             │
└──────────────────────────────────────────────────────────────┘
```

### 5.8 Employee Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Employee: Mugisha Robert    Department: Academic            │
│  Position: Senior Teacher    Grade: T5    Status: Active     │
│                                                              │
│  [Set Salary Grade]  [Add Deduction]  [▾ More Actions]       │
│                                                              │
│  ▾ More Actions:                                             │
│    • Add Payroll Adjustment                                  │
│    • View Payslips                                           │
│    • Process Final Dues                                      │
│    • Terminate Employee (red)                                │
│    • View Audit Trail                                        │
└──────────────────────────────────────────────────────────────┘
```

### 5.9 Asset Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Asset: Toyota Coaster Bus    Code: FA-VEH-001               │
│  Cost: UGX 180,000,000    NBV: UGX 135,000,000              │
│  Depreciation: Straight Line    Useful Life: 10 years        │
│                                                              │
│  [Run Depreciation]  [Transfer Location]  [▾ More Actions]   │
│                                                              │
│  ▾ More Actions:                                             │
│    • View Depreciation Schedule                              │
│    • Dispose Asset (red)                                     │
│    • Edit Asset                                              │
│    • View Audit Trail                                        │
└──────────────────────────────────────────────────────────────┘
```

### 5.10 Journal Entry Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Journal: JE-2026-00034    Type: Manual    Status: Draft     │
│  Date: 2026-04-07    Total: UGX 5,400,000                   │
│                                                              │
│  [Approve]  [Post]  [+ Add Line]  [▾ More Actions]          │
│                                                              │
│  ▾ More Actions:                                             │
│    • Edit Draft (if draft)                                   │
│    • Reverse Journal (red, posted only)                      │
│    • Print Voucher                                           │
│    • View Audit Trail                                        │
└──────────────────────────────────────────────────────────────┘
```

### 5.11 Bursary Application Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  Bursary: BUR-2026-0012    Student: Ssempijja David          │
│  Requested: UGX 800,000    Status: Pending Approval          │
│                                                              │
│  [Approve]  [Reject]  [▾ More Actions]                       │
│                                                              │
│  ▾ More Actions:                                             │
│    • Disburse (if approved)                                  │
│    • Renew Scholarship                                       │
│    • View Student Profile                                    │
│    • View Statement                                          │
│    • Link Additional Student                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Table Row Actions and Bulk Actions

### 6.1 Row Action Menus (per table)

Every data table must have a row action menu (⋯ icon) on the rightmost column. Inline icons for the most common 1-2 actions are recommended alongside the overflow menu.

| Table | Inline Icons | ⋯ Menu Actions |
|-------|-------------|----------------|
| **Students** | View | Edit, New Invoice, Record Payment, Assign Transport, Change Status |
| **Invoices** | View, Print | Edit Draft, Record Payment, Credit Note, Debit Note, Cancel |
| **Payments** | View | Allocate, Receipt, Reprint, Reverse |
| **Fee Rules** | View | Edit, Duplicate, Adjust, Deactivate |
| **Journals** | View | Edit Draft, Approve, Post, Reverse, Print |
| **Suppliers** | View | Edit, New Bill, Pay, View Ledger |
| **Supplier Bills** | View | Edit Draft, Approve, Pay, Reverse Payment |
| **Employees** | View | Edit, Set Grade, Add Deduction, View Payslips, Terminate |
| **Assets** | View | Edit, Depreciate, Transfer, Dispose |
| **Budgets** | View | Edit Draft, Submit, Approve, Revise, View Variance, Close |
| **Transport Routes** | View | Edit, Assign Student, View Collections, Deactivate |
| **Inventory Items** | View | Edit, Receive, Issue, Adjust, View Movements |
| **Kitchen Items** | View | Edit, Receive, Issue, Consumption, Adjust, View Movements |
| **Bursaries** | View | Edit, Approve, Reject, Disburse, Renew |
| **Payment Plans** | View | Record Installment, Modify Plan, Cancel Plan |
| **Bank Accounts** | View Balance | Transfer, Reconcile |
| **Accounting Periods** | — | Lock, Reopen |

### 6.2 Bulk Actions (per table)

Bulk actions appear in a toolbar above the table when rows are selected (checkbox column).

| Table | Bulk Actions Available | Roles |
|-------|----------------------|-------|
| **Students** | Generate Invoices, Export Statements, Assign Transport, Promote | Bursar, Admin |
| **Invoices** | Print Selected, Export Selected, Cancel Selected | Bursar |
| **Payments** | Print Receipts, Export Selected, Allocate Selected | Bursar, Cashier |
| **Fee Rules** | Activate Selected, Deactivate Selected, Generate Invoices | Bursar |
| **Journals** | Approve Selected, Post Selected, Export Selected | Accountant |
| **Supplier Bills** | Select for Payment Run, Approve Selected, Export | Bursar, Accountant |
| **Employees** | Process Payroll, Generate Payslips, Export List | Payroll Officer |
| **Assets** | Run Depreciation (Batch), Export Register | Accountant |
| **Budgets** | Approve Budget Lines, Export Budget | Director, Accountant |
| **Transport** | Assign Students, Export | Bursar, Admin |
| **Inventory** | Allocate to Class, Export Report, Print Stock Count | Storekeeper |
| **Kitchen Items** | Stock Count, Export Report | Storekeeper |
| **Bursaries** | Approve Selected, Export Report | Director, Bursar |
| **Aging (Collections)** | Generate Demand Letters, Export Statements, Mark Follow-ups | Bursar |

---

## 7. Quick Actions / Global Create Menu

### 7.1 Global Quick Action Menu (⚡ Icon in Top Navigation Bar)

Accessible from every page. Opens a command palette-style dropdown with the most common create/record actions.

| Quick Action | Opens Form | Keyboard Shortcut | Roles |
|-------------|-----------|-------------------|-------|
| ⚡ New Student | STU-001 | Ctrl+Shift+S | Bursar, Admin, Registrar |
| ⚡ New Invoice | INV-001 | Ctrl+Shift+I | Bursar |
| ⚡ Record Payment | PAY-001 | Ctrl+Shift+P | Bursar, Cashier |
| ⚡ Capture Bank Deposit | PAY-004 | Ctrl+Shift+B | Bursar, Accountant |
| ⚡ New Journal Entry | GL-001 | Ctrl+Shift+J | Accountant |
| ⚡ New Expense / Bill | AP-002 | Ctrl+Shift+E | Bursar, Accountant |
| ⚡ Create Budget | BDG-001 | Ctrl+Shift+U | Bursar, Accountant |
| ⚡ Process Payroll | HR-004 | — | Payroll Officer, Bursar |
| ⚡ Start Reconciliation | GL-005 | — | Accountant |
| ⚡ New Supplier | AP-001 | — | Bursar, Accountant |
| ⚡ Receive Stock | INV-S02 | — | Storekeeper |
| ⚡ Receive Kitchen Stock | KIT-002 | — | Storekeeper |
| ⚡ Record Consumption | KIT-005 | — | Kitchen Staff, Storekeeper |

### 7.2 Dashboard Quick Action Cards

The Dashboard home page includes larger clickable cards for the 6 most-used actions, role-filtered:

**Bursar Dashboard:**
1. + New Invoice
2. Record Payment
3. Generate Invoices (Billing Run)
4. View Aging / Collections
5. Create Budget
6. Process Payroll

**Accountant Dashboard:**
1. New Journal Entry
2. Start Reconciliation
3. Trial Balance
4. Budget vs Actual
5. New Supplier Bill
6. Run Depreciation

**Cashier Dashboard:**
1. Record Payment
2. Generate Receipt
3. Reprint Receipt
4. View Payment History

**Storekeeper Dashboard:**
1. Receive Stock
2. Issue Stock
3. Receive Kitchen Stock
4. Record Kitchen Consumption
5. New Stock Count

**Payroll Officer Dashboard:**
1. Process Payroll
2. New Employee
3. Generate Payslips
4. Add Deduction

**Director Dashboard:**
1. Financial Overview (read-only)
2. Approve Budget
3. Approve Bursary
4. Approve Payroll
5. View Reports

---

## 8. Role-Based Button Visibility

### 8.1 Role Definitions

| Role | System Code | Description |
|------|------------|-------------|
| **Administrator** | `admin` | Full system access, user management, institution setup |
| **Director / Headteacher** | `director` | Approval authority, read-only dashboards, reports |
| **Bursar** | `bursar` | Financial operations: invoicing, payments, billing, budgets |
| **Accountant** | `accountant` | GL, journals, reconciliation, financial statements |
| **Cashier** | `cashier` | Payment collection, receipt generation only |
| **Payroll Officer** | `payroll_officer` | Employee management, payroll processing |
| **Storekeeper** | `storekeeper` | Inventory and kitchen stock management |
| **Kitchen Manager** | `kitchen_manager` | Kitchen operations, menu planning, requisitions |
| **Kitchen Staff** | `kitchen_staff` | Daily consumption recording, returns |
| **Collections Officer** | `collections_officer` | Arrears follow-up, payment commitments |
| **Registrar** | `registrar` | Student registration, class management |
| **Auditor** | `auditor` | Read-only access to all audit trails, exception review |

### 8.2 Button Visibility Matrix by Role

#### Create / New Buttons

| Button | Admin | Director | Bursar | Accountant | Cashier | Payroll | Storekeeper | Kitchen Mgr | Kitchen Staff | Collections | Registrar | Auditor |
|--------|-------|----------|--------|------------|---------|---------|-------------|-------------|---------------|-------------|-----------|---------|
| + New Student | ✅ | — | ✅ | — | — | — | — | — | — | — | ✅ | — |
| + New Invoice | — | — | ✅ | — | — | — | — | — | — | — | — | — |
| Record Payment | — | — | ✅ | — | ✅ | — | — | — | — | — | — | — |
| + New Journal Entry | — | — | — | ✅ | — | — | — | — | — | — | — | — |
| + Create Budget | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| Process Payroll | — | — | ✅ | — | — | ✅ | — | — | — | — | — | — |
| + New Supplier | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| + New Supplier Bill | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| + Register Asset | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| + New Employee | ✅ | — | — | — | — | ✅ | — | — | — | — | — | — |
| Receive Stock | — | — | — | — | — | — | ✅ | — | — | — | — | — |
| Issue Stock | — | — | — | — | — | — | ✅ | — | — | — | — | — |
| + New Kitchen Item | — | — | — | — | — | — | ✅ | ✅ | — | — | — | — |
| Record Consumption | — | — | — | — | — | — | ✅ | — | ✅ | — | — | — |
| + New Payment Plan | — | — | ✅ | — | — | — | — | — | — | ✅ | — | — |
| Record Follow-up | — | — | ✅ | — | — | — | — | — | — | ✅ | — | — |

#### Approval Buttons

| Button | Admin | Director | Bursar | Accountant | Cashier | Payroll | Storekeeper | Kitchen Mgr | Kitchen Staff | Collections | Registrar | Auditor |
|--------|-------|----------|--------|------------|---------|---------|-------------|-------------|---------------|-------------|-----------|---------|
| Approve Budget | — | ✅ | — | — | — | — | — | — | — | — | — | — |
| Approve Bursary | — | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| Approve Journal | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| Approve Payroll | — | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| Approve Expense | — | — | ✅ | ✅ | — | — | — | — | — | — | — | — |
| Approve Supplier Bill | — | — | ✅ | — | — | — | — | — | — | — | — | — |

#### Destructive Buttons

| Button | Admin | Director | Bursar | Accountant | Cashier | Payroll | Storekeeper | Kitchen Mgr | Kitchen Staff | Collections | Registrar | Auditor |
|--------|-------|----------|--------|------------|---------|---------|-------------|-------------|---------------|-------------|-----------|---------|
| Cancel Invoice | — | — | ✅ | — | — | — | — | — | — | — | — | — |
| Reverse Payment | — | — | ✅ | — | — | — | — | — | — | — | — | — |
| Reverse Journal | — | — | — | ✅ | — | — | — | — | — | — | — | — |
| Reverse Payroll | — | — | ✅ | — | — | — | — | — | — | — | — | — |
| Write Off Bad Debt | — | — | ✅ | — | — | — | — | — | — | — | — | — |
| Terminate Employee | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| Dispose Asset | — | — | — | ✅ | — | — | — | — | — | — | — | — |
| Withdraw Student | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| Close Budget Year | — | — | — | ✅ | — | — | — | — | — | — | — | — |

#### Report / View Buttons

| Button | Admin | Director | Bursar | Accountant | Cashier | Payroll | Storekeeper | Kitchen Mgr | Kitchen Staff | Collections | Registrar | Auditor |
|--------|-------|----------|--------|------------|---------|---------|-------------|-------------|---------------|-------------|-----------|---------|
| Trial Balance | — | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | ✅ |
| Income Statement | — | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | ✅ |
| Balance Sheet | — | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | ✅ |
| Budget vs Actual | — | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | ✅ |
| AP Aging | — | — | ✅ | ✅ | — | — | — | — | — | — | — | ✅ |
| Collections Aging | — | ✅ | ✅ | ✅ | — | — | — | — | — | ✅ | — | ✅ |
| Inventory Report | — | — | ✅ | — | — | — | ✅ | ✅ | — | — | — | ✅ |
| Kitchen Reports | — | — | ✅ | — | — | — | ✅ | ✅ | — | — | — | ✅ |
| Payroll Summary | — | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | ✅ |
| Audit Trail | ✅ | — | — | ✅ | — | — | — | — | — | — | — | ✅ |

---

## 9. Prefilled Context Rules

### 9.1 Global Context (Always Auto-Applied)

Every form must automatically inherit:
- **Institution ID** — always set from logged-in user's institution
- **Campus** — default to user's assigned campus (editable if multi-campus)
- **Created By** — logged-in user ID
- **Created At** — current timestamp

### 9.2 Academic Context (When Relevant)

The following forms inherit academic context:
- **Active Academic Year** — forms: STU-001, FEE-001 through FEE-008, INV-001, FEE-004, COL-001
- **Active Term** — forms: INV-001, FEE-004, TRN-002, INV-S05, BDG-001

### 9.3 Entity-to-Form Prefill Rules

| Trigger Context | Target Form | Prefilled Fields |
|----------------|-------------|------------------|
| **Student Detail → New Invoice** | INV-001 | student_id, student_name, class, stream, guardian, active_term, institution |
| **Student Detail → Record Payment** | PAY-001 | student_id, student_name, outstanding_invoices, total_balance |
| **Student Detail → Assign Transport** | TRN-002 | student_id, student_name, class |
| **Student Detail → Apply Discount** | FEE-005 | student_id, active_invoices, fee_rules |
| **Student Detail → Add Guardian** | STU-002 | student_id (for linking) |
| **Student Detail → Add Scholarship** | SCH-001 | student_id, student_name, class |
| **Student Detail → Issue Item** | INV-S03 | student_id, student_name, class |
| **Invoice Detail → Record Payment** | PAY-001 | student_id, invoice_id, invoice_number, outstanding_amount, payer_name |
| **Invoice Detail → Credit Note** | INV-004 | invoice_id, invoice_number, student_id, original_amount, line_items |
| **Invoice Detail → Debit Note** | INV-005 | invoice_id, invoice_number, student_id |
| **Invoice Detail → Installment Plan** | COL-001 | student_id, invoice_id, outstanding_amount |
| **Payment Detail → Allocate** | PAY-005 | payment_id, student_id, unallocated_amount, open_invoices |
| **Payment Detail → Receipt** | PAY-006 | payment_id, student_id, amount, method, receipt_number |
| **Supplier Detail → New Bill** | AP-002 | supplier_id, supplier_name, payment_terms |
| **Supplier Detail → Pay** | AP-004 | supplier_id, open_bills, total_outstanding |
| **Supplier Detail → New PO** | AP-007 | supplier_id, supplier_name |
| **Budget Detail → Add Line** | BDG-001 (line) | budget_id, fiscal_year, remaining GL accounts |
| **Budget Detail → Virement** | BDG-004 | budget_id, budget_lines |
| **Route Detail → Assign Student** | TRN-002 | route_id, route_name, cost |
| **Route Detail → Add Stage** | TRN-001 (stage) | route_id, existing_stages |
| **Kitchen Item Detail → Receive** | KIT-002 | item_id, item_name, unit_of_measure, reorder_level, current_qty |
| **Kitchen Item Detail → Issue** | KIT-004 | item_id, item_name, available_qty |
| **Kitchen Item Detail → Consumption** | KIT-005 | item_id, item_name |
| **Requisition Detail → Issue** | KIT-004 | requisition_id, requested_items, quantities |
| **Employee Detail → Set Grade** | HR-002 | employee_id, current_grade |
| **Employee Detail → Add Deduction** | HR-003 | employee_id, employee_name, current_deductions |
| **Asset Detail → Depreciate** | FA-002 | asset_id, cost, accumulated_depreciation, method, useful_life |
| **Asset Detail → Transfer** | FA-004 | asset_id, current_location, current_campus |
| **Bank Account → Transfer** | TRS-001 | source_bank_id, source_balance |
| **Bank Account → Reconcile** | GL-005 | bank_account_id, bank_name |
| **Fee Rule Detail → Add Discount** | FEE-002 | fee_rule_id, rule_description |
| **Bursary Detail → Disburse** | SCH-003 | application_id, approved_amount, student_id |

### 9.4 Prefill Priority Order

When multiple contexts could apply, use this priority:
1. **Explicit navigation context** — user clicked from a specific detail page
2. **Selected row context** — user selected a row then clicked action
3. **Page-level filter context** — active filters on the list page
4. **Global defaults** — institution, campus, user, active term/year

---

## 10. Missing Buttons Audit

### 10.1 Audit Methodology

Every form from the DATA_CAPTURE_FORMS.md and KITCHEN_STORES_ACCOUNTABILITY.md specifications was cross-referenced against:
1. Current UI components (34 .tsx files)
2. Sidebar navigation
3. Page headers
4. Detail pages
5. Table row actions
6. Quick action menu

### 10.2 Forms With Confirmed Access Buttons

✅ All 113 forms have at least one defined access button in this specification.

### 10.3 Forms Requiring New Buttons (Not in Current UI)

The following forms exist in the specification but did not have explicit buttons in the current codebase. This specification now defines their buttons:

| Form ID | Form Name | New Button Label | Placement | Type | Roles |
|---------|-----------|-----------------|-----------|------|-------|
| STU-003 | Transfer Student | Transfer Student | Student detail ▾ More | Detail Dropdown | Admin |
| STU-004 | Withdraw / Exit Student | Withdraw Student | Student detail ▾ More | Detail Dropdown (red) | Admin, Director |
| STU-005 | Change Student Status | Change Status | Student detail ▾ More + Row action | Detail/Row | Admin, Bursar |
| STU-006 | End-of-Year Promotion | Promote Students | Students list bulk action toolbar | Bulk Action | Admin |
| STU-007 | Family Financial Summary | View Family Summary | Student detail ▾ More | Detail Dropdown | Bursar |
| STU-008 | Bulk Student Import | Import Students | Students page header ▾ dropdown | Page Dropdown | Admin |
| STU-009 | Student Directory | View Directory | Students page (default view) | Page View | All |
| FEE-003 | Preview Fee Schedule | Preview Fee Schedule | Billing page section button | Section Action | Bursar, Accountant |
| FEE-005 | Fee Waiver Request | Apply Discount / Waiver | Student detail action bar | Detail Action | Bursar |
| FEE-006 | Fee Template | + New Fee Template | Billing → Fee Templates section | Section Action | Bursar |
| FEE-007 | Fee Rule Adjustment | Adjust Rule | Fee rule row action + detail page | Row/Detail | Bursar |
| FEE-008 | Fee Structure Report | Fee Structure Report | Billing → Reports section | Section Action | Bursar, Accountant |
| INV-004 | Issue Credit Note | Issue Credit Note | Invoice detail + Invoice row action | Detail/Row | Bursar, Accountant |
| INV-005 | Issue Debit Note | Issue Debit Note | Invoice detail + Invoice row action | Detail/Row | Bursar, Accountant |
| INV-006 | Invoice Register | Export Register | Invoices page ▾ dropdown | Page Dropdown | Bursar, Accountant |
| PAY-002 | Payment Reversal | Reverse Payment | Payment detail ▾ More (red) | Detail Dropdown | Bursar |
| PAY-003 | Import MoMo Payments | Capture Mobile Money | Payments page secondary button | Page Secondary | Bursar, Cashier |
| PAY-005 | Allocate Unapplied Payment | Allocate Unapplied | Payments page ▾ dropdown | Page Dropdown | Bursar, Accountant |
| PAY-006 | Receipt Reprint / Email | Generate Receipt / Reprint | Payment detail action bar | Detail Action | Bursar, Cashier |
| PAY-007 | Payment Register | Export Register | Payments page ▾ dropdown | Page Dropdown | Bursar, Accountant |
| COL-002 | Log Follow-Up | Record Follow-up | Collections page + Aging row action | Page Secondary/Row | Bursar, Collections Officer |
| COL-003 | Generate Demand Letter | Generate Demand Letters | Collections page secondary | Page Secondary | Bursar |
| COL-004 | Aging Bucket Settings | Configure Aging | Collections → Settings | Settings Action | Bursar, Accountant |
| COL-005 | Bad Debt Write-Off | Request Write-off | Aging row action (destructive) | Row Action | Bursar |
| TRN-003 | Bulk Assign Transport | Assign Students (bulk) | Transport page + Students bulk | Secondary/Bulk | Bursar, Admin |
| TRN-004 | Remove from Transport | Remove from Route | Route detail student row action | Row Action | Bursar, Admin |
| TRN-005 | Transport Report | View Report | Transport page section | Section Action | Bursar, Accountant |
| INV-S04 | Stock Count Adjustment | Adjust Stock | Item detail + row action | Detail/Row | Storekeeper, Bursar |
| INV-S05 | Allocate to Class | Allocate to Class | Item detail + bulk action | Detail/Bulk | Storekeeper, Bursar |
| INV-S06 | Inventory Report | Export Report | Inventory page bulk | Bulk Action | Storekeeper, Bursar |
| GL-002 | Reverse Journal Entry | Reverse Journal | Journal detail ▾ More (red) | Detail Dropdown | Accountant |
| GL-003 | Accounting Periods | Period Control | Accounting page ▾ dropdown | Page Dropdown | Accountant, Bursar |
| GL-004 | Recurring Journal Template | + New Recurring Template | Accounting → Recurring section | Section Action | Accountant |
| GL-007 | Income Statement / P&L | Income Statement | Accounting → Reports section | Section Action | Accountant, Bursar, Director |
| GL-008 | Balance Sheet | Balance Sheet | Accounting → Reports section | Section Action | Accountant, Bursar, Director |
| HR-002 | Salary Grade / Structure | Set Salary Grade | Employee detail + row action | Detail/Row | Payroll Officer |
| HR-003 | Employee Deduction | Add Deduction | Employee detail + row action | Detail/Row | Payroll Officer |
| HR-005 | Employee Payslip | Generate Payslips / View Payslip | Payroll page ▾ dropdown + Employee row | Dropdown/Row | Payroll Officer |
| HR-006 | Reverse Payroll Run | Reverse Payroll | Payroll runs section (red) | Section Action | Bursar |
| HR-007 | Deduction Type | + Add Deduction Type | Payroll → Settings section | Section Action | Payroll Officer |
| HR-008 | Terminate Employee | Terminate Employee | Employee detail ▾ More (red) | Detail Dropdown | Admin, Director |
| AP-005 | Reverse Supplier Payment | Reverse Payment | Payment detail/row (destructive) | Detail/Row | Bursar |
| AP-006 | AP Aging | AP Aging Report | AP page → Reports section | Section Action | Accountant |
| AP-007 | Purchase Order | + New Purchase Order | AP page ▾ dropdown | Page Dropdown | Bursar |
| TRS-003 | Petty Cash Voucher | + Petty Cash Voucher | Treasury page secondary | Page Secondary | Bursar, Cashier |
| TRS-004 | Replenish Petty Cash | Replenish | Petty cash section row action | Row Action | Bursar, Accountant |
| TRS-005 | Treasury Overview | — (default view) | Treasury page | Page View | Accountant, Bursar, Director |
| FA-004 | Transfer Asset Location | Transfer Location | Asset detail + row action | Detail/Row | Accountant, Admin |
| FA-005 | Fixed Asset Register Report | Export Register | Assets page bulk | Bulk Action | Accountant, Bursar |
| BDG-002 | Revise Budget | Revise Budget | Budget detail + row action | Detail/Row | Bursar, Accountant |
| BDG-004 | Inter-Line Budget Transfer | Budget Transfer / Virement | Budget detail | Detail Action | Bursar, Accountant |
| BDG-005 | Close Budget Year | Close Budget Year | Budget detail ▾ More (red) | Detail Dropdown | Accountant |
| SCH-002 | Approve / Reject Bursary | Approve / Reject | Bursary detail + row action | Detail/Row | Director, Bursar |
| SCH-003 | Record Bursary Disbursement | Disburse | Bursary detail (approved only) | Detail Action | Bursar, Accountant |
| SCH-004 | Scholarship / Bursary Report | View Report | Scholarships page section | Section Action | Bursar, Accountant, Director |
| KIT-003 | Kitchen Issue Requisition | + New Requisition | Kitchen Stores page section | Section Action | Kitchen Manager |
| KIT-006 | Kitchen Return | Record Kitchen Return | Kitchen item detail ▾ More | Detail Dropdown | Kitchen Staff |
| KIT-007 | Kitchen Wastage / Loss | Record Wastage / Loss | Kitchen item detail ▾ More | Detail Dropdown | Kitchen Manager, Storekeeper |
| KIT-008 | Kitchen Physical Stock Count | + New Stock Count | Kitchen Stores page section | Section Action | Storekeeper |
| KIT-009 | Kitchen Menu Planning | Plan Menu | Kitchen Stores page section | Section Action | Kitchen Manager |
| KIT-010 | Kitchen Budget Planning | Create Kitchen Budget | Kitchen Stores page section | Section Action | Bursar, Kitchen Manager |
| KIT-011 | Kitchen Stock Adjustment | Adjust Kitchen Stock | Kitchen item detail + row action | Detail/Row | Storekeeper |

### 10.4 Audit Summary

- **Total forms audited:** 113
- **Forms with existing UI buttons (current codebase):** ~25 (basic create buttons in existing components)
- **Forms requiring new buttons per this spec:** 60+
- **Forms that are page-level views (no create button needed):** 8 (STU-009, COL-006, TRS-005, INV-006, PAY-007, FEE-008, TRN-005, SCH-004)
- **Orphaned forms (no access path):** 0 — all forms now have defined buttons

---

## 11. Recommended UI Placement Rules

### 11.1 Page Header Primary Action

- **Position:** Top-right of the page header, below the page title
- **Style:** Solid filled button (primary color), with "+" icon prefix for create actions
- **Count:** Maximum 1 primary button per page
- **Rule:** Must be the most common action a user performs on this page
- **Examples:** `+ New Student`, `+ New Invoice`, `+ Record Payment`, `+ New Journal Entry`

### 11.2 Page Header Secondary Actions

- **Position:** To the left of the primary button, same row
- **Style:** Outlined button (secondary color)
- **Count:** Maximum 2 secondary buttons
- **Rule:** Second and third most common actions
- **Examples:** `Generate Invoices`, `Import Bank Statement`, `Start Reconciliation`

### 11.3 Page Header Dropdown ("More Actions")

- **Position:** Rightmost, after secondary buttons, uses `▾` chevron icon
- **Style:** Text button with dropdown indicator
- **Contents:** Less-frequent page-level actions
- **Rule:** Actions used less than once per session belong here
- **Examples:** `Import Students`, `Export Register`, `Period Control`, `Configure Aging`

### 11.4 Table Row Actions

- **Position:** Rightmost column of every data table
- **Style:** Inline icon buttons (View = eye, Edit = pencil) + overflow menu (⋯)
- **Inline limit:** Maximum 2 inline icon buttons
- **Overflow menu:** All other row-level actions, grouped by type
- **Grouping order in overflow:**
  1. View / Edit
  2. Create related (New Invoice, Record Payment)
  3. Process (Approve, Post, Submit)
  4. Modify (Adjust, Override)
  5. ─── separator ───
  6. Destructive (Cancel, Reverse, Delete) — in red

### 11.5 Table Bulk Action Toolbar

- **Position:** Above the table, appears when 1+ rows are selected via checkboxes
- **Style:** Highlighted bar showing "N selected" count + action buttons
- **Rule:** Only show actions that make sense for multi-select
- **Placement:** Left-aligned count, right-aligned action buttons
- **Examples:** `[5 selected]  [Generate Invoices]  [Print Receipts]  [Export]`

### 11.6 Detail Page Action Bar

- **Position:** Below the record header/summary, above the detail tabs
- **Style:** Button group — primary action (solid), secondary actions (outlined), More (dropdown)
- **Layout:** `[Primary] [Secondary] [Secondary] [▾ More]`
- **Rule:** Primary = most likely next action from this page

### 11.7 Floating Quick Action Button (FAB)

- **Position:** Bottom-right corner, fixed position, visible on all pages
- **Style:** Circular button with ⚡ icon, opens radial/dropdown menu
- **Contents:** Global quick actions (see Section 7)
- **Rule:** Only create/record actions, never destructive actions

### 11.8 Section-Level Action Buttons

- **Position:** Right-aligned in section headers within a page
- **Style:** Small outlined buttons or text links
- **Rule:** For sub-sections within a page (e.g., "Recurring Journals" section within Accounting)
- **Examples:** `+ New Recurring Template`, `+ Add Stage`, `+ Add Budget Line`

### 11.9 Confirmation Dialog Design

For destructive and approval actions:

```
┌──────────────────────────────────────────┐
│  ⚠️ Cancel Invoice INV-2026-00145?       │
│                                          │
│  This will void the invoice and          │
│  reverse any partial allocations.        │
│  This action cannot be undone.           │
│                                          │
│  Reason: [________________________]      │
│          (required)                      │
│                                          │
│            [Cancel]  [Confirm Cancel]    │
│                      (red button)        │
└──────────────────────────────────────────┘
```

For approval actions:

```
┌──────────────────────────────────────────┐
│  ✅ Approve Budget FY 2026 Operating?    │
│                                          │
│  Total: UGX 480,000,000                  │
│  Lines: 24                               │
│  Submitted by: Nalubega Grace            │
│                                          │
│  Notes: [________________________]       │
│         (optional)                       │
│                                          │
│            [Cancel]  [Approve Budget]    │
│                      (green button)      │
└──────────────────────────────────────────┘
```

---

## 12. Phase 1 vs Phase 2 Recommendations

### 12.1 Phase 1 — Core Button Infrastructure (Implement First)

**Priority:** Must-have for production use

| Category | Items | Justification |
|----------|-------|---------------|
| **Page header primary buttons** | All 17 module primary buttons | Core navigation and entry points |
| **Quick actions (top 6)** | New Invoice, Record Payment, New Student, New Journal, Capture Deposit, New Supplier Bill | Most frequent daily actions |
| **Detail page actions (core)** | Student → Invoice/Payment, Invoice → Payment/Print, Payment → Allocate/Receipt | Core workflow continuity |
| **Table row actions (core)** | View, Edit, most common action per table | Basic record management |
| **Destructive action protection** | Confirmation dialogs for Cancel/Reverse/Void/Write-off | Data integrity protection |
| **Role-based visibility** | Button show/hide by role | Security compliance |
| **Prefilled context** | Student→Invoice, Invoice→Payment, Supplier→Bill | Workflow efficiency |

**Phase 1 Form Coverage: 60 forms** — all core billing, payment, student, accounting, collections, and basic setup forms.

### 12.2 Phase 2 — Extended Button Coverage (Enhance Later)

**Priority:** Nice-to-have, improves efficiency

| Category | Items | Justification |
|----------|-------|---------------|
| **Bulk actions** | All multi-select table actions | Batch processing efficiency |
| **Global FAB** | Floating ⚡ quick action button on all pages | Power-user productivity |
| **Keyboard shortcuts** | Ctrl+Shift combos for Quick Actions | Advanced user efficiency |
| **Dashboard quick action cards** | Role-specific dashboard cards | Guided experience |
| **Secondary detail page actions** | Less common contextual buttons | Complete workflow paths |
| **Kitchen stores full button set** | All 11 KIT-xxx form buttons | Kitchen sub-module completion |
| **Audit & compliance buttons** | Exception review, suspicious txn review | Audit workflow formalization |
| **Sync & backup buttons** | Device registration, conflict resolution | Multi-device rollout |
| **Search-to-form** | Type / command palette to jump to any form | Ultra-fast navigation |
| **Breadcrumb trail actions** | Contextual buttons in breadcrumb nav | Navigation enhancement |

**Phase 2 Form Coverage: Remaining 53 forms** — kitchen stores, advanced payroll, audit, sync/backup, and secondary workflows.

### 12.3 Implementation Priority Order

```
Phase 1, Sprint 1 (Critical Path)
├── Page header primary buttons for all modules
├── Record Payment + New Invoice flows
├── Student detail → Invoice → Payment chain
├── Role-based button visibility engine
└── Confirmation dialogs for destructive actions

Phase 1, Sprint 2 (Core Workflows)
├── All table row action menus
├── Detail page contextual buttons (student, invoice, payment)
├── Quick action menu (top 6 actions)
├── Prefill context engine
└── Receipt generation button chain

Phase 1, Sprint 3 (Completeness)
├── All page secondary/dropdown buttons
├── Budget creation and approval buttons
├── Payroll process and approve buttons
├── AP bill entry and payment buttons
└── Asset and treasury buttons

Phase 2, Sprint 1 (Productivity)
├── Bulk action toolbars for all tables
├── Dashboard quick action cards
├── Keyboard shortcuts
├── Floating quick action button (FAB)
└── Kitchen stores full button set

Phase 2, Sprint 2 (Polish)
├── Search-to-form command palette
├── Audit & compliance action buttons
├── Sync & backup management buttons
├── Breadcrumb contextual actions
└── Tooltip guidance on buttons
```

---

## Appendix A: Complete Form Accessibility Checklist

| # | Form ID | Form Name | Has Primary Button | Has Detail Button | Has Row Action | Has Quick Action | Has Bulk Action | Status |
|---|---------|-----------|-------------------|-------------------|---------------|-----------------|----------------|--------|
| 1 | AUTH-001 | Sign In | ✅ | — | — | — | — | ✅ |
| 2 | AUTH-002 | Create User Account | ✅ | — | — | — | — | ✅ |
| 3 | AUTH-003 | Change Password | ✅ | — | — | — | — | ✅ |
| 4 | AUTH-004 | My Profile | ✅ | — | — | — | — | ✅ |
| 5 | AUTH-005 | Role Permissions | ✅ | ✅ | ✅ | — | — | ✅ |
| 6 | INST-001 | Institution Settings | ✅ | — | — | — | — | ✅ |
| 7 | INST-002 | Manage Campuses | ✅ | — | ✅ | — | — | ✅ |
| 8 | INST-003 | Academic Year Config | ✅ | — | ✅ | — | — | ✅ |
| 9 | INST-004 | Classes & Streams | ✅ | — | ✅ | — | — | ✅ |
| 10 | INST-005 | Chart of Accounts | ✅ | — | ✅ | — | — | ✅ |
| 11 | INST-006 | Bank Accounts | ✅ | — | ✅ | — | — | ✅ |
| 12 | INST-007 | Departments | ✅ | — | ✅ | — | — | ✅ |
| 13 | INST-008 | Business Policy Rules | ✅ | ✅ | ✅ | — | — | ✅ |
| 14 | STU-001 | Register New Student | ✅ | — | ✅ | ✅ | — | ✅ |
| 15 | STU-002 | Register Family/Guardian | ✅ | ✅ | — | — | — | ✅ |
| 16 | STU-003 | Transfer Student | — | ✅ | ✅ | — | — | ✅ |
| 17 | STU-004 | Withdraw / Exit | — | ✅ | ✅ | — | — | ✅ |
| 18 | STU-005 | Change Student Status | — | ✅ | ✅ | — | — | ✅ |
| 19 | STU-006 | End-of-Year Promotion | — | — | — | — | ✅ | ✅ |
| 20 | STU-007 | Family Financial Summary | — | ✅ | — | — | — | ✅ |
| 21 | STU-008 | Bulk Student Import | ✅ | — | — | — | — | ✅ |
| 22 | STU-009 | Student Directory | ✅ (view) | — | — | — | — | ✅ |
| 23 | FEE-001 | Create / Edit Fee Rule | ✅ | — | ✅ | — | — | ✅ |
| 24 | FEE-002 | Fee Discount Rule | ✅ | ✅ | ✅ | — | — | ✅ |
| 25 | FEE-003 | Preview Fee Schedule | ✅ | — | ✅ | — | — | ✅ |
| 26 | FEE-004 | Generate Invoices | ✅ | — | — | — | ✅ | ✅ |
| 27 | FEE-005 | Fee Waiver Request | — | ✅ | — | — | — | ✅ |
| 28 | FEE-006 | Fee Template | ✅ | — | ✅ | — | — | ✅ |
| 29 | FEE-007 | Fee Rule Adjustment | — | ✅ | ✅ | — | — | ✅ |
| 30 | FEE-008 | Fee Structure Report | ✅ (view) | — | — | — | — | ✅ |
| 31 | INV-001 | Create Student Invoice | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| 32 | INV-002 | Edit Invoice | — | ✅ | ✅ | — | — | ✅ |
| 33 | INV-003 | Cancel Invoice | — | ✅ | ✅ | — | ✅ | ✅ |
| 34 | INV-004 | Issue Credit Note | — | ✅ | ✅ | — | — | ✅ |
| 35 | INV-005 | Issue Debit Note | — | ✅ | ✅ | — | — | ✅ |
| 36 | INV-006 | Invoice Register | ✅ (view) | — | — | — | — | ✅ |
| 37 | PAY-001 | Record Payment | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| 38 | PAY-002 | Payment Reversal | — | ✅ | ✅ | — | — | ✅ |
| 39 | PAY-003 | Import MoMo Payments | ✅ | — | — | — | — | ✅ |
| 40 | PAY-004 | Import Bank Statement | ✅ | — | — | ✅ | — | ✅ |
| 41 | PAY-005 | Allocate Unapplied | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| 42 | PAY-006 | Receipt Reprint/Email | — | ✅ | ✅ | — | ✅ | ✅ |
| 43 | PAY-007 | Payment Register | ✅ (view) | — | — | — | — | ✅ |
| 44 | COL-001 | Create Payment Plan | ✅ | ✅ | ✅ | — | — | ✅ |
| 45 | COL-002 | Log Follow-Up | ✅ | — | ✅ | — | ✅ | ✅ |
| 46 | COL-003 | Generate Demand Letter | ✅ | — | ✅ | — | ✅ | ✅ |
| 47 | COL-004 | Aging Bucket Settings | ✅ | — | — | — | — | ✅ |
| 48 | COL-005 | Bad Debt Write-Off | — | — | ✅ | — | — | ✅ |
| 49 | COL-006 | Collections Dashboard | ✅ (view) | — | — | — | — | ✅ |
| 50 | TRN-001 | Create / Edit Route | ✅ | — | ✅ | — | — | ✅ |
| 51 | TRN-002 | Assign Student to Route | — | ✅ | ✅ | — | — | ✅ |
| 52 | TRN-003 | Bulk Assign Transport | ✅ | — | — | — | ✅ | ✅ |
| 53 | TRN-004 | Remove from Transport | — | — | ✅ | — | — | ✅ |
| 54 | TRN-005 | Transport Report | ✅ (view) | — | — | — | — | ✅ |
| 55 | INV-S01 | Create/Edit Inventory Item | ✅ | — | ✅ | — | — | ✅ |
| 56 | INV-S02 | Receive Stock | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| 57 | INV-S03 | Issue Stock | ✅ | ✅ | ✅ | — | — | ✅ |
| 58 | INV-S04 | Stock Count Adjustment | — | ✅ | ✅ | — | — | ✅ |
| 59 | INV-S05 | Allocate to Class | — | ✅ | — | — | ✅ | ✅ |
| 60 | INV-S06 | Inventory Report | ✅ (view) | — | — | — | ✅ | ✅ |
| 61 | GL-001 | Manual Journal Entry | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| 62 | GL-002 | Reverse Journal Entry | — | ✅ | ✅ | — | — | ✅ |
| 63 | GL-003 | Accounting Periods | ✅ | — | ✅ | — | — | ✅ |
| 64 | GL-004 | Recurring Journal Template | ✅ | — | ✅ | — | — | ✅ |
| 65 | GL-005 | Bank Reconciliation | ✅ | — | ✅ | ✅ | — | ✅ |
| 66 | GL-006 | Trial Balance Filter | ✅ (view) | — | — | — | — | ✅ |
| 67 | GL-007 | Income Statement / P&L | ✅ (view) | — | — | — | — | ✅ |
| 68 | GL-008 | Balance Sheet | ✅ (view) | — | — | — | — | ✅ |
| 69 | HR-001 | Register Employee | ✅ | — | ✅ | — | — | ✅ |
| 70 | HR-002 | Salary Grade/Structure | — | ✅ | ✅ | — | — | ✅ |
| 71 | HR-003 | Employee Deduction | — | ✅ | ✅ | — | — | ✅ |
| 72 | HR-004 | Process Monthly Payroll | ✅ | — | — | ✅ | ✅ | ✅ |
| 73 | HR-005 | Employee Payslip | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| 74 | HR-006 | Reverse Payroll Run | — | — | ✅ | — | — | ✅ |
| 75 | HR-007 | Deduction Type | ✅ | — | ✅ | — | — | ✅ |
| 76 | HR-008 | Terminate Employee | — | ✅ | ✅ | — | — | ✅ |
| 77 | AP-001 | Register Supplier | ✅ | — | ✅ | ✅ | — | ✅ |
| 78 | AP-002 | Enter Supplier Bill | ✅ | ✅ | ✅ | — | — | ✅ |
| 79 | AP-003 | Supplier Payment Run | ✅ | — | — | — | ✅ | ✅ |
| 80 | AP-004 | Pay Supplier | — | ✅ | ✅ | — | — | ✅ |
| 81 | AP-005 | Reverse Supplier Payment | — | ✅ | ✅ | — | — | ✅ |
| 82 | AP-006 | AP Aging | ✅ (view) | — | — | — | — | ✅ |
| 83 | AP-007 | Purchase Order | ✅ | ✅ | — | — | — | ✅ |
| 84 | TRS-001 | Inter-Bank Transfer | ✅ | — | ✅ | — | — | ✅ |
| 85 | TRS-002 | Cash Flow Forecast | ✅ | — | — | — | — | ✅ |
| 86 | TRS-003 | Petty Cash Voucher | ✅ | — | — | — | — | ✅ |
| 87 | TRS-004 | Replenish Petty Cash | — | — | ✅ | — | — | ✅ |
| 88 | TRS-005 | Treasury Overview | ✅ (view) | — | — | — | — | ✅ |
| 89 | FA-001 | Register Fixed Asset | ✅ | — | ✅ | — | — | ✅ |
| 90 | FA-002 | Monthly Depreciation Run | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| 91 | FA-003 | Dispose Fixed Asset | — | ✅ | ✅ | — | — | ✅ |
| 92 | FA-004 | Transfer Asset Location | — | ✅ | ✅ | — | — | ✅ |
| 93 | FA-005 | Asset Register Report | ✅ (view) | — | — | — | ✅ | ✅ |
| 94 | BDG-001 | Create Annual Budget | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| 95 | BDG-002 | Revise Budget | — | ✅ | ✅ | — | — | ✅ |
| 96 | BDG-003 | Budget vs Actual | ✅ | ✅ | ✅ | — | — | ✅ |
| 97 | BDG-004 | Inter-Line Transfer | — | ✅ | ✅ | — | — | ✅ |
| 98 | BDG-005 | Close Budget Year | — | ✅ | ✅ | — | — | ✅ |
| 99 | SCH-001 | Bursary/Scholarship App | ✅ | ✅ | ✅ | — | — | ✅ |
| 100 | SCH-002 | Approve/Reject Bursary | — | ✅ | ✅ | — | ✅ | ✅ |
| 101 | SCH-003 | Record Disbursement | — | ✅ | ✅ | — | — | ✅ |
| 102 | SCH-004 | Bursary Report | ✅ (view) | — | — | — | — | ✅ |
| 103 | KIT-001 | Kitchen Item Master | ✅ | — | ✅ | — | — | ✅ |
| 104 | KIT-002 | Kitchen Stock Receipt | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| 105 | KIT-003 | Kitchen Issue Requisition | ✅ | — | ✅ | — | — | ✅ |
| 106 | KIT-004 | Kitchen Stock Issue | ✅ | ✅ | ✅ | — | — | ✅ |
| 107 | KIT-005 | Daily Consumption | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| 108 | KIT-006 | Kitchen Return | — | ✅ | ✅ | — | — | ✅ |
| 109 | KIT-007 | Kitchen Wastage/Loss | — | ✅ | ✅ | — | — | ✅ |
| 110 | KIT-008 | Physical Stock Count | ✅ | — | ✅ | — | ✅ | ✅ |
| 111 | KIT-009 | Kitchen Menu Planning | ✅ | — | — | — | — | ✅ |
| 112 | KIT-010 | Kitchen Budget Planning | ✅ | — | — | — | — | ✅ |
| 113 | KIT-011 | Kitchen Stock Adjustment | — | ✅ | ✅ | — | — | ✅ |

**Result: 113 / 113 forms have at least one defined access button = 100% coverage ✅**

---

## Appendix B: Keyboard Shortcuts Reference (Phase 2)

| Shortcut | Action | Form |
|----------|--------|------|
| `Ctrl+Shift+S` | New Student | STU-001 |
| `Ctrl+Shift+I` | New Invoice | INV-001 |
| `Ctrl+Shift+P` | Record Payment | PAY-001 |
| `Ctrl+Shift+B` | Capture Bank Deposit | PAY-004 |
| `Ctrl+Shift+J` | New Journal Entry | GL-001 |
| `Ctrl+Shift+E` | New Expense / Bill | AP-002 |
| `Ctrl+Shift+U` | Create Budget | BDG-001 |
| `Ctrl+Shift+R` | Start Reconciliation | GL-005 |
| `Ctrl+Shift+F` | Global Search / Command Palette | — |
| `Esc` | Close modal / form | — |
| `Ctrl+Enter` | Submit / Save form | — |

---

*End of Button-to-Form Action Map Specification*  
*MAPLE School Finance ERP — Version 1.0.0*  
*Generated: April 7, 2026*
