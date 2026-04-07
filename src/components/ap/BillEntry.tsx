import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { SupplierInvoiceStatus } from '../../types';

interface BillLineItem {
  description: string;
  accountCode: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export function BillEntry() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [header, setHeader] = useState({
    supplierId: '',
    supplierName: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    reference: '',
  });
  const [lines, setLines] = useState<BillLineItem[]>([
    { description: '', accountCode: '', quantity: 1, unitPrice: 0, taxRate: 16, amount: 0 },
  ]);

  const suppliers = [
    { id: 'sup_1', name: 'Booksource Ltd' },
    { id: 'sup_2', name: 'Uniform House' },
    { id: 'sup_3', name: 'Kenya Power' },
    { id: 'sup_4', name: 'Safaricom PLC' },
    { id: 'sup_5', name: 'Tatu City Repairs' },
  ];

  const glAccounts = [
    { code: '5100', name: 'Textbooks & Materials' },
    { code: '5200', name: 'Uniforms' },
    { code: '5300', name: 'Utilities' },
    { code: '5400', name: 'Telecommunications' },
    { code: '5500', name: 'Repairs & Maintenance' },
    { code: '5600', name: 'Office Supplies' },
    { code: '5700', name: 'Cleaning Supplies' },
  ];

  const updateLine = (idx: number, field: keyof BillLineItem, value: string | number) => {
    const updated = [...lines];
    (updated[idx] as unknown as Record<string, string | number>)[field] = value;
    updated[idx].amount = updated[idx].quantity * updated[idx].unitPrice;
    setLines(updated);
  };

  const addLine = () => setLines([...lines, { description: '', accountCode: '', quantity: 1, unitPrice: 0, taxRate: 16, amount: 0 }]);
  const removeLine = (idx: number) => { if (lines.length > 1) setLines(lines.filter((_, i) => i !== idx)); };

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const totalTax = lines.reduce((s, l) => s + (l.amount * l.taxRate / 100), 0);
  const total = subtotal + totalTax;

  const handleSave = (status: SupplierInvoiceStatus) => {
    if (!header.supplierId || !header.invoiceNumber) {
      addNotification('error', 'Supplier and invoice number are required');
      return;
    }
    if (lines.some(l => !l.description || !l.accountCode || l.amount <= 0)) {
      addNotification('error', 'All line items must have description, GL account, and a positive amount');
      return;
    }
    addNotification('success', `Invoice ${header.invoiceNumber} saved as ${status}`);
  };

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Enter Supplier Bill</h2>
        <p className="text-gray-600">Record a new supplier invoice with GL coding</p>
      </div>

      {/* Header */}
      <div className="card"><div className="card-body space-y-4">
        <h3 className="font-semibold text-gray-800">Invoice Details</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select className="input w-full" value={header.supplierId} onChange={e => {
              const sup = suppliers.find(s => s.id === e.target.value);
              setHeader({ ...header, supplierId: e.target.value, supplierName: sup?.name || '' });
            }}>
              <option value="">Select supplier...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
            <input className="input w-full" value={header.invoiceNumber} onChange={e => setHeader({ ...header, invoiceNumber: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input className="input w-full" value={header.reference} onChange={e => setHeader({ ...header, reference: e.target.value })} placeholder="PO/LPO number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <input className="input w-full" type="date" value={header.invoiceDate} onChange={e => setHeader({ ...header, invoiceDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input className="input w-full" type="date" value={header.dueDate} onChange={e => setHeader({ ...header, dueDate: e.target.value })} />
          </div>
        </div>
      </div></div>

      {/* Line Items */}
      <div className="card"><div className="card-body space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Line Items</h3>
          <button onClick={addLine} className="text-blue-600 text-sm hover:underline">+ Add Line</button>
        </div>
        <table className="w-full">
          <thead><tr className="text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-2 py-2">Description</th>
            <th className="px-2 py-2">GL Account</th>
            <th className="px-2 py-2 w-20">Qty</th>
            <th className="px-2 py-2 w-28">Unit Price</th>
            <th className="px-2 py-2 w-20">Tax %</th>
            <th className="px-2 py-2 w-28 text-right">Amount</th>
            <th className="px-2 py-2 w-10"></th>
          </tr></thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="px-2 py-2">
                  <input className="input w-full" value={line.description} onChange={e => updateLine(idx, 'description', e.target.value)} placeholder="Item description" />
                </td>
                <td className="px-2 py-2">
                  <select className="input w-full" value={line.accountCode} onChange={e => updateLine(idx, 'accountCode', e.target.value)}>
                    <option value="">Select...</option>
                    {glAccounts.map(a => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <input className="input w-full text-right" type="number" value={line.quantity} onChange={e => updateLine(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                </td>
                <td className="px-2 py-2">
                  <input className="input w-full text-right" type="number" value={line.unitPrice} onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)} />
                </td>
                <td className="px-2 py-2">
                  <input className="input w-full text-right" type="number" value={line.taxRate} onChange={e => updateLine(idx, 'taxRate', parseFloat(e.target.value) || 0)} />
                </td>
                <td className="px-2 py-2 text-right font-medium">{fmt(line.amount)}</td>
                <td className="px-2 py-2">
                  <button onClick={() => removeLine(idx)} className="text-red-500 hover:text-red-700 text-sm">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">VAT</span><span>{fmt(totalTax)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-1"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
        </div>
      </div></div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => handleSave(SupplierInvoiceStatus.DRAFT)} className="btn bg-gray-200 text-gray-700">Save as Draft</button>
        <button onClick={() => handleSave(SupplierInvoiceStatus.APPROVED)} className="btn btn-primary">Save & Approve</button>
      </div>
    </div>
  );
}
