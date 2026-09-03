import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  FileJson,
  Cpu,
  Search,
  GitBranch,
  ShieldCheck,
  Gavel,
  CreditCard,
  Webhook,
  BookLock,
} from 'lucide-react';

const stages = [
  { key: 'buyer', label: 'External AI Buyer', icon: Bot },
  { key: 'intent', label: 'Machine Intent (AP2)', icon: FileJson },
  { key: 'agent', label: 'Negotiation Agent', icon: Cpu },
  { key: 'catalog', label: 'Semantic Catalog', icon: Search },
  { key: 'state', label: 'Negotiation State Machine', icon: GitBranch },
  { key: 'firewall', label: 'Financial Policy Firewall', icon: ShieldCheck },
  { key: 'verdict', label: 'Approve / Reject / Review', icon: Gavel },
  { key: 'order', label: 'Razorpay Order (Test)', icon: CreditCard },
  { key: 'webhook', label: 'Webhook Verification', icon: Webhook },
  { key: 'audit', label: 'Immutable Audit Trail', icon: BookLock },
];

export const PipelineFlow: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((i) => (i + 1) % stages.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid-texture rounded-xl border border-border bg-surface/50 p-6 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-[1050px]">
        {stages.map((stage, idx) => {
          const isActive = idx === activeIdx;
          const isPast = idx < activeIdx;
          const isFirewall = stage.key === 'firewall';
          return (
            <React.Fragment key={stage.key}>
              <motion.div
                className="flex flex-col items-center gap-2 w-[92px] shrink-0"
                animate={{ opacity: isActive ? 1 : isPast ? 0.55 : 0.35 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="w-11 h-11 rounded-lg flex items-center justify-center border relative"
                  style={{
                    borderColor: isActive
                      ? isFirewall
                        ? '#00D2FF'
                        : '#0C83FF'
                      : '#1E293B',
                    backgroundColor: isActive ? 'rgba(12,131,255,0.12)' : 'rgba(255,255,255,0.02)',
                  }}
                  animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <stage.icon
                    size={18}
                    strokeWidth={2}
                    className={isActive ? 'text-razor-cyan' : 'text-text-tertiary'}
                  />
                  {isActive && (
                    <span className="absolute -inset-1 rounded-lg border border-razor-cyan/40 animate-pulse-glow" />
                  )}
                </motion.div>
                <span
                  className={`text-[9.5px] text-center leading-tight font-mono-data ${
                    isActive ? 'text-text-primary' : 'text-text-tertiary'
                  }`}
                >
                  {stage.label}
                </span>
              </motion.div>
              {idx < stages.length - 1 && (
                <div className="flex-1 h-px bg-border relative mb-6 min-w-[18px]">
                  {isPast && (
                    <motion.div
                      className="absolute inset-0 h-px bg-gradient-to-r from-razor-blue to-razor-cyan"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{ transformOrigin: 'left' }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
