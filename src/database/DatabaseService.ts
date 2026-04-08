/**
 * MAPLE ERP — Database Service Layer
 * Provides typed query methods for all modules.
 * Uses connection.ts helpers for read/write operations.
 */

import { execQuery, execQueryOne, execScalar, execWrite, execTransaction } from './connection';

// ── Shared helpers ─────────────────────────────────────────────────

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const INST_SQL = `(SELECT id FROM institutions LIMIT 1)`;
const BURSAR_ID_SQL = `(SELECT id FROM users WHERE role='bursar' LIMIT 1)`;

function audit(action: string, entityType: string, entityId: string, details?: string, riskLevel: string = 'low') {
  execWrite(
    `INSERT INTO audit_events (id, institution_id, action, entity_type, entity_id, user_id, user_name, details, risk_level, created_at)
     VALUES (?, ${INST_SQL}, ?, ?, ?, ${BURSAR_ID_SQL}, 'System', ?, ?, datetime('now'))`,
    [uid('ae'), action, entityType, entityId, details ?? '', riskLevel]
  );
}

export const DashboardService = {
  getKPIs() {
    const activeStudents = execScalar<number>(`SELECT COUNT(*) FROM students WHERE status='active'`) ?? 0;
    const newEnrollments = execScalar<number>(`SELECT COUNT(*) FROM students WHERE status='active' AND admission_date >= date('now','-30 days')`) ?? 0;

    const totalCollected30d = execScalar<number>(`SELECT COALESCE(SUM(amount),0) FROM payments WHERE payment_date >= date('now','-30 days')`) ?? 0;
    const totalCollectedPrev30d = execScalar<number>(`SELECT COALESCE(SUM(amount),0) FROM payments WHERE payment_date >= date('now','-60 days') AND payment_date < date('now','-30 days')`) ?? 0;

    const totalBilled = execScalar<number>(`SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE status != 'cancelled'`) ?? 1;
    const totalPaid = execScalar<number>(`SELECT COALESCE(SUM(paid_amount),0) FROM invoices WHERE status != 'cancelled'`) ?? 0;
    const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 1000) / 10 : 0;

    return {
      activeStudents,
      newEnrollments,
      dailyCollections: totalCollected30d,
      dailyCollectionsPrev: totalCollectedPrev30d,
      collectionRate,
    };
  },

  getRevenueFlow(months = 7) {
    return execQuery<{ month: string; value: number }>(
      `SELECT strftime('%Y-%m', payment_date) as month_key,
              CASE cast(strftime('%m', payment_date) as integer)
                WHEN 1 THEN 'Jan' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar'
                WHEN 4 THEN 'Apr' WHEN 5 THEN 'May' WHEN 6 THEN 'Jun'
                WHEN 7 THEN 'Jul' WHEN 8 THEN 'Aug' WHEN 9 THEN 'Sep'
                WHEN 10 THEN 'Oct' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dec'
              END as month,
              CAST(COALESCE(SUM(amount),0) AS INTEGER) as value
       FROM payments
       WHERE payment_date >= date('now','-${months} months')
       GROUP BY month_key
       ORDER BY month_key`
    );
  },

  getFeeSources() {
    return execQuery<{ label: string; value: number; pct: number }>(
      `SELECT fc.name as label, CAST(COUNT(DISTINCT s.id) AS INTEGER) as value, 0 as pct
       FROM invoice_lines il
       JOIN invoices i ON i.id = il.invoice_id
       JOIN students s ON s.id = i.student_id AND s.status='active'
       JOIN fee_categories fc ON fc.id = il.fee_category_id
       GROUP BY fc.name
       ORDER BY value DESC
       LIMIT 6`
    ).map((row, _, arr) => {
      const total = arr.reduce((s, r) => s + r.value, 0);
      return { ...row, pct: total > 0 ? Math.round((row.value / total) * 100) : 0 };
    });
  },

  getRecentStudents(search = '', limit = 20) {
    const whereClause = search
      ? `AND (s.first_name || ' ' || s.last_name LIKE ? OR c.name || ' ' || st.name LIKE ?)`
      : '';
    const params = search ? [`%${search}%`, `%${search}%`] : [];
    return execQuery<{
      id: string; name: string; cls: string; email: string; balance: number; status: string;
    }>(
      `SELECT s.id,
              s.first_name || ' ' || s.last_name as name,
              COALESCE(c.name,'') || ' ' || COALESCE(st.name,'') as cls,
              COALESCE(g.email, s.first_name || '.' || s.last_name || '@maple.ac.ug') as email,
              COALESCE(fp.total_balance,0) as balance,
              CASE
                WHEN COALESCE(fp.total_balance,0) = 0 THEN 'Paid'
                WHEN COALESCE(fp.total_balance,0) > 1000000 THEN 'Overdue'
                ELSE 'Partial'
              END as status
       FROM students s
       LEFT JOIN classes c ON c.id = s.class_id
       LEFT JOIN streams st ON st.id = s.stream_id
       LEFT JOIN student_financial_profiles fp ON fp.student_id = s.id
       LEFT JOIN student_guardians sg ON sg.student_id = s.id AND sg.is_primary = 1
       LEFT JOIN guardians g ON g.id = sg.guardian_id
       WHERE s.status='active' AND s.deleted_at IS NULL ${whereClause}
       ORDER BY s.last_name, s.first_name
       LIMIT ?`,
      [...params, limit]
    );
  },
};

// ── Students ───────────────────────────────────────────────────────

