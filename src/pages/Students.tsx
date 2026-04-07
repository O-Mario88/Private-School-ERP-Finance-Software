/**
 * Students Page — Tempo-style
 * Student population, financial status, balances, class distribution
 */

import React, { useState } from 'react';
import { StudentFeeCard } from '../components/school/StudentFeeCard';
import { DiscountType } from '../types';
import type { StudentFeeMapping } from '../types';

/* ── Mock data ─────────────────────────────────────────────────── */
const students = [
  { id: 'STU-001', name: 'Nakato Sarah', class: 'S1 Blue', sponsor: 'Gov Bursary', balance: 810000, status: 'Partial' as const },
  { id: 'STU-002', name: 'Ssemakula Brian', class: 'S1 Red', sponsor: '', balance: 0, status: 'Paid' as const },
  { id: 'STU-003', name: 'Tumusiime Joshua', class: 'S2 Blue', sponsor: '', balance: 2700000, status: 'Overdue' as const },
  { id: 'STU-004', name: 'Namutebi Grace', class: 'S2 Red', sponsor: 'Makerere Foundation', balance: 540000, status: 'Partial' as const },
  { id: 'STU-005', name: 'Kizza Ronald', class: 'S3 Blue', sponsor: '', balance: 0, status: 'Paid' as const },
  { id: 'STU-006', name: 'Nabirye Fatuma', class: 'S3 Red', sponsor: 'District Bursary', balance: 1620000, status: 'Overdue' as const },
  { id: 'STU-007', name: 'Okello James', class: 'S4 Blue', sponsor: '', balance: 1080000, status: 'Partial' as const },
  { id: 'STU-008', name: 'Ainembabazi Esther', class: 'S4 Red', sponsor: 'Gov Bursary', balance: 0, status: 'Paid' as const },
  { id: 'STU-009', name: 'Waiswa Moses', class: 'S5 Blue', sponsor: '', balance: 2160000, status: 'Overdue' as const },
  { id: 'STU-010', name: 'Acen Patricia', class: 'S5 Red', sponsor: 'Subcounty Bursary', balance: 270000, status: 'Partial' as const },
];

const classDist = [
  { label: 'S1', value: 28, color: '#3b82f6' },
  { label: 'S2', value: 24, color: '#10b981' },
  { label: 'S3', value: 22, color: '#f59e0b' },
  { label: 'S4', value: 20, color: '#a855f7' },
  { label: 'S5', value: 16, color: '#06b6d4' },
  { label: 'S6', value: 12, color: '#ec4899' },
];

const balanceTrend = [
  { month: 'Nov', amount: 8200000 },
  { month: 'Dec', amount: 7400000 },
  { month: 'Jan', amount: 9100000 },
  { month: 'Feb', amount: 7800000 },
  { month: 'Mar', amount: 6500000 },
  { month: 'Apr', amount: 5250000 },
];

