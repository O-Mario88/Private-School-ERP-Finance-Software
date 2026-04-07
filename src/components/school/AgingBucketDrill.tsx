/**
 * Overdue Groups Drill Component
 * Drill into outstanding school fees by delay period with student-level detail
 */

import React, { useState } from 'react';

interface OverdueStudent {
  id: string;
  name: string;
  className: string;
  invoiceId: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  daysOverdue: number;
}

const MOCK_OVERDUE_DATA: OverdueStudent[] = [
  { id: 'stu_1', name: 'Aisha Namutebi', className: 'S2A', invoiceId: 'INV-2026-001', invoiceDate: '2026-01-10', dueDate: '2026-01-31', totalAmount: 450000, paidAmount: 150000, daysOverdue: 0 },
  { id: 'stu_2', name: 'Brian Mugisha', className: 'S3B', invoiceId: 'INV-2026-002', invoiceDate: '2026-01-05', dueDate: '2026-01-20', totalAmount: 520000, paidAmount: 200000, daysOverdue: 25 },
  { id: 'stu_3', name: 'Catherine Nalubega', className: 'S1C', invoiceId: 'INV-2026-003', invoiceDate: '2025-12-01', dueDate: '2025-12-31', totalAmount: 380000, paidAmount: 0, daysOverdue: 45 },
  { id: 'stu_5', name: 'Eva Atukunda', className: 'S1B', invoiceId: 'INV-2026-005', invoiceDate: '2025-11-01', dueDate: '2025-11-30', totalAmount: 400000, paidAmount: 100000, daysOverdue: 76 },
  { id: 'stu_6', name: 'Frank Katumba', className: 'S4A', invoiceId: 'INV-2026-006', invoiceDate: '2025-10-01', dueDate: '2025-10-31', totalAmount: 550000, paidAmount: 50000, daysOverdue: 107 },
  { id: 'stu_7', name: 'Grace Nabatanzi', className: 'S2B', invoiceId: 'INV-2026-007', invoiceDate: '2025-08-01', dueDate: '2025-08-31', totalAmount: 600000, paidAmount: 0, daysOverdue: 168 },
  { id: 'stu_8', name: 'Henry Ssemakula', className: 'S3A', invoiceId: 'INV-2026-008', invoiceDate: '2026-01-15', dueDate: '2026-02-15', totalAmount: 480000, paidAmount: 480000, daysOverdue: 0 },
  { id: 'stu_9', name: 'Irene Kobusinge', className: 'S1A', invoiceId: 'INV-2026-009', invoiceDate: '2026-01-10', dueDate: '2026-01-25', totalAmount: 350000, paidAmount: 100000, daysOverdue: 20 },
];

type GroupKey = 'current' | '1-30' | '31-60' | '61-90' | '90+';

const getGroup = (daysOverdue: number, balance: number): GroupKey | null => {
  if (balance <= 0) return null;
  if (daysOverdue <= 0) return 'current';
  if (daysOverdue <= 30) return '1-30';
  if (daysOverdue <= 60) return '31-60';
  if (daysOverdue <= 90) return '61-90';
  return '90+';
};

