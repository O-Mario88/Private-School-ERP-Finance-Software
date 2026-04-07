import React, { useState } from 'react';
import { PayrollItem } from '../../types';

interface PayslipData extends PayrollItem {
  employeeName: string;
  employeeNumber: string;
  department: string;
  position: string;
  bankName: string;
  bankAccount: string;
  payPeriod: string;
}

const MOCK_PAYSLIP: PayslipData = {
  id: 'pi_1', payrollRunId: 'pr_1', employeeId: 'emp_1',
  employeeName: 'James Mukasa', employeeNumber: 'EMP-001',
  department: 'Administration', position: 'Deputy Principal',
  bankName: 'Centenary Bank', bankAccount: '****4521',
  payPeriod: 'March 2026',
  basicSalary: 2295000, totalAllowances: 945000, grossSalary: 3240000,
  paye: 511110, lst: 45900, nssf: 58320, otherDeductions: 135000,
  totalDeductions: 750330, netSalary: 2489670,
};

export function PayslipViewer() {
  const [payslip] = useState<PayslipData>(MOCK_PAYSLIP);

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

  const earnings = [
    { label: 'Basic Salary', amount: payslip.basicSalary },
    { label: 'Housing Allowance', amount: 405000 },
    { label: 'Transport Allowance', amount: 270000 },
    { label: 'Medical Allowance', amount: 135000 },
    { label: 'Other Allowances', amount: 135000 },
  ];

  const deductions = [
    { label: 'PAYE (Income Tax)', amount: payslip.paye },
    { label: 'LST', amount: payslip.lst },
    { label: 'NSSF (Tier I + II)', amount: payslip.nssf },
    { label: 'Staff Loan Repayment', amount: 135000 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payslip Viewer</h2>
          <p className="text-gray-600">View and print individual employee payslips</p>
        </div>
        <button onClick={() => window.print()} className="btn btn-primary">🖨️ Print Payslip</button>
      </div>

      <div className="card max-w-3xl mx-auto" id="payslip-printable">
        <div className="card-body space-y-6">
          {/* Header */}
          <div className="text-center border-b border-gray-300 pb-4">
            <h2 className="text-xl font-bold text-gray-900">MAPLE PRIVATE SCHOOL</h2>
            <p className="text-gray-600">P.O. Box 12345, Kampala, Uganda</p>
            <p className="text-lg font-semibold text-blue-600 mt-2">PAYSLIP - {payslip.payPeriod}</p>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex"><span className="text-gray-500 w-32">Employee No:</span><span className="font-medium">{payslip.employeeNumber}</span></div>
              <div className="flex"><span className="text-gray-500 w-32">Name:</span><span className="font-medium">{payslip.employeeName}</span></div>
              <div className="flex"><span className="text-gray-500 w-32">Department:</span><span>{payslip.department}</span></div>
            </div>
            <div className="space-y-1">
              <div className="flex"><span className="text-gray-500 w-32">Position:</span><span>{payslip.position}</span></div>
              <div className="flex"><span className="text-gray-500 w-32">Bank:</span><span>{payslip.bankName}</span></div>
              <div className="flex"><span className="text-gray-500 w-32">Account:</span><span>{payslip.bankAccount}</span></div>
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">EARNINGS</h3>
              <div className="space-y-2">
                {earnings.map((e) => (
                  <div key={e.label} className="flex justify-between text-sm">
                    <span className="text-gray-600">{e.label}</span>
                    <span>{e.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
                  <span>Gross Pay</span><span>{payslip.grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">DEDUCTIONS</h3>
              <div className="space-y-2">
                {deductions.map((d) => (
                  <div key={d.label} className="flex justify-between text-sm">
                    <span className="text-gray-600">{d.label}</span>
                    <span className="text-red-600">{d.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
                  <span>Total Deductions</span><span className="text-red-600">{payslip.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-600 font-medium">NET PAY</p>
            <p className="text-3xl font-bold text-green-700">{fmt(payslip.netSalary)}</p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
            <p>This is a computer-generated payslip. No signature required.</p>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
