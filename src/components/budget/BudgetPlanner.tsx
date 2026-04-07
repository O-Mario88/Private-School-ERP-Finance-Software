import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { BudgetStatus } from '../../types';

interface BudgetLineEntry {
  id: string;
  accountCode: string;
  accountName: string;
  q1: number;
  q2: number;
  q3: number;
  annual: number;
}

interface BudgetRecord {
  id: string;
  name: string;
  fiscalYear: string;
  status: BudgetStatus;
  totalAmount: number;
  lineCount: number;
  createdAt: string;
}

const BUDGETS: BudgetRecord[] = [
  { id: 'bgt_1', name: 'FY 2026 Operating Budget', fiscalYear: '2026', status: BudgetStatus.APPROVED, totalAmount: 85000000, lineCount: 24, createdAt: '2025-11-15' },
  { id: 'bgt_2', name: 'FY 2026 Capital Budget', fiscalYear: '2026', status: BudgetStatus.APPROVED, totalAmount: 25000000, lineCount: 8, createdAt: '2025-11-15' },
  { id: 'bgt_4', name: 'FY 2026 Loan Repayment Budget', fiscalYear: '2026', status: BudgetStatus.APPROVED, totalAmount: 12000000, lineCount: 3, createdAt: '2025-11-15' },
  { id: 'bgt_3', name: 'FY 2027 Draft Budget', fiscalYear: '2027', status: BudgetStatus.DRAFT, totalAmount: 0, lineCount: 0, createdAt: '2026-03-01' },
];

const BUDGET_LINES: BudgetLineEntry[] = [
  { id: 'bl_1', accountCode: '4100', accountName: 'Tuition Fees Revenue', q1: 25000000, q2: 20000000, q3: 25000000, annual: 70000000 },
  { id: 'bl_2', accountCode: '4200', accountName: 'Activity Fees', q1: 2500000, q2: 2000000, q3: 2500000, annual: 7000000 },
  { id: 'bl_3', accountCode: '4300', accountName: 'Transport Revenue', q1: 3000000, q2: 2500000, q3: 3000000, annual: 8500000 },
  { id: 'bl_4', accountCode: '5010', accountName: 'Salaries & Wages', q1: 18000000, q2: 18000000, q3: 18000000, annual: 54000000 },
  { id: 'bl_5', accountCode: '5020', accountName: 'Statutory Deductions', q1: 3500000, q2: 3500000, q3: 3500000, annual: 10500000 },
  { id: 'bl_6', accountCode: '5100', accountName: 'Textbooks & Materials', q1: 1200000, q2: 300000, q3: 500000, annual: 2000000 },
  { id: 'bl_7', accountCode: '5300', accountName: 'Utilities', q1: 850000, q2: 850000, q3: 850000, annual: 2550000 },
  { id: 'bl_8', accountCode: '5500', accountName: 'Repairs & Maintenance', q1: 500000, q2: 1500000, q3: 500000, annual: 2500000 },
  { id: 'bl_9', accountCode: '5600', accountName: 'Office Supplies', q1: 200000, q2: 200000, q3: 200000, annual: 600000 },
  { id: 'bl_10', accountCode: '6100', accountName: 'Depreciation', q1: 1100000, q2: 1100000, q3: 1100000, annual: 3300000 },
  { id: 'bl_11', accountCode: '6200', accountName: 'Loan Repayment', q1: 4000000, q2: 4000000, q3: 4000000, annual: 12000000 },
];

