/**
 * Payroll Page — Tempo-style
 * Employee management, payroll runs, and payslips
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useDB } from '../database';
import { PayrollService } from '../database/DatabaseService';
import FormModal, { fieldLabel, fieldInput, fieldRow, fieldFull } from '../components/FormModal';

/* ── Data from SQLite ──────────────────────────────────────────── */
function usePayrollData(search: string, ver: number) {
  const { isReady } = useDB();
  const raw = useMemo(() => isReady ? PayrollService.listEmployees({ search: search || undefined }) : [], [isReady, search, ver]);
  const stats = useMemo(() => isReady ? PayrollService.getStats() : null, [isReady]);

  const employees = useMemo(() => raw.map((e: any) => ({
    id: e.employee_number || e.id,
    name: `${e.first_name} ${e.last_name}`,
    dept: e.department || '',
    position: e.position || '',
    grade: 'A',
    gross: Number(e.gross_salary) || 0,
    net: Math.round((Number(e.gross_salary) || 0) * 0.75),
    status: 'Paid' as const,
  })), [raw]);

  return { employees, stats };
}

const payrollTrend = [
  { month: 'Nov', gross: 2650000, net: 1980000 },
  { month: 'Dec', gross: 2700000, net: 2020000 },
  { month: 'Jan', gross: 2800000, net: 2100000 },
  { month: 'Feb', gross: 2850000, net: 2137500 },
  { month: 'Mar', gross: 2850000, net: 2137500 },
  { month: 'Apr', gross: 2900000, net: 2175000 },
];

const deptBreakdown = [
  { label: 'Teaching', value: 52, color: '#3b82f6' },
  { label: 'Administration', value: 22, color: '#f59e0b' },
  { label: 'Support', value: 16, color: '#10b981' },
  { label: 'Finance', value: 10, color: '#a855f7' },
];

export default function PayrollPage() {
  const [period, setPeriod] = useState<'30' | '90' | 'currentFY' | 'lastFY' | 'all'>('30');
  const [search, setSearch] = useState('');
  const [ver, setVer] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', department: 'Teaching', position: '', basic_salary: '' });

  const { employees, stats } = usePayrollData(search, ver);

  const handleSubmit = useCallback(() => {
    if (!form.first_name || !form.last_name || !form.basic_salary) return;
    PayrollService.createEmployee({ ...form, basic_salary: Number(form.basic_salary), hire_date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    setForm({ first_name: '', last_name: '', department: 'Teaching', position: '', basic_salary: '' });
    setVer(v => v + 1);
  }, [form]);

  const filtered = employees;

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Payroll</h1>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 2 }}>
          {([['30', '30 Days'], ['90', '3 Months'], ['currentFY', 'Current FY'], ['lastFY', 'Last FY'], ['all', 'All Time']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v as any)} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: period === v ? 'rgba(255,255,255,0.12)' : 'transparent', color: period === v ? 'var(--text-primary)' : 'var(--text-muted)' }}>{l}</button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
          + Add Employee
        </button>
      </div>

      {/* ── KPI cards ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} title="Total Payroll Cost" value="UGX 78.3M" change="+1.8% vs last month" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /></svg>} title="Employees" value="25" change="3 new this quarter" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><polyline points="20 6 9 17 4 12" /></svg>} title="Net Pay" value="UGX 58.9M" change="75% of gross" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>} title="Statutory Deductions" value="UGX 19.2M" change="PAYE, NSSF, LST" positive={false} />
      </div>

      {/* ── Charts row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Payroll trend */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Payroll Trend</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX 78.3M</span>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Gross this month</span>
              <span style={{ fontSize: 12, color: '#34d399' }}>+1.8% vs prior month</span>
            </div>
          </div>
          <div style={{ padding: '16px 24px 20px' }}>
            <BarChart data={payrollTrend} />
          </div>
        </div>

        {/* Dept breakdown donut */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Department Cost Split</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={deptBreakdown} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>25</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Staff</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {deptBreakdown.map((s) => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Employee table ────────────────────────────────── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Employees</h3>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="input" placeholder="Search employees…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 200, height: 34, fontSize: 12 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <SmBtn label="Filter" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>} />
            <SmBtn label="Export" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Position</th><th>Grade</th><th style={{ textAlign: 'right' }}>Gross</th><th style={{ textAlign: 'right' }}>Net</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{e.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{e.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{e.dept}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{e.position}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{e.grade}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {e.gross.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {e.net.toLocaleString()}</td>
                  <td><Badge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <FormModal title="Add Employee" onClose={() => setShowForm(false)} onSubmit={handleSubmit} submitLabel="Add Employee">
          <div style={fieldRow}>
            <div><label style={fieldLabel}>First Name *</label><input style={fieldInput} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
            <div><label style={fieldLabel}>Last Name *</label><input style={fieldInput} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
          </div>
          <div style={fieldRow}>
            <div><label style={fieldLabel}>Department</label><select style={fieldInput} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}><option>Teaching</option><option>Administration</option><option>Support</option><option>Finance</option></select></div>
            <div><label style={fieldLabel}>Position</label><input style={fieldInput} value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="e.g. Teacher" /></div>
          </div>
          <div style={fieldFull}><label style={fieldLabel}>Basic Salary (UGX) *</label><input type="number" style={fieldInput} value={form.basic_salary} onChange={e => setForm({ ...form, basic_salary: e.target.value })} /></div>
        </FormModal>
      )}
    </div>
  );
}

/* ── Shared sub-components ──────────────────────────────────────── */
function KPI({ icon, title, value, change, positive }: { icon: React.ReactNode; title: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{title}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ marginTop: 8, fontSize: 12, color: positive ? '#34d399' : '#fbbf24' }}>{change}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const m: Record<string, { bg: string; border: string; color: string }> = {
    Paid: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    Pending: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
    Terminated: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
  };
  const s = m[status] ?? m.Paid;
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{status}</span>;
}

function SmBtn({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
      {icon}{label}
    </button>
  );
}

function BarChart({ data }: { data: { month: string; gross: number; net: number }[] }) {
  const max = Math.max(...data.map((d) => d.gross));
  const W = 500, H = 160, px = 40, barW = 28, gap = 12;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {data.map((d, i) => {
        const x = px + i * ((W - px * 2) / data.length) + gap;
        const hGross = (d.gross / max) * (H - 40);
        const hNet = (d.net / max) * (H - 40);
        return (
          <g key={d.month}>
            <rect x={x} y={H - 20 - hGross} width={barW} height={hGross} rx={4} fill="rgba(59,130,246,0.25)" />
            <rect x={x + 4} y={H - 20 - hNet} width={barW - 8} height={hNet} rx={3} fill="#3b82f6" />
            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const R = 54, r = 38;
  return (
    <svg viewBox="0 0 140 140" width="100%">
      {data.map((d) => {
        const start = (cum / total) * 2 * Math.PI - Math.PI / 2;
        cum += d.value;
        const end = (cum / total) * 2 * Math.PI - Math.PI / 2;
        const lg = d.value / total > 0.5 ? 1 : 0;
        const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`;
        return <path key={d.label} d={path} fill={d.color} opacity={0.85} />;
      })}
    </svg>
  );
}
