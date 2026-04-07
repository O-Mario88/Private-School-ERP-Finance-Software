/**
 * School Module Page — Tempo-style
 * Student invoicing, family management, fee engine, transport, inventory, bursary, collections
 */

import React, { useState } from 'react';
import { useUIStore } from '../store';
import { TransportManager } from '../components/school/TransportManager';
import { InventoryManager } from '../components/school/InventoryManager';
import { BursaryDashboard } from '../components/school/BursaryDashboard';
import { PaymentPlansUI } from '../components/school/PaymentPlansUI';
import { FollowUpTracker } from '../components/school/FollowUpTracker';
import { AgingBucketDrill } from '../components/school/AgingBucketDrill';
import { ClassProfitability } from '../components/reports/ClassProfitability';
import { TransportROI } from '../components/reports/TransportROI';
import { FeeCompliance } from '../components/reports/FeeCompliance';
import { CollectionsFunnel } from '../components/reports/CollectionsFunnel';
import { BursaryAnalytics } from '../components/reports/BursaryAnalytics';

type SchoolView =
  | 'home' | 'generate' | 'list'
  | 'transport' | 'inventory' | 'bursary'
  | 'payment-plans' | 'follow-ups' | 'aging'
  | 'report-profitability' | 'report-transport-roi' | 'report-compliance'
  | 'report-funnel' | 'report-bursary';

interface Student { id: string; registrationNumber: string; firstName: string; lastName: string; className: string; familyName: string; familyId: string; }
interface Invoice { id: string; invoiceNumber: string; studentId: string; studentName: string; date: string; dueDate: string; status: string; amount: number; paid: number; balance: number; }

export default function SchoolPage() {
  const addNotification = useUIStore((state) => state.addNotification);
  const [view, setView] = useState<SchoolView>('home');

  const students: Student[] = [
    { id: '1', registrationNumber: 'STU-2024-001', firstName: 'John', lastName: 'Mukasa', className: 'S1A', familyName: 'Mukasa Family', familyId: 'FAM-001' },
    { id: '2', registrationNumber: 'STU-2024-002', firstName: 'Jane', lastName: 'Mukasa', className: 'S2B', familyName: 'Mukasa Family', familyId: 'FAM-001' },
    { id: '3', registrationNumber: 'STU-2024-003', firstName: 'Peter', lastName: 'Ssempijja', className: 'S3A', familyName: 'Ssempijja Family', familyId: 'FAM-002' },
    { id: '4', registrationNumber: 'STU-2024-004', firstName: 'Amina', lastName: 'Nakato', className: 'S1B', familyName: 'Nakato Family', familyId: 'FAM-003' },
    { id: '5', registrationNumber: 'STU-2024-005', firstName: 'Brian', lastName: 'Okello', className: 'S4A', familyName: 'Okello Family', familyId: 'FAM-004' },
  ];

  const invoices: Invoice[] = [
    { id: '1', invoiceNumber: 'INV-2026-001', studentId: '1', studentName: 'John Mukasa', date: '2026-04-01', dueDate: '2026-04-15', status: 'issued', amount: 150000, paid: 100000, balance: 50000 },
    { id: '2', invoiceNumber: 'INV-2026-002', studentId: '2', studentName: 'Jane Mukasa', date: '2026-04-01', dueDate: '2026-04-15', status: 'fully_paid', amount: 150000, paid: 150000, balance: 0 },
    { id: '3', invoiceNumber: 'INV-2026-003', studentId: '3', studentName: 'Peter Ssempijja', date: '2026-04-01', dueDate: '2026-04-15', status: 'overdue', amount: 200000, paid: 0, balance: 200000 },
    { id: '4', invoiceNumber: 'INV-2026-004', studentId: '4', studentName: 'Amina Nakato', date: '2026-04-01', dueDate: '2026-04-15', status: 'issued', amount: 75000, paid: 25000, balance: 50000 },
    { id: '5', invoiceNumber: 'INV-2026-005', studentId: '5', studentName: 'Brian Okello', date: '2026-04-02', dueDate: '2026-04-16', status: 'fully_paid', amount: 180000, paid: 180000, balance: 0 },
  ];

  const [formData, setFormData] = useState({
    studentIds: [] as string[],
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoiceType: 'tuition',
    amount: 0,
    description: '',
    feeCode: '',
  });

  const invoiceTypes = [
    { id: 'tuition', name: 'Tuition Fee', defaultAmount: 150000 },
    { id: 'transport', name: 'Transport Fee', defaultAmount: 50000 },
    { id: 'uniform', name: 'Uniform', defaultAmount: 25000 },
    { id: 'activity', name: 'Activity Fee', defaultAmount: 10000 },
    { id: 'other', name: 'Other Charges', defaultAmount: 0 },
  ];

  const handleStudentToggle = (studentId: string) => {
    setFormData({
      ...formData,
      studentIds: formData.studentIds.includes(studentId)
        ? formData.studentIds.filter(id => id !== studentId)
        : [...formData.studentIds, studentId]
    });
  };

  const handleInvoiceTypeChange = (type: string) => {
    const selectedType = invoiceTypes.find(t => t.id === type);
    setFormData({
      ...formData,
      invoiceType: type,
      amount: selectedType?.defaultAmount || 0,
      description: `${selectedType?.name}` || '',
    });
  };

  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentIds.length === 0) { addNotification('error', 'Please select at least one student'); return; }
    if (formData.amount <= 0) { addNotification('error', 'Invoice amount must be greater than 0'); return; }
    if (!formData.description.trim()) { addNotification('error', 'Description is required'); return; }
    addNotification('success', `Generated ${formData.studentIds.length} invoice(s) successfully`);
    setView('list');
    setFormData({ studentIds: [], invoiceDate: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], invoiceType: 'tuition', amount: 0, description: '', feeCode: '' });
  };

  const renderSubView = () => {
    switch (view) {
      case 'transport': return <TransportManager />;
      case 'inventory': return <InventoryManager />;
      case 'bursary': return <BursaryDashboard />;
      case 'payment-plans': return <PaymentPlansUI />;
      case 'follow-ups': return <FollowUpTracker />;
      case 'aging': return <AgingBucketDrill />;
      case 'report-profitability': return <ClassProfitability />;
      case 'report-transport-roi': return <TransportROI />;
      case 'report-compliance': return <FeeCompliance />;
      case 'report-funnel': return <CollectionsFunnel />;
      case 'report-bursary': return <BursaryAnalytics />;
      default: return null;
    }
  };

  const isSubView = !['home', 'generate', 'list'].includes(view);

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {isSubView ? (
        <>
          <div style={{ padding: '16px 0', marginBottom: 8 }}>
            <button onClick={() => setView('home')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              Back to School Management
            </button>
          </div>
          {renderSubView()}
        </>
      ) : view === 'home' ? (
        <SchoolHome students={students} invoices={invoices} setView={setView} />
      ) : view === 'generate' ? (
        <GenerateView students={students} formData={formData} invoiceTypes={invoiceTypes} onToggle={handleStudentToggle} onTypeChange={handleInvoiceTypeChange} onSubmit={handleGenerateInvoices} setFormData={setFormData} setView={setView} />
      ) : (
        <InvoiceListView invoices={invoices} setView={setView} />
      )}
    </div>
  );
}

