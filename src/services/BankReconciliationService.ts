/**
 * Bank Reconciliation Service
 * Handles matching bank transactions with GL entries, reconciliation workflows,
 * and reconciliation reporting with East Africa regional variations
 */

import {
  BankAccount,
  BankStatement,
  BankStatementTransaction,
  UnmatchedTransaction,
  ReconciliationMatch,
  BankReconciliation,
  ReconciliationAdjustment,
  ReconciliationStatus,
  TransactionSide,
  JournalEntry,
} from '../types';

interface MatchingCriteria {
  amountDifference: number; // Max allowed difference in currency units
  daysTolerance: number; // Days variance allowed
  useReferenceNumber: boolean; // Strict matching on ref numbers
  useDescription: boolean; // Fuzzy match descriptions
}

interface ReconciliationSummary {
  bankAccountId: string;
  accountName: string;
  reconciliedDate: Date;
  reconciledStatus: ReconciliationStatus;
  bookBalance: number;
  bankBalance: number;
  discrepancy: number;
  matchRate: number; // Percentage of transactions matched
  unmatchedItems: number;
  allowedVariance: number;
  isInBalance: boolean;
}

export class BankReconciliationService {
  /**
   * Import bank statement transactions from CSV or bank API
   * Validates and creates BankStatementTransaction records
   */
  static importBankStatement(
    bankAccountId: string,
    statementData: {
      date: Date;
      periodStart: Date;
      periodEnd: Date;
      openingBalance: number;
      closingBalance: number;
      transactions: Array<{
        transactionDate: Date;
        description: string;
        amount: number;
        transactionType: 'debit' | 'credit';
        referenceNumber?: string;
      }>;
    },
    uploadedBy: string
  ): BankStatement {
    const totalDebits = statementData.transactions
      .filter(t => t.transactionType === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCredits = statementData.transactions
      .filter(t => t.transactionType === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    // Validate opening + credits - debits = closing
    const calculatedClosing =
      statementData.openingBalance + totalCredits - totalDebits;
    if (Math.abs(calculatedClosing - statementData.closingBalance) > 0.01) {
      console.warn('Statement balance validation failed');
    }

    const statement: BankStatement = {
      id: `BS-${Date.now()}`,
      bankAccountId,
      statementDate: statementData.date,
      periodStart: statementData.periodStart,
      periodEnd: statementData.periodEnd,
      openingBalance: statementData.openingBalance,
      closingBalance: statementData.closingBalance,
      totalDebits,
      totalCredits,
      transactions: statementData.transactions.map((t, idx) => ({
        id: `BST-${Date.now()}-${idx}`,
        statementId: `BS-${Date.now()}`,
        transactionDate: t.transactionDate,
        description: t.description,
        amount: t.amount,
        transactionType: t.transactionType,
        referenceNumber: t.referenceNumber,
      })),
      uploadedDate: new Date(),
      uploadedBy,
    };

    return statement;
  }

  /**
   * Get all unmatched transactions for a bank account
   * Compares bank statement transactions with GL posting entries
   */
  static getUnmatchedTransactions(
    bankStatement: BankStatement,
    glJournalEntries: JournalEntry[],
    criteria: MatchingCriteria = {
      amountDifference: 100, // UGX/KES/etc
      daysTolerance: 3,
      useReferenceNumber: false,
      useDescription: false,
    }
  ): UnmatchedTransaction[] {
    const unmatched: UnmatchedTransaction[] = [];

    // Find statement transactions not matched to GL
    bankStatement.transactions.forEach(bankTxn => {
      const matched = this.findMatchingGLEntry(
        bankTxn,
        glJournalEntries,
        criteria
      );
      if (!matched) {
        const daysOld = Math.floor(
          (Date.now() - bankTxn.transactionDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        unmatched.push({
          id: `UM-${Date.now()}-${Math.random()}`,
          bankAccountId: bankStatement.bankAccountId,
          bankTransactionId: bankTxn.id,
          transactionDate: bankTxn.transactionDate,
          description: bankTxn.description,
          amount: bankTxn.amount,
          side: TransactionSide.BANK,
          transactionType: bankTxn.transactionType,
          daysOld,
          createdDate: new Date(),
        });
      }
    });

    // Find GL entries not matched to statement
    glJournalEntries.forEach(glEntry => {
      const matched = bankStatement.transactions.some(bankTxn =>
        this.transactionsMatch(bankTxn, glEntry, criteria)
      );
      if (!matched) {
        // Calculate days old from GL posting date
        const daysOld = Math.floor(
          (Date.now() - glEntry.postedDate!.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Only flag if reasonably recent (within ~30 days)
        if (daysOld < 30) {
          unmatched.push({
            id: `UM-${Date.now()}-${Math.random()}`,
            bankAccountId: bankStatement.bankAccountId,
            glTransactionId: glEntry.id,
            transactionDate: glEntry.postedDate!,
            description: glEntry.description,
            amount: Math.abs(this.getGLTransactionAmount(glEntry)),
            side: TransactionSide.BOOK,
            transactionType: this.getGLTransactionType(glEntry),
            daysOld,
            createdDate: new Date(),
          });
        }
      }
    });

    return unmatched;
  }

  /**
   * Auto-match transactions using intelligent algorithms
   */
  static autoMatchTransactions(
    bankStatement: BankStatement,
    glJournalEntries: JournalEntry[],
    criteria: MatchingCriteria
  ): ReconciliationMatch[] {
    const matches: ReconciliationMatch[] = [];

    bankStatement.transactions.forEach(bankTxn => {
      const glEntry = this.findMatchingGLEntry(
        bankTxn,
        glJournalEntries,
        criteria
      );
      if (glEntry) {
        const rules = this.determineMatchingRules(bankTxn, glEntry, criteria);
        const confidence = this.calculateConfidenceScore(
          bankTxn,
          glEntry,
          rules
        );

        matches.push({
          id: `RM-${Date.now()}-${Math.random()}`,
          bankAccountId: bankStatement.bankAccountId,
          bankTransactionId: bankTxn.id,
          glTransactionId: glEntry.id,
          matchDate: new Date(),
          amount: bankTxn.amount,
          matchedBy: 'AUTO_MATCH',
          matchingRules: rules,
          confidenceScore: confidence,
        });
      }
    });

    return matches;
  }

  /**
   * Complete reconciliation process for a bank account
   */
  static reconcileAccount(
    bankAccount: BankAccount,
    bankStatement: BankStatement,
    matches: ReconciliationMatch[],
    adjustments: ReconciliationAdjustment[],
    reconciledBy: string
  ): BankReconciliation {
    // Calculate matched amount
    const matchedAmount = matches.reduce((sum, m) => sum + m.amount, 0);
    
    // Calculate adjustments impact
    const adjustmentAmount = adjustments.reduce((sum, a) => sum + a.amount, 0);

    // Calculate book balance after adjustments
    const bookBalanceAfterAdj = bankAccount.bookBalance + adjustmentAmount;

    // Calculate discrepancy
    const discrepancy = Math.abs(
      bankStatement.closingBalance - bookBalanceAfterAdj
    );

    // Determine status
    let status: ReconciliationStatus = ReconciliationStatus.EXCEPTION;
    if (discrepancy < 0.01) {
      status = ReconciliationStatus.RECONCILED;
    } else if (discrepancy < 1000) {
      // Minor variance threshold (adjust per currency)
      status = ReconciliationStatus.PENDING;
    }

    const reconciliation: BankReconciliation = {
      id: `BR-${Date.now()}`,
      bankAccountId: bankAccount.id,
      statementId: bankStatement.id,
      reconciledDate: new Date(),
      reconciledBy,
      periodStart: bankStatement.periodStart,
      periodEnd: bankStatement.periodEnd,
      bookOpeningBalance: bankAccount.openingBalance,
      bookClosingBalance: bookBalanceAfterAdj,
      bankOpeningBalance: bankStatement.openingBalance,
      bankClosingBalance: bankStatement.closingBalance,
      matchedAmount,
      unmatchedAmount: bankStatement.closingBalance - matchedAmount,
      discrepancy,
      status,
      adjustments,
      createdDate: new Date(),
    };

    return reconciliation;
  }

  /**
   * Generate reconciliation summary report
   */
  static generateReconciliationSummary(
    bankAccount: BankAccount,
    matches: ReconciliationMatch[],
    unmatchedItems: UnmatchedTransaction[],
    bankStatement: BankStatement
  ): ReconciliationSummary {
    const matchRate =
      (matches.length /
        (matches.length + unmatchedItems.filter(u => u.side === TransactionSide.BANK).length)) *
      100;

    return {
      bankAccountId: bankAccount.id,
      accountName: `${bankAccount.bankName} - ${bankAccount.accountNumber}`,
      reconciliedDate: new Date(),
      reconciledStatus: bankAccount.reconciliationStatus,
      bookBalance: bankAccount.bookBalance,
      bankBalance: bankStatement.closingBalance,
      discrepancy: Math.abs(bankAccount.bookBalance - bankStatement.closingBalance),
      matchRate: isNaN(matchRate) ? 0 : Math.round(matchRate * 100) / 100,
      unmatchedItems: unmatchedItems.length,
      allowedVariance: 1000, // Currency-dependent
      isInBalance: Math.abs(bankAccount.bookBalance - bankStatement.closingBalance) < 1,
    };
  }

  // ================= PRIVATE HELPER METHODS =================

  private static findMatchingGLEntry(
    bankTxn: BankStatementTransaction,
    glEntries: JournalEntry[],
    criteria: MatchingCriteria
  ): JournalEntry | null {
    return (
      glEntries.find(glEntry =>
        this.transactionsMatch(bankTxn, glEntry, criteria)
      ) || null
    );
  }

  private static transactionsMatch(
    bankTxn: BankStatementTransaction,
    glEntry: JournalEntry,
    criteria: MatchingCriteria
  ): boolean {
    const glAmount = this.getGLTransactionAmount(glEntry);
    const glDate = glEntry.postedDate;

    if (!glDate) return false;

    // Amount match within tolerance
    if (Math.abs(bankTxn.amount - glAmount) > criteria.amountDifference) {
      return false;
    }

    // Date match within tolerance
    const daysDiff = Math.abs(
      Math.floor(
        (bankTxn.transactionDate.getTime() - glDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    if (daysDiff > criteria.daysTolerance) {
      return false;
    }

    // Reference number match (if both have it)
    if (criteria.useReferenceNumber && bankTxn.referenceNumber) {
      if (!glEntry.referenceNumber?.includes(bankTxn.referenceNumber)) {
        return false;
      }
    }

    // Description fuzzy match
    if (criteria.useDescription) {
      if (!this.fuzzyMatch(bankTxn.description, glEntry.description)) {
        return false;
      }
    }

    return true;
  }

  private static getGLTransactionAmount(glEntry: JournalEntry): number {
    // Sum all debit or credit amounts (whichever is non-zero)
    const totalDebit = glEntry.lineItems.reduce(
      (sum, li) => sum + (li.debitAmount || 0),
      0
    );
    const totalCredit = glEntry.lineItems.reduce(
      (sum, li) => sum + (li.creditAmount || 0),
      0
    );
    return totalDebit > 0 ? totalDebit : totalCredit;
  }

  private static getGLTransactionType(glEntry: JournalEntry): 'debit' | 'credit' {
    const totalDebit = glEntry.lineItems.reduce(
      (sum, li) => sum + (li.debitAmount || 0),
      0
    );
    return totalDebit > 0 ? 'debit' : 'credit';
  }

  private static determineMatchingRules(
    bankTxn: BankStatementTransaction,
    glEntry: JournalEntry,
    criteria: MatchingCriteria
  ): string[] {
    const rules: string[] = [];

    const amountDiff = Math.abs(
      bankTxn.amount - this.getGLTransactionAmount(glEntry)
    );
    if (amountDiff === 0) {
      rules.push('exact_amount_match');
    } else if (amountDiff <= criteria.amountDifference / 2) {
      rules.push('close_amount_match');
    }

    const glDate = glEntry.postedDate!;
    const daysDiff = Math.abs(
      Math.floor(
        (bankTxn.transactionDate.getTime() - glDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    if (daysDiff === 0) {
      rules.push('exact_date_match');
    } else if (daysDiff <= 1) {
      rules.push('date_within_1_day');
    } else if (daysDiff <= criteria.daysTolerance) {
      rules.push(`date_within_${daysDiff}_days`);
    }

    if (
      bankTxn.referenceNumber &&
      glEntry.referenceNumber?.includes(bankTxn.referenceNumber)
    ) {
      rules.push('reference_number_match');
    }

    if (this.fuzzyMatch(bankTxn.description, glEntry.description)) {
      rules.push('description_match');
    }

    return rules;
  }

  private static calculateConfidenceScore(
    bankTxn: BankStatementTransaction,
    glEntry: JournalEntry,
    rules: string[]
  ): number {
    let score = 0;

    if (rules.includes('exact_amount_match')) score += 40;
    else if (rules.includes('close_amount_match')) score += 25;

    if (rules.includes('exact_date_match')) score += 30;
    else if (rules.includes('date_within_1_day')) score += 20;

    if (rules.includes('reference_number_match')) score += 30;
    if (rules.includes('description_match')) score += 20;

    return Math.min(100, score);
  }

  private static fuzzyMatch(str1: string, str2: string): boolean {
    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check if one contains the other (substring match)
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    // Levenshtein-style simple similarity
    const minLen = Math.min(s1.length, s2.length);
    if (minLen === 0) return s1 === s2;
    
    let matches = 0;
    for (let i = 0; i < minLen; i++) {
      if (s1[i] === s2[i]) matches++;
    }
    
    return matches / minLen > 0.7; // 70% similarity threshold
  }
}
