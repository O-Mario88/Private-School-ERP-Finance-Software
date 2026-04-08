/**
 * Transport Page — Tempo-style
 * Routes, vehicle assignments, profitability, occupancy
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useDB } from '../database';
import { TransportService } from '../database/DatabaseService';
import FormModal, { fieldLabel, fieldInput, fieldRow, fieldFull } from '../components/FormModal';

function useTransportData(search: string, ver: number) {
  const { isReady } = useDB();
  const raw = useMemo(() => isReady ? TransportService.listRoutes() : [], [isReady, ver]);
  const stats = useMemo(() => isReady ? TransportService.getStats() : null, [isReady]);

  const routes = useMemo(() => raw.map((r: any) => ({
    id: r.id,
    name: r.route_name || '',
    vehicle: r.vehicle_reg || '',
    driver: r.driver_name || '',
    students: Number(r.current_students) || 0,
    feePerStudent: Number(r.cost_per_term) || 0,
    monthlyCost: Math.round((Number(r.cost_per_term) || 0) * 0.3),
    status: r.status === 'active' ? 'Active' : r.status,
  })), [raw]);

  const filtered = useMemo(() =>
    routes.filter(r => r.name.toLowerCase().includes(search.toLowerCase())),
    [routes, search]
  );

  return { routes, filtered, stats };
}

const occupancyData = [
  { label: 'Full (90%+)', value: 30, color: '#10b981' },
  { label: 'Good (70-89%)', value: 40, color: '#3b82f6' },
  { label: 'Low (50-69%)', value: 20, color: '#f59e0b' },
  { label: 'Under (<50%)', value: 10, color: '#ef4444' },
];

const monthlyRevenue = [
  { month: 'Nov', rev: 2200000, cost: 1100000 }, { month: 'Dec', rev: 2400000, cost: 1120000 },
  { month: 'Jan', rev: 2700000, cost: 1320000 }, { month: 'Feb', rev: 2600000, cost: 1280000 },
  { month: 'Mar', rev: 2697000, cost: 1320000 }, { month: 'Apr', rev: 2500000, cost: 1300000 },
];

export default function TransportPage() {
  const [search, setSearch] = useState('');
  const [ver, setVer] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ route_name: '', vehicle_reg: '', driver_name: '', cost_per_term: '' });

  const { routes, filtered, stats } = useTransportData(search, ver);

  const handleSubmit = useCallback(() => {
    if (!form.route_name) return;
    TransportService.createRoute({ route_name: form.route_name, vehicle_reg: form.vehicle_reg, driver_name: form.driver_name, cost_per_term: Number(form.cost_per_term) || 0 });
    setShowForm(false);
    setForm({ route_name: '', vehicle_reg: '', driver_name: '', cost_per_term: '' });
    setVer(v => v + 1);
  }, [form]);

  const totalStudents = routes.reduce((s, r) => s + r.students, 0);
  const totalRev = routes.reduce((s, r) => s + r.students * r.feePerStudent, 0);
  const totalCost = routes.reduce((s, r) => s + r.monthlyCost, 0);
  const activeRoutes = routes.filter(r => r.status === 'Active').length;
  const occupancy = Math.round(occupancyData.reduce((s, d) => s + d.value, 0) / occupancyData.length);

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 4v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Transport</h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>Fleet & route management</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SmBtn label="Assign Students" />
          <SmBtn label="+ Add Route" primary onClick={() => setShowForm(true)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon="🚌" title="Active Routes" value={activeRoutes.toString()} sub={`${routes.length} total routes`} positive />
        <KPI icon="👨‍🎓" title="Students on Bus" value={totalStudents.toString()} sub={`${activeRoutes} active routes`} positive />
        <KPI icon="💰" title="Transport Revenue" value={`UGX ${(totalRev / 1e6).toFixed(1)}M`} sub="Per term" positive />
        <KPI icon="📊" title="Net Profit" value={`UGX ${((totalRev - totalCost) / 1e6).toFixed(1)}M`} sub={`${Math.round((totalRev - totalCost) / totalRev * 100)}% margin`} positive />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Revenue vs Cost</h3></div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX {((totalRev - totalCost) / 1e6).toFixed(1)}M</span>
            <span style={{ fontSize: 12, color: '#34d399', marginLeft: 8 }}>net profit this term</span>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><BarChart data={monthlyRevenue} /></div>
          <div style={{ display: 'flex', gap: 16, padding: '0 24px 16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} />Revenue</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444' }} />Cost</span>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Occupancy Rate</h3></div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={occupancyData} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{occupancy}%</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>{occupancyData.map(o => (
              <div key={o.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: o.color }} /><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.label}</span></div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{o.value}%</span>
              </div>
            ))}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Route Register</h3>
            <input className="input" placeholder="Search routes…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 12, width: 180, height: 34, fontSize: 12 }} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>Route</th><th>Vehicle</th><th>Driver</th><th style={{ textAlign: 'center' }}>Students</th><th style={{ textAlign: 'right' }}>Fee/Student</th><th style={{ textAlign: 'right' }}>Revenue</th><th style={{ textAlign: 'right' }}>Cost</th><th style={{ textAlign: 'right' }}>Profit</th><th>Status</th></tr></thead>
            <tbody>{filtered.map(r => {
              const revenue = r.students * r.feePerStudent;
              const profit = revenue - r.monthlyCost;
              return (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>{r.vehicle || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.driver || '—'}</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-primary)' }}>{r.students || '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{r.feePerStudent > 0 ? `UGX ${(r.feePerStudent / 1e3).toFixed(0)}K` : '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{revenue > 0 ? `UGX ${(revenue / 1e6).toFixed(1)}M` : '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#f87171' }}>{r.monthlyCost > 0 ? `UGX ${(r.monthlyCost / 1e6).toFixed(1)}M` : '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: profit > 0 ? '#34d399' : 'var(--text-muted)' }}>{profit > 0 ? `UGX ${(profit / 1e6).toFixed(1)}M` : '—'}</td>
                  <td><Badge label={r.status} /></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <FormModal title="Add Transport Route" onClose={() => setShowForm(false)} onSubmit={handleSubmit} submitLabel="Create Route">
          <div style={fieldFull}><label style={fieldLabel}>Route Name *</label><input style={fieldInput} value={form.route_name} onChange={e => setForm({ ...form, route_name: e.target.value })} placeholder="e.g. Kampala — Entebbe" /></div>
          <div style={fieldRow}>
            <div><label style={fieldLabel}>Vehicle Reg</label><input style={fieldInput} value={form.vehicle_reg} onChange={e => setForm({ ...form, vehicle_reg: e.target.value })} placeholder="UAX 123B" /></div>
            <div><label style={fieldLabel}>Driver Name</label><input style={fieldInput} value={form.driver_name} onChange={e => setForm({ ...form, driver_name: e.target.value })} /></div>
          </div>
          <div style={fieldFull}><label style={fieldLabel}>Cost Per Term (UGX)</label><input type="number" style={fieldInput} value={form.cost_per_term} onChange={e => setForm({ ...form, cost_per_term: e.target.value })} /></div>
        </FormModal>
      )}
    </div>
  );
}

function KPI({ icon, title, value, sub, positive }: { icon: string; title: string; value: string; sub: string; positive: boolean }) {
  return (<div className="card" style={{ padding: '20px 22px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}><span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{title}</span><div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 16 }}>{icon}</div></div><div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div><div style={{ marginTop: 8, fontSize: 12, color: positive ? '#34d399' : '#fbbf24' }}>{sub}</div></div>);
}
function SmBtn({ label, primary, onClick }: { label: string; primary?: boolean; onClick?: () => void }) { return <button onClick={onClick} style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: primary ? 600 : 500, border: primary ? 'none' : '1px solid var(--glass-border)', background: primary ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.06)', color: primary ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: primary ? '0 0 20px rgba(59,130,246,0.2)' : 'none' }}>{label}</button>; }
function Badge({ label }: { label: string }) { const c = label === 'Active' ? { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' } : { bg: 'rgba(59,130,246,0.12)', b: 'rgba(59,130,246,0.3)', t: '#93c5fd' }; return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.b}`, color: c.t }}>{label}</span>; }

function BarChart({ data }: { data: { month: string; rev: number; cost: number }[] }) {
  const max = Math.max(...data.map(d => d.rev)); const W = 500, H = 140, px = 30, bw = 16;
  return (<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}><defs><linearGradient id="trRevBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient><linearGradient id="trCostBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#dc2626" /></linearGradient></defs>{data.map((d, i) => { const cx = px + i * ((W - px * 2) / (data.length - 1)); const hR = (d.rev / max) * (H - 40); const hC = (d.cost / max) * (H - 40); return (<g key={d.month}><rect x={cx - bw - 1} y={H - 20 - hR} width={bw} height={hR} rx={3} fill="url(#trRevBar)" opacity={0.85} /><rect x={cx + 1} y={H - 20 - hC} width={bw} height={hC} rx={3} fill="url(#trCostBar)" opacity={0.85} /><text x={cx} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.month}</text></g>); })}</svg>);
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0); let cum = 0; const R = 54, r = 38;
  return (<svg viewBox="0 0 140 140" width="100%">{data.map((d) => { const start = (cum / total) * 2 * Math.PI - Math.PI / 2; cum += d.value; const end = (cum / total) * 2 * Math.PI - Math.PI / 2; const lg = d.value / total > 0.5 ? 1 : 0; const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`; return <path key={d.label} d={path} fill={d.color} opacity={0.85} />; })}</svg>);
}