/* ── School Home ───────────────────────────────────────────────── */
function SchoolHome({ students, invoices, setView }: { students: Student[]; invoices: Invoice[]; setView: (v: SchoolView) => void }) {
  const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paid, 0);
  const totalBalance = invoices.reduce((s, i) => s + i.balance, 0);

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>School Management</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView('generate')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
            + Generate Invoices
          </button>
          <button onClick={() => setView('list')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            View Invoices
          </button>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>} title="Active Students" value={students.length.toLocaleString()} change="+12 this term" positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} title="Total Billed" value={`UGX ${(totalBilled / 1000).toFixed(0)}K`} change={`${invoices.length} invoices`} positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><polyline points="20 6 9 17 4 12" /></svg>} title="Collected" value={`UGX ${(totalCollected / 1000).toFixed(0)}K`} change={`${Math.round(totalCollected / totalBilled * 100)}% rate`} positive />
        <KPI icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>} title="Outstanding" value={`UGX ${(totalBalance / 1000).toFixed(0)}K`} change={`${invoices.filter(i => i.status === 'overdue').length} overdue`} positive={false} />
      </div>

      {/* ── Module sections ─────────────────────────────── */}
      <SectionLabel title="Invoicing" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>} title="Generate Invoices" desc="Create invoices for students for various fees" onClick={() => setView('generate')} />
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>} title="View Invoices" desc="View and track all student invoices" onClick={() => setView('list')} />
      </div>

      <SectionLabel title="Operations" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 5v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>} title="Transport" desc="Routes, assignments & billing" onClick={() => setView('transport')} />
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>} title="Inventory" desc="Stock & student charging" onClick={() => setView('inventory')} />
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>} title="Bursary" desc="Requests, approvals & spend" onClick={() => setView('bursary')} />
      </div>

      <SectionLabel title="Collections" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>} title="Payment Plans" desc="Create installment payment plans" onClick={() => setView('payment-plans')} />
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>} title="Follow-Up Tracker" desc="Log calls, SMS & visits" onClick={() => setView('follow-ups')} />
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>} title="Aging Buckets" desc="A/R aging analysis" onClick={() => setView('aging')} />
      </div>

      <SectionLabel title="Reports" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} title="Class Profitability" desc="Revenue vs costs per class" onClick={() => setView('report-profitability')} />
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 5v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>} title="Transport ROI" desc="Route-level return on investment" onClick={() => setView('report-transport-roi')} />
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><polyline points="20 6 9 17 4 12" /></svg>} title="Fee Compliance" desc="Collection rates by class" onClick={() => setView('report-compliance')} />
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>} title="Collections Funnel" desc="Invoice-to-collection pipeline" onClick={() => setView('report-funnel')} />
        <Tile icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>} title="Bursary Analytics" desc="Spend trends & impact analysis" onClick={() => setView('report-bursary')} />
      </div>
    </>
  );
}