export const StudentService = {
  list(filters: { class_id?: string; status?: string; search?: string; limit?: number; offset?: number } = {}) {
    const conditions: string[] = ['s.deleted_at IS NULL'];
    const params: any[] = [];
    if (filters.class_id) { conditions.push('s.class_id = ?'); params.push(filters.class_id); }
    if (filters.status) { conditions.push('s.status = ?'); params.push(filters.status); }
    if (filters.search) { conditions.push("(s.first_name || ' ' || s.last_name LIKE ? OR s.admission_no LIKE ?)"); params.push(`%${filters.search}%`, `%${filters.search}%`); }
    const where = conditions.join(' AND ');
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;
    params.push(limit, offset);

    return execQuery(
      `SELECT s.*, c.name as class_name, st.name as stream_name,
              COALESCE(fp.total_billed,0) as total_billed,
              COALESCE(fp.total_paid,0) as total_paid,
              COALESCE(fp.total_balance,0) as total_balance,
              fp.financial_status
       FROM students s
       LEFT JOIN classes c ON c.id = s.class_id
       LEFT JOIN streams st ON st.id = s.stream_id
       LEFT JOIN student_financial_profiles fp ON fp.student_id = s.id
       WHERE ${where}
       ORDER BY s.last_name, s.first_name
       LIMIT ? OFFSET ?`,
      params
    );
  },

  getById(id: string) {
    return execQueryOne(
      `SELECT s.*, c.name as class_name, st.name as stream_name,
              COALESCE(fp.total_billed,0) as total_billed,
              COALESCE(fp.total_paid,0) as total_paid,
              COALESCE(fp.total_balance,0) as total_balance
       FROM students s
       LEFT JOIN classes c ON c.id = s.class_id
       LEFT JOIN streams st ON st.id = s.stream_id
       LEFT JOIN student_financial_profiles fp ON fp.student_id = s.id
       WHERE s.id = ?`, [id]
    );
  },

  count(status = 'active') {
    return execScalar<number>(`SELECT COUNT(*) FROM students WHERE status=? AND deleted_at IS NULL`, [status]) ?? 0;
  },

  getClasses() {
    return execQuery(
      `SELECT c.*, COUNT(s.id) as student_count
       FROM classes c
       LEFT JOIN students s ON s.class_id = c.id AND s.status = 'active'
       WHERE c.status = 'active'
       GROUP BY c.id
       ORDER BY c.level`
    );
  },

  getStreams(classId?: string) {
    const where = classId ? 'WHERE st.class_id = ?' : '';
    const params = classId ? [classId] : [];
    return execQuery(
      `SELECT st.*, c.name as class_name, COUNT(s.id) as student_count
       FROM streams st
       JOIN classes c ON c.id = st.class_id
       LEFT JOIN students s ON s.stream_id = st.id AND s.status = 'active'
       ${where}
       GROUP BY st.id
       ORDER BY c.level, st.name`,
      params
    );
  },

  create(data: {
    first_name: string; last_name: string; other_names?: string;
    date_of_birth?: string; gender: string; class_id: string; stream_id?: string;
    is_boarder?: boolean; has_transport?: boolean;
    guardian_first_name?: string; guardian_last_name?: string;
    guardian_phone?: string; guardian_email?: string; guardian_relationship?: string;
  }) {
    const id = uid('stu');
    const admNo = `MAP-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    execTransaction(() => {
      execWrite(
        `INSERT INTO students (id, institution_id, admission_no, first_name, last_name, other_names, date_of_birth, gender, class_id, stream_id, admission_date, is_boarder, has_transport, status, created_by)
         VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), ?, ?, 'active', ${BURSAR_ID_SQL})`,
        [id, admNo, data.first_name, data.last_name, data.other_names ?? '', data.date_of_birth ?? null,
         data.gender, data.class_id, data.stream_id ?? null, data.is_boarder ? 1 : 0, data.has_transport ? 1 : 0]
      );
      // Create financial profile
      execWrite(
        `INSERT INTO student_financial_profiles (id, student_id, institution_id)
         VALUES (?, ?, ${INST_SQL})`, [uid('sfp'), id]
      );
      // Create guardian if provided
      if (data.guardian_first_name && data.guardian_last_name) {
        const gid = uid('grd');
        execWrite(
          `INSERT INTO guardians (id, institution_id, first_name, last_name, phone, email, relationship, created_by)
           VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, ${BURSAR_ID_SQL})`,
          [gid, data.guardian_first_name, data.guardian_last_name, data.guardian_phone ?? '', data.guardian_email ?? '', data.guardian_relationship ?? 'parent']
        );
        execWrite(
          `INSERT INTO student_guardians (id, student_id, guardian_id, relationship, is_primary)
           VALUES (?, ?, ?, ?, 1)`,
          [uid('sg'), id, gid, data.guardian_relationship ?? 'parent']
        );
      }
      audit('create', 'student', id, `Registered ${data.first_name} ${data.last_name} (${admNo})`);
    });
    return id;
  },

  update(id: string, data: Partial<{
    first_name: string; last_name: string; other_names: string;
    date_of_birth: string; gender: string; class_id: string; stream_id: string;
    is_boarder: boolean; has_transport: boolean;
  }>) {
    const fields: string[] = [];
    const params: any[] = [];
    if (data.first_name !== undefined) { fields.push('first_name=?'); params.push(data.first_name); }
    if (data.last_name !== undefined) { fields.push('last_name=?'); params.push(data.last_name); }
    if (data.other_names !== undefined) { fields.push('other_names=?'); params.push(data.other_names); }
    if (data.date_of_birth !== undefined) { fields.push('date_of_birth=?'); params.push(data.date_of_birth); }
    if (data.gender !== undefined) { fields.push('gender=?'); params.push(data.gender); }
    if (data.class_id !== undefined) { fields.push('class_id=?'); params.push(data.class_id); }
    if (data.stream_id !== undefined) { fields.push('stream_id=?'); params.push(data.stream_id); }
    if (data.is_boarder !== undefined) { fields.push('is_boarder=?'); params.push(data.is_boarder ? 1 : 0); }
    if (data.has_transport !== undefined) { fields.push('has_transport=?'); params.push(data.has_transport ? 1 : 0); }
    if (fields.length === 0) return;
    fields.push("updated_at=datetime('now')");
    params.push(id);
    execWrite(`UPDATE students SET ${fields.join(', ')} WHERE id=?`, params);
    audit('update', 'student', id, `Updated student fields: ${Object.keys(data).join(', ')}`);
  },

  withdraw(id: string, reason: string) {
    execTransaction(() => {
      const old = execQueryOne<any>(`SELECT status FROM students WHERE id=?`, [id]);
      execWrite(`UPDATE students SET status='withdrawn', updated_at=datetime('now') WHERE id=?`, [id]);
      execWrite(
        `INSERT INTO student_status_changes (id, student_id, from_status, to_status, reason, effective_date, changed_by)
         VALUES (?, ?, ?, 'withdrawn', ?, date('now'), ${BURSAR_ID_SQL})`,
        [uid('ssc'), id, old?.status ?? 'active', reason]
      );
      audit('withdraw', 'student', id, `Withdrawn: ${reason}`, 'medium');
    });
  },
};

// ── Billing & Invoices ─────────────────────────────────────────────

export const BillingService = {
  listInvoices(filters: { student_id?: string; status?: string; search?: string; limit?: number } = {}) {
    const conditions: string[] = ['i.deleted_at IS NULL'];
    const params: any[] = [];
    if (filters.student_id) { conditions.push('i.student_id = ?'); params.push(filters.student_id); }
    if (filters.status) { conditions.push('i.status = ?'); params.push(filters.status); }
    if (filters.search) { conditions.push("(i.invoice_number LIKE ? OR s.first_name || ' ' || s.last_name LIKE ?)"); params.push(`%${filters.search}%`, `%${filters.search}%`); }
    const limit = filters.limit ?? 50;
    params.push(limit);

    return execQuery(
      `SELECT i.*, s.first_name || ' ' || s.last_name as student_name,
              c.name as class_name, st.name as stream_name
       FROM invoices i
       JOIN students s ON s.id = i.student_id
       LEFT JOIN classes c ON c.id = s.class_id
       LEFT JOIN streams st ON st.id = s.stream_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY i.invoice_date DESC
       LIMIT ?`,
      params
    );
  },

  getInvoice(id: string) {
    const invoice = execQueryOne(
      `SELECT i.*, s.first_name || ' ' || s.last_name as student_name,
              s.admission_no, c.name as class_name
       FROM invoices i
       JOIN students s ON s.id = i.student_id
       LEFT JOIN classes c ON c.id = s.class_id
       WHERE i.id = ?`, [id]
    );
    if (!invoice) return null;
    const lines = execQuery(`SELECT il.*, fc.name as category_name FROM invoice_lines il LEFT JOIN fee_categories fc ON fc.id = il.fee_category_id WHERE il.invoice_id = ? ORDER BY il.sort_order`, [id]);
    return { ...invoice, lines };
  },

  getFeeCategories() {
    return execQuery(`SELECT * FROM fee_categories WHERE status='active' ORDER BY name`);
  },

  getFeeTemplates() {
    return execQuery(
      `SELECT ft.*, c.name as class_name, COUNT(ftl.id) as line_count
       FROM fee_templates ft
       LEFT JOIN classes c ON c.id = ft.class_id
       LEFT JOIN fee_template_lines ftl ON ftl.template_id = ft.id
       WHERE ft.status = 'active'
       GROUP BY ft.id
       ORDER BY c.level`
    );
  },

  getInvoiceStats() {
    return execQueryOne<{
      total_invoiced: number; total_paid: number; total_outstanding: number;
      total_overdue: number; invoice_count: number;
    }>(
      `SELECT COALESCE(SUM(total_amount),0) as total_invoiced,
              COALESCE(SUM(paid_amount),0) as total_paid,
              COALESCE(SUM(balance),0) as total_outstanding,
              COALESCE(SUM(CASE WHEN status='overdue' THEN balance ELSE 0 END),0) as total_overdue,
              COUNT(*) as invoice_count
       FROM invoices WHERE deleted_at IS NULL AND status != 'cancelled'`
    );
  },

  createInvoice(data: {
    student_id: string; due_date: string;
    lines: Array<{ fee_category_id?: string; description: string; quantity: number; unit_price: number }>;
    notes?: string;
  }) {
    const id = uid('inv');
    const invNum = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const subtotal = data.lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);
    const guardian = execQueryOne<any>(`SELECT sg.guardian_id FROM student_guardians sg WHERE sg.student_id=? AND sg.is_primary=1 LIMIT 1`, [data.student_id]);
    const currentTerm = execQueryOne<any>(`SELECT id FROM terms WHERE is_current=1 LIMIT 1`);
    const currentAY = execQueryOne<any>(`SELECT id FROM academic_years WHERE is_current=1 LIMIT 1`);

    execTransaction(() => {
      execWrite(
        `INSERT INTO invoices (id, institution_id, student_id, guardian_id, invoice_number, invoice_date, due_date, term_id, academic_year_id, subtotal, total_amount, paid_amount, balance, status, notes, created_by)
         VALUES (?, ${INST_SQL}, ?, ?, ?, date('now'), ?, ?, ?, ?, ?, 0, ?, 'issued', ?, ${BURSAR_ID_SQL})`,
        [id, data.student_id, guardian?.guardian_id ?? null, invNum, data.due_date,
         currentTerm?.id ?? null, currentAY?.id ?? null, subtotal, subtotal, subtotal, data.notes ?? '']
      );
      data.lines.forEach((line, i) => {
        const amt = line.quantity * line.unit_price;
        execWrite(
          `INSERT INTO invoice_lines (id, invoice_id, fee_category_id, description, quantity, unit_price, amount, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [uid('il'), id, line.fee_category_id ?? null, line.description, line.quantity, line.unit_price, amt, i]
        );
      });
      // Update student financial profile
      execWrite(
        `UPDATE student_financial_profiles SET total_billed = total_billed + ?, total_balance = total_balance + ?, last_invoice_date = date('now'), updated_at = datetime('now')
         WHERE student_id = ?`, [subtotal, subtotal, data.student_id]
      );
      audit('create', 'invoice', id, `Created invoice ${invNum} for UGX ${subtotal.toLocaleString()}`);
    });
    return id;
  },

  cancelInvoice(id: string, reason: string) {
    execTransaction(() => {
      const inv = execQueryOne<any>(`SELECT student_id, balance, total_amount FROM invoices WHERE id=?`, [id]);
      if (!inv) return;
      execWrite(`UPDATE invoices SET status='cancelled', notes=COALESCE(notes,'')||' | Cancelled: '||?, updated_at=datetime('now') WHERE id=?`, [reason, id]);
      execWrite(
        `UPDATE student_financial_profiles SET total_billed = total_billed - ?, total_balance = total_balance - ?, updated_at = datetime('now') WHERE student_id=?`,
        [inv.total_amount, inv.balance, inv.student_id]
      );
      audit('cancel', 'invoice', id, `Cancelled: ${reason}`, 'high');
    });
  },

  createCreditNote(data: { invoice_id: string; student_id: string; amount: number; reason: string }) {
    const id = uid('cn');
    const cnNum = `CN-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    execTransaction(() => {
      execWrite(
        `INSERT INTO credit_notes (id, institution_id, invoice_id, student_id, credit_note_no, amount, reason, status, created_by)
         VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, 'issued', ${BURSAR_ID_SQL})`,
        [id, data.invoice_id, data.student_id, cnNum, data.amount, data.reason]
      );
      // Reduce invoice balance
      execWrite(`UPDATE invoices SET balance = MAX(0, balance - ?), paid_amount = paid_amount + ?, updated_at=datetime('now') WHERE id=?`,
        [data.amount, data.amount, data.invoice_id]);
      execWrite(
        `UPDATE student_financial_profiles SET total_balance = MAX(0, total_balance - ?), updated_at=datetime('now') WHERE student_id=?`,
        [data.amount, data.student_id]
      );
      audit('create', 'credit_note', id, `Credit note ${cnNum} for UGX ${data.amount.toLocaleString()}: ${data.reason}`);
    });
    return id;
  },
};

// ── Payments & Receipts ────────────────────────────────────────────

export const PaymentService = {
  list(filters: { student_id?: string; method?: string; search?: string; limit?: number } = {}) {
    const conditions: string[] = ['p.deleted_at IS NULL'];
    const params: any[] = [];
    if (filters.student_id) { conditions.push('p.student_id = ?'); params.push(filters.student_id); }
    if (filters.method) { conditions.push('p.payment_method = ?'); params.push(filters.method); }
    if (filters.search) { conditions.push("(p.payment_number LIKE ? OR s.first_name || ' ' || s.last_name LIKE ?)"); params.push(`%${filters.search}%`, `%${filters.search}%`); }
    const limit = filters.limit ?? 50;
    params.push(limit);

    return execQuery(
      `SELECT p.*, s.first_name || ' ' || s.last_name as student_name,
              c.name as class_name
       FROM payments p
       JOIN students s ON s.id = p.student_id
       LEFT JOIN classes c ON c.id = s.class_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.payment_date DESC
       LIMIT ?`,
      params
    );
  },

  getStats() {
    return execQueryOne<{
      total_collected: number; total_today: number; total_this_month: number;
      payment_count: number; methods: string;
    }>(
      `SELECT COALESCE(SUM(amount),0) as total_collected,
              COALESCE(SUM(CASE WHEN payment_date = date('now') THEN amount ELSE 0 END),0) as total_today,
              COALESCE(SUM(CASE WHEN strftime('%Y-%m',payment_date) = strftime('%Y-%m','now') THEN amount ELSE 0 END),0) as total_this_month,
              COUNT(*) as payment_count
       FROM payments WHERE deleted_at IS NULL AND status != 'cancelled'`
    );
  },

  listReceipts(limit = 50) {
    return execQuery(
      `SELECT r.*, p.student_id, s.first_name || ' ' || s.last_name as student_name
       FROM receipts r
       LEFT JOIN payments p ON p.id = r.payment_id
       LEFT JOIN students s ON s.id = p.student_id
       ORDER BY r.receipt_date DESC
       LIMIT ?`, [limit]
    );
  },

  create(data: {
    student_id: string; guardian_id?: string; amount: number;
    payment_method: string; reference_no?: string; received_by: string;
  }) {
    const id = uid('pay');
    const payNum = `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    execTransaction(() => {
      execWrite(
        `INSERT INTO payments (id, institution_id, student_id, guardian_id, payment_number, payment_date, amount, payment_method, reference_no, status, received_by, created_by)
         VALUES (?, (SELECT id FROM institutions LIMIT 1), ?, ?, ?, date('now'), ?, ?, ?, 'recorded', ?, ?)`,
        [id, data.student_id, data.guardian_id ?? null, payNum, data.amount, data.payment_method, data.reference_no ?? '', data.received_by, data.received_by]
      );
      // Auto-create receipt
      execWrite(
        `INSERT INTO receipts (id, institution_id, payment_id, receipt_number, receipt_date, amount, student_name, payment_method, issued_by, status)
         VALUES (?, (SELECT id FROM institutions LIMIT 1), ?, ?, date('now'), ?, (SELECT first_name || ' ' || last_name FROM students WHERE id = ?), ?, ?, 'issued')`,
        [uid('rcpt'), id, `RCT-${payNum.slice(4)}`, data.amount, data.student_id, data.payment_method, data.received_by]
      );
    });
    return id;
  },
};