const STUDENT_FEE_MAPPINGS: Record<string, StudentFeeMapping> = {
  'STU-001': {
    studentId: 'STU-001', studentName: 'Nakato Sarah', className: 'S1 Blue',
    templateId: 'ft_1', templateName: 'S1 – S3 Day Student',
    appliedRules: [{ ruleId: 'br_1', ruleName: 'S1-S3 Day Students', matchedCriteria: 'Class S1 + Day student' }],
    appliedDiscounts: [],
    sponsorCoverage: [{ sponsorRuleId: 'sp_1', sponsorName: 'Gov Bursary', coverageAmount: 891000, coveredCategories: ['Tuition'] }],
    grossAmount: 1701000, totalDiscounts: 0, totalSponsorCoverage: 891000, netPayable: 810000,
    lastCalculatedAt: '2026-01-15T10:00:00Z',
  },
  'STU-003': {
    studentId: 'STU-003', studentName: 'Tumusiime Joshua', className: 'S2 Blue',
    templateId: 'ft_1', templateName: 'S1 – S3 Day Student',
    appliedRules: [{ ruleId: 'br_1', ruleName: 'S1-S3 Day Students', matchedCriteria: 'Class S2 + Day student' }],
    appliedDiscounts: [],
    sponsorCoverage: [],
    grossAmount: 1701000, totalDiscounts: 0, totalSponsorCoverage: 0, netPayable: 1701000,
    installmentPlan: { installments: [{ number: 1, amount: 850500, dueDate: '2026-02-03' }, { number: 2, amount: 510300, dueDate: '2026-03-05' }, { number: 3, amount: 340200, dueDate: '2026-04-04' }] },
    lastCalculatedAt: '2026-01-15T10:00:00Z',
  },
};

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'arrears' | 'cleared' | 'sponsored'>('all');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const paid = students.filter(s => s.status === 'Paid').length;
  const partial = students.filter(s => s.status === 'Partial').length;
  const overdue = students.filter(s => s.status === 'Overdue').length;
  const inArrears = students.filter(s => s.balance > 0).length;
  const sponsored = students.filter(s => s.sponsor).length;
  const totalBal = students.reduce((s, st) => s + st.balance, 0);

  let filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()));
  if (filter === 'arrears') filtered = filtered.filter(s => s.balance > 0);
  if (filter === 'cleared') filtered = filtered.filter(s => s.status === 'Paid');
  if (filter === 'sponsored') filtered = filtered.filter(s => s.sponsor);

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Students</h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>Financial overview of student population</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Export</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>+ Add Student</button>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon="👨‍🎓" title="Total Students" value={students.length.toString()} change={`${paid} paid · ${partial} partial · ${overdue} overdue`} positive />
        <KPI icon="🏫" title="Fee Status" value={`${paid} / ${students.length}`} change={`${Math.round(paid / students.length * 100)}% fully paid`} positive />
        <KPI icon="⚠️" title="In Arrears" value={inArrears.toString()} change={`UGX ${(totalBal / 1e6).toFixed(1)}M outstanding`} positive={false} />
        <KPI icon="🎓" title="Sponsored" value={sponsored.toString()} change={`${Math.round(sponsored / students.length * 100)}% coverage`} positive />
      </div>

      {/* ── Charts row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Outstanding Balance Trend</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX {(totalBal / 1e6).toFixed(1)}M</span>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current outstanding</span>
              <span style={{ fontSize: 12, color: '#34d399' }}>−36% vs Nov peak</span>
            </div>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><MiniLineChart data={balanceTrend} gradId="stuBal" /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Class Distribution</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={classDist} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{students.length}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Students</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {classDist.map((s) => (
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

      {/* ── Student Fee Mapping (when a student is selected) ──── */}
      {selectedStudent && STUDENT_FEE_MAPPINGS[selectedStudent] && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Fee Mapping — {STUDENT_FEE_MAPPINGS[selectedStudent].studentName}
            </h3>
            <button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕ Close</button>
          </div>
          <StudentFeeCard mapping={STUDENT_FEE_MAPPINGS[selectedStudent]} />
        </div>
      )}

      {/* ── Student finance table ─────────────────────────── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Student Finance</h3>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="input" placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 200, height: 34, fontSize: 12 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'arrears', 'cleared', 'sponsored'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, border: 'none', cursor: 'pointer', background: filter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: filter === f ? '#93c5fd' : 'var(--text-muted)', textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Sponsor</th><th style={{ textAlign: 'right' }}>Balance</th><th>Status</th><th>Fee Mapping</th></tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} style={{ cursor: STUDENT_FEE_MAPPINGS[s.id] ? 'pointer' : undefined }} onClick={() => { if (STUDENT_FEE_MAPPINGS[s.id]) setSelectedStudent(s.id); }}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{s.class}</span></td>
                  <td style={{ color: s.sponsor ? '#a78bfa' : 'var(--text-muted)' }}>{s.sponsor || '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: s.balance > 0 ? '#fbbf24' : 'var(--text-muted)' }}>{s.balance > 0 ? `UGX ${s.balance.toLocaleString()}` : '—'}</td>
                  <td><Badge status={s.status} /></td>
                  <td>{STUDENT_FEE_MAPPINGS[s.id] ? <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', cursor: 'pointer' }}>View Mapping</span> : <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */
function KPI({ icon, title, value, change, positive }: { icon: string; title: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{title}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 16 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ marginTop: 8, fontSize: 12, color: positive ? '#34d399' : '#fbbf24' }}>{change}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const m: Record<string, { bg: string; border: string; color: string }> = {
    Paid: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    Partial: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
    Overdue: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
  };
  const s = m[status] ?? m.Paid;
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{status}</span>;
}

function MiniLineChart({ data, gradId }: { data: { month: string; amount: number }[]; gradId: string }) {
  const max = Math.max(...data.map(d => d.amount));
  const min = Math.min(...data.map(d => d.amount)) * 0.8;
  const W = 500, H = 140, px = 30;
  const pts = data.map((d, i) => ({ x: px + (i / (data.length - 1)) * (W - px * 2), y: H - 20 - ((d.amount - min) / (max - min)) * (H - 40) }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H - 20} L${pts[0].x},${H - 20}Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (<g key={i}><circle cx={p.x} cy={p.y} r="3.5" fill="#0f1d32" stroke="#3b82f6" strokeWidth="2" /><text x={p.x} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{data[i].month}</text></g>))}
    </svg>
  );
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0); let cum = 0; const R = 54, r = 38;
  return (<svg viewBox="0 0 140 140" width="100%">{data.map((d) => { const start = (cum / total) * 2 * Math.PI - Math.PI / 2; cum += d.value; const end = (cum / total) * 2 * Math.PI - Math.PI / 2; const lg = d.value / total > 0.5 ? 1 : 0; const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`; return <path key={d.label} d={path} fill={d.color} opacity={0.85} />; })}</svg>);
}
