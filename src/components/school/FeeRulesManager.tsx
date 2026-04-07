/**
 * Fee Rules Manager Component
 * Create, edit, and manage fee rules for classes and terms
 */

import React, { useState } from 'react';
import { useUIStore } from '../../store';
import type { FeeRule, FeeDiscount, FeeType, DiscountType } from '../../types';
import { FeeType as FeeTypeEnum, DiscountType as DiscountTypeEnum } from '../../types';

interface FeeRuleFormData {
  classId?: string;
  term: string;
  feeType: FeeType;
  amount: number;
  effectiveDate: string;
  endDate?: string;
}

interface FeeDiscountFormData {
  discountType: DiscountType;
  discountValue: number;
  isPercentage: boolean;
  maxStudents?: number;
  maxDiscountAmount?: number;
}

export const FeeRulesManager: React.FC = () => {
  const addNotification = useUIStore((state) => state.addNotification);
  
  const [feeRules, setFeeRules] = useState<FeeRule[]>([]);
  const [feeDiscounts, setFeeDiscounts] = useState<FeeDiscount[]>([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [filterTerm, setFilterTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const [ruleFormData, setRuleFormData] = useState<FeeRuleFormData>({
    term: '',
    feeType: FeeTypeEnum.TUITION,
    amount: 0,
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  const [discountFormData, setDiscountFormData] = useState<FeeDiscountFormData>({
    discountType: DiscountTypeEnum.SCHOLARSHIP,
    discountValue: 0,
    isPercentage: true,
  });

  // Create a new fee rule
  const handleCreateRule = () => {
    if (!ruleFormData.term || ruleFormData.amount <= 0) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    const newRule: FeeRule = {
      id: `fr_${Date.now()}`,
      classId: ruleFormData.classId,
      term: ruleFormData.term,
      feeType: ruleFormData.feeType,
      amount: ruleFormData.amount,
      effectiveDate: ruleFormData.effectiveDate,
      endDate: ruleFormData.endDate,
      active: true,
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
    };

    setFeeRules([...feeRules, newRule]);
    addNotification(`Fee rule created: ${ruleFormData.feeType} for term ${ruleFormData.term}`, 'success');
    setShowRuleForm(false);
    resetRuleForm();
  };

  // Add discount to selected fee rule
  const handleAddDiscount = () => {
    if (!selectedRuleId || discountFormData.discountValue <= 0) {
      addNotification('Please select a rule and enter discount value', 'error');
      return;
    }

    const newDiscount: FeeDiscount = {
      id: `fd_${Date.now()}`,
      feeRuleId: selectedRuleId,
      discountType: discountFormData.discountType,
      discountValue: discountFormData.discountValue,
      isPercentage: discountFormData.isPercentage,
      maxStudents: discountFormData.maxStudents,
      maxDiscountAmount: discountFormData.maxDiscountAmount,
      active: true,
    };

    setFeeDiscounts([...feeDiscounts, newDiscount]);
    addNotification(`Discount added: ${discountFormData.discountType}`, 'success');
    setShowDiscountForm(false);
    resetDiscountForm();
  };

  // Toggle rule active status
  const handleToggleRuleStatus = (ruleId: string) => {
    setFeeRules(
      feeRules.map((rule) =>
        rule.id === ruleId ? { ...rule, active: !rule.active } : rule
      )
    );
    const rule = feeRules.find((r) => r.id === ruleId);
    addNotification(
      `Fee rule ${rule?.active ? 'deactivated' : 'activated'}`,
      'success'
    );
  };

  // Delete fee rule
  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this fee rule?')) {
      setFeeRules(feeRules.filter((r) => r.id !== ruleId));
      setFeeDiscounts(feeDiscounts.filter((d) => d.feeRuleId !== ruleId));
      addNotification('Fee rule deleted', 'success');
    }
  };

  // Delete discount
  const handleDeleteDiscount = (discountId: string) => {
    setFeeDiscounts(feeDiscounts.filter((d) => d.id !== discountId));
    addNotification('Discount deleted', 'success');
  };

  const resetRuleForm = () => {
    setRuleFormData({
      term: '',
      feeType: FeeTypeEnum.TUITION,
      amount: 0,
      effectiveDate: new Date().toISOString().split('T')[0],
    });
  };

  const resetDiscountForm = () => {
    setDiscountFormData({
      discountType: DiscountTypeEnum.SCHOLARSHIP,
      discountValue: 0,
      isPercentage: true,
    });
  };

  // Filter fee rules
  const filteredRules = feeRules.filter(
    (rule) =>
      (filterTerm === '' || rule.term === filterTerm) &&
      (filterClass === '' || rule.classId === filterClass)
  );

  // Get discounts for selected rule
  const ruleDiscounts = selectedRuleId
    ? feeDiscounts.filter((d) => d.feeRuleId === selectedRuleId)
    : [];

  // Get unique terms and classes
  const uniqueTerms = Array.from(new Set(feeRules.map((r) => r.term)));
  const uniqueClasses = Array.from(
    new Set(feeRules.filter((r) => r.classId).map((r) => r.classId))
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fee Rules Manager</h1>
            <p className="text-gray-600 text-sm mt-1">
              Create and manage fee rules for classes and terms
            </p>
          </div>
          <button
            onClick={() => setShowRuleForm(!showRuleForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {showRuleForm ? 'Cancel' : '+ New Fee Rule'}
          </button>
        </div>

        {/* Fee Rule Form */}
        {showRuleForm && (
          <div className="border-b border-gray-200 p-6 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Fee Rule</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class (Optional)
                </label>
                <input
                  type="text"
                  value={ruleFormData.classId || ''}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, classId: e.target.value })
                  }
                  placeholder="e.g., S1, S2, P5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term *
                </label>
                <input
                  type="text"
                  value={ruleFormData.term}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, term: e.target.value })
                  }
                  placeholder="e.g., Term 1, Term 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Type *
                </label>
                <select
                  value={ruleFormData.feeType}
                  onChange={(e) =>
                    setRuleFormData({
                      ...ruleFormData,
                      feeType: e.target.value as FeeType,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(FeeTypeEnum).map((feeType) => (
                    <option key={feeType} value={feeType}>
                      {feeType.charAt(0).toUpperCase() + feeType.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (UGX) *
                </label>
                <input
                  type="number"
                  value={ruleFormData.amount}
                  onChange={(e) =>
                    setRuleFormData({
                      ...ruleFormData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date *
                </label>
                <input
                  type="date"
                  value={ruleFormData.effectiveDate}
                  onChange={(e) =>
                    setRuleFormData({
                      ...ruleFormData,
                      effectiveDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={ruleFormData.endDate || ''}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreateRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Fee Rule
              </button>
              <button
                onClick={() => {
                  setShowRuleForm(false);
                  resetRuleForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {feeRules.length > 0 && (
          <div className="border-b border-gray-200 p-6 bg-gray-50 flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Term
              </label>
              <select
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Terms</option>
                {uniqueTerms.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Class
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls!}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Fee Rules Table */}
        <div className="p-6">
          {filteredRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No fee rules created yet</p>
              <p className="text-sm mt-1">Create your first fee rule to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Class
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Term
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Fee Type
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Active
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {rule.classId || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{rule.term}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {rule.feeType.charAt(0).toUpperCase() + rule.feeType.slice(1)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        UGX {rule.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleToggleRuleStatus(rule.id)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            rule.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rule.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <button
                          onClick={() => setSelectedRuleId(rule.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium"
                        >
                          Discounts
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Discount Management Section */}
        {selectedRuleId && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Discounts for Rule: {feeRules.find((r) => r.id === selectedRuleId)?.feeType}
              </h2>
              <button
                onClick={() => setShowDiscountForm(!showDiscountForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {showDiscountForm ? 'Cancel' : '+ Add Discount'}
              </button>
            </div>

            {/* Discount Form */}
            {showDiscountForm && (
              <div className="bg-white p-4 rounded-lg border border-gray-300 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={discountFormData.discountType}
                      onChange={(e) =>
                        setDiscountFormData({
                          ...discountFormData,
                          discountType: e.target.value as DiscountType,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(DiscountTypeEnum).map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={discountFormData.discountValue}
                      onChange={(e) =>
                        setDiscountFormData({
                          ...discountFormData,
                          discountValue: parseFloat(e.target.value),
                        })
                      }
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={discountFormData.isPercentage ? 'percentage' : 'fixed'}
                      onChange={(e) =>
                        setDiscountFormData({
                          ...discountFormData,
                          isPercentage: e.target.value === 'percentage',
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (UGX)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Students
                    </label>
                    <input
                      type="number"
                      value={discountFormData.maxStudents || ''}
                      onChange={(e) =>
                        setDiscountFormData({
                          ...discountFormData,
                          maxStudents: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="Unlimited"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Discount Amount
                    </label>
                    <input
                      type="number"
                      value={discountFormData.maxDiscountAmount || ''}
                      onChange={(e) =>
                        setDiscountFormData({
                          ...discountFormData,
                          maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="Unlimited"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddDiscount}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Add Discount
                  </button>
                  <button
                    onClick={() => {
                      setShowDiscountForm(false);
                      resetDiscountForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Discounts List */}
            {ruleDiscounts.length === 0 ? (
              <p className="text-gray-600 text-sm py-4">No discounts for this rule yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Max Students
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Max Amount
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ruleDiscounts.map((discount) => (
                      <tr key={discount.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {discount.discountType.charAt(0).toUpperCase() +
                            discount.discountType.slice(1)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {discount.discountValue}
                          {discount.isPercentage ? '%' : ' UGX'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {discount.maxStudents || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {discount.maxDiscountAmount
                            ? `UGX ${discount.maxDiscountAmount.toFixed(2)}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleDeleteDiscount(discount.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeRulesManager;
