/**
 * Follow-Up Tracker Component
 * Log and track collection follow-up activities
 */

import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { FollowUpActivityType } from '../../types';
import type { FollowUpActivity } from '../../types';

interface FollowUpDisplay extends FollowUpActivity {
  studentName: string;
  className: string;
  outstandingAmount: number;
}

const MOCK_ACTIVITIES: FollowUpDisplay[] = [
  { id: 'fu_1', studentId: 'stu_2', studentName: 'Brian Mugisha', className: 'S3B', outstandingAmount: 320000, staffId: 'bursar', activityType: FollowUpActivityType.CALL, activityDate: '2026-02-10', notes: 'Parent promised to pay by end of month.', outcome: 'promise_to_pay', nextFollowUpDate: '2026-02-25' },
  { id: 'fu_2', studentId: 'stu_5', studentName: 'Eva Atukunda', className: 'S1B', outstandingAmount: 150000, staffId: 'accounts_clerk', activityType: FollowUpActivityType.SMS, activityDate: '2026-02-12', notes: 'Sent SMS reminder for overdue installment.', outcome: 'no_response', nextFollowUpDate: '2026-02-18' },
  { id: 'fu_3', studentId: 'stu_3', studentName: 'Catherine Nalubega', className: 'S1C', outstandingAmount: 450000, staffId: 'accountant', activityType: FollowUpActivityType.LETTER, activityDate: '2026-02-05', notes: 'Formal demand letter sent to home address.', outcome: 'no_response', nextFollowUpDate: '2026-02-28' },
  { id: 'fu_4', studentId: 'stu_2', studentName: 'Brian Mugisha', className: 'S3B', outstandingAmount: 320000, staffId: 'bursar', activityType: FollowUpActivityType.IN_PERSON, activityDate: '2026-01-28', notes: 'Visited home, met with guardian. Agreed on payment plan.', outcome: 'payment_plan_agreed' },
];

export const FollowUpTracker: React.FC = () => {
  const addNotification = useUIStore((state) => state.addNotification);
  const [activities, setActivities] = useState<FollowUpDisplay[]>(MOCK_ACTIVITIES);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FollowUpActivityType | 'all'>('all');

  const [form, setForm] = useState({
    studentName: '', className: '', outstandingAmount: 0,
    activityType: FollowUpActivityType.CALL,
    notes: '', outcome: 'no_response', nextFollowUpDate: '',
  });

  const filteredActivities = filter === 'all' ? activities : activities.filter((a) => a.activityType === filter);

  const upcomingFollowUps = activities.filter((a) => a.nextFollowUpDate && new Date(a.nextFollowUpDate) >= new Date()).length;

  const handleCreate = () => {
    if (!form.studentName || !form.notes) { addNotification('Student name and notes are required', 'error'); return; }
    const newActivity: FollowUpDisplay = {
      id: `fu_${Date.now()}`, studentId: `stu_${Date.now()}`, studentName: form.studentName,
      className: form.className, outstandingAmount: form.outstandingAmount,
      staffId: 'current_user', activityType: form.activityType, activityDate: new Date().toISOString(),
      notes: form.notes, outcome: form.outcome,
      nextFollowUpDate: form.nextFollowUpDate || undefined,
    };
    setActivities([newActivity, ...activities]);
    addNotification('Follow-up activity logged', 'success');
    setShowForm(false);
    setForm({ studentName: '', className: '', outstandingAmount: 0, activityType: FollowUpActivityType.CALL, notes: '', outcome: 'no_response', nextFollowUpDate: '' });
  };

  const activityIcon = (type: FollowUpActivityType) => {
    const icons: Record<FollowUpActivityType, string> = {
      [FollowUpActivityType.CALL]: '\u{1F4DE}',
      [FollowUpActivityType.SMS]: '\u{1F4AC}',
      [FollowUpActivityType.EMAIL]: '\u{1F4E7}',
      [FollowUpActivityType.LETTER]: '\u{2709}\u{FE0F}',
      [FollowUpActivityType.IN_PERSON]: '\u{1F91D}',
    };
    return icons[type] || '\u{1F4CB}';
  };

  const outcomeBadge = (outcome?: string) => {
    const colors: Record<string, string> = {
      promise_to_pay: 'bg-yellow-100 text-yellow-800',
      payment_plan_agreed: 'bg-green-100 text-green-800',
      partial_payment: 'bg-blue-100 text-blue-800',
      no_response: 'bg-gray-100 text-gray-800',
      refused: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[outcome || ''] || 'bg-gray-100 text-gray-800'}`}>{(outcome || 'none').replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Follow-Up Tracker</h1>
          <p className="text-gray-600 text-sm mt-1">Log and track collection follow-up activities</p>
        </div>

        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Total Activities</p><p className="text-2xl font-bold text-blue-600">{activities.length}</p></div>
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Upcoming Follow-Ups</p><p className="text-2xl font-bold text-orange-600">{upcomingFollowUps}</p></div>
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Promises to Pay</p><p className="text-2xl font-bold text-yellow-600">{activities.filter((a) => a.outcome === 'promise_to_pay').length}</p></div>
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">No Response</p><p className="text-2xl font-bold text-red-600">{activities.filter((a) => a.outcome === 'no_response').length}</p></div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
              {Object.values(FollowUpActivityType).map((t) => (
                <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded text-sm font-medium ${filter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{t.replace(/_/g, ' ')}</button>
              ))}
            </div>
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{showForm ? 'Cancel' : '+ Log Activity'}</button>
          </div>

          {showForm && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mb-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label><input type="text" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Class</label><input type="text" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Outstanding (UGX)</label><input type="number" value={form.outstandingAmount} onChange={(e) => setForm({ ...form, outstandingAmount: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <select value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value as FollowUpActivityType })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.values(FollowUpActivityType).map((t) => (<option key={t} value={t}>{t.replace(/_/g, ' ')}</option>))}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                  <select value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="no_response">No Response</option>
                    <option value="promise_to_pay">Promise to Pay</option>
                    <option value="payment_plan_agreed">Payment Plan Agreed</option>
                    <option value="partial_payment">Partial Payment</option>
                    <option value="refused">Refused</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-Up</label><input type="date" value={form.nextFollowUpDate} onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Notes *</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Log Activity</button>
            </div>
          )}

          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <span className="text-2xl">{activityIcon(activity.activityType)}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{activity.studentName}</span>
                        <span className="text-xs text-gray-500">{activity.className}</span>
                        {outcomeBadge(activity.outcome)}
                      </div>
                      <p className="text-sm text-gray-700">{activity.notes}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Outstanding: UGX {activity.outstandingAmount.toLocaleString()}</span>
                        <span>By: {activity.staffId}</span>
                        <span>Date: {activity.activityDate}</span>
                        {activity.nextFollowUpDate && <span className="text-orange-600 font-medium">Next: {activity.nextFollowUpDate}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpTracker;
