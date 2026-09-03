import React from 'react';

export const JsonView: React.FC<{ data: unknown; className?: string }> = ({ data, className = '' }) => {
  return (
    <pre
      className={`font-mono-data text-[11px] leading-relaxed text-text-secondary bg-bg/60 rounded-lg border border-border p-3.5 overflow-x-auto whitespace-pre-wrap break-words ${className}`}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};
