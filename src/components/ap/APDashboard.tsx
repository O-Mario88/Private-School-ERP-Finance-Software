import React, { useState } from 'react';
import { SupplierInvoice, SupplierInvoiceStatus } from '../../types';

interface APSummary {
  totalPayable: number;
  current: number;
  overdue30: number;
  overdue60: number;
  overdue90: number;
  suppliersOwed: number;
}

interface SupplierInvoiceDisplay extends SupplierInvoice {
  supplierName: string;
}

const MOCK_BILLS: SupplierInvoiceDisplay[] = [
  { id: 'si_1', supplierId: 'sup_1', supplierName: 'Booksource Ltd', invoiceNumber: 'BS-2026-045', invoiceDate: '2026-03-10', dueDate: '2026-04-10', totalAmount: 250000, paidAmount: 0, balanceAmount: 250000, taxAmount: 40000, status: SupplierInvoiceStatus.APPROVED, createdBy: 'usr_1', createdAt: '2026-03-10' },
  { id: 'si_2', supplierId: 'sup_2', supplierName: 'Uniform House', invoiceNumber: 'UH-1234', invoiceDate: '2026-02-15', dueDate: '2026-03-15', totalAmount: 180000, paidAmount: 100000, balanceAmount: 80000, taxAmount: 28800, status: SupplierInvoiceStatus.PARTIALLY_PAID, createdBy: 'usr_1', createdAt: '2026-02-15' },
  { id: 'si_3', supplierId: 'sup_3', supplierName: 'Kenya Power', invoiceNumber: 'KPLC-MAR-26', invoiceDate: '2026-03-28', dueDate: '2026-04-28', totalAmount: 85000, paidAmount: 0, balanceAmount: 85000, taxAmount: 13600, status: SupplierInvoiceStatus.DRAFT, createdBy: 'usr_1', createdAt: '2026-03-28' },
  { id: 'si_4', supplierId: 'sup_4', supplierName: 'Safaricom PLC', invoiceNumber: 'SAF-Q1-2026', invoiceDate: '2026-01-05', dueDate: '2026-02-05', totalAmount: 45000, paidAmount: 45000, balanceAmount: 0, taxAmount: 7200, status: SupplierInvoiceStatus.PAID, createdBy: 'usr_1', createdAt: '2026-01-05' },
  { id: 'si_5', supplierId: 'sup_5', supplierName: 'Tatu City Repairs', invoiceNumber: 'TCR-0089', invoiceDate: '2026-01-20', dueDate: '2026-02-20', totalAmount: 320000, paidAmount: 0, balanceAmount: 320000, taxAmount: 51200, status: SupplierInvoiceStatus.APPROVED, createdBy: 'usr_1', createdAt: '2026-01-20' },
];

const summary: APSummary = { totalPayable: 735000, current: 335000, overdue30: 80000, overdue60: 0, overdue90: 320000, suppliersOwed: 4 };

export function APDashboard() {
  const [bills, setBills] = useState<SupplierInvoiceDisplay[]>(MOCK_BILLS);
  const [filter, setFilter] = useState<'all' | SupplierInvoiceStatus>('all');

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
  const filtered = filter === 'all' ? bills : bills.filter(b => b.status === filter);

  const statusBadge: Record<SupplierInvoiceStatus, string> = {
    [SupplierInvoiceStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [SupplierInvoiceStatus.APPROVED]: 'bg-blue-100 text-blue-800',
    [SupplierInvoiceStatus.PARTIALLY_PAID]: 'bg-yellow-100 text-yellow-800',
    [SupplierInvoiceStatus.PAID]: 'bg-green-100 text-green-800',
    [SupplierInvoiceStatus.CANCELLED]: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Accounts Payable</h2>
          <p className="text-gray-600">Supplier bills, payments, and AP aging analysis</p></div>
      </div>

      {/* AP Aging Summary */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Payable', value: fmt(summary.totalPayable), color: 'text-blue-600' },
          { label: 'Current', value: fmt(summary.current), color: 'text-green-600' },
          { label: '1-30 Days', value: fmt(summary.overdue30), color: 'text-yellow-600' },
          { label: '31-60 Days', value: fmt(summary.overdue60), color: 'text-orange-600' },
          { label: '90+ Days', value: fmt(summary.overdue90), color: 'text-red-600' },
        ].map(c => (
          <div key={c.label} className="card"><div className="card-body">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div></div>
        ))}
      </div>

      {/* AP Aging Bar */}
      <div className="card"><div className="card-body">
        <h3 className="text-sm font-medium text-gray-700 mb-2">AP Aging Distribution</h3>
        <div className="flex h-6 rounded-lg overflow-hidden">
          {[
            { pct: summary.current / summary.totalPayable * 100, color: 'bg-green-500', label: 'Current' },
            { pct: summary.overdue30 / summary.totalPayable * 100, color: 'bg-yellow-500', label: '1-30d' },
            { pct: summary.overdue60 / summary.totalPayable * 100, color: 'bg-orange-500', label: '31-60d' },
            { pct: summary.overdue90 / summary.totalPayable * 100, color: 'bg-red-500', label: '90+d' },
          ].filter(s => s.pct > 0).map(s => (
            <div key={s.label} className={`${s.color} flex items-center justify-center text-white text-xs font-medium`} style={{ width: `${s.pct}%` }}>
              {s.pct > 10 ? `${s.label} ${s.pct.toFixed(0)}%` : ''}
            </div>
          ))}
        </div>
      </div></div>

      {/* Bills Table */}
      <div className="card">
        <div className="card-header border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Supplier Bills</h3>
          <div className="flex gap-2">
            {(['all', SupplierInvoiceStatus.DRAFT, SupplierInvoiceStatus.APPROVED, SupplierInvoiceStatus.PARTIALLY_PAID, SupplierInvoiceStatus.PAID] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs rounded-full ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Date</th><th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(bill => (
                <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{bill.supplierName}</td>
                  <td className="px-4 py-3 text-sm font-mono">{bill.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{bill.invoiceDate}</td>
                  <td className="px-4 py-3 text-gray-600">{bill.dueDate}</td>
                  <td className="px-4 py-3 text-right">{fmt(bill.totalAmount)}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(bill.balanceAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[bill.status]}`}>{bill.status}</span>
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
