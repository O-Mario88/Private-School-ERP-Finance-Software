# MAPLE ERP — Multilingual Localization System: French Language Rollout

**Version:** 1.0.0  
**Status:** Implementation-Grade Specification  
**Date:** April 8, 2026  
**Scope:** English (source) + French (first translated language)  
**Classification:** Core Product Architecture — Internationalization

---

## Table of Contents

1. [Language Rollout Overview](#1-language-rollout-overview)
2. [Source Language and Translation Strategy](#2-source-language-and-translation-strategy)
3. [French Language Pack Structure](#3-french-language-pack-structure)
4. [Translation Priority by Module](#4-translation-priority-by-module)
5. [French Glossary / Terminology Rules](#5-french-glossary--terminology-rules)
6. [UI Translation Rules](#6-ui-translation-rules)
7. [Form Translation Rules](#7-form-translation-rules)
8. [Report and Print Translation Rules](#8-report-and-print-translation-rules)
9. [Country-Based French Default Suggestions](#9-country-based-french-default-suggestions)
10. [Institution Language Setting Behavior](#10-institution-language-setting-behavior)
11. [Offline Language Pack Behavior](#11-offline-language-pack-behavior)
12. [Phase 1 vs Phase 2 Language Rollout](#12-phase-1-vs-phase-2-language-rollout)

---

## 1. Language Rollout Overview

### 1.1 Purpose

Maple ERP is built in English first. French must now become the first fully supported translated language pack, making Maple ERP ready for deployment across Francophone and bilingual African countries.

This is **not** a casual machine-translation overlay. French is Maple ERP's first official international language after English and must meet the same standard of professionalism and accuracy as the English interface, especially for school finance, accounting, and administrative terminology.

### 1.2 Design Principles

| Principle | Description |
|-----------|-------------|
| **Offline-first** | Language packs are local static resources bundled with the app. No internet is required to render any screen in French. |
| **Key-based** | All user-facing text uses translation keys (`t('sidebar.dashboard')`), never hard-coded strings. |
| **Module-scoped** | Translation keys are organized by module/feature for maintainability. |
| **Context-aware** | The same English term may have different French translations in different contexts (e.g., "balance" in accounting vs. general). |
| **Document-ready** | Invoices, receipts, reports, and printable PDFs all respect the institution's language setting. |
| **Pluggable** | Future languages (Swahili, Portuguese, Arabic) plug into the same architecture. |

### 1.3 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MAPLE ERP APPLICATION                     │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              i18n Translation Engine                  │   │
│   │                                                      │   │
│   │   t('key')  ──►  Resolve language  ──►  Return text  │   │
│   │                                                      │   │
│   │   Priority chain:                                    │   │
│   │   1. Institution override (if exists)                │   │
│   │   2. Active language pack (en/fr)                    │   │
│   │   3. Fallback to English                             │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌───────────────┐    │
│   │   en.ts      │  │   fr.ts      │  │  (future)     │    │
│   │  English     │  │  French      │  │  sw.ts, pt.ts │    │
│   │  Source Pack │  │  First Pack  │  │  etc.         │    │
│   └──────────────┘  └──────────────┘  └───────────────┘    │
│                                                              │
│   Stored locally • No internet required • Instant switching  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Source Language and Translation Strategy

### 2.1 Language Roles

| Role | Language | Description |
|------|----------|-------------|
| **Source language** | English (`en`) | Master language. All translation keys have English values first. Development happens in English. |
| **First translated language** | French (`fr`) | Complete translation covering UI, forms, reports, printable documents, system messages. |
| **Fallback language** | English (`en`) | If a French key is missing, the system falls back to the English value. Never shows a raw key to users. |

### 2.2 Translation Key Rules

| Rule | Description |
|------|-------------|
| **K1** | Every user-facing string must use a translation key: `t('module.section.key')` |
| **K2** | Keys use dot-notation namespacing: `sidebar.dashboard`, `billing.invoice.total`, `form.validation.required` |
| **K3** | Keys are lowercase, snake_case within segments: `payroll.employee.gross_salary` |
| **K4** | Interpolation uses named placeholders: `t('billing.outstanding', { amount: '50,000', currency: 'UGX' })` → `"Outstanding: UGX 50,000"` / `"Solde impayé : UGX 50 000"` |
| **K5** | Pluralization uses count-aware keys: `t('students.count', { count: 5 })` → English: "5 students" / French: "5 élèves" |
| **K6** | No business text may remain hard-coded in English in any component, page, form, or printable template. |
| **K7** | Translation keys must never contain the translated text itself. |
| **K8** | Dynamic data (student names, amounts, dates) are never translated — only labels and UI chrome. |

### 2.3 Translation File Rules

| Rule | Description |
|------|-------------|
| **F1** | Each language has one master file: `src/i18n/locales/en.ts`, `src/i18n/locales/fr.ts` |
| **F2** | Files export a flat or nested object with identical key structures. |
| **F3** | English file is the canonical reference. French file must mirror every key. |
| **F4** | Missing French keys fall back to English automatically. |
| **F5** | Language files are statically imported (no network fetch). |

### 2.4 No Runtime Translation APIs

Maple ERP is offline-first. The system must NOT:
- Call Google Translate, DeepL, or any online API at runtime
- Require internet to display French text
- Lazy-load language packs from a server
- Use browser-based auto-translation as a substitute

All translations must be pre-built, reviewed, and shipped as part of the application bundle.

---

## 3. French Language Pack Structure

### 3.1 Module Organization

The French language pack mirrors the English pack with translations organized by module:

```
src/i18n/
├── index.ts              # i18n engine, t() function, language switching
├── locales/
│   ├── en.ts             # English (source) — complete
│   └── fr.ts             # French (first translation) — complete
└── types.ts              # TranslationKey type safety
```

### 3.2 Translation Namespace Structure

```typescript
{
  // App shell
  app: { name, tagline, version, copyright },

  // Navigation
  sidebar: { dashboard, students, billing, ... },
  topbar: { search, notifications, profile, logout, ... },

  // Common UI
  common: {
    buttons: { save, cancel, delete, edit, submit, approve, reject, ... },
    status: { active, inactive, draft, approved, pending, ... },
    labels: { date, amount, total, description, notes, ... },
    pagination: { next, previous, page, of, showing, ... },
    validation: { required, invalid_email, min_length, ... },
    confirm: { delete_title, delete_message, ... },
    empty: { no_data, no_results, ... },
  },

  // Auth
  auth: { login, logout, email, password, forgot_password, ... },

  // Dashboard
  dashboard: { title, revenue, collections, outstanding, ... },

  // Students
  students: { title, add_student, name, class, stream, ... },

  // Billing
  billing: { title, create_invoice, fee_schedule, ... },

  // Invoices
  invoices: { title, invoice_number, date_issued, due_date, ... },

  // Payments
  payments: { title, record_payment, payment_method, ... },

  // Receipts
  receipts: { title, receipt_number, received_from, ... },

  // Collections
  collections: { title, aging_buckets, follow_up, ... },

  // Accounting
  accounting: { title, journal_entry, trial_balance, gl, ... },

  // Budget
  budget: { title, create_budget, fiscal_year, category, ... },

  // Payroll
  payroll: { title, run_payroll, employee, gross, net, ... },

  // Inventory
  inventory: { title, stock_item, quantity, reorder, ... },

  // Transport
  transport: { title, routes, assignments, capacity, ... },

  // Reports
  reports: { title, generate, export_pdf, export_csv, ... },

  // Settings
  settings: { title, institution, language, currency, ... },

  // Sync
  sync: { syncing, last_sync, pending, offline, online, ... },

  // Printable documents
  print: {
    invoice: { header, footer, subtotal, total, ... },
    receipt: { header, received_with_thanks, ... },
    report_card: { ... },
    statement: { ... },
  },
}
```

---

## 4. Translation Priority by Module

### Priority 1 — Core Shell (Must-have for MVP)

| Module | Key Count (est.) | Rationale |
|--------|-----------------|-----------|
| `auth` (login/setup) | ~25 | First screen users see |
| `sidebar` | ~25 | Always visible navigation |
| `topbar` | ~15 | Always visible header |
| `common.buttons` | ~30 | Used across all modules |
| `common.status` | ~20 | Used across all modules |
| `common.labels` | ~40 | Used across all modules |
| `common.validation` | ~20 | Used in all forms |
| `dashboard` | ~40 | Primary landing page |
| `settings` | ~50 | Language/currency selection |
| **Subtotal** | **~265** | |

### Priority 2 — School Finance Core

| Module | Key Count (est.) | Rationale |
|--------|-----------------|-----------|
| `students` | ~60 | Core master data |
| `billing` | ~50 | Fee management |
| `invoices` | ~45 | Document generation |
| `payments` | ~40 | Transaction recording |
| `receipts` | ~35 | Document generation |
| `collections` | ~40 | Revenue tracking |
| `print.invoice` | ~30 | Printable documents |
| `print.receipt` | ~25 | Printable documents |
| **Subtotal** | **~325** | |

### Priority 3 — Operations

| Module | Key Count (est.) | Rationale |
|--------|-----------------|-----------|
| `inventory` | ~40 | Stock management |
| `accounting` | ~60 | GL, journals, trial balance |
| `budget` | ~55 | Budget planning |
| `transport` | ~35 | Route/billing |
| **Subtotal** | **~190** | |

### Priority 4 — Enterprise

| Module | Key Count (est.) | Rationale |
|--------|-----------------|-----------|
| `payroll` | ~50 | Staff salaries |
| `reports` | ~40 | Analytics |
| `sync` | ~15 | Sync status |
| `audit` | ~25 | Compliance |
| `print.report_card` | ~20 | Print templates |
| `print.statement` | ~20 | Print templates |
| **Subtotal** | **~170** | |

**Total estimated keys: ~950**

---

## 5. French Glossary / Terminology Rules

### 5.1 Core Finance and School Glossary

This glossary is the single source of truth for all French translations of financial and school terminology in Maple ERP. Every translator, developer, and reviewer must use these terms consistently.

| English | French | Context Notes |
|---------|--------|---------------|
| Student | Élève | General use |
| Learner | Apprenant(e) | South African / progressive context |
| Pupil | Élève | Primary school context |
| Guardian | Tuteur / Tutrice | Legal guardian |
| Parent | Parent | Family context |
| Payer | Payeur | Billing context |
| Teacher | Enseignant(e) | General |
| Head Teacher | Directeur / Directrice | School head |
| Principal | Directeur / Directrice | Alternative title |
| Bursar | Économe / Intendant(e) | Finance officer |
| Accountant | Comptable | Finance |
| School | École | General |
| Institution | Établissement | Formal context |
| Class | Classe | Education level |
| Grade | Niveau | Education level |
| Form | Forme | Secondary level (some systems) |
| Stream | Section | Class subdivision |
| Term | Trimestre | Academic period (3-term system) |
| Semester | Semestre | Academic period (2-term system) |
| Academic Year | Année scolaire | Calendar |
| School Fees | Frais de scolarité | Billing |
| Tuition | Frais de scolarité | Core fee |
| Invoice | Facture | Billing document |
| Receipt | Reçu | Payment confirmation |
| Fee Note | Avis de frais | Billing notification |
| Fee Statement | Relevé de frais | Account summary |
| Outstanding Balance | Solde impayé | Amount owed |
| Amount Paid | Montant payé | Payment |
| Balance Remaining | Solde restant | Remaining debt |
| Discount | Remise | Price reduction |
| Waiver | Exonération | Fee exemption |
| Scholarship | Bourse | Merit/need-based aid |
| Bursary | Bourse d'études | Financial aid |
| Sponsor | Parrain / Marraine | Third-party payer |
| Payment | Paiement | Transaction |
| Payment Method | Mode de paiement | How payment was made |
| Cash | Espèces | Payment method |
| Bank Transfer | Virement bancaire | Payment method |
| Mobile Money | Mobile Money | Keep as-is (industry term) |
| Cheque | Chèque | Payment method |
| Credit Note | Avoir | Accounting adjustment |
| Debit Note | Note de débit | Accounting adjustment |
| Journal Entry | Écriture comptable | Accounting |
| General Ledger | Grand livre | Accounting |
| Trial Balance | Balance de vérification | Accounting report |
| Chart of Accounts | Plan comptable | Accounting structure |
| Account | Compte | Ledger account |
| Debit | Débit | Accounting |
| Credit | Crédit | Accounting |
| Revenue | Recettes | Income |
| Expense | Dépense | Cost |
| Asset | Actif | Balance sheet |
| Liability | Passif | Balance sheet |
| Equity | Capitaux propres | Balance sheet |
| Budget | Budget | Finance planning |
| Budget Used | Budget utilisé | Spending |
| Budget Remaining | Budget restant | Available |
| Variance | Écart | Budget analysis |
| Fiscal Year | Exercice fiscal | Accounting period |
| Bank Reconciliation | Rapprochement bancaire | Accounting |
| Payroll | Paie | Staff compensation |
| Salary | Salaire | Monthly pay |
| Gross Salary | Salaire brut | Before deductions |
| Net Salary | Salaire net | After deductions |
| Deduction | Retenue | Payroll |
| Allowance | Indemnité | Payroll benefit |
| Supplier | Fournisseur | AP |
| Purchase Order | Bon de commande | Procurement |
| Bill | Facture fournisseur | AP |
| Inventory | Inventaire / Stock | Stock management |
| Kitchen Stores | Magasin de cuisine | School-specific |
| Stock Item | Article en stock | Inventory |
| Quantity | Quantité | General |
| Unit | Unité | Measurement |
| Unit Cost | Coût unitaire | Pricing |
| Overdue | En retard | Collections |
| Aging Buckets | Tranches d'ancienneté | Collections |
| Follow-up | Relance | Collections activity |
| Reminder | Rappel | Notification |
| Report Card | Bulletin scolaire | Academic |
| Progress Report | Bulletin de progression | Academic |
| Dashboard | Tableau de bord | UI |
| Settings | Paramètres | UI |
| Search | Rechercher | UI |
| Filter | Filtrer | UI |
| Export | Exporter | UI |
| Import | Importer | UI |
| Print | Imprimer | UI |
| Download | Télécharger | UI |
| Upload | Téléverser | UI |
| Save | Enregistrer | UI |
| Cancel | Annuler | UI |
| Delete | Supprimer | UI |
| Edit | Modifier | UI |
| Create | Créer | UI |
| Submit | Soumettre | Workflow |
| Approve | Approuver | Workflow |
| Reject | Rejeter | Workflow |
| Pending | En attente | Status |
| Draft | Brouillon | Status |
| Active | Actif / Active | Status |
| Inactive | Inactif / Inactive | Status |
| Approved | Approuvé(e) | Status |
| Cancelled | Annulé(e) | Status |
| Completed | Terminé(e) | Status |
| Overdue | En retard | Status |
| Paid | Payé(e) | Status |
| Unpaid | Impayé(e) | Status |
| Partially Paid | Partiellement payé(e) | Status |
| Total | Total | General |
| Subtotal | Sous-total | General |
| Amount | Montant | General |
| Date | Date | General |
| Description | Description | General |
| Notes | Remarques | General |
| Reference | Référence | General |
| Attachment | Pièce jointe | General |
| Sync | Synchronisation | System |
| Offline | Hors ligne | System |
| Online | En ligne | System |
| Backup | Sauvegarde | System |

### 5.2 Terminology Rules

| Rule | Description |
|------|-------------|
| **T1** | Use formal French (vous form) for all UI text. Never use informal "tu". |
| **T2** | Use gender-inclusive phrasing where practical. For gendered nouns, use masculine as default in labels; full forms in context (e.g., "Directeur/Directrice" in role assignment). |
| **T3** | Keep "Mobile Money" untranslated — it is an industry-standard term across Francophone Africa. |
| **T4** | Accounting terms must follow OHADA (Organisation pour l'Harmonisation en Afrique du Droit des Affaires) conventions where applicable, as this is the accounting framework used in Francophone Africa. |
| **T5** | Currency formatting in French uses space as thousand separator and comma as decimal: `1 500 000,00` (not `1,500,000.00`). |
| **T6** | Date format in French: `JJ/MM/AAAA` (e.g., `08/04/2026`). |
| **T7** | "Frais de scolarité" (not "frais scolaires") is the standard term for school fees. |
| **T8** | Use "Facture" for invoice (not "note" or "relevé" unless specifically for statements). |

---

## 6. UI Translation Rules

### 6.1 Component Translation

Every React component must use the `t()` function for all displayed text:

```tsx
// ❌ WRONG — hard-coded English
<button>Save</button>
<h1>Dashboard</h1>
<th>Amount</th>

// ✅ CORRECT — translation key
<button>{t('common.buttons.save')}</button>
<h1>{t('dashboard.title')}</h1>
<th>{t('common.labels.amount')}</th>
```

### 6.2 Translation of Dynamic Content

| Content Type | Translate? | Method |
|--------------|-----------|--------|
| UI labels | Yes | `t('key')` |
| Button text | Yes | `t('key')` |
| Status badges | Yes | `t('common.status.active')` |
| Validation messages | Yes | `t('common.validation.required')` |
| Column headers | Yes | `t('key')` |
| Form field labels | Yes | `t('key')` |
| Placeholder text | Yes | `t('key')` |
| Tooltip text | Yes | `t('key')` |
| Confirmation dialogs | Yes | `t('key')` |
| Empty state messages | Yes | `t('key')` |
| Error messages | Yes | `t('key')` |
| Student names | **No** | Raw data |
| Account numbers | **No** | Raw data |
| Monetary amounts | **No** | Formatted by currency engine |
| Dates | **Locale-aware** | Formatted by date engine |
| System-generated IDs | **No** | Raw data |

### 6.3 Sidebar and Navigation

All sidebar items, breadcrumbs, and page titles must use translation keys. The sidebar must re-render on language switch without page reload.

### 6.4 Language Switch Behavior

| Action | Behavior |
|--------|----------|
| User switches language in Settings | All UI text updates immediately (React re-render) |
| Page reload | Language persists from stored preference |
| New user login | Institution default language is applied |
| Offline mode | Language switching works fully offline |

---

## 7. Form Translation Rules

### 7.1 Form Labels and Placeholders

```tsx
<label>{t('students.form.first_name')}</label>
<input placeholder={t('students.form.first_name_placeholder')} />
```

### 7.2 Validation Messages

```tsx
// English: "First name is required"
// French: "Le prénom est obligatoire"
t('students.validation.first_name_required')
```

### 7.3 Select / Dropdown Options

Static dropdown options must be translated:

```tsx
// Payment method options
const paymentMethods = [
  { value: 'cash', label: t('payments.method.cash') },
  { value: 'bank_transfer', label: t('payments.method.bank_transfer') },
  { value: 'mobile_money', label: t('payments.method.mobile_money') },
  { value: 'cheque', label: t('payments.method.cheque') },
];
```

### 7.4 Date Inputs

Date display format must follow the active language:
- English: `MM/DD/YYYY` or `DD/MM/YYYY` (per country)
- French: `JJ/MM/AAAA`

---

## 8. Report and Print Translation Rules

### 8.1 Printable Document Language

All printable documents (invoices, receipts, reports, statements) must use the **institution's default language**, not the current user's language preference.

| Document | Language Source | Rationale |
|----------|---------------|-----------|
| Invoice | Institution default | External-facing document sent to parents |
| Receipt | Institution default | External-facing document given to payers |
| Report Card | Institution default | External-facing academic document |
| Account Statement | Institution default | External-facing financial document |
| Internal Report | User's current language | Internal use only |
| Dashboard export | User's current language | Internal use only |

### 8.2 Invoice in French (Example)

```
──────────────────────────────────────────
FACTURE DE FRAIS DE SCOLARITÉ
École Maple Cameroun S.A.
──────────────────────────────────────────
Élève : Jean-Pierre Nkomo          Classe : Classe 4
Trimestre : 1er Trimestre, 2026    Réf : FACT-2026-00142

Description                             Montant (XAF)
─────────────────────────────────────────────────────
Frais de scolarité — Classe 4          500 000
Frais de cantine — 1er Trimestre       150 000
Frais d'activités                       50 000
─────────────────────────────────────────────────────
Total à payer                       700 000 FCFA
──────────────────────────────────────────
```

### 8.3 Receipt in French (Example)

```
──────────────────────────────────────────
REÇU DE PAIEMENT
École Maple Cameroun S.A.
──────────────────────────────────────────
Reçu de : M. Nkomo Pierre
Pour : Élève Jean-Pierre Nkomo — Classe 4

Reçu N° : REC-2026-00089
Date : 08/04/2026
Mode de paiement : Mobile Money

Montant reçu :                  500 000 FCFA

Solde restant :                 200 000 FCFA
──────────────────────────────────────────
Reçu avec remerciements
──────────────────────────────────────────
```

---

## 9. Country-Based French Default Suggestions

### 9.1 French as Default or Suggested Language

| Country | ISO | French Role | Onboarding Behavior |
|---------|-----|-------------|---------------------|
| Cameroon | CM | Co-official (Anglophone + Francophone) | **Require choice**: English or French during onboarding |
| Rwanda | RW | Official language alongside English/Kinyarwanda | **Suggest French** as an option; English default |
| Mauritius | MU | Widely used alongside English | **Suggest French** as an option; English default |
| Seychelles | SC | Official language alongside English/Creole | **Suggest French** as an option; English default |

### 9.2 Future Francophone Expansion Countries

When Maple ERP expands to primarily Francophone countries, French should be the **default** language:

| Country | ISO | Currency | French Role |
|---------|-----|----------|-------------|
| Burkina Faso | BF | XOF | Default |
| Côte d'Ivoire | CI | XOF | Default |
| Senegal | SN | XOF | Default |
| Mali | ML | XOF | Default |
| Democratic Republic of Congo | CD | CDF | Default |
| Republic of Congo | CG | XAF | Default |
| Gabon | GA | XAF | Default |
| Chad | TD | XAF | Co-official with Arabic |
| Madagascar | MG | MGA | Co-official with Malagasy |
| Guinea | GN | GNF | Default |
| Togo | TG | XOF | Default |
| Benin | BJ | XOF | Default |
| Niger | NE | XOF | Default |
| Central African Republic | CF | XAF | Default |
| Burundi | BI | BIF | Co-official |
| Comoros | KM | KMF | Co-official |
| Djibouti | DJ | DJF | Co-official with Arabic |

### 9.3 Onboarding Language Selection Flow

```
Step 1: Select Country → (e.g., Cameroon)
Step 2: System checks country's language profile
Step 3: If bilingual (CM, RW, MU, SC):
        → Display: "Choisissez la langue de l'établissement / Choose institution language"
        → Options: [English] [Français]
Step 4: If primarily Francophone (future: BF, CI, SN, etc.):
        → Default to French
        → Option to switch to English
Step 5: If primarily Anglophone (UG, KE, GH, etc.):
        → Default to English
        → Option to switch to French (if institution prefers)
Step 6: Selected language becomes institution default
```

---

## 10. Institution Language Setting Behavior

### 10.1 Language Hierarchy

```
1. Institution Default Language
   └── Set during onboarding
   └── All users inherit this unless overridden
   └── Used for printable documents
   └── Stored in institution settings

2. User Language Preference (optional override)
   └── Individual user can override for their UI only
   └── Does NOT affect printable documents
   └── Stored in user preferences

3. Document Language Override (rare)
   └── Specific document can be generated in a different language
   └── Requires explicit action (e.g., "Print in English")
   └── Used for bilingual schools serving mixed-language parents
```

### 10.2 Settings Interface

**Settings → Language & Localization**

| Setting | Description | Editable By |
|---------|-------------|------------|
| Institution Default Language | Primary language for all users and documents | SUPER_ADMIN, DIRECTOR |
| Allow User Language Override | Whether individual users can switch their UI language | SUPER_ADMIN |
| Document Language | Language used for invoices, receipts, reports | SUPER_ADMIN, DIRECTOR |
| Secondary Document Language | Optional second language for bilingual documents | SUPER_ADMIN |

### 10.3 Language Persistence

| Data Point | Storage Location | Offline Available |
|------------|-----------------|-------------------|
| Institution default language | SQLite `institutions` table | Yes |
| User language preference | SQLite `user_preferences` table | Yes |
| Active language pack (en/fr) | Bundled TypeScript files | Yes |
| Language selection history | Event log | Yes |

---

## 11. Offline Language Pack Behavior

### 11.1 Architecture

```
┌─────────────────────────────────────────────────┐
│              APPLICATION BUNDLE                  │
│                                                  │
│   src/i18n/locales/en.ts   ← Always available   │
│   src/i18n/locales/fr.ts   ← Always available   │
│                                                  │
│   Both packs compiled into the app bundle        │
│   Zero network dependency for language display   │
│   Instant language switching (React state only)  │
└─────────────────────────────────────────────────┘
```

### 11.2 Offline Guarantees

| Capability | Offline Support |
|------------|----------------|
| Display all screens in French | ✅ Fully offline |
| Switch language English ↔ French | ✅ Fully offline |
| Print invoice in French | ✅ Fully offline |
| Print receipt in French | ✅ Fully offline |
| Generate report in French | ✅ Fully offline |
| Form validation messages in French | ✅ Fully offline |
| System alerts in French | ✅ Fully offline |
| Login screen in French | ✅ Fully offline |

### 11.3 Bundle Size Impact

| Pack | Estimated Size | Gzipped |
|------|---------------|---------|
| English (`en.ts`) | ~35 KB | ~8 KB |
| French (`fr.ts`) | ~40 KB | ~9 KB |
| i18n engine | ~3 KB | ~1 KB |
| **Total i18n overhead** | **~78 KB** | **~18 KB** |

This is negligible compared to the existing 298 KB JS bundle.

---

## 12. Phase 1 vs Phase 2 Language Rollout

### 12.1 Phase 1 — French Foundation

**Scope:** Complete English + French for Priority 1 and Priority 2 modules.

| Deliverable | Status |
|-------------|--------|
| i18n engine (`src/i18n/index.ts`) | To implement |
| English language pack (`en.ts`) | To implement |
| French language pack (`fr.ts`) — Priority 1 keys | To implement |
| French language pack (`fr.ts`) — Priority 2 keys | To implement |
| Language switching in Settings | To implement |
| Institution language setting | To implement |
| User language preference | To implement |
| Invoice print in French | To implement |
| Receipt print in French | To implement |

### 12.2 Phase 2 — Full Coverage + Expansion

| Deliverable | Status |
|-------------|--------|
| French pack — Priority 3 + 4 keys | Phase 2 |
| Bilingual document generation (dual-language prints) | Phase 2 |
| Additional languages (Swahili `sw`, Portuguese `pt`) | Phase 2 |
| Right-to-left (RTL) support for Arabic | Phase 2 |
| Language pack management in Settings UI | Phase 2 |
| Translation completeness dashboard | Phase 2 |
| Country-specific French variants (if needed) | Phase 2 |

### 12.3 Implementation Timeline

```
Phase 1 (Weeks 1–4):
  Week 1:  i18n infrastructure + English source pack + t() integration pattern
  Week 2:  French Priority 1 translations (shell, nav, buttons, dashboard, settings)
  Week 3:  French Priority 2 translations (students, billing, invoices, payments)
  Week 4:  Print templates (invoice/receipt in French) + testing + QA

Phase 2 (Weeks 5–8):
  Week 5:  French Priority 3 (accounting, budget, inventory, transport)
  Week 6:  French Priority 4 (payroll, reports, audit, sync)
  Week 7:  Bilingual document support + additional print templates
  Week 8:  Integration testing + Francophone country onboarding flow
```

---

*End of Multilingual Localization System Specification*
