/**
 * Billing Page — Tempo-style
 * Fee templates, billing cycles, term billing status
 */

import React, { useState, useMemo } from 'react';
import { useDB } from '../database';
import { BillingService } from '../database/DatabaseService';

function useBillingData(search: string) {
  const { isReady } = useDB();
  const raw = useMemo(() => isReady ? BillingService.getFeeTemplates() : [], [isReady]);
  const feeTemplates = useMemo(() => raw.map((t: any) => ({
    id: t.id,
    name: t.name || '',
    amount: Number(t.total_amount) || 0,
    category: t.class_name || 'General',
    term: 'Term 1',
    students: Number(t.line_count) || 0,
    status: t.status === 'active' ? 'Active' : t.status || 'Active',
  })), [raw]);
  return { feeTemplates };
}

const billingCycles = [
  { id: 'BC-001', term: 'Term 1 2025', start: '2025-02-03', end: '2025-04-11', invoiced: 264600000, collected: 237500000, pending: 27100000, status: 'Active' },
  { id: 'BC-002', term: 'Term 2 2024', start: '2024-09-02', end: '2024-11-22', invoiced: 248400000, collected: 240200000, pending: 8200000, status: 'Closed' },
  { id: 'BC-003', term: 'Term 3 2024', start: '2024-05-06', end: '2024-07-26', invoiced: 240300000, collected: 234100000, pending: 6200000, status: 'Closed' },
];

const categoryPerf = [
  { label: 'Tuition', value: 62, color: '#3b82f6' },
  { label: 'Boarding', value: 18, color: '#10b981' },
  { label: 'Transport', value: 10, color: '#f59e0b' },
  { label: 'Meals', value: 6, color: '#a855f7' },
  { label: 'Extra', value: 4, color: '#ec4899' },
];

const collectionTrend = [
  { month: 'Nov', amt: 1200000 }, { month: 'Dec', amt: 1800000 }, { month: 'Jan', amt: 3200000 },
  { month: 'Feb', amt: 2100000 }, { month: 'Mar', amt: 1500000 }, { month: 'Apr', amt: 800000 },
];

export default function BillingPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'templates' | 'cycles'>('templates');

  const { feeTemplates } = useBillingData(search);

  const totalRev = feeTemplates.reduce((s, t) => s + t.amount * t.students, 0);
  const activeTemplates = feeTemplates.filter(t => t.status === 'Active').length;
  const activeCycle = billingCycles[0];
  const collRate = Math.round((activeCycle.collected / activeCycle.invoiced) * 100);

  const filteredTemplates = feeTemplates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Billing</h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>Billing execution & cycle status</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SmBtn label="Run Billing Cycle" primary />
          <SmBtn label="+ Fee Template" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon="💰" title="Potential Revenue" value={`UGX ${(totalRev / 1e6).toFixed(1)}M`} sub="Per billing cycle" positive />
        <KPI icon="📋" title="Active Templates" value={activeTemplates.toString()} sub={`${feeTemplates.length} total`} positive />
        <KPI icon="📊" title="How Much Collected" value={`${collRate}%`} sub={`Term 1 2025`} positive={collRate >= 75} />
        <KPI icon="⏳" title="Outstanding" value={`UGX ${(activeCycle.pending / 1e6).toFixed(1)}M`} sub="Current term" positive={false} />
      </div>

      {/* Fee Engine notice */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Fee templates, billing rules, discounts, and installment plans are configured in <strong style={{ color: '#93c5fd' }}>Settings → Fee Engine</strong>. This page shows billing execution and cycle status.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Collection Trend</h3>
          </div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX {(activeCycle.collected / 1e6).toFixed(1)}M</span>
            <span style={{ fontSize: 12, color: '#34d399', marginLeft: 8 }}>Collected this term</span>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><BarChart data={collectionTrend} /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Revenue by Category</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={categoryPerf} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>5</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Categories</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>{categoryPerf.map(c => (
              <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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
            <div style={{ display: 'flex', gap: 4 }}>
              {(['templates', 'cycles'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: tab === t ? 'rgba(59,130,246,0.15)' : 'transparent', color: tab === t ? '#93c5fd' : 'var(--text-muted)', textTransform: 'capitalize' }}>{t === 'templates' ? 'Fee Templates' : 'Billing Cycles'}</button>
              ))}
            </div>
            {tab === 'templates' && (
              <div style={{ position: 'relative' }}>
                <input className="input" placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 12, width: 180, height: 34, fontSize: 12 }} />
              </div>
            )}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {tab === 'templates' ? (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>ID</th><th>Template Name</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th><th>Term</th><th style={{ textAlign: 'right' }}>Students</th><th>Status</th></tr></thead>
              <tbody>{filteredTemplates.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{t.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.name}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{t.category}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {t.amount.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{t.term}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-primary)' }}>{t.students}</td>
                  <td><Badge label={t.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>Term</th><th>Period</th><th style={{ textAlign: 'right' }}>Invoiced</th><th style={{ textAlign: 'right' }}>Collected</th><th style={{ textAlign: 'right' }}>Pending</th><th>Status</th></tr></thead>
              <tbody>{billingCycles.map(c => (
                <tr key={c.term}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.term}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.start} → {c.end}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {(c.invoiced / 1e6).toFixed(1)}M</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#34d399' }}>UGX {(c.collected / 1e6).toFixed(1)}M</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#fbbf24' }}>UGX {(c.pending / 1e6).toFixed(1)}M</td>
                  <td><Badge label={c.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ icon, title, value, sub, positive }: { icon: string; title: string; value: string; sub: string; positive: boolean }) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{title}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 16 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ marginTop: 8, fontSize: 12, color: positive ? '#34d399' : '#fbbf24' }}>{sub}</div>
    </div>
  );
}

function SmBtn({ label, primary }: { label: string; primary?: boolean }) {
  return <button style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: primary ? 600 : 500, border: primary ? 'none' : '1px solid var(--glass-border)', background: primary ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.06)', color: primary ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: primary ? '0 0 20px rgba(59,130,246,0.2)' : 'none' }}>{label}</button>;
}

function Badge({ label }: { label: string }) {
  const c = label === 'Active' ? { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' } : label === 'Closed' ? { bg: 'rgba(107,114,128,0.12)', b: 'rgba(107,114,128,0.3)', t: '#9ca3af' } : { bg: 'rgba(239,68,68,0.12)', b: 'rgba(239,68,68,0.3)', t: '#fca5a5' };
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.b}`, color: c.t }}>{label}</span>;
}

function BarChart({ data }: { data: { month: string; amt: number }[] }) {
  const max = Math.max(...data.map(d => d.amt));
  const W = 500, H = 140, px = 30, bw = 36;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {data.map((d, i) => { const x = px + i * ((W - px * 2) / (data.length - 1)) - bw / 2; const h = (d.amt / max) * (H - 40); return (
        <g key={d.month}>
          <rect x={x} y={H - 20 - h} width={bw} height={h} rx={5} fill="url(#billingBar)" opacity={0.85} />
          <text x={x + bw / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.month}</text>
        </g>
      ); })}
      <defs><linearGradient id="billingBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" /></linearGradient></defs>
    </svg>
  );
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0); let cum = 0; const R = 54, r = 38;
  return (<svg viewBox="0 0 140 140" width="100%">{data.map((d) => { const start = (cum / total) * 2 * Math.PI - Math.PI / 2; cum += d.value; const end = (cum / total) * 2 * Math.PI - Math.PI / 2; const lg = d.value / total > 0.5 ? 1 : 0; const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`; return <path key={d.label} d={path} fill={d.color} opacity={0.85} />; })}</svg>);
}
