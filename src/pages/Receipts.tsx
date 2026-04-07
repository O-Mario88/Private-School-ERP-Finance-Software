/**
 * Receipts Page — Tempo-style
 * Receipt register, voided receipts, cashier activity
 */

import React, { useState } from 'react';

const receipts = [
  { id: 'RCP-20250001', student: 'Nakato Sarah', amount: 810000, method: 'MTN MoMo', invoice: 'INV-20250101', date: '2025-03-01', printedBy: 'Bursar', status: 'Issued' },
  { id: 'RCP-20250002', student: 'Ssemakula Brian', amount: 1215000, method: 'Bank Transfer', invoice: 'INV-20250102', date: '2025-03-02', printedBy: 'Bursar', status: 'Issued' },
  { id: 'RCP-20250003', student: 'Tumusiime Joshua', amount: 540000, method: 'Airtel Money', invoice: 'INV-20250103', date: '2025-03-03', printedBy: 'Accounts', status: 'Issued' },
  { id: 'RCP-20250004', student: 'Namutebi Grace', amount: 1620000, method: 'MTN MoMo', invoice: 'INV-20250104', date: '2025-03-04', printedBy: 'Bursar', status: 'Voided' },
  { id: 'RCP-20250005', student: 'Kizza Ronald', amount: 405000, method: 'Cash', invoice: 'INV-20250105', date: '2025-03-05', printedBy: 'Accounts', status: 'Issued' },
  { id: 'RCP-20250006', student: 'Nabirye Fatuma', amount: 810000, method: 'MTN MoMo', invoice: 'INV-20250106', date: '2025-03-05', printedBy: 'Bursar', status: 'Issued' },
  { id: 'RCP-20250007', student: 'Okello James', amount: 2349000, method: 'Bank Transfer', invoice: 'INV-20250107', date: '2025-03-06', printedBy: 'Accounts', status: 'Issued' },
  { id: 'RCP-20250008', student: 'Ainembabazi Esther', amount: 675000, method: 'Cheque', invoice: 'INV-20250108', date: '2025-03-07', printedBy: 'Bursar', status: 'Issued' },
];

const cashierActivity = [
  { label: 'Admin', value: 55, color: '#3b82f6' },
  { label: 'Finance', value: 30, color: '#10b981' },
  { label: 'Bursar', value: 15, color: '#f59e0b' },
];

const dailyReceipts = [
  { day: 'Mon', count: 12, value: 340000 }, { day: 'Tue', count: 8, value: 250000 },
  { day: 'Wed', count: 15, value: 420000 }, { day: 'Thu', count: 10, value: 310000 },
  { day: 'Fri', count: 18, value: 580000 }, { day: 'Sat', count: 3, value: 85000 },
];

export default function ReceiptsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Issued' | 'Pending' | 'Voided'>('all');

  const totalIssued = receipts.filter(r => r.status === 'Issued').length;
  const totalAmount = receipts.reduce((s, r) => s + r.amount, 0);
  const voided = receipts.filter(r => r.status === 'Voided').length;
  const pending = receipts.filter(r => r.status === 'Pending').length;

  let filtered = receipts.filter(r => r.student.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));
  if (filter !== 'all') filtered = filtered.filter(r => r.status === filter);

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Receipts</h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>Receipt tracking & printing</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SmBtn label="Bulk Print" />
          <SmBtn label="Export PDF" primary />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon="🧾" title="Receipts Issued" value={totalIssued.toString()} sub="This month" positive />
        <KPI icon="💰" title="Total Receipted" value={`UGX ${(totalAmount / 1e6).toFixed(1)}M`} sub="Excluding voided" positive />
        <KPI icon="⏳" title="Pending Print" value={pending.toString()} sub="Awaiting printing" positive={false} />
        <KPI icon="🚫" title="Voided" value={voided.toString()} sub="Requires review" positive={false} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Weekly Receipt Volume</h3></div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{dailyReceipts.reduce((s, d) => s + d.count, 0)}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>receipts this week</span>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><BarChart data={dailyReceipts} /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Cashier Activity</h3></div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={cashierActivity} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>3</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Users</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>{cashierActivity.map(c => (
              <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.label}</span></div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.value}%</span>
              </div>
            ))}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Receipt Register</h3>
            <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 12, width: 180, height: 34, fontSize: 12 }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'Issued', 'Pending', 'Voided'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, border: 'none', cursor: 'pointer', background: filter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: filter === f ? '#93c5fd' : 'var(--text-muted)' }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>Receipt #</th><th>Date</th><th>Student</th><th>Invoice Ref</th><th>Method</th><th style={{ textAlign: 'right' }}>Amount</th><th>Printed By</th><th>Status</th></tr></thead>
            <tbody>{filtered.map(r => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'monospace', color: '#93c5fd' }}>{r.id}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.date}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.student}</td>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 11 }}>{r.invoice}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.method}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {r.amount.toLocaleString()}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.printedBy}</td>
                <td><Badge label={r.status} /></td>
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
function Badge({ label }: { label: string }) { const m: Record<string, { bg: string; b: string; t: string }> = { Issued: { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' }, Pending: { bg: 'rgba(245,158,11,0.12)', b: 'rgba(245,158,11,0.3)', t: '#fcd34d' }, Voided: { bg: 'rgba(239,68,68,0.12)', b: 'rgba(239,68,68,0.3)', t: '#fca5a5' } }; const c = m[label] ?? m.Issued; return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.b}`, color: c.t }}>{label}</span>; }

function BarChart({ data }: { data: { day: string; count: number; value: number }[] }) {
  const max = Math.max(...data.map(d => d.count)); const W = 400, H = 140, px = 24, bw = 34;
  return (<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}><defs><linearGradient id="rcpBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" /></linearGradient></defs>{data.map((d, i) => { const x = px + i * ((W - px * 2) / (data.length - 1)) - bw / 2; const h = (d.count / max) * (H - 40); return (<g key={d.day}><rect x={x} y={H - 20 - h} width={bw} height={h} rx={4} fill="url(#rcpBar)" opacity={0.85} /><text x={x + bw / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.day}</text></g>); })}</svg>);
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0); let cum = 0; const R = 54, r = 38;
  return (<svg viewBox="0 0 140 140" width="100%">{data.map((d) => { const start = (cum / total) * 2 * Math.PI - Math.PI / 2; cum += d.value; const end = (cum / total) * 2 * Math.PI - Math.PI / 2; const lg = d.value / total > 0.5 ? 1 : 0; const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`; return <path key={d.label} d={path} fill={d.color} opacity={0.85} />; })}</svg>);
}
