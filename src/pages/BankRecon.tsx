/**
 * Bank Reconciliation Page
 * Complete transaction matching and account reconciliation workflow
 */

import React, { useState, useCallback, useMemo } from 'react';
import BankReconciliationUI from '../components/treasury/BankReconciliationUI';
import { BankReconciliationService } from '../services/BankReconciliationService';
import { useDB } from '../database';
import { BankReconService } from '../database/DatabaseService';
import {
  BankAccount,
  BankAccountType,
  BankStatement,
  BankStatementTransaction,
  UnmatchedTransaction,
  ReconciliationMatch,
  BankReconciliation,
  ReconciliationStatus,
  TransactionSide,
  JournalEntry,
} from '../types';

/* ── Data from SQLite ── */
function useBankReconData() {
  const { isReady } = useDB();
  const raw = useMemo(() => isReady ? BankReconService.getBankAccounts() : [], [isReady]);

  const typeMap: Record<string, BankAccountType> = {
    current: BankAccountType.CURRENT,
    savings: BankAccountType.SAVINGS,
    mobile: BankAccountType.MOBILE,
    fixed_deposit: BankAccountType.FIXED_DEPOSIT,
  };

  return useMemo(() => raw.map((a: any): BankAccount => ({
    id: a.id,
    bankName: a.bank_name || '',
    accountNumber: a.account_number || '',
    accountType: typeMap[(a.account_type || 'current').toLowerCase()] || BankAccountType.CURRENT,
    accountHolder: a.account_name || 'Maple School',
    currency: a.currency || 'UGX',
    openingBalance: Number(a.opening_balance) || 0,
    bookBalance: Number(a.current_balance) || 0,
    statementBalance: Number(a.current_balance) || 0,
    lastReconciledDate: a.created_at ? new Date(a.created_at) : new Date(),
    lastReconciledBalance: Number(a.opening_balance) || 0,
    reconciliationStatus: ReconciliationStatus.UNRECONCILED,
    isActive: Boolean(a.is_active),
    createdDate: a.created_at ? new Date(a.created_at) : new Date(),
    createdBy: 'system',
  })), [raw]);
}

const initialUnmatchedTxns: UnmatchedTransaction[] = [
  {
    id: 'UT-001',
    bankAccountId: 'BA-001',
    bankTransactionId: 'BST-001',
    transactionDate: new Date('2026-03-02'),
    description: 'MTN MoMo Collection',
    amount: 2295000,
    side: TransactionSide.BANK,
    transactionType: 'credit',
    daysOld: 6,
    createdDate: new Date(),
  },
  {
    id: 'UT-002',
    bankAccountId: 'BA-001',
    bankTransactionId: 'BST-002',
    transactionDate: new Date('2026-03-03'),
    description: 'Cheque #004521 \u2013 Supplier',
    amount: 810000,
    side: TransactionSide.BOOK,
    transactionType: 'debit',
    daysOld: 5,
    createdDate: new Date(),
  },
  {
    id: 'UT-003',
    bankAccountId: 'BA-001',
    bankTransactionId: 'BST-003',
    transactionDate: new Date('2026-03-04'),
    description: 'Bank Charges \u2013 March',
    amount: 67500,
    side: TransactionSide.BANK,
    transactionType: 'debit',
    daysOld: 4,
    createdDate: new Date(),
  },
  {
    id: 'UT-004',
    bankAccountId: 'BA-003',
    bankTransactionId: 'BST-004',
    transactionDate: new Date('2026-03-05'),
    description: 'MTN MoMo Transfer In',
    amount: 1215000,
    side: TransactionSide.BANK,
    transactionType: 'credit',
    daysOld: 3,
    createdDate: new Date(),
  },
  {
    id: 'UT-005',
    bankAccountId: 'BA-001',
    bankTransactionId: 'BST-005',
    transactionDate: new Date('2026-03-05'),
    description: 'Parent payment \u2013 Wire',
    amount: 1755000,
    side: TransactionSide.BANK,
    transactionType: 'credit',
    daysOld: 3,
    createdDate: new Date(),
  },
  {
    id: 'UT-006',
    bankAccountId: 'BA-003',
    bankTransactionId: 'BST-006',
    transactionDate: new Date('2026-03-06'),
    description: 'Utility Bill Payment',
    amount: 675000,
    side: TransactionSide.BOOK,
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
  const dbBankAccounts = useBankReconData();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [currentStatement, setCurrentStatement] = useState<BankStatement>();
  const [unmatchedItems, setUnmatchedItems] = useState<UnmatchedTransaction[]>(initialUnmatchedTxns);
  const [matches, setMatches] = useState<ReconciliationMatch[]>(mockMatches);
  const [reconciliation, setReconciliation] = useState<BankReconciliation>();
  const [isLoading, setIsLoading] = useState(false);

  // Sync DB accounts into state once loaded
  useMemo(() => {
    if (dbBankAccounts.length > 0) setBankAccounts(dbBankAccounts);
  }, [dbBankAccounts]);

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
