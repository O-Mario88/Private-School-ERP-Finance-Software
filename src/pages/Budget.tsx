/**
 * Budget Page — Tempo-style
 * Budget planning, variance analysis, utilization tracking
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useDB } from '../database';
import { BudgetService } from '../database/DatabaseService';
import FormModal, { fieldLabel, fieldInput, fieldRow, fieldFull } from '../components/FormModal';

/* ── Mock data ─────────────────────────────────────────────────── */
/* ── Data from SQLite ── */
function useBudgetData(ver: number) {
  const { isReady } = useDB();
  const budgets = useMemo(() => isReady ? BudgetService.list() : [], [isReady, ver]);
  const budgetId = budgets.length > 0 ? budgets[0].id : null;
  const raw = useMemo(() => budgetId && isReady ? BudgetService.getLines(budgetId as string) : [], [isReady, budgetId]);
  return useMemo(() => raw.map((bl: any) => ({
    id: bl.id,
    account: bl.description || bl.category_name || '',
    dept: bl.category_name || 'General',
    budget: Number(bl.budgeted_amount) || 0,
    actual: Number(bl.actual_amount) || 0,
    variance: Number(bl.variance) || 0,
    pct: Number(bl.budgeted_amount) > 0 ? Math.round((Number(bl.actual_amount) / Number(bl.budgeted_amount)) * 100) : 0,
    status: Number(bl.variance) >= 0 ? 'On Track' : Math.abs(Number(bl.variance)) > Number(bl.budgeted_amount) * 0.05 ? 'Over Budget' : 'On Track',
  })), [raw]);
}

const varianceTrend = [
  { month: 'Nov', favorable: 8640000, unfavorable: 4860000 },
  { month: 'Dec', favorable: 7830000, unfavorable: 5670000 },
  { month: 'Jan', favorable: 11070000, unfavorable: 4050000 },
  { month: 'Feb', favorable: 9450000, unfavorable: 6480000 },
  { month: 'Mar', favorable: 10260000, unfavorable: 5130000 },
  { month: 'Apr', favorable: 9180000, unfavorable: 6210000 },
];

const deptUtilization = [
  { label: 'Administration', value: 28, color: '#3b82f6' },
  { label: 'Academic', value: 22, color: '#10b981' },
  { label: 'Operations', value: 20, color: '#f59e0b' },
  { label: 'Boarding', value: 18, color: '#a855f7' },
  { label: 'Facilities', value: 12, color: '#06b6d4' },
];

export default function BudgetPage() {
  const [period, setPeriod] = useState<'30' | '90' | 'currentFY' | 'lastFY' | 'all'>('30');
  const [search, setSearch] = useState('');
  const [ver, setVer] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', notes: '' });

  const budgetLines = useBudgetData(ver);

  const handleSubmit = useCallback(() => {
    if (!form.name) return;
    BudgetService.create({ name: form.name, notes: form.notes });
    setShowForm(false);
    setForm({ name: '', notes: '' });
    setVer(v => v + 1);
  }, [form]);

  const totalBudget = budgetLines.filter(b => b.dept !== 'Revenue').reduce((s, b) => s + b.budget, 0);
  const totalActual = budgetLines.filter(b => b.dept !== 'Revenue').reduce((s, b) => s + b.actual, 0);
  const totalVariance = totalBudget - totalActual;
  const utilPct = Math.round((totalActual / totalBudget) * 100);

  const filtered = budgetLines.filter(
    (b) => b.account.toLowerCase().includes(search.toLowerCase()) || b.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Budget</h1>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 2 }}>
          {([['30', '30 Days'], ['90', '3 Months'], ['currentFY', 'Current FY'], ['lastFY', 'Last FY'], ['all', 'All Time']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v as any)} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: period === v ? 'rgba(255,255,255,0.12)' : 'transparent', color: period === v ? 'var(--text-primary)' : 'var(--text-muted)' }}>{l}</button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
          + New Budget
        </button>
      </div>

      {/* ── KPI cards ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} title="Total Budget" value={`UGX ${(totalBudget / 1e6).toFixed(1)}M`} change="FY 2026 approved" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>} title="Utilized" value={`${utilPct}%`} change={`UGX ${(totalActual / 1e6).toFixed(1)}M spent`} positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>} title="Available" value={`UGX ${(totalVariance / 1e6).toFixed(1)}M`} change={`${100 - utilPct}% remaining`} positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>} title="Over Budget Lines" value="3" change="UGX 4.1M excess" positive={false} />
      </div>

      {/* ── Charts row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Variance Trend</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX {(totalVariance / 1e6).toFixed(1)}M</span>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Net favorable variance</span>
              <span style={{ fontSize: 12, color: '#34d399' }}>Budget on track</span>
            </div>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><BarChart data={varianceTrend} /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Spend by Department</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={deptUtilization} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{utilPct}%</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Used</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {deptUtilization.map((s) => (
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

      {/* ── Budget lines table ────────────────────────────── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Budget vs Actual</h3>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="input" placeholder="Search lines…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 200, height: 34, fontSize: 12 }} />
            </div>
          </div>
          <SmBtn label="Export" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>Account</th><th>Department</th><th style={{ textAlign: 'right' }}>Budget</th><th style={{ textAlign: 'right' }}>Actual</th><th style={{ textAlign: 'right' }}>Variance</th><th style={{ textAlign: 'right' }}>%</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.account}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{b.dept}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {b.budget.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {b.actual.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: b.variance >= 0 ? '#34d399' : '#f87171' }}>{b.variance >= 0 ? '+' : ''}{(b.variance / 1000).toFixed(0)}K</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: b.pct > 100 ? '#f87171' : 'var(--text-muted)' }}>{b.pct}%</td>
                  <td><Badge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <FormModal title="New Budget" onClose={() => setShowForm(false)} onSubmit={handleSubmit} submitLabel="Create Budget">
          <div style={fieldFull}><label style={fieldLabel}>Budget Name *</label><input style={fieldInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. FY 2026/27 Operating Budget" /></div>
          <div style={fieldFull}><label style={fieldLabel}>Notes</label><input style={fieldInput} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" /></div>
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
    'On Track': { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    'Under Budget': { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', color: '#93bbfd' },
    'Over Budget': { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
    'Under Target': { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
  };
  const s = m[status] ?? m['On Track'];
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{status}</span>;
}

function SmBtn({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
      {icon}{label}
    </button>
  );
}

function BarChart({ data }: { data: { month: string; favorable: number; unfavorable: number }[] }) {
  const max = Math.max(...data.map((d) => Math.max(d.favorable, d.unfavorable)));
  const W = 500, H = 160, px = 40, barW = 24, gap = 8;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {data.map((d, i) => {
        const x = px + i * ((W - px * 2) / data.length) + gap;
        const hF = (d.favorable / max) * (H - 40);
        const hU = (d.unfavorable / max) * (H - 40);
        return (
          <g key={d.month}>
            <rect x={x} y={H - 20 - hF} width={barW} height={hF} rx={4} fill="rgba(16,185,129,0.35)" />
            <rect x={x + barW + 3} y={H - 20 - hU} width={barW} height={hU} rx={4} fill="rgba(239,68,68,0.3)" />
            <text x={x + barW + 1} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.month}</text>
          </g>
        );
      })}
      <text x={W - 20} y={14} textAnchor="end" fontSize="9" fill="#34d399">■ Favorable</text>
      <text x={W - 20} y={26} textAnchor="end" fontSize="9" fill="#f87171">■ Unfavorable</text>
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
