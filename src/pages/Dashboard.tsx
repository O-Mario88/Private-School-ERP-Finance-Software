/**
 * Dashboard Page
 * Main dashboard with role-specific KPIs and widgets
 */

import React from 'react';
import { useAuthStore } from '../store';
import { UserRole } from '../types';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.firstName}!</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Billed" value="KSh 2.5M" change="+12%" trend="up" />
        <KPICard title="Total Collected" value="KSh 2.1M" change="+8%" trend="up" />
        <KPICard title="Collection Rate" value="84%" change="+2%" trend="up" />
        <KPICard title="Outstanding" value="KSh 400K" change="-3%" trend="down" />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Revenue Trend (Last 6 Months)</h3>
          </div>
          <div className="card-body h-64 flex items-center justify-center text-gray-400">
            <p>Chart visualization will render here</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Top 5 Debtors</h3>
          </div>
          <div className="card-body">
            <table className="table text-sm">
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="text-gray-900 font-medium">Family {i}</td>
                    <td className="text-right font-medium">KSh {i * 50}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </div>
        <div className="card-body grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn-primary flex flex-col items-center justify-center h-20 rounded">
            <span className="text-2xl mb-2">📄</span>
            <span className="text-xs">New Invoice</span>
          </button>
          <button className="btn-primary flex flex-col items-center justify-center h-20 rounded">
            <span className="text-2xl mb-2">💳</span>
            <span className="text-xs">Post Payment</span>
          </button>
          <button className="btn-primary flex flex-col items-center justify-center h-20 rounded">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-xs">Generate Report</span>
          </button>
          <button className="btn-primary flex flex-col items-center justify-center h-20 rounded">
            <span className="text-2xl mb-2">🔍</span>
            <span className="text-xs">Search Records</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

function KPICard({ title, value, change, trend }: KPICardProps) {
  return (
    <div className="card">
      <div className="card-body">
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change} {trend === 'up' ? '↑' : '↓'} vs last month
        </p>
      </div>
    </div>
  );
}
