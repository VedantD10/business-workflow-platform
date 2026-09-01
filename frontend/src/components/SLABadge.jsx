import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SLABadge({ sla }) {
  if (!sla) return null;

  const { sla_status, remaining_hours, target_hours, is_overdue } = sla;

  let style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let icon = <Clock className="w-3.5 h-3.5 mr-1" />;
  let label = `Within SLA (${remaining_hours}h left)`;

  if (sla_status === 'OVERDUE' || is_overdue) {
    style = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
    icon = <AlertCircle className="w-3.5 h-3.5 mr-1" />;
    label = `OVERDUE (${Math.abs(remaining_hours)}h past target)`;
  } else if (sla_status === 'APPROACHING_SLA') {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
    icon = <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
    label = `Approaching Deadline (${remaining_hours}h left)`;
  } else if (sla_status === 'COMPLETED_WITHIN_SLA') {
    style = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
    label = `Met Target SLA (${target_hours}h)`;
  } else if (sla_status === 'COMPLETED_AFTER_SLA') {
    style = 'bg-orange-50 text-orange-700 border-orange-200';
    icon = <Clock className="w-3.5 h-3.5 mr-1" />;
    label = `Completed Exceeded SLA Target (${target_hours}h)`;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${style}`}>
      {icon}
      {label}
    </span>
  );
}
