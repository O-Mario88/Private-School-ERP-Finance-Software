/**
 * Student Fee Card — shows fee mapping, applied rules, discounts,
 * sponsor coverage, and net payable on a student finance page.
 *
 * Actions: View Fee Mapping · Recalculate Fees · Override Fee Mapping (permission-controlled)
 */

import React, { useState } from 'react';
import { useUIStore, useAuthStore } from '../../store';
import type { StudentFeeMapping } from '../../types';
import { DiscountType } from '../../types';

interface StudentFeeCardProps {
  mapping: StudentFeeMapping;
}

const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

const Badge = ({ label, variant = 'blue' }: { label: string; variant?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' }) => {
  const bg: Record<string, string> = { blue: 'rgba(59,130,246,0.15)', green: 'rgba(16,185,129,0.15)', red: 'rgba(239,68,68,0.15)', yellow: 'rgba(245,158,11,0.15)', gray: 'rgba(255,255,255,0.06)' };
  const fg: Record<string, string> = { blue: '#93c5fd', green: '#6ee7b7', red: '#fca5a5', yellow: '#fcd34d', gray: 'var(--text-muted)' };
  return <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: bg[variant], color: fg[variant] }}>{label}</span>;
};

export function StudentFeeCard({ mapping }: StudentFeeCardProps) {
  const addNotification = useUIStore((s) => s.addNotification);
  const user = useAuthStore((s) => s.user);
  const [showDetail, setShowDetail] = useState(false);
  const [showOverride, setShowOverride] = useState(false);

  const canOverride = user?.role === 'super_admin' || user?.role === 'director' || user?.role === 'bursar';

  return (
    <div className="card" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Fee Mapping</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Auto-calculated from Fee Engine rules · Last updated {new Date(mapping.lastCalculatedAt).toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setShowDetail(!showDetail)} style={actionBtnStyle}>
            {showDetail ? 'Hide Details' : 'View Fee Mapping'}
          </button>
          <button onClick={() => { addNotification('Fees recalculated for ' + mapping.studentName, 'success'); }} style={actionBtnStyle}>
            ↻ Recalculate
          </button>
          {canOverride && (
            <button onClick={() => setShowOverride(!showOverride)} style={{ ...actionBtnStyle, borderColor: 'rgba(245,158,11,0.3)', color: '#fcd34d' }}>
              Override
            </button>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
        <SumCell label="Fee Template" value={mapping.templateName} />
        <SumCell label="Gross Amount" value={fmt(mapping.grossAmount)} mono />
        <SumCell label="Discounts" value={mapping.totalDiscounts > 0 ? `−${fmt(mapping.totalDiscounts)}` : '—'} mono color={mapping.totalDiscounts > 0 ? '#fbbf24' : undefined} />
        <SumCell label="Sponsor Coverage" value={mapping.totalSponsorCoverage > 0 ? `−${fmt(mapping.totalSponsorCoverage)}` : '—'} mono color={mapping.totalSponsorCoverage > 0 ? '#34d399' : undefined} />
        <SumCell label="Net Payable" value={fmt(mapping.netPayable)} mono bold />
      </div>

      {/* Applied rules tags */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>Applied:</span>
        {mapping.appliedRules.map(r => <Badge key={r.ruleId} label={r.ruleName} variant="blue" />)}
        {mapping.appliedDiscounts.map(d => <Badge key={d.ruleId} label={d.ruleName} variant="yellow" />)}
        {mapping.sponsorCoverage.map(s => <Badge key={s.sponsorRuleId} label={s.sponsorName} variant="green" />)}
        {mapping.appliedRules.length === 0 && mapping.appliedDiscounts.length === 0 && mapping.sponsorCoverage.length === 0 && (
          <Badge label="No rules applied" variant="gray" />
        )}
      </div>

      {/* Expanded detail */}
      {showDetail && (
        <div style={{ borderTop: '1px solid var(--glass-border)', padding: '16px 24px' }}>
          {/* Rules */}
          {mapping.appliedRules.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Billing Rules</h4>
              {mapping.appliedRules.map(r => (
                <div key={r.ruleId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.ruleName}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{r.matchedCriteria}</span>
                </div>
              ))}
            </div>
          )}

          {/* Discounts */}
          {mapping.appliedDiscounts.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Discounts</h4>
              {mapping.appliedDiscounts.map(d => (
                <div key={d.ruleId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{d.ruleName} ({d.discountType})</span>
                  <span style={{ fontFamily: 'monospace', color: '#fbbf24' }}>−{fmt(d.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Sponsors */}
          {mapping.sponsorCoverage.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Sponsor Coverage</h4>
              {mapping.sponsorCoverage.map(s => (
                <div key={s.sponsorRuleId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.sponsorName} ({s.coveredCategories.join(', ')})</span>
                  <span style={{ fontFamily: 'monospace', color: '#34d399' }}>−{fmt(s.coverageAmount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Installment plan */}
          {mapping.installmentPlan && (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Installment Plan</h4>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${mapping.installmentPlan.installments.length}, 1fr)`, gap: 8 }}>
                {mapping.installmentPlan.installments.map(inst => (
                  <div key={inst.number} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Installment {inst.number}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{fmt(inst.amount)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Due {inst.dueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Override form */}
      {showOverride && canOverride && (
        <div style={{ borderTop: '1px solid var(--glass-border)', padding: '16px 24px', background: 'rgba(245,158,11,0.04)' }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: '#fcd34d', marginBottom: 8 }}>Override Fee Mapping</h4>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>This overrides the auto-calculated fee mapping for this student only. Requires Bursar / Director permission.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Override Template</label>
              <select className="input" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>
                <option style={{ background: '#0f1d32' }}>S1 – S3 Day Student</option>
                <option style={{ background: '#0f1d32' }}>S4 – S6 Day Student</option>
                <option style={{ background: '#0f1d32' }}>S1 – S3 Boarder</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Reason</label>
              <input className="input" style={{ width: '100%' }} placeholder="Reason for override…" />
            </div>
            <button onClick={() => { setShowOverride(false); addNotification('Fee mapping override applied', 'success'); }} style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Apply Override
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SumCell({ label, value, mono, bold, color }: { label: string; value: string; mono?: boolean; bold?: boolean; color?: string }) {
  return (
    <div style={{ padding: '14px 20px', borderRight: '1px solid var(--glass-border)' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: bold ? 700 : 500, fontFamily: mono ? 'monospace' : 'inherit', color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

const actionBtnStyle: React.CSSProperties = {
  padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer',
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)',
};
