import React from 'react';

const STATUS_STYLES = {
  SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200 icon-clock',
  UNDER_REVIEW: 'bg-amber-50 text-amber-800 border-amber-200',
  APPROVAL_PENDING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  CHANGES_REQUESTED: 'bg-orange-50 text-orange-700 border-orange-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-300'
};

const STATUS_LABELS = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVAL_PENDING: 'Approval Pending',
  APPROVED: 'Approved',
  PROCESSING: 'In Processing',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CHANGES_REQUESTED: 'Changes Requested',
  CANCELLED: 'Cancelled'
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {label}
    </span>
  );
}
