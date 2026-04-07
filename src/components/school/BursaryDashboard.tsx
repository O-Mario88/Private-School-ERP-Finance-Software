/**
 * Bursary Dashboard Component
 * Request submission, approval workflow, and spend tracking
 */

import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { BursaryStatus } from '../../types';
import type { BursaryRequest, BursaryApproval } from '../../types';

interface BursaryRequestDisplay extends BursaryRequest {
  studentName: string;
  className: string;
  approvedAmount?: number;
}

const MOCK_REQUESTS: BursaryRequestDisplay[] = [
  { id: 'bur_1', studentId: 'stu_1', studentName: 'Aisha Namutebi', className: 'S2A', amountRequested: 250000, approvedAmount: 200000, justification: 'Financial hardship - single parent household', status: BursaryStatus.APPROVED, requestDate: '2026-01-10', createdBy: 'parent' },
  { id: 'bur_2', studentId: 'stu_2', studentName: 'Brian Mugisha', className: 'S3B', amountRequested: 150000, justification: 'Orphaned student, guardian has low income', status: BursaryStatus.SUBMITTED, requestDate: '2026-01-15', createdBy: 'teacher' },
  { id: 'bur_3', studentId: 'stu_3', studentName: 'Catherine Nalubega', className: 'S1C', amountRequested: 300000, justification: 'Family affected by floods', status: BursaryStatus.SUBMITTED, requestDate: '2026-01-18', createdBy: 'admin' },
  { id: 'bur_4', studentId: 'stu_4', studentName: 'David Kabuye', className: 'S4A', amountRequested: 100000, approvedAmount: 0, justification: 'Fee reduction request', status: BursaryStatus.REJECTED, requestDate: '2026-01-05', createdBy: 'parent' },
];

const MOCK_APPROVALS: BursaryApproval[] = [
  { id: 'apr_1', requestId: 'bur_1', approverId: 'headteacher', approvedAmount: 200000, approvalDate: '2026-01-12', notes: 'Approved with partial bursary' },
];

