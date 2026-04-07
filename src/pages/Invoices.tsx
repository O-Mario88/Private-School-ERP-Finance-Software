/**
 * Invoices Page — Tempo-style
 * Invoice register, aging analysis, batch operations
 */

import React, { useState } from 'react';

const invoices = [
  { id: 'INV-20250101', student: 'Nakato Sarah', class: 'S1 Blue', term: 'T1 2025', amount: 1215000, paid: 810000, balance: 405000, date: '2025-01-06', due: '2025-02-28', status: 'Partial' },
  { id: 'INV-20250102', student: 'Ssemakula Brian', class: 'S1 Red', term: 'T1 2025', amount: 1215000, paid: 1215000, balance: 0, date: '2025-01-06', due: '2025-02-28', status: 'Paid' },
  { id: 'INV-20250103', student: 'Tumusiime Joshua', class: 'S2 Blue', term: 'T1 2025', amount: 1404000, paid: 0, balance: 1404000, date: '2025-01-06', due: '2025-02-28', status: 'Overdue' },
  { id: 'INV-20250104', student: 'Namutebi Grace', class: 'S2 Red', term: 'T1 2025', amount: 2349000, paid: 1620000, balance: 729000, date: '2025-01-06', due: '2025-03-15', status: 'Partial' },
  { id: 'INV-20250105', student: 'Kizza Ronald', class: 'S3 Blue', term: 'T1 2025', amount: 1215000, paid: 1215000, balance: 0, date: '2025-01-06', due: '2025-03-15', status: 'Paid' },
  { id: 'INV-20250106', student: 'Nabirye Fatuma', class: 'S3 Red', term: 'T1 2025', amount: 1404000, paid: 540000, balance: 864000, date: '2025-01-06', due: '2025-03-15', status: 'Partial' },
  { id: 'INV-20250107', student: 'Okello James', class: 'S4 Blue', term: 'T1 2025', amount: 2349000, paid: 2349000, balance: 0, date: '2025-01-06', due: '2025-03-31', status: 'Paid' },
  { id: 'INV-20250108', student: 'Ainembabazi Esther', class: 'S4 Red', term: 'T1 2025', amount: 1404000, paid: 810000, balance: 594000, date: '2025-01-06', due: '2025-03-31', status: 'Partial' },
];

const aging = [
  { label: 'Current', value: 35, color: '#3b82f6' },
  { label: '1-30 days', value: 28, color: '#10b981' },
  { label: '31-60 days', value: 20, color: '#f59e0b' },
  { label: '61-90 days', value: 12, color: '#f97316' },
  { label: '90+ days', value: 5, color: '#ef4444' },
];

