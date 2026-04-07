# MAPLE School Finance ERP — KITCHEN STORES & ACCOUNTABILITY SPECIFICATION

**Version:** 1.0.0
**Last Updated:** 2026-04-07
**Country Context:** Uganda (UGX, private schools, offline-first desktop ERP)
**Parent Module:** Inventory
**Sub-module Position:** Inventory → Kitchen Stores

---

## Table of Contents

1. [Kitchen Inventory Feature Overview](#1-kitchen-inventory-feature-overview)
2. [How Kitchen Stores Fits Inside Inventory Module](#2-how-kitchen-stores-fits-inside-inventory-module)
3. [Core Kitchen Accountability Principles](#3-core-kitchen-accountability-principles)
4. [Kitchen Item Master Design](#4-kitchen-item-master-design)
5. [Kitchen Forms and Data Capture](#5-kitchen-forms-and-data-capture)
6. [Kitchen Workflow Design](#6-kitchen-workflow-design)
7. [Stock Movement Logic](#7-stock-movement-logic)
8. [Consumption and Variance Logic](#8-consumption-and-variance-logic)
9. [Costing and Budget Logic](#9-costing-and-budget-logic)
10. [Reports and Dashboards](#10-reports-and-dashboards)
11. [Roles and Permissions](#11-roles-and-permissions)
12. [Offline-First Behavior](#12-offline-first-behavior)
13. [Alerts, Controls, and Audit Rules](#13-alerts-controls-and-audit-rules)
14. [UI/UX Requirements](#14-uiux-requirements)
15. [Phase 1 vs Phase 2 Recommendations](#15-phase-1-vs-phase-2-recommendations)
16. [Risks and Control Measures](#16-risks-and-control-measures)

---

## 1. Kitchen Inventory Feature Overview

### 1.1 Purpose

Kitchen Stores & Accountability is a **dedicated sub-module** under Inventory that provides complete control over food items and kitchen consumables from the moment they are purchased through to the point of actual consumption in meals. It is purpose-built for private schools in Uganda where:

- Boarding schools serve 3 meals daily to hundreds of students
- Food is one of the largest recurring costs after salaries
- Storekeepers handle high volumes of perishable and bulk commodities
- Management needs visibility into food budgets, daily costs, and waste
- Accountability gaps in kitchen stores are a common source of fraud and loss

### 1.2 What This Module Does

| Capability | Description |
|-----------|-------------|
| **Track food from gate to plate** | Full chain: Purchase → Store Receipt → Storeroom → Requisition → Issue → Kitchen → Meal → Leftover/Waste |
| **Enforce storekeeper accountability** | Every gram issued must be justified with a requisition, meal reference, and consumption record |
| **Control meal costs** | Per-student per-meal costing, budget vs actual, item cost trends |
| **Detect anomalies** | Automatic variance analysis, threshold alerts, unusual patterns |
| **Support physical counts** | Regular stock counts compared against system balance with variance explanations |
| **Plan and budget** | Menu planning → expected ingredient quantities → budget estimation → actual comparison |
| **Operate fully offline** | All forms, dashboards, reports work without internet. Sync for backup and monitoring. |

### 1.3 Scope Boundary

| In Scope | Out of Scope |
|----------|-------------|
| Food items and kitchen consumables | Student-issued inventory (uniforms, books) — separate sub-module |
| Kitchen cleaning/hygiene materials (soap, detergent) | General school supplies (stationery, lab equipment) |
| Cooking fuel (charcoal, firewood) if tracked | Vehicle fuel — belongs to Transport |
| Food purchase and supplier tracking | Full procurement module — Kitchen uses simplified receipt |
| Meal costing | Canteen/tuckshop POS sales — Phase 2 |
| Kitchen-level budgeting | School-wide budgeting — Budget module handles that, Kitchen feeds data |
| Kitchen wastage and loss | General asset write-off — Assets module |

### 1.4 Key Stakeholders

| Role | Interaction |
|------|------------|
| Storekeeper | Primary operator: receives stock, issues stock, records counts |
| Kitchen Manager / Matron / Catering Officer | Raises requisitions, records daily consumption, records waste |
| Bursar | Approves requisitions, monitors costs, reviews accountability reports |
| Accountant | Reviews cost postings, processes food purchase bills |
| Headteacher | Reviews kitchen dashboard, oversees food budget |
| Director / Proprietor | Strategic oversight: cost per student, budget compliance, fraud detection |
| Procurement Officer | Manages supplier relations, price negotiation |
| Auditor | Verifies stock counts, reviews movement trails, variance analysis |

---

## 2. How Kitchen Stores Fits Inside Inventory Module

### 2.1 Inventory Module Structure (Revised)

The Inventory module is now organized into **five** major sub-areas, with Kitchen Stores as a fully featured work center:

```
Inventory Module
│
├── 1. General Stock
│   ├── Item Master (non-kitchen)
│   ├── Stock Receipts
│   ├── Stock Issues
│   ├── Stock Transfers
│   ├── Stock Adjustments
│   └── General Stock Reports
│
├── 2. Student Issue Inventory
│   ├── Student Item Catalog
│   ├── Student Issue Notes
│   ├── Issue Returns
│   ├── Student Issue History
│   └── Student Issue Reports
│
├── 3. Kitchen Stores  ◀━━━━━ THIS SPECIFICATION
│   ├── Kitchen Dashboard
│   ├── Kitchen Item Master
│   ├── Kitchen Stock Receipt
│   ├── Kitchen Issue Requisition
│   ├── Kitchen Stock Issue
│   ├── Daily Consumption & Accountability
│   ├── Kitchen Returns
│   ├── Kitchen Wastage / Loss
│   ├── Kitchen Physical Stock Count
│   ├── Kitchen Stock Adjustment
│   ├── Menu Planning
│   ├── Kitchen Budget Planning
│   └── Kitchen Reports
│
├── 4. Reorder & Supply
│   ├── Reorder Alerts
│   ├── Supplier Price Tracking
│   └── Purchase Requests
│
└── 5. Stock Counts & Reconciliation
    ├── Count Schedules
    ├── Count Entry
    ├── Variance Analysis
    └── Count Reports
```

### 2.2 Navigation Structure

```
Sidebar → Inventory
  ├── Dashboard (overall inventory overview)
  ├── General Stock
  ├── Student Issues
  ├── Kitchen Stores ──────────────────────────────┐
  │     ├── Kitchen Dashboard                       │
  │     ├── Item Master                             │
  │     ├── Receipts                                │
  │     ├── Requisitions                            │
  │     ├── Issues                                  │
  │     ├── Daily Consumption                       │
  │     ├── Wastage & Loss                          │
  │     ├── Returns                                 │
  │     ├── Stock Count                             │
  │     ├── Menu Planning                           │
  │     ├── Budget                                  │
  │     └── Kitchen Reports                         │
  ├── Reorder & Supply
  └── Inventory Reports (cross-category)
```

### 2.3 Data Isolation Rules

| Rule | Detail |
|------|--------|
| Kitchen items use the same `inventory_items` table | Differentiated by `item_area = 'KITCHEN'` |
| Kitchen stock movements share the `stock_movements` table | Differentiated by `movement_area = 'KITCHEN'` and dedicated kitchen-specific movement types |
| Kitchen has dedicated tables for | `kitchen_requisitions`, `kitchen_consumption`, `kitchen_wastage`, `kitchen_menu_plans`, `kitchen_budget` |
| Institution/campus scoping | All kitchen data is scoped by `institution_id` and optionally `campus_id` (see INSTITUTION_CONTEXT spec) |
| Kitchen items are excluded from | Student Issue reports, General Stock issue forms |
| General items are excluded from | Kitchen requisition forms, Kitchen consumption forms |

### 2.4 Shared Infrastructure

Kitchen Stores shares these existing Inventory capabilities:

| Capability | Shared With |
|-----------|------------|
| Supplier master | All inventory areas |
| Unit of measure catalog | All inventory areas |
| Costing engine (weighted average) | All inventory areas |
| Audit trail framework | All ERP modules |
| Role/permission engine | All ERP modules |
| Offline sync mechanism | All ERP modules |
| Institution/campus context | All ERP modules |
| Print/PDF engine (see PRINT_PDF_BRANDING spec) | All ERP modules |

---

## 3. Core Kitchen Accountability Principles

### 3.1 The Fourteen Accountability Rules

Every design decision in Kitchen Stores is governed by these rules:

| # | Principle | Implementation |
|---|----------|----------------|
| 1 | **Every food item received into store must be recorded** | Kitchen Stock Receipt Form is mandatory. No stock enters the system balance without a receipt. |
| 2 | **Every food item issued out of store must be recorded** | Kitchen Stock Issue Form is mandatory. No stock leaves the storeroom without an issue record. |
| 3 | **Every issue must have a reason or meal context** | Issue form requires linked requisition, meal type, and intended use date. |
| 4 | **Every food item consumed must be tied to a meal/day/population** | Daily Consumption Form links ingredients to meal type, date, and headcount (students, staff, visitors). |
| 5 | **Every loss or wastage must be recorded separately** | Wastage/Loss Form captures type (spoilage, spillage, pest, expiry, theft suspicion), quantity, value, and reason. Never buried inside consumption. |
| 6 | **Every return to store must be recorded** | Kitchen Return Form records item, quantity, condition, and linked issue. Storekeeper accepts and balance is restored. |
| 7 | **Physical stock counts must be compared to system balances** | Kitchen Physical Stock Count Form shows system balance vs physical balance. Variance is mandatory to explain. |
| 8 | **Variances must be explained** | Every variance (planned vs actual, issued vs consumed, system vs physical) requires a reason code or narrative before the record can be saved. |
| 9 | **Storekeeper accountability must be evidence-based** | Storekeeper Accountability Report compares: received − issued − wasted − adjusted = expected balance vs physical balance. Unexplained gaps are flagged. |
| 10 | **Food budgeting must be based on actual usage data** | Kitchen Budget Planning Form uses historical consumption data to project future needs. Budget vs actual is tracked at item and category level. |
| 11 | **Meal cost visibility must be possible** | System calculates cost per meal type per day, cost per student per meal, cost per student per day/week/term. |
| 12 | **Unusual consumption patterns must be detectable** | System flags items where actual consumption exceeds planned by >15% (configurable threshold). Repeated variances on the same item trigger escalating alerts. |
| 13 | **Item movement must be traceable from purchase to consumption** | Full audit chain: Purchase Order → Supplier Invoice → Kitchen Receipt → Storeroom Balance → Requisition → Issue → Consumption. Every step has who, when, what, how much. |
| 14 | **Kitchen inventory must support institution-level and campus-level control** | Multi-campus schools can track kitchen stores per campus. Single-campus schools default to institution-level. Campus isolation rules per INSTITUTION_CONTEXT spec apply. |

### 3.2 Accountability Equation

For any item over any period:

```
Opening Balance
  + Quantity Received (from purchases)
  + Quantity Returned (from kitchen)
  + Positive Adjustments (approved)
  ─ Quantity Issued (to kitchen)
  ─ Wastage / Loss (recorded)
  ─ Negative Adjustments (approved)
  ═══════════════════════════════════
  = Expected Closing Balance (system)

Physical Count Balance ─ Expected Closing Balance = VARIANCE

Variance must be ZERO or EXPLAINED.
```

### 3.3 Accountability Frequency

| Action | Frequency |
|--------|-----------|
| Stock receipt recording | On every delivery (same day) |
| Requisition | Before every meal preparation (daily) |
| Stock issue recording | Same day as requisition approval |
| Daily consumption recording | End of each day (or after each meal for strict control) |
| Wastage/loss recording | Immediately when discovered |
| Physical stock count — perishables | Weekly (recommended) |
| Physical stock count — dry goods | Bi-weekly or monthly |
| Full kitchen stock count | End of term (mandatory) |
| Accountability review | Weekly by Bursar, monthly by Director |
| Budget review | Monthly and end-of-term |

---

## 4. Kitchen Item Master Design

### 4.1 Kitchen Item Record

| # | Field | Type | Required | Validation | Default | Notes |
|---|-------|------|:--------:|------------|---------|-------|
| 1 | Item code | text | ✓ | Auto-generated: `KIT-{category_prefix}-{seq}` (e.g., `KIT-GRN-001`) | Auto | Unique within institution |
| 2 | Item name | text | ✓ | 2-100 chars | — | e.g., "Beans (dry)" |
| 3 | Item category | select | ✓ | From category list (§4.2) | — | |
| 4 | Description | textarea | — | Max 500 chars | — | Additional details |
| 5 | Purchase unit | select | ✓ | From UOM catalog | — | Unit bought from supplier (e.g., "sack 100kg") |
| 6 | Store unit | select | ✓ | From UOM catalog | — | Unit tracked in storeroom (e.g., "kg") |
| 7 | Issue unit | select | ✓ | From UOM catalog | — | Unit issued to kitchen (e.g., "kg") |
| 8 | Consumption unit | select | ✓ | From UOM catalog | — | Unit measured in consumption (e.g., "kg") |
| 9 | Purchase-to-store conversion factor | decimal | ✓ | >0 | 1 | e.g., 1 sack = 100 kg → factor = 100 |
| 10 | Store-to-issue conversion factor | decimal | ✓ | >0 | 1 | Usually 1 if same unit |
| 11 | Issue-to-consumption conversion factor | decimal | ✓ | >0 | 1 | Usually 1 if same unit |
| 12 | Pack size | text | — | Free text | — | e.g., "100kg sack", "20L jerrycan" |
| 13 | Minimum stock level | decimal | ✓ | ≥0 | 0 | In store units |
| 14 | Maximum stock level | decimal | — | >min or null | — | In store units |
| 15 | Reorder level | decimal | ✓ | ≥min_stock | — | When to trigger reorder alert |
| 16 | Reorder quantity | decimal | — | >0 or null | — | Suggested purchase qty (purchase units) |
| 17 | Preferred supplier | lookup | — | From supplier master | — | |
| 18 | Standard cost | decimal | — | ≥0 | 0 | Expected/benchmark cost per store unit (UGX) |
| 19 | Current average cost | decimal | read-only | System-calculated | 0 | Weighted average cost per store unit (UGX) |
| 20 | Standard consumption per student per meal | decimal | — | ≥0 or null | — | Benchmark in consumption units. e.g., beans = 0.15 kg/student/meal |
| 21 | Standard consumption meal type | select | — | Breakfast / Lunch / Supper / Any | — | Which meal the benchmark applies to |
| 22 | Track expiry date | toggle | — | boolean | false | If true, receipt form requires expiry date |
| 23 | Track batch/lot | toggle | — | boolean | false | If true, receipt form requires batch number |
| 24 | Perishable flag | toggle | — | boolean | false | If true, included in perishable count schedule |
| 25 | Active status | toggle | — | boolean | true | Inactive items hidden from forms but retained in history |
| 26 | Notes | textarea | — | Max 500 chars | — | |

### 4.2 Item Categories

| Code | Category | Examples |
|------|----------|----------|
| GRN | Grains | Beans, green grams, peas, rice, maize grain |
| FLR | Flour | Maize flour, posho flour, cassava flour, wheat flour |
| OIL | Oils & Fats | Cooking oil, margarine, ghee |
| VEG | Vegetables | Cabbages, onions, tomatoes, green peppers, carrots, eggplant |
| PLT | Plantains & Roots | Matooke, sweet potatoes, Irish potatoes, cassava |
| PRO | Proteins | Beef, goat meat, chicken, fish, eggs, silver fish (mukene) |
| DRY | Dairy & Beverages | Milk, tea leaves, cocoa |
| CON | Condiments & Spices | Salt, curry powder, royco, tomato paste |
| BKF | Breakfast Items | Bread, sugar, margarine, porridge flour |
| CLN | Kitchen Cleaning | Dish soap, detergent, scouring pads, bin liners |
| FUL | Kitchen Fuel | Charcoal, firewood |
| OTH | Other Kitchen Consumables | Matches, aluminium foil, cling film |

### 4.3 Unit of Measure Catalog (Kitchen Subset)

| UOM Code | Name | Base Type |
|----------|------|-----------|
| KG | Kilograms | Weight |
| G | Grams | Weight |
| L | Litres | Volume |
| ML | Millilitres | Volume |
| PC | Pieces | Count |
| TY | Trays | Count |
| SK | Sacks | Package |
| JC | Jerrycans | Package |
| BN | Bundles | Package |
| BX | Boxes | Package |
| CT | Crates | Package |
| TN | Tins | Package |
| PKT | Packets | Package |
| RL | Rolls | Package |
| BG | Bags | Package |

### 4.4 Unit Conversion Examples

| Item | Purchase Unit | Factor | Store Unit | Factor | Issue Unit | Factor | Consumption Unit |
|------|:------------:|:------:|:----------:|:------:|:----------:|:------:|:----------------:|
| Cooking oil | JC (20L) | 20 | L | 1 | L | 1 | L |
| Beans | SK (100kg) | 100 | KG | 1 | KG | 1 | KG |
| Sugar | SK (50kg) | 50 | KG | 1 | KG | 1 | KG |
| Posho flour | SK (50kg) | 50 | KG | 1 | KG | 1 | KG |
| Rice | SK (25kg) | 25 | KG | 1 | KG | 1 | KG |
| Salt | SK (25kg) | 25 | KG | 1 | KG | 1 | KG |
| Bread | PC | 1 | PC | 1 | PC | 1 | PC |
| Tomatoes | CT (crate) | 1 | CT | 1 | KG | varied | KG |
| Eggs | TY (30 pcs) | 30 | PC | 1 | PC | 1 | PC |
| Charcoal | SK | 1 | SK | 1 | SK | 1 | SK |
| Milk | L | 1 | L | 1 | L | 1 | L |
| Cabbages | PC | 1 | PC | 1 | PC | 1 | PC |

### 4.5 Standard Consumption Benchmarks (Uganda Private School Defaults)

These are configurable starting points — each school adjusts to its reality:

| Item | Benchmark | Meal | Notes |
|------|-----------|------|-------|
| Beans (dry) | 0.12 kg / student / meal | Lunch | ~80g cooked per serving |
| Posho flour | 0.15 kg / student / meal | Lunch/Supper | |
| Rice | 0.10 kg / student / meal | Lunch | |
| Maize flour (porridge) | 0.08 kg / student / meal | Breakfast | |
| Sugar | 0.02 kg / student / meal | Breakfast | For porridge/tea |
| Tea leaves | 0.003 kg / student / meal | Breakfast | |
| Cooking oil | 0.02 L / student / meal | Lunch/Supper | |
| Salt | 0.005 kg / student / meal | Any | |
| Bread | 0.5 PC / student / meal | Breakfast | Half loaf or 2 slices |
| Milk | 0.05 L / student / meal | Breakfast | For tea |
| Cabbage | 0.08 kg / student / meal | Lunch/Supper | When served |
| Meat (beef) | 0.08 kg / student / meal | Lunch | When served (typically 1-2x/week) |

These benchmarks are used to:
- Auto-calculate planned quantities from headcount
- Generate variance alerts when actual exceeds benchmark by threshold
- Support budget estimation

---

## 5. Kitchen Forms and Data Capture

### 5.1 Form KIT-001: Kitchen Item Master Form

| Property | Value |
|----------|-------|
| Form ID | KIT-001 |
| Purpose | Create, edit, and manage kitchen-specific inventory items |
| Create roles | STOREKEEPER, BURSAR, SUPER_ADMIN |
| Edit roles | STOREKEEPER, BURSAR, SUPER_ADMIN |
| View roles | All kitchen-authorized roles |
| Workflow | Create → Active. Edit → Audit logged. Deactivate → Soft delete. |

**Fields:** All fields as defined in §4.1.

**Validation rules:**
- Item code auto-generated; not editable after creation
- Category required before save
- Purchase unit, store unit, issue unit must be selected from UOM catalog
- Conversion factors must be positive decimals
- Minimum stock ≤ reorder level ≤ maximum stock (when all provided)
- Standard consumption per student requires meal type

**On Save:**
- Record created/updated with timestamp and user
- Audit log entry with old/new values
- If new item: opening balance = 0

---

### 5.2 Form KIT-002: Kitchen Stock Receipt Form

| Property | Value |
|----------|-------|
| Form ID | KIT-002 |
| Purpose | Record food/items received into kitchen store from supplier |
| Create roles | STOREKEEPER |
| Verify roles | BURSAR, HEADTEACHER |
| View roles | All kitchen-authorized roles |
| Workflow | Draft → Submitted → Verified → Posted |

**Header fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Receipt number | text | ✓ | Auto-generated: `KSR-{YYYY}-{seq}` |
| 2 | Receipt date | date | ✓ | ≤ today |
| 3 | Supplier | lookup | ✓ | From supplier master |
| 4 | Invoice/delivery reference | text | — | Max 50 chars |
| 5 | Purchase order reference | lookup | — | From PO if linked |
| 6 | Store location | select | — | Kitchen store / Cold room / Dry store |
| 7 | Received by | auto-fill | ✓ | Current user (storekeeper) |
| 8 | Verified by | lookup | — | Set when verified |
| 9 | Status | select | ✓ | Draft / Submitted / Verified / Posted |
| 10 | Notes | textarea | — | Max 500 chars |

**Line item fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Item | lookup | ✓ | From kitchen item master |
| 2 | Quantity received | decimal | ✓ | >0 |
| 3 | Purchase unit | auto-fill | ✓ | From item master |
| 4 | Converted store quantity | calculated | ✓ | = qty_received × purchase_to_store_factor |
| 5 | Unit cost (per purchase unit) | decimal | ✓ | ≥0, UGX |
| 6 | Total cost | calculated | ✓ | = qty_received × unit_cost |
| 7 | Batch/lot number | text | Conditional | Required if item.track_batch = true |
| 8 | Expiry date | date | Conditional | Required if item.track_expiry = true; must be > today |
| 9 | Line notes | text | — | Max 200 chars |

**On Post:**
- Stock balance for each item increases by converted store quantity
- Weighted average cost recalculated
- Stock movement record created: type = `KITCHEN_RECEIPT`
- Audit log entry with user, timestamp, all line details

---

### 5.3 Form KIT-003: Kitchen Issue Requisition Form

| Property | Value |
|----------|-------|
| Form ID | KIT-003 |
| Purpose | Kitchen requests food from store for a specific meal/day |
| Create roles | KITCHEN_MANAGER, MATRON, STOREKEEPER |
| Approve roles | BURSAR, HEADTEACHER, STOREKEEPER (configurable) |
| View roles | All kitchen-authorized roles |
| Workflow | Draft → Submitted → Approved → Issued (or Rejected) |

**Header fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Requisition number | text | ✓ | Auto-generated: `KRQ-{YYYY}-{seq}` |
| 2 | Requisition date | date | ✓ | ≤ today |
| 3 | Requested by | auto-fill | ✓ | Current user |
| 4 | Kitchen section | select | — | Main kitchen / Staff kitchen / Bakery / Other |
| 5 | Meal type | multi-select | ✓ | Breakfast / Lunch / Supper / All Day |
| 6 | Intended use date | date | ✓ | ≥ today |
| 7 | Intended menu | textarea | — | What meals are planned (e.g., "Posho + beans + cabbage") |
| 8 | Number of students to feed | integer | ✓ | ≥0 |
| 9 | Number of staff to feed | integer | — | ≥0, default 0 |
| 10 | Number of visitors to feed | integer | — | ≥0, default 0 |
| 11 | Total persons to feed | calculated | ✓ | students + staff + visitors |
| 12 | Approval status | select | ✓ | Pending / Approved / Partially Approved / Rejected |
| 13 | Approved by | lookup | — | Set on approval |
| 14 | Approval date | datetime | — | Set on approval |
| 15 | Rejection reason | textarea | — | Required if rejected |
| 16 | Notes | textarea | — | Max 500 chars |

**Line item fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Item | lookup | ✓ | From kitchen item master |
| 2 | Requested quantity | decimal | ✓ | >0, in issue units |
| 3 | Auto-calculated quantity | calculated | — | = total_persons × item.standard_consumption (if benchmark exists) |
| 4 | Approved quantity | decimal | — | ≤ requested, set by approver |
| 5 | Available stock | display | — | Current balance in store units |
| 6 | Line notes | text | — | |

**Auto-fill from benchmark:**
When the user selects an item and the meal type, if the item has a standard consumption benchmark for that meal type, the system auto-calculates:

```
suggested_qty = total_persons × standard_consumption_per_student
```

The user can accept or override this quantity. Override triggers a soft warning: "Requested quantity differs from standard by X%".

**On Approve:**
- Approved quantities set (may be less than requested)
- Status → Approved
- Requisition available for linking to Issue form
- Audit log entry

---

### 5.4 Form KIT-004: Kitchen Stock Issue Form

| Property | Value |
|----------|-------|
| Form ID | KIT-004 |
| Purpose | Storekeeper issues stock to kitchen against an approved requisition |
| Create roles | STOREKEEPER |
| View roles | All kitchen-authorized roles |
| Workflow | Draft → Posted |

**Header fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Issue number | text | ✓ | Auto-generated: `KIS-{YYYY}-{seq}` |
| 2 | Linked requisition | lookup | ✓ (configurable) | Must link to approved requisition. Policy may allow stand-alone issues. |
| 3 | Issue date | date | ✓ | ≤ today |
| 4 | Meal type | auto-fill | — | From linked requisition |
| 5 | Meal/use date reference | date | ✓ | From linked requisition or manual |
| 6 | Issued by | auto-fill | ✓ | Current user (storekeeper) |
| 7 | Received by | lookup | ✓ | Kitchen Manager / Matron / Cook name |
| 8 | Notes | textarea | — | Max 500 chars |

**Line item fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Item | lookup | ✓ | From kitchen item master |
| 2 | Requisitioned quantity | display | — | From linked requisition |
| 3 | Quantity issued | decimal | ✓ | >0, ≤ available stock, ≤ approved qty (if linked) |
| 4 | Issue unit | auto-fill | ✓ | From item master |
| 5 | Unit cost | auto-fill | ✓ | Current weighted average cost per store unit |
| 6 | Total issue value | calculated | ✓ | = qty_issued × unit_cost |
| 7 | Batch/lot (if tracked) | select | Conditional | From available batches |
| 8 | Line notes | text | — | |

**On Post:**
- Stock balance decreases by quantity issued (converted to store units)
- Stock movement record: type = `KITCHEN_ISSUE`
- If balance would go negative → **BLOCK** (cannot issue more than available)
- Link back to requisition updated (issued vs approved qty visible)
- Audit log entry with all details

**Stand-alone Issue (no requisition):**
If institution policy allows issues without requisitions:
- `linked_requisition` optional
- Mandatory field: `standalone_reason` (text, required, min 10 chars)
- Flagged in alerts and reports as "unlinked issue"

---

### 5.5 Form KIT-005: Daily Kitchen Consumption & Accountability Form

**This is the most critical form in the Kitchen Stores module.**

| Property | Value |
|----------|-------|
| Form ID | KIT-005 |
| Purpose | Record what was actually consumed in the kitchen for each meal, compare against planned/issued quantities |
| Create roles | KITCHEN_MANAGER, MATRON, STOREKEEPER |
| Review roles | BURSAR, HEADTEACHER |
| View roles | All kitchen-authorized roles |
| Workflow | Draft → Submitted → Reviewed (optional) |

**Header fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Consumption record ID | text | ✓ | Auto-generated: `KCN-{YYYY}-{seq}` |
| 2 | Date | date | ✓ | ≤ today |
| 3 | Meal type | select | ✓ | Breakfast / Lunch / Supper |
| 4 | Menu description | textarea | ✓ | What was actually prepared (e.g., "Rice + beans + cabbage salad") |
| 5 | Number of students fed | integer | ✓ | ≥0 |
| 6 | Number of staff fed | integer | — | ≥0, default 0 |
| 7 | Number of visitors fed | integer | — | ≥0, default 0 |
| 8 | Total persons fed | calculated | ✓ | students + staff + visitors |
| 9 | Linked requisition(s) | lookup (multi) | — | From approved requisitions for this date |
| 10 | Linked issue(s) | lookup (multi) | — | From posted issues for this date |
| 11 | Overall meal quality | select | — | Good / Satisfactory / Poor |
| 12 | Prepared by | lookup | ✓ | Cook / Kitchen Manager name |
| 13 | Reviewed by | lookup | — | Bursar / HT who reviewed |
| 14 | Review date | datetime | — | Set when reviewed |
| 15 | Notes | textarea | — | Max 500 chars |

**Line item fields (per ingredient):**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Item | lookup | ✓ | From kitchen item master |
| 2 | Planned quantity | decimal | — | From linked requisition or = total_persons × benchmark |
| 3 | Issued quantity | display | — | From linked issue(s) for this item |
| 4 | Actual quantity used | decimal | ✓ | ≥0, in consumption units |
| 5 | Returned quantity | decimal | — | ≥0, auto-links to return form if non-zero |
| 6 | Wastage quantity | decimal | — | ≥0, auto-links to wastage form if non-zero |
| 7 | Net consumed | calculated | — | = actual_used − returned − wastage |
| 8 | Variance (issued vs actual) | calculated | — | = issued_qty − actual_used |
| 9 | Variance % | calculated | — | = variance / issued_qty × 100 |
| 10 | Variance (planned vs actual) | calculated | — | = planned_qty − actual_used |
| 11 | Unit cost | auto-fill | — | Weighted average cost |
| 12 | Actual consumption cost | calculated | — | = net_consumed × unit_cost |
| 13 | Variance reason | select + text | Conditional | Required if |variance %| > threshold (default 15%) |
| 14 | Line notes | text | — | |

**Variance reason codes:**

| Code | Label |
|------|-------|
| EXTRA_VISITORS | More visitors/guests than expected |
| EXTRA_STUDENTS | More students fed than expected |
| FEWER_STUDENTS | Fewer students (some absent/away) |
| POOR_QUALITY | Item was poor quality, needed more |
| SPILLAGE | Accidental spillage during preparation |
| SPOILAGE | Item spoiled before/during cooking |
| MENU_CHANGE | Menu was changed from plan |
| WRONG_ESTIMATE | Original plan underestimated/overestimated |
| EMERGENCY | Emergency use (unplanned event) |
| THEFT_SUSPECTED | Suspected theft or unauthorized use |
| OTHER | Other — free text required |

**On Submit:**
- All consumption lines validated — actual quantities required
- Variance calculations performed automatically
- High-variance lines (> threshold) require reason before submit
- Consumption cost calculated
- Audit trail entry
- If returned quantity > 0: system prompts for Kitchen Return Form (KIT-006) creation
- If wastage quantity > 0: system prompts for Kitchen Wastage Form (KIT-007) creation

**Cost per student per meal** is calculated:
```
total_meal_cost = SUM(net_consumed × unit_cost for all ingredients)
cost_per_student = total_meal_cost / number_of_students_fed
```

---

### 5.6 Form KIT-006: Kitchen Return Form

| Property | Value |
|----------|-------|
| Form ID | KIT-006 |
| Purpose | Record unused food items returned from kitchen to store |
| Create roles | KITCHEN_MANAGER, STOREKEEPER |
| Accept roles | STOREKEEPER |
| View roles | All kitchen-authorized roles |
| Workflow | Draft → Accepted → Posted |

**Fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Return number | text | ✓ | Auto-generated: `KRT-{YYYY}-{seq}` |
| 2 | Return date | date | ✓ | ≤ today |
| 3 | Linked issue | lookup | — | From posted kitchen issues |
| 4 | Linked consumption record | lookup | — | From submitted consumption records |
| 5 | Returned by | auto-fill | ✓ | Kitchen staff |
| 6 | Accepted by | lookup | ✓ | Storekeeper |
| 7 | Notes | textarea | — | |

**Line items:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Item | lookup | ✓ | From kitchen item master |
| 2 | Quantity returned | decimal | ✓ | >0, in issue units |
| 3 | Return condition | select | ✓ | Good / Damaged / Expired / Partial Use |
| 4 | Accepted quantity | decimal | ✓ | ≤ returned. Damaged/expired may be accepted at 0 → auto-redirect to wastage |
| 5 | Line notes | text | — | |

**On Post:**
- Accepted quantity added back to stock balance (Store unit)
- Rejected/damaged quantity → system prompts Wastage Form (KIT-007)
- Stock movement: type = `KITCHEN_RETURN`
- Audit log

---

### 5.7 Form KIT-007: Kitchen Wastage / Loss Form

| Property | Value |
|----------|-------|
| Form ID | KIT-007 |
| Purpose | Record food spoilage, spillage, theft, pest damage, expiry, or any loss |
| Create roles | STOREKEEPER, KITCHEN_MANAGER |
| Approve roles | BURSAR, HEADTEACHER |
| View roles | All kitchen-authorized roles |
| Workflow | Draft → Submitted → Approved |

**Fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Loss number | text | ✓ | Auto-generated: `KWL-{YYYY}-{seq}` |
| 2 | Loss date | date | ✓ | ≤ today |
| 3 | Reported by | auto-fill | ✓ | Current user |
| 4 | Approved by | lookup | — | Set on approval |
| 5 | Approval date | datetime | — | |
| 6 | Notes | textarea | — | |

**Line items:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Item | lookup | ✓ | From kitchen item master |
| 2 | Quantity lost | decimal | ✓ | >0, in store units |
| 3 | Unit cost | auto-fill | — | Weighted average |
| 4 | Estimated loss value | calculated | — | = qty × unit_cost |
| 5 | Loss type | select | ✓ | See loss type table below |
| 6 | Reason / description | textarea | ✓ | Min 10 chars |
| 7 | Linked issue or batch | lookup | — | From issue or receipt batch |
| 8 | Evidence / supporting info | text | — | Reference to photo, report, etc. |
| 9 | Line notes | text | — | |

**Loss Types:**

| Code | Label | Severity |
|------|-------|----------|
| SPOILAGE | Food spoiled (natural) | Medium |
| EXPIRY | Expired before use | Medium |
| SPILLAGE | Accidental spillage | Low |
| PEST_DAMAGE | Pest or vermin damage | High |
| OVERCOOK | Overcooked / burned, unusable | Medium |
| THEFT_SUSPECTED | Suspected theft or unauthorized removal | Critical |
| FIRE_DAMAGE | Fire or heat damage | Critical |
| FLOODING | Water/rain damage | High |
| POWER_FAILURE | Spoiled due to power failure (cold storage) | High |
| OTHER | Other — specify | Variable |

**On Approve:**
- Stock balance decreased by quantity lost
- Stock movement: type = `KITCHEN_WASTAGE`
- Loss value recorded for cost reporting
- If loss type = `THEFT_SUSPECTED` → automatic alert to DIRECTOR, HEADTEACHER, BURSAR
- Audit log with full details

---

### 5.8 Form KIT-008: Kitchen Physical Stock Count Form

| Property | Value |
|----------|-------|
| Form ID | KIT-008 |
| Purpose | Record physical count of kitchen items and compare to system balance |
| Create roles | STOREKEEPER |
| Verify roles | BURSAR, HEADTEACHER, AUDITOR |
| Approve adjustment roles | BURSAR, DIRECTOR |
| Workflow | Count Created → Counting → Submitted → Verified → Adjustment Approved/Pending |

**Header fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Count reference | text | ✓ | Auto-generated: `KPC-{YYYY}-{seq}` |
| 2 | Count date | date | ✓ | ≤ today |
| 3 | Count type | select | ✓ | Full / Partial (category-based) / Spot check |
| 4 | Categories included | multi-select | Conditional | Required for partial counts |
| 5 | Counted by | auto-fill | ✓ | Storekeeper |
| 6 | Verified by | lookup | — | Independent verifier |
| 7 | Verification date | datetime | — | |
| 8 | Adjustment approved by | lookup | — | Bursar/Director |
| 9 | Status | select | ✓ | Draft / Counting / Submitted / Verified / Closed |
| 10 | Notes | textarea | — | |

**Line items (one per item):**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Item | auto-fill | ✓ | All active kitchen items (or selected categories) |
| 2 | System balance | display | ✓ | Current balance from stock ledger (store units) |
| 3 | Physical count | decimal | ✓ | ≥0 |
| 4 | Variance | calculated | — | = physical − system |
| 5 | Variance % | calculated | — | = variance / system × 100 |
| 6 | Variance value (UGX) | calculated | — | = variance × weighted_avg_cost |
| 7 | Reason for variance | select + text | Conditional | Required if variance ≠ 0 |
| 8 | Approve adjustment | checkbox | — | Approver ticks to authorize system balance correction |

**Variance Reason Codes:**

| Code | Label |
|------|-------|
| MEASUREMENT_ERROR | Weighing/measuring error |
| UNRECORDED_ISSUE | Stock issued but not recorded |
| UNRECORDED_RECEIPT | Stock received but not recorded |
| NATURAL_LOSS | Natural weight loss / moisture |
| PEST_DAMAGE | Pest or vermin damage |
| THEFT_SUSPECTED | Suspected theft |
| COUNTING_ERROR | Previous count was inaccurate |
| OTHER | Other — explain |

**On Verify & Approve:**
- Approved variance lines → stock adjustment records created (KIT-011)
- Unapproved variances remain flagged for investigation
- Stock movement: type = `KITCHEN_COUNT_ADJUSTMENT`
- Audit log with full count details

---

### 5.9 Form KIT-009: Kitchen Menu Planning Form

| Property | Value |
|----------|-------|
| Form ID | KIT-009 |
| Purpose | Plan weekly/termly meals and estimate ingredient requirements |
| Create roles | KITCHEN_MANAGER, MATRON, BURSAR |
| Approve roles | HEADTEACHER, DIRECTOR |
| View roles | All kitchen-authorized roles |
| Workflow | Draft → Submitted → Approved |

**Header fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Plan reference | text | ✓ | Auto-generated: `KMP-{YYYY}-{seq}` |
| 2 | Plan period | select | ✓ | Weekly / Termly / Custom |
| 3 | Start date | date | ✓ | |
| 4 | End date | date | ✓ | > start date |
| 5 | Academic term | lookup | — | Current term |
| 6 | Expected students | integer | ✓ | ≥0 |
| 7 | Expected staff | integer | — | ≥0 |
| 8 | Expected visitors (average) | integer | — | ≥0 |
| 9 | Approved by | lookup | — | Set on approval |
| 10 | Status | select | ✓ | Draft / Submitted / Approved |
| 11 | Notes | textarea | — | |

**Day-meal entries (repeating block per day):**

| # | Field | Type | Required |
|---|-------|------|:--------:|
| 1 | Day / date | date | ✓ |
| 2 | Meal type | select | ✓ |
| 3 | Menu description | text | ✓ |
| 4 | Expected persons | integer | ✓ |

**Ingredient plan lines (per menu item):**

| # | Field | Type | Required |
|---|-------|------|:--------:|
| 1 | Item | lookup | ✓ |
| 2 | Planned quantity | decimal | ✓ |
| 3 | Unit | auto-fill | ✓ |
| 4 | Estimated unit cost | auto-fill | — |
| 5 | Estimated line cost | calculated | — |

**On Approve:**
- Planned quantities become the benchmark for variance analysis
- Estimated total meal cost calculated per day, per week, per term
- Menu plan available for linking in requisitions and consumption forms

---

### 5.10 Form KIT-010: Kitchen Budget Planning Form

| Property | Value |
|----------|-------|
| Form ID | KIT-010 |
| Purpose | Estimate and monitor food budget for a period |
| Create roles | BURSAR, ACCOUNTANT |
| Approve roles | HEADTEACHER, DIRECTOR |
| View roles | All kitchen-authorized roles |
| Workflow | Draft → Submitted → Approved → Monitoring |

**Header fields:**

| # | Field | Type | Required |
|---|-------|------|:--------:|
| 1 | Budget reference | text | ✓ |
| 2 | Budget period | select | ✓ |
| 3 | Academic term/year | lookup | ✓ |
| 4 | Start date | date | ✓ |
| 5 | End date | date | ✓ |
| 6 | Approved by | lookup | — |
| 7 | Status | select | ✓ |
| 8 | Notes | textarea | — |

**Line items:**

| # | Field | Type | Required |
|---|-------|------|:--------:|
| 1 | Item or category | lookup | ✓ |
| 2 | Budget level | select | ✓ |
| 3 | Planned quantity | decimal | ✓ |
| 4 | Planned unit cost | decimal | ✓ |
| 5 | Planned total cost | calculated | — |
| 6 | Actual quantity (live) | display | — |
| 7 | Actual total cost (live) | display | — |
| 8 | Variance (UGX) | calculated | — |
| 9 | Variance (%) | calculated | — |
| 10 | Notes | text | — |

Budget level can be `item` (per-item budgeting) or `category` (per-category budgeting).

**Monitoring mode:**
- Once approved and period begins, actual columns auto-populate from consumption data
- Variance columns update in real-time (on dashboard load)
- Alerts when category or total budget exceeds threshold

---

### 5.11 Form KIT-011: Kitchen Stock Adjustment Form

| Property | Value |
|----------|-------|
| Form ID | KIT-011 |
| Purpose | Post approved stock adjustments after physical count or error correction |
| Create roles | STOREKEEPER, BURSAR |
| Approve roles | BURSAR, DIRECTOR |
| View roles | All kitchen-authorized roles |
| Workflow | Draft → Submitted → Approved → Posted |

**Fields:**

| # | Field | Type | Required | Validation |
|---|-------|------|:--------:|------------|
| 1 | Adjustment reference | text | ✓ | Auto-generated: `KAJ-{YYYY}-{seq}` |
| 2 | Adjustment date | date | ✓ | ≤ today |
| 3 | Linked stock count | lookup | — | From count forms |
| 4 | Adjustment type | select | ✓ | Positive (add stock) / Negative (reduce stock) |
| 5 | Item | lookup | ✓ | From kitchen item master |
| 6 | Quantity | decimal | ✓ | >0, in store units |
| 7 | Unit cost | auto-fill | — | Weighted average |
| 8 | Adjustment value | calculated | — | = qty × unit_cost |
| 9 | Reason | textarea | ✓ | Min 10 chars |
| 10 | Created by | auto-fill | ✓ | |
| 11 | Approved by | lookup | ✓ | Different from creator (maker-checker) |
| 12 | Status | select | ✓ | Draft / Submitted / Approved / Rejected |

**On Post:**
- Stock balance adjusted (+ or −)
- Stock movement: type = `KITCHEN_ADJUSTMENT_POS` or `KITCHEN_ADJUSTMENT_NEG`
- Negative adjustment cannot make balance < 0
- Audit log
- Maker ≠ Checker enforced

---

## 6. Kitchen Workflow Design

### 6.1 Standard Daily Workflow

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │                     DAILY KITCHEN WORKFLOW                           │
 │                                                                      │
 │  MORNING                                                             │
 │  ┌──────────────────────────────────────────────────────────┐       │
 │  │ 1. Kitchen Manager reviews menu plan for the day         │       │
 │  │ 2. Kitchen Manager raises Requisition (KIT-003)          │       │
 │  │    for Breakfast items                                    │       │
 │  │ 3. Bursar/Storekeeper approves Requisition               │       │
 │  │ 4. Storekeeper issues stock (KIT-004)                    │       │
 │  │ 5. Kitchen prepares Breakfast                             │       │
 │  │ 6. After Breakfast: record consumption (KIT-005)          │       │
 │  └──────────────────────────────────────────────────────────┘       │
 │                                                                      │
 │  MID-MORNING                                                         │
 │  ┌──────────────────────────────────────────────────────────┐       │
 │  │ 7. Kitchen Manager raises Requisition for Lunch items     │       │
 │  │ 8. Approved → Storekeeper issues stock                    │       │
 │  │ 9. Kitchen prepares Lunch                                 │       │
 │  │ 10. After Lunch: record consumption (KIT-005)             │       │
 │  │     Any unused items returned → Return Form (KIT-006)     │       │
 │  └──────────────────────────────────────────────────────────┘       │
 │                                                                      │
 │  AFTERNOON                                                           │
 │  ┌──────────────────────────────────────────────────────────┐       │
 │  │ 11. Requisition for Supper items → Approve → Issue        │       │
 │  │ 12. Kitchen prepares Supper                               │       │
 │  │ 13. After Supper: record consumption (KIT-005)            │       │
 │  │     Returns → Return Form (KIT-006)                       │       │
 │  │     Wastage → Wastage Form (KIT-007)                      │       │
 │  └──────────────────────────────────────────────────────────┘       │
 │                                                                      │
 │  END OF DAY                                                          │
 │  ┌──────────────────────────────────────────────────────────┐       │
 │  │ 14. Storekeeper reviews all consumption records           │       │
 │  │ 15. Variances reviewed and reasons captured               │       │
 │  │ 16. Stock balances verified at a glance                   │       │
 │  └──────────────────────────────────────────────────────────┘       │
 └──────────────────────────────────────────────────────────────────────┘
```

### 6.2 Weekly / Periodic Workflow

```
 WEEKLY
 ┌────────────────────────────────────────────────────────────────┐
 │ • Perishable items physical count (KIT-008)                    │
 │ • Kitchen Storekeeper Accountability Report reviewed           │
 │ • Low-stock items flagged for reorder                         │
 │ • Weekly consumption summary reviewed by Bursar                │
 │ • Budget vs actual check                                       │
 └────────────────────────────────────────────────────────────────┘

 MONTHLY
 ┌────────────────────────────────────────────────────────────────┐
 │ • Full kitchen physical stock count                            │
 │ • Monthly kitchen cost report generated                        │
 │ • Cost per student per month calculated                        │
 │ • Supplier price trend reviewed                                │
 │ • Budget variance reviewed by Director                         │
 │ • Stock adjustments approved (if any)                          │
 └────────────────────────────────────────────────────────────────┘

 END OF TERM
 ┌────────────────────────────────────────────────────────────────┐
 │ • Mandatory full kitchen stock count                           │
 │ • Term summary reports generated                               │
 │ • Wastage report reviewed                                      │
 │ • Storekeeper accountability review (formal)                   │
 │ • Next term menu plan and budget prepared                      │
 │ • Carry-forward stock valued                                   │
 └────────────────────────────────────────────────────────────────┘
```

### 6.3 Simplified Workflow (for schools with light operations)

Some schools may not need per-meal requisitions. The system supports a simplified mode:

| Simplified Mode | Description |
|----------------|-------------|
| Daily bulk requisition | One requisition for all meals of the day instead of per-meal |
| End-of-day consumption | One consumption record per day covering all meals |
| Weekly physical count only | Instead of daily verification |

This is configurable via institution policy settings. The full mode is the default and recommended.

### 6.4 Complete Item Lifecycle

```
PURCHASE ORDER (from AP/Procurement module)
     │
     ▼
SUPPLIER DELIVERS FOOD
     │
     ▼
KIT-002: Kitchen Stock Receipt ──── Stock balance ↑
     │                                  │
     │                                  │
     ▼                                  ▼
KIT-003: Kitchen Issue Requisition   STOREROOM
     │                                  │
     ▼                                  │
KIT-004: Kitchen Stock Issue ──────── Stock balance ↓
     │
     ▼
KITCHEN PREPARES MEAL
     │
     ├──► KIT-005: Daily Consumption ── cost calculated
     │
     ├──► KIT-006: Kitchen Return ───── Stock balance ↑ (partial)
     │
     └──► KIT-007: Kitchen Wastage ──── Stock balance ↓ + loss cost
                                              │
                                              ▼
                                    KIT-008: Physical Count
                                              │
                                              ▼
                                    KIT-011: Adjustment (if variance)
```

---

## 7. Stock Movement Logic

### 7.1 Kitchen Stock Movement Types

| Movement Type | Code | Effect on Balance | Source Form |
|--------------|------|:-----------------:|-------------|
| Kitchen receipt | `KITCHEN_RECEIPT` | **+** Increase | KIT-002 |
| Kitchen issue | `KITCHEN_ISSUE` | **−** Decrease | KIT-004 |
| Kitchen return | `KITCHEN_RETURN` | **+** Increase | KIT-006 |
| Kitchen wastage/loss | `KITCHEN_WASTAGE` | **−** Decrease | KIT-007 |
| Kitchen adjustment (positive) | `KITCHEN_ADJ_POS` | **+** Increase | KIT-011 |
| Kitchen adjustment (negative) | `KITCHEN_ADJ_NEG` | **−** Decrease | KIT-011 |
| Kitchen count adjustment | `KITCHEN_COUNT_ADJ` | **±** Either | KIT-008 → KIT-011 |

### 7.2 Stock Ledger Structure

Each kitchen item maintains a stock ledger with the following fields per transaction:

| Field | Description |
|-------|-------------|
| transaction_id | Unique movement ID |
| item_id | Kitchen item reference |
| movement_date | Date of movement |
| movement_type | From §7.1 codes |
| reference_number | Source document number (receipt, issue, etc.) |
| quantity_in | Quantity added to stock (store units) |
| quantity_out | Quantity removed from stock (store units) |
| unit_cost | Cost per unit at time of movement |
| total_value | quantity × unit_cost |
| running_balance | Balance after this movement |
| batch_lot | If tracked |
| institution_id | Institution scope |
| campus_id | Campus scope (if multi-campus) |
| created_by | User who posted |
| created_at | Timestamp |

### 7.3 Balance Calculation

```
current_balance (item) =
    SUM(quantity_in) − SUM(quantity_out)
    WHERE item_id = {item} AND institution_id = {institution}
```

Or equivalently, the running balance of the last movement record for that item.

### 7.4 Stock Balance Rules

| Rule | Detail |
|------|--------|
| Balance cannot go negative | Issue and wastage forms blocked if quantity > available balance |
| Balance after receipt | Previous balance + received quantity (in store units) |
| Balance after issue | Previous balance − issued quantity (in store units) |
| Balance after return | Previous balance + accepted return quantity (in store units) |
| Balance after wastage | Previous balance − wastage quantity (in store units) |
| Balance after adjustment | Previous balance ± adjustment quantity |
| Opening balance for new item | 0 (can only increase via receipt or positive adjustment) |
| Period opening balance | Closing balance of previous period |

### 7.5 Non-Stock Quantity Tracking

The following are tracked for analysis but do **not** affect stock balance:

| Quantity | Source | Purpose |
|----------|--------|---------|
| Planned quantity | Requisition / Menu plan | For variance vs actual |
| Actual consumption quantity | Consumption form | For cost and accountability |
| Consumption per student | Calculated | For benchmarking |

### 7.6 Stock Ledger Report View

Per item, the stock ledger shows:

```
Item: Beans (dry) [KIT-GRN-001]                    Store Unit: KG

Date       │ Reference    │ Type          │ In     │ Out    │ Balance │ Cost/Unit │ Value
───────────┼──────────────┼───────────────┼────────┼────────┼─────────┼───────────┼──────────
01/04/2026 │ Opening      │               │        │        │  150.00 │  4,200    │  630,000
02/04/2026 │ KSR-2026-012 │ Receipt       │ 200.00 │        │  350.00 │  4,150    │  830,000
03/04/2026 │ KIS-2026-045 │ Issue         │        │  30.00 │  320.00 │  4,150    │  124,500
03/04/2026 │ KIS-2026-046 │ Issue         │        │  25.00 │  295.00 │  4,150    │  103,750
04/04/2026 │ KRT-2026-008 │ Return        │   3.00 │        │  298.00 │  4,150    │   12,450
04/04/2026 │ KWL-2026-003 │ Wastage       │        │   2.00 │  296.00 │  4,150    │    8,300
───────────┴──────────────┴───────────────┴────────┴────────┴─────────┴───────────┴──────────
                                   Totals: │ 203.00 │  57.00 │  296.00 │           │
```

---

## 8. Consumption and Variance Logic

### 8.1 Variance Types

| Variance | Calculation | Purpose |
|----------|------------|---------|
| **Planned vs Actual** | planned_qty − actual_qty_used | Measures accuracy of meal planning |
| **Issued vs Consumed** | issued_qty − (actual_consumed + returned + wasted) | Measures storekeeper accountability (all issued stock must be accounted for) |
| **Budget vs Actual** | budgeted_cost − actual_cost | Measures financial control |
| **Physical vs System** | physical_count − system_balance | Measures stock integrity |
| **Standard vs Actual** | (std_consumption × persons_fed) − actual_qty_used | Measures efficiency vs benchmark |

### 8.2 Variance Calculation Detail

#### 8.2.1 Daily Meal Variance

```
For each item in a consumption record:

issued_qty          = quantity issued from KIT-004
actual_used         = quantity recorded as used in KIT-005
returned_qty        = quantity returned via KIT-006
wasted_qty          = quantity lost via KIT-007

accounted_total     = actual_used + returned_qty + wasted_qty
unaccounted         = issued_qty − accounted_total

IF unaccounted ≠ 0 → FLAG: "Unaccounted stock difference"
```

#### 8.2.2 Standard Consumption Variance

```
standard_qty        = persons_fed × item.std_consumption_per_student
actual_qty          = actual_used (from KIT-005)
variance_qty        = standard_qty − actual_qty
variance_pct        = (variance_qty / standard_qty) × 100

IF ABS(variance_pct) > threshold → ALERT
```

### 8.3 Variance Thresholds (Configurable)

| Threshold | Default | Description |
|-----------|:-------:|-------------|
| Acceptable variance | ±10% | No alert; normal operational variation |
| Warning variance | ±10% to ±20% | Yellow alert; reason required |
| Critical variance | >±20% | Red alert; reason required; escalated to Bursar |
| Suspicious variance | >±30% | Red alert; reason required; escalated to Director |
| Repeated variance threshold | Same item >15% variance for 3+ consecutive days | Escalation alert regardless of individual day severity |

### 8.4 Consumption Benchmark Management

The system maintains configurable benchmarks:

```typescript
interface ConsumptionBenchmark {
  itemId: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'SUPPER' | 'ANY';
  quantityPerStudent: number;   // in consumption units
  unit: string;
  effectiveFrom: string;        // date
  effectiveTo: string | null;   // null = current
  source: 'SYSTEM_DEFAULT' | 'SCHOOL_DEFINED' | 'CALCULATED_AVERAGE';
  notes: string;
}
```

Benchmarks can be:
- **System defaults** — shipped with the ERP (Uganda school averages, see §4.5)
- **School-defined** — manually set by Bursar / Kitchen Manager based on experience
- **Calculated average** — system proposes benchmark from last 30/60/90-day actual data

### 8.5 Consumption Analysis Queries

The system must answer these questions efficiently:

| Question | Data Source |
|----------|-----------|
| What was the actual consumption of beans today? | KIT-005 filtered by item + date |
| How much did lunch cost per student today? | KIT-005 total meal cost / students fed |
| What is the average daily cost per student this month? | Aggregate KIT-005 for month |
| Which items had highest variance this week? | KIT-005 aggregated, sorted by ABS(variance_pct) |
| Is the storekeeper issuing more than consumed? | Compare sum of KIT-004 issues vs sum of KIT-005 consumption for period |
| What is the trend of rice consumption over last 4 weeks? | KIT-005 weekly aggregate for rice |
| How many kg of sugar were consumed per student this term? | Total sugar consumption / total student-meal-days |

---

## 9. Costing and Budget Logic

### 9.1 Costing Method

| Property | Value |
|----------|-------|
| Primary costing method | **Weighted Average Cost (WAC)** |
| Calculation | After each receipt: new_avg = (old_balance × old_avg + received_qty × receipt_cost) / (old_balance + received_qty) |
| Applied to | Issues, consumption, wastage, adjustments |
| Future option | FIFO (Phase 2) |

### 9.2 Weighted Average Cost Recalculation

```
On Kitchen Receipt:

old_balance = current stock balance (store units)
old_avg_cost = current weighted average cost per store unit
new_qty = received quantity (store units)
new_cost = unit cost of this receipt (per store unit)

new_avg_cost = (old_balance × old_avg_cost + new_qty × new_cost) / (old_balance + new_qty)

Update item.current_average_cost = new_avg_cost
```

Example:
```
Item: Cooking Oil
Old balance: 50 L @ UGX 8,000/L = UGX 400,000
New receipt: 80 L @ UGX 8,500/L = UGX 680,000

New avg cost = (400,000 + 680,000) / (50 + 80) = 1,080,000 / 130 = UGX 8,308/L
New balance: 130 L @ UGX 8,308/L
```

### 9.3 Cost Tracking Points

| Cost Point | How Calculated | Purpose |
|-----------|---------------|---------|
| Receipt cost | Actual supplier price | Track purchasing costs |
| Issue cost | Qty × weighted_avg_cost | Value stock leaving storeroom |
| Consumption cost | Net consumed × weighted_avg_cost | Value food actually consumed |
| Wastage cost | Wasted qty × weighted_avg_cost | Value food lost |
| Return value | Returned qty × weighted_avg_cost | Value food recovered |
| Meal cost | Sum of consumption costs for all items in one meal | Total cost of a meal |
| Cost per student per meal | meal_cost / students_fed | Unit cost benchmark |
| Cost per student per day | sum(meal_costs for day) / students_fed that day | Daily benchmark |
| Cost per student per week | sum(daily costs) / weighted student count | Weekly benchmark |
| Cost per student per term | sum(all meal costs for term) / (students × term_days) | Term benchmark |

### 9.4 Meal Cost Calculation

```
For one meal (e.g., Lunch, 07/04/2026):

Students fed: 450
Staff fed: 35
Visitors fed: 5
Total persons: 490

Items consumed:
  Beans    25.0 kg  × UGX 4,150/kg  = UGX   103,750
  Posho    35.0 kg  × UGX 2,800/kg  = UGX    98,000
  Oil       5.0 L   × UGX 8,308/L   = UGX    41,540
  Cabbage  20.0 kg  × UGX 1,500/kg  = UGX    30,000
  Salt      2.5 kg  × UGX 1,200/kg  = UGX     3,000
  Onions    5.0 kg  × UGX 3,000/kg  = UGX    15,000
  Tomatoes  8.0 kg  × UGX 2,500/kg  = UGX    20,000
  Charcoal  2.0 SK  × UGX 45,000/SK = UGX    90,000
                                       ───────────────
  Total meal cost:                     UGX   401,290

  Cost per person:  UGX 401,290 / 490 = UGX 819
  Cost per student: UGX 401,290 / 450 = UGX 892
```

### 9.5 Kitchen Budget Process

```
                 ┌────────────────────────────────┐
                 │     BUDGET PLANNING CYCLE       │
                 │                                  │
                 │  1. Review last term's actual     │
                 │     consumption data              │
                 │                                  │
                 │  2. Define next term's menu plan  │
                 │     (KIT-009)                     │
                 │                                  │
                 │  3. Calculate expected quantities  │
                 │     from menu × expected students  │
                 │                                  │
                 │  4. Apply current/expected         │
                 │     supplier prices                │
                 │                                  │
                 │  5. Generate kitchen budget         │
                 │     (KIT-010)                     │
                 │                                  │
                 │  6. Submit for approval             │
                 │                                  │
                 │  7. Approved budget feeds into      │
                 │     school-wide budget module       │
                 │                                  │
                 │  8. During term: actual vs budget    │
                 │     tracked in real-time            │
                 └────────────────────────────────┘
```

### 9.6 Budget vs Actual Tracking

| Metric | Calculation |
|--------|------------|
| Budget variance (item) | budgeted_cost[item] − actual_cost[item] for period |
| Budget variance (category) | sum(budgeted_cost[category]) − sum(actual_cost[category]) |
| Budget burn rate | actual_cost_to_date / budgeted_cost × 100 |
| Projected cost | (actual_cost_to_date / days_elapsed) × total_period_days |
| Days of budget remaining | (budgeted_cost − actual_cost_to_date) / daily_avg_cost |

### 9.7 Questions Kitchen Costing Must Answer

| Question | Report / Metric |
|----------|----------------|
| How much are we spending on beans per month? | Item cost report filtered by period |
| What is the daily food cost per student? | Daily cost per student KPI |
| Which items are causing most cost variance? | Budget vs actual by item, sorted by ABS(variance) |
| Is the storekeeper accountable? | Storekeeper Accountability Report |
| Is the menu affordable within budget? | Projected cost vs budget remaining |
| How does this term compare to last term? | Term-over-term cost comparison |
| Which supplier gives the best price? | Supplier price trend report |
| What is the cost of feeding one student for the whole term? | Term cost / (students × term days) |

---

## 10. Reports and Dashboards

### 10.1 Kitchen Dashboard

The Kitchen Dashboard is the landing page of Kitchen Stores. It provides an at-a-glance view of kitchen health.

**KPI Cards (top row):**

| Card | Value | Color Logic |
|------|-------|-------------|
| Current Stock Value | UGX X,XXX,XXX | Neutral |
| Low Stock Items | count | Red if > 0, Green if 0 |
| Stock Received (period) | UGX X,XXX,XXX | Neutral |
| Stock Issued (period) | UGX X,XXX,XXX | Neutral |
| Consumption Cost (period) | UGX X,XXX,XXX | Neutral |
| Wastage Value (period) | UGX X,XXX,XXX | Red if > budget threshold |
| Cost Per Student Today | UGX X,XXX | Green if ≤ benchmark, Red if > |
| Budget Utilization | XX% | Green ≤80%, Amber 80-95%, Red >95% |

**Charts:**

| Chart | Type | Data |
|-------|------|------|
| Daily food cost (last 30 days) | Line chart | Total consumption cost per day |
| Cost per student per day trend | Line chart | Consumption cost / students fed |
| Top 10 consumed items (period) | Horizontal bar | Sorted by total consumption quantity |
| Top 5 high-variance items | Horizontal bar | Sorted by ABS(variance %) |
| Budget vs actual by category | Grouped bar | Budget bar + actual bar per category |
| Wastage by type | Pie/donut | Spoilage, spillage, pest, expiry, etc. |
| Stock value by category | Pie/donut | Grains, flour, oils, etc. |

**Tables:**

| Table | Content |
|-------|---------|
| Low stock alerts | Items below reorder level: item, balance, reorder level, status |
| Recent issues | Last 10 kitchen issues: date, requisition, items, qty, value |
| Pending requisitions | Requisitions awaiting approval |
| Accountability alerts | High-variance items, unaccounted stock, suspicious patterns |

**Date Range Filter:** Today / This Week / This Month / This Term / Custom

### 10.2 Kitchen Reports Catalog

#### Report 1: Kitchen Stock on Hand Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-001 |
| Purpose | Current stock position of all kitchen items |
| Columns | Item Code / Item Name / Category / Store Unit / Balance / WAC / Stock Value / Reorder Level / Status |
| Filters | Category, Stock status (all / low / out-of-stock), Search |
| Grouping | By category with subtotals |
| Totals | Grand total stock value |
| Print | A4 Portrait |

#### Report 2: Kitchen Stock Movement Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-002 |
| Purpose | All movements for one or more items over a period |
| Columns | Date / Reference / Type / In / Out / Balance / Unit Cost / Value |
| Filters | Item, Category, Date range, Movement type |
| Print | A4 Portrait |

#### Report 3: Kitchen Receipt Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-003 |
| Purpose | Summary of all food received from suppliers |
| Columns | Date / Supplier / Receipt No / Item / Qty / Unit / Unit Cost / Total Cost |
| Filters | Date range, Supplier, Item/Category |
| Totals | Total received value |
| Print | A4 Landscape |

#### Report 4: Kitchen Requisition Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-004 |
| Purpose | Track requisitions and their fulfillment status |
| Columns | Requisition No / Date / Requested By / Meal / Status / Items Requested / Qty Approved / Qty Issued / Fulfillment % |
| Filters | Date range, Status, Requested by, Meal type |
| Print | A4 Landscape |

#### Report 5: Kitchen Issue Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-005 |
| Purpose | All stock issued from kitchen store |
| Columns | Date / Issue No / Requisition / Item / Qty Issued / Unit Cost / Issue Value / Issued By / Received By |
| Filters | Date range, Item/Category, Issued by |
| Totals | Total issue value |
| Print | A4 Landscape |

#### Report 6: Daily Consumption Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-006 |
| Purpose | Detailed per-day consumption with variance analysis |
| Columns | Date / Meal / Menu / Persons Fed / Item / Planned Qty / Issued Qty / Actual Qty / Returned / Wasted / Variance / Variance % / Cost |
| Filters | Date range, Meal type, Item/Category |
| Totals | Total consumption cost, average cost per student |
| Print | A4 Landscape |

#### Report 7: Meal Cost Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-007 |
| Purpose | Cost breakdown per meal |
| Columns | Date / Meal Type / Menu / Students / Staff / Visitors / Total Cost / Cost/Student / Cost/Person |
| Filters | Date range, Meal type |
| Summary | Average cost per meal type |
| Print | A4 Portrait |

#### Report 8: Cost Per Student Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-008 |
| Purpose | Per-student food cost analysis |
| Columns | Period / Total Consumption Cost / Total Student-Meal-Days / Avg Cost/Student/Day / Avg Cost/Student/Week / Projected Term Cost/Student |
| Filters | Period (week / month / term) |
| Chart | Cost per student trend line |
| Print | A4 Portrait |

#### Report 9: Wastage / Loss Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-009 |
| Purpose | All recorded kitchen wastage and loss |
| Columns | Date / Loss No / Item / Qty / Unit / Value / Loss Type / Reason / Reported By / Status |
| Filters | Date range, Loss type, Item/Category, Status |
| Totals | Total wastage value, breakdown by loss type |
| Alerts | Highlight THEFT_SUSPECTED items in red |
| Print | A4 Landscape |

#### Report 10: Kitchen Return Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-010 |
| Purpose | Items returned from kitchen to store |
| Columns | Date / Return No / Item / Qty Returned / Condition / Accepted Qty / Linked Issue |
| Filters | Date range, Item, Condition |
| Print | A4 Portrait |

#### Report 11: Kitchen Physical Count Variance Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-011 |
| Purpose | Results of physical stock counts vs system |
| Columns | Count Ref / Date / Item / System Bal / Physical Bal / Variance / Variance % / Value / Reason / Adjustment Status |
| Filters | Count date, Category, Variance status |
| Print | A4 Landscape |

#### Report 12: Item Consumption Trend Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-012 |
| Purpose | Trend of consumption for a specific item over time |
| Columns | Period / Quantity Consumed / Avg Persons Fed / Qty Per Person / Cost / Trend Direction |
| Filters | Item, Period granularity (daily/weekly/monthly) |
| Chart | Line chart: consumption qty + per-person rate over time |
| Print | A4 Portrait |

#### Report 13: Supplier Price Trend Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-013 |
| Purpose | Track supplier prices over time for kitchen items |
| Columns | Item / Supplier / Receipt Date / Qty / Purchase Unit / Unit Price / Price Change vs Last |
| Filters | Item, Supplier, Date range |
| Chart | Price trend per item per supplier |
| Print | A4 Landscape |

#### Report 14: Kitchen Budget vs Actual Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-014 |
| Purpose | Compare food budget to actual spend |
| Columns | Item/Category / Budget Qty / Budget Cost / Actual Qty / Actual Cost / Variance (UGX) / Variance (%) / Status |
| Filters | Budget period, Category |
| Totals | Grand totals for budget and actual |
| Chart | Grouped bar chart by category |
| Print | A4 Landscape |

#### Report 15: High Variance Items Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-015 |
| Purpose | Items with repeatedly high consumption variance |
| Columns | Item / Days Tracked / Avg Variance % / Max Variance % / Consecutive High-Variance Days / Total Excess Cost / Risk Level |
| Filters | Period, Variance threshold, Category |
| Alerts | Flag items with >3 consecutive high-variance days |
| Print | A4 Portrait |

#### Report 16: Storekeeper Accountability Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-016 |
| Purpose | **Key accountability document.** Reconciles for each item: received, issued, consumed, returned, wasted, adjusted, expected balance, physical balance, unexplained gap. |
| Columns | Item / Opening / Received / Issued / Returned / Wasted / Adjusted / Expected Closing / Physical Closing / Gap / Gap Value / Gap % |
| Filters | Period (weekly/monthly/termly), Category |
| Totals | Total value of unexplained gaps |
| Signature block | Storekeeper / Bursar / Headteacher |
| Print | A4 Landscape |

This is the report directors and auditors will rely on most heavily.

#### Report 17: Kitchen Summary (Week / Month / Term)

| Property | Value |
|----------|-------|
| Report ID | KRPT-017 |
| Purpose | Aggregated kitchen activity for a period |
| Sections | Stock received, Stock issued, Consumption, Wastage, Returns, Budget vs actual, Cost per student, Key variances |
| Print | A4 Portrait, multi-page |

#### Report 18: Fast-Moving and Slow-Moving Items

| Property | Value |
|----------|-------|
| Report ID | KRPT-018 |
| Purpose | Identify items consumed most/least frequently |
| Columns | Item / Category / Total Qty Consumed / Avg Daily Consumption / Days Since Last Issue / Classification (Fast/Normal/Slow/Dead) |
| Filters | Period, Category |
| Print | A4 Portrait |

#### Report 19: Stock-Out Risk Report

| Property | Value |
|----------|-------|
| Report ID | KRPT-019 |
| Purpose | Predict items that will run out soon |
| Columns | Item / Current Balance / Avg Daily Consumption / Days of Stock Remaining / Reorder Level / Status |
| Status | Critical (≤3 days) / Warning (4-7 days) / Normal (>7 days) |
| Sort | By days remaining ascending |
| Print | A4 Portrait |

---

## 11. Roles and Permissions

### 11.1 Kitchen Role Definitions

| Role | Description |
|------|------------|
| STOREKEEPER | Primary operator of kitchen stores. Receives, issues, counts, adjusts stock. |
| KITCHEN_MANAGER | Also Matron / Catering Officer. Raises requisitions, records consumption, records waste. |
| BURSAR | Financial oversight. Approves requisitions, reviews costs, approves adjustments. |
| ACCOUNTANT | Reviews cost postings, processes food supplier bills. |
| HEADTEACHER | Operational oversight. Reviews dashboard and reports. |
| DIRECTOR | Strategic oversight. Reviews cost per student, budget compliance, accountability. |
| AUDITOR | Audit access. Reviews all records, stock counts, variances, trails. |
| PROCUREMENT_OFFICER | Manages supplier relations, purchase orders for food items. |

### 11.2 Permission Matrix

| Action | STORE-KEEPER | KITCHEN-MGR | BURSAR | ACCT | HT | DIRECTOR | AUDITOR | PROCUREMENT |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Kitchen Item Master** | | | | | | | | |
| Create item | ✓ | — | ✓ | — | — | — | — | — |
| Edit item | ✓ | — | ✓ | — | — | — | — | — |
| View items | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Deactivate item | — | — | ✓ | — | — | ✓ | — | — |
| **Stock Receipt** | | | | | | | | |
| Create receipt | ✓ | — | — | — | — | — | — | — |
| Verify receipt | — | — | ✓ | ✓ | ✓ | — | — | — |
| View receipts | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Requisition** | | | | | | | | |
| Create requisition | ✓ | ✓ | — | — | — | — | — | — |
| Approve requisition | ✓* | — | ✓ | — | ✓ | ✓ | — | — |
| Reject requisition | ✓* | — | ✓ | — | ✓ | ✓ | — | — |
| View requisitions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Stock Issue** | | | | | | | | |
| Create issue | ✓ | — | — | — | — | — | — | — |
| View issues | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Daily Consumption** | | | | | | | | |
| Record consumption | ✓ | ✓ | — | — | — | — | — | — |
| Review consumption | — | — | ✓ | — | ✓ | ✓ | ✓ | — |
| View consumption | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Returns** | | | | | | | | |
| Record return | ✓ | ✓ | — | — | — | — | — | — |
| Accept return | ✓ | — | — | — | — | — | — | — |
| View returns | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Wastage / Loss** | | | | | | | | |
| Record wastage | ✓ | ✓ | — | — | — | — | — | — |
| Approve wastage | — | — | ✓ | — | ✓ | ✓ | — | — |
| View wastage | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Physical Count** | | | | | | | | |
| Create/conduct count | ✓ | — | — | — | — | — | — | — |
| Verify count | — | — | ✓ | — | ✓ | — | ✓ | — |
| View counts | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Stock Adjustment** | | | | | | | | |
| Create adjustment | ✓ | — | ✓ | — | — | — | — | — |
| Approve adjustment | — | — | ✓** | — | — | ✓ | — | — |
| View adjustments | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Menu Planning** | | | | | | | | |
| Create menu plan | — | ✓ | ✓ | — | — | — | — | — |
| Approve menu plan | — | — | — | — | ✓ | ✓ | — | — |
| View menu plans | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Budget Planning** | | | | | | | | |
| Create budget | — | — | ✓ | ✓ | — | — | — | — |
| Approve budget | — | — | — | — | ✓ | ✓ | — | — |
| View budget | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Dashboard** | | | | | | | | |
| View kitchen dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Reports** | | | | | | | | |
| View operational reports | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| View cost reports | — | — | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| View accountability reports | — | — | ✓ | — | ✓ | ✓ | ✓ | — |
| Print/export reports | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |

\* Storekeeper can approve requisitions only if institution policy allows (configurable). Default: Storekeeper cannot approve their own requisitions (maker-checker).

\*\* Bursar can approve adjustments only if they did not create them (maker-checker enforced).

### 11.3 Maker-Checker Controls

| Action | Maker | Checker | Rule |
|--------|-------|---------|------|
| Stock receipt → verify | Storekeeper | Bursar / HT | Verifier ≠ receiver |
| Requisition → approve | Kitchen Mgr / Storekeeper | Bursar / HT | Approver ≠ requester |
| Wastage → approve | Storekeeper / Kitchen Mgr | Bursar / HT | Approver ≠ reporter |
| Stock adjustment → approve | Storekeeper / Bursar | Bursar / Director | Approver ≠ creator |
| Physical count → verify | Storekeeper | Bursar / HT / Auditor | Verifier ≠ counter |

---

## 12. Offline-First Behavior

### 12.1 Offline Capability Matrix

| Feature | Works Offline | Notes |
|---------|:------------:|-------|
| Kitchen Item Master — view | ✓ | Cached locally |
| Kitchen Item Master — create/edit | ✓ | Saved locally, synced later |
| Stock Receipt (KIT-002) | ✓ | Full form, posted locally |
| Requisition (KIT-003) | ✓ | Created and approved locally |
| Stock Issue (KIT-004) | ✓ | Posted locally, stock balance updated locally |
| Consumption (KIT-005) | ✓ | Full form with variance calculations |
| Return (KIT-006) | ✓ | Posted locally |
| Wastage/Loss (KIT-007) | ✓ | Posted locally |
| Physical Count (KIT-008) | ✓ | Count recorded locally |
| Adjustment (KIT-011) | ✓ | Posted locally with maker-checker (both users must be on same device or approve before sync) |
| Menu Planning (KIT-009) | ✓ | Local only until sync |
| Budget Planning (KIT-010) | ✓ | Local only until sync |
| Kitchen Dashboard | ✓ | Uses local data |
| All Kitchen Reports | ✓ | Generated from local data |
| Print/PDF kitchen reports | ✓ | Uses local PDF engine (see PRINT_PDF_BRANDING spec) |

### 12.2 Local Storage

| Data | Storage |
|------|---------|
| Kitchen items | SQLite `kitchen_items` table |
| Stock movements | SQLite `stock_movements` WHERE movement_area = 'KITCHEN' |
| Kitchen forms | SQLite dedicated tables per form type |
| Stock balances | Calculated view or denormalized `kitchen_stock_balances` table |
| Audit trail | SQLite `audit_log` table (synced later) |
| Benchmarks | SQLite `kitchen_benchmarks` table |

### 12.3 Sync Rules

| Rule | Detail |
|------|--------|
| Sync direction | Bi-directional (local ↔ cloud) |
| Sync frequency | Automatic when online; manual trigger available |
| Sync granularity | Per-record |
| Conflict resolution — stock balance | Cloud recalculates from all movement records. Device pushes movements; cloud recomputes balance. |
| Conflict resolution — forms | Last-write-wins with conflict flag for review |
| Multi-device kitchen access | NOT recommended for kitchen stores. Ideally ONE device per kitchen store to avoid conflicting stock operations. |
| If multi-device occurs | Stock movements from both devices synced; any balance conflicts flagged for manual review |
| Offline approval | If approver is on same device, approval happens offline. If different device, form stays in "pending approval" until sync connects both. |

### 12.4 Recommended Device Setup

```
Kitchen Stores: 1 dedicated desktop/laptop at the storeroom
  ├── Storekeeper uses this for: receipts, issues, counts, adjustments
  └── Kitchen Manager can use same device or own device for: requisitions, consumption

Bursar's device: Reviews dashboards, approves requisitions, reviews reports
Director's device: Reviews dashboards and accountability reports

All devices sync to cloud backup.
```

---

## 13. Alerts, Controls, and Audit Rules

### 13.1 Alert Catalog

| # | Alert | Trigger | Severity | Recipients |
|---|-------|---------|:--------:|-----------|
| 1 | Low stock | Item balance ≤ reorder level | Warning | STOREKEEPER, BURSAR |
| 2 | Out of stock | Item balance = 0 | Critical | STOREKEEPER, BURSAR, HT |
| 3 | Negative stock attempt | Issue/wastage would make balance < 0 | Block | STOREKEEPER (blocked at form level) |
| 4 | High consumption variance | ABS(variance %) > threshold (default 20%) | Warning | STOREKEEPER, BURSAR |
| 5 | Critical consumption variance | ABS(variance %) > 30% | Critical | BURSAR, HT, DIRECTOR |
| 6 | Repeated high variance | Same item >15% variance for 3+ consecutive days | Critical | BURSAR, HT, DIRECTOR |
| 7 | High wastage | Single wastage record value > threshold (configurable, e.g., UGX 100,000) | Warning | BURSAR, HT |
| 8 | Theft suspected | Wastage type = THEFT_SUSPECTED | Critical | DIRECTOR, HT, BURSAR |
| 9 | Stock count mismatch | ABS(physical − system variance) > threshold | Warning | BURSAR |
| 10 | Requisition without approval | Stand-alone issue (no linked requisition) where policy forbids it | Warning | BURSAR |
| 11 | Unusual issue size | Issued quantity > 2× standard_consumption × persons | Warning | BURSAR, STOREKEEPER |
| 12 | Stale stock | Item not issued for > X days (configurable, e.g., 30 days) | Info | STOREKEEPER |
| 13 | Expired stock | Item with expiry date ≤ today and balance > 0 | Critical | STOREKEEPER, BURSAR |
| 14 | Approaching expiry | Item expiry date within 7 days and balance > 0 | Warning | STOREKEEPER |
| 15 | Budget threshold reached | Category actual cost ≥ 80% of budget | Warning | BURSAR, HT |
| 16 | Budget exceeded | Category actual cost > 100% of budget | Critical | BURSAR, HT, DIRECTOR |
| 17 | No consumption recorded | No consumption form submitted for a date that has issues | Warning | KITCHEN_MANAGER, BURSAR |
| 18 | Unaccounted issue | Issued qty − (consumed + returned + wasted) > threshold | Warning | STOREKEEPER, BURSAR |
| 19 | Price increase | Supplier price increased >15% from last receipt for same item | Info | BURSAR, PROCUREMENT |

### 13.2 Control Rules

| Control | Type | Implementation |
|---------|------|---------------|
| Issue must have requisition | Preventive | Configurable policy. If enabled, stock issue form requires linked approved requisition. |
| Cannot issue more than stock | Preventive | System blocks issue if qty > available balance |
| Consumption must follow issue | Detective | Alert if consumption recorded without a corresponding issue |
| Physical count on schedule | Detective | Alert if scheduled count date passes without a count record |
| Maker-checker on adjustments | Preventive | Adjustment approver ≠ creator (enforced in form) |
| Wastage requires approval | Preventive | Wastage record not posted until approved by Bursar/HT |
| Variance explanation mandatory | Preventive | Consumption form blocks save if variance > threshold and no reason |
| Daily consumption completeness | Detective | End-of-day check: all issued items should appear in consumption records |

### 13.3 Audit Trail

Every kitchen operation creates an audit record:

| Field | Description |
|-------|-------------|
| audit_id | Unique identifier |
| timestamp | UTC timestamp |
| institution_id | Institution scope |
| campus_id | Campus scope |
| user_id | Who performed the action |
| user_role | Role at time of action |
| action | CREATE / UPDATE / DELETE / APPROVE / REJECT / POST / VERIFY |
| entity_type | KITCHEN_ITEM / KITCHEN_RECEIPT / KITCHEN_REQUISITION / KITCHEN_ISSUE / KITCHEN_CONSUMPTION / KITCHEN_RETURN / KITCHEN_WASTAGE / KITCHEN_COUNT / KITCHEN_ADJUSTMENT / KITCHEN_MENU / KITCHEN_BUDGET |
| entity_id | Record identifier |
| reference_number | Document number (e.g., KSR-2026-012) |
| old_values | JSON of previous field values (for updates) |
| new_values | JSON of new field values |
| description | Human-readable action description |
| device_id | Device identifier (for offline sync tracking) |

**Audit retention:** Permanent. Kitchen audit records are never deleted.

**Audit report access:** BURSAR, DIRECTOR, AUDITOR only.

---

## 14. UI/UX Requirements

### 14.1 Kitchen Dashboard Page

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  Kitchen Stores Dashboard                                [Period ▼]  │
│──────────────────────────────────────────────────────────────────────│
│                                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │Stock │  │Low   │  │Issued│  │Consumed│ │Wastage│ │Cost/ │       │
│  │Value │  │Stock │  │Value │  │ Value  │ │Value  │ │Stud. │       │
│  │UGX XX│  │  3   │  │UGX XX│  │UGX XX  │ │UGX XX │ │UGX XX│       │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────┐     │
│  │  Daily Food Cost Trend     │  │  Budget vs Actual           │     │
│  │  [Line Chart - 30 days]    │  │  [Grouped Bar Chart]        │     │
│  └────────────────────────────┘  └────────────────────────────┘     │
│                                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────┐     │
│  │  Top Consumed Items        │  │  High Variance Items        │     │
│  │  [Horizontal Bar]          │  │  [Table with alerts]        │     │
│  └────────────────────────────┘  └────────────────────────────┘     │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Low Stock Alerts                                           │    │
│  │  Item          │ Balance │ Reorder │ Days Remaining │ Action │    │
│  │  Cooking oil   │   8 L   │  20 L   │    2 days      │ [RO]  │    │
│  │  Sugar         │  12 kg  │  25 kg  │    3 days      │ [RO]  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Accountability Alerts                                      │    │
│  │  ⚠ Beans: 25% variance 3 consecutive days                  │    │
│  │  ⚠ Unaccounted 5L cooking oil on 05/04/2026                │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### 14.2 Page List

| Page | Purpose | Key Elements |
|------|---------|-------------|
| Kitchen Dashboard | At-a-glance health | KPI cards, charts, alert tables |
| Kitchen Item Master | View/manage food items | Searchable table, create/edit drawer, category filter |
| Kitchen Receipts | List and create stock receipts | Table list with filters, create form with line items |
| Kitchen Requisitions | List and create requisitions | Table with status badges, create form, approval buttons |
| Kitchen Issues | List and create stock issues | Table with linked requisitions, create form |
| Daily Consumption | Record and review daily use | Date selector, meal tabs, item-level entry with variance |
| Wastage & Loss | Record and track wastage | Table list, create form, loss type badges |
| Returns | Record returns to store | Table list, create form |
| Physical Count | Conduct and review counts | Full item grid with system vs physical, variance highlights |
| Menu Planning | Create and manage meal plans | Calendar/weekly view, ingredient list per meal |
| Kitchen Budget | Create and monitor budgets | Budget lines, live actual columns, variance bars |
| Kitchen Reports | Access all 19 reports | Report catalog cards, filter/generate workflow |

### 14.3 Common UI Patterns

| Pattern | Usage |
|---------|-------|
| **KPI cards** | Dashboard top row — color-coded green/amber/red by threshold |
| **Data tables** | Every list page — sortable, filterable, paginated |
| **Create/Edit drawer** | Side panel for creating or editing records. Does not navigate away from list. |
| **Detail drawer** | Click a row to see full details in a side panel |
| **Status badges** | Draft (gray), Pending (amber), Approved (green), Rejected (red), Posted (blue) |
| **Variance highlighting** | Green (≤10%), Amber (10-20%), Red (>20%) background on variance cells |
| **Inline alerts** | Warning banners within forms (e.g., "Requested quantity exceeds standard by 35%") |
| **Print / Export** | Every report page has [Preview PDF] and [Export CSV] buttons |
| **Quick actions** | Dashboard cards link directly to create forms (e.g., "New Requisition" quick action) |
| **Date range filter** | Consistent filter on all list/report pages: Today / This Week / This Month / Term / Custom |

### 14.4 Mobile / Responsive Considerations

The primary platform is **desktop** (Tauri). Mobile-optimized views are Phase 2. However, table layouts should use responsive column hiding for narrower screens:

| Priority | Columns always visible | Columns hidden on narrow |
|----------|-------|--------|
| High | Item name, quantity, status | Notes, secondary reference numbers |
| Medium | Date, reference number | Unit cost, total value |

---

## 15. Phase 1 vs Phase 2 Recommendations

### 15.1 Phase 1: Core Kitchen Accountability (MVP)

| Feature | Phase 1 |
|---------|:-------:|
| Kitchen Item Master with all fields | ✓ |
| Item categories (12 categories) | ✓ |
| Unit of measure catalog | ✓ |
| Unit conversion (purchase → store → issue → consumption) | ✓ |
| Standard consumption benchmarks (configurable) | ✓ |
| Kitchen Stock Receipt (KIT-002) | ✓ |
| Kitchen Issue Requisition (KIT-003) | ✓ |
| Kitchen Stock Issue (KIT-004) | ✓ |
| Daily Consumption & Accountability (KIT-005) | ✓ |
| Kitchen Return (KIT-006) | ✓ |
| Kitchen Wastage / Loss (KIT-007) | ✓ |
| Kitchen Physical Stock Count (KIT-008) | ✓ |
| Kitchen Stock Adjustment (KIT-011) | ✓ |
| Weighted average costing | ✓ |
| Stock ledger per item | ✓ |
| Variance calculation (planned/issued/actual) | ✓ |
| Variance threshold alerts | ✓ |
| Low stock / out-of-stock alerts | ✓ |
| Kitchen Dashboard (KPIs, charts, alerts) | ✓ |
| All 19 kitchen reports | ✓ |
| Role-based permissions (full matrix) | ✓ |
| Maker-checker enforcement | ✓ |
| Full audit trail | ✓ |
| Offline-first — all forms and reports | ✓ |
| Print/PDF for kitchen documents and reports | ✓ |
| Cost per student per meal / day calculation | ✓ |
| Storekeeper Accountability Report | ✓ |
| Kitchen Budget Planning (basic — item/category level) | ✓ |
| Menu Planning (basic — weekly table format) | ✓ |
| Budget vs actual tracking | ✓ |

### 15.2 Phase 2: Advanced Kitchen Intelligence

| Feature | Phase |
|---------|:-----:|
| Recipe-level standard consumption (e.g., "Posho + Beans for 100" = ingredient list with exact quantities) | 2 |
| FIFO costing option | 2 |
| Kitchen performance scoring (storekeeper KPI dashboard) | 2 |
| Predictive reorder (forecast based on consumption trend + enrollment) | 2 |
| Supplier price comparison intelligence (auto-suggest cheapest supplier) | 2 |
| Mobile app for kitchen manager (consumption capture on phone) | 2 |
| Photo capture for wastage evidence | 2 |
| Barcode/QR scanning for stock receipt | 2 |
| Calendar-based menu planning UI (drag-and-drop meals) | 2 |
| Nutrition tracking per meal (protein, carbs, etc.) | 2 |
| Multi-kitchen support (Main Kitchen, Staff Kitchen, Bakery as separate cost centers) | 2 |
| Tuckshop/canteen POS integration | 2 |
| Automated consumption estimation from menu plan (one-click populate) | 2 |
| Kitchen performance comparison across campuses | 2 |
| Historical consumption analysis with seasonal patterns | 2 |
| Smart budget suggestion based on last term's actuals + enrollment change | 2 |
| Email/SMS alerts to Director on critical variances | 2 |
| Integration with school meal attendance register | 2 |

---

## 16. Risks and Control Measures

### 16.1 Risk Register

| # | Risk | Impact | Likelihood | Prevention | Detection | Audit |
|---|------|--------|:----------:|------------|-----------|-------|
| 1 | **Storekeeper fraud** — underrecording receipts, overrecording issues | Critical | Medium | Maker-checker on receipts (verified by Bursar); physical counts; supplier invoice cross-check | Storekeeper Accountability Report; physical count variances | Full audit trail on every receipt and issue |
| 2 | **Collusion between storekeeper and kitchen staff** | Critical | Low | Separation of duties (issue maker ≠ consumption recorder); surprise counts; Director review of accountability report | Repeated unexplained variances; pattern analysis in High Variance Report | Cross-reference issue records with consumption records |
| 3 | **Consumption recording manipulation** | High | Medium | Kitchen Manager records consumption; independent review by Bursar; consumption must tie to meal served | Variance analysis; headcount cross-check with attendance register (Phase 2) | Consumption records timestamped, user-tracked |
| 4 | **Budget overrun due to price increases** | High | High | Budget buffer (recommend 10%); supplier price trend monitoring; procurement negotiation | Budget threshold alerts at 80% and 100% | Budget vs actual report with trend |
| 5 | **Food spoilage from poor storage** | Medium | Medium | Track expiry dates; FEFO (First Expiry First Out) awareness; perishable count schedule | Expired stock alerts; spoilage wastage type tracking | Wastage report by type |
| 6 | **Inaccurate unit conversion** | Medium | Medium | Conversion factors set at item master level; validated by Bursar; highlighted on receipt | Variance at receipt level (expected vs actual store qty) | Audit on item master changes |
| 7 | **Incomplete daily records** | Medium | High | End-of-day alert if consumption not recorded; dashboard completeness indicator | "No consumption recorded" alert | Missing record detection |
| 8 | **Multi-device stock conflicts** | Medium | Low | Recommend single device for kitchen stores; sync conflict flagging | Conflict flag on sync | Conflict log with resolution trail |
| 9 | **Data loss from device failure** | High | Low | Regular cloud sync; SQLite WAL mode for crash recovery | Sync status indicator; last-sync warning if > 24hrs | Sync log |
| 10 | **Pest infestation causing bulk loss** | High | Medium | Regular stock counts; pest damage loss type; immediate alert to management | Wastage report with pest type; stock count variance | Loss records with evidence reference |
| 11 | **Budget estimation errors** | Medium | Medium | Base budget on actual historical data, not guesses; system proposes budget from trends | Budget vs actual deviation early in term | Budget version history |
| 12 | **Kitchen manager not recording consumption** | High | Medium | Alert if issues exist but no consumption record; gamification of completeness (Phase 2) | Dashboard completeness score; missing data alerts | Daily record completeness audit |
| 13 | **Unauthorized access to cost data** | Medium | Low | Role-based permissions; cost reports restricted to BURSAR, ACCOUNTANT, HT, DIRECTOR, AUDITOR | Permission violation logging | Access audit trail |
| 14 | **Supplier price manipulation** | Medium | Low | Price trend alerts (>15% increase flagged); multi-supplier comparison (Phase 2) | Supplier price trend report | Receipt price history per item per supplier |

### 16.2 Control Summary

| Control Type | Controls |
|-------------|----------|
| **Preventive** | Maker-checker enforcement, mandatory requisition-before-issue policy (configurable), cannot issue more than balance, variance explanation required before save, approval workflows, role-based access |
| **Detective** | Physical stock counts, variance analysis reports, storekeeper accountability report, budget threshold alerts, high-variance item alerts, consumption completeness checks |
| **Corrective** | Stock adjustments (approved), wastage recording, budget revisions, supplier changes, benchmark updates based on actuals |
| **Monitoring** | Kitchen dashboard with real-time KPIs, daily/weekly/monthly review cycles, Director-level accountability reviews |

### 16.3 Internal Controls vs External Controls

| Level | Controls |
|-------|---------|
| **System-level** | Automatic balance calculation, variance formulas, threshold alerts, maker-checker logic, audit trail, permission enforcement |
| **Process-level** | Daily consumption recording, weekly perishable counts, monthly full counts, term-end accountability review |
| **Management-level** | Bursar weekly review, Director monthly review, Board termly review (via summary reports) |
| **Audit-level** | Independent physical counts, movement trail verification, cross-check of supplier invoices against receipts |

---

*End of KITCHEN STORES & ACCOUNTABILITY specification.*
