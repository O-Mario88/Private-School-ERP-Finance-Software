/**
 * MAPLE ERP — Comprehensive Seed Data Generator
 * Generates realistic Uganda-first seed data for all modules.
 * Programmatic generation ensures referential integrity and volume.
 */

import type { Database } from 'sql.js';

// ── Helpers ────────────────────────────────────────────────────────

let idCounter = 0;
function uid(prefix: string): string {
  idCounter++;
  return `${prefix}-${String(idCounter).padStart(4, '0')}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function money(min: number, max: number): number {
  return Math.round(randInt(min, max) / 1000) * 1000;
}

function dateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function sql(db: Database, query: string, params: any[] = []) {
  db.run(query, params);
}

// ── Name pools ─────────────────────────────────────────────────────

const FIRST_NAMES_M = [
  'Brian', 'Joshua', 'Ronald', 'Samuel', 'David', 'Emmanuel', 'Joseph', 'Peter',
  'Isaac', 'Moses', 'Daniel', 'Timothy', 'Andrew', 'Patrick', 'Kenneth',
  'James', 'Henry', 'Robert', 'Simon', 'George', 'Charles', 'Martin',
  'Francis', 'Stephen', 'John', 'Michael', 'Kevin', 'Allan', 'Victor', 'Paul',
  'Ivan', 'Edgar', 'Nelson', 'Herbert', 'Richard', 'Derick', 'Felix', 'Oscar',
  'Lawrence', 'Ben', 'Derrick', 'Trevor', 'Collins', 'Mark', 'Abel',
];

const FIRST_NAMES_F = [
  'Sarah', 'Grace', 'Fatuma', 'Esther', 'Prossy', 'Dorothy', 'Agnes', 'Irene',
  'Peace', 'Mercy', 'Janet', 'Rose', 'Annet', 'Harriet', 'Juliet',
  'Florence', 'Catherine', 'Joyce', 'Diana', 'Brenda', 'Stella', 'Mary',
  'Lillian', 'Rebecca', 'Naomi', 'Elizabeth', 'Christine', 'Gloria', 'Angel',
  'Doreen', 'Phiona', 'Winnie', 'Hope', 'Rita', 'Sandra', 'Sharon',
  'Jennifer', 'Lydia', 'Caroline', 'Patience', 'Joan', 'Ruth', 'Susan',
];

const LAST_NAMES = [
  'Nakato', 'Ssemakula', 'Tumusiime', 'Namutebi', 'Kizza', 'Nabirye',
  'Mugisha', 'Namugga', 'Lubega', 'Nankya', 'Kyambadde', 'Wasswa',
  'Babirye', 'Muwanga', 'Kabogoza', 'Sserunkuuma', 'Nsubuga', 'Mukasa',
  'Ochieng', 'Apio', 'Achola', 'Opolot', 'Kato', 'Okello', 'Aber',
  'Tumwine', 'Ainomugisha', 'Atim', 'Ogwang', 'Amanya', 'Mugume',
  'Ahabwe', 'Tusiime', 'Byaruhanga', 'Musiime', 'Natukunda', 'Asiimwe',
  'Karungi', 'Mbabazi', 'Kemigisa', 'Akankwasa', 'Ninsiima', 'Ampaire',
  'Katushabe', 'Tibemanya', 'Turyahebwa', 'Kakuru', 'Baguma', 'Nuwagaba',
  'Mwesigye', 'Owori', 'Engoru', 'Amoding', 'Akol', 'Arach',
];

// ── Main Seed Function ─────────────────────────────────────────────

export function seedDatabase(db: Database): void {
  console.log('[Seed] Starting comprehensive seed data generation...');
  const t0 = performance.now();

  // Reset counter
  idCounter = 0;

  // ── A. Institution & Setup ─────────────────────────────────────
  const INST = 'inst-0001';
  const CAMPUS_MAIN = 'campus-0001';
  const CAMPUS_BRANCH = 'campus-0002';

  sql(db, `INSERT INTO institutions (id, name, short_name, registration_no, motto, address, city, country, phone, email, currency_code)
    VALUES (?, 'Maple Private School', 'MPS', 'UG-SCH-2015-0842', 'Excellence Through Knowledge', 'Plot 42 Kampala Road', 'Kampala', 'UG', '+256-414-123456', 'info@mapleschool.ac.ug', 'UGX')`, [INST]);

  sql(db, `INSERT INTO campuses (id, institution_id, name, code, address, phone, principal_name, is_main, status)
    VALUES (?, ?, 'Main Campus', 'MAIN', 'Plot 42 Kampala Road, Kololo', '+256-414-123456', 'Dr. Margaret Nakalema', 1, 'active')`, [CAMPUS_MAIN, INST]);
  sql(db, `INSERT INTO campuses (id, institution_id, name, code, address, phone, principal_name, is_main, status)
    VALUES (?, ?, 'Entebbe Branch', 'ENTB', '15 Airport Road, Entebbe', '+256-414-654321', 'Mr. Robert Kiggundu', 0, 'active')`, [CAMPUS_BRANCH, INST]);

  // Academic years
  const AY_2024 = uid('ay');
  const AY_2025 = uid('ay');
  const AY_2026 = uid('ay');
  sql(db, `INSERT INTO academic_years (id, institution_id, name, start_date, end_date, is_current, status) VALUES (?,?,'2024','2024-02-05','2024-12-06',0,'closed')`, [AY_2024, INST]);
  sql(db, `INSERT INTO academic_years (id, institution_id, name, start_date, end_date, is_current, status) VALUES (?,?,'2025','2025-02-03','2025-12-05',0,'closed')`, [AY_2025, INST]);
  sql(db, `INSERT INTO academic_years (id, institution_id, name, start_date, end_date, is_current, status) VALUES (?,?,'2026','2026-02-02','2026-12-04',1,'active')`, [AY_2026, INST]);

  // Terms
  const terms: string[] = [];
  [[AY_2025, '2025'], [AY_2026, '2026']].forEach(([ayId, yr]) => {
    const termDates = [
      [1, `${yr}-02-03`, `${yr}-05-02`],
      [2, `${yr}-05-26`, `${yr}-08-22`],
      [3, `${yr}-09-08`, `${yr}-12-04`],
    ];
    termDates.forEach(([num, start, end]) => {
      const tid = uid('term');
      terms.push(tid);
      const isCurrent = yr === '2026' && num === 1 ? 1 : 0;
      sql(db, `INSERT INTO terms (id, academic_year_id, institution_id, name, term_number, start_date, end_date, is_current, status)
        VALUES (?,?,?,?,?,?,?,?,?)`, [tid, ayId, INST, `Term ${num} ${yr}`, num, start, end, isCurrent, isCurrent ? 'active' : 'closed']);
    });
  });
  const CURRENT_TERM = terms[terms.length - 3]; // Term 1 2026

  // Departments
  const deptNames = ['Administration', 'Sciences', 'Arts & Languages', 'Finance', 'Operations', 'Sports & Activities'];
  const deptIds: string[] = [];
  deptNames.forEach(name => {
    const did = uid('dept');
    deptIds.push(did);
    sql(db, `INSERT INTO departments (id, institution_id, campus_id, name, code, status) VALUES (?,?,?,?,?,?)`,
      [did, INST, CAMPUS_MAIN, name, name.substring(0, 4).toUpperCase(), 'active']);
  });

  // Cost centers
  const ccNames = ['Teaching', 'Kitchen & Dining', 'Transport', 'Maintenance', 'Administration', 'Sports'];
  const ccIds: string[] = [];
  ccNames.forEach((name, i) => {
    const cid = uid('cc');
    ccIds.push(cid);
    sql(db, `INSERT INTO cost_centers (id, institution_id, campus_id, name, code, department_id, status)
      VALUES (?,?,?,?,?,?,?)`, [cid, INST, CAMPUS_MAIN, name, `CC${String(i + 1).padStart(2, '0')}`, deptIds[i] || deptIds[0], 'active']);
  });

  // Classes & Streams
  const classNames = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
  const streamNames = ['Red', 'Blue', 'Green'];
  const classIds: string[] = [];
  const streamIds: string[] = [];
  classNames.forEach((name, level) => {
    const cid = uid('class');
    classIds.push(cid);
    sql(db, `INSERT INTO classes (id, institution_id, campus_id, name, level, capacity, status)
      VALUES (?,?,?,?,?,?,?)`, [cid, INST, CAMPUS_MAIN, name, level + 1, 120, 'active']);
    streamNames.forEach(sn => {
      const sid = uid('stream');
      streamIds.push(sid);
      sql(db, `INSERT INTO streams (id, class_id, institution_id, name, capacity, status)
        VALUES (?,?,?,?,?,?)`, [sid, cid, INST, sn, 40, 'active']);
    });
  });

  // Roles
  const roleData = [
    ['Super Admin', 1], ['Director', 1], ['Bursar', 1], ['Accountant', 1],
    ['Cashier', 1], ['Headteacher', 1], ['Admissions Officer', 1],
    ['Storekeeper', 1], ['Payroll Officer', 1], ['Auditor', 1],
  ];
  const roleIds: string[] = [];
  roleData.forEach(([name, sys]) => {
    const rid = uid('role');
    roleIds.push(rid);
    sql(db, `INSERT INTO roles (id, institution_id, name, is_system) VALUES (?,?,?,?)`, [rid, INST, name, sys]);
  });

  // Users
  const userRoles = [
    ['admin@mapleschool.ac.ug', 'Margaret', 'Nakalema', 'super_admin'],
    ['director@mapleschool.ac.ug', 'James', 'Byaruhanga', 'director'],
    ['bursar@mapleschool.ac.ug', 'Florence', 'Mugisha', 'bursar'],
    ['accountant@mapleschool.ac.ug', 'David', 'Lubega', 'accountant'],
    ['cashier@mapleschool.ac.ug', 'Irene', 'Nankya', 'cashier'],
    ['cashier2@mapleschool.ac.ug', 'Peter', 'Ssemakula', 'cashier'],
    ['head@mapleschool.ac.ug', 'Robert', 'Kiggundu', 'headteacher'],
    ['admissions@mapleschool.ac.ug', 'Grace', 'Namugga', 'admissions_officer'],
    ['stores@mapleschool.ac.ug', 'Samuel', 'Wasswa', 'storekeeper'],
    ['payroll@mapleschool.ac.ug', 'Dorothy', 'Kabogoza', 'payroll_officer'],
  ];
  const userIds: string[] = [];
  userRoles.forEach(([email, first, last, role]) => {
    const userId = uid('user');
    userIds.push(userId);
    sql(db, `INSERT INTO users (id, institution_id, campus_id, email, first_name, last_name, role, is_active)
      VALUES (?,?,?,?,?,?,?,?)`, [userId, INST, CAMPUS_MAIN, email, first, last, role, 1]);
  });
  const BURSAR_ID = userIds[2];
  const CASHIER_ID = userIds[4];

  // Institution Settings
  const settings = [
    ['currency', 'UGX', 'financial'], ['receipt_prefix', 'RCT', 'financial'],
    ['invoice_prefix', 'INV', 'financial'], ['payment_prefix', 'PAY', 'financial'],
    ['auto_generate_receipts', 'true', 'financial'], ['late_fee_enabled', 'true', 'billing'],
    ['late_fee_percentage', '5', 'billing'], ['grace_period_days', '14', 'billing'],
    ['academic_calendar', 'trimester', 'academic'], ['default_timezone', 'Africa/Kampala', 'general'],
  ];
  settings.forEach(([k, v, cat]) => {
    sql(db, `INSERT INTO institution_settings (id, institution_id, setting_key, setting_value, category) VALUES (?,?,?,?,?)`,
      [uid('set'), INST, k, v, cat]);
  });

  sql(db, `INSERT INTO branding_settings (id, institution_id, primary_color, secondary_color, header_text, footer_text, receipt_template) VALUES (?,?,?,?,?,?,?)`,
    [uid('brand'), INST, '#1e40af', '#3b82f6', 'Maple Private School', 'Excellence Through Knowledge | Kampala, Uganda', 'default']);

  // ── B. Students & Guardians ────────────────────────────────────
  const guardianIds: string[] = [];
  const studentIds: string[] = [];

  // Generate 240 students across 6 classes
  for (let i = 0; i < 240; i++) {
    const gender = i % 2 === 0 ? 'M' : 'F';
    const firstName = gender === 'M' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
    const lastName = pick(LAST_NAMES);
    const classIdx = Math.floor(i / 40); // ~40 per class
    const streamIdx = i % 3;
    const classId = classIds[Math.min(classIdx, 5)];
    const streamId = streamIds[classIdx * 3 + streamIdx];
    const admNo = `MPS/${2020 + classIdx}/${String(i + 1).padStart(4, '0')}`;
    const admDate = dateStr(2020 + classIdx, randInt(1, 2), randInt(1, 28));

    const stuId = uid('stu');
    studentIds.push(stuId);

    sql(db, `INSERT INTO students (id, institution_id, campus_id, admission_no, first_name, last_name, gender, class_id, stream_id, admission_date, is_boarder, has_transport, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [stuId, INST, CAMPUS_MAIN, admNo, firstName, lastName, gender, classId, streamId, admDate,
        i % 5 === 0 ? 1 : 0, i % 3 === 0 ? 1 : 0, 'active']);

    // Guardian (1 per ~2 students to create family groups)
    if (i % 2 === 0 || guardianIds.length === 0) {
      const gGender = pick(['M', 'F']);
      const gFirst = gGender === 'M' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
      const gLast = lastName;
      const gId = uid('guard');
      guardianIds.push(gId);
      sql(db, `INSERT INTO guardians (id, institution_id, first_name, last_name, relationship, phone, email, occupation, is_primary_payer, status)
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [gId, INST, gFirst, gLast, gGender === 'M' ? 'Father' : 'Mother',
          `+256-7${randInt(0, 9)}${randInt(0, 9)}-${randInt(100, 999)}-${randInt(100, 999)}`,
          `${gFirst.toLowerCase()}.${gLast.toLowerCase()}@email.com`,
          pick(['Teacher', 'Business Owner', 'Engineer', 'Doctor', 'Lawyer', 'Civil Servant', 'Farmer', 'Trader']),
          1, 'active']);
    }

    const guardianId = guardianIds[guardianIds.length - 1];
    sql(db, `INSERT INTO student_guardians (id, student_id, guardian_id, relationship, is_primary) VALUES (?,?,?,?,?)`,
      [uid('sg'), stuId, guardianId, 'Parent', 1]);
  }

  // Financial profiles
  studentIds.forEach((stuId, i) => {
    const billed = money(1500000, 4500000);
    const paid = money(0, billed);
    const balance = billed - paid;
    sql(db, `INSERT INTO student_financial_profiles (id, student_id, institution_id, total_billed, total_paid, total_balance, financial_status)
      VALUES (?,?,?,?,?,?,?)`,
      [uid('sfp'), stuId, INST, billed, paid, balance,
        balance === 0 ? 'good_standing' : balance > 1000000 ? 'arrears' : 'partial']);
  });

  // ── C. Fee Categories & Templates ──────────────────────────────
  const feeCategories = [
    ['Tuition', 'TUI', 1], ['Transport', 'TRP', 0], ['Boarding', 'BRD', 0],
    ['Lunch', 'LNC', 1], ['Uniform', 'UNF', 0], ['Activities', 'ACT', 1],
    ['Exams', 'EXM', 1], ['Library', 'LIB', 1], ['Lab', 'LAB', 1],
    ['Development', 'DEV', 1], ['ICT', 'ICT', 1], ['Medical', 'MED', 0],
  ];
  const feeCatIds: string[] = [];
  feeCategories.forEach(([name, code, mandatory]) => {
    const fcid = uid('fcat');
    feeCatIds.push(fcid);
    sql(db, `INSERT INTO fee_categories (id, institution_id, name, code, is_mandatory, status) VALUES (?,?,?,?,?,?)`,
      [fcid, INST, name, code, mandatory, 'active']);
  });

  // Fee templates per class
  const templateIds: string[] = [];
  classIds.forEach((classId, ci) => {
    const tid = uid('ftpl');
    templateIds.push(tid);
    const baseAmount = 1800000 + ci * 200000;
    sql(db, `INSERT INTO fee_templates (id, institution_id, name, academic_year_id, class_id, status, total_amount, created_by)
      VALUES (?,?,?,?,?,?,?,?)`,
      [tid, INST, `${classNames[ci]} Fees 2026`, AY_2026, classId, 'active', baseAmount, BURSAR_ID]);

    // Template lines
    const lines = [
      [feeCatIds[0], 'Tuition Fee', baseAmount * 0.55],
      [feeCatIds[3], 'Lunch Fee', 180000],
      [feeCatIds[5], 'Activities Fee', 120000],
      [feeCatIds[6], 'Examination Fee', 150000],
      [feeCatIds[7], 'Library Fee', 50000],
      [feeCatIds[9], 'Development Levy', 200000],
      [feeCatIds[10], 'ICT Fee', 100000],
    ];
    lines.forEach(([catId, desc, amt], li) => {
      sql(db, `INSERT INTO fee_template_lines (id, template_id, fee_category_id, description, amount, sort_order)
        VALUES (?,?,?,?,?,?)`, [uid('ftl'), tid, catId, desc, amt, li]);
    });
  });

  // ── D. Invoices ────────────────────────────────────────────────
  const invoiceIds: string[] = [];
  const invoiceStudentMap: Record<string, string> = {};
  studentIds.forEach((stuId, i) => {
    // 1-2 invoices per student
    const numInv = i % 3 === 0 ? 2 : 1;
    for (let inv = 0; inv < numInv; inv++) {
      const invId = uid('inv');
      invoiceIds.push(invId);
      invoiceStudentMap[invId] = stuId;
      const total = money(1200000, 3600000);
      const paid = money(0, total);
      const balance = total - paid;
      const month = inv === 0 ? 2 : 6;
      const invDate = dateStr(2026, month, randInt(1, 15));
      const dueDate = dateStr(2026, month + 1, 15);
      const status = balance === 0 ? 'fully_paid' : paid > 0 ? 'partially_paid' : (month < 4 ? 'overdue' : 'issued');
      const invNum = `INV-2026-${String(invoiceIds.length).padStart(5, '0')}`;
      const guardianId = guardianIds[Math.floor(i / 2)];

      sql(db, `INSERT INTO invoices (id, institution_id, student_id, guardian_id, invoice_number, invoice_date, due_date, term_id, academic_year_id, subtotal, total_amount, paid_amount, balance, status, created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [invId, INST, stuId, guardianId, invNum, invDate, dueDate, CURRENT_TERM, AY_2026, total, total, paid, balance, status, BURSAR_ID]);

      // Invoice lines
      const lineAmounts = [total * 0.5, total * 0.15, total * 0.1, total * 0.1, total * 0.08, total * 0.07];
      const lineDescs = ['Tuition', 'Lunch', 'Activities', 'Exams', 'Development', 'ICT'];
      lineDescs.forEach((desc, li) => {
        const lineAmt = Math.round(lineAmounts[li]);
        sql(db, `INSERT INTO invoice_lines (id, invoice_id, fee_category_id, description, quantity, unit_price, amount, sort_order)
          VALUES (?,?,?,?,?,?,?,?)`, [uid('il'), invId, feeCatIds[li] || feeCatIds[0], desc, 1, lineAmt, lineAmt, li]);
      });
    }
  });

  // ── E. Payments & Receipts ─────────────────────────────────────
  const paymentIds: string[] = [];
  const methods: Array<'cash' | 'mobile_money' | 'bank_transfer' | 'cheque'> = ['cash', 'mobile_money', 'bank_transfer', 'cheque'];

  // Generate ~300 payments
  for (let p = 0; p < 300; p++) {
    const payId = uid('pay');
    paymentIds.push(payId);
    const stuIdx = p % studentIds.length;
    const stuId = studentIds[stuIdx];
    const guardianId = guardianIds[Math.floor(stuIdx / 2)];
    const amount = money(100000, 2000000);
    const method = pick(methods);
    const month = randInt(1, 4);
    const payDate = dateStr(2026, month, randInt(1, 28));
    const payNum = `PAY-2026-${String(p + 1).padStart(5, '0')}`;
    const ref = method === 'mobile_money' ? `MM${randInt(100000, 999999)}` : method === 'cheque' ? `CHQ-${randInt(1000, 9999)}` : '';

    sql(db, `INSERT INTO payments (id, institution_id, student_id, guardian_id, payment_number, payment_date, amount, payment_method, reference_no, status, received_by, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [payId, INST, stuId, guardianId, payNum, payDate, amount, method, ref, 'recorded', CASHIER_ID, CASHIER_ID]);

    // Receipt
    const rcptId = uid('rcpt');
    sql(db, `INSERT INTO receipts (id, institution_id, payment_id, receipt_number, receipt_date, amount, student_name, payment_method, issued_by, status)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [rcptId, INST, payId, `RCT-2026-${String(p + 1).padStart(5, '0')}`, payDate, amount,
        'Student ' + (stuIdx + 1), method, CASHIER_ID, 'issued']);
  }

  // ── F. Collections ─────────────────────────────────────────────
  for (let f = 0; f < 50; f++) {
    const stuId = studentIds[f % studentIds.length];
    sql(db, `INSERT INTO collection_followups (id, institution_id, student_id, staff_id, followup_type, followup_date, notes, outcome, amount_promised) VALUES (?,?,?,?,?,?,?,?,?)`,
      [uid('fu'), INST, stuId, BURSAR_ID, pick(['call', 'sms', 'email', 'in_person']),
        dateStr(2026, randInt(2, 4), randInt(1, 28)),
        pick(['Called parent, promised payment', 'SMS reminder sent', 'Email follow-up sent', 'Met parent at school gate']),
        pick(['promised_payment', 'promised_plan', 'no_response', 'obstacle']),
        money(200000, 1500000)]);
  }

  for (let c = 0; c < 30; c++) {
    sql(db, `INSERT INTO payment_commitments (id, institution_id, student_id, amount, promised_date, status) VALUES (?,?,?,?,?,?)`,
      [uid('comm'), INST, studentIds[c], money(300000, 1500000),
        dateStr(2026, randInt(3, 6), randInt(1, 28)), pick(['pending', 'fulfilled', 'partial', 'broken'])]);
  }

  // ── G. Transport ───────────────────────────────────────────────
  const routeData = [
    ['Kololo - Nakasero', 180000, 'John Kalema', 'UAX 234B', 45],
    ['Ntinda - Kiwatule', 150000, 'Moses Byamugisha', 'UBA 567C', 40],
    ['Muyenga - Kabalagala', 200000, 'Edward Ssengooba', 'UBB 890D', 38],
    ['Entebbe Road', 250000, 'Patrick Mugabi', 'UBC 123E', 42],
    ['Naalya - Kyaliwajjala', 160000, 'Steven Okello', 'UBD 456F', 35],
    ['Bukoto - Kamwokya', 140000, 'Fred Katongole', 'UBE 789G', 30],
    ['Makindye - Kibuli', 170000, 'Richard Mpagi', 'UBF 012H', 36],
    ['Rubaga - Namirembe', 130000, 'Andrew Sendegeya', 'UBG 345I', 28],
    ['Bweyogerere - Namugongo', 190000, 'Charles Wabwire', 'UBH 678J', 44],
    ['Wakiso - Kasangati', 220000, 'Henry Obua', 'UBI 901K', 40],
  ];
  const routeIds: string[] = [];
  routeData.forEach(([name, cost, driver, reg, cap]) => {
    const rid = uid('route');
    routeIds.push(rid);
    sql(db, `INSERT INTO transport_routes (id, institution_id, campus_id, route_name, cost_per_term, driver_name, driver_phone, vehicle_reg, vehicle_capacity, current_students, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [rid, INST, CAMPUS_MAIN, name, cost, driver, `+256-7${randInt(0, 9)}${randInt(0, 9)}-${randInt(100, 999)}-${randInt(100, 999)}`, reg, cap, randInt(15, cap as number), 'active', BURSAR_ID]);
  });

  // Assign ~80 students to transport
  for (let t = 0; t < 80; t++) {
    sql(db, `INSERT INTO student_transport_assignments (id, student_id, route_id, term_id, direction, status, assigned_by) VALUES (?,?,?,?,?,?,?)`,
      [uid('sta'), studentIds[t * 3], pick(routeIds), CURRENT_TERM, 'both', 'active', BURSAR_ID]);
  }

  // ── H. Inventory ───────────────────────────────────────────────
  const inventoryData = [
    ['School Shirt (White)', 'uniform', 35000, 500, 'piece'],
    ['School Trousers (Navy)', 'uniform', 40000, 300, 'piece'],
    ['School Skirt (Navy)', 'uniform', 38000, 280, 'piece'],
    ['School Tie', 'uniform', 15000, 200, 'piece'],
    ['School Sweater', 'uniform', 55000, 150, 'piece'],
    ['Exercise Book (96 pages)', 'stationery', 3000, 2000, 'piece'],
    ['A4 Ruled Paper (Ream)', 'stationery', 25000, 100, 'ream'],
    ['Ball Pen (Blue)', 'stationery', 1000, 3000, 'piece'],
    ['Mathematics Set', 'stationery', 12000, 200, 'set'],
    ['School Bag', 'accessories', 45000, 100, 'piece'],
    ['Lab Coat', 'uniform', 30000, 80, 'piece'],
    ['Sports Kit', 'uniform', 28000, 120, 'set'],
    ['Art Materials Set', 'stationery', 35000, 50, 'set'],
    ['Calculator (Scientific)', 'stationery', 55000, 75, 'piece'],
    ['Textbook - Physics', 'book', 65000, 60, 'piece'],
    ['Textbook - Chemistry', 'book', 62000, 55, 'piece'],
    ['Textbook - Biology', 'book', 60000, 65, 'piece'],
    ['Textbook - Mathematics', 'book', 58000, 70, 'piece'],
    ['Textbook - English', 'book', 45000, 80, 'piece'],
    ['Textbook - History', 'book', 42000, 50, 'piece'],
  ];
  const invItemIds: string[] = [];
  inventoryData.forEach(([name, cat, cost, qty, unit]) => {
    const iid = uid('item');
    invItemIds.push(iid);
    sql(db, `INSERT INTO inventory_items (id, institution_id, campus_id, name, category, unit_cost, selling_price, quantity_on_hand, reorder_level, unit_of_measure, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [iid, INST, CAMPUS_MAIN, name, cat, cost, (cost as number) * 1.3, qty, Math.floor((qty as number) * 0.2), unit, 'active', userIds[8]]);
  });

  // ── I. Kitchen Inventory ───────────────────────────────────────
  const kitchenData = [
    ['Posho (Maize Flour)', 'grains', 'kg', 3500, 500],
    ['Rice (Long Grain)', 'grains', 'kg', 5000, 300],
    ['Beans (Mixed)', 'legumes', 'kg', 4500, 400],
    ['Cooking Oil', 'oils', 'litre', 8000, 100],
    ['Sugar', 'sweeteners', 'kg', 5500, 150],
    ['Tea Leaves', 'beverages', 'kg', 15000, 50],
    ['Milk (Fresh)', 'dairy', 'litre', 3000, 200],
    ['Bread', 'bakery', 'loaf', 5000, 100],
    ['Tomatoes', 'vegetables', 'kg', 4000, 80],
    ['Onions', 'vegetables', 'kg', 3500, 100],
    ['Cabbage', 'vegetables', 'head', 3000, 60],
    ['Irish Potatoes', 'vegetables', 'kg', 3000, 200],
    ['Chicken', 'proteins', 'kg', 14000, 100],
    ['Beef', 'proteins', 'kg', 16000, 80],
    ['Fish (Tilapia)', 'proteins', 'kg', 18000, 60],
    ['Eggs', 'proteins', 'tray', 14000, 50],
    ['Salt', 'condiments', 'kg', 2000, 30],
    ['Royco (Seasoning)', 'condiments', 'packet', 500, 100],
    ['Green Peppers', 'vegetables', 'kg', 6000, 40],
    ['Bananas (Matooke)', 'staples', 'bunch', 15000, 80],
    ['Sweet Potatoes', 'staples', 'kg', 2500, 150],
    ['Groundnuts', 'legumes', 'kg', 8000, 60],
    ['Cassava Flour', 'grains', 'kg', 3000, 100],
    ['Margarine', 'dairy', 'kg', 12000, 30],
    ['Spaghetti', 'grains', 'packet', 4000, 80],
  ];
  const kitchenIds: string[] = [];
  kitchenData.forEach(([name, cat, unit, cost, qty]) => {
    const kid = uid('kit');
    kitchenIds.push(kid);
    sql(db, `INSERT INTO kitchen_items (id, institution_id, campus_id, name, category, unit_of_measure, unit_cost, quantity_on_hand, min_stock_level, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [kid, INST, CAMPUS_MAIN, name, cat, unit, cost, qty, Math.floor((qty as number) * 0.2), 'active', userIds[8]]);
  });

  // Kitchen consumption logs (last 30 days)
  for (let d = 0; d < 30; d++) {
    const date = dateStr(2026, 3, Math.max(1, d + 1));
    ['breakfast', 'lunch'].forEach(meal => {
      const items = [kitchenIds[0], kitchenIds[2], kitchenIds[4], kitchenIds[6]];
      items.forEach(itemId => {
        sql(db, `INSERT INTO kitchen_consumption_logs (id, institution_id, item_id, quantity_used, meal_type, consumption_date, servings, logged_by)
          VALUES (?,?,?,?,?,?,?,?)`,
          [uid('kcl'), INST, itemId, randInt(5, 30), meal, date, randInt(150, 300), userIds[8]]);
      });
    });
  }

  // ── J. Suppliers ───────────────────────────────────────────────
  const supplierData = [
    ['Kampala Paper Supplies', 'Mr. Oketcho', 'Stationery & Books'],
    ['Mukwano Industries', 'Sales Dept', 'Cooking Oil & Soap'],
    ['Uniforms Uganda Ltd', 'Ms. Nabatanzi', 'School Uniforms'],
    ['Fresh Farms Produce', 'Mr. Kiwanuka', 'Fresh Vegetables & Fruits'],
    ['Tumpeco Ltd', 'Accounts Dept', 'Cleaning Supplies'],
    ['Quality Chemicals', 'Mr. Mugabe', 'Lab Chemicals & Equipment'],
    ['Uganda Bookshop', 'Ms. Achieng', 'Textbooks'],
    ['Roofings Group', 'Sales Office', 'Building Materials'],
    ['Nile Breweries', 'Ms. Nakamya', 'Beverages'],
    ['Capital Shoppers', 'Procurement', 'General Supplies'],
  ];
  const supplierIds: string[] = [];
  supplierData.forEach(([name, contact, _]) => {
    const sid = uid('sup');
    supplierIds.push(sid);
    sql(db, `INSERT INTO suppliers (id, institution_id, name, contact_person, phone, email, payment_terms, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?)`,
      [sid, INST, name, contact, `+256-41${randInt(0, 9)}-${randInt(100, 999)}-${randInt(100, 999)}`,
        `${(name as string).toLowerCase().replace(/\s+/g, '')}@email.com`, 30, 'active', BURSAR_ID]);
  });

  // Supplier invoices
  for (let si = 0; si < 25; si++) {
    const supId = supplierIds[si % supplierIds.length];
    const total = money(500000, 15000000);
    const paid = si % 3 === 0 ? total : si % 3 === 1 ? money(0, total) : 0;
    const balance = total - paid;
    const status = balance === 0 ? 'paid' : paid > 0 ? 'partially_paid' : 'approved';
    sql(db, `INSERT INTO supplier_invoices (id, institution_id, supplier_id, invoice_number, invoice_date, due_date, total_amount, paid_amount, balance, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [uid('sinv'), INST, supId, `SINV-2026-${String(si + 1).padStart(4, '0')}`,
        dateStr(2026, randInt(1, 3), randInt(1, 28)), dateStr(2026, randInt(4, 6), randInt(1, 28)),
        total, paid, balance, status, BURSAR_ID]);
  }

  // ── K. Accounting ──────────────────────────────────────────────
  // Chart of Accounts
  const coaData: [string, string, string, number, string | null][] = [
    ['1000', 'Assets', 'asset', 1, null],
    ['1100', 'Cash & Bank', 'asset', 0, '1000'],
    ['1110', 'Petty Cash', 'asset', 0, '1100'],
    ['1120', 'Stanbic Bank - Main', 'asset', 0, '1100'],
    ['1130', 'DFCU Bank - Fees', 'asset', 0, '1100'],
    ['1140', 'Mobile Money Float', 'asset', 0, '1100'],
    ['1200', 'Accounts Receivable', 'asset', 0, '1000'],
    ['1210', 'Student Receivables', 'asset', 0, '1200'],
    ['1300', 'Inventory', 'asset', 0, '1000'],
    ['1310', 'School Store Inventory', 'asset', 0, '1300'],
    ['1320', 'Kitchen Inventory', 'asset', 0, '1300'],
    ['1400', 'Fixed Assets', 'asset', 1, '1000'],
    ['1410', 'Furniture & Fittings', 'asset', 0, '1400'],
    ['1420', 'Computers & Equipment', 'asset', 0, '1400'],
    ['1430', 'Motor Vehicles', 'asset', 0, '1400'],
    ['1450', 'Accumulated Depreciation', 'asset', 0, '1400'],
    ['2000', 'Liabilities', 'liability', 1, null],
    ['2100', 'Accounts Payable', 'liability', 0, '2000'],
    ['2200', 'Accrued Expenses', 'liability', 0, '2000'],
    ['2300', 'Deferred Revenue', 'liability', 0, '2000'],
    ['2400', 'Payroll Liabilities', 'liability', 0, '2000'],
    ['2410', 'PAYE Payable', 'liability', 0, '2400'],
    ['2420', 'NSSF Payable', 'liability', 0, '2400'],
    ['3000', 'Equity', 'equity', 1, null],
    ['3100', 'Retained Earnings', 'equity', 0, '3000'],
    ['3200', 'Current Year Surplus', 'equity', 0, '3000'],
    ['4000', 'Revenue', 'revenue', 1, null],
    ['4100', 'Tuition Revenue', 'revenue', 0, '4000'],
    ['4200', 'Transport Revenue', 'revenue', 0, '4000'],
    ['4300', 'Boarding Revenue', 'revenue', 0, '4000'],
    ['4400', 'Activity Revenue', 'revenue', 0, '4000'],
    ['4500', 'Store Revenue', 'revenue', 0, '4000'],
    ['4600', 'Other Revenue', 'revenue', 0, '4000'],
    ['5000', 'Expenses', 'expense', 1, null],
    ['5100', 'Teaching Staff Salaries', 'expense', 0, '5000'],
    ['5200', 'Support Staff Salaries', 'expense', 0, '5000'],
    ['5300', 'Kitchen & Feeding', 'expense', 0, '5000'],
    ['5400', 'Transport Operations', 'expense', 0, '5000'],
    ['5500', 'Utilities', 'expense', 0, '5000'],
    ['5600', 'Maintenance & Repairs', 'expense', 0, '5000'],
    ['5700', 'Office & Administration', 'expense', 0, '5000'],
    ['5800', 'Depreciation Expense', 'expense', 0, '5000'],
    ['5900', 'Other Expenses', 'expense', 0, '5000'],
  ];
  const coaIdMap: Record<string, string> = {};
  coaData.forEach(([code, name, type, isHeader, parentCode]) => {
    const aid = uid('acct');
    coaIdMap[code] = aid;
    const parentId = parentCode ? coaIdMap[parentCode] || null : null;
    const normalBal = (type === 'asset' || type === 'expense') ? 'debit' : 'credit';
    sql(db, `INSERT INTO chart_of_accounts (id, institution_id, code, name, account_type, parent_id, is_header, is_active, normal_balance, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [aid, INST, code, name, type, parentId, isHeader, 1, normalBal, BURSAR_ID]);
  });

  // Bank Accounts
  const bankAccData = [
    ['Stanbic Bank - Main Account', '9030001234567', 'Stanbic Bank', coaIdMap['1120'], 45000000],
    ['DFCU Bank - Fees Collection', '0102003456789', 'DFCU Bank', coaIdMap['1130'], 28000000],
    ['Mobile Money Float', 'MM-FLOAT-001', 'MTN Mobile Money', coaIdMap['1140'], 5200000],
    ['Petty Cash', 'PETTY-001', 'Cash Box', coaIdMap['1110'], 1500000],
    ['Centenary Bank - Savings', '3001004567890', 'Centenary Bank', null, 15000000],
  ];
  const bankAccIds: string[] = [];
  bankAccData.forEach(([name, num, bank, glId, bal]) => {
    const bid = uid('bank');
    bankAccIds.push(bid);
    sql(db, `INSERT INTO bank_accounts (id, institution_id, account_name, account_number, bank_name, gl_account_id, opening_balance, current_balance, is_active)
      VALUES (?,?,?,?,?,?,?,?,?)`,
      [bid, INST, name, num, bank, glId, bal, bal, 1]);
  });

  // Accounting Periods
  const periodIds: string[] = [];
  for (let m = 1; m <= 12; m++) {
    const pid = uid('period');
    periodIds.push(pid);
    const lastDay = new Date(2026, m, 0).getDate();
    sql(db, `INSERT INTO accounting_periods (id, institution_id, name, start_date, end_date, status)
      VALUES (?,?,?,?,?,?)`,
      [pid, INST, `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} 2026`,
        dateStr(2026, m, 1), dateStr(2026, m, lastDay), m <= 3 ? 'open' : 'open']);
  }

  // Journal Entries (30 entries)
  for (let j = 0; j < 30; j++) {
    const jid = uid('jnl');
    const month = randInt(1, 3);
    const total = money(500000, 25000000);
    const status = j < 20 ? 'posted' : j < 25 ? 'approved' : 'draft';
    const sources = ['Fee Collection', 'Supplier Payment', 'Payroll', 'Utility Payment', 'Transport Income', 'Kitchen Purchase'];
    sql(db, `INSERT INTO journals (id, institution_id, journal_number, journal_date, description, total_debit, total_credit, status, created_by, period_id)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [jid, INST, `JE-2026-${String(j + 1).padStart(4, '0')}`, dateStr(2026, month, randInt(1, 28)),
        pick(sources), total, total, status, BURSAR_ID, periodIds[month - 1]]);

    // Debit line
    const debitAcct = pick([coaIdMap['1120'], coaIdMap['1130'], coaIdMap['5100'], coaIdMap['5300'], coaIdMap['5500']]);
    sql(db, `INSERT INTO journal_lines (id, journal_id, account_id, debit_amount, credit_amount, description)
      VALUES (?,?,?,?,?,?)`, [uid('jl'), jid, debitAcct, total, 0, 'Debit entry']);
    // Credit line
    const creditAcct = pick([coaIdMap['4100'], coaIdMap['4200'], coaIdMap['2100'], coaIdMap['1110'], coaIdMap['1120']]);
    sql(db, `INSERT INTO journal_lines (id, journal_id, account_id, debit_amount, credit_amount, description)
      VALUES (?,?,?,?,?,?)`, [uid('jl'), jid, creditAcct, 0, total, 'Credit entry']);
  }

  // ── L. Scholarships & Sponsors ─────────────────────────────────
  const sponsorData = [
    ['Uganda Government Bursary', 'government', 50000000],
    ['Maple Alumni Foundation', 'foundation', 35000000],
    ['MTN Uganda Foundation', 'corporate', 25000000],
    ['Rotary Club Kampala', 'ngo', 15000000],
    ['Dr. Ssemakula Family Trust', 'individual', 10000000],
    ['World Vision Uganda', 'ngo', 20000000],
  ];
  const sponsorIds: string[] = [];
  sponsorData.forEach(([name, type, committed]) => {
    const sid = uid('spon');
    sponsorIds.push(sid);
    sql(db, `INSERT INTO sponsors (id, institution_id, name, type, total_committed, total_disbursed, status, created_by)
      VALUES (?,?,?,?,?,?,?,?)`,
      [sid, INST, name, type, committed, (committed as number) * 0.6, 'active', BURSAR_ID]);
  });

  // Scholarships
  const scholarshipIds: string[] = [];
  const schData = [
    ['Government Merit Scholarship', 'full', 100, null, 10],
    ['Alumni Partial Scholarship', 'partial', 50, 1500000, 20],
    ['MTN STEM Scholarship', 'partial', 75, 2000000, 15],
    ['Rotary Need-Based Grant', 'partial', 40, 800000, 25],
    ['Staff Children Discount', 'partial', 30, null, 10],
    ['Sibling Discount Program', 'partial', 15, 500000, 50],
  ];
  schData.forEach(([name, type, pct, maxAmt, maxStudents], i) => {
    const sid = uid('sch');
    scholarshipIds.push(sid);
    sql(db, `INSERT INTO scholarships (id, institution_id, sponsor_id, name, type, coverage_pct, max_amount, max_students, current_students, academic_year_id, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [sid, INST, sponsorIds[i % sponsorIds.length], name, type, pct, maxAmt, maxStudents,
        randInt(3, maxStudents as number), AY_2026, 'active', BURSAR_ID]);
  });

  // Bursary applications
  for (let b = 0; b < 40; b++) {
    const status = pick(['submitted', 'approved', 'rejected', 'disbursed']);
    const reqAmt = money(500000, 2500000);
    sql(db, `INSERT INTO bursary_applications (id, institution_id, student_id, scholarship_id, amount_requested, amount_approved, justification, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?)`,
      [uid('bapp'), INST, studentIds[b * 5], pick(scholarshipIds), reqAmt,
        status === 'approved' || status === 'disbursed' ? reqAmt * 0.8 : null,
        pick(['Financial hardship', 'Academic merit', 'Orphan support', 'Single parent family', 'Disability support']),
        status, BURSAR_ID]);
  }

  // ── M. Budgets ─────────────────────────────────────────────────
  const budgetCats = ['Revenue', 'Teaching', 'Administration', 'Kitchen & Feeding', 'Transport', 'Maintenance', 'Capital'];
  const budgetCatIds: string[] = [];
  budgetCats.forEach(name => {
    const bcid = uid('bcat');
    budgetCatIds.push(bcid);
    sql(db, `INSERT INTO budget_categories (id, institution_id, name, code, status) VALUES (?,?,?,?,?)`,
      [bcid, INST, name, name.substring(0, 4).toUpperCase(), 'active']);
  });

  // Main budget
  const budgetId = uid('bgt');
  sql(db, `INSERT INTO budgets (id, institution_id, campus_id, academic_year_id, name, total_amount, status, created_by)
    VALUES (?,?,?,?,?,?,?,?)`,
    [budgetId, INST, CAMPUS_MAIN, AY_2026, 'Annual Budget 2026', 1850000000, 'approved', BURSAR_ID]);

  // Budget lines
  const budgetLineData = [
    [budgetCatIds[0], 'Tuition Revenue', 950000000, 720000000],
    [budgetCatIds[0], 'Transport Revenue', 180000000, 135000000],
    [budgetCatIds[0], 'Other Revenue', 120000000, 88000000],
    [budgetCatIds[1], 'Teaching Salaries', -450000000, -340000000],
    [budgetCatIds[1], 'Teaching Materials', -35000000, -28000000],
    [budgetCatIds[2], 'Admin Salaries', -180000000, -135000000],
    [budgetCatIds[2], 'Office Supplies', -15000000, -12000000],
    [budgetCatIds[3], 'Food Purchases', -280000000, -215000000],
    [budgetCatIds[3], 'Kitchen Staff', -60000000, -45000000],
    [budgetCatIds[4], 'Fuel & Maintenance', -85000000, -62000000],
    [budgetCatIds[4], 'Driver Salaries', -48000000, -36000000],
    [budgetCatIds[5], 'Building Repairs', -40000000, -18000000],
    [budgetCatIds[5], 'Equipment Maintenance', -25000000, -15000000],
    [budgetCatIds[6], 'New Equipment', -80000000, -35000000],
    [budgetCatIds[6], 'Infrastructure', -120000000, -42000000],
  ];
  budgetLineData.forEach(([catId, desc, budgeted, actual]) => {
    sql(db, `INSERT INTO budget_lines (id, budget_id, category_id, period, description, budgeted_amount, actual_amount, variance)
      VALUES (?,?,?,?,?,?,?,?)`,
      [uid('bl'), budgetId, catId, '2026-FY', desc, Math.abs(budgeted as number),
        Math.abs(actual as number), Math.abs(budgeted as number) - Math.abs(actual as number)]);
  });

  // ── N. Employees & Payroll ─────────────────────────────────────
  const positions = [
    ['Teaching', 'Teacher', 2800000, 3500000],
    ['Teaching', 'Senior Teacher', 3500000, 4500000],
    ['Teaching', 'Head of Department', 4200000, 5200000],
    ['Administration', 'Secretary', 1800000, 2200000],
    ['Administration', 'Receptionist', 1500000, 1800000],
    ['Finance', 'Accountant', 3200000, 4000000],
    ['Finance', 'Cashier', 2000000, 2500000],
    ['Operations', 'Driver', 1500000, 1800000],
    ['Operations', 'Security Guard', 800000, 1000000],
    ['Operations', 'Cleaner', 600000, 800000],
    ['Kitchen', 'Head Cook', 1800000, 2200000],
    ['Kitchen', 'Cook', 1000000, 1400000],
    ['Sports', 'Sports Coach', 2500000, 3200000],
  ];

  const employeeIds: string[] = [];
  for (let e = 0; e < 55; e++) {
    const pos = positions[e % positions.length];
    const gender = e % 2 === 0 ? 'M' : 'F';
    const firstName = gender === 'M' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
    const lastName = pick(LAST_NAMES);
    const basic = money(pos[2] as number, pos[3] as number);
    const gross = Math.round(basic * 1.25);
    const eid = uid('emp');
    employeeIds.push(eid);

    sql(db, `INSERT INTO employees (id, institution_id, campus_id, employee_number, first_name, last_name, department, position, hire_date, basic_salary, gross_salary, bank_name, bank_account, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [eid, INST, CAMPUS_MAIN, `EMP-${String(e + 1).padStart(4, '0')}`, firstName, lastName,
        pos[0], pos[1], dateStr(randInt(2015, 2024), randInt(1, 12), randInt(1, 28)),
        basic, gross, pick(['Stanbic Bank', 'DFCU Bank', 'Centenary Bank']),
        `${randInt(1000, 9999)}${randInt(100000, 999999)}`, 'active', userIds[9]]);
  }

  // Payroll runs (last 3 months)
  for (let pr = 0; pr < 3; pr++) {
    const month = pr + 1;
    const runId = uid('prun');
    let totalGross = 0, totalDeductions = 0, totalNet = 0;

    const items: any[][] = [];
    employeeIds.forEach(empId => {
      const basic = money(800000, 5000000);
      const gross = Math.round(basic * 1.25);
      const paye = Math.round(gross * 0.15);
      const nssf = Math.round(gross * 0.05);
      const otherDed = money(0, 200000);
      const totalDed = paye + nssf + otherDed;
      const net = gross - totalDed;
      totalGross += gross;
      totalDeductions += totalDed;
      totalNet += net;
      items.push([empId, basic, gross, paye, nssf, otherDed, totalDed, net]);
    });

    const status = pr < 2 ? 'posted' : 'approved';
    sql(db, `INSERT INTO payroll_runs (id, institution_id, pay_period, run_date, total_gross, total_deductions, total_net, employee_count, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [runId, INST, `${['Jan','Feb','Mar'][month-1]} 2026`, dateStr(2026, month, 28),
        totalGross, totalDeductions, totalNet, employeeIds.length, status, userIds[9]]);

    items.forEach(([empId, basic, gross, paye, nssf, otherDed, totalDed, net]) => {
      sql(db, `INSERT INTO payroll_run_items (id, run_id, employee_id, basic_salary, gross_salary, paye, nssf, other_deductions, total_deductions, net_salary)
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [uid('pri'), runId, empId, basic, gross, paye, nssf, otherDed, totalDed, net]);
    });
  }

  // ── O. Fixed Assets ────────────────────────────────────────────
  const assetCats = [
    ['Furniture & Fittings', 'straight_line', 120, coaIdMap['1410']],
    ['Computers & IT Equipment', 'straight_line', 60, coaIdMap['1420']],
    ['Motor Vehicles', 'reducing_balance', 96, coaIdMap['1430']],
  ];
  const assetCatIds: string[] = [];
  assetCats.forEach(([name, method, life, acctId]) => {
    const acid = uid('acat');
    assetCatIds.push(acid);
    sql(db, `INSERT INTO asset_categories (id, institution_id, name, depreciation_method, useful_life_months, asset_account_id, status)
      VALUES (?,?,?,?,?,?,?)`, [acid, INST, name, method, life, acctId, 'active']);
  });

  const assetData = [
    ['Student Desks (Batch 200)', assetCatIds[0], 35000000, '2020-01-15', 120],
    ['Teacher Desks & Chairs', assetCatIds[0], 8500000, '2020-03-10', 120],
    ['Staff Room Furniture', assetCatIds[0], 12000000, '2021-06-20', 120],
    ['Computer Lab - 40 PCs', assetCatIds[1], 120000000, '2022-01-10', 60],
    ['Server & Networking', assetCatIds[1], 25000000, '2022-01-10', 60],
    ['Admin Laptops (10)', assetCatIds[1], 35000000, '2023-02-15', 60],
    ['Projectors & Screens (15)', assetCatIds[1], 22500000, '2022-08-01', 60],
    ['School Bus - 65 Seater', assetCatIds[2], 180000000, '2019-06-15', 96],
    ['School Bus - 45 Seater', assetCatIds[2], 135000000, '2021-01-20', 96],
    ['Mini Bus - 14 Seater', assetCatIds[2], 65000000, '2023-03-01', 96],
    ['Admin Vehicle - SUV', assetCatIds[2], 95000000, '2022-09-10', 96],
    ['Science Lab Equipment', assetCatIds[1], 45000000, '2021-02-01', 60],
    ['Musical Instruments', assetCatIds[0], 18000000, '2022-05-15', 120],
    ['Sports Equipment', assetCatIds[0], 15000000, '2023-01-10', 120],
    ['Library Shelving', assetCatIds[0], 8000000, '2020-08-20', 120],
  ];
  assetData.forEach(([desc, catId, cost, acqDate, life], i) => {
    const months = Math.floor((new Date('2026-04-01').getTime() - new Date(acqDate as string).getTime()) / (30 * 24 * 3600 * 1000));
    const monthlyDepr = (cost as number) / (life as number);
    const accumDepr = Math.min(months * monthlyDepr, cost as number);
    const nbv = (cost as number) - accumDepr;

    sql(db, `INSERT INTO fixed_assets (id, institution_id, campus_id, asset_number, description, category_id, acquisition_date, acquisition_cost, useful_life_months, accumulated_depr, net_book_value, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [uid('fa'), INST, CAMPUS_MAIN, `FA-${String(i + 1).padStart(4, '0')}`, desc, catId,
        acqDate, cost, life, Math.round(accumDepr), Math.round(nbv),
        nbv <= 0 ? 'fully_depreciated' : 'active', BURSAR_ID]);
  });

  // ── P. Audit Events ────────────────────────────────────────────
  const auditActions = [
    ['login', 'user', 'User logged in', 'low'],
    ['create', 'payment', 'Payment recorded', 'low'],
    ['create', 'invoice', 'Invoice generated', 'low'],
    ['approve', 'journal', 'Journal entry approved', 'medium'],
    ['post', 'journal', 'Journal entry posted to GL', 'medium'],
    ['update', 'student', 'Student record updated', 'low'],
    ['create', 'receipt', 'Receipt issued', 'low'],
    ['reverse', 'payment', 'Payment reversed', 'high'],
    ['delete', 'invoice', 'Invoice cancelled', 'high'],
    ['update', 'fee_rule', 'Fee rule modified', 'medium'],
    ['approve', 'payroll', 'Payroll approved', 'high'],
    ['post', 'payroll', 'Payroll posted', 'high'],
    ['create', 'budget', 'Budget created', 'medium'],
    ['approve', 'budget', 'Budget approved', 'high'],
    ['update', 'user_permissions', 'User permissions changed', 'critical'],
    ['login', 'user', 'Failed login attempt', 'high'],
    ['create', 'supplier_payment', 'Supplier payment processed', 'medium'],
    ['approve', 'expense', 'Expense approved', 'medium'],
    ['update', 'bank_recon', 'Bank reconciliation completed', 'medium'],
    ['create', 'discount', 'Student discount applied', 'medium'],
  ];

  for (let a = 0; a < 120; a++) {
    const [action, entity, details, risk] = auditActions[a % auditActions.length];
    const userId = pick(userIds);
    const month = randInt(1, 4);
    sql(db, `INSERT INTO audit_events (id, institution_id, action, entity_type, entity_id, user_id, user_name, details, risk_level, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [uid('aud'), INST, action, entity, uid('ref'), userId, 'System User', details, risk,
        `2026-${String(month).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}T${String(randInt(6, 22)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}:00`]);
  }

  // ── Q. Devices & Sync ─────────────────────────────────────────
  const deviceId = uid('dev');
  sql(db, `INSERT INTO devices (id, institution_id, device_name, device_type, os_info, is_active)
    VALUES (?,?,?,?,?,?)`, [deviceId, INST, 'Bursar Desktop', 'desktop', 'macOS 14.2', 1]);
  sql(db, `INSERT INTO devices (id, institution_id, device_name, device_type, os_info, is_active)
    VALUES (?,?,?,?,?,?)`, [uid('dev'), INST, 'Cashier Laptop', 'laptop', 'Windows 11', 1]);

  const elapsed = Math.round(performance.now() - t0);
  console.log(`[Seed] Complete. Generated data in ${elapsed}ms`);
  console.log(`[Seed] Students: ${studentIds.length}, Guardians: ${guardianIds.length}, Invoices: ${invoiceIds.length}, Payments: ${paymentIds.length}, Employees: ${employeeIds.length}`);
}

/** Check if database has been seeded */
export function isSeeded(db: Database): boolean {
  const result = db.exec("SELECT COUNT(*) FROM institutions");
  return result.length > 0 && result[0].values.length > 0 && (result[0].values[0][0] as number) > 0;
}
