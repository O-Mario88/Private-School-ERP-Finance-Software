# MAPLE School Finance ERP — ACCOUNTING ENGINE, POSTING RULES & APPROVAL MATRIX

**Version:** 1.0.0  
**Last Updated:** 2025-07-14  
**Country Context:** Uganda (UGX, URA, PAYE/NSSF/LST, ICPAU standards)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Chart of Accounts Structure](#2-chart-of-accounts-structure)
3. [Posting Engine Architecture](#3-posting-engine-architecture)
4. [Module Posting Rules](#4-module-posting-rules)
5. [Approval Matrix](#5-approval-matrix)
6. [Reversal Rules](#6-reversal-rules)
7. [Period Controls](#7-period-controls)
8. [Offline Posting Rules](#8-offline-posting-rules)
9. [Audit Trail Specification](#9-audit-trail-specification)
10. [Tax & Statutory Compliance](#10-tax--statutory-compliance)
11. [Reconciliation Rules](#11-reconciliation-rules)
12. [Reporting Period Close](#12-reporting-period-close)

---

## 1. Overview

This specification defines the complete accounting engine for MAPLE School Finance ERP, covering:

- **Double-entry posting rules** for every financial transaction
- **Chart of accounts** structure following Uganda ICPAU standards
- **Approval matrix** with role-based thresholds and multi-level escalation
- **Reversal mechanisms** for error correction and audit compliance
- **Period controls** for fiscal year management
- **Tax calculations** per URA (Uganda Revenue Authority) requirements
- **Offline posting** behavior and conflict resolution

### Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Double-entry** | Every transaction must balance (total debits = total credits) |
| **Immutable ledger** | Posted entries cannot be edited, only reversed |
| **Event-sourced** | Every posting creates a `FinancialEvent` with full payload |
| **Period-controlled** | Postings only allowed in open accounting periods |
| **Approval-gated** | Configurable approval thresholds per transaction type and role |
| **Uganda-compliant** | URA tax brackets, NSSF rates, LST schedules, VAT rules |

---

## 2. Chart of Accounts Structure

### 2.1 Account Numbering Scheme

MAPLE uses a 4-digit hierarchical numbering system:

```
X000 — Account Class (1-digit)
XX00 — Account Group (2-digit)
XXX0 — Sub-Group (3-digit)  
XXXX — Detail Account (4-digit)
```

### 2.2 Standard Chart of Accounts (Uganda School)

#### Class 1: Assets (1000-1999)

| Code | Account Name | Type | Sub-Type |
|------|-------------|------|----------|
| **1000** | **Current Assets** | Asset | Header |
| 1100 | Cash on Hand | Asset | Detail |
| 1110 | Petty Cash - Main Campus | Asset | Detail |
| 1120 | Petty Cash - Branch Campus | Asset | Detail |
| 1200 | Cash at Bank | Asset | Header |
| 1210 | Stanbic Bank - Operating | Asset | Detail |
| 1220 | Centenary Bank - Fees Collection | Asset | Detail |
| 1230 | dfcu Bank - Savings | Asset | Detail |
| 1240 | Bank of Africa - Treasury | Asset | Detail |
| 1250 | MTN MoMo Merchant Float | Asset | Detail |
| 1260 | Airtel Money Float | Asset | Detail |
| 1300 | Accounts Receivable | Asset | Header |
| 1310 | Student Fees Receivable | Asset | Detail |
| 1320 | Transport Fees Receivable | Asset | Detail |
| 1330 | Inventory Charges Receivable | Asset | Detail |
| 1340 | Government Bursary Receivable (MoES) | Asset | Detail |
| 1350 | Other Receivables | Asset | Detail |
| 1360 | Staff Advances Receivable | Asset | Detail |
| 1400 | Inventory | Asset | Header |
| 1410 | Textbooks Inventory | Asset | Detail |
| 1420 | Uniforms Inventory | Asset | Detail |
| 1430 | Stationery Inventory | Asset | Detail |
| 1440 | Other Inventory | Asset | Detail |
| 1500 | Prepaid Expenses | Asset | Header |
| 1510 | Prepaid Insurance | Asset | Detail |
| 1520 | Prepaid Rent | Asset | Detail |
| **1600** | **Non-Current Assets** | Asset | Header |
| 1610 | Land | Asset | Detail |
| 1620 | Buildings | Asset | Detail |
| 1621 | Accumulated Depreciation - Buildings | Asset | Contra |
| 1630 | Motor Vehicles | Asset | Detail |
| 1631 | Accumulated Depreciation - Vehicles | Asset | Contra |
| 1640 | Furniture & Fixtures | Asset | Detail |
| 1641 | Accumulated Depreciation - Furniture | Asset | Contra |
| 1650 | IT Equipment | Asset | Detail |
| 1651 | Accumulated Depreciation - IT Equipment | Asset | Contra |
| 1660 | Lab Equipment | Asset | Detail |
| 1661 | Accumulated Depreciation - Lab Equipment | Asset | Contra |
| 1670 | Library Books (Capitalized) | Asset | Detail |
| 1671 | Accumulated Depreciation - Library | Asset | Contra |

#### Class 2: Liabilities (2000-2999)

| Code | Account Name | Type | Sub-Type |
|------|-------------|------|----------|
| **2000** | **Current Liabilities** | Liability | Header |
| 2100 | Accounts Payable | Liability | Header |
| 2110 | Trade Creditors | Liability | Detail |
| 2120 | Accrued Expenses | Liability | Detail |
| 2200 | Statutory Payables | Liability | Header |
| 2210 | PAYE Payable | Liability | Detail |
| 2220 | NSSF Payable (Employee + Employer) | Liability | Detail |
| 2230 | LST Payable | Liability | Detail |
| 2240 | VAT Payable | Liability | Detail |
| 2300 | Salary Payable | Liability | Header |
| 2310 | Net Salary Payable | Liability | Detail |
| 2320 | SACCO Deduction Payable | Liability | Detail |
| 2330 | Loan Deduction Payable | Liability | Detail |
| 2400 | Advance Fees Received | Liability | Detail |
| 2410 | Student Deposits | Liability | Detail |
| 2500 | Short-Term Borrowings | Liability | Detail |
| **2600** | **Non-Current Liabilities** | Liability | Header |
| 2610 | Long-Term Loans | Liability | Detail |
| 2620 | Deferred Revenue | Liability | Detail |

#### Class 3: Equity (3000-3999)

| Code | Account Name | Type | Sub-Type |
|------|-------------|------|----------|
| 3000 | Owners' Equity / Capital | Equity | Header |
| 3100 | Proprietor's Capital | Equity | Detail |
| 3200 | Retained Surplus | Equity | Detail |
| 3300 | Current Year Surplus/Deficit | Equity | Detail |
| 3400 | Reserves | Equity | Detail |
| 3410 | Capital Development Fund | Equity | Detail |
| 3420 | Building Reserve | Equity | Detail |

#### Class 4: Revenue (4000-4999)

| Code | Account Name | Type | Sub-Type |
|------|-------------|------|----------|
| **4000** | **Fee Revenue** | Revenue | Header |
| 4100 | Tuition Revenue | Revenue | Detail |
| 4110 | Tuition - O-Level (S1-S4) | Revenue | Detail |
| 4120 | Tuition - A-Level (S5-S6) | Revenue | Detail |
| 4200 | Registration Fees | Revenue | Detail |
| 4300 | Exam Fees | Revenue | Detail |
| 4310 | UNEB Exam Fees (Passed Through) | Revenue | Detail |
| 4400 | Activity Fees | Revenue | Detail |
| 4410 | Co-Curricular Activity Fees | Revenue | Detail |
| 4420 | Sports Fees | Revenue | Detail |
| **4500** | **Transport Revenue** | Revenue | Header |
| 4510 | Transport Fees - Term | Revenue | Detail |
| 4520 | Transport Fees - One-Way | Revenue | Detail |
| **4600** | **Boarding Revenue** | Revenue | Header |
| 4610 | Boarding Fees | Revenue | Detail |
| 4620 | Boarding Meals Surcharge | Revenue | Detail |
| **4700** | **Other Revenue** | Revenue | Header |
| 4710 | Uniform Sales Revenue | Revenue | Detail |
| 4720 | Book Sales Revenue | Revenue | Detail |
| 4730 | Interest Income | Revenue | Detail |
| 4740 | Rental Income | Revenue | Detail |
| 4750 | Donation Income | Revenue | Detail |
| 4760 | Government Grants Revenue | Revenue | Detail |
| 4770 | Penalty / Late Fee Income | Revenue | Detail |

#### Class 5: Cost of Services (5000-5999)

| Code | Account Name | Type | Sub-Type |
|------|-------------|------|----------|
| **5000** | **Direct Costs** | Expense | Header |
| 5100 | Teaching Staff Salaries | Expense | Detail |
| 5110 | Teaching Allowances | Expense | Detail |
| 5120 | Employer NSSF - Teaching | Expense | Detail |
| 5200 | Textbook Costs (COGS) | Expense | Detail |
| 5210 | Uniform Costs (COGS) | Expense | Detail |
| 5220 | Stationery Costs (COGS) | Expense | Detail |
| 5300 | Exam Materials & Costs | Expense | Detail |
| 5400 | Transport Operating Costs | Expense | Detail |
| 5410 | Fuel & Lubricants | Expense | Detail |
| 5420 | Vehicle Maintenance | Expense | Detail |
| 5430 | Driver Wages | Expense | Detail |
| 5440 | Vehicle Insurance | Expense | Detail |
| 5500 | Boarding Costs | Expense | Detail |
| 5510 | Food & Provisions | Expense | Detail |
| 5520 | Kitchen Staff Wages | Expense | Detail |
| 5530 | Kitchen Supplies | Expense | Detail |

#### Class 6: Operating Expenses (6000-6999)

| Code | Account Name | Type | Sub-Type |
|------|-------------|------|----------|
| **6000** | **Administrative Expenses** | Expense | Header |
| 6100 | Admin Staff Salaries | Expense | Detail |
| 6110 | Admin Staff Allowances | Expense | Detail |
| 6120 | Employer NSSF - Admin | Expense | Detail |
| 6200 | Office Supplies | Expense | Detail |
| 6210 | Printing & Stationery | Expense | Detail |
| 6220 | Postage & Communication | Expense | Detail |
| 6300 | Utilities | Expense | Header |
| 6310 | Electricity (UMEME) | Expense | Detail |
| 6320 | Water (NWSC) | Expense | Detail |
| 6330 | Internet & Telephone | Expense | Detail |
| 6400 | Maintenance & Repairs | Expense | Header |
| 6410 | Building Maintenance | Expense | Detail |
| 6420 | Equipment Maintenance | Expense | Detail |
| 6430 | Grounds Maintenance | Expense | Detail |
| 6500 | Insurance | Expense | Detail |
| 6600 | Security | Expense | Detail |
| 6700 | Professional Fees | Expense | Header |
| 6710 | Audit Fees | Expense | Detail |
| 6720 | Legal Fees | Expense | Detail |
| 6730 | Consulting Fees | Expense | Detail |
| 6800 | Depreciation Expense | Expense | Header |
| 6810 | Depreciation - Buildings | Expense | Detail |
| 6820 | Depreciation - Vehicles | Expense | Detail |
| 6830 | Depreciation - Furniture | Expense | Detail |
| 6840 | Depreciation - IT Equipment | Expense | Detail |
| 6850 | Depreciation - Lab Equipment | Expense | Detail |
| 6860 | Depreciation - Library | Expense | Detail |
| 6900 | Other Operating Expenses | Expense | Header |
| 6910 | Bank Charges | Expense | Detail |
| 6920 | Licenses & Permits | Expense | Detail |
| 6930 | Staff Training | Expense | Detail |
| 6940 | Travel & Transport | Expense | Detail |
| 6950 | Marketing & Advertising | Expense | Detail |
| 6960 | Scholarships & Bursaries Expense | Expense | Detail |
| 6970 | Bad Debts Expense | Expense | Detail |
| 6980 | Miscellaneous Expense | Expense | Detail |

#### Class 7: Other Income/Expense (7000-7999)

| Code | Account Name | Type | Sub-Type |
|------|-------------|------|----------|
| 7100 | Interest Expense | Expense | Detail |
| 7200 | Foreign Exchange Gain/Loss | Revenue/Expense | Detail |
| 7300 | Gain/Loss on Asset Disposal | Revenue/Expense | Detail |

---

## 3. Posting Engine Architecture

### 3.1 Engine Flow

```
Transaction Event
       │
       ▼
┌──────────────────┐
│  Validation Layer │─── Period open? Balance check? Amounts valid?
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Posting Rules   │─── Look up rule by TransactionType
│  Engine          │─── Determine GL accounts (DR / CR)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Journal Builder │─── Create JournalEntry with line items
│                  │─── Ensure debits = credits
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Approval Check  │─── Does amount exceed threshold?
│                  │─── Route to approver if needed
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Post & Commit   │─── Insert event + journal to SQLite
│                  │─── Update GL balances
│                  │─── Create audit log entry
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Sync Queue      │─── Add to offline sync queue
└──────────────────┘
```

### 3.2 Posting Rule Structure

Each posting rule is defined as:

```rust
struct PostingRule {
    transaction_type: TransactionType,
    description: String,
    debit_accounts: Vec<AccountMapping>,
    credit_accounts: Vec<AccountMapping>,
    conditions: Vec<PostingCondition>,
    approval_required: bool,
    approval_threshold: Option<i64>,  // UGX amount
}

struct AccountMapping {
    account_code: String,            // GL account code or lookup key
    source: AmountSource,            // Where to get the amount
    is_dynamic: bool,                // Resolved at runtime (e.g., from fee rule)
}

enum AmountSource {
    FullAmount,                      // Use transaction total
    LineItemAmount,                  // Per line item
    CalculatedField(String),         // Named calculation (e.g., "paye", "nssf")
    Percentage(f64, String),         // % of another field
}
```

### 3.3 Account Resolution

Dynamic accounts are resolved at posting time:

| Scenario | Resolution |
|----------|------------|
| Fee invoice line | Fee rule's `glRevenueAccount` field |
| Payment receipt | Bank account's linked GL account |
| Payroll PAYE | System setting: `gl_paye_payable` (default: 2210) |
| Payroll NSSF | System setting: `gl_nssf_payable` (default: 2220) |
| Supplier bill line | Bill line's `glAccountId` field |
| Depreciation | Asset's `glDepreciationAccount` and `glAccumDepnAccount` |

---

## 4. Module Posting Rules

### 4.1 Fee Invoicing

#### Rule: INVOICE_CREATED

| When | Student invoice is issued (status → ISSUED) |
|------|-----|
| **Trigger** | `TransactionType::INVOICE_CREATED` |
| **Source** | Invoice line items |

**Journal Entry per Line Item:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 1310 (Student Fees Receivable) | Line amount | `lineAmount` |
| CR | 4XXX (Revenue — per fee type) | Line amount | Fee rule's `glRevenueAccount` |

**Example (S1 student, Term 1):**

| DR/CR | Account | Description | UGX |
|-------|---------|-------------|-----|
| DR | 1310 | Student Fees Receivable | 2,700,000 |
| CR | 4110 | Tuition Revenue - O-Level | 1,800,000 |
| CR | 4400 | Activity Fees | 270,000 |
| CR | 4300 | Exam Fees | 135,000 |
| CR | 4200 | Registration Fees | 135,000 |
| CR | 4720 | Book Sales Revenue | 360,000 |

**Conditions:**
- Invoice status must change to ISSUED
- DRAFT invoices are not posted
- Invoice date must be in an open period
- All line item GL accounts must be active Revenue accounts

---

#### Rule: CREDIT_NOTE_CREATED

| When | Credit note issued against an invoice |
|------|-----|
| **Trigger** | `TransactionType::CREDIT_NOTE` |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 4XXX (Original revenue account) | Credit amount | Per credit line |
| CR | 1310 (Student Fees Receivable) | Total credit | Sum of credits |

---

#### Rule: DEBIT_NOTE_CREATED

| When | Additional charge raised |
|------|-----|
| **Trigger** | `TransactionType::DEBIT_NOTE` |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 1310 (Student Fees Receivable) | Debit amount | Per line |
| CR | 4XXX (Revenue / per line GL) | Line amount | Per line GL |

---

### 4.2 Payment Receipt

#### Rule: PAYMENT_POSTED

| When | Payment received from family/student |
|------|-----|
| **Trigger** | `TransactionType::PAYMENT_POSTED` |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 1XXX (Cash/Bank account) | Payment amount | Full amount |
| CR | 1310 (Student Fees Receivable) | Allocated amount | Sum of allocations |
| CR | 2400 (Advance Fees Received) | Unapplied amount | If any unapplied |

**Account Resolution by Payment Method:**

| Method | DR Account |
|--------|-----------|
| Cash | 1100 (Cash on Hand) |
| Cheque | 1210 (Bank — pending clearing) |
| Bank Transfer | 12XX (specific bank GL) |
| MTN MoMo | 1250 (MTN MoMo Float) |
| Airtel Money | 1260 (Airtel Money Float) |
| Card | 12XX (merchant bank GL) |

**Example (MTN MoMo payment, UGX 1,500,000):**

| DR/CR | Account | Description | UGX |
|-------|---------|-------------|-----|
| DR | 1250 | MTN MoMo Merchant Float | 1,500,000 |
| CR | 1310 | Student Fees Receivable | 1,500,000 |

**Conditions:**
- Payment date in open period
- Allocation amounts ≤ invoice outstanding balances
- Payment amount > 0

---

#### Rule: PAYMENT_REVERSAL

| When | Payment is reversed (bounced cheque, fraud, error) |
|------|-----|
| **Trigger** | `TransactionType::REVERSAL` |

**Journal Entry (exact opposite of original):**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 1310 (Student Fees Receivable) | Original allocated | — |
| DR | 2400 (Advance Fees) | Original unapplied | If any |
| CR | 1XXX (Original bank/cash) | Original amount | — |

---

### 4.3 Payroll

#### Rule: PAYROLL_POSTED

| When | Monthly payroll is approved and posted |
|------|-----|
| **Trigger** | `TransactionType::PAYROLL_POSTED` (custom) |

**Journal Entry (per employee, batched into one JE):**

##### Salary Expense Recognition

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 5100 or 6100 | Gross salary | `grossSalary` (per dept) |
| CR | 2210 | PAYE deduction | `paye` |
| CR | 2220 | NSSF (employee 5%) | `nssf_employee` |
| CR | 2230 | LST deduction | `lst` |
| CR | 2320 | SACCO deductions | Voluntary amt |
| CR | 2330 | Loan deductions | Loan amt |
| CR | 2310 | Net salary payable | `netSalary` |

##### Employer Statutory Contributions

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 5120 or 6120 | Employer NSSF (10%) | `grossSalary × 10%` |
| CR | 2220 | NSSF payable (employer) | Same amount |

**Example (Teacher, gross UGX 2,700,000/month):**

| DR/CR | Account | Description | UGX |
|-------|---------|-------------|-----|
| DR | 5100 | Teaching Staff Salaries | 2,700,000 |
| CR | 2210 | PAYE Payable | 401,500 |
| CR | 2220 | NSSF Payable (Employee 5%) | 135,000 |
| CR | 2230 | LST Payable | 10,000 |
| CR | 2310 | Net Salary Payable | 2,153,500 |
| DR | 5120 | Employer NSSF Expense | 270,000 |
| CR | 2220 | NSSF Payable (Employer 10%) | 270,000 |

##### PAYE Calculation (URA Monthly Brackets)

```
Monthly Gross     Tax Rate    Cumulative
0 – 235,000       0%          0
235,001 – 335,000 10%         10,000
335,001 – 410,000 20%         25,000
410,001 – 10,000,000  30%     varies
Above 10,000,000   40%        varies
```

**Example PAYE for UGX 2,700,000 gross:**
```
First 235,000:          0% =         0
Next 100,000 (335K):   10% =    10,000
Next 75,000 (410K):    20% =    15,000
Next 2,290,000 (2.7M): 30% =   687,000
Total PAYE:                    712,000
```

*Note: The payroll engine stores the exact PAYE bracket table as configurable system data, updateable when URA revises brackets.*

##### LST Schedule (Local Service Tax)

| Annual Gross Income (UGX) | Annual LST (UGX) | Monthly (UGX) |
|--------------------------|-------------------|---------------|
| ≤ 1,200,000 | 0 | 0 |
| 1,200,001 – 2,400,000 | 10,000 | 833 |
| 2,400,001 – 4,800,000 | 20,000 | 1,667 |
| 4,800,001 – 12,000,000 | 40,000 | 3,333 |
| 12,000,001 – 24,000,000 | 60,000 | 5,000 |
| 24,000,001 – 36,000,000 | 80,000 | 6,667 |
| Above 36,000,000 | 100,000 | 8,333 |

---

#### Rule: SALARY_PAYMENT

| When | Net salaries paid (bank transfer or cash) |
|------|-----|
| **Trigger** | `TransactionType::SALARY_PAYMENT` (custom) |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 2310 | Net Salary Payable | Total nets | 
| CR | 12XX | Bank (payroll account) | Total nets |

---

#### Rule: STATUTORY_REMITTANCE

| When | PAYE/NSSF/LST paid to government |
|------|-----|
| **Trigger** | `TransactionType::STATUTORY_PAYMENT` (custom) |

**Journal Entry (PAYE):**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 2210 | PAYE Payable | Period total |
| CR | 12XX | Bank | Same |

**Journal Entry (NSSF):**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 2220 | NSSF Payable (5% + 10%) | Period total |
| CR | 12XX | Bank | Same |

**Journal Entry (LST):**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 2230 | LST Payable | Period total |
| CR | 12XX | Bank | Same |

---

### 4.4 Accounts Payable

#### Rule: SUPPLIER_BILL_POSTED

| When | Supplier bill approved/posted |
|------|-----|
| **Trigger** | `TransactionType::SUPPLIER_BILL_POSTED` (custom) |

**Journal Entry per Line Item:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 6XXX / 1XXX (per-line GL) | Line amount | `lineAmount` |
| DR | 2240 (VAT Payable) | Line tax | If input VAT |
| CR | 2110 (Trade Creditors) | Total amount | `totalAmount` |

**Example (UMEME electricity bill UGX 4,500,000):**

| DR/CR | Account | Description | UGX |
|-------|---------|-------------|-----|
| DR | 6310 | Electricity (UMEME) | 3,913,043 |
| DR | 2240 | VAT Input (18%) | 586,957 |
| CR | 2110 | Trade Creditors | 4,500,000 |

---

#### Rule: SUPPLIER_PAYMENT_POSTED

| When | Supplier payment processed |
|------|-----|
| **Trigger** | `TransactionType::SUPPLIER_PAYMENT` (custom) |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 2110 (Trade Creditors) | Payment amount | — |
| CR | 12XX (Bank) | Payment amount | Bank GL |

---

### 4.5 Fixed Assets

#### Rule: ASSET_CAPITALIZED

| When | New asset registered with purchase cost |
|------|-----|
| **Trigger** | `TransactionType::ASSET_CAPITALIZED` (custom) |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 16XX (Asset category GL) | Purchase cost | `purchaseCost` |
| CR | 12XX (Bank) or 2110 (AP) | Same | Payment source |

**Example (Toyota Coaster bus, UGX 189,000,000):**

| DR/CR | Account | Description | UGX |
|-------|---------|-------------|-----|
| DR | 1630 | Motor Vehicles | 189,000,000 |
| CR | 1210 | Stanbic Bank - Operating | 189,000,000 |

---

#### Rule: DEPRECIATION_POSTED

| When | Monthly depreciation run |
|------|-----|
| **Trigger** | `TransactionType::DEPRECIATION_POSTED` (custom) |

**Journal Entry per Asset:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 68XX (Depreciation expense) | Monthly amount | Calculated |
| CR | 16X1 (Accum depreciation) | Same | Contra asset |

**Calculation Methods:**

Straight Line:
$$\text{Monthly Depreciation} = \frac{\text{Cost} - \text{Salvage Value}}{\text{Useful Life (months)}}$$

Reducing Balance:
$$\text{Monthly Depreciation} = \frac{\text{Net Book Value} \times \text{Annual Rate}}{12}$$

Where:
$$\text{Annual Rate} = 1 - \left(\frac{\text{Salvage Value}}{\text{Cost}}\right)^{1/\text{Useful Life (years)}}$$

---

#### Rule: ASSET_DISPOSED

| When | Asset sold, scrapped, or written off |
|------|-----|
| **Trigger** | `TransactionType::ASSET_DISPOSED` (custom) |

**Journal Entry (Sale):**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 12XX (Bank/Cash) | Proceeds | Sale price |
| DR | 16X1 (Accum Depreciation) | Total depn | Accumulated |
| CR | 16XX (Asset) | Original cost | Purchase cost |
| DR/CR | 7300 (Gain/Loss) | Difference | Proceeds - NBV |

**Example (IT equipment, cost UGX 8,100,000, accum depn UGX 5,400,000, sold for UGX 1,350,000):**

| DR/CR | Account | Description | UGX |
|-------|---------|-------------|-----|
| DR | 1210 | Bank - Stanbic | 1,350,000 |
| DR | 1651 | Accum Depn - IT | 5,400,000 |
| CR | 1650 | IT Equipment | 8,100,000 |
| DR | 7300 | Loss on Disposal | 1,350,000 |

*NBV = UGX 8,100,000 - UGX 5,400,000 = UGX 2,700,000. Loss = 1,350,000 - 2,700,000 = (1,350,000)*

---

### 4.6 Treasury / Banking

#### Rule: BANK_TRANSFER

| When | Inter-bank transfer |
|------|-----|
| **Trigger** | `TransactionType::BANK_TRANSFER` (custom) |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 12XX (To bank GL) | Transfer amount | — |
| CR | 12XX (From bank GL) | Transfer amount | — |

---

#### Rule: PETTY_CASH_VOUCHER

| When | Petty cash disbursement |
|------|-----|
| **Trigger** | `TransactionType::PETTY_CASH` (custom) |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 6XXX (Expense GL) | Voucher amount | — |
| CR | 1110 (Petty Cash) | Same | — |

---

#### Rule: PETTY_CASH_REPLENISHMENT

| When | Petty cash fund replenished from bank |
|------|-----|
| **Trigger** | `TransactionType::PETTY_CASH_REPLENISH` (custom) |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 1110 (Petty Cash) | Replenishment amount | — |
| CR | 12XX (Bank) | Same | — |

---

### 4.7 Inventory

#### Rule: INVENTORY_RECEIVED

| When | Stock received from supplier |
|------|-----|
| **Trigger** | `TransactionType::INVENTORY_RECEIVED` (custom) |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 14XX (Inventory) | Total cost | Qty × Unit Cost |
| CR | 2110 (AP) or 1XXX (Cash/Bank) | Same | Payment source |

---

#### Rule: INVENTORY_ISSUED

| When | Stock issued to student or department |
|------|-----|
| **Trigger** | `TransactionType::INVENTORY_ISSUED` (custom) |

**Journal Entry (charged to student):**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 1330 (Inventory Charges Receivable) | Selling price | — |
| CR | 4710/4720 (Sales Revenue) | Selling price | — |
| DR | 52XX (COGS) | Cost price | — |
| CR | 14XX (Inventory) | Cost price | — |

**Journal Entry (issued to department — no charge):**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 6200/52XX (Expense) | Cost | — |
| CR | 14XX (Inventory) | Cost | — |

---

### 4.8 Scholarships & Bursaries

#### Rule: BURSARY_DISBURSED

| When | Approved bursary applied to student account |
|------|-----|
| **Trigger** | `TransactionType::BURSARY_DISBURSED` (custom) |

**Journal Entry (Internal Scholarship):**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 6960 (Scholarships Expense) | Approved amount | — |
| CR | 1310 (Student Fees Receivable) | Same | — |

**Journal Entry (Government/External Bursary):**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 1340 (Govt Bursary Receivable) | Approved amount | — |
| CR | 1310 (Student Fees Receivable) | Same | — |

*When MoES/district payment is received:*

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 12XX (Bank) | Cash received | — |
| CR | 1340 (Govt Bursary Receivable) | Same | — |

---

### 4.9 Bad Debt Write-Off

#### Rule: BAD_DEBT_WRITTEN_OFF

| When | Uncollectable fee balance written off |
|------|-----|
| **Trigger** | `TransactionType::ADJUSTMENT` |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 6970 (Bad Debts Expense) | Write-off amount | — |
| CR | 1310 (Student Fees Receivable) | Same | — |

---

### 4.10 Year-End Closing

#### Rule: YEAR_END_CLOSE

| When | Fiscal year closing process |
|------|-----|
| **Trigger** | `TransactionType::PERIOD_CLOSE` (custom) |

**Journal Entry:**

| DR/CR | Account | Amount | Source |
|-------|---------|--------|--------|
| DR | 4XXX (All revenue accounts) | Year totals | Zeroed out |
| CR | 5XXX/6XXX (All expense accounts) | Year totals | Zeroed out |
| DR/CR | 3300 (Current Year Surplus) | Net difference | Revenue - Expense |

After closing:
- 3300 balance → transfer to 3200 (Retained Surplus)
- All revenue/expense accounts reset to zero
- Opening balances carried forward for asset/liability/equity accounts

---

## 5. Approval Matrix

### 5.1 Approval Levels

| Level | Approver | Description |
|-------|----------|-------------|
| L0 | None | No approval needed (auto-approved) |
| L1 | BURSAR | First-level financial approval |
| L2 | DIRECTOR | Second-level executive approval |
| L3 | BOARD_FINANCE_VIEWER | Board/governance approval |
| L4 | SUPER_ADMIN + DIRECTOR | Dual approval required |

### 5.2 Amount-Based Thresholds (UGX)

| Transaction Type | L0 (Auto) | L1 (Bursar) | L2 (Director) | L3 (Board) |
|-----------------|-----------|-------------|----------------|------------|
| **Student Invoice** | All | — | — | — |
| **Payment Receipt** | ≤ 5,000,000 | > 5,000,000 | — | — |
| **Payment Reversal** | — | — | All | — |
| **Manual Journal** | — | ≤ 10,000,000 | > 10,000,000 | — |
| **Journal Reversal** | — | — | All | — |
| **Supplier Bill** | — | ≤ 5,000,000 | > 5,000,000 | > 50,000,000 |
| **Supplier Payment** | — | ≤ 5,000,000 | > 5,000,000 | — |
| **Payroll Run** | — | Recommends | Approves | — |
| **Payroll Reversal** | — | — | All | — |
| **Bank Transfer** | — | ≤ 10,000,000 | > 10,000,000 | — |
| **Petty Cash Voucher** | — | All | — | — |
| **Asset Purchase** | — | ≤ 20,000,000 | > 20,000,000 | > 100,000,000 |
| **Asset Disposal** | — | — | All | All (dual) |
| **Budget Creation** | — | Submits | Approves | Approves |
| **Budget Revision** | — | — | All | — |
| **Fee Rule Change** | — | — | All | — |
| **Fee Waiver** | — | — | All | > 5,000,000 |
| **Bursary > 2M/term** | — | — | Approves | Approves |
| **Bad Debt Write-Off** | — | — | Approves | Approves (dual) |
| **Billing Run** | — | ≤ 50,000,000 total | > 50,000,000 | — |
| **Accounting Period Close** | — | — | All | — |

### 5.3 Approval Workflow

```
Initiator submits transaction
       │
       ▼
┌──────────────────┐     Amount ≤ threshold?
│  Check Threshold │──── Yes ──→ AUTO-APPROVED → Post
└────────┬─────────┘
         │ No
         ▼
┌──────────────────┐
│  Route to L1     │──── BURSAR reviews
│  Approver        │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
 APPROVED   REJECTED
    │         │
    │         └──→ Return to initiator with comments
    ▼
┌──────────────────┐     Amount > L2 threshold?
│  Check L2 Need   │──── No ──→ Post
└────────┬─────────┘
         │ Yes
         ▼
┌──────────────────┐
│  Route to L2     │──── DIRECTOR reviews
│  Approver        │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
 APPROVED   REJECTED
    │         │
    │         └──→ Return to L1 with comments
    ▼
┌──────────────────┐     Board approval needed?
│  Check L3 Need   │──── No ──→ Post
└────────┬─────────┘
         │ Yes
         ▼
   Route to BOARD → APPROVED → Post
```

### 5.4 Approval Rules Table

| Rule ID | Transaction Type | Condition | Action | Approver |
|---------|-----------------|-----------|--------|----------|
| APR-001 | `PAYMENT_POSTED` | `amount > 5,000,000` | REQUIRE_APPROVAL | BURSAR |
| APR-002 | `JOURNAL_ENTRY` | `amount > 10,000,000` | REQUIRE_APPROVAL | DIRECTOR |
| APR-003 | `SUPPLIER_BILL` | `amount > 5,000,000` | REQUIRE_APPROVAL | DIRECTOR |
| APR-004 | `SUPPLIER_BILL` | `amount > 50,000,000` | REQUIRE_APPROVAL | BOARD |
| APR-005 | `REVERSAL` | `any` | REQUIRE_APPROVAL | DIRECTOR |
| APR-006 | `PAYROLL_POSTED` | `any` | REQUIRE_APPROVAL | DIRECTOR |
| APR-007 | `BANK_TRANSFER` | `amount > 10,000,000` | REQUIRE_APPROVAL | DIRECTOR |
| APR-008 | `ASSET_CAPITALIZED` | `amount > 20,000,000` | REQUIRE_APPROVAL | DIRECTOR |
| APR-009 | `ASSET_CAPITALIZED` | `amount > 100,000,000` | REQUIRE_APPROVAL | BOARD |
| APR-010 | `ASSET_DISPOSED` | `any` | REQUIRE_APPROVAL | DIRECTOR + BOARD |
| APR-011 | `BUDGET_SUBMITTED` | `any` | REQUIRE_APPROVAL | DIRECTOR |
| APR-012 | `BUDGET_SUBMITTED` | `any` | REQUIRE_APPROVAL | BOARD |
| APR-013 | `FEE_RULE_CHANGE` | `any` | REQUIRE_APPROVAL | DIRECTOR |
| APR-014 | `FEE_WAIVER` | `amount > 5,000,000` | REQUIRE_APPROVAL | BOARD |
| APR-015 | `BAD_DEBT_WRITEOFF` | `any` | REQUIRE_APPROVAL | DIRECTOR + BOARD |
| APR-016 | `BURSARY_APPROVED` | `amount > 2,000,000/term` | REQUIRE_APPROVAL | BOARD |
| APR-017 | `PERIOD_CLOSE` | `any` | REQUIRE_APPROVAL | DIRECTOR |
| APR-018 | `BILLING_RUN` | `total > 50,000,000` | REQUIRE_APPROVAL | DIRECTOR |
| APR-019 | `PETTY_CASH` | `any` | REQUIRE_APPROVAL | BURSAR |
| APR-020 | `SUPPLIER_PAYMENT` | `amount > 5,000,000` | REQUIRE_APPROVAL | DIRECTOR |

### 5.5 Delegation & Absence

When an approver is absent:

1. **Delegation**: DIRECTOR can delegate approval authority to BURSAR for a date range
2. **Escalation**: If approval pending > 48 hours, escalate to next level
3. **Emergency**: SUPER_ADMIN can override any pending approval with audit note

**Delegation Setup:**

| Field | Type | Required |
|-------|------|----------|
| Delegator | SEARCH(User) | Yes |
| Delegate | SEARCH(User) | Yes |
| Start Date | DATE | Yes |
| End Date | DATE | Yes |
| Transaction Types | ENUM[] | Yes (which types can delegate approve) |
| Max Amount | CURRENCY | Yes (delegate's approval cap) |

---

## 6. Reversal Rules

### 6.1 General Reversal Principles

| Principle | Rule |
|-----------|------|
| **Immutability** | Original entry is never modified or deleted |
| **Mirror entry** | Reversal creates exact opposite journal (DR↔CR swap) |
| **Linking** | Reversal references original entry ID |
| **Dating** | Reversal date must be in an open period |
| **Approval** | All reversals require DIRECTOR approval |
| **Reason** | Minimum 20-character reason required |
| **Cascade** | Reversing a payment reverses all allocations |
| **One-time** | An entry can only be reversed once |
| **Re-posting** | After reversal, a correcting entry can be created |

### 6.2 Reversal by Transaction Type

| Transaction Type | Can Reverse? | Cascading Effects | Additional Rules |
|-----------------|:---:|---|---|
| Invoice (ISSUED) | Yes (via Credit Note) | Recalculates student balance | Cannot reverse if payments applied > credit |
| Invoice (DRAFT) | Yes (Cancel) | None | No journal to reverse |
| Payment | Yes | Un-allocates from invoices, reopens them | Recalculates family balance |
| Journal Entry | Yes | Updates GL balances | Only if posted status |
| Supplier Bill | Yes | Reopens AP balance | Cannot reverse if partially/fully paid |
| Supplier Payment | Yes | Reopens supplier invoices | Recalculates AP aging |
| Payroll Run | Yes | Reverses all payroll items | Recalculates statutory payables |
| Depreciation | Yes | Adjusts accumulated depreciation | Typically month-end only |
| Bank Transfer | Yes | Restores both bank balances | Both accounts adjusted |
| Asset Disposal | No | — | Must use manual JE for corrections |
| Year-End Close | No | — | Cannot reopen closed year |

### 6.3 Reversal Audit Trail

Every reversal generates:

```
AuditLogEntry {
  action: 'reverse',
  entityType: 'journal_entry',
  entityId: original_je_id,
  userId: reverser_id,
  timestamp: now,
  oldValue: { status: 'posted' },
  newValue: { status: 'reversed', reversalJeId: new_je_id },
  reason: user_provided_reason,
}
```

---

## 7. Period Controls

### 7.1 Accounting Period States

```
┌────────┐     Open     ┌────────┐    Close     ┌────────┐     Lock     ┌────────┐
│ FUTURE │────────────→ │  OPEN  │────────────→ │ CLOSED │───────────→ │ LOCKED │
└────────┘              └────────┘              └────────┘             └────────┘
                             │                       │
                             │                       │ Reopen (DIRECTOR)
                             │                       │
                             │                       ▼
                             │◄──────────────────────┘
                             │  (Only if not locked)
```

### 7.2 Period Rules

| Rule | Description |
|------|-------------|
| **One open period** | At most ONE period can be open at a time (current month) |
| **Sequential opening** | Periods must be opened in sequence (no skipping months) |
| **Posting restriction** | Transactions can only be posted to OPEN periods |
| **Soft close** | CLOSED periods can be reopened by DIRECTOR (with audit note) |
| **Hard lock** | LOCKED periods cannot be reopened; requires SUPER_ADMIN + database migration |
| **Auto-open** | System auto-opens next period on the 1st of each month |
| **Grace period** | Previous month stays open until the 5th of current month (configurable) |
| **Year-end** | December close triggers year-end closing entries |

### 7.3 Period Calendar (Standard)

| Period | Label | Start | End | Close Deadline |
|--------|-------|-------|-----|---------------|
| P1 | January | Jan 1 | Jan 31 | Feb 5 |
| P2 | February | Feb 1 | Feb 28/29 | Mar 5 |
| P3 | March | Mar 1 | Mar 31 | Apr 5 |
| P4 | April | Apr 1 | Apr 30 | May 5 |
| P5 | May | May 1 | May 31 | Jun 5 |
| P6 | June | Jun 1 | Jun 30 | Jul 5 |
| P7 | July | Jul 1 | Jul 31 | Aug 5 |
| P8 | August | Aug 1 | Aug 31 | Sep 5 |
| P9 | September | Sep 1 | Sep 30 | Oct 5 |
| P10 | October | Oct 1 | Oct 31 | Nov 5 |
| P11 | November | Nov 1 | Nov 30 | Dec 5 |
| P12 | December | Dec 1 | Dec 31 | Jan 10 |
| P13 | Year-End Adj | Dec 31 | Dec 31 | Jan 15 |

### 7.4 Date Validation Logic

```rust
fn validate_posting_date(date: NaiveDate) -> Result<(), PostingError> {
    let period = find_period_for_date(date)?;
    
    match period.status {
        PeriodStatus::Open => Ok(()),
        PeriodStatus::Future => Err(PostingError::PeriodNotYetOpen),
        PeriodStatus::Closed => Err(PostingError::PeriodClosed {
            period: period.name,
            closed_on: period.close_date.unwrap(),
        }),
        PeriodStatus::Locked => Err(PostingError::PeriodLocked),
    }
}
```

---

## 8. Offline Posting Rules

### 8.1 Offline-Capable Transactions

| Transaction | Offline? | Conflict Risk | Resolution |
|------------|:---:|:---:|---|
| Invoice creation | ✓ | Low | Auto-number collision → reassign |
| Payment receipt | ✓ | Medium | Duplicate detection by reference # |
| Manual journal | ✓ | Low | Version check on accounts |
| Fee rule change | ✓ | High | Last-writer-wins with notification |
| Supplier bill | ✓ | Low | Auto-number collision → reassign |
| Payroll run | ✓ | High | Only one device can run; lock acquired |
| Bank recon | ✗ | — | Requires current bank data |
| Period close | ✗ | — | Requires all devices synced |
| Year-end close | ✗ | — | Requires full sync + approval |

### 8.2 Offline Numbering

Auto-generated numbers use a device-specific prefix to prevent collisions:

```
Format: {PREFIX}-{DEVICEID}-{SEQUENCE}
Example: INV-D3-00142

On sync, server reassigns to canonical sequence:
Local:  INV-D3-00142  →  Server: INV-2025-04523
```

### 8.3 Offline GL Updates

When offline:
1. Posting updates **local** GL balances immediately
2. GL balances are tagged as `syncStatus = 'LOCAL'`
3. On sync, server recalculates GL balances from event stream
4. If discrepancy detected, server balance wins; local is updated
5. User notified of any adjustments

### 8.4 Offline Approval Handling

When an approval is needed but the device is offline:

1. Transaction saved with `status = 'PENDING_APPROVAL'`
2. GL posting is **deferred** (not posted to GL until approved)
3. Transaction queued in approval inbox
4. On sync, approval request sent to approver
5. Approver can approve on their device (online or offline)
6. On sync of approver's device, posting proceeds

---

## 9. Audit Trail Specification

### 9.1 Audit Event Types

| Event | Description | Retention |
|-------|-------------|-----------|
| `ENTITY_CREATED` | New record created | 10 years |
| `ENTITY_UPDATED` | Record field(s) changed | 10 years |
| `ENTITY_DELETED` | Record soft-deleted | 10 years |
| `APPROVAL_GRANTED` | Approval given | 10 years |
| `APPROVAL_REJECTED` | Approval denied | 10 years |
| `JOURNAL_POSTED` | GL entry posted | Permanent |
| `JOURNAL_REVERSED` | GL entry reversed | Permanent |
| `LOGIN_SUCCESS` | User logged in | 1 year |
| `LOGIN_FAILED` | Failed login attempt | 1 year |
| `PASSWORD_CHANGED` | User changed password | 5 years |
| `ROLE_CHANGED` | User role updated | 10 years |
| `PERIOD_CLOSED` | Accounting period closed | Permanent |
| `SETTINGS_CHANGED` | System setting modified | 10 years |
| `DATA_EXPORTED` | Data exported (CSV/PDF) | 5 years |
| `SYNC_CONFLICT` | Sync conflict detected | 5 years |

### 9.2 Audit Record Fields

```typescript
interface AuditRecord {
  id: string;                      // UUID
  timestamp: string;               // ISO 8601
  userId: string;                  // Who performed action
  userRole: UserRole;              // Role at time of action
  campusId?: string;              // Which campus context
  action: AuditAction;            // Event type
  entityType: string;             // e.g., 'invoice', 'payment'
  entityId: string;               // Record ID
  oldValue?: object;              // Previous state (for updates)
  newValue?: object;              // New state
  changedFields?: string[];       // List of modified fields
  reason?: string;                // User-provided reason
  ipAddress?: string;             // Device identifier
  deviceId?: string;              // For offline tracking
  syncStatus: SyncStatus;         // LOCAL | SYNCED
}
```

### 9.3 Tamper Detection

Audit records are protected by:

1. **Append-only table**: No UPDATE or DELETE allowed on audit table
2. **Hash chain**: Each record includes hash of previous record
3. **Sequence check**: Continuous sequence numbers; gaps indicate tampering
4. **Checksum**: Daily checksum of audit table for integrity verification

```sql
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  sequence INTEGER NOT NULL UNIQUE,
  timestamp TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value TEXT,  -- JSON
  new_value TEXT,  -- JSON
  reason TEXT,
  device_id TEXT,
  prev_hash TEXT NOT NULL,  -- SHA-256 of previous record
  record_hash TEXT NOT NULL  -- SHA-256 of this record
);
```

### 9.4 Audit Report Queries

The system provides these standard audit queries:

| Report | Filter By | Used By |
|--------|-----------|---------|
| User Activity Log | User, Date Range | SUPER_ADMIN, AUDITOR |
| Transaction Audit Trail | Entity Type + ID | AUDITOR |
| Approval History | Transaction ID | BURSAR, DIRECTOR |
| Failed Login Report | Date Range | SUPER_ADMIN |
| Data Change Report | Entity Type, Date | AUDITOR |
| Period Close Report | Fiscal Year | AUDITOR, DIRECTOR |
| Role Change Report | Date Range | SUPER_ADMIN |

---

## 10. Tax & Statutory Compliance

### 10.1 URA Tax Obligations

#### PAYE (Pay As You Earn)

| Obligation | Detail |
|-----------|--------|
| **Frequency** | Monthly, due by 15th of following month |
| **Filing** | URA e-Tax portal |
| **Records** | Employee TIN, gross pay, tax computed, net pay |
| **GL Impact** | DR 2210 (PAYE Payable) / CR Bank |
| **Form** | URA PAYE Return |

**Monthly PAYE Brackets (2024/25):**

| Chargeable Income (Monthly) | Rate |
|----------------------------|------|
| First UGX 235,000 | 0% |
| UGX 235,001 – 335,000 | 10% |
| UGX 335,001 – 410,000 | 20% |
| UGX 410,001 – 10,000,000 | 30% |
| Above UGX 10,000,000 | 40% |

#### NSSF (National Social Security Fund)

| Obligation | Detail |
|-----------|--------|
| **Employee** | 5% of gross salary |
| **Employer** | 10% of gross salary |
| **Frequency** | Monthly, due by 15th of following month |
| **Filing** | NSSF Employer Portal |
| **GL Impact** | DR 2220 / CR Bank |

#### LST (Local Service Tax)

| Obligation | Detail |
|-----------|--------|
| **Frequency** | Monthly withholding, annual remittance |
| **Filing** | Local government |
| **GL Impact** | DR 2230 / CR Bank |

#### VAT (Value Added Tax)

| Obligation | Detail |
|-----------|--------|
| **Rate** | 18% on taxable supplies |
| **Education** | Most education services are VAT-exempt |
| **Applicable** | Canteen/cafeteria, commercial rentals, consulting income |
| **Frequency** | Monthly, due by 15th |
| **GL Impact** | Output: DR Cash / CR 2240; Input: DR 2240 / CR AP |

### 10.2 Tax Calendar

| Month | Obligation | Deadline |
|-------|-----------|----------|
| Every month | PAYE remittance | 15th of following month |
| Every month | NSSF remittance | 15th of following month |
| Every month | VAT return (if applicable) | 15th of following month |
| January | Annual LST remittance | January 31 |
| June | Annual PAYE reconciliation return | June 30 |
| December | Annual income tax return | December 31 |

### 10.3 Tax Configuration

Tax rates are stored as system configuration, updateable without code changes:

```typescript
interface TaxConfiguration {
  paye_brackets: PayeBracket[];
  nssf_employee_rate: number;  // 0.05
  nssf_employer_rate: number;  // 0.10
  lst_brackets: LstBracket[];
  vat_rate: number;            // 0.18
  vat_exempt_services: string[]; // ['tuition', 'exam_fees', ...]
  effective_date: string;
  updated_by: string;
}
```

---

## 11. Reconciliation Rules

### 11.1 Bank Reconciliation Process

```
Step 1: Import bank statement (CSV/OFX)
         │
Step 2: Auto-match transactions
         │ Match by: Reference #, Amount, Date (±3 days)
         │
Step 3: Review auto-matches
         │ Display: Matched, Unmatched (bank), Unmatched (book)
         │
Step 4: Manual match remaining
         │ User links bank items → book items
         │
Step 5: Record adjustments
         │ Bank charges, interest, errors → create JEs
         │
Step 6: Verify reconciliation
         │ Bank balance - Outstanding items = Book balance
         │
Step 7: Approve and save
```

### 11.2 Reconciliation Statement

```
Bank Statement Balance (per bank)          UGX XX,XXX,XXX
Less: Outstanding Cheques                 (UGX X,XXX,XXX)
Add:  Deposits in Transit                  UGX X,XXX,XXX
                                          ─────────────
Adjusted Bank Balance                      UGX XX,XXX,XXX

Book Balance (per GL)                      UGX XX,XXX,XXX
Add:  Bank Interest Earned                 UGX     X,XXX
Less: Bank Charges                        (UGX     X,XXX)
Add/Less: Errors & Corrections             UGX     X,XXX
                                          ─────────────
Adjusted Book Balance                      UGX XX,XXX,XXX

Difference (must be zero)                  UGX         0
```

### 11.3 Auto-Matching Rules

| Priority | Matching Criteria | Confidence |
|----------|-------------------|:----------:|
| 1 | Exact reference # + exact amount | 100% |
| 2 | Exact reference # + amount ±1% | 95% |
| 3 | Exact amount + date ±1 day | 80% |
| 4 | Exact amount + date ±3 days | 60% |
| 5 | Amount ±1% + date ±3 days | 40% (manual review) |

### 11.4 MoMo Reconciliation

MTN MoMo and Airtel Money statements require special handling:

1. **MoMo statement import** → Parse merchant statement CSV
2. **Match MoMo reference** → Student payment reference field
3. **Phone number match** → Family phone → student
4. **Float reconciliation** → MoMo float GL (1250/1260) vs merchant balance
5. **Settlement reconciliation** → Bank receipt of MoMo settlement

**MoMo Float Accounting:**

| Event | DR | CR |
|-------|----|----|
| Student pays via MoMo | 1250 MoMo Float | 1310 Fees Receivable |
| MoMo settles to bank | 12XX Bank | 1250 MoMo Float |
| MoMo charges commission | 6910 Bank Charges | 1250 MoMo Float |

---

## 12. Reporting Period Close

### 12.1 Monthly Close Checklist

| Step | Task | Done By | Verification |
|------|------|---------|-------------|
| 1 | Post all pending invoices | ACCOUNTANT | No DRAFT invoices for period |
| 2 | Post all pending payments | CASHIER | No unrecorded receipts |
| 3 | Complete bank reconciliation | ACCOUNTANT | Difference = UGX 0 |
| 4 | Run depreciation | ACCOUNTANT | Depreciation JE posted |
| 5 | Post payroll (if not done) | PAYROLL_OFFICER | Payroll status = POSTED |
| 6 | Review accruals | ACCOUNTANT | Accrual JEs posted |
| 7 | Post prepayment amortization | ACCOUNTANT | Monthly portion recognized |
| 8 | Review GL trial balance | BURSAR | Debits = Credits |
| 9 | Review inter-campus eliminations | BURSAR | If multi-campus |
| 10 | BURSAR signs off | BURSAR | Approval record created |
| 11 | DIRECTOR approves close | DIRECTOR | Period status → CLOSED |
| 12 | System locks period | SYSTEM | No more postings allowed |

### 12.2 Year-End Close Process

| Step | Task | Done By |
|------|------|---------|
| 1 | Complete all monthly closes (P1-P12) | ACCOUNTANT |
| 2 | Post year-end adjustments (P13) | ACCOUNTANT |
| 3 | Reconcile all bank accounts | ACCOUNTANT |
| 4 | Verify statutory payable balances | PAYROLL_OFFICER |
| 5 | Reconcile AR sub-ledger to GL | ACCOUNTANT |
| 6 | Reconcile AP sub-ledger to GL | ACCOUNTANT |
| 7 | Run fixed asset register report | ACCOUNTANT |
| 8 | Verify inventory count vs book | STOREKEEPER |
| 9 | Generate draft financial statements | BURSAR |
| 10 | External auditor review (if applicable) | AUDITOR |
| 11 | Post closing entries (revenue/expense → retained surplus) | BURSAR |
| 12 | Carry forward balance sheet accounts | SYSTEM |
| 13 | Open new fiscal year periods | SUPER_ADMIN |
| 14 | DIRECTOR + BOARD approve | DIRECTOR, BOARD |
| 15 | Lock previous year | SUPER_ADMIN |

### 12.3 Financial Statements

The system generates these standard reports aligned with ICPAU/IFRS:

| Statement | Content | Frequency |
|-----------|---------|-----------|
| **Trial Balance** | All GL accounts with debit/credit balances | Monthly / On-demand |
| **Income Statement (P&L)** | Revenue - Expenses = Surplus/Deficit | Monthly / Termly / Annually |
| **Balance Sheet** | Assets = Liabilities + Equity | Monthly / Annually |
| **Cash Flow Statement** | Operating + Investing + Financing activities | Quarterly / Annually |
| **AR Aging Report** | Student receivables by aging bucket | Weekly / On-demand |
| **AP Aging Report** | Supplier payables by aging bucket | Monthly / On-demand |
| **Budget vs Actual** | Budget lines vs actual spend | Monthly / Quarterly |
| **Fee Collection Summary** | Billed vs Collected vs Outstanding | Daily / Weekly / Termly |
| **Payroll Summary** | Gross, deductions, net by department | Monthly |
| **Fixed Asset Register** | All assets with NBV and depreciation | Monthly / Annually |
| **Bank Reconciliation** | Reconciled bank statements | Monthly |
| **VAT Return** | Output VAT - Input VAT (if applicable) | Monthly |
| **PAYE Return** | Employee tax computations | Monthly |
| **NSSF Return** | Employee + employer contributions | Monthly |

---

*End of ACCOUNTING ENGINE, POSTING RULES & APPROVAL MATRIX specification.*
