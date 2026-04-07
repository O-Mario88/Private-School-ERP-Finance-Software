/**
 * Collections Module Page — Tempo-style
 * Payment tracking, aging analysis, collections follow-ups
 */

import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

export default function CollectionsPage() {
  return (
    <Routes>
      <Route path="/" element={<CollectionsHome />} />
      <Route path="/payments" element={<CollectionsHome />} />
      <Route path="/aging" element={<CollectionsHome />} />
      <Route path="/followups" element={<CollectionsHome />} />
    </Routes>
  );
}

/* ── Mock data ─────────────────────────────────────────────────── */
const payments = [
  { id: 'COL-001', student: 'Nakato Sarah', class: 'S1 Blue', amount: 810000, method: 'MTN MoMo', date: '2025-03-08', status: 'Cleared', balance: 0 },
  { id: 'COL-002', student: 'Ssemakula Brian', class: 'S2 Red', amount: 1215000, method: 'Bank Transfer', date: '2025-03-07', status: 'Cleared', balance: 0 },
  { id: 'COL-003', student: 'Tumusiime Joshua', class: 'S3 Blue', amount: 540000, method: 'Airtel Money', date: '2025-03-07', status: 'Cleared', balance: 0 },
  { id: 'COL-004', student: 'Namutebi Grace', class: 'S1 Red', amount: 1350000, method: 'MTN MoMo', date: '2025-03-06', status: 'Pending', balance: 540000 },
  { id: 'COL-005', student: 'Kizza Ronald', class: 'S4 Blue', amount: 675000, method: 'Cash', date: '2025-03-06', status: 'Cleared', balance: 0 },
  { id: 'COL-006', student: 'Nabirye Fatuma', class: 'S2 Blue', amount: 2160000, method: 'Cheque', date: '2025-03-05', status: 'Pending', balance: 810000 },
  { id: 'COL-007', student: 'Okello James', class: 'S5 Red', amount: 810000, method: 'MTN MoMo', date: '2025-03-05', status: 'Cleared', balance: 0 },
  { id: 'COL-008', student: 'Ainembabazi Esther', class: 'S3 Red', amount: 1620000, method: 'Bank Transfer', date: '2025-03-04', status: 'Cleared', balance: 0 },
];

const agingBuckets = [
  { label: '0-30 days', value: 42, color: '#3b82f6', amount: 'UGX 86.4M' },
  { label: '31-60 days', value: 28, color: '#f59e0b', amount: 'UGX 56.7M' },
  { label: '61-90 days', value: 18, color: '#f97316', amount: 'UGX 37.8M' },
  { label: '90+ days', value: 12, color: '#ef4444', amount: 'UGX 24.8M' },
];

const collectionTrend = [
  { month: 'Nov', amount: 113400000 },
  { month: 'Dec', amount: 102600000 },
  { month: 'Jan', amount: 137700000 },
  { month: 'Feb', amount: 124200000 },
  { month: 'Mar', amount: 145800000 },
  { month: 'Apr', amount: 132300000 },
];

function CollectionsHome() {
  const [period, setPeriod] = useState<'30' | '90' | 'currentFY' | 'lastFY' | 'all'>('30');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'payments' | 'aging' | 'followups'>('payments');

  const filtered = payments.filter(
    (p) => p.student.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Collections</h1>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 2 }}>
          {([['30', '30 Days'], ['90', '3 Months'], ['currentFY', 'Current FY'], ['lastFY', 'Last FY'], ['all', 'All Time']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v as any)} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: period === v ? 'rgba(255,255,255,0.12)' : 'transparent', color: period === v ? 'var(--text-primary)' : 'var(--text-muted)' }}>{l}</button>
          ))}
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
          + Record Payment
        </button>
      </div>

      {/* ── KPI cards ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} title="Total Outstanding" value="UGX 205.2M" change="−12% vs last term" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>} title="Collected Today" value="UGX 11.4M" change="+18% vs yesterday" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>} title="Active Plans" value="186" change="24 new this month" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} title="Overdue (90+ days)" value="87" change="UGX 24.8M outstanding" positive={false} />
      </div>

      {/* ── Charts row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Collection trend */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Collection Trend</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX 756.0M</span>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>6-month total</span>
              <span style={{ fontSize: 12, color: '#34d399' }}>+8% vs prior period</span>
            </div>
          </div>
          <div style={{ padding: '16px 24px 20px' }}>
            <MiniLineChart data={collectionTrend} />
          </div>
        </div>

        {/* Aging donut */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Aging Breakdown</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={agingBuckets} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>205.2M</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total Due</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {agingBuckets.map((b) => (
                <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{b.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{b.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs + Data table ────────────────────────────── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {(['payments', 'aging', 'followups'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '4px 0', fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' }}>{t === 'followups' ? 'Follow-ups' : t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="input" placeholder="Search payments…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 200, height: 34, fontSize: 12 }} />
            </div>
            <SmBtn label="Export" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>Receipt</th><th>Date</th><th>Student</th><th>Class</th><th>Method</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'right' }}>Balance</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.date}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.student}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{p.class}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.method}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {p.amount.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: p.balance > 0 ? '#fbbf24' : 'var(--text-muted)' }}>{p.balance > 0 ? `UGX ${p.balance.toLocaleString()}` : '—'}</td>
                  <td><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
    Cleared: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    Pending: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
    Partial: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
    Overdue: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
  };
  const s = m[status] ?? m.Partial;
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{status}</span>;
}

function SmBtn({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
      {icon}{label}
    </button>
  );
}

function MiniLineChart({ data }: { data: { month: string; amount: number }[] }) {
  const W = 520, H = 130, pad = { l: 44, r: 12, t: 8, b: 28 };
  const max = Math.max(...data.map((d) => d.amount)) * 1.15;
  const points = data.map((d, i) => {
    const x = pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
    const y = pad.t + (1 - d.amount / max) * (H - pad.t - pad.b);
    return `${x},${y}`;
  });
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="collFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${points[0].split(',')[0]},${H - pad.b} ${points.join(' ')} ${points[points.length - 1].split(',')[0]},${H - pad.b}`} fill="url(#collFill)" />
      <polyline points={points.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [x, y] = points[i].split(',').map(Number);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill="#0f1d32" stroke="#3b82f6" strokeWidth="2" />
            <text x={x} y={H - 8} textAnchor="middle" fill="var(--text-muted)" fontSize="10">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const size = 140, cx = size / 2, cy = size / 2, r = 52, stroke = 16;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d) => {
        const dashLen = (d.value / total) * circ;
        const gap = circ - dashLen;
        const el = <circle key={d.label} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={stroke} strokeDasharray={`${dashLen} ${gap}`} strokeDashoffset={-offset} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />;
        offset += dashLen;
        return el;
      })}
    </svg>
  );
}
