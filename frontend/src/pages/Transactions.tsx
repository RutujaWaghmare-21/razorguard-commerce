import React, { useState } from 'react';
import { Receipt, ExternalLink } from 'lucide-react';
import { Panel } from '../components/common/Panel';
import { useAppStore } from '../store/AppStore';
import { HumanApprovalDrawer } from '../components/negotiation/HumanApprovalDrawer';

const statusStyle: Record<string, { color: string; bg: string }> = {
  PAID: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  CREATED: { color: '#00D2FF', bg: 'rgba(0,210,255,0.1)' },
  PENDING_APPROVAL: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  FAILED: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

export const Transactions: React.FC = () => {
  const { transactions, evaluations, intents, approveHumanReview } = useAppStore();
  const [drawerIntentId, setDrawerIntentId] = useState<string | null>(null);

  const drawerEvaluation = drawerIntentId
    ? evaluations.find((e) => e.intentId === drawerIntentId) ?? null
    : null;
  const drawerIntent = drawerIntentId ? intents.find((i) => i.id === drawerIntentId) ?? null : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Receipt size={19} className="text-razor-cyan" />
          Transactions
        </h1>
        <p className="text-text-secondary text-[13px] mt-1">
          Razorpay orders and payment links, all in test mode. Only the firewall's APPROVED or
          human-approved verdicts ever reach this stage.
        </p>
      </div>

      <Panel title="Order Ledger" eyebrow={`${transactions.length} orders`}>
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-left text-[10px] font-mono-data text-text-tertiary uppercase border-b border-border">
              <th className="pb-2.5 font-medium">Order ID</th>
              <th className="pb-2.5 font-medium">Product</th>
              <th className="pb-2.5 font-medium">Qty</th>
              <th className="pb-2.5 font-medium">Amount</th>
              <th className="pb-2.5 font-medium">Status</th>
              <th className="pb-2.5 font-medium">Webhook</th>
              <th className="pb-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const style = statusStyle[t.status];
              return (
                <tr key={t.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-mono-data text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      {t.razorpayOrderId}
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          t.live ? 'text-approved bg-approved/10' : 'text-text-tertiary bg-white/5'
                        }`}
                      >
                        {t.live ? 'LIVE' : 'MOCK'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">{t.productName}</td>
                  <td className="py-3 font-mono-data">{t.quantity}</td>
                  <td className="py-3 font-mono-data font-medium">
                    ₹{Math.round(t.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3">
                    <span
                      className="text-[10.5px] font-mono-data font-semibold px-2 py-0.5 rounded"
                      style={{ color: style.color, backgroundColor: style.bg }}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 font-mono-data text-text-tertiary">
                    {t.webhookVerified ? (
                      <span className="text-approved">verified</span>
                    ) : (
                      <span className="animate-pulse-glow">pending…</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {t.status === 'PENDING_APPROVAL' ? (
                      <button
                        onClick={() => setDrawerIntentId(t.intentId)}
                        className="text-[11px] font-medium text-review hover:underline"
                      >
                        Review
                      </button>
                    ) : (
                      <ExternalLink size={13} className="text-text-tertiary inline" />
                    )}
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-text-tertiary font-mono-data text-[12px]">
                  No transactions yet — submit a proposal from Live Negotiations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>

      <HumanApprovalDrawer
        evaluation={drawerEvaluation}
        intent={drawerIntent}
        onClose={() => setDrawerIntentId(null)}
        onDecide={(approve, rationale) => {
          if (drawerEvaluation) approveHumanReview(drawerEvaluation.id, approve, rationale);
        }}
      />
    </div>
  );
};
