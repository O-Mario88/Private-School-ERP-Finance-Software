/**
 * Reports Page — Tempo-style
 * Report center: categories, saved reports, scheduled reports
 */

import React, { useState } from 'react';

const reportCategories = [
  { name: 'Financial Statements', icon: '📊', reports: 8, description: 'Income statement, balance sheet, cash flow, trial balance' },
  { name: 'Fee & Collections', icon: '💰', reports: 6, description: 'Fee book, aging report, collection summary, defaulters' },
  { name: 'Student Reports', icon: '👨‍🎓', reports: 5, description: 'Enrollment, class lists, financial clearance, balances' },
  { name: 'Payroll Reports', icon: '💼', reports: 4, description: 'Payroll summary, payslips, statutory deductions, PAYE returns' },
  { name: 'Budget Reports', icon: '📋', reports: 3, description: 'Budget vs actual, variance analysis, department spend' },
  { name: 'Tax & Compliance', icon: '🏛️', reports: 3, description: 'VAT returns, withholding tax, URA returns' },
];

const savedReports = [
  { id: 'SR-001', name: 'Term 1 Fee Collection Summary', category: 'Fee & Collections', created: '2025-03-01', lastRun: '2025-03-08', format: 'PDF', runs: 12 },
  { id: 'SR-002', name: 'Monthly Payroll Report – March', category: 'Payroll Reports', created: '2025-03-05', lastRun: '2025-03-08', format: 'Excel', runs: 3 },
  { id: 'SR-003', name: 'Defaulters List > UGX 1.35M', category: 'Fee & Collections', created: '2025-02-15', lastRun: '2025-03-07', format: 'PDF', runs: 8 },
  { id: 'SR-004', name: 'Trial Balance – Feb 2025', category: 'Financial Statements', created: '2025-03-01', lastRun: '2025-03-06', format: 'PDF', runs: 5 },
  { id: 'SR-005', name: 'Budget Variance Q1', category: 'Budget Reports', created: '2025-03-02', lastRun: '2025-03-08', format: 'Excel', runs: 4 },
  { id: 'SR-006', name: 'Student Balance Report', category: 'Student Reports', created: '2025-01-10', lastRun: '2025-03-08', format: 'PDF', runs: 25 },
];

const scheduled = [
  { name: 'Daily Collection Summary', frequency: 'Daily', nextRun: '2025-03-09 08:00', recipients: 'bursar@maple.ac.ug', status: 'Active' },
  { name: 'Weekly Fee Aging', frequency: 'Weekly', nextRun: '2025-03-10 09:00', recipients: 'finance@maple.ac.ug', status: 'Active' },
  { name: 'Monthly Payroll Summary', frequency: 'Monthly', nextRun: '2025-04-01 08:00', recipients: 'admin@maple.ac.ug', status: 'Active' },
  { name: 'Term Fee Book', frequency: 'Termly', nextRun: '2025-04-15 10:00', recipients: 'principal@maple.ac.ug', status: 'Paused' },
];

const usageTrend = [
  { month: 'Oct', count: 45 }, { month: 'Nov', count: 62 }, { month: 'Dec', count: 38 },
  { month: 'Jan', count: 85 }, { month: 'Feb', count: 72 }, { month: 'Mar', count: 58 },
];

const formatDist = [
  { label: 'PDF', value: 55, color: '#ef4444' },
  { label: 'Excel', value: 30, color: '#10b981' },
  { label: 'CSV', value: 10, color: '#3b82f6' },
  { label: 'Print', value: 5, color: '#f59e0b' },
];

