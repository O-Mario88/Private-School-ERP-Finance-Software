import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { DepreciationEntry, DepreciationMethod } from '../../types';

interface AssetForDepreciation {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  method: DepreciationMethod;
  purchaseCost: number;
  salvageValue: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  monthlyCharge: number;
}

const ASSETS: AssetForDepreciation[] = [
  { id: 'fa_1', assetCode: 'BLD-001', name: 'Admin Block', category: 'Buildings', method: DepreciationMethod.STRAIGHT_LINE, purchaseCost: 15000000, salvageValue: 500000, accumulatedDepreciation: 1875000, netBookValue: 13125000, monthlyCharge: 30208 },
  { id: 'fa_2', assetCode: 'VEH-001', name: 'School Bus – 51 Seater', category: 'Motor Vehicles', method: DepreciationMethod.REDUCING_BALANCE, purchaseCost: 8500000, salvageValue: 1000000, accumulatedDepreciation: 4781250, netBookValue: 3718750, monthlyCharge: 77474 },
  { id: 'fa_3', assetCode: 'FUR-001', name: 'Classroom Desks (100 units)', category: 'Furniture', method: DepreciationMethod.STRAIGHT_LINE, purchaseCost: 1200000, salvageValue: 0, accumulatedDepreciation: 525000, netBookValue: 675000, monthlyCharge: 12500 },
  { id: 'fa_4', assetCode: 'CMP-001', name: 'ICT Lab Computers (30)', category: 'Computers', method: DepreciationMethod.STRAIGHT_LINE, purchaseCost: 2400000, salvageValue: 100000, accumulatedDepreciation: 1200000, netBookValue: 1200000, monthlyCharge: 47917 },
];

const SCHEDULE: DepreciationEntry[] = [
  { id: 'de_1', assetId: 'fa_1', period: '2026-01', depreciationAmount: 30208, accumulatedDepreciation: 1814792, netBookValue: 13185208, postedDate: '2026-01-31' },
  { id: 'de_2', assetId: 'fa_1', period: '2026-02', depreciationAmount: 30208, accumulatedDepreciation: 1845000, netBookValue: 13155000, postedDate: '2026-02-28' },
  { id: 'de_3', assetId: 'fa_1', period: '2026-03', depreciationAmount: 30208, accumulatedDepreciation: 1875208, netBookValue: 13124792, postedDate: '2026-03-31' },
  { id: 'de_4', assetId: 'fa_2', period: '2026-01', depreciationAmount: 77474, accumulatedDepreciation: 4626302, netBookValue: 3873698, postedDate: '2026-01-31' },
  { id: 'de_5', assetId: 'fa_2', period: '2026-02', depreciationAmount: 77474, accumulatedDepreciation: 4703776, netBookValue: 3796224, postedDate: '2026-02-28' },
  { id: 'de_6', assetId: 'fa_2', period: '2026-03', depreciationAmount: 77474, accumulatedDepreciation: 4781250, netBookValue: 3718750, postedDate: '2026-03-31' },
];

export function DepreciationRunner() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [assets] = useState<AssetForDepreciation[]>(ASSETS);
  const [schedule] = useState<DepreciationEntry[]>(SCHEDULE);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [runPeriod, setRunPeriod] = useState('2026-04');
  const [view, setView] = useState<'run' | 'schedule'>('run');

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
  const totalMonthly = assets.reduce((s, a) => s + a.monthlyCharge, 0);

  const runDepreciation = () => {
    addNotification('success', `${runPeriod} depreciation of ${fmt(totalMonthly)} posted for ${assets.length} assets`);
  };

  const assetSchedule = selectedAsset ? schedule.filter(s => s.assetId === selectedAsset) : schedule;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Depreciation</h2>
          <p className="text-gray-600">Run monthly depreciation and view schedules</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('run')} className={`btn ${view === 'run' ? 'btn-primary' : 'bg-gray-200 text-gray-700'}`}>Run Depreciation</button>
          <button onClick={() => setView('schedule')} className={`btn ${view === 'schedule' ? 'btn-primary' : 'bg-gray-200 text-gray-700'}`}>Schedule</button>
        </div>
      </div>

      {view === 'run' ? (
        <>
          {/* Run Controls */}
          <div className="card"><div className="card-body">
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <input className="input" type="month" value={runPeriod} onChange={e => setRunPeriod(e.target.value)} />
              </div>
              <div className="text-sm text-gray-500">
                Total monthly charge: <span className="font-bold text-blue-600">{fmt(totalMonthly)}</span> across {assets.length} assets
              </div>
              <button onClick={runDepreciation} className="btn btn-primary ml-auto">
                Post Depreciation — {runPeriod}
              </button>
            </div>
          </div></div>

          {/* Depreciation Preview */}
          <div className="card">
            <div className="card-header border-b border-gray-200">
              <h3 className="text-lg font-semibold">Depreciation Preview</h3>
            </div>
            <table className="w-full">
              <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Code</th><th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Method</th><th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Acc. Depr.</th><th className="px-4 py-3 text-right">NBV</th>
                <th className="px-4 py-3 text-right">Monthly Charge</th>
              </tr></thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{a.assetCode}</td>
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{a.method}</td>
                    <td className="px-4 py-3 text-right">{fmt(a.purchaseCost)}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{fmt(a.accumulatedDepreciation)}</td>
                    <td className="px-4 py-3 text-right">{fmt(a.netBookValue)}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">{fmt(a.monthlyCharge)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-4 py-3" colSpan={6}>Total</td>
                  <td className="px-4 py-3 text-right text-blue-600">{fmt(totalMonthly)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Schedule View */
        <div className="card">
          <div className="card-header border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Depreciation Schedule</h3>
            <select className="input w-64" value={selectedAsset || ''} onChange={e => setSelectedAsset(e.target.value || null)}>
              <option value="">All Assets</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.assetCode} – {a.name}</option>)}
            </select>
          </div>
          <table className="w-full">
            <thead><tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Period</th><th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3 text-right">Depreciation</th>
              <th className="px-4 py-3 text-right">Accumulated</th>
              <th className="px-4 py-3 text-right">NBV</th>
              <th className="px-4 py-3">Posted</th>
            </tr></thead>
            <tbody>
              {assetSchedule.map(e => {
                const asset = assets.find(a => a.id === e.assetId);
                return (
                  <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{e.period}</td>
                    <td className="px-4 py-3 text-gray-600">{asset?.assetCode} – {asset?.name}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{fmt(e.depreciationAmount)}</td>
                    <td className="px-4 py-3 text-right">{fmt(e.accumulatedDepreciation)}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(e.netBookValue)}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{e.postedDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
