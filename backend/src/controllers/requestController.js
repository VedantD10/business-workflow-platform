const db = require('../database/db');
const { successResponse } = require('../utils/response');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const { calculateSLAStatus } = require('../engine/slaEngine');
const { processWorkflowTransition, getWorkflowStages } = require('../engine/workflowEngine');

function generateRequestNumber() {
  const year = new Date().getFullYear();
  const count = db.count('requests') + 1;
  return `REQ-${year}-${String(count).padStart(5, '0')}`;
}

/**
 * Hydrates a request object with user info, department, SLA, etc.
 */
function hydrateRequest(reqRecord) {
  const creator = db.findById('users', reqRecord.user_id);
  const dept = db.findById('departments', reqRecord.department_id);
  const reqType = db.findOne('request_types', rt => rt.code === reqRecord.request_type_code);
  const sla = calculateSLAStatus(reqRecord);

  let parsedCustomFields = {};
  try {
    parsedCustomFields = JSON.parse(reqRecord.custom_fields || '{}');
  } catch (e) {
    parsedCustomFields = {};
  }

  return {
    ...reqRecord,
    custom_fields: parsedCustomFields,
    creator: creator ? { id: creator.id, full_name: creator.full_name, email: creator.email } : null,
    department: dept ? { id: dept.id, code: dept.code, name: dept.name } : null,
    request_type: reqType ? { id: reqType.id, code: reqType.code, name: reqType.name, sla_hours: reqType.sla_hours } : null,
    sla
  };
}

async function createRequest(req, res, next) {
  try {
    const { request_type_code, title, description, priority, department_id, custom_fields } = req.body;

    const reqType = db.findOne('request_types', rt => rt.code === request_type_code);
    if (!reqType) {
      throw new BadRequestError(`Invalid request type code '${request_type_code}'`);
    }

    const stages = getWorkflowStages(request_type_code);
    const initialStage = stages[0] ? stages[0].stage_name : 'Reporting Manager Approval';

    const reqDeptId = department_id ? Number(department_id) : (reqType.department_id || req.user.department_id);
    const requestNumber = generateRequestNumber();

    const newRequest = db.insert('requests', {
      request_number: requestNumber,
      request_type_code,
      user_id: req.user.id,
      department_id: reqDeptId,
      current_stage: initialStage,
      status: 'SUBMITTED',
      priority: priority || 'MEDIUM',
      title,
      description,
      custom_fields: JSON.stringify(custom_fields || {}),
      completed_at: null
    });

    // Audit Log
    db.insert('audit_logs', {
      request_id: newRequest.id,
      actor_id: req.user.id,
      action: 'SUBMITTED',
      previous_state: null,
      new_state: `SUBMITTED (${initialStage})`,
      details: `Request ${requestNumber} submitted by ${req.user.full_name}`,
      created_at: new Date().toISOString()
    });

    // Notify Manager
    if (req.user.manager_id) {
      db.insert('notifications', {
        user_id: req.user.manager_id,
        title: 'New Approval Request',
        message: `Request ${requestNumber} (${title}) submitted by ${req.user.full_name} requires your review.`,
        link: `/requests/${newRequest.id}`,
        is_read: 0,
        created_at: new Date().toISOString()
      });
    }

    const hydrated = hydrateRequest(newRequest);
    return successResponse(res, hydrated, 'Request submitted successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function getRequests(req, res, next) {
  try {
    const {
      search,
      request_type_code,
      status,
      priority,
      department_id,
      employee_id,
      sla_status,
      page = 1,
      limit = 10,
      scope = 'all'
    } = req.query;

    let records = db.find('requests');

    // Role-based visibility scoping
    const role = req.user.role;
    if (role === 'EMPLOYEE' || scope === 'my_requests') {
      records = records.filter(r => r.user_id === req.user.id);
    } else if (role === 'REPORTING_MANAGER') {
      const teamUserIds = db.find('users', u => u.manager_id === req.user.id).map(u => u.id);
      records = records.filter(r => teamUserIds.includes(r.user_id) || r.user_id === req.user.id);
      if (scope === 'pending') {
        records = records.filter(r => ['SUBMITTED', 'UNDER_REVIEW', 'APPROVAL_PENDING'].includes(r.status));
      }
    } else if (role === 'DEPARTMENT_STAFF' || role === 'DEPARTMENT_HEAD') {
      const teamUserIds = db.find('users', u => u.manager_id === req.user.id).map(u => u.id);
      records = records.filter(r => r.department_id === req.user.department_id || teamUserIds.includes(r.user_id) || r.user_id === req.user.id);
      if (scope === 'pending') {
        records = records.filter(r => ['SUBMITTED', 'UNDER_REVIEW', 'APPROVAL_PENDING', 'APPROVED'].includes(r.status));
      }
    }

    // Apply Filter Parameters
    if (search) {
      const s = search.toLowerCase();
      records = records.filter(r =>
        r.request_number.toLowerCase().includes(s) ||
        r.title.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s)
      );
    }

    if (request_type_code) {
      records = records.filter(r => r.request_type_code === request_type_code);
    }

    if (status) {
      records = records.filter(r => r.status === status);
    }

    if (priority) {
      records = records.filter(r => r.priority === priority);
    }

    if (department_id) {
      records = records.filter(r => r.department_id === Number(department_id));
    }

    if (employee_id) {
      records = records.filter(r => r.user_id === Number(employee_id));
    }

    // Hydrate & Filter SLA Status
    let hydratedRecords = records.map(hydrateRequest);

    if (sla_status) {
      hydratedRecords = hydratedRecords.filter(r => r.sla && r.sla.sla_status === sla_status);
    }

    // Sort newest first
    hydratedRecords.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const total = hydratedRecords.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = hydratedRecords.slice(startIdx, startIdx + limitNum);

    return successResponse(res, paginated, 'Requests retrieved successfully', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    });
  } catch (err) {
    next(err);
  }
}

