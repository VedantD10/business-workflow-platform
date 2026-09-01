import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Analytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardMetrics();
      setMetrics(res.data?.operations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Organization Operational Analytics</h1>
        <p className="text-xs text-slate-500">
          Executive performance dashboard, SLA compliance, and bottleneck identification
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total System Reqs</span>
          <span className="text-2xl font-black text-slate-900">{metrics.total_requests}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">SLA Target Compliance</span>
          <span className="text-2xl font-black text-emerald-600">{metrics.sla_performance_percent}%</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Avg Resolution Time</span>
          <span className="text-2xl font-black text-indigo-600">{metrics.avg_processing_time_hours}h</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Overdue SLA Reqs</span>
          <span className="text-2xl font-black text-red-600">{metrics.overdue_requests}</span>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Departmental Workload & SLA Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-3 px-4">Department Code</th>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Total Reqs</th>
                <th className="py-3 px-4">Active Open</th>
                <th className="py-3 px-4">Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.requests_by_department.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{dept.department_code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{dept.department_name}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{dept.total}</td>
                  <td className="py-3 px-4 font-mono text-amber-600 font-bold">{dept.open}</td>
                  <td className="py-3 px-4 font-mono text-red-600 font-bold">{dept.overdue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottlenecks Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Operational Stage Bottleneck Analysis
        </h2>
        <div className="space-y-4">
          {metrics.bottleneck_analysis.map((b, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">{b.stage_name}</p>
                <p className="text-[10px] text-slate-400">Current pending queue depth</p>
              </div>
              <span className="font-mono font-bold text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg">
                {b.pending_count} pending
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
