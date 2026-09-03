import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { FirewallCheck } from '../../types';

export const FirewallChecklist: React.FC<{ checks: FirewallCheck[] }> = ({ checks }) => {
  return (
    <div className="space-y-1.5">
      {checks.map((c, i) => (
        <motion.div
          key={c.rule}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center justify-between rounded-md border px-3 py-2 font-mono-data text-[11px]"
          style={{
            borderColor: c.passed ? '#10B98133' : '#EF444433',
            backgroundColor: c.passed ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.06)',
          }}
        >
          <div className="flex items-center gap-2">
            {c.passed ? (
              <Check size={13} className="text-approved shrink-0" strokeWidth={3} />
            ) : (
              <X size={13} className="text-blocked shrink-0" strokeWidth={3} />
            )}
            <span className="text-text-secondary">{c.rule}</span>
          </div>
          <div className="flex items-center gap-3 text-right">
            <span className="text-text-tertiary">limit {c.limit}</span>
            <span className={c.passed ? 'text-approved' : 'text-blocked'}>{c.actual}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
