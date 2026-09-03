import React from 'react';

export const Panel: React.FC<{
  title?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, eyebrow, right, className = '', children }) => {
  return (
    <div className={`rounded-xl border border-border bg-surface/70 ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            {eyebrow && (
              <div className="text-[10px] font-mono-data tracking-[0.14em] text-text-tertiary uppercase mb-0.5">
                {eyebrow}
              </div>
            )}
            {title && <h3 className="text-[13px] font-semibold text-text-primary">{title}</h3>}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