export function BudgetPlanner() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [budgets] = useState<BudgetRecord[]>(BUDGETS);
  const [lines, setLines] = useState<BudgetLineEntry[]>(BUDGET_LINES);
  const [selectedBudget, setSelectedBudget] = useState<string>('bgt_1');
  const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newYear, setNewYear] = useState('2027');

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

  const revenueLines = lines.filter(l => l.accountCode.startsWith('4'));
  const expenseLines = lines.filter(l => l.accountCode.startsWith('5') || l.accountCode.startsWith('6'));

  const totalRevenue = revenueLines.reduce((s, l) => s + l.annual, 0);
  const totalExpense = expenseLines.reduce((s, l) => s + l.annual, 0);
  const surplus = totalRevenue - totalExpense;

  const updateLine = (id: string, field: 'q1' | 'q2' | 'q3', value: number) => {
    setLines(lines.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      updated.annual = updated.q1 + updated.q2 + updated.q3;
      return updated;
    }));
  };

  const statusBadge: Record<BudgetStatus, string> = {
    [BudgetStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [BudgetStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
    [BudgetStatus.APPROVED]: 'bg-green-100 text-green-800',
    [BudgetStatus.ACTIVE]: 'bg-yellow-100 text-yellow-800',
    [BudgetStatus.CLOSED]: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Planning</h2>
          <p className="text-gray-600">Create and manage annual budgets</p>
        </div>
        <button onClick={() => setShowNewBudgetForm(!showNewBudgetForm)} className="btn btn-primary">+ New Budget</button>
      </div>

      {showNewBudgetForm && (
        <div className="card"><div className="card-body space-y-4">
          <h3 className="font-semibold">Create Budget</h3>
          <div className="flex gap-4">
            <input className="input flex-1" placeholder="Budget name" value={newName} onChange={e => setNewName(e.target.value)} />
            <input className="input w-32" placeholder="Fiscal Year" value={newYear} onChange={e => setNewYear(e.target.value)} />
            <button onClick={() => {
              addNotification('success', `Budget ${newName} for FY ${newYear} created`);
              setShowNewBudgetForm(false);
            }} className="btn btn-primary">Create</button>
          </div>
        </div></div>
      )}

      {/* Budget List */}
      <div className="grid grid-cols-3 gap-4">
        {budgets.map(b => (
          <div key={b.id} onClick={() => setSelectedBudget(b.id)}
            className={`card cursor-pointer transition-all ${selectedBudget === b.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}>
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{b.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[b.status]}`}>{b.status}</span>
              </div>
              <p className="text-xl font-bold text-blue-600">{b.totalAmount > 0 ? fmt(b.totalAmount) : '—'}</p>
              <p className="text-xs text-gray-500">{b.lineCount} line items • FY {b.fiscalYear}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Lines Editor */}
      {selectedBudget === 'bgt_1' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card"><div className="card-body">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">{fmt(totalRevenue)}</p>
            </div></div>
            <div className="card"><div className="card-body">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-xl font-bold text-red-600">{fmt(totalExpense)}</p>
            </div></div>
            <div className="card"><div className="card-body">
              <p className="text-sm text-gray-500">Surplus / (Deficit)</p>
              <p className={`text-xl font-bold ${surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(surplus)}</p>
            </div></div>
          </div>

          {/* Revenue Lines */}
          <div className="card">
            <div className="card-header border-b border-gray-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800">Revenue</h3>
            </div>
            <table className="w-full">
              <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Code</th><th className="px-4 py-3">Account</th>
                <th className="px-4 py-3 text-right">Term 1</th><th className="px-4 py-3 text-right">Term 2</th>
                <th className="px-4 py-3 text-right">Term 3</th><th className="px-4 py-3 text-right">Annual</th>
              </tr></thead>
              <tbody>
                {revenueLines.map(l => (
                  <tr key={l.id} className="border-b border-gray-100">
                    <td className="px-4 py-2 font-mono text-sm">{l.accountCode}</td>
                    <td className="px-4 py-2 font-medium">{l.accountName}</td>
                    <td className="px-4 py-2 text-right"><input className="input w-28 text-right" type="number" value={l.q1} onChange={e => updateLine(l.id, 'q1', parseInt(e.target.value) || 0)} /></td>
                    <td className="px-4 py-2 text-right"><input className="input w-28 text-right" type="number" value={l.q2} onChange={e => updateLine(l.id, 'q2', parseInt(e.target.value) || 0)} /></td>
                    <td className="px-4 py-2 text-right"><input className="input w-28 text-right" type="number" value={l.q3} onChange={e => updateLine(l.id, 'q3', parseInt(e.target.value) || 0)} /></td>
                    <td className="px-4 py-2 text-right font-bold">{fmt(l.annual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expense Lines */}
          <div className="card">
            <div className="card-header border-b border-gray-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800">Expenses</h3>
            </div>
            <table className="w-full">
              <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Code</th><th className="px-4 py-3">Account</th>
                <th className="px-4 py-3 text-right">Term 1</th><th className="px-4 py-3 text-right">Term 2</th>
                <th className="px-4 py-3 text-right">Term 3</th><th className="px-4 py-3 text-right">Annual</th>
              </tr></thead>
              <tbody>
                {expenseLines.map(l => (
                  <tr key={l.id} className="border-b border-gray-100">
                    <td className="px-4 py-2 font-mono text-sm">{l.accountCode}</td>
                    <td className="px-4 py-2 font-medium">{l.accountName}</td>
                    <td className="px-4 py-2 text-right"><input className="input w-28 text-right" type="number" value={l.q1} onChange={e => updateLine(l.id, 'q1', parseInt(e.target.value) || 0)} /></td>
                    <td className="px-4 py-2 text-right"><input className="input w-28 text-right" type="number" value={l.q2} onChange={e => updateLine(l.id, 'q2', parseInt(e.target.value) || 0)} /></td>
                    <td className="px-4 py-2 text-right"><input className="input w-28 text-right" type="number" value={l.q3} onChange={e => updateLine(l.id, 'q3', parseInt(e.target.value) || 0)} /></td>
                    <td className="px-4 py-2 text-right font-bold">{fmt(l.annual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
