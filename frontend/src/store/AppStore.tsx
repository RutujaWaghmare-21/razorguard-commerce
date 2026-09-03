import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type {
  AuditEntry,
  FirewallEvaluation,
  MerchantPolicy,
  NegotiationIntent,
  Transaction,
} from '../types';
import { mockCatalog } from '../data/mockCatalog';
import { defaultPolicy } from '../data/mockPolicies';
import { evaluateProposal } from '../services/firewallEngine';
import { createMockOrder, mockWebhookSignature, simulateWebhookConfirmation } from '../services/razorpayMock';
import { checkBackendHealth, createLiveOrder, type HealthStatus } from '../services/api';

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

interface AppStoreShape {
  catalog: typeof mockCatalog;
  policy: MerchantPolicy;
  setPolicy: (p: MerchantPolicy) => void;
  intents: NegotiationIntent[];
  evaluations: FirewallEvaluation[];
  transactions: Transaction[];
  auditLog: AuditEntry[];
  gatewayStatus: HealthStatus;
  submitIntent: (partial: Omit<NegotiationIntent, 'id' | 'timestamp'>) => {
    intent: NegotiationIntent;
    evaluation: FirewallEvaluation;
  };
  approveHumanReview: (evaluationId: string, approve: boolean, rationale: string) => void;
}

const AppStoreContext = createContext<AppStoreShape | null>(null);

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [policy, setPolicy] = useState<MerchantPolicy>(defaultPolicy);
  const [intents, setIntents] = useState<NegotiationIntent[]>([]);
  const [evaluations, setEvaluations] = useState<FirewallEvaluation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [gatewayStatus, setGatewayStatus] = useState<HealthStatus>({
    reachable: false,
    razorpayConfigured: false,
  });

  React.useEffect(() => {
    checkBackendHealth().then(setGatewayStatus);
  }, []);

  /**
   * Tries to create a real Razorpay test-mode order through the FastAPI backend.
   * Falls back to local mock data if the backend is unreachable or Razorpay
   * keys aren't configured there — the demo never breaks either way.
   */
  const createOrderWithFallback = useCallback(
    async (params: { intentId: string; productName: string; quantity: number; amount: number; pendingApproval?: boolean }) => {
      if (gatewayStatus.reachable && gatewayStatus.razorpayConfigured) {
        try {
          const live = await createLiveOrder({
            amountInr: params.amount,
            receipt: `rg_${params.intentId}`,
            notes: { product: params.productName, quantity: String(params.quantity) },
          });
          return {
            ...createMockOrder(params),
            razorpayOrderId: live.razorpayOrderId,
            amount: live.amount,
            live: true,
          };
        } catch {
          // fall through to mock below
        }
      }
      return { ...createMockOrder(params), live: false };
    },
    [gatewayStatus]
  );

  const pushAudit = useCallback((entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    setAuditLog((prev) => [
      { ...entry, id: nextId('audit'), timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const submitIntent = useCallback(
    (partial: Omit<NegotiationIntent, 'id' | 'timestamp'>) => {
      const intent: NegotiationIntent = {
        ...partial,
        id: nextId('intent'),
        timestamp: new Date().toISOString(),
      };
      setIntents((prev) => [intent, ...prev]);
      pushAudit({
        type: 'INTENT_RECEIVED',
        actor: 'AI_AGENT',
        summary: `${intent.buyerOrg} proposed ${intent.requestedQty} units at ${intent.requestedDiscountPct}% discount`,
        payload: { intent },
      });

      const product = mockCatalog.find((p) => p.id === intent.productId)!;
      const evaluation = evaluateProposal(intent, product, policy);
      setEvaluations((prev) => [evaluation, ...prev]);

      pushAudit({
        type: evaluation.verdict === 'BLOCKED' ? 'ATTACK_BLOCKED' : 'FIREWALL_EVALUATION',
        actor: 'FIREWALL',
        summary: `Verdict: ${evaluation.verdict} — ${evaluation.reason}`,
        payload: { evaluation },
      });

      if (evaluation.verdict === 'APPROVED') {
        createOrderWithFallback({
          intentId: intent.id,
          productName: product.name,
          quantity: intent.requestedQty,
          amount: evaluation.orderValue,
        }).then((txn) => {
          setTransactions((prev) => [txn, ...prev]);
          pushAudit({
            type: 'ORDER_CREATED',
            actor: 'RAZORPAY',
            summary: `${txn.live ? 'LIVE test' : 'Mock'} order ${txn.razorpayOrderId} created for ${product.name} (${txn.quantity} units)`,
            payload: { transaction: txn },
          });

          setTimeout(() => {
            setTransactions((prev) =>
              prev.map((t) => (t.id === txn.id ? simulateWebhookConfirmation(t) : t))
            );
            pushAudit({
              type: 'WEBHOOK_RECEIVED',
              actor: 'RAZORPAY',
              summary: `payment.captured webhook verified for ${txn.razorpayOrderId} (${mockWebhookSignature(txn.razorpayOrderId)})`,
              payload: { orderId: txn.razorpayOrderId, event: 'payment.captured' },
            });
          }, 1600);
        });
      } else if (evaluation.verdict === 'REQUIRES_APPROVAL') {
        createOrderWithFallback({
          intentId: intent.id,
          productName: product.name,
          quantity: intent.requestedQty,
          amount: evaluation.orderValue,
          pendingApproval: true,
        }).then((txn) => {
          setTransactions((prev) => [txn, ...prev]);
        });
      }

      return { intent, evaluation };
    },
    [policy, pushAudit, createOrderWithFallback]
  );

  const approveHumanReview = useCallback(
    (evaluationId: string, approve: boolean, rationale: string) => {
      const evaluation = evaluations.find((e) => e.id === evaluationId);
      if (!evaluation) return;

      pushAudit({
        type: 'HUMAN_DECISION',
        actor: 'MERCHANT',
        summary: `${approve ? 'Approved' : 'Rejected'} order (${evaluation.orderValue.toLocaleString('en-IN')}) — "${rationale}"`,
        payload: { evaluationId, approve, rationale },
      });

      setTransactions((prev) =>
        prev.map((t) => {
          if (t.intentId !== evaluation.intentId) return t;
          if (approve) {
            const updated: Transaction = { ...t, status: 'CREATED' as const };
            setTimeout(() => {
              setTransactions((p2) =>
                p2.map((t2) => (t2.id === t.id ? simulateWebhookConfirmation(t2) : t2))
              );
              pushAudit({
                type: 'WEBHOOK_RECEIVED',
                actor: 'RAZORPAY',
                summary: `payment.captured webhook verified for ${t.razorpayOrderId}`,
                payload: { orderId: t.razorpayOrderId },
              });
            }, 1400);
            return updated;
          }
          return { ...t, status: 'FAILED' as const };
        })
      );
    },
    [evaluations, pushAudit]
  );

  const value = useMemo(
    () => ({
      catalog: mockCatalog,
      policy,
      setPolicy,
      intents,
      evaluations,
      transactions,
      auditLog,
      gatewayStatus,
      submitIntent,
      approveHumanReview,
    }),
    [policy, intents, evaluations, transactions, auditLog, gatewayStatus, submitIntent, approveHumanReview]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
};

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
