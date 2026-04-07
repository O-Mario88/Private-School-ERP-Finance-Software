/**
 * Transport Manager Component
 * Define routes, manage stops, assign students, and view transport billing
 */

import React, { useState } from 'react';
import { useUIStore } from '../../store';
import type { TransportRoute, StudentTransportAssignment } from '../../types';

const MOCK_ROUTES: TransportRoute[] = [
  { id: 'rt_1', routeName: 'Ntinda - Bukoto - Kololo', costPerMonth: 150000, pickupPoints: ['Ntinda', 'Bukoto', 'Kamwokya', 'Kololo'], driverName: 'Robert Ssempijja', vehicleRegistration: 'UAX 123A', active: true, createdBy: 'admin', createdAt: '2026-01-15' },
  { id: 'rt_2', routeName: 'Naalya - Kira - Kampala', costPerMonth: 120000, pickupPoints: ['Naalya', 'Kira', 'Nalya', 'Wandegeya'], driverName: 'Sarah Namulondo', vehicleRegistration: 'UAY 456B', active: true, createdBy: 'admin', createdAt: '2026-01-15' },
  { id: 'rt_3', routeName: 'Entebbe Road Express', costPerMonth: 130000, pickupPoints: ['Kajjansi', 'Abayita Ababiri', 'Zana'], driverName: 'Joseph Mugisha', vehicleRegistration: 'UAZ 789C', active: false, createdBy: 'admin', createdAt: '2026-02-01' },
];

const MOCK_ASSIGNMENTS: StudentTransportAssignment[] = [
  { id: 'ta_1', studentId: '1', routeId: 'rt_1', term: 'Term 1 2026', active: true, assignedDate: '2026-01-20', assignedBy: 'admin' },
  { id: 'ta_2', studentId: '3', routeId: 'rt_2', term: 'Term 1 2026', active: true, assignedDate: '2026-01-20', assignedBy: 'admin' },
];

