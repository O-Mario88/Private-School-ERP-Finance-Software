import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { PayrollRun, PayrollItem, PayrollRunStatus, Employee, EmployeeStatus, SalaryStructure } from '../../types';

interface PayrollRunDisplay extends PayrollRun {
  items: PayrollItemDisplay[];
}

interface PayrollItemDisplay extends PayrollItem {
  employeeName: string;
  department: string;
}

const MOCK_RUNS: PayrollRunDisplay[] = [
  {
    id: 'pr_1', payPeriod: '2026-03', runDate: '2026-03-28', totalGross: 76950000, totalDeductions: 19237500,
    totalNet: 57712500, employeeCount: 25, status: PayrollRunStatus.POSTED, createdBy: 'usr_1', createdAt: '2026-03-28',
    items: [
      { id: 'pi_1', payrollRunId: 'pr_1', employeeId: 'emp_1', employeeName: 'James Mukasa', department: 'Administration',
        basicSalary: 2295000, totalAllowances: 945000, grossSalary: 3240000, paye: 511110, lst: 45900, nssf: 58320,
        otherDeductions: 135000, totalDeductions: 750330, netSalary: 2489670 },
      { id: 'pi_2', payrollRunId: 'pr_1', employeeId: 'emp_2', employeeName: 'Mary Nakato', department: 'Teaching',
        basicSalary: 1755000, totalAllowances: 675000, grossSalary: 2430000, paye: 349110, lst: 43200, nssf: 58320,
        otherDeductions: 81000, totalDeductions: 531630, netSalary: 1898370 },
      { id: 'pi_3', payrollRunId: 'pr_1', employeeId: 'emp_3', employeeName: 'Peter Ssemanda', department: 'Teaching',
        basicSalary: 1485000, totalAllowances: 540000, grossSalary: 2025000, paye: 268110, lst: 37800, nssf: 58320,
        otherDeductions: 0, totalDeductions: 364230, netSalary: 1660770 },
      { id: 'pi_4', payrollRunId: 'pr_1', employeeId: 'emp_4', employeeName: 'Grace Nambi', department: 'Support',
        basicSalary: 945000, totalAllowances: 270000, grossSalary: 1215000, paye: 125550, lst: 29700, nssf: 58320,
        otherDeductions: 54000, totalDeductions: 267570, netSalary: 947430 },
    ],
  },
  {
    id: 'pr_2', payPeriod: '2026-04', runDate: '2026-04-05', totalGross: 76950000, totalDeductions: 19237500,
    totalNet: 57712500, employeeCount: 25, status: PayrollRunStatus.DRAFT, createdBy: 'usr_1', createdAt: '2026-04-05',
    items: [],
  },
];