export const AgingBucketDrill: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<GroupKey | null>(null);

  const studentsWithBalance = MOCK_OVERDUE_DATA.map((s) => ({
    ...s,
    balance: s.totalAmount - s.paidAmount,
    group: getGroup(s.daysOverdue, s.totalAmount - s.paidAmount),
  })).filter((s) => s.balance > 0);

  const groups: Record<GroupKey, { label: string; color: string; bgColor: string; students: typeof studentsWithBalance }> = {
    'current': { label: 'Not Yet Due', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', students: studentsWithBalance.filter((s) => s.group === 'current') },
    '1-30': { label: '1–30 Days Late', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', students: studentsWithBalance.filter((s) => s.group === '1-30') },
    '31-60': { label: '31–60 Days Late', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', students: studentsWithBalance.filter((s) => s.group === '31-60') },
    '61-90': { label: '61–90 Days Late', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', students: studentsWithBalance.filter((s) => s.group === '61-90') },
    '90+': { label: 'More Than 90 Days Late', color: 'text-red-800', bgColor: 'bg-red-100 border-red-300', students: studentsWithBalance.filter((s) => s.group === '90+') },
  };

  const totalOutstanding = studentsWithBalance.reduce((sum, s) => sum + s.balance, 0);

  const drillStudents = selectedGroup ? groups[selectedGroup].students : studentsWithBalance;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Overdue Groups</h1>
          <p className="text-gray-600 text-sm mt-1">Outstanding school fees by delay period with student drill-down</p>
        </div>

        {/* Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Outstanding Balance</p>
              <p className="text-3xl font-bold text-gray-900">UGX {totalOutstanding.toLocaleString()}</p>
            </div>
            <p className="text-sm text-gray-600">{studentsWithBalance.length} students with balance</p>
          </div>

          {/* Overdue bar */}
          <div className="flex rounded-lg overflow-hidden h-8 mb-4">
            {(Object.keys(groups) as GroupKey[]).map((key) => {
              const group = groups[key];
              const groupTotal = group.students.reduce((s, st) => s + st.balance, 0);
              const pct = totalOutstanding > 0 ? (groupTotal / totalOutstanding) * 100 : 0;
              if (pct === 0) return null;
              const bgColors: Record<GroupKey, string> = {
                'current': 'bg-green-400',
                '1-30': 'bg-yellow-400',
                '31-60': 'bg-orange-400',
                '61-90': 'bg-red-400',
                '90+': 'bg-red-700',
              };
              return (
                <div key={key} className={`${bgColors[key]} flex items-center justify-center text-xs text-white font-medium cursor-pointer hover:opacity-80`} style={{ width: `${pct}%` }} onClick={() => setSelectedGroup(selectedGroup === key ? null : key)} title={`${group.label}: UGX ${groupTotal.toLocaleString()}`}>
                  {pct > 8 ? `${Math.round(pct)}%` : ''}
                </div>
              );
            })}
          </div>

          {/* Group cards */}
          <div className="grid grid-cols-5 gap-3">
            {(Object.keys(groups) as GroupKey[]).map((key) => {
              const group = groups[key];
              const groupTotal = group.students.reduce((s, st) => s + st.balance, 0);
              return (
                <button key={key} onClick={() => setSelectedGroup(selectedGroup === key ? null : key)} className={`p-3 rounded-lg border text-left transition-all ${selectedGroup === key ? group.bgColor + ' ring-2 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                  <p className="text-xs text-gray-600">{group.label}</p>
                  <p className={`text-lg font-bold ${group.color}`}>UGX {groupTotal.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{group.students.length} student{group.students.length !== 1 ? 's' : ''}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail table */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedGroup ? `${groups[selectedGroup].label} — ${groups[selectedGroup].students.length} Student(s)` : `All Outstanding — ${studentsWithBalance.length} Student(s)`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Paid</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Balance</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {drillStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                    <td className="px-4 py-3 text-sm">{student.className}</td>
                    <td className="px-4 py-3 text-sm text-blue-600">{student.invoiceId}</td>
                    <td className="px-4 py-3 text-sm">{student.dueDate}</td>
                    <td className="px-4 py-3 text-sm text-right">UGX {student.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">UGX {student.paidAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">UGX {student.balance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${student.daysOverdue > 90 ? 'bg-red-100 text-red-800' : student.daysOverdue > 30 ? 'bg-orange-100 text-orange-800' : student.daysOverdue > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {student.daysOverdue > 0 ? `${student.daysOverdue}d` : 'Current'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-4 py-3 text-sm" colSpan={4}>Total</td>
                  <td className="px-4 py-3 text-sm text-right">UGX {drillStudents.reduce((s, st) => s + st.totalAmount, 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">UGX {drillStudents.reduce((s, st) => s + st.paidAmount, 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">UGX {drillStudents.reduce((s, st) => s + st.balance, 0).toLocaleString()}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgingBucketDrill;
