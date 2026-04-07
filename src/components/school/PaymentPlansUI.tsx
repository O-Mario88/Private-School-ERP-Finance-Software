/**
 * Payment Plans UI Component
 * Create and manage installment payment plans for students
 */

import React, { useState } from 'react';
import { useUIStore } from '../../store';
import { InstallmentStatus, PaymentPlanStatus } from '../../types';
import type { PaymentPlan, PaymentPlanInstallment } from '../../types';

interface PaymentPlanDisplay extends PaymentPlan {
  studentName: string;
  className: string;
  installments: PaymentPlanInstallment[];
}

const MOCK_PLANS: PaymentPlanDisplay[] = [
  {
    id: 'pp_1', studentId: 'stu_1', studentName: 'Aisha Namutebi', className: 'S2A',
    invoiceId: 'inv_1', installmentAmount: 150000, numInstallments: 3, status: PaymentPlanStatus.ACTIVE,
    createdBy: 'admin', createdAt: '2026-01-10', planStartDate: '2026-01-15',
    installments: [
      { id: 'inst_1', planId: 'pp_1', installmentNumber: 1, amount: 150000, dueDate: '2026-01-31', status: InstallmentStatus.PAID, paidDate: '2026-01-28', paymentId: 'pay_1' },
      { id: 'inst_2', planId: 'pp_1', installmentNumber: 2, amount: 150000, dueDate: '2026-02-28', status: InstallmentStatus.PENDING },
      { id: 'inst_3', planId: 'pp_1', installmentNumber: 3, amount: 150000, dueDate: '2026-03-31', status: InstallmentStatus.PENDING },
    ],
  },
  {
    id: 'pp_2', studentId: 'stu_5', studentName: 'Eva Atukunda', className: 'S1B',
    invoiceId: 'inv_5', installmentAmount: 150000, numInstallments: 2, status: PaymentPlanStatus.ACTIVE,
    createdBy: 'admin', createdAt: '2026-01-12', planStartDate: '2026-01-20',
    installments: [
      { id: 'inst_4', planId: 'pp_2', installmentNumber: 1, amount: 150000, dueDate: '2026-02-15', status: InstallmentStatus.OVERDUE },
      { id: 'inst_5', planId: 'pp_2', installmentNumber: 2, amount: 150000, dueDate: '2026-03-15', status: InstallmentStatus.PENDING },
    ],
  },
];