const monthlyInvoices = [
  { month: 'Nov', count: 95, value: 8100000 },
  { month: 'Dec', count: 10, value: 900000 },
  { month: 'Jan', count: 100, value: 9800000 },
  { month: 'Feb', count: 8, value: 450000 },
  { month: 'Mar', count: 5, value: 280000 },
  { month: 'Apr', count: 3, value: 150000 },
];

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Paid' | 'Unpaid' | 'Partial' | 'Overdue'>('all');

  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paid, 0);
  const totalOutstanding = invoices.reduce((s, i) => s + i.balance, 0);
  const overdue = invoices.filter(i => i.status === 'Overdue').length;

  let filtered = invoices.filter(i => i.student.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));
  if (filter !== 'all') filtered = filtered.filter(i => i.status === filter);

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Invoices</h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>Invoice management & aging</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SmBtn label="Batch Invoice" />
          <SmBtn label="Credit Note" />
          <SmBtn label="+ New Invoice" primary />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon="📄" title="Total Invoiced" value={`UGX ${(totalInvoiced / 1e6).toFixed(1)}M`} sub="This term" positive />
        <KPI icon="✅" title="Collected" value={`UGX ${(totalCollected / 1e6).toFixed(1)}M`} sub={`${Math.round(totalCollected / totalInvoiced * 100)}% of invoiced`} positive />
        <KPI icon="⏳" title="Outstanding" value={`UGX ${(totalOutstanding / 1e6).toFixed(1)}M`} sub={`${invoices.filter(i => i.balance > 0).length} open invoices`} positive={false} />
        <KPI icon="🚨" title="Overdue" value={overdue.toString()} sub="Requires action" positive={false} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Invoice Volume</h3>
          </div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{invoices.length}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>invoices this term</span>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><BarChart data={monthlyInvoices} /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Aging Analysis</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={aging} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{invoices.filter(i => i.balance > 0).length}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Open</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>{aging.map(a => (
              <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: a.color }} /><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.label}</span></div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{a.value}%</span>
              </div>
            ))}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Invoice Register</h3>
            <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 12, width: 180, height: 34, fontSize: 12 }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'Paid', 'Unpaid', 'Partial', 'Overdue'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, border: 'none', cursor: 'pointer', background: filter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: filter === f ? '#93c5fd' : 'var(--text-muted)', textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>Invoice #</th><th>Student</th><th>Class</th><th>Term</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'right' }}>Paid</th><th style={{ textAlign: 'right' }}>Balance</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>{filtered.map(i => (
              <tr key={i.id}>
                <td style={{ fontFamily: 'monospace', color: '#93c5fd' }}>{i.id}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{i.student}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{i.class}</td>
                <td style={{ color: 'var(--text-muted)' }}>{i.term}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {i.amount.toLocaleString()}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#34d399' }}>{i.paid > 0 ? `UGX ${i.paid.toLocaleString()}` : '—'}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: i.balance > 0 ? '#fbbf24' : 'var(--text-muted)' }}>{i.balance > 0 ? `UGX ${i.balance.toLocaleString()}` : '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i.due}</td>
                <td><Badge label={i.status} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon, title, value, sub, positive }: { icon: string; title: string; value: string; sub: string; positive: boolean }) {
  return (<div className="card" style={{ padding: '20px 22px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}><span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{title}</span><div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 16 }}>{icon}</div></div><div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div><div style={{ marginTop: 8, fontSize: 12, color: positive ? '#34d399' : '#fbbf24' }}>{sub}</div></div>);
}
function SmBtn({ label, primary }: { label: string; primary?: boolean }) { return <button style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: primary ? 600 : 500, border: primary ? 'none' : '1px solid var(--glass-border)', background: primary ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.06)', color: primary ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: primary ? '0 0 20px rgba(59,130,246,0.2)' : 'none' }}>{label}</button>; }
function Badge({ label }: { label: string }) { const m: Record<string, { bg: string; b: string; t: string }> = { Paid: { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' }, Unpaid: { bg: 'rgba(239,68,68,0.12)', b: 'rgba(239,68,68,0.3)', t: '#fca5a5' }, Partial: { bg: 'rgba(245,158,11,0.12)', b: 'rgba(245,158,11,0.3)', t: '#fcd34d' }, Overdue: { bg: 'rgba(239,68,68,0.15)', b: 'rgba(239,68,68,0.4)', t: '#f87171' } }; const c = m[label] ?? m.Unpaid; return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.b}`, color: c.t }}>{label}</span>; }

function BarChart({ data }: { data: { month: string; count: number; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value)); const W = 500, H = 140, px = 30, bw = 36;
  return (<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}><defs><linearGradient id="invBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" /></linearGradient></defs>{data.map((d, i) => { const x = px + i * ((W - px * 2) / (data.length - 1)) - bw / 2; const h = (d.value / max) * (H - 40); return (<g key={d.month}><rect x={x} y={H - 20 - h} width={bw} height={h} rx={5} fill="url(#invBar)" opacity={0.85} /><text x={x + bw / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.month}</text></g>); })}</svg>);
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0); let cum = 0; const R = 54, r = 38;
  return (<svg viewBox="0 0 140 140" width="100%">{data.map((d) => { const start = (cum / total) * 2 * Math.PI - Math.PI / 2; cum += d.value; const end = (cum / total) * 2 * Math.PI - Math.PI / 2; const lg = d.value / total > 0.5 ? 1 : 0; const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`; return <path key={d.label} d={path} fill={d.color} opacity={0.85} />; })}</svg>);
}