// ── Collections ────────────────────────────────────────────────────

export const CollectionsService = {
  getAgingBuckets() {
    return execQuery(
      `SELECT
         CASE
           WHEN julianday('now') - julianday(i.due_date) <= 0 THEN 'Current'
           WHEN julianday('now') - julianday(i.due_date) <= 30 THEN '1-30 Days'
           WHEN julianday('now') - julianday(i.due_date) <= 60 THEN '31-60 Days'
           WHEN julianday('now') - julianday(i.due_date) <= 90 THEN '61-90 Days'
           ELSE '90+ Days'
         END as bucket,
         COUNT(DISTINCT i.student_id) as student_count,
         CAST(COALESCE(SUM(i.balance),0) AS INTEGER) as amount
       FROM invoices i
       WHERE i.balance > 0 AND i.deleted_at IS NULL AND i.status != 'cancelled'
       GROUP BY bucket
       ORDER BY CASE bucket
         WHEN 'Current' THEN 1 WHEN '1-30 Days' THEN 2
         WHEN '31-60 Days' THEN 3 WHEN '61-90 Days' THEN 4 ELSE 5
       END`
    );
  },

  getFollowUps(limit = 50) {
    return execQuery(
      `SELECT cf.*, s.first_name || ' ' || s.last_name as student_name
       FROM collection_followups cf
       JOIN students s ON s.id = cf.student_id
       ORDER BY cf.followup_date DESC
       LIMIT ?`, [limit]
    );
  },

  getCommitments(status?: string) {
    const conditions = ['1=1'];
    const params: any[] = [];
    if (status) { conditions.push('pc.status = ?'); params.push(status); }
    return execQuery(
      `SELECT pc.*, s.first_name || ' ' || s.last_name as student_name
       FROM payment_commitments pc
       JOIN students s ON s.id = pc.student_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY pc.promised_date`, params
    );
  },
};

