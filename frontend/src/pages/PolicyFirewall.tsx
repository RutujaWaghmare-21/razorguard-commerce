import React, { useState } from 'react';
import { ShieldCheck, Save } from 'lucide-react';
import { Panel } from '../components/common/Panel';
import { useAppStore } from '../store/AppStore';
import type { MerchantPolicy } from '../types';

const RuleInput: React.FC<{
  label: string;
  hint: string;
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
}> = ({ label, hint, value, suffix = '', onChange }) => (
  <div className="rounded-lg border border-border bg-bg/40 p-4">
    <div className="text-[12.5px] font-medium mb-0.5">{label}</div>
    <div className="text-[11px] text-text-tertiary mb-3">{hint}</div>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 bg-surface border border-border rounded-md px-2.5 py-1.5 text-[13px] font-mono-data focus:outline-none focus:border-razor-blue"
      />
      {suffix && <span className="text-[12px] text-text-tertiary font-mono-data">{suffix}</span>}
    </div>
  </div>
);

export const PolicyFirewall: React.FC = () => {
  const { policy, setPolicy } = useAppStore();
  const [draft, setDraft] = useState<MerchantPolicy>(policy);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof MerchantPolicy, value: number) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck size={19} className="text-razor-cyan" />
            Financial Policy Firewall
          </h1>
          <p className="text-text-secondary text-[13px] mt-1">
            These thresholds are deterministic. No negotiation message, rationale, or prompt from any AI agent
            can override them.
          </p>
        </div>
        <button
          onClick={() => {
            setPolicy(draft);
            setSaved(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-razor-blue to-razor-cyan text-bg text-[12.5px] font-semibold hover:opacity-90 transition-opacity"
        >
          <Save size={13} strokeWidth={2.5} />
          {saved ? 'Saved' : 'Save Policy'}
        </button>
      </div>

      <Panel title="Margin & Discount Controls" eyebrow="Core rules">
        <div className="grid grid-cols-2 gap-4">
          <RuleInput
            label="Minimum margin"
            hint="No autonomous quote may resolve below this margin."
            value={draft.minMarginPct}
            suffix="%"
            onChange={(v) => update('minMarginPct', v)}
          />
          <RuleInput
            label="Maximum discount"
            hint="Hard ceiling on any single-line discount, bulk or otherwise."
            value={draft.maxDiscountPct}
            suffix="%"
            onChange={(v) => update('maxDiscountPct', v)}
          />
          <RuleInput
            label="Bulk discount ceiling"
            hint="Caps stacked bulk-tier discounts, even for large orders."
            value={draft.bulkDiscountCeilingPct}
            suffix="%"
            onChange={(v) => update('bulkDiscountCeilingPct', v)}
          />
        </div>
      </Panel>

      <Panel title="Order Authority" eyebrow="Autonomy limits">
        <div className="grid grid-cols-2 gap-4">
          <RuleInput
            label="Maximum autonomous order value"
            hint="Orders above this value are routed to human approval, even if profitable."
            value={draft.maxAutonomousOrderValue}
            suffix="₹"
            onChange={(v) => update('maxAutonomousOrderValue', v)}
          />
          <RuleInput
            label="Human approval threshold"
            hint="Mirrors autonomous ceiling by default — can be set independently."
            value={draft.humanApprovalThreshold}
            suffix="₹"
            onChange={(v) => update('humanApprovalThreshold', v)}
          />
          <RuleInput
            label="Maximum quantity per order"
            hint="Blocks single proposals that exceed reasonable fulfillment capacity."
            value={draft.maxQuantityPerOrder}
            suffix="units"
            onChange={(v) => update('maxQuantityPerOrder', v)}
          />
        </div>
      </Panel>

      <Panel title="Live Simulation" eyebrow="What happens with these settings">
        <div className="grid grid-cols-3 gap-3 text-[12px] font-mono-data">
          <div className="rounded-md border border-blocked/30 bg-blocked/5 p-3">
            <div className="text-blocked font-semibold mb-1">90% discount request</div>
            <div className="text-text-tertiary">
              Discount far exceeds the {draft.maxDiscountPct}% ceiling and drives margin negative →{' '}
              <span className="text-blocked">BLOCKED</span>
            </div>
          </div>
          <div className="rounded-md border border-review/30 bg-review/5 p-3">
            <div className="text-review font-semibold mb-1">₹{(draft.humanApprovalThreshold * 1.5).toLocaleString('en-IN')} order</div>
            <div className="text-text-tertiary">
              Profitable, within discount limits, but exceeds ₹{draft.humanApprovalThreshold.toLocaleString('en-IN')} →{' '}
              <span className="text-review">REQUIRES APPROVAL</span>
            </div>
          </div>
          <div className="rounded-md border border-approved/30 bg-approved/5 p-3">
            <div className="text-approved font-semibold mb-1">{Math.round(draft.maxDiscountPct / 2)}% discount, 100 units</div>
            <div className="text-text-tertiary">
              Within margin, discount, quantity and value limits → <span className="text-approved">APPROVED</span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};
