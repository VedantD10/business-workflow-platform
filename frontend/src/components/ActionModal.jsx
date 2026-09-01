import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, X } from 'lucide-react';

export default function ActionModal({ isOpen, onClose, onSubmit, actionType, requestNumber }) {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isRejectOrChanges = ['REJECT', 'REQUEST_CHANGES'].includes(actionType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRejectOrChanges && (!comments || !comments.trim())) {
      setError(`A written justification is required when executing action: ${actionType}`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({ action: actionType, comments: comments.trim() });
      setComments('');
      onClose();
    } catch (err) {
      setError(err.message || 'Workflow action failed.');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    APPROVE: 'Approve Request',
    REJECT: 'Reject Request',
    REQUEST_CHANGES: 'Request Changes / Additional Clarification',
    START_PROCESSING: 'Start Operational Processing',
    COMPLETE_TASK: 'Mark Request as Completed'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            {actionType === 'APPROVE' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
            {actionType === 'REJECT' && <XCircle className="w-5 h-5 text-red-600" />}
            {actionType === 'REQUEST_CHANGES' && <RefreshCw className="w-5 h-5 text-amber-600" />}
            <h3 className="font-semibold text-slate-800 text-sm">{titles[actionType] || actionType}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600">
            Executing action <span className="font-bold text-slate-800">{actionType}</span> on request <span className="font-mono text-indigo-600 font-semibold">{requestNumber}</span>.
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comments / Decision Reason {isRejectOrChanges && <span className="text-red-500">*</span>}
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                isRejectOrChanges
                  ? 'Please specify the exact reason or required modifications...'
                  : 'Add optional approval comments or operational notes...'
              }
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              required={isRejectOrChanges}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors flex items-center ${
                actionType === 'REJECT'
                  ? 'bg-red-600 hover:bg-red-700'
                  : actionType === 'REQUEST_CHANGES'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Processing...' : 'Confirm Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