// ── Transport ──────────────────────────────────────────────────────

export const TransportService = {
  listRoutes() {
    return execQuery(
      `SELECT tr.*,
              (SELECT COUNT(*) FROM student_transport_assignments sta WHERE sta.route_id = tr.id AND sta.status='active') as current_students
       FROM transport_routes tr
       WHERE tr.status = 'active'
       ORDER BY tr.route_name`
    );
  },

  getRouteStudents(routeId: string) {
    return execQuery(
      `SELECT sta.*, s.first_name || ' ' || s.last_name as student_name,
              s.admission_no, c.name as class_name
       FROM student_transport_assignments sta
       JOIN students s ON s.id = sta.student_id
       LEFT JOIN classes c ON c.id = s.class_id
       WHERE sta.route_id = ? AND sta.status = 'active'
       ORDER BY s.last_name`, [routeId]
    );
  },

  getStats() {
    return execQueryOne<{
      total_routes: number; total_students: number; total_revenue: number; avg_utilization: number;
    }>(
      `SELECT COUNT(DISTINCT tr.id) as total_routes,
              COUNT(DISTINCT sta.student_id) as total_students,
              COALESCE(SUM(tr.cost_per_term),0) as total_revenue,
              CASE WHEN COUNT(tr.id)>0
                THEN CAST(AVG(CAST(tr.current_students AS REAL)/NULLIF(tr.vehicle_capacity,0)*100) AS INTEGER)
                ELSE 0 END as avg_utilization
       FROM transport_routes tr
       LEFT JOIN student_transport_assignments sta ON sta.route_id = tr.id AND sta.status='active'
       WHERE tr.status='active'`
    );
  },

  createRoute(data: {
    route_name: string; route_code?: string; cost_per_term: number;
    distance_km?: number; driver_name?: string; driver_phone?: string;
    vehicle_reg?: string; vehicle_capacity?: number;
  }) {
    const id = uid('tr');
    execWrite(
      `INSERT INTO transport_routes (id, institution_id, route_name, route_code, distance_km, cost_per_term, driver_name, driver_phone, vehicle_reg, vehicle_capacity, status, created_by)
       VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ${BURSAR_ID_SQL})`,
      [id, data.route_name, data.route_code ?? '', data.distance_km ?? 0,
       data.cost_per_term, data.driver_name ?? '', data.driver_phone ?? '',
       data.vehicle_reg ?? '', data.vehicle_capacity ?? 50]
    );
    audit('create', 'transport_route', id, `Created route: ${data.route_name}`);
    return id;
  },

  assignStudent(data: { student_id: string; route_id: string; direction?: string }) {
    const id = uid('sta');
    execTransaction(() => {
      execWrite(
        `INSERT INTO student_transport_assignments (id, student_id, route_id, direction, status, assigned_by)
         VALUES (?, ?, ?, ?, 'active', ${BURSAR_ID_SQL})`,
        [id, data.student_id, data.route_id, data.direction ?? 'both']
      );
      execWrite(`UPDATE transport_routes SET current_students = current_students + 1 WHERE id=?`, [data.route_id]);
      execWrite(`UPDATE students SET has_transport=1 WHERE id=?`, [data.student_id]);
      audit('assign', 'transport', id, `Assigned student to route`);
    });
    return id;
  },
};

// ── Inventory ──────────────────────────────────────────────────────

export const InventoryService = {
  listItems(category?: string) {
    const where = category ? 'WHERE ii.status = ? AND ii.category = ?' : 'WHERE ii.status = ?';
    const params = category ? ['active', category] : ['active'];
    return execQuery(
      `SELECT ii.* FROM inventory_items ii ${where} ORDER BY ii.name`, params
    );
  },

  getStats() {
    return execQueryOne<{
      total_items: number; total_value: number; low_stock_count: number; categories: number;
    }>(
      `SELECT COUNT(*) as total_items,
              COALESCE(SUM(unit_cost * quantity_on_hand),0) as total_value,
              SUM(CASE WHEN quantity_on_hand <= reorder_level THEN 1 ELSE 0 END) as low_stock_count,
              COUNT(DISTINCT category) as categories
       FROM inventory_items WHERE status='active'`
    );
  },

  getKitchenItems() {
    return execQuery(`SELECT * FROM kitchen_items WHERE status='active' ORDER BY name`);
  },

  getKitchenStats() {
    return execQueryOne<{
      total_items: number; total_value: number; low_stock: number;
    }>(
      `SELECT COUNT(*) as total_items,
              COALESCE(SUM(unit_cost * quantity_on_hand),0) as total_value,
              SUM(CASE WHEN quantity_on_hand <= min_stock_level THEN 1 ELSE 0 END) as low_stock
       FROM kitchen_items WHERE status='active'`
    );
  },

  addItem(data: {
    name: string; category: string; unit_of_measure?: string;
    unit_cost: number; quantity_on_hand?: number; reorder_level?: number;
    supplier_id?: string; location?: string;
  }) {
    const id = uid('ii');
    const sku = `SKU-${Date.now().toString().slice(-5)}`;
    execWrite(
      `INSERT INTO inventory_items (id, institution_id, name, sku, category, unit_of_measure, unit_cost, quantity_on_hand, reorder_level, supplier_id, location, status, created_by)
       VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ${BURSAR_ID_SQL})`,
      [id, data.name, sku, data.category, data.unit_of_measure ?? 'piece',
       data.unit_cost, data.quantity_on_hand ?? 0, data.reorder_level ?? 10,
       data.supplier_id ?? null, data.location ?? '']
    );
    audit('create', 'inventory_item', id, `Added item: ${data.name}`);
    return id;
  },

  adjustStock(itemId: string, adjustmentType: string, quantity: number, reason: string) {
    const id = uid('sa');
    execTransaction(() => {
      execWrite(
        `INSERT INTO stock_adjustments (id, institution_id, item_id, adjustment_type, quantity, reason, created_by)
         VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ${BURSAR_ID_SQL})`,
        [id, itemId, adjustmentType, quantity, reason]
      );
      const sign = (adjustmentType === 'increase' || adjustmentType === 'correction') ? '+' : '-';
      execWrite(`UPDATE inventory_items SET quantity_on_hand = MAX(0, quantity_on_hand ${sign} ?), updated_at=datetime('now') WHERE id=?`,
        [quantity, itemId]);
      audit('adjust_stock', 'inventory_item', itemId, `${adjustmentType}: ${quantity} units - ${reason}`);
    });
    return id;
  },
};

// ── Accounting ─────────────────────────────────────────────────────

