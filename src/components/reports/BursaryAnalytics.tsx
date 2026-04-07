/**
 * Bursary Analytics Report
 * Bursary spend tracking, approval rates, and impact analysis
 */

import React from 'react';

interface BursaryTermData {
  term: string;
  requestCount: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  totalRequested: number;
  totalApproved: number;
  approvalRate: number;
  avgApproved: number;
}

const MOCK_TERMS: BursaryTermData[] = [
  { term: 'Term 1 2026', requestCount: 12, approvedCount: 7, rejectedCount: 3, pendingCount: 2, totalRequested: 280000, totalApproved: 145000, approvalRate: 58.3, avgApproved: 20714 },
  { term: 'Term 3 2025', requestCount: 15, approvedCount: 10, rejectedCount: 5, pendingCount: 0, totalRequested: 350000, totalApproved: 200000, approvalRate: 66.7, avgApproved: 20000 },
  { term: 'Term 2 2025', requestCount: 8, approvedCount: 6, rejectedCount: 2, pendingCount: 0, totalRequested: 180000, totalApproved: 120000, approvalRate: 75, avgApproved: 20000 },
  { term: 'Term 1 2025', requestCount: 10, approvedCount: 8, rejectedCount: 2, pendingCount: 0, totalRequested: 220000, totalApproved: 165000, approvalRate: 80, avgApproved: 20625 },
];

const MOCK_BY_REASON = [
  { reason: 'Financial hardship', count: 18, amount: 340000, percentage: 40 },
  { reason: 'Orphaned/Vulnerable', count: 12, amount: 260000, percentage: 28.9 },
  { reason: 'Natural disaster', count: 5, amount: 120000, percentage: 13.3 },
  { reason: 'Academic merit', count: 6, amount: 80000, percentage: 8.9 },
  { reason: 'Other', count: 4, amount: 100000, percentage: 11.1 },
];

export const BursaryAnalytics: React.FC = () => {
  const totalAllTime = MOCK_TERMS.reduce((s, t) => s + t.totalApproved, 0);
  const totalRequests = MOCK_TERMS.reduce((s, t) => s + t.requestCount, 0);
  const totalApproved = MOCK_TERMS.reduce((s, t) => s + t.approvedCount, 0);
  const overallRate = ((totalApproved / totalRequests) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Bursary Analytics</h1>
          <p className="text-gray-600 text-sm mt-1">Spend tracking, approval trends, and impact analysis</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">All-Time Bursary Spend</p>
            <p className="text-2xl font-bold text-purple-600">UGX {totalAllTime.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-blue-600">{totalRequests}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">{totalApproved}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Approval Rate</p>
            <p className="text-2xl font-bold text-green-600">{overallRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Term trend */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Term-by-Term Trend</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Term</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Requests</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Approved</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Rejected</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Pending</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Requested</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Approved Amt</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Rate</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Avg/Student</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TERMS.map((t) => (
                  <tr key={t.term} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{t.term}</td>
                    <td className="px-4 py-3 text-sm text-center">{t.requestCount}</td>
                    <td className="px-4 py-3 text-sm text-center text-green-600">{t.approvedCount}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-600">{t.rejectedCount}</td>
                    <td className="px-4 py-3 text-sm text-center text-yellow-600">{t.pendingCount}</td>
                    <td className="px-4 py-3 text-sm text-right">UGX {t.totalRequested.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">UGX {t.totalApproved.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${t.approvalRate >= 70 ? 'bg-green-100 text-green-800' : t.approvalRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{t.approvalRate}%</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">UGX {t.avgApproved.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By reason breakdown */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Distribution by Reason</h2>
          <div className="space-y-3 mb-6">
            {MOCK_BY_REASON.map((r) => (
              <div key={r.reason} className="flex items-center gap-4">
                <span className="w-40 text-sm font-medium text-gray-700">{r.reason}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium" style={{ width: `${r.percentage}%` }}>
                    {r.percentage > 10 ? `${r.percentage.toFixed(1)}%` : ''}
                  </div>
                </div>
                <span className="w-32 text-sm text-right text-gray-600">UGX {r.amount.toLocaleString()}</span>
                <span className="w-16 text-sm text-right text-gray-500">{r.count} req.</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BursaryAnalytics;
