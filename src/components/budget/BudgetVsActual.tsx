import React, { useState } from 'react';

interface VarianceLine {
  accountCode: string;
  accountName: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePct: number;
  category: 'revenue' | 'expense';
}

const VARIANCE_DATA: VarianceLine[] = [
  // Revenue
  { accountCode: '4100', accountName: 'Tuition Fees Revenue', budgeted: 25000000, actual: 23500000, variance: -1500000, variancePct: -6.0, category: 'revenue' },
  { accountCode: '4200', accountName: 'Activity Fees', budgeted: 2500000, actual: 2650000, variance: 150000, variancePct: 6.0, category: 'revenue' },
  { accountCode: '4300', accountName: 'Transport Revenue', budgeted: 3000000, actual: 2900000, variance: -100000, variancePct: -3.3, category: 'revenue' },
  // Expenses
  { accountCode: '5010', accountName: 'Salaries & Wages', budgeted: 18000000, actual: 18200000, variance: -200000, variancePct: -1.1, category: 'expense' },
  { accountCode: '5020', accountName: 'Statutory Deductions', budgeted: 3500000, actual: 3520000, variance: -20000, variancePct: -0.6, category: 'expense' },
  { accountCode: '5100', accountName: 'Textbooks & Materials', budgeted: 1200000, actual: 980000, variance: 220000, variancePct: 18.3, category: 'expense' },
  { accountCode: '5300', accountName: 'Utilities', budgeted: 850000, actual: 920000, variance: -70000, variancePct: -8.2, category: 'expense' },
  { accountCode: '5500', accountName: 'Repairs & Maintenance', budgeted: 500000, actual: 1250000, variance: -750000, variancePct: -150.0, category: 'expense' },
  { accountCode: '5600', accountName: 'Office Supplies', budgeted: 200000, actual: 180000, variance: 20000, variancePct: 10.0, category: 'expense' },
  { accountCode: '6100', accountName: 'Depreciation', budgeted: 1100000, actual: 1100000, variance: 0, variancePct: 0, category: 'expense' },
  { accountCode: '6200', accountName: 'Loan Repayment', budgeted: 4000000, actual: 4000000, variance: 0, variancePct: 0, category: 'expense' },
];