export const AccountingService = {
  getChartOfAccounts() {
    return execQuery(
      `SELECT * FROM chart_of_accounts WHERE is_active=1 ORDER BY code`
    );
  },

  getTrialBalance() {
    return execQuery(
      `SELECT coa.code, coa.name, coa.account_type, coa.normal_balance,
              COALESCE(SUM(jl.debit_amount),0) as total_debit,
              COALESCE(SUM(jl.credit_amount),0) as total_credit,
              COALESCE(SUM(jl.debit_amount),0) - COALESCE(SUM(jl.credit_amount),0) as balance
       FROM chart_of_accounts coa
       LEFT JOIN journal_lines jl ON jl.account_id = coa.id
       LEFT JOIN journals j ON j.id = jl.journal_id AND j.status = 'posted'
       WHERE coa.is_active = 1 AND coa.is_header = 0
       GROUP BY coa.id
       HAVING total_debit > 0 OR total_credit > 0
       ORDER BY coa.code`
    );
  },

  listJournals(status?: string, limit = 50) {
    const where = status ? 'WHERE j.status = ?' : '';
    const params = status ? [status, limit] : [limit];
    return execQuery(
      `SELECT j.*, u.first_name || ' ' || u.last_name as created_by_name
       FROM journals j
       LEFT JOIN users u ON u.id = j.created_by
       ${where}
       ORDER BY j.journal_date DESC
       LIMIT ?`, params
    );
  },

  getJournal(id: string) {
    const journal = execQueryOne(
      `SELECT j.* FROM journals j WHERE j.id = ?`, [id]
    );
    if (!journal) return null;
    const lines = execQuery(
      `SELECT jl.*, coa.code as account_code, coa.name as account_name
       FROM journal_lines jl
       JOIN chart_of_accounts coa ON coa.id = jl.account_id
       WHERE jl.journal_id = ?
       ORDER BY jl.debit_amount DESC`, [id]
    );
    return { ...journal, lines };
  },

  getBankAccounts() {
    return execQuery(`SELECT * FROM bank_accounts WHERE is_active=1 ORDER BY account_name`);
  },

  getPeriods() {
    return execQuery(`SELECT * FROM accounting_periods ORDER BY start_date DESC`);
  },

  createJournal(data: {
    description: string; journal_date?: string;
    lines: Array<{ account_id: string; debit_amount: number; credit_amount: number; description?: string }>;
  }) {
    const id = uid('jnl');
    const jnlNum = `JE-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const totalDebit = data.lines.reduce((s, l) => s + (l.debit_amount || 0), 0);
    const totalCredit = data.lines.reduce((s, l) => s + (l.credit_amount || 0), 0);
    const jDate = data.journal_date ?? todayISO();
    const period = execQueryOne<any>(`SELECT id FROM accounting_periods WHERE ? BETWEEN start_date AND end_date AND status='open' LIMIT 1`, [jDate]);

    execTransaction(() => {
      execWrite(
        `INSERT INTO journals (id, institution_id, journal_number, journal_date, description, total_debit, total_credit, status, period_id, created_by)
         VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, 'draft', ?, ${BURSAR_ID_SQL})`,
        [id, jnlNum, jDate, data.description, totalDebit, totalCredit, period?.id ?? null]
      );
      data.lines.forEach(line => {
        execWrite(
          `INSERT INTO journal_lines (id, journal_id, account_id, debit_amount, credit_amount, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [uid('jl'), id, line.account_id, line.debit_amount || 0, line.credit_amount || 0, line.description ?? '']
        );
      });
      audit('create', 'journal', id, `Created journal ${jnlNum}: ${data.description}`);
    });
    return id;
  },

  postJournal(id: string) {
    execTransaction(() => {
      execWrite(`UPDATE journals SET status='posted', updated_at=datetime('now') WHERE id=? AND status IN ('draft','approved')`, [id]);
      execWrite(
        `INSERT INTO journal_postings (id, journal_id, posted_by, period_id)
         VALUES (?, ?, ${BURSAR_ID_SQL}, (SELECT period_id FROM journals WHERE id=?))`,
        [uid('jp'), id, id]
      );
      audit('post', 'journal', id, 'Journal posted', 'medium');
    });
  },

  approveJournal(id: string) {
    execWrite(`UPDATE journals SET status='approved', updated_at=datetime('now') WHERE id=? AND status='draft'`, [id]);
    execWrite(
      `INSERT INTO journal_approvals (id, journal_id, approver_id, action)
       VALUES (?, ?, ${BURSAR_ID_SQL}, 'approve')`, [uid('ja'), id]
    );
    audit('approve', 'journal', id, 'Journal approved');
  },
};

// ── Budget ─────────────────────────────────────────────────────────

export const BudgetService = {
  list() {
    return execQuery(
      `SELECT b.*, ay.name as academic_year, camp.name as campus_name,
              u.first_name || ' ' || u.last_name as created_by_name
       FROM budgets b
       LEFT JOIN academic_years ay ON ay.id = b.academic_year_id
       LEFT JOIN campuses camp ON camp.id = b.campus_id
       LEFT JOIN users u ON u.id = b.created_by
       ORDER BY b.created_at DESC`
    );
  },

  getLines(budgetId: string) {
    return execQuery(
      `SELECT bl.*, bc.name as category_name
       FROM budget_lines bl
       LEFT JOIN budget_categories bc ON bc.id = bl.category_id
       WHERE bl.budget_id = ?
       ORDER BY bc.name, bl.description`, [budgetId]
    );
  },

  getStats() {
    return execQueryOne<{
      total_budgeted: number; total_actual: number; total_variance: number; budget_count: number;
    }>(
      `SELECT COALESCE(SUM(bl.budgeted_amount),0) as total_budgeted,
              COALESCE(SUM(bl.actual_amount),0) as total_actual,
              COALESCE(SUM(bl.variance),0) as total_variance,
              COUNT(DISTINCT bl.budget_id) as budget_count
       FROM budget_lines bl`
    );
  },

  getCategories() {
    return execQuery(`SELECT * FROM budget_categories WHERE status='active' ORDER BY name`);
  },

  create(data: { name: string; academic_year_id?: string; campus_id?: string; notes?: string }) {
    const id = uid('bgt');
    execWrite(
      `INSERT INTO budgets (id, institution_id, campus_id, academic_year_id, name, status, notes, created_by)
       VALUES (?, ${INST_SQL}, ?, ?, ?, 'draft', ?, ${BURSAR_ID_SQL})`,
      [id, data.campus_id ?? null, data.academic_year_id ?? null, data.name, data.notes ?? '']
    );
    audit('create', 'budget', id, `Created budget: ${data.name}`);
    return id;
  },

  addLine(data: {
    budget_id: string; category_id?: string; period: string;
    description: string; budgeted_amount: number;
  }) {
    const id = uid('bl');
    execWrite(
      `INSERT INTO budget_lines (id, budget_id, category_id, period, description, budgeted_amount, variance)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.budget_id, data.category_id ?? null, data.period, data.description, data.budgeted_amount, data.budgeted_amount]
    );
    // Update budget total
    execWrite(`UPDATE budgets SET total_amount = (SELECT COALESCE(SUM(budgeted_amount),0) FROM budget_lines WHERE budget_id=?) WHERE id=?`,
      [data.budget_id, data.budget_id]);
    return id;
  },

  approveBudget(id: string) {
    execWrite(`UPDATE budgets SET status='approved', approved_by=${BURSAR_ID_SQL}, approved_at=datetime('now') WHERE id=?`, [id]);
    audit('approve', 'budget', id, 'Budget approved', 'medium');
  },
};

// ── Payroll ────────────────────────────────────────────────────────

export const PayrollService = {
  listEmployees(filters: { department?: string; status?: string; search?: string } = {}) {
    const conditions: string[] = ['e.deleted_at IS NULL'];
    const params: any[] = [];
    if (filters.department) { conditions.push('e.department = ?'); params.push(filters.department); }
    if (filters.status) { conditions.push('e.status = ?'); params.push(filters.status); }
    if (filters.search) { conditions.push("(e.first_name || ' ' || e.last_name LIKE ? OR e.employee_number LIKE ?)"); params.push(`%${filters.search}%`, `%${filters.search}%`); }

    return execQuery(
      `SELECT e.* FROM employees e WHERE ${conditions.join(' AND ')} ORDER BY e.last_name, e.first_name`,
      params
    );
  },

  listPayrollRuns() {
    return execQuery(
      `SELECT pr.*, u.first_name || ' ' || u.last_name as created_by_name
       FROM payroll_runs pr
       LEFT JOIN users u ON u.id = pr.created_by
       ORDER BY pr.run_date DESC`
    );
  },

  getPayrollRunItems(runId: string) {
    return execQuery(
      `SELECT pri.*, e.first_name || ' ' || e.last_name as employee_name,
              e.employee_number, e.department, e.position
       FROM payroll_run_items pri
       JOIN employees e ON e.id = pri.employee_id
       WHERE pri.run_id = ?
       ORDER BY e.last_name`, [runId]
    );
  },

  getStats() {
    return execQueryOne<{
      total_employees: number; monthly_payroll: number; total_ytd: number;
    }>(
      `SELECT COUNT(*) as total_employees,
              (SELECT COALESCE(SUM(total_net),0) FROM payroll_runs WHERE strftime('%Y-%m',run_date)=strftime('%Y-%m','now')) as monthly_payroll,
              (SELECT COALESCE(SUM(total_net),0) FROM payroll_runs WHERE strftime('%Y',run_date)=strftime('%Y','now')) as total_ytd
       FROM employees WHERE status='active' AND deleted_at IS NULL`
    );
  },

  createEmployee(data: {
    first_name: string; last_name: string; department: string; position: string;
    hire_date: string; basic_salary: number; bank_name?: string; bank_account?: string;
    tax_id?: string; social_security_no?: string;
  }) {
    const id = uid('emp');
    const empNum = `EMP-${Date.now().toString().slice(-5)}`;
    execWrite(
      `INSERT INTO employees (id, institution_id, employee_number, first_name, last_name, department, position, hire_date, basic_salary, gross_salary, bank_name, bank_account, tax_id, social_security_no, status, created_by)
       VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ${BURSAR_ID_SQL})`,
      [id, empNum, data.first_name, data.last_name, data.department, data.position,
       data.hire_date, data.basic_salary, data.basic_salary, data.bank_name ?? '', data.bank_account ?? '',
       data.tax_id ?? '', data.social_security_no ?? '']
    );
    audit('create', 'employee', id, `Registered ${data.first_name} ${data.last_name} (${empNum})`);
    return id;
  },

  updateEmployee(id: string, data: Partial<{
    first_name: string; last_name: string; department: string; position: string;
    basic_salary: number; bank_name: string; bank_account: string;
  }>) {
    const fields: string[] = [];
    const params: any[] = [];
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) { fields.push(`${k}=?`); params.push(v); }
    });
    if (fields.length === 0) return;
    if (data.basic_salary !== undefined) { fields.push('gross_salary=?'); params.push(data.basic_salary); }
    fields.push("updated_at=datetime('now')");
    params.push(id);
    execWrite(`UPDATE employees SET ${fields.join(', ')} WHERE id=?`, params);
    audit('update', 'employee', id, `Updated: ${Object.keys(data).join(', ')}`);
  },

  terminateEmployee(id: string, reason: string) {
    execWrite(`UPDATE employees SET status='terminated', termination_date=date('now'), updated_at=datetime('now') WHERE id=?`, [id]);
    audit('terminate', 'employee', id, `Terminated: ${reason}`, 'high');
  },

  runPayroll(payPeriod: string) {
    const id = uid('pr');
    const employees = execQuery<any>(`SELECT id, basic_salary, gross_salary FROM employees WHERE status='active' AND deleted_at IS NULL`);
    let totalGross = 0, totalDeductions = 0, totalNet = 0;

    execTransaction(() => {
      execWrite(
        `INSERT INTO payroll_runs (id, institution_id, pay_period, run_date, status, created_by)
         VALUES (?, ${INST_SQL}, ?, date('now'), 'calculated', ${BURSAR_ID_SQL})`,
        [id, payPeriod]
      );
      employees.forEach(emp => {
        const gross = Number(emp.gross_salary) || 0;
        const paye = gross > 410000 ? Math.round((gross - 410000) * 0.3) : 0;
        const nssf = Math.round(gross * 0.05);
        const totalDed = paye + nssf;
        const net = gross - totalDed;
        totalGross += gross; totalDeductions += totalDed; totalNet += net;

        execWrite(
          `INSERT INTO payroll_run_items (id, run_id, employee_id, basic_salary, total_earnings, gross_salary, paye, nssf, total_deductions, net_salary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [uid('pri'), id, emp.id, emp.basic_salary, 0, gross, paye, nssf, totalDed, net]
        );
      });
      execWrite(
        `UPDATE payroll_runs SET total_gross=?, total_deductions=?, total_net=?, employee_count=? WHERE id=?`,
        [totalGross, totalDeductions, totalNet, employees.length, id]
      );
      audit('run_payroll', 'payroll_run', id, `Payroll for ${payPeriod}: ${employees.length} employees, net UGX ${totalNet.toLocaleString()}`, 'high');
    });
    return id;
  },
};

