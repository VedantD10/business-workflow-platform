import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SLABadge from '../components/SLABadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  BarChart3,
  PlusCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const metricsRes = await api.getDashboardMetrics();
      setMetrics(metricsRes.data);

      const scope = user?.role === 'EMPLOYEE' ? 'my_requests' : 'all';
      const requestsRes = await api.getRequests(`limit=5&scope=${scope}`);
      setRecentRequests(requestsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) return <LoadingSkeleton />;

  const role = user?.role;
  const isEmployee = role === 'EMPLOYEE';
  const isManager = role === 'REPORTING_MANAGER' || role === 'DEPARTMENT_HEAD';
  const isDeptStaff = role === 'DEPARTMENT_STAFF';
  const isOpsOrAdmin = role === 'OPERATIONS_MANAGER' || role === 'SYSTEM_ADMIN';

  const emp = metrics.employee;
  const mgr = metrics.manager;
  const dept = metrics.department;
  const ops = metrics.operations;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Welcome back, {user?.full_name}</h1>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-mono font-semibold">
              {role?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Department: <span className="font-semibold text-white">{user?.department?.name || 'General'}</span> | Enterprise Request Lifecycle Engine
          </p>
        </div>
        <Link
          to="/create-request"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Business Request</span>
        </Link>
      </div>

      {/* SLA Alert Warning Banner */}
      {ops.overdue_requests > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-amber-800 text-xs shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">SLA Escalation Alert:</span> {ops.overdue_requests} active request(s) have exceeded target processing SLA times.
            </div>
          </div>
          <Link to="/requests?sla_status=OVERDUE" className="font-bold text-indigo-700 hover:underline shrink-0 flex items-center">
            Review Overdue <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Requests</span>
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{isEmployee ? emp.active_requests : ops.open_requests}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isEmployee ? 'Submitted requests currently in pipeline' : 'Total active requests across all departments'}
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Action</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {isManager ? mgr.pending_approvals : isDeptStaff ? dept.assigned_requests : emp.awaiting_action}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isManager ? 'Requests awaiting your managerial approval' : isDeptStaff ? 'Operational tasks assigned' : 'Requests requiring clarification'}
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Target SLA Compliance</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{ops.sla_performance_percent}%</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            Avg completion time: {ops.avg_processing_time_hours}h
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Requests</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{isEmployee ? emp.recently_completed : ops.completed_requests}</p>
          <p className="text-[11px] text-slate-400 mt-1">Fulfilled business operations requests</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Requests & Workload Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Requests Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {isEmployee ? 'My Active Request Queue' : 'Recent Enterprise Requests'}
              </h2>
              <p className="text-xs text-slate-400">Live synchronized workflow requests</p>
            </div>
            <Link to="/requests" className="text-xs font-bold text-indigo-600 hover:underline flex items-center">
              View All Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">You're all caught up!</p>
                <p className="text-[11px] text-slate-400">No active requests requiring attention right now.</p>
              </div>
            ) : (
              recentRequests.map((req) => (
                <div key={req.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-600">{req.request_number}</span>
                      <StatusBadge status={req.status} />
                      <SLABadge sla={req.sla} />
                    </div>
                    <Link to={`/requests/${req.id}`} className="text-xs font-bold text-slate-800 hover:text-indigo-600 block">
                      {req.title}
                    </Link>
                    <p className="text-[11px] text-slate-400">
                      Submitted by: <span className="font-medium text-slate-700">{req.creator?.full_name}</span> ({req.department?.name}) • {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/requests/${req.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold rounded-lg transition-colors shrink-0"
                  >
                    View Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Bottleneck & Department Workload */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
              Workflow Bottleneck Detection
            </h2>
            <p className="text-xs text-slate-400 mb-4">Stages with highest pending workload</p>

            <div className="space-y-3">
              {ops.bottleneck_analysis.slice(0, 4).map((b, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate max-w-[180px]">{b.stage_name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, b.pending_count * 25)}%` }}
                      ></div>
                    </div>
                    <span className="font-mono font-bold text-slate-800 w-6 text-right">{b.pending_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
              Category Breakdown
            </h2>
            <p className="text-xs text-slate-400 mb-4">Workload across 4 mandatory workflows</p>

            <div className="space-y-2.5">
              {ops.requests_by_category.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800">{cat.category_name}</p>
                    <p className="text-[10px] text-slate-400">Target SLA: {cat.sla_hours}h</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {cat.total} reqs
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
