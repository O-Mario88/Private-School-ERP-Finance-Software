/**
 * Fee Engine — Settings Component
 * Configuration hub for all fee-definition logic:
 *   Fee Categories, Fee Templates, Line Items, Billing Rules,
 *   Discount/Waiver Rules, Installment Rules, Transport Fee Rules,
 *   Boarding/Day Rules, Sponsor/Scholarship Rules, Billing Cycle Rules
 *
 * The engine auto-maps configured rules to student data (class, stream,
 * boarding status, transport, sponsors, siblings, etc.) to determine
 * each student's payable charges without manual re-entry.
 */

import React, { useState } from 'react';
import { useUIStore } from '../../store';
import type {
  FeeCategory, FeeTemplate, FeeTemplateLineItem, BillingRule,
  DiscountWaiverRule, InstallmentRule, TransportFeeRule,
  BoardingDayRule, SponsorScholarshipRule, BillingCycleRule,
  StudentFeeMapping,
} from '../../types';
import { FeeCategoryType, DiscountType } from '../../types';

// ── Tab type ────────────────────────────────────────────────────
type EngineTab =
  | 'categories' | 'templates' | 'billing-rules'
  | 'discounts' | 'installments' | 'transport'
  | 'boarding' | 'sponsors' | 'cycles' | 'mappings';

const TABS: { key: EngineTab; label: string }[] = [
  { key: 'categories', label: 'Fee Categories' },
  { key: 'templates', label: 'Fee Templates' },
  { key: 'billing-rules', label: 'Billing Rules' },
  { key: 'discounts', label: 'Discounts & Waivers' },
  { key: 'installments', label: 'Installment Rules' },
  { key: 'transport', label: 'Transport Fees' },
  { key: 'boarding', label: 'Boarding / Day' },
  { key: 'sponsors', label: 'Sponsors & Scholarships' },
  { key: 'cycles', label: 'Billing Cycles' },
  { key: 'mappings', label: 'Student Mappings' },
];

