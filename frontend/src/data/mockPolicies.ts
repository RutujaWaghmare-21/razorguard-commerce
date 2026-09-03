import type { MerchantPolicy } from '../types';

export const defaultPolicy: MerchantPolicy = {
  minMarginPct: 18,
  maxDiscountPct: 12,
  maxAutonomousOrderValue: 500000,
  maxQuantityPerOrder: 500,
  humanApprovalThreshold: 500000,
  bulkDiscountCeilingPct: 12,
  allowBackorder: false,
};
