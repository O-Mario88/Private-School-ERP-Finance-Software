/**
 * Class Profitability Report
 * Revenue vs costs per class with margin analysis
 */

import React, { useState } from 'react';

interface ClassProfit {
  classId: string;
  className: string;
  studentCount: number;
  feeRevenue: number;
  transportRevenue: number;
  inventoryRevenue: number;
  totalRevenue: number;
  teacherCosts: number;
  facilityCosts: number;
  materialCosts: number;
  totalCosts: number;
  profit: number;
  margin: number;
}

const MOCK_DATA: ClassProfit[] = [
  { classId: 'c1', className: 'S1A', studentCount: 40, feeRevenue: 18000000, transportRevenue: 2400000, inventoryRevenue: 1600000, totalRevenue: 22000000, teacherCosts: 6000000, facilityCosts: 2000000, materialCosts: 800000, totalCosts: 8800000, profit: 13200000, margin: 60 },
  { classId: 'c2', className: 'S1B', studentCount: 38, feeRevenue: 17100000, transportRevenue: 1900000, inventoryRevenue: 1520000, totalRevenue: 20520000, teacherCosts: 6000000, facilityCosts: 2000000, materialCosts: 760000, totalCosts: 8760000, profit: 11760000, margin: 57.3 },
  { classId: 'c3', className: 'S2A', studentCount: 42, feeRevenue: 21000000, transportRevenue: 2520000, inventoryRevenue: 1680000, totalRevenue: 25200000, teacherCosts: 6500000, facilityCosts: 2000000, materialCosts: 840000, totalCosts: 9340000, profit: 15860000, margin: 62.9 },
  { classId: 'c4', className: 'S3A', studentCount: 35, feeRevenue: 19250000, transportRevenue: 2100000, inventoryRevenue: 1750000, totalRevenue: 23100000, teacherCosts: 7000000, facilityCosts: 2000000, materialCosts: 1050000, totalCosts: 10050000, profit: 13050000, margin: 56.5 },
  { classId: 'c5', className: 'S4A', studentCount: 30, feeRevenue: 18000000, transportRevenue: 1800000, inventoryRevenue: 1500000, totalRevenue: 21300000, teacherCosts: 7500000, facilityCosts: 2000000, materialCosts: 1200000, totalCosts: 10700000, profit: 10600000, margin: 49.8 },
];

export const ClassProfitability: React.FC = () => {
  const [sortBy, setSortBy] = useState<'className' | 'profit' | 'margin'>('margin');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...MOCK_DATA].sort((a, b) => {
    const diff = a[sortBy] < b[sortBy] ? -1 : a[sortBy] > b[sortBy] ? 1 : 0;
    return sortDir === 'desc' ? -diff : diff;
  });

  const totals = MOCK_DATA.reduce((acc, c) => ({
    students: acc.students + c.studentCount,
    revenue: acc.revenue + c.totalRevenue,
    costs: acc.costs + c.totalCosts,
    profit: acc.profit + c.profit,
  }), { students: 0, revenue: 0, costs: 0, profit: 0 });

  const handleSort = (col: 'className' | 'profit' | 'margin') => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Class Profitability</h1>
          <p className="text-gray-600 text-sm mt-1">Revenue vs costs per class with margin analysis</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-blue-600">{totals.students}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">UGX {totals.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Costs</p>
            <p className="text-2xl font-bold text-red-600">UGX {totals.costs.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Profit</p>
            <p className="text-2xl font-bold text-purple-600">UGX {totals.profit.toLocaleString()}</p>
          </div>
        </div>

        {/* Margin bars */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Profit Margins by Class</h2>
          <div className="space-y-3">
            {MOCK_DATA.sort((a, b) => b.margin - a.margin).map((c) => (
              <div key={c.classId} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-gray-700">{c.className}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div className={`h-6 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium ${c.margin >= 60 ? 'bg-green-500' : c.margin >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${c.margin}%` }}>
                    {c.margin.toFixed(1)}%
                  </div>
                </div>
                <span className="w-32 text-sm text-right text-gray-600">UGX {c.profit.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail table */}
        <div className="p-6">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort('className')}>Class {sortBy === 'className' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Students</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Fee Rev.</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Transport</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Inventory</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Total Rev.</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Total Costs</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort('profit')}>Profit {sortBy === 'profit' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort('margin')}>Margin {sortBy === 'margin' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.classId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm font-medium">{c.className}</td>
                  <td className="px-3 py-3 text-sm text-right">{c.studentCount}</td>
                  <td className="px-3 py-3 text-sm text-right">UGX {c.feeRevenue.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right">UGX {c.transportRevenue.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right">UGX {c.inventoryRevenue.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-green-700">UGX {c.totalRevenue.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right text-red-600">UGX {c.totalCosts.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right font-semibold text-purple-700">UGX {c.profit.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${c.margin >= 60 ? 'bg-green-100 text-green-800' : c.margin >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{c.margin.toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td className="px-3 py-3 text-sm">Total</td>
                <td className="px-3 py-3 text-sm text-right">{totals.students}</td>
                <td className="px-3 py-3 text-sm text-right" colSpan={3} />
                <td className="px-3 py-3 text-sm text-right text-green-700">UGX {totals.revenue.toLocaleString()}</td>
                <td className="px-3 py-3 text-sm text-right text-red-600">UGX {totals.costs.toLocaleString()}</td>
                <td className="px-3 py-3 text-sm text-right text-purple-700">UGX {totals.profit.toLocaleString()}</td>
                <td className="px-3 py-3 text-sm text-right">{totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : 0}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassProfitability;
