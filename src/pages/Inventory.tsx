/**
 * Inventory Page — Tempo-style
 * Stock levels, low-stock alerts, movements, valuation
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useDB } from '../database';
import { InventoryService } from '../database/DatabaseService';
import FormModal, { fieldLabel, fieldInput, fieldRow, fieldFull } from '../components/FormModal';

function useInventoryData(search: string, ver: number) {
  const { isReady } = useDB();
  const raw = useMemo(() => isReady ? InventoryService.listItems() : [], [isReady, ver]);
  return useMemo(() => raw.map((i: any) => ({
    id: i.id,
    name: i.name || '',
    category: i.category || '',
    unit: i.unit_of_measure || 'pcs',
    stock: Number(i.quantity_on_hand) || 0,
    reorder: Number(i.reorder_level) || 0,
    cost: Number(i.unit_cost) || 0,
    value: (Number(i.unit_cost) || 0) * (Number(i.quantity_on_hand) || 0),
    location: i.location || '',
    status: Number(i.quantity_on_hand) === 0 ? 'Out of Stock' : Number(i.quantity_on_hand) <= Number(i.reorder_level) ? 'Low Stock' : 'In Stock',
  })), [raw]);
}

const movements = [
  { date: '2025-03-08', item: 'Exercise Books (48pg)', type: 'Issue', qty: -100, by: 'Admin' },
  { date: '2025-03-07', item: 'Printer Paper A4', type: 'Issue', qty: -20, by: 'Admin' },
  { date: '2025-03-06', item: 'Chalk Box (White)', type: 'Receipt', qty: 50, by: 'Procurement' },
  { date: '2025-03-05', item: 'Lab Chemicals Set', type: 'Issue', qty: -3, by: 'Lab Tech' },
  { date: '2025-03-04', item: 'Sports Balls (Football)', type: 'Issue', qty: -5, by: 'PE Teacher' },
];

const categoryDist = [
  { label: 'Stationery', value: 35, color: '#3b82f6' },
  { label: 'Textbooks', value: 20, color: '#10b981' },
  { label: 'Supplies', value: 18, color: '#f59e0b' },
  { label: 'Lab', value: 15, color: '#a855f7' },
  { label: 'Other', value: 12, color: '#ec4899' },
];

const monthlyUsage = [
  { month: 'Nov', val: 4860000 }, { month: 'Dec', val: 2565000 }, { month: 'Jan', val: 6750000 },
  { month: 'Feb', val: 5670000 }, { month: 'Mar', val: 4590000 }, { month: 'Apr', val: 3240000 },
];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');
  const [filter, setFilter] = useState<'all' | 'Low Stock' | 'Out of Stock'>('all');
  const [ver, setVer] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Stationery', unit_of_measure: 'pcs', unit_cost: '', quantity_on_hand: '', reorder_level: '10' });

  const items = useInventoryData(search, ver);

  const handleSubmit = useCallback(() => {
    if (!form.name || !form.unit_cost) return;
    InventoryService.addItem({ name: form.name, category: form.category, unit_of_measure: form.unit_of_measure, unit_cost: Number(form.unit_cost), quantity_on_hand: Number(form.quantity_on_hand) || 0, reorder_level: Number(form.reorder_level) });
    setShowForm(false);
    setForm({ name: '', category: 'Stationery', unit_of_measure: 'pcs', unit_cost: '', quantity_on_hand: '', reorder_level: '10' });
    setVer(v => v + 1);
  }, [form]);

  const totalValue = items.reduce((s, i) => s + i.value, 0);
  const lowStock = items.filter(i => i.status === 'Low Stock').length;
  const outOfStock = items.filter(i => i.status === 'Out of Stock').length;

  let filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));
  if (filter !== 'all') filtered = filtered.filter(i => i.status === filter);

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Inventory</h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>Stock management & tracking</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SmBtn label="Stock Take" />
          <SmBtn label="+ Add Item" primary onClick={() => setShowForm(true)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon="📦" title="Total Items" value={items.length.toString()} sub={`UGX ${(totalValue / 1e6).toFixed(1)}M total value`} positive />
        <KPI icon="⚠️" title="Low Stock" value={lowStock.toString()} sub="Below reorder level" positive={false} />
        <KPI icon="🚫" title="Out of Stock" value={outOfStock.toString()} sub="Needs immediate order" positive={false} />
        <KPI icon="📊" title="Avg Monthly Usage" value={`UGX ${(monthlyUsage.reduce((s, m) => s + m.val, 0) / monthlyUsage.length / 1e6).toFixed(1)}M`} sub="6-month average" positive />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Monthly Usage Trend</h3></div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX {(totalValue / 1e6).toFixed(1)}M</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>current stock value</span>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><MiniLineChart data={monthlyUsage} gradId="invUsage" /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Stock by Category</h3></div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={categoryDist} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>5</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Categories</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>{categoryDist.map(c => (
              <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} /><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.label}</span></div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.value}%</span>
              </div>
            ))}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['stock', 'movements'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: tab === t ? 'rgba(59,130,246,0.15)' : 'transparent', color: tab === t ? '#93c5fd' : 'var(--text-muted)', textTransform: 'capitalize' }}>{t === 'stock' ? 'Stock Levels' : 'Movements'}</button>
              ))}
            </div>
            {tab === 'stock' && (<>
              <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 12, width: 160, height: 34, fontSize: 12 }} />
              <div style={{ display: 'flex', gap: 4 }}>
                {(['all', 'Low Stock', 'Out of Stock'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, border: 'none', cursor: 'pointer', background: filter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: filter === f ? '#93c5fd' : 'var(--text-muted)' }}>{f}</button>
                ))}
              </div>
            </>)}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {tab === 'stock' ? (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>ID</th><th>Item</th><th>Category</th><th style={{ textAlign: 'right' }}>Stock</th><th style={{ textAlign: 'right' }}>Reorder</th><th style={{ textAlign: 'right' }}>Unit Cost</th><th style={{ textAlign: 'right' }}>Value</th><th>Location</th><th>Status</th></tr></thead>
              <tbody>{filtered.map(i => (
                <tr key={i.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{i.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{i.name}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{i.category}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: i.stock <= i.reorder ? '#fbbf24' : 'var(--text-primary)' }}>{i.stock} {i.unit}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{i.reorder}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>UGX {i.cost.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {i.value.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{i.location}</td>
                  <td><Badge label={i.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>Date</th><th>Item</th><th>Type</th><th style={{ textAlign: 'right' }}>Qty</th><th>By</th></tr></thead>
              <tbody>{movements.map((m, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{m.date}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.item}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: m.type === 'Receipt' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${m.type === 'Receipt' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, color: m.type === 'Receipt' ? '#6ee7b7' : '#fca5a5' }}>{m.type}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: m.qty > 0 ? '#34d399' : '#f87171' }}>{m.qty > 0 ? `+${m.qty}` : m.qty}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m.by}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <FormModal title="Add Inventory Item" onClose={() => setShowForm(false)} onSubmit={handleSubmit} submitLabel="Add Item">
          <div style={fieldFull}><label style={fieldLabel}>Item Name *</label><input style={fieldInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Exercise Books (48pg)" /></div>
          <div style={fieldRow}>
            <div><label style={fieldLabel}>Category</label><select style={fieldInput} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Stationery</option><option>Textbooks</option><option>Supplies</option><option>Lab</option><option>Other</option></select></div>
            <div><label style={fieldLabel}>Unit</label><input style={fieldInput} value={form.unit_of_measure} onChange={e => setForm({ ...form, unit_of_measure: e.target.value })} placeholder="pcs, kg, litre" /></div>
          </div>
          <div style={fieldRow}>
            <div><label style={fieldLabel}>Unit Cost (UGX) *</label><input type="number" style={fieldInput} value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: e.target.value })} /></div>
            <div><label style={fieldLabel}>Initial Stock Qty</label><input type="number" style={fieldInput} value={form.quantity_on_hand} onChange={e => setForm({ ...form, quantity_on_hand: e.target.value })} /></div>
          </div>
          <div style={fieldFull}><label style={fieldLabel}>Reorder Level</label><input type="number" style={fieldInput} value={form.reorder_level} onChange={e => setForm({ ...form, reorder_level: e.target.value })} /></div>
        </FormModal>
      )}
    </div>
  );
}

function KPI({ icon, title, value, sub, positive }: { icon: string; title: string; value: string; sub: string; positive: boolean }) {
  return (<div className="card" style={{ padding: '20px 22px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}><span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{title}</span><div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 16 }}>{icon}</div></div><div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div><div style={{ marginTop: 8, fontSize: 12, color: positive ? '#34d399' : '#fbbf24' }}>{sub}</div></div>);
}
function SmBtn({ label, primary, onClick }: { label: string; primary?: boolean; onClick?: () => void }) { return <button onClick={onClick} style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: primary ? 600 : 500, border: primary ? 'none' : '1px solid var(--glass-border)', background: primary ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.06)', color: primary ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: primary ? '0 0 20px rgba(59,130,246,0.2)' : 'none' }}>{label}</button>; }
function Badge({ label }: { label: string }) { const m: Record<string, { bg: string; b: string; t: string }> = { 'In Stock': { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' }, 'Low Stock': { bg: 'rgba(245,158,11,0.12)', b: 'rgba(245,158,11,0.3)', t: '#fcd34d' }, 'Out of Stock': { bg: 'rgba(239,68,68,0.12)', b: 'rgba(239,68,68,0.3)', t: '#fca5a5' } }; const c = m[label] ?? m['In Stock']; return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.b}`, color: c.t }}>{label}</span>; }

function MiniLineChart({ data, gradId }: { data: { month: string; val: number }[]; gradId: string }) {
  const max = Math.max(...data.map(d => d.val)); const min = Math.min(...data.map(d => d.val)) * 0.8;
  const W = 500, H = 140, px = 30;
  const pts = data.map((d, i) => ({ x: px + (i / (data.length - 1)) * (W - px * 2), y: H - 20 - ((d.val - min) / (max - min)) * (H - 40) }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H - 20} L${pts[0].x},${H - 20}Z`;
  return (<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}><defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs><path d={area} fill={`url(#${gradId})`} /><path d={line} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{pts.map((p, i) => (<g key={i}><circle cx={p.x} cy={p.y} r="3.5" fill="#0f1d32" stroke="#3b82f6" strokeWidth="2" /><text x={p.x} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{data[i].month}</text></g>))}</svg>);
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0); let cum = 0; const R = 54, r = 38;
  return (<svg viewBox="0 0 140 140" width="100%">{data.map((d) => { const start = (cum / total) * 2 * Math.PI - Math.PI / 2; cum += d.value; const end = (cum / total) * 2 * Math.PI - Math.PI / 2; const lg = d.value / total > 0.5 ? 1 : 0; const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`; return <path key={d.label} d={path} fill={d.color} opacity={0.85} />; })}</svg>);
}