async function getRequestById(req, res, next) {
  try {
    const request = db.findById('requests', req.params.id);
    if (!request) {
      throw new NotFoundError(`Request #${req.params.id} not found.`);
    }

    const hydrated = hydrateRequest(request);

    // Timeline of Workflow Stages
    const stages = getWorkflowStages(request.request_type_code);
    const currentStageIndex = stages.findIndex(s => s.stage_name === request.current_stage);

    const timeline = stages.map((s, idx) => {
      let stageStatus = 'PENDING';
      if (['COMPLETED', 'APPROVED'].includes(request.status)) {
        stageStatus = 'COMPLETED';
      } else if (request.status === 'REJECTED' && idx === currentStageIndex) {
        stageStatus = 'REJECTED';
      } else if (idx < currentStageIndex) {
        stageStatus = 'COMPLETED';
      } else if (idx === currentStageIndex) {
        stageStatus = 'ACTIVE';
      }

      return {
        stage_order: s.stage_order,
        stage_name: s.stage_name,
        required_role: s.required_role,
        status: stageStatus
      };
    });

    // Approvals history with approver name
    const rawApprovals = db.find('approvals', a => a.request_id === request.id);
    const approvals = rawApprovals.map(a => {
      const approver = db.findById('users', a.approver_id);
      return {
        ...a,
        approver_name: approver ? approver.full_name : 'System Approver',
        approver_role: approver ? approver.role : null
      };
    }).sort((a, b) => new Date(a.decided_at) - new Date(b.decided_at));

    // Comments with author details
    const rawComments = db.find('comments', c => c.request_id === request.id);
    const comments = rawComments.map(c => {
      const author = db.findById('users', c.user_id);
      return {
        ...c,
        author_name: author ? author.full_name : 'Unknown User',
        author_role: author ? author.role : null
      };
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Attachments
    const attachments = db.find('attachments', att => att.request_id === request.id);

    // Audit Trail
    const rawAuditLogs = db.find('audit_logs', al => al.request_id === request.id);
    const auditLogs = rawAuditLogs.map(al => {
      const actor = db.findById('users', al.actor_id);
      return {
        ...al,
        actor_name: actor ? actor.full_name : 'System'
      };
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return successResponse(res, {
      ...hydrated,
      timeline,
      approvals,
      comments,
      attachments,
      auditLogs
    });
  } catch (err) {
    next(err);
  }
}

async function handleWorkflowAction(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    const { action, comments, payload } = req.body;

    const result = processWorkflowTransition({
      requestId,
      actorUser: req.user,
      action,
      comments,
      payload
    });

    const hydrated = hydrateRequest(result.request);
    return successResponse(res, hydrated, `Workflow action '${action}' executed successfully.`);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  handleWorkflowAction
};
