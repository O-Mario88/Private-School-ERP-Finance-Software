import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { PolicyRule, PolicyCategory, PolicyAction } from '../../types';

const MOCK_POLICIES: PolicyRule[] = [
  { id: 'pol_1', ruleName: 'Block Large Expenses', category: PolicyCategory.SPENDING, conditionField: 'amount', conditionOperator: '>', conditionValue: 500000, action: PolicyAction.BLOCK, active: true, createdBy: 'usr_1', createdAt: '2025-01-01' },
  { id: 'pol_2', ruleName: 'Approve Medium Expenses', category: PolicyCategory.APPROVAL, conditionField: 'amount', conditionOperator: '>', conditionValue: 100000, action: PolicyAction.REQUIRE_APPROVAL, requiredRole: 'director', active: true, createdBy: 'usr_1', createdAt: '2025-01-01' },
  { id: 'pol_3', ruleName: 'Budget Overspend Warning', category: PolicyCategory.BUDGET, conditionField: 'variance_pct', conditionOperator: '>', conditionValue: 90, action: PolicyAction.WARN, active: true, createdBy: 'usr_1', createdAt: '2025-06-01' },
  { id: 'pol_4', ruleName: 'Budget Overspend Block', category: PolicyCategory.BUDGET, conditionField: 'variance_pct', conditionOperator: '>', conditionValue: 110, action: PolicyAction.BLOCK, active: true, createdBy: 'usr_1', createdAt: '2025-06-01' },
  { id: 'pol_5', ruleName: 'Auto-Approve Small POs', category: PolicyCategory.SPENDING, conditionField: 'amount', conditionOperator: '<', conditionValue: 10000, action: PolicyAction.AUTO_APPROVE, active: true, createdBy: 'usr_1', createdAt: '2025-01-01' },
  { id: 'pol_6', ruleName: 'Payroll Overtime Cap', category: PolicyCategory.PAYROLL, conditionField: 'overtime_hours', conditionOperator: '>', conditionValue: 40, action: PolicyAction.WARN, active: true, createdBy: 'usr_1', createdAt: '2025-03-01' },
  { id: 'pol_7', ruleName: 'General Audit Flag', category: PolicyCategory.GENERAL, conditionField: 'transaction_count', conditionOperator: '>=', conditionValue: 50, action: PolicyAction.WARN, active: false, createdBy: 'usr_1', createdAt: '2025-03-01' },
];

export function PolicyEngine() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [policies, setPolicies] = useState<PolicyRule[]>(MOCK_POLICIES);
  const [filterCategory, setFilterCategory] = useState<'all' | PolicyCategory>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ruleName: '', category: PolicyCategory.SPENDING as PolicyCategory,
    conditionField: '', conditionOperator: '>' as PolicyRule['conditionOperator'],
    conditionValue: 0, action: PolicyAction.WARN as PolicyAction,
  });

  const filtered = filterCategory === 'all' ? policies : policies.filter(p => p.category === filterCategory);

  const togglePolicy = (id: string) => {
    setPolicies(policies.map(p => {
      if (p.id !== id) return p;
      const toggled = !p.active;
      addNotification('info', `${p.ruleName} ${toggled ? 'activated' : 'deactivated'}`);
      return { ...p, active: toggled };
    }));
  };

  const handleAdd = () => {
    if (!form.ruleName || !form.conditionField) return;
    const newPolicy: PolicyRule = {
      id: `pol_${Date.now()}`,
      ruleName: form.ruleName,
      category: form.category,
      conditionField: form.conditionField,
      conditionOperator: form.conditionOperator,
      conditionValue: form.conditionValue,
      action: form.action,
      active: true,
      createdBy: 'usr_1',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPolicies([...policies, newPolicy]);
    setShowForm(false);
    setForm({ ruleName: '', category: PolicyCategory.SPENDING, conditionField: '', conditionOperator: '>', conditionValue: 0, action: PolicyAction.WARN });
    addNotification('success', `${form.ruleName} is now active`);
  };

  const actionIcon: Record<PolicyAction, string> = {
    [PolicyAction.REQUIRE_APPROVAL]: '✅',
    [PolicyAction.BLOCK]: '🚫',
    [PolicyAction.WARN]: '🔔',
    [PolicyAction.AUTO_APPROVE]: '⚙️',
  };

  const categoryColor: Record<PolicyCategory, string> = {
    [PolicyCategory.SPENDING]: 'bg-blue-100 text-blue-800',
    [PolicyCategory.APPROVAL]: 'bg-orange-100 text-orange-800',
    [PolicyCategory.PAYROLL]: 'bg-green-100 text-green-800',
    [PolicyCategory.BUDGET]: 'bg-purple-100 text-purple-800',
    [PolicyCategory.GENERAL]: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Policy Engine</h2>
          <p className="text-gray-600">Configure business rules and automated actions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ New Policy</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Total Policies</p>
          <p className="text-2xl font-bold text-gray-800">{policies.length}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{policies.filter(p => p.active).length}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-400">{policies.filter(p => !p.active).length}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-blue-600">{new Set(policies.map(p => p.category)).size}</p>
        </div></div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card"><div className="card-body space-y-4">
          <h3 className="font-semibold text-gray-800">New Policy Rule</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
              <input className="input w-full" value={form.ruleName} onChange={e => setForm({ ...form, ruleName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input w-full" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as PolicyCategory })}>
                {Object.values(PolicyCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select className="input w-full" value={form.action} onChange={e => setForm({ ...form, action: e.target.value as PolicyAction })}>
                {Object.values(PolicyAction).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition Field *</label>
              <input className="input w-full" value={form.conditionField} onChange={e => setForm({ ...form, conditionField: e.target.value })} placeholder="e.g. amount, variance_pct" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
              <select className="input w-full" value={form.conditionOperator} onChange={e => setForm({ ...form, conditionOperator: e.target.value as PolicyRule['conditionOperator'] })}>
                {['>', '<', '>=', '<=', '=', '!='].map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input className="input w-full" type="number" value={form.conditionValue} onChange={e => setForm({ ...form, conditionValue: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd} className="btn btn-primary">Create Policy</button>
            <button onClick={() => setShowForm(false)} className="btn bg-gray-200 text-gray-700">Cancel</button>
          </div>
        </div></div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2">
        {(['all', ...Object.values(PolicyCategory)] as const).map(c => (
          <button key={c} onClick={() => setFilterCategory(c)}
            className={`px-3 py-1 text-xs rounded-full ${filterCategory === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {/* Policy Cards */}
      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className={`card ${!p.active ? 'opacity-60' : ''}`}>
            <div className="card-body flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{actionIcon[p.action]}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{p.ruleName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor[p.category]}`}>{p.category}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Condition: <code className="bg-gray-100 px-1 rounded">{p.conditionField} {p.conditionOperator} {p.conditionValue}</code></span>
                    <span>Action: {p.action}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => togglePolicy(p.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${p.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${p.active ? 'left-6' : 'left-0.5'}`}></span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