export default function ReportsPage() {
  const [tab, setTab] = useState<'categories' | 'saved' | 'scheduled'>('categories');
  const [search, setSearch] = useState('');

  const totalReports = reportCategories.reduce((s, c) => s + c.reports, 0);
  const totalRuns = savedReports.reduce((s, r) => s + r.runs, 0);

  const filteredSaved = savedReports.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Reports</h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>Report center & scheduling</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SmBtn label="Schedule Report" />
          <SmBtn label="+ Custom Report" primary />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon="📊" title="Available Reports" value={totalReports.toString()} sub={`${reportCategories.length} categories`} positive />
        <KPI icon="💾" title="Saved Reports" value={savedReports.length.toString()} sub={`${totalRuns} total runs`} positive />
        <KPI icon="⏰" title="Scheduled" value={scheduled.filter(s => s.status === 'Active').length.toString()} sub={`${scheduled.length} total`} positive />
        <KPI icon="📈" title="Reports This Month" value={usageTrend[usageTrend.length - 1].count.toString()} sub="Generated in March" positive />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Report Generation Trend</h3></div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{usageTrend.reduce((s, u) => s + u.count, 0)}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>reports generated (6 months)</span>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><MiniLineChart data={usageTrend} gradId="rptTrend" /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Export Formats</h3></div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={formatDist} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>4</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Formats</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>{formatDist.map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: f.color }} /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.label}</span></div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{f.value}%</span>
              </div>
            ))}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['categories', 'saved', 'scheduled'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: tab === t ? 'rgba(59,130,246,0.15)' : 'transparent', color: tab === t ? '#93c5fd' : 'var(--text-muted)', textTransform: 'capitalize' }}>{t}</button>
              ))}
            </div>
            {tab === 'saved' && <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 12, width: 180, height: 34, fontSize: 12 }} />}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {tab === 'categories' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 24 }}>
              {reportCategories.map(c => (
                <div key={c.name} style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--glass-border)')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#93c5fd' }}>{c.reports} reports</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.description}</div>
                </div>
              ))}
            </div>
          ) : tab === 'saved' ? (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>Report Name</th><th>Category</th><th>Format</th><th>Created</th><th>Last Run</th><th style={{ textAlign: 'right' }}>Runs</th><th>Action</th></tr></thead>
              <tbody>{filteredSaved.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{r.category}</span></td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: r.format === 'PDF' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${r.format === 'PDF' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, color: r.format === 'PDF' ? '#fca5a5' : '#6ee7b7' }}>{r.format}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.created}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.lastRun}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-primary)' }}>{r.runs}</td>
                  <td><button style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.1)', color: '#93c5fd', cursor: 'pointer' }}>Run</button></td>
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>Report</th><th>Frequency</th><th>Next Run</th><th>Recipients</th><th>Status</th></tr></thead>
              <tbody>{scheduled.map((s, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.frequency}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>{s.nextRun}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.recipients}</td>
                  <td><Badge label={s.status} /></td>
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
function Badge({ label }: { label: string }) { const c = label === 'Active' ? { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' } : { bg: 'rgba(245,158,11,0.12)', b: 'rgba(245,158,11,0.3)', t: '#fcd34d' }; return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.b}`, color: c.t }}>{label}</span>; }

function MiniLineChart({ data, gradId }: { data: { month: string; count: number }[]; gradId: string }) {
  const max = Math.max(...data.map(d => d.count)); const min = Math.min(...data.map(d => d.count)) * 0.8;
  const W = 500, H = 140, px = 30;
  const pts = data.map((d, i) => ({ x: px + (i / (data.length - 1)) * (W - px * 2), y: H - 20 - ((d.count - min) / (max - min)) * (H - 40) }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H - 20} L${pts[0].x},${H - 20}Z`;
  return (<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}><defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs><path d={area} fill={`url(#${gradId})`} /><path d={line} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{pts.map((p, i) => (<g key={i}><circle cx={p.x} cy={p.y} r="3.5" fill="#0f1d32" stroke="#3b82f6" strokeWidth="2" /><text x={p.x} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{data[i].month}</text></g>))}</svg>);
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0); let cum = 0; const R = 54, r = 38;
  return (<svg viewBox="0 0 140 140" width="100%">{data.map((d) => { const start = (cum / total) * 2 * Math.PI - Math.PI / 2; cum += d.value; const end = (cum / total) * 2 * Math.PI - Math.PI / 2; const lg = d.value / total > 0.5 ? 1 : 0; const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`; return <path key={d.label} d={path} fill={d.color} opacity={0.85} />; })}</svg>);
}
