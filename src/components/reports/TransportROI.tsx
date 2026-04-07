/**
 * Transport ROI Report
 * Route-level revenue, costs, occupancy, and return on investment
 */

import React from 'react';

interface RouteROI {
  routeId: string;
  routeName: string;
  capacity: number;
  enrolled: number;
  monthlyFeePerStudent: number;
  driverCost: number;
  fuelCost: number;
  maintenanceCost: number;
  monthlyRevenue: number;
  monthlyCost: number;
  monthlyProfit: number;
  occupancy: number;
  roi: number;
}

const MOCK_DATA: RouteROI[] = [
  { routeId: 'r1', routeName: 'Ntinda – Bukoto – Kololo', capacity: 45, enrolled: 38, monthlyFeePerStudent: 80000, driverCost: 450000, fuelCost: 350000, maintenanceCost: 100000, monthlyRevenue: 3040000, monthlyCost: 900000, monthlyProfit: 2140000, occupancy: 84.4, roi: 237.8 },
  { routeId: 'r2', routeName: 'Naalya – Kira – Kampala', capacity: 30, enrolled: 28, monthlyFeePerStudent: 70000, driverCost: 400000, fuelCost: 280000, maintenanceCost: 80000, monthlyRevenue: 1960000, monthlyCost: 760000, monthlyProfit: 1200000, occupancy: 93.3, roi: 157.9 },
  { routeId: 'r3', routeName: 'Entebbe Road Express', capacity: 50, enrolled: 22, monthlyFeePerStudent: 65000, driverCost: 500000, fuelCost: 420000, maintenanceCost: 150000, monthlyRevenue: 1430000, monthlyCost: 1070000, monthlyProfit: 360000, occupancy: 44, roi: 33.6 },
  { routeId: 'r4', routeName: 'Mukono – Seeta', capacity: 35, enrolled: 33, monthlyFeePerStudent: 75000, driverCost: 420000, fuelCost: 300000, maintenanceCost: 90000, monthlyRevenue: 2475000, monthlyCost: 810000, monthlyProfit: 1665000, occupancy: 94.3, roi: 205.6 },
  { routeId: 'r5', routeName: 'Wakiso – Nansana', capacity: 40, enrolled: 15, monthlyFeePerStudent: 90000, driverCost: 480000, fuelCost: 380000, maintenanceCost: 120000, monthlyRevenue: 1350000, monthlyCost: 980000, monthlyProfit: 370000, occupancy: 37.5, roi: 37.8 },
];

export const TransportROI: React.FC = () => {
  const totalRevenue = MOCK_DATA.reduce((s, r) => s + r.monthlyRevenue, 0);
  const totalCost = MOCK_DATA.reduce((s, r) => s + r.monthlyCost, 0);
  const totalProfit = MOCK_DATA.reduce((s, r) => s + r.monthlyProfit, 0);
  const totalStudents = MOCK_DATA.reduce((s, r) => s + r.enrolled, 0);
  const totalCapacity = MOCK_DATA.reduce((s, r) => s + r.capacity, 0);

  const sortedByROI = [...MOCK_DATA].sort((a, b) => b.roi - a.roi);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Transport ROI</h1>
          <p className="text-gray-600 text-sm mt-1">Route-level return on investment analysis</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Routes</p>
            <p className="text-2xl font-bold text-blue-600">{MOCK_DATA.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Students</p>
            <p className="text-2xl font-bold text-purple-600">{totalStudents}/{totalCapacity}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <p className="text-2xl font-bold text-green-600">UGX {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Monthly Cost</p>
            <p className="text-2xl font-bold text-red-600">UGX {totalCost.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Monthly Profit</p>
            <p className="text-2xl font-bold text-green-700">UGX {totalProfit.toLocaleString()}</p>
          </div>
        </div>

        {/* ROI bars */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">ROI by Route</h2>
          <div className="space-y-3">
            {sortedByROI.map((route) => (
              <div key={route.routeId} className="flex items-center gap-4">
                <span className="w-40 text-sm font-medium text-gray-700 truncate">{route.routeName}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div className={`h-6 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium ${route.roi >= 100 ? 'bg-green-500' : route.roi >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(route.roi / 2.5, 100)}%` }}>
                    {route.roi.toFixed(1)}%
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`w-16 text-sm text-right ${route.occupancy >= 80 ? 'text-green-600' : route.occupancy >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{route.occupancy.toFixed(0)}% occ.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail table */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Route Details (Monthly)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Route</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700">Enrolled</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700">Capacity</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Fee/Student</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Revenue</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Driver</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Fuel</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Maint.</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Total Cost</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Profit</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">ROI</th>
                </tr>
              </thead>
              <tbody>
                {sortedByROI.map((r) => (
                  <tr key={r.routeId} className={`border-b border-gray-200 hover:bg-gray-50 ${r.roi < 50 ? 'bg-red-50' : ''}`}>
                    <td className="px-3 py-3 text-sm font-medium">{r.routeName}</td>
                    <td className="px-3 py-3 text-sm text-center">{r.enrolled}</td>
                    <td className="px-3 py-3 text-sm text-center">{r.capacity}</td>
                    <td className="px-3 py-3 text-sm text-right">UGX {r.monthlyFeePerStudent.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm text-right text-green-700">UGX {r.monthlyRevenue.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm text-right">UGX {r.driverCost.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm text-right">UGX {r.fuelCost.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm text-right">UGX {r.maintenanceCost.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm text-right text-red-600">UGX {r.monthlyCost.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm text-right font-semibold text-purple-700">UGX {r.monthlyProfit.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${r.roi >= 100 ? 'bg-green-100 text-green-800' : r.roi >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{r.roi.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-3 py-3 text-sm">Total</td>
                  <td className="px-3 py-3 text-sm text-center">{totalStudents}</td>
                  <td className="px-3 py-3 text-sm text-center">{totalCapacity}</td>
                  <td className="px-3 py-3 text-sm" />
                  <td className="px-3 py-3 text-sm text-right text-green-700">UGX {totalRevenue.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm" colSpan={3} />
                  <td className="px-3 py-3 text-sm text-right text-red-600">UGX {totalCost.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right text-purple-700">UGX {totalProfit.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right">{totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(1) : 0}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportROI;
