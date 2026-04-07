import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { BankTransferStatus } from '../../types';

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  number: string;
  balance: number;
}

interface Transfer {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  reference: string;
  transferDate: string;
  status: BankTransferStatus;
  narration: string;
}

const ACCOUNTS: BankAccount[] = [
  { id: 'ba_1', name: 'KCB Operations', bank: 'KCB', number: '1234***890', balance: 4250000 },
  { id: 'ba_2', name: 'Centenary Fees', bank: 'Centenary', number: '5678***234', balance: 8750000 },
  { id: 'ba_3', name: 'Co-op Savings', bank: 'Co-operative', number: '9012***567', balance: 15000000 },
  { id: 'ba_4', name: 'MTN MoMo Float', bank: 'MTN Uganda', number: 'Merchant 256700', balance: 1350000 },
];

const PAST_TRANSFERS: Transfer[] = [
  { id: 'bt_1', fromAccount: 'Centenary Fees', toAccount: 'KCB Operations', amount: 2000000, reference: 'BT-2026-001', transferDate: '2026-03-25', status: BankTransferStatus.COMPLETED, narration: 'Monthly operations funding' },
  { id: 'bt_2', fromAccount: 'MTN MoMo Float', toAccount: 'Centenary Fees', amount: 1500000, reference: 'BT-2026-002', transferDate: '2026-03-20', status: BankTransferStatus.COMPLETED, narration: 'MoMo sweep to bank' },
  { id: 'bt_3', fromAccount: 'KCB Operations', toAccount: 'Co-op Savings', amount: 5000000, reference: 'BT-2026-003', transferDate: '2026-03-15', status: BankTransferStatus.COMPLETED, narration: 'Surplus to fixed deposit' },
];

export function BankTransferUI() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [transfers] = useState<Transfer[]>(PAST_TRANSFERS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fromId: '', toId: '', amount: 0, narration: '', transferDate: new Date().toISOString().split('T')[0] });

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

  const handleTransfer = () => {
    if (!form.fromId || !form.toId || form.amount <= 0) {
      addNotification('error', 'Select accounts and enter a valid amount');
      return;
    }
    if (form.fromId === form.toId) {
      addNotification('error', 'Source and destination must be different accounts');
      return;
    }
    const fromAcct = ACCOUNTS.find(a => a.id === form.fromId);
    if (fromAcct && form.amount > fromAcct.balance) {
      addNotification('error', `${fromAcct.name} balance is only ${fmt(fromAcct.balance)}`);
      return;
    }
    const from = ACCOUNTS.find(a => a.id === form.fromId);
    const to = ACCOUNTS.find(a => a.id === form.toId);
    addNotification('success', `${fmt(form.amount)} from ${from?.name} to ${to?.name}`);
    setShowForm(false);
    setForm({ fromId: '', toId: '', amount: 0, narration: '', transferDate: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bank Transfers</h2>
          <p className="text-gray-600">Inter-bank account transfers and sweeps</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ New Transfer</button>
      </div>

      {/* Account Balances */}
      <div className="grid grid-cols-4 gap-4">
        {ACCOUNTS.map(a => (
          <div key={a.id} className="card"><div className="card-body">
            <p className="text-sm text-gray-500">{a.bank}</p>
            <p className="font-medium text-gray-800">{a.name}</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{fmt(a.balance)}</p>
            <p className="text-xs text-gray-400">{a.number}</p>
          </div></div>
        ))}
      </div>

      {/* Transfer Form */}
      {showForm && (
        <div className="card"><div className="card-body space-y-4">
          <h3 className="font-semibold text-gray-800">New Transfer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Account *</label>
              <select className="input w-full" value={form.fromId} onChange={e => setForm({ ...form, fromId: e.target.value })}>
                <option value="">Select source...</option>
                {ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Account *</label>
              <select className="input w-full" value={form.toId} onChange={e => setForm({ ...form, toId: e.target.value })}>
                <option value="">Select destination...</option>
                {ACCOUNTS.filter(a => a.id !== form.fromId).map(a => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (UGX) *</label>
              <input className="input w-full" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Date</label>
              <input className="input w-full" type="date" value={form.transferDate} onChange={e => setForm({ ...form, transferDate: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Narration</label>
              <input className="input w-full" value={form.narration} onChange={e => setForm({ ...form, narration: e.target.value })} placeholder="Purpose of transfer" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleTransfer} className="btn btn-primary">Initiate Transfer</button>
            <button onClick={() => setShowForm(false)} className="btn bg-gray-200 text-gray-700">Cancel</button>
          </div>
        </div></div>
      )}

      {/* Transfer History */}
      <div className="card">
        <div className="card-header border-b border-gray-200">
          <h3 className="text-lg font-semibold">Transfer History</h3>
        </div>
        <table className="w-full">
          <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-4 py-3">Reference</th><th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">From</th><th className="px-4 py-3">To</th>
            <th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Narration</th>
            <th className="px-4 py-3">Status</th>
          </tr></thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{t.reference}</td>
                <td className="px-4 py-3">{t.transferDate}</td>
                <td className="px-4 py-3">{t.fromAccount}</td>
                <td className="px-4 py-3">{t.toAccount}</td>
                <td className="px-4 py-3 text-right font-medium">{fmt(t.amount)}</td>
                <td className="px-4 py-3 text-gray-600 text-sm">{t.narration}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    t.status === BankTransferStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                    t.status === BankTransferStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