// ── Accounts Payable ───────────────────────────────────────────────

export const APService = {
  listSuppliers() {
    return execQuery(
      `SELECT sup.*,
              COALESCE((SELECT SUM(balance) FROM supplier_invoices si WHERE si.supplier_id=sup.id AND si.balance>0),0) as outstanding
       FROM suppliers sup
       WHERE sup.deleted_at IS NULL AND sup.status='active'
       ORDER BY sup.name`
    );
  },

  listBills(status?: string) {
    const where = status ? 'WHERE si.status = ?' : '';
    const params = status ? [status] : [];
    return execQuery(
      `SELECT si.*, sup.name as supplier_name
       FROM supplier_invoices si
       JOIN suppliers sup ON sup.id = si.supplier_id
       ${where}
       ORDER BY si.invoice_date DESC`, params
    );
  },

  getStats() {
    return execQueryOne<{
      total_payable: number; overdue: number; due_this_month: number; supplier_count: number;
    }>(
      `SELECT COALESCE(SUM(si.balance),0) as total_payable,
              COALESCE(SUM(CASE WHEN si.due_date < date('now') AND si.balance > 0 THEN si.balance ELSE 0 END),0) as overdue,
              COALESCE(SUM(CASE WHEN strftime('%Y-%m',si.due_date)=strftime('%Y-%m','now') THEN si.balance ELSE 0 END),0) as due_this_month,
              COUNT(DISTINCT si.supplier_id) as supplier_count
       FROM supplier_invoices si WHERE si.status != 'paid'`
    );
  },

  createSupplier(data: {
    name: string; contact_person?: string; email?: string; phone?: string;
    address?: string; tax_id?: string; payment_terms?: number;
  }) {
    const id = uid('sup');
    execWrite(
      `INSERT INTO suppliers (id, institution_id, name, contact_person, email, phone, address, tax_id, payment_terms, status, created_by)
       VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, ?, ?, 'active', ${BURSAR_ID_SQL})`,
      [id, data.name, data.contact_person ?? '', data.email ?? '', data.phone ?? '',
       data.address ?? '', data.tax_id ?? '', data.payment_terms ?? 30]
    );
    audit('create', 'supplier', id, `Registered supplier: ${data.name}`);
    return id;
  },

  createBill(data: {
    supplier_id: string; invoice_number: string; invoice_date: string;
    due_date: string; total_amount: number; notes?: string;
  }) {
    const id = uid('si');
    execWrite(
      `INSERT INTO supplier_invoices (id, institution_id, supplier_id, invoice_number, invoice_date, due_date, total_amount, balance, status, notes, created_by)
       VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, ?, 'approved', ?, ${BURSAR_ID_SQL})`,
      [id, data.supplier_id, data.invoice_number, data.invoice_date, data.due_date,
       data.total_amount, data.total_amount, data.notes ?? '']
    );
    audit('create', 'supplier_invoice', id, `Bill ${data.invoice_number} for UGX ${data.total_amount.toLocaleString()}`);
    return id;
  },

  payBill(billId: string, amount: number, paymentMethod: string) {
    execTransaction(() => {
      const bill = execQueryOne<any>(`SELECT supplier_id, balance FROM supplier_invoices WHERE id=?`, [billId]);
      if (!bill) return;
      const newBalance = Math.max(0, Number(bill.balance) - amount);
      const newStatus = newBalance <= 0 ? 'paid' : 'partially_paid';
      execWrite(`UPDATE supplier_invoices SET paid_amount = paid_amount + ?, balance = ?, status = ? WHERE id=?`,
        [amount, newBalance, newStatus, billId]);
      execWrite(
        `INSERT INTO expense_payments (id, institution_id, supplier_invoice_id, supplier_id, amount, payment_date, payment_method, status, created_by)
         VALUES (?, ${INST_SQL}, ?, ?, ?, date('now'), ?, 'completed', ${BURSAR_ID_SQL})`,
        [uid('ep'), billId, bill.supplier_id, amount, paymentMethod]
      );
      audit('payment', 'supplier_invoice', billId, `Paid UGX ${amount.toLocaleString()} via ${paymentMethod}`, 'medium');
    });
  },
};

// ── Assets ─────────────────────────────────────────────────────────