export function BudgetVsActual() {
  const [data] = useState<VarianceLine[]>(VARIANCE_DATA);
  const [period, setPeriod] = useState('2026-Q1');
  const [threshold, setThreshold] = useState(10);

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
  const revenue = data.filter(d => d.category === 'revenue');
  const expenses = data.filter(d => d.category === 'expense');

  const totalBudgetedRev = revenue.reduce((s, r) => s + r.budgeted, 0);
  const totalActualRev = revenue.reduce((s, r) => s + r.actual, 0);
  const totalBudgetedExp = expenses.reduce((s, r) => s + r.budgeted, 0);
  const totalActualExp = expenses.reduce((s, r) => s + r.actual, 0);

  const budgetedSurplus = totalBudgetedRev - totalBudgetedExp;
  const actualSurplus = totalActualRev - totalActualExp;

  const flagged = data.filter(d => Math.abs(d.variancePct) >= threshold);

  const varianceColor = (v: number, category: 'revenue' | 'expense') => {
    if (v === 0) return 'text-gray-600';
    if (category === 'revenue') return v > 0 ? 'text-green-600' : 'text-red-600';
    // For expenses, positive variance = under budget = good
    return v > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget vs Actual</h2>
          <p className="text-gray-600">Variance analysis and budget performance tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <select className="input" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="2026-Q1">Q1 2026 (Jan-Mar)</option>
            <option value="2026-Q2">Q2 2026 (Apr-Jun)</option>
            <option value="2026-YTD">YTD 2026</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Budgeted Revenue</p>
          <p className="text-xl font-bold text-green-600">{fmt(totalBudgetedRev)}</p>
          <p className="text-xs text-gray-400">Actual: {fmt(totalActualRev)}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Budgeted Expense</p>
          <p className="text-xl font-bold text-red-600">{fmt(totalBudgetedExp)}</p>
          <p className="text-xs text-gray-400">Actual: {fmt(totalActualExp)}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Budgeted Surplus</p>
          <p className={`text-xl font-bold ${budgetedSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(budgetedSurplus)}</p>
          <p className="text-xs text-gray-400">Actual: {fmt(actualSurplus)}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Flagged Items</p>
          <p className="text-xl font-bold text-orange-600">{flagged.length}</p>
          <p className="text-xs text-gray-400">Variance &gt; {threshold}%</p>
        </div></div>
      </div>

      {/* Flagged Variances */}
      {flagged.length > 0 && (
        <div className="card border-l-4 border-orange-500">
          <div className="card-body">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-orange-800">Significant Variances (&gt; {threshold}%)</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">Threshold:</label>
                <input className="input w-20 text-right" type="number" value={threshold} onChange={e => setThreshold(parseInt(e.target.value) || 5)} />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
            <div className="space-y-2">
              {flagged.map(f => (
                <div key={f.accountCode} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <div>
                    <span className="font-mono text-sm text-gray-500">{f.accountCode}</span>
                    <span className="ml-2 font-medium">{f.accountName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Budget: {fmt(f.budgeted)} → Actual: {fmt(f.actual)}</span>
                    <span className={`font-bold ${varianceColor(f.variance, f.category)}`}>
                      {f.variance > 0 ? '+' : ''}{fmt(f.variance)} ({f.variancePct > 0 ? '+' : ''}{f.variancePct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Variance */}
      <div className="card">
        <div className="card-header border-b border-gray-200 bg-green-50">
          <h3 className="text-lg font-semibold text-green-800">Revenue Variance</h3>
        </div>
        <table className="w-full">
          <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-4 py-3">Code</th><th className="px-4 py-3">Account</th>
            <th className="px-4 py-3 text-right">Budget</th><th className="px-4 py-3 text-right">Actual</th>
            <th className="px-4 py-3 text-right">Variance</th><th className="px-4 py-3 text-right">%</th>
            <th className="px-4 py-3">Performance</th>
          </tr></thead>
          <tbody>
            {revenue.map(r => (
              <tr key={r.accountCode} className="border-b border-gray-100">
                <td className="px-4 py-3 font-mono text-sm">{r.accountCode}</td>
                <td className="px-4 py-3 font-medium">{r.accountName}</td>
                <td className="px-4 py-3 text-right">{fmt(r.budgeted)}</td>
                <td className="px-4 py-3 text-right">{fmt(r.actual)}</td>
                <td className={`px-4 py-3 text-right font-medium ${varianceColor(r.variance, 'revenue')}`}>
                  {r.variance > 0 ? '+' : ''}{fmt(r.variance)}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${varianceColor(r.variancePct, 'revenue')}`}>
                  {r.variancePct > 0 ? '+' : ''}{r.variancePct.toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${r.actual >= r.budgeted ? 'bg-green-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(100, (r.actual / r.budgeted) * 100)}%` }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expense Variance */}
      <div className="card">
        <div className="card-header border-b border-gray-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-800">Expense Variance</h3>
        </div>
        <table className="w-full">
          <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-4 py-3">Code</th><th className="px-4 py-3">Account</th>
            <th className="px-4 py-3 text-right">Budget</th><th className="px-4 py-3 text-right">Actual</th>
            <th className="px-4 py-3 text-right">Variance</th><th className="px-4 py-3 text-right">%</th>
            <th className="px-4 py-3">Utilization</th>
          </tr></thead>
          <tbody>
            {expenses.map(r => (
              <tr key={r.accountCode} className="border-b border-gray-100">
                <td className="px-4 py-3 font-mono text-sm">{r.accountCode}</td>
                <td className="px-4 py-3 font-medium">{r.accountName}</td>
                <td className="px-4 py-3 text-right">{fmt(r.budgeted)}</td>
                <td className="px-4 py-3 text-right">{fmt(r.actual)}</td>
                <td className={`px-4 py-3 text-right font-medium ${varianceColor(r.variance, 'expense')}`}>
                  {r.variance > 0 ? '+' : ''}{fmt(r.variance)}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${varianceColor(r.variancePct, 'expense')}`}>
                  {r.variancePct > 0 ? '+' : ''}{r.variancePct.toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${r.actual <= r.budgeted ? 'bg-green-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(100, (r.actual / r.budgeted) * 100)}%` }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