export const BursaryDashboard: React.FC = () => {
  const addNotification = useUIStore((state) => state.addNotification);
  const [requests, setRequests] = useState<BursaryRequestDisplay[]>(MOCK_REQUESTS);
  const [_approvals, setApprovals] = useState<BursaryApproval[]>(MOCK_APPROVALS);
  const [tab, setTab] = useState<'all' | 'submitted' | 'approved' | 'rejected' | 'new'>('all');
  const [selectedRequest, setSelectedRequest] = useState<BursaryRequestDisplay | null>(null);
  const [approvalForm, setApprovalForm] = useState({ amount: 0, notes: '' });

  const [newRequest, setNewRequest] = useState({
    studentName: '', studentId: '', className: '', amountRequested: 0, justification: '',
  });

  const filteredRequests = tab === 'all' || tab === 'new' ? requests : requests.filter((r) => {
    if (tab === 'submitted') return r.status === BursaryStatus.SUBMITTED;
    if (tab === 'approved') return r.status === BursaryStatus.APPROVED;
    return r.status === BursaryStatus.REJECTED;
  });

  const totalRequested = requests.reduce((sum, r) => sum + r.amountRequested, 0);
  const totalApproved = requests.reduce((sum, r) => sum + (r.approvedAmount || 0), 0);
  const pendingCount = requests.filter((r) => r.status === BursaryStatus.SUBMITTED).length;

  const handleApprove = (id: string) => {
    if (approvalForm.amount <= 0) { addNotification('Please enter approved amount', 'error'); return; }
    setRequests(requests.map((r) => r.id === id ? { ...r, status: BursaryStatus.APPROVED, approvedAmount: approvalForm.amount } : r));
    const newApproval: BursaryApproval = { id: `apr_${Date.now()}`, requestId: id, approverId: 'current_user', approvedAmount: approvalForm.amount, notes: approvalForm.notes, approvalDate: new Date().toISOString() };
    setApprovals((prev) => [...prev, newApproval]);
    addNotification('Bursary request approved', 'success');
    setSelectedRequest(null);
    setApprovalForm({ amount: 0, notes: '' });
  };

  const handleReject = (id: string) => {
    setRequests(requests.map((r) => r.id === id ? { ...r, status: BursaryStatus.REJECTED, approvedAmount: 0 } : r));
    const newApproval: BursaryApproval = { id: `apr_${Date.now()}`, requestId: id, approverId: 'current_user', approvedAmount: 0, notes: approvalForm.notes || 'Rejected', approvalDate: new Date().toISOString() };
    setApprovals((prev) => [...prev, newApproval]);
    addNotification('Bursary request rejected', 'info');
    setSelectedRequest(null);
    setApprovalForm({ amount: 0, notes: '' });
  };

  const handleSubmitNewRequest = () => {
    if (!newRequest.studentName || !newRequest.justification || newRequest.amountRequested <= 0) { addNotification('Please fill in all required fields', 'error'); return; }
    const req: BursaryRequestDisplay = {
      id: `bur_${Date.now()}`, studentId: newRequest.studentId || `stu_${Date.now()}`, studentName: newRequest.studentName,
      className: newRequest.className, amountRequested: newRequest.amountRequested, justification: newRequest.justification,
      status: BursaryStatus.SUBMITTED, requestDate: new Date().toISOString(), createdBy: 'admin',
    };
    setRequests([req, ...requests]);
    addNotification('Bursary request submitted', 'success');
    setTab('submitted');
    setNewRequest({ studentName: '', studentId: '', className: '', amountRequested: 0, justification: '' });
  };

  const statusBadge = (status: BursaryStatus) => {
    const colors: Record<BursaryStatus, string> = {
      [BursaryStatus.SUBMITTED]: 'bg-yellow-100 text-yellow-800',
      [BursaryStatus.APPROVED]: 'bg-green-100 text-green-800',
      [BursaryStatus.REJECTED]: 'bg-red-100 text-red-800',
      [BursaryStatus.DISBURSED]: 'bg-blue-100 text-blue-800',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>{status}</span>;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Bursary Management</h1>
          <p className="text-gray-600 text-sm mt-1">Requests, approvals, and bursary spend tracking</p>
        </div>

        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Total Requests</p><p className="text-2xl font-bold text-blue-600">{requests.length}</p></div>
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Total Requested</p><p className="text-2xl font-bold text-orange-600">UGX {totalRequested.toLocaleString()}</p></div>
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Total Approved</p><p className="text-2xl font-bold text-green-600">UGX {totalApproved.toLocaleString()}</p></div>
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Pending Review</p><p className={`text-2xl font-bold ${pendingCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{pendingCount}</p></div>
        </div>

        <div className="border-b border-gray-200 flex">
          {(['all', 'submitted', 'approved', 'rejected', 'new'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setSelectedRequest(null); }} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'new' ? '+ New Request' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'new' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Submit Bursary Request</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label><input type="text" value={newRequest.studentName} onChange={(e) => setNewRequest({ ...newRequest, studentName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Class</label><input type="text" value={newRequest.className} onChange={(e) => setNewRequest({ ...newRequest, className: e.target.value })} placeholder="e.g., S2A" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Requested Amount (UGX) *</label><input type="number" value={newRequest.amountRequested} onChange={(e) => setNewRequest({ ...newRequest, amountRequested: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Justification *</label><textarea value={newRequest.justification} onChange={(e) => setNewRequest({ ...newRequest, justification: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            </div>
            <button onClick={handleSubmitNewRequest} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Submit Request</button>
          </div>
        )}

        {tab !== 'new' && !selectedRequest && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">{tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)} Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Requested</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Approved</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{req.studentName}</td>
                      <td className="px-4 py-3 text-sm">{req.className}</td>
                      <td className="px-4 py-3 text-sm">{req.requestDate}</td>
                      <td className="px-4 py-3 text-sm text-right">UGX {req.amountRequested.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right">{req.approvedAmount != null ? `UGX ${req.approvedAmount.toLocaleString()}` : '\u2014'}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(req.status)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => { setSelectedRequest(req); setApprovalForm({ amount: req.amountRequested, notes: '' }); }} className="text-blue-600 hover:underline text-sm">
                          {req.status === BursaryStatus.SUBMITTED ? 'Review' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedRequest && (
          <div className="p-6">
            <button onClick={() => setSelectedRequest(null)} className="text-blue-600 hover:underline text-sm mb-4 block">&larr; Back to list</button>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div><h2 className="text-xl font-bold text-gray-900">{selectedRequest.studentName}</h2><p className="text-sm text-gray-600">{selectedRequest.className} &middot; {selectedRequest.requestDate}</p></div>
                {statusBadge(selectedRequest.status)}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-sm text-gray-600">Requested Amount</p><p className="text-lg font-semibold">UGX {selectedRequest.amountRequested.toLocaleString()}</p></div>
                <div><p className="text-sm text-gray-600">Approved Amount</p><p className="text-lg font-semibold">{selectedRequest.approvedAmount != null ? `UGX ${selectedRequest.approvedAmount.toLocaleString()}` : 'Pending'}</p></div>
              </div>
              <div className="mb-6"><p className="text-sm text-gray-600 mb-1">Justification</p><p className="text-gray-900 bg-white p-3 rounded border border-gray-200">{selectedRequest.justification}</p></div>

              {selectedRequest.status === BursaryStatus.SUBMITTED && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-3">Review Decision</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Approved Amount (UGX)</label><input type="number" value={approvalForm.amount} onChange={(e) => setApprovalForm({ ...approvalForm, amount: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><input type="text" value={approvalForm.notes} onChange={(e) => setApprovalForm({ ...approvalForm, notes: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(selectedRequest.id)} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Approve</button>
                    <button onClick={() => handleReject(selectedRequest.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Reject</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BursaryDashboard;
