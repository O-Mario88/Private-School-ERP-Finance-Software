import React, { useState, useRef } from 'react';
import { useUIStore } from '../../store';
import type { JournalEntry, JournalLineItem } from '../../types';

interface TrialBalanceData {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
}

export const TrialBalanceReport: React.FC<{ journalEntries: JournalEntry[] }> = ({ journalEntries }) => {
  const addNotification = useUIStore((state) => state.addNotification);
  
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const reportRef = useRef<HTMLDivElement>(null);

  const calculateTrialBalance = (): TrialBalanceData[] => {
    const balances: { [key: string]: TrialBalanceData } = {};

    journalEntries.forEach((entry) => {
      entry.lineItems.forEach((line: JournalLineItem) => {
        if (!balances[line.accountId]) {
          balances[line.accountId] = {
            accountId: line.accountId,
            debitAmount: 0,
            creditAmount: 0,
          };
        }
        balances[line.accountId].debitAmount += line.debitAmount || 0;
        balances[line.accountId].creditAmount += line.creditAmount || 0;
      });
    });

    return Object.values(balances).filter(
      (balance) => balance.debitAmount > 0 || balance.creditAmount > 0
    );
  };

  const trialBalance = calculateTrialBalance();
  const totalDebits = trialBalance.reduce((sum, row) => sum + row.debitAmount, 0);
  const totalCredits = trialBalance.reduce((sum, row) => sum + row.creditAmount, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const exportToCsv = () => {
    const csv = [
      ['Maple Private School - Trial Balance'],
      [`As of: ${new Date(asOfDate).toLocaleDateString()}`],
      [],
      ['Account ID', 'Debit', 'Credit'],
      ...trialBalance.map((row) => [
        row.accountId,
        row.debitAmount.toFixed(2),
        row.creditAmount.toFixed(2),
      ]),
      [],
      ['TOTALS', totalDebits.toFixed(2), totalCredits.toFixed(2)],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial_balance_${asOfDate}.csv`;
    a.click();
    addNotification('Trial balance exported to CSV', 'success');
  };

  const handlePrint = () => {
    if (reportRef.current) {
      const printWindow = window.open('', '', 'height=800,width=1000');
      if (printWindow) {
        printWindow.document.write(reportRef.current.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">As of Date</label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Print
          </button>
          <button
            onClick={exportToCsv}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div ref={reportRef} className="bg-white p-8 rounded-lg shadow" style={{ fontFamily: 'monospace' }}>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">MAPLE PRIVATE SCHOOL</h1>
          <h2 className="text-xl font-semibold text-gray-700">TRIAL BALANCE</h2>
          <p className="text-gray-600">As of {new Date(asOfDate).toLocaleDateString()}</p>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left px-2 py-2 font-bold">Account ID</th>
                <th className="text-right px-2 py-2 font-bold">Debit (KES)</th>
                <th className="text-right px-2 py-2 font-bold">Credit (KES)</th>
              </tr>
            </thead>
            <tbody>
              {trialBalance.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="px-2 py-1 font-medium">{row.accountId}</td>
                  <td className="px-2 py-1 text-right">
                    {row.debitAmount > 0 ? row.debitAmount.toFixed(2) : ''}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {row.creditAmount > 0 ? row.creditAmount.toFixed(2) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-b-2 border-gray-900 font-bold">
                <td className="px-2 py-2 text-right">TOTALS:</td>
                <td className="px-2 py-2 text-right">{totalDebits.toFixed(2)}</td>
                <td className="px-2 py-2 text-right">{totalCredits.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={`mb-6 p-4 rounded-lg text-center font-bold ${isBalanced ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
          {isBalanced ? '✓ BALANCED' : '✗ NOT BALANCED'} (Difference: KES {Math.abs(totalDebits - totalCredits).toFixed(2)})
        </div>
      </div>
    </div>
  );
};
