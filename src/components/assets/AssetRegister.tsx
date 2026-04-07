import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { FixedAsset, AssetCategory, AssetStatus, DepreciationMethod } from '../../types';

const MOCK_CATEGORIES: AssetCategory[] = [
  { id: 'ac_1', name: 'Buildings', depreciationMethod: DepreciationMethod.STRAIGHT_LINE, defaultUsefulLifeMonths: 480, defaultResidualPercentage: 5, active: true },
  { id: 'ac_2', name: 'Motor Vehicles', depreciationMethod: DepreciationMethod.REDUCING_BALANCE, defaultUsefulLifeMonths: 60, defaultResidualPercentage: 10, active: true },
  { id: 'ac_3', name: 'Furniture & Fittings', depreciationMethod: DepreciationMethod.STRAIGHT_LINE, defaultUsefulLifeMonths: 96, defaultResidualPercentage: 0, active: true },
  { id: 'ac_4', name: 'Computers & Equipment', depreciationMethod: DepreciationMethod.STRAIGHT_LINE, defaultUsefulLifeMonths: 48, defaultResidualPercentage: 5, active: true },
  { id: 'ac_5', name: 'Laboratory Equipment', depreciationMethod: DepreciationMethod.STRAIGHT_LINE, defaultUsefulLifeMonths: 120, defaultResidualPercentage: 0, active: true },
];

const MOCK_ASSETS: FixedAsset[] = [
  { id: 'fa_1', categoryId: 'ac_1', description: 'Admin Block', assetNumber: 'BLD-001', acquisitionDate: '2020-01-15', acquisitionCost: 15000000, accumulatedDepreciation: 1875000, netBookValue: 13125000, residualValue: 500000, usefulLifeMonths: 480, depreciationMethod: DepreciationMethod.STRAIGHT_LINE, status: AssetStatus.ACTIVE, location: 'Main Campus', createdBy: 'usr_1', createdAt: '2020-01-15' },
  { id: 'fa_2', categoryId: 'ac_2', description: 'School Bus – 51 Seater', assetNumber: 'VEH-001', acquisitionDate: '2023-03-01', acquisitionCost: 8500000, accumulatedDepreciation: 4781250, netBookValue: 3718750, residualValue: 1000000, usefulLifeMonths: 60, depreciationMethod: DepreciationMethod.REDUCING_BALANCE, status: AssetStatus.ACTIVE, location: 'Parking Lot', createdBy: 'usr_1', createdAt: '2023-03-01' },
  { id: 'fa_3', categoryId: 'ac_3', description: 'Classroom Desks (100 units)', assetNumber: 'FUR-001', acquisitionDate: '2022-06-01', acquisitionCost: 1200000, accumulatedDepreciation: 525000, netBookValue: 675000, residualValue: 0, usefulLifeMonths: 96, depreciationMethod: DepreciationMethod.STRAIGHT_LINE, status: AssetStatus.ACTIVE, location: 'Block A', createdBy: 'usr_1', createdAt: '2022-06-01' },
  { id: 'fa_4', categoryId: 'ac_4', description: 'ICT Lab Computers (30)', assetNumber: 'CMP-001', acquisitionDate: '2024-01-10', acquisitionCost: 2400000, accumulatedDepreciation: 1200000, netBookValue: 1200000, residualValue: 100000, usefulLifeMonths: 48, depreciationMethod: DepreciationMethod.STRAIGHT_LINE, status: AssetStatus.ACTIVE, location: 'ICT Lab', createdBy: 'usr_1', createdAt: '2024-01-10' },
  { id: 'fa_5', categoryId: 'ac_4', description: 'Old Projectors (5)', assetNumber: 'CMP-002', acquisitionDate: '2019-08-01', acquisitionCost: 750000, accumulatedDepreciation: 750000, netBookValue: 0, residualValue: 0, usefulLifeMonths: 48, depreciationMethod: DepreciationMethod.STRAIGHT_LINE, status: AssetStatus.DISPOSED, location: 'Disposed', createdBy: 'usr_1', createdAt: '2019-08-01' },
];

