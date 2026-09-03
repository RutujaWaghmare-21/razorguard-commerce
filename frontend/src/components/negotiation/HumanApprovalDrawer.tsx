import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check, Ban } from 'lucide-react';
import type { FirewallEvaluation, NegotiationIntent } from '../../types';
import { FirewallChecklist } from '../firewall/FirewallChecklist';

export const HumanApprovalDrawer: React.FC<{
  evaluation: FirewallEvaluation | null;
  intent: NegotiationIntent | null;
  onClose: () => void;
  onDecide: (approve: boolean, rationale: string) => void;
}> = ({ evaluation, intent, onClose, onDecide }) => {
  const [rationale, setRationale] = useState('');

  return (
    <AnimatePresence>
      {evaluation && intent && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-screen w-[420px] bg-surface border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-review" />
                <h3 className="text-[13px] font-semibold">Requires Human Approval</h3>
              </div>
              <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="rounded-lg border border-review/30 bg-review/5 p-4">
                <div className="text-[10px] font-mono-data text-text-tertiary uppercase mb-1">Order value</div>
                <div className="text-2xl font-bold font-mono-data text-review">
                  ₹{Math.round(evaluation.orderValue).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-text-secondary mt-1">{evaluation.reason}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono-data text-text-tertiary uppercase mb-2">Deal summary</div>
                <div className="text-[12.5px] text-text-secondary space-y-1">
                  <div>Buyer: <span className="text-text-primary">{intent.buyerOrg}</span></div>
                  <div>Quantity: <span className="text-text-primary font-mono-data">{intent.requestedQty} units</span></div>
                  <div>Discount: <span className="text-text-primary font-mono-data">{intent.requestedDiscountPct}%</span></div>
                  <div>Margin: <span className="text-approved font-mono-data">{evaluation.resultingMarginPct.toFixed(1)}%</span></div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono-data text-text-tertiary uppercase mb-2">Policy checks</div>
                <FirewallChecklist checks={evaluation.checks} />
              </div>

              <div>
                <label className="text-[10px] font-mono-data text-text-tertiary uppercase">Rationale</label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="e.g. Strategic account, approved by regional sales lead"
                  rows={3}
                  className="w-full mt-1 bg-bg border border-border rounded-md px-2.5 py-2 text-[12px] focus:outline-none focus:border-razor-blue resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  onDecide(false, rationale || 'Rejected without stated rationale.');
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md border border-blocked/40 text-blocked text-[12.5px] font-semibold hover:bg-blocked/10 transition-colors"
              >
                <Ban size={14} /> Reject
              </button>
              <button
                onClick={() => {
                  onDecide(true, rationale || 'Approved by merchant.');
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-approved text-bg text-[12.5px] font-semibold hover:opacity-90 transition-opacity"
              >
                <Check size={14} /> Approve
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
