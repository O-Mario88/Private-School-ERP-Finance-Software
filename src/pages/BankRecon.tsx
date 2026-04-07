/**
 * Bank Reconciliation Page
 * Complete transaction matching and account reconciliation workflow
 */

import React, { useState, useCallback } from 'react';
import BankReconciliationUI from '../components/treasury/BankReconciliationUI';
import { BankReconciliationService } from '../services/BankReconciliationService';
import {
  BankAccount,
  BankStatement,
  BankStatementTransaction,
  UnmatchedTransaction,
  ReconciliationMatch,
  BankReconciliation,
  ReconciliationStatus,
  JournalEntry,
} from '../types';

// Mock data for demonstration
const mockBankAccounts: BankAccount[] = [
  {
    id: 'BA-001',
    bankName: 'Stanbic Bank',
    accountNumber: '9100234567890',
    accountType: 'current',
    accountHolder: 'Maple School',
    currency: 'UGX',
    openingBalance: 109350000,
    bookBalance: 113400000,
    statementBalance: 117450000,
    lastReconciledDate: new Date('2025-02-28'),
    lastReconciledBalance: 109350000,
    reconciliationStatus: ReconciliationStatus.UNRECONCILED,
    isActive: true,
    createdDate: new Date('2024-01-01'),
    createdBy: 'system',
  },
  {
    id: 'BA-002',
    bankName: 'Centenary Bank',
    accountNumber: '2100987654321',
    accountType: 'current',
    accountHolder: 'Maple School',
    currency: 'UGX',
    openingBalance: 83700000,
    bookBalance: 83700000,
    statementBalance: 83700000,
    lastReconciledDate: new Date('2025-03-05'),
    lastReconciledBalance: 83700000,
    reconciliationStatus: ReconciliationStatus.RECONCILED,
    isActive: true,
    createdDate: new Date('2024-01-01'),
    createdBy: 'system',
  },
  {
    id: 'BA-003',
    bankName: 'MTN MoMo Float',
    accountNumber: '0770345678',
    accountType: 'mobile',
    accountHolder: 'Maple School',
    currency: 'UGX',
    openingBalance: 21060000,
    bookBalance: 22950000,
    statementBalance: 24840000,
    lastReconciledDate: new Date('2025-03-01'),
    lastReconciledBalance: 21060000,
    reconciliationStatus: ReconciliationStatus.UNRECONCILED,
    isActive: true,
    createdDate: new Date('2024-03-01'),
    createdBy: 'system',
  },
  {
    id: 'BA-004',
    bankName: 'dfcu Bank',
    accountNumber: '4100567890234',
    accountType: 'savings',
    accountHolder: 'Maple School',
    currency: 'UGX',
    openingBalance: 75600000,
    bookBalance: 75600000,
    statementBalance: 75600000,
    lastReconciledDate: new Date('2025-03-06'),
    lastReconciledBalance: 75600000,
    reconciliationStatus: ReconciliationStatus.RECONCILED,
    isActive: true,
    createdDate: new Date('2024-02-01'),
    createdBy: 'system',
  },
];

const mockUnmatchedTxns: UnmatchedTransaction[] = [
  {
    id: 'UT-001',
    bankAccountId: 'BA-001',
    bankTransactionId: 'BST-001',
    transactionDate: new Date('2025-03-02'),
    description: 'MTN MoMo Collection',
    amount: 2295000,
    side: 'bank',
    transactionType: 'credit',
    daysOld: 6,
    createdDate: new Date(),
  },
  {
    id: 'UT-002',
    bankAccountId: 'BA-001',
    bankTransactionId: 'BST-002',
    transactionDate: new Date('2025-03-03'),
    description: 'Cheque #004521 – Supplier',
    amount: 810000,
    side: 'book',
    transactionType: 'debit',
    daysOld: 5,
    createdDate: new Date(),
  },
  {
    id: 'UT-003',
    bankAccountId: 'BA-001',
    bankTransactionId: 'BST-003',
    transactionDate: new Date('2025-03-04'),
    description: 'Bank Charges – March',
    amount: 67500,
    side: 'bank',
    transactionType: 'debit',
    daysOld: 4,
    createdDate: new Date(),
  },
  {
    id: 'UT-004',
    bankAccountId: 'BA-003',
    bankTransactionId: 'BST-004',
    transactionDate: new Date('2025-03-05'),
    description: 'MTN MoMo Transfer In',
    amount: 1215000,
    side: 'bank',
    transactionType: 'credit',
    daysOld: 3,
    createdDate: new Date(),
  },
  {
    id: 'UT-005',
    bankAccountId: 'BA-001',
    bankTransactionId: 'BST-005',
    transactionDate: new Date('2025-03-05'),
    description: 'Parent payment – Wire',
    amount: 1755000,
    side: 'bank',
    transactionType: 'credit',
    daysOld: 3,
    createdDate: new Date(),
  },
  {
    id: 'UT-006',
    bankAccountId: 'BA-003',
    bankTransactionId: 'BST-006',
    transactionDate: new Date('2025-03-06'),
    description: 'Utility Bill Payment',
    amount: 675000,
    side: 'book',
    transactionType: 'debit',
    daysOld: 2,
    createdDate: new Date(),
  },
];

