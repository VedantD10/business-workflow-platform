import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import SLABadge from '../components/SLABadge';
import WorkflowProgress from '../components/WorkflowProgress';
import ActionModal from '../components/ActionModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  FileText,
  User,
  Building,
  Calendar,
  Paperclip,
  MessageSquare,
  History,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  CheckCircle2,
  Upload,
  Download,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment & Attachment state
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Workflow Action Modal state
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getRequestById(id);
      setRequest(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowActionSubmit = async ({ action, comments }) => {
    try {
      await api.executeWorkflowAction(id, { action, comments });
      await fetchRequestDetails();
    } catch (err) {
      throw err;
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      await api.addComment(id, newComment);
      setNewComment('');
      await fetchRequestDetails();
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleUploadAttachment = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploadLoading(true);
      await api.uploadAttachment(id, uploadFile);
      setUploadFile(null);
      await fetchRequestDetails();
    } catch (err) {
      alert(err.message || 'Failed to upload attachment');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error || !request) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-red-800">Request Access Error</h2>
        <p className="text-xs text-red-600 mt-1 mb-4">{error}</p>
        <Link to="/requests" className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl">
          Back to Directory
        </Link>
      </div>
    );
  }

  const isOwner = request.user_id === user?.id;
  const isTerminalState = ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(request.status);
  const isManagerOrAdmin = ['REPORTING_MANAGER', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN'].includes(user?.role);
  const isDeptStaff = ['DEPARTMENT_STAFF', 'SYSTEM_ADMIN'].includes(user?.role);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <Link to="/requests" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Request Directory
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                {request.request_number}
              </span>
              <StatusBadge status={request.status} />
              <SLABadge sla={request.sla} />
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-2">{request.title}</h1>
          </div>

          {/* Workflow Action Buttons Panel */}
          {!isTerminalState && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Manager Approval Actions */}
              {isManagerOrAdmin && !isOwner && ['SUBMITTED', 'UNDER_REVIEW', 'APPROVAL_PENDING'].includes(request.status) && (
                <>
                  <button
                    onClick={() => setModalAction('APPROVE')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setModalAction('REQUEST_CHANGES')}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Request Changes</span>
                  </button>
                  <button
                    onClick={() => setModalAction('REJECT')}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </>
              )}

              {/* Department Staff Operational Actions */}
              {isDeptStaff && request.status === 'APPROVED' && (
                <button
                  onClick={() => setModalAction('START_PROCESSING')}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Processing</span>
                </button>
              )}

              {isDeptStaff && request.status === 'PROCESSING' && (
                <button
                  onClick={() => setModalAction('COMPLETE_TASK')}
                  className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Request</span>
                </button>
              )}

              {/* Request Owner Actions */}
              {isOwner && request.status === 'CHANGES_REQUESTED' && (
                <button
                  onClick={() => setModalAction('RESUBMIT')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Resubmit Updated Request</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Submitted By</span>
            <span className="font-semibold text-slate-800">{request.creator?.full_name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Department</span>
            <span className="font-semibold text-slate-800">{request.department?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Submission Date</span>
            <span className="font-semibold text-slate-800">{new Date(request.created_at).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Current Active Stage</span>
            <span className="font-semibold text-indigo-600">{request.current_stage}</span>
          </div>
        </div>
      </div>

      {/* Visual Workflow Progress Timeline */}
      <WorkflowProgress timeline={request.timeline} />

      {/* Request Content & Custom Fields */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Business Purpose & Details</h3>
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{request.description}</p>

        {/* Custom Fields Key-Values */}
        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
            {request.request_type?.name} Form Attributes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.entries(request.custom_fields || {}).map(([key, val]) => (
              <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="font-semibold text-slate-800">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attachments & Documents Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Paperclip className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Supporting Attachments ({request.attachments?.length || 0})
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {request.attachments?.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No attachments uploaded for this request.</p>
          ) : (
            request.attachments.map((att) => (
              <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-800">{att.file_name}</p>
                    <p className="text-[10px] text-slate-400">
                      {(att.file_size / 1024).toFixed(1)} KB • {new Date(att.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={`/api/attachments/download/${att.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 font-semibold rounded-lg flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            ))
          )}
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUploadAttachment} className="pt-3 border-t border-slate-100 flex items-center space-x-3">
          <input
            type="file"
            onChange={(e) => setUploadFile(e.target.files[0])}
            className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-indigo-50 cursor-pointer"
          />
          <button
            type="submit"
            disabled={!uploadFile || uploadLoading}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploadLoading ? 'Uploading...' : 'Upload File'}</span>
          </button>
        </form>
      </div>

      {/* Communication & Comments Thread */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Comments & Clarifications Thread
          </h3>
        </div>

        <div className="space-y-3">
          {request.comments?.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No comments posted yet.</p>
          ) : (
            request.comments.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{c.author_name}</span>
                  <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-700 leading-snug">{c.comment_text}</p>
              </div>
            ))
          )}
        </div>

        {/* Post Comment Form */}
        <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 space-y-2">
          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment or reply to request clarification..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || commentLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Log History Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Immutable Audit Trail History
          </h3>
        </div>

        <div className="space-y-3 pl-2 border-l-2 border-slate-200">
          {request.auditLogs?.map((al, idx) => (
            <div key={idx} className="relative pl-4 text-xs space-y-0.5">
              <div className="absolute -left-[9px] top-1 w-3 h-3 bg-indigo-600 rounded-full ring-4 ring-white"></div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-800">{al.actor_name}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                  {al.action}
                </span>
                <span className="text-[10px] text-slate-400 ml-auto">
                  {new Date(al.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-600">{al.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Action Confirmation Modal */}
      {modalAction && (
        <ActionModal
          isOpen={Boolean(modalAction)}
          onClose={() => setModalAction(null)}
          onSubmit={handleWorkflowActionSubmit}
          actionType={modalAction}
          requestNumber={request.request_number}
        />
      )}
    </div>
  );
}
