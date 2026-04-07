/**
 * Fixed Assets Page — Tempo-style
 * Asset register, depreciation, disposal management
 */

import React, { useState } from 'react';

/* ── Mock data ─────────────────────────────────────────────────── */
const assets = [
  { id: 'FA-001', name: 'School Bus — UAB 234X', category: 'Vehicles', cost: 121500000, accDep: 30375000, nbv: 91125000, method: 'SL', life: 8, acquired: '2023-01-15', status: 'Active' },
  { id: 'FA-002', name: 'Science Lab Equipment', category: 'Equipment', cost: 59400000, accDep: 19800000, nbv: 39600000, method: 'SL', life: 6, acquired: '2023-06-01', status: 'Active' },
  { id: 'FA-003', name: 'Computer Lab (30 PCs)', category: 'IT Equipment', cost: 48600000, accDep: 24300000, nbv: 24300000, method: 'SL', life: 4, acquired: '2024-01-10', status: 'Active' },
  { id: 'FA-004', name: 'Admin Block Furniture', category: 'Furniture', cost: 22950000, accDep: 4590000, nbv: 18360000, method: 'SL', life: 10, acquired: '2024-03-20', status: 'Active' },
  { id: 'FA-005', name: 'Playground Equipment', category: 'Equipment', cost: 17550000, accDep: 5850000, nbv: 11700000, method: 'SL', life: 6, acquired: '2024-06-15', status: 'Active' },
  { id: 'FA-006', name: 'Generator 50KVA', category: 'Plant & Machinery', cost: 32400000, accDep: 8100000, nbv: 24300000, method: 'RB', life: 8, acquired: '2024-09-01', status: 'Active' },
  { id: 'FA-007', name: 'Old Printer (HP)', category: 'IT Equipment', cost: 2295000, accDep: 2295000, nbv: 0, method: 'SL', life: 3, acquired: '2022-01-01', status: 'Disposed' },
];

const depTrend = [
  { month: 'Nov', amount: 4995000 },
  { month: 'Dec', amount: 4995000 },
  { month: 'Jan', amount: 5184000 },
  { month: 'Feb', amount: 5184000 },
  { month: 'Mar', amount: 5346000 },
  { month: 'Apr', amount: 5346000 },
];

const categoryBreakdown = [
  { label: 'Vehicles', value: 38, color: '#3b82f6' },
  { label: 'Equipment', value: 24, color: '#10b981' },
  { label: 'IT Equipment', value: 16, color: '#a855f7' },
  { label: 'Furniture', value: 12, color: '#f59e0b' },
  { label: 'Plant & Machinery', value: 10, color: '#ef4444' },
];

export default function AssetsPage() {
  const [period, setPeriod] = useState<'30' | '90' | 'currentFY' | 'lastFY' | 'all'>('30');
  const [search, setSearch] = useState('');

  const filtered = assets.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalCost = assets.reduce((s, a) => s + a.cost, 0);
  const totalNBV = assets.reduce((s, a) => s + a.nbv, 0);

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Fixed Assets</h1>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, gap: 2 }}>
          {([['30', '30 Days'], ['90', '3 Months'], ['currentFY', 'Current FY'], ['lastFY', 'Last FY'], ['all', 'All Time']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v as any)} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: period === v ? 'rgba(255,255,255,0.12)' : 'transparent', color: period === v ? 'var(--text-primary)' : 'var(--text-muted)' }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Run Depreciation</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>+ Add Asset</button>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>} title="Total Assets" value={`${assets.filter(a => a.status === 'Active').length}`} change={`UGX ${(totalCost / 1e6).toFixed(1)}M at cost`} positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} title="Net Book Value" value={`UGX ${(totalNBV / 1e6).toFixed(1)}M`} change={`${Math.round(totalNBV / totalCost * 100)}% of cost`} positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>} title="Monthly Depreciation" value="UGX 5.3M" change="+3.1% vs prior month" positive={false} />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>} title="Disposed" value="1" change="UGX 2.3M written off" positive={false} />
      </div>

      {/* ── Charts row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Depreciation Trend</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX 31.1M</span>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>6-month total</span>
              <span style={{ fontSize: 12, color: '#34d399' }}>Avg UGX 5.2M/mo</span>
            </div>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><MiniLineChart data={depTrend} /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Asset Categories</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={categoryBreakdown} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{assets.length}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Items</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {categoryBreakdown.map((s) => (
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

      {/* ── Asset register table ─────────────────────────── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Asset Register</h3>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="input" placeholder="Search assets…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 200, height: 34, fontSize: 12 }} />
            </div>
          </div>
          <SmBtn label="Export" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>ID</th><th>Asset Name</th><th>Category</th><th>Method</th><th style={{ textAlign: 'right' }}>Cost</th><th style={{ textAlign: 'right' }}>Acc. Dep.</th><th style={{ textAlign: 'right' }}>NBV</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{a.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.name}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{a.category}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.method === 'SL' ? 'Straight-Line' : 'Reducing Bal.'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {a.cost.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#fbbf24' }}>UGX {a.accDep.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: a.nbv > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{a.nbv > 0 ? `UGX ${a.nbv.toLocaleString()}` : '—'}</td>
                  <td><Badge status={a.status} /></td>
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
    Active: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    Disposed: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
  };
  const s = m[status] ?? m.Active;
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
  const max = Math.max(...data.map((d) => d.amount));
  const min = Math.min(...data.map((d) => d.amount)) * 0.8;
  const W = 500, H = 140, px = 30;
  const pts = data.map((d, i) => ({ x: px + (i / (data.length - 1)) * (W - px * 2), y: H - 20 - ((d.amount - min) / (max - min)) * (H - 40) }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H - 20} L${pts[0].x},${H - 20}Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs><linearGradient id="assetFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill="url(#assetFill)" />
      <path d={line} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#0f1d32" stroke="#3b82f6" strokeWidth="2" />
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{data[i].month}</text>
        </g>
      ))}
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
