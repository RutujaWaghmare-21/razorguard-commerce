import type { FirewallCheck, FirewallEvaluation, MerchantPolicy, NegotiationIntent, Product, PolicyVerdict } from '../types';

const money = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const pct = (n: number) => `${n.toFixed(1)}%`;

/**
 * Deterministic evaluation. No LLM in this path — pure arithmetic against
 * merchant-configured thresholds. The AI agent's message/rationale is
 * logged but never used to authorize a transaction.
 */
export function evaluateProposal(
  intent: NegotiationIntent,
  product: Product,
  policy: MerchantPolicy
): FirewallEvaluation {
  const unitPrice = product.listPrice * (1 - intent.requestedDiscountPct / 100);
  const orderValue = unitPrice * intent.requestedQty;
  const marginPct = ((unitPrice - product.unitCost) / unitPrice) * 100;

  const checks: FirewallCheck[] = [
    {
      rule: 'MAX_DISCOUNT_PCT',
      limit: pct(policy.maxDiscountPct),
      actual: pct(intent.requestedDiscountPct),
      passed: intent.requestedDiscountPct <= policy.maxDiscountPct,
    },
    {
      rule: 'MIN_MARGIN_PCT',
      limit: pct(policy.minMarginPct),
      actual: pct(marginPct),
      passed: marginPct >= policy.minMarginPct,
    },
    {
      rule: 'MAX_QUANTITY',
      limit: `${policy.maxQuantityPerOrder} units`,
      actual: `${intent.requestedQty} units`,
      passed: intent.requestedQty <= policy.maxQuantityPerOrder,
    },
    {
      rule: 'STOCK_AVAILABILITY',
      limit: `${product.stock} in stock`,
      actual: `${intent.requestedQty} requested`,
      passed: policy.allowBackorder || intent.requestedQty <= product.stock,
    },
    {
      rule: 'AUTONOMOUS_ORDER_VALUE',
      limit: money(policy.maxAutonomousOrderValue),
      actual: money(orderValue),
      passed: orderValue <= policy.maxAutonomousOrderValue,
    },
  ];

  const hardFailures = checks.filter(
    (c) => !c.passed && c.rule !== 'AUTONOMOUS_ORDER_VALUE'
  );

  let verdict: PolicyVerdict;
  let reason: string;
  let counterOffer: FirewallEvaluation['counterOffer'];

  if (hardFailures.length > 0) {
    verdict = 'BLOCKED';
    const primary = hardFailures[0];
    reason = `POLICY_VIOLATION - ${primary.rule} breached (limit ${primary.limit}, got ${primary.actual})`;

    const safeDiscount = Math.min(policy.maxDiscountPct, intent.requestedDiscountPct);
    const safeUnitPrice = product.listPrice * (1 - safeDiscount / 100);
    const safeMargin = ((safeUnitPrice - product.unitCost) / safeUnitPrice) * 100;
    if (safeMargin >= policy.minMarginPct) {
      counterOffer = {
        unitPrice: safeUnitPrice,
        discountPct: safeDiscount,
        note: `Maximum permissible discount under policy is ${pct(policy.maxDiscountPct)}, preserving ${pct(safeMargin)} margin.`,
      };
    } else {
      const maxAllowedDiscount = (1 - (product.unitCost / (1 - policy.minMarginPct / 100)) / product.listPrice) * 100;
      const clamped = Math.max(0, Math.min(policy.maxDiscountPct, maxAllowedDiscount));
      const cUnit = product.listPrice * (1 - clamped / 100);
      counterOffer = {
        unitPrice: cUnit,
        discountPct: clamped,
        note: `Deterministic counter-offer capped at ${pct(clamped)} discount to protect ${pct(policy.minMarginPct)} minimum margin.`,
      };
    }
  } else if (orderValue > policy.humanApprovalThreshold) {
    verdict = 'REQUIRES_APPROVAL';
    reason = `ORDER_VALUE_EXCEEDS_AUTONOMOUS_THRESHOLD - ${money(orderValue)} > ${money(policy.humanApprovalThreshold)}`;
  } else {
    verdict = 'APPROVED';
    reason = 'All policy checks passed within autonomous authority.';
  }

  return {
    id: `eval-${intent.id}`,
    intentId: intent.id,
    productId: product.id,
    proposedUnitPrice: unitPrice,
    quantity: intent.requestedQty,
    discountPct: intent.requestedDiscountPct,
    orderValue,
    resultingMarginPct: marginPct,
    checks,
    verdict,
    reason,
    counterOffer,
    timestamp: new Date().toISOString(),
  };
}
