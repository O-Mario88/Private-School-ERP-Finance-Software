/**
 * Inventory Manager Component
 * Stock management, allocations, and inventory-linked charging
 */

import React, { useState } from 'react';
import { useUIStore } from '../../store';
import type { InventoryItem, InventoryAllocation } from '../../types';

const MOCK_ITEMS: InventoryItem[] = [
  { id: 'inv_1', itemName: 'School Uniform (Shirt)', itemType: 'uniform', unitCost: 25000, quantityOnHand: 150, reorderLevel: 30, supplierName: 'Nytil Uganda Ltd', active: true, createdBy: 'admin', createdAt: '2026-01-10' },
  { id: 'inv_2', itemName: 'School Uniform (Trousers)', itemType: 'uniform', unitCost: 30000, quantityOnHand: 120, reorderLevel: 25, supplierName: 'Nytil Uganda Ltd', active: true, createdBy: 'admin', createdAt: '2026-01-10' },
  { id: 'inv_3', itemName: 'Mathematics Textbook S1', itemType: 'book', unitCost: 18000, quantityOnHand: 45, reorderLevel: 20, supplierName: 'Fountain Publishers', active: true, createdBy: 'admin', createdAt: '2026-01-10' },
  { id: 'inv_4', itemName: 'Exercise Book (48 pages)', itemType: 'stationery', unitCost: 1500, quantityOnHand: 500, reorderLevel: 100, supplierName: 'Mukwano Stationery', active: true, createdBy: 'admin', createdAt: '2026-01-10' },
  { id: 'inv_5', itemName: 'Science Lab Kit', itemType: 'other', unitCost: 50000, quantityOnHand: 8, reorderLevel: 5, supplierName: 'Lab Supplies EA', active: true, createdBy: 'admin', createdAt: '2026-02-01' },
];

const MOCK_ALLOCATIONS: InventoryAllocation[] = [
  { id: 'al_1', inventoryItemId: 'inv_1', classId: 'S1', term: 'Term I 2026', quantity: 2, unitCost: 25000, createdBy: 'admin', createdAt: '2026-01-15' },
  { id: 'al_2', inventoryItemId: 'inv_3', classId: 'S3', term: 'Term I 2026', quantity: 1, unitCost: 18000, createdBy: 'admin', createdAt: '2026-01-15' },
  { id: 'al_3', inventoryItemId: 'inv_4', classId: undefined, term: 'Term I 2026', quantity: 10, unitCost: 1500, createdBy: 'admin', createdAt: '2026-01-15' },
];

