import React from 'react';

export const StatusBadge = ({ status, label }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'ok':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'connecting':
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'error':
      case 'disconnected':
      case 'offline':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getDotStyle = () => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'ok':
        return 'bg-emerald-400';
      case 'connecting':
      case 'warning':
        return 'bg-amber-400';
      case 'error':
      case 'disconnected':
      case 'offline':
        return 'bg-rose-400';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getBadgeStyle()}`}>
      <span className={`w-2 h-2 rounded-full animate-pulse ${getDotStyle()}`} />
      {label || status}
    </span>
  );
};
