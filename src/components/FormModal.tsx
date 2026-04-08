/**
 * Shared modal overlay for CRUD forms — Tempo dark-glass style
 */
import React from 'react';

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const panel: React.CSSProperties = {
  background: 'var(--card-bg, #111827)', border: '1px solid var(--glass-border)',
  borderRadius: 16, padding: '28px 32px', width: 520, maxHeight: '85vh',
  overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
};
const titleStyle: React.CSSProperties = {
  fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20,
};
export const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5,
};
export const fieldInput: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
  border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.06)',
  color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
};
export const fieldRow: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14,
};
export const fieldFull: React.CSSProperties = { marginBottom: 14 };
const btnRow: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24,
};
const cancelBtn: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500,
  border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.06)',
  color: 'var(--text-secondary)', cursor: 'pointer',
};
const submitBtn: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
  border: 'none', background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
  color: '#fff', cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.25)',
};

interface Props {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  children: React.ReactNode;
}

export default function FormModal({ title, onClose, onSubmit, submitLabel = 'Save', children }: Props) {
  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={e => e.stopPropagation()}>
        <div style={titleStyle}>{title}</div>
        {children}
        <div style={btnRow}>
          <button style={cancelBtn} onClick={onClose}>Cancel</button>
          <button style={submitBtn} onClick={onSubmit}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}