export const InventoryManager: React.FC = () => {
  const addNotification = useUIStore((state) => state.addNotification);
  const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [allocations, setAllocations] = useState<InventoryAllocation[]>(MOCK_ALLOCATIONS);
  const [tab, setTab] = useState<'stock' | 'allocations' | 'alerts'>('stock');
  const [showItemForm, setShowItemForm] = useState(false);
  const [showAllocForm, setShowAllocForm] = useState(false);

  const [itemForm, setItemForm] = useState({
    itemName: '',
    itemType: 'uniform' as InventoryItem['itemType'],
    unitCost: 0,
    quantityOnHand: 0,
    reorderLevel: 0,
    supplierName: '',
  });

  const [allocForm, setAllocForm] = useState({
    inventoryItemId: '',
    classId: '',
    term: '',
    quantity: 1,
  });

  const handleCreateItem = () => {
    if (!itemForm.itemName || itemForm.unitCost <= 0) {
      addNotification('Item name and cost are required', 'error');
      return;
    }

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      itemName: itemForm.itemName,
      itemType: itemForm.itemType,
      unitCost: itemForm.unitCost,
      quantityOnHand: itemForm.quantityOnHand,
      reorderLevel: itemForm.reorderLevel || undefined,
      supplierName: itemForm.supplierName || undefined,
      active: true,
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
    };

    setItems([...items, newItem]);
    addNotification(`Item "${itemForm.itemName}" added`, 'success');
    setShowItemForm(false);
    setItemForm({ itemName: '', itemType: 'uniform', unitCost: 0, quantityOnHand: 0, reorderLevel: 0, supplierName: '' });
  };

  const handleCreateAllocation = () => {
    if (!allocForm.inventoryItemId || !allocForm.term || allocForm.quantity <= 0) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    const item = items.find((i) => i.id === allocForm.inventoryItemId);
    if (!item) return;

    const newAlloc: InventoryAllocation = {
      id: `al_${Date.now()}`,
      inventoryItemId: allocForm.inventoryItemId,
      classId: allocForm.classId || undefined,
      term: allocForm.term,
      quantity: allocForm.quantity,
      unitCost: item.unitCost,
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
    };

    setAllocations([...allocations, newAlloc]);
    addNotification(`Allocation created for ${item.itemName}`, 'success');
    setShowAllocForm(false);
    setAllocForm({ inventoryItemId: '', classId: '', term: '', quantity: 1 });
  };

  const lowStockItems = items.filter((item) => item.reorderLevel && item.quantityOnHand <= item.reorderLevel);
  const totalStockValue = items.reduce((sum, item) => sum + item.unitCost * item.quantityOnHand, 0);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 text-sm mt-1">Track stock, manage allocations, and charge students</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-blue-600">{items.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Stock Value</p>
            <p className="text-2xl font-bold text-green-600">UGX {totalStockValue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Active Allocations</p>
            <p className="text-2xl font-bold text-purple-600">{allocations.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Low Stock Alerts</p>
            <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{lowStockItems.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex">
          {(['stock', 'allocations', 'alerts'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'alerts' ? `Alerts (${lowStockItems.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Stock Tab */}
        {tab === 'stock' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Inventory Items</h2>
              <button onClick={() => setShowItemForm(!showItemForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                {showItemForm ? 'Cancel' : '+ New Item'}
              </button>
            </div>

            {showItemForm && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mb-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input type="text" value={itemForm.itemName} onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select value={itemForm.itemType} onChange={(e) => setItemForm({ ...itemForm, itemType: e.target.value as InventoryItem['itemType'] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="uniform">Uniform</option>
                      <option value="book">Book</option>
                      <option value="stationery">Stationery</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (UGX) *</label>
                    <input type="number" value={itemForm.unitCost} onChange={(e) => setItemForm({ ...itemForm, unitCost: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity on Hand</label>
                    <input type="number" value={itemForm.quantityOnHand} onChange={(e) => setItemForm({ ...itemForm, quantityOnHand: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                    <input type="number" value={itemForm.reorderLevel} onChange={(e) => setItemForm({ ...itemForm, reorderLevel: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input type="text" value={itemForm.supplierName} onChange={(e) => setItemForm({ ...itemForm, supplierName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button onClick={handleCreateItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Add Item</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Qty on Hand</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Reorder Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Stock Value</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isLow = item.reorderLevel && item.quantityOnHand <= item.reorderLevel;
                    return (
                      <tr key={item.id} className={`border-b border-gray-200 hover:bg-gray-50 ${isLow ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemName}</td>
                        <td className="px-4 py-3 text-sm"><span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">{item.itemType}</span></td>
                        <td className="px-4 py-3 text-sm text-right">UGX {item.unitCost.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${isLow ? 'text-red-600' : ''}`}>{item.quantityOnHand}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">{item.reorderLevel || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.supplierName || '—'}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">UGX {(item.unitCost * item.quantityOnHand).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Allocations Tab */}
        {tab === 'allocations' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Class/Term Allocations</h2>
              <button onClick={() => setShowAllocForm(!showAllocForm)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                {showAllocForm ? 'Cancel' : '+ New Allocation'}
              </button>
            </div>

            {showAllocForm && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                    <select value={allocForm.inventoryItemId} onChange={(e) => setAllocForm({ ...allocForm, inventoryItemId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Item</option>
                      {items.map((item) => (<option key={item.id} value={item.id}>{item.itemName} (UGX {item.unitCost})</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <input type="text" value={allocForm.classId} onChange={(e) => setAllocForm({ ...allocForm, classId: e.target.value })} placeholder="e.g., S1 (leave blank for all)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
                    <input type="text" value={allocForm.term} onChange={(e) => setAllocForm({ ...allocForm, term: e.target.value })} placeholder="e.g., Term 1 2026" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity per Student *</label>
                    <input type="number" min="1" value={allocForm.quantity} onChange={(e) => setAllocForm({ ...allocForm, quantity: parseInt(e.target.value) || 1 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button onClick={handleCreateAllocation} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Create Allocation</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Term</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Qty/Student</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total/Student</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((alloc) => {
                    const item = items.find((i) => i.id === alloc.inventoryItemId);
                    return (
                      <tr key={alloc.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{item?.itemName || '—'}</td>
                        <td className="px-4 py-3 text-sm">{alloc.classId || 'All Classes'}</td>
                        <td className="px-4 py-3 text-sm">{alloc.term}</td>
                        <td className="px-4 py-3 text-sm text-right">{alloc.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right">UGX {alloc.unitCost.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">UGX {(alloc.quantity * alloc.unitCost).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {tab === 'alerts' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Low Stock Alerts</h2>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-green-600">
                <p className="text-lg font-medium">All stock levels are healthy</p>
                <p className="text-sm text-gray-500 mt-1">No items below reorder level</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-red-900">{item.itemName}</p>
                      <p className="text-sm text-red-700">Current: {item.quantityOnHand} | Reorder level: {item.reorderLevel}</p>
                      <p className="text-xs text-red-600 mt-1">Supplier: {item.supplierName || 'Not specified'}</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;
