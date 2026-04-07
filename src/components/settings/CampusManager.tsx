import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { Campus } from '../../types';

const MOCK_CAMPUSES: Campus[] = [
  { id: 'camp_1', campusName: 'Main Campus', campusCode: 'MC', address: 'Bugolobi, Kampala', phone: '+256 41 4000 100', email: 'main@mapleschool.ac.ug', isMainCampus: true, active: true, createdBy: 'usr_1', createdAt: '2020-01-01' },
  { id: 'camp_2', campusName: 'Junior School', campusCode: 'JS', address: 'Kololo, Kampala', phone: '+256 41 4000 200', email: 'junior@mapleschool.ac.ug', isMainCampus: false, active: true, createdBy: 'usr_1', createdAt: '2022-06-01' },
  { id: 'camp_3', campusName: 'Boarding Annex', campusCode: 'BA', address: 'Bugolobi, Kampala', phone: '+256 41 4000 300', email: 'boarding@mapleschool.ac.ug', isMainCampus: false, active: true, createdBy: 'usr_1', createdAt: '2023-01-15' },
];

export function CampusManager() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [campuses, setCampuses] = useState<Campus[]>(MOCK_CAMPUSES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ campusName: '', campusCode: '', address: '', phone: '', email: '' });

  const handleAdd = () => {
    if (!form.campusName || !form.campusCode) return;
    const newCampus: Campus = {
      id: `camp_${Date.now()}`,
      campusName: form.campusName,
      campusCode: form.campusCode,
      address: form.address,
      phone: form.phone,
      email: form.email,
      isMainCampus: false,
      active: true,
      createdBy: 'usr_1',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCampuses([...campuses, newCampus]);
    setForm({ campusName: '', campusCode: '', address: '', phone: '', email: '' });
    setShowForm(false);
    addNotification('success', `${form.campusName} (${form.campusCode}) created`);
  };

  const toggleActive = (id: string) => {
    setCampuses(campuses.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campus Management</h2>
          <p className="text-gray-600">Manage school campuses for multi-campus consolidation</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ Add Campus</button>
      </div>

      {showForm && (
        <div className="card"><div className="card-body space-y-4">
          <h3 className="font-semibold text-gray-800">New Campus</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input className="input w-full" value={form.campusName} onChange={e => setForm({ ...form, campusName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input className="input w-full" value={form.campusCode} onChange={e => setForm({ ...form, campusCode: e.target.value })} placeholder="e.g. MC, JS" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input w-full" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="input w-full" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input className="input w-full" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd} className="btn btn-primary">Save Campus</button>
            <button onClick={() => setShowForm(false)} className="btn bg-gray-200 text-gray-700">Cancel</button>
          </div>
        </div></div>
      )}

      {/* Campus Cards */}
      <div className="grid grid-cols-3 gap-4">
        {campuses.map(c => (
          <div key={c.id} className={`card ${!c.active ? 'opacity-60' : ''}`}>
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏫</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{c.campusName}</h4>
                    <span className="font-mono text-xs text-gray-500">{c.campusCode}</span>
                  </div>
                </div>
                <button onClick={() => toggleActive(c.id)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {c.active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📍 {c.address}</p>
                <p>📞 {c.phone}</p>
                <p>✉️ {c.email}</p>
              </div>
              <p className="text-xs text-gray-400 mt-3">Since {c.createdAt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
