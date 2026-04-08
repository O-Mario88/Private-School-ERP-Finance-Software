# MAPLE ERP — Category-Based Budget Item System

**Version:** 1.0.0  
**Status:** Implementation-Grade Specification  
**Date:** April 8, 2026  
**Scope:** Structured budget planning for private schools  
**Classification:** Core Product Architecture — Budget Module

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Budget Hierarchy Model](#2-budget-hierarchy-model)
3. [Default Category Library](#3-default-category-library)
4. [Category Definitions and Item Groups](#4-category-definitions-and-item-groups)
5. [Budget Item Attributes](#5-budget-item-attributes)
6. [Sub-Item Support](#6-sub-item-support)
7. [Settings Library and Customization](#7-settings-library-and-customization)
8. [Budget Creation Workflow](#8-budget-creation-workflow)
9. [Budget Capture Forms](#9-budget-capture-forms)
10. [Approval Workflow](#10-approval-workflow)
11. [Budget vs Actual Tracking](#11-budget-vs-actual-tracking)
12. [Reporting and Analytics](#12-reporting-and-analytics)
13. [Role-Based Access Control](#13-role-based-access-control)
14. [Country and Currency Adaptability](#14-country-and-currency-adaptability)
15. [Multi-Campus Budget Support](#15-multi-campus-budget-support)
16. [Database Schema Extensions](#16-database-schema-extensions)
17. [UI/UX Specifications](#17-uiux-specifications)

---

## 1. System Overview

### 1.1 Purpose

The Category-Based Budget Item System provides a structured, hierarchical approach to school budget planning. Instead of free-text budget lines, every budget entry belongs to a predefined category → item group → item hierarchy, ensuring:

- **Consistency** — Every school using Maple ERP uses the same budget taxonomy
- **Comparability** — Budgets can be compared across campuses, years, and institutions
- **Completeness** — The default library prompts schools to budget for categories they may overlook
- **Reporting** — Category-level aggregation enables instant executive summaries

### 1.2 Design Principles

| Principle | Description |
|-----------|-------------|
| **Structured by default** | All budget items belong to a predefined category hierarchy |
| **Customizable** | Schools can add custom items within categories, but cannot delete default categories |
| **Institution-scoped** | Each institution has its own budget data; the default library is system-wide |
| **Multi-year** | Budgets are tied to fiscal years; prior-year data informs next-year planning |
| **Offline-first** | Budget creation and editing works fully offline |
| **Approval-gated** | Budgets go through a submit → review → approve workflow |
| **Country-aware** | Default items adapt to country context (e.g., NSSF in Uganda, NHIF in Kenya) |

### 1.3 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BUDGET HIERARCHY                          │
│                                                              │
│   Budget (fiscal year)                                       │
│   ├── Category (1 of 11)                                     │
│   │   ├── Item Group                                         │
│   │   │   ├── Budget Item                                    │
│   │   │   │   ├── Sub-Item (optional)                        │
│   │   │   │   └── Sub-Item (optional)                        │
│   │   │   └── Budget Item                                    │
│   │   └── Item Group                                         │
│   ├── Category                                               │
│   │   └── ...                                                │
│   └── ...                                                    │
│                                                              │
│   EXAMPLE:                                                   │
│   FY 2026 Budget                                             │
│   ├── 1. Staff Costs                                         │
│   │   ├── Teaching Staff                                     │
│   │   │   ├── Teacher Salaries                               │
│   │   │   │   ├── Primary Teachers (8 × 1,200,000/mo)        │
│   │   │   │   └── Secondary Teachers (6 × 1,800,000/mo)      │
│   │   │   ├── Teacher Allowances                             │
│   │   │   └── NSSF Contribution                              │
│   │   └── Non-Teaching Staff                                 │
│   │       ├── Admin Salaries                                 │
│   │       └── Support Staff Wages                            │
│   ├── 2. Academic & Curriculum                               │
│   │   └── ...                                                │
│   └── ...                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Budget Hierarchy Model

### 2.1 Four-Level Hierarchy

| Level | Name | Description | Editable by Institution |
|-------|------|-------------|------------------------|
| **L1** | Category | Top-level classification (11 default) | Cannot delete defaults; can hide unused |
| **L2** | Item Group | Sub-classification within a category | Cannot delete defaults; can add custom groups |
| **L3** | Budget Item | Specific line item for budget entry | Can add/edit/deactivate; some defaults provided |
| **L4** | Sub-Item | Optional breakdown of a budget item | Fully customizable |

### 2.2 Rules

| Rule | Description |
|------|-------------|
| **H1** | Every budget must have at least one category with at least one item |
| **H2** | Default categories cannot be deleted, only hidden |
| **H3** | Default item groups cannot be deleted, only hidden |
| **H4** | Custom item groups inherit their parent category's code prefix |
| **H5** | Budget items must belong to exactly one item group |
| **H6** | Sub-items are optional; when present, the parent item's amount is the sum of sub-items |
| **H7** | Item codes follow the pattern: `CC-GG-III` (Category-Group-Item) |
| **H8** | Categories are numbered 01–11 (+ 12–19 reserved for institution custom categories) |

---

## 3. Default Category Library

### 3.1 The Eleven Default Categories

| Code | Category Name | Description | Typical % of School Budget |
|------|--------------|-------------|---------------------------|
| **01** | Staff Costs | All employee compensation, benefits, and statutory contributions | 45–65% |
| **02** | Academic & Curriculum | Teaching materials, textbooks, exams, curriculum development | 5–10% |
| **03** | Student Welfare & Activities | Co-curricular, sports, clubs, student health, counselling | 3–6% |
| **04** | Facilities & Maintenance | Building repairs, utilities, cleaning, groundskeeping | 8–15% |
| **05** | Administration & Office | Office supplies, communication, legal, audit, insurance | 4–8% |
| **06** | ICT & Technology | Computers, software, internet, digital learning tools | 2–5% |
| **07** | Transport | Fleet maintenance, fuel, driver costs, route operations | 3–8% |
| **08** | Food & Kitchen | Kitchen supplies, food procurement, catering staff, equipment | 5–12% |
| **09** | Capital Expenditure | Land, buildings, major equipment, furniture | 5–15% (varies) |
| **10** | Financial & Statutory | Taxes, licenses, bank charges, depreciation provisions | 2–5% |
| **11** | Contingency & Reserves | Emergency fund, unplanned expenses, strategic reserve | 2–5% |

---

## 4. Category Definitions and Item Groups

### 4.1 Category 01 — Staff Costs

**Description:** All employee-related expenditure including salaries, wages, allowances, statutory contributions, training, and welfare.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Teaching Staff | 01-01 | Teacher Salaries, Teacher Allowances (housing, transport, responsibility), Overtime Pay, Substitute Teacher Pay |
| Non-Teaching Staff | 01-02 | Admin Salaries, Support Staff Wages (cleaners, guards, groundskeepers), Kitchen Staff Wages, Driver Wages |
| Management & Leadership | 01-03 | Director/Head Teacher Salary, Deputy Head Salary, Bursar Salary, Department Head Allowances |
| Statutory Contributions | 01-04 | Social Security / NSSF, Health Insurance / NHIF, Workers Compensation, Pension Fund Contributions |
| Staff Welfare & Development | 01-05 | Staff Training & CPD, Staff Medical Scheme, Staff Meals, Uniforms & Protective Gear, End-of-Year Bonuses, Gratuity Provisions |
| Recruitment | 01-06 | Advertising & Job Posts, Interview Costs, Onboarding Costs |

### 4.2 Category 02 — Academic & Curriculum

**Description:** Costs directly related to teaching, learning, examinations, and curriculum delivery.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Teaching & Learning Materials | 02-01 | Textbooks, Exercise Books & Stationery, Science Lab Supplies, Art & Craft Materials, Maps & Charts |
| Examinations | 02-02 | Internal Exam Printing, External Exam Registration Fees, Exam Materials & Supplies, Marking & Moderation |
| Library | 02-03 | Library Books, Periodicals & Subscriptions, Library Software / OPAC |
| Curriculum Development | 02-04 | Syllabus Review, Curriculum Training, Subject Panel Meetings |
| Special Needs Education | 02-05 | Learning Support Materials, Specialist Staff / Consultants, Assistive Devices |

### 4.3 Category 03 — Student Welfare & Activities

**Description:** Co-curricular activities, student health, sports, clubs, and pastoral care.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Sports & Games | 03-01 | Sports Equipment, Uniforms & Kits, Competition Fees & Travel, Coaching Fees, Field/Court Maintenance |
| Clubs & Societies | 03-02 | Club Materials, Competition Fees, Guest Speakers / Facilitators |
| Student Health | 03-03 | First Aid Supplies, School Nurse Costs, Student Health Insurance, Medical Evacuation Fund |
| Pastoral Care | 03-04 | Counselling Services, Mentorship Programs, Student Welfare Fund |
| Field Trips & Excursions | 03-05 | Transport for Trips, Entry Fees & Tickets, Accommodation & Meals, Insurance |
| Prizes & Awards | 03-06 | Academic Awards, Sports Awards, End-of-Year Prizes, Graduation Ceremony |

### 4.4 Category 04 — Facilities & Maintenance

**Description:** All costs for maintaining, repairing, and operating the physical campus.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Building Maintenance | 04-01 | Repairs & Painting, Plumbing, Roofing, Electrical Repairs, Carpentry, Pest Control |
| Utilities | 04-02 | Electricity, Water & Sewage, Internet Connectivity, Generator Fuel, Solar System Maintenance |
| Cleaning & Sanitation | 04-03 | Cleaning Supplies, Waste Disposal, Sanitary Products |
| Grounds & Landscaping | 04-04 | Gardening & Landscaping, Playground Maintenance, Fencing |
| Security | 04-05 | Security Guards, CCTV & Surveillance, Access Control Systems, Security Lighting |
| Furniture & Fittings | 04-06 | Classroom Furniture, Office Furniture, Curtains & Blinds, Notice Boards |

### 4.5 Category 05 — Administration & Office

**Description:** Non-academic operational costs for administration and governance.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Office Supplies | 05-01 | Stationery, Printing & Photocopying, Toner & Ink, Paper |
| Communication | 05-02 | Telephone & Airtime, Internet Subscription, Postal Services, Bulk SMS Service |
| Professional Services | 05-03 | Legal Fees, Audit Fees, Consultancy, Accounting Services |
| Insurance | 05-04 | Property Insurance, Liability Insurance, Vehicle Insurance, Workers Compensation |
| Marketing & Admissions | 05-05 | Advertising, Open Day Events, Prospectus Printing, Website Maintenance |
| Governance | 05-06 | Board Meeting Expenses, AGM Costs, Regulatory Compliance Fees |

### 4.6 Category 06 — ICT & Technology

**Description:** All technology-related expenditure including hardware, software, connectivity, and digital learning.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Hardware | 06-01 | Computers & Laptops, Printers & Scanners, Projectors & Screens, Networking Equipment, UPS & Power Protection |
| Software & Licensing | 06-02 | ERP / School Management Software, Antivirus & Security, Microsoft / Google Licensing, Learning Management System |
| Connectivity | 06-03 | Internet Bandwidth, Wi-Fi Infrastructure, Mobile Data for Staff |
| Digital Learning | 06-04 | E-Learning Content, Tablets / Devices for Students, Digital Whiteboard |
| IT Support | 06-05 | IT Technician Costs, Equipment Repair, Data Backup & Recovery |

### 4.7 Category 07 — Transport

**Description:** All costs associated with the school transport fleet and route operations.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Fleet Operations | 07-01 | Fuel & Lubricants, Vehicle Servicing & Repairs, Tyres, Vehicle Insurance, Road Licenses & Permits |
| Personnel | 07-02 | Driver Salaries, Conductor / Attendant Pay, Driver Training |
| Route Management | 07-03 | GPS Tracking System, Route Planning Tools, Parent Communication (SMS/calls) |
| Vehicle Acquisition | 07-04 | Bus / Van Purchase, Vehicle Lease Payments, Vehicle Depreciation Provision |

### 4.8 Category 08 — Food & Kitchen

**Description:** All costs for providing meals including procurement, kitchen operations, and dining facilities.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Food Procurement | 08-01 | Staple Foods (rice, maize, beans), Fresh Produce (vegetables, fruits), Meat & Protein, Dairy Products, Cooking Oil & Spices, Beverages |
| Kitchen Operations | 08-02 | Cooking Gas / Firewood / Charcoal, Kitchen Equipment Maintenance, Kitchen Utensils & Crockery, Kitchen Sanitation |
| Kitchen Staff | 08-03 | Cook Salaries, Kitchen Helper Wages, Kitchen Staff Uniforms |
| Dining Facilities | 08-04 | Dining Tables & Chairs, Serving Equipment, Dining Hall Maintenance |

### 4.9 Category 09 — Capital Expenditure

**Description:** Major one-off purchases and investments in long-term assets.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Buildings & Construction | 09-01 | New Classroom Block, Laboratory Construction, Dormitory Block, Administration Block, Multipurpose Hall |
| Land | 09-02 | Land Acquisition, Land Development, Boundary & Fencing |
| Major Equipment | 09-03 | School Bus Purchase, Generator, Solar Panel System, Water Tank & Borehole, Science Lab Equipment |
| Renovation | 09-04 | Building Renovation, Facility Upgrade, Campus Expansion |

### 4.10 Category 10 — Financial & Statutory

**Description:** Taxes, regulatory fees, bank charges, and financial provisions.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Taxes | 10-01 | Corporate / Income Tax, PAYE (employer portion), Withholding Tax, VAT (where applicable), Property Tax / Rates |
| Regulatory Fees | 10-02 | School Operating License, Education Board Registration, Health & Safety Inspection Fees, Environmental Compliance |
| Banking Costs | 10-03 | Bank Charges, Mobile Money Transaction Fees, Currency Conversion Costs |
| Financial Provisions | 10-04 | Bad Debt Provision, Depreciation, Amortization, Loan Interest Payments |

### 4.11 Category 11 — Contingency & Reserves

**Description:** Emergency fund, strategic reserve, and unplanned expense allocation.

| Item Group | Code | Default Budget Items |
|------------|------|---------------------|
| Emergency Fund | 11-01 | Emergency Repairs, Medical Emergencies, Natural Disaster Response |
| Strategic Reserve | 11-02 | Growth Reserve, Scholarship Fund Reserve, Technology Upgrade Reserve |
| Miscellaneous | 11-03 | Unclassified Expenses, Rounding Adjustments |

---

## 5. Budget Item Attributes

### 5.1 Budget Item Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Auto | Unique identifier |
| `code` | string | Auto | Generated code: `CC-GG-III` |
| `name` | string | Yes | Display name |
| `description` | string | No | Detailed description |
| `category_id` | UUID | Yes | Parent category |
| `item_group_id` | UUID | Yes | Parent item group |
| `budget_id` | UUID | Yes | Parent budget |
| `annual_amount` | decimal | Yes | Total budgeted amount for fiscal year |
| `q1_amount` | decimal | No | Quarter 1 allocation |
| `q2_amount` | decimal | No | Quarter 2 allocation |
| `q3_amount` | decimal | No | Quarter 3 allocation |
| `q4_amount` | decimal | No | Quarter 4 allocation (or term 3) |
| `frequency` | enum | Yes | annual, quarterly, monthly, one_time, per_term |
| `unit_count` | number | No | Number of units (e.g., 12 months, 8 teachers) |
| `unit_cost` | decimal | No | Cost per unit |
| `unit_label` | string | No | Label for the unit (e.g., "months", "staff") |
| `priority` | enum | Yes | essential, important, desirable, optional |
| `notes` | string | No | Internal notes or justification |
| `is_custom` | boolean | Auto | Whether this is a custom (non-default) item |
| `is_active` | boolean | Yes | Whether this item is included in the active budget |
| `campus_id` | UUID | No | If campus-specific (null = institution-wide) |
| `prior_year_actual` | decimal | No | Last year's actual spend (auto-populated) |
| `prior_year_budget` | decimal | No | Last year's budgeted amount (auto-populated) |
| `ytd_actual` | decimal | Computed | Year-to-date actual spend |
| `variance` | decimal | Computed | `annual_amount - ytd_actual` |
| `utilization_pct` | decimal | Computed | `ytd_actual / annual_amount * 100` |

### 5.2 Budget Item Priority Levels

| Priority | Label | Description | Budget Review Rule |
|----------|-------|-------------|-------------------|
| `essential` | Essential | Non-negotiable (salaries, utilities, statutory) | Cannot be cut without board approval |
| `important` | Important | Strongly needed (textbooks, exams, maintenance) | May be reduced with head teacher approval |
| `desirable` | Desirable | Valuable but deferrable (CPD, field trips) | Can be deferred or scaled back |
| `optional` | Optional | Nice-to-have (new equipment, cosmetic upgrades) | First to be cut if revenue falls short |

### 5.3 Frequency Options

| Frequency | Description | Amount Behavior |
|-----------|-------------|-----------------|
| `annual` | Once per year | Full amount entered as annual |
| `quarterly` | Four times per year | Amount × 4 = annual |
| `monthly` | Twelve times per year | Amount × 12 = annual |
| `per_term` | Once per academic term (2 or 3) | Amount × term_count = annual |
| `one_time` | Single occurrence | Amount = annual |

---

## 6. Sub-Item Support

### 6.1 When to Use Sub-Items

Sub-items provide a detailed breakdown of a budget item. They are **optional** and most useful when:

- A budget item has distinct cost components (e.g., "Teacher Salaries" broken down by primary vs. secondary)
- A manager needs to track spending at a finer granularity
- The budget item involves multiple units or departments

### 6.2 Sub-Item Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Auto | Unique identifier |
| `parent_item_id` | UUID | Yes | Parent budget item |
| `name` | string | Yes | Sub-item label |
| `description` | string | No | Notes |
| `amount` | decimal | Yes | Sub-item amount |
| `unit_count` | number | No | Units |
| `unit_cost` | decimal | No | Per-unit cost |
| `unit_label` | string | No | Unit description |

### 6.3 Sub-Item Rules

| Rule | Description |
|------|-------------|
| **S1** | When sub-items exist, the parent item's `annual_amount` = sum of sub-item amounts |
| **S2** | The parent item's `annual_amount` is read-only when sub-items exist |
| **S3** | Sub-items cannot have their own sub-items (max 4 levels total, not 5) |
| **S4** | Deleting all sub-items converts the parent back to a simple line item |
| **S5** | Sub-items inherit the parent's frequency and priority by default, but can override |

---

## 7. Settings Library and Customization

### 7.1 Default Library

Maple ERP ships with a **Default Budget Item Library** containing all 11 categories, their item groups, and starter items. This library is:

- System-level (not institution-specific)
- Versioned (can be updated in future releases)
- Non-deletable (institutions can hide items they don't use)

### 7.2 Institution Customization

| Action | Allowed | Scope |
|--------|---------|-------|
| Add custom category (codes 12–19) | Yes | Institution-level |
| Rename a default category | No | — |
| Hide a default category | Yes | Institution-level |
| Add custom item group to any category | Yes | Institution-level |
| Rename a default item group | No | — |
| Hide a default item group | Yes | Institution-level |
| Add custom budget items | Yes | Institution-level |
| Rename a default budget item | No | — |
| Deactivate a default budget item | Yes | Per-budget |
| Set default amounts for items | Yes | Institution-level (templates) |

### 7.3 Budget Templates

Institutions can create **budget templates** — pre-filled versions of the category library with default amounts based on prior experience. Templates accelerate budget creation each year.

| Template Field | Description |
|----------------|-------------|
| Template name | e.g., "Standard Annual Budget" |
| Base year | The fiscal year this template was derived from |
| Category/item selection | Which items are active |
| Default amounts | Pre-filled amounts for each item |
| Adjustment factor | e.g., "+5%" inflation applied across all items |

---

## 8. Budget Creation Workflow

### 8.1 Step-by-Step Process

```
Step 1: Start New Budget
  ├── Select fiscal year
  ├── Select campus (or "All Campuses")
  └── Choose starting point:
      ├── A) Blank (start from default library)
      ├── B) Copy from prior year budget
      └── C) Use budget template

Step 2: Configure Categories
  ├── Review default 11 categories
  ├── Hide categories not applicable
  └── Add custom categories (if needed)

Step 3: Review Item Groups
  ├── Expand each active category
  ├── Hide item groups not needed
  └── Add custom item groups (if needed)

Step 4: Enter Budget Amounts
  ├── For each active budget item:
  │   ├── Enter annual amount OR
  │   ├── Enter unit_count × unit_cost OR
  │   ├── Enter quarterly/monthly/per-term amounts
  │   └── Set priority level
  ├── Add sub-items where needed
  └── Add custom items where needed

Step 5: Review & Validate
  ├── Category totals displayed
  ├── Percentage allocation summary
  ├── Prior year comparison (if available)
  ├── Warnings for missing essential items
  └── Warnings for unusual allocations

Step 6: Submit for Approval
  └── Budget status → SUBMITTED
```

### 8.2 Budget States

| State | Description | Editable | Next States |
|-------|-------------|----------|-------------|
| `DRAFT` | Being created/edited | Yes | SUBMITTED |
| `SUBMITTED` | Sent for approval | No (locked) | APPROVED, RETURNED |
| `RETURNED` | Sent back with comments | Yes | SUBMITTED |
| `APPROVED` | Approved and active | No | REVISED |
| `REVISED` | Mid-year revision of an approved budget | Yes | SUBMITTED |
| `CLOSED` | Fiscal year ended | No | — |

---

## 9. Budget Capture Forms

### 9.1 Category Overview Form

A summary view showing all 11 categories with total allocated amounts and percentage of total budget:

```
┌─────────────────────────────────────────────────────────┐
│  BUDGET: FY 2026       Campus: Main Campus              │
│  Status: DRAFT         Total: UGX 1,250,000,000         │
│                                                          │
│  # Category                 Allocated (UGX)    %        │
│  ─────────────────────────────────────────────────       │
│  01 Staff Costs             687,500,000       55.0%      │
│  02 Academic & Curriculum    87,500,000        7.0%      │
│  03 Student Welfare          50,000,000        4.0%      │
│  04 Facilities & Maint.     125,000,000       10.0%      │
│  05 Admin & Office           62,500,000        5.0%      │
│  06 ICT & Technology         37,500,000        3.0%      │
│  07 Transport                62,500,000        5.0%      │
│  08 Food & Kitchen           75,000,000        6.0%      │
│  09 Capital Expenditure      25,000,000        2.0%      │
│  10 Financial & Statutory    25,000,000        2.0%      │
│  11 Contingency              12,500,000        1.0%      │
│  ─────────────────────────────────────────────────       │
│  TOTAL                    1,250,000,000      100.0%      │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Category Detail Form

Expanding a category shows its item groups and individual items:

```
┌─────────────────────────────────────────────────────────────┐
│  01. STAFF COSTS                       Total: 687,500,000   │
│                                                              │
│  ▼ Teaching Staff (01-01)              Subtotal: 360,000,000 │
│    ┌──────────────────────────┬──────────┬──────────┬──────┐ │
│    │ Item                     │ Units    │ Rate     │ Total│ │
│    ├──────────────────────────┼──────────┼──────────┼──────┤ │
│    │ Teacher Salaries         │ 14 staff │ 1.5M/mo  │ 252M │ │
│    │  ├─ Primary (8)          │ 8 staff  │ 1.2M/mo  │ 115M │ │
│    │  └─ Secondary (6)        │ 6 staff  │ 1.8M/mo  │ 130M │ │
│    │ Teacher Allowances       │ 14 staff │ 200K/mo  │  34M │ │
│    │ Overtime Pay             │ lump     │          │  10M │ │
│    │ Substitute Teacher Pay   │ 12 mo    │ 500K/mo  │   6M │ │
│    └──────────────────────────┴──────────┴──────────┴──────┘ │
│                                                              │
│  ▼ Non-Teaching Staff (01-02)          Subtotal: 180,000,000 │
│    ...                                                       │
│                                                              │
│  ► Management & Leadership (01-03)     Subtotal:  72,000,000 │
│  ► Statutory Contributions (01-04)     Subtotal:  45,000,000 │
│  ► Staff Welfare & Development (01-05) Subtotal:  25,000,000 │
│  ► Recruitment (01-06)                 Subtotal:   5,500,000 │
│                                                              │
│  [+ Add Custom Item Group]                                   │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 Budget Item Entry Form

| Field | Input Type | Behavior |
|-------|-----------|----------|
| Item Name | Text (auto-filled for defaults) | Editable for custom items |
| Frequency | Dropdown: annual/quarterly/monthly/per_term/one_time | Changes amount calculation |
| Unit Count | Number | e.g., 8 teachers |
| Unit Cost | Currency | e.g., 1,200,000 per month |
| Unit Label | Text | e.g., "staff", "months" |
| Annual Amount | Currency (computed or manual) | = unit_count × unit_cost × frequency_multiplier |
| Priority | Dropdown: Essential/Important/Desirable/Optional | Defaults provided |
| Notes | Textarea | Free-text justification |
| [+ Add Sub-Items] | Button | Expands sub-item rows |

---

## 10. Approval Workflow

### 10.1 Workflow Steps

```
┌──────────┐     ┌────────────┐     ┌───────────┐     ┌──────────┐
│  DRAFT   │────►│ SUBMITTED  │────►│ APPROVED  │────►│  CLOSED  │
│          │     │            │     │           │     │          │
│ Bursar / │     │ Director / │     │ Board /   │     │ Auto at  │
│ Accountant│     │ Head       │     │ Director  │     │ year-end │
└──────────┘     └─────┬──────┘     └───────────┘     └──────────┘
                       │
                       │ Comments
                       ▼
                 ┌────────────┐
                 │ RETURNED   │──► Back to DRAFT (revise and resubmit)
                 └────────────┘
```

### 10.2 Approval Permissions

| Action | Required Role |
|--------|--------------|
| Create / edit draft budget | BURSAR, ACCOUNTANT, DIRECTOR |
| Submit for approval | BURSAR, DIRECTOR |
| Approve budget | DIRECTOR, SUPER_ADMIN |
| Return budget with comments | DIRECTOR, SUPER_ADMIN |
| Initiate mid-year revision | BURSAR (requires Director approval) |
| Close fiscal year | SUPER_ADMIN, DIRECTOR |

---

## 11. Budget vs Actual Tracking

### 11.1 Actual Spend Sources

Budget actuals are automatically populated from Maple ERP's accounting module:

| Budget Category | Actual Source |
|-----------------|--------------|
| Staff Costs | Payroll journal entries |
| Academic & Curriculum | Purchase orders + supplier invoices in these GL codes |
| Facilities & Maintenance | Expense entries posted to facility GL accounts |
| Transport | Transport-related expense entries |
| Food & Kitchen | Kitchen stores inventory consumption + invoices |
| Capital Expenditure | Asset register additions |
| All categories | Manual journal entries posted to mapped GL accounts |

### 11.2 GL Account Mapping

Each budget item can be mapped to one or more GL account codes. When transactions are posted to those accounts, the budget tracking updates automatically.

| Mapping Field | Description |
|---------------|-------------|
| `budget_item_id` | The budget item |
| `gl_account_id` | The Chart of Accounts entry |
| `mapping_type` | `primary` or `secondary` |
| `notes` | Explanation |

### 11.3 Variance Analysis

| Metric | Formula | Alert Threshold |
|--------|---------|----------------|
| Utilization % | `(YTD Actual / Annual Budget) × 100` | > 80% at Q3 = Warning |
| Variance (amount) | `Annual Budget - YTD Actual` | Negative = Over budget |
| Burn Rate | `YTD Actual / months_elapsed` | Projected annual > budget = Alert |
| Projected Year-End | `Burn Rate × 12` | If > 110% of budget = Critical |

### 11.4 Variance Alert Levels

| Level | Condition | Color | Action |
|-------|-----------|-------|--------|
| **On Track** | Utilization ≤ linear pro-rata | Green | None |
| **Warning** | Utilization 5–15% above pro-rata | Yellow | Notify budget owner |
| **Over Budget** | Utilization > 15% above pro-rata | Orange | Notify Director |
| **Critical** | Projected year-end > 110% of budget | Red | Block further spending (optional policy) |

---

## 12. Reporting and Analytics

### 12.1 Standard Budget Reports

| Report | Description | Frequency |
|--------|-------------|-----------|
| Budget Summary | Category-level totals with % allocation | On-demand |
| Budget vs Actual | Side-by-side comparison with variance | Monthly |
| Category Drill-Down | Item-level detail within a category | On-demand |
| Prior Year Comparison | This year vs last year by category/item | On-demand |
| Quarterly Review | Q1/Q2/Q3/Q4 allocation vs spend | Quarterly |
| Burn Rate Dashboard | Monthly spend rate with year-end projection | Monthly |
| Over-Budget Items | Items exceeding budget with details | On-demand |
| Under-Utilized | Items with < 50% utilization at Q3 | Quarterly |
| Campus Comparison | Same budget items compared across campuses | On-demand |
| Approval Audit Trail | Who created, submitted, approved, revised | On-demand |

### 12.2 Dashboard Widgets

| Widget | Description |
|--------|-------------|
| Total Budget vs Spend | Pie/donut chart |
| Category Breakdown | Bar chart showing allocated vs spent per category |
| Top 10 Spending Items | Ranked list of highest-spend items |
| Budget Health Score | Composite metric (% on-track items) |
| Month-over-Month Trend | Line chart of monthly spending |

---

## 13. Role-Based Access Control

### 13.1 Budget Permissions Matrix

| Role | View Budget | Create/Edit Draft | Submit | Approve | Revise | View Reports |
|------|-------------|-------------------|--------|---------|--------|-------------|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DIRECTOR | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| HEADTEACHER | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| BURSAR | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| ACCOUNTANT | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| DEPARTMENT_HEAD | Own dept only | Own dept only | ❌ | ❌ | ❌ | Own dept only |
| AUDITOR | ✅ (read) | ❌ | ❌ | ❌ | ❌ | ✅ |
| BOARD_FINANCE_VIEWER | ✅ (read) | ❌ | ❌ | ✅ | ❌ | ✅ |

---

## 14. Country and Currency Adaptability

### 14.1 Country-Specific Default Items

Some budget items vary by country. The default library adapts based on the institution's country:

| Budget Item | UG | KE | TZ | NG | GH | ZA | General |
|-------------|----|----|----|----|----|----|---------|
| NSSF Contribution | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | — |
| NHIF (Health Insurance) | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | — |
| PAYE Tax | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| UIF (Unemployment Insurance) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | — |
| NIS (National Insurance) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | — |
| SSNIT (Social Security) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | — |
| Pension Fund Contributions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Workers Compensation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| VAT | Varies | Varies | Varies | Varies | Varies | ✅ | Varies |
| Property Tax / Rates | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 14.2 Currency Behavior

Budget amounts are displayed and stored in the institution's local currency. The system:
- Uses the country template's currency settings for formatting
- Applies the correct thousand separator and decimal marks
- Does NOT perform currency conversion (single-currency per institution)

---

## 15. Multi-Campus Budget Support

### 15.1 Campus Budget Modes

| Mode | Description |
|------|-------------|
| **Consolidated** | Single budget covering all campuses (shared items only) |
| **Per-Campus** | Each campus has its own budget; institution total = sum of campus budgets |
| **Hybrid** | Some categories are institution-wide (admin, governance), others are per-campus (staff, facilities) |

### 15.2 Campus-Level Rules

| Rule | Description |
|------|-------------|
| **C1** | Every budget item has a `campus_id` (null = institution-wide) |
| **C2** | Campus budgets roll up to institution total |
| **C3** | Cross-campus comparison reports are available for like-for-like items |
| **C4** | Budget templates can be applied per-campus |
| **C5** | Approval can be per-campus or institution-wide (configurable) |

---

## 16. Database Schema Extensions

### 16.1 Budget Tables

```sql
-- Budget header
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL,
  fiscal_year TEXT NOT NULL,          -- e.g., "2026"
  name TEXT NOT NULL,                 -- e.g., "FY 2026 Annual Budget"
  status TEXT NOT NULL DEFAULT 'DRAFT',
  campus_id TEXT,                     -- null = institution-wide
  total_amount REAL DEFAULT 0,
  created_by TEXT NOT NULL,
  approved_by TEXT,
  approved_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (institution_id) REFERENCES institutions(id),
  FOREIGN KEY (campus_id) REFERENCES campuses(id)
);

-- Budget categories (defaults + custom)
CREATE TABLE IF NOT EXISTS budget_categories (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,                 -- "01", "02", ..., "11", "12"–"19" for custom
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  institution_id TEXT,                -- null = system default
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Budget item groups
CREATE TABLE IF NOT EXISTS budget_item_groups (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  code TEXT NOT NULL,                 -- "01-01", "01-02", etc.
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  institution_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES budget_categories(id)
);

-- Budget line items
CREATE TABLE IF NOT EXISTS budget_items (
  id TEXT PRIMARY KEY,
  budget_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  item_group_id TEXT NOT NULL,
  code TEXT NOT NULL,                 -- "01-01-001"
  name TEXT NOT NULL,
  description TEXT,
  annual_amount REAL NOT NULL DEFAULT 0,
  q1_amount REAL DEFAULT 0,
  q2_amount REAL DEFAULT 0,
  q3_amount REAL DEFAULT 0,
  q4_amount REAL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'annual',
  unit_count REAL,
  unit_cost REAL,
  unit_label TEXT,
  priority TEXT NOT NULL DEFAULT 'important',
  notes TEXT,
  is_custom BOOLEAN NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  campus_id TEXT,
  prior_year_actual REAL,
  prior_year_budget REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (budget_id) REFERENCES budgets(id),
  FOREIGN KEY (category_id) REFERENCES budget_categories(id),
  FOREIGN KEY (item_group_id) REFERENCES budget_item_groups(id),
  FOREIGN KEY (campus_id) REFERENCES campuses(id)
);

-- Budget sub-items
CREATE TABLE IF NOT EXISTS budget_sub_items (
  id TEXT PRIMARY KEY,
  parent_item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount REAL NOT NULL DEFAULT 0,
  unit_count REAL,
  unit_cost REAL,
  unit_label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_item_id) REFERENCES budget_items(id)
);

-- GL account mapping for actuals tracking
CREATE TABLE IF NOT EXISTS budget_gl_mappings (
  id TEXT PRIMARY KEY,
  budget_item_id TEXT NOT NULL,
  gl_account_id TEXT NOT NULL,
  mapping_type TEXT NOT NULL DEFAULT 'primary',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (budget_item_id) REFERENCES budget_items(id),
  FOREIGN KEY (gl_account_id) REFERENCES accounts(id)
);

-- Budget templates
CREATE TABLE IF NOT EXISTS budget_templates (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_year TEXT,
  adjustment_factor REAL DEFAULT 0,   -- e.g., 0.05 for +5%
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (institution_id) REFERENCES institutions(id)
);

-- Budget template items (pre-filled amounts)
CREATE TABLE IF NOT EXISTS budget_template_items (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  category_code TEXT NOT NULL,
  item_group_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  default_amount REAL NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'annual',
  unit_count REAL,
  unit_cost REAL,
  unit_label TEXT,
  priority TEXT NOT NULL DEFAULT 'important',
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (template_id) REFERENCES budget_templates(id)
);

-- Budget approval history
CREATE TABLE IF NOT EXISTS budget_approvals (
  id TEXT PRIMARY KEY,
  budget_id TEXT NOT NULL,
  action TEXT NOT NULL,               -- 'submitted', 'approved', 'returned', 'revised'
  performed_by TEXT NOT NULL,
  comments TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (budget_id) REFERENCES budgets(id)
);
```

---

## 17. UI/UX Specifications

### 17.1 Budget Module Navigation

```
Budget (sidebar)
├── Budget Dashboard         — Summary cards, charts, health score
├── Create / Edit Budget     — Step-by-step budget creation
├── Budget Library           — View/customize default categories and items
├── Budget vs Actual         — Tracking with variance analysis
├── Budget Approval          — Pending approvals queue
├── Budget Reports           — All budget reports
└── Budget Templates         — Manage templates
```

### 17.2 Key UI Patterns

| Pattern | Implementation |
|---------|---------------|
| **Accordion categories** | Categories expand/collapse to show item groups |
| **Inline editing** | Amounts are editable directly in the table |
| **Auto-calculation** | Annual amounts auto-compute from unit_count × unit_cost × frequency |
| **Progress indicators** | Each category shows a fill bar (spent vs allocated) |
| **Prior year column** | Always show last year's actual alongside this year's budget |
| **Color-coded variance** | Green (on track), yellow (warning), orange (over), red (critical) |
| **Drag-and-drop reorder** | Custom items can be reordered within their group |
| **Subtotal rows** | Item group subtotals and category totals auto-sum |
| **Percentage bars** | Each category shows its % of total budget |
| **Print-friendly** | Budget summary generates a clean PDF with institution branding |

### 17.3 Responsive Behavior

| Screen Size | Behavior |
|-------------|----------|
| Desktop (≥1280px) | Full table with all columns visible |
| Tablet (768–1279px) | Collapsible columns; priority/notes hidden by default |
| Small (< 768px) | Card-based view per budget item; accordion navigation |

---

*End of Category-Based Budget Item System Specification*
