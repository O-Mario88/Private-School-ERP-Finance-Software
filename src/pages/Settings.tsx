/**
 * Settings Page — Tempo-style
 * System configuration, user preferences, school settings
 */

import React, { useState, useMemo } from 'react';
import { CampusManager } from '../components/settings/CampusManager';
import { PolicyEngine } from '../components/settings/PolicyEngine';
import { FeeEngine } from '../components/settings/FeeEngine';
import { useDB } from '../database';
import { SettingsService } from '../database/DatabaseService';

type SettingsView = 'school' | 'campuses' | 'policies' | 'fees';

const menuItems: { key: SettingsView | string; label: string; icon: React.ReactNode }[] = [
  { key: 'school', label: 'School Information', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { key: 'campuses', label: 'Campuses', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
  { key: 'policies', label: 'Policy Engine', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  { key: 'users', label: 'Users & Roles', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg> },
  { key: 'coa', label: 'Chart of Accounts', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg> },
  { key: 'fees', label: 'Fee Engine', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg> },
  { key: 'approval', label: 'Approval Rules', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12" /></svg> },
  { key: 'prefs', label: 'Preferences', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg> },
  { key: 'backup', label: 'Backup & Restore', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> },
  { key: 'api', label: 'API Keys', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg> },
];

export default function SettingsPage() {
  const [view, setView] = useState<SettingsView>('school');

  const renderContent = () => {
    switch (view) {
      case 'campuses': return <CampusManager />;
      case 'policies': return <PolicyEngine />;
      case 'fees': return <FeeEngine />;
      default: return <SchoolInfoForm />;
    }
  };

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Settings</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
        {/* ── Sidebar menu ────────────────────────────────── */}
        <div className="card" style={{ padding: '12px', position: 'sticky', top: 32, alignSelf: 'start' }}>
          {menuItems.map((item) => {
            const isActive = item.key === view;
            const isDisabled = !['school', 'campuses', 'policies', 'fees'].includes(item.key);
            return (
              <button
                key={item.key}
                onClick={() => !isDisabled && setView(item.key as SettingsView)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: isDisabled ? 'default' : 'pointer', textAlign: 'left', marginBottom: 2,
                  background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: isActive ? '#93c5fd' : isDisabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                  opacity: isDisabled ? 0.5 : 1,
                }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ─────────────────────────────────────── */}
        <div>{renderContent()}</div>
      </div>
    </div>
  );
}

function SchoolInfoForm() {
  const { isReady } = useDB();
  const inst = useMemo(() => isReady ? SettingsService.getInstitution() : null, [isReady]);
  const name = (inst as any)?.name || 'Maple Private School';
  const regNo = (inst as any)?.registration_number || 'REG-2020-001';
  const email = (inst as any)?.email || 'bursar@maplesch.com';
  const phone = (inst as any)?.phone || '+256 701 234 567';

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>School Information</h3>
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField label="School Name" defaultValue={name} />
        <FormField label="Registration Number" defaultValue={regNo} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Currency</label>
            <select className="input" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>
              <option style={{ background: '#0f1d32' }}>UGX (Uganda Shilling)</option>
              <option style={{ background: '#0f1d32' }}>USD (US Dollar)</option>
              <option style={{ background: '#0f1d32' }}>NGN (Nigerian Naira)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Timezone</label>
            <select className="input" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>
              <option style={{ background: '#0f1d32' }}>Africa/Kampala</option>
              <option style={{ background: '#0f1d32' }}>Africa/Lagos</option>
              <option style={{ background: '#0f1d32' }}>UTC</option>
            </select>
          </div>
        </div>
        <FormField label="Email" defaultValue={email} type="email" />
        <FormField label="Phone" defaultValue={phone} type="tel" />
        <div>
          <button style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, defaultValue, type = 'text' }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</label>
      <input type={type} defaultValue={defaultValue} className="input" style={{ width: '100%' }} />
    </div>
  );
}