/* ── Generate invoices view ─────────────────────────────────────── */
function GenerateView({ students, formData, invoiceTypes, onToggle, onTypeChange, onSubmit, setFormData, setView }: any) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Generate Invoices</h1>
        </div>
        <button onClick={() => setView('home')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>← Back</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Student selection */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Select Students</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Selected: {formData.studentIds.length}</span>
          </div>
          <div style={{ padding: '12px 24px' }}>
            {students.map((s: Student) => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 8, borderRadius: 10, background: formData.studentIds.includes(s.id) ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${formData.studentIds.includes(s.id) ? 'rgba(59,130,246,0.3)' : 'var(--glass-border)'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                <input type="checkbox" checked={formData.studentIds.includes(s.id)} onChange={() => onToggle(s.id)} style={{ accentColor: '#3b82f6', width: 16, height: 16 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 14 }}>{s.firstName} {s.lastName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.registrationNumber} · {s.className}</div>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>{s.className}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Invoice details */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Invoice Details</h3>
          </div>
          <form onSubmit={onSubmit} style={{ padding: '16px 24px' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Fee Type</label>
              <select value={formData.invoiceType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onTypeChange(e.target.value)} className="form-input" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                {invoiceTypes.map((t: any) => <option key={t.id} value={t.id} style={{ background: '#0f1d32' }}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Amount (UGX)</label>
              <input type="number" step="0.01" value={formData.amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className="input" style={{ width: '100%' }} required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Due Date</label>
              <input type="date" value={formData.dueDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dueDate: e.target.value })} className="input" style={{ width: '100%' }} />
            </div>

            {/* Total summary */}
            <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#60a5fa' }}>UGX {(formData.amount * formData.studentIds.length).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formData.studentIds.length} student(s) × UGX {formData.amount.toLocaleString()}</div>
            </div>

            <button type="submit" disabled={formData.studentIds.length === 0} style={{ width: '100%', padding: '10px 0', borderRadius: 10, background: formData.studentIds.length === 0 ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: formData.studentIds.length === 0 ? 'var(--text-muted)' : '#fff', fontSize: 14, fontWeight: 600, cursor: formData.studentIds.length === 0 ? 'not-allowed' : 'pointer', boxShadow: formData.studentIds.length > 0 ? '0 0 20px rgba(59,130,246,0.2)' : 'none' }}>
              Generate Invoices
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── Invoice list view ──────────────────────────────────────────── */
function InvoiceListView({ invoices, setView }: { invoices: Invoice[]; setView: (v: SchoolView) => void }) {
  const [search, setSearch] = useState('');
  const filtered = invoices.filter(i => i.studentName.toLowerCase().includes(search.toLowerCase()) || i.invoiceNumber.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Student Invoices</h1>
        </div>
        <button onClick={() => setView('home')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>← Back</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input className="input" placeholder="Search invoices…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 220, height: 34, fontSize: 12 }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>Invoice #</th><th>Student</th><th>Date</th><th>Due</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'right' }}>Balance</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{inv.invoiceNumber}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{inv.studentName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{inv.date}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{inv.dueDate}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>UGX {inv.amount.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: inv.balance > 0 ? '#fbbf24' : 'var(--text-muted)' }}>{inv.balance > 0 ? `UGX ${inv.balance.toLocaleString()}` : '—'}</td>
                  <td><Badge status={inv.status === 'fully_paid' ? 'Paid' : inv.status === 'overdue' ? 'Overdue' : 'Issued'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
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
    Paid: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    Issued: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', color: '#93bbfd' },
    Overdue: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
  };
  const s = m[status] ?? m.Issued;
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{status}</span>;
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
    </div>
  );
}

function Tile({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 14, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  );
}
