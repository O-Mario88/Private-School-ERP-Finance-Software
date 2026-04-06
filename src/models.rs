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
