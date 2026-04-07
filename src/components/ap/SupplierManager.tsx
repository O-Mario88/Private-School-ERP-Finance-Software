import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { Supplier, SupplierStatus } from '../../types';

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup_1', supplierName: 'MK Publishers Ltd', email: 'accounts@mkpublishers.co.ug', phone: '+256 722 111 222', address: 'Jinja Rd, Kampala', tin: 'P051234567A', paymentTermsDays: 30, status: SupplierStatus.ACTIVE, createdBy: 'usr_1', createdAt: '2024-06-01' },
  { id: 'sup_2', supplierName: 'Uniform House', email: 'sales@uniformhouse.co.ug', phone: '+256 733 222 333', address: 'Kampala Rd, Kampala', tin: 'P051234568B', paymentTermsDays: 30, status: SupplierStatus.ACTIVE, createdBy: 'usr_1', createdAt: '2024-07-15' },
  { id: 'sup_3', supplierName: 'UMEME', email: 'billing@umeme.co.ug', phone: '+256 20 3201 000', address: 'UMEME House, Kampala', tin: 'P000111222C', paymentTermsDays: 30, status: SupplierStatus.ACTIVE, createdBy: 'usr_1', createdAt: '2024-01-01' },
  { id: 'sup_4', supplierName: 'MTN Uganda', email: 'enterprise@mtn.co.ug', phone: '+256 722 000 000', address: 'MTN Tower, Kampala', tin: 'P000333444D', paymentTermsDays: 14, status: SupplierStatus.ACTIVE, createdBy: 'usr_1', createdAt: '2024-01-01' },
  { id: 'sup_5', supplierName: 'Kampala Repairs', email: 'info@kampalarepairs.co.ug', phone: '+256 711 444 555', address: 'Kampala, Wakiso', tin: 'P051234569E', paymentTermsDays: 45, status: SupplierStatus.INACTIVE, createdBy: 'usr_1', createdAt: '2025-03-20' },
];

export function SupplierManager() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ supplierName: '', email: '', phone: '', address: '', tin: '', paymentTermsDays: 30 });

  const filtered = suppliers.filter(s =>
    s.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.supplierName || !form.email) return;
    const newSupplier: Supplier = {
      id: `sup_${Date.now()}`,
      supplierName: form.supplierName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      tin: form.tin,
      paymentTermsDays: form.paymentTermsDays,
      status: SupplierStatus.ACTIVE,
      createdBy: 'usr_1',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuppliers([newSupplier, ...suppliers]);
    setForm({ supplierName: '', email: '', phone: '', address: '', tin: '', paymentTermsDays: 30 });
    setShowForm(false);
    addNotification('success', `${form.supplierName} registered successfully`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suppliers</h2>
          <p className="text-gray-600">Manage supplier directory and payment terms</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          + Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="card"><div className="card-body space-y-4">
          <h3 className="font-semibold text-gray-800">New Supplier</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input className="input w-full" value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input className="input w-full" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="input w-full" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input className="input w-full" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TIN</label>
              <input className="input w-full" value={form.tin} onChange={e => setForm({ ...form, tin: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms (days)</label>
              <input className="input w-full" type="number" value={form.paymentTermsDays} onChange={e => setForm({ ...form, paymentTermsDays: parseInt(e.target.value) || 30 })} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd} className="btn btn-primary">Save Supplier</button>
            <button onClick={() => setShowForm(false)} className="btn bg-gray-200 text-gray-700">Cancel</button>
          </div>
        </div></div>
      )}

      <div className="card">
        <div className="card-header border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{filtered.length} Suppliers</h3>
          <input className="input w-64" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th><th className="px-4 py-3">TIN</th>
              <th className="px-4 py-3">Terms</th><th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.supplierName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                  <td className="px-4 py-3 font-mono text-sm">{s.tin}</td>
                  <td className="px-4 py-3">{s.paymentTermsDays} days</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === SupplierStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {s.status}
                    </span>
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
