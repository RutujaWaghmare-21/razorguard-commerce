import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Ban, Clock3 } from 'lucide-react';
import { Panel } from '../components/common/Panel';
import { PipelineFlow } from '../components/pipeline/PipelineFlow';
import { useAppStore } from '../store/AppStore';
import { seedIntents } from '../data/mockLogs';

const StatCard: React.FC<{ label: string; value: string; icon: React.ElementType; color: string }> = ({
  label,
  value,
  icon: Icon,
  color,
}) => (
  <div className="rounded-xl border border-border bg-surface/70 p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-mono-data tracking-[0.14em] text-text-tertiary uppercase">{label}</span>
      <Icon size={16} color={color} strokeWidth={2} />
    </div>
    <div className="text-2xl font-bold font-mono-data" style={{ color }}>
      {value}
    </div>
  </div>
);

const actorColor: Record<string, string> = {
  AI_AGENT: '#00D2FF',
  FIREWALL: '#0C83FF',
  MERCHANT: '#F59E0B',
  RAZORPAY: '#10B981',
};

export const ControlRoom: React.FC = () => {
  const { auditLog, evaluations, submitIntent } = useAppStore();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    seedIntents.forEach((intent, i) => {
      setTimeout(() => submitIntent(intent), i * 350);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approved = evaluations.filter((e) => e.verdict === 'APPROVED').length;
  const blocked = evaluations.filter((e) => e.verdict === 'BLOCKED').length;
  const review = evaluations.filter((e) => e.verdict === 'REQUIRES_APPROVAL').length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-gradient-to-br from-surface via-surface to-razor-blue/5 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-razor-blue/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono-data tracking-[0.14em] text-razor-cyan uppercase mb-4 px-2.5 py-1 rounded-md border border-razor-cyan/30 bg-razor-cyan/5">
            <ShieldCheck size={12} strokeWidth={2.5} />
            Track 01 — Agentic Commerce
          </div>
          <h1 className="text-[32px] font-extrabold tracking-tight leading-tight max-w-2xl">
            AI can negotiate.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-razor-blue to-razor-cyan">
              Your policies decide.
            </span>
          </h1>
          <p className="text-text-secondary text-[14px] mt-3 max-w-lg">
            Every autonomous negotiation is settled by a deterministic financial policy firewall before a
            rupee moves. No exceptions, no prompt can override it.
          </p>
        </div>
      </div>

      <div>
        <div className="text-[11px] font-mono-data tracking-[0.14em] text-text-tertiary uppercase mb-3">
          Live Pipeline
        </div>
        <PipelineFlow />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Approved" value={String(approved)} icon={TrendingUp} color="#10B981" />
        <StatCard label="Blocked" value={String(blocked)} icon={Ban} color="#EF4444" />
        <StatCard label="Pending Review" value={String(review)} icon={Clock3} color="#F59E0B" />
        <StatCard label="Firewall Rules Active" value="5" icon={ShieldCheck} color="#00D2FF" />
      </div>

      <Panel title="Infrastructure Event Log" eyebrow="Real-time stream">
        <div className="space-y-2 max-h-[360px] overflow-y-auto">
          {auditLog.length === 0 && (
            <div className="text-[12px] text-text-tertiary font-mono-data">Waiting for events…</div>
          )}
          {auditLog.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 py-2 border-b border-border/60 last:border-0"
            >
              <span
                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: actorColor[entry.actor] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9.5px] font-mono-data uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{ color: actorColor[entry.actor], backgroundColor: `${actorColor[entry.actor]}14` }}
                  >
                    {entry.actor.replace('_', ' ')}
                  </span>
                  <span className="text-[9.5px] font-mono-data text-text-tertiary">{entry.type}</span>
                </div>
                <p className="text-[12.5px] text-text-secondary mt-0.5 truncate">{entry.summary}</p>
              </div>
              <span className="text-[10px] font-mono-data text-text-tertiary shrink-0">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </div>
      </Panel>
    </div>
  );
};
