# MAPLE School Finance ERP — PRINT DOCUMENT BRANDING, PDF RENDERING & INSTITUTION CUSTOMIZATION SPECIFICATION

**Version:** 1.0.0
**Last Updated:** 2026-04-07
**Country Context:** Uganda (UGX, private schools, offline-first desktop ERP)

---

## Table of Contents

1. [Print Branding Overview](#1-print-branding-overview)
2. [Institution Customization Form](#2-institution-customization-form)
3. [Logo Upload & Validation](#3-logo-upload--validation)
4. [Standard Print Header](#4-standard-print-header)
5. [Watermark Rules](#5-watermark-rules)
6. [A4 PDF Rendering Rules](#6-a4-pdf-rendering-rules)
7. [Document Template System](#7-document-template-system)
8. [Transaction Document Standards](#8-transaction-document-standards)
9. [Financial Statement Standards](#9-financial-statement-standards)
10. [Offline-First PDF Generation](#10-offline-first-pdf-generation)
11. [Preview / Download / Print Workflow](#11-preview--download--print-workflow)
12. [Error Handling & Fallback](#12-error-handling--fallback)
13. [Role & Permission Rules](#13-role--permission-rules)
14. [Reprint Controls](#14-reprint-controls)
15. [Phase 1 vs Phase 2](#15-phase-1-vs-phase-2)
16. [Risks & Controls](#16-risks--controls)

---

## 1. Print Branding Overview

### 1.1 Governing Principle

Every printable document in the MAPLE ERP is an official institution document. It must be institution-branded, professionally formatted, rendered first to **A4 PDF**, and available for preview, download, and print — fully offline.

### 1.2 What Is Branded

**All** printable outputs are branded. There are no unbranded printable pages. The following is the canonical list:

| Category | Documents |
|----------|-----------|
| **Collections** | Receipt, Payment acknowledgement |
| **Billing** | Invoice, Credit note, Debit note, Student statement, Family statement, Sponsor statement, Fee schedule |
| **Transport** | Transport statement, Transport billing summary |
| **Inventory** | Inventory issue note, Stock receipt note |
| **Procurement** | Purchase order, Goods received note, Supplier invoice summary, Supplier payment voucher, Expense voucher |
| **Accounting** | Journal voucher, Journal report, Trial balance, Income statement, Balance sheet, Cash flow statement |
| **Bank** | Bank reconciliation report |
| **Payroll** | Payroll summary, Payslip |
| **Budget** | Budget summary, Budget vs actual report |
| **Audit** | Audit trail report, Exception report |

### 1.3 How Branding Is Applied

Branding is **automatic**. Once an institution has configured its profile (see §2), every document template pulls:

- Logo from the `institution.logo` asset
- Name, address, contacts from the `institution` record
- Watermark from the same logo asset
- Footer text from `institution.print_settings`

No user manually types the school name into a print dialog. The active institution context (see INSTITUTION_CONTEXT spec) drives all branding.

### 1.4 Rendering Pipeline

```
User action (print/preview/download)
  │
  ▼
Template engine loads:
  • institution branding (logo, name, address)
  • document data (invoice lines, totals, etc.)
  • print settings (watermark, footer, margins)
  │
  ▼
PDF renderer produces A4 PDF in memory
  │
  ▼
PDF is displayed in preview modal
  │
  ├── User clicks Print → system sends PDF to OS print dialog
  ├── User clicks Download → browser saves PDF file
  └── User clicks Cancel → PDF discarded
```

---

## 2. Institution Customization Form

### 2.1 Form Identity

| Property | Value |
|----------|-------|
| Form ID | `INST-001` |
| Module | Institution & Setup |
| Purpose | Manage institution identity, branding, and print settings |
| Primary roles | SUPER_ADMIN, DIRECTOR |
| Workflow | Edit → Save → Audit log. No approval required unless policy demands it. |

### 2.2 Field Specification — Section A: Identity

| # | Field | Type | Required | Validation | Default |
|---|-------|------|----------|------------|---------|
| 1 | Institution name | text | ✓ | 3-200 chars | — |
| 2 | Short name | text | — | 2-30 chars | — |
| 3 | Institution code | text | — | Alphanumeric, unique | Auto-gen |
| 4 | Institution type | select | ✓ | Nursery, Primary, Secondary, Mixed | Mixed |
| 5 | Physical address | textarea | ✓ | 5-500 chars | — |
| 6 | District | text | ✓ | 2-100 chars | — |
| 7 | Region | text | — | 2-100 chars | — |
| 8 | P.O. Box | text | — | Free text, max 50 chars | — |
| 9 | Primary phone | tel | ✓ | Must start with `+256` or `0`, 10-13 digits | — |
| 10 | Secondary phone | tel | — | Same validation as primary | — |
| 11 | Official email | email | — | Valid email format | — |
| 12 | Website | url | — | Valid URL format | — |
| 13 | Motto / tagline | text | — | Max 150 chars | — |
| 14 | URA TIN | text | — | 10-digit numeric | — |
| 15 | NSSF registration number | text | — | Alphanumeric | — |

### 2.3 Field Specification — Section B: Logo & Branding

| # | Field | Type | Required | Validation | Default |
|---|-------|------|----------|------------|---------|
| 16 | Primary logo | file upload | ✓ (for printing) | See §3 | — |
| 17 | Logo preview | display-only | — | Live preview after upload | — |
| 18 | Logo alignment | select | — | `center-above` / `left-with-text-right` | `center-above` |
| 19 | Watermark enabled | toggle | — | boolean | `true` |
| 20 | Watermark opacity | slider | — | 3%-15%, step 1% | `6%` |

### 2.4 Field Specification — Section C: Print Settings

| # | Field | Type | Required | Validation | Default |
|---|-------|------|----------|------------|---------|
| 21 | Default paper size | select (locked) | — | `A4` only in Phase 1 | `A4` |
| 22 | Header branding enabled | toggle | — | boolean | `true` |
| 23 | Show footer disclaimer | toggle | — | boolean | `false` |
| 24 | Footer disclaimer text | textarea | — | Max 300 chars. Shown only if #23 is true. | — |
| 25 | Show footer official note | toggle | — | boolean | `false` |
| 26 | Footer official note text | textarea | — | Max 300 chars | — |
| 27 | Show print timestamp | toggle | — | boolean | `true` |
| 28 | Show "Generated by" user | toggle | — | boolean | `false` |
| 29 | Signature block default | select | — | `none` / `prepared-checked-approved` / `prepared-approved` | `prepared-approved` |
| 30 | Top margin (mm) | number | — | 10-30 | `15` |
| 31 | Bottom margin (mm) | number | — | 10-30 | `15` |
| 32 | Side margins (mm) | number | — | 10-25 | `18` |

### 2.5 Audit & Permissions

| Rule | Detail |
|------|--------|
| Edit permission | SUPER_ADMIN, DIRECTOR only |
| View permission | SUPER_ADMIN, DIRECTOR, HEADTEACHER, BURSAR |
| Audit | Every save creates audit record with old values, new values, user, timestamp |
| Logo change audit | Old logo hash and new logo hash recorded; old file retained 90 days |
| Versioning | Sequential version number incremented on every save |

---

## 3. Logo Upload & Validation

### 3.1 Accepted Formats

| Format | MIME Type | Supported |
|--------|-----------|:---------:|
| PNG | `image/png` | ✓ (preferred) |
| JPEG | `image/jpeg` | ✓ |
| SVG | `image/svg+xml` | Phase 2 |
| WebP | `image/webp` | ✗ |
| BMP | `image/bmp` | ✗ |
| GIF | `image/gif` | ✗ |

### 3.2 Validation Rules

| Rule | Constraint | Error Message |
|------|-----------|---------------|
| File type | PNG or JPEG only | "Logo must be PNG or JPEG format" |
| Max file size | 2 MB | "Logo file must be under 2 MB" |
| Min dimensions | 200 × 200 px | "Logo must be at least 200×200 pixels" |
| Max dimensions | 2000 × 2000 px | "Logo must not exceed 2000×2000 pixels" |
| Aspect ratio | Between 1:3 and 3:1 | "Logo aspect ratio is too extreme. Please use a more balanced image." |
| Corruption check | Decode header bytes to verify format | "File appears corrupted. Please upload a valid image." |
| Transparency | Preferred for PNG; not enforced | Advisory note: "For best results, use a logo with transparent background" |

### 3.3 Upload UX Flow

```
1. User clicks "Upload Logo" or drags file into drop zone
2. Client-side validation (type, size)
3. Image decoded → dimensions validated
4. Preview displayed at print-header scale (≈180px wide)
5. User confirms or cancels
6. On confirm:
   a. Logo binary stored in local institution assets table
   b. Old logo hash recorded in audit log
   c. Existing documents do NOT re-render (they used logo at time of generation)
   d. Future documents use new logo
7. Sync pushes logo to cloud backup
```

### 3.4 Storage

| Aspect | Rule |
|--------|------|
| Local storage | SQLite BLOB or local file in `{app_data}/branding/{institution_id}/logo.{ext}` |
| Cloud storage | Object/blob storage keyed by `institution_id/logo_v{version}.{ext}` |
| Cache | Logo decoded and cached in memory on app startup for fast PDF rendering |
| Offline | Logo stored locally; available for PDF generation without network |
| Sync conflict | Cloud logo is authoritative. If cloud logo changed while offline, device downloads new logo on next sync. |
| History | Old logos archived with version number. Retained 90 days. |

### 3.5 Logo Usage Map

| Context | Logo Source | Behavior |
|---------|-----------|----------|
| Print header | Primary logo, full color | Rendered at header scale (see §4) |
| Body watermark | Same primary logo | Rendered large, very low opacity (see §5) |
| App sidebar (optional) | Same primary logo | Small icon display |
| Login screen (optional) | Same primary logo | Medium display |

---

## 4. Standard Print Header

### 4.1 Header Content Order (STRICT)

Every printable document header MUST display the following elements in this exact order:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         [INSTITUTION LOGO]                              │
│                                                                         │
│                      INSTITUTION FULL NAME                              │
│                        Physical Address                                 │
│                  P.O. Box 12345, Kampala, Uganda                        │
│                      Tel: +256 700 123 456                              │
│                    Email: info@school.ac.ug                             │
│                                                                         │
│─────────────────────────────────────────────────────────────────────────│
│                       DOCUMENT TITLE                                    │
│─────────────────────────────────────────────────────────────────────────│
```

### 4.2 Header Layout Rules — Default Mode: `center-above`

| Element | Position | Style |
|---------|----------|-------|
| Logo | Top center | Max height 60px, max width 180px, aspect-ratio preserved |
| Institution name | Center, below logo | **Bold**, 14pt, uppercase |
| Address | Center, below name | Normal, 9pt |
| P.O. Box | Center, same line or next line after address | Normal, 9pt. **Omit entirely if empty.** |
| Phone | Center, below address block | Normal, 9pt. Prefix with "Tel: " |
| Email | Center, below phone | Normal, 9pt. Prefix with "Email: ". **Omit entirely if empty.** |
| Website | **Do not show** in document header (Phase 1) | — |
| Motto | **Do not show** in document header (Phase 1) | — |

### 4.3 Header Layout Rules — Alternative Mode: `left-with-text-right`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [LOGO]    INSTITUTION FULL NAME                                        │
│            Physical Address                                             │
│            P.O. Box 12345, Kampala                                      │
│            Tel: +256 700 123 456 | Email: info@school.ac.ug             │
│                                                                         │
│─────────────────────────────────────────────────────────────────────────│
```

| Element | Position | Style |
|---------|----------|-------|
| Logo | Left-aligned, vertically centered | Max height 70px, max width 70px |
| Institution name | Right of logo | **Bold**, 13pt, uppercase |
| Address + contacts | Right of logo, below name | Normal, 9pt, stacked |

### 4.4 Header Omission Rules

| Situation | Behavior |
|-----------|----------|
| No logo uploaded | Skip logo space. Show institution name first. No blank square. |
| No P.O. Box | Omit P.O. Box line entirely. Lines below shift up. |
| No email | Omit email line entirely. |
| No secondary phone | Show primary phone only. |
| No phone at all | Omit phone line entirely. (Unusual but possible.) |
| All optional fields missing | Show only: Logo (if available) + Institution Name + Address |

### 4.5 Header Separator

Below the header identity block, a thin horizontal rule (0.5pt, `#cccccc`) separates the header from the document title area.

### 4.6 Document Title Block

Immediately below the header separator:

| Element | Style |
|---------|-------|
| Document title | **Bold**, 12pt, centered. Examples: "OFFICIAL RECEIPT", "FEE INVOICE", "TRIAL BALANCE" |
| Document subtitle (optional) | Normal, 9pt, centered. Examples: "For the period ended 31 December 2025" |

Below the document title, another thin horizontal rule.

### 4.7 Header Height Budget

The entire header (logo + identity + separator + title) should consume no more than **80mm** of vertical space on an A4 page (297mm height). Target: **55-65mm**.

---

## 5. Watermark Rules

### 5.1 Core Watermark Behavior

| Property | Value |
|----------|-------|
| Source | Institution primary logo |
| Position | Centered in page body area (between header and footer) |
| Opacity | Default 6%. Configurable 3%-15%. |
| Z-order | Behind all content (text, tables, lines render above watermark) |
| Scaling | Width = 60% of page body width. Height scales proportionally preserving aspect ratio. |
| Rotation | 0° (no rotation). The logo is displayed naturally. |
| Repeat | Single instance per page. Not tiled. |
| Color mode | Grayscale conversion of original logo for subtlety |

### 5.2 Watermark Render Rules

```
PDF page composition order:
  1. White page background
  2. Watermark image (centered, low opacity, grayscale)
  3. Header block
  4. Body content (text, tables, totals)
  5. Footer block
```

### 5.3 Document-Type Watermark Intensity

| Document Category | Recommended Opacity | Rationale |
|-------------------|:-------------------:|-----------|
| Receipt, invoice, credit/debit note | 6% (default) | Standard transaction documents |
| Statement (student/family/sponsor) | 5% | Contains tables; readability is priority |
| Financial statements (TB, IS, BS, CF) | 4% | Dense numeric tables; watermark must be very faint |
| Budget reports | 4% | Dense tables |
| Payslip | 6% | Single-page, moderate content density |
| Vouchers (payment, expense, journal) | 6% | Standard |
| Audit reports | 4% | Dense, must be crystal clear for auditors |

The system MAY auto-reduce watermark intensity by −1% for documents containing more than 20 table rows on a single page.

### 5.4 Watermark Disable Rules

| Condition | Behavior |
|-----------|----------|
| Watermark disabled in institution settings | No watermark on any document |
| No logo uploaded | No watermark (no fallback text watermark in Phase 1) |
| Logo file corrupted/unreadable | No watermark; log warning; continue PDF generation |

---

## 6. A4 PDF Rendering Rules

### 6.1 Paper & Margins

| Property | Value |
|----------|-------|
| Paper size | A4 (210mm × 297mm) |
| Top margin | Default 15mm (configurable 10-30mm) |
| Bottom margin | Default 15mm (configurable 10-30mm) |
| Left margin | Default 18mm (configurable 10-25mm) |
| Right margin | Default 18mm (configurable 10-25mm) |
| Body width | 210 − 18 − 18 = **174mm** (default) |
| Body height | 297 − 15 − 15 = **267mm** (default) |

### 6.2 Orientation Defaults

| Document Type | Orientation | Rationale |
|---------------|:-----------:|-----------|
| Receipt | Portrait | Compact single-page |
| Invoice | Portrait | Standard format |
| Credit / Debit note | Portrait | Standard format |
| Student / Family statement | Portrait | Standard format |
| Sponsor statement | Portrait | Standard format |
| Fee schedule | Portrait | Moderate columns |
| Payment voucher | Portrait | Standard format |
| Expense voucher | Portrait | Standard format |
| Purchase order | Portrait | Standard format |
| Goods received note | Portrait | Standard format |
| Payslip | Portrait | Single-page |
| Journal voucher | Portrait | Standard format |
| **Trial balance** | **Portrait** (Landscape if >6 comparison columns) | Typically 4-5 columns |
| **Income statement** | Portrait | Standard accounting format |
| **Balance sheet** | Portrait | Standard accounting format |
| **Cash flow** | Portrait | Standard format |
| **Budget vs actual** | **Landscape** | 8+ columns typical |
| **Bank reconciliation** | Portrait | Standard format |
| **Payroll summary** | **Landscape** | Many columns (name, gross, PAYE, NSSF, LST, net, etc.) |
| **AR aging** | **Landscape** | Multiple aging bucket columns |
| **AP aging** | **Landscape** | Multiple aging bucket columns |
| **Audit trail report** | **Landscape** | Many fields per row |

### 6.3 Typography

| Element | Font | Size | Weight |
|---------|------|:----:|--------|
| Institution name (header) | System sans-serif (e.g., Inter, Helvetica) | 14pt | Bold |
| Header contact lines | Same | 9pt | Normal |
| Document title | Same | 12pt | Bold |
| Section headings | Same | 10pt | Bold |
| Body text | Same | 9pt | Normal |
| Table headers | Same | 8.5pt | Bold |
| Table body | Same | 8.5pt | Normal |
| Table totals | Same | 9pt | Bold |
| Footer text | Same | 7.5pt | Normal |
| Page numbers | Same | 7.5pt | Normal |

### 6.4 Font Embedding

Fonts must be embedded in the generated PDF to ensure consistent rendering across all devices and printers. The rendering engine must not rely on system fonts being available on the print device.

### 6.5 Pagination Rules

| Rule | Detail |
|------|--------|
| Page breaks | Automatic after body content fills available page height |
| Orphan control | Minimum 2 data rows on any page. If only 1 row would remain, break earlier. |
| Widow control | Minimum 2 data rows at top of new page |
| Table header repeat | Table column headers repeat at top of every continuation page |
| Totals protection | Totals row + 1 preceding data row must stay together (no split) |
| Signature protection | Signature block must appear on the same page as the totals. If insufficient space, start new page for totals + signature. |
| Page number | "Page X of Y" — bottom-right corner of every page |
| Multi-page header | Full institution header on page 1 only. Pages 2+ show a condensed single-line header: institution name + document title + document number |

### 6.6 Continuation Header (Pages 2+)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Maple Private School    │    OFFICIAL RECEIPT    │    RCP-2025-000142    │
│─────────────────────────────────────────────────────────────────────────│
```

Height: ~12mm. Single horizontal band. No logo repeat. No address repeat. Watermark still renders on all pages.

### 6.7 Number Formatting (Uganda)

| Type | Format | Example |
|------|--------|---------|
| Currency | `UGX {amount}` — thousand separator: comma, no decimal places | `UGX 1,250,000` |
| Large amounts in narrative | `UGX 85.4M` allowed in KPIs/summaries | — |
| Dates | `DD/MM/YYYY` | `07/04/2026` |
| Timestamps | `DD/MM/YYYY HH:mm` (24hr) | `07/04/2026 14:30` |
| Phone | `+256 7XX XXX XXX` | `+256 700 123 456` |
| Percentages | `XX.X%` | `95.2%` |

---

## 7. Document Template System

### 7.1 Template Architecture

All printable documents share a common template engine with these reusable components:

```
PrintTemplate
├── InstitutionHeader         — logo, name, address, contacts
├── DocumentTitleBar          — "OFFICIAL RECEIPT", "FEE INVOICE", etc.
├── MetadataBlock             — document number, date, reference, student/party info
├── Watermark                 — logo watermark behind content
├── ContentBody               — varies per document type
│   ├── NarrativeSection      — free-text description
│   ├── LineItemsTable        — structured rows with columns
│   ├── TotalsSection         — subtotals, taxes, grand total
│   └── NotesSection          — comments, terms, instructions
├── SignatureBlock (optional) — Prepared By / Checked By / Approved By
├── Footer                    — disclaimer, timestamp, page numbers
└── ContinuationHeader       — condensed header for pages 2+
```

### 7.2 Reusable Component Specifications

#### InstitutionHeader

```typescript
interface InstitutionHeader {
  logo: ImageAsset | null;
  name: string;            // required
  address: string;         // required
  poBox?: string;          // shown if present
  phone: string;           // required
  phone2?: string;
  email?: string;          // shown if present
  layout: 'center-above' | 'left-with-text-right';
}
```

#### MetadataBlock

```typescript
interface MetadataBlock {
  // Left column
  leftFields: { label: string; value: string }[];
  // Right column  
  rightFields: { label: string; value: string }[];
}

// Example for Receipt:
// Left:  Receipt No: RCP-2025-000142, Date: 07/04/2026
// Right: Student: Nakato Sarah (S3 Blue), Class: S3 Blue, Inv Ref: INV-2025-000089
```

Layout: Two-column grid, labels in 8pt muted, values in 9pt bold.

#### LineItemsTable

```typescript
interface LineItemsTable {
  columns: { header: string; align: 'left' | 'center' | 'right'; width?: string }[];
  rows: (string | number)[][];
  showRowNumbers: boolean;
  totals?: { label: string; value: string }[];
  subtotals?: { label: string; value: string }[];
}
```

#### SignatureBlock

```typescript
interface SignatureBlock {
  style: 'none' | 'prepared-approved' | 'prepared-checked-approved';
  entries: {
    label: string;    // "Prepared By", "Approved By"
    name?: string;    // pre-filled from user context
    date?: string;
    signatureLine: boolean;  // draw ________ line
  }[];
}
```

Default layout: Signature entries in horizontal row at bottom, each with label, `________` line, name, and date.

#### Footer

```typescript
interface DocumentFooter {
  disclaimerText?: string;       // from institution settings
  officialNoteText?: string;     // from institution settings
  showTimestamp: boolean;        // "Generated: 07/04/2026 14:30"
  showGeneratedBy: boolean;     // "Generated by: John Doe (Bursar)"
  pageNumbers: boolean;          // always true
}
```

### 7.3 Template Registration

Each document type registers its template configuration:

```typescript
const RECEIPT_TEMPLATE: DocumentTemplate = {
  id: 'TPL-RECEIPT',
  title: 'OFFICIAL RECEIPT',
  orientation: 'portrait',
  headerStyle: 'full',          // page 1
  watermark: true,
  metadata: {
    left: ['receiptNo', 'receiptDate', 'paymentMethod', 'paymentRef'],
    right: ['studentName', 'class', 'invoiceRef', 'academicYear'],
  },
  body: 'line-items',           // uses LineItemsTable
  showTotals: true,
  showNotes: true,
  signatureBlock: 'prepared-approved',
  footer: true,
};
```

---

## 8. Transaction Document Standards

### 8.1 Receipt (Official Receipt)

| Zone | Content |
|------|---------|
| Header | Full institution header (§4) |
| Title | "OFFICIAL RECEIPT" |
| Metadata left | Receipt No, Date, Payment Method, Payment Ref, Bank/MoMo Ref |
| Metadata right | Student Name, Class/Stream, Invoice Ref, Academic Year, Term |
| Body | Line items table: # / Description / Amount |
| Totals | Total Received: UGX X,XXX,XXX — **in words**: "Uganda Shillings One Million Two Hundred Fifty Thousand Only" |
| Notes | "This receipt is valid subject to cheque/bank clearance" (if non-cash) |
| Signature | Prepared By: _______ / Received By: _______ |
| Watermark | Institution logo, default opacity |

**Amount in words** is mandatory on receipts. Pattern: "Uganda Shillings {amount} Only".

### 8.2 Invoice (Fee Invoice)

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "FEE INVOICE" |
| Metadata left | Invoice No, Invoice Date, Due Date, Term, Academic Year |
| Metadata right | Student Name, Student ID, Class/Stream, Guardian/Payer Name |
| Body | Line items: # / Fee Category / Description / Amount |
| Totals | Subtotal, Less: Discount/Bursary (if any), **Total Due**: UGX X,XXX,XXX |
| Balance info | Previously Paid: UGX X / Balance Due: UGX X,XXX,XXX (bold, highlighted) |
| Notes | Payment instructions: "Payments can be made via MTN MoMo (merchant code: XXXXXX), Airtel Money, or bank deposit to Stanbic Bank A/C XXXXXXXXX" |
| Signature | Prepared By: _______ |
| Watermark | Institution logo |

### 8.3 Credit Note

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "CREDIT NOTE" |
| Metadata left | Credit Note No, Date, Original Invoice Ref |
| Metadata right | Student Name, Class, Reason |
| Body | Line items: # / Description / Amount Credited |
| Totals | Total Credit: UGX X,XXX,XXX |
| Notes | Reason for credit |
| Signature | Prepared By / Approved By |

### 8.4 Debit Note

Same structure as Credit Note with title "DEBIT NOTE" and "Amount Debited" column.

### 8.5 Student Statement

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "STUDENT FEE STATEMENT" |
| Metadata | Student Name, Student ID, Class, Guardian, Academic Year, Term, Statement Period |
| Body | Transaction table: Date / Reference / Description / Debit / Credit / Balance |
| Opening | Opening Balance: UGX X,XXX,XXX |
| Closing | **Closing Balance: UGX X,XXX,XXX** (bold) |
| Summary | Total Invoiced / Total Paid / Outstanding Balance |
| Notes | "This statement was generated as at {date}. For queries, contact the Bursar's office." |
| Watermark | Institution logo, reduced opacity (5%) due to table density |

### 8.6 Family Statement

Same as Student Statement but aggregates all students under one guardian/payer. Additional column: Student Name.

### 8.7 Sponsor Statement

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "SPONSOR STATEMENT" |
| Metadata | Sponsor Name, Sponsor ID, Coverage Type, Period |
| Body | Student-level breakdown: Student / Class / Fee Covered / Amount / Status |
| Totals | Total Committed / Total Disbursed / Balance Pending |
| Watermark | Institution logo |

### 8.8 Fee Schedule

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "FEE SCHEDULE — {Academic Year} {Term}" |
| Body | Table grouped by class level: Fee Category / Day Scholar / Boarder (if applicable) |
| Totals | Total per class level |
| Notes | "Fees are payable by {due date}. A penalty of X% applies after the due date." (if configured) |

### 8.9 Purchase Order

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "PURCHASE ORDER" |
| Metadata left | PO Number, PO Date, Delivery Date, Payment Terms |
| Metadata right | Supplier Name, Contact, Address |
| Body | Line items: # / Item Description / Qty / Unit / Unit Price / Total |
| Totals | Subtotal, VAT (if applicable), **Grand Total** |
| Notes | Delivery instructions, terms |
| Signature | Requested By / Approved By / Received By |

### 8.10 Goods Received Note

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "GOODS RECEIVED NOTE" |
| Metadata | GRN No, Date, PO Reference, Supplier |
| Body | # / Item / Qty Ordered / Qty Received / Qty Rejected / Remarks |
| Signature | Received By / Checked By (Storekeeper) |

### 8.11 Payment Voucher (Supplier/Expense)

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "PAYMENT VOUCHER" |
| Metadata | Voucher No, Date, Payee, Payment Method, Bank/MoMo Reference |
| Body | # / Description / Account Code / Amount |
| Totals | Total: UGX X,XXX,XXX — **in words** |
| Signature | Prepared By / Checked By / Approved By |
| Notes | Supporting document references (invoice numbers, receipt numbers) |

### 8.12 Payslip

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "PAYSLIP — {Month Year}" |
| Metadata | Employee Name, Employee ID, Department, Designation, TIN, NSSF No |
| Body - Earnings | Basic Salary, Allowances (itemized) |
| Body - Deductions | PAYE, NSSF (employee), LST, Other deductions (itemized) |
| Summary | Gross Pay / Total Deductions / **Net Pay**: UGX X,XXX,XXX (bold, large) |
| Employer contributions | NSSF (employer) — shown for information |
| Signature | Prepared By / Approved By |
| Confidentiality | "CONFIDENTIAL — For the named employee only" |

### 8.13 Journal Voucher

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "JOURNAL VOUCHER" |
| Metadata | Journal No, Date, Period, Reference, Narration |
| Body | Account Code / Account Name / Debit / Credit |
| Totals | Total Debits = Total Credits (must balance) |
| Signature | Prepared By / Approved By / Posted By |

### 8.14 Inventory Issue Note

| Zone | Content |
|------|---------|
| Header | Full institution header |
| Title | "STUDENT ISSUE NOTE" |
| Metadata | Issue No, Date, Student Name, Class |
| Body | # / Item / Qty / Unit Price / Total |
| Totals | Total: UGX X,XXX,XXX |
| Signature | Issued By (Storekeeper) / Received By (Student/Guardian signature) |

---

## 9. Financial Statement Standards

### 9.1 Common Financial Statement Layout

All financial statements follow this enhanced structure:

```
┌─────────────────────────────────────────────────────────────────┐
│                  [Full Institution Header]                       │
│─────────────────────────────────────────────────────────────────│
│                    STATEMENT TITLE                               │
│           For the period ended DD/MM/YYYY                        │
│             (Expressed in Uganda Shillings)                      │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│                    [WATERMARK - very faint]                       │
│                                                                  │
│  [Statement body — tables, sections, totals]                     │
│                                                                  │
│─────────────────────────────────────────────────────────────────│
│  Notes:                                                          │
│  1. These financial statements are prepared on a cash/accrual    │
│     basis in accordance with school accounting policy.           │
│  2. Figures in brackets indicate negative amounts.               │
│                                                                  │
│  Prepared By: ________    Approved By: ________                  │
│  Name:                    Name:                                  │
│  Date:                    Date:                                  │
│─────────────────────────────────────────────────────────────────│
│  Generated: 07/04/2026 14:30          Page 1 of 3               │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Trial Balance

| Property | Value |
|----------|-------|
| Title | "TRIAL BALANCE" |
| Subtitle | "As at {date}" |
| Orientation | Portrait (default) or Landscape if comparative columns exceed 6 |
| Columns | Account Code / Account Name / Debit / Credit |
| Comparative (optional) | Current Period / Prior Period side by side |
| Totals | Total Debits / Total Credits (must match) |
| Grouping | Assets, Liabilities, Equity, Income, Expenses — with subtotals per group |
| Watermark | 4% opacity |

### 9.3 Income Statement

| Property | Value |
|----------|-------|
| Title | "INCOME STATEMENT" |
| Subtitle | "For the period {start} to {end}" |
| Orientation | Portrait |
| Structure | Income section (Tuition, Boarding, Transport, Other) → Total Income; Expense section (Salaries, Supplies, Utilities, etc.) → Total Expenses; **Net Surplus / (Deficit)** |
| Negative amounts | Shown in brackets: `(1,250,000)` |
| Comparative | Current period / Budget / Variance columns (optional) |

### 9.4 Balance Sheet

| Property | Value |
|----------|-------|
| Title | "BALANCE SHEET" (or "STATEMENT OF FINANCIAL POSITION") |
| Subtitle | "As at {date}" |
| Orientation | Portrait |
| Structure | Assets (Current + Non-current) / Liabilities (Current + Long-term) / Equity |
| Rule | Total Assets = Total Liabilities + Equity |

### 9.5 Cash Flow Statement

| Property | Value |
|----------|-------|
| Title | "CASH FLOW STATEMENT" |
| Subtitle | "For the period {start} to {end}" |
| Orientation | Portrait |
| Structure | Operating Activities / Investing Activities / Financing Activities → Net Change in Cash → Opening Cash → **Closing Cash** |

### 9.6 Budget vs Actual Report

| Property | Value |
|----------|-------|
| Title | "BUDGET VS ACTUAL REPORT" |
| Subtitle | "For the period {start} to {end}" |
| Orientation | **Landscape** |
| Columns | Account / Budget / Actual / Variance (UGX) / Variance (%) / Status |
| Status | On Track (green) / Over Budget (red) / Under Budget (blue) |
| Print note | Color indicators print as text labels if color printing unavailable |

### 9.7 Bank Reconciliation Report

| Property | Value |
|----------|-------|
| Title | "BANK RECONCILIATION STATEMENT" |
| Subtitle | "For {Bank Name} Account ****{last4} as at {date}" |
| Orientation | Portrait |
| Structure | Balance per bank statement → Add: deposits in transit → Less: outstanding cheques → **Adjusted bank balance** / Balance per books → Add/Less: adjustments → **Adjusted book balance** |
| Bottom | Reconciled ✓ or Unreconciled with difference highlighted |

### 9.8 Accounts Receivable Aging

| Property | Value |
|----------|-------|
| Title | "ACCOUNTS RECEIVABLE AGING REPORT" |
| Subtitle | "As at {date}" |
| Orientation | **Landscape** |
| Columns | Student / Class / Current / 1-30 Days / 31-60 Days / 61-90 Days / >90 Days / Total |
| Totals | Column totals + Grand total |
| Summary | % by aging bucket |

### 9.9 Payroll Summary

| Property | Value |
|----------|-------|
| Title | "PAYROLL SUMMARY" |
| Subtitle | "For the month of {Month Year}" |
| Orientation | **Landscape** |
| Columns | # / Name / Department / Basic / Allowances / Gross / PAYE / NSSF(E) / LST / Other Ded / Net Pay |
| Totals | Column totals |
| Employer costs | NSSF (Employer) total shown separately below |
| Signature | Prepared By / Approved By / Authorized By |

---

## 10. Offline-First PDF Generation

### 10.1 Architecture

```
┌─────────────────────────────────────────────────────┐
│                  MAPLE ERP (Desktop)                 │  
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  PDF Rendering Engine (embedded, local)       │   │
│  │  • Template engine                            │   │
│  │  • Font files (bundled with app)              │   │
│  │  • Logo asset (cached from institution data)  │   │
│  │  • Layout engine (A4, margins, pagination)    │   │
│  │  • Output: PDF binary in memory               │   │
│  └──────────────────────────────────────────────┘   │
│           │                                          │
│           ▼                                          │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────┐    │
│  │ Preview Modal │  │ Download    │  │ OS Print │    │
│  │ (PDF viewer)  │  │ (save .pdf) │  │ Dialog   │    │
│  └──────────────┘  └─────────────┘  └─────────┘    │
└─────────────────────────────────────────────────────┘

NO INTERNET REQUIRED FOR ANY STEP.
```

### 10.2 Offline Requirements

| Requirement | Implementation |
|-------------|---------------|
| PDF generation | Fully local. No server rendering. No cloud API calls. |
| Fonts | Bundled with the Tauri desktop app binary |
| Logo | Cached locally in app data folder after initial upload or sync |
| Templates | Compiled into the app. No runtime fetch. |
| Preview | Rendered in embedded PDF viewer or WebView-based viewer |
| Download | Standard OS file-save dialog. Works offline. |
| Print | Standard OS print dialog. Works offline. |
| Audit log | Logged locally with device timestamp. Synced to cloud later. |

### 10.3 Branding Asset Sync

| Scenario | Behavior |
|----------|----------|
| Normal | Logo and institution data synced during regular sync cycle |
| Logo updated in another device | New logo downloads on next sync. Existing generated PDFs are not retroactively updated. |
| Device has never synced | Logo must be uploaded locally on this device first |
| Logo exists locally but is older than cloud version | Replace local with cloud version on sync |
| Network unavailable for extended period | Use locally cached logo. No interruption to printing. |

### 10.4 Technology Implementation Notes

For the Tauri + React desktop app:

| Component | Recommended Approach |
|-----------|---------------------|
| PDF generation | Rust-side PDF library (e.g., `printpdf`, `genpdf`, or `lopdf`) invoked via Tauri command, OR client-side JS library (e.g., `jspdf` + `html2canvas`, or `@react-pdf/renderer`) |
| Font embedding | Bundle `.ttf` files in Tauri resource directory |
| Logo rendering | Read logo from local SQLite BLOB or file path, embed in PDF |
| Preview | Render PDF as `blob:` URL displayed in `<iframe>` or dedicated viewer component |
| Print | Send PDF blob to `window.print()` or Tauri print command |
| Download | Tauri `dialog.save` + `fs.writeBinaryFile` for native save dialog |

---

## 11. Preview / Download / Print Workflow

### 11.1 Standard User Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User navigates to printable record or report              │
│    (e.g., opens Receipt RCP-2025-000142)                     │
│                                                               │
│ 2. User clicks [Print / Preview] button                       │
│                                                               │
│ 3. System generates A4 PDF:                                   │
│    • Load institution branding (cached locally)               │
│    • Load document data from local DB                         │
│    • Render PDF using template engine                         │
│    • PDF is held in memory (not saved to disk yet)            │
│                                                               │
│ 4. PDF Preview modal opens:                                   │
│    ┌─────────────────────────────────────────────────────┐    │
│    │  [← Back]              Preview               [✕]   │    │
│    │─────────────────────────────────────────────────────│    │
│    │                                                     │    │
│    │              [PDF rendered in viewer]                │    │
│    │                                                     │    │
│    │─────────────────────────────────────────────────────│    │
│    │      [🖨 Print]    [⬇ Download PDF]    [Cancel]     │    │
│    └─────────────────────────────────────────────────────┘    │
│                                                               │
│ 5a. [Print] → Opens OS print dialog with PDF                 │
│ 5b. [Download PDF] → Opens OS save dialog, saves .pdf file   │
│ 5c. [Cancel] → Closes preview, discards in-memory PDF        │
│                                                               │
│ 6. Audit log records: user, action, document ID, timestamp    │
└──────────────────────────────────────────────────────────────┘
```

### 11.2 Direct Print vs Preview

| Mode | When Used |
|------|-----------|
| Preview first (default) | User clicks "Preview" or "Print Preview" — sees PDF before deciding |
| Direct print | Only if institution enables "skip preview" setting for specific document types. Not recommended for Phase 1. |
| Batch download | Phase 2: Generate multiple PDFs (e.g., all payslips) as ZIP |

### 11.3 Re-generation

| Rule | Detail |
|------|--------|
| Re-generate allowed | Yes. User can preview the same document multiple times. |
| Re-generation uses latest data | If the source record was modified, the new PDF reflects current data |
| Re-generation uses latest branding | If institution logo/name changed since last generation, new PDF uses current branding |
| Old PDFs not overwritten | Previously downloaded PDFs remain as-is on the user's file system |

---

## 12. Error Handling & Fallback

### 12.1 Logo Issues

| Error | Fallback | User Feedback |
|-------|----------|---------------|
| No logo uploaded | Skip logo area. Show institution name prominently as top element. No blank box. | Amber banner on customization page: "Upload your institution logo for branded documents" |
| Logo file corrupted | Skip logo. Use text-only header. Log warning. | Toast: "Institution logo could not be loaded. Documents will be generated without logo." |
| Logo aspect ratio extreme | Constrain to max-width and max-height; letterbox within bounds | Advisory on upload: "Logo will be scaled to fit the header area" |

### 12.2 Missing Fields

| Missing Field | Behavior |
|---------------|----------|
| P.O. Box | Omit line. No "P.O. Box: —" placeholder. |
| Email | Omit line. |
| Secondary phone | Show only primary phone. |
| Phone (all) | Omit phone line. Header is shorter. |
| Address | **Block print** — show error: "Institution address is required for printed documents." |
| Institution name | **Block print** — this is required and should never be empty |

### 12.3 PDF Rendering Failures

| Error | Handling |
|-------|---------|
| PDF engine error | Show error dialog: "PDF generation failed. Please try again. If the problem persists, contact support." Log the error with stack trace. |
| Out of memory (very large report) | Paginate data. If still fails, suggest exporting to CSV instead. |
| Wide table overflows portrait | Auto-switch to landscape for that document OR shrink font by −0.5pt (max 2 reductions). Show advisory. |
| Printer unavailable | OS handles this. ERP shows no error; user sees OS printer error. |

### 12.4 Watermark Failures

| Error | Handling |
|-------|---------|
| Watermark image decode fails | Skip watermark. Generate PDF without it. Log warning. |
| Watermark opacity set to 0% | Treat as disabled. No watermark. |
| Watermark disabled in settings | No watermark. No error. |

---

## 13. Role & Permission Rules

### 13.1 Branding Management Permissions

| Action | SUPER_ADMIN | DIRECTOR | HT | BURSAR | ACCT | CASHIER | PAYROLL | AUDITOR |
|--------|:-----------:|:--------:|:--:|:------:|:----:|:-------:|:-------:|:-------:|
| Edit institution identity fields | ✓ | ✓ | — | — | — | — | — | — |
| Upload/change logo | ✓ | ✓ | — | — | — | — | — | — |
| Change header/footer settings | ✓ | ✓ | — | — | — | — | — | — |
| Enable/disable watermark | ✓ | ✓ | — | — | — | — | — | — |
| Adjust watermark opacity | ✓ | ✓ | — | — | — | — | — | — |
| View institution settings | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ |

### 13.2 Document Print Permissions

| Document Type | SUPER_ADMIN | DIRECTOR | HT | BURSAR | ACCT | CASHIER | PAYROLL | STOREKEEPER | AUDITOR |
|---------------|:-----------:|:--------:|:--:|:------:|:----:|:-------:|:-------:|:-----------:|:-------:|
| Receipt | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | Read |
| Invoice | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | Read |
| Credit/Debit note | ✓ | ✓ | — | ✓ | ✓ | — | — | — | Read |
| Student statement | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | Read |
| Sponsor statement | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | Read |
| Fee schedule | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | Read |
| Purchase order | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | Read |
| GRN | ✓ | ✓ | — | ✓ | — | — | — | ✓ | Read |
| Payment voucher | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | Read |
| Journal voucher | ✓ | ✓ | — | ✓ | ✓ | — | — | — | Read |
| Payslip | ✓ | ✓ | — | — | — | — | ✓ | — | Read |
| Payroll summary | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | — | Read |
| Financial statements | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ |
| Budget reports | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ |
| Bank recon report | ✓ | ✓ | — | ✓ | ✓ | — | — | — | ✓ |
| Audit trail report | ✓ | ✓ | — | — | — | — | — | — | ✓ |
| AR/AP aging | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ |

"Read" = can view/print but only in audit context.

---

## 14. Reprint Controls

### 14.1 Receipt Reprint Rules

Receipts are sensitive financial documents. Reprinting must be controlled.

| Rule | Detail |
|------|--------|
| First print | Free. No restrictions. Logged in audit trail. |
| Reprint | Requires reason selection from dropdown |
| Reprint reasons | `Parent requested copy` / `Original damaged` / `Filing requirement` / `Auditor request` / `Other (specify)` |
| Reprint audit | Every reprint logs: user, timestamp, reason, receipt number |
| Reprint count | Visible on the receipt record. Format: "Printed 3 times" |
| Reprint indicator | Reprinted receipts show "COPY" watermark overlaid on top of the institution watermark (bold, 20% opacity, diagonal) |
| Reprint permission | Same as original print permission (Cashier, Bursar, Accountant) |

### 14.2 Invoice Reprint Rules

| Rule | Detail |
|------|--------|
| Reprint | Allowed without reason for invoices. Not a controlled document at same level as receipt. |
| Reprint audit | Still logged (user, timestamp) |
| Reprint indicator | No "COPY" watermark needed |

### 14.3 Financial Statement Reprint

| Rule | Detail |
|------|--------|
| Reprint | Always allowed. These are reports, not transactional documents. |
| Audit | Generate action logged |
| Versioning | Each generation reflects data at time of generation. No version tracking of report outputs. |

### 14.4 Payslip Reprint

| Rule | Detail |
|------|--------|
| Reprint | Allowed. Logged. |
| Permission | PAYROLL officer or SUPER_ADMIN/DIRECTOR |
| "COPY" indicator | Not required for payslips |

---

## 15. Phase 1 vs Phase 2

### 15.1 Phase 1 (MVP)

| Feature | Included |
|---------|:--------:|
| Institution profile form with all identity fields | ✓ |
| Logo upload (PNG/JPEG) with validation | ✓ |
| Logo preview | ✓ |
| Standard header: `center-above` layout | ✓ |
| Institution logo watermark on all documents | ✓ |
| Watermark enable/disable toggle | ✓ |
| Watermark opacity slider (3-15%) | ✓ |
| A4 PDF rendering (local, offline) | ✓ |
| Portrait orientation for standard documents | ✓ |
| Landscape orientation for wide reports | ✓ |
| Preview → Print / Download workflow | ✓ |
| Page numbering ("Page X of Y") | ✓ |
| Continuation header on pages 2+ | ✓ |
| Table header repeat on multi-page tables | ✓ |
| Signature block (prepared/approved) | ✓ |
| Footer: timestamp, disclaimer | ✓ |
| Receipt reprint with "COPY" + reason tracking | ✓ |
| Receipt amount in words | ✓ |
| Full audit logging of print/download actions | ✓ |
| Number formatting: UGX, DD/MM/YYYY | ✓ |
| Templates for: receipt, invoice, credit/debit note, statement, voucher, payslip, PO, GRN, journal | ✓ |
| Templates for: trial balance, income statement, balance sheet, budget vs actual, bank recon, payroll summary | ✓ |
| Role-based print permissions | ✓ |
| Offline-capable PDF generation | ✓ |

### 15.2 Phase 2 (Enhancements)

| Feature | Phase |
|---------|:-----:|
| Alternative header layout: `left-with-text-right` (configurable) | 2 |
| SVG logo support | 2 |
| Separate watermark image (different from header logo) | 2 |
| Per-document-type branding overrides | 2 |
| Custom paper sizes | 2 |
| Branded seal/stamp image overlay | 2 |
| Multi-language print templates | 2 |
| Batch PDF generation (all payslips, all invoices per class) | 2 |
| Batch download as ZIP | 2 |
| Email PDF directly from preview | 2 |
| Digital signature integration | 2 |
| QR code on receipts (verification link) | 2 |
| Barcode on inventory issue notes | 2 |
| Cash flow statement template | 2 |
| Advanced AR/AP aging with graphs | 2 |
| Custom report builder with print | 2 |
| Thermal printer support for POS receipts | 2 |
| SMS receipt notification with reference code | 2 |

---

## 16. Risks & Controls

### 16.1 Risk Register

| # | Risk | Impact | Likelihood | Prevention | Detection | Audit |
|---|------|--------|:----------:|------------|-----------|-------|
| 1 | Inconsistent branding across documents | Medium | Low | Common template engine; no per-document manual branding | Visual QA during setup | Brand settings change log |
| 2 | Wrong institution logo on document (multi-campus future) | High | Low | Logo tied to institution_id; no cross-institution data access | Institution context visible in header | institution_id recorded in every print log |
| 3 | Missing logo after sync failure | Low | Medium | Local cache of logo; print continues without logo using text fallback | Amber warning to user | Sync failure log |
| 4 | Unreadable watermark obscures table data | Medium | Low | Auto-reduce opacity for dense tables; configurable slider; default is subtle 6% | User preview before print | — |
| 5 | Raw HTML browser printing (bypassing PDF) | Medium | Medium | No `window.print()` on page content; all print actions route through PDF engine | Code review; no `@media print` styled pages | — |
| 6 | Uncontrolled receipt reprinting | High | Medium | Reprint requires reason; "COPY" watermark auto-added; audit logged | Reprint count visible on record | Full reprint audit trail |
| 7 | Unauthorized financial statement printing | Medium | Low | Role-based print permissions (§13) | Audit log of all print/download actions | Print action audit with user+role+document |
| 8 | Branding changed without authorization | Medium | Low | Only SUPER_ADMIN/DIRECTOR can edit | Version history of brand settings | Full audit trail with old/new values |
| 9 | Poor print layout due to extreme logo aspect ratio | Low | Medium | Validation rejects aspect ratios >3:1; logo constrained within max dimensions | Preview before print | — |
| 10 | PDF generation failure | High | Low | Embedded rendering engine with no external dependencies; error dialog with retry | Error logging | Error log with stack trace |
| 11 | Exported PDF contains wrong campus data | Medium | Low | Institution and campus context filters enforced (see INSTITUTION_CONTEXT spec) | Campus name shown in document header/metadata | Campus ID recorded in print audit |
| 12 | Offline device has outdated branding | Low | Medium | Sync updates branding assets; last-sync-date visible | Stale-data indicator in UI | Sync log shows last branding sync |

### 16.2 Control Summary

| Control Type | Controls in Place |
|-------------|-------------------|
| **Preventive** | Common template engine, role-based permissions, logo validation rules, aspect ratio limits, mandatory institution context, PDF-first rendering (no raw HTML print) |
| **Detective** | Preview before print, reprint counter, audit logs, sync status indicators |
| **Corrective** | Logo re-upload, branding settings edit, reprint with "COPY" designation, audit review and investigation |

---

*End of PRINT DOCUMENT BRANDING, PDF RENDERING & INSTITUTION CUSTOMIZATION specification.*