const mockMatches: ReconciliationMatch[] = [
  {
    id: 'RM-001',
    bankAccountId: 'BA-001',
    bankTransactionId: 'BST-007',
    glTransactionId: 'JE-001',
    matchDate: new Date(),
    amount: 5000000,
    matchedBy: 'AUTO_MATCH',
    matchingRules: ['exact_amount_match', 'exact_date_match'],
    confidenceScore: 99,
  },
  {
    id: 'RM-002',
    bankAccountId: 'BA-003',
    bankTransactionId: 'BST-008',
    glTransactionId: 'JE-002',
    matchDate: new Date(),
    amount: 3500000,
    matchedBy: 'AUTO_MATCH',
    matchingRules: ['close_amount_match', 'date_within_1_day'],
    confidenceScore: 92,
  },
];

export default function BankReconPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [currentStatement, setCurrentStatement] = useState<BankStatement>();
  const [unmatchedItems, setUnmatchedItems] = useState<UnmatchedTransaction[]>(mockUnmatchedTxns);
  const [matches, setMatches] = useState<ReconciliationMatch[]>(mockMatches);
  const [reconciliation, setReconciliation] = useState<BankReconciliation>();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountSelect = useCallback((accountId: string) => {
    setSelectedAccountId(accountId);
  }, []);

  const handleImportStatement = useCallback((file: File) => {
    setIsLoading(true);
    // Simulate file parsing
    setTimeout(() => {
      const mockStatement: BankStatement = {
        id: `BS-${Date.now()}`,
        bankAccountId: selectedAccountId || 'BA-001',
        statementDate: new Date(),
        periodStart: new Date('2025-03-01'),
        periodEnd: new Date('2025-03-07'),
        openingBalance: 109350000,
        closingBalance: 117450000,
        totalDebits: 3400000,
        totalCredits: 11500000,
        transactions: [
          {
            id: 'BST-001',
            statementId: `BS-${Date.now()}`,
            transactionDate: new Date('2025-03-02'),
            description: 'MTN MoMo Collection',
            amount: 2295000,
            transactionType: 'credit',
            referenceNumber: 'MM-2025-0342',
          },
          {
            id: 'BST-002',
            statementId: `BS-${Date.now()}`,
            transactionDate: new Date('2025-03-03'),
            description: 'Cheque Clearing',
            amount: 1500000,
            transactionType: 'debit',
            referenceNumber: '004521',
          },
        ],
        uploadedDate: new Date(),
        uploadedBy: 'current_user',
        fileName: file.name,
      };
      setCurrentStatement(mockStatement);
      setIsLoading(false);
    }, 1000);
  }, [selectedAccountId]);

  const handleAutoMatch = useCallback(() => {
    setIsLoading(true);
    // Simulate auto-matching
    setTimeout(() => {
      // In a real scenario, this would call BankReconciliationService.autoMatchTransactions
      const newMatches: ReconciliationMatch[] = [
        ...matches,
        {
          id: `RM-${Date.now()}`,
          bankAccountId: selectedAccountId || 'BA-001',
          bankTransactionId: 'BST-009',
          glTransactionId: 'JE-003',
          matchDate: new Date(),
          amount: 2295000,
          matchedBy: 'AUTO_MATCH',
          matchingRules: ['close_amount_match', 'date_within_1_day'],
          confidenceScore: 87,
        },
      ];
      setMatches(newMatches);
      setIsLoading(false);
    }, 1500);
  }, [matches, selectedAccountId]);

  const handleManualMatch = useCallback((bankTxnId: string, glTxnId: string) => {
    console.log(`Manual match: ${bankTxnId} <-> ${glTxnId}`);
    // Implementation would add to matches
  }, []);

  const handleUnmatch = useCallback((matchId: string) => {
    setMatches(matches.filter(m => m.id !== matchId));
  }, [matches]);

  const handleAddAdjustment = useCallback((description: string, amount: number) => {
    console.log(`Added adjustment: ${description} - ${amount}`);
    // Implementation would add to adjustments
  }, []);

  const handleReconcile = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const selectedAccount = bankAccounts.find(a => a.id === selectedAccountId);
      if (selectedAccount && currentStatement) {
        const recon = BankReconciliationService.reconcileAccount(
          selectedAccount,
          currentStatement,
          matches,
          [],
          'current_user'
        );
        setReconciliation(recon);
        
        // Update account status
        setBankAccounts(
          bankAccounts.map(a =>
            a.id === selectedAccountId
              ? {
                  ...a,
                  reconciliationStatus: recon.status as ReconciliationStatus,
                  bookBalance: recon.bookClosingBalance,
                  statementBalance: recon.bankClosingBalance,
                  lastReconciledDate: recon.reconciledDate,
                }
              : a
          )
        );
      }
      setIsLoading(false);
    }, 1500);
  }, [bankAccounts, selectedAccountId, currentStatement, matches]);

  return (
    <BankReconciliationUI
      bankAccounts={bankAccounts}
      selectedAccountId={selectedAccountId}
      onAccountSelect={handleAccountSelect}
      onImportStatement={handleImportStatement}
      onAutoMatch={handleAutoMatch}
      onManualMatch={handleManualMatch}
      onUnmatch={handleUnmatch}
      onAddAdjustment={handleAddAdjustment}
      onReconcile={handleReconcile}
      currentStatement={currentStatement}
      unmatchedItems={unmatchedItems}
      matches={matches}
      reconciliation={reconciliation}
      isLoading={isLoading}
    />
  );
}
