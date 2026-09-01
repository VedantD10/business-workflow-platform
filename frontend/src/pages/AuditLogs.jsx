import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { History, Search, ShieldCheck } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs('limit=100');
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="w-6 h-6 text-indigo-600" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Organization Audit Trail Log</h1>
          <p className="text-xs text-slate-500">Immutable audit record of all enterprise decisions and workflow state changes</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Request Number</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">State Transition</th>
                <th className="py-3.5 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-indigo-600 whitespace-nowrap">{log.request_number}</td>
                  <td className="py-3 px-4 text-slate-800 font-sans font-semibold whitespace-nowrap">{log.actor_name}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{log.action}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {log.previous_state || 'New'} → {log.new_state}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