export const TransportManager: React.FC = () => {
  const addNotification = useUIStore((state) => state.addNotification);
  const [routes, setRoutes] = useState<TransportRoute[]>(MOCK_ROUTES);
  const [assignments, setAssignments] = useState<StudentTransportAssignment[]>(MOCK_ASSIGNMENTS);
  const [tab, setTab] = useState<'routes' | 'assignments' | 'billing'>('routes');
  const [showRouteForm, setShowRouteForm] = useState(false);

  const [routeForm, setRouteForm] = useState({
    routeName: '',
    costPerMonth: 0,
    pickupPoints: '',
    driverName: '',
    vehicleRegistration: '',
  });

  const handleCreateRoute = () => {
    if (!routeForm.routeName || routeForm.costPerMonth <= 0) {
      addNotification('Route name and cost are required', 'error');
      return;
    }

    const newRoute: TransportRoute = {
      id: `rt_${Date.now()}`,
      routeName: routeForm.routeName,
      costPerMonth: routeForm.costPerMonth,
      pickupPoints: routeForm.pickupPoints.split(',').map((p) => p.trim()).filter(Boolean),
      driverName: routeForm.driverName || undefined,
      vehicleRegistration: routeForm.vehicleRegistration || undefined,
      active: true,
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
    };

    setRoutes([...routes, newRoute]);
    addNotification(`Route "${routeForm.routeName}" created`, 'success');
    setShowRouteForm(false);
    setRouteForm({ routeName: '', costPerMonth: 0, pickupPoints: '', driverName: '', vehicleRegistration: '' });
  };

  const handleToggleRoute = (routeId: string) => {
    setRoutes(routes.map((r) => (r.id === routeId ? { ...r, active: !r.active } : r)));
  };

  const handleDeleteRoute = (routeId: string) => {
    const hasAssignments = assignments.some((a) => a.routeId === routeId && a.active);
    if (hasAssignments) {
      addNotification('Cannot delete route with active assignments', 'error');
      return;
    }
    setRoutes(routes.filter((r) => r.id !== routeId));
    addNotification('Route deleted', 'success');
  };

  const activeRoutes = routes.filter((r) => r.active);
  const totalStudentsOnTransport = assignments.filter((a) => a.active).length;
  const monthlyRevenue = assignments.filter((a) => a.active).reduce((sum, a) => {
    const route = routes.find((r) => r.id === a.routeId);
    return sum + (route?.costPerMonth || 0);
  }, 0);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Transport Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage routes, student assignments, and transport billing</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Active Routes</p>
            <p className="text-2xl font-bold text-blue-600">{activeRoutes.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Students on Transport</p>
            <p className="text-2xl font-bold text-green-600">{totalStudentsOnTransport}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <p className="text-2xl font-bold text-purple-600">UGX {monthlyRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex">
          {(['routes', 'assignments', 'billing'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Routes Tab */}
        {tab === 'routes' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Transport Routes</h2>
              <button
                onClick={() => setShowRouteForm(!showRouteForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {showRouteForm ? 'Cancel' : '+ New Route'}
              </button>
            </div>

            {showRouteForm && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
                    <input type="text" value={routeForm.routeName} onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })} placeholder="e.g., Ntinda - Bukoto - Kololo" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost/Month (UGX) *</label>
                    <input type="number" value={routeForm.costPerMonth} onChange={(e) => setRouteForm({ ...routeForm, costPerMonth: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Points (comma‑separated)</label>
                    <input type="text" value={routeForm.pickupPoints} onChange={(e) => setRouteForm({ ...routeForm, pickupPoints: e.target.value })} placeholder="Point A, Point B, Point C" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                    <input type="text" value={routeForm.driverName} onChange={(e) => setRouteForm({ ...routeForm, driverName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration</label>
                    <input type="text" value={routeForm.vehicleRegistration} onChange={(e) => setRouteForm({ ...routeForm, vehicleRegistration: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button onClick={handleCreateRoute} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Create Route</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Route</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pickup Points</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cost/Month</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Driver</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Students</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => {
                    const routeStudents = assignments.filter((a) => a.routeId === route.id && a.active).length;
                    return (
                      <tr key={route.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{route.routeName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{route.pickupPoints.join(' → ')}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">UGX {route.costPerMonth.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{route.driverName || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{route.vehicleRegistration || '—'}</td>
                        <td className="px-4 py-3 text-sm text-center font-medium">{routeStudents}</td>
                        <td className="px-4 py-3 text-sm">
                          <button onClick={() => handleToggleRoute(route.id)} className={`px-2 py-1 rounded text-xs font-medium ${route.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {route.active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button onClick={() => handleDeleteRoute(route.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {tab === 'assignments' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Student Transport Assignments</h2>
            {assignments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transport assignments yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Route</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Term</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monthly Cost</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => {
                      const route = routes.find((r) => r.id === a.routeId);
                      return (
                        <tr key={a.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{a.studentId}</td>
                          <td className="px-4 py-3 text-sm">{route?.routeName || '—'}</td>
                          <td className="px-4 py-3 text-sm">{a.term}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">UGX {(route?.costPerMonth || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${a.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {a.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {tab === 'billing' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Transport Billing Summary</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">Total Monthly Billing</p>
                <p className="text-2xl font-bold text-blue-900">UGX {monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">Term Total (3 months)</p>
                <p className="text-2xl font-bold text-green-900">UGX {(monthlyRevenue * 3).toLocaleString()}</p>
              </div>
            </div>

            <h3 className="text-md font-semibold mb-3">Revenue by Route</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Route</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Students</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Rate/Month</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monthly Total</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Term Total</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRoutes.map((route) => {
                    const count = assignments.filter((a) => a.routeId === route.id && a.active).length;
                    const monthly = count * route.costPerMonth;
                    return (
                      <tr key={route.id} className="border-b border-gray-200">
                        <td className="px-4 py-3 text-sm font-medium">{route.routeName}</td>
                        <td className="px-4 py-3 text-sm text-center">{count}</td>
                        <td className="px-4 py-3 text-sm text-right">UGX {route.costPerMonth.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">UGX {monthly.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">UGX {(monthly * 3).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportManager;
