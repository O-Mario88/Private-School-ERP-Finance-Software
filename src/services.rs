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

pub struct InvoiceService;

impl InvoiceService {
    /// Generate invoices for multiple students
    pub fn generate_invoices(
        user_id: String,
        student_ids: Vec<String>,
        family_id: String,
        invoice_date: String,
        due_date: String,
        amount: f64,
        invoice_type: String,
        description: String,
    ) -> Result<Vec<models::FinancialEvent>, String> {
        // Validate inputs
        ValidationService::validate_amount(amount)?;
        ValidationService::validate_date(&invoice_date)?;
        ValidationService::validate_date(&due_date)?;

        if student_ids.is_empty() {
            return Err("At least one student must be selected".to_string());
        }

        if description.trim().is_empty() {
            return Err("Description is required".to_string());
        }

        // Create invoice event for each student
        let mut events = Vec::new();
        let timestamp = chrono::Utc::now().timestamp_millis();

        for student_id in student_ids {
            let invoice_id = Uuid::new_v4().to_string();
            let invoice_number = format!("INV-{}", chrono::Utc::now().timestamp());

            let data = json!({
                "invoice_id": invoice_id,
                "invoice_number": invoice_number,
                "student_id": student_id,
                "family_id": family_id,
                "invoice_date": invoice_date,
                "due_date": due_date,
                "amount": amount,
                "paid_amount": 0.0,
                "balance_amount": amount,
                "invoice_type": invoice_type,
                "description": description,
                "status": "issued",
                "approval_status": "pending",
                "lines": [{
                    "line_description": description,
                    "quantity": 1,
                    "rate": amount,
                    "amount": amount,
                }]
            });

            let event = models::FinancialEvent {
                id: Uuid::new_v4().to_string(),
                event_type: "invoice_created".to_string(),
                aggregate_id: invoice_id,
                aggregate_version: 1,
                timestamp,
                user_id: user_id.clone(),
                device_id: None,
                data: serde_json::from_value(data).unwrap(),
                sync_status: "local".to_string(),
            };

            events.push(event);
        }

        Ok(events)
    }

