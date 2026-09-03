export type PolicyVerdict = 'APPROVED' | 'BLOCKED' | 'REQUIRES_APPROVAL';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  listPrice: number;
  minMarginPct: number;
  stock: number;
  bulkTiers: { minQty: number; discountPct: number }[];
}

export interface MerchantPolicy {
  minMarginPct: number;
  maxDiscountPct: number;
  maxAutonomousOrderValue: number;
  maxQuantityPerOrder: number;
  humanApprovalThreshold: number;
  bulkDiscountCeilingPct: number;
  allowBackorder: boolean;
}

export interface NegotiationIntent {
  id: string;
  buyerAgentId: string;
  buyerOrg: string;
  productId: string;
  requestedQty: number;
  requestedDiscountPct: number;
  message: string;
  timestamp: string;
  raw: Record<string, unknown>;
}

export interface FirewallEvaluation {
  id: string;
  intentId: string;
  productId: string;
  proposedUnitPrice: number;
  quantity: number;
  discountPct: number;
  orderValue: number;
  resultingMarginPct: number;
  checks: FirewallCheck[];
  verdict: PolicyVerdict;
  reason: string;
  counterOffer?: { unitPrice: number; discountPct: number; note: string };
  timestamp: string;
}

export interface FirewallCheck {
  rule: string;
  limit: string;
  actual: string;
  passed: boolean;
}

export interface Transaction {
  id: string;
  razorpayOrderId: string;
  intentId: string;
  productName: string;
  quantity: number;
  amount: number;
  status: 'CREATED' | 'PAID' | 'FAILED' | 'PENDING_APPROVAL';
  webhookVerified: boolean;
  idempotencyKey: string;
  createdAt: string;
  live: boolean;
}

export interface AuditEntry {
  id: string;
  type: 'INTENT_RECEIVED' | 'FIREWALL_EVALUATION' | 'HUMAN_DECISION' | 'ORDER_CREATED' | 'WEBHOOK_RECEIVED' | 'ATTACK_BLOCKED';
  summary: string;
  payload: Record<string, unknown>;
  timestamp: string;
  actor: 'AI_AGENT' | 'FIREWALL' | 'MERCHANT' | 'RAZORPAY';
}

export interface PipelineEvent {
  id: string;
  label: string;
  status: 'idle' | 'active' | 'done' | 'blocked' | 'warn';
}
