import React, { useMemo, useState } from 'react';
import { Bot, Cpu, Send } from 'lucide-react';
import { Panel } from '../components/common/Panel';
import { JsonView } from '../components/common/JsonView';
import { StatusBadge } from '../components/common/StatusBadge';
import { FirewallChecklist } from '../components/firewall/FirewallChecklist';
import { useAppStore } from '../store/AppStore';

export const Negotiations: React.FC = () => {
  const { catalog, intents, evaluations, submitIntent } = useAppStore();
  const [productId, setProductId] = useState(catalog[0].id);
  const [qty, setQty] = useState(150);
  const [discount, setDiscount] = useState(8);
  const [buyerOrg, setBuyerOrg] = useState('Nimbus Fabrication Co.');
  const [message, setMessage] = useState('Requesting bulk pricing aligned to our procurement volume.');
  const [selectedIntentId, setSelectedIntentId] = useState<string | null>(null);

  const product = catalog.find((p) => p.id === productId)!;

  const activeIntent = selectedIntentId
    ? intents.find((i) => i.id === selectedIntentId)
    : intents[0];
  const activeEvaluation = activeIntent
    ? evaluations.find((e) => e.intentId === activeIntent.id)
    : undefined;

  const rawIntentPreview = useMemo(
    () => ({
      protocol: 'AP2/0.3',
      buyer_agent_id: 'agent-live-preview',
      buyer_org: buyerOrg,
      product_sku: product.sku,
      requested_quantity: qty,
      requested_discount_pct: discount,
      message,
    }),
    [buyerOrg, product.sku, qty, discount, message]
  );

  const projectedUnitPrice = product.listPrice * (1 - discount / 100);
  const projectedMargin = ((projectedUnitPrice - product.unitCost) / projectedUnitPrice) * 100;

  const handleSubmit = () => {
    const { intent } = submitIntent({
      buyerAgentId: 'agent-live-preview',
      buyerOrg,
      productId,
      requestedQty: qty,
      requestedDiscountPct: discount,
      message,
      raw: rawIntentPreview,
    });
    setSelectedIntentId(intent.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Live Negotiations</h1>
        <p className="text-text-secondary text-[13px] mt-1">
          External AI buyers propose deals on the left. The merchant agent reasons over policy on the right —
          it can explain a decision, but it never makes one.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Panel eyebrow="External AI Buyer" title="Machine-readable intent" right={<Bot size={16} className="text-razor-cyan" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono-data text-text-tertiary uppercase">Buyer org</label>
                <input
                  value={buyerOrg}
                  onChange={(e) => setBuyerOrg(e.target.value)}
                  className="w-full mt-1 bg-bg border border-border rounded-md px-2.5 py-1.5 text-[12px] font-mono-data focus:outline-none focus:border-razor-blue"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono-data text-text-tertiary uppercase">Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full mt-1 bg-bg border border-border rounded-md px-2.5 py-1.5 text-[12px] font-mono-data focus:outline-none focus:border-razor-blue"
                >
                  {catalog.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono-data text-text-tertiary uppercase">
                  Quantity: {qty}
                </label>
                <input
                  type="range"
                  min={1}
                  max={800}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full mt-2 accent-razor-blue"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono-data text-text-tertiary uppercase">
                  Discount request: {discount}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={95}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full mt-2 accent-razor-blue"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono-data text-text-tertiary uppercase">Message to agent</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full mt-1 bg-bg border border-border rounded-md px-2.5 py-1.5 text-[12px] focus:outline-none focus:border-razor-blue resize-none"
              />
            </div>
            <JsonView data={rawIntentPreview} />
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-razor-blue to-razor-cyan text-bg text-[12.5px] font-semibold py-2.5 rounded-md hover:opacity-90 transition-opacity"
            >
              <Send size={13} strokeWidth={2.5} />
              Send Proposal to Negotiation Agent
            </button>
          </div>
        </Panel>

        <Panel eyebrow="Merchant AI Agent" title="Action log (not raw chain-of-thought)" right={<Cpu size={16} className="text-razor-blue" />}>
          <div className="space-y-3 text-[12.5px]">
            <div className="rounded-md border border-border bg-bg/50 px-3 py-2.5 text-text-secondary">
              Received intent from <span className="text-text-primary font-medium">{buyerOrg}</span> for{' '}
              <span className="font-mono-data text-razor-cyan">{qty}</span> ×{' '}
              <span className="text-text-primary">{product.name}</span>.
            </div>
            <div className="rounded-md border border-border bg-bg/50 px-3 py-2.5 text-text-secondary">
              Computed quote at <span className="font-mono-data text-text-primary">{discount}%</span> discount →
              unit price <span className="font-mono-data text-text-primary">₹{projectedUnitPrice.toFixed(0)}</span>,
              projected margin{' '}
              <span className={`font-mono-data ${projectedMargin < product.minMarginPct ? 'text-blocked' : 'text-approved'}`}>
                {projectedMargin.toFixed(1)}%
              </span>
              .
            </div>
            <div className="rounded-md border border-border bg-bg/50 px-3 py-2.5 text-text-secondary">
              Routing proposal to the <span className="text-razor-cyan">Financial Policy Firewall</span> for
              deterministic authorization. Agent has no authority to finalize this transaction.
            </div>
            {activeEvaluation && activeIntent && activeIntent.id === selectedIntentId && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono-data text-text-tertiary uppercase">Firewall verdict</span>
                  <StatusBadge verdict={activeEvaluation.verdict} compact />
                </div>
                <FirewallChecklist checks={activeEvaluation.checks} />
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Negotiation History" eyebrow={`${intents.length} proposals received`}>
        <div className="space-y-2">
          {intents.map((intent) => {
            const ev = evaluations.find((e) => e.intentId === intent.id);
            return (
              <button
                key={intent.id}
                onClick={() => setSelectedIntentId(intent.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md border text-left transition-colors ${
                  selectedIntentId === intent.id
                    ? 'border-razor-blue/50 bg-razor-blue/5'
                    : 'border-border bg-bg/40 hover:bg-surface-2'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium truncate">
                    {intent.buyerOrg} — {intent.requestedQty} units, {intent.requestedDiscountPct}% off
                  </div>
                  <div className="text-[10.5px] text-text-tertiary font-mono-data">
                    {new Date(intent.timestamp).toLocaleString()}
                  </div>
                </div>
                {ev && <StatusBadge verdict={ev.verdict} compact />}
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};