export function AssetRegister() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [assets, setAssets] = useState<FixedAsset[]>(MOCK_ASSETS);
  const [categories] = useState<AssetCategory[]>(MOCK_CATEGORIES);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | AssetStatus>('all');
  const [form, setForm] = useState({ description: '', categoryId: '', assetNumber: '', acquisitionDate: '', acquisitionCost: 0, residualValue: 0, location: '' });

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
  const filtered = filter === 'all' ? assets : assets.filter(a => a.status === filter);

  const totalCost = assets.filter(a => a.status === AssetStatus.ACTIVE).reduce((s, a) => s + a.acquisitionCost, 0);
  const totalNBV = assets.filter(a => a.status === AssetStatus.ACTIVE).reduce((s, a) => s + a.netBookValue, 0);
  const totalDepr = assets.filter(a => a.status === AssetStatus.ACTIVE).reduce((s, a) => s + a.accumulatedDepreciation, 0);

  const statusBadge: Record<AssetStatus, string> = {
    [AssetStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [AssetStatus.DISPOSED]: 'bg-red-100 text-red-800',
    [AssetStatus.FULLY_DEPRECIATED]: 'bg-gray-100 text-gray-800',
    [AssetStatus.WRITTEN_OFF]: 'bg-yellow-100 text-yellow-800',
  };

  const handleAdd = () => {
    if (!form.description || !form.categoryId || !form.assetNumber) return;
    const cat = categories.find(c => c.id === form.categoryId);
    const newAsset: FixedAsset = {
      id: `fa_${Date.now()}`,
      categoryId: form.categoryId,
      description: form.description,
      assetNumber: form.assetNumber,
      acquisitionDate: form.acquisitionDate,
      acquisitionCost: form.acquisitionCost,
      accumulatedDepreciation: 0,
      netBookValue: form.acquisitionCost,
      residualValue: form.residualValue,
      usefulLifeMonths: cat?.defaultUsefulLifeMonths || 60,
      depreciationMethod: cat?.depreciationMethod || DepreciationMethod.STRAIGHT_LINE,
      status: AssetStatus.ACTIVE,
      location: form.location,
      createdBy: 'usr_1',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAssets([newAsset, ...assets]);
    setShowForm(false);
    setForm({ description: '', categoryId: '', assetNumber: '', acquisitionDate: '', acquisitionCost: 0, residualValue: 0, location: '' });
    addNotification('success', `${form.description} added to asset register`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fixed Asset Register</h2>
          <p className="text-gray-600">Track school property, equipment, and vehicles</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ Register Asset</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Cost', value: fmt(totalCost), color: 'text-blue-600' },
          { label: 'Net Book Value', value: fmt(totalNBV), color: 'text-green-600' },
          { label: 'Accumulated Depr.', value: fmt(totalDepr), color: 'text-orange-600' },
          { label: 'Active Assets', value: assets.filter(a => a.status === AssetStatus.ACTIVE).length.toString(), color: 'text-gray-800' },
        ].map(c => (
          <div key={c.label} className="card"><div className="card-body">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div></div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card"><div className="card-body space-y-4">
          <h3 className="font-semibold text-gray-800">Register New Asset</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
              <input className="input w-full" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select className="input w-full" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Code *</label>
              <input className="input w-full" value={form.assetNumber} onChange={e => setForm({ ...form, assetNumber: e.target.value })} placeholder="e.g. VEH-002" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input className="input w-full" type="date" value={form.acquisitionDate} onChange={e => setForm({ ...form, acquisitionDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost (UGX)</label>
              <input className="input w-full" type="number" value={form.acquisitionCost} onChange={e => setForm({ ...form, acquisitionCost: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salvage Value (UGX)</label>
              <input className="input w-full" type="number" value={form.residualValue} onChange={e => setForm({ ...form, residualValue: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input className="input w-full" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Main Campus" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd} className="btn btn-primary">Register Asset</button>
            <button onClick={() => setShowForm(false)} className="btn bg-gray-200 text-gray-700">Cancel</button>
          </div>
        </div></div>
      )}

      {/* Asset Table */}
      <div className="card">
        <div className="card-header border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Assets</h3>
          <div className="flex gap-2">
            {(['all', AssetStatus.ACTIVE, AssetStatus.DISPOSED, AssetStatus.FULLY_DEPRECIATED] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs rounded-full ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Code</th><th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th><th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-right">Cost</th><th className="px-4 py-3 text-right">Acc. Depr.</th>
              <th className="px-4 py-3 text-right">NBV</th><th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(a => {
                const cat = categories.find(c => c.id === a.categoryId);
                return (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{a.assetNumber}</td>
                    <td className="px-4 py-3 font-medium">{a.description}</td>
                    <td className="px-4 py-3 text-gray-600">{cat?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.location}</td>
                    <td className="px-4 py-3 text-right">{fmt(a.acquisitionCost)}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{fmt(a.accumulatedDepreciation)}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(a.netBookValue)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[a.status]}`}>{a.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Summary */}
      <div className="card"><div className="card-body">
        <h3 className="font-semibold text-gray-800 mb-4">Asset Categories & Depreciation Policies</h3>
        <table className="w-full">
          <thead><tr className="text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-4 py-2">Category</th><th className="px-4 py-2">Method</th>
            <th className="px-4 py-2">Useful Life</th><th className="px-4 py-2">Rate</th>
            <th className="px-4 py-2">Assets</th>
          </tr></thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-gray-600">{c.depreciationMethod}</td>
                <td className="px-4 py-2">{Math.round(c.defaultUsefulLifeMonths / 12)} years</td>
                <td className="px-4 py-2">{c.defaultResidualPercentage}%</td>
                <td className="px-4 py-2">{assets.filter(a => a.categoryId === c.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}
