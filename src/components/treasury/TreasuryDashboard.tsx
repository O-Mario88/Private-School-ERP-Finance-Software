import React, { useState } from 'react';
import { CashForecastCategory } from '../../types';

interface BankPosition {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  lastUpdated: string;
}

interface ForecastRow {
  week: string;
  openingBalance: number;
  inflows: number;
  outflows: number;
  closingBalance: number;
  category: CashForecastCategory;
}

const BANK_POSITIONS: BankPosition[] = [
  { id: 'ba_1', bankName: 'KCB', accountNumber: '1234***890', accountType: 'Operations', balance: 4250000, lastUpdated: '2026-04-01' },
  { id: 'ba_2', bankName: 'Equity', accountNumber: '5678***234', accountType: 'Fees Collection', balance: 8750000, lastUpdated: '2026-04-01' },
  { id: 'ba_3', bankName: 'Co-operative', accountNumber: '9012***567', accountType: 'Savings', balance: 15000000, lastUpdated: '2026-04-01' },
  { id: 'ba_4', bankName: 'MTN MoMo', accountNumber: 'Merchant 256700', accountType: 'Mobile Money', balance: 1350000, lastUpdated: '2026-04-01' },
];

const FORECAST: ForecastRow[] = [
  { week: 'W1 Apr', openingBalance: 29350000, inflows: 5200000, outflows: 3800000, closingBalance: 30750000, category: CashForecastCategory.AR_INFLOW },
  { week: 'W2 Apr', openingBalance: 30750000, inflows: 3100000, outflows: 4200000, closingBalance: 29650000, category: CashForecastCategory.AR_INFLOW },
  { week: 'W3 Apr', openingBalance: 29650000, inflows: 2800000, outflows: 6500000, closingBalance: 25950000, category: CashForecastCategory.PAYROLL },
  { week: 'W4 Apr', openingBalance: 25950000, inflows: 4500000, outflows: 2100000, closingBalance: 28350000, category: CashForecastCategory.AR_INFLOW },
  { week: 'W1 May', openingBalance: 28350000, inflows: 6800000, outflows: 3200000, closingBalance: 31950000, category: CashForecastCategory.AR_INFLOW },
  { week: 'W2 May', openingBalance: 31950000, inflows: 2500000, outflows: 4800000, closingBalance: 29650000, category: CashForecastCategory.AP_OUTFLOW },
];

export function TreasuryDashboard() {
  const [positions] = useState<BankPosition[]>(BANK_POSITIONS);
  const [forecast] = useState<ForecastRow[]>(FORECAST);

  const totalCash = positions.reduce((s, p) => s + p.balance, 0);
  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
  const minForecast = Math.min(...forecast.map(f => f.closingBalance));
  const maxForecast = Math.max(...forecast.map(f => f.closingBalance));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Treasury Dashboard</h2>
        <p className="text-gray-600">Cash position, bank balances, and short-term forecasting</p>
      </div>

      {/* Total Cash Position */}
      <div className="card bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="card-body">
          <p className="text-blue-200 text-sm">Total Cash Position</p>
          <p className="text-4xl font-bold">{fmt(totalCash)}</p>
          <p className="text-blue-200 text-sm mt-1">Across {positions.length} accounts • Updated {positions[0].lastUpdated}</p>
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="grid grid-cols-4 gap-4">
        {positions.map(p => (
          <div key={p.id} className="card"><div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">{p.bankName}</span>
              <span className="text-xs text-gray-400">{p.accountNumber}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{fmt(p.balance)}</p>
            <p className="text-xs text-gray-500 mt-1">{p.accountType}</p>
            {/* Balance bar */}
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(p.balance / totalCash) * 100}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{((p.balance / totalCash) * 100).toFixed(1)}% of total</p>
          </div></div>
        ))}
      </div>

      {/* Cash Flow Forecast */}
      <div className="card">
        <div className="card-header border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">6-Week Cash Flow Forecast</h3>
          <div className="text-sm text-gray-500">
            Range: {fmt(minForecast)} — {fmt(maxForecast)}
          </div>
        </div>

        {/* Visual Forecast */}
        <div className="p-4">
          <div className="flex items-end gap-2 h-40">
            {forecast.map((f, i) => {
              const pct = ((f.closingBalance - minForecast) / (maxForecast - minForecast)) * 100;
              const height = Math.max(20, pct);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{fmt(f.closingBalance)}</span>
                  <div className={`w-full rounded-t ${f.closingBalance >= totalCash ? 'bg-green-400' : 'bg-blue-400'}`} style={{ height: `${height}%` }}></div>
                  <span className="text-xs text-gray-600 font-medium">{f.week}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecast Table */}
        <table className="w-full">
          <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-4 py-3">Week</th><th className="px-4 py-3 text-right">Opening</th>
            <th className="px-4 py-3 text-right">Inflows</th><th className="px-4 py-3 text-right">Outflows</th>
            <th className="px-4 py-3 text-right">Closing</th><th className="px-4 py-3">Primary Driver</th>
          </tr></thead>
          <tbody>
            {forecast.map((f, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{f.week}</td>
                <td className="px-4 py-3 text-right">{fmt(f.openingBalance)}</td>
                <td className="px-4 py-3 text-right text-green-600">+{fmt(f.inflows)}</td>
                <td className="px-4 py-3 text-right text-red-600">-{fmt(f.outflows)}</td>
                <td className="px-4 py-3 text-right font-bold">{fmt(f.closingBalance)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{f.category}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Operating Cash Runway</p>
          <p className="text-2xl font-bold text-green-600">4.2 months</p>
          <p className="text-xs text-gray-400">At current burn rate</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Avg. Daily Collections</p>
          <p className="text-2xl font-bold text-blue-600">{fmt(520000)}</p>
          <p className="text-xs text-gray-400">Last 30 days</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Upcoming Payroll</p>
          <p className="text-2xl font-bold text-orange-600">{fmt(6500000)}</p>
          <p className="text-xs text-gray-400">Due 25 Apr 2026</p>
        </div></div>
      </div>
    </div>
  );
}
