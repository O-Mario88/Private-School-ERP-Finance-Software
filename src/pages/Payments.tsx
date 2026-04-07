/**
 * Payments Page — Tempo-style
 * Payment register, allocation, method breakdown
 */

import React, { useState } from 'react';

const payments = [
  { id: 'PAY-20250301', student: 'Nakato Sarah', amount: 810000, method: 'MTN MoMo', ref: 'MOMO-884523', date: '2025-03-01', class: 'S1 Blue', status: 'Verified' },
  { id: 'PAY-20250302', student: 'Ssemakula Brian', amount: 1215000, method: 'Bank Transfer', ref: 'RTGS-220145', date: '2025-03-02', class: 'S1 Red', status: 'Verified' },
  { id: 'PAY-20250303', student: 'Tumusiime Joshua', amount: 540000, method: 'Airtel Money', ref: 'AIRT-661234', date: '2025-03-03', class: 'S2 Blue', status: 'Verified' },
  { id: 'PAY-20250304', student: 'Namutebi Grace', amount: 1620000, method: 'MTN MoMo', ref: 'MOMO-884601', date: '2025-03-04', class: 'S2 Red', status: 'Pending' },
  { id: 'PAY-20250305', student: 'Kizza Ronald', amount: 405000, method: 'Cash', ref: 'CASH-001122', date: '2025-03-05', class: 'S3 Blue', status: 'Verified' },
  { id: 'PAY-20250306', student: 'Nabirye Fatuma', amount: 810000, method: 'MTN MoMo', ref: 'MOMO-884755', date: '2025-03-05', class: 'S3 Red', status: 'Verified' },
  { id: 'PAY-20250307', student: 'Okello James', amount: 2349000, method: 'Bank Transfer', ref: 'RTGS-220198', date: '2025-03-06', class: 'S4 Blue', status: 'Verified' },
  { id: 'PAY-20250308', student: 'Ainembabazi Esther', amount: 675000, method: 'Airtel Money', ref: 'AIRT-661301', date: '2025-03-07', class: 'S4 Red', status: 'Pending' },
];

const methodBreakdown = [
  { label: 'MTN MoMo', value: 42, color: '#f59e0b' },
  { label: 'Bank Transfer', value: 28, color: '#3b82f6' },
  { label: 'Airtel Money', value: 15, color: '#ef4444' },
  { label: 'Cash', value: 10, color: '#10b981' },
  { label: 'Cheque', value: 5, color: '#a855f7' },
];

const dailyTrend = [
  { day: '01', amt: 810000 }, { day: '02', amt: 1215000 }, { day: '03', amt: 540000 },
  { day: '04', amt: 1620000 }, { day: '05', amt: 1215000 }, { day: '06', amt: 2349000 },
  { day: '07', amt: 675000 }, { day: '08', amt: 945000 },
];

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Verified' | 'Pending'>('all');

  const totalReceived = payments.reduce((s, p) => s + p.amount, 0);
  const allocated = payments.filter(p => p.status === 'Verified');
  const unallocated = payments.filter(p => p.status === 'Pending');
  const momo = payments.filter(p => p.method === 'MTN MoMo').reduce((s, p) => s + p.amount, 0);

  let filtered = payments.filter(p => p.student.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.ref.toLowerCase().includes(search.toLowerCase()));
  if (filter !== 'all') filtered = filtered.filter(p => p.status === filter);

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Payments</h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>Payment tracking & allocation</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SmBtn label="Auto-Allocate" />
          <SmBtn label="+ Record Payment" primary />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon="💳" title="Total Received" value={`UGX ${(totalReceived / 1e6).toFixed(2)}M`} sub="This month" positive />
        <KPI icon="✅" title="Verified" value={allocated.length.toString()} sub={`UGX ${(allocated.reduce((s, p) => s + p.amount, 0) / 1e6).toFixed(2)}M`} positive />
        <KPI icon="❓" title="Pending" value={unallocated.length.toString()} sub={`UGX ${(unallocated.reduce((s, p) => s + p.amount, 0) / 1e6).toFixed(2)}M pending`} positive={false} />
        <KPI icon="📱" title="MTN MoMo Volume" value={`UGX ${(momo / 1e6).toFixed(2)}M`} sub={`${Math.round(momo / totalReceived * 100)}% of payments`} positive />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Daily Collections</h3></div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX {(totalReceived / 1e6).toFixed(2)}M</span>
            <span style={{ fontSize: 12, color: '#34d399', marginLeft: 8 }}>March 2025</span>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><BarChart data={dailyTrend} /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Payment Methods</h3></div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={methodBreakdown} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{payments.length}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Payments</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>{methodBreakdown.map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.label}</span></div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{m.value}%</span>
              </div>
            ))}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Payment Register</h3>
            <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 12, width: 180, height: 34, fontSize: 12 }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'Verified', 'Pending'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, border: 'none', cursor: 'pointer', background: filter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: filter === f ? '#93c5fd' : 'var(--text-muted)' }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>Payment #</th><th>Date</th><th>Student</th><th>Class</th><th>Method</th><th>Reference</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th></tr></thead>
            <tbody>{filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', color: '#93c5fd' }}>{p.id}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.date}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.student}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.class}</td>
                <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: p.method === 'MTN MoMo' ? 'rgba(245,158,11,0.1)' : p.method === 'Airtel Money' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', border: `1px solid ${p.method === 'MTN MoMo' ? 'rgba(245,158,11,0.2)' : p.method === 'Airtel Money' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`, color: p.method === 'MTN MoMo' ? '#fbbf24' : p.method === 'Airtel Money' ? '#f87171' : '#93c5fd' }}>{p.method}</span></td>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 11 }}>{p.ref}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {p.amount.toLocaleString()}</td>
                <td><Badge label={p.status} /></td>
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
function Badge({ label }: { label: string }) { const c = label === 'Verified' ? { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' } : { bg: 'rgba(245,158,11,0.12)', b: 'rgba(245,158,11,0.3)', t: '#fcd34d' }; return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.b}`, color: c.t }}>{label}</span>; }

function BarChart({ data }: { data: { day: string; amt: number }[] }) {
  const max = Math.max(...data.map(d => d.amt)); const W = 500, H = 140, px = 20, bw = 32;
  return (<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}><defs><linearGradient id="payBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>{data.map((d, i) => { const x = px + i * ((W - px * 2) / (data.length - 1)) - bw / 2; const h = (d.amt / max) * (H - 40); return (<g key={d.day}><rect x={x} y={H - 20 - h} width={bw} height={h} rx={4} fill="url(#payBar)" opacity={0.85} /><text x={x + bw / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">Mar {d.day}</text></g>); })}</svg>);
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0); let cum = 0; const R = 54, r = 38;
  return (<svg viewBox="0 0 140 140" width="100%">{data.map((d) => { const start = (cum / total) * 2 * Math.PI - Math.PI / 2; cum += d.value; const end = (cum / total) * 2 * Math.PI - Math.PI / 2; const lg = d.value / total > 0.5 ? 1 : 0; const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`; return <path key={d.label} d={path} fill={d.color} opacity={0.85} />; })}</svg>);
}
