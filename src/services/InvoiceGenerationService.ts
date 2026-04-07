/**
 * Invoice Generation Service (M1 Integration)
 * Integrates fee calculations with invoice creation workflow
 */

import type { 
  FeeRule, 
  FeeDiscount, 
  StudentFeeSchedule, 
  FeeLineItem,
  StudentInvoice
} from '../types';

/**
 * Calculate fees for a student based on fee rules and discounts
 */
function calculateStudentFees(
  studentId: string,
  classId: string,
  term: string,
  feeRules: FeeRule[],
  feeDiscounts: FeeDiscount[]
): FeeLineItem[] {
  // Filter applicable fee rules for this student's class and term
  const applicableRules = feeRules.filter(
    (rule) =>
      rule.active &&
      rule.term === term &&
      (!rule.classId || rule.classId === classId)
  );

  if (applicableRules.length === 0) {
    throw new Error(`No active fee rules found for class ${classId} in term ${term}`);
  }

  // Convert rules to fee line items
  const feeItems: FeeLineItem[] = applicableRules.map((rule) => ({
    feeType: rule.feeType,
    description: `${rule.feeType} - ${term}`,
    amount: rule.amount,
    discounts: [],
    finalAmount: rule.amount,
  }));

  // Apply discounts to fee items
  for (const item of feeItems) {
    const applicableDiscounts = feeDiscounts.filter(
      (d) => d.active && d.feeRuleId.includes(item.feeType)
    );

    for (const discount of applicableDiscounts) {
      const discountAmount = discount.isPercentage
        ? item.amount * (discount.discountValue / 100)
        : discount.discountValue;

      const cappedDiscount = discount.maxDiscountAmount
        ? Math.min(discountAmount, discount.maxDiscountAmount)
        : discountAmount;

      item.discounts.push({
        discountType: discount.discountType,
        discountAmount: cappedDiscount,
        discountPercentage: discount.isPercentage ? discount.discountValue : undefined,
      });
    }

    // Calculate final amount after all discounts
    const totalDiscount = item.discounts.reduce((sum, d) => sum + d.discountAmount, 0);
    item.finalAmount = Math.max(item.amount - totalDiscount, 0);
  }

  return feeItems;
}

/**
 * Validate fee calculation constraints
 */
function validateFeeCalculation(feeItems: FeeLineItem[]): void {
  for (const item of feeItems) {
    if (item.finalAmount < 0) {
      throw new Error(`Final amount for ${item.feeType} cannot be negative`);
    }

    const totalDiscount = item.discounts.reduce((sum, d) => sum + d.discountAmount, 0);
    if (totalDiscount > item.amount) {
      throw new Error(
        `Total discounts (${totalDiscount.toFixed(2)}) exceed fee amount (${item.amount.toFixed(
          2
        )}) for ${item.feeType}`
      );
    }
  }
}

/**
 * Calculate total fees
 */
function calculateTotalFees(feeItems: FeeLineItem[]): number {
  return feeItems.reduce((sum, item) => sum + item.finalAmount, 0);
}

export class InvoiceGenerationService {
  /**
   * Generate invoices for a class using active fee rules
   */
  static async generateInvoicesForClass(
    classId: string,
    term: string,
    studentIds: string[],
    feeRules: FeeRule[],
    feeDiscounts: FeeDiscount[],
    currentUser: { id: string; firstName: string; lastName: string }
  ): Promise<{ success: boolean; invoiceCount: number; totalAmount: number; errors?: string[] }> {
    try {
      const errors: string[] = [];
      let totalAmount = 0;
      let invoiceCount = 0;

      // Generate invoice for each student
      for (const studentId of studentIds) {
        try {
          // Calculate fees for this student
          const feeItems = calculateStudentFees(studentId, classId, term, feeRules, feeDiscounts);

          // Validate calculated fees
          validateFeeCalculation(feeItems);

          // Calculate total
          const invoiceAmount = calculateTotalFees(feeItems);

          // Create invoice (in real implementation, would call backend API)
          // For now, just aggregate the totals
          totalAmount += invoiceAmount;
          invoiceCount++;
        } catch (studentError) {
          errors.push(`Student ${studentId}: ${String(studentError)}`);
        }
      }

      return {
        success: errors.length === 0,
        invoiceCount,
        totalAmount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        invoiceCount: 0,
        totalAmount: 0,
        errors: [String(error)],
      };
    }
  }

  /**
   * Generate invoices with specific fee items
   */
  static generateInvoiceFromFees(
    studentId: string,
    familyId: string,
    feeItems: FeeLineItem[],
    classId: string,
    term: string,
    invoiceDate: string,
    dueDate: string
  ): {
    studentId: string;
    familyId: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    status: string;
  } {
    const totalAmount = calculateTotalFees(feeItems);

    return {
      studentId,
      familyId,
      invoiceDate: invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount,
      status: 'draft',
    };
  }

  /**
   * Get fee preview for a student
   */
  static getFeePreview(
    studentId: string,
    classId: string,
    term: string,
    feeRules: FeeRule[],
    feeDiscounts: FeeDiscount[]
  ): StudentFeeSchedule {
    const feeItems = calculateStudentFees(studentId, classId, term, feeRules, feeDiscounts);
    validateFeeCalculation(feeItems);
    
    const totalAmount = calculateTotalFees(feeItems);
    
    return {
      studentId,
      classId,
      term,
      feeItems,
      totalAmount,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Validate that rules and discounts are configured correctly
   */
  static validateConfiguration(feeRules: FeeRule[], feeDiscounts: FeeDiscount[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (feeRules.length === 0) {
      errors.push('No fee rules configured');
    }

    // Check for orphaned discounts
    const ruleIds = new Set(feeRules.map((r) => r.id));
    for (const discount of feeDiscounts) {
      if (!ruleIds.has(discount.feeRuleId)) {
        errors.push(`Orphaned discount ${discount.id}: rule ${discount.feeRuleId} does not exist`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default InvoiceGenerationService;
