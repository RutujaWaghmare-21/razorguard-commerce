import type { NegotiationIntent } from '../types';

export const seedIntents: Omit<NegotiationIntent, 'id' | 'timestamp'>[] = [
  {
    buyerAgentId: 'agent-procure-alpha',
    buyerOrg: 'Nimbus Fabrication Co.',
    productId: 'p-001',
    requestedQty: 220,
    requestedDiscountPct: 8,
    message: 'Requesting bulk pricing for 220 units of RG-SSD-1TB for Q3 fulfillment. Standard tier discount expected.',
    raw: { intent_type: 'bulk_purchase', ap2_version: '0.3', urgency: 'standard' },
  },
  {
    buyerAgentId: 'agent-restock-orbit',
    buyerOrg: 'Orbit Robotics Ltd.',
    productId: 'p-002',
    requestedQty: 450,
    requestedDiscountPct: 9,
    message: 'Recurring restock order for controller boards, matching prior negotiated tier.',
    raw: { intent_type: 'recurring_order', ap2_version: '0.3', urgency: 'low' },
  },
  {
    buyerAgentId: 'agent-scale-hexa',
    buyerOrg: 'HexaGrid Energy',
    productId: 'p-003',
    requestedQty: 640,
    requestedDiscountPct: 7,
    message: 'Large-volume battery pack acquisition for grid deployment, requesting best available rate.',
    raw: { intent_type: 'bulk_purchase', ap2_version: '0.3', urgency: 'high' },
  },
];
