/**
 * MAPLE SCHOOL FINANCE ERP
 * i18n Translation Types
 *
 * Type-safe translation key definitions.
 * All translation keys are defined here as a nested structure.
 * Each language pack must conform to this shape.
 */

// ---------------------------------------------------------------------------
// Translation shape — every locale file must satisfy this interface
// ---------------------------------------------------------------------------

export interface TranslationSchema {
  app: {
    name: string;
    tagline: string;
    version: string;
    copyright: string;
  };

  sidebar: {
    dashboard: string;
    students: string;
    billing: string;
    invoices: string;
    payments: string;
    receipts: string;
    collections: string;
    accounting: string;
    budget: string;
    payroll: string;
    inventory: string;
    transport: string;
    reports: string;
    settings: string;
    school: string;
    assets: string;
    treasury: string;
    scholarships: string;
    audit: string;
    bank_recon: string;
    ap: string;
  };

  topbar: {
    search_placeholder: string;
    notifications: string;
    profile: string;
    logout: string;
    help: string;
    switch_campus: string;
  };

  common: {
    buttons: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      create: string;
      submit: string;
      approve: string;
      reject: string;
      close: string;
      back: string;
      next: string;
      previous: string;
      print: string;
      export: string;
      import: string;
      download: string;
      upload: string;
      refresh: string;
      add: string;
      remove: string;
      search: string;
      filter: string;
      clear: string;
      apply: string;
      reset: string;
      confirm: string;
      view: string;
      details: string;
      generate: string;
      run: string;
      duplicate: string;
      archive: string;
      restore: string;
      send: string;
      select_all: string;
      deselect_all: string;
      expand: string;
      collapse: string;
    };
    status: {
      active: string;
      inactive: string;
      draft: string;
      approved: string;
      pending: string;
      cancelled: string;
      completed: string;
      overdue: string;
      paid: string;
      unpaid: string;
      partially_paid: string;
      synced: string;
      local: string;
      conflict: string;
      processing: string;
      failed: string;
      archived: string;
      issued: string;
      written_off: string;
    };
    labels: {
      date: string;
      amount: string;
      total: string;
      subtotal: string;
      description: string;
      notes: string;
      reference: string;
      status: string;
      type: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      id: string;
      code: string;
      category: string;
      quantity: string;
      unit: string;
      unit_cost: string;
      from: string;
      to: string;
      start_date: string;
      end_date: string;
      created_at: string;
      updated_at: string;
      created_by: string;
      attachment: string;
      actions: string;
      yes: string;
      no: string;
      all: string;
      none: string;
      or: string;
      and: string;
      of: string;
      showing: string;
      results: string;
      currency: string;
      percentage: string;
      balance: string;
    };
    pagination: {
      next: string;
      previous: string;
      page: string;
      of: string;
      showing: string;
      entries: string;
      first: string;
      last: string;
      per_page: string;
    };
    validation: {
      required: string;
      invalid_email: string;
      min_length: string;
      max_length: string;
      invalid_phone: string;
      invalid_date: string;
      invalid_amount: string;
      must_be_positive: string;
      already_exists: string;
      not_found: string;
      date_must_be_future: string;
      date_must_be_past: string;
      passwords_must_match: string;
      invalid_format: string;
      field_too_long: string;
      field_too_short: string;
      select_at_least_one: string;
    };
    confirm: {
      delete_title: string;
      delete_message: string;
      archive_title: string;
      archive_message: string;
      cancel_title: string;
      cancel_message: string;
      approve_title: string;
      approve_message: string;
      reject_title: string;
      reject_message: string;
      unsaved_changes: string;
      logout_confirm: string;
    };
    empty: {
      no_data: string;
      no_results: string;
      no_items: string;
      no_records: string;
      get_started: string;
    };
    errors: {
      generic: string;
      network: string;
      unauthorized: string;
      forbidden: string;
      not_found: string;
      server_error: string;
      timeout: string;
      save_failed: string;
      load_failed: string;
      delete_failed: string;
    };
  };

  auth: {
    login: string;
    logout: string;
    email: string;
    password: string;
    forgot_password: string;
    reset_password: string;
    remember_me: string;
    sign_in: string;
    signing_in: string;
    welcome_back: string;
    enter_credentials: string;
    invalid_credentials: string;
    session_expired: string;
    account_locked: string;
    offline_login: string;
  };

  dashboard: {
    title: string;
    welcome: string;
    total_revenue: string;
    total_collections: string;
    outstanding_fees: string;
    total_students: string;
    collection_rate: string;
    budget_utilization: string;
    recent_transactions: string;
    upcoming_payments: string;
    overdue_accounts: string;
    quick_actions: string;
    revenue_trend: string;
    this_term: string;
    this_month: string;
    this_week: string;
    today: string;
    vs_last_term: string;
    vs_last_month: string;
    fee_collection_summary: string;
    top_defaulters: string;
    payment_methods_breakdown: string;
    campus_comparison: string;
  };

  students: {
    title: string;
    add_student: string;
    edit_student: string;
    student_list: string;
    student_details: string;
    total_students: string;
    active_students: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    date_of_birth: string;
    gender: string;
    admission_number: string;
    admission_date: string;
    class: string;
    stream: string;
    campus: string;
    guardian_name: string;
    guardian_phone: string;
    guardian_email: string;
    guardian_relationship: string;
    address: string;
    status: string;
    enrolled: string;
    transferred: string;
    graduated: string;
    suspended: string;
    withdrawn: string;
    fee_balance: string;
    import_students: string;
    export_students: string;
    search_students: string;
    male: string;
    female: string;
    form: {
      first_name: string;
      last_name: string;
      first_name_placeholder: string;
      last_name_placeholder: string;
      admission_number_placeholder: string;
      select_class: string;
      select_stream: string;
      select_campus: string;
      guardian_section: string;
      academic_section: string;
    };
    validation: {
      first_name_required: string;
      last_name_required: string;
      admission_number_required: string;
      class_required: string;
      guardian_name_required: string;
      guardian_phone_required: string;
    };
  };

  billing: {
    title: string;
    create_invoice: string;
    fee_schedule: string;
    fee_structures: string;
    fee_items: string;
    billing_period: string;
    generate_invoices: string;
    bulk_billing: string;
    apply_discount: string;
    apply_waiver: string;
    fee_rules: string;
    fee_type: string;
    tuition: string;
    boarding: string;
    transport_fee: string;
    activity_fee: string;
    exam_fee: string;
    uniform_fee: string;
    lunch_fee: string;
    pta_levy: string;
    development_levy: string;
    total_fees: string;
    amount_billed: string;
    amount_paid: string;
    balance_due: string;
    fee_waivers: string;
    discounts: string;
    credit_notes: string;
    debit_notes: string;
  };

  invoices: {
    title: string;
    invoice_number: string;
    date_issued: string;
    due_date: string;
    bill_to: string;
    item_description: string;
    line_total: string;
    subtotal: string;
    total: string;
    notes: string;
    terms: string;
    payment_instructions: string;
    invoice_status: string;
    create_invoice: string;
    view_invoice: string;
    void_invoice: string;
    send_invoice: string;
    mark_as_paid: string;
    overdue_days: string;
  };

  payments: {
    title: string;
    record_payment: string;
    payment_method: string;
    payment_date: string;
    amount_received: string;
    reference_number: string;
    received_from: string;
    allocated_to: string;
    unallocated: string;
    cash: string;
    cheque: string;
    bank_transfer: string;
    mobile_money: string;
    card: string;
    payment_history: string;
    recent_payments: string;
    total_collected: string;
    pending_allocation: string;
  };

  receipts: {
    title: string;
    receipt_number: string;
    receipt_date: string;
    received_from: string;
    amount_received: string;
    payment_for: string;
    payment_method: string;
    received_with_thanks: string;
    print_receipt: string;
    email_receipt: string;
    duplicate: string;
    original: string;
    balance_remaining: string;
  };

  collections: {
    title: string;
    aging_buckets: string;
    current: string;
    days_30: string;
    days_60: string;
    days_90: string;
    days_over_90: string;
    follow_up: string;
    follow_up_history: string;
    schedule_follow_up: string;
    contact_type: string;
    phone_call: string;
    sms: string;
    email_reminder: string;
    letter: string;
    home_visit: string;
    reminder_sent: string;
    promise_to_pay: string;
    payment_plan: string;
    create_payment_plan: string;
    installments: string;
    collection_rate: string;
    total_outstanding: string;
    total_overdue: string;
    defaulters_list: string;
  };

  accounting: {
    title: string;
    journal_entry: string;
    create_journal_entry: string;
    general_ledger: string;
    trial_balance: string;
    chart_of_accounts: string;
    account_name: string;
    account_number: string;
    account_type: string;
    debit: string;
    credit: string;
    balance: string;
    opening_balance: string;
    closing_balance: string;
    posting_date: string;
    narration: string;
    fiscal_year: string;
    period: string;
    close_period: string;
    reopen_period: string;
    income_statement: string;
    balance_sheet: string;
    cash_flow: string;
    revenue: string;
    expenses: string;
    assets: string;
    liabilities: string;
    equity: string;
    net_income: string;
    retained_earnings: string;
  };

  budget: {
    title: string;
    create_budget: string;
    budget_name: string;
    fiscal_year: string;
    category: string;
    item_group: string;
    budget_item: string;
    allocated: string;
    spent: string;
    remaining: string;
    utilization: string;
    variance: string;
    budget_vs_actual: string;
    approval_status: string;
    submit_for_approval: string;
    approved_budget: string;
    over_budget: string;
    under_budget: string;
    on_track: string;
    warning: string;
    critical: string;
    transfer_funds: string;
    revision_history: string;
    annual_budget: string;
    quarterly_budget: string;
    monthly_budget: string;
  };

  payroll: {
    title: string;
    run_payroll: string;
    employee: string;
    employees: string;
    add_employee: string;
    edit_employee: string;
    employee_id: string;
    department: string;
    designation: string;
    gross_salary: string;
    net_salary: string;
    basic_salary: string;
    allowances: string;
    deductions: string;
    housing_allowance: string;
    transport_allowance: string;
    medical_allowance: string;
    tax: string;
    pension: string;
    social_security: string;
    payslip: string;
    view_payslip: string;
    print_payslip: string;
    payroll_period: string;
    payroll_status: string;
    process_payroll: string;
    finalize_payroll: string;
    total_payroll: string;
    payment_schedule: string;
  };

  inventory: {
    title: string;
    stock_item: string;
    add_item: string;
    edit_item: string;
    item_name: string;
    item_code: string;
    category: string;
    quantity_in_stock: string;
    reorder_level: string;
    unit_of_measure: string;
    unit_cost: string;
    total_value: string;
    stock_in: string;
    stock_out: string;
    adjust_stock: string;
    stock_movement: string;
    supplier: string;
    purchase_date: string;
    expiry_date: string;
    kitchen_stores: string;
    general_stores: string;
    low_stock_alert: string;
    out_of_stock: string;
    stock_report: string;
  };

  transport: {
    title: string;
    routes: string;
    add_route: string;
    edit_route: string;
    route_name: string;
    pickup_points: string;
    assignments: string;
    assign_student: string;
    vehicle: string;
    driver: string;
    capacity: string;
    occupied: string;
    available_seats: string;
    transport_fee: string;
    distance: string;
    zone: string;
    morning_pickup: string;
    afternoon_dropoff: string;
    transport_report: string;
    roi_analysis: string;
  };

  reports: {
    title: string;
    generate_report: string;
    export_pdf: string;
    export_csv: string;
    export_excel: string;
    date_range: string;
    report_type: string;
    revenue_report: string;
    collection_report: string;
    outstanding_report: string;
    fee_compliance: string;
    class_profitability: string;
    transport_roi: string;
    bursary_analytics: string;
    aging_report: string;
    student_ledger: string;
    daily_collection: string;
    monthly_summary: string;
    term_summary: string;
    annual_summary: string;
    custom_report: string;
    scheduled_reports: string;
  };

  settings: {
    title: string;
    institution: string;
    institution_name: string;
    institution_address: string;
    institution_phone: string;
    institution_email: string;
    institution_logo: string;
    language: string;
    language_description: string;
    select_language: string;
    institution_language: string;
    user_language: string;
    currency: string;
    currency_format: string;
    date_format: string;
    academic_year: string;
    terms: string;
    term_dates: string;
    campuses: string;
    add_campus: string;
    classes: string;
    streams: string;
    fee_engine: string;
    policy_engine: string;
    users: string;
    roles: string;
    permissions: string;
    backup: string;
    restore: string;
    system_info: string;
    country: string;
    timezone: string;
  };

  sync: {
    syncing: string;
    last_sync: string;
    pending_changes: string;
    offline: string;
    online: string;
    sync_now: string;
    sync_complete: string;
    sync_failed: string;
    sync_conflict: string;
    items_pending: string;
    last_synced_at: string;
    never_synced: string;
  };

  print: {
    invoice: {
      header: string;
      school_fee_invoice: string;
      student: string;
      class: string;
      term: string;
      ref: string;
      description: string;
      amount: string;
      total_due: string;
      subtotal: string;
      payment_instructions: string;
      due_date: string;
      footer: string;
      generated_on: string;
    };
    receipt: {
      header: string;
      payment_receipt: string;
      received_from: string;
      for_student: string;
      receipt_no: string;
      date: string;
      payment_method: string;
      amount_received: string;
      balance_remaining: string;
      received_with_thanks: string;
      footer: string;
      authorized_signature: string;
    };
    report: {
      generated_by: string;
      generated_on: string;
      page: string;
      of: string;
      confidential: string;
      for_internal_use: string;
    };
    statement: {
      header: string;
      account_statement: string;
      period: string;
      opening_balance: string;
      closing_balance: string;
      total_charges: string;
      total_payments: string;
      transaction_date: string;
      description: string;
      debit: string;
      credit: string;
      running_balance: string;
    };
  };
}

// ---------------------------------------------------------------------------
// Supported locales
// ---------------------------------------------------------------------------

export type SupportedLocale = 'en' | 'fr';

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'fr'] as const;

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  fr: 'Français',
};

// ---------------------------------------------------------------------------
// Utility – flatten nested keys to dot-notation for the t() function
// ---------------------------------------------------------------------------

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string | number
          ? T[K] extends string
            ? `${K}`
            : `${K}` | Join<K, Paths<T[K], Prev[D]>>
          : never;
      }[keyof T]
    : '';

/** All valid dot-notation translation keys */
export type TranslationKey = Paths<TranslationSchema>;

// ---------------------------------------------------------------------------
// Interpolation helpers
// ---------------------------------------------------------------------------

export interface TranslateOptions {
  /** Named interpolation values: { amount: '50,000', currency: 'UGX' } */
  [key: string]: string | number;
}