    /// Post payment against an invoice
    pub fn post_payment(
        user_id: String,
        invoice_id: String,
        payment_amount: f64,
        payment_date: String,
        payment_method: String,
        reference: String,
    ) -> Result<models::FinancialEvent, String> {
        // Validate inputs
        ValidationService::validate_amount(payment_amount)?;
        ValidationService::validate_date(&payment_date)?;

        if payment_method.trim().is_empty() {
            return Err("Payment method is required".to_string());
        }

        let payment_id = Uuid::new_v4().to_string();
        let timestamp = chrono::Utc::now().timestamp_millis();

        let data = json!({
            "payment_id": payment_id,
            "invoice_id": invoice_id,
            "payment_amount": payment_amount,
            "payment_date": payment_date,
            "payment_method": payment_method,
            "reference": reference,
            "status": "posted",
            "posted_date": chrono::Utc::now().to_rfc3339(),
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

    /// Generate student statement (list of invoices and payments)
    pub fn generate_student_statement(
        student_id: String,
        invoices: Vec<models::FinancialEvent>,
        payments: Vec<models::FinancialEvent>,
    ) -> Result<models::StudentStatement, String> {
        // Aggregate student invoices and payments
        let mut total_invoiced = 0.0;
        let mut total_paid = 0.0;

        for event in invoices {
            if let Ok(amount) = serde_json::from_value::<f64>(
                event.data.get("amount").cloned().unwrap_or(json!(0.0))
            ) {
                total_invoiced += amount;
            }
        }

        for event in payments {
            if let Ok(amount) = serde_json::from_value::<f64>(
                event.data.get("payment_amount").cloned().unwrap_or(json!(0.0))
            ) {
                total_paid += amount;
            }
        }

        Ok(models::StudentStatement {
            student_id,
            total_invoiced,
            total_paid,
            balance_due: total_invoiced - total_paid,
            last_payment_date: None,
            statement_generated_date: chrono::Utc::now().timestamp_millis(),
        })
    }
}

// ============================================================================
// PHASE 2: SCHOOL CORE SERVICES
// ============================================================================

pub struct FeeCalculationService;

impl FeeCalculationService {
    /// Calculate fees for a student based on active fee rules
    pub fn calculate_student_fees(
        student_id: String,
        class_id: String,
        term: String,
        fee_rules: Vec<models::FeeRule>,
        discounts: Vec<models::FeeDiscount>,
    ) -> Result<Vec<models::FeeLineItem>, String> {
        // Filter applicable fee rules for this student's class and term
        let applicable_rules: Vec<models::FeeRule> = fee_rules
            .into_iter()
            .filter(|rule| {
                rule.active
                    && rule.term == term
                    && (rule.class_id.is_none() || rule.class_id.as_ref() == Some(&class_id))
            })
            .collect();

        if applicable_rules.is_empty() {
            return Err(format!(
                "No active fee rules found for class {} in term {}",
                class_id, term
            ));
        }

        // Convert rules to fee line items
        let mut fee_items: Vec<models::FeeLineItem> = applicable_rules
            .iter()
            .map(|rule| models::FeeLineItem {
                fee_type: rule.fee_type.clone(),
                description: format!("{} - {}", rule.fee_type, term),
                amount: rule.amount,
                discounts: vec![],
                final_amount: rule.amount,
            })
            .collect();

        // Apply discounts to fee items
        for item in &mut fee_items {
            let applicable_discounts: Vec<&models::FeeDiscount> = discounts
                .iter()
                .filter(|d| d.active && d.fee_rule_id.contains(&item.fee_type))
                .collect();

            for discount in applicable_discounts {
                let discount_amount = if discount.is_percentage {
                    item.amount * (discount.discount_value / 100.0)
                } else {
                    discount.discount_value
                };

                let capped_discount = if let Some(max) = discount.max_discount_amount {
                    discount_amount.min(max)
                } else {
                    discount_amount
                };

                item.discounts.push(models::FeeDiscountApplication {
                    discount_type: discount.discount_type.clone(),
                    discount_amount: capped_discount,
                    discount_percentage: if discount.is_percentage {
                        Some(discount.discount_value)
                    } else {
                        None
                    },
                });
            }

            // Calculate final amount after all discounts
            let total_discount: f64 = item.discounts.iter().map(|d| d.discount_amount).sum();
            item.final_amount = (item.amount - total_discount).max(0.0);
        }

        Ok(fee_items)
    }

    /// Validate fee calculation constraints
    pub fn validate_fee_calculation(fee_items: &[models::FeeLineItem]) -> Result<(), String> {
        // Ensure no negative amounts
        for item in fee_items {
            if item.final_amount < 0.0 {
                return Err(format!(
                    "Final amount for {} cannot be negative",
                    item.fee_type
                ));
            }

            // Ensure discounts don't exceed fee amount
            let total_discount: f64 = item.discounts.iter().map(|d| d.discount_amount).sum();
            if total_discount > item.amount {
                return Err(format!(
                    "Total discounts ({:.2}) exceed fee amount ({:.2}) for {}",
                    total_discount, item.amount, item.fee_type
                ));
            }
        }

        Ok(())
    }

    /// Calculate total fees for a student invoice
    pub fn calculate_total_fees(fee_items: &[models::FeeLineItem]) -> f64 {
        fee_items.iter().map(|item| item.final_amount).sum()
    }

    /// Create a fee calculation event
    pub fn create_fee_calculation_event(
        user_id: String,
        student_id: String,
        class_id: String,
        term: String,
        fee_items: Vec<models::FeeLineItem>,
    ) -> Result<models::FinancialEvent, String> {
        let timestamp = chrono::Utc::now().timestamp_millis();
        let total = Self::calculate_total_fees(&fee_items);

        let data = json!({
            "student_id": student_id,
            "class_id": class_id,
            "term": term,
            "fee_items": fee_items,
            "total_amount": total,
            "calculated_at": chrono::Utc::now().to_rfc3339(),
        });

        Ok(models::FinancialEvent {
            id: Uuid::new_v4().to_string(),
            event_type: "fee_calculated".to_string(),
            aggregate_id: student_id,
            aggregate_version: 1,
            timestamp,
            user_id,
            device_id: None,
            data: serde_json::from_value(data).unwrap(),
            sync_status: "local".to_string(),
        })
    }
}

pub struct TransportBillingService;

impl TransportBillingService {
    /// Calculate transport billing for a student in a term
    pub fn calculate_transport_charges(
        student_id: String,
        route: &models::TransportRoute,
        term: String,
        num_months: i32,
    ) -> Result<f64, String> {
        if num_months <= 0 {
            return Err("Number of months must be positive".to_string());
        }

        let total_charge = route.cost_per_month * (num_months as f64);
        Ok(total_charge)
    }

    /// Create transport billing event
    pub fn create_transport_billing_event(
        user_id: String,
        student_id: String,
        route_id: String,
        amount: f64,
        term: String,
    ) -> Result<models::FinancialEvent, String> {
        if amount <= 0.0 {
            return Err("Transport charge must be positive".to_string());
        }

        let timestamp = chrono::Utc::now().timestamp_millis();

        let data = json!({
            "student_id": student_id,
            "route_id": route_id,
            "term": term,
            "amount": amount,
            "created_at": chrono::Utc::now().to_rfc3339(),
        });

        Ok(models::FinancialEvent {
            id: Uuid::new_v4().to_string(),
            event_type: "transport_billed".to_string(),
            aggregate_id: student_id,
            aggregate_version: 1,
            timestamp,
            user_id,
            device_id: None,
            data: serde_json::from_value(data).unwrap(),
            sync_status: "local".to_string(),
        })
    }
}

pub struct PaymentPlanService;

impl PaymentPlanService {
    /// Create a payment plan for a student invoice
    pub fn create_payment_plan(
        student_id: String,
        invoice_id: String,
        outstanding_amount: f64,
        num_installments: i32,
    ) -> Result<models::PaymentPlan, String> {
        if outstanding_amount < 0.0 {
            return Err("Outstanding amount cannot be negative".to_string());
        }

        if num_installments <= 0 {
            return Err("Number of installments must be positive".to_string());
        }

        let plan_id = Uuid::new_v4().to_string();
        let installment_amount = outstanding_amount / (num_installments as f64);

        Ok(models::PaymentPlan {
            id: plan_id,
            student_id,
            invoice_id: Some(invoice_id),
            plan_start_date: chrono::Local::now().format("%Y-%m-%d").to_string(),
            installment_amount,
            num_installments,
            status: "active".to_string(),
            created_by: "system".to_string(),
        })
    }

    /// Generate installment schedule
    pub fn generate_installment_schedule(
        plan: &models::PaymentPlan,
        start_date: String,
    ) -> Result<Vec<models::PaymentPlanInstallment>, String> {
        let mut installments = Vec::new();
        let base_date = chrono::NaiveDate::parse_from_str(&start_date, "%Y-%m-%d")
            .map_err(|_| "Invalid date format".to_string())?;

        for i in 1..=plan.num_installments {
            let due_date = base_date + chrono::Duration::days(30 * (i as i64));

            installments.push(models::PaymentPlanInstallment {
                id: Uuid::new_v4().to_string(),
                plan_id: plan.id.clone(),
                installment_number: i,
                due_date: due_date.format("%Y-%m-%d").to_string(),
                amount: plan.installment_amount,
                paid_date: None,
                payment_id: None,
                status: "pending".to_string(),
            });
        }

        Ok(installments)
    }
}

// ============================================================================
// PHASE 3: ENTERPRISE BACKBONE SERVICES
// ============================================================================

/// Payroll calculation and processing service
pub struct PayrollService;

impl PayrollService {
    /// Calculate payroll for all active employees in a given period
    pub fn calculate_payroll(
        employees: &[models::Employee],
        salary_structures: &[models::SalaryStructure],
        deductions: &[models::EmployeeDeduction],
        deduction_types: &[models::DeductionType],
        run_id: &str,
    ) -> Result<Vec<models::PayrollItem>, String> {
        let mut items = Vec::new();

        for emp in employees.iter().filter(|e| e.status == "active") {
            let structure = salary_structures.iter()
                .find(|s| Some(&s.id) == emp.salary_structure_id.as_ref())
                .ok_or_else(|| format!("No salary structure for employee {}", emp.id))?;

            let total_allowances = structure.housing_allowance
                + structure.transport_allowance
                + structure.medical_allowance
                + structure.other_allowances;

            let gross = structure.gross_salary;

            // Calculate statutory deductions
            let paye = Self::calculate_paye(gross);
            let nhif = Self::calculate_nhif(gross);
            let nssf = Self::calculate_nssf(gross);

            // Calculate employee-specific deductions
            let emp_deductions: f64 = deductions.iter()
                .filter(|d| d.employee_id == emp.id && d.active)
                .map(|d| {
                    if d.is_percentage {
                        gross * (d.amount / 100.0)
                    } else {
                        d.amount
                    }
                })
                .sum();

            let total_deductions = paye + nhif + nssf + emp_deductions;
            let net = gross - total_deductions;

            items.push(models::PayrollItem {
                id: Uuid::new_v4().to_string(),
                payroll_run_id: run_id.to_string(),
                employee_id: emp.id.clone(),
                basic_salary: structure.basic_salary,
                total_allowances,
                gross_salary: gross,
                paye,
                nhif,
                nssf,
                other_deductions: emp_deductions,
                total_deductions,
                net_salary: net,
            });
        }

        Ok(items)
    }

    /// Kenya PAYE calculation (simplified 2026 brackets)
    fn calculate_paye(gross_monthly: f64) -> f64 {
        let taxable = gross_monthly;
        if taxable <= 24000.0 {
            taxable * 0.10
        } else if taxable <= 32333.0 {
            2400.0 + (taxable - 24000.0) * 0.25
        } else if taxable <= 500000.0 {
            2400.0 + 2083.25 + (taxable - 32333.0) * 0.30
        } else if taxable <= 800000.0 {
            2400.0 + 2083.25 + 140300.1 + (taxable - 500000.0) * 0.325
        } else {
            2400.0 + 2083.25 + 140300.1 + 97500.0 + (taxable - 800000.0) * 0.35
        }
    }

    /// Kenya NHIF calculation (simplified brackets)
    fn calculate_nhif(gross_monthly: f64) -> f64 {
        match gross_monthly as i64 {
            0..=5999 => 150.0,
            6000..=7999 => 300.0,
            8000..=11999 => 400.0,
            12000..=14999 => 500.0,
            15000..=19999 => 600.0,
            20000..=24999 => 750.0,
            25000..=29999 => 850.0,
            30000..=34999 => 900.0,
            35000..=39999 => 950.0,
            40000..=44999 => 1000.0,
            45000..=49999 => 1100.0,
            50000..=59999 => 1200.0,
            60000..=69999 => 1300.0,
            70000..=79999 => 1400.0,
            80000..=89999 => 1500.0,
            90000..=99999 => 1600.0,
            _ => 1700.0,
        }
    }

    /// Kenya NSSF calculation (Tier I + Tier II)
    fn calculate_nssf(gross_monthly: f64) -> f64 {
        let tier1 = gross_monthly.min(7000.0) * 0.06;
        let tier2 = if gross_monthly > 7000.0 {
            (gross_monthly.min(36000.0) - 7000.0) * 0.06
        } else {
            0.0
        };
        tier1 + tier2
    }
}

/// Accounts Payable service
pub struct APService;

impl APService {
    /// Validate supplier invoice totals
    pub fn validate_supplier_invoice(
        invoice: &models::SupplierInvoice,
        items: &[models::SupplierInvoiceItem],
    ) -> Result<(), String> {
        let calculated_total: f64 = items.iter().map(|i| i.line_amount + i.tax_amount).sum();
        let diff = (calculated_total - invoice.total_amount).abs();
        if diff > 0.01 {
            return Err(format!(
                "Invoice total {} does not match line items total {}",
                invoice.total_amount, calculated_total
            ));
        }
        if invoice.due_date < invoice.invoice_date {
            return Err("Due date cannot be before invoice date".to_string());
        }
        Ok(())
    }

    /// Calculate AP aging buckets for a list of supplier invoices
    pub fn calculate_ap_aging(
        invoices: &[models::SupplierInvoice],
        as_of_date: &str,
    ) -> Result<(f64, f64, f64, f64, f64), String> {
        let reference = chrono::NaiveDate::parse_from_str(as_of_date, "%Y-%m-%d")
            .map_err(|_| "Invalid date".to_string())?;

        let mut current = 0.0f64;
        let mut thirty = 0.0f64;
        let mut sixty = 0.0f64;
        let mut ninety = 0.0f64;
        let mut over90 = 0.0f64;

        for inv in invoices.iter().filter(|i| i.balance_amount > 0.0) {
            let due = chrono::NaiveDate::parse_from_str(&inv.due_date, "%Y-%m-%d")
                .map_err(|_| "Invalid due date".to_string())?;
            let days_past = (reference - due).num_days();

            if days_past <= 0 {
                current += inv.balance_amount;
            } else if days_past <= 30 {
                thirty += inv.balance_amount;
            } else if days_past <= 60 {
                sixty += inv.balance_amount;
            } else if days_past <= 90 {
                ninety += inv.balance_amount;
            } else {
                over90 += inv.balance_amount;
            }
        }

        Ok((current, thirty, sixty, ninety, over90))
    }
}

/// Fixed assets and depreciation service
pub struct AssetService;

impl AssetService {
    /// Calculate monthly depreciation for a fixed asset (straight-line)
    pub fn calculate_straight_line_depreciation(
        cost: f64,
        residual_value: f64,
        useful_life_months: i32,
    ) -> f64 {
        if useful_life_months <= 0 {
            return 0.0;
        }
        (cost - residual_value) / useful_life_months as f64
    }

    /// Calculate monthly depreciation for a fixed asset (reducing balance)
    pub fn calculate_reducing_balance_depreciation(
        net_book_value: f64,
        residual_value: f64,
        remaining_months: i32,
    ) -> f64 {
        if remaining_months <= 0 || net_book_value <= residual_value {
            return 0.0;
        }
        let annual_rate = 2.0 / (remaining_months as f64 / 12.0);
        let monthly = net_book_value * (annual_rate / 12.0);
        // Don't depreciate below residual
        monthly.min(net_book_value - residual_value)
    }

    /// Calculate gain/loss on disposal
    pub fn calculate_disposal_gain_loss(
        net_book_value: f64,
        disposal_proceeds: f64,
    ) -> f64 {
        disposal_proceeds - net_book_value
    }
}

/// Treasury and cash management service
pub struct TreasuryService;

impl TreasuryService {
    /// Generate cash forecast from AR, AP, and payroll data
    pub fn generate_forecast(
        ar_outstanding: f64,
        ap_outstanding: f64,
        monthly_payroll: f64,
        current_balance: f64,
        months: i32,
    ) -> Vec<models::CashForecastEntry> {
        let mut entries = Vec::new();
        let today = chrono::Local::now().naive_local().date();

        for i in 1..=months {
            let forecast_date = today + chrono::Duration::days(30 * i as i64);
            let month_label = forecast_date.format("%Y-%m-%d").to_string();

            // Projected AR collection (assume X% collected per month)
            let ar_inflow = ar_outstanding * 0.15; // 15% of outstanding per month
            entries.push(models::CashForecastEntry {
                id: Uuid::new_v4().to_string(),
                forecast_date: month_label.clone(),
                category: "ar_inflow".to_string(),
                description: Some(format!("Projected fee collections month {}", i)),
                projected_amount: ar_inflow,
                actual_amount: None,
                variance: None,
            });

            // Projected AP outflow
            let ap_outflow = ap_outstanding * 0.20; // 20% paid per month
            entries.push(models::CashForecastEntry {
                id: Uuid::new_v4().to_string(),
                forecast_date: month_label.clone(),
                category: "ap_outflow".to_string(),
                description: Some(format!("Projected AP payments month {}", i)),
                projected_amount: ap_outflow,
                actual_amount: None,
                variance: None,
            });

            // Payroll outflow
            entries.push(models::CashForecastEntry {
                id: Uuid::new_v4().to_string(),
                forecast_date: month_label,
                category: "payroll".to_string(),
                description: Some(format!("Payroll month {}", i)),
                projected_amount: monthly_payroll,
                actual_amount: None,
                variance: None,
            });
        }

        entries
    }
}

/// Budget control and variance service
pub struct BudgetService;

impl BudgetService {
    /// Check if spending is within budget
    pub fn check_budget_availability(
        budget_lines: &[models::BudgetLine],
        gl_account_id: &str,
        period: &str,
        amount: f64,
    ) -> Result<bool, String> {
        let line = budget_lines.iter()
            .find(|l| l.gl_account_id == gl_account_id && l.period == period)
            .ok_or_else(|| format!("No budget line for account {} period {}", gl_account_id, period))?;

        let effective_budget = line.revised_amount.unwrap_or(line.budgeted_amount);
        let remaining = effective_budget - line.actual_amount;
        Ok(amount <= remaining)
    }

    /// Calculate variance for a budget line
    pub fn calculate_variance(budgeted: f64, actual: f64) -> (f64, f64) {
        let variance = budgeted - actual;
        let variance_pct = if budgeted > 0.0 {
            (variance / budgeted) * 100.0
        } else {
            0.0
        };
        (variance, variance_pct)
    }
}

