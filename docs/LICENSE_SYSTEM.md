# MAPLE School Finance ERP — LICENSE, TRIAL, RENEWAL, EXPIRY, LOCKING & CLOUD VALIDATION SPECIFICATION

**Version:** 1.0.0  
**Last Updated:** 7 April 2026  
**Country Context:** Uganda (UGX, offline-first desktop ERP for private schools)  
**Architecture Ref:** [ARCHITECTURE.md](ARCHITECTURE.md), [INSTITUTION_CONTEXT.md](INSTITUTION_CONTEXT.md)

---

## Table of Contents

1. [License System Overview](#1-license-system-overview)
2. [License Model and Entities](#2-license-model-and-entities)
3. [Trial License Rules](#3-trial-license-rules)
4. [Paid Annual License Rules](#4-paid-annual-license-rules)
5. [Grace Period Rules](#5-grace-period-rules)
6. [Expiry and Locking Rules](#6-expiry-and-locking-rules)
7. [Renewal Invoice Workflow](#7-renewal-invoice-workflow)
8. [Local Offline License Enforcement](#8-local-offline-license-enforcement)
9. [Cloud Validation and Synchronization](#9-cloud-validation-and-synchronization)
10. [Anti-Tampering and Clock Manipulation Controls](#10-anti-tampering-and-clock-manipulation-controls)
11. [Role-Based License Visibility and Actions](#11-role-based-license-visibility-and-actions)
12. [Mobile App / Cloud Monitoring License Views](#12-mobile-app--cloud-monitoring-license-views)
13. [User Experience and Messaging Rules](#13-user-experience-and-messaging-rules)
14. [Phase 1 vs Phase 2 Recommendations](#14-phase-1-vs-phase-2-recommendations)
15. [Risks and Control Measures](#15-risks-and-control-measures)

---

## 1. License System Overview

### 1.1 Model Summary

MAPLE ERP uses an **institution-level, cloud-issued, locally-enforced, periodically-revalidated** license model. Every deployed ERP instance is bound to exactly one institution (school entity). The license is not per-user or per-device — it is per institution. All users and devices operating under that institution share a single license.

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLOUD LICENSE SERVER                         │
│  (Issues licenses, validates renewals, stores audit log)        │
│  Endpoints: /license/validate, /license/renew, /license/status  │
└────────────────────┬───────────────────┬─────────────────────────┘
                     │  HTTPS Sync       │  Mobile/Cloud Monitor
                     ▼                   ▼
┌────────────────────────┐    ┌──────────────────────────────────┐
│   DESKTOP ERP (Tauri)  │    │  PROPRIETOR / HEAD MONITORING   │
│  ┌──────────────────┐  │    │  (Web/Mobile read-only views)    │
│  │ Local License    │  │    │  - License status                │
│  │ Cache (signed)   │  │    │  - Renewal invoice               │
│  │ ───────────────  │  │    │  - Days remaining                │
│  │ SQLite encrypted │  │    │  - Last sync date                │
│  │ Signature verify │  │    │  - Lock warnings                 │
│  └──────────────────┘  │    └──────────────────────────────────┘
│  Local enforcement at  │
│  every app launch and  │
│  every write operation  │
└────────────────────────┘
```

### 1.2 Core Principles

| Principle | Detail |
|-----------|--------|
| **Institution-based** | One license = one school (all campuses, all users, all devices) |
| **Cloud-issued** | Licenses are created and signed only by the cloud license server |
| **Locally enforced** | The desktop app validates the license locally using a signed cache — no live internet required at every launch |
| **Periodically revalidated** | At each successful sync, the app re-checks the cloud for license status updates |
| **Data-preserving** | Expired licenses never delete data or block access to historical records |
| **Tamper-resistant** | Signed license payloads prevent local manipulation |

### 1.3 License States

The license progresses through a defined state machine:

```
                    ┌───────────────┐
    Onboarding ────▶│ TRIAL_ACTIVE  │
                    └───────┬───────┘
                            │ 16 days remaining
                    ┌───────▼──────────────┐
                    │ TRIAL_EXPIRING_SOON  │
                    └───────┬──────────────┘
                            │ day 31
                    ┌───────▼───────────┐
              ┌────▶│ TRIAL_EXPIRED     │──────┐
              │     └───────┬───────────┘      │ no payment
              │             │ payment           │
              │     ┌───────▼───────┐    ┌─────▼──────┐
              │     │ PAID_ACTIVE   │    │ GRACE      │
              │     └───────┬───────┘    └─────┬──────┘
              │             │ 30 days left     │ grace ends
              │     ┌───────▼──────────────┐   │
              │     │ PAID_EXPIRING_SOON   │   │
              │     └───────┬──────────────┘   │
              │             │ end date         │
              │     ┌───────▼───────────┐      │
              │     │ GRACE             │◀─────┘
              │     └───────┬───────────┘
              │             │ grace ends
              │     ┌───────▼───────────┐
              │     │ EXPIRED_LOCKED    │
              │     └───────┬───────────┘
              │             │ payment + sync
              └─────────────┘

              Admin override:
              Any state ──▶ SUSPENDED
              Any state ──▶ CANCELLED
```

| State | Code | Description |
|-------|------|-------------|
| Trial Active | `TRIAL_ACTIVE` | Full access, 30-day countdown running |
| Trial Expiring Soon | `TRIAL_EXPIRING_SOON` | ≤14 days remaining on trial, warning banners shown |
| Trial Expired | `TRIAL_EXPIRED` | Trial period ended, grace period begins |
| Paid Active | `PAID_ACTIVE` | Institution has a valid paid license, full access |
| Paid Expiring Soon | `PAID_EXPIRING_SOON` | ≤30 days remaining on paid license, renewal reminders shown |
| Grace Period | `GRACE` | License expired, limited operations allowed, strong renewal warnings |
| Expired / Locked | `EXPIRED_LOCKED` | Grace period ended, all new transactions blocked, read-only access to historical data |
| Suspended | `SUSPENDED` | Vendor/admin-initiated suspension (policy violation, chargeback) |
| Cancelled | `CANCELLED` | License permanently cancelled, migration/export period then full lock |

### 1.4 What the License Governs

The institution license controls:

| Area | Detail |
|------|--------|
| **Transaction creation** | Ability to create invoices, receipts, journal entries, purchase orders, payroll runs |
| **Record posting** | Ability to post/approve pending records |
| **User/device management** | Ability to add new users or register new devices (when device limits apply) |
| **Cloud/mobile monitoring** | Access to proprietor/headteacher cloud dashboards |
| **Module access** | Future: feature-based licensing may restrict specific modules |
| **Renewal prompts** | Controls when and how renewal invoices and warnings appear |
| **Sync capability** | Sync continues even in locked state (to enable license refresh, backup) |

---

## 2. License Model and Entities

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐     1:1     ┌──────────────────────┐
│   INSTITUTION   │────────────▶│  INSTITUTION_LICENSE  │
└────────┬────────┘             └──────────┬───────────┘
         │                                 │
         │ 1:N                             │ 1:N
         ▼                                 ▼
┌─────────────────┐             ┌──────────────────────┐
│  DEVICE_LICENSE │             │   LICENSE_INVOICE     │
└─────────────────┘             └──────────┬───────────┘
                                           │ 1:N
                                           ▼
                                ┌──────────────────────┐
                                │  LICENSE_PAYMENT      │
                                └──────────────────────┘

                    ┌──────────────────────┐
                    │  LICENSE_EVENT_LOG    │
                    │  (all entities above  │
                    │   emit audit events)  │
                    └──────────────────────┘
```

### 2.2 Entity A: Institution License

The primary license record for the institution. Exactly one active license exists per institution at any time.

| Field | Type | Description |
|-------|------|-------------|
| `institution_id` | `UUID` | FK → Institution. The school this license belongs to |
| `license_id` | `UUID` | Primary key. Unique license identifier |
| `license_type` | `Enum` | `TRIAL` or `PAID` |
| `plan_name` | `String` | Human-readable plan name (e.g., "Maple Standard", "Maple Enterprise") |
| `status` | `Enum` | Current state: `TRIAL_ACTIVE`, `TRIAL_EXPIRING_SOON`, `TRIAL_EXPIRED`, `PAID_ACTIVE`, `PAID_EXPIRING_SOON`, `GRACE`, `EXPIRED_LOCKED`, `SUSPENDED`, `CANCELLED` |
| `trial_start_date` | `Date` | Date the trial began |
| `trial_end_date` | `Date` | Date the trial expires (trial_start + 30 days) |
| `paid_start_date` | `Date?` | Date the paid license period begins |
| `paid_end_date` | `Date?` | Date the paid license period ends (paid_start + 12 months) |
| `grace_start_date` | `Date?` | Date the grace period began |
| `grace_end_date` | `Date?` | Date the grace period ends |
| `next_invoice_id` | `UUID?` | FK → License Invoice. The current/upcoming renewal invoice |
| `max_devices` | `Int` | Maximum number of devices permitted (default: 5 for Standard, 15 for Enterprise) |
| `max_users` | `Int` | Maximum number of user accounts permitted (default: 10 for Standard, 30 for Enterprise) |
| `max_campuses` | `Int` | Maximum number of campuses permitted (default: 1 for Standard, 5 for Enterprise) |
| `features_enabled` | `JSON` | Array of enabled feature flags (Phase 2: module-level gating) |
| `issued_at` | `DateTime` | When this license record was created server-side |
| `last_validated_at` | `DateTime` | Last time the desktop app validated this license against the cloud |
| `last_synced_at` | `DateTime` | Last successful sync timestamp |
| `signed_license_payload` | `Text` | Base64-encoded signed license blob for local verification |
| `signature_version` | `Int` | Version of the signing algorithm (allows key rotation) |
| `notes` | `Text?` | Internal notes (vendor/admin use only) |

### 2.3 Entity B: License Invoice

Records invoices generated for trial-to-paid conversion and annual renewals.

| Field | Type | Description |
|-------|------|-------------|
| `invoice_id` | `UUID` | Primary key |
| `institution_id` | `UUID` | FK → Institution |
| `invoice_type` | `Enum` | `TRIAL_CONVERSION` (trial → paid), `ANNUAL_RENEWAL`, `PLAN_UPGRADE`, `PLAN_DOWNGRADE` |
| `issue_date` | `Date` | When the invoice was issued |
| `due_date` | `Date` | Payment deadline |
| `period_covered_start` | `Date` | Start of the license period this invoice covers |
| `period_covered_end` | `Date` | End of the license period this invoice covers |
| `amount` | `Decimal` | Base amount before tax |
| `tax_amount` | `Decimal` | VAT/tax amount (Uganda VAT: 18% if applicable) |
| `total_amount` | `Decimal` | Total payable (amount + tax) |
| `currency` | `String` | `UGX` |
| `invoice_status` | `Enum` | `DRAFT`, `ISSUED`, `SENT`, `VIEWED`, `OVERDUE`, `CANCELLED` |
| `payment_status` | `Enum` | `UNPAID`, `PARTIALLY_PAID`, `FULLY_PAID`, `REFUNDED` |
| `generated_by` | `String` | `SYSTEM` (auto-generated) or admin user ID |
| `linked_license_id` | `UUID` | FK → Institution License |
| `pdf_url` | `String?` | Cloud URL to the rendered PDF invoice |

### 2.4 Entity C: License Payment

Records payments received against license invoices.

| Field | Type | Description |
|-------|------|-------------|
| `payment_id` | `UUID` | Primary key |
| `institution_id` | `UUID` | FK → Institution |
| `invoice_id` | `UUID` | FK → License Invoice |
| `amount_paid` | `Decimal` | Amount received |
| `payment_date` | `Date` | Date payment was received |
| `payment_method` | `Enum` | `BANK_TRANSFER`, `MOBILE_MONEY`, `CHEQUE`, `CASH`, `CARD`, `OTHER` |
| `reference` | `String` | Bank reference, Mobile Money transaction ID, cheque number |
| `confirmation_status` | `Enum` | `PENDING`, `CONFIRMED`, `REJECTED` |
| `confirmed_by` | `UUID?` | User ID of vendor/admin who confirmed payment |
| `confirmed_at` | `DateTime?` | Timestamp of confirmation |
| `notes` | `Text?` | Additional notes (e.g., "Confirmed via Stanbic Bank statement") |

### 2.5 Entity D: Device License

Tracks which devices are registered under an institution's license.

| Field | Type | Description |
|-------|------|-------------|
| `device_id` | `UUID` | Primary key. Unique device fingerprint |
| `institution_id` | `UUID` | FK → Institution |
| `device_name` | `String` | Human-readable name (e.g., "Bursar Office Desktop", "Admin Laptop") |
| `device_platform` | `String` | OS info (e.g., "Windows 11", "macOS 15", "Ubuntu 24.04") |
| `license_id` | `UUID` | FK → Institution License |
| `first_registered_at` | `DateTime` | When device was first registered |
| `last_sync_date` | `DateTime` | Last time this device synced |
| `device_status` | `Enum` | `ACTIVE`, `INACTIVE`, `REVOKED` |
| `allowed` | `Boolean` | Whether this device is permitted under the current license |
| `registered_by` | `UUID` | User ID who registered the device |

### 2.6 Entity E: License Event Log (Audit)

Immutable audit trail for all license-related events.

| Field | Type | Description |
|-------|------|-------------|
| `event_id` | `UUID` | Primary key |
| `institution_id` | `UUID` | FK → Institution |
| `license_id` | `UUID` | FK → Institution License |
| `event_type` | `Enum` | See event types table below |
| `event_timestamp` | `DateTime` | When the event occurred (server time preferred) |
| `device_id` | `UUID?` | FK → Device License (if device-specific) |
| `user_id` | `UUID?` | User who triggered the event |
| `old_status` | `Enum?` | Previous license status |
| `new_status` | `Enum?` | New license status |
| `metadata` | `JSON?` | Additional event-specific data |
| `notes` | `Text?` | Human-readable description |

#### License Event Types

| Event Type | Description |
|------------|-------------|
| `TRIAL_STARTED` | Trial license created at onboarding |
| `TRIAL_EXPIRING_WARNING` | Warning threshold reached (14d, 7d, 3d, 1d) |
| `TRIAL_EXPIRED` | Trial period ended |
| `PAYMENT_RECEIVED` | Payment recorded against a license invoice |
| `PAYMENT_CONFIRMED` | Payment verified by vendor/admin |
| `PAYMENT_REJECTED` | Payment verification failed |
| `LICENSE_ACTIVATED` | Paid license activated after payment confirmation |
| `LICENSE_RENEWED` | Existing license renewed for another period |
| `EXPIRING_WARNING` | Paid license expiry warning threshold reached |
| `LICENSE_EXPIRED` | Paid license period ended |
| `GRACE_STARTED` | Grace period initiated |
| `GRACE_ENDED` | Grace period expired, system locked |
| `SYSTEM_LOCKED` | System entered locked/read-only mode |
| `SYSTEM_UNLOCKED` | System unlocked after renewal |
| `LICENSE_SUSPENDED` | Admin/vendor suspended the license |
| `LICENSE_CANCELLED` | License permanently cancelled |
| `LICENSE_REACTIVATED` | Suspended license reactivated |
| `DEVICE_REGISTERED` | New device registered |
| `DEVICE_REVOKED` | Device removed from license |
| `CLOUD_VALIDATION` | License validated against cloud server |
| `CLOUD_VALIDATION_FAILED` | Cloud validation failed (network, auth, mismatch) |
| `TAMPER_DETECTED` | Clock manipulation or file tampering suspected |
| `INVOICE_GENERATED` | Renewal invoice created |
| `INVOICE_SENT` | Invoice delivered to institution |
| `LOCAL_CACHE_REFRESHED` | Local license cache updated from cloud |
| `CLOCK_DRIFT_WARNING` | Device clock drift exceeded threshold |

### 2.7 Entity Relationships

```
Institution (1) ──── has ────▶ (1) InstitutionLicense
Institution (1) ──── has ────▶ (N) DeviceLicense
Institution (1) ──── has ────▶ (N) LicenseInvoice
InstitutionLicense (1) ── linked to ──▶ (N) LicenseInvoice
LicenseInvoice (1) ──── has ────▶ (N) LicensePayment
InstitutionLicense (1) ── tracked by ──▶ (N) LicenseEventLog
DeviceLicense (N) ──── references ──▶ (1) InstitutionLicense
```

**Cloud/Mobile Monitoring** reads from:
- `InstitutionLicense` → current status, dates, last sync
- `LicenseInvoice` → renewal amounts, payment status
- `LicensePayment` → confirmation state
- `DeviceLicense` → which devices are active, last sync per device

---

## 3. Trial License Rules

### 3.1 Trial Activation

When an institution is onboarded (first successful setup):

1. The cloud license server creates an `InstitutionLicense` record with `license_type = TRIAL` and `status = TRIAL_ACTIVE`
2. `trial_start_date` = institution activation date (the date setup completes)
3. `trial_end_date` = `trial_start_date + 30 days`
4. A signed license payload is generated and returned to the desktop app
5. The desktop app stores the signed payload in the local license cache
6. A `TRIAL_STARTED` event is logged

### 3.2 Trial Access Level

During the trial, the institution receives **full access** to all modules and features:

| Capability | Trial Access |
|------------|-------------|
| All accounting modules | ✅ Full |
| Student invoicing | ✅ Full |
| Collections & payments | ✅ Full |
| Payroll | ✅ Full |
| Reports | ✅ Full |
| Budget & treasury | ✅ Full |
| Fixed assets | ✅ Full |
| Settings & configuration | ✅ Full |
| Fee Engine | ✅ Full |
| Cloud/mobile monitoring | ✅ Full |
| Data export | ✅ Full |

**Rationale:** Schools need to evaluate the full product before committing. Restricting modules during trial reduces conversion rates and creates an inaccurate evaluation experience.

### 3.3 Trial Limits

| Limit | Default | Notes |
|-------|---------|-------|
| Devices | 3 | Sufficient for bursar, admin, head office evaluation |
| Users | 5 | Core evaluation team |
| Campuses | 1 | Single campus for trial |
| Data volume | No limit | Schools need to enter real data to evaluate properly |

### 3.4 Trial Reminder Schedule

The system displays progressive warnings as the trial nears expiry:

| Days Remaining | Warning Level | Behavior |
|----------------|---------------|----------|
| 14 | `INFO` | Blue info banner on dashboard. Logged as `TRIAL_EXPIRING_WARNING`. Status transitions to `TRIAL_EXPIRING_SOON`. |
| 7 | `WARNING` | Yellow warning banner on dashboard and login screen. Daily reminder. |
| 3 | `URGENT` | Orange banner on all screens. "Renew in 3 days to keep your data active." |
| 1 | `CRITICAL` | Red persistent banner on all screens. "Your trial ends tomorrow. Renew now." |
| 0 | `EXPIRED` | Trial expired. Status transitions to `TRIAL_EXPIRED`. Grace period begins. |

### 3.5 Trial Invoice

- A `TRIAL_CONVERSION` invoice is **pre-created** at day 16 (14 days before trial ends)
- The invoice is marked `DRAFT` initially, then `ISSUED` when the trial reaches 14 days remaining
- The invoice is visible on the desktop renewal screen and on cloud/mobile monitoring
- Due date = `trial_end_date`
- The invoice covers the first 12-month paid period starting from the expected activation date

### 3.6 Offline During Trial

If the institution is offline for part or all of the trial:

- The local license cache still contains the trial end date
- The desktop app enforces the trial end date locally using local clock (with anti-tamper checks)
- The trial does not pause or extend due to being offline
- When the institution comes back online and syncs, the cloud confirms the current trial state
- If the trial has expired while offline, the system immediately enters grace/locked state upon local date check

### 3.7 Trial Extension

- Trial extensions are **not automatic**
- A vendor/admin can manually extend a trial by issuing a new signed license with an updated `trial_end_date` from the cloud
- The extension is logged as a `LICENSE_EVENT` with `event_type = TRIAL_EXTENDED`
- Maximum extension: 15 additional days (total 45 days max)

---

## 4. Paid Annual License Rules

### 4.1 License Activation

When payment for a license invoice is confirmed:

1. The cloud license server updates the `InstitutionLicense` record:
   - `license_type` → `PAID`
   - `status` → `PAID_ACTIVE`
   - `paid_start_date` → date of payment confirmation (or next day after trial end, whichever is later)
   - `paid_end_date` → `paid_start_date + 12 months`
   - `grace_start_date` → cleared
   - `grace_end_date` → cleared
2. A new signed license payload is generated
3. The `LICENSE_ACTIVATED` event is logged
4. At the next sync, every registered device downloads the updated license

### 4.2 License Period Calculation

| Scenario | `paid_start_date` | `paid_end_date` |
|----------|-------------------|-----------------|
| Payment during active trial | Day after trial end | `paid_start_date + 12 months` |
| Payment during grace period | Date of payment confirmation | `paid_start_date + 12 months` |
| Payment after full lock | Date of payment confirmation | `paid_start_date + 12 months` |
| Early renewal (before current license ends) | Day after current `paid_end_date` | New `paid_start_date + 12 months` |

**Key rule:** Early renewal always extends from the current license end date, never from the payment date. The institution never loses days they already paid for.

### 4.3 Renewal Reminders (Paid License)

| Days Before `paid_end_date` | Warning Level | Behavior |
|-----------------------------|---------------|----------|
| 60 | `NOTICE` | Renewal invoice auto-generated. Subtle notice on Settings page. |
| 30 | `INFO` | Blue info banner on dashboard. Status transitions to `PAID_EXPIRING_SOON`. |
| 14 | `WARNING` | Yellow warning banner on dashboard and login screen. |
| 7 | `URGENT` | Orange banner on all screens. Email/SMS reminder to institution contact. |
| 3 | `CRITICAL` | Red persistent banner. Daily email reminder. |
| 0 | `EXPIRED` | License expired. Grace period begins. |

### 4.4 Overlapping Renewals

- If an institution pays for renewal while the current license is still active, the new period starts the day after the current `paid_end_date`
- There is no gap in coverage
- There is no overlap; days are never double-counted
- Example: Current license ends 2027-03-15. Payment confirmed 2027-02-20. New license: 2027-03-16 to 2028-03-15.

### 4.5 Multi-Year Payment

- Phase 1: Not supported. Each renewal is for exactly 12 months.
- Phase 2: May support 2-year or 3-year plans with discount.

---

## 5. Grace Period Rules

### 5.1 Grace Period Trigger

A grace period begins immediately when:
- A trial license expires (`TRIAL_EXPIRED` → `GRACE`)
- A paid license expires (`PAID_EXPIRING_SOON` → `GRACE`)

### 5.2 Grace Period Duration

| License Type | Grace Duration | Rationale |
|-------------|----------------|-----------|
| Trial Expired | **7 days** | Short grace — the institution has not yet paid, lower investment in the product |
| Paid Expired | **14 days** | Longer grace — the institution is a paying customer, may have administrative payment delays |

### 5.3 Grace Period Access Rules

During grace, the system operates in **restricted mode**:

| Operation | Allowed During Grace? | Notes |
|-----------|-----------------------|-------|
| Login | ✅ Yes | |
| View dashboards | ✅ Yes | |
| View all historical records | ✅ Yes | |
| View reports | ✅ Yes | |
| View renewal invoice | ✅ Yes | |
| Print existing records | ✅ Yes | |
| Export existing data | ✅ Yes | Data sovereignty — institution owns their data |
| Sync license status | ✅ Yes | Required for renewal to take effect |
| Cloud/mobile monitoring | ✅ Yes | |
| **Create new invoices** | ❌ **Blocked** | |
| **Record new payments** | ❌ **Blocked** | |
| **Post new journal entries** | ❌ **Blocked** | |
| **Run payroll** | ❌ **Blocked** | |
| **Create purchase orders** | ❌ **Blocked** | |
| **Add new students** | ⚠️ **Limited** | Can enroll but cannot generate invoices |
| **Process approvals** | ❌ **Blocked** | No approving pending drafts |
| **Edit existing drafts** | ⚠️ **Limited** | Can edit but not post |
| Add new users | ❌ **Blocked** | |
| Register new devices | ❌ **Blocked** | |

### 5.4 Grace Period Configuration

- Grace period duration is **not configurable** by the institution
- Vendor/admin can extend grace for specific institutions via cloud override
- Maximum grace extension: +7 days (total max 21 days for paid, 14 days for trial)

### 5.5 Grace Period Messaging

Strong but professional messaging during grace:

> "Your license expired on [date]. You are currently in a [X]-day grace period ending on [grace_end_date]. Please renew to continue full use. New transactions are temporarily restricted."

---

## 6. Expiry and Locking Rules

### 6.1 Lock Trigger

The system transitions to `EXPIRED_LOCKED` when:
1. The grace period ends without a confirmed payment, OR
2. A vendor/admin manually suspends the license (`SUSPENDED`)

### 6.2 Fundamental Lock Principle

> **The system MUST NOT delete data or make historical information inaccessible. It locks operational usage only. The institution's financial records remain intact and viewable.**

### 6.3 What Remains Allowed When Locked

| Operation | Allowed | Notes |
|-----------|---------|-------|
| Login | ✅ Yes | Users can still log in |
| View dashboard (historical KPIs) | ✅ Yes | Shows data up to lock date |
| View all historical student records | ✅ Yes | |
| View all historical financial records | ✅ Yes | Invoices, receipts, journal entries, ledgers |
| View all historical reports | ✅ Yes | Trial balance, income statement, balance sheet, aging |
| View renewal invoice | ✅ Yes | Prominently displayed |
| View license status | ✅ Yes | |
| Print existing records | ✅ Yes | Historical receipts, invoices, reports |
| Export historical data | ✅ Yes | CSV/PDF export of existing data allowed |
| Sync license status | ✅ Yes | Sync continues — required for license refresh |
| Cloud/mobile monitoring | ✅ Yes | Proprietor can see locked state and renew |
| Contact support / request renewal | ✅ Yes | Support link always visible |

### 6.4 What Is Blocked When Locked

| Operation | Blocked | Notes |
|-----------|---------|-------|
| Create new student invoices | ❌ Blocked | |
| Record new fee payments | ❌ Blocked | |
| Generate new receipts | ❌ Blocked | |
| Create / post journal entries | ❌ Blocked | |
| Process payroll | ❌ Blocked | |
| Create purchase orders | ❌ Blocked | |
| Record supplier payments | ❌ Blocked | |
| Run depreciation | ❌ Blocked | |
| Record bank transactions | ❌ Blocked | |
| Record stock movements | ❌ Blocked | |
| Create / revise budgets | ❌ Blocked | |
| Add new students | ❌ Blocked | |
| Add new users | ❌ Blocked | |
| Register new devices | ❌ Blocked | |
| Approve pending transactions | ❌ Blocked | |
| Edit any existing records | ❌ Blocked | No modifications to posted data |
| Edit existing drafts | ❌ Blocked | Drafts frozen at lock date |
| Change settings | ❌ Blocked | Configuration frozen |
| Change chart of accounts | ❌ Blocked | |
| Run billing cycles | ❌ Blocked | |

### 6.5 Special Lock Rules

| Scenario | Ruling |
|----------|--------|
| **Printing old records** | ✅ Allowed. Schools need to print historical receipts for parents, auditors. |
| **Editing drafts** | ❌ Blocked. No data modification after lock. Drafts freeze at lock date. |
| **Approving pending items** | ❌ Blocked. No state transitions on existing records. |
| **Data export** | ✅ Allowed. The institution owns their data. Export of historical CSV/PDF permitted. |
| **Period closing** | ❌ Blocked. No accounting period operations. |
| **Reports with date ranges** | ✅ Allowed. Users can run reports for any historical period. |

### 6.6 Lock Enforcement Implementation

```
BEFORE any write operation:
  1. Read local license cache
  2. Check status field
  3. If status IN (EXPIRED_LOCKED, SUSPENDED, CANCELLED):
       → Reject write with LicenseExpiredError
       → Show renewal prompt
  4. If status = GRACE:
       → Check operation type against grace allowlist
       → Block if not in allowlist
  5. If status IN (TRIAL_ACTIVE, TRIAL_EXPIRING_SOON, PAID_ACTIVE, PAID_EXPIRING_SOON):
       → Allow write
```

### 6.7 Unlock Process

When an institution pays and the payment is confirmed:

1. Cloud updates `InstitutionLicense.status` → `PAID_ACTIVE`
2. Cloud generates new signed license payload
3. At next sync, the desktop app:
   - Downloads the new signed license
   - Updates local cache
   - Transitions from `EXPIRED_LOCKED` → `PAID_ACTIVE`
   - Logs `SYSTEM_UNLOCKED` event
   - Removes all lock banners
   - Re-enables all write operations
4. All registered devices update at their next sync

**Important:** Unlock is seamless. No data migration or re-import is needed. The system simply lifts the write lock.

---

## 7. Renewal Invoice Workflow

### 7.1 Invoice Generation Timeline

| Event | Invoice Action |
|-------|----------------|
| Trial day 16 (14 days before trial end) | Auto-generate `TRIAL_CONVERSION` invoice |
| 60 days before `paid_end_date` | Auto-generate `ANNUAL_RENEWAL` invoice |
| On lock date | Invoice status updated to `OVERDUE` if unpaid |

### 7.2 Invoice Content

Every renewal invoice contains:

```
┌─────────────────────────────────────────────────────────────┐
│                    MAPLE ERP LICENSE                        │
│                    RENEWAL INVOICE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Invoice Number:    INV-LIC-2026-0042                       │
│  Issue Date:        7 April 2026                            │
│  Due Date:          6 May 2026                              │
│                                                             │
│  BILLED TO:                                                 │
│  Maple Private School                                       │
│  Bugolobi, Kampala, Uganda                                  │
│  TIN: 1001234567                                            │
│                                                             │
│  ──────────────────────────────────────────────────────────  │
│  Description              Period              Amount (UGX)  │
│  ──────────────────────────────────────────────────────────  │
│  Maple Standard Plan      May 2026 – Apr 2027  2,400,000   │
│  VAT (18%)                                       432,000   │
│  ──────────────────────────────────────────────────────────  │
│  TOTAL DUE                                     2,832,000   │
│  ──────────────────────────────────────────────────────────  │
│                                                             │
│  PAYMENT METHODS:                                           │
│  Bank Transfer: Stanbic Bank Uganda                         │
│    Account: MAPLE SOFTWARE LTD                              │
│    A/C No: 9030012345678                                    │
│    Branch: Kampala Main                                     │
│                                                             │
│  Mobile Money: MTN MoMo Pay                                 │
│    Merchant: MAPLE-ERP                                      │
│    Code: *165*3*4#                                          │
│                                                             │
│  Reference: INV-LIC-2026-0042                               │
│  (Include this reference with your payment)                 │
│                                                             │
│  Status: UNPAID                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Invoice Visibility

| Actor | Desktop View | Cloud / Mobile View |
|-------|-------------|---------------------|
| Proprietor / Director | ✅ Full invoice with amounts | ✅ Full invoice with amounts |
| Headteacher | ✅ Full invoice | ✅ Full invoice |
| Bursar | ✅ Full invoice | ✅ Full invoice |
| Super Admin | ✅ Full invoice | ✅ Full invoice |
| Accountant | ⚠️ Status only, no amounts | ⚠️ Status only |
| Cashier | ⚠️ Status only | N/A |
| Other roles | ⚠️ "License expiring" banner only | N/A |

### 7.4 Due Date Logic

| Invoice Type | Due Date |
|-------------|----------|
| `TRIAL_CONVERSION` | `trial_end_date` |
| `ANNUAL_RENEWAL` | `paid_end_date` |

If payment is not received by due date, the invoice transitions to `OVERDUE`.

### 7.5 Renewal Reminders

Reminders are sent via:

| Channel | Phase 1 | Phase 2 |
|---------|---------|---------|
| Desktop banner | ✅ | ✅ |
| Cloud/mobile notification | ✅ | ✅ |
| Email to institution contact | ✅ (manual) | ✅ (automated) |
| SMS to institution contact | ❌ | ✅ |
| In-app push notification | ❌ | ✅ |

### 7.6 Payment Confirmation Process (Phase 1)

Phase 1 uses **manual payment confirmation** by the vendor/platform admin:

```
1. Institution makes payment (bank transfer, mobile money, etc.)
2. Institution contacts vendor with payment reference
3. Vendor/admin logs into cloud admin panel
4. Vendor/admin locates the invoice
5. Vendor/admin records payment: amount, method, reference
6. Vendor/admin confirms payment
7. Cloud server:
   a. Creates LicensePayment record (confirmation_status = CONFIRMED)
   b. Updates LicenseInvoice (payment_status = FULLY_PAID)
   c. Updates InstitutionLicense (status = PAID_ACTIVE, new dates)
   d. Generates new signed license payload
   e. Logs LICENSE_ACTIVATED / LICENSE_RENEWED event
8. At next sync, desktop app downloads new license → system unlocked
```

### 7.7 Post-Trial Invoice

- If the trial expires without payment, the `TRIAL_CONVERSION` invoice remains active with status `OVERDUE`
- A new invoice is **not** created; the original invoice is updated
- If the institution later decides to pay (even after lock), the same invoice is used
- If more than 6 months pass without payment, the invoice is auto-cancelled and a fresh one is generated if the institution reactivates

### 7.8 Invoice Numbering

Format: `INV-LIC-{YEAR}-{SEQUENCE}`

Example: `INV-LIC-2026-0001`

Sequence is global across all institutions, issued by the cloud server.

---

## 8. Local Offline License Enforcement

### 8.1 Architecture

Because the ERP is offline-first, the license **must be enforceable locally** without requiring a live internet connection at every launch or every transaction.

```
┌─────────────────────────────────────────────────────────────┐
│                    DESKTOP APP STARTUP                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Read local license cache from SQLite                    │
│  2. Verify signature of cached license payload              │
│  3. Check valid_until date against local clock              │
│  4. Check for clock manipulation (compare with last known   │
│     server time and last known local time)                  │
│  5. Determine license state                                 │
│  6. Apply UI restrictions (banners, locks)                  │
│  7. If online → background sync license with cloud          │
│  8. If sync reveals status change → update local cache      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Local License Cache

Stored in the SQLite database in an encrypted table (`license_cache`). The cache contains:

| Field | Type | Description |
|-------|------|-------------|
| `institution_id` | `UUID` | Bound institution |
| `license_id` | `UUID` | Current license ID |
| `license_type` | `Enum` | `TRIAL` or `PAID` |
| `status` | `Enum` | Current status |
| `issued_at` | `DateTime` | When the cloud issued this license |
| `valid_from` | `Date` | Start of current valid period |
| `valid_until` | `Date` | End of current valid period (trial_end or paid_end) |
| `grace_until` | `Date?` | End of grace period if active |
| `allowed_features` | `JSON` | Feature flags |
| `max_devices` | `Int` | Device limit |
| `max_users` | `Int` | User limit |
| `max_campuses` | `Int` | Campus limit |
| `signed_payload` | `Blob` | Full signed license blob |
| `signature` | `Blob` | Detached signature for verification |
| `signature_version` | `Int` | Signing algorithm version |
| `last_server_time` | `DateTime` | Last known trusted server time (from most recent sync) |
| `last_local_time_at_sync` | `DateTime` | Local clock reading at time of last sync |
| `last_validated_at` | `DateTime` | Last cloud validation timestamp |
| `cache_version` | `Int` | Schema version for cache format |

### 8.3 Storage and Encryption

| Aspect | Implementation |
|--------|---------------|
| **Location** | SQLite database, `license_cache` table, same DB file as app data |
| **Encryption** | The license cache table is encrypted using SQLite SEE (SQLite Encryption Extension) or application-level AES-256-GCM encryption of the `signed_payload` and `signature` fields |
| **Key derivation** | Encryption key derived from a combination of: device hardware ID, institution ID, and an embedded application secret |
| **Backup** | The license cache is included in cloud backup sync but cannot be decrypted on a different device/institution |
| **File integrity** | The signed_payload includes a SHA-256 hash of critical fields; any modification invalidates the signature |

### 8.4 Signature Verification

At every app launch and before every write operation, the app verifies the license:

```rust
fn verify_license(cache: &LicenseCache) -> LicenseVerification {
    // 1. Verify cryptographic signature
    let payload = decode_base64(&cache.signed_payload);
    let signature = decode_base64(&cache.signature);
    let public_key = get_embedded_public_key(cache.signature_version);

    if !ed25519_verify(public_key, payload, signature) {
        return LicenseVerification::TamperDetected;
    }

    // 2. Verify institution binding
    let payload_data = deserialize_payload(payload);
    if payload_data.institution_id != current_institution_id() {
        return LicenseVerification::InstitutionMismatch;
    }

    // 3. Check date validity
    let now = Local::now().date();
    if now > payload_data.valid_until {
        if let Some(grace) = payload_data.grace_until {
            if now <= grace {
                return LicenseVerification::GracePeriod;
            }
        }
        return LicenseVerification::Expired;
    }

    // 4. Check clock manipulation
    if let Some(drift) = detect_clock_drift(cache) {
        if drift > MAX_ALLOWED_DRIFT {
            return LicenseVerification::ClockDriftDetected;
        }
    }

    LicenseVerification::Valid
}
```

### 8.5 License Refresh Cycle

| Event | Action |
|-------|--------|
| App launch | Verify local cache. If online, trigger background license sync. |
| Successful data sync | Always include license re-validation in sync payload. |
| Manual "Check License" button | User-triggered cloud validation. |
| Timer: every 4 hours while app is running | Background check if online. |
| License state change detected in cloud response | Immediately update local cache and UI. |

### 8.6 Offline Continuity

When the institution is offline:

1. The app uses the locally cached license
2. If the cached license is still within `valid_until`, full operation continues
3. If the cached license has passed `valid_until`, the app enters grace or locked state based on local dates
4. An `offline_days_since_last_sync` counter increments
5. If `offline_days_since_last_sync` exceeds **30 days**, the app forces a "sync required" state:
   - The system enters a restricted mode similar to grace
   - Message: "Your system has not synced in over 30 days. Please connect to the internet to validate your license."
   - This prevents indefinite offline operation with a potentially stale or revoked license

---

## 9. Cloud Validation and Synchronization

### 9.1 Sync License Check Protocol

At every successful sync, the desktop app includes a license validation step:

```
Desktop → Cloud:
{
  "action": "license_validate",
  "institution_id": "uuid",
  "device_id": "uuid",
  "current_license_id": "uuid",
  "current_status": "PAID_ACTIVE",
  "local_cache_version": 3,
  "local_time": "2026-04-07T10:30:00+03:00",
  "app_version": "0.3.0",
  "signature_version": 1
}

Cloud → Desktop:
{
  "action": "license_response",
  "server_time": "2026-04-07T10:30:02+03:00",
  "license_status": "PAID_ACTIVE",
  "status_changed": false,
  "signed_license_payload": "base64...",  // only if changed
  "signature": "base64...",               // only if changed
  "pending_invoice": {                    // if applicable
    "invoice_id": "uuid",
    "total_amount": 2832000,
    "currency": "UGX",
    "due_date": "2026-05-06",
    "status": "ISSUED"
  },
  "messages": [
    { "type": "INFO", "text": "Your license is valid until 2027-04-06." }
  ]
}
```

### 9.2 Conflict Resolution Rules

| Scenario | Resolution |
|----------|------------|
| Cloud says `EXPIRED_LOCKED`, local cache says `PAID_ACTIVE` | **Cloud wins.** Update local cache immediately. Cloud is the source of truth. Log `LICENSE_EXPIRED` and `SYSTEM_LOCKED` events. |
| Cloud says `PAID_ACTIVE`, local cache says `EXPIRED_LOCKED` | **Cloud wins.** Update local cache immediately. System unlocked. Log `SYSTEM_UNLOCKED` event. All write operations re-enabled. |
| Cloud says `PAID_ACTIVE`, local cache says `PAID_ACTIVE` | No change. Update `last_validated_at` and `last_server_time`. |
| Cloud says `SUSPENDED`, any local state | **Cloud wins immediately.** Apply suspension. Log `LICENSE_SUSPENDED` event. |
| Cloud is unreachable | Keep current local cache. Increment `offline_days_since_last_sync`. Log `CLOUD_VALIDATION_FAILED` event. |

**Core rule: The cloud is always the source of truth. When reachable, cloud status takes precedence.**

### 9.3 Repeated Sync Failure

If the desktop app cannot reach the cloud for multiple consecutive syncs:

| Days Without Sync | Action |
|-------------------|--------|
| 0–7 | Normal operation with warning: "Last sync: X days ago" |
| 8–14 | Yellow banner: "Unable to verify license. Please connect to sync." |
| 15–29 | Orange banner: "License verification required. Please connect soon." |
| 30+ | Restricted mode: "Sync required to continue. Connect to the internet to verify your license." Grace-level restrictions apply. |

### 9.4 Stale License Cache

A license cache is considered **stale** when:
- `last_validated_at` is more than 30 days ago
- The app has not successfully synced in 30+ days

Stale cache behavior:
- The system enters "sync required" restricted mode
- All new transactions blocked (same as grace restrictions)
- Historical data remains fully accessible
- The institution must connect to the internet and sync successfully to resume normal operation

### 9.5 Cloud-Side License Status API

The cloud exposes these endpoints for license management:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/license/validate` | POST | Desktop license validation during sync |
| `/api/license/status/{institution_id}` | GET | Mobile/cloud monitoring status view |
| `/api/license/invoice/{institution_id}` | GET | Retrieve current/historical invoices |
| `/api/license/renew` | POST | Initiate renewal (admin/vendor) |
| `/api/license/payment` | POST | Record and confirm payment (admin/vendor) |
| `/api/license/suspend` | POST | Suspend a license (admin/vendor) |
| `/api/license/reactivate` | POST | Reactivate a suspended license |
| `/api/license/devices/{institution_id}` | GET | List registered devices |
| `/api/license/audit/{institution_id}` | GET | License event audit log |

---

## 10. Anti-Tampering and Clock Manipulation Controls

### 10.1 Threat Model

| Threat | Risk Level | Description |
|--------|-----------|-------------|
| Clock rollback | **High** | Institution sets device clock backwards to extend license |
| Clock advance | **Medium** | Institution sets clock forward (usually hurts them, but could be used to trigger early grace then rollback) |
| License file editing | **High** | Attempt to modify license dates or status in local database |
| License file copying | **High** | Copy license cache from another institution |
| Sync avoidance | **Medium** | Intentionally staying offline to avoid cloud revocation |
| Database manipulation | **Medium** | Direct SQLite editing to change license fields |
| Device identity spoofing | **Low** | Changing device fingerprint to bypass device limits |

### 10.2 Control: Signed License Payload

The signed license payload is the primary tamper-detection mechanism.

**Signing algorithm:** Ed25519 (fast, secure, small signatures)

```
Payload structure:
{
  "institution_id": "uuid",
  "license_id": "uuid",
  "license_type": "PAID",
  "status": "PAID_ACTIVE",
  "valid_from": "2026-04-07",
  "valid_until": "2027-04-06",
  "grace_until": "2027-04-20",
  "max_devices": 5,
  "max_users": 10,
  "max_campuses": 1,
  "features": ["all"],
  "issued_at": "2026-04-07T10:00:00Z",
  "signature_version": 1,
  "nonce": "random-uuid"
}

Signature = Ed25519.sign(private_key, SHA256(canonical_json(payload)))
```

- The **private key** is held only on the cloud license server (never on the desktop)
- The **public key** is embedded in the desktop application binary
- Any modification to the payload invalidates the signature
- The `nonce` prevents replay attacks

### 10.3 Control: Clock Drift Detection

At every sync, the app records:
- `last_server_time`: the trusted server timestamp
- `last_local_time_at_sync`: the local clock reading at that moment

On subsequent launches or license checks:
```
expected_elapsed = local_now - last_local_time_at_sync
server_elapsed   = (estimated) last_server_time + expected_elapsed

If local_now < last_local_time_at_sync:
    → Clock has been set backwards
    → FLAG: BACKWARD_CLOCK_JUMP
    → Severity: critical if jump > 24 hours

If abs(local_now - last_local_time_at_sync) is dramatically different
from reasonable elapsed time:
    → FLAG: CLOCK_DRIFT_WARNING
```

#### Tolerance Rules

| Clock Deviation | Action |
|----------------|--------|
| ≤ 5 minutes | Ignored. Normal system clock drift. |
| 5 min – 2 hours | `CLOCK_DRIFT_WARNING` event logged. Info banner shown. No operational impact. |
| 2 – 24 hours backward | `TAMPER_DETECTED` event logged. Warning dialog. System continues but forces sync on next internet availability. |
| > 24 hours backward | `TAMPER_DETECTED` event logged. **System enters "sync required" mode.** User must connect to internet and successfully validate license before any write operations are allowed. |
| > 7 days backward | `TAMPER_DETECTED` with `severity: critical`. System locked until cloud validation. Message: "A significant system time change was detected. Please connect to the internet to verify your license." |

### 10.4 Control: Institution and Device Binding

- The signed license payload contains the `institution_id`
- At verification, the app confirms the cached `institution_id` matches the app's configured institution
- If mismatched → license rejected, `TAMPER_DETECTED` logged
- The device fingerprint is generated from hardware identifiers (MAC address hash, disk serial, OS installation ID)
- The fingerprint is sent to the cloud at registration and validated at sync

### 10.5 Control: Database Integrity

- The `license_cache` table fields are integrity-protected by the signed payload
- If the raw database fields (e.g., `valid_until`, `status`) are edited directly but the `signed_payload` is not updated → signature verification fails → tamper detected
- The signature verification step runs before any status field is trusted

### 10.6 Control: Sync Avoidance Detection

- The `offline_days_since_last_sync` counter prevents indefinite offline usage
- After 30 days without sync, the system enters restricted mode
- This counter is stored in both the license cache and a separate system config table (redundancy against selective editing)
- The counter value is cross-referenced: if the license cache counter says 5 but the config table counter says 32, → tamper suspected

### 10.7 Control: Audit Trail

Every tamper-related event is:
1. Written to the local `license_event_log` table (with `event_type = TAMPER_DETECTED`)
2. Queued for sync to the cloud audit log
3. Flagged for vendor/admin review in the cloud admin panel
4. The event includes: device ID, timestamp, local clock reading, last server time, type of anomaly

### 10.8 Control Summary Matrix

| Threat | Prevention | Detection | Response |
|--------|-----------|-----------|----------|
| Clock rollback | Compare with `last_server_time` | Backward jump detection | Sync-required mode if > 24h |
| License file edit | Ed25519 signed payload | Signature verification fails | Reject license, tamper event |
| License file copy | Institution ID binding | `institution_id` mismatch | Reject license, tamper event |
| Sync avoidance | 30-day sync requirement | `offline_days_since_last_sync` | Restricted mode after 30 days |
| Database manipulation | Signed payload covers all fields | Signature mismatch on any field change | Reject license, force re-sync |
| Device spoofing | Hardware fingerprint hash | Cloud-side device registry | Reject unregistered device |

---

## 11. Role-Based License Visibility and Actions

### 11.1 Visibility Matrix

| Capability | Super Admin | Director / Proprietor | Headteacher | Bursar | Accountant | Cashier | Auditor |
|------------|:-----------:|:---------------------:|:-----------:|:------:|:----------:|:-------:|:-------:|
| View license status | ✅ | ✅ | ✅ | ✅ | ⚠️ Banner only | ⚠️ Banner only | ✅ |
| View trial countdown | ✅ | ✅ | ✅ | ✅ | ⚠️ Banner only | ⚠️ Banner only | ✅ |
| View renewal invoice (full) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| View renewal invoice (amounts) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| View device count / limits | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| See full commercial details | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| See lock/expiry warnings | ✅ All | ✅ All | ✅ All | ✅ All | ✅ Banner | ✅ Banner | ✅ All |
| See read-only mode notice | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 11.2 Action Permissions

| Action | Super Admin | Director / Proprietor | Headteacher | Bursar | Accountant | Cashier | Auditor |
|--------|:-----------:|:---------------------:|:-----------:|:------:|:----------:|:-------:|:-------:|
| Request renewal / contact support | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View payment instructions | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Register new device | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Revoke device | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manually trigger license sync | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View license audit log | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Confirm payment (internal) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Change plan | ❌ Cloud admin only | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Note:** Payment confirmation is a vendor/cloud-admin-only action. No institution user can self-confirm payment. This prevents fraud.

### 11.3 Read-Only Mode by Role

When the system is locked (`EXPIRED_LOCKED`), all roles can:
- Log in
- View historical records relevant to their role
- View the renewal page and invoice
- Export data within their permission scope
- View reports within their permission scope

No role can create or modify any records.

---

## 12. Mobile App / Cloud Monitoring License Views

### 12.1 Proprietor / Headteacher Monitoring Dashboard

The cloud/mobile monitoring app displays a **License Status Card** with the following information:

```
┌─────────────────────────────────────────────────────────────┐
│  📋 LICENSE STATUS                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Institution:     Maple Private School                      │
│  Plan:            Maple Standard                            │
│  License Status:  ✅ ACTIVE                                 │
│                                                             │
│  License Period:  7 Apr 2026 — 6 Apr 2027                   │
│  Days Remaining:  365                                       │
│                                                             │
│  Last Desktop Sync:    7 Apr 2026, 10:30 AM                 │
│  Registered Devices:   3 of 5                               │
│                                                             │
│  Renewal Invoice:      Not yet generated                    │
│                                                             │
│  ┌─────────────────┐                                        │
│  │  View Invoice   │  (disabled until invoice exists)       │
│  └─────────────────┘                                        │
│                                                             │
│  ┌─────────────────┐                                        │
│  │ Contact Support │                                        │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Trial Active View

```
┌─────────────────────────────────────────────────────────────┐
│  📋 LICENSE STATUS                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Institution:     Maple Private School                      │
│  Plan:            Trial                                     │
│  License Status:  🔵 TRIAL ACTIVE                           │
│                                                             │
│  Trial Started:   7 Apr 2026                                │
│  Trial Ends:      7 May 2026                                │
│  Days Remaining:  18                                        │
│                                                             │
│  ⓘ Your trial includes full access to all features.        │
│    Activate a paid license to continue after the trial.     │
│                                                             │
│  ┌──────────────────┐                                       │
│  │ View Invoice     │                                       │
│  └──────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 12.3 Locked View

```
┌─────────────────────────────────────────────────────────────┐
│  📋 LICENSE STATUS                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Institution:     Maple Private School                      │
│  Plan:            Maple Standard                            │
│  License Status:  🔴 EXPIRED — LOCKED                       │
│                                                             │
│  ⚠ New transactions are currently locked.                  │
│    Historical data remains fully accessible.                │
│    Please renew to restore full access.                     │
│                                                             │
│  License Expired: 6 Apr 2027                                │
│  Grace Ended:     20 Apr 2027                               │
│  Locked Since:    20 Apr 2027                               │
│                                                             │
│  Renewal Invoice: INV-LIC-2027-0089                         │
│  Amount Due:      UGX 2,832,000                             │
│  Payment Status:  UNPAID                                    │
│                                                             │
│  Last Desktop Sync: 18 Apr 2027, 2:15 PM                   │
│  ⚠ Data may be stale if desktop has not synced recently.   │
│                                                             │
│  ┌──────────────────┐  ┌────────────────┐                   │
│  │  View Invoice    │  │ Contact Support│                   │
│  └──────────────────┘  └────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 12.4 Stale Data Warning

If the last desktop sync is more than 3 days ago, the cloud/mobile monitoring shows:

> ⚠️ "The desktop application has not synced in [X] days. The financial data shown may not be current. Please ensure the school's desktop is connected to the internet."

### 12.5 Access Levels for Cloud/Mobile

| User Type | Access Level |
|-----------|-----------|
| Proprietor / Director (school) | Read-only: license status, invoice, financial dashboards |
| Headteacher (school) | Read-only: license status, invoice, dashboards |
| Vendor / Platform Admin | Full: manage licenses, confirm payments, suspend, override |
| Reseller / Partner (Phase 2) | Scoped: manage assigned institutions' licenses |

---

## 13. User Experience and Messaging Rules

### 13.1 Messaging Principles

1. **Professional and respectful.** Do not use threatening or punitive language.
2. **Clear and specific.** State dates, amounts, and actions clearly.
3. **Non-destructive framing.** Never imply data loss or deletion.
4. **Action-oriented.** Always provide a clear next step (renew, contact support, view invoice).
5. **Contextual.** Show the right message in the right place for the right role.

### 13.2 Message Templates by State

#### TRIAL_ACTIVE
- **Dashboard banner (blue, dismissible):**  
  "Trial version active. [X] days remaining. All features are available during your trial."
- **Settings → License page:**  
  "Your free trial started on [date] and ends on [date]. [X] days remaining."

#### TRIAL_EXPIRING_SOON (≤14 days)
- **Dashboard banner (yellow, non-dismissible):**  
  "Your trial ends in [X] days. Activate your license to continue uninterrupted use."
- **Login screen notice:**  
  "Trial ending soon — [X] days remaining."

#### TRIAL_EXPIRING_SOON (≤3 days)
- **Dashboard banner (orange, non-dismissible):**  
  "Your trial ends in [X] days. Please activate your license to avoid any interruption."
- **Login screen notice:**  
  "Your trial ends on [date]. Renew now to continue."

#### PAID_ACTIVE
- **Dashboard:** No banner. Clean dashboard.
- **Settings → License page:**  
  "License active. Valid until [date]. [X] days remaining."

#### PAID_EXPIRING_SOON (≤30 days)
- **Dashboard banner (blue, dismissible):**  
  "Your annual license expires on [date]. [X] days remaining. Renew to continue uninterrupted use."

#### PAID_EXPIRING_SOON (≤7 days)
- **Dashboard banner (orange, non-dismissible):**  
  "Your license expires in [X] days. Please renew to avoid transaction restrictions."

#### GRACE
- **Dashboard banner (red, non-dismissible):**  
  "Your license expired on [date]. Grace period ends on [grace_end_date]. New transactions are temporarily restricted. Please renew to restore full access."
- **Login screen:**  
  "License expired. Grace period active — [X] days remaining. Please renew."
- **On blocked action attempt (toast):**  
  "This action is currently restricted. Please renew your license to continue."

#### EXPIRED_LOCKED
- **Dashboard banner (red, persistent, full-width):**  
  "Your license has expired. New transactions are locked until renewal is completed. Your historical data is safe and fully accessible."
- **Login screen:**  
  "License expired. The system is in read-only mode. Please renew to restore full access."
- **On blocked action attempt (dialog):**  
  "New transactions are currently locked because your license has expired. Your data is safe. Please contact your administrator to renew the license."
- **Renewal page (prominent):**  
  "Renew your license to unlock all features. Your data has been preserved."

#### SUSPENDED
- **Full-screen overlay on login:**  
  "Your institution's license has been suspended. Please contact MAPLE support for assistance."
- **No dashboard access until resolved.**

#### SYNC_REQUIRED (stale cache)
- **Dashboard banner (orange, non-dismissible):**  
  "Your system has not synced in [X] days. Please connect to the internet to verify your license and continue normal operation."

#### CLOCK_DRIFT_WARNING
- **Dashboard banner (orange, dismissible after sync):**  
  "A system time change was detected. Please connect to the internet to verify your license."

### 13.3 Message Placement

| Location | When Used |
|----------|-----------|
| **Login screen** | Trial expiring (≤7d), grace, expired, suspended |
| **Dashboard banner** | All warning/expired/grace states |
| **Top bar persistent alert** | Grace period, expired/locked |
| **Settings → License page** | Always visible with full license details |
| **Block dialog (on action attempt)** | Grace blocked operations, expired blocked operations |
| **Toast notification** | Grace blocked operations (less intrusive) |
| **Cloud/mobile monitoring** | All states — always shows current license state |
| **Renewal/Invoice page** | When invoice exists — trial conversion or annual renewal |

### 13.4 Forbidden Messaging Patterns

| ❌ Do NOT say | ✅ Say instead |
|---------------|---------------|
| "Your data will be deleted" | "Your data is safe and accessible" |
| "System shutting down" | "New transactions are temporarily restricted" |
| "Access denied permanently" | "Please renew to restore full access" |
| "Pay immediately or lose everything" | "Renew to continue uninterrupted use" |
| "Illegal license" | "License verification required" |
| "You are in violation" | "Please connect to verify your license" |

---

## 14. Phase 1 vs Phase 2 Recommendations

### 14.1 Phase 1 — Launch Version

Phase 1 delivers the complete offline-first licensing framework with manual payment confirmation.

| Feature | Included | Details |
|---------|----------|---------|
| Institution-based license | ✅ | One license per school |
| 30-day trial | ✅ | Full access, automatic countdown |
| 12-month paid license | ✅ | Activated after payment confirmation |
| Local signed license cache | ✅ | Ed25519 signed, AES-encrypted |
| Periodic cloud revalidation on sync | ✅ | Validates at every sync |
| Trial/expiry warning banners | ✅ | Progressive warnings at 14d, 7d, 3d, 1d |
| Grace period (7d trial / 14d paid) | ✅ | Restricted operations during grace |
| Operational lock after expiry | ✅ | Read-only mode, all historical data preserved |
| Renewal invoice generation | ✅ | Auto-generated, viewable on desktop and cloud |
| **Manual payment confirmation** | ✅ | Vendor/admin confirms via cloud panel |
| Unlock on next sync | ✅ | Automatic unlock after payment confirmation + sync |
| Cloud/mobile license status view | ✅ | Proprietor/headteacher can see status |
| Clock drift detection (basic) | ✅ | Backward jump > 24h triggers sync-required mode |
| Device registration | ✅ | Basic device tracking, max device count |
| License event audit log | ✅ | All state changes logged |
| Role-based license visibility | ✅ | Full matrix as defined in §11 |
| 30-day sync requirement | ✅ | Restricted mode if no sync for 30+ days |

### 14.2 Phase 2 — Enhanced Version

Phase 2 adds automation, payment integration, and advanced controls.

| Feature | Details |
|---------|---------|
| **Online payment integration** | Mobile Money (MTN MoMo, Airtel Money), bank APIs for direct payment |
| **Automatic payment confirmation** | Payment gateway callback auto-confirms and activates license |
| **Plan upgrades / downgrades** | Standard → Enterprise (more devices, campuses, users) |
| **Device count enforcement** | Hard enforcement of max_devices with device management UI |
| **Feature-based licensing** | Module-level gating (e.g., Payroll module as add-on) |
| **Reseller / partner licensing** | Resellers manage multiple institutions' licenses |
| **Automated suspension / reactivation** | Policy-based suspension for payment issues |
| **Self-service billing portal** | Institutions view invoices, make payments, manage plan online |
| **Multi-year plans** | 2-year / 3-year plans with discounts |
| **Automated SMS / email reminders** | Renewal reminders via SMS and email |
| **Advanced tamper hardening** | OS-level integrity checks, secure enclave key storage |
| **Offline license token refresh** | SMS-based license refresh for institutions with limited internet |
| **Usage analytics** | License-linked usage metrics for vendor insights |
| **Proration** | Pro-rated upgrades/downgrades mid-cycle |
| **Credit notes** | Refunds and credits for license changes |

### 14.3 Phase 1 Implementation Priority

| Priority | Component | Effort |
|----------|-----------|--------|
| P0 — Must | License state machine (states, transitions) | Core |
| P0 — Must | Signed license payload (Ed25519) | Core |
| P0 — Must | Local cache storage + encryption | Core |
| P0 — Must | Write-operation gating (check license before every write) | Core |
| P0 — Must | Trial flow (30d countdown, warnings, expiry) | Core |
| P0 — Must | Grace period flow (7d/14d, restricted ops) | Core |
| P0 — Must | Locked mode (read-only, banners, block writes) | Core |
| P0 — Must | Cloud validation endpoint | Backend |
| P0 — Must | Desktop sync license check | Integration |
| P1 — Should | Renewal invoice generation | Business |
| P1 — Should | Manual payment confirmation (cloud admin) | Business |
| P1 — Should | Cloud/mobile license status view | Monitoring |
| P1 — Should | Clock drift detection | Security |
| P1 — Should | License audit log | Compliance |
| P2 — Could | Device registration + max count | Limits |
| P2 — Could | 30-day sync requirement | Security |
| P2 — Could | Role-based visibility differentiation | UX |

---

## 15. Risks and Control Measures

### 15.1 Risk Register

#### Risk 1: Institution operates after expiry due to stale cache

| Aspect | Detail |
|--------|--------|
| **Risk** | Institution stays offline indefinitely, using a valid-looking cached license that should have been revoked or expired. |
| **Likelihood** | Medium — Uganda schools may have intermittent internet. |
| **Impact** | Medium — Revenue loss, policy non-compliance. |
| **Prevention** | 30-day sync requirement. After 30 days without sync, system enters restricted mode. Local date-based expiry check runs independently. |
| **Detection** | `offline_days_since_last_sync` counter. Cloud-side "last sync" tracking shows stale devices. |
| **Audit** | `CLOUD_VALIDATION_FAILED` events logged with timestamps. Cloud admin dashboard shows "last sync date" per device. |
| **Recovery** | Institution connects to internet → sync triggers → cloud state applied → local cache updated. No data loss. |

#### Risk 2: Institution manipulates local system clock

| Aspect | Detail |
|--------|--------|
| **Risk** | User sets device clock backward to extend trial or license period. |
| **Likelihood** | Medium — Technically simple to do. |
| **Impact** | High — Directly undermines licensing revenue. |
| **Prevention** | `last_server_time` / `last_local_time_at_sync` comparison. Clock jumps > 24h backward trigger sync-required mode. |
| **Detection** | Clock drift detection algorithm at every license check. `TAMPER_DETECTED` events. |
| **Audit** | All clock anomalies logged with both reported time and expected time. Queued for cloud sync. |
| **Recovery** | Sync-required mode until cloud revalidation succeeds. Cloud re-issues signed license with correct dates. |

#### Risk 3: Renewal invoice not generated on time

| Aspect | Detail |
|--------|--------|
| **Risk** | System fails to auto-generate renewal invoice, leaving institution without a clear path to renew. |
| **Likelihood** | Low — Invoice generation is a deterministic date-based operation. |
| **Impact** | Medium — Delayed revenue, institution confusion. |
| **Prevention** | Invoice generation triggered by date check at sync and at app launch. Cloud-side scheduled job as backup. |
| **Detection** | Cloud admin dashboard shows institutions approaching expiry without an active invoice. Automated alert. |
| **Audit** | `INVOICE_GENERATED` event logged. Absence of this event near expiry triggers alert. |
| **Recovery** | Manual invoice creation by vendor/admin. Push to institution at next sync. |

#### Risk 4: Payment confirmed but unlock delayed

| Aspect | Detail |
|--------|--------|
| **Risk** | Vendor confirms payment on cloud, but institution's desktop is offline and cannot sync to unlock. |
| **Likelihood** | Medium — Institution may lack internet for days. |
| **Impact** | Medium — Institution locked despite having paid. Frustration and support burden. |
| **Prevention** | Cloud monitoring shows payment confirmed. Proprietor can see on mobile that payment is processed. Desktop auto-syncs on next internet connection. |
| **Detection** | Cloud shows `PAID_ACTIVE` but device shows `EXPIRED_LOCKED` — discrepancy visible to admin. |
| **Audit** | `PAYMENT_CONFIRMED` event has timestamp. `SYSTEM_UNLOCKED` event has timestamp. Gap is trackable. |
| **Recovery** | Institution connects to internet → sync → license updated → unlocked. If urgent, vendor can provide a temporary signed license payload via secure out-of-band channel (future Phase 2). |

#### Risk 5: Device syncs old/wrong license state

| Aspect | Detail |
|--------|--------|
| **Risk** | One device updates correctly, but another device has a stale cache from before renewal. |
| **Likelihood** | Medium — Multi-device environments with irregular sync. |
| **Impact** | Low-Medium — One device locked while another works. Confusing for staff. |
| **Prevention** | Each device independently validates against cloud at sync. License cache is per-device. |
| **Detection** | Cloud device registry shows last_sync_date per device. Admin sees which devices are stale. |
| **Audit** | `LOCAL_CACHE_REFRESHED` event per device. |
| **Recovery** | Connect stale device to internet → trigger sync → license updated. |

#### Risk 6: Wrong institution receives wrong license

| Aspect | Detail |
|--------|--------|
| **Risk** | License payload meant for Institution A is applied to Institution B. |
| **Likelihood** | Very Low — Would require manual file copying. |
| **Impact** | High — Institution operates on another's license. |
| **Prevention** | `institution_id` is embedded in the signed payload and verified at every license check. Mismatch → license rejected. |
| **Detection** | `TAMPER_DETECTED` event with `InstitutionMismatch` detail. |
| **Audit** | Event logged with both the cached institution_id and the payload institution_id. |
| **Recovery** | System enters locked mode. Requires legitimate sync with correct institution credentials. |

#### Risk 7: All devices do not refresh after renewal

| Aspect | Detail |
|--------|--------|
| **Risk** | Payment is confirmed and one device unlocks, but other devices remain locked because they haven't synced yet. |
| **Likelihood** | Medium — Schools may only sync primary bursar device regularly. |
| **Impact** | Medium — Operational disruption on secondary devices. |
| **Prevention** | Clear documentation that all devices should be synced after renewal. Cloud/mobile monitoring shows per-device sync status. |
| **Detection** | Cloud dashboard shows devices with license state mismatch (some `PAID_ACTIVE`, some `EXPIRED_LOCKED`). |
| **Audit** | Per-device `LOCAL_CACHE_REFRESHED` events tracked. |
| **Recovery** | Connect remaining devices → sync → each device updates independently. |

#### Risk 8: Cloud monitoring shows outdated license state

| Aspect | Detail |
|--------|--------|
| **Risk** | Proprietor views cloud/mobile monitoring and sees stale data because the desktop hasn't synced recently. |
| **Likelihood** | Medium — Desktop sync depends on internet availability. |
| **Impact** | Low — Misleading but not operationally harmful. |
| **Prevention** | Cloud monitoring always shows `Last Desktop Sync: [date/time]`. Stale data warning if sync > 3 days ago. |
| **Detection** | "Last sync" timestamp is always displayed. Warning banner for stale data. |
| **Audit** | Sync events tracked with timestamps. |
| **Recovery** | Connect desktop to internet → sync → cloud data updated → monitoring reflects current state. |

### 15.2 Control Measure Summary

| Control Category | Controls |
|-----------------|----------|
| **Cryptographic** | Ed25519 signed license payload, AES-256-GCM encrypted cache, SHA-256 integrity hash |
| **Temporal** | Server time tracking, clock drift detection, 30-day sync requirement |
| **Identity** | Institution binding, device fingerprinting, device registration |
| **Operational** | Write-operation gating, grace period restrictions, locked mode |
| **Monitoring** | Cloud admin dashboard, per-device sync tracking, stale data warnings |
| **Audit** | Immutable event log, tamper events, all state transitions logged |
| **Recovery** | Sync-based unlock, no data destruction, manual override for vendor/admin |

---

## Appendix A: License State Transition Table

| From State | Event | To State | Conditions |
|------------|-------|----------|------------|
| — | `Institution onboarded` | `TRIAL_ACTIVE` | New institution setup |
| `TRIAL_ACTIVE` | `14 days remaining` | `TRIAL_EXPIRING_SOON` | Automatic date check |
| `TRIAL_EXPIRING_SOON` | `Trial end date reached` | `TRIAL_EXPIRED` | Automatic date check |
| `TRIAL_EXPIRED` | `Grace begins` | `GRACE` | Automatic, immediately on expiry |
| `GRACE` (trial) | `Grace ends (7 days)` | `EXPIRED_LOCKED` | No payment received |
| `GRACE` (paid) | `Grace ends (14 days)` | `EXPIRED_LOCKED` | No payment received |
| `TRIAL_ACTIVE` | `Payment confirmed` | `PAID_ACTIVE` | Early conversion during trial |
| `TRIAL_EXPIRING_SOON` | `Payment confirmed` | `PAID_ACTIVE` | Conversion |
| `TRIAL_EXPIRED` | `Payment confirmed` | `PAID_ACTIVE` | Post-trial conversion |
| `GRACE` | `Payment confirmed` | `PAID_ACTIVE` | Renewal during grace |
| `EXPIRED_LOCKED` | `Payment confirmed + sync` | `PAID_ACTIVE` | Renewal after lock |
| `PAID_ACTIVE` | `30 days remaining` | `PAID_EXPIRING_SOON` | Automatic date check |
| `PAID_EXPIRING_SOON` | `End date reached` | `GRACE` | Automatic |
| Any | `Admin suspend` | `SUSPENDED` | Vendor/admin action |
| `SUSPENDED` | `Admin reactivate` | Previous state or `PAID_ACTIVE` | Vendor/admin action |
| Any | `Admin cancel` | `CANCELLED` | Vendor/admin action, irreversible |

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **Institution** | The school entity (e.g., Maple Private School) — the license holder |
| **License** | The right to use the MAPLE ERP software for a defined period |
| **Trial** | A 30-day free evaluation period with full access |
| **Paid License** | A 12-month period of licensed use, activated after payment |
| **Grace Period** | A short period after license expiry where the system operates in restricted mode |
| **Locked / Read-Only** | The state where all new transactions are blocked but historical data is viewable |
| **Signed Payload** | A cryptographically signed blob containing license parameters — tamper-resistant |
| **Local Cache** | The copy of the signed license stored on the desktop device's SQLite database |
| **Cloud Validation** | The process of checking the license state against the cloud server during sync |
| **Sync** | The periodic data exchange between desktop and cloud (backup, monitoring, license) |
| **Device Fingerprint** | A unique hardware-derived identifier for a desktop device |
| **Clock Drift** | Difference between device clock and known server time — may indicate tampering |

## Appendix C: SQL Schema (Phase 1)

```sql
-- ============================================================================
-- LICENSE SYSTEM TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS institution_license (
    license_id          TEXT PRIMARY KEY NOT NULL,
    institution_id      TEXT NOT NULL REFERENCES institutions(id),
    license_type        TEXT NOT NULL CHECK (license_type IN ('TRIAL', 'PAID')),
    plan_name           TEXT NOT NULL DEFAULT 'Maple Standard',
    status              TEXT NOT NULL CHECK (status IN (
        'TRIAL_ACTIVE', 'TRIAL_EXPIRING_SOON', 'TRIAL_EXPIRED',
        'PAID_ACTIVE', 'PAID_EXPIRING_SOON',
        'GRACE', 'EXPIRED_LOCKED', 'SUSPENDED', 'CANCELLED'
    )),
    trial_start_date    TEXT,  -- ISO 8601 date
    trial_end_date      TEXT,
    paid_start_date     TEXT,
    paid_end_date       TEXT,
    grace_start_date    TEXT,
    grace_end_date      TEXT,
    next_invoice_id     TEXT,
    max_devices         INTEGER NOT NULL DEFAULT 5,
    max_users           INTEGER NOT NULL DEFAULT 10,
    max_campuses        INTEGER NOT NULL DEFAULT 1,
    features_enabled    TEXT NOT NULL DEFAULT '["all"]',  -- JSON array
    issued_at           TEXT NOT NULL,  -- ISO 8601 datetime
    last_validated_at   TEXT,
    last_synced_at      TEXT,
    signed_license_payload TEXT,  -- Base64 encoded
    signature_version   INTEGER NOT NULL DEFAULT 1,
    notes               TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS license_invoice (
    invoice_id          TEXT PRIMARY KEY NOT NULL,
    institution_id      TEXT NOT NULL REFERENCES institutions(id),
    invoice_type        TEXT NOT NULL CHECK (invoice_type IN (
        'TRIAL_CONVERSION', 'ANNUAL_RENEWAL', 'PLAN_UPGRADE', 'PLAN_DOWNGRADE'
    )),
    issue_date          TEXT NOT NULL,
    due_date            TEXT NOT NULL,
    period_covered_start TEXT NOT NULL,
    period_covered_end  TEXT NOT NULL,
    amount              REAL NOT NULL,
    tax_amount          REAL NOT NULL DEFAULT 0,
    total_amount        REAL NOT NULL,
    currency            TEXT NOT NULL DEFAULT 'UGX',
    invoice_status      TEXT NOT NULL CHECK (invoice_status IN (
        'DRAFT', 'ISSUED', 'SENT', 'VIEWED', 'OVERDUE', 'CANCELLED'
    )),
    payment_status      TEXT NOT NULL CHECK (payment_status IN (
        'UNPAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'REFUNDED'
    )) DEFAULT 'UNPAID',
    generated_by        TEXT NOT NULL DEFAULT 'SYSTEM',
    linked_license_id   TEXT NOT NULL REFERENCES institution_license(license_id),
    pdf_url             TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS license_payment (
    payment_id          TEXT PRIMARY KEY NOT NULL,
    institution_id      TEXT NOT NULL REFERENCES institutions(id),
    invoice_id          TEXT NOT NULL REFERENCES license_invoice(invoice_id),
    amount_paid         REAL NOT NULL,
    payment_date        TEXT NOT NULL,
    payment_method      TEXT NOT NULL CHECK (payment_method IN (
        'BANK_TRANSFER', 'MOBILE_MONEY', 'CHEQUE', 'CASH', 'CARD', 'OTHER'
    )),
    reference           TEXT NOT NULL,
    confirmation_status TEXT NOT NULL CHECK (confirmation_status IN (
        'PENDING', 'CONFIRMED', 'REJECTED'
    )) DEFAULT 'PENDING',
    confirmed_by        TEXT,
    confirmed_at        TEXT,
    notes               TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS device_license (
    device_id           TEXT PRIMARY KEY NOT NULL,
    institution_id      TEXT NOT NULL REFERENCES institutions(id),
    device_name         TEXT NOT NULL,
    device_platform     TEXT,
    license_id          TEXT NOT NULL REFERENCES institution_license(license_id),
    first_registered_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_sync_date      TEXT,
    device_status       TEXT NOT NULL CHECK (device_status IN (
        'ACTIVE', 'INACTIVE', 'REVOKED'
    )) DEFAULT 'ACTIVE',
    allowed             INTEGER NOT NULL DEFAULT 1,  -- boolean
    registered_by       TEXT NOT NULL,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS license_event_log (
    event_id            TEXT PRIMARY KEY NOT NULL,
    institution_id      TEXT NOT NULL REFERENCES institutions(id),
    license_id          TEXT NOT NULL REFERENCES institution_license(license_id),
    event_type          TEXT NOT NULL,
    event_timestamp     TEXT NOT NULL DEFAULT (datetime('now')),
    device_id           TEXT,
    user_id             TEXT,
    old_status          TEXT,
    new_status          TEXT,
    metadata            TEXT,  -- JSON
    notes               TEXT
);

CREATE TABLE IF NOT EXISTS license_cache (
    id                      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- singleton row
    institution_id          TEXT NOT NULL,
    license_id              TEXT NOT NULL,
    license_type            TEXT NOT NULL,
    status                  TEXT NOT NULL,
    issued_at               TEXT NOT NULL,
    valid_from              TEXT NOT NULL,
    valid_until             TEXT NOT NULL,
    grace_until             TEXT,
    allowed_features        TEXT NOT NULL DEFAULT '["all"]',
    max_devices             INTEGER NOT NULL DEFAULT 5,
    max_users               INTEGER NOT NULL DEFAULT 10,
    max_campuses            INTEGER NOT NULL DEFAULT 1,
    signed_payload          BLOB NOT NULL,
    signature               BLOB NOT NULL,
    signature_version       INTEGER NOT NULL DEFAULT 1,
    last_server_time        TEXT,
    last_local_time_at_sync TEXT,
    last_validated_at       TEXT,
    offline_days_since_sync INTEGER NOT NULL DEFAULT 0,
    cache_version           INTEGER NOT NULL DEFAULT 1,
    updated_at              TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_license_invoice_institution
    ON license_invoice(institution_id);
CREATE INDEX IF NOT EXISTS idx_license_payment_invoice
    ON license_payment(invoice_id);
CREATE INDEX IF NOT EXISTS idx_device_license_institution
    ON device_license(institution_id);
CREATE INDEX IF NOT EXISTS idx_license_event_institution
    ON license_event_log(institution_id, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_license_event_type
    ON license_event_log(event_type, event_timestamp);
```

## Appendix D: TypeScript Types (Desktop App)

```typescript
// ============================================================================
// LICENSE SYSTEM TYPES
// ============================================================================

export enum LicenseType {
  TRIAL = 'TRIAL',
  PAID = 'PAID',
}

export enum LicenseStatus {
  TRIAL_ACTIVE = 'TRIAL_ACTIVE',
  TRIAL_EXPIRING_SOON = 'TRIAL_EXPIRING_SOON',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  PAID_ACTIVE = 'PAID_ACTIVE',
  PAID_EXPIRING_SOON = 'PAID_EXPIRING_SOON',
  GRACE = 'GRACE',
  EXPIRED_LOCKED = 'EXPIRED_LOCKED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export enum LicenseInvoiceType {
  TRIAL_CONVERSION = 'TRIAL_CONVERSION',
  ANNUAL_RENEWAL = 'ANNUAL_RENEWAL',
  PLAN_UPGRADE = 'PLAN_UPGRADE',
  PLAN_DOWNGRADE = 'PLAN_DOWNGRADE',
}

export enum LicenseInvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum LicensePaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FULLY_PAID = 'FULLY_PAID',
  REFUNDED = 'REFUNDED',
}

export enum LicensePaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CHEQUE = 'CHEQUE',
  CASH = 'CASH',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export enum ConfirmationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REVOKED = 'REVOKED',
}

export enum LicenseEventType {
  TRIAL_STARTED = 'TRIAL_STARTED',
  TRIAL_EXPIRING_WARNING = 'TRIAL_EXPIRING_WARNING',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  TRIAL_EXTENDED = 'TRIAL_EXTENDED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  PAYMENT_REJECTED = 'PAYMENT_REJECTED',
  LICENSE_ACTIVATED = 'LICENSE_ACTIVATED',
  LICENSE_RENEWED = 'LICENSE_RENEWED',
  EXPIRING_WARNING = 'EXPIRING_WARNING',
  LICENSE_EXPIRED = 'LICENSE_EXPIRED',
  GRACE_STARTED = 'GRACE_STARTED',
  GRACE_ENDED = 'GRACE_ENDED',
  SYSTEM_LOCKED = 'SYSTEM_LOCKED',
  SYSTEM_UNLOCKED = 'SYSTEM_UNLOCKED',
  LICENSE_SUSPENDED = 'LICENSE_SUSPENDED',
  LICENSE_CANCELLED = 'LICENSE_CANCELLED',
  LICENSE_REACTIVATED = 'LICENSE_REACTIVATED',
  DEVICE_REGISTERED = 'DEVICE_REGISTERED',
  DEVICE_REVOKED = 'DEVICE_REVOKED',
  CLOUD_VALIDATION = 'CLOUD_VALIDATION',
  CLOUD_VALIDATION_FAILED = 'CLOUD_VALIDATION_FAILED',
  TAMPER_DETECTED = 'TAMPER_DETECTED',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
  INVOICE_SENT = 'INVOICE_SENT',
  LOCAL_CACHE_REFRESHED = 'LOCAL_CACHE_REFRESHED',
  CLOCK_DRIFT_WARNING = 'CLOCK_DRIFT_WARNING',
}

export interface InstitutionLicense {
  licenseId: string;
  institutionId: string;
  licenseType: LicenseType;
  planName: string;
  status: LicenseStatus;
  trialStartDate?: string;
  trialEndDate?: string;
  paidStartDate?: string;
  paidEndDate?: string;
  graceStartDate?: string;
  graceEndDate?: string;
  nextInvoiceId?: string;
  maxDevices: number;
  maxUsers: number;
  maxCampuses: number;
  featuresEnabled: string[];
  issuedAt: string;
  lastValidatedAt?: string;
  lastSyncedAt?: string;
  signedLicensePayload?: string;
  signatureVersion: number;
  notes?: string;
}

export interface LicenseInvoice {
  invoiceId: string;
  institutionId: string;
  invoiceType: LicenseInvoiceType;
  issueDate: string;
  dueDate: string;
  periodCoveredStart: string;
  periodCoveredEnd: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  invoiceStatus: LicenseInvoiceStatus;
  paymentStatus: LicensePaymentStatus;
  generatedBy: string;
  linkedLicenseId: string;
  pdfUrl?: string;
}

export interface LicensePayment {
  paymentId: string;
  institutionId: string;
  invoiceId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: LicensePaymentMethod;
  reference: string;
  confirmationStatus: ConfirmationStatus;
  confirmedBy?: string;
  confirmedAt?: string;
  notes?: string;
}

export interface DeviceLicense {
  deviceId: string;
  institutionId: string;
  deviceName: string;
  devicePlatform?: string;
  licenseId: string;
  firstRegisteredAt: string;
  lastSyncDate?: string;
  deviceStatus: DeviceStatus;
  allowed: boolean;
  registeredBy: string;
}

export interface LicenseEvent {
  eventId: string;
  institutionId: string;
  licenseId: string;
  eventType: LicenseEventType;
  eventTimestamp: string;
  deviceId?: string;
  userId?: string;
  oldStatus?: LicenseStatus;
  newStatus?: LicenseStatus;
  metadata?: Record<string, unknown>;
  notes?: string;
}

export interface LicenseCache {
  institutionId: string;
  licenseId: string;
  licenseType: LicenseType;
  status: LicenseStatus;
  issuedAt: string;
  validFrom: string;
  validUntil: string;
  graceUntil?: string;
  allowedFeatures: string[];
  maxDevices: number;
  maxUsers: number;
  maxCampuses: number;
  signedPayload: string;
  signature: string;
  signatureVersion: number;
  lastServerTime?: string;
  lastLocalTimeAtSync?: string;
  lastValidatedAt?: string;
  offlineDaysSinceSync: number;
  cacheVersion: number;
}

export type LicenseWarningLevel = 'NOTICE' | 'INFO' | 'WARNING' | 'URGENT' | 'CRITICAL' | 'EXPIRED';

export interface LicenseWarning {
  level: LicenseWarningLevel;
  message: string;
  daysRemaining?: number;
  showOnLogin: boolean;
  showOnDashboard: boolean;
  showOnAllScreens: boolean;
  dismissible: boolean;
  invoiceAvailable: boolean;
}
```

---

*End of Specification — MAPLE School Finance ERP License System v1.0.0*
