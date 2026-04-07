/**
 * Trial Balance Report
 * View trial balance and verify GL balances
 */

import React, { useState } from 'react';
import { useAuthStore } from '../../store';

interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  accountType: string;
  debitAmount: number;
  creditAmount: number;
}

export default function TrialBalance() {
  const user = useAuthStore((state) => state.user);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const trialBalanceData: TrialBalanceRow[] = [
    { accountCode: '1001', accountName: 'Bank Account - Operating', accountType: 'asset', debitAmount: 2500000, creditAmount: 0 },
    { accountCode: '1100', accountName: 'Accounts Receivable', accountType: 'asset', debitAmount: 850000, creditAmount: 0 },
    { accountCode: '2000', accountName: 'Accounts Payable', accountType: 'liability', debitAmount: 0, creditAmount: 300000 },
    { accountCode: '3000', accountName: 'Capital', accountType: 'equity', debitAmount: 0, creditAmount: 2500000 },
    { accountCode: '4000', accountName: 'Tuition Income', accountType: 'revenue', debitAmount: 0, creditAmount: 1200000 },
    { accountCode: '4100', accountName: 'Transport Income', accountType: 'revenue', debitAmount: 0, creditAmount: 450000 },
    { accountCode: '4200', accountName: 'Other Income', accountType: 'revenue', debitAmount: 0, creditAmount: 200000 },
    { accountCode: '5000', accountName: 'Staff Salaries', accountType: 'expense', debitAmount: 500000, creditAmount: 0 },
    { accountCode: '5100', accountName: 'Utilities', accountType: 'expense', debitAmount: 80000, creditAmount: 0 },
    { accountCode: '5200', accountName: 'Maintenance', accountType: 'expense', debitAmount: 75000, creditAmount: 0 },
    { accountCode: '5300', accountName: 'Supplies', accountType: 'expense', debitAmount: 50000, creditAmount: 0 },
  ];

  const totalDebits = trialBalanceData.reduce((sum, row) => sum + row.debitAmount, 0);
  const totalCredits = trialBalanceData.reduce((sum, row) => sum + row.creditAmount, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const accountTypeOrder: { [key: string]: number } = {
    asset: 1,
    liability: 2,
    equity: 3,
    revenue: 4,
    expense: 5
  };

  const sortedData = [...trialBalanceData].sort((a, b) => {
    const orderDiff = accountTypeOrder[a.accountType] - accountTypeOrder[b.accountType];
    if (orderDiff !== 0) return orderDiff;
    return a.accountCode.localeCompare(b.accountCode);
  });

  const generateFinancialStatements = () => {
    // Generate Income Statement
    const revenues = sortedData
      .filter(row => row.accountType === 'revenue')
      .reduce((sum, row) => sum + row.creditAmount, 0);
    
    const expenses = sortedData
      .filter(row => row.accountType === 'expense')
      .reduce((sum, row) => sum + row.debitAmount, 0);
    
    const netIncome = revenues - expenses;

    // Generate Balance Sheet
    const assets = sortedData
      .filter(row => row.accountType === 'asset')
      .reduce((sum, row) => sum + (row.debitAmount - row.creditAmount), 0);
    
    const liabilities = sortedData
      .filter(row => row.accountType === 'liability')
      .reduce((sum, row) => sum + (row.creditAmount - row.debitAmount), 0);
    
    const equity = sortedData
      .filter(row => row.accountType === 'equity')
      .reduce((sum, row) => sum + (row.creditAmount - row.debitAmount), 0);

    return { revenues, expenses, netIncome, assets, liabilities, equity };
  };

  const { revenues, expenses, netIncome, assets, liabilities, equity } = generateFinancialStatements();

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <h1 className="page-title">Trial Balance & Reports</h1>
        <p className="page-subtitle">View account balances and financial statements as of {asOfDate}</p>
      </div>

      {/* Report Controls */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex gap-4 items-end">
            <div>
              <label className="form-label">As of Date</label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="form-input"
              />
            </div>
            <button className="btn btn-primary">
              Generate Report
            </button>
            <button className="btn btn-outline">
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="card mb-8">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Trial Balance</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Name</th>
                  <th className="text-right">Debit</th>
                  <th className="text-right">Credit</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, idx) => (
                  <tr key={idx} className={row.accountType === 'equity' ? 'border-t-2 border-gray-400' : ''}>
                    <td className="font-mono text-sm">{row.accountCode}</td>
                    <td className="font-semibold">{row.accountName}</td>
                    <td className="text-right font-mono">
                      {row.debitAmount > 0 ? `UGX ${row.debitAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="text-right font-mono">
                      {row.creditAmount > 0 ? `UGX ${row.creditAmount.toLocaleString()}` : '-'}
                    </td>
                    <td>
                      <span className={`badge ${
                        row.accountType === 'asset' ? 'badge-info' :
                        row.accountType === 'liability' ? 'badge-warning' :
                        row.accountType === 'equity' ? 'badge-success' :
                        row.accountType === 'revenue' ? 'badge-success' :
                        'badge-danger'
                      }`}>
                        {row.accountType}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="font-bold border-t-2 border-gray-600 bg-gray-50">
                  <td colSpan={2}>TOTALS</td>
                  <td className="text-right">
                    UGX {totalDebits.toLocaleString()}
                  </td>
                  <td className="text-right">
                    UGX {totalCredits.toLocaleString()}
                  </td>
                  <td className={isBalanced ? 'text-green-600' : 'text-red-600'}>
                    {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial Statements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Statement */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Income Statement</h2>
            <p className="text-sm text-gray-600">For the period ended {asOfDate}</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Revenues</span>
                <span className="font-mono">UGX {revenues.toLocaleString()}</span>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">Expenses:</p>
                {sortedData
                  .filter(row => row.accountType === 'expense')
                  .map((row, idx) => (
                    <div key={idx} className="flex justify-between text-sm ml-4 mb-1">
                      <span>{row.accountName}</span>
                      <span className="font-mono">UGX {row.debitAmount.toLocaleString()}</span>
                    </div>
                  ))
                }
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Total Expenses</span>
                <span className="font-mono">UGX {expenses.toLocaleString()}</span>
              </div>

              <div className="flex justify-between border-t pt-2 bg-blue-50 p-2 rounded font-bold">
                <span>NET INCOME</span>
                <span className={`font-mono ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  UGX {netIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Sheet */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Balance Sheet</h2>
            <p className="text-sm text-gray-600">As of {asOfDate}</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {/* Assets */}
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">ASSETS</p>
                {sortedData
                  .filter(row => row.accountType === 'asset')
                  .map((row, idx) => (
                    <div key={idx} className="flex justify-between text-sm ml-4 mb-1">
                      <span>{row.accountName}</span>
                      <span className="font-mono">UGX {row.debitAmount.toLocaleString()}</span>
                    </div>
                  ))
                }
                <div className="flex justify-between border-b pb-2 ml-4 font-semibold">
                  <span>Total Assets</span>
                  <span className="font-mono">UGX {assets.toLocaleString()}</span>
                </div>
              </div>

              {/* Liabilities */}
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">LIABILITIES</p>
                {sortedData
                  .filter(row => row.accountType === 'liability')
                  .map((row, idx) => (
                    <div key={idx} className="flex justify-between text-sm ml-4 mb-1">
                      <span>{row.accountName}</span>
                      <span className="font-mono">UGX {row.creditAmount.toLocaleString()}</span>
                    </div>
                  ))
                }
                <div className="flex justify-between border-b pb-2 ml-4 font-semibold">
                  <span>Total Liabilities</span>
                  <span className="font-mono">UGX {liabilities.toLocaleString()}</span>
                </div>
              </div>

              {/* Equity */}
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">EQUITY</p>
                {sortedData
                  .filter(row => row.accountType === 'equity')
                  .map((row, idx) => (
                    <div key={idx} className="flex justify-between text-sm ml-4 mb-1">
                      <span>{row.accountName}</span>
                      <span className="font-mono">UGX {row.creditAmount.toLocaleString()}</span>
                    </div>
                  ))
                }
                <div className="flex justify-between border-t pt-2 bg-blue-50 p-2 rounded ml-4 font-bold">
                  <span>Total Equity</span>
                  <span className="font-mono">UGX {equity.toLocaleString()}</span>
                </div>
              </div>

              {/* Verify */}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Assets = Liabilities + Equity</span>
                  <span className={Math.abs(assets - (liabilities + equity)) < 0.01 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(assets - (liabilities + equity)) < 0.01 ? '✓ Balanced' : '✗ Not Balanced'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
