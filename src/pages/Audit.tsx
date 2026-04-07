/**
 * Audit & Compliance Page — Tempo-style
 * Audit trail, exceptions, compliance checklist
 */

import React, { useState } from 'react';

const auditEvents = [
  { id: 'AE-001', timestamp: '2025-03-08 14:32', user: 'admin@maple.ac.ug', action: 'Invoice Created', entity: 'INV-20250108', module: 'Invoicing', ip: '192.168.1.15', risk: 'Low' },
  { id: 'AE-002', timestamp: '2025-03-08 14:15', user: 'finance@maple.ac.ug', action: 'Payment Voided', entity: 'PAY-20250304', module: 'Payments', ip: '192.168.1.22', risk: 'High' },
  { id: 'AE-003', timestamp: '2025-03-08 13:45', user: 'admin@maple.ac.ug', action: 'Fee Template Updated', entity: 'FT-002', module: 'Billing', ip: '192.168.1.15', risk: 'Medium' },
  { id: 'AE-004', timestamp: '2025-03-08 12:30', user: 'bursar@maple.ac.ug', action: 'Receipt Voided', entity: 'RCP-20250004', module: 'Receipts', ip: '192.168.1.30', risk: 'High' },
  { id: 'AE-005', timestamp: '2025-03-08 11:00', user: 'admin@maple.ac.ug', action: 'Student Enrolled', entity: 'STU-011', module: 'Students', ip: '192.168.1.15', risk: 'Low' },
  { id: 'AE-006', timestamp: '2025-03-08 10:20', user: 'finance@maple.ac.ug', action: 'Journal Entry Posted', entity: 'JE-20250045', module: 'Accounting', ip: '192.168.1.22', risk: 'Medium' },
  { id: 'AE-007', timestamp: '2025-03-07 16:45', user: 'admin@maple.ac.ug', action: 'User Role Changed', entity: 'USR-003', module: 'Settings', ip: '192.168.1.15', risk: 'High' },
  { id: 'AE-008', timestamp: '2025-03-07 15:30', user: 'bursar@maple.ac.ug', action: 'Budget Override', entity: 'BUD-003', module: 'Budget', ip: '192.168.1.30', risk: 'High' },
  { id: 'AE-009', timestamp: '2025-03-07 14:00', user: 'admin@maple.ac.ug', action: 'Payment Allocated', entity: 'PAY-20250306', module: 'Payments', ip: '192.168.1.15', risk: 'Low' },
  { id: 'AE-010', timestamp: '2025-03-07 10:15', user: 'finance@maple.ac.ug', action: 'Bank Recon Completed', entity: 'BA-002', module: 'Bank Recon', ip: '192.168.1.22', risk: 'Low' },
];

const compliance = [
  { item: 'Chart of Accounts configured', category: 'Accounting', status: 'Complete', dueDate: '2025-01-15' },
  { item: 'Tax registration (URA TIN)', category: 'Tax', status: 'Complete', dueDate: '2025-01-01' },
  { item: 'Annual audit preparation', category: 'Audit', status: 'In Progress', dueDate: '2025-06-30' },
  { item: 'Data backup verification', category: 'IT', status: 'Complete', dueDate: '2025-03-01' },
  { item: 'NSSF/LST compliance', category: 'Payroll', status: 'Complete', dueDate: '2025-03-15' },
  { item: 'Fee policy documentation', category: 'Billing', status: 'Pending', dueDate: '2025-04-01' },
  { item: 'Access control review', category: 'Security', status: 'In Progress', dueDate: '2025-03-31' },
  { item: 'Financial statements prep', category: 'Reporting', status: 'Pending', dueDate: '2025-07-31' },
];

const riskDist = [
  { label: 'Low Risk', value: 45, color: '#10b981' },
  { label: 'Medium Risk', value: 30, color: '#f59e0b' },
  { label: 'High Risk', value: 25, color: '#ef4444' },
];

const dailyEvents = [
  { day: 'Mon', count: 45 }, { day: 'Tue', count: 38 }, { day: 'Wed', count: 52 },
  { day: 'Thu', count: 41 }, { day: 'Fri', count: 58 }, { day: 'Sat', count: 12 }, { day: 'Sun', count: 5 },
];

