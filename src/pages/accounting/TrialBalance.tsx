import React, { useState } from 'react';
import { TrialBalanceReport } from '../../components/accounting/TrialBalanceReport';
import type { JournalEntry, JournalLineItem } from '../../types';

export const TrialBalancePage: React.FC = () => {
  const [journalEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      entryDate: new Date('2024-01-20'),
      referenceNumber: 'DEP-001',
      description: 'Bank deposit - tuition',
      lineItems: [
        {
          id: '1',
          accountId: 'ACC-1000',
          debitAmount: 500000,
          creditAmount: 0,
          lineDescription: 'Tuition income',
          entityVersion: 1,
        },
        {
          id: '2',
          accountId: 'ACC-4000',
          debitAmount: 0,
          creditAmount: 500000,
          lineDescription: 'Tuition income',
          entityVersion: 1,
        },
      ] as JournalLineItem[],
      createdBy: 'acc001',
      createdDate: new Date('2024-01-20'),
      status: 'posted',
      auditTrail: [],
    },
  ]);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trial Balance Report</h1>
        <p className="text-gray-600">View and validate accounting balances</p>
      </div>
      <TrialBalanceReport journalEntries={journalEntries} />
    </div>
  );
};