export const AssetService = {
  list() {
    return execQuery(
      `SELECT fa.*, ac.name as category_name
       FROM fixed_assets fa
       LEFT JOIN asset_categories ac ON ac.id = fa.category_id
       ORDER BY fa.asset_number`
    );
  },

  getStats() {
    return execQueryOne<{
      total_assets: number; total_cost: number; total_depr: number; total_nbv: number;
    }>(
      `SELECT COUNT(*) as total_assets,
              COALESCE(SUM(acquisition_cost),0) as total_cost,
              COALESCE(SUM(accumulated_depr),0) as total_depr,
              COALESCE(SUM(net_book_value),0) as total_nbv
       FROM fixed_assets WHERE status != 'disposed'`
    );
  },

  getCategories() {
    return execQuery(
      `SELECT ac.*, COUNT(fa.id) as asset_count, COALESCE(SUM(fa.acquisition_cost),0) as total_value
       FROM asset_categories ac
       LEFT JOIN fixed_assets fa ON fa.category_id = ac.id AND fa.status != 'disposed'
       GROUP BY ac.id
       ORDER BY ac.name`
    );
  },

  create(data: {
    description: string; category_id: string; acquisition_date: string;
    acquisition_cost: number; useful_life_months: number; residual_value?: number;
    location?: string; serial_number?: string;
  }) {
    const id = uid('fa');
    const assetNum = `AST-${Date.now().toString().slice(-5)}`;
    const residual = data.residual_value ?? 0;
    const nbv = data.acquisition_cost - residual;
    execWrite(
      `INSERT INTO fixed_assets (id, institution_id, asset_number, description, category_id, acquisition_date, acquisition_cost, residual_value, useful_life_months, net_book_value, location, serial_number, status, created_by)
       VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ${BURSAR_ID_SQL})`,
      [id, assetNum, data.description, data.category_id, data.acquisition_date,
       data.acquisition_cost, residual, data.useful_life_months, nbv, data.location ?? '', data.serial_number ?? '']
    );
    audit('create', 'fixed_asset', id, `Registered asset ${assetNum}: ${data.description}`);
    return id;
  },

  dispose(id: string, proceeds: number) {
    execTransaction(() => {
      execWrite(
        `UPDATE fixed_assets SET status='disposed', disposed_date=date('now'), disposal_proceeds=? WHERE id=?`,
        [proceeds, id]
      );
      audit('dispose', 'fixed_asset', id, `Disposed for UGX ${proceeds.toLocaleString()}`, 'high');
    });
  },

  runDepreciation(period: string) {
    const assets = execQuery<any>(
      `SELECT id, acquisition_cost, residual_value, useful_life_months, accumulated_depr, net_book_value
       FROM fixed_assets WHERE status='active' AND net_book_value > 0`
    );
    let count = 0;
    execTransaction(() => {
      assets.forEach(a => {
        const monthlyDepr = (Number(a.acquisition_cost) - Number(a.residual_value || 0)) / Number(a.useful_life_months);
        const newAccum = Number(a.accumulated_depr || 0) + monthlyDepr;
        const newNBV = Math.max(0, Number(a.acquisition_cost) - newAccum);
        execWrite(`UPDATE fixed_assets SET accumulated_depr=?, net_book_value=? WHERE id=?`, [newAccum, newNBV, a.id]);
        execWrite(
          `INSERT OR IGNORE INTO depreciation_runs (id, institution_id, asset_id, period, amount, accumulated, net_book_value)
           VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?)`,
          [uid('dr'), a.id, period, monthlyDepr, newAccum, newNBV]
        );
        count++;
      });
      audit('depreciation', 'fixed_asset', period, `Depreciation run: ${count} assets for period ${period}`, 'medium');
    });
    return count;
  },
};

// ── Treasury ───────────────────────────────────────────────────────

export const TreasuryService = {
  getCashPosition() {
    return execQuery(
      `SELECT ba.*, COALESCE(ba.current_balance,0) as balance
       FROM bank_accounts ba WHERE ba.is_active=1
       ORDER BY ba.current_balance DESC`
    );
  },

  getForecasts() {
    return execQuery(`SELECT * FROM cash_forecasts ORDER BY forecast_date`);
  },

  getTotalCash() {
    return execScalar<number>(`SELECT COALESCE(SUM(current_balance),0) FROM bank_accounts WHERE is_active=1`) ?? 0;
  },
};

// ── Scholarships ───────────────────────────────────────────────────

export const ScholarshipService = {
  listSponsors() {
    return execQuery(
      `SELECT sp.*, COUNT(sch.id) as scholarship_count
       FROM sponsors sp
       LEFT JOIN scholarships sch ON sch.sponsor_id = sp.id AND sch.status='active'
       WHERE sp.status='active'
       GROUP BY sp.id
       ORDER BY sp.name`
    );
  },

  listScholarships() {
    return execQuery(
      `SELECT sch.*, sp.name as sponsor_name
       FROM scholarships sch
       JOIN sponsors sp ON sp.id = sch.sponsor_id
       WHERE sch.status='active'
       ORDER BY sch.name`
    );
  },

  listApplications(status?: string) {
    const where = status ? 'WHERE ba.status = ?' : '';
    const params = status ? [status] : [];
    return execQuery(
      `SELECT ba.*, s.first_name || ' ' || s.last_name as student_name,
              sch.name as scholarship_name
       FROM bursary_applications ba
       JOIN students s ON s.id = ba.student_id
       LEFT JOIN scholarships sch ON sch.id = ba.scholarship_id
       ${where}
       ORDER BY ba.created_at DESC`, params
    );
  },

  getStats() {
    return execQueryOne<{
      total_sponsors: number; total_scholarships: number; total_beneficiaries: number;
      total_committed: number; total_disbursed: number;
    }>(
      `SELECT COUNT(DISTINCT sp.id) as total_sponsors,
              COUNT(DISTINCT sch.id) as total_scholarships,
              COALESCE(SUM(sch.current_students),0) as total_beneficiaries,
              COALESCE(SUM(sp.total_committed),0) as total_committed,
              COALESCE(SUM(sp.total_disbursed),0) as total_disbursed
       FROM sponsors sp
       LEFT JOIN scholarships sch ON sch.sponsor_id = sp.id AND sch.status='active'
       WHERE sp.status='active'`
    );
  },

  createSponsor(data: {
    name: string; type?: string; contact_person?: string;
    phone?: string; email?: string; total_committed?: number;
  }) {
    const id = uid('sp');
    execWrite(
      `INSERT INTO sponsors (id, institution_id, name, type, contact_person, phone, email, total_committed, status, created_by)
       VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, ?, 'active', ${BURSAR_ID_SQL})`,
      [id, data.name, data.type ?? 'individual', data.contact_person ?? '',
       data.phone ?? '', data.email ?? '', data.total_committed ?? 0]
    );
    audit('create', 'sponsor', id, `Created sponsor: ${data.name}`);
    return id;
  },

  createScholarship(data: {
    sponsor_id: string; name: string; type?: string; coverage_pct?: number;
    max_amount?: number; max_students?: number; criteria?: string;
  }) {
    const id = uid('sch');
    execWrite(
      `INSERT INTO scholarships (id, institution_id, sponsor_id, name, type, coverage_pct, max_amount, max_students, criteria, status, created_by)
       VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, ?, ?, 'active', ${BURSAR_ID_SQL})`,
      [id, data.sponsor_id, data.name, data.type ?? 'partial', data.coverage_pct ?? 100,
       data.max_amount ?? 0, data.max_students ?? 0, data.criteria ?? '']
    );
    audit('create', 'scholarship', id, `Created scholarship: ${data.name}`);
    return id;
  },

  submitApplication(data: {
    student_id: string; scholarship_id: string; amount_requested: number;
    justification?: string; family_income?: number;
  }) {
    const id = uid('ba');
    execWrite(
      `INSERT INTO bursary_applications (id, institution_id, student_id, scholarship_id, amount_requested, justification, family_income, status, created_by)
       VALUES (?, ${INST_SQL}, ?, ?, ?, ?, ?, 'submitted', ${BURSAR_ID_SQL})`,
      [id, data.student_id, data.scholarship_id, data.amount_requested,
       data.justification ?? '', data.family_income ?? null]
    );
    audit('create', 'bursary_application', id, `Application for UGX ${data.amount_requested.toLocaleString()}`);
    return id;
  },
};

// ── Audit ──────────────────────────────────────────────────────────

