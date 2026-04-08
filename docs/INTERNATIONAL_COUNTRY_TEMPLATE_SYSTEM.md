# MAPLE ERP — International Country Template System

**Version:** 1.0.0  
**Status:** Implementation-Grade Specification  
**Date:** April 8, 2026  
**Scope:** 21 English-speaking African countries  
**Classification:** Core Product Architecture

---

## Table of Contents

1. [International Country Template Overview](#1-international-country-template-overview)
2. [Why Country Templates Are Required](#2-why-country-templates-are-required)
3. [Country Template Data Model](#3-country-template-data-model)
4. [Country-by-Country Matrix](#4-country-by-country-matrix)
5. [Education System Template Structure](#5-education-system-template-structure)
6. [Currency and Financial Localization Structure](#6-currency-and-financial-localization-structure)
7. [Institution Onboarding Behavior](#7-institution-onboarding-behavior)
8. [How Country Templates Affect Core ERP Modules](#8-how-country-templates-affect-core-erp-modules)
9. [Country Template Override Rules](#9-country-template-override-rules)
10. [Phase 1 vs Phase 2 Internationalization Plan](#10-phase-1-vs-phase-2-internationalization-plan)
11. [Risks and Control Measures](#11-risks-and-control-measures)

---

## 1. International Country Template Overview

### 1.1 Purpose

Maple ERP is built to serve private schools across English-speaking Africa. The continent's education systems are not interchangeable. Class naming, year progression, school calendar, fee terminology, currency handling, and reporting conventions are all shaped by national education policy and financial standards.

Maple ERP must never hard-code one country's education structure, currency, class labels, term naming, or reporting logic. Instead, it must implement a **country-template-driven architecture** where each institution operates within the correct local education and financial context.

### 1.2 Design Principle

```
┌─────────────────────────────────────────────────────┐
│              INSTITUTION ONBOARDING                  │
│                                                      │
│   1. Select Country  ────►  Load Template            │
│   2. Confirm Education Structure                     │
│   3. Confirm Currency & Financial Rules              │
│   4. Apply Optional Institution-Level Overrides      │
│   5. System Configured ────►  Ready for Use          │
└─────────────────────────────────────────────────────┘
```

Every class dropdown, fee schedule, invoice, report card, student progression rule, and printed document derives from the selected country template. No module should reference a raw class label like "P1" or "Grade 5" without resolving it through the template system.

### 1.3 Scope

This specification covers:

- **21 countries** across East Africa, West Africa, Southern Africa, and Central Africa
- **Education structure templates** from pre-primary through upper secondary
- **Currency and financial localization** for accounting, invoicing, and reporting
- **ERP module integration** points where country templates drive behavior
- **Override rules** that govern what institutions can and cannot customize
- **Rollout phasing** to manage implementation risk

### 1.4 Countries Covered

| # | Country | Region | ISO Code | Currency |
|---|---------|--------|----------|----------|
| 1 | Botswana | Southern Africa | BW | BWP |
| 2 | Cameroon | Central Africa | CM | XAF |
| 3 | Eswatini | Southern Africa | SZ | SZL |
| 4 | The Gambia | West Africa | GM | GMD |
| 5 | Ghana | West Africa | GH | GHS |
| 6 | Kenya | East Africa | KE | KES |
| 7 | Lesotho | Southern Africa | LS | LSL |
| 8 | Liberia | West Africa | LR | LRD |
| 9 | Malawi | Southern Africa | MW | MWK |
| 10 | Mauritius | East Africa | MU | MUR |
| 11 | Namibia | Southern Africa | NA | NAD |
| 12 | Nigeria | West Africa | NG | NGN |
| 13 | Rwanda | East Africa | RW | RWF |
| 14 | Seychelles | East Africa | SC | SCR |
| 15 | Sierra Leone | West Africa | SL | SLE |
| 16 | South Africa | Southern Africa | ZA | ZAR |
| 17 | South Sudan | East Africa | SS | SSP |
| 18 | Tanzania | East Africa | TZ | TZS |
| 19 | Uganda | East Africa | UG | UGX |
| 20 | Zambia | Southern Africa | ZM | ZMW |
| 21 | Zimbabwe | Southern Africa | ZW | ZWG |

---

## 2. Why Country Templates Are Required

### 2.1 The Problem

African education systems diverge along nearly every axis that a school ERP must model:

| Dimension | Example Variation |
|-----------|-------------------|
| **Class naming** | Uganda: P1–P7 / Kenya: Grade 1–6 / Tanzania: Standard I–VII / Ghana: Primary 1–6 |
| **Grade naming** | South Africa: Grade R–12 / Zambia: Grade 1–12 / Namibia: Grade 0–12 |
| **Standard/Form naming** | Tanzania: Standard I–VII / Botswana: Standard 1–7 / Malawi: Standard 1–8 |
| **Pre-primary structure** | Kenya: PP1, PP2 / Ghana: KG1, KG2 / Uganda: Nursery, Middle, Top / Nigeria: Nursery 1–3 |
| **Secondary structure** | Uganda: S1–S4 + S5–S6 / Tanzania: Form I–IV + Form V–VI / Ghana: JHS 1–3 + SHS 1–3 |
| **Term naming** | Most: Term 1–3 / Mauritius: Term 1–3 / Some private: Semester 1–2 |
| **Academic year start** | East Africa: January–February / Southern Africa: January / West Africa: September (some) |
| **Exam-stage labels** | Uganda: PLE, UCE, UACE / Kenya: KCPE, KCSE / Tanzania: PSLE, CSEE, ACSEE |
| **Currency display** | UGX 50,000 / KSh 5,000 / R 500 / GH₵ 200 / ₦ 10,000 |
| **Invoice terminology** | "School fees invoice" / "Fee note" / "Account statement" / "Billing statement" |
| **Report naming** | "Report card" / "Progress report" / "End of term report" / "Academic transcript" |

### 2.2 The Consequence of Ignoring This

An ERP that hard-codes `P1–P7, S1–S6` (Uganda) becomes unusable in Kenya (where there is no "P1") or Ghana (where secondary school is "JHS" and "SHS", not "S1–S6"). A system that displays `USh` on invoices is wrong for a South African school that uses `R`.

Hard-coding any single country's structure makes the product:
- **Incorrect** for every other country
- **Confusing** for administrators who see foreign class labels
- **Unprofessional** when invoices show the wrong currency symbol
- **Unscalable** to new markets

### 2.3 The Solution

Maple ERP must treat the country template as a **first-class configuration object** that:

1. Is selected once at institution onboarding
2. Drives all class dropdowns, fee labels, progression logic, currency display, and report formatting
3. Cannot be partially applied — activating a country template applies the full stack of education structure + currency + terminology
4. Can be extended with institution-level overrides for labels and display, but not for core progression structure or accounting currency

### 2.4 Evidence by Country Comparison

**Pre-Primary Stage:**

| Country | Pre-Primary Labels | Years |
|---------|--------------------|-------|
| Uganda | Baby Class, Middle Class, Top Class | 3 |
| Kenya | PP1, PP2 | 2 |
| Ghana | KG1, KG2 | 2 |
| Tanzania | Pre-Primary / Standard 0 | 1 |
| South Africa | Grade R (Reception) | 1 |
| Nigeria | Nursery 1, Nursery 2, Nursery 3 | 3 |
| Rwanda | Nursery | 1–3 |
| Liberia | K1, K2 | 2 |
| Eswatini | Grade 0 | 1 |

A single class picker that starts with "P1" is wrong for 20 out of 21 countries at the pre-primary level alone.

**Primary Stage:**

| Country | Primary Labels | Count |
|---------|----------------|-------|
| Uganda | P1, P2, P3, P4, P5, P6, P7 | 7 |
| Kenya | Grade 1, Grade 2 … Grade 6 | 6 |
| Tanzania | Standard I, II, III, IV, V, VI, VII | 7 |
| South Africa | Grade 1, 2, 3, 4, 5, 6, 7 | 7 |
| Ghana | Primary 1, 2, 3, 4, 5, 6 | 6 |
| Botswana | Standard 1, 2, 3, 4, 5, 6, 7 | 7 |
| Malawi | Standard 1, 2, 3, 4, 5, 6, 7, 8 | 8 |
| Zambia | Grade 1, 2, 3, 4, 5, 6, 7 | 7 |
| Rwanda | P1, P2, P3, P4, P5, P6 | 6 |
| Nigeria | Primary 1, 2, 3, 4, 5, 6 | 6 |

Primary school alone ranges from 6 to 8 years across countries, with at least four different naming conventions.

**Secondary Stage:**

| Country | Lower Secondary | Upper Secondary |
|---------|-----------------|-----------------|
| Uganda | S1, S2, S3, S4 (O-Level) | S5, S6 (A-Level) |
| Kenya | Grade 7, 8, 9 (Junior) | Grade 10, 11, 12 (Senior) |
| Tanzania | Form I, II, III, IV (O-Level) | Form V, VI (A-Level) |
| South Africa | Grade 8, 9 (Senior Phase) | Grade 10, 11, 12 (FET) |
| Ghana | JHS 1, 2, 3 | SHS 1, 2, 3 |
| Nigeria | JSS 1, 2, 3 | SSS 1, 2, 3 |
| Botswana | Form 1, 2, 3 | Form 4, 5 |
| Zimbabwe | Form 1, 2, 3, 4 (O-Level) | Form 5, 6 (A-Level) |
| Malawi | Form 1, 2 | Form 3, 4 |
| Rwanda | S1, S2, S3 (O-Level) | S4, S5, S6 (A-Level) |

No two countries use the same combination of naming, structure length, and exam-stage boundaries.

---

## 3. Country Template Data Model

### 3.1 Complete Data Model

```
CountryTemplate
├── A. Country Identity
│   ├── country_name: string
│   ├── iso_country_code: string (ISO 3166-1 alpha-2)
│   ├── iso_country_code_3: string (ISO 3166-1 alpha-3)
│   ├── region: string
│   ├── subregion: string
│   ├── primary_erp_language: string
│   └── additional_supported_languages: string[]
│
├── B. Currency
│   ├── currency_code: string (ISO 4217)
│   ├── currency_symbol: string
│   ├── currency_name: string
│   ├── currency_subunit_name: string
│   ├── symbol_position: "before" | "after"
│   ├── decimal_places: number
│   ├── thousand_separator: string
│   ├── decimal_separator: string
│   └── default_display_format: string
│
├── C. Education System
│   ├── education_system_type: string
│   ├── system_structure_code: string (e.g. "7-4-2", "2-6-3-3")
│   ├── pre_primary_enabled: boolean
│   ├── levels: EducationLevel[]
│   │   ├── level_id: string
│   │   ├── stage: "pre_primary" | "primary" | "lower_secondary" | "upper_secondary"
│   │   ├── stage_group_name: string
│   │   ├── short_code: string
│   │   ├── long_name: string
│   │   ├── sequence: number
│   │   ├── next_level_id: string | null
│   │   ├── is_completion_exam_stage: boolean
│   │   ├── completion_exam_name: string | null
│   │   ├── fee_billable: boolean
│   │   └── promotion_eligible: boolean
│   └── stage_groups: StageGroup[]
│       ├── stage_group_id: string
│       ├── stage_group_name: string
│       ├── stage: string
│       ├── level_ids: string[]
│       └── display_order: number
│
├── D. School Calendar / Academic Cycle
│   ├── academic_year_label_style: string
│   ├── academic_year_start_month: number
│   ├── term_count: number
│   ├── default_term_names: string[]
│   ├── semester_support: boolean
│   ├── progression_logic: "annual" | "term_based"
│   ├── default_promotion_boundary: string
│   └── holiday_calendar_source: string | null
│
└── E. ERP Terminology
    ├── student_label: string
    ├── learner_label: string
    ├── guardian_label: string
    ├── parent_label: string
    ├── payer_label: string
    ├── fee_label: string
    ├── report_card_label: string
    ├── invoice_label: string
    ├── receipt_label: string
    ├── class_label: string
    ├── stream_label: string
    ├── section_label: string
    ├── grade_label: string
    ├── form_label: string
    ├── standard_label: string
    └── head_teacher_label: string
```

### 3.2 EducationLevel Entity

Each level represents a single class/year/standard/grade/form in the national education system.

```
EducationLevel {
  level_id:               "UG-P1"           // unique within template
  stage:                  "primary"          // pre_primary | primary | lower_secondary | upper_secondary
  stage_group_name:       "Primary"          // display name for the stage group
  short_code:             "P1"               // short display label
  long_name:              "Primary One"      // full display name
  sequence:               1                  // ordinal position (1-based, global across all stages)
  next_level_id:          "UG-P2"            // progression target, null for terminal level
  is_completion_exam_stage: false            // true if this is the final year before a national exam
  completion_exam_name:   null               // e.g., "PLE", "KCPE", "PSLE"
  fee_billable:           true               // whether fee rules can target this level
  promotion_eligible:     true               // whether promotion logic applies
}
```

### 3.3 StageGroup Entity

Each stage group collects related levels for UI grouping, fee policy, and reporting.

```
StageGroup {
  stage_group_id:     "UG-PRIMARY"
  stage_group_name:   "Primary"
  stage:              "primary"
  level_ids:          ["UG-P1", "UG-P2", "UG-P3", "UG-P4", "UG-P5", "UG-P6", "UG-P7"]
  display_order:      2                      // after pre_primary (1)
}
```

### 3.4 Data Model Rules

| Rule | Description |
|------|-------------|
| **R1** | `currency_code` (ISO 4217) is the accounting source of truth. All monetary storage, calculations, and ledger entries use `currency_code`. |
| **R2** | `currency_symbol` is a display helper only. It is used in UI rendering, invoice printing, and report formatting. It must never appear in database storage of monetary amounts. |
| **R3** | `level_id` must be globally unique when prefixed with `iso_country_code`. Format: `{ISO}-{SHORT_CODE}`. |
| **R4** | `sequence` must be strictly monotonically increasing across all levels in a template, from pre-primary through upper secondary. |
| **R5** | `next_level_id` chains the progression graph. The last level in the system has `next_level_id: null`. |
| **R6** | `is_completion_exam_stage` marks the final year of each major national examination cycle (e.g., P7 in Uganda is the PLE year). |
| **R7** | A template must have at least one `primary` stage level. Pre-primary, lower secondary, and upper secondary are optional based on the institution's scope. |
| **R8** | All terminology fields have defaults per country but can be overridden at the institution level within the override rules (Section 9). |

---

## 4. Country-by-Country Matrix

### 4.1 Identity and Currency Matrix

| # | Country | ISO | Currency Code | Symbol | Currency Name | Symbol Position | Decimals | Confidence |
|---|---------|-----|---------------|--------|---------------|-----------------|----------|------------|
| 1 | Botswana | BW | BWP | P | Botswana Pula | before | 2 | Verified |
| 2 | Cameroon | CM | XAF | FCFA | Central African CFA Franc | after | 0 | Verified |
| 3 | Eswatini | SZ | SZL | E | Swazi Lilangeni | before | 2 | Verified |
| 4 | The Gambia | GM | GMD | D | Gambian Dalasi | before | 2 | Verified |
| 5 | Ghana | GH | GHS | GH₵ | Ghana Cedi | before | 2 | Verified |
| 6 | Kenya | KE | KES | KSh | Kenyan Shilling | before | 2 | Verified |
| 7 | Lesotho | LS | LSL | M | Lesotho Loti | before | 2 | Verified |
| 8 | Liberia | LR | LRD | L$ | Liberian Dollar | before | 2 | Verified |
| 9 | Malawi | MW | MWK | MK | Malawian Kwacha | before | 2 | Verified |
| 10 | Mauritius | MU | MUR | Rs | Mauritian Rupee | before | 2 | Verified |
| 11 | Namibia | NA | NAD | N$ | Namibian Dollar | before | 2 | Verified |
| 12 | Nigeria | NG | NGN | ₦ | Nigerian Naira | before | 2 | Verified |
| 13 | Rwanda | RW | RWF | FRw | Rwandan Franc | before | 0 | Verified |
| 14 | Seychelles | SC | SCR | SR | Seychellois Rupee | before | 2 | Verified |
| 15 | Sierra Leone | SL | SLE | Le | Sierra Leonean Leone (new) | before | 2 | Verified |
| 16 | South Africa | ZA | ZAR | R | South African Rand | before | 2 | Verified |
| 17 | South Sudan | SS | SSP | SS£ | South Sudanese Pound | before | 2 | Needs Validation |
| 18 | Tanzania | TZ | TZS | TSh | Tanzanian Shilling | before | 2 | Verified |
| 19 | Uganda | UG | UGX | USh | Ugandan Shilling | before | 0 | Verified |
| 20 | Zambia | ZM | ZMW | K | Zambian Kwacha | before | 2 | Verified |
| 21 | Zimbabwe | ZW | ZWG | ZiG | Zimbabwe Gold | before | 2 | Needs Validation |

### 4.2 Education System Matrix

| # | Country | System Code | Education System Type | Pre-Primary | Primary | Lower Secondary | Upper Secondary |
|---|---------|-------------|----------------------|-------------|---------|-----------------|-----------------|
| 1 | Botswana | 7-3-2 | Standard/Form-based | Reception | Standard 1–7 | Form 1–3 | Form 4–5 |
| 2 | Cameroon | 6-5-2 (Anglo) | Class/Form-based | Nursery 1–2 | Class 1–6 | Form 1–5 | Lower 6th, Upper 6th |
| 3 | Eswatini | 7-3-2 | Grade/Form-based | Grade 0 | Grade 1–7 | Form 1–3 | Form 4–5 |
| 4 | The Gambia | 6-3-3 | Grade-based (UBE) | ECD 1–3 | Grade 1–6 | Grade 7–9 | Grade 10–12 |
| 5 | Ghana | 2-6-3-3 | KG/Primary/JHS/SHS | KG1, KG2 | Primary 1–6 | JHS 1–3 | SHS 1–3 |
| 6 | Kenya | 2-6-3-3 (CBC) | Grade-based (CBC) | PP1, PP2 | Grade 1–6 | Grade 7–9 | Grade 10–12 |
| 7 | Lesotho | 7-3-2 | Grade/Form-based | Reception | Grade 1–7 | Form A–C | Form D–E |
| 8 | Liberia | 2-6-3-3 | Grade-based (K–12) | K1, K2 | Grade 1–6 | Grade 7–9 | Grade 10–12 |
| 9 | Malawi | 8-4 | Standard/Form-based | ECD | Standard 1–8 | Form 1–2 | Form 3–4 |
| 10 | Mauritius | 6-5-2 | Grade-based | Pre-Primary | Grade 1–6 | Grade 7–9 | Grade 10–11 (+Gr 12–13) |
| 11 | Namibia | 7-3-2 | Grade-based | Grade 0 | Grade 1–7 | Grade 8–9 | Grade 10–12 |
| 12 | Nigeria | 6-3-3 | Primary/JSS/SSS | Nursery 1–3 | Primary 1–6 | JSS 1–3 | SSS 1–3 |
| 13 | Rwanda | 6-3-3 (12YBE) | P/S-based | Nursery | P1–P6 | S1–S3 | S4–S6 |
| 14 | Seychelles | 6-5-2 | Primary/Secondary | Crèche | P1–P6 | S1–S3 | S4–S5 |
| 15 | Sierra Leone | 6-3-4 | Class/JSS/SSS | ECD | Class 1–6 | JSS 1–3 | SSS 1–4 |
| 16 | South Africa | 1-6-3-3 | Grade-based (GET/FET) | Grade R | Grade 1–7 | Grade 8–9 | Grade 10–12 |
| 17 | South Sudan | 8-4 | Primary/Senior-based | ECD 1–3 | Primary 1–8 | S1–S2 | S3–S4 |
| 18 | Tanzania | 7-4-2 | Standard/Form-based | Pre-Primary | Standard I–VII | Form I–IV | Form V–VI |
| 19 | Uganda | 7-4-2 | P/S-based | Nursery (Baby, Middle, Top) | P1–P7 | S1–S4 | S5–S6 |
| 20 | Zambia | 7-2-3 | Grade-based | Reception | Grade 1–7 | Grade 8–9 | Grade 10–12 |
| 21 | Zimbabwe | 7-4-2 | Grade/Form-based | ECD A, ECD B | Grade 1–7 | Form 1–4 | Form 5–6 |

### 4.3 Calendar and Terminology Matrix

| # | Country | Academic Year Start | Term Count | Default Term Names | Exam Labels | Template Name |
|---|---------|--------------------|-----------|--------------------|-------------|----------------|
| 1 | Botswana | January | 3 | Term 1, Term 2, Term 3 | PSLE, JCE, BGCSE | BW_STANDARD_FORM |
| 2 | Cameroon | September | 3 | First Term, Second Term, Third Term | FSLC (Anglo), GCE O/A Level | CM_ANGLOPHONE |
| 3 | Eswatini | January | 3 | Term 1, Term 2, Term 3 | SGCSE | SZ_GRADE_FORM |
| 4 | The Gambia | September | 3 | Term 1, Term 2, Term 3 | GABECE, WASSCE | GM_GRADE |
| 5 | Ghana | September | 3 | Term 1, Term 2, Term 3 | BECE, WASSCE | GH_KG_PRIMARY_JHS_SHS |
| 6 | Kenya | January | 3 | Term 1, Term 2, Term 3 | KPSEA, KCSE | KE_CBC |
| 7 | Lesotho | January | 3 | Term 1, Term 2, Term 3 | PSLE, JC, LGCSE | LS_GRADE_FORM |
| 8 | Liberia | September | 2 | Semester 1, Semester 2 | WASSCE | LR_K12 |
| 9 | Malawi | September | 3 | Term 1, Term 2, Term 3 | PSLCE, JCE, MSCE | MW_STANDARD_FORM |
| 10 | Mauritius | January | 3 | Term 1, Term 2, Term 3 | PSAC, NCE, SC/HSC | MU_GRADE |
| 11 | Namibia | January | 3 | Term 1, Term 2, Term 3 | NPSEE, JSC, NSSCO/NSSCAS | NA_GRADE |
| 12 | Nigeria | September | 3 | First Term, Second Term, Third Term | Common Entrance, BECE, WASSCE/NECO | NG_PRIMARY_JSS_SSS |
| 13 | Rwanda | January | 3 | Term 1, Term 2, Term 3 | P6 National Exam, S3 National Exam, S6 National Exam | RW_P_S |
| 14 | Seychelles | January | 3 | Term 1, Term 2, Term 3 | Primary Cert, IGCSE | SC_PRIMARY_SECONDARY |
| 15 | Sierra Leone | September | 3 | First Term, Second Term, Third Term | NPSE, BECE, WASSCE | SL_CLASS_JSS_SSS |
| 16 | South Africa | January | 4 | Term 1, Term 2, Term 3, Term 4 | ANA, NSC | ZA_GRADE |
| 17 | South Sudan | February | 3 | Term 1, Term 2, Term 3 | PLE, SSLCE | SS_PRIMARY_SENIOR |
| 18 | Tanzania | January | 2 | Term 1, Term 2 (some schools: Semester 1, Semester 2) | PSLE, CSEE, ACSEE | TZ_STANDARD_FORM |
| 19 | Uganda | February | 3 | Term 1, Term 2, Term 3 | PLE, UCE, UACE | UG_P_S |
| 20 | Zambia | January | 3 | Term 1, Term 2, Term 3 | Grade 7 Composite, G9 Exam, SCE | ZM_GRADE |
| 21 | Zimbabwe | January | 3 | First Term, Second Term, Third Term | Grade 7, O-Level, A-Level | ZW_GRADE_FORM |

### 4.4 Confidence and Validation Status

| # | Country | Confidence | Notes |
|---|---------|------------|-------|
| 1 | Botswana | **Verified** | Standard 1–7 / Form 1–5 structure well-documented. BWP stable. |
| 2 | Cameroon | **Needs Validation** | Anglophone subsystem captured. Francophone subsystem out of scope. Verify Form 1–5 labels. |
| 3 | Eswatini | **Verified** | Grade 0–7 / Form 1–5 confirmed. SZL pegged to ZAR. |
| 4 | The Gambia | **Needs Validation** | 9-year basic education recently restructured from 6-3. Verify ECD labels. |
| 5 | Ghana | **Verified** | KG/Primary/JHS/SHS fully documented by GES. GHS stable. |
| 6 | Kenya | **Verified** | CBC (2-6-3-3) transition is national policy. PP1/PP2 and Grade 1–12 confirmed by KICD. |
| 7 | Lesotho | **Verified** | Grade 1–7 / Form A–E confirmed. LSL pegged to ZAR. |
| 8 | Liberia | **Needs Validation** | K–12 grade system confirmed. Semester vs term structure varies by school. |
| 9 | Malawi | **Verified** | Standard 1–8 / Form 1–4 well-documented by MoEST. |
| 10 | Mauritius | **Verified** | Nine-Year Continuous Basic Education (NYCBE) reformed. Grade 1–13 confirmed by MES. |
| 11 | Namibia | **Verified** | Revised curriculum Grade 0–12. NAD pegged to ZAR. |
| 12 | Nigeria | **Verified** | 6-3-3-4 (UBE 9-3) system widely documented. NGN stable. |
| 13 | Rwanda | **Verified** | 12YBE (6-3-3) confirmed by REB. RWF zero-decimal currency. |
| 14 | Seychelles | **Needs Validation** | Small system; verify crèche and post-secondary labels. |
| 15 | Sierra Leone | **Needs Validation** | SSS recently extended to 4 years in some sources. Verify new Leone (SLE) adoption. |
| 16 | South Africa | **Verified** | CAPS curriculum Grade R–12 fully documented by DBE. ZAR standard. |
| 17 | South Sudan | **Needs Validation** | 8-4 structure inherited post-independence. Political instability may affect currency stability (SSP). |
| 18 | Tanzania | **Verified** | Standard I–VII / Form I–VI extensively documented by TIE. |
| 19 | Uganda | **Verified** | P1–P7 / S1–S6 confirmed by NCDC. UGX zero-decimal convention used. |
| 20 | Zambia | **Verified** | Revised curriculum Grade 1–12 confirmed by CDC. ZMW stable. |
| 21 | Zimbabwe | **Needs Validation** | Grade/Form structure confirmed. ZWG (Zimbabwe Gold) introduced April 2024; verify adoption status. |

---

## 5. Education System Template Structure

This section defines the exact level-by-level template for each country in a format directly consumable by the Maple ERP level configuration engine.

### 5.1 Uganda (UG_P_S)

**System:** 7-4-2 | **Type:** P/S-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | UG-NURSERY-BABY | Baby | Baby Class | pre_primary | Nursery | — | UG-NURSERY-MIDDLE |
| 2 | UG-NURSERY-MIDDLE | Middle | Middle Class | pre_primary | Nursery | — | UG-NURSERY-TOP |
| 3 | UG-NURSERY-TOP | Top | Top Class | pre_primary | Nursery | — | UG-P1 |
| 4 | UG-P1 | P1 | Primary One | primary | Primary | — | UG-P2 |
| 5 | UG-P2 | P2 | Primary Two | primary | Primary | — | UG-P3 |
| 6 | UG-P3 | P3 | Primary Three | primary | Primary | — | UG-P4 |
| 7 | UG-P4 | P4 | Primary Four | primary | Primary | — | UG-P5 |
| 8 | UG-P5 | P5 | Primary Five | primary | Primary | — | UG-P6 |
| 9 | UG-P6 | P6 | Primary Six | primary | Primary | — | UG-P7 |
| 10 | UG-P7 | P7 | Primary Seven | primary | Primary | PLE | UG-S1 |
| 11 | UG-S1 | S1 | Senior One | lower_secondary | O-Level | — | UG-S2 |
| 12 | UG-S2 | S2 | Senior Two | lower_secondary | O-Level | — | UG-S3 |
| 13 | UG-S3 | S3 | Senior Three | lower_secondary | O-Level | — | UG-S4 |
| 14 | UG-S4 | S4 | Senior Four | lower_secondary | O-Level | UCE | UG-S5 |
| 15 | UG-S5 | S5 | Senior Five | upper_secondary | A-Level | — | UG-S6 |
| 16 | UG-S6 | S6 | Senior Six | upper_secondary | A-Level | UACE | null |

---

### 5.2 Kenya (KE_CBC)

**System:** 2-6-3-3 (CBC) | **Type:** Grade-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | KE-PP1 | PP1 | Pre-Primary 1 | pre_primary | Pre-Primary | — | KE-PP2 |
| 2 | KE-PP2 | PP2 | Pre-Primary 2 | pre_primary | Pre-Primary | — | KE-G1 |
| 3 | KE-G1 | Grade 1 | Grade 1 | primary | Lower Primary | — | KE-G2 |
| 4 | KE-G2 | Grade 2 | Grade 2 | primary | Lower Primary | — | KE-G3 |
| 5 | KE-G3 | Grade 3 | Grade 3 | primary | Lower Primary | — | KE-G4 |
| 6 | KE-G4 | Grade 4 | Grade 4 | primary | Upper Primary | — | KE-G5 |
| 7 | KE-G5 | Grade 5 | Grade 5 | primary | Upper Primary | — | KE-G6 |
| 8 | KE-G6 | Grade 6 | Grade 6 | primary | Upper Primary | KPSEA | KE-G7 |
| 9 | KE-G7 | Grade 7 | Grade 7 | lower_secondary | Junior School | — | KE-G8 |
| 10 | KE-G8 | Grade 8 | Grade 8 | lower_secondary | Junior School | — | KE-G9 |
| 11 | KE-G9 | Grade 9 | Grade 9 | lower_secondary | Junior School | — | KE-G10 |
| 12 | KE-G10 | Grade 10 | Grade 10 | upper_secondary | Senior School | — | KE-G11 |
| 13 | KE-G11 | Grade 11 | Grade 11 | upper_secondary | Senior School | — | KE-G12 |
| 14 | KE-G12 | Grade 12 | Grade 12 | upper_secondary | Senior School | KCSE | null |

---

### 5.3 Tanzania (TZ_STANDARD_FORM)

**System:** 7-4-2 | **Type:** Standard/Form-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | TZ-PRE | Pre-Primary | Pre-Primary | pre_primary | Pre-Primary | — | TZ-STD1 |
| 2 | TZ-STD1 | Std I | Standard I | primary | Primary | — | TZ-STD2 |
| 3 | TZ-STD2 | Std II | Standard II | primary | Primary | — | TZ-STD3 |
| 4 | TZ-STD3 | Std III | Standard III | primary | Primary | — | TZ-STD4 |
| 5 | TZ-STD4 | Std IV | Standard IV | primary | Primary | — | TZ-STD5 |
| 6 | TZ-STD5 | Std V | Standard V | primary | Primary | — | TZ-STD6 |
| 7 | TZ-STD6 | Std VI | Standard VI | primary | Primary | — | TZ-STD7 |
| 8 | TZ-STD7 | Std VII | Standard VII | primary | Primary | PSLE | TZ-F1 |
| 9 | TZ-F1 | Form I | Form I | lower_secondary | Ordinary Level | — | TZ-F2 |
| 10 | TZ-F2 | Form II | Form II | lower_secondary | Ordinary Level | — | TZ-F3 |
| 11 | TZ-F3 | Form III | Form III | lower_secondary | Ordinary Level | — | TZ-F4 |
| 12 | TZ-F4 | Form IV | Form IV | lower_secondary | Ordinary Level | CSEE | TZ-F5 |
| 13 | TZ-F5 | Form V | Form V | upper_secondary | Advanced Level | — | TZ-F6 |
| 14 | TZ-F6 | Form VI | Form VI | upper_secondary | Advanced Level | ACSEE | null |

---

### 5.4 Ghana (GH_KG_PRIMARY_JHS_SHS)

**System:** 2-6-3-3 | **Type:** KG/Primary/JHS/SHS

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | GH-KG1 | KG1 | Kindergarten 1 | pre_primary | Kindergarten | — | GH-KG2 |
| 2 | GH-KG2 | KG2 | Kindergarten 2 | pre_primary | Kindergarten | — | GH-P1 |
| 3 | GH-P1 | Primary 1 | Primary 1 | primary | Primary | — | GH-P2 |
| 4 | GH-P2 | Primary 2 | Primary 2 | primary | Primary | — | GH-P3 |
| 5 | GH-P3 | Primary 3 | Primary 3 | primary | Primary | — | GH-P4 |
| 6 | GH-P4 | Primary 4 | Primary 4 | primary | Primary | — | GH-P5 |
| 7 | GH-P5 | Primary 5 | Primary 5 | primary | Primary | — | GH-P6 |
| 8 | GH-P6 | Primary 6 | Primary 6 | primary | Primary | — | GH-JHS1 |
| 9 | GH-JHS1 | JHS 1 | Junior High School 1 | lower_secondary | JHS | — | GH-JHS2 |
| 10 | GH-JHS2 | JHS 2 | Junior High School 2 | lower_secondary | JHS | — | GH-JHS3 |
| 11 | GH-JHS3 | JHS 3 | Junior High School 3 | lower_secondary | JHS | BECE | GH-SHS1 |
| 12 | GH-SHS1 | SHS 1 | Senior High School 1 | upper_secondary | SHS | — | GH-SHS2 |
| 13 | GH-SHS2 | SHS 2 | Senior High School 2 | upper_secondary | SHS | — | GH-SHS3 |
| 14 | GH-SHS3 | SHS 3 | Senior High School 3 | upper_secondary | SHS | WASSCE | null |

---

### 5.5 South Africa (ZA_GRADE)

**System:** 1-6-3-3 (GET + FET) | **Type:** Grade-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | ZA-GR | Grade R | Grade R (Reception) | pre_primary | Foundation Phase | — | ZA-G1 |
| 2 | ZA-G1 | Grade 1 | Grade 1 | primary | Foundation Phase | — | ZA-G2 |
| 3 | ZA-G2 | Grade 2 | Grade 2 | primary | Foundation Phase | — | ZA-G3 |
| 4 | ZA-G3 | Grade 3 | Grade 3 | primary | Foundation Phase | — | ZA-G4 |
| 5 | ZA-G4 | Grade 4 | Grade 4 | primary | Intermediate Phase | — | ZA-G5 |
| 6 | ZA-G5 | Grade 5 | Grade 5 | primary | Intermediate Phase | — | ZA-G6 |
| 7 | ZA-G6 | Grade 6 | Grade 6 | primary | Intermediate Phase | — | ZA-G7 |
| 8 | ZA-G7 | Grade 7 | Grade 7 | primary | Senior Phase | — | ZA-G8 |
| 9 | ZA-G8 | Grade 8 | Grade 8 | lower_secondary | Senior Phase | — | ZA-G9 |
| 10 | ZA-G9 | Grade 9 | Grade 9 | lower_secondary | Senior Phase | — | ZA-G10 |
| 11 | ZA-G10 | Grade 10 | Grade 10 | upper_secondary | FET Phase | — | ZA-G11 |
| 12 | ZA-G11 | Grade 11 | Grade 11 | upper_secondary | FET Phase | — | ZA-G12 |
| 13 | ZA-G12 | Grade 12 | Grade 12 | upper_secondary | FET Phase | NSC | null |

---

### 5.6 Rwanda (RW_P_S)

**System:** 6-3-3 (12YBE) | **Type:** P/S-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | RW-NURSERY | Nursery | Nursery | pre_primary | Pre-Primary | — | RW-P1 |
| 2 | RW-P1 | P1 | Primary 1 | primary | Primary | — | RW-P2 |
| 3 | RW-P2 | P2 | Primary 2 | primary | Primary | — | RW-P3 |
| 4 | RW-P3 | P3 | Primary 3 | primary | Primary | — | RW-P4 |
| 5 | RW-P4 | P4 | Primary 4 | primary | Primary | — | RW-P5 |
| 6 | RW-P5 | P5 | Primary 5 | primary | Primary | — | RW-P6 |
| 7 | RW-P6 | P6 | Primary 6 | primary | Primary | P6 National Exam | RW-S1 |
| 8 | RW-S1 | S1 | Senior 1 | lower_secondary | Ordinary Level | — | RW-S2 |
| 9 | RW-S2 | S2 | Senior 2 | lower_secondary | Ordinary Level | — | RW-S3 |
| 10 | RW-S3 | S3 | Senior 3 | lower_secondary | Ordinary Level | S3 National Exam | RW-S4 |
| 11 | RW-S4 | S4 | Senior 4 | upper_secondary | Advanced Level | — | RW-S5 |
| 12 | RW-S5 | S5 | Senior 5 | upper_secondary | Advanced Level | — | RW-S6 |
| 13 | RW-S6 | S6 | Senior 6 | upper_secondary | Advanced Level | S6 National Exam | null |

---

### 5.7 Botswana (BW_STANDARD_FORM)

**System:** 7-3-2 | **Type:** Standard/Form-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | BW-REC | Reception | Reception | pre_primary | Pre-Primary | — | BW-STD1 |
| 2 | BW-STD1 | Std 1 | Standard 1 | primary | Primary | — | BW-STD2 |
| 3 | BW-STD2 | Std 2 | Standard 2 | primary | Primary | — | BW-STD3 |
| 4 | BW-STD3 | Std 3 | Standard 3 | primary | Primary | — | BW-STD4 |
| 5 | BW-STD4 | Std 4 | Standard 4 | primary | Primary | — | BW-STD5 |
| 6 | BW-STD5 | Std 5 | Standard 5 | primary | Primary | — | BW-STD6 |
| 7 | BW-STD6 | Std 6 | Standard 6 | primary | Primary | — | BW-STD7 |
| 8 | BW-STD7 | Std 7 | Standard 7 | primary | Primary | PSLE | BW-F1 |
| 9 | BW-F1 | Form 1 | Form 1 | lower_secondary | Junior Secondary | — | BW-F2 |
| 10 | BW-F2 | Form 2 | Form 2 | lower_secondary | Junior Secondary | — | BW-F3 |
| 11 | BW-F3 | Form 3 | Form 3 | lower_secondary | Junior Secondary | JCE | BW-F4 |
| 12 | BW-F4 | Form 4 | Form 4 | upper_secondary | Senior Secondary | — | BW-F5 |
| 13 | BW-F5 | Form 5 | Form 5 | upper_secondary | Senior Secondary | BGCSE | null |

---

### 5.8 Nigeria (NG_PRIMARY_JSS_SSS)

**System:** 6-3-3 (UBE 9-3) | **Type:** Primary/JSS/SSS

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | NG-NUR1 | Nursery 1 | Nursery 1 | pre_primary | Nursery | — | NG-NUR2 |
| 2 | NG-NUR2 | Nursery 2 | Nursery 2 | pre_primary | Nursery | — | NG-NUR3 |
| 3 | NG-NUR3 | Nursery 3 | Nursery 3 | pre_primary | Nursery | — | NG-P1 |
| 4 | NG-P1 | Primary 1 | Primary 1 | primary | Primary | — | NG-P2 |
| 5 | NG-P2 | Primary 2 | Primary 2 | primary | Primary | — | NG-P3 |
| 6 | NG-P3 | Primary 3 | Primary 3 | primary | Primary | — | NG-P4 |
| 7 | NG-P4 | Primary 4 | Primary 4 | primary | Primary | — | NG-P5 |
| 8 | NG-P5 | Primary 5 | Primary 5 | primary | Primary | — | NG-P6 |
| 9 | NG-P6 | Primary 6 | Primary 6 | primary | Primary | Common Entrance | NG-JSS1 |
| 10 | NG-JSS1 | JSS 1 | Junior Secondary 1 | lower_secondary | Junior Secondary | — | NG-JSS2 |
| 11 | NG-JSS2 | JSS 2 | Junior Secondary 2 | lower_secondary | Junior Secondary | — | NG-JSS3 |
| 12 | NG-JSS3 | JSS 3 | Junior Secondary 3 | lower_secondary | Junior Secondary | BECE | NG-SSS1 |
| 13 | NG-SSS1 | SSS 1 | Senior Secondary 1 | upper_secondary | Senior Secondary | — | NG-SSS2 |
| 14 | NG-SSS2 | SSS 2 | Senior Secondary 2 | upper_secondary | Senior Secondary | — | NG-SSS3 |
| 15 | NG-SSS3 | SSS 3 | Senior Secondary 3 | upper_secondary | Senior Secondary | WASSCE/NECO | null |

---

### 5.9 Zambia (ZM_GRADE)

**System:** 7-2-3 | **Type:** Grade-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | ZM-REC | Reception | Reception | pre_primary | Pre-Primary | — | ZM-G1 |
| 2 | ZM-G1 | Grade 1 | Grade 1 | primary | Primary | — | ZM-G2 |
| 3 | ZM-G2 | Grade 2 | Grade 2 | primary | Primary | — | ZM-G3 |
| 4 | ZM-G3 | Grade 3 | Grade 3 | primary | Primary | — | ZM-G4 |
| 5 | ZM-G4 | Grade 4 | Grade 4 | primary | Primary | — | ZM-G5 |
| 6 | ZM-G5 | Grade 5 | Grade 5 | primary | Primary | — | ZM-G6 |
| 7 | ZM-G6 | Grade 6 | Grade 6 | primary | Primary | — | ZM-G7 |
| 8 | ZM-G7 | Grade 7 | Grade 7 | primary | Primary | Grade 7 Composite | ZM-G8 |
| 9 | ZM-G8 | Grade 8 | Grade 8 | lower_secondary | Junior Secondary | — | ZM-G9 |
| 10 | ZM-G9 | Grade 9 | Grade 9 | lower_secondary | Junior Secondary | G9 Exam | ZM-G10 |
| 11 | ZM-G10 | Grade 10 | Grade 10 | upper_secondary | Senior Secondary | — | ZM-G11 |
| 12 | ZM-G11 | Grade 11 | Grade 11 | upper_secondary | Senior Secondary | — | ZM-G12 |
| 13 | ZM-G12 | Grade 12 | Grade 12 | upper_secondary | Senior Secondary | SCE | null |

---

### 5.10 Mauritius (MU_GRADE)

**System:** 6-5-2 (NYCBE) | **Type:** Grade-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | MU-PRE | Pre-Primary | Pre-Primary | pre_primary | Pre-Primary | — | MU-G1 |
| 2 | MU-G1 | Grade 1 | Grade 1 | primary | Primary | — | MU-G2 |
| 3 | MU-G2 | Grade 2 | Grade 2 | primary | Primary | — | MU-G3 |
| 4 | MU-G3 | Grade 3 | Grade 3 | primary | Primary | — | MU-G4 |
| 5 | MU-G4 | Grade 4 | Grade 4 | primary | Primary | — | MU-G5 |
| 6 | MU-G5 | Grade 5 | Grade 5 | primary | Primary | — | MU-G6 |
| 7 | MU-G6 | Grade 6 | Grade 6 | primary | Primary | PSAC | MU-G7 |
| 8 | MU-G7 | Grade 7 | Grade 7 | lower_secondary | Lower Secondary | — | MU-G8 |
| 9 | MU-G8 | Grade 8 | Grade 8 | lower_secondary | Lower Secondary | — | MU-G9 |
| 10 | MU-G9 | Grade 9 | Grade 9 | lower_secondary | Lower Secondary | NCE | MU-G10 |
| 11 | MU-G10 | Grade 10 | Grade 10 | upper_secondary | Upper Secondary | — | MU-G11 |
| 12 | MU-G11 | Grade 11 | Grade 11 | upper_secondary | Upper Secondary | SC | MU-G12 |
| 13 | MU-G12 | Grade 12 | Grade 12 | upper_secondary | Pre-University | — | MU-G13 |
| 14 | MU-G13 | Grade 13 | Grade 13 | upper_secondary | Pre-University | HSC | null |

---

### 5.11 Namibia (NA_GRADE)

**System:** 7-3-2 | **Type:** Grade-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | NA-G0 | Grade 0 | Grade 0 (Pre-Primary) | pre_primary | Pre-Primary | — | NA-G1 |
| 2 | NA-G1 | Grade 1 | Grade 1 | primary | Lower Primary | — | NA-G2 |
| 3 | NA-G2 | Grade 2 | Grade 2 | primary | Lower Primary | — | NA-G3 |
| 4 | NA-G3 | Grade 3 | Grade 3 | primary | Lower Primary | — | NA-G4 |
| 5 | NA-G4 | Grade 4 | Grade 4 | primary | Upper Primary | — | NA-G5 |
| 6 | NA-G5 | Grade 5 | Grade 5 | primary | Upper Primary | — | NA-G6 |
| 7 | NA-G6 | Grade 6 | Grade 6 | primary | Upper Primary | — | NA-G7 |
| 8 | NA-G7 | Grade 7 | Grade 7 | primary | Upper Primary | — | NA-G8 |
| 9 | NA-G8 | Grade 8 | Grade 8 | lower_secondary | Junior Secondary | — | NA-G9 |
| 10 | NA-G9 | Grade 9 | Grade 9 | lower_secondary | Junior Secondary | JSC | NA-G10 |
| 11 | NA-G10 | Grade 10 | Grade 10 | upper_secondary | Senior Secondary | — | NA-G11 |
| 12 | NA-G11 | Grade 11 | Grade 11 | upper_secondary | Senior Secondary | NSSCO | NA-G12 |
| 13 | NA-G12 | Grade 12 | Grade 12 | upper_secondary | Senior Secondary | NSSCAS | null |

---

### 5.12 Malawi (MW_STANDARD_FORM)

**System:** 8-4 | **Type:** Standard/Form-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | MW-ECD | ECD | Early Childhood Development | pre_primary | ECD | — | MW-STD1 |
| 2 | MW-STD1 | Std 1 | Standard 1 | primary | Primary | — | MW-STD2 |
| 3 | MW-STD2 | Std 2 | Standard 2 | primary | Primary | — | MW-STD3 |
| 4 | MW-STD3 | Std 3 | Standard 3 | primary | Primary | — | MW-STD4 |
| 5 | MW-STD4 | Std 4 | Standard 4 | primary | Primary | — | MW-STD5 |
| 6 | MW-STD5 | Std 5 | Standard 5 | primary | Primary | — | MW-STD6 |
| 7 | MW-STD6 | Std 6 | Standard 6 | primary | Primary | — | MW-STD7 |
| 8 | MW-STD7 | Std 7 | Standard 7 | primary | Primary | — | MW-STD8 |
| 9 | MW-STD8 | Std 8 | Standard 8 | primary | Primary | PSLCE | MW-F1 |
| 10 | MW-F1 | Form 1 | Form 1 | lower_secondary | Secondary | — | MW-F2 |
| 11 | MW-F2 | Form 2 | Form 2 | lower_secondary | Secondary | JCE | MW-F3 |
| 12 | MW-F3 | Form 3 | Form 3 | upper_secondary | Secondary | — | MW-F4 |
| 13 | MW-F4 | Form 4 | Form 4 | upper_secondary | Secondary | MSCE | null |

---

### 5.13 Zimbabwe (ZW_GRADE_FORM)

**System:** 7-4-2 | **Type:** Grade/Form-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | ZW-ECDA | ECD A | ECD A | pre_primary | ECD | — | ZW-ECDB |
| 2 | ZW-ECDB | ECD B | ECD B | pre_primary | ECD | — | ZW-G1 |
| 3 | ZW-G1 | Grade 1 | Grade 1 | primary | Primary | — | ZW-G2 |
| 4 | ZW-G2 | Grade 2 | Grade 2 | primary | Primary | — | ZW-G3 |
| 5 | ZW-G3 | Grade 3 | Grade 3 | primary | Primary | — | ZW-G4 |
| 6 | ZW-G4 | Grade 4 | Grade 4 | primary | Primary | — | ZW-G5 |
| 7 | ZW-G5 | Grade 5 | Grade 5 | primary | Primary | — | ZW-G6 |
| 8 | ZW-G6 | Grade 6 | Grade 6 | primary | Primary | — | ZW-G7 |
| 9 | ZW-G7 | Grade 7 | Grade 7 | primary | Primary | Grade 7 Exam | ZW-F1 |
| 10 | ZW-F1 | Form 1 | Form 1 | lower_secondary | Ordinary Level | — | ZW-F2 |
| 11 | ZW-F2 | Form 2 | Form 2 | lower_secondary | Ordinary Level | — | ZW-F3 |
| 12 | ZW-F3 | Form 3 | Form 3 | lower_secondary | Ordinary Level | — | ZW-F4 |
| 13 | ZW-F4 | Form 4 | Form 4 | lower_secondary | Ordinary Level | O-Level (ZIMSEC) | ZW-F5 |
| 14 | ZW-F5 | Form 5 | Form 5 (Lower 6th) | upper_secondary | Advanced Level | — | ZW-F6 |
| 15 | ZW-F6 | Form 6 | Form 6 (Upper 6th) | upper_secondary | Advanced Level | A-Level (ZIMSEC) | null |

---

### 5.14 Cameroon — Anglophone (CM_ANGLOPHONE)

**System:** 6-5-2 | **Type:** Class/Form-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | CM-NUR1 | Nursery 1 | Nursery 1 | pre_primary | Nursery | — | CM-NUR2 |
| 2 | CM-NUR2 | Nursery 2 | Nursery 2 | pre_primary | Nursery | — | CM-C1 |
| 3 | CM-C1 | Class 1 | Class 1 | primary | Primary | — | CM-C2 |
| 4 | CM-C2 | Class 2 | Class 2 | primary | Primary | — | CM-C3 |
| 5 | CM-C3 | Class 3 | Class 3 | primary | Primary | — | CM-C4 |
| 6 | CM-C4 | Class 4 | Class 4 | primary | Primary | — | CM-C5 |
| 7 | CM-C5 | Class 5 | Class 5 | primary | Primary | — | CM-C6 |
| 8 | CM-C6 | Class 6 | Class 6 | primary | Primary | FSLC | CM-F1 |
| 9 | CM-F1 | Form 1 | Form 1 | lower_secondary | Secondary (O-Level) | — | CM-F2 |
| 10 | CM-F2 | Form 2 | Form 2 | lower_secondary | Secondary (O-Level) | — | CM-F3 |
| 11 | CM-F3 | Form 3 | Form 3 | lower_secondary | Secondary (O-Level) | — | CM-F4 |
| 12 | CM-F4 | Form 4 | Form 4 | lower_secondary | Secondary (O-Level) | — | CM-F5 |
| 13 | CM-F5 | Form 5 | Form 5 | lower_secondary | Secondary (O-Level) | GCE O-Level | CM-LS |
| 14 | CM-LS | Lower 6th | Lower Sixth | upper_secondary | Advanced Level | — | CM-US |
| 15 | CM-US | Upper 6th | Upper Sixth | upper_secondary | Advanced Level | GCE A-Level | null |

---

### 5.15 Eswatini (SZ_GRADE_FORM)

**System:** 7-3-2 | **Type:** Grade/Form-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | SZ-G0 | Grade 0 | Grade 0 (Reception) | pre_primary | Pre-Primary | — | SZ-G1 |
| 2 | SZ-G1 | Grade 1 | Grade 1 | primary | Primary | — | SZ-G2 |
| 3 | SZ-G2 | Grade 2 | Grade 2 | primary | Primary | — | SZ-G3 |
| 4 | SZ-G3 | Grade 3 | Grade 3 | primary | Primary | — | SZ-G4 |
| 5 | SZ-G4 | Grade 4 | Grade 4 | primary | Primary | — | SZ-G5 |
| 6 | SZ-G5 | Grade 5 | Grade 5 | primary | Primary | — | SZ-G6 |
| 7 | SZ-G6 | Grade 6 | Grade 6 | primary | Primary | — | SZ-G7 |
| 8 | SZ-G7 | Grade 7 | Grade 7 | primary | Primary | EPC | SZ-F1 |
| 9 | SZ-F1 | Form 1 | Form 1 | lower_secondary | Junior Secondary | — | SZ-F2 |
| 10 | SZ-F2 | Form 2 | Form 2 | lower_secondary | Junior Secondary | — | SZ-F3 |
| 11 | SZ-F3 | Form 3 | Form 3 | lower_secondary | Junior Secondary | JC | SZ-F4 |
| 12 | SZ-F4 | Form 4 | Form 4 | upper_secondary | Senior Secondary | — | SZ-F5 |
| 13 | SZ-F5 | Form 5 | Form 5 | upper_secondary | Senior Secondary | SGCSE | null |

---

### 5.16 The Gambia (GM_GRADE)

**System:** 6-3-3 (UBE → 9-3) | **Type:** Grade-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | GM-ECD1 | ECD 1 | Early Childhood Development 1 | pre_primary | ECD | — | GM-ECD2 |
| 2 | GM-ECD2 | ECD 2 | Early Childhood Development 2 | pre_primary | ECD | — | GM-ECD3 |
| 3 | GM-ECD3 | ECD 3 | Early Childhood Development 3 | pre_primary | ECD | — | GM-G1 |
| 4 | GM-G1 | Grade 1 | Grade 1 | primary | Lower Basic | — | GM-G2 |
| 5 | GM-G2 | Grade 2 | Grade 2 | primary | Lower Basic | — | GM-G3 |
| 6 | GM-G3 | Grade 3 | Grade 3 | primary | Lower Basic | — | GM-G4 |
| 7 | GM-G4 | Grade 4 | Grade 4 | primary | Lower Basic | — | GM-G5 |
| 8 | GM-G5 | Grade 5 | Grade 5 | primary | Lower Basic | — | GM-G6 |
| 9 | GM-G6 | Grade 6 | Grade 6 | primary | Lower Basic | — | GM-G7 |
| 10 | GM-G7 | Grade 7 | Grade 7 | lower_secondary | Upper Basic | — | GM-G8 |
| 11 | GM-G8 | Grade 8 | Grade 8 | lower_secondary | Upper Basic | — | GM-G9 |
| 12 | GM-G9 | Grade 9 | Grade 9 | lower_secondary | Upper Basic | GABECE | GM-G10 |
| 13 | GM-G10 | Grade 10 | Grade 10 | upper_secondary | Senior Secondary | — | GM-G11 |
| 14 | GM-G11 | Grade 11 | Grade 11 | upper_secondary | Senior Secondary | — | GM-G12 |
| 15 | GM-G12 | Grade 12 | Grade 12 | upper_secondary | Senior Secondary | WASSCE | null |

---

### 5.17 Lesotho (LS_GRADE_FORM)

**System:** 7-3-2 | **Type:** Grade/Form-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | LS-REC | Reception | Reception | pre_primary | Pre-Primary | — | LS-G1 |
| 2 | LS-G1 | Grade 1 | Grade 1 | primary | Primary | — | LS-G2 |
| 3 | LS-G2 | Grade 2 | Grade 2 | primary | Primary | — | LS-G3 |
| 4 | LS-G3 | Grade 3 | Grade 3 | primary | Primary | — | LS-G4 |
| 5 | LS-G4 | Grade 4 | Grade 4 | primary | Primary | — | LS-G5 |
| 6 | LS-G5 | Grade 5 | Grade 5 | primary | Primary | — | LS-G6 |
| 7 | LS-G6 | Grade 6 | Grade 6 | primary | Primary | — | LS-G7 |
| 8 | LS-G7 | Grade 7 | Grade 7 | primary | Primary | PSLE | LS-FA |
| 9 | LS-FA | Form A | Form A | lower_secondary | Junior Secondary | — | LS-FB |
| 10 | LS-FB | Form B | Form B | lower_secondary | Junior Secondary | — | LS-FC |
| 11 | LS-FC | Form C | Form C | lower_secondary | Junior Secondary | JC | LS-FD |
| 12 | LS-FD | Form D | Form D | upper_secondary | Senior Secondary | — | LS-FE |
| 13 | LS-FE | Form E | Form E | upper_secondary | Senior Secondary | LGCSE | null |

---

### 5.18 Liberia (LR_K12)

**System:** 2-6-3-3 | **Type:** Grade-based (K–12)

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | LR-K1 | K1 | Kindergarten 1 | pre_primary | Kindergarten | — | LR-K2 |
| 2 | LR-K2 | K2 | Kindergarten 2 | pre_primary | Kindergarten | — | LR-G1 |
| 3 | LR-G1 | Grade 1 | Grade 1 | primary | Elementary | — | LR-G2 |
| 4 | LR-G2 | Grade 2 | Grade 2 | primary | Elementary | — | LR-G3 |
| 5 | LR-G3 | Grade 3 | Grade 3 | primary | Elementary | — | LR-G4 |
| 6 | LR-G4 | Grade 4 | Grade 4 | primary | Elementary | — | LR-G5 |
| 7 | LR-G5 | Grade 5 | Grade 5 | primary | Elementary | — | LR-G6 |
| 8 | LR-G6 | Grade 6 | Grade 6 | primary | Elementary | — | LR-G7 |
| 9 | LR-G7 | Grade 7 | Grade 7 | lower_secondary | Junior High | — | LR-G8 |
| 10 | LR-G8 | Grade 8 | Grade 8 | lower_secondary | Junior High | — | LR-G9 |
| 11 | LR-G9 | Grade 9 | Grade 9 | lower_secondary | Junior High | — | LR-G10 |
| 12 | LR-G10 | Grade 10 | Grade 10 | upper_secondary | Senior High | — | LR-G11 |
| 13 | LR-G11 | Grade 11 | Grade 11 | upper_secondary | Senior High | — | LR-G12 |
| 14 | LR-G12 | Grade 12 | Grade 12 | upper_secondary | Senior High | WASSCE | null |

---

### 5.19 Seychelles (SC_PRIMARY_SECONDARY)

**System:** 6-5 (+2 post-secondary) | **Type:** Primary/Secondary

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | SC-CRE | Crèche | Crèche | pre_primary | Pre-Primary | — | SC-P1 |
| 2 | SC-P1 | P1 | Primary 1 | primary | Primary | — | SC-P2 |
| 3 | SC-P2 | P2 | Primary 2 | primary | Primary | — | SC-P3 |
| 4 | SC-P3 | P3 | Primary 3 | primary | Primary | — | SC-P4 |
| 5 | SC-P4 | P4 | Primary 4 | primary | Primary | — | SC-P5 |
| 6 | SC-P5 | P5 | Primary 5 | primary | Primary | — | SC-P6 |
| 7 | SC-P6 | P6 | Primary 6 | primary | Primary | Nat. Primary Cert. | SC-S1 |
| 8 | SC-S1 | S1 | Secondary 1 | lower_secondary | Secondary | — | SC-S2 |
| 9 | SC-S2 | S2 | Secondary 2 | lower_secondary | Secondary | — | SC-S3 |
| 10 | SC-S3 | S3 | Secondary 3 | lower_secondary | Secondary | — | SC-S4 |
| 11 | SC-S4 | S4 | Secondary 4 | upper_secondary | Secondary | — | SC-S5 |
| 12 | SC-S5 | S5 | Secondary 5 | upper_secondary | Secondary | IGCSE | null |

---

### 5.20 Sierra Leone (SL_CLASS_JSS_SSS)

**System:** 6-3-4 | **Type:** Class/JSS/SSS

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | SL-ECD | ECD | Early Childhood Development | pre_primary | Pre-Primary | — | SL-C1 |
| 2 | SL-C1 | Class 1 | Class 1 | primary | Primary | — | SL-C2 |
| 3 | SL-C2 | Class 2 | Class 2 | primary | Primary | — | SL-C3 |
| 4 | SL-C3 | Class 3 | Class 3 | primary | Primary | — | SL-C4 |
| 5 | SL-C4 | Class 4 | Class 4 | primary | Primary | — | SL-C5 |
| 6 | SL-C5 | Class 5 | Class 5 | primary | Primary | — | SL-C6 |
| 7 | SL-C6 | Class 6 | Class 6 | primary | Primary | NPSE | SL-JSS1 |
| 8 | SL-JSS1 | JSS 1 | Junior Secondary 1 | lower_secondary | Junior Secondary | — | SL-JSS2 |
| 9 | SL-JSS2 | JSS 2 | Junior Secondary 2 | lower_secondary | Junior Secondary | — | SL-JSS3 |
| 10 | SL-JSS3 | JSS 3 | Junior Secondary 3 | lower_secondary | Junior Secondary | BECE | SL-SSS1 |
| 11 | SL-SSS1 | SSS 1 | Senior Secondary 1 | upper_secondary | Senior Secondary | — | SL-SSS2 |
| 12 | SL-SSS2 | SSS 2 | Senior Secondary 2 | upper_secondary | Senior Secondary | — | SL-SSS3 |
| 13 | SL-SSS3 | SSS 3 | Senior Secondary 3 | upper_secondary | Senior Secondary | — | SL-SSS4 |
| 14 | SL-SSS4 | SSS 4 | Senior Secondary 4 | upper_secondary | Senior Secondary | WASSCE | null |

---

### 5.21 South Sudan (SS_PRIMARY_SENIOR)

**System:** 8-4 | **Type:** Primary/Senior-based

| Sequence | Level ID | Short Code | Long Name | Stage | Stage Group | Exam Stage | Next Level |
|----------|----------|------------|-----------|-------|-------------|------------|------------|
| 1 | SS-ECD1 | ECD 1 | Early Childhood Development 1 | pre_primary | ECD | — | SS-ECD2 |
| 2 | SS-ECD2 | ECD 2 | Early Childhood Development 2 | pre_primary | ECD | — | SS-ECD3 |
| 3 | SS-ECD3 | ECD 3 | Early Childhood Development 3 | pre_primary | ECD | — | SS-P1 |
| 4 | SS-P1 | P1 | Primary 1 | primary | Primary | — | SS-P2 |
| 5 | SS-P2 | P2 | Primary 2 | primary | Primary | — | SS-P3 |
| 6 | SS-P3 | P3 | Primary 3 | primary | Primary | — | SS-P4 |
| 7 | SS-P4 | P4 | Primary 4 | primary | Primary | — | SS-P5 |
| 8 | SS-P5 | P5 | Primary 5 | primary | Primary | — | SS-P6 |
| 9 | SS-P6 | P6 | Primary 6 | primary | Primary | — | SS-P7 |
| 10 | SS-P7 | P7 | Primary 7 | primary | Primary | — | SS-P8 |
| 11 | SS-P8 | P8 | Primary 8 | primary | Primary | PLE | SS-S1 |
| 12 | SS-S1 | S1 | Senior 1 | lower_secondary | Secondary | — | SS-S2 |
| 13 | SS-S2 | S2 | Senior 2 | lower_secondary | Secondary | — | SS-S3 |
| 14 | SS-S3 | S3 | Senior 3 | upper_secondary | Secondary | — | SS-S4 |
| 15 | SS-S4 | S4 | Senior 4 | upper_secondary | Secondary | SSLCE | null |

---

## 6. Currency and Financial Localization Structure

### 6.1 Currency Display Rules

| Rule | Description |
|------|-------------|
| **F1** | The accounting engine stores all monetary values as `(amount: DECIMAL, currency_code: TEXT)`. The `currency_code` is the ISO 4217 code. |
| **F2** | The `currency_symbol` is a **display helper only**. It is never stored alongside monetary values in the database. |
| **F3** | UI rendering, invoice printing, and PDF exports resolve `currency_code` → `currency_symbol` at display time using the country template. |
| **F4** | Where both code and symbol are needed (e.g., formal financial statements), display as `"UGX 1,500,000"` (code) with `"USh 1,500,000"` (symbol) available as an alternative. |
| **F5** | Currencies with zero decimal places (UGX, RWF, XAF) must never display decimal points. `UGX 50000` not `UGX 50,000.00`. |
| **F6** | Thousand separators follow the locale default: comma (`,`) for most African currencies. |

### 6.2 Currency Display Format by Country

| # | Country | Code | Symbol | Dashboard Format | Invoice Format | Statement Format | Notes |
|---|---------|------|--------|-----------------|----------------|------------------|-------|
| 1 | Botswana | BWP | P | P 25,000.00 | BWP 25,000.00 | P 25,000.00 | 2 decimal places |
| 2 | Cameroon | XAF | FCFA | FCFA 500,000 | XAF 500,000 | FCFA 500,000 | 0 decimals (convention) |
| 3 | Eswatini | SZL | E | E 15,000.00 | SZL 15,000.00 | E 15,000.00 | Pegged 1:1 to ZAR |
| 4 | The Gambia | GMD | D | D 25,000.00 | GMD 25,000.00 | D 25,000.00 | |
| 5 | Ghana | GHS | GH₵ | GH₵ 5,000.00 | GHS 5,000.00 | GH₵ 5,000.00 | |
| 6 | Kenya | KES | KSh | KSh 150,000 | KES 150,000.00 | KSh 150,000.00 | |
| 7 | Lesotho | LSL | M | M 12,000.00 | LSL 12,000.00 | M 12,000.00 | Pegged 1:1 to ZAR |
| 8 | Liberia | LRD | L$ | L$ 50,000.00 | LRD 50,000.00 | L$ 50,000.00 | |
| 9 | Malawi | MWK | MK | MK 500,000.00 | MWK 500,000.00 | MK 500,000.00 | |
| 10 | Mauritius | MUR | Rs | Rs 75,000.00 | MUR 75,000.00 | Rs 75,000.00 | |
| 11 | Namibia | NAD | N$ | N$ 25,000.00 | NAD 25,000.00 | N$ 25,000.00 | Pegged 1:1 to ZAR |
| 12 | Nigeria | NGN | ₦ | ₦ 500,000.00 | NGN 500,000.00 | ₦ 500,000.00 | |
| 13 | Rwanda | RWF | FRw | FRw 500,000 | RWF 500,000 | FRw 500,000 | 0 decimal places |
| 14 | Seychelles | SCR | SR | SR 15,000.00 | SCR 15,000.00 | SR 15,000.00 | |
| 15 | Sierra Leone | SLE | Le | Le 5,000.00 | SLE 5,000.00 | Le 5,000.00 | New Leone (2022 redenomination) |
| 16 | South Africa | ZAR | R | R 50,000.00 | ZAR 50,000.00 | R 50,000.00 | |
| 17 | South Sudan | SSP | SS£ | SS£ 100,000.00 | SSP 100,000.00 | SS£ 100,000.00 | High inflation risk |
| 18 | Tanzania | TZS | TSh | TSh 2,500,000 | TZS 2,500,000 | TSh 2,500,000 | Low subunit usage |
| 19 | Uganda | UGX | USh | USh 1,500,000 | UGX 1,500,000 | USh 1,500,000 | 0 decimal places |
| 20 | Zambia | ZMW | K | K 15,000.00 | ZMW 15,000.00 | K 15,000.00 | |
| 21 | Zimbabwe | ZWG | ZiG | ZiG 5,000.00 | ZWG 5,000.00 | ZiG 5,000.00 | New currency (April 2024) |

### 6.3 Currency Formatting Engine Rules

```
formatCurrency(amount, countryTemplate, context):
  1. Determine display context:
     - "dashboard" → use symbol format
     - "invoice"   → use code format (formal)
     - "statement" → use symbol format
     - "pdf_print" → use code format with symbol in parentheses if needed
     - "ledger"    → use code format only
  
  2. Apply decimal rules:
     - If decimal_places == 0 → round to integer, no decimal point
     - If decimal_places == 2 → always show 2 decimal places
  
  3. Apply thousand separator:
     - Insert separator every 3 digits from right
  
  4. Apply symbol/code:
     - If symbol_position == "before" → "{symbol} {amount}" or "{code} {amount}"
     - If symbol_position == "after"  → "{amount} {symbol}" or "{amount} {code}"
  
  5. Return formatted string
```

### 6.4 Multi-Currency Considerations

| Scenario | Rule |
|----------|------|
| **Pegged currencies** (SZL↔ZAR, LSL↔ZAR, NAD↔ZAR) | Store in local currency code. Display peg information in settings. Do not auto-convert. |
| **Dual-currency schools** (e.g., Zimbabwe schools accepting USD) | Support secondary currency field in institution settings. All accounting remains in primary currency. |
| **CFA Franc zone** (Cameroon using XAF) | XAF is shared across 6 Central African countries. Use country code (CM) to disambiguate. |
| **Currency volatility** (SSP, ZWG) | Display exchange rate warning in settings. Recommend frequent fee review. |

---

## 7. Institution Onboarding Behavior

### 7.1 Onboarding Flow

```
Step 1: CREATE INSTITUTION
  └── Enter institution name, contact details, type (day/boarding/mixed)

Step 2: SELECT COUNTRY
  └── Dropdown of 21 supported countries
  └── Display: flag icon + country name + currency code
  └── Example: 🇺🇬 Uganda (UGX)

Step 3: LOAD COUNTRY TEMPLATE (automatic)
  └── System auto-populates:
      ├── Education structure (levels, stage groups, progression)
      ├── Currency (code, symbol, display format)
      ├── Academic calendar (term count, term names, year start month)
      └── Default terminology (student, class, stream, invoice labels)

Step 4: REVIEW EDUCATION STRUCTURE
  └── Display full level table from template
  └── Institution confirms which levels they offer
  └── Example: A primary-only school in Uganda selects P1–P7 only
  └── Deselected levels are hidden from UI but remain in template

Step 5: REVIEW CURRENCY AND TERMS
  └── Confirm currency code and symbol display preference
  └── Confirm or override terminology:
      ├── "Student" vs "Learner" vs "Pupil"
      ├── "Invoice" vs "Fee Note" vs "Billing Statement"
      ├── "Guardian" vs "Parent"
      └── "Class" vs "Grade" vs "Form" vs "Standard"

Step 6: SET ACADEMIC YEAR
  └── System prefills from template:
      ├── Term count (e.g., 3)
      ├── Term names (e.g., "Term 1", "Term 2", "Term 3")
      └── Academic year start month (e.g., February)
  └── Institution can adjust dates

Step 7: CONFIRM AND ACTIVATE
  └── Review summary screen
  └── Confirm activation
  └── Template locked (protected fields cannot change without admin override)
```

### 7.2 Template Application Rules

| Action | Behavior |
|--------|----------|
| **Country selected** | Template loaded in full. All education levels, currency, and terminology populated. |
| **Level deselected by institution** | Level hidden from dropdowns and reports, but retained in template for potential reactivation. |
| **Terminology overridden** | Custom label stored in `institution_overrides` table. Original template label preserved. |
| **Currency changed** | Requires SUPER_ADMIN approval. All existing transactions must be zero or a migration path must be executed. |
| **Country changed** | Requires full data reset or migration. Not supported in self-service mode; requires support ticket. |

### 7.3 Database Impact

At institution creation, the system must:

1. Insert a record into `institutions` with `country_code` reference
2. Copy the country template's education levels into `institution_levels` (active/inactive per institution)
3. Set `institution_currency` from template
4. Copy default terminology into `institution_terminology` (overridable fields)
5. Create default academic year and terms from template calendar defaults

---

## 8. How Country Templates Affect Core ERP Modules

### 8.1 Students Module

| Feature | Template Dependency |
|---------|---------------------|
| **Class dropdown** | Populated from `institution_levels` (filtered by active levels from country template) |
| **Admission form** | "Admitted to" dropdown shows only levels from the institution's activated template subset |
| **Student progression** | Follows `next_level_id` chain from template. P7 → S1 in Uganda; Grade 6 → Grade 7 in Kenya |
| **Promotion wizard** | Uses template progression logic. Prevents skipping levels unless admin override is enabled |
| **Report card header** | Shows class label from template (e.g., "Senior Two" not "S2" in full-name contexts) |
| **Student list filters** | Stage group filter (e.g., "Primary", "O-Level") derived from template stage groups |

**Example:**
- Uganda school: Class picker shows `Baby, Middle, Top, P1, P2, P3, P4, P5, P6, P7, S1, S2, S3, S4, S5, S6`
- Kenya school: Class picker shows `PP1, PP2, Grade 1, Grade 2, ..., Grade 12`
- Ghana school: Class picker shows `KG1, KG2, Primary 1, ..., Primary 6, JHS 1, JHS 2, JHS 3, SHS 1, SHS 2, SHS 3`

### 8.2 Billing / Fees Module

| Feature | Template Dependency |
|---------|---------------------|
| **Fee rule setup** | "Apply to class" dropdown uses template levels. Rule for "P1–P3" in Uganda or "Grade 1–3" in Kenya |
| **Invoice descriptions** | Class label from template appears in invoice line items. "Tuition Fee — Primary Four" |
| **Fee schedule display** | Grouped by stage groups from template. "Primary Fees" / "Secondary Fees" |
| **Currency on invoices** | Resolved from `institution_currency` → template currency formatting rules |
| **Invoice header** | Uses institution's confirmed `invoice_label` (e.g., "School Fees Invoice" or "Fee Note") |
| **Payment receipt** | Uses institution's confirmed `receipt_label` |

**Invoice Example (Uganda):**
```
──────────────────────────────────────────
SCHOOL FEES INVOICE
Maple Academy Uganda Ltd.
──────────────────────────────────────────
Student: John Okello           Class: P4 (Primary Four)
Term: Term 1, 2026             Ref: INV-2026-00142

Description                          Amount (UGX)
─────────────────────────────────────────────────
Tuition Fee — Primary Four           1,500,000
Lunch Fee — Term 1                     350,000
Activity Fee                           100,000
─────────────────────────────────────────────────
Total Due                          UGX 1,950,000
──────────────────────────────────────────
```

**Invoice Example (South Africa):**
```
──────────────────────────────────────────
SCHOOL FEES INVOICE
Maple Academy South Africa (Pty) Ltd.
──────────────────────────────────────────
Learner: Sipho Nkosi             Grade: Grade 10
Term: Term 1, 2026               Ref: INV-2026-00142

Description                         Amount (ZAR)
─────────────────────────────────────────────────
Tuition Fee — Grade 10              R 25,000.00
Stationery Levy                     R  1,500.00
Sport Levy                          R    800.00
─────────────────────────────────────────────────
Total Due                          R 27,300.00
──────────────────────────────────────────
```

### 8.3 Reports Module

| Feature | Template Dependency |
|---------|---------------------|
| **Student distribution by level** | Groups students by stage groups from template |
| **Fee collection by class** | Uses template short codes (P1, Grade 1, Std I) as column headers |
| **Revenue by stage** | Aggregates by template stage groups (Primary, O-Level, A-Level) |
| **Academic year display** | Uses `academic_year_label_style` from template (e.g., "2026" or "2025/2026") |
| **Exam-stage analysis** | Identifies completion exam stages from template (PLE class, KCSE class, etc.) |
| **Class profitability** | Revenue and cost breakdown per template level |
| **Print headers** | Currency symbol and country context from template |

### 8.4 Payroll / School Context

| Feature | Template Dependency |
|---------|---------------------|
| **Payslip currency** | Uses institution's template currency for salary display |
| **Institution address** | Country derived from template for printed documents |
| **Tax compliance labels** | Future: country-specific tax terminology |

### 8.5 Settings Module

| Feature | Template Dependency |
|---------|---------------------|
| **Country selection** | Read-only after onboarding (changeable only by SUPER_ADMIN with migration) |
| **Currency selection** | Displays template default. Override requires SUPER_ADMIN approval |
| **Education template viewer** | Shows full level table. Active/inactive toggle per level |
| **Terminology editor** | Shows all overridable labels with default values from template |
| **Academic calendar** | Term names, count, and year start month from template (editable) |

### 8.6 Printable Documents (Invoices, Receipts, Reports, Statements)

| Element | Template Source |
|---------|----------------|
| **Currency in amounts** | Template `currency_symbol` and formatting rules |
| **Class labels** | Template `short_code` or `long_name` depending on context |
| **School year** | Template `academic_year_label_style` |
| **Terminology** | Institution's confirmed override or template default |
| **Country context** | Template `country_name` for institutional identification |

---

## 9. Country Template Override Rules

### 9.1 Override Classification

| Category | Overridable | Override Level | Approval Required |
|----------|-------------|----------------|-------------------|
| **Institution name** | Yes | Institution | None |
| **Local label alias** (e.g., "P1" displayed as "Year 1") | Yes | Institution | BURSAR or above |
| **Stream names** (e.g., "Red", "Blue", "East Wing") | Yes | Institution | BURSAR or above |
| **Section names** | Yes | Institution | BURSAR or above |
| **Invoice terminology** (label changes) | Yes | Institution | BURSAR or above |
| **Receipt terminology** | Yes | Institution | BURSAR or above |
| **Report card label** | Yes | Institution | BURSAR or above |
| **Optional print labels** | Yes | Institution | BURSAR or above |
| **Term names** (e.g., "Hilary Term" instead of "Term 1") | Yes | Institution | BURSAR or above |
| **Term count** | Yes (2–4) | Institution | DIRECTOR or above |
| **Academic year start month** | Yes | Institution | DIRECTOR or above |
| **Additional school levels** (custom classes) | Yes | Institution | DIRECTOR + reason logged |
| **Progression order** | **No** | Protected | SUPER_ADMIN + migration |
| **Country currency code** | **No** | Protected | SUPER_ADMIN + data migration |
| **Core level sequence** | **No** | Protected | SUPER_ADMIN + migration |
| **Country identity** | **No** | Protected | Support ticket only |
| **Accounting base currency** | **No** | Protected | SUPER_ADMIN + full ledger migration |

### 9.2 Custom Label Aliasing

Schools that use local private naming can map aliases to the official country structure:

```
Official Template Level      Institution Alias
─────────────────────        ─────────────────
P1 (Primary One)       →    "Year 1" or "Class 1"
P7 (Primary Seven)     →    "Year 7"
S1 (Senior One)        →    "Form 1"
```

**Implementation rule:** The alias is stored in `institution_level_overrides` as:

```
{
  level_id: "UG-P1",
  display_alias: "Year 1",
  original_short_code: "P1",
  original_long_name: "Primary One"
}
```

The official template level remains intact for:
- Progression logic (always follows `next_level_id`)
- Inter-school data exchange
- National examination label references
- Analytics and benchmarking

The alias is used for:
- UI display (class dropdowns, student cards)
- Invoices and receipts (if institution prefers)
- Internal reports

### 9.3 Mixed / Non-Standard School Structures

Some private schools may not follow the national structure exactly (e.g., an international school using the British curriculum in Nigeria). For these cases:

| Scenario | Solution |
|----------|----------|
| School uses British Year system | Map Year 1–Year 13 as aliases over the national template levels |
| School skips certain levels | Deactivate unused levels in `institution_levels` |
| School adds transitional classes (e.g., "Pre-Form 1 Bridge") | Add custom level with `is_custom: true`, position it in sequence |
| School has sub-levels (e.g., "P3 Accelerated") | Use stream system, not new levels. Stream = "Accelerated" under P3 |

### 9.4 Override Audit Trail

Every override must be logged in the event sourcing system:

```
{
  event_type: "INSTITUTION_OVERRIDE",
  entity_type: "education_level" | "terminology" | "currency" | "calendar",
  entity_id: "UG-P1",
  field: "display_alias",
  old_value: null,
  new_value: "Year 1",
  changed_by: "user-uuid",
  changed_at: "2026-04-08T10:30:00Z",
  reason: "School uses Year naming convention"
}
```

---

## 10. Phase 1 vs Phase 2 Internationalization Plan

### 10.1 Phase 1: Foundation Templates (High Confidence)

**Target:** First 10 countries with verified education structures and stable currencies.

| Priority | Country | Template ID | Rationale |
|----------|---------|-------------|-----------|
| 1 | Uganda | UG_P_S | Maple ERP origin market. Full structure verified. |
| 2 | Kenya | KE_CBC | Largest East African economy. CBC transition well-documented. |
| 3 | Tanzania | TZ_STANDARD_FORM | Second-largest East African market. Stable Standard/Form system. |
| 4 | Rwanda | RW_P_S | Fast-growing education market. 12YBE well-documented by REB. |
| 5 | South Africa | ZA_GRADE | CAPS curriculum fully standardized. Largest sub-Saharan economy. |
| 6 | Ghana | GH_KG_PRIMARY_JHS_SHS | Strong private school sector. KG/JHS/SHS structure distinctive. |
| 7 | Botswana | BW_STANDARD_FORM | Stable economy. Standard/Form system well-documented. |
| 8 | Namibia | NA_GRADE | Grade-based system aligned to revised curriculum. NAD = ZAR peg. |
| 9 | Zambia | ZM_GRADE | Grade 1–12 system confirmed. Active private school sector. |
| 10 | Mauritius | MU_GRADE | Multi-stage grade system. NYCBE reforms documented. |

**Phase 1 Deliverables:**
- [ ] Country template data model in TypeScript types
- [ ] Country template JSON data file for all 10 countries
- [ ] Template loader service (reads template, applies to institution)
- [ ] Onboarding flow with country selection
- [ ] Level-driven class dropdowns across all modules
- [ ] Currency formatting engine (code + symbol + context-aware display)
- [ ] Settings page with template viewer and override editor
- [ ] Invoice/receipt/report currency-aware rendering

**Phase 1 Scope Rules:**
- All 10 templates must be fully populated and tested
- Each template must pass a "round-trip test": create institution → select country → verify all dropdowns, invoices, reports use correct labels
- Currency display must be verified for all 10 currencies in dashboard, invoice, and PDF contexts

### 10.2 Phase 2: Expansion Templates (Validation Required)

**Target:** Remaining 11 countries. Some require additional ministry/government validation.

| Priority | Country | Template ID | Validation Need |
|----------|---------|-------------|-----------------|
| 11 | Nigeria | NG_PRIMARY_JSS_SSS | Verify Nursery 1–3 labels across states (federal/state variation) |
| 12 | Zimbabwe | ZW_GRADE_FORM | Verify ZWG adoption status and currency stability |
| 13 | Malawi | MW_STANDARD_FORM | Verify Standard 1–8 / Form 1–4 current policy |
| 14 | Cameroon | CM_ANGLOPHONE | Verify Anglophone subsystem labels. Francophone out of scope. |
| 15 | Sierra Leone | SL_CLASS_JSS_SSS | Verify SSS 4-year extension. Verify SLE (new Leone) adoption. |
| 16 | Eswatini | SZ_GRADE_FORM | Verify Grade 0 and Form naming consistency |
| 17 | The Gambia | GM_GRADE | Verify UBE 9-year basic education reform labels |
| 18 | Lesotho | LS_GRADE_FORM | Verify Form A–E labels (uncommon letter-based naming) |
| 19 | Liberia | LR_K12 | Verify K–12 vs semester/term structure at school level |
| 20 | South Sudan | SS_PRIMARY_SENIOR | Political instability. Verify SSP viability. |
| 21 | Seychelles | SC_PRIMARY_SECONDARY | Small market. Verify crèche and post-secondary labels |

**Phase 2 Deliverables:**
- [ ] Template data for all 11 remaining countries
- [ ] Second-pass validation process for each template
- [ ] Ministry/government source documentation for each
- [ ] Integration testing for all 21 countries combined
- [ ] Country-specific onboarding documentation / help text

### 10.3 Implementation Timeline

```
Phase 1 (Weeks 1–6):
  Week 1–2: Data model + template loader + 3 initial templates (UG, KE, TZ)
  Week 3–4: Currency engine + onboarding flow + 4 templates (RW, ZA, GH, BW)
  Week 5:   Module integration (students, billing, reports) + 3 templates (NA, ZM, MU)
  Week 6:   Testing + QA for all 10 Phase 1 templates

Phase 2 (Weeks 7–10):
  Week 7–8: Add 6 templates (NG, ZW, MW, CM, SL, SZ) with validation
  Week 9:   Add 5 templates (GM, LS, LR, SS, SC) with validation
  Week 10:  Integration testing + documentation for all 21
```

---

## 11. Risks and Control Measures

### 11.1 Education Policy Change Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Country reforms education structure (e.g., Kenya 8-4-4 → CBC) | Template becomes outdated; class labels mismatch national policy | Template versioning. New template version created for reformed system. Institutions can migrate to new version. |
| Country adds/removes a level | One level in template mismatches reality | Level activation/deactivation per institution. Template update pushed via system update. |
| Country changes exam labels | Completion exam names wrong in reports | Exam labels overridable at institution level. Template update for next release. |

### 11.2 Currency Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Currency redenomination (e.g., Sierra Leone SLL → SLE) | Stored amounts may refer to old denomination | Currency migration tool. Store denomination version. Alert on redenomination events. |
| Currency collapse / hyperinflation (SSP, ZWG) | Amounts become meaningless; display issues with very large numbers | Support high-precision display (up to 15 digits). Allow secondary currency. |
| Currency abandonment / dollarization | Primary currency code becomes invalid | Support multi-currency per institution. Allow switching primary currency with SUPER_ADMIN migration. |
| Pegged currency de-pegs (SZL, LSL, NAD from ZAR) | No immediate impact on ERP (each currency stored separately) | Information only. No code change needed. |

### 11.3 Data Quality Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Template data incorrect for a country | Schools see wrong class labels or currency format | Confidence classification (Verified / Needs Validation). Validation checklist before production activation. |
| Edge-case school structure not covered | International schools, special-needs institutions | Custom level support with `is_custom` flag. Stream-based sub-levels. |
| Regional variation within a country (Nigeria state-level differences) | Template may not match specific state's naming | Allow institution-level aliases. Document known variations in template notes. |

### 11.4 Operational Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Institution selects wrong country at onboarding | All labels, currency, structure wrong | Confirmation step in onboarding. Country change requires SUPER_ADMIN + support. |
| Override abuse (institution overrides too many labels) | Loss of standardization; reports become inconsistent | Override audit trail. Limit overridable fields. DIRECTOR approval for structural changes. |
| Template update breaks existing institution data | Class references become invalid | Backward-compatible updates only. New levels added with new IDs; existing IDs never changed. |

### 11.5 Risk Priority Matrix

| Risk | Likelihood | Impact | Priority |
|------|------------|--------|----------|
| Education reform mid-deployment | Medium | High | **P1** — Build versioning now |
| Currency instability (SSP, ZWG) | High | Medium | **P1** — Multi-currency support |
| Template data error | Medium | High | **P1** — Validation process |
| Wrong country selection | Low | High | **P2** — Confirmation UX |
| Override abuse | Low | Medium | **P3** — Audit trail |
| Regional variation | Medium | Low | **P3** — Alias system |

---

## Appendix A: Default Terminology by Country

| Country | Student Label | Guardian Label | Class Label | Invoice Label | Receipt Label | Report Card Label | Head Teacher Label |
|---------|--------------|----------------|-------------|---------------|---------------|-------------------|--------------------|
| Botswana | Learner | Parent | Standard / Form | Fee Statement | Receipt | Report Card | Head Teacher |
| Cameroon | Pupil | Parent | Class / Form | School Fees Invoice | Receipt | Report Card | Principal |
| Eswatini | Learner | Parent | Grade / Form | Fee Statement | Receipt | Report Card | Head Teacher |
| The Gambia | Pupil | Parent | Grade | Fee Note | Receipt | Report Card | Head Teacher |
| Ghana | Pupil | Parent | Class | Fee Note | Receipt | Report Card | Head Teacher |
| Kenya | Learner | Parent | Grade | Fee Statement | Receipt | Report Card | Head Teacher |
| Lesotho | Learner | Parent | Grade / Form | Fee Statement | Receipt | Progress Report | Principal |
| Liberia | Student | Parent | Grade | Tuition Invoice | Receipt | Report Card | Principal |
| Malawi | Learner | Guardian | Standard / Form | Fee Statement | Receipt | Report Card | Head Teacher |
| Mauritius | Student | Parent | Grade | Fee Invoice | Receipt | Progress Report | Rector |
| Namibia | Learner | Parent | Grade | Fee Statement | Receipt | Report Card | Principal |
| Nigeria | Pupil | Parent | Class / Form | School Fees Invoice | Receipt | Report Card | Head Teacher |
| Rwanda | Student | Parent | Primary / Senior | Fee Invoice | Receipt | Report Card | Head Teacher |
| Seychelles | Student | Parent | Primary / Secondary | Fee Invoice | Receipt | Progress Report | Head Teacher |
| Sierra Leone | Pupil | Parent | Class | Fee Note | Receipt | Report Card | Principal |
| South Africa | Learner | Parent | Grade | Fee Statement | Receipt | Progress Report | Principal |
| South Sudan | Pupil | Guardian | Primary / Senior | Fee Statement | Receipt | Report Card | Head Teacher |
| Tanzania | Student | Parent | Standard / Form | Fee Invoice | Receipt | Report Card | Head Teacher |
| Uganda | Pupil | Parent | Class | School Fees Invoice | Receipt | Report Card | Head Teacher |
| Zambia | Pupil | Parent | Grade | Fee Statement | Receipt | Progress Report | Head Teacher |
| Zimbabwe | Learner | Guardian | Grade / Form | Fee Statement | Receipt | Report Card | Head Teacher |

---

## Appendix B: Education System Type Classification

| System Type | Description | Countries |
|-------------|-------------|-----------|
| **Grade-based** | All levels use "Grade N" naming | Kenya, Zambia, Namibia, Mauritius, South Africa, Liberia, The Gambia |
| **Standard/Form-based** | Primary uses "Standard", secondary uses "Form" | Botswana, Tanzania, Malawi |
| **P/S-based** | Primary uses "P" prefix, secondary uses "S" prefix | Uganda, Rwanda |
| **Primary/JSS/SSS** | Distinct naming for each secondary tier | Nigeria, Sierra Leone |
| **KG/Primary/JHS/SHS** | Kindergarten + distinct secondary naming | Ghana |
| **Grade/Form-based** | Primary uses "Grade", secondary uses "Form" | Zimbabwe, Eswatini, Lesotho |
| **Class/Form-based** | Primary uses "Class", secondary uses "Form" | Cameroon (Anglophone) |
| **Primary/Senior-based** | Primary numbered, secondary called "Senior" | South Sudan |
| **Primary/Secondary** | Simple two-tier naming | Seychelles |

---

## Appendix C: Database Schema Extensions

The following tables must be added to `schema.sql` to support the country template system:

```sql
-- ============================================================
-- COUNTRY TEMPLATE TABLES
-- ============================================================

-- Country templates (read-only reference data)
CREATE TABLE IF NOT EXISTS country_templates (
  id TEXT PRIMARY KEY,                    -- ISO 3166-1 alpha-2 (e.g., "UG")
  country_name TEXT NOT NULL,
  iso_country_code_3 TEXT NOT NULL,       -- ISO 3166-1 alpha-3 (e.g., "UGA")
  region TEXT NOT NULL,
  subregion TEXT NOT NULL,
  primary_erp_language TEXT NOT NULL DEFAULT 'English',
  currency_code TEXT NOT NULL,            -- ISO 4217 (e.g., "UGX")
  currency_symbol TEXT NOT NULL,          -- Display symbol (e.g., "USh")
  currency_name TEXT NOT NULL,
  currency_subunit_name TEXT,
  symbol_position TEXT NOT NULL DEFAULT 'before',  -- "before" or "after"
  decimal_places INTEGER NOT NULL DEFAULT 2,
  thousand_separator TEXT NOT NULL DEFAULT ',',
  decimal_separator TEXT NOT NULL DEFAULT '.',
  education_system_type TEXT NOT NULL,
  system_structure_code TEXT NOT NULL,    -- e.g., "7-4-2"
  academic_year_start_month INTEGER NOT NULL DEFAULT 1,
  default_term_count INTEGER NOT NULL DEFAULT 3,
  template_version INTEGER NOT NULL DEFAULT 1,
  confidence TEXT NOT NULL DEFAULT 'verified',  -- "verified" or "needs_validation"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Education levels within a country template
CREATE TABLE IF NOT EXISTS country_template_levels (
  id TEXT PRIMARY KEY,                    -- e.g., "UG-P1"
  country_template_id TEXT NOT NULL,
  stage TEXT NOT NULL,                    -- "pre_primary", "primary", "lower_secondary", "upper_secondary"
  stage_group_name TEXT NOT NULL,         -- e.g., "Primary", "O-Level"
  short_code TEXT NOT NULL,              -- e.g., "P1"
  long_name TEXT NOT NULL,               -- e.g., "Primary One"
  sequence INTEGER NOT NULL,
  next_level_id TEXT,
  is_completion_exam_stage BOOLEAN NOT NULL DEFAULT FALSE,
  completion_exam_name TEXT,
  fee_billable BOOLEAN NOT NULL DEFAULT TRUE,
  promotion_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (country_template_id) REFERENCES country_templates(id),
  FOREIGN KEY (next_level_id) REFERENCES country_template_levels(id)
);

-- Default term names per country
CREATE TABLE IF NOT EXISTS country_template_terms (
  id TEXT PRIMARY KEY,
  country_template_id TEXT NOT NULL,
  term_number INTEGER NOT NULL,
  term_name TEXT NOT NULL,               -- e.g., "Term 1"
  FOREIGN KEY (country_template_id) REFERENCES country_templates(id),
  UNIQUE (country_template_id, term_number)
);

-- Default terminology per country
CREATE TABLE IF NOT EXISTS country_template_terminology (
  id TEXT PRIMARY KEY,
  country_template_id TEXT NOT NULL,
  term_key TEXT NOT NULL,                -- e.g., "student_label", "invoice_label"
  term_value TEXT NOT NULL,              -- e.g., "Pupil", "School Fees Invoice"
  FOREIGN KEY (country_template_id) REFERENCES country_templates(id),
  UNIQUE (country_template_id, term_key)
);

-- ============================================================
-- INSTITUTION-LEVEL TEMPLATE APPLICATION
-- ============================================================

-- Institution's active levels (copied from country template at onboarding)
CREATE TABLE IF NOT EXISTS institution_levels (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL,
  country_level_id TEXT NOT NULL,        -- References country_template_levels.id
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_alias TEXT,                    -- Institution's custom label (nullable)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institution_id) REFERENCES institutions(id),
  FOREIGN KEY (country_level_id) REFERENCES country_template_levels(id),
  UNIQUE (institution_id, country_level_id)
);

-- Institution's terminology overrides
CREATE TABLE IF NOT EXISTS institution_terminology_overrides (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL,
  term_key TEXT NOT NULL,
  custom_value TEXT NOT NULL,
  overridden_by TEXT NOT NULL,
  overridden_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (institution_id) REFERENCES institutions(id),
  UNIQUE (institution_id, term_key)
);

-- Institution's currency configuration
CREATE TABLE IF NOT EXISTS institution_currency (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL,
  primary_currency_code TEXT NOT NULL,   -- From country template
  secondary_currency_code TEXT,          -- Optional (e.g., USD for Zimbabwe schools)
  display_preference TEXT NOT NULL DEFAULT 'symbol',  -- "symbol", "code", "both"
  FOREIGN KEY (institution_id) REFERENCES institutions(id),
  UNIQUE (institution_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_country_levels_template ON country_template_levels(country_template_id);
CREATE INDEX IF NOT EXISTS idx_country_levels_stage ON country_template_levels(stage);
CREATE INDEX IF NOT EXISTS idx_country_levels_sequence ON country_template_levels(country_template_id, sequence);
CREATE INDEX IF NOT EXISTS idx_institution_levels_inst ON institution_levels(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_levels_active ON institution_levels(institution_id, is_active);
```

---

## Appendix D: Template Resolution Logic

Every module in Maple ERP must resolve labels and formatting through the template engine, never through hard-coded values.

### Resolution Priority Chain

```
1. institution_terminology_overrides   (if exists → use custom_value)
       ↓ (fallback)
2. country_template_terminology        (if exists → use term_value)
       ↓ (fallback)
3. system_default                      (hardcoded English fallback)
```

### Level Label Resolution

```
1. institution_levels.display_alias    (if set → use alias)
       ↓ (fallback)
2. country_template_levels.short_code  (default display label)
       ↓ (for long-form contexts)
3. country_template_levels.long_name   (full display name)
```

### Currency Resolution

```
1. institution_currency.display_preference  → determines symbol vs code
2. country_templates.currency_symbol        → for symbol display
3. country_templates.currency_code          → for code display (and always for storage)
4. country_templates.decimal_places         → for formatting
5. country_templates.thousand_separator     → for formatting
```

---

*End of International Country Template System Specification*
