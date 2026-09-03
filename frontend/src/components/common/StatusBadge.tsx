import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { PolicyVerdict } from '../../types';

const config: Record<PolicyVerdict, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  APPROVED: { label: 'APPROVED', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
  REQUIRES_APPROVAL: { label: 'REQUIRES HUMAN APPROVAL', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle },
  BLOCKED: { label: 'BLOCKED', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
};

export const StatusBadge: React.FC<{ verdict: PolicyVerdict; compact?: boolean }> = ({ verdict, compact }) => {
  const c = config[verdict];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono-data font-semibold ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      }`}
      style={{ color: c.color, backgroundColor: c.bg, borderColor: `${c.color}33` }}
    >
      <Icon size={compact ? 11 : 13} strokeWidth={2.5} />
      {c.label}
    </span>
  );
};
