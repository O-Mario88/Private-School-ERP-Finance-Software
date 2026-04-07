/**
 * Bank Reconciliation UI Component
 * Complete reconciliation workflow with matching, adjustments, and reporting
 */

import React, { useState } from 'react';
import {
  BankAccount,
  BankStatement,
  UnmatchedTransaction,
  ReconciliationMatch,
  BankReconciliation,
  ReconciliationStatus,
} from '../../types';

interface BankReconciliationUIProps {
  bankAccounts: BankAccount[];
  selectedAccountId?: string;
  onAccountSelect: (accountId: string) => void;
  onImportStatement: (file: File) => void;
  onAutoMatch: () => void;
  onManualMatch: (bankTxnId: string, glTxnId: string) => void;
  onUnmatch: (matchId: string) => void;
  onAddAdjustment: (description: string, amount: number) => void;
  onReconcile: () => void;
  currentStatement?: BankStatement;
  unmatchedItems?: UnmatchedTransaction[];
  matches?: ReconciliationMatch[];
  reconciliation?: BankReconciliation;
  isLoading?: boolean;
}

export const BankReconciliationUI: React.FC<BankReconciliationUIProps> = ({
  bankAccounts,
  selectedAccountId,
  onAccountSelect,
  onImportStatement,
  onAutoMatch,
  onManualMatch,
  onUnmatch,
  onAddAdjustment,
  onReconcile,
  currentStatement,
  unmatchedItems = [],
  matches = [],
  reconciliation,
  isLoading = false,
}) => {
  const [tab, setTab] = useState<'accounts' | 'unmatched' | 'reconcile'>('accounts');
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>(
    bankAccounts.find(a => a.id === selectedAccountId)
  );
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    description: '',
    amount: 0,
    type: 'bank_charge',
  });

  const filteredUnmatched = unmatchedItems.filter(u =>
    u.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalDiff = bankAccounts.reduce(
    (s, a) => s + Math.abs((a.statementBalance || 0) - a.bookBalance),
    0
  );
  const reconCount = bankAccounts.filter(
    a => a.reconciliationStatus === ReconciliationStatus.RECONCILED
  ).length;
  const unreconCount = bankAccounts.filter(
    a => a.reconciliationStatus !== ReconciliationStatus.RECONCILED
  ).length;

  const matchRate =
    matches.length > 0
      ? Math.round((matches.length / (matches.length + filteredUnmatched.filter(u => u.side === 'bank').length)) * 100)
      : 0;

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportStatement(file);
  };

  const handleAddAdjustment = () => {
    if (adjustmentForm.description && adjustmentForm.amount > 0) {
      onAddAdjustment(adjustmentForm.description, adjustmentForm.amount);
      setAdjustmentForm({ description: '', amount: 0, type: 'bank_charge' });
      setShowAdjustmentForm(false);
    }
  };

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          borderBottom: '1px solid var(--glass-border)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="1.8"
          >
            <path d="M9 5H2v7l6.29 6.29a1 1 0 001.42 0l5.58-5.58a1 1 0 000-1.42L9 5z" />
            <path d="M6 9.01V9" />
            <line x1="15" y1="5" x2="22" y2="12" />
            <line x1="18" y1="8" x2="21" y2="5" />
          </svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Bank Reconciliation
          </h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
            Match & reconcile bank transactions
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <button
              onClick={e => {
                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                input.click();
              }}
              style={{
                padding: '7px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Import Statement
            </button>
          </label>
          <button
            onClick={onAutoMatch}
            disabled={isLoading}
            style={{
              padding: '7px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
              color: '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              boxShadow: '0 0 20px rgba(59,130,246,0.2)',
            }}
          >
            Auto-Match
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPICard
          icon="🏦"
          title="Bank Accounts"
          value={bankAccounts.length.toString()}
          sub={`${reconCount} reconciled`}
          positive
        />
        <KPICard
          icon="✅"
          title="Match Rate"
          value={`${matchRate}%`}
          sub="Transactions matched"
          positive
        />
        <KPICard
          icon="⚠️"
          title="Unmatched Txns"
          value={filteredUnmatched.filter(u => u.side === 'bank').length.toString()}
          sub="Requires attention"
          positive={false}
        />
        <KPICard
          icon="💰"
          title="Total Difference"
          value={`UGX ${(totalDiff / 1e3).toFixed(0)}K`}
          sub={`${unreconCount} accounts pending`}
          positive={false}
        />
      </div>

      {/* Tabs and Content */}
      <div className="card" style={{ padding: 0 }}>
        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid var(--glass-border)',
          }}
        >
          <div style={{ display: 'flex', gap: 4 }}>
            {(['accounts', 'unmatched', 'reconcile'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: tab === t ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: tab === t ? '#93c5fd' : 'var(--text-muted)',
                  textTransform: 'capitalize',
                }}
              >
                {t === 'accounts' ? 'Bank Accounts' : t === 'unmatched' ? 'Unmatched Items' : 'Reconcile'}
              </button>
            ))}
          </div>
          {tab === 'unmatched' && (
            <input
              className="input"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 12, width: 180, height: 34, fontSize: 12 }}
            />
          )}
        </div>

        {/* Tab Content */}
        <div style={{ overflowX: 'auto' }}>
          {tab === 'accounts' && (
            <BankAccountsTable
              accounts={bankAccounts}
              selectedId={selectedAccountId}
              onSelect={onAccountSelect}
            />
          )}
          {tab === 'unmatched' && (
            <UnmatchedTransactionsTable
              transactions={filteredUnmatched}
              matches={matches}
              onUnmatch={onUnmatch}
            />
          )}
          {tab === 'reconcile' && selectedAccount && (
            <ReconciliationWorkbench
              account={selectedAccount}
              statement={currentStatement}
              matches={matches}
              unmatchedItems={filteredUnmatched}
              reconciliation={reconciliation}
              showAdjustmentForm={showAdjustmentForm}
              adjustmentForm={adjustmentForm}
              onAddAdjustment={handleAddAdjustment}
              onSetAdjustmentForm={setAdjustmentForm}
              onToggleAdjustmentForm={() => setShowAdjustmentForm(!showAdjustmentForm)}
              onReconcile={onReconcile}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function KPICard({
  icon,
  title,
  value,
  sub,
  positive,
}: {
  icon: string;
  title: string;
  value: string;
  sub: string;
  positive: boolean;
}) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 14,
        }}
      >
        <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
          {title}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.15)',
            fontSize: 16,
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: positive ? '#34d399' : '#fbbf24',
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function BankAccountsTable({
  accounts,
  selectedId,
  onSelect,
}: {
  accounts: BankAccount[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <table className="table" style={{ fontSize: 13 }}>
      <thead>
        <tr>
          <th>Bank</th>
          <th>Account #</th>
          <th>Type</th>
          <th style={{ textAlign: 'right' }}>Book Balance</th>
          <th style={{ textAlign: 'right' }}>Statement</th>
          <th style={{ textAlign: 'right' }}>Difference</th>
          <th>Last Recon</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map(a => {
          const diff = Math.abs((a.statementBalance || 0) - a.bookBalance);
          return (
            <tr
              key={a.id}
              onClick={() => onSelect(a.id)}
              style={{
                cursor: 'pointer',
                background: selectedId === a.id ? 'rgba(59,130,246,0.1)' : 'transparent',
              }}
            >
              <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.bankName}</td>
              <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>
                {a.accountNumber}
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>{a.accountType}</td>
              <td
                style={{
                  textAlign: 'right',
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                }}
              >
                UGX {(a.bookBalance / 1e6).toFixed(2)}M
              </td>
              <td
                style={{
                  textAlign: 'right',
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                }}
              >
                UGX {((a.statementBalance || 0) / 1e6).toFixed(2)}M
              </td>
              <td
                style={{
                  textAlign: 'right',
                  fontFamily: 'monospace',
                  color: diff > 0 ? '#fbbf24' : '#34d399',
                }}
              >
                {diff > 0 ? `UGX ${(diff / 1e3).toFixed(0)}K` : '—'}
              </td>
              <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {a.lastReconciledDate ? new Date(a.lastReconciledDate).toLocaleDateString() : 'Never'}
              </td>
              <td>
                <StatusBadge status={a.reconciliationStatus} />
              </td>
              <td>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onSelect(a.id);
                  }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    border: '1px solid rgba(59,130,246,0.3)',
                    background: 'rgba(59,130,246,0.1)',
                    color: '#93c5fd',
                    cursor: 'pointer',
                  }}
                >
                  Reconcile
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function UnmatchedTransactionsTable({
  transactions,
  matches,
  onUnmatch,
}: {
  transactions: UnmatchedTransaction[];
  matches: ReconciliationMatch[];
  onUnmatch: (matchId: string) => void;
}) {
  return (
    <table className="table" style={{ fontSize: 13 }}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Side</th>
          <th>Type</th>
          <th style={{ textAlign: 'right' }}>Amount</th>
          <th>Age</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(t => (
          <tr key={t.id}>
            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              {new Date(t.transactionDate).toLocaleDateString()}
            </td>
            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.description}</td>
            <td>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  background: t.side === 'bank' ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)',
                  border: `1px solid ${t.side === 'bank' ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)'}`,
                  color: t.side === 'bank' ? '#93c5fd' : '#c4b5fd',
                }}
              >
                {t.side}
              </span>
            </td>
            <td style={{ color: t.transactionType === 'credit' ? '#34d399' : '#f87171' }}>
              {t.transactionType}
            </td>
            <td
              style={{
                textAlign: 'right',
                fontFamily: 'monospace',
                color: 'var(--text-primary)',
              }}
            >
              UGX {t.amount.toLocaleString()}
            </td>
            <td style={{ color: 'var(--text-muted)' }}>{t.daysOld}d</td>
            <td>
              <button
                style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  border: '1px solid rgba(59,130,246,0.3)',
                  background: 'rgba(59,130,246,0.1)',
                  color: '#93c5fd',
                  cursor: 'pointer',
                }}
              >
                Match
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReconciliationWorkbench({
  account,
  statement,
  matches,
  unmatchedItems,
  reconciliation,
  showAdjustmentForm,
  adjustmentForm,
  onAddAdjustment,
  onSetAdjustmentForm,
  onToggleAdjustmentForm,
  onReconcile,
  isLoading,
}: {
  account: BankAccount;
  statement?: BankStatement;
  matches: ReconciliationMatch[];
  unmatchedItems: UnmatchedTransaction[];
  reconciliation?: BankReconciliation;
  showAdjustmentForm: boolean;
  adjustmentForm: { description: string; amount: number; type: string };
  onAddAdjustment: () => void;
  onSetAdjustmentForm: (form: typeof adjustmentForm) => void;
  onToggleAdjustmentForm: () => void;
  onReconcile: () => void;
  isLoading: boolean;
}) {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Reconciliation Summary */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            Reconciliation Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SummaryRow label="Book Balance" value={`UGX ${(account.bookBalance / 1e6).toFixed(2)}M`} />
            <SummaryRow label="Bank Balance" value={`UGX ${((statement?.closingBalance || 0) / 1e6).toFixed(2)}M`} />
            <SummaryRow
              label="Difference"
              value={`UGX ${(Math.abs((statement?.closingBalance || 0) - account.bookBalance) / 1e3).toFixed(0)}K`}
              isAlert={Math.abs((statement?.closingBalance || 0) - account.bookBalance) > 1000}
            />
            <SummaryRow label="Matched Transactions" value={matches.length.toString()} />
            <SummaryRow label="Unmatched Items" value={unmatchedItems.length.toString()} />
          </div>
        </div>

        {/* Adjustments */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Adjustments
            </h3>
            <button
              onClick={onToggleAdjustmentForm}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 11,
                border: '1px solid rgba(59,130,246,0.3)',
                background: 'rgba(59,130,246,0.1)',
                color: '#93c5fd',
                cursor: 'pointer',
              }}
            >
              {showAdjustmentForm ? 'Cancel' : '+ Add'}
            </button>
          </div>
          {showAdjustmentForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Description"
                value={adjustmentForm.description}
                onChange={e => onSetAdjustmentForm({ ...adjustmentForm, description: e.target.value })}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-primary)',
                }}
              />
              <input
                type="number"
                placeholder="Amount"
                value={adjustmentForm.amount}
                onChange={e => onSetAdjustmentForm({ ...adjustmentForm, amount: parseFloat(e.target.value) })}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={onAddAdjustment}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  border: 'none',
                  background: 'rgba(16,185,129,0.2)',
                  color: '#34d399',
                  cursor: 'pointer',
                }}
              >
                Add Adjustment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reconcile Button */}
      <button
        onClick={onReconcile}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          background: 'linear-gradient(135deg,#10b981,#059669)',
          color: '#fff',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
          boxShadow: '0 0 20px rgba(16,185,129,0.2)',
        }}
      >
        {isLoading ? 'Reconciling...' : 'Complete Reconciliation'}
      </button>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  isAlert,
}: {
  label: string;
  value: string;
  isAlert?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--glass-border)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span
        style={{
          color: isAlert ? '#fbbf24' : 'var(--text-primary)',
          fontWeight: 500,
          fontFamily: 'monospace',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: ReconciliationStatus }) {
  const config =
    status === ReconciliationStatus.RECONCILED
      ? { bg: 'rgba(16,185,129,0.12)', b: 'rgba(16,185,129,0.3)', t: '#6ee7b7' }
      : status === ReconciliationStatus.PENDING
        ? { bg: 'rgba(245,158,11,0.12)', b: 'rgba(245,158,11,0.3)', t: '#fcd34d' }
        : { bg: 'rgba(239,68,68,0.12)', b: 'rgba(239,68,68,0.3)', t: '#fca5a5' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        background: config.bg,
        border: `1px solid ${config.b}`,
        color: config.t,
      }}
    >
      {status}
    </span>
  );
}

export default BankReconciliationUI;