export const PaymentPlansUI: React.FC = () => {
  const addNotification = useUIStore((state) => state.addNotification);
  const [plans, setPlans] = useState<PaymentPlanDisplay[]>(MOCK_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanDisplay | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [createForm, setCreateForm] = useState({
    studentName: '', className: '', installmentAmount: 0, numInstallments: 3,
  });

  const totalAmount = (plan: PaymentPlanDisplay) => plan.installmentAmount * plan.numInstallments;

  const totalOutstanding = plans
    .filter((p) => p.status === PaymentPlanStatus.ACTIVE)
    .reduce((sum, p) => sum + p.installments.filter((i) => i.status !== InstallmentStatus.PAID).reduce((s, i) => s + i.amount, 0), 0);

  const overdueInstallments = plans
    .flatMap((p) => p.installments)
    .filter((i) => i.status === InstallmentStatus.OVERDUE);

  const handleCreatePlan = () => {
    if (!createForm.studentName || createForm.installmentAmount <= 0 || createForm.numInstallments < 2) {
      addNotification('Please fill in all required fields', 'error'); return;
    }

    const planId = `pp_${Date.now()}`;
    const installments: PaymentPlanInstallment[] = Array.from({ length: createForm.numInstallments }, (_, i) => {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      return {
        id: `inst_${Date.now()}_${i}`, planId, installmentNumber: i + 1,
        amount: createForm.installmentAmount, dueDate: dueDate.toISOString().split('T')[0],
        status: InstallmentStatus.PENDING,
      };
    });

    const newPlan: PaymentPlanDisplay = {
      id: planId, studentId: `stu_${Date.now()}`, studentName: createForm.studentName,
      className: createForm.className, invoiceId: `inv_${Date.now()}`,
      installmentAmount: createForm.installmentAmount, numInstallments: createForm.numInstallments,
      status: PaymentPlanStatus.ACTIVE, createdBy: 'admin', createdAt: new Date().toISOString(),
      planStartDate: new Date().toISOString().split('T')[0], installments,
    };

    setPlans([newPlan, ...plans]);
    addNotification(`Payment plan created for ${createForm.studentName}`, 'success');
    setShowCreateForm(false);
    setCreateForm({ studentName: '', className: '', installmentAmount: 0, numInstallments: 3 });
  };

  const handleMarkPaid = (planId: string, installmentId: string) => {
    setPlans(plans.map((p) => {
      if (p.id !== planId) return p;
      return { ...p, installments: p.installments.map((inst) =>
        inst.id !== installmentId ? inst : { ...inst, status: InstallmentStatus.PAID, paidDate: new Date().toISOString().split('T')[0] }
      )};
    }));
    addNotification('Installment marked as paid', 'success');
  };

  const installmentStatusBadge = (status: InstallmentStatus) => {
    const colors: Record<InstallmentStatus, string> = {
      [InstallmentStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [InstallmentStatus.PAID]: 'bg-green-100 text-green-800',
      [InstallmentStatus.OVERDUE]: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>{status}</span>;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Plans</h1>
          <p className="text-gray-600 text-sm mt-1">Create and manage installment payment plans</p>
        </div>

        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Active Plans</p><p className="text-2xl font-bold text-blue-600">{plans.filter((p) => p.status === PaymentPlanStatus.ACTIVE).length}</p></div>
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Outstanding Balance</p><p className="text-2xl font-bold text-orange-600">UGX {totalOutstanding.toLocaleString()}</p></div>
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Overdue Installments</p><p className={`text-2xl font-bold ${overdueInstallments.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{overdueInstallments.length}</p></div>
          <div className="bg-white p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">Overdue Amount</p><p className={`text-2xl font-bold ${overdueInstallments.length > 0 ? 'text-red-600' : 'text-green-600'}`}>UGX {overdueInstallments.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p></div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{selectedPlan ? 'Plan Details' : 'Payment Plans'}</h2>
            {!selectedPlan && <button onClick={() => setShowCreateForm(!showCreateForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{showCreateForm ? 'Cancel' : '+ New Plan'}</button>}
          </div>

          {showCreateForm && !selectedPlan && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label><input type="text" value={createForm.studentName} onChange={(e) => setCreateForm({ ...createForm, studentName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Class</label><input type="text" value={createForm.className} onChange={(e) => setCreateForm({ ...createForm, className: e.target.value })} placeholder="e.g., S2A" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Installment Amount (UGX) *</label><input type="number" value={createForm.installmentAmount} onChange={(e) => setCreateForm({ ...createForm, installmentAmount: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Number of Installments *</label><input type="number" min="2" max="12" value={createForm.numInstallments} onChange={(e) => setCreateForm({ ...createForm, numInstallments: parseInt(e.target.value) || 2 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <button onClick={handleCreatePlan} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Create Plan</button>
            </div>
          )}

          {!selectedPlan && !showCreateForm && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Installments</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Progress</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => {
                    const paidCount = plan.installments.filter((i) => i.status === InstallmentStatus.PAID).length;
                    return (
                      <tr key={plan.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{plan.studentName}</td>
                        <td className="px-4 py-3 text-sm">{plan.className}</td>
                        <td className="px-4 py-3 text-sm text-right">UGX {totalAmount(plan).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-center">{plan.numInstallments}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${(paidCount / plan.numInstallments) * 100}%` }} /></div>
                            <span className="text-xs text-gray-600">{paidCount}/{plan.numInstallments}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center"><button onClick={() => setSelectedPlan(plan)} className="text-blue-600 hover:underline text-sm">View</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedPlan && (
            <div>
              <button onClick={() => setSelectedPlan(null)} className="text-blue-600 hover:underline text-sm mb-4 block">&larr; Back to list</button>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-4">
                <div className="flex justify-between items-start">
                  <div><h3 className="text-xl font-bold">{selectedPlan.studentName}</h3><p className="text-sm text-gray-600">{selectedPlan.className} &middot; Created {selectedPlan.createdAt}</p></div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{selectedPlan.status}</span>
                </div>
                <div className="mt-4 flex gap-8">
                  <div><p className="text-sm text-gray-600">Total</p><p className="font-semibold">UGX {totalAmount(selectedPlan).toLocaleString()}</p></div>
                  <div><p className="text-sm text-gray-600">Paid</p><p className="font-semibold text-green-600">UGX {(selectedPlan.installments.filter((i) => i.status === InstallmentStatus.PAID).length * selectedPlan.installmentAmount).toLocaleString()}</p></div>
                  <div><p className="text-sm text-gray-600">Remaining</p><p className="font-semibold text-orange-600">UGX {(selectedPlan.installments.filter((i) => i.status !== InstallmentStatus.PAID).length * selectedPlan.installmentAmount).toLocaleString()}</p></div>
                </div>
              </div>

              <h3 className="font-semibold mb-3">Installment Schedule</h3>
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Paid Date</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlan.installments.map((inst) => (
                    <tr key={inst.id} className={`border-b border-gray-200 ${inst.status === InstallmentStatus.OVERDUE ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 text-sm text-center">{inst.installmentNumber}</td>
                      <td className="px-4 py-3 text-sm text-right">UGX {inst.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{inst.dueDate}</td>
                      <td className="px-4 py-3 text-center">{installmentStatusBadge(inst.status)}</td>
                      <td className="px-4 py-3 text-sm">{inst.paidDate || '\u2014'}</td>
                      <td className="px-4 py-3 text-center">
                        {inst.status === InstallmentStatus.OVERDUE && (
                          <button onClick={() => handleMarkPaid(selectedPlan.id, inst.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Mark Paid</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPlansUI;
