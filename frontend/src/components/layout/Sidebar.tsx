import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  Radio,
  ScrollText,
  LayoutGrid,
  Receipt,
  BookLock,
  Crosshair,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Control Room', num: '01', icon: Radio },
  { to: '/negotiations', label: 'Live Negotiations', num: '02', icon: ScrollText },
  { to: '/firewall', label: 'Policy Firewall', num: '03', icon: ShieldCheck },
  { to: '/catalog', label: 'Dynamic Catalog', num: '04', icon: LayoutGrid },
  { to: '/transactions', label: 'Transactions', num: '05', icon: Receipt },
  { to: '/audit', label: 'Audit Trail', num: '06', icon: BookLock },
  { to: '/simulator', label: 'Attack & Scenario Simulator', num: '07', icon: Crosshair },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface/60 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-md bg-gradient-to-br from-razor-blue to-razor-cyan flex items-center justify-center">
            <ShieldCheck size={17} className="text-bg" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-wide leading-none">RAZORGUARD</div>
            <div className="text-[10px] text-text-tertiary tracking-[0.18em] font-mono-data mt-1">
              AGENTIC COMMERCE
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-[13px] transition-colors ${
                isActive
                  ? 'bg-surface-2 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`font-mono-data text-[10px] w-5 ${
                    isActive ? 'text-razor-cyan' : 'text-text-tertiary'
                  }`}
                >
                  {item.num}
                </span>
                <item.icon
                  size={15}
                  strokeWidth={2}
                  className={isActive ? 'text-razor-cyan' : 'text-text-tertiary group-hover:text-text-secondary'}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-razor-cyan animate-pulse-glow" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-[10px] font-mono-data text-text-tertiary leading-relaxed">
          "AI can negotiate, but
          <br />
          deterministic policies
          <br />
          authorize money."
        </div>
      </div>
    </aside>
  );
};
