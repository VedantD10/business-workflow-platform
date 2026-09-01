import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Laptop,
  Receipt,
  FileCheck,
  HardDrive,
  Send,
  Upload,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function CreateRequest() {
  const navigate = useNavigate();
  const [activeWorkflow, setActiveWorkflow] = useState('SOFTWARE_ACCESS');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Workflow Specific Custom Fields
  const [softwareFields, setSoftwareFields] = useState({
    software_name: 'Project Management System (Jira)',
    requested_access_level: 'Standard User',
    business_justification: 'Required for sprint planning and cross-team project coordination',
    required_date: '2026-09-10',
    additional_comments: ''
  });

  const [expenseFields, setExpenseFields] = useState({
    expense_category: 'Client Meeting & Travel',
    expense_date: '2026-08-30',
    amount: '4850',
    currency: 'INR',
    business_purpose: 'Client dinner meeting and local transportation',
    submission_date: '2026-09-01'
  });

  const [documentFields, setDocumentFields] = useState({
    document_title: 'Customer Data Handling Standard Operating Procedure',
    document_type: 'Internal Policy',
    document_version: '1.0',
    approval_deadline: '2026-09-15'
  });

  const [equipmentFields, setEquipmentFields] = useState({
    equipment_type: 'External 4K Monitor',
    quantity: '1',
    business_justification: 'High-resolution testing, multi-window debugging for software builds',
    required_date: '2026-09-10',
    additional_info: 'USB-C connectivity required'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and detailed description for your request.');
      return;
    }

    let customFields = {};
    if (activeWorkflow === 'SOFTWARE_ACCESS') customFields = softwareFields;
    else if (activeWorkflow === 'EXPENSE_REIMBURSEMENT') customFields = expenseFields;
    else if (activeWorkflow === 'DOCUMENT_APPROVAL') customFields = documentFields;
    else if (activeWorkflow === 'EQUIPMENT_REQUEST') customFields = equipmentFields;

    try {
      setLoading(true);
      setError('');

      const res = await api.createRequest({
        request_type_code: activeWorkflow,
        title: title.trim(),
        description: description.trim(),
        priority,
        custom_fields: customFields
      });

      const requestId = res.data.id;

      // Upload file attachment if provided
      if (file) {
        await api.uploadAttachment(requestId, file);
      }

      navigate(`/requests/${requestId}`);
    } catch (err) {
      setError(err.message || 'Failed to submit business request.');
    } finally {
      setLoading(false);
    }
  };

  const WORKFLOW_TABS = [
    { code: 'SOFTWARE_ACCESS', label: 'Software Access', icon: Laptop, sla: '24h SLA', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { code: 'EXPENSE_REIMBURSEMENT', label: 'Expense Reimbursement', icon: Receipt, sla: '48h SLA', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { code: 'DOCUMENT_APPROVAL', label: 'Document Approval', icon: FileCheck, sla: '72h SLA', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { code: 'EQUIPMENT_REQUEST', label: 'Equipment Request', icon: HardDrive, sla: '72h SLA', color: 'text-amber-600 bg-amber-50 border-amber-200' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Submit New Business Request</h1>
        <p className="text-xs text-slate-500">
          Select a workflow type to route your request through our enterprise state engine.
        </p>
      </div>

      {/* Workflow Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {WORKFLOW_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeWorkflow === tab.code;
          return (
            <button
              key={tab.code}
              type="button"
              onClick={() => {
                setActiveWorkflow(tab.code);
                setTitle('');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.sla}
                </span>
              </div>
              <p className="text-xs font-bold truncate">{tab.label}</p>
            </button>
          );
        })}
      </div>

      {/* Request Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Universal Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Request Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Jira Access Request for Mobile Team"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent Priority</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description & Details <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Comprehensive description of what is requested and operational background..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Workflow Dynamic Specific Fields */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {activeWorkflow.replace('_', ' ')} Required Workflow Information
          </h4>

          {activeWorkflow === 'SOFTWARE_ACCESS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application / Software Name</label>
                <input
                  type="text"
                  required
                  value={softwareFields.software_name}
                  onChange={(e) => setSoftwareFields({ ...softwareFields, software_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Access Level</label>
                <select
                  value={softwareFields.requested_access_level}
                  onChange={(e) => setSoftwareFields({ ...softwareFields, requested_access_level: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="Standard User">Standard User</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Read Only Viewer">Read Only Viewer</option>
                  <option value="Developer API Access">Developer API Access</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Justification</label>
                <input
                  type="text"
                  required
                  value={softwareFields.business_justification}
                  onChange={(e) => setSoftwareFields({ ...softwareFields, business_justification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
          )}

          {activeWorkflow === 'EXPENSE_REIMBURSEMENT' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={expenseFields.expense_category}
                  onChange={(e) => setExpenseFields({ ...expenseFields, expense_category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="Client Meeting & Travel">Client Meeting & Travel</option>
                  <option value="Software License Purchase">Software License Purchase</option>
                  <option value="Conference / Seminar">Conference / Seminar</option>
                  <option value="Office Supplies">Office Supplies</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={expenseFields.amount}
                  onChange={(e) => setExpenseFields({ ...expenseFields, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Date</label>
                <input
                  type="date"
                  required
                  value={expenseFields.expense_date}
                  onChange={(e) => setExpenseFields({ ...expenseFields, expense_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
          )}

          {activeWorkflow === 'DOCUMENT_APPROVAL' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={documentFields.document_title}
                  onChange={(e) => setDocumentFields({ ...documentFields, document_title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Version</label>
                <input
                  type="text"
                  required
                  value={documentFields.document_version}
                  onChange={(e) => setDocumentFields({ ...documentFields, document_version: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
          )}

          {activeWorkflow === 'EQUIPMENT_REQUEST' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Type</label>
                <select
                  value={equipmentFields.equipment_type}
                  onChange={(e) => setEquipmentFields({ ...equipmentFields, equipment_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="Laptop / Workstation">Laptop / Workstation</option>
                  <option value="External 4K Monitor">External 4K Monitor</option>
                  <option value="Ergonomic Desk Chair">Ergonomic Desk Chair</option>
                  <option value="Wireless Keyboard & Mouse">Wireless Keyboard & Mouse</option>
                  <option value="Noise-Canceling Headset">Noise-Canceling Headset</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={equipmentFields.quantity}
                  onChange={(e) => setEquipmentFields({ ...equipmentFields, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required By Date</label>
                <input
                  type="date"
                  required
                  value={equipmentFields.required_date}
                  onChange={(e) => setEquipmentFields({ ...equipmentFields, required_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Attachment Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Supporting Document / Receipt Attachment
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            {file && <span className="text-xs text-emerald-600 font-bold">✓ {file.name}</span>}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Submitting Request...' : 'Submit to Workflow Engine'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
