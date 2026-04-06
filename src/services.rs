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

pub struct JournalEntryService;

impl JournalEntryService {
    /// Validate and create a complete journal entry with GL posting
    pub fn create_complete_entry(
        user_id: String,
        entry_date: String,
        description: String,
        reference: String,
        period: String,
        lines: Vec<models::JournalLineItem>,
    ) -> Result<models::FinancialEvent, String> {
        // Validate at least 2 lines
        if lines.len() < 2 {
            return Err("Journal entry must have at least 2 lines".to_string());
        }

        // Validate all lines have amounts
        let has_debits = lines.iter().any(|l| l.debit_amount.unwrap_or(0.0) > 0.0);
        let has_credits = lines.iter().any(|l| l.credit_amount.unwrap_or(0.0) > 0.0);

        if !has_debits || !has_credits {
            return Err("Entry must have both debit and credit amounts".to_string());
        }

        // Validate double-entry accounting rule
        let total_debits: f64 = lines
            .iter()
            .filter_map(|item| item.debit_amount)
            .sum();
        
        let total_credits: f64 = lines
            .iter()
            .filter_map(|item| item.credit_amount)
            .sum();

        if (total_debits - total_credits).abs() > 0.01 {
            return Err(format!(
                "Journal entry does not balance. Debits: {:.2}, Credits: {:.2}",
                total_debits, total_credits
            ));
        }

        // Validate date
        ValidationService::validate_date(&entry_date)?;

        // Create the event
        let entry_id = Uuid::new_v4().to_string();
        let timestamp = chrono::Utc::now().timestamp_millis();

        let data = json!({
            "entry_id": entry_id,
            "entry_date": entry_date,
            "description": description,
            "reference": reference,
            "period": period,
            "line_items": lines,
            "total_debits": total_debits,
            "total_credits": total_credits,
            "status": "posted",
            "approvalStatus": "pending",
        });

        Ok(models::FinancialEvent {
            id: Uuid::new_v4().to_string(),
            event_type: "journal_entry_posted".to_string(),
            aggregate_id: entry_id,
            aggregate_version: 1,
            timestamp,
            user_id,
            device_id: None,
            data: serde_json::from_value(data).unwrap(),
            sync_status: "local".to_string(),
        })
    }

    /// Calculate trial balance from journal entries (aggregate GL accounts)
    pub fn calculate_trial_balance(
        journal_entries: Vec<models::FinancialEvent>,
        accounts: Vec<models::ChartOfAccounts>,
    ) -> Result<Vec<models::TrialBalanceRow>, String> {
        use std::collections::HashMap;

        let mut account_balances: HashMap<String, (f64, f64)> = HashMap::new();

        // Initialize all accounts with zero balance
        for account in &accounts {
            account_balances.insert(account.id.clone(), (0.0, 0.0));
        }

        // Aggregate debits and credits from all entries
        for event in journal_entries {
            if let Ok(items) = serde_json::from_value::<Vec<models::JournalLineItem>>(
                event.data.get("line_items").cloned().unwrap_or(json!([])),
            ) {
                for item in items {
                    if let Some((debit, credit)) = account_balances.get_mut(&item.account_id) {
                        *debit += item.debit_amount.unwrap_or(0.0);
                        *credit += item.credit_amount.unwrap_or(0.0);
                    }
                }
            }
        }

        // Build trial balance report
        let mut trial_balance = Vec::new();
        let mut total_debits = 0.0;
        let mut total_credits = 0.0;

        for account in accounts {
            if let Some((debit, credit)) = account_balances.get(&account.id) {
                if debit > &0.0 || credit > &0.0 {
                    total_debits += debit;
                    total_credits += credit;

                    trial_balance.push(models::TrialBalanceRow {
                        account_code: account.code,
                        account_name: account.name,
                        account_type: account.account_type,
                        debit_amount: *debit,
                        credit_amount: *credit,
                    });
                }
            }
        }

        // Verify trial balance still balances
        if (total_debits - total_credits).abs() > 0.01 {
            return Err(format!(
                "Trial balance does not balance: Debits {:.2} vs Credits {:.2}",
                total_debits, total_credits
            ));
        }

        Ok(trial_balance)
    }

    /// Generate GL posting report (all posted entries)
    pub fn generate_gl_report(
        journal_entries: Vec<models::FinancialEvent>,
    ) -> Result<Vec<models::GLReportRow>, String> {
        let mut report = Vec::new();

        for event in journal_entries {
            if let Ok(entry_id) = serde_json::from_value::<String>(
                event.data.get("entry_id").cloned().unwrap_or(json!("")),
            ) {
                if let Ok(entry_date) = serde_json::from_value::<String>(
                    event.data.get("entry_date").cloned().unwrap_or(json!("")),
                ) {
                    if let Ok(description) = serde_json::from_value::<String>(
                        event.data.get("description").cloned().unwrap_or(json!("")),
                    ) {
                        if let Ok(items) = serde_json::from_value::<Vec<models::JournalLineItem>>(
                            event.data.get("line_items").cloned().unwrap_or(json!([])),
                        ) {
                            for item in items {
                                report.push(models::GLReportRow {
                                    entry_id: entry_id.clone(),
                                    entry_date: entry_date.clone(),
                                    account_code: item.account_id.clone(),
                                    account_name: item.account_id.clone(),
                                    description: description.clone(),
                                    debit_amount: item.debit_amount.unwrap_or(0.0),
                                    credit_amount: item.credit_amount.unwrap_or(0.0),
                                });
                            }
                        }
                    }
                }
            }
        }

        Ok(report)
    }
}
