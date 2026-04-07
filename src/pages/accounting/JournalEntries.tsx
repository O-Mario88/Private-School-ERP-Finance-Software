/**
 * Journal Entries Page
 * Create, view, and manage journal entries
 */

import React, { useState } from 'react';
import { useAuthStore, useUIStore } from '../../store';
import { UserRole } from '../../types';

interface LineItem {
  id: string;
  accountId: string;
  accountName: string;
  debitAmount?: number;
  creditAmount?: number;
  description?: string;
}

export default function JournalEntries() {
  const user = useAuthStore((state) => state.user);
  const addNotification = useUIStore((state) => state.addNotification);
  
  const [view, setView] = useState<'list' | 'create'>('list');
  const [entries, setEntries] = useState([
    { id: '1', date: '2026-04-01', reference: 'JE-001', description: 'Tuition fee collection', status: 'posted', amount: 50000 },
    { id: '2', date: '2026-03-28', reference: 'JE-002', description: 'Transport fee reversal', status: 'posted', amount: 15000 },
  ]);
  
  const [formData, setFormData] = useState<{
    entryDate: string;
    reference: string;
    description: string;
    lines: LineItem[];
  }>({
    entryDate: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    lines: [
      { id: '1', accountId: '', accountName: '', debitAmount: undefined, creditAmount: undefined, description: '' }
    ],
  });

  const chartOfAccounts = [
    { id: '1001', name: 'Bank Account - Operating', type: 'asset' },
    { id: '1100', name: 'Accounts Receivable', type: 'asset' },
    { id: '2000', name: 'Accounts Payable', type: 'liability' },
    { id: '3000', name: 'Capital', type: 'equity' },
    { id: '4000', name: 'Tuition Income', type: 'revenue' },
    { id: '4100', name: 'Transport Income', type: 'revenue' },
    { id: '5000', name: 'Staff Salaries', type: 'expense' },
    { id: '5100', name: 'Utilities', type: 'expense' },
  ];

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { 
        id: String(formData.lines.length + 1), 
        accountId: '', 
        accountName: '',
        debitAmount: undefined, 
        creditAmount: undefined, 
        description: '' 
      }]
    });
  };

  const handleRemoveLine = (index: number) => {
    if (formData.lines.length > 1) {
      setFormData({
        ...formData,
        lines: formData.lines.filter((_, i) => i !== index)
      });
    }
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...formData.lines];
    if (field === 'accountId') {
      const account = chartOfAccounts.find(a => a.id === value);
      newLines[index].accountId = value;
      newLines[index].accountName = account?.name || '';
    } else if (field === 'debit') {
      if (value) {
        newLines[index].debitAmount = parseFloat(value);
        newLines[index].creditAmount = undefined;
      } else {
        newLines[index].debitAmount = undefined;
      }
    } else if (field === 'credit') {
      if (value) {
        newLines[index].creditAmount = parseFloat(value);
        newLines[index].debitAmount = undefined;
      } else {
        newLines[index].creditAmount = undefined;
      }
    } else if (field === 'description') {
      newLines[index].description = value;
    }
    setFormData({ ...formData, lines: newLines });
  };

  const calculateTotals = () => {
    let totalDebits = 0;
    let totalCredits = 0;
    formData.lines.forEach(line => {
      if (line.debitAmount) totalDebits += line.debitAmount;
      if (line.creditAmount) totalCredits += line.creditAmount;
    });
    return { totalDebits, totalCredits };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { totalDebits, totalCredits } = calculateTotals();
    
    // Validate
    if (!formData.reference.trim()) {
      addNotification('error', 'Reference number is required');
      return;
    }
    if (!formData.description.trim()) {
      addNotification('error', 'Description is required');
      return;
    }
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      addNotification('error', `Journal entry does not balance. Debits: ${totalDebits}, Credits: ${totalCredits}`);
      return;
    }
    if (formData.lines.some(l => !l.accountId)) {
      addNotification('error', 'All lines must have an account selected');
      return;
    }

    // Create new entry
    const newEntry = {
      id: String(entries.length + 1),
      date: formData.entryDate,
      reference: formData.reference,
      description: formData.description,
      status: 'posted',
      amount: totalDebits
    };
    
    setEntries([newEntry, ...entries]);
    setView('list');
    setFormData({
      entryDate: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      lines: [{ id: '1', accountId: '', accountName: '', debitAmount: undefined, creditAmount: undefined, description: '' }]
    });
    
    addNotification('success', 'Journal entry posted successfully');
  };

  const { totalDebits, totalCredits } = calculateTotals();
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="p-8">
      <div className="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 className="page-title">Journal Entries</h1>
          <p className="page-subtitle">Create and manage journal entries with double-entry accounting</p>
        </div>
        {view === 'list' && (
          <button
            onClick={() => setView('create')}
            className="btn btn-primary"
          >
            + New Journal Entry
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Recent Entries</h2>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td className="font-medium">{entry.reference}</td>
                      <td>{entry.description}</td>
                      <td className="text-right">KSh {entry.amount.toLocaleString()}</td>
                      <td>
                        <span className="badge badge-success">{entry.status}</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Create Journal Entry</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Entry Date</label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Reference Number</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="JE-001"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Transaction description"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Account</th>
                        <th className="text-right p-2">Debit</th>
                        <th className="text-right p-2">Credit</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-center p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lines.map((line, index) => (
                        <tr key={line.id} className="border-b">
                          <td className="p-2">
                            <select
                              value={line.accountId}
                              onChange={(e) => handleLineChange(index, 'accountId', e.target.value)}
                              className="form-input text-sm"
                            >
                              <option value="">Select Account</option>
                              {chartOfAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                  {acc.id} - {acc.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={line.debitAmount || ''}
                              onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                              placeholder="0.00"
                              className="form-input text-sm text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={line.creditAmount || ''}
                              onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                              placeholder="0.00"
                              className="form-input text-sm text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={line.description || ''}
                              onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                              placeholder="Optional"
                              className="form-input text-sm"
                            />
                          </td>
                          <td className="p-2 text-center">
                            {formData.lines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleAddLine}
                  className="btn btn-sm btn-outline mt-4"
                >
                  + Add Line
                </button>

                {/* Totals */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Debits</p>
                      <p className="text-lg font-bold">KSh {totalDebits.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Credits</p>
                      <p className="text-lg font-bold">KSh {totalCredits.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Difference</p>
                      <p className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                        KSh {Math.abs(totalDebits - totalCredits).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                        {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className="btn btn-primary"
                >
                  Post Journal Entry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('list');
                    setFormData({
                      entryDate: new Date().toISOString().split('T')[0],
                      reference: '',
                      description: '',
                      lines: [{ id: '1', accountId: '', accountName: '', debitAmount: undefined, creditAmount: undefined, description: '' }]
                    });
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