// ── Mock data ───────────────────────────────────────────────────
const MOCK_CATEGORIES: FeeCategory[] = [
  { id: 'fc_1', name: 'Tuition', type: FeeCategoryType.TUITION, glAccountId: 'GL-4001', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'fc_2', name: 'Boarding', type: FeeCategoryType.BOARDING, glAccountId: 'GL-4002', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'fc_3', name: 'Transport', type: FeeCategoryType.TRANSPORT, glAccountId: 'GL-4003', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'fc_4', name: 'Meals / Lunch', type: FeeCategoryType.MEALS, glAccountId: 'GL-4004', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'fc_5', name: 'Activity Fee', type: FeeCategoryType.ACTIVITY, glAccountId: 'GL-4005', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'fc_6', name: 'Lab Fee', type: FeeCategoryType.LAB, glAccountId: 'GL-4006', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'fc_7', name: 'ICT Fee', type: FeeCategoryType.ICT, glAccountId: 'GL-4007', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'fc_8', name: 'Uniform', type: FeeCategoryType.UNIFORM, glAccountId: 'GL-4008', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'fc_9', name: 'Books & Stationery', type: FeeCategoryType.BOOKS, glAccountId: 'GL-4009', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'fc_10', name: 'Medical Levy', type: FeeCategoryType.MEDICAL, glAccountId: 'GL-4010', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
];

const MOCK_TEMPLATES: FeeTemplate[] = [
  {
    id: 'ft_1', name: 'S1 – S3 Day Student', academicYear: '2026', term: 'Term I',
    lineItems: [
      { id: 'li_1', templateId: 'ft_1', feeCategoryId: 'fc_1', feeCategoryName: 'Tuition', amount: 1215000, optional: false },
      { id: 'li_2', templateId: 'ft_1', feeCategoryId: 'fc_4', feeCategoryName: 'Meals / Lunch', amount: 216000, optional: false },
      { id: 'li_3', templateId: 'ft_1', feeCategoryId: 'fc_5', feeCategoryName: 'Activity Fee', amount: 135000, optional: false },
      { id: 'li_4', templateId: 'ft_1', feeCategoryId: 'fc_6', feeCategoryName: 'Lab Fee', amount: 81000, optional: true },
      { id: 'li_5', templateId: 'ft_1', feeCategoryId: 'fc_7', feeCategoryName: 'ICT Fee', amount: 54000, optional: false },
    ],
    totalAmount: 1701000, active: true, createdBy: 'usr_1', createdAt: '2026-01-01',
  },
  {
    id: 'ft_2', name: 'S4 – S6 Day Student', academicYear: '2026', term: 'Term I',
    lineItems: [
      { id: 'li_6', templateId: 'ft_2', feeCategoryId: 'fc_1', feeCategoryName: 'Tuition', amount: 1404000, optional: false },
      { id: 'li_7', templateId: 'ft_2', feeCategoryId: 'fc_4', feeCategoryName: 'Meals / Lunch', amount: 216000, optional: false },
      { id: 'li_8', templateId: 'ft_2', feeCategoryId: 'fc_5', feeCategoryName: 'Activity Fee', amount: 135000, optional: false },
      { id: 'li_9', templateId: 'ft_2', feeCategoryId: 'fc_6', feeCategoryName: 'Lab Fee', amount: 108000, optional: false },
      { id: 'li_10', templateId: 'ft_2', feeCategoryId: 'fc_7', feeCategoryName: 'ICT Fee', amount: 54000, optional: false },
    ],
    totalAmount: 1917000, active: true, createdBy: 'usr_1', createdAt: '2026-01-01',
  },
  {
    id: 'ft_3', name: 'S1 – S3 Boarder', academicYear: '2026', term: 'Term I',
    lineItems: [
      { id: 'li_11', templateId: 'ft_3', feeCategoryId: 'fc_1', feeCategoryName: 'Tuition', amount: 1215000, optional: false },
      { id: 'li_12', templateId: 'ft_3', feeCategoryId: 'fc_2', feeCategoryName: 'Boarding', amount: 945000, optional: false },
      { id: 'li_13', templateId: 'ft_3', feeCategoryId: 'fc_5', feeCategoryName: 'Activity Fee', amount: 135000, optional: false },
      { id: 'li_14', templateId: 'ft_3', feeCategoryId: 'fc_6', feeCategoryName: 'Lab Fee', amount: 81000, optional: true },
      { id: 'li_15', templateId: 'ft_3', feeCategoryId: 'fc_7', feeCategoryName: 'ICT Fee', amount: 54000, optional: false },
      { id: 'li_16', templateId: 'ft_3', feeCategoryId: 'fc_10', feeCategoryName: 'Medical Levy', amount: 67500, optional: false },
    ],
    totalAmount: 2497500, active: true, createdBy: 'usr_1', createdAt: '2026-01-01',
  },
];

const MOCK_BILLING_RULES: BillingRule[] = [
  { id: 'br_1', name: 'S1-S3 Day Students', templateId: 'ft_1', templateName: 'S1 – S3 Day Student', criteria: { classes: ['S1', 'S2', 'S3'], boardingStatus: 'day' }, priority: 1, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'br_2', name: 'S4-S6 Day Students', templateId: 'ft_2', templateName: 'S4 – S6 Day Student', criteria: { classes: ['S4', 'S5', 'S6'], boardingStatus: 'day' }, priority: 2, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'br_3', name: 'S1-S3 Boarders', templateId: 'ft_3', templateName: 'S1 – S3 Boarder', criteria: { classes: ['S1', 'S2', 'S3'], boardingStatus: 'boarding' }, priority: 3, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
];

const MOCK_DISCOUNTS: DiscountWaiverRule[] = [
  { id: 'dw_1', name: 'Sibling Discount (2nd child)', discountType: DiscountType.SIBLING, criteria: { siblingCount: 2 }, value: 10, isPercentage: true, requiresApproval: false, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'dw_2', name: 'Sibling Discount (3rd+ child)', discountType: DiscountType.SIBLING, criteria: { siblingCount: 3 }, value: 15, isPercentage: true, requiresApproval: false, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'dw_3', name: 'Staff Child Waiver', discountType: DiscountType.EXEMPTION, criteria: { staffChild: true }, value: 50, isPercentage: true, requiresApproval: true, approvalRoleId: 'director', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'dw_4', name: 'Early Payment (30 days before)', discountType: DiscountType.EARLY_BIRD, criteria: { earlyPaymentDays: 30 }, value: 5, isPercentage: true, maxAmount: 100000, requiresApproval: false, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
];

const MOCK_INSTALLMENTS: InstallmentRule[] = [
  {
    id: 'ir_1', name: 'Standard 3-Part Plan', numInstallments: 3,
    intervals: [
      { installmentNumber: 1, percentageOfTotal: 50, dueDaysAfterTermStart: 0, label: 'On reporting day' },
      { installmentNumber: 2, percentageOfTotal: 30, dueDaysAfterTermStart: 30, label: '30 days into term' },
      { installmentNumber: 3, percentageOfTotal: 20, dueDaysAfterTermStart: 60, label: '60 days into term' },
    ],
    lateFeePercentage: 2, lateFeeGraceDays: 7, active: true, createdBy: 'usr_1', createdAt: '2026-01-01',
  },
];

const MOCK_TRANSPORT_RULES: TransportFeeRule[] = [
  { id: 'tr_1', name: 'Zone A – Ntinda / Bukoto / Kololo', amountPerTerm: 324000, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'tr_2', name: 'Zone B – Naalya / Kira / Mukono', amountPerTerm: 486000, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'tr_3', name: 'Zone C – Entebbe / Wakiso', amountPerTerm: 594000, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
];

const MOCK_BOARDING_RULES: BoardingDayRule[] = [
  { id: 'bd_1', name: 'Boarder Add-ons', boardingStatus: 'boarding', templateId: 'ft_3', templateName: 'S1 – S3 Boarder', additionalFees: [{ feeCategoryId: 'fc_2', feeCategoryName: 'Boarding', amount: 945000 }, { feeCategoryId: 'fc_10', feeCategoryName: 'Medical Levy', amount: 67500 }], excludedFees: ['fc_3'], active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'bd_2', name: 'Day Student Defaults', boardingStatus: 'day', templateId: 'ft_1', templateName: 'S1 – S3 Day Student', additionalFees: [], excludedFees: ['fc_2'], active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
];

const MOCK_SPONSOR_RULES: SponsorScholarshipRule[] = [
  { id: 'sp_1', name: 'Uganda Govt Scholarship', sponsorName: 'Ministry of Education & Sports', sponsorType: 'government', coverageType: 'partial', coveragePercentage: 75, maxStudents: 20, currentStudents: 12, academicYear: '2026', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'sp_2', name: 'MTN Foundation Bursary', sponsorName: 'MTN Uganda Foundation', sponsorType: 'organization', coverageType: 'specific_categories', coveredCategories: ['fc_1'], maxStudents: 10, currentStudents: 8, academicYear: '2026', active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
];

const MOCK_CYCLES: BillingCycleRule[] = [
  { id: 'cy_1', name: 'Term I 2026', academicYear: '2026', term: 'Term I', invoiceGenerationDate: '2026-01-15', paymentDueDate: '2026-02-03', lateFeeStartDate: '2026-02-10', autoGenerateInvoices: true, autoApplyDiscounts: true, autoApplySponsors: true, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
  { id: 'cy_2', name: 'Term II 2026', academicYear: '2026', term: 'Term II', invoiceGenerationDate: '2026-05-01', paymentDueDate: '2026-05-12', lateFeeStartDate: '2026-05-19', autoGenerateInvoices: true, autoApplyDiscounts: true, autoApplySponsors: true, active: true, createdBy: 'usr_1', createdAt: '2026-01-01' },
];

const MOCK_MAPPINGS: StudentFeeMapping[] = [
  {
    studentId: 'STU-001', studentName: 'John Mukasa', className: 'S1A',
    templateId: 'ft_1', templateName: 'S1 – S3 Day Student',
    appliedRules: [{ ruleId: 'br_1', ruleName: 'S1-S3 Day Students', matchedCriteria: 'Class S1 + Day student' }],
    appliedDiscounts: [{ ruleId: 'dw_1', ruleName: 'Sibling Discount (2nd child)', discountType: DiscountType.SIBLING, amount: 170100, isPercentage: true }],
    sponsorCoverage: [],
    grossAmount: 1701000, totalDiscounts: 170100, totalSponsorCoverage: 0, netPayable: 1530900,
    installmentPlan: { installments: [{ number: 1, amount: 765450, dueDate: '2026-02-03' }, { number: 2, amount: 459270, dueDate: '2026-03-05' }, { number: 3, amount: 306180, dueDate: '2026-04-04' }] },
    lastCalculatedAt: '2026-01-15T10:00:00Z',
  },
  {
    studentId: 'STU-002', studentName: 'Jane Mukasa', className: 'S2B',
    templateId: 'ft_1', templateName: 'S1 – S3 Day Student',
    appliedRules: [{ ruleId: 'br_1', ruleName: 'S1-S3 Day Students', matchedCriteria: 'Class S2 + Day student' }],
    appliedDiscounts: [{ ruleId: 'dw_2', ruleName: 'Sibling Discount (3rd+ child)', discountType: DiscountType.SIBLING, amount: 255150, isPercentage: true }],
    sponsorCoverage: [],
    grossAmount: 1701000, totalDiscounts: 255150, totalSponsorCoverage: 0, netPayable: 1445850,
    lastCalculatedAt: '2026-01-15T10:00:00Z',
  },
  {
    studentId: 'STU-003', studentName: 'Peter Ssempijja', className: 'S3A',
    templateId: 'ft_3', templateName: 'S1 – S3 Boarder',
    appliedRules: [{ ruleId: 'br_3', ruleName: 'S1-S3 Boarders', matchedCriteria: 'Class S3 + Boarder' }],
    appliedDiscounts: [],
    sponsorCoverage: [{ sponsorRuleId: 'sp_1', sponsorName: 'Ministry of Education & Sports', coverageAmount: 1873125, coveredCategories: ['All'] }],
    grossAmount: 2497500, totalDiscounts: 0, totalSponsorCoverage: 1873125, netPayable: 624375,
    lastCalculatedAt: '2026-01-15T10:00:00Z',
  },
  {
    studentId: 'STU-004', studentName: 'Amina Nakato', className: 'S1B',
    templateId: 'ft_1', templateName: 'S1 – S3 Day Student',
    appliedRules: [{ ruleId: 'br_1', ruleName: 'S1-S3 Day Students', matchedCriteria: 'Class S1 + Day student' }],
    appliedDiscounts: [{ ruleId: 'dw_3', ruleName: 'Staff Child Waiver', discountType: DiscountType.EXEMPTION, amount: 850500, isPercentage: true }],
    sponsorCoverage: [],
    grossAmount: 1701000, totalDiscounts: 850500, totalSponsorCoverage: 0, netPayable: 850500,
    lastCalculatedAt: '2026-01-15T10:00:00Z',
  },
  {
    studentId: 'STU-005', studentName: 'Brian Okello', className: 'S4A',
    templateId: 'ft_2', templateName: 'S4 – S6 Day Student',
    appliedRules: [{ ruleId: 'br_2', ruleName: 'S4-S6 Day Students', matchedCriteria: 'Class S4 + Day student' }],
    appliedDiscounts: [],
    sponsorCoverage: [{ sponsorRuleId: 'sp_2', sponsorName: 'MTN Uganda Foundation', coverageAmount: 1404000, coveredCategories: ['Tuition'] }],
    grossAmount: 1917000, totalDiscounts: 0, totalSponsorCoverage: 1404000, netPayable: 513000,
    lastCalculatedAt: '2026-01-15T10:00:00Z',
  },
];

// ── Helpers ─────────────────────────────────────────────────────
const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

const Badge = ({ label, variant = 'blue' }: { label: string; variant?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' }) => {
  const colors: Record<string, string> = {
    blue: 'rgba(59,130,246,0.15)',
    green: 'rgba(16,185,129,0.15)',
    red: 'rgba(239,68,68,0.15)',
    yellow: 'rgba(245,158,11,0.15)',
    gray: 'rgba(255,255,255,0.06)',
  };
  const textColors: Record<string, string> = {
    blue: '#93c5fd', green: '#6ee7b7', red: '#fca5a5', yellow: '#fcd34d', gray: 'var(--text-muted)',
  };
  return (
    <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: colors[variant], color: textColors[variant] }}>
      {label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export function FeeEngine() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [tab, setTab] = useState<EngineTab>('categories');
  const [categories, setCategories] = useState<FeeCategory[]>(MOCK_CATEGORIES);
  const [templates] = useState<FeeTemplate[]>(MOCK_TEMPLATES);
  const [billingRules] = useState<BillingRule[]>(MOCK_BILLING_RULES);
  const [discounts] = useState<DiscountWaiverRule[]>(MOCK_DISCOUNTS);
  const [installments] = useState<InstallmentRule[]>(MOCK_INSTALLMENTS);
  const [transportRules] = useState<TransportFeeRule[]>(MOCK_TRANSPORT_RULES);
  const [boardingRules] = useState<BoardingDayRule[]>(MOCK_BOARDING_RULES);
  const [sponsorRules] = useState<SponsorScholarshipRule[]>(MOCK_SPONSOR_RULES);
  const [cycles] = useState<BillingCycleRule[]>(MOCK_CYCLES);
  const [mappings] = useState<StudentFeeMapping[]>(MOCK_MAPPINGS);

  const [showForm, setShowForm] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: '', type: FeeCategoryType.OTHER as FeeCategoryType, glAccountId: '' });

  const handleAddCategory = () => {
    if (!catForm.name) { addNotification('Name is required', 'error'); return; }
    const cat: FeeCategory = { id: `fc_${Date.now()}`, name: catForm.name, type: catForm.type, glAccountId: catForm.glAccountId || undefined, active: true, createdBy: 'usr_1', createdAt: new Date().toISOString() };
    setCategories([...categories, cat]);
    setCatForm({ name: '', type: FeeCategoryType.OTHER, glAccountId: '' });
    setShowForm(false);
    addNotification(`Category "${cat.name}" created`, 'success');
  };

  // ── Render Tabs ─────────────────────────────────────────────
  const renderContent = () => {
    switch (tab) {
      case 'categories': return renderCategories();
      case 'templates': return renderTemplates();
      case 'billing-rules': return renderBillingRules();
      case 'discounts': return renderDiscounts();
      case 'installments': return renderInstallments();
      case 'transport': return renderTransportRules();
      case 'boarding': return renderBoardingRules();
      case 'sponsors': return renderSponsors();
      case 'cycles': return renderCycles();
      case 'mappings': return renderMappings();
    }
  };

  // ── Categories ──────────────────────────────────────────────
  const renderCategories = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Fee Categories</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Define the types of charges that can appear on student invoices</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>{showForm ? 'Cancel' : '+ Add Category'}</button>
      </div>
      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Category Name *</label>
              <input className="input" style={{ width: '100%' }} value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Library Fee" />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select className="input" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }} value={catForm.type} onChange={e => setCatForm({ ...catForm, type: e.target.value as FeeCategoryType })}>
                {Object.values(FeeCategoryType).map(t => <option key={t} value={t} style={{ background: '#0f1d32' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>GL Account</label>
              <input className="input" style={{ width: '100%' }} value={catForm.glAccountId} onChange={e => setCatForm({ ...catForm, glAccountId: e.target.value })} placeholder="e.g. GL-4011" />
            </div>
            <button onClick={handleAddCategory} style={{ ...btnStyle, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}>Save</button>
          </div>
        </div>
      )}
      <div className="card" style={{ padding: 0 }}>
        <table className="table" style={{ fontSize: 13 }}>
          <thead><tr><th>Category</th><th>Type</th><th>GL Account</th><th>Status</th></tr></thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                <td><Badge label={c.type} /></td>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{c.glAccountId || '—'}</td>
                <td><Badge label={c.active ? 'Active' : 'Inactive'} variant={c.active ? 'green' : 'gray'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Templates ───────────────────────────────────────────────
  const renderTemplates = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Fee Templates</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Each template bundles fee categories into a single billable package per student type</p>
          </div>
          <button style={btnStyle}>+ Add Template</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {templates.map(t => (
            <div key={t.id} className="card" style={{ padding: 0 }}>
              <div onClick={() => setExpandedTemplate(expandedTemplate === t.id ? null : t.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', cursor: 'pointer' }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{t.name}</span>
                  <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--text-muted)' }}>{t.academicYear} · {t.term}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{fmt(t.totalAmount)}</span>
                  <Badge label={t.active ? 'Active' : 'Draft'} variant={t.active ? 'green' : 'yellow'} />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ transform: expandedTemplate === t.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              {expandedTemplate === t.id && (
                <div style={{ borderTop: '1px solid var(--glass-border)', padding: '0' }}>
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead><tr><th>Fee Category</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'center' }}>Optional</th></tr></thead>
                    <tbody>
                      {t.lineItems.map(li => (
                        <tr key={li.id}>
                          <td style={{ color: 'var(--text-primary)' }}>{li.feeCategoryName}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{fmt(li.amount)}</td>
                          <td style={{ textAlign: 'center' }}>{li.optional ? <Badge label="Optional" variant="yellow" /> : <Badge label="Required" variant="blue" />}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid var(--glass-border)' }}>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(t.totalAmount)}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Billing Rules ───────────────────────────────────────────
  const renderBillingRules = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Billing Rules</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Match students to fee templates automatically based on class, stream, boarding status, and more</p>
        </div>
        <button style={btnStyle}>+ Add Rule</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table" style={{ fontSize: 13 }}>
          <thead><tr><th>Rule Name</th><th>Fee Template</th><th>Matching Criteria</th><th style={{ textAlign: 'center' }}>Priority</th><th>Status</th></tr></thead>
          <tbody>
            {billingRules.map(r => (
              <tr key={r.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.templateName}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {r.criteria.classes?.map(c => <Badge key={c} label={c} />)}
                    {r.criteria.boardingStatus && <Badge label={r.criteria.boardingStatus === 'day' ? 'Day' : 'Boarder'} variant="yellow" />}
                  </div>
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{r.priority}</td>
                <td><Badge label={r.active ? 'Active' : 'Inactive'} variant={r.active ? 'green' : 'gray'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card" style={{ marginTop: 16, padding: 20 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>How Billing Rules Work</h4>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
          When a billing cycle runs, the system reads each student's data — class, stream, boarding status, transport assignment, and more — then matches them to the highest-priority billing rule whose criteria they satisfy. The matched rule's fee template is automatically applied. No manual fee entry is needed for students who match a configured rule.
        </p>
      </div>
    </div>
  );

  // ── Discounts ───────────────────────────────────────────────
  const renderDiscounts = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Discount & Waiver Rules</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Automatically applied when a student matches eligibility criteria</p>
        </div>
        <button style={btnStyle}>+ Add Discount Rule</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table" style={{ fontSize: 13 }}>
          <thead><tr><th>Rule Name</th><th>Type</th><th>Value</th><th>Criteria</th><th>Approval</th><th>Status</th></tr></thead>
          <tbody>
            {discounts.map(d => (
              <tr key={d.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.name}</td>
                <td><Badge label={d.discountType} /></td>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{d.isPercentage ? `${d.value}%` : fmt(d.value)}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {d.criteria.siblingCount && `${d.criteria.siblingCount}+ siblings`}
                  {d.criteria.staffChild && 'Staff child'}
                  {d.criteria.earlyPaymentDays && `Pay ${d.criteria.earlyPaymentDays}d early`}
                </td>
                <td>{d.requiresApproval ? <Badge label="Required" variant="yellow" /> : <Badge label="Auto" variant="green" />}</td>
                <td><Badge label={d.active ? 'Active' : 'Inactive'} variant={d.active ? 'green' : 'gray'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Installments ────────────────────────────────────────────
  const renderInstallments = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Installment Rules</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Define how fees can be split into installments with due dates and late-fee policies</p>
        </div>
        <button style={btnStyle}>+ Add Plan</button>
      </div>
      {installments.map(ir => (
        <div key={ir.id} className="card" style={{ padding: 0, marginBottom: 12 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{ir.name}</span>
              <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--text-muted)' }}>{ir.numInstallments} installments</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {ir.lateFeePercentage && <Badge label={`${ir.lateFeePercentage}% late fee after ${ir.lateFeeGraceDays}d grace`} variant="yellow" />}
              <Badge label={ir.active ? 'Active' : 'Inactive'} variant={ir.active ? 'green' : 'gray'} />
            </div>
          </div>
          <table className="table" style={{ fontSize: 12 }}>
            <thead><tr><th>#</th><th>Portion</th><th>Due</th><th>Label</th></tr></thead>
            <tbody>
              {ir.intervals.map(i => (
                <tr key={i.installmentNumber}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{i.installmentNumber}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{i.percentageOfTotal}%</td>
                  <td style={{ color: 'var(--text-muted)' }}>{i.dueDaysAfterTermStart === 0 ? 'Term start' : `${i.dueDaysAfterTermStart} days after term`}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{i.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  // ── Transport ───────────────────────────────────────────────
  const renderTransportRules = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Transport Fee Rules</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Zone-based transport fees automatically added when a student has a transport assignment</p>
        </div>
        <button style={btnStyle}>+ Add Zone</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table" style={{ fontSize: 13 }}>
          <thead><tr><th>Zone / Route</th><th style={{ textAlign: 'right' }}>Fee Per Term</th><th>Status</th></tr></thead>
          <tbody>
            {transportRules.map(r => (
              <tr key={r.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{fmt(r.amountPerTerm)}</td>
                <td><Badge label={r.active ? 'Active' : 'Inactive'} variant={r.active ? 'green' : 'gray'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Boarding / Day ──────────────────────────────────────────
  const renderBoardingRules = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Boarding / Day Rules</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Define additional or excluded fees based on whether a student is a boarder or day scholar</p>
        </div>
        <button style={btnStyle}>+ Add Rule</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table" style={{ fontSize: 13 }}>
          <thead><tr><th>Rule</th><th>Status Type</th><th>Template</th><th>Additional Fees</th><th>Excluded</th><th>Status</th></tr></thead>
          <tbody>
            {boardingRules.map(r => (
              <tr key={r.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</td>
                <td><Badge label={r.boardingStatus === 'boarding' ? 'Boarder' : 'Day'} variant={r.boardingStatus === 'boarding' ? 'blue' : 'yellow'} /></td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.templateName}</td>
                <td style={{ fontSize: 12 }}>{r.additionalFees.map(f => `${f.feeCategoryName} (${fmt(f.amount)})`).join(', ') || '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.excludedFees.length > 0 ? r.excludedFees.join(', ') : '—'}</td>
                <td><Badge label={r.active ? 'Active' : 'Inactive'} variant={r.active ? 'green' : 'gray'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Sponsors ────────────────────────────────────────────────
  const renderSponsors = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Sponsors & Scholarships</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Configure external funding sources that cover part or all of a student's fees</p>
        </div>
        <button style={btnStyle}>+ Add Sponsor</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sponsorRules.map(s => (
          <div key={s.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.sponsorName} · {s.sponsorType}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Badge label={s.coverageType === 'full' ? 'Full Coverage' : s.coverageType === 'partial' ? `${s.coveragePercentage}% Coverage` : 'Specific Categories'} variant="blue" />
                  <Badge label={`${s.currentStudents}/${s.maxStudents} students`} variant={s.currentStudents >= (s.maxStudents || 999) ? 'red' : 'green'} />
                </div>
              </div>
              <Badge label={s.active ? 'Active' : 'Inactive'} variant={s.active ? 'green' : 'gray'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Billing Cycles ──────────────────────────────────────────
  const renderCycles = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Billing Cycle Rules</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>When invoices are generated, when payments are due, and which automations run</p>
        </div>
        <button style={btnStyle}>+ Add Cycle</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table" style={{ fontSize: 13 }}>
          <thead><tr><th>Cycle</th><th>Year / Term</th><th>Invoice Date</th><th>Payment Due</th><th>Late Fee Start</th><th>Automations</th><th>Status</th></tr></thead>
          <tbody>
            {cycles.map(c => (
              <tr key={c.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.academicYear} · {c.term}</td>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{c.invoiceGenerationDate}</td>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{c.paymentDueDate}</td>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{c.lateFeeStartDate || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {c.autoGenerateInvoices && <Badge label="Auto-Invoice" variant="blue" />}
                    {c.autoApplyDiscounts && <Badge label="Auto-Discount" variant="green" />}
                    {c.autoApplySponsors && <Badge label="Auto-Sponsor" variant="yellow" />}
                  </div>
                </td>
                <td><Badge label={c.active ? 'Active' : 'Inactive'} variant={c.active ? 'green' : 'gray'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Student Mappings ────────────────────────────────────────
  const renderMappings = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Student Fee Mappings</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Preview how rules map to individual students — auto-calculated from student data + billing rules</p>
        </div>
        <button onClick={() => addNotification('Fee mappings recalculated for all students', 'success')} style={{ ...btnStyle, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}>
          ↻ Recalculate All
        </button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table" style={{ fontSize: 13 }}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Fee Template</th>
              <th style={{ textAlign: 'right' }}>Gross</th>
              <th style={{ textAlign: 'right' }}>Discounts</th>
              <th style={{ textAlign: 'right' }}>Sponsor</th>
              <th style={{ textAlign: 'right' }}>Net Payable</th>
              <th>Rules Applied</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map(m => (
              <tr key={m.studentId}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.studentName}</td>
                <td><Badge label={m.className} /></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{m.templateName}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{fmt(m.grossAmount)}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: m.totalDiscounts > 0 ? '#fbbf24' : 'var(--text-muted)' }}>{m.totalDiscounts > 0 ? `−${fmt(m.totalDiscounts)}` : '—'}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: m.totalSponsorCoverage > 0 ? '#34d399' : 'var(--text-muted)' }}>{m.totalSponsorCoverage > 0 ? `−${fmt(m.totalSponsorCoverage)}` : '—'}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(m.netPayable)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {m.appliedRules.map(r => <Badge key={r.ruleId} label={r.ruleName} variant="blue" />)}
                    {m.appliedDiscounts.map(d => <Badge key={d.ruleId} label={d.ruleName} variant="yellow" />)}
                    {m.sponsorCoverage.map(s => <Badge key={s.sponsorRuleId} label={s.sponsorName} variant="green" />)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card" style={{ marginTop: 16, padding: 20 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>Auto-Mapping Logic</h4>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
          The Fee Engine reads each student's academic year, term, class, stream, section, day/boarding status, transport assignment, hostel/dorm assignment, optional services, sponsor/scholarship status, sibling/staff-child eligibility, and enrolment status. It then automatically determines the correct fee template, applies eligible discounts and sponsor coverage, and calculates the net payable. Staff do not need to re-enter normal charges for each student.
        </p>
      </div>
    </div>
  );

  // ── Main layout ─────────────────────────────────────────────
  return (
    <div>
      <div style={{ padding: '0 0 20px', borderBottom: '1px solid var(--glass-border)', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Fee Engine</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Configure how fees are calculated and automatically mapped to students</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20, borderBottom: '1px solid var(--glass-border)', paddingBottom: 12 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setShowForm(false); }}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: tab === t.key ? 600 : 400, border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: tab === t.key ? '#93c5fd' : 'var(--text-muted)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}

// ── Shared styles ───────────────────────────────────────────────
const btnStyle: React.CSSProperties = {
  padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 };
