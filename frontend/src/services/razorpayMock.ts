import type { Transaction } from '../types';

function randomId(prefix: string, len = 14) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}_${s}`;
}

export function createMockOrder(params: {
  intentId: string;
  productName: string;
  quantity: number;
  amount: number;
  pendingApproval?: boolean;
}): Transaction {
  return {
    id: randomId('txn', 10),
    razorpayOrderId: randomId('order'),
    intentId: params.intentId,
    productName: params.productName,
    quantity: params.quantity,
    amount: params.amount,
    status: params.pendingApproval ? 'PENDING_APPROVAL' : 'CREATED',
    webhookVerified: false,
    idempotencyKey: randomId('idem', 20),
    createdAt: new Date().toISOString(),
    live: false,
  };
}

export function simulateWebhookConfirmation(txn: Transaction): Transaction {
  return {
    ...txn,
    status: 'PAID',
    webhookVerified: true,
  };
}

export function mockWebhookSignature(orderId: string) {
  return `whsec_${orderId.split('_')[1]?.slice(0, 12) ?? 'sig'}...verified`;
}
