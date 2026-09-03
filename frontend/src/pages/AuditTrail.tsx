import React, { useState } from 'react';
import { BookLock, Lock } from 'lucide-react';
import { Panel } from '../components/common/Panel';
import { JsonView } from '../components/common/JsonView';
import { useAppStore } from '../store/AppStore';

const typeColor: Record<string, string> = {
  INTENT_RECEIVED: '#00D2FF',
  FIREWALL_EVALUATION: '#0C83FF',
  HUMAN_DECISION: '#F59E0B',
  ORDER_CREATED: '#10B981',
  WEBHOOK_RECEIVED: '#10B981',
  ATTACK_BLOCKED: '#EF4444',
};

export const AuditTrail: React.FC = () => {
  const { auditLog } = useAppStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BookLock size={19} className="text-razor-cyan" />
          Audit Trail & Ledger
        </h1>
        <p className="text-text-secondary text-[13px] mt-1">
          Every evaluation, decision, and settlement event, hash-chained and immutable. Nothing here can be
          edited after the fact — including by the AI agent.
        </p>
      </div>

      <Panel title="Immutable Event Ledger" eyebrow={`${auditLog.length} entries · append-only`}>
        <div className="space-y-2">
          {auditLog.map((entry, idx) => (
            <div key={entry.id} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-bg/40 hover:bg-surface-2/60 transition-colors text-left"
              >
                <Lock size={12} className="text-text-tertiary shrink-0" />
                <span className="text-[10px] font-mono-data text-text-tertiary shrink-0">
                  #{String(auditLog.length - idx).padStart(4, '0')}
                </span>
                <span
                  className="text-[9.5px] font-mono-data uppercase font-semibold px-1.5 py-0.5 rounded shrink-0"
                  style={{ color: typeColor[entry.type], backgroundColor: `${typeColor[entry.type]}14` }}
                >
                  {entry.type}
                </span>
                <span className="text-[12px] text-text-secondary truncate flex-1">{entry.summary}</span>
                <span className="text-[10px] font-mono-data text-text-tertiary shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </button>
              {expanded === entry.id && (
                <div className="p-3 border-t border-border">
                  <JsonView data={entry.payload} />
                </div>
              )}
            </div>
          ))}
          {auditLog.length === 0 && (
            <div className="text-center py-8 text-text-tertiary font-mono-data text-[12px]">
              Ledger is empty — activity from negotiations will appear here.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
};
