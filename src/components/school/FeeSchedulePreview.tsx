/**
 * Fee Schedule Preview Component
 * Preview and finalize fees before generating invoices
 */

import React, { useState } from 'react';
import { useUIStore } from '../../store';
import type { FeeLineItem, StudentFeeSchedule, FeeRule } from '../../types';

interface PreviewData {
  classId: string;
  term: string;
  numStudents: number;
}

export const FeeSchedulePreview: React.FC<{ feeRules?: FeeRule[] }> = ({ feeRules = [] }) => {
  const addNotification = useUIStore((state) => state.addNotification);
  
  const [previewData, setPreviewData] = useState<PreviewData>({
    classId: '',
    term: '',
    numStudents: 1,
  });

  const [previewFees, setPreviewFees] = useState<StudentFeeSchedule | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Mock function to preview fees - would call backend in real implementation
  const handlePreviewFees = () => {
    if (!previewData.classId || !previewData.term) {
      addNotification('Please select class and term', 'error');
      return;
    }

    // Filter applicable rules
    const applicableRules = feeRules.filter(
      (rule) =>
        rule.active &&
        rule.term === previewData.term &&
        (!rule.classId || rule.classId === previewData.classId)
    );

    if (applicableRules.length === 0) {
      addNotification('No active fee rules found for this class/term', 'error');
      return;
    }

    // Calculate fees
    const feeItems: FeeLineItem[] = applicableRules.map((rule) => ({
      feeType: rule.feeType,
      description: `${rule.feeType} - ${rule.term}`,
      amount: rule.amount,
      discounts: [], // Would populate with actual discounts
      finalAmount: rule.amount,
    }));

    const totalAmount = feeItems.reduce((sum, item) => sum + item.finalAmount, 0);

    setPreviewFees({
      studentId: 'PREVIEW',
      classId: previewData.classId,
      term: previewData.term,
      feeItems,
      totalAmount,
      calculatedAt: new Date().toISOString(),
    });

    addNotification('Fee schedule calculated', 'success');
  };

  // Finalize and generate invoices
  const handleGenerateInvoices = () => {
    if (!previewFees) {
      addNotification('No fees to generate', 'error');
      return;
    }

    addNotification(
      `Generated invoices for ${previewData.numStudents} students in ${previewData.classId}`,
      'success'
    );
    setShowConfirmation(false);
    setPreviewFees(null);
  };

  // Export preview as CSV
  const handleExportPreview = () => {
    if (!previewFees) return;

    const csv = [
      ['MAPLE PRIVATE SCHOOL - FEE SCHEDULE PREVIEW'],
      [`Class: ${previewFees.classId}`, `Term: ${previewFees.term}`],
      [`Number of Students: ${previewData.numStudents}`],
      [`Calculated: ${new Date(previewFees.calculatedAt).toLocaleString()}`],
      [],
      ['Fee Type', 'Description', 'Amount', 'Discounts', 'Final Amount'],
      ...previewFees.feeItems.map((item) => [
        item.feeType,
        item.description,
        item.amount.toFixed(2),
        item.discounts.length > 0
          ? item.discounts.map((d) => `${d.discountType}: ${d.discountAmount.toFixed(2)}`).join('; ')
          : '—',
        item.finalAmount.toFixed(2),
      ]),
      [],
      ['', '', '', 'TOTAL PER STUDENT:', previewFees.totalAmount.toFixed(2)],
      ['', '', '', 'TOTAL FOR CLASS:', (previewFees.totalAmount * previewData.numStudents).toFixed(2)],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_schedule_${previewData.classId}_${previewData.term}.csv`;
    a.click();
    addNotification('Fee schedule exported to CSV', 'success');
  };

  const uniqueTerms = Array.from(new Set(feeRules.map((r) => r.term)));
  const uniqueClasses = Array.from(
    new Set(feeRules.filter((r) => r.classId).map((r) => r.classId))
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Fee Schedule Preview</h1>
          <p className="text-gray-600 text-sm mt-1">
            Preview and finalize fees before generating student invoices
          </p>
        </div>

        {/* Input Section */}
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <select
                value={previewData.classId}
                onChange={(e) =>
                  setPreviewData({ ...previewData, classId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Class</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls!}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term *
              </label>
              <select
                value={previewData.term}
                onChange={(e) =>
                  setPreviewData({ ...previewData, term: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Term</option>
                {uniqueTerms.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Students (Estimate)
              </label>
              <input
                type="number"
                value={previewData.numStudents}
                onChange={(e) =>
                  setPreviewData({
                    ...previewData,
                    numStudents: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handlePreviewFees}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Preview Fees
            </button>
          </div>
        </div>

        {/* Preview Results */}
        {previewFees && (
          <div className="p-6">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Preview Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-blue-700">Class</p>
                  <p className="font-semibold text-blue-900">{previewFees.classId}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Term</p>
                  <p className="font-semibold text-blue-900">{previewFees.term}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Number of Students</p>
                  <p className="font-semibold text-blue-900">{previewData.numStudents}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Total Revenue (Expected)</p>
                  <p className="font-semibold text-blue-900">
                    UGX {(previewFees.totalAmount * previewData.numStudents).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Fee Items Table */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fee Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Fee Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Discounts
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Final Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewFees.feeItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.feeType.charAt(0).toUpperCase() + item.feeType.slice(1)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          UGX {item.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.discounts.length > 0 ? (
                            <div className="text-xs">
                              {item.discounts.map((d, i) => (
                                <div key={i} className="text-gray-600">
                                  {d.discountType}: UGX {d.discountAmount.toFixed(2)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          UGX {item.finalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                        Per Student Total:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                        UGX {previewFees.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                        Class Total ({previewData.numStudents} students):
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-blue-600">
                        UGX {(previewFees.totalAmount * previewData.numStudents).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowConfirmation(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Generate Invoices
              </button>
              <button
                onClick={handleExportPreview}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Generate Invoices - Confirm
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  This will create <strong>{previewData.numStudents}</strong> invoices for class{' '}
                  <strong>{previewData.classId}</strong> in term <strong>{previewData.term}</strong>
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  Total revenue to be billed:{' '}
                  <strong>
                    UGX{' '}
                    {previewFees &&
                      (previewFees.totalAmount * previewData.numStudents).toFixed(2)}
                  </strong>
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Invoices will be created with &quot;draft&quot; status. You can review and adjust
                before issuing.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateInvoices}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Confirm & Generate
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!previewFees && feeRules.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">No fee rules available</p>
            <p className="text-sm mt-1">Create fee rules first to generate invoices</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeSchedulePreview;
