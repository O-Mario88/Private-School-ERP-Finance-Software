import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { PaymentRunAPStatus, SupplierInvoiceStatus } from '../../types';

interface PayableBill {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  dueDate: string;
  balanceAmount: number;
  selected: boolean;
}

interface PaymentRun {
  id: string;
  runDate: string;
  totalAmount: number;
  billCount: number;
  status: PaymentRunAPStatus;
  paymentMethod: string;
}

const PAYABLE_BILLS: PayableBill[] = [
  { id: 'si_1', supplierId: 'sup_1', supplierName: 'Booksource Ltd', invoiceNumber: 'BS-2026-045', dueDate: '2026-04-10', balanceAmount: 250000, selected: false },
  { id: 'si_2', supplierId: 'sup_2', supplierName: 'Uniform House', invoiceNumber: 'UH-1234', dueDate: '2026-03-15', balanceAmount: 80000, selected: false },
  { id: 'si_3', supplierId: 'sup_3', supplierName: 'Kenya Power', invoiceNumber: 'KPLC-MAR-26', dueDate: '2026-04-28', balanceAmount: 85000, selected: false },
  { id: 'si_5', supplierId: 'sup_5', supplierName: 'Tatu City Repairs', invoiceNumber: 'TCR-0089', dueDate: '2026-02-20', balanceAmount: 320000, selected: false },
];

const PAST_RUNS: PaymentRun[] = [
  { id: 'pr_1', runDate: '2026-03-01', totalAmount: 456000, billCount: 5, status: PaymentRunAPStatus.PROCESSED, paymentMethod: 'Bank Transfer' },
  { id: 'pr_2', runDate: '2026-02-01', totalAmount: 312000, billCount: 3, status: PaymentRunAPStatus.PROCESSED, paymentMethod: 'Bank Transfer' },
];

export function PaymentRunUI() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [bills, setBills] = useState<PayableBill[]>(PAYABLE_BILLS);
  const [runs] = useState<PaymentRun[]>(PAST_RUNS);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [bankAccount, setBankAccount] = useState('');
  const [view, setView] = useState<'create' | 'history'>('create');

  const toggleBill = (id: string) => setBills(bills.map(b => b.id === id ? { ...b, selected: !b.selected } : b));
  const toggleAll = () => {
    const allSelected = bills.every(b => b.selected);
    setBills(bills.map(b => ({ ...b, selected: !allSelected })));
  };

  const selectedBills = bills.filter(b => b.selected);
  const totalSelected = selectedBills.reduce((s, b) => s + b.balanceAmount, 0);
  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

  const executeRun = () => {
    if (selectedBills.length === 0) {
      addNotification('error', 'Select at least one bill to pay');
      return;
    }
    if (!bankAccount) {
      addNotification('error', 'Select a bank account for payment');
      return;
    }
    addNotification('success', `${selectedBills.length} bills totalling ${fmt(totalSelected)} queued for payment`);
    setBills(bills.filter(b => !b.selected));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Runs</h2>
          <p className="text-gray-600">Batch processing of supplier payments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('create')} className={`btn ${view === 'create' ? 'btn-primary' : 'bg-gray-200 text-gray-700'}`}>New Run</button>
          <button onClick={() => setView('history')} className={`btn ${view === 'history' ? 'btn-primary' : 'bg-gray-200 text-gray-700'}`}>History</button>
        </div>
      </div>

      {view === 'create' ? (
        <>
          {/* Payment Settings */}
          <div className="card"><div className="card-body">
            <h3 className="font-semibold text-gray-800 mb-4">Payment Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input className="input w-full" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select className="input w-full" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="mtn_momo">MTN MoMo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                <select className="input w-full" value={bankAccount} onChange={e => setBankAccount(e.target.value)}>
                  <option value="">Select account...</option>
                  <option value="ba_1">KCB Operations – 1234***890</option>
                  <option value="ba_2">Equity Fees – 5678***234</option>
                </select>
              </div>
            </div>
          </div></div>

          {/* Bill Selection */}
          <div className="card">
            <div className="card-header border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Outstanding Bills ({bills.length})</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Selected: {selectedBills.length} bills = <span className="font-bold text-blue-600">{fmt(totalSelected)}</span></span>
                <button onClick={toggleAll} className="text-blue-600 text-sm hover:underline">
                  {bills.every(b => b.selected) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3 w-10"><input type="checkbox" checked={bills.every(b => b.selected)} onChange={toggleAll} /></th>
                <th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Due Date</th><th className="px-4 py-3 text-right">Balance</th>
              </tr></thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id} className={`border-b border-gray-100 hover:bg-gray-50 ${b.selected ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={b.selected} onChange={() => toggleBill(b.id)} /></td>
                    <td className="px-4 py-3 font-medium">{b.supplierName}</td>
                    <td className="px-4 py-3 font-mono text-sm">{b.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{b.dueDate}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(b.balanceAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button onClick={executeRun} className="btn btn-primary px-8 py-3 text-lg" disabled={selectedBills.length === 0}>
              Execute Payment Run — {fmt(totalSelected)}
            </button>
          </div>
        </>
      ) : (
        /* History */
        <div className="card">
          <table className="w-full">
            <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Run Date</th><th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Bills</th><th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.runDate}</td>
                  <td className="px-4 py-3">{r.paymentMethod}</td>
                  <td className="px-4 py-3">{r.billCount}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(r.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
