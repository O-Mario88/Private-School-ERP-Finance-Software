/**
 * Business Logic Services
 * Accounting, validation, and event processing
 */

use crate::models;
use serde_json::json;
use uuid::Uuid;

pub struct AccountingService;

impl AccountingService {
    /// Create a journal entry event
    pub fn create_journal_entry(
        user_id: String,
        entry_date: String,
        description: String,
        line_items: Vec<models::JournalLineItem>,
    ) -> Result<models::FinancialEvent, String> {
        // Validate that debits equal credits
        let total_debits: f64 = line_items
            .iter()
            .filter_map(|item| item.debit_amount)
            .sum();
        
        let total_credits: f64 = line_items
            .iter()
            .filter_map(|item| item.credit_amount)
            .sum();

        if (total_debits - total_credits).abs() > 0.01 {
            return Err("Journal entry must balance (debits must equal credits)".to_string());
        }

        let entry_id = Uuid::new_v4().to_string();
        let timestamp = chrono::Utc::now().timestamp_millis();

        let data = json!({
            "entry_id": entry_id,
            "entry_date": entry_date,
            "description": description,
            "line_items": line_items,
            "total_debits": total_debits,
            "total_credits": total_credits,
        });

        Ok(models::FinancialEvent {
            id: Uuid::new_v4().to_string(),
            event_type: "journal_entry".to_string(),
            aggregate_id: entry_id,
            aggregate_version: 1,
            timestamp,
            user_id,
            device_id: None,
            data: serde_json::from_value(data).unwrap(),
            sync_status: "local".to_string(),
        })
    }

    /// Create an invoice event
    pub fn create_invoice(
        user_id: String,
        student_id: String,
        family_id: String,
        invoice_date: String,
        due_date: String,
        total_amount: f64,
    ) -> Result<models::FinancialEvent, String> {
        if total_amount <= 0.0 {
            return Err("Invoice amount must be positive".to_string());
        }

        let invoice_id = Uuid::new_v4().to_string();
        let invoice_number = format!("INV-{}", chrono::Utc::now().timestamp());
        let timestamp = chrono::Utc::now().timestamp_millis();

        let data = json!({
            "invoice_id": invoice_id,
            "invoice_number": invoice_number,
            "student_id": student_id,
            "family_id": family_id,
            "invoice_date": invoice_date,
            "due_date": due_date,
            "total_amount": total_amount,
            "paid_amount": 0.0,
            "balance_amount": total_amount,
            "status": "issued",
        });

        Ok(models::FinancialEvent {
            id: Uuid::new_v4().to_string(),
            event_type: "invoice_created".to_string(),
            aggregate_id: invoice_id,
            aggregate_version: 1,
            timestamp,
            user_id,
            device_id: None,
            data: serde_json::from_value(data).unwrap(),
            sync_status: "local".to_string(),
        })
    }

    /// Create a payment event
    pub fn create_payment(
        user_id: String,
        family_id: String,
        payment_date: String,
        amount: f64,
        payment_method: String,
    ) -> Result<models::FinancialEvent, String> {
        if amount <= 0.0 {
            return Err("Payment amount must be positive".to_string());
        }

        let payment_id = Uuid::new_v4().to_string();
        let payment_number = format!("PAY-{}", chrono::Utc::now().timestamp());
        let timestamp = chrono::Utc::now().timestamp_millis();

        let data = json!({
            "payment_id": payment_id,
            "payment_number": payment_number,
            "family_id": family_id,
            "payment_date": payment_date,
            "amount": amount,
            "payment_method": payment_method,
            "status": "recorded",
        });

        Ok(models::FinancialEvent {
            id: Uuid::new_v4().to_string(),
            event_type: "payment_posted".to_string(),
            aggregate_id: payment_id,
            aggregate_version: 1,
            timestamp,
            user_id,
            device_id: None,
            data: serde_json::from_value(data).unwrap(),
            sync_status: "local".to_string(),
        })
    }
}

pub struct ValidationService;

impl ValidationService {
    /// Validate an email address (basic)
    pub fn validate_email(email: &str) -> Result<(), String> {
        if email.contains('@') && email.contains('.') && email.len() > 5 {
            Ok(())
        } else {
            Err("Invalid email format".to_string())
        }
    }

    /// Validate a currency amount (positive, reasonable scale)
    pub fn validate_amount(amount: f64) -> Result<(), String> {
        if amount.is_nan() || amount.is_infinite() {
            return Err("Invalid amount value".to_string());
        }
        if amount < 0.0 {
            return Err("Amount cannot be negative".to_string());
        }
        // Check if amount has more than 2 decimal places
        if (amount * 100.0).fract() > 0.01 {
            return Err("Amount must have at most 2 decimal places".to_string());
        }
        Ok(())
    }

    /// Validate date format (YYYY-MM-DD)
    pub fn validate_date(date_str: &str) -> Result<(), String> {
        if chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d").is_ok() {
            Ok(())
        } else {
            Err("Invalid date format (use YYYY-MM-DD)".to_string())
        }
    }
}
