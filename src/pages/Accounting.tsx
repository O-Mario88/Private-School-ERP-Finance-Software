/**
 * Accounting Module Page — Tempo-style
 * General ledger, trial balance, journal entries
 */

import React, { useState, useMemo } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import JournalEntries from './accounting/JournalEntries';
import TrialBalance from './accounting/TrialBalance';
import { useDB } from '../database';
import { AccountingService } from '../database/DatabaseService';

export default function AccountingPage() {
  return (
    <Routes>
      <Route path="/" element={<AccountingHome />} />
      <Route path="/journal" element={<JournalEntries />} />
      <Route path="/trial-balance" element={<TrialBalance />} />
    </Routes>
  );
}

/* ── Data from SQLite ────────────────────────────────────────── */
function useAccountingData() {
  const { isReady } = useDB();
  const raw = useMemo(() => isReady ? AccountingService.listJournals(undefined, 50) : [], [isReady]);
  return useMemo(() => raw.map((j: any) => ({
    id: j.id,
    date: (j.journal_date || '').slice(0, 10),
    ref: j.journal_number || '',
    description: j.description || '',
    debit: Number(j.total_debit) || 0,
    credit: Number(j.total_credit) || 0,
    account: j.source || 'General',
    status: j.status === 'posted' ? 'Posted' : j.status === 'approved' ? 'Approved' : 'Draft',
  })), [raw]);
}

const glTrend = [
  { month: 'Nov', dr: 75600000, cr: 74250000 },
  { month: 'Dec', dr: 83700000, cr: 82350000 },
  { month: 'Jan', dr: 94500000, cr: 91800000 },
  { month: 'Feb', dr: 78300000, cr: 76950000 },
  { month: 'Mar', dr: 86400000, cr: 85050000 },
  { month: 'Apr', dr: 97200000, cr: 95850000 },
];

const accountBreakdown = [
  { label: 'Assets', value: 38, color: '#3b82f6' },
  { label: 'Liabilities', value: 22, color: '#f59e0b' },
  { label: 'Revenue', value: 25, color: '#10b981' },
  { label: 'Expenses', value: 15, color: '#a855f7' },
];

function AccountingHome() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'30' | '90' | 'currentFY' | 'lastFY' | 'all'>('30');
  const [search, setSearch] = useState('');

  const glEntries = useAccountingData();

  const filtered = glEntries.filter(
    (e) => e.description.toLowerCase().includes(search.toLowerCase()) || e.ref.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Accounting</h1>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 2 }}>
          {([['30', '30 Days'], ['90', '3 Months'], ['currentFY', 'Current FY'], ['lastFY', 'Last FY'], ['all', 'All Time']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v as any)} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: period === v ? 'rgba(255,255,255,0.12)' : 'transparent', color: period === v ? 'var(--text-primary)' : 'var(--text-muted)' }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/accounting/journal')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
            + New Entry
          </button>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>} title="Total Entries" value="1,248" change="+32 this month" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} title="Total Debits" value="UGX 515.7M" change="+14%(UGX 62.1M)" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} title="Total Credits" value="UGX 504.9M" change="+12%(UGX 54.0M)" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>} title="Unposted" value="5" change="2 drafts, 3 approved" positive={false} />
      </div>

      {/* ── Charts row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* GL trend */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>GL Activity</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX 515.7M</span>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Debits</span>
              <span style={{ fontSize: 12, color: '#34d399' }}>+14% vs prior period</span>
            </div>
          </div>
          <div style={{ padding: '16px 24px 20px' }}>
            <BarChart data={glTrend} />
          </div>
        </div>

        {/* Account breakdown donut */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Account Breakdown</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={accountBreakdown} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>142</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Accounts</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {accountBreakdown.map((s) => (
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
          <Link to="/accounting/trial-balance" style={{ display: 'block', margin: '0 24px 20px', padding: '10px 0', borderRadius: 10, textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
            View Trial Balance →
          </Link>
        </div>
      </div>

      {/* ── Journal entries table ─────────────────────────── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recent Journal Entries</h3>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="input" placeholder="Search entries…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 200, height: 34, fontSize: 12 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <SmBtn label="Filter" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>} />
            <SmBtn label="Export" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>Ref</th><th>Date</th><th>Description</th><th>Account</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{e.ref}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{e.date}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{e.description}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{e.account}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: e.debit ? 'var(--text-primary)' : 'var(--text-muted)' }}>{e.debit ? `UGX ${e.debit.toLocaleString()}` : '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: e.credit ? 'var(--text-primary)' : 'var(--text-muted)' }}>{e.credit ? `UGX ${e.credit.toLocaleString()}` : '—'}</td>
                  <td><Badge status={e.status} /></td>
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
    Posted: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    Approved: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', color: '#93bbfd' },
    Draft: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
  };
  const s = m[status] ?? m.Draft;
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{status}</span>;
}

function SmBtn({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
      {icon}{label}
    </button>
  );
}

function BarChart({ data }: { data: { month: string; dr: number; cr: number }[] }) {
  const W = 520, H = 150, pad = { l: 44, r: 12, t: 8, b: 28 };
  const max = Math.max(...data.flatMap((d) => [d.dr, d.cr]));
  const bw = (W - pad.l - pad.r) / data.length / 2.5;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {data.map((d, i) => {
        const x = pad.l + (i / data.length) * (W - pad.l - pad.r) + bw * 0.5;
        const hDr = ((d.dr / max) * (H - pad.t - pad.b));
        const hCr = ((d.cr / max) * (H - pad.t - pad.b));
        return (
          <g key={i}>
            <rect x={x} y={H - pad.b - hDr} width={bw} height={hDr} rx={4} fill="#3b82f6" opacity={0.8} />
            <rect x={x + bw + 3} y={H - pad.b - hCr} width={bw} height={hCr} rx={4} fill="#10b981" opacity={0.6} />
            <text x={x + bw} y={H - 8} textAnchor="middle" fill="var(--text-muted)" fontSize="10">{d.month}</text>
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
