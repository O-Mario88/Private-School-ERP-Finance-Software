/**
 * Treasury Page — Tempo-style
 * Cash management, bank positions, forecasting, inter-bank transfers
 */

import React, { useState } from 'react';

/* ── Mock data ─────────────────────────────────────────────────── */
const bankAccounts = [
  { id: 'BA-001', bank: 'Stanbic Bank Uganda', last4: '****4521', type: 'Operating', balance: 93150000, status: 'Active' },
  { id: 'BA-002', bank: 'Centenary Bank', last4: '****8834', type: 'Collections', balance: 49140000, status: 'Active' },
  { id: 'BA-003', bank: 'MTN MoMo Merchant', last4: '256700', type: 'Mobile Money', balance: 16740000, status: 'Active' },
  { id: 'BA-004', bank: 'dfcu Bank', last4: '****2290', type: 'Payroll', balance: 12150000, status: 'Active' },
  { id: 'BA-005', bank: 'Bank of Africa', last4: '****6612', type: 'Savings', balance: 140400000, status: 'Active' },
];

const transfers = [
  { id: 'TF-001', from: 'Centenary Bank', to: 'Stanbic Bank', amount: 27000000, ref: 'RTGS-88234', date: '2025-03-06', status: 'Completed' },
  { id: 'TF-002', from: 'MTN MoMo Merchant', to: 'Centenary Bank', amount: 13500000, ref: 'MOMO-66219', date: '2025-03-05', status: 'Completed' },
  { id: 'TF-003', from: 'Stanbic Bank', to: 'dfcu Bank', amount: 40500000, ref: 'RTGS-88190', date: '2025-03-04', status: 'Completed' },
  { id: 'TF-004', from: 'Centenary Bank', to: 'MTN MoMo Merchant', amount: 6750000, ref: 'B2C-44102', date: '2025-03-03', status: 'Completed' },
  { id: 'TF-005', from: 'Stanbic Bank', to: 'dfcu Bank', amount: 54000000, ref: 'RTGS-88301', date: '2025-03-07', status: 'Pending' },
];

const cashFlowTrend = [
  { month: 'Nov', inflow: 5200000, outflow: 4800000 },
  { month: 'Dec', inflow: 4800000, outflow: 5100000 },
  { month: 'Jan', inflow: 6100000, outflow: 4900000 },
  { month: 'Feb', inflow: 5400000, outflow: 5200000 },
  { month: 'Mar', inflow: 5800000, outflow: 5300000 },
  { month: 'Apr', inflow: 5500000, outflow: 5100000 },
];

const cashSplit = [
  { label: 'Operating', value: 30, color: '#3b82f6' },
  { label: 'Collections', value: 16, color: '#10b981' },
  { label: 'Mobile Money', value: 5, color: '#f59e0b' },
  { label: 'Payroll', value: 4, color: '#a855f7' },
  { label: 'Savings', value: 45, color: '#06b6d4' },
];

export default function TreasuryPage() {
  const [period, setPeriod] = useState<'30' | '90' | 'currentFY' | 'lastFY' | 'all'>('30');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'accounts' | 'transfers'>('accounts');

  const totalCash = bankAccounts.reduce((s, a) => s + a.balance, 0);
  const filteredTransfers = transfers.filter((t) => t.from.toLowerCase().includes(search.toLowerCase()) || t.to.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Treasury</h1>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 2 }}>
          {([['30', '30 Days'], ['90', '3 Months'], ['currentFY', 'Current FY'], ['lastFY', 'Last FY'], ['all', 'All Time']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v as any)} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: period === v ? 'rgba(255,255,255,0.12)' : 'transparent', color: period === v ? 'var(--text-primary)' : 'var(--text-muted)' }}>{l}</button>
          ))}
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
          + New Transfer
        </button>
      </div>

      {/* ── KPI cards ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} title="Cash Position" value={`UGX ${(totalCash / 1e6).toFixed(1)}M`} change={`${bankAccounts.length} accounts`} positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>} title="Net Cash Flow" value="UGX +400K" change="+7.3% vs last month" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>} title="Transfers This Month" value="5" change="UGX 5.9M moved" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} title="Pending" value="1" change="UGX 2.85M awaiting" positive={false} />
      </div>

      {/* ── Charts row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Cash Flow Trend</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX 32.8M</span>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>6-month total inflow</span>
              <span style={{ fontSize: 12, color: '#34d399' }}>Net surplus UGX 2.4M</span>
            </div>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><BarChart data={cashFlowTrend} /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Cash Distribution</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={cashSplit} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>11.5M</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {cashSplit.map((s) => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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

      {/* ── Tabs + Data table ────────────────────────────── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {(['accounts', 'transfers'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '4px 0', fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' }}>{t === 'accounts' ? 'Bank Accounts' : 'Transfers'}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 200, height: 34, fontSize: 12 }} />
            </div>
            <SmBtn label="Export" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {tab === 'accounts' ? (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>ID</th><th>Bank</th><th>Account</th><th>Type</th><th style={{ textAlign: 'right' }}>Balance</th><th>Status</th></tr></thead>
              <tbody>
                {bankAccounts.map((a) => (
                  <tr key={a.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{a.id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.bank}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{a.last4}</td>
                    <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{a.type}</span></td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>UGX {a.balance.toLocaleString()}</td>
                    <td><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>ID</th><th>Date</th><th>From</th><th>To</th><th>Ref</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {filteredTransfers.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.id}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.date}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.from}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.to}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11 }}>{t.ref}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {t.amount.toLocaleString()}</td>
                    <td><Badge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
    Active: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    Completed: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    Pending: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
  };
  const s = m[status] ?? m.Pending;
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{status}</span>;
}

function SmBtn({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
      {icon}{label}
    </button>
  );
}

function BarChart({ data }: { data: { month: string; inflow: number; outflow: number }[] }) {
  const max = Math.max(...data.map((d) => Math.max(d.inflow, d.outflow)));
  const W = 500, H = 160, px = 40, barW = 24, gap = 8;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {data.map((d, i) => {
        const x = px + i * ((W - px * 2) / data.length) + gap;
        const hIn = (d.inflow / max) * (H - 40);
        const hOut = (d.outflow / max) * (H - 40);
        return (
          <g key={d.month}>
            <rect x={x} y={H - 20 - hIn} width={barW} height={hIn} rx={4} fill="rgba(16,185,129,0.3)" />
            <rect x={x + barW + 3} y={H - 20 - hOut} width={barW} height={hOut} rx={4} fill="rgba(239,68,68,0.25)" />
            <text x={x + barW + 1} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.month}</text>
          </g>
        );
      })}
      <text x={W - 20} y={14} textAnchor="end" fontSize="9" fill="#34d399">■ Inflow</text>
      <text x={W - 20} y={26} textAnchor="end" fontSize="9" fill="#f87171">■ Outflow</text>
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
