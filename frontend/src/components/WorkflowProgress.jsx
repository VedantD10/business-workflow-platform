import React from 'react';
import { CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

export default function WorkflowProgress({ timeline = [] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs mb-6">
      <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">
        Workflow Approval Lifecycle Pipeline
      </h3>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {timeline.map((step, idx) => {
          const isCompleted = step.status === 'COMPLETED';
          const isActive = step.status === 'ACTIVE';
          const isRejected = step.status === 'REJECTED';

          return (
            <React.Fragment key={idx}>
              <div className="flex items-center space-x-3 group">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                      : isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : isRejected
                      ? 'bg-red-500 text-white ring-4 ring-red-50'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isRejected ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <span>{step.stage_order}</span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      isActive
                        ? 'text-blue-700 font-bold'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.stage_name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Role: {step.required_role.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {idx < timeline.length - 1 && (
                <ArrowRight className="hidden sm:block w-4 h-4 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