export const AuditService = {
  list(filters: { action?: string; entity_type?: string; risk_level?: string; limit?: number } = {}) {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    if (filters.action) { conditions.push('ae.action = ?'); params.push(filters.action); }
    if (filters.entity_type) { conditions.push('ae.entity_type = ?'); params.push(filters.entity_type); }
    if (filters.risk_level) { conditions.push('ae.risk_level = ?'); params.push(filters.risk_level); }
    const limit = filters.limit ?? 100;
    params.push(limit);

    return execQuery(
      `SELECT ae.* FROM audit_events ae
       WHERE ${conditions.join(' AND ')}
       ORDER BY ae.created_at DESC
       LIMIT ?`, params
    );
  },

  getStats() {
    return execQueryOne<{
      total_events: number; high_risk: number; critical: number; today_count: number;
    }>(
      `SELECT COUNT(*) as total_events,
              SUM(CASE WHEN risk_level='high' THEN 1 ELSE 0 END) as high_risk,
              SUM(CASE WHEN risk_level='critical' THEN 1 ELSE 0 END) as critical,
              SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as today_count
       FROM audit_events`
    );
  },
};

// ── Settings ───────────────────────────────────────────────────────

export const SettingsService = {
  getInstitution() {
    return execQueryOne(`SELECT * FROM institutions LIMIT 1`);
  },

  getCampuses() {
    return execQuery(`SELECT * FROM campuses ORDER BY is_main DESC, name`);
  },

  getUsers() {
    return execQuery(`SELECT * FROM users WHERE is_active=1 ORDER BY last_name, first_name`);
  },

  getSettings(category?: string) {
    const where = category ? 'WHERE category = ?' : '';
    const params = category ? [category] : [];
    return execQuery(`SELECT * FROM institution_settings ${where} ORDER BY setting_key`, params);
  },

  updateSetting(key: string, value: string) {
    execWrite(
      `UPDATE institution_settings SET setting_value = ?, updated_at = datetime('now')
       WHERE setting_key = ?`, [value, key]
    );
  },

  getBranding() {
    return execQueryOne(`SELECT * FROM branding_settings LIMIT 1`);
  },

  getRoles() {
    return execQuery(`SELECT * FROM roles ORDER BY name`);
  },

  getAcademicYears() {
    return execQuery(`SELECT * FROM academic_years ORDER BY start_date DESC`);
  },

  getTerms(academicYearId?: string) {
    const where = academicYearId ? 'WHERE t.academic_year_id = ?' : '';
    const params = academicYearId ? [academicYearId] : [];
    return execQuery(`SELECT t.*, ay.name as year_name FROM terms t LEFT JOIN academic_years ay ON ay.id = t.academic_year_id ${where} ORDER BY t.start_date DESC`, params);
  },
};

// ── Reports ────────────────────────────────────────────────────────

export const ReportsService = {
  getClassProfitability() {
    return execQuery(
      `SELECT c.name as class_name,
              COUNT(DISTINCT s.id) as student_count,
              COALESCE(SUM(fp.total_billed),0) as revenue,
              COALESCE(SUM(fp.total_paid),0) as collected,
              COALESCE(SUM(fp.total_balance),0) as outstanding
       FROM classes c
       LEFT JOIN students s ON s.class_id = c.id AND s.status='active'
       LEFT JOIN student_financial_profiles fp ON fp.student_id = s.id
       WHERE c.status='active'
       GROUP BY c.id
       ORDER BY c.level`
    );
  },

  getFeeCompliance() {
    return execQuery(
      `SELECT c.name as class_name,
              COUNT(s.id) as total_students,
              SUM(CASE WHEN COALESCE(fp.total_balance,0) = 0 THEN 1 ELSE 0 END) as fully_paid,
              SUM(CASE WHEN COALESCE(fp.total_balance,0) > 0 AND COALESCE(fp.total_paid,0) > 0 THEN 1 ELSE 0 END) as partial,
              SUM(CASE WHEN COALESCE(fp.total_paid,0) = 0 AND COALESCE(fp.total_billed,0) > 0 THEN 1 ELSE 0 END) as unpaid
       FROM classes c
       LEFT JOIN students s ON s.class_id = c.id AND s.status='active'
       LEFT JOIN student_financial_profiles fp ON fp.student_id = s.id
       WHERE c.status='active'
       GROUP BY c.id
       ORDER BY c.level`
    );
  },

  getTransportROI() {
    return execQuery(
      `SELECT tr.route_name,
              tr.cost_per_term,
              tr.current_students,
              tr.vehicle_capacity,
              CASE WHEN tr.vehicle_capacity > 0
                THEN CAST(CAST(tr.current_students AS REAL)/tr.vehicle_capacity*100 AS INTEGER)
                ELSE 0 END as utilization_pct,
              tr.cost_per_term * tr.current_students as estimated_revenue
       FROM transport_routes tr
       WHERE tr.status='active'
       ORDER BY tr.route_name`
    );
  },

  getCollectionsFunnel() {
    const totalBilled = execScalar<number>(`SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE status != 'cancelled' AND deleted_at IS NULL`) ?? 0;
    const totalPaid = execScalar<number>(`SELECT COALESCE(SUM(paid_amount),0) FROM invoices WHERE status != 'cancelled' AND deleted_at IS NULL`) ?? 0;
    const totalOutstanding = totalBilled - totalPaid;
    const fullyPaid = execScalar<number>(`SELECT COUNT(*) FROM invoices WHERE status='fully_paid' AND deleted_at IS NULL`) ?? 0;
    const partiallyPaid = execScalar<number>(`SELECT COUNT(*) FROM invoices WHERE status='partially_paid' AND deleted_at IS NULL`) ?? 0;
    const overdue = execScalar<number>(`SELECT COUNT(*) FROM invoices WHERE status='overdue' AND deleted_at IS NULL`) ?? 0;

    return { totalBilled, totalPaid, totalOutstanding, fullyPaid, partiallyPaid, overdue };
  },

  getBursaryAnalytics() {
    return {
      byScholarship: execQuery(
        `SELECT sch.name, COUNT(ba.id) as applications,
                SUM(CASE WHEN ba.status='approved' OR ba.status='disbursed' THEN 1 ELSE 0 END) as approved,
                COALESCE(SUM(ba.amount_approved),0) as amount_approved
         FROM scholarships sch
         LEFT JOIN bursary_applications ba ON ba.scholarship_id = sch.id
         GROUP BY sch.id
         ORDER BY sch.name`
      ),
      totals: execQueryOne(
        `SELECT COUNT(*) as total_applications,
                SUM(CASE WHEN status IN ('approved','disbursed') THEN 1 ELSE 0 END) as total_approved,
                COALESCE(SUM(amount_requested),0) as total_requested,
                COALESCE(SUM(amount_approved),0) as total_approved_amount
         FROM bursary_applications`
      ),
    };
  },
};

// ── Bank Reconciliation ────────────────────────────────────────────

export const BankReconService = {
  getBankAccounts() {
    return AccountingService.getBankAccounts();
  },

  getStatementLines(bankAccountId: string) {
    return execQuery(
      `SELECT bsl.* FROM bank_statement_lines bsl
       JOIN bank_statements bs ON bs.id = bsl.statement_id
       WHERE bs.bank_account_id = ?
       ORDER BY bsl.transaction_date DESC`, [bankAccountId]
    );
  },

  getReconciliations() {
    return execQuery(
      `SELECT br.*, ba.account_name
       FROM bank_reconciliations br
       JOIN bank_accounts ba ON ba.id = br.bank_account_id
       ORDER BY br.reconciliation_date DESC`
    );
  },
};

// ── Utility: Database info ─────────────────────────────────────────

export const DBInfoService = {
  getTableCounts() {
    const tables = [
      'institutions', 'campuses', 'users', 'students', 'guardians',
      'invoices', 'payments', 'receipts', 'fee_categories', 'fee_templates',
      'transport_routes', 'inventory_items', 'kitchen_items', 'suppliers',
      'chart_of_accounts', 'journals', 'bank_accounts', 'employees',
      'payroll_runs', 'budgets', 'fixed_assets', 'sponsors', 'scholarships',
      'bursary_applications', 'audit_events',
    ];
    return tables.map(table => {
      try {
        const count = execScalar<number>(`SELECT COUNT(*) FROM ${table}`) ?? 0;
        return { table, count };
      } catch {
        return { table, count: 0 };
      }
    });
  },
};
