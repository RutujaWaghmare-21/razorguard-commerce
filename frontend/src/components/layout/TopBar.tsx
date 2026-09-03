import React from 'react';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/AppStore';

const StatusPill: React.FC<{ label: string; value: string; dotColor: string }> = ({
  label,
  value,
  dotColor,
}) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface/60">
    <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ backgroundColor: dotColor }} />
    <span className="text-[10px] font-mono-data text-text-tertiary uppercase tracking-wide">{label}</span>
    <span className="text-[11px] font-mono-data text-text-primary">{value}</span>
  </div>
);

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { gatewayStatus } = useAppStore();

  const gatewayLabel = gatewayStatus.reachable
    ? gatewayStatus.razorpayConfigured
      ? 'LIVE TEST ORDERS'
      : 'BACKEND (MOCK)'
    : 'MOCK ONLY';
  const gatewayColor = gatewayStatus.reachable
    ? gatewayStatus.razorpayConfigured
      ? '#10B981'
      : '#F59E0B'
    : '#565E70';

  return (
    <header className="h-14 border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <StatusPill label="Env" value="TEST MODE" dotColor="#F59E0B" />
        <StatusPill label="Gateway" value={gatewayLabel} dotColor={gatewayColor} />
        <StatusPill label="AI Agent" value="ACTIVE" dotColor="#00D2FF" />
        <StatusPill label="Policy Engine" value="ENFORCED" dotColor="#10B981" />
      </div>
      <button
        onClick={() => navigate('/simulator')}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-razor-blue to-razor-cyan text-bg text-[12px] font-semibold hover:opacity-90 transition-opacity"
      >
        <Zap size={13} strokeWidth={2.5} />
        LAUNCH DEMO MODE
      </button>
    </header>
  );
};
