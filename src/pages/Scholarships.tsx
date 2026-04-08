/**
 * Scholarships & Sponsors Page — Tempo-style
 * Active sponsors, sponsored students, coverage analysis
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useDB } from '../database';
import { ScholarshipService } from '../database/DatabaseService';
import FormModal, { fieldLabel, fieldInput, fieldRow, fieldFull } from '../components/FormModal';

function useScholarshipData(ver: number) {
  const { isReady } = useDB();
  const rawSponsors = useMemo(() => isReady ? ScholarshipService.listSponsors() : [], [isReady, ver]);
  const sponsors = useMemo(() => rawSponsors.map((sp: any) => ({
    id: sp.id,
    name: sp.name || '',
    type: sp.type || 'Other',
    students: Number(sp.scholarship_count) || 0,
    coverage: Number(sp.coverage_percentage) || 50,
    totalPaid: Number(sp.total_disbursed) || 0,
    pending: (Number(sp.total_committed) || 0) - (Number(sp.total_disbursed) || 0),
    status: sp.status === 'active' ? 'Active' : sp.status || 'Active',
  })), [rawSponsors]);

  const rawApps = useMemo(() => isReady ? ScholarshipService.listApplications() : [], [isReady]);
  const sponsoredStudents = useMemo(() => rawApps.filter((a: any) => a.status === 'approved').map((a: any) => ({
    student: a.student_name || '',
    class: '',
    sponsor: a.scholarship_name || '',
    coverage: Number(a.coverage_percentage) || 50,
    termFee: Number(a.requested_amount) * 2 || 0,
    sponsored: Number(a.approved_amount) || 0,
    balance: (Number(a.requested_amount) * 2 || 0) - (Number(a.approved_amount) || 0),
  })), [rawApps]);

  return { sponsors, sponsoredStudents };
}

const coverageDist = [
  { label: '100% Coverage', value: 15, color: '#10b981' },
  { label: '50-99%', value: 25, color: '#3b82f6' },
  { label: '25-49%', value: 35, color: '#f59e0b' },
  { label: '<25%', value: 25, color: '#ef4444' },
];

const quarterlyDisbursement = [
  { q: 'Q1 2024', amt: 48600000 }, { q: 'Q2 2024', amt: 56700000 },
  { q: 'Q3 2024', amt: 52650000 }, { q: 'Q4 2024', amt: 62100000 },
  { q: 'Q1 2025', amt: 67500000 }, { q: 'Q2 2025', amt: 32400000 },
];

export default function ScholarshipsPage() {
  const [tab, setTab] = useState<'sponsors' | 'students'>('sponsors');
  const [search, setSearch] = useState('');
  const [ver, setVer] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Government', contact_person: '', phone: '', email: '' });

  const { sponsors, sponsoredStudents } = useScholarshipData(ver);

  const handleSubmit = useCallback(() => {
    if (!form.name) return;
    ScholarshipService.createSponsor({ name: form.name, type: form.type, contact_person: form.contact_person, phone: form.phone, email: form.email });
    setShowForm(false);
    setForm({ name: '', type: 'Government', contact_person: '', phone: '', email: '' });
    setVer(v => v + 1);
  }, [form]);

  const totalStudents = sponsors.reduce((s, sp) => s + sp.students, 0);
  const totalPaid = sponsors.reduce((s, sp) => s + sp.totalPaid, 0);
  const totalPending = sponsors.reduce((s, sp) => s + sp.pending, 0);
  const avgCoverage = Math.round(sponsors.reduce((s, sp) => s + sp.coverage, 0) / sponsors.length);

  const filteredSponsors = sponsors.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = sponsoredStudents.filter(s => s.student.toLowerCase().includes(search.toLowerCase()) || s.sponsor.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Scholarships & Sponsors</h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>Sponsorship tracking & management</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SmBtn label="Send Reminders" />
          <SmBtn label="+ Add Sponsor" primary onClick={() => setShowForm(true)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon="🎓" title="Sponsored Students" value={totalStudents.toString()} sub={`${sponsors.length} active sponsors`} positive />
        <KPI icon="💰" title="Total Disbursed" value={`UGX ${(totalPaid / 1e6).toFixed(1)}M`} sub="This academic year" positive />
        <KPI icon="⏳" title="Pending Payments" value={`UGX ${(totalPending / 1e6).toFixed(1)}M`} sub={`${sponsors.filter(s => s.pending > 0).length} sponsors with pending`} positive={false} />
        <KPI icon="📊" title="Avg Coverage" value={`${avgCoverage}%`} sub="Average fee coverage" positive={avgCoverage > 50} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Quarterly Disbursements</h3></div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>UGX {(totalPaid / 1e6).toFixed(1)}M</span>
            <span style={{ fontSize: 12, color: '#34d399', marginLeft: 8 }}>total disbursed</span>
          </div>
          <div style={{ padding: '16px 24px 20px' }}><BarChart data={quarterlyDisbursement} /></div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px 0' }}><h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Coverage Distribution</h3></div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <Donut data={coverageDist} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{avgCoverage}%</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>{coverageDist.map(c => (
              <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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
              {(['sponsors', 'students'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: tab === t ? 'rgba(59,130,246,0.15)' : 'transparent', color: tab === t ? '#93c5fd' : 'var(--text-muted)', textTransform: 'capitalize' }}>{t === 'sponsors' ? 'Sponsors' : 'Sponsored Students'}</button>
              ))}
            </div>
            <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 12, width: 180, height: 34, fontSize: 12 }} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {tab === 'sponsors' ? (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>Sponsor</th><th>Type</th><th style={{ textAlign: 'center' }}>Students</th><th style={{ textAlign: 'center' }}>Coverage</th><th style={{ textAlign: 'right' }}>Total Paid</th><th style={{ textAlign: 'right' }}>Pending</th><th>Status</th></tr></thead>
              <tbody>{filteredSponsors.map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: s.type === 'Government' ? 'rgba(59,130,246,0.1)' : s.type === 'Corporate' ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.1)', border: `1px solid ${s.type === 'Government' ? 'rgba(59,130,246,0.2)' : s.type === 'Corporate' ? 'rgba(16,185,129,0.2)' : 'rgba(168,85,247,0.2)'}`, color: s.type === 'Government' ? '#93c5fd' : s.type === 'Corporate' ? '#6ee7b7' : '#c4b5fd' }}>{s.type}</span></td>
                  <td style={{ textAlign: 'center', color: 'var(--text-primary)' }}>{s.students}</td>
                  <td style={{ textAlign: 'center' }}><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: s.coverage >= 100 ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', color: s.coverage >= 100 ? '#6ee7b7' : '#93c5fd' }}>{s.coverage}%</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#34d399' }}>UGX {(s.totalPaid / 1e6).toFixed(1)}M</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: s.pending > 0 ? '#fbbf24' : 'var(--text-muted)' }}>{s.pending > 0 ? `UGX ${(s.pending / 1e3).toFixed(0)}K` : '—'}</td>
                  <td><Badge label={s.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <table className="table" style={{ fontSize: 13 }}>
              <thead><tr><th>Student</th><th>Class</th><th>Sponsor</th><th style={{ textAlign: 'center' }}>Coverage</th><th style={{ textAlign: 'right' }}>Term Fee</th><th style={{ textAlign: 'right' }}>Sponsored</th><th style={{ textAlign: 'right' }}>Balance</th></tr></thead>
              <tbody>{filteredStudents.map((s, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.student}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.class}</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c4b5fd' }}>{s.sponsor}</span></td>
                  <td style={{ textAlign: 'center', color: s.coverage >= 100 ? '#34d399' : '#93c5fd' }}>{s.coverage}%</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {s.termFee.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#34d399' }}>UGX {s.sponsored.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: s.balance > 0 ? '#fbbf24' : 'var(--text-muted)' }}>{s.balance > 0 ? `UGX ${s.balance.toLocaleString()}` : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <FormModal title="Add Sponsor" onClose={() => setShowForm(false)} onSubmit={handleSubmit} submitLabel="Add Sponsor">
          <div style={fieldFull}><label style={fieldLabel}>Sponsor Name *</label><input style={fieldInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Uganda Government Bursary" /></div>
          <div style={fieldRow}>
            <div><label style={fieldLabel}>Type</label><select style={fieldInput} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>Government</option><option>Corporate</option><option>Individual</option><option>NGO</option></select></div>
            <div><label style={fieldLabel}>Contact Person</label><input style={fieldInput} value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} /></div>
          </div>
          <div style={fieldRow}>
            <div><label style={fieldLabel}>Phone</label><input style={fieldInput} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label style={fieldLabel}>Email</label><input style={fieldInput} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          </div>
        </FormModal>
      )}
    </div>
  );
}

function KPI({ icon, title, value, sub, positive }: { icon: string; title: string; value: string; sub: string; positive: boolean }) {
  return (<div className="card" style={{ padding: '20px 22px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}><span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{title}</span><div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 16 }}>{icon}</div></div><div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div><div style={{ marginTop: 8, fontSize: 12, color: positive ? '#34d399' : '#fbbf24' }}>{sub}</div></div>);
}
function SmBtn({ label, primary, onClick }: { label: string; primary?: boolean; onClick?: () => void }) { return <button onClick={onClick} style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: primary ? 600 : 500, border: primary ? 'none' : '1px solid var(--glass-border)', background: primary ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.06)', color: primary ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: primary ? '0 0 20px rgba(59,130,246,0.2)' : 'none' }}>{label}</button>; }
function Badge({ label }: { label: string }) { const c = label === 'Active' ? { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' } : { bg: 'rgba(245,158,11,0.12)', b: 'rgba(245,158,11,0.3)', t: '#fcd34d' }; return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.b}`, color: c.t }}>{label}</span>; }

function BarChart({ data }: { data: { q: string; amt: number }[] }) {
  const max = Math.max(...data.map(d => d.amt)); const W = 500, H = 140, px = 30, bw = 36;
  return (<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}><defs><linearGradient id="schBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient></defs>{data.map((d, i) => { const x = px + i * ((W - px * 2) / (data.length - 1)) - bw / 2; const h = (d.amt / max) * (H - 40); return (<g key={d.q}><rect x={x} y={H - 20 - h} width={bw} height={h} rx={5} fill="url(#schBar)" opacity={0.85} /><text x={x + bw / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{d.q}</text></g>); })}</svg>);
}

function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0); let cum = 0; const R = 54, r = 38;
  return (<svg viewBox="0 0 140 140" width="100%">{data.map((d) => { const start = (cum / total) * 2 * Math.PI - Math.PI / 2; cum += d.value; const end = (cum / total) * 2 * Math.PI - Math.PI / 2; const lg = d.value / total > 0.5 ? 1 : 0; const path = `M${70 + R * Math.cos(start)} ${70 + R * Math.sin(start)} A${R} ${R} 0 ${lg} 1 ${70 + R * Math.cos(end)} ${70 + R * Math.sin(end)} L${70 + r * Math.cos(end)} ${70 + r * Math.sin(end)} A${r} ${r} 0 ${lg} 0 ${70 + r * Math.cos(start)} ${70 + r * Math.sin(start)}Z`; return <path key={d.label} d={path} fill={d.color} opacity={0.85} />; })}</svg>);
}
