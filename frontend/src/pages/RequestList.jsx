import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SLABadge from '../components/SLABadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Search,
  Filter,
  FileText,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export default function RequestList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [requestTypeCode, setRequestTypeCode] = useState(searchParams.get('request_type_code') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [slaStatus, setSlaStatus] = useState(searchParams.get('sla_status') || '');
  const [scope, setScope] = useState(searchParams.get('scope') || 'all');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  useEffect(() => {
    fetchRequests();
  }, [search, requestTypeCode, status, priority, slaStatus, scope, page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const queryParts = [
        `page=${page}`,
        `limit=10`,
        scope ? `scope=${scope}` : '',
        search ? `search=${encodeURIComponent(search)}` : '',
        requestTypeCode ? `request_type_code=${requestTypeCode}` : '',
        status ? `status=${status}` : '',
        priority ? `priority=${priority}` : '',
        slaStatus ? `sla_status=${slaStatus}` : ''
      ].filter(Boolean).join('&');

      const res = await api.getRequests(queryParts);
      setRequests(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setRequestTypeCode('');
    setStatus('');
    setPriority('');
    setSlaStatus('');
    setScope('all');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Enterprise Request Directory</h1>
          <p className="text-xs text-slate-500">
            Centralized queue of all business operations & approval requests ({meta.total} total)
          </p>
        </div>
        <Link
          to="/create-request"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Request</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by REQ ID, Title, Keyword..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Request Type */}
          <div>
            <select
              value={requestTypeCode}
              onChange={(e) => {
                setRequestTypeCode(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Workflow Types</option>
              <option value="SOFTWARE_ACCESS">Software Access</option>
              <option value="EXPENSE_REIMBURSEMENT">Expense Reimbursement</option>
              <option value="DOCUMENT_APPROVAL">Document Approval</option>
              <option value="EQUIPMENT_REQUEST">Equipment Request</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVAL_PENDING">Approval Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
            </select>
          </div>

          {/* SLA Filter */}
          <div>
            <select
              value={slaStatus}
              onChange={(e) => {
                setSlaStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All SLA Statuses</option>
              <option value="WITHIN_SLA">Within SLA</option>
              <option value="APPROACHING_SLA">Approaching SLA</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="COMPLETED_WITHIN_SLA">Completed Within SLA</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={handleResetFilters}
            className="text-slate-500 hover:text-indigo-600 font-semibold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
          <span className="text-slate-400 font-mono text-[11px]">
            Showing {requests.length} of {meta.total} records
          </span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSkeleton />
        ) : requests.length === 0 ? (
          <div className="text-center py-16 p-4 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-sm font-bold text-slate-700">No requests match your current filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or reset filters to view all organization requests.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Title & Type</th>
                  <th className="py-3.5 px-4">Requester</th>
                  <th className="py-3.5 px-4">Stage & Status</th>
                  <th className="py-3.5 px-4">SLA Deadline</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      {req.request_number}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link to={`/requests/${req.id}`} className="font-bold text-slate-800 hover:text-indigo-600 line-clamp-1">
                        {req.title}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono font-medium block">
                        {req.request_type?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{req.creator?.full_name}</p>
                      <p className="text-[10px] text-slate-400">{req.department?.name}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <StatusBadge status={req.status} />
                        <p className="text-[10px] text-slate-500 font-medium">Stage: {req.current_stage}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SLABadge sla={req.sla} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/requests/${req.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold rounded-lg transition-colors inline-block"
                      >
                        View Request
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
