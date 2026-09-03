import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel } from 'lucide-react';
import type { FirewallEvaluation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

const verdictStyle = {
  APPROVED: { color: '#10B981', glow: 'rgba(16,185,129,0.25)' },
  REQUIRES_APPROVAL: { color: '#F59E0B', glow: 'rgba(245,158,11,0.25)' },
  BLOCKED: { color: '#EF4444', glow: 'rgba(239,68,68,0.3)' },
};

export const VerdictReveal: React.FC<{ evaluation: FirewallEvaluation | null }> = ({ evaluation }) => {
  return (
    <div className="relative flex flex-col items-center justify-center py-8 min-h-[200px]">
      <AnimatePresence mode="wait">
        {evaluation ? (
          <motion.div
            key={evaluation.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ rotate: -35, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.15 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center border-2"
              style={{
                borderColor: verdictStyle[evaluation.verdict].color,
                boxShadow: `0 0 40px ${verdictStyle[evaluation.verdict].glow}`,
                backgroundColor: 'rgba(10,13,20,0.6)',
              }}
            >
              <Gavel size={32} strokeWidth={2} color={verdictStyle[evaluation.verdict].color} />
            </motion.div>
            <StatusBadge verdict={evaluation.verdict} />
            <p className="text-[12px] font-mono-data text-text-secondary text-center max-w-md">
              {evaluation.reason}
            </p>
            {evaluation.counterOffer && (
              <div className="mt-1 px-4 py-2.5 rounded-lg border border-razor-blue/30 bg-razor-blue/5 text-[11px] font-mono-data text-center max-w-md">
                <span className="text-razor-cyan font-semibold">DETERMINISTIC COUNTER-OFFER </span>
                <span className="text-text-secondary">
                  — ₹{Math.round(evaluation.counterOffer.unitPrice).toLocaleString('en-IN')}/unit at{' '}
                  {evaluation.counterOffer.discountPct.toFixed(1)}% discount. {evaluation.counterOffer.note}
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-[12px] font-mono-data text-text-tertiary">Awaiting proposal…</div>
        )}
      </AnimatePresence>
    </div>
  );
};
