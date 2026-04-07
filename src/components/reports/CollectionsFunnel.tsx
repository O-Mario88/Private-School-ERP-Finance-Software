/**
 * Collections Funnel Report
 * Visualize the collections pipeline from invoiced to collected
 */

import React from 'react';

interface FunnelStage {
  label: string;
  amount: number;
  count: number;
  color: string;
  bgColor: string;
}

const MOCK_FUNNEL: FunnelStage[] = [
  { label: 'Total Invoiced', amount: 10260000, count: 185, color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200' },
  { label: 'Partially Paid', amount: 8727000, count: 165, color: 'text-indigo-700', bgColor: 'bg-indigo-100 border-indigo-200' },
  { label: 'On Payment Plans', amount: 1850000, count: 28, color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-200' },
  { label: 'Promise to Pay', amount: 980000, count: 15, color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-200' },
  { label: 'Fully Collected', amount: 7320000, count: 128, color: 'text-green-700', bgColor: 'bg-green-100 border-green-200' },
];

const MOCK_MONTHLY = [
  { month: 'Jan 2026', invoiced: 2100000, collected: 1680000, rate: 80 },
  { month: 'Dec 2025', invoiced: 1800000, collected: 1620000, rate: 90 },
  { month: 'Nov 2025', invoiced: 1950000, collected: 1657500, rate: 85 },
  { month: 'Oct 2025', invoiced: 2200000, collected: 2002000, rate: 91 },
  { month: 'Sep 2025', invoiced: 2050000, collected: 1845000, rate: 90 },
  { month: 'Aug 2025', invoiced: 160000, collected: 144000, rate: 90 },
];

const MOCK_METHODS = [
  { method: 'MTN MoMo', amount: 4392000, percentage: 60, count: 245 },
  { method: 'Bank Transfer', amount: 2196000, percentage: 30, count: 85 },
  { method: 'Cash', amount: 439200, percentage: 6, count: 42 },
  { method: 'Cheque', amount: 292800, percentage: 4, count: 12 },
];

export const CollectionsFunnel: React.FC = () => {
  const totalInvoiced = MOCK_FUNNEL[0].amount;
  const totalCollected = MOCK_FUNNEL[4].amount;
  const collectionRate = ((totalCollected / totalInvoiced) * 100);
  const outstanding = totalInvoiced - totalCollected;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Collections Funnel</h1>
          <p className="text-gray-600 text-sm mt-1">Pipeline from invoicing to collection</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Invoiced</p>
            <p className="text-2xl font-bold text-blue-600">UGX {totalInvoiced.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">UGX {totalCollected.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-2xl font-bold text-red-600">UGX {outstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Collection Rate</p>
            <p className={`text-2xl font-bold ${collectionRate >= 85 ? 'text-green-600' : collectionRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{collectionRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Funnel visualization */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-6">Collections Pipeline</h2>
          <div className="space-y-2 max-w-lg mx-auto">
            {MOCK_FUNNEL.map((stage, idx) => {
              const widthPct = (stage.amount / MOCK_FUNNEL[0].amount) * 100;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`rounded-lg border p-3 ${stage.bgColor} flex items-center justify-between`} style={{ width: `${widthPct}%`, minWidth: '50%' }}>
                    <span className={`text-sm font-medium ${stage.color}`}>{stage.label}</span>
                    <span className={`text-sm font-bold ${stage.color}`}>UGX {stage.amount.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-gray-500">{stage.count} invoices</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly trend */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Monthly Collection Trend</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Invoiced</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Collected</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Outstanding</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Progress</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_MONTHLY.map((m) => (
                  <tr key={m.month} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{m.month}</td>
                    <td className="px-4 py-3 text-sm text-right">UGX {m.invoiced.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">UGX {m.collected.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">UGX {(m.invoiced - m.collected).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${m.rate >= 85 ? 'bg-green-100 text-green-800' : m.rate >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{m.rate}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${m.rate >= 85 ? 'bg-green-500' : m.rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${m.rate}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment methods breakdown */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Collection by Payment Method</h2>
          <div className="grid grid-cols-4 gap-4">
            {MOCK_METHODS.map((m) => (
              <div key={m.method} className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-600">{m.method}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">UGX {m.amount.toLocaleString()}</p>
                <p className="text-sm text-blue-600 font-medium">{m.percentage}%</p>
                <p className="text-xs text-gray-500 mt-1">{m.count} transactions</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsFunnel;