export function PayrollDashboard() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [runs, setRuns] = useState<PayrollRunDisplay[]>(MOCK_RUNS);
  const [selectedRun, setSelectedRun] = useState<PayrollRunDisplay | null>(null);
  const [showNewRun, setShowNewRun] = useState(false);
  const [newPeriod, setNewPeriod] = useState('2026-04');

  const handleCreateRun = () => {
    if (!newPeriod) { addNotification('Select a pay period', 'error'); return; }
    const run: PayrollRunDisplay = {
      id: `pr_${Date.now()}`, payPeriod: newPeriod, runDate: new Date().toISOString().split('T')[0],
      totalGross: 0, totalDeductions: 0, totalNet: 0, employeeCount: 0,
      status: PayrollRunStatus.DRAFT, createdBy: 'usr_1', createdAt: new Date().toISOString(), items: [],
    };
    setRuns([run, ...runs]);
    setShowNewRun(false);
    addNotification(`Payroll run created for ${newPeriod}`, 'success');
  };

  const handleCalculate = (runId: string) => {
    setRuns(runs.map(r => r.id === runId ? {
      ...r, status: PayrollRunStatus.CALCULATED, employeeCount: 25,
      totalGross: 76950000, totalDeductions: 19237500, totalNet: 57712500,
      items: MOCK_RUNS[0].items,
    } : r));
    addNotification('Payroll calculated for 25 employees', 'success');
  };

  const handleApprove = (runId: string) => {
    setRuns(runs.map(r => r.id === runId ? { ...r, status: PayrollRunStatus.APPROVED, approvedBy: 'usr_1' } : r));
    addNotification('Payroll approved', 'success');
  };

  const handlePost = (runId: string) => {
    setRuns(runs.map(r => r.id === runId ? { ...r, status: PayrollRunStatus.POSTED, journalEntryId: `je_${Date.now()}` } : r));
    addNotification('Payroll posted to GL', 'success');
  };

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
  const statusBadge: Record<PayrollRunStatus, string> = {
    [PayrollRunStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [PayrollRunStatus.CALCULATED]: 'bg-blue-100 text-blue-800',
    [PayrollRunStatus.APPROVED]: 'bg-yellow-100 text-yellow-800',
    [PayrollRunStatus.POSTED]: 'bg-green-100 text-green-800',
    [PayrollRunStatus.REVERSED]: 'bg-red-100 text-red-800',
  };

  if (selectedRun) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setSelectedRun(null)} className="text-blue-600 text-sm mb-2">← Back to Payroll</button>
            <h2 className="text-2xl font-bold text-gray-900">Payroll: {selectedRun.payPeriod}</h2>
            <p className="text-gray-600">{selectedRun.employeeCount} employees • {fmt(selectedRun.totalNet)} net pay</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge[selectedRun.status]}`}>
            {selectedRun.status}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Gross Pay', value: fmt(selectedRun.totalGross), color: 'blue' },
            { label: 'Total Deductions', value: fmt(selectedRun.totalDeductions), color: 'red' },
            { label: 'Net Pay', value: fmt(selectedRun.totalNet), color: 'green' },
            { label: 'Employees', value: selectedRun.employeeCount.toString(), color: 'purple' },
          ].map((c) => (
            <div key={c.label} className="card"><div className="card-body">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-xl font-bold text-${c.color}-600`}>{c.value}</p>
            </div></div>
          ))}
        </div>

        <div className="flex gap-2">
          {selectedRun.status === PayrollRunStatus.DRAFT && (
            <button onClick={() => handleCalculate(selectedRun.id)} className="btn btn-primary">Calculate Payroll</button>
          )}
          {selectedRun.status === PayrollRunStatus.CALCULATED && (
            <button onClick={() => handleApprove(selectedRun.id)} className="btn btn-primary">Approve</button>
          )}
          {selectedRun.status === PayrollRunStatus.APPROVED && (
            <button onClick={() => handlePost(selectedRun.id)} className="btn btn-primary">Post to GL</button>
          )}
        </div>

        {selectedRun.items.length > 0 && (
          <div className="card">
            <div className="card-header border-b border-gray-200"><h3 className="text-lg font-semibold">Payslip Summary</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">Employee</th><th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-right">Basic</th><th className="px-4 py-3 text-right">Allowances</th>
                  <th className="px-4 py-3 text-right">Gross</th><th className="px-4 py-3 text-right">PAYE</th>
                  <th className="px-4 py-3 text-right">LST</th><th className="px-4 py-3 text-right">NSSF</th>
                  <th className="px-4 py-3 text-right">Other Ded.</th><th className="px-4 py-3 text-right">Net Pay</th>
                </tr></thead>
                <tbody>
                  {selectedRun.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium">{item.employeeName}</td>
                      <td className="px-4 py-3 text-gray-600">{item.department}</td>
                      <td className="px-4 py-3 text-right">{item.basicSalary.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{item.totalAllowances.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium">{item.grossSalary.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-600">{item.paye.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-600">{item.lst.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-600">{item.nssf.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-600">{item.otherDeductions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-700">{item.netSalary.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="bg-gray-50 font-bold">
                  <td className="px-4 py-3" colSpan={2}>Totals</td>
                  <td className="px-4 py-3 text-right">{selectedRun.items.reduce((s, i) => s + i.basicSalary, 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{selectedRun.items.reduce((s, i) => s + i.totalAllowances, 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{selectedRun.items.reduce((s, i) => s + i.grossSalary, 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-600">{selectedRun.items.reduce((s, i) => s + i.paye, 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-600">{selectedRun.items.reduce((s, i) => s + i.lst, 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-600">{selectedRun.items.reduce((s, i) => s + i.nssf, 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-600">{selectedRun.items.reduce((s, i) => s + i.otherDeductions, 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-700">{selectedRun.items.reduce((s, i) => s + i.netSalary, 0).toLocaleString()}</td>
                </tr></tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Payroll</h2>
          <p className="text-gray-600">Monthly payroll processing and payslip management</p></div>
        <button onClick={() => setShowNewRun(true)} className="btn btn-primary">+ New Payroll Run</button>
      </div>

      {showNewRun && (
        <div className="card"><div className="card-body">
          <h3 className="text-lg font-semibold mb-4">New Payroll Run</h3>
          <div className="flex gap-4 items-end">
            <div><label className="form-label">Pay Period</label>
              <input type="month" value={newPeriod} onChange={(e) => setNewPeriod(e.target.value)} className="form-input" /></div>
            <button onClick={handleCreateRun} className="btn btn-primary">Create Run</button>
            <button onClick={() => setShowNewRun(false)} className="btn bg-gray-200 text-gray-700">Cancel</button>
          </div>
        </div></div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Monthly Payroll Cost</p>
          <p className="text-2xl font-bold text-blue-600">{fmt(76950000)}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Total Staff</p>
          <p className="text-2xl font-bold text-purple-600">25</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">YTD Payroll Expense</p>
          <p className="text-2xl font-bold text-gray-900">{fmt(230850000)}</p>
        </div></div>
      </div>

      <div className="card">
        <div className="card-header border-b border-gray-200"><h3 className="text-lg font-semibold">Payroll Runs</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Period</th><th className="px-4 py-3">Run Date</th>
              <th className="px-4 py-3">Employees</th><th className="px-4 py-3 text-right">Gross</th>
              <th className="px-4 py-3 text-right">Net</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRun(run)}>
                  <td className="px-4 py-3 font-medium">{run.payPeriod}</td>
                  <td className="px-4 py-3 text-gray-600">{run.runDate}</td>
                  <td className="px-4 py-3">{run.employeeCount}</td>
                  <td className="px-4 py-3 text-right">{fmt(run.totalGross)}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(run.totalNet)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[run.status]}`}>{run.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedRun(run); }} className="text-blue-600 text-sm">View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
