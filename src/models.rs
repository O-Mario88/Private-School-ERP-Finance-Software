/**
 * Domain Models and Data Structures for Rust Backend
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinancialEvent {
    pub id: String,
    pub event_type: String,
    pub aggregate_id: String,
    pub aggregate_version: i32,
    pub timestamp: i64,
    pub user_id: String,
    pub device_id: Option<String>,
    pub data: HashMap<String, serde_json::Value>,
    pub sync_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JournalEntry {
    pub id: String,
    pub entry_date: String,
    pub reference_number: String,
    pub description: String,
    pub line_items: Vec<JournalLineItem>,
    pub created_by: String,
    pub created_date: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JournalLineItem {
    pub id: String,
    pub account_id: String,
    pub debit_amount: Option<f64>,
    pub credit_amount: Option<f64>,
    pub line_description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StudentInvoice {
    pub id: String,
    pub student_id: String,
    pub family_id: String,
    pub invoice_number: String,
    pub invoice_date: String,
    pub due_date: String,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub balance_amount: f64,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Payment {
    pub id: String,
    pub payment_number: String,
    pub family_id: String,
    pub payment_date: String,
    pub amount: f64,
    pub payment_method: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub role: String,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncPayload {
    pub device_id: String,
    pub last_sync_timestamp: i64,
    pub events: Vec<FinancialEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncResponse {
    pub server_timestamp: i64,
    pub remote_events: Vec<FinancialEvent>,
    pub conflicts: Vec<SyncConflict>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncConflict {
    pub aggregate_id: String,
    pub local_event_version: i32,
    pub remote_event_version: i32,
    pub resolution_required: bool,
}

/// Trial balance row for reporting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrialBalanceRow {
    pub account_code: String,
    pub account_name: String,
    pub account_type: String,
    pub debit_amount: f64,
    pub credit_amount: f64,
}


/// GL posting report row
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GLReportRow {
    pub entry_id: String,
    pub entry_date: String,
    pub account_code: String,
    pub account_name: String,
    pub description: String,
    pub debit_amount: f64,
    pub credit_amount: f64,
}

/// Chart of accounts master data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChartOfAccounts {
    pub id: String,
    pub code: String,
    pub name: String,
    pub account_type: String,
    pub parent_id: Option<String>,
    pub is_active: bool,
}

/// Student statement showing total invoiced and paid amounts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StudentStatement {
    pub student_id: String,
    pub total_invoiced: f64,
    pub total_paid: f64,
    pub balance_due: f64,
    pub last_payment_date: Option<i64>,
    pub statement_generated_date: i64,
}

/// Receipt for payment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Receipt {
    pub id: String,
    pub receipt_number: String,
    pub invoice_id: String,
    pub payment_amount: f64,
    pub payment_date: i64,
    pub payment_method: String,
    pub reference: String,
    pub status: String,
    pub issued_by: String,
    pub issued_date: i64,
}

// ============================================================================
// PHASE 2: SCHOOL CORE MODELS
// ============================================================================

/// Fee rule for a specific class/term combination
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeeRule {
    pub id: String,
    pub class_id: Option<String>,
    pub term: String,
    pub fee_type: String, // "tuition", "activity", etc.
    pub amount: f64,
    pub effective_date: String,
    pub end_date: Option<String>,
    pub active: bool,
    pub created_by: String,
    pub created_at: String,
}

/// Discount applicable to fee rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeeDiscount {
    pub id: String,
    pub fee_rule_id: String,
    pub discount_type: String, // "scholarship", "sibling", "early_bird"
    pub discount_value: f64,
    pub is_percentage: bool,
    pub max_students: Option<i32>,
    pub max_discount_amount: Option<f64>,
    pub active: bool,
}

/// Calculated fee line item for a student
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeeLineItem {
    pub fee_type: String,
    pub description: String,
    pub amount: f64,
    pub discounts: Vec<FeeDiscountApplication>,
    pub final_amount: f64,
}

/// Applied discount to a fee
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeeDiscountApplication {
    pub discount_type: String,
    pub discount_amount: f64,
    pub discount_percentage: Option<f64>,
}

/// Transport route definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransportRoute {
    pub id: String,
    pub route_name: String,
    pub cost_per_month: f64,
    pub pickup_points: Vec<String>,
    pub driver_name: Option<String>,
    pub vehicle_registration: Option<String>,
    pub active: bool,
}

/// Student assignment to transport route
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StudentTransportAssignment {
    pub id: String,
    pub student_id: String,
    pub route_id: String,
    pub term: String,
    pub active: bool,
    pub assigned_date: String,
}

/// Inventory item (textbook, uniform, etc.)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryItem {
    pub id: String,
    pub item_name: String,
    pub item_type: String, // "uniform", "book", "stationery"
    pub unit_cost: f64,
    pub quantity_on_hand: i32,
    pub reorder_level: Option<i32>,
    pub supplier_name: Option<String>,
    pub active: bool,
}

/// Allocation of inventory items to class/term
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryAllocation {
    pub id: String,
    pub inventory_item_id: String,
    pub class_id: Option<String>,
    pub term: String,
    pub quantity: i32,
    pub unit_cost: f64,
}

/// Bursary request from student
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BursaryRequest {
    pub id: String,
    pub student_id: String,
    pub amount_requested: f64,
    pub justification: Option<String>,
    pub request_date: String,
    pub status: String, // "submitted", "approved", "rejected", "disbursed"
}

/// Bursary approval decision
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BursaryApproval {
    pub id: String,
    pub request_id: String,
    pub approver_id: String,
    pub approved_amount: f64,
    pub approval_date: String,
    pub notes: Option<String>,
    pub effective_date: Option<String>,
}

/// Payment plan for installment payments
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentPlan {
    pub id: String,
    pub student_id: String,
    pub invoice_id: Option<String>,
    pub plan_start_date: String,
    pub installment_amount: f64,
    pub num_installments: i32,
    pub status: String, // "active", "completed", "defaulted"
    pub created_by: String,
}

/// Individual installment in a payment plan
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentPlanInstallment {
    pub id: String,
    pub plan_id: String,
    pub installment_number: i32,
    pub due_date: String,
    pub amount: f64,
    pub paid_date: Option<String>,
    pub payment_id: Option<String>,
    pub status: String, // "pending", "paid", "overdue"
}

/// Follow-up activity log for collections
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FollowUpActivity {
    pub id: String,
    pub student_id: String,
    pub staff_id: String,
    pub activity_type: String, // "call", "email", "in_person"
    pub activity_date: String,
    pub notes: Option<String>,
    pub outcome: Option<String>, // "promised_payment", "promised_plan", "no_response"
    pub next_follow_up_date: Option<String>,
}

// ============================================================================
// PHASE 3: ENTERPRISE BACKBONE MODELS
// ============================================================================

/// Employee (staff) record for payroll
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Employee {
    pub id: String,
    pub user_id: Option<String>,
    pub employee_number: String,
    pub first_name: String,
    pub last_name: String,
    pub department: String,
    pub position: String,
    pub hire_date: String,
    pub termination_date: Option<String>,
    pub bank_name: Option<String>,
    pub bank_account_number: Option<String>,
    pub bank_branch: Option<String>,
    pub kra_pin: Option<String>,
    pub nhif_number: Option<String>,
    pub nssf_number: Option<String>,
    pub salary_structure_id: Option<String>,
    pub status: String, // "active", "on_leave", "terminated", "suspended"
}

/// Salary structure defining pay grades
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SalaryStructure {
    pub id: String,
    pub name: String,
    pub grade_level: Option<String>,
    pub basic_salary: f64,
    pub housing_allowance: f64,
    pub transport_allowance: f64,
    pub medical_allowance: f64,
    pub other_allowances: f64,
    pub gross_salary: f64,
    pub effective_date: String,
    pub active: bool,
}

/// Deduction type definition (PAYE, NHIF, NSSF, etc.)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeductionType {
    pub id: String,
    pub name: String,
    pub code: String,
    pub category: String, // "statutory", "voluntary", "loan"
    pub is_percentage: bool,
    pub default_value: f64,
    pub max_amount: Option<f64>,
    pub active: bool,
}

/// Employee-specific deduction assignment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmployeeDeduction {
    pub id: String,
    pub employee_id: String,
    pub deduction_type_id: String,
    pub amount: f64,
    pub is_percentage: bool,
    pub start_date: String,
    pub end_date: Option<String>,
    pub active: bool,
}

/// Payroll run header
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PayrollRun {
    pub id: String,
    pub pay_period: String,
    pub run_date: String,
    pub total_gross: f64,
    pub total_deductions: f64,
    pub total_net: f64,
    pub employee_count: i32,
    pub journal_entry_id: Option<String>,
    pub status: String, // "draft", "calculated", "approved", "posted", "reversed"
    pub created_by: String,
    pub approved_by: Option<String>,
}

/// Individual payroll line item per employee
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PayrollItem {
    pub id: String,
    pub payroll_run_id: String,
    pub employee_id: String,
    pub basic_salary: f64,
    pub total_allowances: f64,
    pub gross_salary: f64,
    pub paye: f64,
    pub nhif: f64,
    pub nssf: f64,
    pub other_deductions: f64,
    pub total_deductions: f64,
    pub net_salary: f64,
}

/// Supplier master data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Supplier {
    pub id: String,
    pub supplier_name: String,
    pub contact_person: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub kra_pin: Option<String>,
    pub payment_terms_days: i32,
    pub credit_limit: Option<f64>,
    pub status: String, // "active", "inactive", "blacklisted"
}

/// Supplier invoice (bill)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupplierInvoice {
    pub id: String,
    pub supplier_id: String,
    pub invoice_number: String,
    pub invoice_date: String,
    pub due_date: String,
    pub total_amount: f64,
    pub paid_amount: f64,
    pub balance_amount: f64,
    pub tax_amount: f64,
    pub status: String, // "draft", "approved", "partially_paid", "paid", "cancelled"
    pub notes: Option<String>,
}

/// Supplier invoice line item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupplierInvoiceItem {
    pub id: String,
    pub supplier_invoice_id: String,
    pub description: String,
    pub gl_account_id: Option<String>,
    pub quantity: f64,
    pub unit_price: f64,
    pub line_amount: f64,
    pub tax_amount: f64,
}

/// AP payment run
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentRunAP {
    pub id: String,
    pub run_date: String,
    pub total_amount: f64,
    pub supplier_count: i32,
    pub bank_account_id: Option<String>,
    pub status: String, // "draft", "approved", "processed", "reversed"
    pub created_by: String,
}

/// Supplier payment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupplierPayment {
    pub id: String,
    pub payment_run_id: Option<String>,
    pub supplier_id: String,
    pub supplier_invoice_id: Option<String>,
    pub amount: f64,
    pub payment_method: String,
    pub reference_number: Option<String>,
    pub payment_date: String,
    pub status: String, // "pending", "processed", "reversed"
}

/// Asset category for depreciation defaults
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetCategory {
    pub id: String,
    pub name: String,
    pub depreciation_method: String, // "straight_line", "reducing_balance"
    pub default_useful_life_months: i32,
    pub default_residual_percentage: f64,
    pub active: bool,
}

/// Fixed asset register entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixedAsset {
    pub id: String,
    pub asset_number: String,
    pub description: String,
    pub category_id: String,
    pub acquisition_date: String,
    pub acquisition_cost: f64,
    pub residual_value: f64,
    pub useful_life_months: i32,
    pub depreciation_method: String,
    pub accumulated_depreciation: f64,
    pub net_book_value: f64,
    pub location: Option<String>,
    pub campus_id: Option<String>,
    pub status: String, // "active", "disposed", "written_off", "fully_depreciated"
}

/// Depreciation schedule entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DepreciationEntry {
    pub id: String,
    pub asset_id: String,
    pub period: String,
    pub depreciation_amount: f64,
    pub accumulated_depreciation: f64,
    pub net_book_value: f64,
    pub journal_entry_id: Option<String>,
    pub posted_date: Option<String>,
}

/// Cash forecast projection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CashForecastEntry {
    pub id: String,
    pub forecast_date: String,
    pub category: String, // "ar_inflow", "ap_outflow", "payroll", "other_inflow", "other_outflow"
    pub description: Option<String>,
    pub projected_amount: f64,
    pub actual_amount: Option<f64>,
    pub variance: Option<f64>,
}

/// Bank transfer between accounts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BankTransfer {
    pub id: String,
    pub from_bank_account_id: String,
    pub to_bank_account_id: String,
    pub amount: f64,
    pub transfer_date: String,
    pub reference_number: Option<String>,
    pub journal_entry_id: Option<String>,
    pub status: String, // "pending", "completed", "reversed"
    pub notes: Option<String>,
}

/// Budget header
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Budget {
    pub id: String,
    pub fiscal_year: String,
    pub name: String,
    pub version: i32,
    pub total_amount: f64,
    pub status: String, // "draft", "submitted", "approved", "active", "closed"
    pub approved_by: Option<String>,
    pub approved_date: Option<String>,
    pub notes: Option<String>,
    pub created_by: String,
}

/// Budget line item per account/period
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetLine {
    pub id: String,
    pub budget_id: String,
    pub gl_account_id: String,
    pub period: String,
    pub budgeted_amount: f64,
    pub revised_amount: Option<f64>,
    pub actual_amount: f64,
    pub variance: f64,
    pub notes: Option<String>,
}

/// Campus for multi-campus support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Campus {
    pub id: String,
    pub campus_name: String,
    pub campus_code: String,
    pub address: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub principal_name: Option<String>,
    pub is_main_campus: bool,
    pub active: bool,
}

/// Policy rule for automated controls
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyRule {
    pub id: String,
    pub rule_name: String,
    pub category: String, // "spending", "approval", "payroll", "budget", "general"
    pub condition_field: String,
    pub condition_operator: String, // ">", "<", ">=", "<=", "=", "!="
    pub condition_value: f64,
    pub action: String, // "require_approval", "block", "warn", "auto_approve"
    pub required_role: Option<String>,
    pub campus_id: Option<String>,
    pub active: bool,
}

