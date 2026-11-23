import React from 'react';

/**
 * DRIVAIR Semantic Status Badge (readme1.md 4.4)
 * Consistent text + semantic color + icon. Never relies on color alone.
 */
export default function Badge({ status = 'pending', label = null, className = '' }) {
  const normalized = status.toLowerCase();

  const configs = {
    verified: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
      defaultLabel: 'Verified',
    },
    active: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400 animate-pulse',
      defaultLabel: 'Active',
    },
    completed: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
      defaultLabel: 'Completed',
    },
    accepted: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
      defaultLabel: 'Accepted',
    },
    pending: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
      defaultLabel: 'Pending',
    },
    negotiating: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
      defaultLabel: 'Negotiating',
    },
    rejected: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400',
      defaultLabel: 'Rejected',
    },
    cancelled: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400',
      defaultLabel: 'Cancelled',
    },
    suspended: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400',
      defaultLabel: 'Suspended',
    },
    open: {
      bg: 'bg-sky-500/15',
      text: 'text-sky-400',
      border: 'border-sky-500/30',
      dot: 'bg-sky-400',
      defaultLabel: 'Open',
    },
    brand: {
      bg: 'bg-[#FDE047]/15',
      text: 'text-[#FDE047]',
      border: 'border-[#FDE047]/30',
      dot: 'bg-[#FDE047]',
      defaultLabel: 'Featured',
    },
  };

  const config = configs[normalized] || {
    bg: 'bg-white/10',
    text: 'text-slate-300',
    border: 'border-white/15',
    dot: 'bg-slate-400',
    defaultLabel: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border uppercase ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
}
