/**
 * Fee Compliance Report
 * Collection rates, compliance by class/term, and payment distribution
 */

import React, { useState } from 'react';

interface ClassCompliance {
  classId: string;
  className: string;
  studentCount: number;
  totalBilled: number;
  totalCollected: number;
  collectionRate: number;
  fullPayCount: number;
  partialPayCount: number;
  zeroPaidCount: number;
}

const MOCK_DATA: ClassCompliance[] = [
  { classId: 'c1', className: 'Form 1A', studentCount: 40, totalBilled: 2000000, totalCollected: 1720000, collectionRate: 86, fullPayCount: 28, partialPayCount: 8, zeroPaidCount: 4 },
  { classId: 'c2', className: 'Form 1B', studentCount: 38, totalBilled: 1900000, totalCollected: 1520000, collectionRate: 80, fullPayCount: 22, partialPayCount: 12, zeroPaidCount: 4 },
  { classId: 'c3', className: 'Form 2A', studentCount: 42, totalBilled: 2310000, totalCollected: 2079000, collectionRate: 90, fullPayCount: 34, partialPayCount: 6, zeroPaidCount: 2 },
  { classId: 'c4', className: 'Form 3A', studentCount: 35, totalBilled: 2100000, totalCollected: 1575000, collectionRate: 75, fullPayCount: 18, partialPayCount: 12, zeroPaidCount: 5 },
  { classId: 'c5', className: 'Form 4A', studentCount: 30, totalBilled: 1950000, totalCollected: 1833000, collectionRate: 94, fullPayCount: 26, partialPayCount: 3, zeroPaidCount: 1 },
];

export const FeeCompliance: React.FC = () => {
  const [term, setTerm] = useState('Term 1 2026');

  const totals = MOCK_DATA.reduce((acc, c) => ({
    students: acc.students + c.studentCount,
    billed: acc.billed + c.totalBilled,
    collected: acc.collected + c.totalCollected,
    fullPay: acc.fullPay + c.fullPayCount,
    partialPay: acc.partialPay + c.partialPayCount,
    zeroPaid: acc.zeroPaid + c.zeroPaidCount,
  }), { students: 0, billed: 0, collected: 0, fullPay: 0, partialPay: 0, zeroPaid: 0 });

  const overallRate = totals.billed > 0 ? ((totals.collected / totals.billed) * 100) : 0;
  const outstanding = totals.billed - totals.collected;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fee Compliance</h1>
            <p className="text-gray-600 text-sm mt-1">Collection rates and payment distribution by class</p>
          </div>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Term 1 2026</option>
            <option>Term 3 2025</option>
            <option>Term 2 2025</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Overall Collection</p>
            <p className={`text-2xl font-bold ${overallRate >= 85 ? 'text-green-600' : overallRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{overallRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Billed</p>
            <p className="text-2xl font-bold text-blue-600">UGX {totals.billed.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Collected</p>
            <p className="text-2xl font-bold text-green-600">UGX {totals.collected.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-2xl font-bold text-red-600">UGX {outstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Zero Paid Students</p>
            <p className="text-2xl font-bold text-red-600">{totals.zeroPaid}</p>
          </div>
        </div>

        {/* Collection bars */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Collection Rates by Class</h2>
          <div className="space-y-3">
            {[...MOCK_DATA].sort((a, b) => b.collectionRate - a.collectionRate).map((c) => (
              <div key={c.classId} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-gray-700">{c.className}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div className={`h-6 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium ${c.collectionRate >= 85 ? 'bg-green-500' : c.collectionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${c.collectionRate}%` }}>
                    {c.collectionRate}%
                  </div>
                </div>
                <span className="w-40 text-sm text-right text-gray-600">UGX {(c.totalBilled - c.totalCollected).toLocaleString()} outstanding</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment distribution */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Payment Distribution</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">{totals.fullPay}</p>
              <p className="text-sm text-green-700 mt-1">Fully Paid ({((totals.fullPay / totals.students) * 100).toFixed(1)}%)</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-3xl font-bold text-yellow-600">{totals.partialPay}</p>
              <p className="text-sm text-yellow-700 mt-1">Partial ({((totals.partialPay / totals.students) * 100).toFixed(1)}%)</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <p className="text-3xl font-bold text-red-600">{totals.zeroPaid}</p>
              <p className="text-sm text-red-700 mt-1">Zero Paid ({((totals.zeroPaid / totals.students) * 100).toFixed(1)}%)</p>
            </div>
          </div>
        </div>

        {/* Detail table */}
        <div className="p-6">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Students</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Billed</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Collected</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Outstanding</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Rate</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Full</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Partial</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Zero</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DATA.map((c) => (
                <tr key={c.classId} className={`border-b border-gray-200 hover:bg-gray-50 ${c.collectionRate < 75 ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium">{c.className}</td>
                  <td className="px-4 py-3 text-sm text-center">{c.studentCount}</td>
                  <td className="px-4 py-3 text-sm text-right">UGX {c.totalBilled.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">UGX {c.totalCollected.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">UGX {(c.totalBilled - c.totalCollected).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${c.collectionRate >= 85 ? 'bg-green-100 text-green-800' : c.collectionRate >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{c.collectionRate}%</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-green-600">{c.fullPayCount}</td>
                  <td className="px-4 py-3 text-sm text-center text-yellow-600">{c.partialPayCount}</td>
                  <td className="px-4 py-3 text-sm text-center text-red-600">{c.zeroPaidCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeCompliance;