export default function AuditPage() {
  const [tab, setTab] = useState<'events' | 'compliance'>('events');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'Low' | 'Medium' | 'High'>('all');

  const highRisk = auditEvents.filter(e => e.risk === 'High').length;
  const todayEvents = auditEvents.filter(e => e.timestamp.startsWith('2025-03-08')).length;
  const complianceDone = compliance.filter(c => c.status === 'Complete').length;

  let filteredEvents = auditEvents.filter(e => e.action.toLowerCase().includes(search.toLowerCase()) || e.user.toLowerCase().includes(search.toLowerCase()) || e.entity.toLowerCase().includes(search.toLowerCase()));
  if (riskFilter !== 'all') filteredEvents = filteredEvents.filter(e => e.risk === riskFilter);

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Audit & Compliance</h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>Activity monitoring & compliance tracking</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SmBtn label="Export Log" />
          <SmBtn label="Generate Report" primary />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon="📋" title="Today's Events" value={todayEvents.toString()} sub={`${auditEvents.length} total this week`} positive />
        <KPI icon="🚨" title="High Risk Actions" value={highRisk.toString()} sub="Requires review" positive={false} />
        <KPI icon="✅" title="Compliance" value={`${Math.round(complianceDone / compliance.length * 100)}%`} sub={`${complianceDone}/${compliance.length} items complete`} positive />
        <KPI icon="👥" title="Active Users" value="3" sub="In the last 24 hours" positive />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Weekly Activity</h3></div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{dailyEvents.reduce((s, d) => s + d.count, 0)}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>events this week</span>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><BarChart data={dailyEvents} /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Risk Distribution</h3></div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={riskDist} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{highRisk}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>High</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>{riskDist.map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.label}</span></div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.value}%</span>
              </div>
            ))}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['events', 'compliance'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: tab === t ? 'rgba(59,130,246,0.15)' : 'transparent', color: tab === t ? '#93c5fd' : 'var(--text-muted)', textTransform: 'capitalize' }}>{t === 'events' ? 'Audit Trail' : 'Compliance Checklist'}</button>
              ))}
            </div>
            {tab === 'events' && (<>
              <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 12, width: 160, height: 34, fontSize: 12 }} />
              <div style={{ display: 'flex', gap: 4 }}>
                {(['all', 'Low', 'Medium', 'High'] as const).map(f => (
                  <button key={f} onClick={() => setRiskFilter(f)} style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, border: 'none', cursor: 'pointer', background: riskFilter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: riskFilter === f ? '#93c5fd' : 'var(--text-muted)' }}>{f}</button>
                ))}
              </div>
            </>)}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {tab === 'events' ? (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Module</th><th>IP Address</th><th>Risk</th></tr></thead>
              <tbody>{filteredEvents.map(e => (
                <tr key={e.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 11 }}>{e.timestamp}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{e.user}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{e.action}</td>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontSize: 12 }}>{e.entity}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{e.module}</span></td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 11 }}>{e.ip}</td>
                  <td><RiskBadge risk={e.risk} /></td>
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>Item</th><th>Category</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>{compliance.map((c, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.item}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{c.category}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.dueDate}</td>
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
  return (<div className="card" style={{ padding: '20px 22px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}><span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{title}</span><div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 16 }}>{icon}</div></div><div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div><div style={{ marginTop: 8, fontSize: 12, color: positive ? '#34d399' : '#fbbf24' }}>{sub}</div></div>);
}
function SmBtn({ label, primary }: { label: string; primary?: boolean }) { return <button style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: primary ? 600 : 500, border: primary ? 'none' : '1px solid var(--glass-border)', background: primary ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.06)', color: primary ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: primary ? '0 0 20px rgba(59,130,246,0.2)' : 'none' }}>{label}</button>; }
function Badge({ label }: { label: string }) { const m: Record<string, { bg: string; b: string; t: string }> = { Complete: { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' }, 'In Progress': { bg: 'rgba(59,130,246,0.12)', b: 'rgba(59,130,246,0.3)', t: '#93c5fd' }, Pending: { bg: 'rgba(245,158,11,0.12)', b: 'rgba(245,158,11,0.3)', t: '#fcd34d' } }; const c = m[label] ?? m.Pending; return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.b}`, color: c.t }}>{label}</span>; }
function RiskBadge({ risk }: { risk: string }) { const m: Record<string, { bg: string; b: string; t: string }> = { Low: { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' }, Medium: { bg: 'rgba(245,158,11,0.12)', b: 'rgba(245,158,11,0.3)', t: '#fcd34d' }, High: { bg: 'rgba(239,68,68,0.12)', b: 'rgba(239,68,68,0.3)', t: '#fca5a5' } }; const c = m[risk] ?? m.Low; return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.b}`, color: c.t }}>{risk}</span>; }

function BarChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count)); const W = 400, H = 140, px = 20, bw = 28;
  return (<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}><defs><linearGradient id="audBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" /></linearGradient></defs>{data.map((d, i) => { const x = px + i * ((W - px * 2) / (data.length - 1)) - bw / 2; const h = (d.count / max) * (H - 40); return (<g key={d.day}><rect x={x} y={H - 20 - h} width={bw} height={h} rx={4} fill="url(#audBar)" opacity={0.85} /><text x={x + bw / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.day}</text></g>); })}</svg>);
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0); let cum = 0; const R = 54, r = 38;
  return (<svg viewBox="0 0 140 140" width="100%">{data.map((d) => { const start = (cum / total) * 2 * Math.PI - Math.PI / 2; cum += d.value; const end = (cum / total) * 2 * Math.PI - Math.PI / 2; const lg = d.value / total > 0.5 ? 1 : 0; const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`; return <path key={d.label} d={path} fill={d.color} opacity={0.85} />; })}</svg>);
}
